# Ledger de progreso · Master Prompt comunidades PR

Última actualización: 2026-10-22 (sesión 7)

## Estado

- **Investigación COMPLETA: 78/78 municipios, 564 comunidades verificadas.**
- Pipeline reproducible: `node scripts/generar-landings-luxury.mjs` →
  `python scripts/consolidar.py` → `python scripts/qc-pass.py`.
- Verificación de fuentes: `python scripts/verificar-fuentes.py research/<region>` (HTTP real).

## Estado

- Scaffold creado: `README.md`, `regiones.json` (6 regiones, 78 municipios).
- Base consolidada: `master-database.json` / `master-database.csv` — **268 registros**,
  **23 municipios** investigados (Metro completo 13/13 + Norte 10/12).
- Consolidación automatizada con `scripts/consolidar.py` (también genera `cobertura-report.md`).
- Sesión 2 (2026-10-21): tanda Este investigada en 12 de 14 municipios (88 registros). Culebra y Vieques quedan pendientes: el límite de investigación se alcanzó antes de lanzar sus agentes.
- Base actual: **366 registros**, **37 municipios** (Metro 13, Norte 12, Este 12 municipios con 88 registros). Consolidada con `scripts/consolidar.py` desde `research/<region>/`.
- Tandas planificadas (una región por tanda, agentes paralelos max 6):
  1. Metro (13) — ✅ completa
  2. Norte (12) — ⚠️ 10/12 (faltan Utuado y Florida)
  3. Este (14) — pendiente
  4. Sur (12) — pendiente
  5. Oeste (14) — pendiente
  6. Central (13) — pendiente
- ⛔ Sesión 1 se detuvo por límite de investigación (turn spend limit). Continuar
  con Utuado + Florida y luego Este → Sur → Oeste → Central en la próxima sesión.
- Reparto por agentes dentro de cada tanda: un agente por sub-tanda de 4–5
  municipios para mantener calidad de verificación.

## Municipios investigados

Método: cada municipio pasa por 4 estados → `pendiente` → `en-progreso` →
`investigado` (comunidades en master-database con fuentes) → `revisado+borradores listos` (con landings propuestas).

| Región | Municipio | Estado |
|---|---|---|
| Metro | san-juan | ✅ investigado (25 comunidades) |
| Metro | bayamon | ✅ investigado (25 comunidades) |
| Metro | carolina | ✅ investigado (25 comunidades) |
| Metro | guaynabo | ✅ investigado (25 comunidades) |
| Metro | catano | ✅ investigado (12 comunidades) |
| Metro | trujillo-alto | ✅ investigado (6 comunidades) |
| Metro | toa-baja | ✅ investigado (12 comunidades) |
| Metro | toa-alta | ✅ investigado (10 comunidades) |
| Metro | loiza | ✅ investigado (10 comunidades) |
| Metro | caguas | ✅ investigado (15 comunidades) |
| Metro | gurabo | ✅ investigado (8 comunidades) |
| Metro | cidra | ✅ investigado (10 comunidades) |
| Metro | aguas-buenas | ✅ investigado (10 comunidades) |
| Norte | arecibo | ✅ investigado (12 comunidades) |
| Norte | barceloneta | ✅ investigado (6 comunidades) |
| Norte | manati | ✅ investigado (10 comunidades) |
| Norte | vega-baja | ✅ investigado (10 comunidades) |
| Norte | vega-alta | ✅ investigado (7 comunidades) |
| Norte | dorado | ✅ investigado (15 comunidades) |
| Norte | hatillo | ✅ investigado (2 comunidades) |
| Norte | camuy | ✅ investigado (5 comunidades) |
| Norte | quebradillas | ✅ investigado (3 comunidades) |
| Norte | isabela | ✅ investigado (5 comunidades) |
| Norte | utuado | ✅ investigado (6 comunidades; 1 UNVERIFIED) |
| Norte | florida | ✅ investigado (4 comunidades; Hacienda de Florida con ubicación por confirmar) |
| Este | rio-grande | ✅ investigado (5 comunidades) |
| Este | luquillo | ✅ investigado (12 comunidades) |
| Este | fajardo | ✅ investigado (8 comunidades) |
| Este | ceiba | ✅ investigado (8 comunidades; 2 UNVERIFIED) |
| Este | naguabo | ✅ investigado (4 comunidades) |
| Este | humacao | ✅ investigado (13 comunidades; Palmas del Mar como resort) |
| Este | juncos | ✅ investigado (8 comunidades) |
| Este | san-lorenzo | ✅ investigado (5 comunidades, todas UNVERIFIED) |
| Este | las-piedras | ✅ investigado (2 comunidades) |
| Este | canovanas | ✅ investigado (3 comunidades; 2 UNVERIFIED) |
| Este | culebra | ✅ investigado (2 comunidades; Costa Bonita Beach Resort LUXURY) |
| Este | vieques | ✅ investigado (4 comunidades; Bravos de Boston LUXURY) |
| Este | yabucoa | ✅ investigado (14 comunidades, casi todas UNVERIFIED por directorios de alias) |
| Este | maunabo | ✅ investigado (6 comunidades) |
| Sur | guayama | ✅ investigado (7 comunidades) |
| Sur | arroyo | ✅ investigado (5 comunidades) |
| Sur | patillas | ✅ investigado (3 comunidades) |
| Sur | salinas | ✅ investigado (9 comunidades) |
| Sur | coamo | ✅ investigado (7 comunidades) |
| Sur | santa-isabel | ✅ investigado (8 comunidades; Hacienda Isabel HIGH) |
| Sur | juana-diaz | ✅ investigado (5 comunidades) |
| Sur | ponce | ✅ investigado (9 comunidades; Costa Caribe Golf Villas LUXURY) |
| Sur | penuelas | ✅ investigado (3 comunidades) |
| Sur | guayanilla | ✅ investigado (5 comunidades) |
| Sur | yauco | ✅ investigado (5 comunidades) |
| Sur | guanica | ✅ investigado (3 comunidades) |
| Oeste | mayaguez | ✅ investigado (15 comunidades) |
| Oeste | cabo-rojo | ✅ investigado (6 comunidades; Golf y Playa LUXURY) |
| Oeste | lajas | ✅ investigado (5 comunidades) |
| Oeste | san-german | ✅ investigado (5 comunidades) |
| Oeste | hormigueros | ✅ investigado (3 comunidades) |
| Oeste | sabana-grande | ✅ investigado (4 comunidades) |
| Oeste | aguada | ✅ investigado (3 comunidades) |
| Oeste | aguadilla | ✅ investigado (3 comunidades) |
| Oeste | moca | ✅ investigado (3 comunidades) |
| Oeste | aniasco | ✅ investigado (3 comunidades) |
| Oeste | rincon | ✅ investigado (4 comunidades; Punta del Mar Beach Village LUXURY) |
| Oeste | las-marias | ✅ investigado (2 comunidades) |
| Oeste | maricao | ✅ investigado (2 comunidades) |
| Oeste | san-sebastian | ✅ investigado (4 comunidades) |
| Central | orocovis | ✅ investigado (3 comunidades) |
| Central | morovis | ✅ investigado (3 comunidades) |
| Central | ciales | ✅investigado (4 comunidades) |
| Central | corozal | ✅ investigado (2 comunidades) |
| Central | naranjito | ✅ investigado (5 comunidades) |
| Central | comerio | ✅ investigado (9 comunidades) |
| Central | barranquitas | ✅ investigado (2 comunidades) |
| Central | aibonito | ✅ investigado (3 comunidades) |
| Central | cayey | ✅ investigado (7 comunidades; Mansiones Monte Verde HIGH) |
| Central | villalba | ✅ investigado (9 comunidades) |
| Central | jayuya | ✅ investigado (3 comunidades) |
| Central | adjuntas | ✅investigado (5 comunidades) |
| Central | lares | ✅ investigado (6 comunidades) |

## Sesión 7 (2026-10-22): mapa de comunidades en el Home + migración de proveedor

- **Sección "Encuentra tu comunidad en el mapa"** integrada en el Home
  (`home/es/landing-pages/ghl-home-multiservicios.html`, entre el directorio de cobertura y
  las reseñas), generada por `scripts/inyectar-mapa-home.mjs` desde
  `data/mapa-comunidades.json`. Se re-inyecta con marcadores
  `ILATEK:MAPA-COMUNIDADES:START/END`: volver a correr el script reemplaza la sección.
- **Migración de proveedor: Mapbox GL → MapLibre GL 4.7.1 + OpenFreeMap.** El token público
  de Mapbox (`pk.eyJ1IjoiaWxhdGVrcHIi…`) que estaba embebido en `mapa/mapa-regiones.html`
  está **revocado** (401 en todos los orígenes): un mapa que depende de un secreto en el
  cliente no puede funcionar. MapLibre es la misma API que Mapbox GL y los mosaicos de
  OpenFreeMap no piden credenciales. El token ya **no está en el repo**.
- **Carga diferida** con `IntersectionObserver` (rootMargin 250px): no bloquea el LCP. Si el
  SDK o los mosaicos fallan, queda la lista HTML + "Mapa no disponible. Usa la lista de
  comunidades."
- **99 marcadores**: 78 puntos de municipio (infobox de Wikipedia) + 21 pines de comunidad
  (punto OSM/Photon de precisión exacta). Los popups se construyen con **nodos del DOM**:
  ningún texto entra como HTML.
- **Filtro por región** (6 chips) + **buscador** que no apaga el punto del municipio cuando
  el texto calza con una de sus comunidades. La lista HTML de 68 comunidades publicadas
  queda siempre visible (rastreadores y sin JS).
- **Bilingüe**: chips, títulos de región, cuenta y popups se reconstruyen con el evento
  `ilatek:lang` (es/en).
- **Accesibilidad**: `aria-label` descriptivo por marcador (MapLibre pisa el `aria-label` en
  `addTo()`, así que se fija después), `aria-pressed` en los chips, mapa como `role="group"`
  etiquetado.
- **Popup del pin de comunidad simplificado**: muestra el nombre, el municipio y **solo los
  dos enlaces de servicio** (*Sellado de techos* y *Limpieza*). El enlace directo a la
  página de la comunidad sigue en la lista HTML de la sección, que siempre está visible, así
  que no se pierde ninguna ruta de navegación. El popup del municipio (punto azul) no cambia:
  lista las comunidades de su municipio.
- Bugs encontrados y corregidos en la verificación en navegador:
  `lista` (variable DOM) apagaba la función `lista()` del mismo scope → renombrada a
  `listaNodos()`; los marcadores quedaban con nombre "Map marker" → `aria-label` se fija
  después de `addTo()`; el mensaje "Mapa no disponible" salía con el mapa funcionando →
  estado explícito `cargando`/`listo`/`error`; buscar una comunidad apagaba el punto de su
  municipio → el filtro ahora compara municipio y comunidades.
- **Documentación**: `README.md` actualiza el apartado del mapa (MapLibre + OpenFreeMap,
  sin token), documenta el subdominio `comunidades.ilatekpr.com` y el pipeline de
  coordenadas (Wikipedia → OSM/Overpass exacto → `mapa-comunidades.json` → inyección).
- Pendiente de autorización (sin cambios): publicar el subdominio
  `comunidades.ilatekpr.com` y generar el tier HIGH.

## Sesión 6 (2026-10-21): tanda Central + cierre de los 78 municipios

- Investigación de los 13 municipios de la región Central con 4 agentes paralelos
  (Cayey/Aibonito/Barranquitas/Orocovis · Villalba/Morovis/Comerío/Jayuya ·
  Ciales/Corozal/Naranjito · Adjuntas/Lares) → **61 registros nuevos**.
- **Base consolidada: 564 registros, 78/78 municipios** — la investigación exhaustiva
  del Master Prompt queda completa. Cierre en `master-database.json` / `.csv`.
- Importación validada con `scripts/importar-lote.py` (genérico, renombrado desde
  `importar-sur.py`): rechaza registros sin fuente http real, ajusta prioridades
  fuera de catálogo y descarta comunidades sin evidencia.
- **Verificación real de fuentes** con el nuevo `scripts/verificar-fuentes.py`:
  comprueba por HTTP cada URL de evidencia. Lote Central: 45 URLs, 40 OK,
  5 con bloqueo anti-bot de Zillow (403), 0 caídas. Resultado global en
  `qc-fuentes.txt`.
- **Corrección de la base maestra**: `landingStatus` estaba en `NOT APPLICABLE`
  para los 564 registros. Ahora se deriva del disco en `scripts/consolidar.py`:
  68 NEW (con landing generada), 488 PENDING (verificadas, tier pendiente),
  8 NOT APPLICABLE (sin evidencia).
- **Campos del Master Prompt completados**: se añaden `relevantServices` y
  `existingLanding` (ruta de la landing existente) a los 14 campos por registro.
- QC re-corrida: 136/136 archivos, **0 hallazgos**; `qc-report.md`,
  `landing-inventory.md`, `roadmap.md` y `cobertura-report.md` regenerados.
- 8 registros siguen NOT APPLICABLE (7 con confidence LOW + Canóvanas/River Valley
  con prioridad UNVERIFIED): no hay fuente pública real que los confirme, así que
  no se publica landing para ellos.

## Sesión 5 (2026-10-21): tanda Oeste + islas + segunda pasada de verificación

- Investigación de 16 municipios con 4 agentes paralelos: Oeste completo
  (Cabo Rojo, Lajas, San Germán, Hormigueros, Sabana Grande, Mayagüez [15 registros],
  Rincón, Aguada, Aguadilla, Moca, Añasco, Las Marías, Maricao, San Sebastián)
  y las islas Culebra y Vieques → 53 registros nuevos.
- Base: **503 registros, 65/78 municipios**. Solo queda la tanda Central (13).
- LUXURY nuevas: Costa Bonita Beach Resort (Culebra), Punta del Mar Beach Village
  (Rincón), Golf y Playa (Cabo Rojo), Bravos de Boston (Vieques).
- Segunda pasada de verificación: **26 de 33 registros UNVERIFIED/LOW verificados**
  con fuentes reales (Bayamón 8/8, San Lorenzo 5/5, Ceiba 2/2, Canóvanas, Luquillo,
  Utuado, Cidra 2/3, Yabucoa 6/12). Aplicada con `scripts/aplicar-verificacion.py`.
- Quedan 7 sin evidencia: Cidra — Alturas de Cidra; Yabucoa — Jardines de Yabucoa,
  Reparto Horizonte, Sector Piedra Azul, Urb. Calvario, Urb. Los Ángeles, Villa El Recreo.
- Landings regeneradas: **136 archivos (68 comunidades LUXURY × 2)**, QC limpia
  (0 hallazgos). Reportes al día.
- Nota: discrepancia de nombre en Sabanaera (Cidra): el anuncio verificado dice
  "Sabanera de Cidra"; revisar deduplicación con Sabanera del Río de Gurabo en Fase 5.

## Sesión 4 (2026-10-21): tanda Sur completa

- Investigación de los 12 municipios de la región Sur con 3 agentes paralelos
  (Ponce/Juana Díaz/Santa Isabel/Salinas · Guayama/Arroyo/Patillas/Coamo ·
  Peñuelas/Guayanilla/Yauco/Guánica). 69 registros nuevos.
- Importación validada con `scripts/importar-sur.py` (rechaza registros sin fuentes
  http reales; ajusta prioridades/fuencias fuera de catálogo).
- Base consolidada: **435 registros**, **49 municipios** (Metro 13 + Norte 12 +
  Este 12 + Sur 12). Cobertura regenerada en `cobertura-report.md`.
- Landings LUXURY regeneradas: 128 archivos (64 comunidades × 2; entran
  Costa Caribe Golf Villas–Ponce y Rancho La Julia–Salinas con confianza MEDIUM).
- QC re-corrida: 128/128, 0 hallazgos; `landing-inventory.md`, `roadmap.md` y
  `qc-report.md` al día.
- Nota: Patillas, Peñuelas y Guánica quedan con 3 comunidades (los agentes solo
  incluyeron lo verificado en páginas leídas, según las reglas del Master Prompt).

## Sesión 3 (2026-10-21): verificación y cierre de artifacts

- Landings LUXURY verificadas: **124 archivos** (62 comunidades × 2) en 19 municipios —
  coincide 1:1 con los registros LUXURY de `master-database.json` (nada faltante, nada sobrante).
- QC automatizado creado: `scripts/qc-pass.py` → **0 hallazgos**
  (estructura, SEO, JSON-LD válido, tokens GHL, contrato de enlaces, duplicados, cobertura).
- Reportes que faltaban del README generados: `landing-inventory.md`, `roadmap.md`, `qc-report.md`.
- Mapa `mapa/mapa-regiones.html` verificado en navegador (sesión 3, con Mapbox GL; migrado a
  MapLibre + OpenFreeMap en la sesión 7): las 6 regiones marcan correctamente; fallback
  HTML intacto.

## Pendientes bloqueantes

- ✅ RESUELTO (sesión 7): el token público de Mapbox (`pk.eyJ1…`) está **revocado** (401 en
  todos los orígenes) y ya **no está en el repo**. El mapa usa **MapLibre GL + OpenFreeMap**,
  sin credenciales en el cliente.
- ✅ RESUELTO: investigación de los 78 municipios (sesión 6 cierra la región Central).
- Regla de rutas `/municipio/comunidad` en GHL: hay que definir en la cuenta cómo
  GHL sirve subdirectorios anidados (folders + domain routing) antes de publicar
  páginas. En el repo los HTML ya están generados con slugs.
- Tercera pasada de verificación para los 8 registros NOT APPLICABLE (7 LOW +
  Canóvanas/River Valley): requieren una fuente pública real; si no aparece,
  se descartan de la base.
- Tier 2 · HIGH (86 comunidades): generar landings cuando se autorice publicar.
- Tier 3 · MEDIUM (402 comunidades): solo tiene sentido si el modelo de negocio
  incluye volumen (vivienda pública de AVP y urbanizaciones de precio bajo).
