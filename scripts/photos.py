"""Build the site's photo sources from the originals in _source.

Three kinds of picture, kept apart on purpose (see src/data/photos.ts):
  real    Jake's own job photos and stills from his own reels.
  relit   a real job photo relit for evening with an image model. Same house, same beds.
  ai      made from a prompt, for a service with no job photo yet. Always captioned as an illustration.

Output: src/assets/photos/<id>.jpg, EXIF-rotated, cropped where noted, long side capped.
Astro makes the AVIF/WebP sizes at build time. Originals are not committed.
Crops are fractions (left, top, right, bottom) of the rotated original.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

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
    "hero-wide": "ai/hero/hero-wide.png",
    "hero-tall": "ai/hero/hero-tall.png",
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
# 2 above), feathered so no edge shows. Cropping is the first choice; these are the
# ones a crop cannot reach.
CLONE = {
    "jake-polo": [(0.205, 0.292, 0.315, 0.335, -1)],
    "boxwood-front": [(0.392, 0.322, 0.462, 0.384, 2)],
    "black-stone-kidney": [(0.606, 0.336, 0.672, 0.392, 2)],
    "colonial-fall": [(0.296, 0.368, 0.356, 0.412, -1)],
    "weeping-border": [(0.786, 0.232, 0.838, 0.284, 2)],
    "ranch-stone-bed": [(0.682, 0.308, 0.723, 0.345, -1)],
    "shade-lawn": [(0.712, 0.544, 0.762, 0.594, 2)],
    "ba-sod-before": [(0.12, 0.3, 0.17, 0.395, 1)],
}

# before and after pairs: same 4:5 frame, from Jake's own reel at 2160 by 3840
PAIRS = {
    "ba-side": ("side-b", "side-a"),
    "ba-corner": ("corner-b", "corner-a"),
    "ba-foundation": ("found-b", "found-a"),
    "ba-hedge": ("hedge-b", "hedge-a"),
    "ba-sod": ("split-b", "split-a"),
}


def load(name, pid=None):
    im = ImageOps.exif_transpose(Image.open(S / name)).convert("RGB")
    for l, t, r, b, way in CLONE.get(pid, []):
        w, h = im.size
        x0, y0, x1, y1 = round(l * w), round(t * h), round(r * w), round(b * h)
        bw, bh = x1 - x0, y1 - y0
        dx, dy = (0, -bh) if way == 2 else (way * bw, 0)
        patch = im.crop((x0 + dx, y0 + dy, x1 + dx, y1 + dy))
        feather = max(3, round(min(bw, bh) * 0.22))
        mask = Image.new("L", (bw, bh), 0)
        mask.paste(255, (feather, feather, bw - feather, bh - feather))
        im.paste(patch, (x0, y0), mask.filter(ImageFilter.GaussianBlur(feather * 0.6)))
    return im


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


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for pid, (name, box) in REAL.items():
        im = load(name, pid)
        if box:
            im = crop_frac(im, box)
        cap(im).save(OUT / f"{pid}.jpg", quality=88, optimize=True, progressive=True)
    for group in (RELIT, AI):
        for pid, name in group.items():
            cap(load(name)).save(OUT / f"{pid}.jpg", quality=90, optimize=True, progressive=True)
    for pid, (before, after) in PAIRS.items():
        for label, name in (("before", before), ("after", after)):
            im = cap(center_ratio(load(f"ba/{name}.jpg", f"{pid}-{label}"), 4 / 5), 1400)
            im.save(OUT / f"{pid}-{label}.jpg", quality=86, optimize=True, progressive=True)
    print(len(list(OUT.glob("*.jpg"))), "photos")


if __name__ == "__main__":
    main()
