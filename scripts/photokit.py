"""Two helpers for scripts/photos.py.

grade()  lifts the color in Jake's phone photos: gentle levels, local contrast,
         vibrance and a little extra for lawns and sky. No sharpening: it
         added weight to every photo for detail nobody sees at web size. It only
         corrects the light and color the camera caught; nothing is added or moved.
align()  warps a "before" photo into the frame of the design rendering that was made
         from it, so a before and after slider lines up. It matches features on the
         house (SIFT), then fits a projective transform with RANSAC.
"""
import numpy as np
from PIL import Image
from skimage import color, exposure
from skimage.color import rgb2gray
from skimage.feature import SIFT, match_descriptors
from skimage.measure import ransac
from skimage.transform import ProjectiveTransform, warp


def grade(im, s=1.0):
    if s <= 0:
        return im
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    # levels from robust percentiles, half strength, so the white balance stays as shot
    lo = np.percentile(a, 0.4, axis=(0, 1))
    hi = np.percentile(a, 99.6, axis=(0, 1))
    together = (a - lo.min()) / max(1e-3, hi.max() - lo.min())
    apart = (a - lo) / np.maximum(1e-3, hi - lo)
    a = np.clip(a * (1 - 0.55 * s) + (0.7 * together + 0.3 * apart) * 0.55 * s, 0, 1)
    lab = color.rgb2lab(a)
    L = lab[..., 0] / 100.0
    eq = exposure.equalize_adapthist(L, clip_limit=0.008, kernel_size=max(64, min(L.shape) // 8))
    L = L * (1 - 0.25 * s) + eq * 0.25 * s
    L = 0.5 + (L - 0.5) * (1 + 0.22 * s)
    L = L - 0.48 * s * (L - 0.5) ** 3
    lab[..., 0] = np.clip(L, 0, 1) * 100
    A, B = lab[..., 1], lab[..., 2]
    gain = 1 + 0.34 * s * np.clip(1 - np.hypot(A, B) / 70.0, 0, 1)
    hue = np.arctan2(B, A)
    green = np.exp(-((hue - np.deg2rad(125)) / np.deg2rad(32)) ** 2)
    # sky only: blue that is also bright, so shaded lawn never turns teal
    sky = np.exp(-((hue - np.deg2rad(-100)) / np.deg2rad(30)) ** 2) * np.clip((L - 0.55) / 0.2, 0, 1)
    gain = gain * (1 + 0.12 * s * green + 0.15 * s * sky)
    lab[..., 1] = A * gain
    lab[..., 2] = B * gain
    out = np.clip(color.lab2rgb(lab), 0, 1)
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8))


def _features(gray):
    d = SIFT()
    d.detect_and_extract(gray)
    return d.keypoints, d.descriptors


def align(before, after, work=900):
    sb = work / max(before.size)
    sa = work / max(after.size)
    gb = rgb2gray(np.asarray(before.resize((round(before.width * sb), round(before.height * sb)), Image.LANCZOS)) / 255.0)
    ga = rgb2gray(np.asarray(after.resize((round(after.width * sa), round(after.height * sa)), Image.LANCZOS)) / 255.0)
    kb, db = _features(gb)
    ka, da = _features(ga)
    m = match_descriptors(da, db, cross_check=True, max_ratio=0.8)
    src = ka[m[:, 0]][:, ::-1] / sa
    dst = kb[m[:, 1]][:, ::-1] / sb
    t, inliers = ransac((src, dst), ProjectiveTransform, min_samples=4, residual_threshold=4.0 / sa, max_trials=5000, rng=0)
    b = np.asarray(before).astype(np.float32) / 255.0
    out = warp(b, t, output_shape=(after.height, after.width), order=3, mode="edge")
    # where the photo really reaches; outside it "edge" mode only smears the border
    seen = warp(np.ones(b.shape[:2], np.float32), t, output_shape=(after.height, after.width), order=0, cval=0) > 0.5
    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)), int(inliers.sum()), covered(seen)


def covered(seen):
    """The box (l, t, r, b) in pixels inside which every pixel was seen, found by
    trimming whichever edge is worst until none is missing."""
    l, t, r, b = 0, 0, seen.shape[1], seen.shape[0]
    while True:
        box = seen[t:b, l:r]
        miss = {"t": (~box[0]).sum(), "b": (~box[-1]).sum(), "l": (~box[:, 0]).sum(), "r": (~box[:, -1]).sum()}
        side, worst = max(miss.items(), key=lambda kv: kv[1])
        if worst == 0:
            return l, t, r, b
        if side == "t": t += 1
        elif side == "b": b -= 1
        elif side == "l": l += 1
        else: r -= 1
