# Reporte de control de calidad · Landings LUXURY

Fecha: 2026-10-21 · Verificación automática (`scripts/qc-pass.py`) sobre landings generadas.

- Archivos HTML verificados: **204**
- Comunidades LUXURY en la base: **68** → 204 archivos esperados
- Municipios con landings: 68
- Hallazgos: **0**

✅ Sin hallazgos: estructura, SEO, JSON-LD, dominios, contrato de URLs y cobertura OK.

### Pendientes manuales

- Quedan 8 registros sin evidencia verificada (UNVERIFIED/LOW) tras dos pasadas; no generan landing hasta una tercera verificación con fuente real.
- Publicación: subir `landings/<municipio>/<comunidad>/` a `comunidades.ilatekpr.com` de forma que `index.html` quede en `/<municipio>/<comunidad>` y los dos servicios en sus subrutas.
