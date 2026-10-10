#!/usr/bin/env python
"""Ilatek · mapa pagina -> /slug -> imagenes (hero y contenido).

Responde dos cosas:
  1. Que archivo corresponde a que /slug publicado.
  2. Que imagen de la biblioteca del cliente va de HERO y cuales de CONTENIDO
     (el cliente pidio que el contenido use imagenes distintas al hero).

Reglas:
  · HERO      = la portada con el titulo exacto del servicio
                (carpeta "Ilatek Images - Updated").
  · CONTENIDO = el par `- 1` / `- 2` de ese mismo servicio en la carpeta de
                servicios ("Ilatek - Services Images/<Limpieza|Techos>").
  · El emparejamiento es por palabras del titulo, sin acentos ni mayusculas,
    con una tabla de excepciones para los casos que no son literales.

Uso:
    python Ilatek/tools/map-images.py            # escribe docs/mapa-paginas-imagenes.md
    python Ilatek/tools/map-images.py --check    # solo reporta (no escribe)
"""
from __future__ import annotations

import importlib.util
import re
import sys
import unicodedata
from pathlib import Path
from site_paths import page_files, page_group

ROOT = Path(__file__).resolve().parents[1]
HOME = Path.home() / "Downloads"
SOCIAL_DIR = HOME / "Ilatek Images - Updated"
LIMP_DIR = HOME / "Ilatek - Services Images" / "Limpieza"
TECHOS_DIR = HOME / "Ilatek - Services Images" / "Techos"
DOC = ROOT / "docs" / "mapa-paginas-imagenes.md"

SKIP_DIRS = {".backups-uiux", ".git", "node_modules"}

# Páginas "hub": su portada es la de marca o la del hub (no hay foto de un
# servicio concreto) y su contenido son los sets de tarjetas que ya existen.
HUB_SLUGS = {"home", "servicios", "techos"}

# Palabras que no identifican un servicio al comparar títulos.
STOP = {
    "de", "del", "la", "las", "el", "los", "y", "e", "en", "por", "para",
    "con", "sin", "a", "al", "ilatek", "property", "solution", "servicio",
    "servicios", "techos", "limpieza",
}

# Carpeta de servicios por grupo de páginas.
GROUP_DIR = {"limpieza": LIMP_DIR, "techos": TECHOS_DIR}

# El hero y el contenido no pueden ser la misma foto: el par de contenido se
# toma siempre de la carpeta de servicios, nunca de la social.
CONTENT_SUFFIX = re.compile(r"\s*-\s*(\d+)\.jpg$", re.I)


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def load_social_map() -> dict[str, str]:
    """Reusa el emparejamiento social (dueño único) desde optimize-social.py."""
    spec = importlib.util.spec_from_file_location("opt", ROOT / "tools" / "optimize-social.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    return {**mod.TECHOS, **mod.LIMPIEZA}


def slug_of(path: Path) -> str:
    name = path.name
    if name == "ghl-home-multiservicios.html":
        return "home"
    if name == "ghl-servicios-landing.html":
        return "servicios"
    return name[len("ghl-") : -len("-landing.html")]


def canonical_map() -> dict[str, str]:
    """slug -> URL canónica, leída de los dos archivos de head SEO."""
    out: dict[str, str] = {}
    for rel in ("documentacion/seo/limpieza-head-original.html", "techos/ghl-techos-head-seo.html"):
        text = (ROOT / rel).read_text(encoding="utf-8")
        for m in re.finditer(
            r"<!-- ▼▼ /(?P<slug>[a-z0-9\-]+) ▼▼ -->(?P<body>.*?)<!-- ▲▲ fin /(?P=slug) ▲▲ -->",
            text,
            re.S,
        ):
            url = re.search(r'<link rel="canonical" href="([^"]+)"', m.group("body"))
            title = re.search(r"<title>(.*?)</title>", m.group("body"), re.S)
            out[m.group("slug")] = (
                url.group(1) if url else "",
                re.sub(r"\s+", " ", title.group(1)).strip() if title else "",
            )
    return out


def pages() -> list[dict[str, object]]:
    files = page_files()
    seen: set[Path] = set()
    out = []
    for f in files:
        if f in seen:
            continue
        seen.add(f)
        slug = slug_of(f)
        group = "techos" if page_group(f) == "techos" else "limpieza"
        out.append({"file": f, "rel": f.relative_to(ROOT).as_posix(), "slug": slug, "group": group})
    # los hubs al final, para que la tabla se lea por grupos
    out.sort(key=lambda r: (str(r["slug"]) in HUB_SLUGS, str(r["rel"])))
    return out


# Sinónimos singular/plural que no se resuelven solos al comparar títulos.
ALIAS = {"tragaluces": "tragaluz", "ventanas": "ventana", "goteras": "gotera"}


def words(s: str, drop_stop: bool = False) -> set[str]:
    ws = {ALIAS.get(w, w) for w in norm(s).split()}
    return {w for w in ws if w not in STOP} if drop_stop else ws


def is_own(slug: str, filename: str) -> bool:
    """¿La foto es de ESTE servicio (título exacto) o es una prestada?"""
    key = words(slug.replace("-", " "), drop_stop=True)
    return bool(key) and key <= words(Path(filename).stem)


def content_for(group: str, social_file: str) -> list[str]:
    """Pares `- 1/- 2` de la carpeta de servicios para ese servicio."""
    key = norm(Path(social_file).stem.replace("- Ilatek", ""))
    d = GROUP_DIR[group]
    if not d.is_dir():
        return []
    hits = []
    for f in sorted(d.glob("*.jpg")):
        name = norm(f.stem)
        # se exige que todas las palabras del servicio aparezcan en el nombre
        words = [w for w in key.split() if w not in {"ilatek", "property", "solution"}]
        if words and all(w in name for w in words):
            hits.append(f.name)
    return hits


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    dry = "--check" in sys.argv

    social = load_social_map()
    canon = canonical_map()
    # La portada puede vivir en la carpeta social, en la de techos o en Downloads
    # (el cover con QR del home).
    have_social = {f.name for f in SOCIAL_DIR.glob("*.jpg")} if SOCIAL_DIR.is_dir() else set()
    have_social |= {f.name for f in TECHOS_DIR.glob("*.jpg")} if TECHOS_DIR.is_dir() else set()
    have_social |= {f.name for f in HOME.glob("*.png")} if HOME.is_dir() else set()

    rows = []
    miss_hero: list[str] = []
    miss_content: list[str] = []
    miss_pair: list[str] = []

    for p in pages():
        slug = str(p["slug"])
        hero = social.get(slug, "")
        hero_ok = bool(hero) and hero in have_social
        content = content_for(str(p["group"]), hero) if hero else []
        nums = sorted(
            {int(m.group(1)) for m in (CONTENT_SUFFIX.search(c) for c in content) if m}
        )
        url = canon.get(slug, ("", ""))[0] or f"https://ilatekpr.com/{slug}"
        title = canon.get(slug, ("", ""))[1]

        hub = slug in HUB_SLUGS
        # Prestada = existe la foto, pero es de OTRO servicio (título distinto).
        borrowed = hero_ok and not hub and not is_own(slug, hero)
        content_own = [c for c in content if is_own(slug, c)]
        nums_own = sorted(
            {int(m.group(1)) for m in (CONTENT_SUFFIX.search(c) for c in content_own) if m}
        )
        if hub:
            pass  # los hub se reportan aparte
        elif not hero_ok or borrowed:
            miss_hero.append(f"{slug} — {p['rel']}" + (f" (hoy usa prestada: {hero})" if borrowed else ""))
        else:
            if not content_own:
                miss_content.append(f"{slug} — {p['rel']}")
            elif len(nums_own) < 2:
                miss_pair.append(f"{slug} — contenido propio: {nums_own or 'ninguno'} ({', '.join(content_own) or '—'})")

        rows.append(
            {
                "rel": p["rel"],
                "slug": slug,
                "url": url,
                "title": title,
                "hero": (
                    hero if (hero_ok and not borrowed)
                    else (f"{hero} ← PRESTADA" if borrowed else f"FALTA (usaba {hero or 'nada'})")
                ),
                "content": ", ".join(content) if content else "FALTA",
                "ok": (hub and hero_ok) or (not hub and hero_ok and not borrowed and len(nums_own) >= 2),
            }
        )

    lines = [
        "# Ilatek · mapa de páginas, /slug e imágenes",
        "",
        "Generado por `tools/map-images.py` (no se edita a mano).",
        "",
        "Convención: **hero** = la portada con el título exacto del servicio",
        "(`Ilatek Images - Updated`); **contenido** = el par `- 1` / `- 2` del mismo",
        "servicio en `Ilatek - Services Images/<Limpieza|Techos>` — así el contenido",
        "nunca repite la foto del hero.",
        "",
        "| # | Archivo | /slug | Título | Hero (portada) | Contenido | Estado |",
        "|---|---|---|---|---|---|---|",
    ]
    for i, r in enumerate(rows, 1):
        lines.append(
            f"| {i} | `{r['rel']}` | `{r['url']}` | {r['title'] or '—'} | "
            f"{r['hero']} | {r['content']} | {'✅' if r['ok'] else '⚠️'} |"
        )

    lines += [
        "",
        f"Total de páginas: **{len(rows)}** · listas (hero propio + par de contenido): "
        f"**{sum(1 for r in rows if r['ok'])}**.",
        "",
    ]
    if miss_hero:
        lines += ["## Sin portada (hero) con el título exacto", ""]
        lines += [f"- `{s}`" for s in miss_hero] + [""]
    if miss_content:
        lines += ["## Sin imágenes de contenido", ""]
        lines += [f"- `{s}`" for s in miss_content] + [""]
    if miss_pair:
        lines += ["## Con contenido incompleto (falta un par)", ""]
        lines += [f"- {s}" for s in miss_pair] + [""]

    if not dry:
        DOC.parent.mkdir(parents=True, exist_ok=True)
        DOC.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Páginas: {len(rows)} · con hero+contenido completos: {sum(1 for r in rows if r['ok'])}")
    print(f"\nSin portada exacta ({len(miss_hero)}):")
    for s in miss_hero:
        print(f"  - {s}")
    print(f"\nSin imágenes de contenido ({len(miss_content)}):")
    for s in miss_content:
        print(f"  - {s}")
    print(f"\nContenido incompleto ({len(miss_pair)}):")
    for s in miss_pair:
        print(f"  - {s}")
    if not dry:
        print(f"\n✓ {DOC.relative_to(ROOT).as_posix()}")
    return 1 if (miss_hero or miss_content) else 0


if __name__ == "__main__":
    raise SystemExit(main())
