"""Retouch the portrait: natural teeth whitening -> 1:1 crop -> circular
transparent background -> output PNG (plus a debug collage).

Usage:
  python Ilatek/tools/qa/retouch_avatar.py
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

SRC = r"C:\Users\Omele\Downloads\361B89CC-E55E-486A-8381-AEB91E5FC3C9.PNG"
OUT_DIR = r"C:\Users\Omele\Downloads"
OUT_CIRCLE = os.path.join(OUT_DIR, "profile_circle_transparent.png")
DEBUG_TEETH = os.path.join(OUT_DIR, "debug_teeth_mask.png")
DEBUG_SIDE = os.path.join(OUT_DIR, "debug_before_after.png")

im = Image.open(SRC).convert("RGB")
W, H = im.size
a = np.asarray(im).astype(np.float32)

# ------------------------------------------------------------------
# 1) Teeth whitening: brighten + desaturate the warm tint, keep natural
#    shading. Soft mask from luminance/saturation in the mouth region,
#    restricted to a teeth band, then feathered.
# ------------------------------------------------------------------
y0, y1, x0, x1 = 545, 665, 440, 690
reg = a[y0:y1, x0:x1]

lum = reg.mean(axis=2)
mx = reg.max(axis=2)
mn = reg.min(axis=2)
sat = mx - mn

# Core teeth pixels: bright and lowish saturation (teeth ~ (240,225,215))
core = ((lum > 165) & (sat < 40)).astype(np.float32)

# Feather the mask edges with a gaussian blur (no scipy needed).
soft_img = Image.fromarray((core * 255).astype(np.uint8)).filter(
    ImageFilter.GaussianBlur(radius=1.2)
)
soft = np.asarray(soft_img).astype(np.float32) / 255.0
soft = np.clip(soft, 0, 1)

# Weight by brightness so shadowed teeth keep shading; cap lift.
lift = 0.30 * soft  # up to 30% brightness increase (scaled by headroom)
sat_reduce = 0.60 * soft  # remove up to 60% of the yellow tint

out = a.copy()
r, g, b = a[..., 0], a[..., 1], a[..., 2]
reg_r = r[y0:y1, x0:x1]
reg_g = g[y0:y1, x0:x1]
reg_b = b[y0:y1, x0:x1]

# 1a) brightness lift toward white, scaled per-pixel (protect highlights)
reg_lum = reg.mean(axis=2)
add = lift[..., None] * (255.0 - reg_lum)[..., None]
reg_r2 = reg_r + add[..., 0]
reg_g2 = reg_g + add[..., 0]
reg_b2 = reg_b + add[..., 0]

# 1b) desaturate toward neutral (reduces yellow tint), keep a little warmth
gray = (reg_r2 + reg_g2 + reg_b2) / 3.0
reg_r3 = gray + (reg_r2 - gray) * (1.0 - sat_reduce)
reg_g3 = gray + (reg_g2 - gray) * (1.0 - sat_reduce)
reg_b3 = gray + (reg_b2 - gray) * (1.0 - sat_reduce)

out[y0:y1, x0:x1, 0] = reg_r3
out[y0:y1, x0:x1, 1] = reg_g3
out[y0:y1, x0:x1, 2] = reg_b3

# ------------------------------------------------------------------
# 2) Square 1:1 crop centered on the face, then circular mask.
# ------------------------------------------------------------------
side = min(W, H)  # 1122
cx_img = W / 2  # 561
# Face center ~x562; top of head ~y90, chin ~y700. For a circle avatar we
# want the face to fill most of the circle but keep a bit of hair/shoulders.
# Center vertical on the eyes/nose area so the face sits nicely in the circle.
cy_img = 620.0
half = side / 2.0
left = cx_img - half
top = cy_img - half
box = (int(round(left)), int(round(top)), int(round(left + side)), int(round(top + side)))
sq = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).crop(box)

# ------------------------------------------------------------------
# 3) Circular transparent background, anti-aliased edge.
# ------------------------------------------------------------------
SS = 4  # supersample factor for smooth edge
big = (side * SS, side * SS)
mask_hi = Image.new("L", big, 0)
ImageDraw.Draw(mask_hi).ellipse((0, 0, big[0] - 1, big[1] - 1), fill=255)
mask_hi = mask_hi.resize((side, side), Image.LANCZOS)

rgba = sq.convert("RGBA")
rgba.putalpha(mask_hi)
rgba.save(OUT_CIRCLE)

# ------------------------------------------------------------------
# 4) Debug images: teeth-mask overlay and before/after side by side.
# ------------------------------------------------------------------
dbg = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
d = np.asarray(im).astype(np.float32).copy()
overlay = d.copy()
overlay[y0:y1, x0:x1, 2] = np.maximum(d[y0:y1, x0:x1, 2], 255 * soft)  # blue tint where mask
ov = (0.5 * d + 0.5 * overlay).astype(np.uint8)
Image.fromarray(ov).crop((380, 500, 760, 720)).resize((760, 440)).save(DEBUG_TEETH)

before_crop = im.crop(box).resize((512, 512))
after_crop = rgba.convert("RGB").resize((512, 512))
side_by_side = Image.new("RGB", (1044, 512), (30, 30, 30))
side_by_side.paste(before_crop, (0, 0))
side_by_side.paste(after_crop, (532, 0))
side_by_side.save(DEBUG_SIDE)

print("saved:", OUT_CIRCLE)
print("saved:", DEBUG_TEETH)
print("saved:", DEBUG_SIDE)
