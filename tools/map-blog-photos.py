#!/usr/bin/env python3
"""Conecta cada post del blog con una foto de servicio por el TÍTULO de la imagen.

Origen: Techos, Limpieza e Ilatek Images - Updated.
Regla: puntúa todas las fotos contra el título del post, prefiere las que casan
con su tema y reparte las variantes (1, 2, 3, 4) antes de repetir una imagen.

Salida: assets/optimized/blog/<slug>.webp (800×500) + blog/data/fotos-tarjetas.json.
"""
from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DIRS = [
    Path(r"C:\Users\Omele\Downloads\Ilatek Images - Updated"),
    Path(r"C:\Users\Omele\Downloads\Ilatek - Services Images\Techos"),
    Path(r"C:\Users\Omele\Downloads\Ilatek - Services Images\Limpieza"),
]
OUT_DIR = ROOT / "assets" / "optimized" / "blog"
DATA = ROOT / "blog" / "data" / "fotos-tarjetas.json"

STOP = {"ilatek", "property", "solution", "solutions", "servicio", "servicios",
        "para", "techos", "techo", "puerto", "rico", "con", "por", "sin", "los", "las"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s.lower()).strip()


def title_of(p: Path) -> str:
    t = p.stem
    t = re.sub(r"\s*-\s*Ilatek Property Solution(s)?\s*-\s*\d+$", "", t, flags=re.I)
    t = re.sub(r"\s*-\s*Ilatek(\s+Property\s+Solutions?)?$", "", t, flags=re.I)
    t = re.sub(r"\s{2,}", " ", t).strip(" -")
    return t


def tokens(s: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]{4,}", norm(s)) if w not in STOP}


CATALOG = []
for d in DIRS:
    if not d.is_dir():
        continue
    for i, f in enumerate(sorted(d.glob("*.jpg")), 1):
        t = title_of(f)
        CATALOG.append({"path": f, "title": t, "dir": d.name, "tokens": tokens(t), "n": i})

# (tema del post, tema de la imagen, peso). Varias reglas suman.
RULES = [
    (r"canaleta|bajante", r"canaletas", 16),
    (r"tragaluz", r"tragaluz", 16),
    (r"\bmoho\b|lavado", r"lavado a presi[oó]n", 14),
    (r"paneles solares|instalaci[oó]n|reemplazo|teja|madera|shingle", r"instalaci[oó]n y reemplazo", 12),
    (r"\bzinc\b|aluminio|metal", r"metal y zinc", 16),
    (r"concreto|hormig[oó]n|\blosa\b", r"concreto", 14),
    (r"empozam", r"empozamiento", 18),
    (r"plano", r"planos", 10),
    (r"terraza|transitable", r"sellado de techos", 8),
    (r"comercial|escolar|institucional", r"sellado comercial", 14),
    (r"industrial", r"sellado industrial", 14),
    (r"residencial|casa", r"sellado residencial", 12),
    (r"costera|cerca del mar", r"sellado de techos", 8),
    (r"impermeabiliz", r"impermeabilizaci[oó]n", 18),
    (r"inspecci[oó]n", r"inspecci[oó]n", 14),
    (r"filtraci[oó]n", r"filtraciones", 16),
    (r"gotera", r"goteras", 16),
    (r"grieta", r"grietas", 16),
    (r"silicona", r"silicona", 14),
    (r"membrana|tpo|pvc", r"membrana", 14),
    (r"poliuretano", r"poliuretano", 14),
    (r"elast[oó]mer", r"elastom[eé]rico", 14),
    (r"acr[ií]lic", r"acr[ií]lico", 14),
    (r"mantenimiento|cada cu[aá]ntos|prolongar", r"mantenimiento", 10),
    (r"equipos de aire|aire acondicionado|anclaje", r"filtraciones|sellado de techos", 6),
    (r"agua|lluvia|humedad|curado|olor|reflectivo|energ[ií]a", r"sellado de techos", 4),
    (r"precio|cu[aá]nto|cost|barato|caro|presupuesto", r"sellado de techos", 4),
    (r"garant|licencia|permiso|contratista|seguro|condominio|hurac[aá]n", r"sellado de techos", 4),
    (r"", r"sellado de techos", 1),
]
DIR_RANK = {"Ilatek Images - Updated": 0, "Techos": 1, "Limpieza": 2}
GENERIC = re.compile(r"sellado de techos|sellado comercial|sellado residencial|sellado industrial|mantenimiento|inspecci[oó]n|instalaci[oó]n|impermeabilizaci[oó]n|todos los servicios|techos planos|concreto|metal y zinc")
# Para el blog solo cuentan las fotos de techos (y sus variantes).
POOL = [c for c in CATALOG if c["dir"] != "Limpieza"]


def score(post_text: str, post_tokens: set[str], img: dict) -> int:
    t = norm(img["title"])
    s = 0
    for post_re, img_re, weight in RULES:
        if post_re and not re.search(post_re, post_text):
            continue
        if re.search(img_re, t):
            s += weight
    s += 2 * len(post_tokens & img["tokens"])
    return s


def frame(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    target = 800 / 500
    if w / h > target:
        nw = int(h * target)
        im = im.crop(((w - nw) // 2, 0, (w + nw) // 2, h))
    else:
        nh = int(w / target)
        im = im.crop((0, (h - nh) // 2, w, (h + nh) // 2))
    return im.resize((800, 500), Image.LANCZOS)


def main() -> int:
    posts = json.loads((ROOT / "blog" / "data" / "posts.json").read_text(encoding="utf-8"))["posts"]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    uso: Counter[str] = Counter()
    fotos = {}
    faltan = []
    for p in posts:
        texto = " ".join(str(x) for x in [
            p.get("slug", ""), p.get("h1", ""), p.get("sustrato", ""),
            " ".join(p.get("familias", []) or []), p.get("grupo", ""),
        ])
        pt = tokens(texto)
        # Todos los posts del blog son de techos: las fotos de limpieza no aplican.
        pool = POOL
        ranked = sorted(
            pool,
            key=lambda c: (-score(texto, pt, c), uso[str(c["path"])], DIR_RANK.get(c["dir"], 9), c["n"]),
        )
        puntajes = [(c, score(texto, pt, c)) for c in pool]
        top = max(s for _, s in puntajes)
        tema = [(c, s) for c, s in puntajes if s >= max(2, top - 2)]
        generico = [(c, s) for c, s in puntajes if GENERIC.search(norm(c["title"]))]
        best = None
        # 1) Misma tema, sin repetir. 2) Foto genérica de techos, sin repetir.
        for grupo in (tema, generico):
            libres = [(c, s) for c, s in grupo if uso[str(c["path"])] == 0]
            if libres:
                best = max(libres, key=lambda cs: (cs[1], -DIR_RANK.get(cs[0]["dir"], 9), -cs[0]["n"]))[0]
                break
        if best is None:
            # 3) Ya se usaron todas las del tema: la menos repetida.
            grupo = tema or generico or puntajes
            best = min(grupo, key=lambda cs: (uso[str(cs[0]["path"])], -cs[1], DIR_RANK.get(cs[0]["dir"], 9)))[0]
        uso[str(best["path"])] += 1
        dest = OUT_DIR / f"{p['slug']}.webp"
        frame(best["path"]).save(dest, "WEBP", quality=82, method=6)
        fotos[p["slug"]] = {
            "titulo": best["title"],
            "archivo": f"assets/optimized/blog/{p['slug']}.webp",
            "origen": str(best["path"]),
        }
    DATA.write_text(json.dumps({"generado": "2026-11-08", "fotos": fotos}, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8")
    repes = [(t, n) for t, n in uso.most_common() if n > 1]
    print(f"Fotos conectadas: {len(fotos)}/{len(posts)} · imágenes distintas: {len(uso)}/{len(CATALOG)}")
    print(f"Repetidas: {len(repes)}" + (f" · máximo {repes[0][1]}×" if repes else ""))
    for t, n in repes[:6]:
        print(f"  {n}× {t}")
    for slug, f in list(fotos.items())[:8]:
        print(f"  {slug:<42} <- {f['titulo']}")
    if faltan:
        print("Sin foto:", ", ".join(faltan))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
