"""Build the bed picker layers from one real photo of Jake's work.

The ground cover in the photo is found by color inside a hand drawn outline of the
bed, then replaced with a material laid in perspective and shaded by the light the
real mulch was already getting. Plants, the tree, the wall and the house are never
touched, so every layer lines up to the pixel. Output: transparent PNGs in
src/assets/panel. Astro makes the small AVIF and WebP files.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageOps
from scipy import ndimage as ni

ROOT = Path(__file__).resolve().parent.parent
S = ROOT / "_source"
OUT = ROOT / "src" / "assets" / "panel"
W, H = 1500, 1125
K = W / 1400
# the bed, in the 1400 wide review image
BED = [(18,684),(70,694),(120,700),(230,672),(330,664),(420,664),(600,638),(735,634),(790,640),(850,650),(880,640),(1000,636),(1120,634),(1215,628),(1252,640),(1205,652),(1040,654),(930,662),(905,672),(950,720),(968,790),(930,852),(850,888),(700,914),(560,930),(420,926),(300,906),(180,872),(90,822),(40,772)]
HORIZON = 520 * K
MATS = {
    "brown": ("brown.png", 0.23, (1.0, 0.98, 0.96)),
    "red": ("red.png", 0.24, (1.0, 0.97, 0.95)),
    "river": ("river.png", 0.5, (1.0, 1.0, 1.0)),
    "black": ("black.png", 0.17, (1.0, 1.0, 1.02)),
    "marble": ("marble.png", 0.86, (1.0, 0.99, 0.97)),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(S / "wp-jpg/FullSizeRender-2.jpg")).convert("RGB").resize((W, H), Image.LANCZOS)
    rgb = np.asarray(im).astype(float) / 255
    L = rgb @ np.array([0.3, 0.59, 0.11])
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon([(x * K, y * K) for x, y in BED], fill=255)
    poly = np.asarray(m) > 128
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    green = (g > r * 1.08) & (g > b * 1.08) & (L > 0.11)
    pale = L > 0.40
    colored = (rgb.max(2) - rgb.min(2)) > 0.09
    keep = green | pale | colored          # plants, trunk, flag, petals
    # specks in the old mulch are not plants: keep only real shapes
    lab, n = ni.label(keep & poly)
    sizes = ni.sum(np.ones_like(lab), lab, range(1, n + 1))
    big = np.isin(lab, 1 + np.where(sizes > 90)[0])
    keep = big
    mask = poly & ~keep
    # holes the size of a speck get filled too
    holes = ~mask & poly
    lab, n = ni.label(holes)
    sizes = ni.sum(np.ones_like(lab), lab, range(1, n + 1))
    mask = mask | np.isin(lab, 1 + np.where(sizes < 60)[0])
    # soft edge, and a shadow where the ground meets plants and wall
    alpha = np.clip(ni.gaussian_filter(mask.astype(float), 0.8) * 1.2 - 0.1, 0, 1)
    dist = ni.distance_transform_edt(mask)
    contact = 0.58 + 0.42 * np.clip(dist / 16, 0, 1)
    # the light the real mulch was getting, ignoring everything that is not mulch
    w = mask.astype(float)
    light = ni.gaussian_filter(L * w, 26) / np.maximum(ni.gaussian_filter(w, 26), 1e-3)
    med = np.median(light[mask])
    shade = np.clip(light / med, 0.6, 1.25) ** 0.6
    ys, xs = np.mgrid[0:H, 0:W].astype(float)
    dy = np.maximum(ys - HORIZON, 30)
    cx = W * 0.5
    u = (xs - cx) * 1024 / K / dy * 0.92
    v = 862000 / (K * K) / dy
    for name, (file, target, tint) in MATS.items():
        tex = np.asarray(Image.open(S / "ai/tex" / file).convert("RGB").resize((1024, 1024), Image.LANCZOS)).astype(float) / 255
        # mirrored tiling, so no seam shows
        def pick(a):
            a = np.mod(a, 2048)
            return np.where(a > 1023, 2047 - a, a)
        out = np.dstack([ni.map_coordinates(tex[..., c], [pick(v), pick(u)], order=1) for c in range(3)])
        lum = (out @ np.array([0.3, 0.59, 0.11]))[mask].mean()
        out = out * (target / lum) * np.array(tint)
        out = out * (shade * contact)[..., None]
        rgba = np.dstack([np.clip(out, 0, 1), alpha])
        Image.fromarray((rgba * 255).astype("uint8"), "RGBA").save(OUT / f"bed-{name}.png", optimize=True)
        sw = Image.open(S / "ai/tex" / file).convert("RGB").resize((144, 144), Image.LANCZOS)
        sw.save(OUT / f"sw-{name}.jpg", quality=80)
        print(name, round(lum, 3))
    base = im.copy()
    prev = Image.alpha_composite(base.convert("RGBA"), Image.open(OUT / "bed-marble.png"))
    prev.convert("RGB").save(S / "thumbs/bed-check-marble.jpg", quality=85)
    prev = Image.alpha_composite(base.convert("RGBA"), Image.open(OUT / "bed-river.png"))
    prev.convert("RGB").save(S / "thumbs/bed-check-river.jpg", quality=85)
    prev = Image.alpha_composite(base.convert("RGBA"), Image.open(OUT / "bed-red.png"))
    prev.convert("RGB").save(S / "thumbs/bed-check-red.jpg", quality=85)
    Image.fromarray((np.dstack([mask * 255, keep * 255, poly * 90]).astype("uint8"))).save(S / "thumbs/bed-mask.jpg", quality=80)


if __name__ == "__main__":
    main()
