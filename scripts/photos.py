"""Build the site's photo sources from the originals in _source.

Three kinds of picture, kept apart on purpose (see src/data/photos.ts):
  real    Jake's own job photos and stills from his own reels.
  relit   a real job photo relit for evening with an image model. Same house, same beds.
  ai      made from a prompt, for a service with no job photo yet. Always captioned as an illustration.

  design  a design rendering Jake made from a photo of a client's yard, or one recomposed
          from his rendering. Always captioned as a design rendering, never as a finished job.

Output: src/assets/photos/<id>.jpg, EXIF-rotated, cropped where noted, long side capped.
Real photos get photokit.grade(): light and color only, as Jake asked on 2026-11-02 ("the
colors are dull"). Astro makes the AVIF/WebP sizes at build time. Originals are not committed.
Crops are fractions (left, top, right, bottom) of the rotated original.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageOps
from photokit import align, grade

ROOT = Path(__file__).resolve().parent.parent
S = ROOT / "_source"
OUT = ROOT / "src" / "assets" / "photos"
MAX = 2000
I = "imsg-jpg/"
W = "wp-jpg/"
P = "wp/"

REAL = {
    # design and renovation
    "maple-modern": (W + "FullSizeRender.jpg", None),
    "maple-rock-bed": (W + "IMG_3275.jpg", (0, 0.12, 1, 1)),
    "maple-court": (P + "IMG_3281-scaled.jpg", None),
    "curve-brick-bed": (W + "FullSizeRender-2.jpg", None),
    "curve-fall": (P + "IMG_5662-scaled.jpg", None),
    "colonial-fall": (P + "IMG_5649-scaled.jpg", None),
    "urn-bed": (I + "2025-06-17_IMG_8238.jpg", None),
    "patio-bed": (I + "2025-09-25_IMG_8341.jpg", None),
    "tudor-planting": (I + "2025-09-25_IMG_9308.jpg", None),
    "grand-brick": (P + "IMG_0492-scaled.jpeg", None),
    "stone-manor": (P + "IMG_3402-scaled.jpeg", (0, 0.1, 1, 1)),
    "island-bed": (I + "2025-06-17_IMG_8237.jpg", (0, 0.2, 1, 1)),
    "pergola-deck": (P + "IMG_3757-scaled.jpeg", None),
    "shade-lawn": (W + "IMG_5239.jpg", None),
    "fall-colonial": (I + "2025-09-25_IMG_9256.jpg", None),
    # stone, edging, walls
    "weeping-border": (I + "2025-06-17_IMG_8288.jpg", None),
    "ranch-stone-bed": (I + "2025-09-25_IMG_9386.jpg", None),
    "rock-bed-hydrangea": (I + "2025-05-22_IMG_7829.jpg", None),
    "hosta-bed": (I + "2025-05-22_IMG_7881.jpg", (0, 0.32, 1, 1)),
    "limestone-bed": (W + "IMG_4929-2.jpg", (0, 0.1, 1, 1)),
    "black-stone-kidney": (P + "IMG_5368-scaled.jpg", (0, 0.1, 1, 1)),
    "slate-sidewalk": (W + "IMG_3533.jpg", None),
    "thrift-boulder": (P + "374C3E11-7ECB-47D0-AFFE-EDE9F6AEEFE5_1_102_a.jpeg", None),
    "paver-walk": (I + "2025-05-29_IMG_8053.jpg", None),
    "flagstone-side": (I + "2025-11-19_IMG_3510.jpg", None),
    "flagstone-hydrangea": ("reel/r05.jpg", (0, 0.1, 1, 0.92)),
    "steppers-lawn": ("reel/r13.jpg", (0, 0.1, 1, 0.92)),
    "river-rock-beds": ("reel/r10.jpg", (0, 0.1, 1, 0.95)),
    # hedges
    "hedge-walk": (W + "IMG_4872.jpg", (0, 0, 0.825, 1)),
    "tall-hedge": (W + "IMG_0968.jpg", None),
    "pool-hedge": (W + "IMG_4932-1.jpg", (0, 0.25, 1, 1)),
    "hedge-long": (I + "2025-10-10_IMG_9481.jpg", (0.09, 0, 1, 1)),
    "hedge-curve": ("reel/r12.jpg", (0, 0.1, 1, 0.92)),
    "topiary-spiral": ("reel/r09.jpg", (0, 0.1, 1, 0.95)),
    "boxwood-front": (P + "IMG_5668-scaled.jpg", None),
    # lawns and sod
    "sod-backyard": (I + "2025-05-05_IMG_7627.jpg", None),
    "sod-colonial": (I + "2025-05-22_IMG_7767.jpg", None),
    "sod-circle": (I + "2025-10-01_IMG_9425.jpg", None),
    "grade-rake": ("reel/r07.jpg", (0, 0.12, 1, 0.92)),
    "grade-jake": ("reel/jake-rake.jpg", (0, 0.1, 1, 0.74)),
    # planting and containers
    "entry-planter": (P + "IMG_4492-scaled.jpeg", (0, 0.2, 1, 1)),
    "window-planter": (P + "IMG_4493-scaled.jpeg", None),
    "evergreen-island": (I + "2025-10-10_IMG_9489.jpg", None),
    "arborvitae-bed": ("jake-1102/IMG_3065.jpg", None),
    "colonial-dogwood": ("jake-1102/IMG_1898.jpg", None),
    "jake-bobcat": ("jake-1102/IMG_3466.jpg", None),
    "lakeside-bed": (P + "IMG_3735-scaled.jpeg", None),
    # commercial
    "commercial-palms": (P + "HD--scaled.png", (0, 0.2, 1, 1)),
    "commercial-entry": ("reel/r06.jpg", (0, 0.1, 1, 0.92)),
    "condo-evergreens": (P + "IMG_3753-scaled.jpeg", None),
    # Florida
    "florida-agave": (I + "2025-12-16_IMG_0414.jpg", None),
    "florida-hedge": (I + "2025-12-16_IMG_0418.jpg", None),
    # people and brand
    "jake-polo": ("reel/jake-polo.jpg", (0, 0.2, 0.92, 0.8)),
    "yard-sign": (P + "IMG_4682-scaled.jpeg", (0, 0.2, 1, 1)),
}

RELIT = {
    "dusk-maple": "ai/hero/dusk-maple.png",
    "dusk-curve": "ai/hero/dusk-curve.png",
    "dusk-urn": "ai/hero/dusk-urn.png",
    "dusk-patio": "ai/hero/dusk-patio.png",
    "dusk-sidewalk": "ai/hero/dusk-sidewalk.png",
    "dusk-stone": "ai/hero/dusk-stone.png",
    "dusk-grand": "ai/hero/dusk-grand.png",
    "dusk-lake": "ai/hero/dusk-lake.png",
    "dusk-column": "ai/hero/dusk-column.png",
}

# Recomposed for the home page from Jake's own rendering of a client's yard (2026-11-02).
DESIGN = {
    "hero-wide": "ai/hero2/manor-wide.png",
    "hero-tall": "ai/hero2/manor-tall.png",
    "design-willow": "ai/hero2/willow-wide.png",
}

AI = {
    "ai-design": "ai/svc/design.png",
    "ai-grading": "ai/svc/grading.png",
    "ai-mulch": "ai/svc/mulchpour.png",
    "ai-plant-removal": "ai/svc/plantout.png",
    "ai-polymeric": "ai/svc/polysand.png",
    "ai-pressure": "ai/svc/pressure.png",
    "ai-sod": "ai/svc/sodroll.png",
    "ai-steel": "ai/svc/steel.png",
    "ai-stump": "ai/svc/stump.png",
    "ai-tree": "ai/svc/tree.png",
    "ai-weeding": "ai/svc/weeding.png",
    "ai-watering": "wp/83B9E56D-4BD7-484E-A55E-F5292E3CC0F3.png",
}

# House numbers are cloned out before cropping, as fractions of the source photo.
# Each box is covered with the same-sized patch beside it (dir -1 left, 1 right,
# 2 above, -2 below, or (x, y) in box sizes for a patch further off), or with the surrounding color (dir 0, for numbers on plain painted trim),
# feathered so no edge shows. Cropping is the first choice; these are the ones a crop
# cannot reach.
CLONE = {
    "colonial-dogwood": [(0.459, 0.42, 0.472, 0.486, 0)],
    # his garage number and a vanity plate
    "jake-bobcat": [(0.78, 0.29, 0.855, 0.325, -1), (0.832, 0.452, 0.89, 0.478, 0)],
    "jake-polo": [(0.205, 0.292, 0.315, 0.335, -1)],
    "boxwood-front": [(0.392, 0.322, 0.462, 0.384, 2)],
    "black-stone-kidney": [(0.606, 0.336, 0.672, 0.392, 2)],
    "colonial-fall": [(0.296, 0.368, 0.356, 0.412, -1)],
    "weeping-border": [(0.786, 0.232, 0.838, 0.284, 2)],
    "ranch-stone-bed": [(0.682, 0.308, 0.723, 0.345, -1)],
    "shade-lawn": [(0.712, 0.544, 0.762, 0.594, 2)],
    "ba-sod-before": [(0.12, 0.3, 0.17, 0.395, 1)],
}

# How much grade each real photo gets. 1 unless listed.
GRADE = {"jake-bobcat": 0.7}

# before and after pairs: same 4:5 frame, from Jake's own reel at 2160 by 3840
PAIRS = {
    "ba-side": ("side-b", "side-a"),
    "ba-corner": ("corner-b", "corner-a"),
    "ba-foundation": ("found-b", "found-a"),
    "ba-hedge": ("hedge-b", "hedge-a"),
    "ba-sod": ("split-b", "split-a"),
}


# Jake's design renderings beside the yard photo each was made from (2026-11-02). The
# photo is warped into the rendering's frame, then both are cut to 4:3. Clone boxes are
# fractions of the rendering's frame: (box, which) with which "b", "a" or "ba".
# Left out on purpose: the yellow door entry (same house as ba-planter) and the dusk
# ranch, whose plaque carries a full street address that would not clone out cleanly.
DESIGN_PAIRS = {
    "ba-manor": ("jake-1102/IMG_1632.jpg", "jake-1102/manor-design.jpg", [((0.855, 0.452, 0.905, 0.5, 2), "ba")]),
    "ba-craftsman": ("jake-1102/IMG_2735.jpg", "jake-1102/front-design.jpg", [((0.538, 0.414, 0.586, 0.462, -2), "ba")]),
    "ba-patio": ("jake-1102/IMG_2738.jpg", "jake-1102/back-design.jpg", []),
    "ba-willow": ("jake-1102/IMG_2917.jpg", "jake-1102/willow-design.png", [((0.426, 0.472, 0.452, 0.503, -1), "b")]),
    "ba-colonial": ("jake-1102/IMG_3837.jpg", "jake-1102/colonial-design.png", [((0.405, 0.415, 0.442, 0.45, 1), "ba")]),
    "ba-terrace": ("jake-1102/IMG_3738.jpg", "jake-1102/terrace-design.png", []),
    "ba-planter": ("jake-1102/IMG_3655.jpg", "jake-1102/planter-design.png", [((0.85, 0.384, 0.902, 0.42, (0, 2.6)), "ba")]),
    "ba-border": ("jake-1102/IMG_3408.jpg", "jake-1102/border-design.png", []),
}


def clone(im, boxes):
    for l, t, r, b, way in boxes:
        w, h = im.size
        x0, y0, x1, y1 = round(l * w), round(t * h), round(r * w), round(b * h)
        bw, bh = x1 - x0, y1 - y0
        feather = max(3, round(min(bw, bh) * 0.22))
        if way == 0:
            # plain trim: the median of a ring around the box, with its own grain
            ring = np.asarray(im.crop((x0 - bw // 2, y0 - bh // 4, x1 + bw // 2, y1 + bh // 4))).reshape(-1, 3)
            med, sd = np.median(ring, axis=0), ring.std(axis=0) * 0.35
            noise = np.random.default_rng(1).normal(0, 1, (bh, bw, 1)) * sd
            patch = Image.fromarray(np.clip(med + noise, 0, 255).astype(np.uint8))
        else:
            if isinstance(way, tuple):
                dx, dy = round(way[0] * bw), round(way[1] * bh)
            else:
                dx, dy = {2: (0, -bh), -2: (0, bh)}.get(way, (way * bw, 0))
            patch = im.crop((x0 + dx, y0 + dy, x1 + dx, y1 + dy))
        mask = Image.new("L", (bw, bh), 0)
        mask.paste(255, (feather, feather, bw - feather, bh - feather))
        im.paste(patch, (x0, y0), mask.filter(ImageFilter.GaussianBlur(feather * 0.6)))
    return im


def load(name, pid=None):
    im = ImageOps.exif_transpose(Image.open(S / name)).convert("RGB")
    return clone(im, CLONE.get(pid, []))


def crop_frac(im, box):
    w, h = im.size
    l, t, r, b = box
    return im.crop((round(l * w), round(t * h), round(r * w), round(b * h)))


def cap(im, limit=MAX):
    if max(im.size) > limit:
        im.thumbnail((limit, limit), Image.LANCZOS)
    return im


def center_ratio(im, ratio):
    w, h = im.size
    if w / h > ratio:
        nw = round(h * ratio)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w / ratio)
    y = max(0, round((h - nh) * 0.42))
    return im.crop((0, y, w, y + nh))


def main(only=None):
    OUT.mkdir(parents=True, exist_ok=True)
    want = lambda pid: not only or any(pid.startswith(o) for o in only)
    for pid, (name, box) in REAL.items():
        if not want(pid):
            continue
        im = load(name, pid)
        if box:
            im = crop_frac(im, box)
        grade(cap(im), GRADE.get(pid, 1.0)).save(OUT / f"{pid}.jpg", quality=88, optimize=True, progressive=True)
    for group in (RELIT, DESIGN, AI):
        for pid, name in group.items():
            if want(pid):
                cap(load(name)).save(OUT / f"{pid}.jpg", quality=90, optimize=True, progressive=True)
    for pid, (before, after) in PAIRS.items():
        if not want(pid):
            continue
        for label, name in (("before", before), ("after", after)):
            im = cap(center_ratio(load(f"ba/{name}.jpg", f"{pid}-{label}"), 4 / 5), 1400)
            grade(im, 0.8).save(OUT / f"{pid}-{label}.jpg", quality=86, optimize=True, progressive=True)
    for pid, (before, after, boxes) in DESIGN_PAIRS.items():
        if not want(pid):
            continue
        a = load(after)
        b, inliers, seen = align(load(before), a)
        print(pid, inliers, "matches, photo covers", seen, "of", a.size)
        for label, im, s in (("before", b, 0.9), ("after", a, 0.4)):
            im = clone(im, [box for box, which in boxes if label[0] in which]).crop(seen)
            im = cap(center_ratio(im, 4 / 3), 1448)
            grade(im, s).save(OUT / f"{pid}-{label}.jpg", quality=88, optimize=True, progressive=True)
    print(len(list(OUT.glob("*.jpg"))), "photos")


if __name__ == "__main__":
    import sys
    main(sys.argv[1:])
