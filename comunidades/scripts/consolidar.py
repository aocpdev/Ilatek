#!/usr/bin/env python3
"""Consolida Ilatek/comunidades/research/<region>/<municipio>.json en la base maestra.
Campos por registro (Fase 3 del Master Prompt):
municipality, municipalitySlug, name, slug, alternates, priority, type, evidence,
sources, dateVerified, confidence, relevantServices, existingLanding, landingStatus.
El estado de landing se deriva del disco: hay HTML generado -> NEW, comunidad
verificada sin generacion -> PENDING, sin evidencia verificable -> NOT APPLICABLE.
Orden: municipio A-Z, prioridad LUXURY > HIGH > MEDIUM > UNVERIFIED.
"""
import csv, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANDINGS = ROOT / "landings"
PORDER = {"LUXURY": 0, "HIGH": 1, "MEDIUM": 2, "UNVERIFIED": 3}
FIELDS = ["municipality", "municipalitySlug", "name", "slug", "alternates", "priority",
          "type", "evidence", "sources", "dateVerified", "confidence", "relevantServices",
          "existingLanding", "landingStatus", "landingUrl"]
SERVICIOS = "sellado-de-techos; limpieza"
# Las landings se publican como HTML estatico en el subdominio propio.
COMMUNITY_SITE = "https://comunidades.ilatekpr.com"


def landing_paths(mslug, slug):
    """Rutas relativas de las landings ya generadas para esa comunidad."""
    d = LANDINGS / mslug / slug
    if not d.is_dir():
        return []
    return sorted(f"landings/{mslug}/{slug}/{p.name}" for p in d.glob("*.html"))


def landing_status(rec, paths):
    """NEW = landing generada; PENDING = verificada y candidata; NOT APPLICABLE = sin evidencia."""
    if rec["priority"] == "UNVERIFIED" or rec.get("confidence") == "LOW":
        return "NOT APPLICABLE"
    return "NEW" if paths else "PENDING"

def main():
    rows = []
    files = sorted((ROOT / "research").glob("*/*.json"))
    if not files:
        sys.exit("No hay archivos de research todavía.")
    for f in files:
        d = json.loads(f.read_text(encoding="utf-8"))
        for c in d.get("communities", []):
            paths = landing_paths(d["municipalitySlug"], c["slug"])
            verificada = c["priority"] != "UNVERIFIED" and c.get("confidence") != "LOW"
            rows.append({
                "municipality": d["municipality"],
                "municipalitySlug": d["municipalitySlug"],
                "name": c["name"],
                "slug": c["slug"],
                "alternates": "; ".join(c.get("alternates", [])),
                "priority": c["priority"],
                "type": c["type"],
                "evidence": c["evidence"],
                "sources": "; ".join(c.get("sources", [])),
                "dateVerified": d["dateVerified"],
                "confidence": c.get("confidence", "MEDIUM"),
                "relevantServices": SERVICIOS if verificada else "",
                "existingLanding": "; ".join(paths) if paths else "NO",
                "landingStatus": landing_status(c, paths),
                "landingUrl": f"{COMMUNITY_SITE}/{d['municipalitySlug']}/{c['slug']}" if paths else "",
            })
    rows.sort(key=lambda r: (r["municipality"], PORDER.get(r["priority"], 9), r["name"]))

    out_json = ROOT / "master-database.json"
    out_json.write_text(json.dumps({
        "version": 1,
        "generatedAt": max(r["dateVerified"] for r in rows),
        "totalCommunities": len(rows),
        "municipalitiesCovered": len({r["municipality"] for r in rows}),
        "byPriority": {p: sum(1 for r in rows if r["priority"] == p)
                       for p in ("LUXURY", "HIGH", "MEDIUM", "UNVERIFIED")},
        "records": rows,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    out_csv = ROOT / "master-database.csv"
    with out_csv.open("w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)

    # Reporte de cobertura por municipio
    cov = {}
    for r in rows:
        s = cov.setdefault(r["municipality"], {"total": 0, "byPriority": {}})
        s["total"] += 1
        s["byPriority"][r["priority"]] = s["byPriority"].get(r["priority"], 0) + 1
    lines = ["# Reporte de cobertura · Master Prompt comunidades PR",
             "",
             "Última consolidación: " + max(r["dateVerified"] for r in rows),
             "",
             f"Registros totales: **{len(rows)}** · Municipios cubiertos: **{len(cov)}** / 78",
             "",
             "| Municipio | Registros | LUXURY | HIGH | MEDIUM | UNVERIFIED |",
             "|---|---|---|---|---|---|"]
    for m in sorted(cov):
        s = cov[m]
        p = s["byPriority"]
        lines.append(f"| {m} | {s['total']} | {p.get('LUXURY',0)} | {p.get('HIGH',0)} | "
                     f"{p.get('MEDIUM',0)} | {p.get('UNVERIFIED',0)} |")
    restante = 78 - len(cov)
    estados = {}
    for r in rows:
        estados[r["landingStatus"]] = estados.get(r["landingStatus"], 0) + 1
    lines += ["", f"Pendientes de investigación: **{restante}** municipios."]
    if restante:
        lines += [f"  (continuar con las tandas pendientes según `progress.md`)"]
    lines += ["", "## Estado de landings por registro", "",
              "| Estado | Registros |", "|---|---|"]
    for k in ("NEW", "PENDING", "NOT APPLICABLE"):
        lines.append(f"| {k} | {estados.get(k, 0)} |")
    lines += ["", "## Gaps conocidos", "",
              f"- Registros UNVERIFIED/LOW: {estados.get('NOT APPLICABLE', 0)} candidatos que requieren "
              "una nueva pasada de verificación",
              "  antes de considerar landings (Fase 5). No se generan páginas con datos sin verificar."]
    (ROOT / "cobertura-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"OK: {len(rows)} registros, {len(cov)} municipios -> master-database.json/csv + cobertura-report.md")

if __name__ == "__main__":
    main()
