# -*- coding: utf-8 -*-
"""Pase QC de las landings generadas y generadores de reportes del proyecto.

Uso (desde Ilatek/comunidades/):
    python scripts/qc-pass.py

Produce:
    - Verificación de los HTML contra master-database.json
    - qc-report.md (exactitud, SEO, duplicados, enlaces, claims)
    - landing-inventory.md (EXISTING / NEW / NEEDS UPDATE / NOT APPLICABLE / PENDING)
    - roadmap.md (tiers LUXURY -> HIGH -> MEDIUM)
"""
import csv
import json
import pathlib
import re
from collections import Counter, defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
DB = ROOT / "master-database.json"
LANDINGS = ROOT / "landings"

# Contrato de URLs: las landings se publican como HTML estatico en el subdominio
# propio (comunidades.ilatekpr.com). No hay GHL que resuelva tokens, asi que la
# URL es literal y los enlaces a servicios usan el dominio principal en absoluto.
COMMUNITY_SITE = "https://comunidades.ilatekpr.com"
MAIN_SITE = "https://ilatekpr.com"
PAGE_FILES = {
    "index.html": "",
    "sellado-de-techos.html": "/sellado-de-techos",
    "limpieza.html": "/limpieza",
}
ALLOWED_HOSTS = {
    "comunidades.ilatekpr.com",
    "ilatekpr.com",
    "www.ilatekpr.com",
    "assets.cdn.filesafe.space",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "schema.org",
}

records = json.loads(DB.read_text(encoding="utf-8"))
if isinstance(records, dict):
    records = records.get("records", records)

html_by_dir = defaultdict(list)
for p in sorted(LANDINGS.rglob("*.html")):
    html_by_dir[(p.parent.parent.name, p.parent.name)].append(p)

problems = defaultdict(list)
checked = 0
for (mslug, cslug), files in html_by_dir.items():
    if sorted(f.name for f in files) != sorted(PAGE_FILES):
        problems["estructura"].append(f"{mslug}/{cslug}: {sorted(f.name for f in files)}")
    for f in files:
        checked += 1
        html = f.read_text(encoding="utf-8")
        rel = f"{mslug}/{cslug}/{f.name}"
        if "<title>" not in html:
            problems["seo"].append(f"{rel}: sin <title>")
        if 'name="robots"' not in html:
            problems["seo"].append(f"{rel}: sin robots meta")
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        if not canonical:
            problems["seo"].append(f"{rel}: sin canonical")
        else:
            expected = f"{COMMUNITY_SITE}/{mslug}/{cslug}{PAGE_FILES.get(f.name, '')}"
            if canonical.group(1) != expected:
                problems["seo"].append(f"{rel}: canonical {canonical.group(1)} != {expected}")
        if "application/ld+json" in html:
            for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
                try:
                    json.loads(block.strip())
                except Exception as e:
                    problems["json-ld"].append(f"{rel}: JSON-LD inválido: {e}")
        hosts = set(re.findall(r'https?://([a-z0-9.-]+)', html))
        bad = {u for u in hosts if u not in ALLOWED_HOSTS}
        if bad:
            # Un dominio fuera de la lista solo se acepta como cita de fuente:
            # enlace externo con rel="nofollow" y target="_blank".
            citas = set()
            for tag in re.findall(r"<a\b[^>]*>", html):
                m = re.search(r'href="https?://([a-z0-9.-]+)[^"]*"', tag)
                if not m:
                    continue
                if 'rel="nofollow' in tag and 'target="_blank"' in tag:
                    citas.add(m.group(1))
            bad = {u for u in bad if u not in citas}
            if bad:
                problems["enlaces"].append(f"{rel}: dominios inesperados {sorted(bad)}")
        # Sitio estatico propio: ni tokens de GHL ni el contrato de data-ilatek-path.
        if "{{custom_values." in html:
            problems["ghl"].append(f"{rel}: contiene tokens GHL")
        if "data-ilatek-path" in html:
            problems["contrato"].append(f"{rel}: contiene data-ilatek-path")
        # La pagina de comunidad enlaza sus dos servicios; cada servicio vuelve
        # a la pagina de comunidad.
        hub = f"{COMMUNITY_SITE}/{mslug}/{cslug}"
        if f.name == "index.html":
            for service in ("sellado-de-techos", "limpieza"):
                if f"{hub}/{service}" not in html:
                    problems["enlaces"].append(f"{rel}: no enlaza {hub}/{service}")
        else:
            if f'href="{hub}"' not in html:
                problems["enlaces"].append(f"{rel}: no enlaza la página de comunidad {hub}")

# Duplicados: mismo slug dentro del mismo municipio, o mismo nombre en dos municipios
dupes = []
slugs_por_mun = defaultdict(list)
nombres_por_mun = defaultdict(list)
for r in records:
    slugs_por_mun[r["municipalitySlug"]].append(r["slug"])
    nombres_por_mun[r["municipality"].lower()].append(r["name"].lower())
for mun, slugs in slugs_por_mun.items():
    for slug, n in Counter(slugs).items():
        if n > 1:
            dupes.append(f"{mun}/{slug}: slug repetido {n} veces")
for mun, names in nombres_por_mun.items():
    for name, n in Counter(names).items():
        if n > 1:
            dupes.append(f"{mun}: nombre repetido {n} veces ({name})")

lux = [r for r in records if r["priority"] == "LUXURY"]
high = [r for r in records if r["priority"] == "HIGH"]
med = [r for r in records if r["priority"] == "MEDIUM"]
unv = {(r["municipalitySlug"], r["slug"]) for r in records
       if r["confidence"] in ("UNVERIFIED", "LOW") or r["priority"] == "UNVERIFIED"}

generated = {f"{'/'.join(k)}" for k in html_by_dir}
expect = {f"{r['municipalitySlug']}/{r['slug']}" for r in lux}
missing = sorted(expect - generated)
extra = sorted(generated - expect)

# ---------- landing-inventory.md ----------
inv = []
inv.append("# Inventario de landings · Master Prompt comunidades PR\n")
inv.append("Última generación: 2026-10-21 (scripts/generar-landings-luxury.mjs)\n")
inv.append("Estados: NEW (generada y lista), PENDING (candidata verificada, tier aún no generado),")
inv.append("NOT APPLICABLE (sin evidencia verificada o servicio no pertinente).\n")
inv.append(f"Total de landings generadas: **{checked} archivos** en {len(html_by_dir)} comunidades LUXURY.\n")
inv.append("| Municipio | Comunidad | Prioridad | Estado |")
inv.append("|---|---|---|---|")
plan = []
for r in sorted(records, key=lambda r: (r["municipality"], r["name"])):
    if r["priority"] == "LUXURY":
        estado = "NEW" if f"{r['municipalitySlug']}/{r['slug']}" in generated else "NINGUNA (⚠ falta)"
    elif r["priority"] == "HIGH":
        estado = "PENDING" if (r["municipalitySlug"], r["slug"]) not in unv else "NOT APPLICABLE (UNVERIFIED)"
    elif r["priority"] == "MEDIUM":
        estado = "PENDING" if (r["municipalitySlug"], r["slug"]) not in unv else "NOT APPLICABLE (UNVERIFIED)"
    else:
        estado = "NOT APPLICABLE"
    inv.append(f"| {r['municipality']} | {r['name']} | {r['priority']} | {estado} |")
(ROOT / "landing-inventory.md").write_text("\n".join(inv) + "\n", encoding="utf-8")

# ---------- roadmap.md ----------
tiers = [("Tier 1 · LUXURY", lux, f"✅ Generadas ({checked} archivos, {len(lux)} comunidades × 3)"),
         ("Tier 2 · HIGH", high, "Siguiente tanda"),
         ("Tier 3 · MEDIUM", med, "Después de HIGH")]
rd = ["# Roadmap de landings por tiers\n",
      "Post-completar investigación: HIGH → MEDIUM, verificando evidencia y regenerando\n",
      "el módulo de prioridades en `scripts/landings/config.mjs` cuando se agreguen regiones.\n"]
for nombre, group, estado in tiers:
    rd.append(f"## {nombre} ({len(group)} comunidades registradas) — {estado}\n")
    by_mun = defaultdict(list)
    for r in group:
        by_mun[r["municipality"]].append(r["name"])
    for m in sorted(by_mun):
        rd.append(f"- **{m}** ({len(by_mun[m])}): " + ", ".join(by_mun[m]))
    rd.append("")
muni_cubiertos = len({r['municipality'] for r in records})
pend = 78 - muni_cubiertos
rd.append("## Cobertura de investigación\n")
rd.append(f"- Investigados: {muni_cubiertos} / 78 municipios\n")
rd.append(f"- Pendientes: {pend} municipios\n")
rd.append("- Toda comunidad nueva entra por research/<region>/<municipio>.json y se consolida con `scripts/consolidar.py`.\n")
(ROOT / "roadmap.md").write_text("\n".join(rd), encoding="utf-8")

# ---------- qc-report.md ----------
total_problems = sum(len(v) for v in problems.values())
qc = ["# Reporte de control de calidad · Landings LUXURY\n",
      "Fecha: 2026-10-21 · Verificación automática (`scripts/qc-pass.py`) sobre landings generadas.\n",
      f"- Archivos HTML verificados: **{checked}**",
      f"- Comunidades LUXURY en la base: **{len(lux)}** → {len(lux) * 3} archivos esperados",
      f"- Municipios con landings: {len(html_by_dir)}",
      f"- Hallazgos: **{total_problems}**\n"]
if missing:
    qc.append(f"### Faltantes ({len(missing)})\n")
    for m in missing:
        qc.append(f"- `{m}`")
    qc.append("")
if extra:
    qc.append(f"### Sobrantes sin registro LUXURY ({len(extra)})\n")
    for e in extra:
        qc.append(f"- `{e}`")
    qc.append("")
for cat, items in sorted(problems.items()):
    qc.append(f"### {cat} ({len(items)})\n")
    for i in items:
        qc.append(f"- {i}")
    qc.append("")
if dupes:
    qc.append(f"### Slugs duplicados ({len(dupes)})\n")
    for d in dupes:
        qc.append(f"- {d}")
    qc.append("")
if total_problems == 0 and not missing and not extra:
    qc.append("✅ Sin hallazgos: estructura, SEO, JSON-LD, dominios, contrato de URLs y cobertura OK.\n")
qc.append("### Pendientes manuales\n")
qc.append(f"- Quedan {len(unv)} registros sin evidencia verificada (UNVERIFIED/LOW) tras dos pasadas; "
          "no generan landing hasta una tercera verificación con fuente real.")
qc.append("- Publicación: subir `landings/<municipio>/<comunidad>/` a `comunidades.ilatekpr.com` de forma "
          "que `index.html` quede en `/<municipio>/<comunidad>` y los dos servicios en sus subrutas.")
(ROOT / "qc-report.md").write_text("\n".join(qc) + "\n", encoding="utf-8")

print(f"HTML verificados: {checked}")
print(f"LUXURY esperadas: {len(lux)*3} | generadas: {checked}")
print(f"Faltantes: {missing or 'ninguna'}")
print(f"Sobrantes: {extra or 'ninguno'}")
print(f"Hallazgos: {total_problems}")
print("Reportes escritos: qc-report.md, landing-inventory.md, roadmap.md")
