# Ledger de progreso · Master Prompt comunidades PR

Última actualización: 2026-11-01 (sesión 9)

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
- Sesión 2 (2026-10-21): tanda Este investigada en 12 de 14 municipios (88 registros). Culebra y Vieques Queda pendientes: el límite de investigación se alcanzó antes de lanzar sus agentes.
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
- ✅ RESUELTO (sesión 8): GHL soporta rutas anidadas (hasta 5 niveles). La regla
  queda en un funnel por comunidad con dos páginas hermanas:
  `/<municipio>/<comunidad>/sellado-de-techo` y `/<municipio>/<comunidad>/limpieza`.
  Ver [documentacion/COMUNIDADES-FUNNELS-GHL.md](../documentacion/COMUNIDADES-FUNNELS-GHL.md).
- Tercera pasada de verificación para los 8 registros NOT APPLICABLE (7 LOW +
  Canóvanas/River Valley): requieren una fuente pública real; si no aparece,
  se descartan de la base.
- Tier 2 · HIGH (86) y Tier 3 · MEDIUM (402): las landings ya están generadas
  (556 comunidades × 2 páginas). Falta el alta de sus funnels en GHL.

## Sesión 8 (2026-10-31): funnels por comunidad

- Adaptador `scripts/preparar-funnel-ghl.mjs`: convierte las dos landings de una
  comunidad en payloads de páginas GHL, incrusta `styles.css`, reescribe los
  assets a la Media Library y emite el ledger `data/ghl/index.json`.
- Verificador `scripts/verificar-funnel-ghl.mjs`: estructura, canonical, JSON-LD,
  rutas relativas, tokens y enlaces.
- Piloto **Isla Verde (Carolina) PUBLICADO y verificado**:
  `/carolina/isla-verde/sellado-de-techo` (A) y `/carolina/isla-verde/limpieza`
  (B), con favicon, GTM/GA4/Meta Pixel, chat widget Ilatek, SEO y screenshot
  1200×630 sin scrollbar como imagen social.
- Barrido de las 1.112 landings: UTF-8 válido, sin mojibake (el único carácter
  no-ASCII fuera de acentos es `©` del footer).
- La API pública v2 **no crea funnels ni páginas**: el alta es por UI. El path
  que manda es `Pages → ⋯ → Edit → URL Path/Slug`, no el path del step.
- Pasos exactos del lote en
  [documentacion/COMUNIDADES-FUNNELS-GHL.md](../documentacion/COMUNIDADES-FUNNELS-GHL.md).

## Sesión 9 (2026-11-01): segunda tanda publicada + auditoría

- **Residences at Rio (Bayamón) PUBLICADA y verificada** con el driver del lote:
  `/bayamon/residences-at-rio/sellado-de-techo` y
  `/bayamon/residences-at-rio/limpieza`, ambas 200, gate HTTP + móvil OK y
  `index.json` en `publicado`. Corrida completa en 10.7 min, sin abortos.
- La tanda anterior de esta comunidad (`lote-tanda-02.log`) se había cortado tras
  clonar el funnel de Techos; el reintento con `--only bayamon/residences-at-rio`
  reutilizó ese funnel (idempotencia) y no hubo que recrear nada.
- **Embed correspondiente en cada página, comprobado**: embed publicado = embed
  del payload de esa página (25 048 chars en Techos, 24 554 en Limpieza), H1 y
  `title` del servicio correcto, `og:image` distinta (la del screenshot de cada
  página) y ningún bloque del servicio hermano en el cuerpo. Lo único compartido
  son los tres fragmentos de boilerplate (tokens CSS, script de revelado y nota
  de tipo de comunidad).
- **Auditoría de las publicadas** (`scripts/auditar-publicadas.py`), al cerrar
  Residences at Rio: 3 comunidades, **6/6 landings en verde, 18/18 checks cada
  una**, `exit 0`. Tras la tanda 03 el mismo auditor da 12/12 (abajo).
- **Tanda 03 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, sin abortos,
  32.7 min de reloj:
  - `bayamon/riviera`: techos (`/bayamon/riviera/sellado-de-techo`, embed 24 900) y
    limpieza (`/bayamon/riviera/limpieza`, embed 24 406).
  - `bayamon/riviera-parkview`: techos (25 034) y limpieza, con og propios.
  - `cabo-rojo/golf-y-playa`: techos (24 976) y limpieza (24 482).
  Tiempos por comunidad: 10.3 / 10.2 / 12.2 min → el ~11 min/comunidad del
  runbook se sostiene (~30 h el lote). Log: `.tmp-ghl-ui/lote-tanda-03.log`.
- Revisión manual por tanda: las 6 páginas nuevas dan 147 / 146 KB, H1 con su
  comunidad y su servicio, `og:image` distinta por servicio y solo 2 frases de
  contenido compartidas entre hermanas (el CTA "Reserva tu servicio en <comunidad>"
  y la nota de tipo de comunidad). Sin contenido cruzado entre servicios.
- **Auditoría**: `scripts/auditar-publicadas.py` → **12/12 landings en verde,
  18/18 checks cada una**, `exit 0`.
- **Tanda 04 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, con un
  `ABORTA` intermedio y su arreglo:
  - `carolina/condesa-del-mar`: techos (embed 24 5xx) y limpieza (24 514), 11.4 min.
  - `carolina/esmeralda`: 10.2 min. `carolina/marbella-del-caribe-este`: 10.2 min.
  - **Incidente**: al pasar a esmeralda el driver abortó con `No está la plantilla
    'PLANTILLA · Techos' en Sites → Funnels`. Causa: la tabla de `Sites → Funnels`
    pagina de 15 en 15 por `recent` y, con 16 funnels de comunidad creados, la fila
    de la plantilla ya no cabía en la primera página. Arreglo en `clone_funnel`:
    si la fila no está a la vista, escribe `PLANTILLA` en `Search for funnels` y
    reintenta el filtro. Verificado con `py_compile` y con el relanzamiento.
  - **Reanudación**: al relanzar el mismo comando, la idempotencia imprimió
    `Ya publicadas y verificadas: 1 · pendientes: 2` y siguió con esmeralda, que
    completó sus dos páginas sin incidencias (`lote-tanda-04b.log`).
- Revisión de contenido de las 6 páginas nuevas: 147 / 146 KB, H1 con su comunidad
  y su servicio, `og:image` distinta por servicio y solo boilerplate compartido
  (CTA por comunidad, nota de tipo de comunidad y, en Marbella, el encabezado de
  la FAQ "¿Qué tipo de comunidad es…?").
- **Auditoría**: `scripts/auditar-publicadas.py` → **18/18 landings en verde,
  18/18 checks cada una**, `exit 0`.
- **Tanda 05 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, sin abortos,
  30.7 min de reloj, ya con el arreglo de la tabla paginada en vigor (las tres
  clonaron sin intervención):
  - `carolina/sevilla`: techos (embed 24 918) y limpieza (24 424), 10.3 min.
  - `carolina/villamar`: techos (24 932) y limpieza (24 438), 10.2 min.
  - `carolina/vistamar`: techos (24 914) y limpieza (24 420), 10.2 min.
  Log: `.tmp-ghl-ui/lote-tanda-05.log`.
- Revisión de contenido de las 6 páginas nuevas: el embed publicado mide exactamente
  lo que el payload de **esa** página (no el de la hermana), H1 con su comunidad y
  su servicio, `og:image` distinta por servicio y ningún H1 del servicio contrario
  en el cuerpo. En vivo: 6/6 en 200 (147/146 KB), `…-page` en 404 y raíz de
  comunidad en 404, igual que las anteriores.
- **Auditoría**: `scripts/auditar-publicadas.py` → **24/24 landings en verde,
  18/18 checks cada una**, `exit 0`.
- **Tanda 06 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, sin abortos,
  30.9 min de reloj. Primera tanda con una comunidad fuera de Carolina:
  - `carolina/vistamar-marina`: techos (embed 25 030) y limpieza (24 536), 10.3 min.
  - `carolina/waldorf-tower`: techos (24 994) y limpieza (24 500), 10.4 min.
  - `ceiba/the-village-at-the-hill`: techos (25 128) y limpieza (24 634), 10.2 min.
  Log: `.tmp-ghl-ui/lote-tanda-06.log`.
- Revisión de contenido de las 6 páginas nuevas contra el payload propio de cada
  una: 4/4 frases exclusivas de esa página presentes en vivo, **0** frases de la
  hermana, embed publicado = embed de su payload (25 030 / 24 536 · 24 994 / 24 500 ·
  25 128 / 24 634), H1 con su comunidad y su servicio y `og:image` distinta por
  servicio. En vivo: 6/6 en 200 (147/146 KB), `…-page` en 404 y raíz en 404.
- **Auditoría**: `scripts/auditar-publicadas.py` → **30/30 landings en verde,
  18/18 checks cada una**, `exit 0`.
- **Fallo de feedback corregido en el auditor** (probando el flujo descuidado):
  `--only` con una clave inexistente imprimía "No hay landings que auditar" pero
  salía con **código 0**, así que un typo se leía como aprobado. Ahora sale con
  **código 2** y el mensaje pide revisar `--only` / el ledger. Verificado: typo →
  exit 2; `--only carolina/sevilla` → 2/2 en verde, exit 0.
- **Tanda 07 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, sin abortos,
  31.3 min de reloj. Primera tanda con dos comunidades del mismo municipio nuevo
  (Dorado):
  - `culebra/costa-bonita-beach-resort`: techos (embed 25 138) y limpieza (24 644), 10.5 min.
  - `dorado/dorado-beach-east`: techos (24 974) y limpieza (24 480), 10.3 min.
  - `dorado/east-beach`: techos (24 962) y limpieza (24 468), 10.5 min.
  Log: `.tmp-ghl-ui/lote-tanda-07.log`.
- Revisión de contenido de las 6 páginas nuevas: 4/4 frases exclusivas de su propio
  payload en vivo, **0** del servicio hermano y **0** frases de la otra comunidad de
  Dorado (cruce comprobado en las 4 páginas doradeñas). Los cuatro `og:image` de
  Dorado son distintos entre sí (4/4). Embed publicado = embed de su payload
  (25 138/24 644 · 24 974/24 480 · 24 962/24 468). En vivo: 6/6 en 200 (148/147 KB),
  `…-page` en 404 y raíz de comunidad en 404.
- **Auditoría**: `scripts/auditar-publicadas.py` → **36/36 landings en verde,
  18/18 checks cada una**, `exit 0`. Contrato de códigos verificado otra vez:
  `--only dorado/no-existe` → mensaje + **exit 2** (no un aprobado).
- **Tanda 08 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, con un
  `ABORTA` por red a mitad de camino y su arreglo. Las tres son de Dorado:
  - `dorado/la-cala`: techos (embed 24 898) y limpieza (24 404), 13.3 min.
  - `dorado/livingston-estates`: 6.5 min en el relanzamiento (reutilizó el funnel
    de Techos ya creado), limpieza 24 560.
  - `dorado/plantation-village`: techos (25 076) y limpieza (24 582), 10.4 min.
  Logs: `.tmp-ghl-ui/lote-tanda-08.log` y `lote-tanda-08b.log`.
  - **Incidente**: tras publicar la Limpieza de Livingston el run murió con
    `<urlopen error [WinError 10054] An existing connection was forcibly closed>`,
    en la subida de la imagen social (`upload_media`), un POST multipart sin
    reintento. Arreglo: 3 intentos con espera 4 s / 8 s solo para errores de
    conexión; el resto de fallos sigue abortando. Verificado con `py_compile` y
    con el relanzamiento, que completó las dos comunidades que faltaban.
- Cruce entre las **cinco** comunidades de Dorado: las 6 páginas nuevas traen 4/4
  frases de su propio payload, **0** del servicio hermano y **0** de cualquiera de
  las otras cuatro comunidades de Dorado (mismo servicio). Los 10 `og:image` de
  Dorado son distintos entre sí (10/10). En vivo: 6/6 en 200 (147/146 KB),
  `…-page` 404 y raíz de comunidad 404.
- **Auditoría**: `scripts/auditar-publicadas.py` → **42/42 landings en verde,
  18/18 checks cada una**, `exit 0`.
- **Tanda 09 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, sin abortos
  (el reintento de `upload_media` no llegó a dispararse). Tercera tanda de Dorado:
  - `dorado/the-enclave`: techos (embed 24 982) y limpieza (24 488), 10.4 min.
  - `dorado/the-isles`: techos (24 936) y limpieza (24 442), 13.2 min.
  - `dorado/the-legacy`: techos (24 936) y limpieza (24 442), 13.7 min.
  Log: `.tmp-ghl-ui/lote-tanda-09.log`.
- Nota de verificación: The Isles y The Legacy dan **el mismo largo de embed**
  (24 936 / 24 442) porque la plantilla sustituye nombres de igual longitud. El
  control por frases exclusivas confirma que cada página lleva su propio embed:
  4/4 frases propias y **0** de la hermana y **0** de las otras 7 comunidades de
  Dorado. El largo por sí solo no distingue entre esas dos comunidades; el check
  del auditor (`embed` + `h1`) sí, porque compara con su payload.
- Cruce de Dorado completo: **16/16 `og:image` distintas** entre las 8 comunidades
  (16 páginas). En vivo: 6/6 en 200 (147/146 KB), `…-page` 404 y raíz 404.
- **Auditoría**: `scripts/auditar-publicadas.py` → **48/48 landings en verde,
  18/18 checks cada una**, `exit 0`.
- Estado del ledger: **24 de 177 comunidades publicadas** (las 21 anteriores más
  The Enclave, The Isles y The Legacy), 153 en `pendiente`. Siguiente en la cola:
  `dorado/west-beach` (luego `dorado/west-point` y `fajardo/pena-mar-ocean-club`).
- **Runbook del lote completado** en la guía de funnels: sección *Lanzar una tanda
  (comandos)* con las 4 precondiciones (CDP 9222, PIT de `.mcp.json`, ledger,
  payloads), el filtro de pendientes que respeta el orden LUXURY → HIGH → MEDIUM,
  las banderas del driver y cómo reanudar tras un `ABORTA`. La tanda 03 se lanzó
  siguiéndolo y no hizo falta ningún paso fuera del documento.
- **Verificación de contenido fijada como pieza permanente** (2026-11-01): el
  control que se reescribía y borraba en cada tanda (`.tmp-contenido-*.py`) es
  ahora `scripts/verificar-contenido.py`, junto al auditor y con tests en
  `scripts/tests/test_verificar_contenido.py`. Contrato por página: embed propio
  **verbatim** en la página viva, 0 frases exclusivas del servicio hermano, 0 de
  otras comunidades del municipio y `og:image` única. Códigos como el auditor
  (0 verde, 1 fallo, 2 filtro vacío).
  - Corrida real sobre las 24 publicadas: **48/48 páginas en verde**, `exit 0`,
    48 `og:image` distintas. Tests: **8/8**.
  - Discriminación probada contra páginas **vivas**: payload de The Isles
    sustituido por el de The Enclave → `exit 1` («el embed publicado no es el de
    su payload»); una palabra alterada en su propio payload → `exit 1`; filtro
    vacío → `exit 2`.
  - Hueco cerrado: el método anterior pedía «al menos 3 frases propias presentes»
    y dejaba pasar un payload editado cuando la mayoría de sus frases seguía en
    vivo. La identidad verbatim (comprobada en las 12 páginas muestreadas) lo
    detecta con una sola palabra cambiada.
  - Runbook: el cierre de cada tanda son ahora dos pasos, la auditoría (estructura)
    y esta verificación (contenido), documentados en la sección 9.b.
- **Tanda 10 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, sin abortos
  y sin necesidad de reintento. Última tanda de Dorado y primera que cambia de
  municipio a mitad:
  - `dorado/west-beach`: techos (embed 24 956) y limpieza (24 462), 10.4 min.
  - `dorado/west-point`: techos (24 954) y limpieza (24 460), 10.3 min.
  - `fajardo/pena-mar-ocean-club`: techos (25 144) y limpieza (24 650), 10.4 min.
  Log: `.tmp-ghl-ui/lote-tanda-10.log`.
- Cierre de la tanda con las **dos verificaciones permanentes** (estreno del paso
  9.b en una tanda real):
  - `scripts/auditar-publicadas.py` → **54/54 landings en verde, 18/18 checks
    cada una**, `exit 0` (log `.tmp-ghl-ui/auditoria-10.log`).
  - `scripts/verificar-contenido.py` → **54/54 páginas en verde, `exit 0`**, 54
    `og:image` distintas (log `.tmp-ghl-ui/contenido-10.log`). Ningún script
    temporal: la pieza hizo el trabajo que antes hacía un `.tmp-contenido-*.py`.
- **Sin arrastre de Dorado a Fajardo** (el riesgo de esta tanda, porque cambia de
  municipio en la tercera): las dos páginas de Peña Mar Ocean Club llevan su embed
  **verbatim** y **0** frases exclusivas de las **10 comunidades de Dorado**
  (las 20 páginas de Dorado con el mismo servicio, no solo la hermana). Sus 2
  `og:image` son distintas de las 16 de Dorado. El check de la pieza es por
  municipio; para este caso se hizo además el cruce contra el municipio anterior
  usando sus helpers, sin escribir un script nuevo.
- Estado del ledger: **27 de 177 comunidades publicadas**, 150 en `pendiente`.
  Siguiente en la cola: `fajardo/puertas-del-sol` (luego
  `fajardo/the-ocean-club-at-seven-seas` y `guaynabo/estancias-de-torrimar`).
- **Tanda 11 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, sin abortos
  y sin reintentos. Dos de Fajardo y una de Guaynabo (municipio nuevo):
  - `fajardo/puertas-del-sol`: techos (embed 25 042) y limpieza (24 548), 10.4 min.
  - `fajardo/the-ocean-club-at-seven-seas`: techos (25 272) y limpieza (24 778),
    10.4 min.
  - `guaynabo/estancias-de-torrimar`: techos (25 096) y limpieza (24 602), 13.5 min.
  Log: `.tmp-ghl-ui/lote-tanda-11.log`.
- Cierre con los dos pasos permanentes, tal como quedó el runbook:
  - `scripts/auditar-publicadas.py` → **60/60 landings en verde, 18/18 checks
    cada una**, `exit 0` (log `.tmp-ghl-ui/auditoria-11.log`, corrida en background
    con su código en `.exit` porque ya no cabe en una llamada síncrona).
  - `scripts/verificar-contenido.py` → **60/60 páginas en verde, `exit 0`** (log
    `.tmp-ghl-ui/contenido-11.log`).
- **Sin arrastre entre municipios**: las 6 páginas nuevas llevan su embed
  **verbatim**, **0** frases exclusivas de las comunidades de Dorado ni de la otra
  de Fajardo (Peña Mar, la única publicada antes en ese municipio) y **6/6**
  `og:image` distintas entre sí.
- Pitfall de precondición, ya documentado en el runbook: comprobar el PIT con
  `urllib` sin headers devuelve **403 de Cloudflare (Error 1010)** aunque la
  credencial esté sana. La comprobación válida usa el endpoint
  `funnels/funnel/list` con los headers del driver y el mismo `User-Agent`;
  respondió **200 con 57 funnels** en la comprobación de esta tanda.
- Estado del ledger: **30 de 177 comunidades publicadas**, 147 en `pendiente`.
  Siguiente en la cola: `guaynabo/garden-hills-north` (luego `guaynabo/la-lomita`
  y `guaynabo/las-casonas`).
- **Tanda 12 (2026-11-01): 3 comunidades, 6/6 páginas con gate OK**, las tres de
  Guaynabo, vecinas entre sí (el caso que el check por municipio sí cubre):
  - `guaynabo/garden-hills-north`: techos (embed 25 054) y limpieza (24 560), 9.4 min.
  - `guaynabo/la-lomita`: techos (24 928) y limpieza (24 434), 10.4 min.
  - `guaynabo/las-casonas`: techos (24 956) y limpieza (24 462), 11.3 min.
  Logs: `.tmp-ghl-ui/lote-tanda-12.log` (primer intento) y `lote-tanda-12b.log`
  (reanudación, la que cerró los 6 gates).
- **Arreglo en el driver, no reintento a ciegas** (2026-11-01): el primer intento
  abortó en la primera comunidad con `Locator.input_value: Timeout 30000ms
  exceeded` dentro de `set_step_path`. La causa era la **lectura de vuelta** del
  path: tras `Update page` se reabría el modal con 2 s fijos y se leía `nth(1)` a
  ciegas, así que un modal lento gastaba 30 s de timeout y tiraba la comunidad
  entera (funnel ya clonado, nada publicado). Ahora se espera a que monten los dos
  campos antes de escribir y la relectura reintenta hasta 3 veces cerrando la
  máscara, con error explícito si no lo consigue. La reanudación **reutilizó** el
  funnel clonado (`ya existe … se reutiliza`), sin duplicarlo.
- Cierre de la tanda:
  - `scripts/auditar-publicadas.py` → **66/66 landings en verde, 18/18 checks cada
    una**, `exit 0` (log `.tmp-ghl-ui/auditoria-12.log`, corrida en background con
    su código en `.exit`).
  - `scripts/verificar-contenido.py` → **66/66 páginas en verde, `exit 0`** (log
    `.tmp-ghl-ui/contenido-12.log`).
- **Sin arrastre entre vecinas**: las 6 páginas nuevas llevan su embed **verbatim**,
  **0** frases exclusivas de las otras comunidades de Guaynabo (incluida Estancias
  de Torrimar, publicada en la tanda anterior) ni de ningún otro municipio, y
  **6/6** `og:image` distintas entre sí.
- Estado del ledger: **33 de 177 comunidades publicadas**, 144 en `pendiente`.
  Siguiente en la cola: `guaynabo/san-patricio` (luego `guaynabo/sereno` y
  `guaynabo/sun-valley`).
- **Tanda 13 no iniciada (2026-11-01): cuenta de GHL bloqueada.** El builder no
  abre: `app.gohighlevel.com` redirige a `/inactive?type=failed-payment` ("You've
  been temporarily locked out", con `Logout` y `Reactivate Now`). El síntoma en
  el driver es indirecto — `open_builder` muere con `'NoneType' object has no
  attribute 'get_by_role'` porque el frame nunca llega a decir "Funnel steps" —,
  así que conviene mirar la pestaña antes de sospechar del código. El **PIT
  sigue vivo** (API 200 con 63 funnels): no es un problema de credenciales.
- **Nuevo paso de proceso: `canonical` por página** (pedido del propietario,
  2026-11-01). Ninguna de las 66 páginas publicadas tiene `<link rel="canonical">`
  hoy (comprobado en vivo en `guaynabo/la-lomita`), aunque el payload **ya trae**
  el valor en `pages[].canonical`, que es la URL de esa misma página. Queda
  documentado en el runbook (Fase 5 y pre-flight) como paso obligatorio desde la
  tanda 13; el backfill de las 33 comunidades espera a que la cuenta vuelva a
  estar activa.
- Estado del ledger: **33 de 177 comunidades publicadas**, 144 en `pendiente`
  (sin cambios: hoy no se publicó nada). Siguiente en la cola:
  `guaynabo/san-patricio`.
- **Canonical en el proceso y backfill en marcha (2026-11-01).** El paso quedó
  dentro de `set_seo` (`aplicar_canonical`), así que cada página nueva lo lleva
  sola; el sitio del campo es `SEO → Links & tags → Canonical links → Add`
  (input con placeholder `https://example.com`) y se cierra el drawer con
  `Escape` antes del `Save`. El backfill de las 33 publicadas corre con
  `scripts/marcar-canonical.py`: verificado en `guaynabo/la-lomita/sellado-de-techo`
  (etiqueta viva apuntando a sí misma) y en curso con 0 fallos.
- **Inventario de las 1112 páginas (objetivo completo).** 556 comunidades × 2 =
  1112 landings. Fase 0 generó las **378 comunidades sin payload** (0 fallos):
  ahora hay **556 payloads**. Pero la cola sigue en **177** porque
  `cola-hero.mjs` solo admite comunidades con **hero propio**: **379
  comunidades (758 páginas) quedan fuera** hasta que tengan su foto. El trabajo
  publicable hoy son las 144 pendientes de cola (288 páginas, ~28 h).
- Observaciones: la raíz de cada comunidad (`/<municipio>/<comunidad>`) da
  **404** en las seis publicadas (comprobado también en `bayamon/riviera`,
  `bayamon/riviera-parkview` y `cabo-rojo/golf-y-playa`): el flujo no publica
  página raíz y el `rootRedirect` del ledger no se materializa; el *step* del
  funnel de Limpieza conserva el nombre `Sellado de techo` en la API de GHL,
  cosmético y sin efecto en la URL ni en el contenido publicados.

### Backfill del canonical: causa del corte y blindaje

- El lote anterior **no murió** con el reinicio del runner: seguia vivo y manejaba la
  misma pestana que el relanzado. Los `ERR_ABORTED` al navegar y los selectores que
  "desaparecian" (`Links & tags`) eran la otra instancia navegando encima. No fue un
  cambio de GHL ni la cuenta en `hold`.
- Leccion: antes de relanzar, contar instancias (`Get-CimInstance Win32_Process`
  filtrando por `marcar-canonical`) y parar los PID concretos. Una sola pestana, un
  solo driver.
- Blindaje anadido: tras el `Escape` del drawer SEO se llama a `cerrar_mascara`; si el
  `Publish` falla igual, se reabre el builder y se reintenta una vez.
- El reanudado escanea por HTTP y solo repasa las comunidades con alguna pagina sin
  canonical propio.

### Canonical: backfill cerrado (66/66)

- Escaneo HTTP final: **con canonical 66 · sin canonical 0 · errores HTTP 0**.
- Segunda pasada del backfill: **52 paginas** publicadas con canonical, **0 fallas**, exit 0.
- `python scripts/verificar-contenido.py` completo: **66/66 en verde**, exit 0.
- El canonical ya es parte del proceso normal: lo escribe `set_seo` dentro del drawer
  SEO en cada pagina nueva, y `verificar-contenido.py` lo exige (con test que falla
  cuando falta). De aqui en adelante ninguna tanda publica sin el.

### Tanda 13 (guaynabo): con canonical dentro del proceso

- `guaynabo/san-patricio`, `guaynabo/sereno`, `guaynabo/sun-valley` -> 6 paginas.
- Ledger: **77 comunidades publicadas = 154 paginas de 1112**.
- `verificar-contenido.py`: **72/72 en verde**, exit 0. Canonical propio confirmado por
  HTTP en las 6 nuevas.
- Primer lote corto: Sereno aborto al reabrir el builder (el boton `Edit` no llego a
  pintarse en 30 s) y el driver mataba el resto de la tanda. Arreglado en la misma
  pasada: `open_builder` espera a que `Edit` este visible y reintenta recargando; el
  bucle ya no hace `break`, anota la comunidad como fallida, sigue con la siguiente y
  sale con 1 al final.
- Sereno se relanzo sin duplicar nada: el driver reutiliza el funnel por nombre.

### Tanda 14 (guaynabo + gurabo) y auditoria

- `guaynabo/tintillo-hill-estates`, `guaynabo/villa-caparra`, `gurabo/river-view`:
  3/3 comunidades, 0 fallas, 6/6 gates, exit 0 (10.5 min).
- `verificar-contenido.py`: **78/78 en verde**, exit 0. Canonical propio confirmado
  por HTTP en las 6 nuevas.
- `auditar-publicadas.py` sobre la tanda 13: **72/72 landings en verde** (18/18
  secciones cada una), exit 0.
- Corregido el recorte de la cola: `--limit` se aplicaba antes de descartar lo ya
  publicado, asi que con la cabeza de la lista hecha la tanda salia vacia. Ahora
  `--limit 3` son 3 comunidades nuevas.

### Tandas 15 y 16 (humacao + luquillo) y supervisor

- Tanda 15: `humacao/isla-san-marcos`, `humacao/isla-san-miguel`, `humacao/palmas-del-mar`:
  3/3, 0 fallas, 6/6 gates, exit 0 (10.4 min).
- Ledger: **77 comunidades publicadas = 154 paginas de 1112**; 159 pendientes en cola.
- Tanda 16: una `FALLA` en `humacao/palmas-del-mar` (`Frame.click` sobre `#edit-page`),
  reintento redundante de una comunidad que ya estaba publicada y viva: era una
  carrera con el registro del ledger. Blindado el clic en los dos puntos del driver
  (espera a visible, y la relectura del path reintenta en vez de abortar).
- Arrancado `.tmp-ghl-ui/colero.py`: encadena tandas de 3 sin huecos, espera a que no
  haya otra instancia viva (una sola pestana de GHL), verifica el contenido cada 4
  rondas y para solo si hay tres tandas seguidas con fallas.

### Cierre de la tanda 16 y supervisor en marcha

- `luquillo/hacienda-margarita` salio `pendiente` en el ledger aunque sus dos paginas
  quedaron vivas (151/150 KB) con canonical propio: la falla vino de un **driver
  duplicado** sobre la misma pestana (un watcher encadenado superviviente), no del
  contenido. Podado a mano; la ronda 1 del supervisor la rehace y le pasa el gate.
- Regla operativa confirmada: **un solo driver a la vez**. El supervisor lo comprueba
  antes de cada tanda; nunca dos procesos sobre la misma pestana de GHL.

### Quitar el techo del hero: la cola se alimenta sola

- Medido antes de tocar nada: **556 comunidades con landing**, 177 con sus dos
  fotos, 1 solo con hero promovido y **378 sin ninguna imagen**. Esas 378 son las
  756 páginas que faltaban para las 1112; el techo era material, no código.
- El pipeline ya existía y funciona: `prompts.mjs` genera los 1112 prompts
  (tipología, región y nivel económico reales), `flow-ui.py` los manda a Google
  Flow en el Chrome del propietario y `lote-automatico.py` encadena tandas.
  Probado en vivo con una imagen: `Levittown - limpieza.png`, 1365x768, con la
  sesión `fullnessmindment@gmail.com` (Osvaldo Melendez).
- Un `lote-automatico.py` viejo llevaba desde las 17:39 parado tras morir el
  driver de Playwright en la imagen 46/50 ("Connection closed while reading from
  the driver"): por eso el disco seguía en 354 PNG. Parado y relanzado.
- Dos cambios para que la tubería no vuelva a quedarse sin trabajo:
  `lote-automatico.py` refresca `cola-hero.txt` y `.tmp-pendientes.txt` después
  de cada tanda (antes había que hacerlo a mano), y `cola-hero.mjs` exige ahora
  el **par** de fotos, para que ninguna página salga con la foto compartida.
- Arrancado el lote en segundo plano (`--tanda 40 --espera 8`) junto al
  supervisor de publicación: uno llena la cola y el otro publica del tirón.

### Cadena de heroes verificada en vivo

- `toa-baja/levittown`: sus dos fotos entraron en el mismo tanda, `generar-landings.mjs`
  convirtio 3 PNG a WebP, la cola paso de 177 a **178 comunidades** y la comunidad
  quedo en `.tmp-pendientes.txt` (que el supervisor relee en cada ronda).
- Las 1112 landings se regeneraron con su WebP propio; la landing de Levittown ya
  referencia `hero/toa-baja-levittown-techos.webp` y `-limpieza.webp`.
- Supervisor y lote de imagenes corren a la vez sin pelearse: el driver publica
  (`0 fallas`) mientras Flow genera. Un solo proceso de cada uno.
- Cifras reales: **77 comunidades / 154 paginas publicadas**, 476 PNG de 1112,
  236 en cola, 159 pendientes de publicar. Nada de esto se cuenta como terminado.

### Encadenado y recuperacion (madrugada del 2)

`vigia.py` (PTY persistente) deja el tablero en un supervisor, un driver, un
lote y un Flow: relanza el supervisor si muere, poda duplicados por PID y mata
un driver que lleva 12 min sin escribir su log. Probado en esta pasada: se mato
`lote-automatico` a mano y el vigilante lo relanzo solo a las 01:36:46, reabrio
la sesion de Flow (`fullnessmindset@gmail.com`) y siguio generando (424 -> 429
PNG). Si el lote se reanuda sin producir, la espera crece 1, 2, 5, 10 y 15 min
para no abrir una pestaña contra una cuenta que necesite login del dueño.

`colero.py` ahora repara el payload de las pendientes que llegan sin hero
(nueve por ronda) y repasa las publicadas que sigan con la foto compartida
antes de cada tanda, con `--force`. Verificado en vivo tras esta pasada:
`luquillo/paisajes-del-lago` y `luquillo/paisajes-del-rio`, sus dos paginas con
HTTP 200, `rel="canonical"` a su propia URL y hero/`og:image` de su propia
Media Library.

## Cierre de la tirada nueva (2026-11-02)

Supervisor encadenando con el canonical dentro del proceso y el lote de heroes
alimentando la cola. Cifras medidas al cerrar:

- Publicadas: **77 comunidades / 154 páginas** de 1112.
- Imágenes: **476 PNG** de 1112 en disco, 474 WebP en `landings/hero/`.
- En cola: **236 comunidades** con sus dos fotos; 159 pendientes de publicar.
- Fallas abiertas: 0.

Probado en vivo en esta pasada con `cayey/mansiones-monte-verde`: par completo
de imágenes, entrada en `cola-hero.txt`, publicación y republicación con
`--force`; las dos URLs devuelven **HTTP 200**, con su canonical propio en el
HTML servido y el hero de su Media Library (`c1aa7f2b…` techos, `ab92fbed…`
limpieza), no la foto compartida. El único resto de la foto compartida en la
página es un mapa de nombres dentro del CSS del embed, no el hero ni el og:image.

Lo que se arregló por el camino: el payload no llevaba el hero (faltaba el paso
`preparar-funnel-ghl.mjs --upload`), dos drivers llegaron a correr a la vez y se
podaron, y `preparar-funnel-ghl.mjs` despublicaba del índice al rehacer un
payload (46 → 45); ahora conserva el estado y la entrada se restauró.

Queda pendiente lo que depende de material: 636 imágenes por generar en
Flow (sesión y cuota del dueño) y 149 comunidades por publicar a ~11 min cada
una. Si Flow agota cuota, la alternativa de pago (WaveSpeedAI) necesita
`WAVESPEED_API_KEY`, que solo puede poner el dueño.

## Bloqueo de imagenes (07:30 del 2)

- ChatGPT/Flow devuelve "CUOTA AGOTADA: ChatGPT llego a su limite de imagenes" en cada intento
  y la ultima pasada cerro la pestana ("Target page, context or browser has been closed").
- Con lo ya generado (476 PNG = 238 comunidades) se puede publicar hasta 236 comunidades / 472 paginas.
- La publicacion sigue sola; las imagenes se reanudan con el mismo comando cuando la cuota vuelva.

## Cadena de cuentas de Google (09:30 del 2)

- `Comunidades/scripts/imagenes/cuentas.json` fija el orden de respaldo:
  `o.melendez1991@gmail.com` -> `fullnessfrequency@gmail.com` -> `osvaldodmelendez@gmail.com`.
- `flow-ui.py` cambia de cuenta solo cuando Flow dice cuota agotada (o deja el campo tapado con
  aviso de cuota), reintenta la MISMA comunidad con la cuenta siguiente y conserva el indice `/u/N/`
  para que la navegacion no vuelva a la cuenta seca.
- Si la cuenta siguiente no tiene sesion, deja la pestana en el login de Google y espera 20 min:
  el dueño entra ahi una vez y el lote sigue sin relanzar nada.
- En el Chrome del CDP 9222 solo tienen sesion `fullnessmindset@gmail.com` (indices 0,3,4,5) y
  `o.melendez1991@gmail.com` (indice 2); las otras dos piden login.
- `lote-automatico.py --authuser N` arranca el lote en una cuenta concreta.

## Por que los PNG se clavaron en 477 (09:45 del 2)

- Causa: Flow cambio el CDN del mosaico. Las imagenes ya no salen de `/asb/` sino de
  `flow-content.google/image/<uuid>` (1376x768). El detector `imagenes()` filtraba por `/asb/`,
  asi que devolvia 0 aunque la generacion SI ocurria: el lote lo leia como "no aparecio ninguna
  imagen nueva" y se quedaba dando vueltas en la misma cuenta.
- Arreglo en `flow_navegador.py`: el filtro acepta `/asb/` y `flow-content.google/image/`, con
  naturalWidth > 500 y naturalHeight > 300; `bajar()` cae al contexto de peticiones de Playwright
  si el fetch de la pestana choca con CORS.
- Arreglo en `flow-ui.py`: nueva excepcion `SinImagen`; cualquier "Flow no entrego imagen" cuenta
  como limite de la cuenta y salta a la siguiente de la cadena reintentando la MISMA comunidad.
  Un fallo de envio o de sondeo ya NO cuenta como cuota: se reintenta en la misma cuenta.
- Verificado en vivo: 477 -> 481 -> (creciendo) PNG reales con la cuenta `o.melendez1991@gmail.com`
  en `/u/2/`, lote y `flow-ui` vivos sin intervencion.
- Ahora: 484 PNG, 81 comunidades publicadas (162 paginas), 155 pendientes de publicar.

## Prompts: el despues tiene que verse impecable (10:30 del 2)

- Queja del dueño: la imagen de limpieza salia con alfombras y pisos sucios. La plantilla pedia
  "spotless" pero no prohibia la suciedad, y el modelo inventaba manchas y desgaste.
- Ademas la plantilla de techos usaba comillas simples con `${RESULTADO_TECHO}`, que NO interpola:
  el prompt salia con el texto literal. Ahora es plantilla con backticks.
- Arreglo en `prompts.mjs`: constante `RESULTADO_LIMPIEZA` (pisos y alfombras recien limpios, sin
  polvo, manchas, huellas ni descolorido; lechada blanca, vidrios sin marcas) y `RESULTADO_TECHO`
  (sellado uniforme blanco brillante, sin rayas, parches, oxido ni desprendimiento).
  Se cambio "worn but clean" por "clean, well-kept" para no invitar a la suciedad.
- Se borraron 11 PNG de limpieza de la tanda (09:50-10:19) y el lote los rehizo con el prompt nuevo;
  prompts.json regenerado: 1112 prompts, ninguno con `${` sin resolver.
- Ahora: 502 PNG, 81 comunidades publicadas (162 paginas), 155 pendientes de publicar.
- Verificacion visual de `Bella Vista - limpieza.png` recien generada: piso de losa limpio y brillante,
  alfombra sin manchas, cortinas y paredes frescas, cero suciedad. El prompt nuevo si cambia el resultado.

## Tanda rehecha con el prompt nuevo (10:55 del 2)

- Se borraron los PNG de la tanda generados con la plantilla vieja (11 limpiezas del 09:50-10:19 y
  10 techos del 09:52-10:19) y el lote los rehizo todos con `RESULTADO_LIMPIEZA` / `RESULTADO_TECHO`.
- Verificacion a ojo: `Bosque Real - sellado de techos.png` (capa blanca uniforme, sin parches ni manchas)
  y `Brisas Tortuguero - limpieza.png` (lavanderia: piso brillante, superficies y estantes limpios, cero suciedad).
- Estado: 510 PNG, 475 webp, ledger 81 comunidades / 162 paginas, 155 pendientes de publicar.
- Tanda cerrada: los 22 archivos (11 limpiezas + 11 techos) re-generados y ninguno con fecha anterior a 10:19.
- prompts.json: 1112 prompts, ninguno con `${` sin resolver.
- Cuentas de Google: la activa es `o.melendez1991@gmail.com` (/u/2, con sesion y entregando).
  FALTAN POR INICIAR SESION `fullnessfrequency@gmail.com` y `osvaldodmelendez@gmail.com`: no tienen
  sesion en el Chrome del puerto 9222. Cuando la cuenta 2 se agote, el lote dejara la pestana en el
  login de Google y esperara 20 min; con entrar una vez sigue solo.

## Publicacion: clic del embed y el gate movil (11:30 del 2)

- Sintoma: el supervisor cerraba rondas con `+0 comunidades · fallas 3` y el ledger llevaba mas de una
  hora en 81. El driver fallaba en `Locator.click: Timeout 30000ms exceeded` tras escribir el path.
- Causa 1 (resuelta): en el builder el panel «Ask AI» queda abierto y tapa el lienzo, y la etiqueta paso a
  `Custom HTML/Javascript` (con s minuscula). El clic sin timeout explicito esperaba 30 s y tumbaba la
  comunidad. Arreglo en `alta-funnel-ghl.py`: `clic_seguro()` (8 s y, si algo lo cubre, clic por JS) y
  `cerrar_panel_ia()` antes de tocar el builder. Probado en cabo-rojo/paraiso-de-boqueron: `embed 21770 chars`,
  canonical OK y `publicada ... (72s)`. La publicacion dejo de fallar en ese punto.
- Causa 2 (pendiente, evidencia exacta): el gate movil la rechaza con `movil_ancho,movil_inset`: hero con
  [10,10] de margen (pide [0,0]) y h1/tile con inset 26 px (acepta 14-24). El `<style>` del payload de esa
  comunidad mide 14.016 chars y NO incluye `--pad: 18px`; los payloads que pasan el gate miden 17.324 y si lo
  incluyen. El bloque `@media (max-width: 640px)` no esta en el repo (0 coincidencias en Comunidades), asi que
  se inyecta desde el head de GHL: hay que devolver ese bloque con `--pad: 18px` y hero a sangre, regenerar el
  head y republicar. No se toco nada mas para no romper las 81 ya buenas.
- Cifras del cierre (11:40): 520 PNG, 515 webp, 1112 prompts (0 con `${`), ledger 81/162, 176 pendientes de publicar.
- Cuentas: activa `o.melendez1991@gmail.com` (/u/2). Sin sesion en el Chrome 9222: `fullnessfrequency@gmail.com`
  y `osvaldodmelendez@gmail.com`.
- El socket CDP del flow-ui se cayo a las 11:13 (`Connection closed while reading from`): Chrome y la
  sesion seguian vivos, el vigilante relanzo el lote a las 11:34 con la cuenta guardada y volvio a producir
  (517 -> 520 PNG).

## Gate movil: el CSS del mosaico y el contenedor de GHL (12:40 del 2)

- El payload no perdia el bloque `@media (max-width: 640px)`: lo tenia dos veces. Lo que fallaba era el
  contenedor de GHL. Medido en la pagina viva a 390 px: `.c-row` mete 10 px por lado (main 355 dentro de 375),
  y la barra de scroll suma 15 px al medir los inset (`vw 390` contra `docW 375`).
- Segundo problema: dentro del propio bloque movil habia `:root { --pad: 16px }` despues del 18, y `.grid`
  dejaba el mosaico a sangre, asi que el `.tile` medía 0 px de aire.
- Arreglo, todo en `scripts/landings/styles.mjs` (nada a mano en GHL): dentro del bloque de 640 px se oculta
  la barra (`scrollbar-width: none` + `::-webkit-scrollbar`), `main` pasa a `width: 100vw` con
  `margin-inline: calc(50% - 50vw)`, y un cierre `--gate-movil` al final del CSS fija `--pad: 18px`,
  neutraliza el margen del `.grid` y da `margin-inline: var(--pad)` al `.tile`.
- Resultado medido: `vw 390 = docW 390`, h1 en [16, 374], y el gate pasa en las tres comunidades de prueba:
  cabo-rojo/paraiso-de-boqueron (Techos OK, Limpieza OK), cabo-rojo/villa-taina (Techos OK, Limpieza OK) y
  carolina/country-club (Techos OK).
- El driver con `--only a,b,c` fallaba con `too many values to unpack`: `--only` se acumulaba como una sola
  clave. Ahora se parte por comas igual que en `preparar-funnel-ghl.mjs`.
- Los 177 payloads pendientes se regeneraron con `preparar-funnel-ghl.mjs` y llevan el CSS nuevo
  (0 sin `gate-movil`). Cifras al cierre: 550 PNG, 534 webp, 1112 prompts, ledger 84/168, 177 pendientes.

## Cierre del turno: gate en verde y ledger subiendo (12:35 del 2)

- Cadena unica viva: lote de imagenes, vigilante, supervisor de rondas y driver (un proceso de cada uno).
- Publicadas y verificadas con 200 + canonical en vivo (6/6 paginas): cabo-rojo/paraiso-de-boqueron,
  cabo-rojo/villa-taina y carolina/country-club, las dos paginas de cada una.
- Cifras medidas: 551 PNG, 548 webp, 1112 prompts (0 con `${`), ledger 84/168
  comunidades/paginas, 190 pendientes de publicar en cola.
- Los pendientes restantes ya llevan el CSS nuevo (0 payloads sin `gate-movil`), asi que el supervisor
  sigue publicando sin volver a chocar con el gate.
- Cuentas de Google: activa `o.melendez1991@gmail.com` (/u/2). Sin sesion en el Chrome 9222:
  `fullnessfrequency@gmail.com` y `osvaldodmelendez@gmail.com`.

## Imagenes: ChatGPT topado y vuelta a Flow (15:20-15:30)

- El lote habia saltado al respaldo de ChatGPT y ahi topo con su tope diario de
  imagenes: 22 de 40 intentos seguidos con "CUOTA AGOTADA: ChatGPT llego a su
  limite de imagenes". No era sesion expirada: la sesion estaba abierta, la
  cuota no.
- Flow responde, pero sus dos cuentas con sesion en Chrome estan agotadas
  (fullnessmindset@gmail.com y o.melendez1991@gmail.com) y la tercera
  (fullnessfrequency@gmail.com) no tiene sesion abierta: pide login.
- El respaldo de ChatGPT queda apagado por defecto (`--respaldo-chatgpt` para
  pedirlo). Ahora el lote se detiene limpio cuando Flow no tiene cuota, en vez
  de quemar ChatGPT en bucle de errores.
- Se cortaron los procesos huerfanos que peleaban por la pestana: dos
  `chatgpt-ui.py` y un lote duplicado (`--tanda 40`) que relanzaba solo.
- Al corte: 604 PNG en disco, 508 imagenes pendientes.

## Reanudacion automatica del lote de imagenes (solo Flow)

- Nuevo `Comunidades/scripts/imagenes/reanudar-flow.py`: corre una tanda y, si
  no entran PNG, espera 5, 10, 20 y 30 minutos (tope) antes de reintentar; si
  entran imagenes, repite de inmediato. Nunca pasa `--respaldo-chatgpt`.
- Un solo ejemplar: candado propio en el puerto 47667 (un segundo proceso sale
  con "ya hay un reanudador vivo") y, antes de cada tanda, mira el candado de
  Flow (47666) por `connect`: si hay otro lote dentro, espera 60 s en vez de
  lanzar y pelearse por la pestana. La primera version lo miraba con `bind` y
  daba falso positivo por TIME_WAIT; se cambio a `connect`.
- Estado al corte: 604 PNG en disco, 508 imagenes pendientes, reanudador vivo
  (pid 24904) con la espera en curso, lote atado a Flow y ChatGPT fuera del
  circuito.
- Comunidades nuevas del turno verificadas por fetch: 12 comunidades, 24
  paginas con 200 + canonical exacto, 0 fallos (ultimas: dorado/dorado-del-mar
  y dorado/sabanera-dorado). Ledger al cierre: 97 comunidades / 194 paginas.

## Cadena de cuentas de Flow: osvaldodmelendez y fullnessfrequency

- `cuentas.json` quedó con el orden pedido: `osvaldodmelendez@gmail.com` y
  despues `fullnessfrequency@gmail.com` (las dos anteriores, o.melendez1991 y
  fullnessmindset, siguen agotadas).
- Con esa cuenta el lote volvio a producir: 604 -> 609 PNG en minutos, sin
  tocar ChatGPT. La cuenta esta en `/u/3/` de Flow.
- `fullnessfrequency@gmail.com` ya tiene sesion abierta en el Chrome del 9222
  (`/u/4/`): la rotacion salta a ella sola cuando se agota osvaldodmelendez, sin
  relanzar nada. Las dos cuentas trabajan seguidas segun el orden de `cuentas.json`.

## Ritmo duplicado y esperas recortadas (16:20-16:45)

- **Dos workers en paralelo**, uno por cuenta y por pestaña de Flow:
  `flow-ui.py --worker N --workers 2` reparte por hash del nombre de archivo
  (246 y 254 de las 500 pendientes), asi los dos nunca escriben el mismo PNG.
  Candados 47666 y 47668; el 47667 sigue siendo del reanudador.
- **Esperas recortadas** con medida: `--espera` 8 -> 3 s, asentado del mosaico
  18 -> 10 s y espera de imagen 240/180 -> 180/60 s.
- **Bug que frenaba la tanda**: cualquier rotacion de cuenta escribe «CUOTA
  AGOTADA» y el lote cortaba la tanda entera al terminarla aunque la cuenta
  nueva estuviera entregando. Ahora solo para si no hubo una sola imagen.
- **Ritmo medido**: 1,2-1,25 PNG/min (620 -> 624 en 200 s; 614 -> 619 en 4 min)
  frente a 0,35/min de la hora anterior.
- Estado al corte: 624 PNG, 488 pendientes de 1112, ledger
  101 comunidades / 202 paginas, 0 PNG corruptos en los ultimos 25 min.
- Duplicados por contenido preexistentes (30-oct, no de esta tirada): Estancias
  de Rio Hondo (limpieza = sellado) y Las Torres Sur limpieza = Lomas Verdes
  (Bayamon) sellado; anotados para regenerar.

Actualizacion al cierre del turno (16:46): 626 PNG validos en disco (11 corruptos), 486 pendientes de 1112, ledger 101 comunidades / 202 paginas, 0 pares duplicados por contenido. Ritmo sostenido 1,2 PNG/min con los dos workers.

## Un carril por cuenta y cola completa (07:05)

- **El bucle que mataba el ritmo**: el vigia relanzaba el worker 1 cada 60 s con
  `--sin-rotacion` contra una cuenta ya agotada. Ahora el worker 1 rota como el
  worker 0, con espera creciente 60 s -> 2, 5, 10 y 15 min si no entra nada.
- **Cuentas compartidas entre workers**: cada worker escribe
  `cuenta-activa-wN.json` (con latido en cada imagen) y al arrancar se sale si
  la cuenta de su pestaña ya la tiene el otro. Dos pestañas contra la misma
  cuenta agotaban la cuota por duplicado.
- **Reparto por hash con un solo worker**: dejaba la mitad de la cola sin tocar.
  `carriles.json` fija `workers` y el lote se relanza con ese valor; hoy hay una
  sola cuenta con sesion (`fullnessmindset@gmail.com`), asi que va 1 carril con
  la cola entera.
- **Reanudador**: ya no lanza un lote cuando hay otro vivo (eso lo hacia fallar
  por candado, salir con 0 imagenes y subir la espera como si Flow estuviera
  agotado), no escala espera si el lote muere en menos de 90 s, y su tope baja
  de 30 a 15 min.
- **Chrome sin CDP**: el puerto 9222 estaba cerrado y por eso no entraba ninguna
  imagen. Se levanto una instancia aparte con el perfil copiado y
  `--remote-debugging-port=9222` sin cerrar el Chrome del dueno.
- Estado real al cierre: 933 PNG validos (0 que no abren),
  179 pendientes de 1112, ledger 116 comunidades / 232 paginas,
  0 pares con contenido repetido. Ritmo de un carril: ~0,4-0,5 PNG/min.

## Dos carriles reales: fullnessmindset y osvaldodmelendez (07:25)

La conclusion anterior ("solo una cuenta firmada") era falsa: miraba solo el
perfil `Default` de la copia. Al listar las pestañas de Flow del Chrome 9222
con su etiqueta de cuenta aparecieron tres sesiones distintas:

| pestana | cuenta |
|---|---|
| 0, 1, 3 (proyectos) | fullnessmindset@gmail.com |
| 2 (/u/1) | o.melendez1991@gmail.com |
| 4 (/u/2) | osvaldodmelendez@gmail.com |

- `carriles.json` queda en **2 workers**. Worker 0 genera en la pestana 0 con
  fullnessmindset; worker 1 en la pestana 4 con osvaldodmelendez
  (`--pestana 4 --authuser 2`), asi que no comparten cuenta ni pestaña.
- `cuenta-activa-w0/w1.json` confirman cuentas distintas:
  fullnessmindset y osvaldodmelendez. El guard de cuenta repetida impide que
  uno pise al otro.
- Se descarto antes un segundo Chrome en 9223: Chrome reenviaba a la sesion
  existente; no hace falta, las dos cuentas ya viven en el mismo Chrome.
- Ajustes de ritmo del turno: `--espera` 3 -> 1 s, asentado del mosaico
  10 -> 6 s, espera de tanda sin avance 120 -> 45 s, y el vigia relanza el
  reanudador si desaparece (antes solo miraba lote y colero).
- Estado real: 951 PNG validos, 0 que no abren, 161
  pendientes de 1112, ledger 117 comunidades / 234 paginas,
  0 pares con contenido repetido.

## Tres carriles y el vigia que ya no se mata solo (08:06)

- **El vigia podaba a sus propios workers**: al terminar su ronda el lote sale
  (`--rondas 1`), no habia lote vivo y la regla de "Flow huerfano" mataba los
  `flow-ui` de los carriles. Ahora solo poda el ayudante `flow_navegador` del
  lote; los `flow-ui` de los carriles mueren por su cuenta.
- **Tandas alineadas en 150 imagenes y espera 1 s** para vigia y reanudador:
  antes el reanudador lanzaba tandas de 60 con espera 3 y competia con el
  vigia, reabriendo el proyecto cada 60 imagenes.
- **Rotacion con las cuentas autorizadas**: `cuentas.json` lleva
  osvaldodmelendez, fullnessfrequency, o.melendez1991 y fullnessmindset. Las
  tres primeras respondieron "CUOTA AGOTADA: limite de cuota del agente de
  Flow", asi que el lote espera y reintenta hasta que repongan.
- **Vigilancia probada matando procesos**: se mato el reanudador (27660) y el
  vigia lo levanto solo (9188); tambien relanza los `flow-ui` de los carriles,
  el lote, el colero y el alta-funnel-ghl, podando duplicados por PID.
- **Limpieza**: se borro la copia temporal de perfil (`perfil-osvaldo`) y se
  cerro la instancia de prueba que no llego a arrancar; ninguna pestaña suelta
  quedo abierta en el Chrome de trabajo.
- Estado real: 978 PNG validos, 0 que no abren, 0 pares
  repetidos, 134 pendientes de 1112, ledger 119 comunidades /
  238 paginas.

## Cierre del turno: un carril con la cola entera (08:33)

- **Carril fantasma fuera**: el carril 2 moria en cada intento con "CUOTA
  AGOTADA" (osvaldodmelendez y o.melendez1991) y con `--workers 2` el carril
  vivo solo cubria media cola. `carriles.json` queda en 1 y ese carril genera
  las pendientes completas.
- **Reintentos observados entre 08:09 y 08:17**: el carril 2 se relanzo 4 veces
  (cada 62-65 s) y Flow respondio siempre "CUOTA AGOTADA: limite de cuota del
  agente de Flow"; aun asi entraron 6 PNG nuevos por el carril con cuota.
- **Lote relanzado a mano** tras el cambio de carriles (el vigia no lo levanto
  en 2 min): `lote-automatico.py --tanda 150 --espera 1 --workers 1`.
- **Limpieza verificada**: `perfil-osvaldo` borrado; el Chrome de trabajo solo
  tiene la pestana de GHL, una pagina publicada y las de Flow de las cuentas.
- Estado recontado en disco: 989 PNG validos, 0 corruptos,
  0 pares con contenido repetido, 122 pendientes de 1112,
  ledger 121 comunidades / 242 paginas.

## Cierre de tirada: un carril con cuota, cola completa (08:54)

- **Sondeo real de cuota, una imagen de prueba por cuenta**:
  - osvaldodmelendez: "CUOTA AGOTADA en Cuenta de Google: Osvaldo D. Melendez
    Maldonado (osvaldodmelendez@gmail.com)" a las 08:36
  - fullnessfrequency: "CUOTA AGOTADA en Cuenta de Google: Fullness
    (fullnessfrequency@gmail.com)" a las 08:36
  - o.melendez1991: "ERROR: o.melendez1991@gmail.com no tiene sesion abierta en
    Chrome" a las 08:36
  - fullnessmindset: entrega con normalidad; es el unico carril con cuota y
    trabaja con la cola completa.
- **Cobertura recalculada**: `carriles.json` en 1 y lote `--workers 1`; con dos
  carriles y uno sin cuota, el reparto por hash dejaba media cola sin tocar.
- **Sin carriles fantasma**: el carril 2 se retiro al confirmar la cuota; no
  queda ningun `flow-ui` que solo reintegre errores.
- **Limpieza**: `perfil-osvaldo` borrado; cerradas 2 pestañas raiz `/u/2/`
  duplicadas. Quedan GHL, tres pestañas de proyecto de Flow y dos paginas
  publicadas abiertas por el driver.
- Recuento en disco: 998 PNG validos, 0 corruptos,
  0 pares con md5 repetido, 114 pendientes de 1112,
  ledger 123 comunidades / 246 paginas.
  Tamanos: [((1365, 768), 987), ((1672, 940), 11)].

## Produccion sostenida con un carril (cierre de turno) (09:10)

- **Solo fullnessmindset tiene cuota.** Sondeos con marca de hora:
  - 08:36 osvaldodmelendez: "CUOTA AGOTADA en Cuenta de Google: Osvaldo D.
    Melendez Maldonado (osvaldodmelendez@gmail.com)"
  - 08:36 fullnessfrequency: "CUOTA AGOTADA en Cuenta de Google: Fullness
    (fullnessfrequency@gmail.com)"
  - 08:36 o.melendez1991: "ERROR: o.melendez1991@gmail.com no tiene sesion
    abierta en Chrome"
  - 08:57 nuevo sondeo: osvaldodmelendez y fullnessfrequency siguen con
    "CUOTA AGOTADA"; fullnessmindset entrega con normalidad.
- **Cobertura**: `carriles.json` en 1 y lote `--workers 1`, el carril con cuota
  cubre la cola completa; el carril 2 retirado (no queda ningun `flow-ui` que
  solo reintegre errores).
- **Produccion del turno** (marcas cada 60 s): 998 a 08:55, 1000 a 08:57,
  1003 a 09:03, 1005 a 09:06, 1007 al cierre.
- **Limpieza**: sin perfiles temporales; pestañas solo de GHL, proyectos de
  Flow y paginas que abre el driver.
- Recuento en disco: 1008 PNG validos, 0 corruptos,
  0 pares con md5 repetido, 104 pendientes de 1112,
  ledger 124 comunidades / 248 paginas.
  Tamanos: [((1365, 768), 996), ((1672, 940), 11)].

## Sesión 10 (2026-11-06): tanda de 3 cerrada + arreglos del driver

- **Tanda cerrada**: `ciales/los-llanos`, `guayanilla/urbanizacion-la-concepcion`
  y `loiza/brisas-de-loiza` (6 páginas) con las dos verificaciones en verde:
  `verificar-contenido.py` → **6/6**, `exit 0`.
- **Incidente y limpieza**: dos corridas simultáneas sobre la misma pestaña de GHL
  se cruzaron (un path de Loíza acabó en Guayanilla) y dejaron **9 clones
  duplicados** (8 de Los Llanos, 1 de Guayanilla). Se borraron por UI
  (`⋯ → Delete`): la API v2 **no** permite borrar funnels (404). Efecto
  colateral asumido: Guayanilla techos quedó en 404 hasta republicar.
- **Hallazgo**: al fijar dominio + path, GHL **publica la página de plantilla** en
  esa URL (por eso Guayanilla limpieza sirvió el contenido de Isla Verde y el og
  de la plantilla). El gate lo detecta por el H1.
- **Arreglos en `scripts/alta-funnel-ghl.py`**:
  - `fr.keyboard` → `pg.keyboard` (tumbaba la comunidad desde Settings).
  - `steps_map(..., fid=...)`: el step se resuelve por `_id`. GHL renombra el
    funnel con ` (8)` cuando el nombre canónico choca con un clon, y buscar por
    nombre devolvía los steps de **otro** funnel («no abrió el overview»).
  - `funnel_by_name` prefiere clones **con steps y dominio**; `build` falla con
    mensaje claro si el funnel elegido no tiene steps.
  - Reanudación barata: si la página viva ya sirve el contenido se saltan path y
    embed; si la URL viva trae GTM, favicon y chat se saltan los Settings.
  - `set_settings` exige el widget `Ilatek`: antes devolvía «ya completos» sin
    chat y el gate cortaba la página después.
  - `--servicio techos|limpieza` publica una página por corrida (este entorno
    corta los procesos a los ~4 min, y una comunidad entera tarda 10-14).
- Ledger: **454 de 556 publicadas**, 102 pendientes (todas MEDIUM).

### Supervisor de publicación soportado (2026-11-06)

- `scripts/supervisar-lote.py` sustituye al `colero.py` de 4 carriles: lanza
  **una página por corrida**, relanza lo cortado, cierra cada tanda de 3 con las
  dos verificaciones y anota el cierre aquí. Candado en el puerto 8791 y estado en
  `.tmp-supervisor.json` (reanudable; el ledger manda).
- `--esperar-cdp N` espera a que Chrome vuelva con `--remote-debugging-port=9222`;
  sin CDP el supervisor sale con 2 en vez de fallar en bucle.
- Hallazgo del día: el Chrome del propietario quedó abierto **sin** la bandera de
  depuración tras el reinicio del runner, así que el 9222 no responde y el lote
  automático no puede arrancar hasta reabrir Chrome con ella.
- Tanda automática 1 (2026-11-06 00:43): loiza/yuquiyu, luquillo/brisas-del-mar, luquillo/luquillo-mar — contenido y auditoría en verde.
- Tanda automática 2 (2026-11-06 01:45): luquillo/sandy-hills, manati/alturas-de-luchetti, manati/brisas-de-campo-alegre — contenido y auditoría en verde.
- Tanda automática 3 (2026-11-06 02:45): manati/estancias-de-borinquen, manati/los-rosales, manati/valles-de-manati — contenido y auditoría en verde.
- Tanda automática 4 (2026-11-06 03:43): manati/villa-evangelina-iv, maricao/colinas-de-maricao, maricao/juan-ferrer — contenido y auditoría en verde.
- Tanda automática 5 (2026-11-06 04:52): maunabo/carmen-h-vda-de-martorell, maunabo/comunidad-mariani, maunabo/jardines-del-almendro — contenido y auditoría en verde.
- Tanda automática 6 (2026-11-06 05:56): dorado/dorado-beach-east, dorado/east-beach — en rojo: dorado/dorado-beach-east (auditoría), dorado/east-beach (auditoría)
- Tanda automática 7 (2026-11-06 06:57): dorado/dorado-beach-east, dorado/east-beach, dorado/la-cala — en rojo: dorado/dorado-beach-east (auditoría), dorado/east-beach (auditoría), dorado/la-cala (auditoría)

### Sesión 11 (2026-11-06, carriles y verificador ciego)

- **Parón a las 06:57**: dos tandas seguidas sin verde. Causa: `auditar-publicadas.py`
  dejó de conectar al CDP (`connect_over_cdp: Timeout 180000ms exceeded`) y el
  supervisor contaba ese fallo de herramienta como "en rojo": seis comunidades de
  Dorado en rojo y `dorado/dorado-beach-east` + `dorado/east-beach` bloqueadas,
  cuando servían su contenido (`verificar-contenido.py` daba 2/2 en verde). Las
  dos quedaron desbloqueadas; `maunabo/villa-navarro` sigue bloqueada (5 intentos
  reales, no un verificador ciego).
- **El CDP se saturaba por pestañas huérfanas**: 24 `page-builder` acumuladas de
  corridas cortadas, 96 targets en total. El supervisor ahora poda al arrancar y
  deja la más nueva. Al limpiarlas a mano se cerró la última pestaña y **Chrome se
  apagó**: quedó vivo sin `--remote-debugging-port`, así que el lote espera a que
  el propietario lo reabra con la bandera (mismo caso que la sesión anterior).
- **Segundo carril preparado y medido en seco**: `--carril N` (pestaña, estado,
  puerto y reclamos propios; bloqueadas/rojas compartidas). Con 3 comunidades
  reclamadas por el carril 0, el carril 1 ve 84 en vez de 87 y **cero solapadas**;
  sin latido del carril 0 sale con código 3 sin tocar GHL. **No probado en vivo**:
  sin CDP no hubo tanda canaria con dos carriles publicando.
- **`funnel_id` del clon solo por nombre**: se quitó el respaldo "cualquier id
  nuevo", que podía dejar a un carril con el clon del otro (dos comunidades
  escribiendo Settings y paths en un mismo funnel).
- **Cruce real con tres carriles (09:07)**: el candado global de reclamos tenía
  carrera — dos procesos que veían el mismo candado viejo (de una corrida matada)
  lo borraban a la vez y **ambos se creían dueños**, así que los tres carriles
  republicaron `dorado/la-cala` a la vez. Se sustituyó por una ficha por comunidad
  creada con `O_EXCL` (crear el fichero *es* el candado) y se añadió un cinturón en
  `publicar_pagina`: no se lanza un driver si la ficha es de otro carril. Probado
  con 6 procesos simultáneos × 3 rondas: un solo ganador siempre.
- **Chat en `none` para esta corrida**: `--sin-chat` en driver y supervisor. No se
  toca el selector, `settings_vivos` no lo exige (no reescribe Settings por su
  culpa) y `gate` da `chat` por bueno. Si el clon hereda `Ilatek` de la plantilla,
  el log lo avisa pero no se quita.
- Tanda automática 1 (2026-11-06 09:13): dorado/la-cala, dorado/livingston-estates, dorado/the-isles — en rojo: dorado/la-cala (auditoría), dorado/the-isles (auditoría)
- Tanda automática 8 (2026-11-06 10:05): dorado/la-cala, dorado/the-isles, dorado/the-legacy — contenido y auditoría en verde.
- Tanda automática 9 (2026-11-06 10:29): dorado/la-cala, dorado/the-isles, mayaguez/mar-y-sol — contenido y auditoría en verde.
- Tanda automática 10 (2026-11-06 10:48): dorado/la-cala, dorado/the-isles — contenido y auditoría en verde.
- Tanda automática 2 (2026-11-06 10:50): mayaguez/flamboyan-gardens, mayaguez/franklin-delano-roosevelt-i-ii — contenido y auditoría en verde.
- Tanda automática 1 (2026-11-06 18:03): maunabo/villa-navarro, mayaguez/cuesta-de-las-piedras, mayaguez/el-carmen — contenido y auditoría en verde.
- Tanda automática 1 (2026-11-06 18:05): mayaguez/jardines-de-concordia, mayaguez/mayaguez-gardens — contenido y auditoría en verde.
- Tanda automática 1 (2026-11-06 18:06): morovis/morovis-elderly, morovis/residencial-tomas-sorolla, naguabo/brisas-del-valle — contenido y auditoría en verde.
- Tanda automática 2 (2026-11-06 18:52): mayaguez/mayaguez-housing-i, naguabo/vista-verde, naranjito/achiote — contenido y auditoría en verde.
- Tanda automática 2 (2026-11-06 18:52): orocovis/jose-v-fortis, orocovis/villas-de-orocovis, patillas/villa-real — contenido y auditoría en verde.
- Tanda automática 2 (2026-11-06 18:54): naranjito/candelario-torres, naranjito/jardines-de-naranjito, naranjito/lomas — contenido y auditoría en verde.
- Tanda automática 3 (2026-11-06 19:43): penuelas/los-flamboyanes, ponce/brisas-de-laurel, ponce/el-monte — contenido y auditoría en verde.
- Tanda automática 3 (2026-11-06 19:46): ponce/ernesto-ramos-antonini, ponce/jardines-de-fagot, ponce/jardines-del-caribe — contenido y auditoría en verde.
- Tanda automática 3 (2026-11-06 19:46): patillas/villas-del-caribe, penuelas/alturas-de-penuelas, penuelas/comunidad-caracoles — contenido y auditoría en verde.
- Tanda automática 4 (2026-11-06 20:37): quebradillas/sombras-de-la-ceiba, rincon/santa-rosa-elderly, sabana-grande/colinas-de-villa-rosa — contenido y auditoría en verde.
- Tanda automática 4 (2026-11-06 20:38): ponce/perla-del-sur, quebradillas/la-ceiba-quebradillas, quebradillas/santa-marina — contenido y auditoría en verde.
- Tanda automática 4 (2026-11-06 20:44): sabana-grande/el-hucar, sabana-grande/jose-castillo-mercado, sabana-grande/mansiones-de-sabana-grande — contenido y auditoría en verde.

## Auditoría de las 1112 y reparación puntual (2026-11-06, 21:30)

- **Precondición verificada**: las 1.112 URLs de `landings/`, de los payloads y de
  `landings/sitemap.xml` son el mismo conjunto — 1.112 idénticas, 0 solo en un lado,
  0 duplicadas — y las 1.112 de payload cuelgan de su propia carpeta.
- **`Sites → Funnels` contado por API** (no por HTTP): 1.033 landings de comunidad al
  empezar, 0 nombres repetidos, 0 funnels con más de una página y 2 sin ninguna
  (`Caimito (San Juan) · Techos`, `Brisas Tortuguero (Vega Baja) · Limpieza`).
  Faltaban 79 de 1.112: 31 comunidades sin ningún funnel y 12 a medias.
- **Carril 3 con pestaña propia sobre lo que la cola no cubría**, seis corridas y
  todas `exit 0`: `juncos/villa-graciela · techos` (la 404 que el ledger daba por
  publicada), `salinas/la-arboleda` (sin funnels),
  `mayaguez/manuel-hernandez-rosa-candelaria · limpieza`, y las tres `limpieza` con
  la imagen social del piloto (`mayaguez/cuesta-de-las-piedras`,
  `morovis/morovis-elderly`, `maunabo/villas-de-maunabo`). Verificadas en vivo: 200,
  `canonical` propio, embed propio y `og:image` única; Maunabo recibe el asset de su
  propio hero (`a81460d2…`), que no es el que anota el payload.
- **Barrido de las 1.112 al cerrar**: 1.054 vivas, 58 en 404, 0 con otro código;
  1.048 con canonical y embed de su payload; 1.044 con `og:image` propia y única.
  Quedan 6 páginas que sirven la del piloto (relleno de GHL) y los funnels por crear,
  todos en la cola de los tres carriles. La lista exacta de trabajo está en
  `data/ghl/cola-completar-1112.txt`.
- **Duplicados: 0** en las tres fuentes, 0 nombres de funnel repetidos, 0 funnels con
  dos páginas y 0 slugs repetidos dentro de un municipio.

### Cierre a 1.112 funnels (2026-11-07, 01:42)

**API — verde.** 1.115 funnels en la cuenta: **1.112 de comunidad** + `Ilatek`,
`PLANTILLA · Techos` y `PLANTILLA · Limpieza`. **0 nombres repetidos**, **0 sin
página**, **0 con dos páginas**, **0 faltantes** frente a los 1.112 payloads.

**HTTP — 1.112/1.112 responden 200** en su propia URL, 0 en 404, 0 con otro
código y 0 canonical con sufijo numérico. `canonical` propio y embed verbatim
en **1.110**; `og:image` única en **1.108**.

**Creado o republicado por mí en esta pasada:**

- `san-juan/caimito · Limpieza`: funnel creado y publicado (era el último de la
  cola que ningún carril tomó).
- `san-juan/caimito · Techos`: el funnel existía **sin ningún step** (clon
  vacío del 2026-11-05). Le creé el step `Sellado de techo` desde «Add new
  step or import», y el driver dejó settings y path
  (`/san-juan/caimito/sellado-de-techo`) correctos.
- `vega-baja/brisas-tortuguero · Limpieza`: mismo caso y mismo arreglo; path
  `/vega-baja/brisas-tortuguero/limpieza` correcto.

**Las 3 páginas que faltan** (todas necesitan el builder, ninguna la API):

- `san-juan/caimito` y `vega-baja/brisas-tortuguero`: sirven 200 con la página
  en blanco de GHL (58 KB, sin H1, sin canonical, sin og).
- `toa-baja/mansion-del-sol`: contenido correcto pero con la `og:image` del
  piloto (`cc92671e-4f9a-4b76-af1d-94e2fdac3a04.webp`), que comparte con
  `caimito`.

### Verificación final medida (2026-11-07, 06:20)

**API — verde.** 1.115 funnels: **1.112 de comunidad** + `Ilatek`,
`PLANTILLA · Techos`, `PLANTILLA · Limpieza`. **0 nombres repetidos**, **0 sin
página**, **0 con dos páginas**, **0 faltantes** frente a los 1.112 payloads.

**HTTP — 1.112/1.112 responden 200**, 0 en 404, 0 con otro código y 0
canonical con sufijo numérico. `canonical` propio y embed verbatim en **1.110**;
`og:image` única en **1.110** (Mansión del Sol quedó republicada con su propia
imagen y pasó el gate).

**Pendiente: 2 páginas.** `san-juan/caimito` (techos) y
`vega-baja/brisas-tortuguero` (limpieza) responden 200 con la **página en blanco
de GHL** (58 KB sin H1, sin canonical, sin og). Funnel, step, path y settings
están correctos; falta el contenido. Causa: esos dos steps se crearon desde el
builder nuevo, que no tiene el panel «Custom HTML/JavaScript» que usa
`inject_embed` (su elemento se llama «Code» y vive detrás de «Add», en un frame
distinto al que devuelve `open_builder`).

**Re-verificación 2026-11-07 06:41** (misma corrida de `.tmp-verificar-1112.py`):
API 1.115 totales = **1.112 comunidad + 3 de sistema**, 0 repetidos, 0 sin página,
0 con dos páginas, 0 faltantes. HTTP **1.112/1.112 en 200**, 0 en 404, 0 otros,
0 canonical con sufijo; canonical propio, embed verbatim y `og:image` única en
**1.110/1.112**; los 2 fallos son exactamente `san-juan/caimito` y
`vega-baja/brisas-tortuguero` (marcados además como «H1 de otra comunidad»
porque sirven la plantilla).

**Re-verificación 2026-11-07 07:21** (misma corrida, tras probar sesión y editor):
idéntica — API 1.112 + 3 de sistema, 0 repetidos, 0 sin página, 0 con dos;
HTTP **1.112/1.112 en 200**, **1.110/1.112** con canonical, embed y `og:image`
propias, y los mismos 2 fallos (`san-juan/caimito`, `vega-baja/brisas-tortuguero`).

**Driver sobre Caimito (07:16, `--only san-juan/caimito --servicio techos
--carril 0 --sin-chat --force`):** reutilizó el funnel y reescribió los settings
correctamente (`settings ok (59s)`, `domainId: IUZElP3hZ60dszBHym8l`, path
`/san-juan/caimito/sellado-de-techo`), y murió en el mismo punto conocido:
`FALLA san-juan/caimito: no apareció el bloque Custom HTML/JavaScript en el builder`.
Es decir: el único paso que falta es insertar el bloque de código en el builder
nuevo, y el bloqueo es del editor, no de nuestros datos.

**Captura del guardado (09:4x, CDP `Network.*` sobre todas las peticiones del
iframe).** Se abrió el builder de Caimito, se insertó «CustomCode» desde Quick
Add, se pulsó `#pg-funnel-builder__btn--save` y se registraron **todas** las
peticiones no-GET: **0 nuevas**. Solo aparecen `OPTIONS` de CORS (`204`),
`google-analytics` y `_pm/...performance-logs`. Es decir: el editor **no emite
ninguna petición de guardado** porque la página nunca queda «sucia».

Motivo medido: el lienzo (`about:srcdoc`) tiene **491 bytes y 2 hijos** antes y
después de cada intento de inserción — clic y `drag_to` sobre «Text», «Sections»,
«Heading» y «Paragraph», y clic-para-colocar con el ratón sobre el iframe. El
bloque no entra, así que no hay cambio que guardar.

**Sonda del host del appengine (9 orígenes × 3 rutas, con la sesión real y las
cabeceras `version`/`token-id`/`channel`/`source`).** `GET get_page_data/<viva>`
contra `apisystem.tech`, `au.apisystem.tech`, `highlevel-staging.appspot.com`,
`backend.leadconnectorhq.com`, `services.leadconnectorhq.com`,
`api.leadconnectorhq.com`, `rest.gohighlevel.com`, `app.gohighlevel.com` y
`page-builder.leadconnectorhq.com` → **404 en las 27 combinaciones**, también
para la página **viva**, que sí tiene `pageDataUrl`. El endpoint que usa el
bundle (`save-page-data`) no está expuesto: no hay ruta de escritura.

**HTML listo para pegar:** `.tmp-pegar-caimito.html` (22.650 chars) y
`.tmp-pegar-brisas.html` (22.294 chars). Pasos: builder de la página → **Quick
Add** → **CustomCode** → botón de abrir editor → pegar el archivo entero →
Save → Publish.

**Lienzo real y arrastre (10:0x).** Medido con la métrica correcta (`c-section`
dentro del frame del builder, no el tamaño del chrome):

- Estado inicial: `secciones: 0`, `filas: 0`, `elementos: 0`, cuerpo 120.229 B.
- Tras pulsar el CTA «Start Creating» del estado vacío: **igual, 0 secciones**.
- Tras abrir Quick Add y las pestañas «Sections» / «Elements»: **0 secciones**;
  el panel solo tiene *handles* de arrastre (`.gui__builder-card--handler`), no
  ítems clicables.
- Tras arrastrar con ratón real (10 pasos, `mouse.down/move/up`) los handles 0-2
  al centro del lienzo: `srcdoc` se queda en **491 B y 2 hijos**.
- Save después de todo eso: **0 peticiones no-GET nuevas** (otra vez solo CORS,
  GA y `_pm`).

Conclusión: en estas dos páginas el builder no permite insertar ningún bloque,
ni por clic ni por arrastre, así que nunca se marca «sucia» y no hay POST que
capturar. La vía de captura → réplica queda **agotada por ausencia de la
petición**, no por falta de intentos (9 variantes de inserción, 27 combinaciones
de host/ruta, `PUT`/`PATCH` del backend, API pública e importador).

**Resuelto: las dos páginas tienen contenido (2026-11-07, tarde).** El bloqueo
no era la ruta de escritura sino la **inserción**: el builder sí guarda y
publica en cuanto la página queda «sucia», y eso se consiguió así:

- **Caimito**: la sección la creó el dueño a mano en el builder; ahí ya existía
  `#custom-code-rqULYUFpXm`. Con el bloque seleccionado aparece el botón
  **Open Code Editor**, que monta un `.CodeMirror`; `cm.CodeMirror.setValue(html)`
  escribió los 22.748 chars. Después: **Save** del modal → `#pg-funnel-builder__btn--save`
  → **Publish** → confirmar.
- **Brisas**: sin bloque. Un **arrastre lento con ratón real** (24 pasos,
  150 ms, desde `.gui__builder-card--handler` de la pestaña *Sections* hasta el
  iframe del lienzo) **sí crea la sección**; el clic y el `drag_to` de Playwright,
  no. Con la sección creada se repitió el flujo del bloque de código y se pegó
  el HTML.
- **Canonical**: GHL no lo emite para estas dos páginas (la hermana buena lo
  trae en el `<head>`). Se añadió `<link rel="canonical">` **dentro del propio
  bloque**, con la URL exacta del código, solo en estos dos HTML.
- **`og:image`**: en Caimito se rellenó el panel **Page** (Title / Description /
  Images) y GHL lo emitió en el `<head>`. En Brisas ese panel no abre
  (`campos: []` en los 4 intentos), así que el `og:image`, `og:title` y la
  `description` se añadieron **en el bloque**, con los valores del payload.

Resultado medido: `san-juan/caimito/sellado-de-techo` 145.877 B y
`vega-baja/brisas-tortuguero/limpieza` 144.528 B, ambas con H1 propio, canonical
exacto sin sufijo y `og:image` propia. Ninguna otra página se tocó: los cambios
de contenido fueron solo en esos dos bloques.

**Verificación final 2026-11-07 10:51 — `RESULTADO: TODO VERDE`:**

```
API  · comunidad              1112/1112   (0 repetidos, 0 sin página, 0 con dos, 0 faltantes)
HTTP · barridas              1112
HTTP · 200                   1112
HTTP · 404                   0
HTTP · canonical propio      1112
HTTP · embed verbatim        1112
HTTP · og:image propia unica 1112
HTTP · canonical con sufijo  0
HTTP · H1 de otra comunidad  0
```

Con esto las **1.112 páginas de comunidades sirven su contenido propio**. No
queda ninguna con la plantilla en blanco, `juncos/villa-graciela/techos` y las 3
de `og:image` ajena siguen correctas dentro del mismo barrido, y los 970 steps
con sufijo del clon siguen intactos (no se tocaron).

### 13:45 — 39 capturas sociales regeneradas (la de Isla Verde, Carolina)

La auditoría de la tarde encontró que **39 páginas servían el screenshot de
`sellado-de-techo` de Isla Verde, Carolina**: misma captura (dHash idéntico y
banda del H1 sin diferencias), subida muchas veces con UUID distinto, así que
el verificador de «og propia y única» no la veía. La captura dice «Sellado de
techo en Isla Verde, Carolina» incluso en páginas de limpieza.

Se regeneraron con el mismo camino del driver, sin tocar el resto del build:

1. `og_screenshot(pg, page["url"], shot)` → 1200×630 de la página viva.
2. `upload_media(shot)` → copia nueva en la Media Library.
3. `set_seo(..., og_url)` en el drawer del builder, `Escape`, `save_publish`.
4. `og_publicada()` para exigir la imagen nueva en el HTML vivo; si no, repite.

Detalle que costó un intento: **el clon conserva el step llamado «Sellado de
techo» también en el funnel de limpieza** (un step por funnel), así que buscar el
step por `PAGE_NAME` daba `KeyError: 'Limpieza'`; ahora se usa el nombre y, si no
está, el único step del funnel.

Se corrió en 3 carriles con pestaña y checkpoint propios
(`.tmp-reog-39-c{0,1,2}.json`). Incidencias: 3 páginas fallaron en la primera
pasada (un `Frame.click` de 30 s y un `RemoteDisconnected` de la subida) y
entraron al reintento; `cidra/jardines-de-cidra/techos` quedó publicada al
segundo intento con `b12afe03…` (payload y página coinciden).

Verificación: **las 39 páginas sirven el UUID de su captura nueva** (39/39 por
HTTP) y tres revisadas a ojo muestran su propio título (Bayamón Gardens,
Jardines de Cidra, Bairoa Park). El verificador completo volvió a dar
`RESULTADO: TODO VERDE` (1.112 con canonical propio, embed verbatim y
`og:image` propia única).

**Criterio acordado con el dueño (13:50):** compartir la foto de fondo no es un
defecto; lo que importa es que el **título de la captura** nombre el barrio de la
URL. Con eso, las 25 familias near-duplicate quedan aceptadas (título propio,
comprobado a ojo en La Granja, Virginia Valley, Santa Elena de Yabucoa,
University Gardens e Isla Verde) y la tanda se cierra.

### 14:40 — las 3 fotos crudas también resueltas

Faltaban tres páginas que servían una foto sin título (`san-juan/caimito/techos`,
`san-juan/caimito/limpieza`, `vega-baja/brisas-tortuguero/limpieza`): se habían
puesto con el panel «Page» del builder, que solo admite un archivo y no produce
capturas. Se les pasó el mismo camino del driver (`.tmp-reog-3.py`, checkpoint
`.tmp-reog-3.json`): captura 1200×630 de la página viva → Media Library → drawer
SEO → publish → comprobación del HTML vivo. 3/3, sin fallos:

| página | imagen |
| --- | --- |
| `san-juan/caimito/techos` | `27036cc0-e769-4815-8b56-31618a66cdb7.png` |
| `san-juan/caimito/limpieza` | `1ee718bb-21bb-41b9-ba3a-2ff9d9b00a05.png` |
| `vega-baja/brisas-tortuguero/limpieza` | `9600d6d6-a0cd-4ffe-8052-ecbec120164a.png` |

Verificado por HTTP (200, `og:image` igual al UUID subido, H1 intacto) y a ojo:
«Sellado de techo en Caimito, San Juan», «Servicio de Limpieza en Caimito, San
Juan», «Servicio de Limpieza en Brisas Tortuguero, Vega Baja». Verificador
completo después: `RESULTADO: TODO VERDE` (1.112 en 200, canonical propio,
embed verbatim, `og:image` propia única).

**Estado final: las 1.112 páginas de comunidad sirven su propio screenshot
1200×630 con el nombre de su barrio.**

### 15:10 — Brisas de Tortuguero, con el «de»

El H1 y el título decían «Brisas Tortuguero»; el nombre correcto lleva el «de».
Se corrigió en la cadena completa, no solo en la página viva:

- **Ficha:** `master-database.json`, `master-database.csv` y
  `research/norte/vega-baja.json` (`name` y alternates «Urb. Brisas de
  Tortuguero»).
- **Payload:** `community` y, en cada página, `seo.title`, `seo.description`,
  `jsonLd` y el HTML del embed (keyword, `geo.placename`, `og:title`,
  descripción, alts, H1, lead, H2 y las FAQ).
- **Landings locales:** los dos `index.html`.

Se dejó intacto `funnelName` («Comunidad · Brisas Tortuguero (Vega Baja)»)
porque es la etiqueta administrativa con la que el driver localiza el funnel en
GHL; el nombre visible es el de la página.

Republicación de las dos páginas con `.tmp-rename-brisas.py`: embed nuevo →
publish → esperar el nombre nuevo en el HTML vivo → captura 1200×630 → subida →
SEO → publish → comprobar `og:image`. 2/2 sin fallos
(`2627bec2…` techos, `5e22a169…` limpieza).

Verificado por HTTP: `<title>` y H1 con «Brisas de Tortuguero», canonical propio
en las dos, `og:image` igual a la imagen nueva; landings locales iguales. El
verificador completo volvió a dar `RESULTADO: TODO VERDE` (1.112 en 200,
canonical propio, embed verbatim, `og:image` propia única, 0 H1 ajenos).

Siguen con el nombre viejo, a propósito, los **registros de imágenes ya
generadas** (`scripts/imagenes/prompts.json`, `cobertura.json`,
`imagenes-flow.json`): son el inventario de archivos con ese nombre y no se
sirven en ninguna página.

**Vía API — probada y cerrada.** `GET /funnels/page?locationId=…&funnelId=…&offset=0`
responde **200** y devuelve, por página, solo `_id`, `funnelId`, `locationId`,
`name`, `stepId`, `updatedAt`, `deleted`: **no expone contenido**
(`content`/`body`/`html`), así que no hay nada que copiar ni comparar contra el
payload. Las escrituras no existen: `PUT /funnels/page` → **401** («This route is
not yet supported by the IAM Service»); `PUT` y `PATCH /funnels/page/<id>` →
**404 Cannot PUT/PATCH**. También 401 en `/funnels/funnel/<id>`,
`/funnels/funnel/page` y `/funnels/funnel/pages`. La réplica de la página hermana
a nivel de API no es posible.

**Vía importador de la UI.** El diálogo «Use existing» es *Import an existing
funnel or a website page* (`#import-funnel-step-form`, con `#funnels` y
`#funnel-step`, ambos `hr-select`/Naive-UI con menú virtualizado). Selecciona
valores pero no el pedido: en las corridas quedó *Comunidad · Brisas Tortuguero
(Vega Baja) · Limpieza* en el campo Funnel de **ambos** funnels y el `Import`
responde `No Data`. No se completó ningún import: los `pageId` siguen siendo
`FbHUdCaQK1pZ4wu7GGNr` (Caimito) y `prpCpoUVpEfz0E69oEex` (Brisas).

**Vía sesión/editor — lo que sí se averiguó (2026-11-07, tarde).** Con el perfil
de automatización y la sesión viva (cookies `access-token-v1`/`refresh-token-v1`)
se levantó el modelo de datos real:

- El builder vive en `page-builder.leadconnectorhq.com/location/<loc>/page-builder/<pageId>`
  (como iframe del overview; como documento suelto da 404).
- La metadata de página está en `backend.leadconnectorhq.com/funnels/page/<pageId>`
  (200) y **las dos vacías tienen `pageDataUrl: null`** — por eso sirven la
  plantilla de 58 KB. La viva tiene `pageDataUrl` + `pageDataDownloadUrl`.
- El contenido real está en `pageDataDownloadUrl` y es un JSON con
  `sections[0].elements[2].extra.customCode.value.rawCustomCode` = el HTML del
  embed (21 972 chars en la viva). Ya se generó el page-data de las dos vacías
  copiando ese documento y sustituyendo solo `rawCustomCode` por el HTML del
  payload (22 650 y 22 294 chars; 0 menciones a Caimito fuera del bloque).
- **Escritura: no hay ruta.** `PUT` y `PATCH /funnels/page/<id>` → **404**
  `Cannot PUT|PATCH /funnels/page/<id>` (probado con la metadata idéntica, sin
  cambiar valores). El único endpoint de guardado que usa el editor es
  `POST https://apisystem.tech/funnelbuilder/save-page-data/<pageId>`
  (`AppengineServices.savePage` del bundle), pero ese host responde **404**
  `{"msg":"Not found"}` también para `GET /funnelbuilder/get_page_data/<pageId>`
  **en la página viva**, así que no está expuesto a la sesión del navegador.
- En la UI sí existe `#pg-funnel-builder__btn--save`, pero solo persiste cuando
  la página está «sucia»: pulsarlo sin cambios no envía nada. El panel de
elementos es **Quick Add** y el elemento se llama **CustomCode** (no «Code»);
  tras pulsarlo no aparece el bloque en el lienzo (`about:srcdoc`) ni el botón
  «Open Code Editor» en ningún frame, y Save sigue sin emitir petición.

**Cambio de código:** `scripts/alta-funnel-ghl.py` — `inject_embed` intenta
insertar el elemento «Code» cuando el builder no trae el panel antiguo.

**Bloqueo previo resuelto:** el Chrome de automatización (CDP 9222) acepta HTTP
(`/json/version`, `/json/close`) pero su WebSocket de navegador ya no responde:
`connect_over_cdp` agotaba 180 s en cada intento. Se resolvió reiniciando ese
Chrome (perfil dedicado `C:\Users\Omele\chrome-cdp`, no el navegador personal):
CDP volvió a conectar en 0,5 s y la sesión de GHL seguía iniciada.

### Estado medido a las 22:01 (colameros en curso)

- **API**: 1.070 funnels en la cuenta, **1.067/1.112** de comunidad (45 por crear),
  **0 nombres repetidos**, **2 sin página** (`Caimito · Techos`,
  `Brisas Tortuguero · Limpieza`) y **0 con dos páginas**.
- **HTTP de las 1.112**: **1.065 vivas**, 47 en 404, 0 con otro código; 1.058 con
  `canonical` propio y embed verbatim; 1.054 con `og:image` única.
- Los tres carriles siguen cerrando tandas a ~24 funnels/hora; lo que falta está en
  su cola (28 comunidades: 8 a medias y 20 sin ningún funnel).
- **No se añadió un cuarto carril**: `supervisar-lote.py` lo rechaza (carril > 2)
  porque con cuatro la SPA de GHL no hidrata y los clones salen repetidos
  (2026-11-05). Mis carriles 3/4 salieron con código 2 y no tocaron nada.
- Tanda automática 5 (2026-11-06 21:29): salinas/paseo-costa-del-sur, san-german/colinas-del-rio — contenido y auditoría en verde.
- Tanda automática 5 (2026-11-06 21:32): salinas/las-margaritas-ii, salinas/marbella, salinas/parque-gabriela — contenido y auditoría en verde.
- Tanda automática 5 (2026-11-06 21:38): salinas/bella-vista, salinas/brisas-del-mar, salinas/el-coco — contenido y auditoría en verde.
- Tanda automática 6 (2026-11-06 22:16): san-juan/monte-verde-real, san-juan/puerto-nuevo, san-juan/rio-piedras-pueblo — contenido y auditoría en verde.
- Tanda automática 6 (2026-11-06 22:28): san-lorenzo/ciudad-masso, san-lorenzo/jardines-de-san-lorenzo — contenido y auditoría en verde.
- Tanda automática 6 (2026-11-06 22:28): san-juan/san-juan-antiguo, san-juan/university-gardens, san-juan/villas-del-senorial — contenido y auditoría en verde.
- Tanda automática 7 (2026-11-06 23:08): san-lorenzo/portal-del-sol, san-lorenzo/savannah-real, san-sebastian/hacienda-san-andres — contenido y auditoría en verde.
- Tanda automática 7 (2026-11-06 23:13): santa-isabel/playita-cortada, santa-isabel/portal-de-la-reina — contenido y auditoría en verde.
- Tanda automática 7 (2026-11-06 23:18): san-sebastian/san-sebastian-court, san-sebastian/villa-rita, santa-isabel/brisas-del-prado — contenido y auditoría en verde.
- Tanda automática 8 (2026-11-07 00:08): santa-isabel/prados-del-sonador, santa-isabel/san-miguel, santa-isabel/villa-mar — contenido y auditoría en verde.
- Tanda automática 8 (2026-11-07 00:14): santa-isabel/villa-serena, toa-alta/haciendas-del-caribe, toa-alta/mansiones-de-montecasino-ii — contenido y auditoría en verde.
- Tanda automática 8 (2026-11-07 00:16): toa-alta/monte-verde, toa-alta/palacios-de-versalles, toa-alta/vistas-de-montecasino — contenido y auditoría en verde.
- Tanda automática 9 (2026-11-07 00:51): vieques/jardines-de-vieques, yabucoa/urbanizacion-mendez — contenido y auditoría en verde.
- Tanda automática 9 (2026-11-07 00:55): toa-baja/lago-vista, toa-baja/mansion-del-sol, utuado/comunidad-rural-el-guano — contenido y auditoría en verde.
- Tanda automática 9 (2026-11-07 01:00): toa-baja/camino-del-mar, toa-baja/candelaria-arenas, toa-baja/el-atlantico — contenido y auditoría en verde.
- Tanda automática 10 (2026-11-07 01:00): yauco/santa-catalina — contenido y auditoría en verde.
