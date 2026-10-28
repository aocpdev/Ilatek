#!/usr/bin/env python3
"""Inventario por seccion de ghl-home-multiservicios.html.

Clasifica cada aparicion de 'Puerto Rico' y de tokens de ubicacion/telefono
por seccion, y localiza los resolvers client-side de cada seccion.
"""
import re
from pathlib import Path

SRC = Path("Ilatek/home/es/landing-pages/ghl-home-multiservicios.html")
lines = SRC.read_text(encoding="utf-8").splitlines()

SECTIONS = [
    (1, 306, "NAV + runtime compartido (ILATEK:INTERNAL-LINKS)"),
    (307, 375, "CABECERA + comentarios de estructura"),
    (351, 375, "HEAD SEO /home (meta tags en el markup)"),
    (376, 673, "NAV #ilatek-nav"),
    (674, 997, "Motor i18n es/en"),
    (998, 1146, "SHELL + hero wrapper"),
    (1147, 1180, "1. HERO Soluciones propiedad"),
    (1181, 1427, "1b. VIDEO compania multiservicios"),
    (1428, 1757, "2. CARRUSEL 3D TECHOS (ilt3)"),
    (1758, 1776, "3. AIRBNB & TURNOVER"),
    (1777, 1960, "4. CARRUSEL 3D LIMPIEZA (mini)"),
    (1961, 1987, "5. PROCESO 3 pasos"),
    (1988, 2197, "6. MARQUEE 10 servicios"),
    (2198, 2382, "7. COBERTURA 78 municipios (icd)"),
    (2383, 2478, "8. RESENAS 3 pestanas"),
    (2479, 2573, "9. FAQ 10 preguntas"),
    (2574, 2707, "10. CONOCENOS fundadores"),
    (2708, 2792, "11. CTA FINAL dual calendarios"),
    (2793, 3171, "FOOTER SHELL (ILATEK:SHELL:FOOTER)"),
]

# resolvers: ILATEK_LINKS.replace usage lines (client-side token replacement)
resolver_lines = []
for i, ln in enumerate(lines, 1):
    if "ILATEK_LINKS.replace(" in ln and ("node" in ln or "attributes" in ln or "el.setAttribute" in ln):
        resolver_lines.append(i)

PR = re.compile(r"Puerto Rico")
TOK = re.compile(r"\{\{custom_values\.([a-z_]+)\}\}")

def which(i):
    for a, b, name in SECTIONS:
        if a <= i <= b:
            return name
    return "?"

print("== RESOLVERS client-side en lineas:", resolver_lines)

print("\n== 'Puerto Rico' (hardcode) por linea/contexto:")
for i, ln in enumerate(lines, 1):
    for m in PR.finditer(ln):
        s = max(0, m.start() - 60)
        print(f"{which(i):45s} L{i}: ...{ln[s:m.end()+60]}")
        break  # una corrida por linea para no llenar

print("\n== tokens por seccion:")
counts = {}
for i, ln in enumerate(lines, 1):
    sec = which(i)
    for m in TOK.finditer(ln):
        counts.setdefault(sec, {}).setdefault(m.group(1), 0)
        counts[sec][m.group(1)] += 1
for sec, d in counts.items():
    has_resolver = any(a <= 1 for a, b, n in SECTIONS if n == sec)  # placeholder
    print(f"\n{sec}")
    for k, v in sorted(d.items(), key=lambda x: -x[1]):
        print(f"    {k:25s} {v:4d}")
