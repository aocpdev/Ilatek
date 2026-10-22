#!/usr/bin/env python3
"""Aplica la segunda pasada de verificación a research/<region>/<municipio>.json.

Uso: python scripts/aplicar-verificacion.py research/_raw-verificacion2.txt
Empareja por municipality + name; actualiza evidence, sources, priority, confidence.
"""
import json, pathlib, sys

REGIONES = ["metro", "norte", "este", "sur", "oeste", "central"]

RAW = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "research/_raw-verificacion2.txt")
DEC = json.JSONDecoder()

objs = []
text = RAW.read_text(encoding="utf-8")
i = 0
while i < len(text):
    if text[i] in " \t\r\n":
        i += 1; continue
    obj, end = DEC.raw_decode(text, i)
    objs.append(obj); i = end

updates = {o["municipality"]: {c["name"]: c for c in o.get("communities", [])} for o in objs}

changed, notfound = 0, []
for region in REGIONES:
    rdir = pathlib.Path("research") / region
    if not rdir.exists():
        continue
    for f in sorted(rdir.glob("*.json")):
        if f.name.startswith("_raw"):
            continue
        d = json.loads(f.read_text(encoding="utf-8"))
        mun_updates = updates.get(d["municipality"])
        if not mun_updates:
            continue
        modified = False
        for c in d.get("communities", []):
            u = mun_updates.get(c["name"])
            if not u:
                continue
            if c["confidence"] in ("UNVERIFIED", "LOW"):
                c["confidence"] = u.get("confidence", "MEDIUM")
                c["evidence"] = u["evidence"]
                c["sources"] = u["sources"]
                if u.get("priority"):
                    c["priority"] = u["priority"]
                if u.get("type"):
                    c["type"] = u["type"]
                changed += 1
                modified = True
        if modified:
            f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        # nombres solicitados que no estaban en el archivo
        present = {c["name"] for c in d.get("communities", [])}
        for name in mun_updates:
            if name not in present:
                notfound.append(f"{d['municipality']}: {name}")

print(f"Registros verificados y actualizados: {changed}")
if notfound:
    print("Solicitados pero no encontrados en research/:")
    for n in notfound:
        print("  -", n)
