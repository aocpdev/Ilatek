"""Puebla los titulares locales de las landings con el custom value del municipio.

Sustituye "Puerto Rico" literal por el token {{custom_values.business__county_name}}
SOLO en titulares que describen el servicio local (H1 de hero, H2 de seccion y
preguntas FAQ de precio) en los canonicos tokenizados de Ilatek y en
Ilatek/src/faq/faq-source.mjs (fuente unica de FAQ). Los titulares island-wide
(cobertura "78 municipios", "La favorita de Puerto Rico", "¿Atienden mi area...?")
se quedan genericos a proposito.

El runtime ya reemplaza el token en nodos de texto cuando el Paragraph puente
dv-ghl-values esta expandido; sin puente cae a "Puerto Rico" (nunca token crudo).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ILATEK = next(p for p in Path(__file__).resolve().parents if (p / ".git").exists())
ROOT = ILATEK.parent
TOKEN = "{{custom_values.business__county_name}}"

# Titulares local: literal exacto donde "Puerto Rico" ES el pueblo.
EXACT = [
    # H1 hero (terminan con "que" + <em> tras el pueblo)
    "Techos en Puerto Rico que",
    "Goteras en Puerto Rico que",
    # H2 ilt-extra-title
    "todo tipo de techo en Puerto Rico.",
    "huracán en los techos de Puerto Rico.",
    "un techo de zinc en Puerto Rico.",
    # FAQ local explicito
    "Ilatek Techos en Puerto Rico?",
    "el zinc en Puerto Rico?",
]
# FAQ de precio: prefijo + "en Puerto Rico?" => tokenizar el pueblo.
PRICE_Q = re.compile(r"(¿(?:Cuánto cuesta|Cuánto se cobra)[^<>{}]*?) en Puerto Rico\?")

FAQ_SOURCE = ILATEK / "src" / "faq" / "faq-source.mjs"

# H1 hero: TODO 'Puerto Rico' del titular es local (el h1 de un canónico es el
# titular del pueblo), incluido cuando el marcado lo parte ("en <em>Puerto Rico</em>").
# El token entra EN EL MISMO elemento interno donde vivía el texto, así el
# runtime lo resuelve sin romper el markup.
HERO_H1 = re.compile(r"(<h1\b[^>]*>)([\s\S]*?)(</h1>)", re.I)


def targets() -> list[Path]:
    files = [FAQ_SOURCE]
    for tier in ("categorias", "servicios"):
        files += sorted((ILATEK / tier).glob("*/es/landing-pages/ghl-*-landing.html"))
    files.append(ILATEK / "componentes" / "ghl-faq-embed.html")
    return files


def localize(text: str) -> tuple[str, int]:
    n = 0
    for s in EXACT:
        c = text.count(s)
        if c:
            text = text.replace(s, s.replace("Puerto Rico", TOKEN))
            n += c

    def sub(m: re.Match) -> str:
        nonlocal n
        n += 1
        return f"{m.group(1)} en {TOKEN}?"

    text = PRICE_Q.sub(sub, text)

    # Barrido del H1 hero (cubre formas partidas por <em>/<strong> y texto plano).
    def sub_h1(m: re.Match) -> str:
        nonlocal n
        c = m.group(2).count("Puerto Rico")
        if not c:
            return m.group(0)
        n += c
        return m.group(1) + m.group(2).replace("Puerto Rico", TOKEN) + m.group(3)

    text = HERO_H1.sub(sub_h1, text)
    return text, n


def main() -> int:
    changed: list[tuple[Path, int]] = []
    for f in targets():
        old = f.read_text(encoding="utf-8")
        new, n = localize(old)
        if n:
            f.write_text(new, encoding="utf-8")
            changed.append((f, n))
    total = sum(n for _, n in changed)
    for f, n in changed:
        print(f"  {n:2d} {f.relative_to(ROOT)}")
    print(f"TOTAL: {len(changed)} archivos, {total} titulares tokenificados")
    return 0


if __name__ == "__main__":
    sys.exit(main())
