#!/usr/bin/env python
"""Ilatek · revisión local · genera tools/review-og.html

Hoja de contactos para revisar a ojo, en localhost:
  - las 48 imágenes sociales (assets/optimized/social/<slug>.jpg) tal como quedan
    en el <meta og:image> / <meta twitter:image> de las páginas activas, leídas
    directamente del HTML (no de una lista mantenida a mano);
  - las páginas y los bloques de head SEO cuyos metas NO coinciden con una imagen
    existente (debería salir vacío);
  - el video de fondo de la sección del catálogo de 10 servicios de limpieza.

Uso:
    python Ilatek/tools/review-og.py        # y luego abrir tools/review-og.html
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tools" / "review-og.html"
BASE = "https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/social/"
IMG_DIR = ROOT / "assets" / "optimized" / "social"

OG_RE = re.compile(r'<meta\s+property="og:image"\s+content="([^"]*)"')
TW_RE = re.compile(r'<meta\s+name="twitter:image"\s+content="([^"]*)"')
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S)
# Ojo: el backreference tiene que ser con nombre (?P=slug); \2 apuntaría al
# grupo <body> y no habría match (falso negativo de 0 bloques).
BLOCK_RE = re.compile(
    r"<!-- ▼▼ /(?P<slug>[a-z0-9\-]+) ▼▼ -->(?P<body>.*?)<!-- ▲▲ fin /(?P=slug) ▲▲ -->",
    re.S,
)
VIDEO_RE = re.compile(r'<video[^>]*>', re.S)

# La seccion de los 10 servicios de limpieza existe en varias copias del repo y
# todas deben llevar el MISMO fondo de video (tools/apply-slider-video.py es el
# dueno de aplicarlo; aqui solo se audita y se muestra).
CANON_VIDEO = "6ac8f952bd6bb710ca0fd582.mp4"
AUDIT_IDS = ("ilatek-servicios-slider", "ilatek-servicios-catalogo")
SKIP_PARTS = {".backups-uiux", ".git", "node_modules"}
VIDEO_SRC_RE = re.compile(r'<video class="ilsx?-bgvideo"[^>]*?src="([^"]+)"', re.S)
POSTER_RE = re.compile(r'<video class="ilsx?-bgvideo"[^>]*?poster="([^"]+)"', re.S)
CARD_CLASS_RE = re.compile(r'class="ilsx?-card\b')


def meta_in(text: str, regex: re.Pattern[str]) -> str:
    m = regex.search(text)
    return m.group(1) if m else ""


def page_title(text: str) -> str:
    m = TITLE_RE.search(text)
    if not m:
        return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m.group(1))).strip()


def rows() -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    files = sorted((ROOT / "home-page").glob("*.html")) + sorted(
        (ROOT / "techos").glob("ghl-*-landing.html")
    )
    for path in files:
        # Los head SEO llevan un bloque og:image por página: no son landings.
        if "head-seo" in path.name:
            continue
        text = path.read_text(encoding="utf-8")
        og = meta_in(text, OG_RE)
        tw = meta_in(text, TW_RE)
        if not og or "assets/optimized/social/" not in og:
            continue
        slug = og.rsplit("/", 1)[-1].removesuffix(".jpg")
        rel = path.relative_to(ROOT).as_posix()
        out.append(
            {
                "slug": slug,
                "rel": rel,
                "title": page_title(text),
                "og": og,
                "tw": tw,
                "local": (IMG_DIR / f"{slug}.jpg").is_file(),
                "match": og == tw,
                "group": "Techos" if rel.startswith("techos/") else "Limpieza / Home",
            }
        )
    return out


def seo_block_rows() -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for rel in ("home-page/ghl-head-seo.html", "techos/ghl-techos-head-seo.html"):
        text = (ROOT / rel).read_text(encoding="utf-8")
        for m in BLOCK_RE.finditer(text):
            slug = m.group("slug")
            og = meta_in(m.group("body"), OG_RE)
            tw = meta_in(m.group("body"), TW_RE)
            img_slug = og.rsplit("/", 1)[-1].removesuffix(".jpg") if og else "-"
            out.append(
                {
                    "file": rel,
                    "slug": slug,
                    "img": img_slug,
                    "ok": img_slug == slug and og == tw and og.endswith(".jpg"),
                    "title": page_title(m.group("body")),
                }
            )
    return out


def reviews_logo_audit() -> dict[str, object]:
    """Estado del logo de Google en las pestañas de reseñas de todo el repo."""
    old_jpg = 0
    svg_ok = 0
    bad_svg: list[str] = []
    files_with_svg = 0
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_PARTS for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        if "6ac6fe59195f9172eddf11b8.jpg" in text:
            old_jpg += text.count("6ac6fe59195f9172eddf11b8.jpg")
        logos = re.findall(r'<span class="il-glogo"[^>]*>(.*?)</span>', text, re.S)
        if logos:
            files_with_svg += 1
            for body in logos:
                if len(re.findall(r"<path ", body)) == 4 and '#4285F4' in body:
                    svg_ok += 1
                else:
                    bad_svg.append(path.relative_to(ROOT).as_posix())
    return {"old": old_jpg, "svg": svg_ok, "files": files_with_svg, "bad": bad_svg}


def section_audit() -> list[dict[str, object]]:
    """Cada copia de la seccion de los 10 servicios y si lleva el video correcto."""
    rows: list[dict[str, object]] = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_PARTS for part in path.parts):
            continue
        if path.name.startswith(".") or "review" in path.name:
            continue
        text = path.read_text(encoding="utf-8")
        for sid in AUDIT_IDS:
            if f'id="{sid}"' not in text:
                continue
            # ojo: algunas secciones llevan class antes del id, así que se
            # ancla en el id y no en "<section id=".
            start = text.index(f'id="{sid}"')
            body = text[start : text.index("</section>", start)]
            m = VIDEO_SRC_RE.search(body)
            src = m.group(1) if m else ""
            poster_m = POSTER_RE.search(body)
            rows.append(
                {
                    "file": path.relative_to(ROOT).as_posix(),
                    "sid": sid,
                    "url": src,
                    "poster": poster_m.group(1) if poster_m else "",
                    "video": src.rsplit("/", 1)[-1] if src else "(sin video de fondo)",
                    "cards": len(CARD_CLASS_RE.findall(body)),
                    "ok": src.endswith(CANON_VIDEO),
                }
            )
    return rows


def render_cards(items: list[dict[str, str]]) -> str:
    cards = []
    for it in items:
        flag = "" if (it["local"] and it["match"]) else ' data-flag="1"'
        issues = []
        if not it["local"]:
            issues.append("falta el archivo en disco")
        if not it["match"]:
            issues.append("og:image != twitter:image")
        badge = (
            f'<span class="bad">⚠ {html.escape("; ".join(issues))}</span>'
            if issues
            else '<span class="ok">✓</span>'
        )
        cards.append(
            f"""<figure{flag}>
  <a class="shot" href="../{html.escape(it['rel'])}" target="_blank"><img loading="lazy" src="../assets/optimized/social/{html.escape(it['slug'])}.jpg" alt=""></a>
  <figcaption>
    <div class="ttl">{html.escape(it['title']) or '<em>sin &lt;title&gt;</em>'}</div>
    <code>{html.escape(it['slug'])}</code> {badge}
    <div class="path">{html.escape(it['rel'])}</div>
    <a class="cdn" href="{html.escape(it['og'])}" target="_blank">ver en el CDN ↗</a>
  </figcaption>
</figure>"""
        )
    return "\n".join(cards)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    items = rows()
    seo = seo_block_rows()

    flagged = [i for i in items if not (i["local"] and i["match"])]
    seo_bad = [b for b in seo if not b["ok"]]
    groups = sorted({i["group"] for i in items})

    bad_rows = "\n".join(
        f"<li>{html.escape(i['rel'])} → <code>{html.escape(i['slug'])}</code></li>"
        for i in flagged
    ) or "<li class='none'>Ninguna: 48/48 correctas.</li>"
    seo_rows = "\n".join(
        f"<tr class='{'bad' if not b['ok'] else ''}'><td>{html.escape(b['file'])}</td>"
        f"<td><code>{html.escape(b['slug'])}</code></td><td><code>{html.escape(b['img'])}</code></td>"
        f"<td>{'✓' if b['ok'] else '⚠'}</td></tr>"
        for b in seo
    )

    audit = section_audit()
    logo = reviews_logo_audit()
    # URL canónica del video: la de la primera copia que ya lo declara bien.
    canon_url = next((str(a["url"]) for a in audit if a["ok"]), "")
    canon_poster = next((str(a["poster"]) for a in audit if a["ok"] and a["poster"]), "")
    audit_rows = "\n".join(
        f"<tr class='{'ok-row' if a['ok'] else 'bad'}'><td><a href='../{html.escape(str(a['file']))}' target='_blank'>{html.escape(str(a['file']))}</a></td>"
        f"<td><code>{html.escape(str(a['sid']))}</code></td>"
        f"<td><code>{html.escape(str(a['video']))}</code></td>"
        f"<td>{'✓' if a['ok'] else '⚠'}</td></tr>"
        for a in audit
    )
    audit_bad = [a for a in audit if not a["ok"]]
    tabs = "".join(
        f'<button class="tab{' bad' if not a['ok'] else ''}" data-src="../{html.escape(str(a['file']))}" data-sid="{html.escape(str(a['sid']))}">'
        f"{html.escape(str(a['file']).replace('home-page/', ''))}</button>"
        for a in audit
    )

    sections = []
    for g in groups:
        subset = [i for i in items if i["group"] == g]
        sections.append(
            f"<h2>{html.escape(g)} <small>{len(subset)} páginas</small></h2>"
            f'<div class="grid">{render_cards(subset)}</div>'
        )

    OUT.write_text(
        f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Revisión local · Ilatek (OG social + video de fondo)</title>
<style>
  :root {{ --ink:#0d1b2a; --soft:#5b6b7c; --line:#e3e8ee; --accent:#0b6bcb; --ok:#0f7b3f; --bad:#b3261e; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; padding:32px clamp(16px,4vw,56px) 72px; font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--ink); background:#f7f9fb; }}
  h1 {{ font-size:clamp(22px,3vw,30px); margin:0 0 6px; }}
  h2 {{ font-size:19px; margin:44px 0 14px; padding-bottom:8px; border-bottom:2px solid var(--line); }}
  h2 small {{ color:var(--soft); font-weight:400; font-size:14px; }}
  .lead {{ color:var(--soft); margin:0 0 8px; max-width:78ch; }}
  .stats {{ display:flex; flex-wrap:wrap; gap:10px; margin:18px 0 0; }}
  .stat {{ background:#fff; border:1px solid var(--line); border-radius:10px; padding:10px 14px; }}
  .stat b {{ display:block; font-size:22px; }}
  .stat span {{ color:var(--soft); font-size:12.5px; text-transform:uppercase; letter-spacing:.04em; }}
  ul {{ margin:10px 0 0; padding-left:20px; }}
  li.none {{ color:var(--ok); }}
  .grid {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }}
  figure {{ margin:0; background:#fff; border:1px solid var(--line); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; }}
  figure[data-flag] {{ border-color:var(--bad); box-shadow:0 0 0 2px #f7d7d4 inset; }}
  .shot {{ display:block; aspect-ratio:1200/630; background:#eef2f6; }}
  .shot img {{ width:100%; height:100%; object-fit:cover; display:block; }}
  figcaption {{ padding:12px 14px 14px; font-size:13px; }}
  .ttl {{ font-weight:600; margin-bottom:6px; min-height:34px; }}
  code {{ background:#f0f4f8; border-radius:4px; padding:1px 5px; font-size:12px; }}
  .ok {{ color:var(--ok); font-weight:700; }}
  .bad {{ color:var(--bad); font-weight:700; }}
  .path {{ color:var(--soft); font-size:11.5px; margin-top:6px; word-break:break-all; }}
  .cdn {{ color:var(--accent); text-decoration:none; font-size:12.5px; }}
  .cdn:hover {{ text-decoration:underline; }}
  table {{ border-collapse:collapse; width:100%; background:#fff; border:1px solid var(--line); border-radius:10px; overflow:hidden; font-size:13px; }}
  th,td {{ text-align:left; padding:8px 12px; border-bottom:1px solid var(--line); }}
  th {{ background:#f0f4f8; font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--soft); }}
  tr.bad td {{ background:#fdecea; color:var(--bad); font-weight:600; }}
  .video {{ display:grid; grid-template-columns:minmax(240px,360px) 1fr; gap:20px; align-items:start; }}
  .video .box {{ background:#fff; border:1px solid var(--line); border-radius:12px; padding:14px; font-size:13px; }}
  .video video {{ width:100%; border-radius:8px; background:#0d1b2a; }}
  iframe {{ width:100%; height:760px; border:1px solid var(--line); border-radius:12px; background:#fff; }}
  .note {{ background:#fff8e6; border:1px solid #f2dfa8; border-radius:10px; padding:12px 16px; margin:18px 0 0; font-size:13.5px; }}
  .rm {{ font-size:12.5px; border-radius:8px; padding:10px 12px; margin:10px 0 0; background:#eef5ff; border:1px solid #cfe0f7; color:#12456f; }}
  .rm.on {{ background:#fdecea; border-color:#f3c3bf; color:var(--bad); }}
  tr.ok-row td:last-child {{ color:var(--ok); font-weight:700; }}
  td a {{ color:var(--accent); text-decoration:none; }}
  td a:hover {{ text-decoration:underline; }}
  .tabs {{ display:flex; flex-wrap:wrap; gap:8px; margin:22px 0 14px; }}
  .tab {{ font:inherit; font-size:12.5px; cursor:pointer; border:1px solid var(--line); background:#fff; color:var(--ink); border-radius:999px; padding:7px 14px; }}
  .tab:hover {{ border-color:#b9c7d6; }}
  .tab.is-active {{ background:#0d1b2a; border-color:#0d1b2a; color:#fff; }}
  .tab.bad {{ border-color:#f3c3bf; color:var(--bad); }}
  @media (max-width:760px) {{ .video {{ grid-template-columns:1fr; }} }}
</style>
</head>
<body>
<h1>Revisión local · Ilatek</h1>
<p class="lead">Lee los archivos reales del repo (<code>home-page/*.html</code>, <code>techos/ghl-*-landing.html</code> y los dos head SEO). El título es el <code>&lt;title&gt;</code> de cada página y la foto es exactamente la que ese archivo declara en <code>og:image</code>.</p>

<div class="stats">
  <div class="stat"><b>{len(items)}</b><span>páginas con og:image social</span></div>
  <div class="stat"><b>{len(items) - len(flagged)}</b><span>correctas</span></div>
  <div class="stat"><b>{len(flagged)}</b><span>con problema</span></div>
  <div class="stat"><b>{len(seo)}</b><span>bloques de head SEO</span></div>
  <div class="stat"><b>{len(seo) - len(seo_bad)}</b><span>bloques correctos</span></div>
  <div class="stat"><b>{logo['svg']}</b><span>logos Google SVG nítidos</span></div>
  <div class="stat"><b>{logo['old']}</b><span>JPG antiguos del logo</span></div>
</div>

<h2>Páginas con algún problema</h2>
<ul>{bad_rows}</ul>

<h2>Bloques de head SEO</h2>
<table><thead><tr><th>Archivo</th><th>Slug del bloque</th><th>Imagen declarada</th><th></th></tr></thead><tbody>
{seo_rows}
</tbody></table>

{''.join(sections)}

<h2>Video de fondo · todas las copias de la sección de 10 servicios</h2>
<p class="lead">El mismo <code>{CANON_VIDEO}</code> en cada archivo que contiene la sección. Auditoría leída de los archivos, no de una lista escrita a mano.</p>
<table><thead><tr><th>Archivo</th><th>Id de la sección</th><th>Video declarado</th><th></th></tr></thead><tbody>
{audit_rows}
</tbody></table>
<p class="lead" style="margin-top:12px">{'Todas las copias usan el video pedido.' if not audit_bad else str(len(audit_bad)) + ' copia(s) sin el video: ' + ', '.join(str(a['file']) for a in audit_bad)}</p>

<div class="tabs">{tabs}</div>
<div class="video">
  <div class="box">
    <video src="{html.escape(canon_url)}" poster="{html.escape(canon_poster)}" autoplay muted loop playsinline></video>
    <p><b>Video pedido:</b> <code>{CANON_VIDEO}</code><br><a class="cdn" href="{html.escape(canon_url)}" target="_blank">abrir el .mp4 ↗</a></p>
    <p><b>Se replica desde:</b> <code>home-page/ghl-servicios-carousel-embed.html</code> con <code>tools/apply-slider-video.py</code>.</p>
    <p><a class="cdn" id="jump" href="#">recentrar en la sección ↺</a> · <a class="cdn" id="force" href="#">forzar el video (ignorar reduce-motion) ▶</a></p>
    <p id="rm" class="rm"></p>
    <p id="probe" class="rm"></p>
  </div>
  <iframe id="sv" src="../{html.escape(str(audit[0]['file']))}" title="Sección de 10 servicios con video de fondo"></iframe>
</div>

<h2>Logo de Google en las pestañas de reseñas</h2>
<p class="lead">El isotipo oficial en SVG (4 trazos, disco blanco) reemplaza al JPG recortado en círculo en {logo['files']} archivos. Lo aplica <code>tools/fix-google-logo.py</code>.</p>
<table><thead><tr><th>Estado</th><th>Valor</th></tr></thead><tbody>
<tr class="ok-row"><td>Pestañas con el isotipo SVG correcto</td><td>{logo['svg']}</td></tr>
<tr class="{'ok-row' if not logo['old'] else 'bad'}"><td>Copias del JPG antiguo que quedan</td><td>{logo['old']}</td></tr>
<tr class="{'ok-row' if not logo['bad'] else 'bad'}"><td>SVG mal formados</td><td>{len(logo['bad'])}</td></tr>
</tbody></table>
<iframe id="rv" src="../home-page/ghl-alfombras-landing.html" title="Pestañas de reseñas con el logo de Google" style="margin-top:14px"></iframe>

<div class="note">El live de <b>ilatekpr.com</b> no cambia con estos archivos: el código pegado en GHL es estático y hay que re-pegar los bloques actualizados.</div>

<script>
(function () {{
  var ifr = document.getElementById('sv');
  var forced = false;

  function bgVideo(d) {{ return d.querySelector('video.ilsx-bgvideo') || d.querySelector('video.ils-bgvideo'); }}
  function section(d) {{ return d.querySelector('#ilatek-servicios-catalogo') || d.querySelector('#ilatek-servicios-slider'); }}

  // El layout se expande al cargar imágenes y el scroll anchoring del navegador
  // se lleva la posición: se repite el ajuste y se desactiva el anchoring.
  function jump() {{
    try {{
      var d = ifr.contentDocument, w = ifr.contentWindow;
      d.documentElement.style.overflowAnchor = 'none';
      if (d.body) d.body.style.overflowAnchor = 'none';
      var v = bgVideo(d);
      if (v) {{ v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {{}}); }}
      var target = d.querySelector('#ilsx-stage3d') || d.querySelector('.ils-carousel') || section(d);
      if (target) w.scrollTo({{ top: target.getBoundingClientRect().top + w.scrollY - 150, behavior: 'auto' }});
    }} catch (e) {{}}
  }}

  // El sitio oculta el video bajo reduce-motion (.ilsx-bgvideo/.ils-bgvideo
  // display:none). Este navegador pide reduce-motion, así que el botón inyecta
  // un override SOLO dentro del iframe, para poder ver el video real.
  function force(d) {{
    if (!forced) return;
    if (!d.getElementById('force-video')) {{
      var s = d.createElement('style');
      s.id = 'force-video';
      s.textContent = '.ilsx-bgvideo,.ils-bgvideo{{display:block!important;visibility:visible!important}}';
      d.head.appendChild(s);
    }}
  }}

  function probe() {{
    try {{
      var d = ifr.contentDocument, w = ifr.contentWindow, sec = section(d), v = bgVideo(d);
      var el = document.getElementById('probe');
      if (!sec || !v) {{ el.textContent = 'No encuentro la sección o el video en esta página.'; return; }}
      var sr = sec.getBoundingClientRect(), vr = v.getBoundingClientRect();
      var cards = d.querySelectorAll('.ilsx-card, .ils-card').length;
      var cover = vr.width >= sr.width - 2 && vr.height >= sr.height - 2;
      el.textContent = (cover ? '✓ el video cubre la sección' : '⚠ el video NO cubre la sección')
        + ' · ' + cards + ' tarjetas · video ' + (v.paused ? 'pausado' : 'reproduciendo')
        + ' · ' + v.videoWidth + 'x' + v.videoHeight
        + ' · z video ' + getComputedStyle(v).zIndex + ' < overlay ' + getComputedStyle(sec, '::before').zIndex + ' < contenido ' + getComputedStyle(d.querySelector('.ilsx-shell') || d.querySelector('.ils-carousel')).zIndex;
    }} catch (e) {{}}
  }}

  function report() {{
    try {{
      var d = ifr.contentDocument, w = ifr.contentWindow;
      var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var v = bgVideo(d);
      var shown = v ? getComputedStyle(v).display !== 'none' : false;
      var el = document.getElementById('rm');
      el.className = 'rm' + (reduce && !shown ? ' on' : '');
      el.textContent = reduce
        ? (shown
          ? 'reduce-motion activo · el video está forzado y visible abajo.'
          : 'OJO: este navegador pide reduce-motion y el sitio oculta el video (regla propia del sitio). Abajo se ve el póster.')
        : (shown ? 'Sin reduce-motion: el video se ve como lo verá la mayoría.' : 'El video no se está mostrando.');
      probe();
    }} catch (e) {{}}
  }}

  ifr.addEventListener('load', function () {{
    try {{ force(ifr.contentDocument); }} catch (e) {{}}
    [0, 400, 900, 1600, 2600, 4000].forEach(function (ms) {{ setTimeout(function () {{ jump(); setTimeout(report, 60); }}, ms); }});
  }});

  document.querySelectorAll('.tab').forEach(function (b) {{
    b.addEventListener('click', function () {{
      // volver a pulsar la pestaña activa no recarga (estas páginas son
      // pesadas y recargarlas sin querer traba el navegador).
      if (b.classList.contains('is-active')) return;
      document.querySelectorAll('.tab').forEach(function (o) {{ o.classList.remove('is-active'); }});
      b.classList.add('is-active');
      document.getElementById('rm').textContent = 'Cargando ' + b.textContent.trim() + '…';
      document.getElementById('probe').textContent = '';
      ifr.src = b.getAttribute('data-src');
    }});
  }});
  // marca la pestaña activa inicial
  var first = document.querySelector('.tab');
  if (first) first.classList.add('is-active');

  var jb = document.getElementById('jump');
  if (jb) jb.addEventListener('click', function (e) {{ e.preventDefault(); jump(); setTimeout(report, 250); }});
  var fb = document.getElementById('force');
  if (fb) fb.addEventListener('click', function (e) {{
    e.preventDefault(); forced = true;
    try {{
      force(ifr.contentDocument);
      var v = bgVideo(ifr.contentDocument);
      if (v) {{ v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {{}}); }}
    }} catch (err) {{}}
    jump(); setTimeout(report, 300);
  }});

  // El video de referencia del panel izquierdo puede quedar pausado en t=0
  // (frame negro) si el navegador bloquea su autoplay: se relanza a mano.
  function playRef() {{
    var bv = document.querySelector('.box video');
    if (!bv) return;
    bv.muted = true;
    var p = bv.play();
    if (p && p.catch) p.catch(function () {{}});
  }}
  playRef();
  window.addEventListener('load', playRef);
  setInterval(playRef, 5000);

  // El iframe de reseñas se centra en las pestañas del logo de Google.
  var rv = document.getElementById('rv');
  if (rv) rv.addEventListener('load', function () {{
    [0, 500, 1200].forEach(function (ms) {{ setTimeout(function () {{
      try {{
        var d = rv.contentDocument, w = rv.contentWindow;
        var t = d.querySelector('.il-reviews-tabs');
        if (t) w.scrollTo({{ top: t.getBoundingClientRect().top + w.scrollY - 200, behavior: 'auto' }});
      }} catch (e) {{}}
    }}, ms); }});
  }});

  setTimeout(report, 1500);
  setTimeout(report, 4500);
}})();
</script>
</body>
</html>
""",
        encoding="utf-8",
    )

    print(f"✓ {OUT.relative_to(ROOT)}")
    print(f"  páginas con og:image social: {len(items)} (problemas: {len(flagged)})")
    print(f"  bloques de head SEO: {len(seo)} (problemas: {len(seo_bad)})")
    for i in flagged:
        print(f"  ⚠ {i['rel']} -> {i['slug']}")
    for b in seo_bad:
        print(f"  ⚠ {b['file']} /{b['slug']} -> {b['img']}")
    return 1 if (flagged or seo_bad) else 0


if __name__ == "__main__":
    raise SystemExit(main())
