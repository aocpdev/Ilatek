#!/usr/bin/env python3
"""Extrae y valida los JSON crudos de una tanda (agentes) -> research/<region>/<slug>.json

Uso: python scripts/importar-lote.py research/<region>/_raw-<region>.txt"""
import json, pathlib, sys

RAW = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "research/sur/_raw-sur.txt")
OUT = RAW.parent

text = RAW.read_text(encoding="utf-8")
DEC = json.JSONDecoder()

REQUIRED = {"name", "slug", "priority", "type", "evidence", "sources"}
PRIORITY = {"LUXURY", "HIGH", "MEDIUM"}
CONF = {"HIGH", "MEDIUM", "LOW"}

objs, i, failures = [], 0, []
while i < len(text):
    if text[i] in " \t\r\n":
        i += 1
        continue
    try:
        obj, end = DEC.raw_decode(text, i)
    except json.JSONDecodeError as e:
        # busca la próxima llave tras el error para no estancarse
        nxt = text.find("{", i + 1)
        if nxt == -1:
            break
        i = nxt
        failures.append(f"bloque inválido en offset {i}: {e}")
        continue
    objs.append(obj)
    i = end

count = 0
for obj in objs:
    mun = obj.get("municipality")
    slug = obj.get("municipalitySlug")
    if not mun or not slug or "communities" not in obj:
        failures.append(f"objeto sin municipality/communities: {str(obj)[:80]}")
        continue
    ok_comms = []
    for c in obj["communities"]:
        missing = REQUIRED - set(c)
        if missing:
            failures.append(f"{mun}/{c.get('name')}: faltan {sorted(missing)}")
            continue
        if c["priority"] not in PRIORITY:
            c["priority"] = "MEDIUM"
            failures.append(f"{mun}/{c['name']}: prioridad ajustada a MEDIUM")
        if c.get("confidence") not in CONF:
            c["confidence"] = "MEDIUM"
        srcs = [s for s in c["sources"] if isinstance(s, str) and s.startswith("http")]
        if not srcs:
            failures.append(f"{mun}/{c['name']}: sin fuente http, se descarta (no se inventa)")
            continue
        c["sources"] = srcs
        ok_comms.append(c)
    if not ok_comms:
        failures.append(f"{mun}: ninguna comunidad sobrevivió la validación")
        continue
    obj["communities"] = ok_comms
    obj.setdefault("dateVerified", "2026-10-21")
    path = OUT / f"{slug}.json"
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    count += 1
    print(f"  {slug}.json: {len(ok_comms)} comunidades")

print(f"\nEscritos: {count} municipios en {OUT}")
if failures:
    print("Nota de validación:")
    for f in failures:
        print("  -", f)
