# Comunidades de Puerto Rico · índice para el Master Prompt

Proyecto: mapa del home dividido en **regiones → municipios → comunidades**, con
landings por comunidad en el subdominio propio
`https://comunidades.ilatekpr.com/<municipio>/<comunidad>`.
Fuente de instrucciones: Master Prompt "Puerto Rico Exhaustive Community Research &
Landing Page Generation" (en `C:\Users\Omele\Downloads\research comunidades ilatekpr.txt`).

## Archivos

| Archivo | Contenido |
|---|---|
| `regiones.json` | Las regiones de PR con sus 78 municipios asignados (uno solo por municipio). |
| `progress.md` | Ledger de progreso: municipios investigados, pendientes y verificación. |
| `master-database.json` | Base maestra de comunidades (14 campos por registro, según Fase 3). |
| `master-database.csv` | La misma base en CSV para hoja de cálculo. |
| `cobertura-report.md` | Reporte de cobertura: municipios completos, gaps y verificación pendiente. |
| `landing-inventory.md` | Inventario de landings: NEW / PENDING / NOT APPLICABLE. |
| `roadmap.md` | Roadmap por tiers: LUXURY → HIGH → MEDIUM con prioridades. |
| `qc-report.md` | Control de calidad final: exactitud, SEO, duplicados, enlaces y claims. |
| `qc-fuentes.txt` | Verificación por HTTP de todas las URLs de evidencia de la base. |
| `data/mapa-comunidades.json` | Datos del mapa: regiones → municipios → comunidades publicadas, con URL y coordenadas. |
| `data/_coordenadas-wikipedia.json` | Infobox cruda de los 78 municipios: origen de los puntos de municipio. |
| `data/_coordenadas-municipios.json` | Punto de los 78 municipios (coordenadas de la infobox de Wikipedia). |
| `data/_coordenadas-comunidades.json` | Punto de las comunidades LUXURY (OpenStreetMap vía Photon) y su precisión. |
| `data/_sin-coincidencia.json` | Comunidades LUXURY sin punto OSM exacto: el mapa las lista dentro de su municipio. |

## Reglas del Master Prompt que hay que respetar

1. Investigación exhaustiva de los 78 municipios, no solo los famosos.
2. Clasificar cada comunidad como MEDIUM / HIGH / LUXURY con evidencia y fuente;
   UNVERIFIED cuando falte evidencia — no se inventa.
3. Registro por comunidad con 12 campos (municipio, nombres alternos, prioridad,
   tipo, evidencia, URLs de fuentes, fecha de verificación, confianza, servicios
   relevantes, landing existente, estado de landing).
4. No inventar nombres, URLs de fuentes, valores de propiedad ni estadísticas.
5. Distinguir propiedad-mercado de ingresos-demográficos.
6. Deduplicar sin mezclar barrios distintos que comparten nombre.
7. Registrar el gap de investigación con transparencia.
8. Landings solo cuando la comunidad es verificable, el servicio es relevante y la
   página aportaría información local genuina.
9. Jerarquía por defecto: Municipio → Comunidad → Servicio. Para este proyecto queda
   fija como `<municipio>/<comunidad>` **dentro del subdominio `comunidades.ilatekpr.com`**:
   la URL canónica de la comunidad es la de su página, y sus dos páginas de
   servicio cuelgan de ella (`/<municipio>/<comunidad>/sellado-de-techos` y
   `.../limpieza`).
10. El subdominio se publica como **HTML estático**: ahí no hay GHL que resuelva
    tokens, así que las landings de comunidad **no llevan** `{{custom_values.*}}`
    ni `data-ilatek-path`; su URL es literal y los enlaces a servicios y
    formularios usan la URL absoluta del dominio principal (`https://ilatekpr.com`),
    que es otro host. Las páginas del sitio principal siguen con el contrato de
    tokens de GHL (`tools/internal-link-contract.mjs`).
11. No publicar, desplegar, borrar ni sobrescribir assets de producción sin autorización.
12. Separar investigación de generación de contenido: datos sin verificar no llegan a
    páginas publicadas.

## Mapa (MapLibre GL + OpenFreeMap, sin credenciales)

- Los mapas usan **MapLibre GL 4.7.1** (misma API que Mapbox GL) sobre los mosaicos de
  **OpenFreeMap** (`https://tiles.openfreemap.org/styles/positron`). El SDK y el CSS se
  cargan por CDN con SRI `sha384`, y el bloque se inicializa con `IntersectionObserver`
  para no bloquear el LCP.
- **Cero credenciales en el cliente.** El token público de Mapbox (`pk.eyJ1IjoiaWxhdGVrcHIi…`)
  que usaba este proyecto está **revocado** (401 en todos los orígenes) y ya **no está en el
  repo**: ningún mapa puede depender de un secreto incrustado en la página.
- Fallback aceptable: lista por regiones/comunidades en HTML si el SDK o los mosaicos fallan.
- El **mapa de comunidades** (`scripts/inyectar-mapa-home.mjs`) es la versión que vive en el
  Home: marcadores de los 78 municipios con popup y las comunidades publicadas, más una
  lista HTML de comunidades que siempre se ve (rastreadores y sin JS).
- `mapa/mapa-regiones.html` es el componente de regiones y municipios (los seis puntos con
  popup "Ver municipios"): mismo stack, ya sin token.
- El popup de un pin de comunidad muestra **solo los dos enlaces de servicio**
  (*Sellado de techos* y *Limpieza*). El enlace directo a la página de la comunidad queda en
  la lista HTML de la sección, que siempre está visible.

## Publicación en el subdominio

- Las landings de comunidad se publican como **HTML estático** en
  `https://comunidades.ilatekpr.com/<municipio>/<comunidad>/`, de forma que
  `index.html` quede en `/<municipio>/<comunidad>` y sus dos páginas de servicio en
  `/<municipio>/<comunidad>/sellado-de-techos` y `/<municipio>/<comunidad>/limpieza`.
- Ese host es otro dominio: por eso las landings **no** llevan `{{custom_values.*}}` ni
  `data-ilatek-path` y enlazan al dominio principal con URL absoluta
  (`https://ilatekpr.com`). El contrato de tokens de GHL
  (`tools/internal-link-contract.mjs`) solo aplica a las páginas del sitio principal.
- **Pendiente de autorización**: subir `landings/<municipio>/<comunidad>/` al subdominio.
  Hasta entonces la sección del mapa del Home ya apunta a esas rutas.

## Pipeline de coordenadas

Las coordenadas nunca se inventan: cada punto viene de una fuente consultable y queda
registrado con su precisión.

1. `scripts/geocodificar-nominatim.py` — punto de los 78 municipios desde la infobox de
   Wikipedia → `data/_coordenadas-municipios.json`.
2. `scripts/coincidir-comunidades-osm.py` — cruza las comunidades LUXURY con los nodos
   `place=*` de OpenStreetMap vía Overpass y exige que el punto caiga **dentro** del
   polígono del municipio (ray casting sobre la geometría oficial). Sin coincidencia
   exacta la comunidad **no** tiene punto propio y el mapa la lista dentro de su municipio
   → `data/_coordenadas-comunidades.json` (+ `_sin-coincidencia.json` con las que no
   entraron).
3. `node scripts/generar-mapa-comunidades.mjs` — une regiones → municipios → comunidades
   publicadas con URL y coordenadas → `data/mapa-comunidades.json`.
4. `node scripts/inyectar-mapa-home.mjs` — renderiza la sección del mapa y la inyecta en
   `home/es/landing-pages/ghl-home-multiservicios.html` entre los marcadores
   `ILATEK:MAPA-COMUNIDADES:START/END` (volver a ejecutarlo reemplaza, no duplica).

Los volcados crudos de Overpass (`data/_municipios-osm.json`, `data/_osm-lugares-pr.json`)
y la caché de Nominatim son **intermedios regenerables**: no se versionan.

## Pipeline

```bash
node scripts/generar-landings-luxury.mjs   # 3 HTML por comunidad LUXURY (hub + 2 servicios)
python scripts/consolidar.py                 # research/<region>/*.json -> base maestra + cobertura
python scripts/qc-pass.py                    # QC de los HTML + inventory/roadmap/qc-report
python scripts/geocodificar-nominatim.py     # punto de los 78 municipios (Wikipedia)
python scripts/coincidir-comunidades-osm.py  # punto de las comunidades LUXURY (OSM, exacto)
node scripts/generar-mapa-comunidades.mjs   # data/mapa-comunidades.json
node scripts/inyectar-mapa-home.mjs         # inyecta la sección del mapa en el Home
python scripts/verificar-fuentes.py research/metro research/norte research/este \
       research/sur research/oeste research/central   # comprueba que las fuentes respondan
```

`scripts/importar-lote.py` importa un lote crudo de agentes
(`research/<region>/_raw-<region>.txt`) validando que cada comunidad tenga
fuentes http reales. `scripts/aplicar-verificacion.py` aplica una segunda pasada
de verificación sobre los registros UNVERIFIED/LOW.

## Estado actual

- [x] regiones.json
- [x] progress.md
- [x] master-database.json / .csv — **564 registros, 78/78 municipios**
- [x] cobertura-report.md
- [x] landing-inventory.md
- [x] roadmap.md
- [x] qc-report.md — 204 archivos, 0 hallazgos
- [x] mapa/mapa-regiones.html — verificado en navegador con MapLibre + OpenFreeMap (sin token)
- [x] landings de comunidad en el subdominio propio (204 HTML: hub + 2 servicios × 68 comunidades)
- [x] data/mapa-comunidades.json + sección del mapa de comunidades integrada en el Home
- [x] token revocado de Mapbox fuera del repo (migración a MapLibre + OpenFreeMap)

Pendiente de autorización: publicar el subdominio `comunidades.ilatekpr.com` (subir
`landings/<municipio>/<comunidad>/` de forma que `index.html` quede en
`/<municipio>/<comunidad>`) y generar el tier HIGH.
