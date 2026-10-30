"""Build the bed picker layers from one real photo of Jake's work.

The first version decided mulch or plant per pixel at web size, which left hard
cut-out edges. This one works on the full 12 megapixel original and treats every
edge as a blend:

1. A soft matte says how much of each pixel is old black mulch, from color alone
   (mulch is dark and neutral, plants are not), refined with a guided filter so it
   follows real leaf edges and hair thin stems.
2. The new ground is laid in perspective, then the old mulch is subtracted out of
   each edge pixel and the new ground added in. A leaf edge that was half leaf and
   half black mulch becomes half leaf and half new ground, so there is no dark
   fringe. Fallen petals and anything else pale stay on top, as they would.
3. Ambient shadow is drawn under plants and along the wall, because a bright ground
   with no shadows is what makes a composite look pasted on.

Nothing but the ground changes, so every layer lines up with the photo to the pixel.
Output: transparent PNGs in src/assets/panel, cropped to the bed; Astro makes the
AVIF and WebP files, and BedPicker.astro places them with the fractions in BOX.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw, ImageOps
from scipy import ndimage as ni

ROOT = Path(__file__).resolve().parent.parent
S = ROOT / "_source"
OUT = ROOT / "src" / "assets" / "panel"
OUT_W = 2000
# The bed, generously, as fractions of the photo. The matte does the real work; this
# only keeps the roof, the hedge tops and the driveway out of it.
BED = [(0.012, 0.648), (0.05, 0.66), (0.085, 0.662), (0.16, 0.64), (0.235, 0.632), (0.3, 0.632), (0.43, 0.606), (0.525, 0.602), (0.565, 0.61), (0.606, 0.618), (0.63, 0.61), (0.715, 0.606), (0.8, 0.602), (0.868, 0.596), (0.895, 0.61), (0.862, 0.624), (0.745, 0.626), (0.665, 0.632), (0.648, 0.64), (0.68, 0.686), (0.692, 0.752), (0.665, 0.812), (0.608, 0.846), (0.5, 0.872), (0.4, 0.888), (0.3, 0.884), (0.215, 0.864), (0.128, 0.83), (0.064, 0.782), (0.028, 0.734)]
HORIZON = 0.495
# name: file, target brightness, saturation, tint
MATS = {
    "brown": ("brown.png", 0.2, 0.92, (1.0, 0.98, 0.95)),
    "red": ("red.png", 0.19, 0.72, (0.98, 0.95, 0.93)),
    "river": ("river.png", 0.5, 0.95, (1.0, 1.0, 1.0)),
    "black": ("black.png", 0.16, 1.0, (1.0, 1.0, 1.02)),
}


def falling(x, hi, lo):
    """1 below lo, 0 above hi, smooth between."""
    t = np.clip((hi - x) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def guided(guide, src, r, eps):
    """He's guided filter: smooths src while following the edges in guide."""
    box = lambda a: ni.uniform_filter(a, size=2 * r + 1, mode="nearest")
    mg, ms = box(guide), box(src)
    a = (box(guide * src) - mg * ms) / (box(guide * guide) - mg * mg + eps)
    b = ms - a * mg
    return box(a) * guide + box(b)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    src = ImageOps.exif_transpose(Image.open(S / "wp-jpg/FullSizeRender-2.jpg")).convert("RGB")
    W, H = src.size
    rgb = np.asarray(src).astype(np.float32) / 255
    L = rgb @ np.array([0.3, 0.59, 0.11], dtype=np.float32)
    chroma = rgb.max(2) - rgb.min(2)
    green = rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])

    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon([(x * W, y * H) for x, y in BED], fill=255)
    poly = np.asarray(m) > 128
    # reach right up to the wall: the block is pale, so the matte stops there on its own
    reach = ni.distance_transform_edt(~poly) < 44

    # how much of each pixel is old mulch: dark, and without color
    raw = falling(L, 0.3, 0.17) * falling(chroma, 0.13, 0.06) * falling(green, 0.04, 0.012)
    raw = np.where(reach, raw, 0).astype(np.float32)

    # specks in the mulch are not plants, but real leaves and pale petals are kept
    solid = raw < 0.5
    lab, n = ni.label(solid & reach)
    area = ni.sum(np.ones_like(lab, dtype=np.float32), lab, range(1, n + 1))
    bright = ni.maximum(L, lab, range(1, n + 1))
    specks = 1 + np.where((area < 240) & (bright < 0.5))[0]
    raw = np.where(np.isin(lab, specks), 1.0, raw).astype(np.float32)

    # let the matte follow real edges, then clean its extremes
    a = guided(L, raw, 7, 1e-4)
    a = np.clip((a - 0.06) / 0.86, 0, 1)
    a = np.where(reach, a, 0).astype(np.float32)

    # Away from real shapes the ground is solid. Chip highlights in the old mulch must
    # not speckle through a pale stone.
    lab, n = ni.label((a < 0.5) & reach)
    area = ni.sum(np.ones_like(lab, dtype=np.float32), lab, range(1, n + 1))
    plants = np.isin(lab, 1 + np.where(area > 1800)[0])
    petals = (L > 0.5) & (a < 0.5)
    dist = ni.distance_transform_edt(~(plants | petals))
    a = np.maximum(a, np.clip((dist - 3) / 7, 0, 1).astype(np.float32) * reach).astype(np.float32)
    plants = plants.astype(np.float32)

    # the old mulch color, so it can be taken out of edge pixels
    deep = a > 0.9
    w = deep.astype(np.float32)
    weight = np.maximum(ni.gaussian_filter(w, 28), 1e-3)
    old = np.dstack([ni.gaussian_filter(rgb[..., c] * w, 28) / weight for c in range(3)]).astype(np.float32)

    # light across the bed, then shadow from real plants and the wall, never from a petal
    light = ni.gaussian_filter(L * w, 60) / np.maximum(ni.gaussian_filter(w, 60), 1e-3)
    med = np.median(light[deep])
    shade = np.clip(light / med, 0.78, 1.15) ** 0.5
    near = ni.gaussian_filter(plants, 9) * 0.45 + ni.gaussian_filter(plants, 30) * 0.34
    under = ni.shift(ni.gaussian_filter(plants, 13), (20, 3), order=1, mode="nearest") * 0.26
    wall = np.exp(-ni.distance_transform_edt(reach) / 16) * 0.28
    shade = shade * (1 - np.clip(near + under + wall, 0, 0.46))

    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    hz = HORIZON * H
    dy = np.maximum(ys - hz, 30)
    scale = W / 1400
    u = (xs - W * 0.5) / scale * 1024 / (dy / scale) * 0.92
    v = 862000 / (dy / scale)

    box = [0.0, 0.57, 0.92, 0.915]
    x0, y0, x1, y1 = round(box[0] * W), round(box[1] * H), round(box[2] * W), round(box[3] * H)

    for name, (file, target, sat, tint) in MATS.items():
        tex = np.asarray(Image.open(S / "ai/tex" / file).convert("RGB").resize((1024, 1024), Image.LANCZOS)).astype(np.float32) / 255

        def fold(t):
            t = np.mod(t, 2046)
            return np.where(t > 1023, 2046 - t, t)

        coords = [fold(v), fold(u)]
        ground = np.dstack([ni.map_coordinates(tex[..., c], coords, order=1) for c in range(3)]).astype(np.float32)
        grey = (ground @ np.array([0.3, 0.59, 0.11], dtype=np.float32))[..., None]
        ground = grey + (ground - grey) * sat
        ground = ground * (target / np.mean(grey[deep])) * np.array(tint, dtype=np.float32)
        ground = np.clip(ground * shade[..., None], 0, 1)

        # p = a * old + (1 - a) * plant, so the plant part is p - a * old
        keep = np.clip(rgb - a[..., None] * old, 0, 1)
        fade = np.clip((1 - a) / 0.12, 0, 1)[..., None]  # solid ground has no plant part left
        final = np.clip(keep * fade + a[..., None] * ground, 0, 1)

        touched = ni.gaussian_filter((a > 0.01).astype(np.float32), 2.5)
        touched = np.clip(touched * 1.6, 0, 1)
        rgba = np.dstack([final, touched])[y0:y1, x0:x1]
        im = Image.fromarray((rgba * 255 + 0.5).astype("uint8"), "RGBA")
        scale_out = OUT_W / W
        im = im.resize((round(im.width * scale_out), round(im.height * scale_out)), Image.LANCZOS)
        im.save(OUT / f"bed-{name}.png", optimize=True)
        Image.open(S / "ai/tex" / file).convert("RGB").resize((144, 144), Image.LANCZOS).save(OUT / f"sw-{name}.jpg", quality=80)

        whole = Image.fromarray((final * 255 + 0.5).astype("uint8"), "RGB").crop((0, round(0.5 * H), round(0.8 * W), round(0.93 * H)))
        whole.resize((whole.width // 2, whole.height // 2), Image.LANCZOS).save(S / f"thumbs/bed2-{name}.jpg", quality=88)
        print(name, im.size)

    (OUT / "box.json").write_text(json.dumps(box))


if __name__ == "__main__":
    main()
