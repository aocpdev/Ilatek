#!/usr/bin/env python3
"""Ilatek · tarjetas sociales 1200x630 para todas las páginas del sitio.

Lee assets/social/plan.json (tools/plan-social.mjs) y rasteriza una tarjeta por
página con Chromium a tamaño exacto.

Sistema visual:
  · foto del SERVICIO de esa página, a full color (sin velo),
  · tarjeta pequeña pegada al pie, centrada, con el padding interno del sistema,
  · la tarjeta solo lleva la píldora de categoría y el título,
  · colores en ciclo estricto: verde → blanca → azul.

Escribe WebP en assets/social/<slug>-1200.webp. Uso:
    python tools/build-social-cards.py            # todas
    python tools/build-social-cards.py --only home,sellado-de-techos
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import sys
import urllib.request
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "social"
PLAN = OUT / "plan.json"
CACHE = OUT / "_bg-cache"

VARIANTS = {
    "green": {
        "bg": "linear-gradient(158deg,#00913f 0%,#007530 55%,#005a25 100%)",
        "ink": "#ffffff", "sub": "rgba(255,255,255,.92)",
        "pill": "rgba(255,255,255,.14)", "pillBorder": "rgba(255,255,255,.46)",
        "shadow": "0 -18px 50px rgba(0,48,20,.38)",
    },
    "white": {
        "bg": "linear-gradient(180deg,#ffffff 0%,#f2f6fc 100%)",
        "ink": "#11164b", "sub": "#48527a",
        "pill": "rgba(17,22,75,.05)", "pillBorder": "rgba(17,22,75,.22)",
        "shadow": "0 -18px 50px rgba(4,8,32,.28)",
    },
    "blue": {
        "bg": "linear-gradient(158deg,#24439a 0%,#152a6b 55%,#0b103d 100%)",
        "ink": "#ffffff", "sub": "rgba(255,255,255,.9)",
        "pill": "rgba(255,255,255,.16)", "pillBorder": "rgba(255,255,255,.42)",
        "shadow": "0 -18px 50px rgba(4,8,32,.42)",
    },
}
# Respaldo: cualquier foto real del repo (la primera disponible del lote de techos).
_TECHOS = sorted((ROOT / "assets/optimized/techos").glob("*.webp"))
FALLBACK_BG = _TECHOS[0] if _TECHOS else ROOT / "assets/optimized/hero-poster-1280.webp"

HTML = """<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#0b103d}
body{font-family:"Segoe UI","Manrope",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.card{position:relative;width:1200px;height:630px;overflow:hidden}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.panel{position:absolute;z-index:2;left:20px;right:20px;bottom:0;
  padding:30px 36px 34px;text-align:center;border-radius:22px 22px 0 0;
  background:__PANEL_BG__;color:__INK__;box-shadow:__SHADOW__;
  display:flex;flex-direction:column;align-items:center}
.kicker{display:inline-block;border:1px solid __PILL_BORDER__;background:__PILL_BG__;border-radius:999px;
  padding:6px 15px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:__INK__;white-space:nowrap}
h1{margin-top:14px;font-size:42px;line-height:1.1;font-weight:800;letter-spacing:-.03em;
  max-width:100%;text-wrap:balance;overflow-wrap:break-word;hyphens:none;color:__INK__}
</style></head><body><div class="card">
<img class="bg" src="data:image/webp;base64,__BG__" alt="">
<div class="panel">
  <span class="kicker">__KICKER__</span>
  <h1>__TITLE__</h1>
</div></div></body></html>"""

FIT = """() => {
  const h = document.querySelector('h1');
  const panel = document.querySelector('.panel');
  let size = 42;
  h.style.fontSize = size + 'px';
  while (size > 26 && h.scrollHeight > 2.05 * 1.1 * size) {
    size -= 1;
    h.style.fontSize = size + 'px';
  }
  const r = panel.getBoundingClientRect();
  return { size, panelW: Math.round(r.width), panelH: Math.round(r.height),
           marginLeft: Math.round(r.left), marginRight: Math.round(1200 - r.right),
           width: Math.round(r.width),
           overflow: h.scrollWidth > h.clientWidth + 1 };
}"""


def photo_bytes(spec: str) -> bytes:
    """Bytes de la foto local o descargada (con caché por URL)."""
    if spec.startswith("assets/"):
        p = ROOT / spec
        if p.is_file():
            return p.read_bytes()
    elif spec.startswith("http"):
        CACHE.mkdir(parents=True, exist_ok=True)
        key = hashlib.sha1(spec.encode()).hexdigest()[:16]
        p = CACHE / f"{key}.img"
        if not p.is_file():
            try:
                req = urllib.request.Request(spec, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=45) as r:
                    p.write_bytes(r.read())
            except Exception as exc:
                print(f"  (aviso) sin foto {spec[:60]}: {exc}", file=sys.stderr)
                spec = ""
    return FALLBACK_BG.read_bytes() if spec else FALLBACK_BG.read_bytes()


def framed(spec: str) -> str:
    """Foto recortada a 1200×630 (se elimina la franja del logo de GHL)."""
    try:
        im = Image.open(io.BytesIO(photo_bytes(spec))).convert("RGB")
    except Exception:
        im = Image.open(FALLBACK_BG).convert("RGB")
    w, h = im.size
    # Las fotos de GHL llevan logo arriba a la derecha: se recorta esa franja.
    # Las fotos sociales de limpieza/home ya vienen limpias a 1200×630.
    if "optimized/social/" not in spec:
        im = im.crop((0, 0, int(w * 0.78), h))
    scale = max(1200 / im.width, 630 / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = max(0, (im.width - 1200) // 2)
    top = max(0, (im.height - 630) // 2)
    im = im.crop((left, top, left + 1200, top + 630))
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=90, method=6)
    return base64.b64encode(buf.getvalue()).decode()


def esc(s: str) -> str:
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    plan = json.loads(PLAN.read_text(encoding="utf-8"))
    cards = plan["cards"]
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))
        cards = [c for c in cards if c["name"] in only]

    OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    problems: list[str] = []
    counts = {"green": 0, "white": 0, "blue": 0}
    bgs: dict[str, str] = {}

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
        for c in cards:
            title = (c.get("title") or "").strip()
            if not title:
                problems.append(f"sin título: {c['name']}")
                continue
            variant = c.get("variant") or "blue"
            v = VARIANTS[variant]
            counts[variant] += 1
            spec = c.get("bg") or ""
            if spec not in bgs:
                bgs[spec] = framed(spec)
            html = (HTML.replace("__BG__", bgs[spec])
                        .replace("__PANEL_BG__", v["bg"])
                        .replace("__SHADOW__", v["shadow"])
                        .replace("__INK__", v["ink"])
                        .replace("__PILL_BG__", v["pill"])
                        .replace("__PILL_BORDER__", v["pillBorder"])
                        .replace("__KICKER__", esc(c.get("kicker") or "Ilatek"))
                        .replace("__TITLE__", esc(title)))
            page.set_content(html, wait_until="load")
            fit = page.evaluate(FIT)
            if fit["overflow"] or fit["marginLeft"] != 20 or fit["marginRight"] != 20:
                problems.append(f"márgenes/desborde: {c['name']} ({fit})")
            shot = page.screenshot(clip={"x": 0, "y": 0, "width": 1200, "height": 630})
            dest = ROOT / c["card"]
            dest.parent.mkdir(parents=True, exist_ok=True)
            Image.open(io.BytesIO(shot)).convert("RGB").save(dest, "WEBP", quality=88, method=6)
            made += 1
            print(f"  {c['name']:<42} {variant:<5} {fit['size']}px  {dest.stat().st_size // 1024} KB", flush=True)
        browser.close()

    print(f"\nTarjetas generadas: {made} · plan: {plan['total']}")
    print(f"Acabados: verde={counts['green']} blanca={counts['white']} azul={counts['blue']}")
    if problems:
        print("✗ Problemas:", file=sys.stderr)
        for p in problems[:12]:
            print("  - " + p, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
