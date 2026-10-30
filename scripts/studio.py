"""Cut the Yard Studio layers out of the plant edits.

Every option was made by editing one bare scene, and the edits land within a fraction
of a pixel of it, so the difference between an edit and the bare scene IS the plant.
Each option becomes one transparent layer, stacked in the browser in depth order:

1. A hard mask from that difference, inside the part of the scene the slot may touch.
2. A soft alpha from a guided filter, so leaves and stems keep their real edges.
3. The bare scene is subtracted out of edge pixels (edit = a * plant + (1 - a) * bare),
   so nothing carries a fringe of black mulch onto river rock or brown mulch.
4. Whatever else the edit darkened is kept as a transparent black shadow, which falls
   correctly on any ground, instead of a baked in patch of old mulch.

The bare scene and the neglected "before" come out as well, so everything stacks from
one exact picture. Output: RGBA PNGs in src/assets/studio, cropped to what changed,
plus box.json with the crops.
"""
from pathlib import Path
import json
import sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ni

ROOT = Path(__file__).resolve().parent.parent
S = ROOT / "_source" / "ai" / "studio"
OUT = ROOT / "src" / "assets" / "studio"
W, H = 1536, 1024

# Where each slot may touch, as fractions of the frame.
HOUSE_RIGHT = 0.855
# wide for the crown, then only a narrow reach around the trunk at ground level
TREE = [(0.7, 0.2), (1.0, 0.2), (1.0, 0.7), (0.955, 0.7), (0.955, 0.76), (0.85, 0.76), (0.85, 0.7), (0.7, 0.7)]
FOUND = [(0.02, 0.55), (0.434, 0.55), (0.434, 0.725), (0.02, 0.725)], [(0.59, 0.55), (0.93, 0.55), (0.93, 0.725), (0.59, 0.725)]
ENTRY = [(0.36, 0.4), (0.456, 0.4), (0.456, 0.74), (0.36, 0.74)], [(0.568, 0.4), (0.665, 0.4), (0.665, 0.74), (0.568, 0.74)]
WALK = [(0.4, 0.685), (0.6, 0.685), (0.92, 1.0), (0.1, 1.0)]
BEDS = [(0.0, 0.64), (1.0, 0.64), (1.0, 0.75), (0.0, 0.75)]

# polys: where it may touch. thresh: difference that counts. keep: smallest part kept.
# plant: has a body and a shadow, unlike a change of ground. corner: drop anything
# centered past the corner of the house, where the tree stands.
TREES = {"polys": [TREE], "thresh": 0.08, "keep": 400, "plant": True, "sky": True}
ROWS = {"polys": list(FOUND), "thresh": 0.09, "keep": 300, "plant": True, "corner": True}
PAIR = {"polys": list(ENTRY), "thresh": 0.09, "keep": 120, "plant": True}
PATH = {"polys": [WALK], "thresh": 0.09, "keep": 300, "plant": True}
GROUND = {"polys": [BEDS], "thresh": 0.05, "keep": 300, "plant": False}
EDGE = {"polys": [BEDS], "thresh": 0.09, "keep": 60, "plant": False}
JOBS = {
    "tree-maple": ("tree-maple2", TREES),
    "tree-dogwood": ("tree-dogwood", TREES),
    "tree-cherry": ("tree-cherry", TREES),
    "tree-birch": ("tree-birch", TREES),
    "found-box": ("found-box", ROWS),
    "found-hydrangea": ("found-hydrangea", ROWS),
    "found-yew": ("found-yew", ROWS),
    "found-mixed": ("found-mixed", ROWS),
    "entry-topiary": ("entry-topiary", PAIR),
    "entry-urns": ("entry-urns", PAIR),
    "entry-arbor": ("entry-arbor", PAIR),
    "walk-hedge": ("walk-hedge", PATH),
    "walk-rock": ("walk-rock", PATH),
    "walk-color": ("walk-color", PATH),
    "border-block": ("border-block", EDGE),
    "ground-brown": ("ground-brown", GROUND),
    "ground-river": ("ground-river", GROUND),
    "ground-stone": ("ground-stone", GROUND),
}
LUMA = np.array([0.3, 0.59, 0.11], dtype=np.float32)


def load(name):
    return np.asarray(Image.open(S / f"{name}.png").convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32) / 255


def guided(guide, src, r, eps):
    """He's guided filter: smooths src while following the edges in guide."""
    box = lambda a: ni.uniform_filter(a, size=2 * r + 1, mode="nearest")
    mg, ms = box(guide), box(src)
    a = (box(guide * src) - mg * ms) / (box(guide * guide) - mg * mg + eps)
    b = ms - a * mg
    return box(a) * guide + box(b)


def region(polys):
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon([(x * W, y * H) for x, y in p], fill=255)
    return (np.asarray(m) > 128).astype(np.float32)


def colors_match(e, b, zone):
    """Take out the small overall color drift of an edit, measured where nothing changed."""
    still = (zone < 0.5) & (np.abs(e - b).max(2) < 0.06)
    out = e.copy()
    for c in range(3):
        out[..., c] = e[..., c] * (b[..., c][still].mean() / max(e[..., c][still].mean(), 1e-3))
    return np.clip(out, 0, 1)


def pull(e, base, L, hard):
    """Alpha from the known background: at an edge, edit = a * plant + (1 - a) * bare.

    The plant color comes from the nearest solid interior. Where plant and background
    are too alike for that to be reliable, a guided filter takes over.
    """
    soft = np.clip((guided(L, hard.astype(np.float32), 3, 2e-4) - 0.1) / 0.8, 0, 1)
    inner = ni.binary_erosion(hard, iterations=2)
    if not inner.any():
        return soft
    band = ni.binary_dilation(hard, iterations=3) & ~inner
    near = ni.distance_transform_edt(~inner, return_distances=False, return_indices=True)
    plant = ni.gaussian_filter(e[near[0], near[1]], (1.5, 1.5, 0))
    gap = plant - base
    den = (gap * gap).sum(2)
    exact = np.clip(((e - base) * gap).sum(2) / np.maximum(den, 1e-4), 0, 1)
    trust = np.clip(den / 0.03, 0, 1)
    out = np.where(band, trust * exact + (1 - trust) * soft, inner.astype(np.float32))
    return ni.gaussian_filter(out.astype(np.float32), 0.45)


def sky_behind(e, base, L):
    """Edits of a tree sometimes paint out the far tree line. Where they did, the true
    background of that pixel is the sky in the edit, not the trees in the bare scene."""
    box = lambda a: ni.uniform_filter(a, size=7, mode="nearest")
    rough = np.sqrt(np.maximum(box(L * L) - box(L) ** 2, 0))
    sky = (L > 0.6) & (e.max(2) - e.min(2) < 0.08) & (rough < 0.02)
    w = ni.gaussian_filter(sky.astype(np.float32), 5)
    tone = ni.gaussian_filter(e * sky[..., None], (5, 5, 0)) / np.maximum(w[..., None], 1e-3)
    past = np.arange(W)[None, :] > HOUSE_RIGHT * W
    return np.where(((w > 0.02) & (base @ LUMA < 0.58) & past)[..., None], tone, base), sky


def keep_big(mask, keep):
    lab, n = ni.label(mask)
    if not n:
        return mask
    area = ni.sum(np.ones_like(lab, dtype=np.float32), lab, range(1, n + 1))
    return np.isin(lab, 1 + np.where(area >= keep)[0])


def cut(name, spec, base):
    file, job = spec
    zone = region(job["polys"])
    e = colors_match(load(file), base, zone)
    soft = ni.gaussian_filter(zone, (2, 2))
    L = e @ LUMA
    bg, sky = (*sky_behind(e, base, L),) if job.get("sky") else (base, np.zeros_like(L, dtype=bool))

    # the difference, with fine brick and grass texture blurred out of the comparison
    be, bb = [ni.gaussian_filter(a, (1.1, 1.1, 0)) for a in (e, bg)]
    d = np.abs(be - bb).max(2) * zone
    hard = keep_big(ni.binary_opening(d > job["thresh"], iterations=1), job["keep"])
    hard = ni.binary_closing(hard, iterations=2) & (zone > 0)

    if job.get("sky"):
        # the edit also redraws a little of the wall behind a crown: brick and shutters
        # are not tree, and neither is anything cut off from the tree itself
        r, g, b = e[..., 0], e[..., 1], e[..., 2]
        wall = (np.arange(W)[None, :] < HOUSE_RIGHT * W) & (((r - g > 0.07) & (g - b > 0.015)) | ((L < 0.17) & (e.max(2) - e.min(2) < 0.06)))
        hard = ni.binary_opening(hard & ~wall, iterations=1)
        lab, n = ni.label(ni.binary_dilation(hard, iterations=2))
        if n:
            hard = hard & (lab == 1 + np.argmax(ni.sum(np.ones_like(lab, dtype=np.float32), lab, range(1, n + 1))))

    if job.get("corner"):
        lab, n = ni.label(hard)
        if n:
            mid = np.array(ni.center_of_mass(hard, lab, range(1, n + 1)))[:, 1]
            hard = hard & ~np.isin(lab, 1 + np.where(mid > HOUSE_RIGHT * W + 12)[0])

    if job["plant"]:
        # Dark leaves over black mulch barely differ in brightness, but they lean green
        # and mulch does not. Only what sits right beside a plant counts.
        mulch = (bb @ LUMA < 0.2) & (bb.max(2) - bb.min(2) < 0.09)
        lean = lambda x: ni.gaussian_filter(x[..., 1] - np.maximum(x[..., 0], x[..., 2]), 1.6)
        beside = ni.distance_transform_edt(~hard) < 16
        low = ni.binary_opening(mulch & beside & (lean(e) - lean(bg) > 0.007) & (zone > 0), iterations=1)
        hard = ni.binary_closing(hard | low, iterations=2) & (zone > 0)

    # a plant has no holes that small, unless it is sky seen through the branches
    lab, n = ni.label(ni.binary_fill_holes(hard) & ~hard)
    if n:
        area = ni.sum(np.ones_like(lab, dtype=np.float32), lab, range(1, n + 1))
        hard = hard | (np.isin(lab, 1 + np.where(area < 500)[0]) & ~sky)

    a = pull(e, bg, L, hard) * soft

    # edit = a * plant + (1 - a) * bare, so the plant alone is:
    plant = np.clip(np.where(a[..., None] > 0.04, (e - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 0.04), e), 0, 1)

    # what is left is only shade: how much darker the edit is than the bare scene
    s = np.zeros_like(a)
    if job["plant"]:
        ratio = ni.gaussian_filter(L, 5) / np.maximum(ni.gaussian_filter(bg @ LUMA, 5), 0.02)
        reach = np.clip(ni.gaussian_filter(hard.astype(np.float32), 26) * 3, 0, 1)
        s = np.clip((1 - ratio - 0.02) * 1.15, 0, 0.5) * reach * soft
    out_a = a + (1 - a) * s
    color = plant * (a / np.maximum(out_a, 1e-3))[..., None]

    rgba = np.dstack([np.clip(color, 0, 1), out_a])
    ys, xs = np.where(out_a > 0.01)
    x0, x1, y0, y1 = max(xs.min() - 2, 0), min(xs.max() + 3, W), max(ys.min() - 2, 0), min(ys.max() + 3, H)
    im = Image.fromarray((rgba[y0:y1, x0:x1] * 255 + 0.5).astype("uint8"), "RGBA")
    im.save(OUT / f"{name}.png", optimize=True)
    return [int(x0), int(y0), int(x1), int(y1)]


def steel(boxes):
    """Steel edging is a line too thin to difference, so it is drawn along the edge of
    the bed itself, taken from a ground layer: a dark strip where the bed meets the
    lawn, with a little light along its top."""
    x0, y0, x1, y1 = boxes["ground-brown"]
    bed = np.zeros((H, W), dtype=bool)
    bed[y0:y1, x0:x1] = np.asarray(Image.open(OUT / "ground-brown.png"))[..., 3] > 128
    bed = ni.binary_opening(ni.binary_closing(bed, iterations=3), iterations=2)
    zoom = 4
    line = Image.new("L", (W * zoom, H * zoom), 0)
    draw = ImageDraw.Draw(line)

    def stroke(xs, ys):
        ys = ni.gaussian_filter1d(ni.median_filter(ys.astype(np.float32), 9, mode="nearest"), 2, mode="nearest")
        draw.line([(float(x) * zoom, float(y) * zoom) for x, y in zip(xs, ys)], fill=255, width=3 * zoom, joint="curve")

    cols = np.where(bed.any(0))[0]
    # one run per bed, so the line stops at the walk
    for run in np.split(cols, np.where(np.diff(cols) > 4)[0] + 1):
        lows = np.array([np.where(bed[:, x])[0].max() for x in run])
        stroke(run, lows)
        # past the corners of the house the back of the bed faces lawn as well
        for part in (run[run < 0.09 * W], run[run > HOUSE_RIGHT * W + 6]):
            if len(part) > 6:
                stroke(part, np.array([np.where(bed[:, x])[0].min() for x in part]))
    a = np.asarray(line.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    rim = np.clip(a - ni.shift(a, (1.4, 0), order=1), 0, 1)
    color = np.full((H, W, 3), 0.075, dtype=np.float32) + rim[..., None] * 0.2
    rgba = np.dstack([np.clip(color, 0, 1), a])
    ys, xs = np.where(a > 0.01)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray((rgba[y0:y1, x0:x1] * 255 + 0.5).astype("uint8"), "RGBA").save(OUT / "border-steel.png", optimize=True)
    return [int(x0), int(y0), int(x1), int(y1)]


# name prefix: left, top, size of the square each picker thumbnail shows
THUMBS = {"tree": (1228, 372, 308), "found": (380, 570, 170), "entry": (560, 520, 200), "walk": (470, 724, 300), "ground": (300, 688, 42), "border": (40, 650, 120)}
# the design on the teaser, in stacking order
TEASER = ["border-steel", "found-mixed", "entry-topiary", "walk-color", "tree-dogwood"]


def stack(names, boxes):
    im = Image.open(OUT / "base.png").convert("RGBA")
    for n in names:
        im.alpha_composite(Image.open(OUT / f"{n}.png"), tuple(boxes[n][:2]))
    return im.convert("RGB")


def extras(boxes):
    """Picker thumbnails, each on the bare scene, the teaser picture, and the drag to
    reveal pairs, which need nothing but a lighter file."""
    for name in boxes:
        kind = name.split("-")[0]
        x, y, side = THUMBS[kind]
        stack([name], boxes).crop((x, y, x + side, y + side)).resize((144, 144), Image.LANCZOS).save(OUT / f"th-{name}.jpg", quality=84)
    x, y, side = THUMBS["ground"]
    Image.open(OUT / "base.png").convert("RGB").crop((x, y, x + side, y + side)).resize((144, 144), Image.LANCZOS).save(OUT / "th-ground-black.jpg", quality=84)
    stack(TEASER, boxes).save(OUT / "teaser.jpg", quality=92)
    rev = OUT.parent / "reveal"
    rev.mkdir(exist_ok=True)
    for kind in ("hedge", "pave", "leaf"):
        for state in ("before", "after"):
            Image.open(S / f"{kind}-{state}.png").convert("RGB").save(rev / f"{kind}-{state}.jpg", quality=91)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    base = load("base")
    Image.fromarray((base * 255 + 0.5).astype("uint8"), "RGB").save(OUT / "base.png", optimize=True)
    b4 = colors_match(load("before"), base, np.zeros((H, W), dtype=np.float32))
    Image.fromarray((b4 * 255 + 0.5).astype("uint8"), "RGB").save(OUT / "before.png", optimize=True)
    only = set(sys.argv[1:])
    file = OUT / "box.json"
    boxes = json.loads(file.read_text()) if file.exists() else {}
    for name, spec in JOBS.items():
        if only and name not in only:
            continue
        boxes[name] = cut(name, spec, base)
        print(name, boxes[name])
    if not only or "border-steel" in only:
        boxes["border-steel"] = steel(boxes)
    file.write_text(json.dumps(boxes, indent=0, sort_keys=True))
    extras(boxes)


if __name__ == "__main__":
    main()
