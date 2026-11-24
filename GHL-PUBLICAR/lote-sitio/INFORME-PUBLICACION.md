# Informe de publicación — lote de 106 páginas del sitio

**Fecha de esta pasada:** 2026-11-22 (auditoría completa ejecutada después de crear las 8 cabeceras nuevas).
**Alcance:** `GHL-PUBLICAR/lote-sitio/por-pagina/` — 106 páginas del sitio que se pegan en GoHighLevel.
**Este documento sustituye al informe anterior y es la única fuente vigente.** Todo lo que afirma se midió en esta pasada sobre los bytes que están hoy en el disco.

## Veredicto

**SÍ: el lote de 106 está listo para pegarse en GHL ahora mismo.** Las 106 páginas se auditaron una a una contra sus bytes reales: manifiesto, tamaño, sha256, URL, acción, pie, FAQ, tokens e imágenes dan 106/106 y **0 problemas**. `sync-artifacts --check` da **106 artefactos / 0 problemas** y la cabecera/pie (`verify-page-shell`) está verde.

Lo único que cambia respecto al informe anterior son **8 páginas que ahora tienen cabecera propia** (garantía, política de privacidad, términos y condiciones y reseñas, en español e inglés). Para esas 8 se pegan **dos** fragmentos: la cabecera en **SEO → Custom Head** y el cuerpo en **Custom HTML**. Las otras 98 se pegan igual que siempre: solo el cuerpo.

Lo que **no** se puede hacer desde este entorno: entrar en GHL (no hay sesión), pegar nada, publicar, ni validar las tarjetas sociales en los depuradores de Facebook/LinkedIn. Nada se ha publicado ni commiteado.

---

## 1. Cómo publicar, paso a paso (sin terminal)

### Dónde están los archivos
- **Carpetas:** `GHL-PUBLICAR/lote-sitio/por-pagina/<carpeta>/`. Cada carpeta trae `1-PAGINA.txt` (URL, acción y qué pegar) y `2-CODIGO-CUSTOM-HTML.html` (el cuerpo).
- **ZIP regenerado hoy:** `GHL-PUBLICAR/lote-sitio/por-pagina.zip` (327 entradas: las 106 carpetas + `_CABECERAS/` con las 8 cabeceras). El ZIP anterior era del 16 de noviembre y traía bytes viejos: **no lo uses**.

### Para las 98 páginas sin cabecera propia
1. En GHL, abre la página por su URL (columna URL de la tabla del §4).
2. Añade un elemento **Custom HTML/JavaScript** → **Custom Code** → **Open Code Editor**.
3. Pega el archivo `2-CODIGO-CUSTOM-HTML.html` **entero, tal cual** (no añadas header ni footer global: ya vienen dentro).
4. Guarda y pulsa **Publicar**. Nombre de página y slug: los de `1-PAGINA.txt`.

### Para las 8 páginas con cabecera nueva
1. En GHL, abre la página → pestaña **SEO** → **Custom Head**.
2. Pega la cabecera de la tabla del §2 (`HEAD-TEMPLATE.html`). **Solo la cabecera aquí.**
3. En **SEO Title** escribe el título que ya uses para esa página (la cabecera no lleva `<title>` a propósito, para no duplicarlo).
4. Vuelve al editor → Custom HTML/JavaScript → Custom Code → pega el cuerpo `2-CODIGO-CUSTOM-HTML.html`.
5. Guarda y publica. La cabecera **no** repite canonical ni hreflang: ya viajan dentro del cuerpo.

### Orden recomendado
Home → Techos → Servicios → Categorías → páginas legales y reseñas (§2) → Comunidades → resto. Publica el español antes que el inglés y crea `/techos`, `/comunidades` y `/en/home` antes de cerrar: hay enlaces del lote que apuntan ahí (§5).

---

## 2. Las 8 páginas que estrenan cabecera (description + OG/Twitter)

Estas 8 no tenían `meta description` ni Open Graph. Ahora tienen una cabecera propia con **una sola** `description` y **un solo** juego completo de Open Graph y Twitter (16 etiquetas), sin duplicar `<title>`, canonical ni hreflang. El `og:url` es exactamente el canonical que ya publica el cuerpo. El cuerpo de las 8 **no se modificó** en esta pasada.

| Carpeta | Página | Cuerpo (Custom HTML) | Cabecera (SEO → Custom Head) | Descripción publicada |
|---|---|---|---|---|
| `010-garantia` | Garantía (ES) | `010-garantia/2-CODIGO-CUSTOM-HTML.html` · 201 KB · `7d7c83313d0e` | `garantia/HEAD-TEMPLATE.html` · `61dd53f4784c` | 140 car. |
| `027-politica` | Política (ES) | `027-politica/2-CODIGO-CUSTOM-HTML.html` · 217 KB · `aa7819a0842a` | `politica-de-privacidad/HEAD-TEMPLATE.html` · `00c4eb1b1fa8` | 143 car. |
| `053-terminos` | Términos (ES) | `053-terminos/2-CODIGO-CUSTOM-HTML.html` · 210 KB · `155e95a79de6` | `terminos-y-condiciones/HEAD-TEMPLATE.html` · `1fec9e0b43f8` | 146 car. |
| `062-en-garantia` | Garantía (EN) | `062-en-garantia/2-CODIGO-CUSTOM-HTML.html` · 199 KB · `a9ce1e744579` | `garantia/en/HEAD-TEMPLATE.html` · `1dfb102c6265` | 133 car. |
| `080-en-politica` | Política (EN) | `080-en-politica/2-CODIGO-CUSTOM-HTML.html` · 213 KB · `ed82f6d6e458` | `politica-de-privacidad/en/HEAD-TEMPLATE.html` · `070483eb2c88` | 138 car. |
| `106-en-terminos` | Términos (EN) | `106-en-terminos/2-CODIGO-CUSTOM-HTML.html` · 207 KB · `7dbb2d4f38f8` | `terminos-y-condiciones/en/HEAD-TEMPLATE.html` · `78640b29e57e` | 154 car. |
| `035-resenas` | Reseñas (ES) | `035-resenas/2-CODIGO-CUSTOM-HTML.html` · 216 KB · `ae9d21283fca` | `resenas/HEAD-TEMPLATE.html` · `7c975b6a5ed1` | 148 car. |
| `088-en-resenas` | Reseñas (EN) | `088-en-resenas/2-CODIGO-CUSTOM-HTML.html` · 216 KB · `825ccd3d1473` | `resenas/en/HEAD-TEMPLATE.html` · `23de41d091b7` | 135 car. |

Textos exactos de las descripciones (el `{{custom_values.business__county_name}}` lo expande GHL al municipio):

- **Garantía (ES):** «Qué cubre la garantía escrita de Ilatek en sellado e impermeabilización de techos en {{municipio}}, cuánto dura y cómo presentar un reclamo.»
- **Política (ES):** «Qué datos recopila Ilatek en ilatekpr.com, para qué los usa, con quién los comparte y cómo ejercer tus derechos de privacidad en {{municipio}}.»
- **Términos (ES):** «Condiciones de uso de ilatekpr.com y de los servicios de Ilatek en {{municipio}}: cotizaciones, inspección por $50 descontable y garantía escrita.»
- **Reseñas (ES):** «Reseñas y testimonios de clientes de Ilatek en sellado, impermeabilización y mantenimiento de techos en {{municipio}}. Agenda tu inspección por $50.»
- **Garantía (EN):** «What Ilatek's written warranty covers for roof sealing and waterproofing in {{municipio}}, how long it lasts and how to file a claim.»
- **Política (EN):** «What data Ilatek collects on ilatekpr.com, why it is used, who it is shared with and how to exercise your privacy rights in {{municipio}}.»
- **Términos (EN):** «Terms for using ilatekpr.com and Ilatek services in {{municipio}}: quotes, the $50 inspection credited to the job, scope of work and the written warranty.»
- **Reseñas (EN):** «Reviews and testimonials from Ilatek customers for roof sealing, waterproofing and maintenance in {{municipio}}. Book a $50 inspection.»

Las longitudes de arriba son el **peor caso**: se midieron sustituyendo el token por el municipio más largo de Puerto Rico (13 caracteres), así que ninguna se pasa de 160 al publicar.

---

## 3. Evidencia de esta pasada

### 3.1 Auditoría de los 106 contra sus bytes reales

| Comprobación | Resultado |
|---|---|
| Carpetas del lote | **106** |
| `1-PAGINA.txt` presente y con URL + acción | **106/106** |
| sha256 declarado en `1-PAGINA.txt` = sha256 del archivo | **106/106** |
| sha256 del índice `00-CHECKLIST.csv` = sha256 del archivo | **106/106** (el índice tenía sha viejos; se refrescó hoy) |
| Artefacto = copia byte a byte de su fuente en el repo | **106/106** |
| Referencias a imágenes del repo que existen | **967/967** (466 al CDN jsDelivr `@main`, 497 a `raw.githubusercontent`, 4 heroes del subdominio) |
| Copy retirado por el plan (`ilcl-form`, «Recibe tu precio», «inspección gratis», `pie²`, `ilf-brand`, «Oportunidades») | **0 apariciones** en los 106 |
| `FAQPage` | **106/106** |
| `{{custom_values.*}}` | **106/106** |
| `dv-ghl-values` | **106/106** |
| Pie nuevo («Explora» + `data-ilatek-path`) | **106/106** |
| **Problemas** | **0** |

Referencias externas que no se pueden comprobar sin red (no son del repo): `assets.cdn.filesafe.space` (1.759), `stcdn.leadconnectorhq.com` (742), `reputationhub.site` (400), `images.leadconnectorhq.com` (148) y otras de fuentes, mapas y redes. No hay indicio de rotura, pero su estado depende de esos servicios.

### 3.2 Verificadores ejecutados uno a uno (exit real de esta pasada)

| Verificador | Exit | Resultado medido | ¿Afecta al lote? |
|---|---|---|---|
| `techos/verify-techos.mjs` | 0 | 32 páginas de techos verificadas | No (cubre las del lote) |
| `tools/verify-location.mjs` | 0 | alt/title locales y head/markdown OK | No |
| `tools/verify-internal-links.mjs` | 0 | 47 páginas, 17.277 anchors, 2.612 scripts, idempotencia OK | Sí, verde |
| `tools/verify-structure.mjs` | 0 | 0 fallos | No |
| `tools/verify-page-shell.mjs` | 0 | 109 entregables + 32 techos, sin duplicados | Sí, verde |
| `tools/verify-responsive.mjs` | 0 | 97 heroes, 296 controles, idempotente | Sí, verde |
| `tools/verify-nav.mjs` | 0 | 1 variante de menú y de pie, 0 fallos | Sí, verde |
| `tools/verify-seo-integrity.mjs` | 0 | canónicas self, llms coherente, 59 anchors | Sí, verde |
| `tools/verify-schema-prices.mjs` | 0 | sin precios/ratings inventados | Sí, verde |
| `tools/verify-sitemap.mjs` | 0 | 98 URLs únicas | Sí, verde |
| `tools/verify-faq-words.mjs` | 0 | 23 preguntas de 40–60 palabras | Sí, verde |
| `tools/verify-anchor-ratio.mjs` | 0 | 2/46.409 exactos (0,00 %) | Sí, verde |
| `blog/build/verify-longtail.mjs` | 0 | 100/100 páginas, 565 imágenes con alt | No (blog) |
| `src/faq/faq-parity.mjs GHL-PUBLICAR/lote-sitio` | **0** | **106 páginas; `h3_sin_schema`=0; `schema_sin_h3`=0; `respuestas_divergentes`=0; `items_sin_pregunta`=0** | **Sí, verde** |
| `tools/sync-artifacts.mjs --check` | 0 | **106 artefactos / 0 problemas** | **Sí, verde** |
| `tools/verify-social-cards.mjs` | 1 | **80 fallos en 185 tarjetas · 20 páginas `blog-*`** | No (blog) |
| `blog/build/verify-blog-en.mjs` | 1 | **25 avisos** en pares `/blog…` | No (blog) |
| `tools/verify-cannibalization.mjs --strict` | 1 | **1 hallazgo** en blog: «¿Cuánto dura el sellado de un techo?» | No (blog) |
| `tools/verify-structure.mjs --migration` | 1 | **47 HTML** «changed»: guard histórico, falla por diseño | No |
| `src/faq/faq-parity.mjs` (global) | 1 | **4.492 páginas; `schema_sin_h3` 3.301** (blog y comparativas antiguas) | No: el lote da 0 |
| `Comunidades/scripts/verificar-funnel-ghl.mjs` | 1 | **1.112 canónicas** de subdominio (funnel propio) | No |
| `tools/audit-link-graph.mjs` | 1 | **3 huérfanas**: `/comunidades`, `/en/communities`, `/en/home` | Se resuelve al crear esas 3 páginas |
| `tools/verify-en.mjs` | 1 | **112 fallos** en 48 copias EN (enlazan a ES aún no publicadas) | Se resuelve al publicar ES primero |
| `tools/verify-en-parity.mjs` | 1 | **12 de 51 pares** con 1–2 diferencias de tokens o cifras | No: cada artefacto es coherente consigo mismo |
| `tools/verify-samples.mjs` | 1 | **6 muestras** con enlaces sin destino (`/en/home`, `/comunidades`, `/techos`) | Se resuelve al crear esas páginas |
| `scripts/audita-ghl.mjs` (extra, fuera de la lista del plan) | 1 | **3 fallos + 8 avisos**: 106 paquetes, bytes/sha 0 diferencias; 2 fallos por premisas antiguas del propio auditor (`/comunidades` «no se publica»; sitemap índice sin hijos) y 1 de blog | No |

**Ningún rojo nuevo causado por las 8 cabeceras.** De hecho, la primera pasada de hoy sí puso rojo `verify-internal-links`: exigía que toda cabecera siga el contrato de localización del proyecto (token de municipio + `data-ilatek-local-content`). Se corrigió **dentro de las 8 cabeceras** pasándolas por el formateador oficial (sin tocar el verificador) y en la segunda pasada sale **exit 0 con idempotencia OK**.

### 3.3 Cierres del plan

| Comprobación | Resultado |
|---|---|
| `sync-artifacts --check` | **106 / 0** |
| `verify-page-shell` | verde: 109 + 32, sin duplicados |
| sha256 de los 106 vs su manifiesto | **106/106** |
| `blog/llms.txt` | sha256 `48cd16fda144…` · 31.050 bytes, **sin cambios** |
| Archivos modificados bajo `blog/` | **0** |
| Commits / push / PR | **Ninguno**; sigue en `c577d51` |
| Cadena de trabajo | 2.166 entradas en `git status` (2.162 previas + 4 cabeceras ES nuevas; las EN caen en carpetas ya no versionadas). Las 230 eliminaciones locales siguen **sin commitear**, como exige el plan |

---

## 4. Los 106: URL y qué se pega en cada una

| # | Página | Carpeta | Cuerpo a pegar (KB · sha256) | URL | Acción | Cabecera (SEO → Custom Head) |
|---|---|---|---|---|---|---|
| 1 | Home | `001-inicio` | `GHL-PUBLICAR/lote-sitio/por-pagina/001-inicio/2-CODIGO-CUSTOM-HTML.html` · 447 KB · `c636ee39405e` | https://ilatekpr.com/ | REPUBLICAR | `home/es/HEAD-TEMPLATE.html` · `5abe2e167234` |
| 2 | Servicios | `002-airbnb-turnover` | `GHL-PUBLICAR/lote-sitio/por-pagina/002-airbnb-turnover/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `e3435ead2f90` | https://ilatekpr.com/airbnb-turnover | REPUBLICAR | `servicios/airbnb-turnover/es/HEAD-TEMPLATE.html` · `20aff5eec4a8` |
| 3 | Servicios | `003-alfombras` | `GHL-PUBLICAR/lote-sitio/por-pagina/003-alfombras/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `f5b468b66870` | https://ilatekpr.com/alfombras | REPUBLICAR | `servicios/alfombras/es/HEAD-TEMPLATE.html` · `c4bf698d05b3` |
| 4 | Techos | `004-canaletas-y-bajantes` | `GHL-PUBLICAR/lote-sitio/por-pagina/004-canaletas-y-bajantes/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `b05a3094d260` | https://ilatekpr.com/canaletas-y-bajantes | REPUBLICAR | `servicios/canaletas-y-bajantes/es/HEAD-TEMPLATE.html` · `66d639ccede8` |
| 5 | Comunidades | `005-comunidades` | `GHL-PUBLICAR/lote-sitio/por-pagina/005-comunidades/2-CODIGO-CUSTOM-HTML.html` · 618 KB · `ac11c234e461` | https://ilatekpr.com/comunidades | CREAR PÁGINA | — (sin cabecera: canonical en el cuerpo) |
| 6 | Servicios | `008-electrodomesticos` | `GHL-PUBLICAR/lote-sitio/por-pagina/008-electrodomesticos/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `58ad4c08f927` | https://ilatekpr.com/electrodomesticos | REPUBLICAR | `servicios/electrodomesticos/es/HEAD-TEMPLATE.html` · `bce77c7cabfa` |
| 7 | Techos | `009-empozamiento-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/009-empozamiento-de-techos/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `1901595618ef` | https://ilatekpr.com/empozamiento-de-techos | REPUBLICAR | `servicios/empozamiento-de-techos/es/HEAD-TEMPLATE.html` · `a2d2afe722d5` |
| 8 | Legales | `010-garantia` | `GHL-PUBLICAR/lote-sitio/por-pagina/010-garantia/2-CODIGO-CUSTOM-HTML.html` · 201 KB · `7d7c83313d0e` | https://ilatekpr.com/garantia | REPUBLICAR | `garantia/HEAD-TEMPLATE.html` · `61dd53f4784c` · **SEO → Custom Head** |
| 9 | Techos | `011-impermeabilizacion-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/011-impermeabilizacion-de-techos/2-CODIGO-CUSTOM-HTML.html` · 238 KB · `ae17c5ec6336` | https://ilatekpr.com/impermeabilizacion-de-techos | REPUBLICAR | `categorias/impermeabilizacion-de-techos/es/HEAD-TEMPLATE.html` · `2b27f3aa501e` |
| 10 | Techos | `012-inspeccion-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/012-inspeccion-de-techos/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `c2926e32de86` | https://ilatekpr.com/inspeccion-de-techos | REPUBLICAR | `servicios/inspeccion-de-techos/es/HEAD-TEMPLATE.html` · `52ed0b2e2e15` |
| 11 | Techos | `013-inspeccion-y-mantenimiento-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/013-inspeccion-y-mantenimiento-de-techos/2-CODIGO-CUSTOM-HTML.html` · 241 KB · `43a2df5f17df` | https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos | REPUBLICAR | `categorias/inspeccion-y-mantenimiento-de-techos/es/HEAD-TEMPLATE.html` · `f2d73d79e41c` |
| 12 | Techos | `014-instalacion-y-reemplazo-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/014-instalacion-y-reemplazo-de-techos/2-CODIGO-CUSTOM-HTML.html` · 238 KB · `aac80f93118a` | https://ilatekpr.com/instalacion-y-reemplazo-de-techos | REPUBLICAR | `servicios/instalacion-y-reemplazo-de-techos/es/HEAD-TEMPLATE.html` · `80a2f6875564` |
| 13 | Servicios | `015-lavado-a-presion` | `GHL-PUBLICAR/lote-sitio/por-pagina/015-lavado-a-presion/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `5e6460bc30d7` | https://ilatekpr.com/lavado-a-presion | REPUBLICAR | `servicios/lavado-a-presion/es/HEAD-TEMPLATE.html` · `aa7cced459bf` |
| 14 | Techos | `016-lavado-a-presion-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/016-lavado-a-presion-techos/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `6958a266c912` | https://ilatekpr.com/lavado-a-presion-techos | REPUBLICAR | `servicios/lavado-a-presion-techos/es/HEAD-TEMPLATE.html` · `3e5f574f84e8` |
| 15 | Categorías | `017-limpieza-comercial` | `GHL-PUBLICAR/lote-sitio/por-pagina/017-limpieza-comercial/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `8e0db9906cea` | https://ilatekpr.com/limpieza-comercial | REPUBLICAR | `categorias/limpieza-comercial/es/HEAD-TEMPLATE.html` · `e29353c64765` |
| 16 | Servicios | `018-limpieza-de-mudanza` | `GHL-PUBLICAR/lote-sitio/por-pagina/018-limpieza-de-mudanza/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `9968128e3037` | https://ilatekpr.com/limpieza-de-mudanza | REPUBLICAR | `servicios/limpieza-de-mudanza/es/HEAD-TEMPLATE.html` · `b533c1e65959` |
| 17 | Techos | `019-limpieza-de-techos-y-canaletas` | `GHL-PUBLICAR/lote-sitio/por-pagina/019-limpieza-de-techos-y-canaletas/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `eb6d2b06eadf` | https://ilatekpr.com/limpieza-de-techos-y-canaletas | REPUBLICAR | `servicios/limpieza-de-techos-y-canaletas/es/HEAD-TEMPLATE.html` · `8ee1e1931d19` |
| 18 | Servicios | `020-limpieza-estandar` | `GHL-PUBLICAR/lote-sitio/por-pagina/020-limpieza-estandar/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `13a86b7c9d9f` | https://ilatekpr.com/limpieza-estandar | REPUBLICAR | `servicios/limpieza-estandar/es/HEAD-TEMPLATE.html` · `e653d773edef` |
| 19 | Categorías | `021-limpieza-industrial` | `GHL-PUBLICAR/lote-sitio/por-pagina/021-limpieza-industrial/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `ba4a9973ff26` | https://ilatekpr.com/limpieza-industrial | REPUBLICAR | `categorias/limpieza-industrial/es/HEAD-TEMPLATE.html` · `cb02fb8f9379` |
| 20 | Servicios | `022-limpieza-profunda` | `GHL-PUBLICAR/lote-sitio/por-pagina/022-limpieza-profunda/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `77c04a649786` | https://ilatekpr.com/limpieza-profunda | REPUBLICAR | `servicios/limpieza-profunda/es/HEAD-TEMPLATE.html` · `837d471eeda5` |
| 21 | Categorías | `023-limpieza-residencial` | `GHL-PUBLICAR/lote-sitio/por-pagina/023-limpieza-residencial/2-CODIGO-CUSTOM-HTML.html` · 230 KB · `a77fa2d41cbf` | https://ilatekpr.com/limpieza-residencial | REPUBLICAR | `categorias/limpieza-residencial/es/HEAD-TEMPLATE.html` · `df448a02130b` |
| 22 | Techos | `024-mantenimiento-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/024-mantenimiento-de-techos/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `8883a67ce4b7` | https://ilatekpr.com/mantenimiento-de-techos | REPUBLICAR | `servicios/mantenimiento-de-techos/es/HEAD-TEMPLATE.html` · `9b76e4e08437` |
| 23 | Techos | `025-membrana-asfaltica` | `GHL-PUBLICAR/lote-sitio/por-pagina/025-membrana-asfaltica/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `8eb6f2979d06` | https://ilatekpr.com/membrana-asfaltica | REPUBLICAR | `servicios/membrana-asfaltica/es/HEAD-TEMPLATE.html` · `7481f41a1eed` |
| 24 | Servicios | `026-organizacion` | `GHL-PUBLICAR/lote-sitio/por-pagina/026-organizacion/2-CODIGO-CUSTOM-HTML.html` · 228 KB · `76be652399f1` | https://ilatekpr.com/organizacion | REPUBLICAR | `servicios/organizacion/es/HEAD-TEMPLATE.html` · `f2e72d3fa9ba` |
| 25 | Legales | `027-politica` | `GHL-PUBLICAR/lote-sitio/por-pagina/027-politica/2-CODIGO-CUSTOM-HTML.html` · 217 KB · `aa7819a0842a` | https://ilatekpr.com/politica | CREAR PÁGINA | `politica-de-privacidad/HEAD-TEMPLATE.html` · `00c4eb1b1fa8` · **SEO → Custom Head** |
| 26 | Servicios | `028-post-construccion` | `GHL-PUBLICAR/lote-sitio/por-pagina/028-post-construccion/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `2c5880b9943d` | https://ilatekpr.com/post-construccion | REPUBLICAR | `servicios/post-construccion/es/HEAD-TEMPLATE.html` · `fb9549f16d27` |
| 27 | Techos | `029-recubrimiento-elastomerico` | `GHL-PUBLICAR/lote-sitio/por-pagina/029-recubrimiento-elastomerico/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `c5146308e913` | https://ilatekpr.com/recubrimiento-elastomerico | REPUBLICAR | `servicios/recubrimiento-elastomerico/es/HEAD-TEMPLATE.html` · `2f443d53d94f` |
| 28 | Techos | `030-reparacion-de-filtraciones` | `GHL-PUBLICAR/lote-sitio/por-pagina/030-reparacion-de-filtraciones/2-CODIGO-CUSTOM-HTML.html` · 237 KB · `2766456ee85b` | https://ilatekpr.com/reparacion-de-filtraciones | REPUBLICAR | `servicios/reparacion-de-filtraciones/es/HEAD-TEMPLATE.html` · `48b11728761c` |
| 29 | Techos | `031-reparacion-de-goteras` | `GHL-PUBLICAR/lote-sitio/por-pagina/031-reparacion-de-goteras/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `cf3023f98408` | https://ilatekpr.com/reparacion-de-goteras | REPUBLICAR | `servicios/reparacion-de-goteras/es/HEAD-TEMPLATE.html` · `b8a6f4fb4f7b` |
| 30 | Techos | `032-reparacion-de-grietas-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/032-reparacion-de-grietas-techos/2-CODIGO-CUSTOM-HTML.html` · 238 KB · `905173d567ff` | https://ilatekpr.com/reparacion-de-grietas-techos | REPUBLICAR | `servicios/reparacion-de-grietas-techos/es/HEAD-TEMPLATE.html` · `d1a1a13418cf` |
| 31 | Techos | `033-reparacion-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/033-reparacion-de-techos/2-CODIGO-CUSTOM-HTML.html` · 237 KB · `516bf4dc9a57` | https://ilatekpr.com/reparacion-de-techos | REPUBLICAR | `categorias/reparacion-de-techos/es/HEAD-TEMPLATE.html` · `45093e74fec3` |
| 32 | Techos | `034-reparacion-post-huracan` | `GHL-PUBLICAR/lote-sitio/por-pagina/034-reparacion-post-huracan/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `9e4b7e5b4d2b` | https://ilatekpr.com/reparacion-post-huracan | REPUBLICAR | `servicios/reparacion-post-huracan/es/HEAD-TEMPLATE.html` · `a883f2628778` |
| 33 | Reseñas | `035-resenas` | `GHL-PUBLICAR/lote-sitio/por-pagina/035-resenas/2-CODIGO-CUSTOM-HTML.html` · 216 KB · `ae9d21283fca` | https://ilatekpr.com/resenas | REPUBLICAR | `resenas/HEAD-TEMPLATE.html` · `7c975b6a5ed1` · **SEO → Custom Head** |
| 34 | Techos | `036-sellado-acrilico` | `GHL-PUBLICAR/lote-sitio/por-pagina/036-sellado-acrilico/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `6a2eb9f50a17` | https://ilatekpr.com/sellado-acrilico | REPUBLICAR | `servicios/sellado-acrilico/es/HEAD-TEMPLATE.html` · `4b57c0c27f49` |
| 35 | Techos | `037-sellado-de-poliuretano` | `GHL-PUBLICAR/lote-sitio/por-pagina/037-sellado-de-poliuretano/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `d9c5bc7a17ff` | https://ilatekpr.com/sellado-de-poliuretano | REPUBLICAR | `servicios/sellado-de-poliuretano/es/HEAD-TEMPLATE.html` · `5e4a2882f7ab` |
| 36 | Techos | `038-sellado-de-silicona` | `GHL-PUBLICAR/lote-sitio/por-pagina/038-sellado-de-silicona/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `550056654bd7` | https://ilatekpr.com/sellado-de-silicona | REPUBLICAR | `servicios/sellado-de-silicona/es/HEAD-TEMPLATE.html` · `1b4fe383fcab` |
| 37 | Techos | `039-sellado-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/039-sellado-de-techos/2-CODIGO-CUSTOM-HTML.html` · 274 KB · `96b462e64aa1` | https://ilatekpr.com/sellado-de-techos | REPUBLICAR | `categorias/sellado-de-techos/es/HEAD-TEMPLATE.html` · `aa569a4299b1` |
| 38 | Techos | `040-sellado-de-techos-comercial` | `GHL-PUBLICAR/lote-sitio/por-pagina/040-sellado-de-techos-comercial/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `176cdcef0010` | https://ilatekpr.com/sellado-de-techos-comercial | REPUBLICAR | `servicios/sellado-de-techos-comercial/es/HEAD-TEMPLATE.html` · `e33818360d88` |
| 39 | Techos | `041-sellado-de-techos-industrial` | `GHL-PUBLICAR/lote-sitio/por-pagina/041-sellado-de-techos-industrial/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `6937c14d8533` | https://ilatekpr.com/sellado-de-techos-industrial | REPUBLICAR | `servicios/sellado-de-techos-industrial/es/HEAD-TEMPLATE.html` · `ed907963a42f` |
| 40 | Techos | `042-sellado-de-techos-residencial` | `GHL-PUBLICAR/lote-sitio/por-pagina/042-sellado-de-techos-residencial/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `98e1922bba9f` | https://ilatekpr.com/sellado-de-techos-residencial | REPUBLICAR | `servicios/sellado-de-techos-residencial/es/HEAD-TEMPLATE.html` · `4ca4cb1d057d` |
| 41 | Categorías | `043-servicios` | `GHL-PUBLICAR/lote-sitio/por-pagina/043-servicios/2-CODIGO-CUSTOM-HTML.html` · 285 KB · `40795446b030` | https://ilatekpr.com/servicios | REPUBLICAR | `categorias/limpieza/es/HEAD-TEMPLATE.html` · `d29915a82b97` |
| 42 | Categorías | `044-servicios-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/044-servicios-techos/2-CODIGO-CUSTOM-HTML.html` · 382 KB · `ee9d610fe8bf` | https://ilatekpr.com/servicios-techos | REPUBLICAR | `categorias/techos/es/HEAD-TEMPLATE.html` · `6760a214a43b` |
| 43 | Techos | `045-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/045-techos/2-CODIGO-CUSTOM-HTML.html` · 286 KB · `9ab46a1bb439` | https://ilatekpr.com/techos | CREAR PÁGINA | `categorias/techos/es/HEAD-TEMPLATE.html` · `6760a214a43b` |
| 44 | Techos | `046-techos-de-asfalto` | `GHL-PUBLICAR/lote-sitio/por-pagina/046-techos-de-asfalto/2-CODIGO-CUSTOM-HTML.html` · 233 KB · `4bb6c6c42d6e` | https://ilatekpr.com/techos-de-asfalto | REPUBLICAR | `servicios/techos-de-asfalto/es/HEAD-TEMPLATE.html` · `072b620aec67` |
| 45 | Techos | `047-techos-de-concreto` | `GHL-PUBLICAR/lote-sitio/por-pagina/047-techos-de-concreto/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `f74f74890235` | https://ilatekpr.com/techos-de-concreto | REPUBLICAR | `servicios/techos-de-concreto/es/HEAD-TEMPLATE.html` · `c9a31d813c39` |
| 46 | Techos | `048-techos-de-madera` | `GHL-PUBLICAR/lote-sitio/por-pagina/048-techos-de-madera/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `48210d09322a` | https://ilatekpr.com/techos-de-madera | REPUBLICAR | `servicios/techos-de-madera/es/HEAD-TEMPLATE.html` · `6019b75457b5` |
| 47 | Techos | `049-techos-de-teja` | `GHL-PUBLICAR/lote-sitio/por-pagina/049-techos-de-teja/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `fae00b207c15` | https://ilatekpr.com/techos-de-teja | REPUBLICAR | `servicios/techos-de-teja/es/HEAD-TEMPLATE.html` · `339b2e947a44` |
| 48 | Techos | `050-techos-de-zinc` | `GHL-PUBLICAR/lote-sitio/por-pagina/050-techos-de-zinc/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `798de63fc68b` | https://ilatekpr.com/techos-de-zinc | REPUBLICAR | `servicios/techos-de-zinc/es/HEAD-TEMPLATE.html` · `1f9f813b4088` |
| 49 | Techos | `051-techos-planos` | `GHL-PUBLICAR/lote-sitio/por-pagina/051-techos-planos/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `c196432cbe9d` | https://ilatekpr.com/techos-planos | REPUBLICAR | `servicios/techos-planos/es/HEAD-TEMPLATE.html` · `e42a5a59e6a6` |
| 50 | Techos | `052-techos-por-segmento` | `GHL-PUBLICAR/lote-sitio/por-pagina/052-techos-por-segmento/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `8e0457802713` | https://ilatekpr.com/techos-por-segmento | REPUBLICAR | `categorias/techos-por-segmento/es/HEAD-TEMPLATE.html` · `90375a3ed96b` |
| 51 | Legales | `053-terminos` | `GHL-PUBLICAR/lote-sitio/por-pagina/053-terminos/2-CODIGO-CUSTOM-HTML.html` · 210 KB · `155e95a79de6` | https://ilatekpr.com/terminos | CREAR PÁGINA | `terminos-y-condiciones/HEAD-TEMPLATE.html` · `1fec9e0b43f8` · **SEO → Custom Head** |
| 52 | Techos | `054-tragaluces` | `GHL-PUBLICAR/lote-sitio/por-pagina/054-tragaluces/2-CODIGO-CUSTOM-HTML.html` · 232 KB · `976b2fc9efaf` | https://ilatekpr.com/tragaluces | REPUBLICAR | `servicios/tragaluces/es/HEAD-TEMPLATE.html` · `3caf7e7af569` |
| 53 | Servicios | `055-ventanas` | `GHL-PUBLICAR/lote-sitio/por-pagina/055-ventanas/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `ce7884d9267b` | https://ilatekpr.com/ventanas | REPUBLICAR | `servicios/ventanas/es/HEAD-TEMPLATE.html` · `2be47d0506d4` |
| 54 | Servicios | `056-en-airbnb-turnover` | `GHL-PUBLICAR/lote-sitio/por-pagina/056-en-airbnb-turnover/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `d30acffd12bd` | https://ilatekpr.com/en/airbnb-turnover | CREAR PÁGINA | `servicios/airbnb-turnover/en/HEAD-TEMPLATE.html` · `3c4a4f23d098` |
| 55 | Servicios | `057-en-alfombras` | `GHL-PUBLICAR/lote-sitio/por-pagina/057-en-alfombras/2-CODIGO-CUSTOM-HTML.html` · 228 KB · `acd569feb200` | https://ilatekpr.com/en/alfombras | CREAR PÁGINA | `servicios/alfombras/en/HEAD-TEMPLATE.html` · `378f5e7d29c3` |
| 56 | Servicios | `058-en-canaletas-y-bajantes` | `GHL-PUBLICAR/lote-sitio/por-pagina/058-en-canaletas-y-bajantes/2-CODIGO-CUSTOM-HTML.html` · 233 KB · `351000f17d59` | https://ilatekpr.com/en/canaletas-y-bajantes | CREAR PÁGINA | `servicios/canaletas-y-bajantes/en/HEAD-TEMPLATE.html` · `8c00c3e274bb` |
| 57 | Comunidades | `059-en-communities` | `GHL-PUBLICAR/lote-sitio/por-pagina/059-en-communities/2-CODIGO-CUSTOM-HTML.html` · 617 KB · `d12c8c9cdaed` | https://ilatekpr.com/en/communities | CREAR PÁGINA | — (sin cabecera: canonical en el cuerpo) |
| 58 | Servicios | `060-en-electrodomesticos` | `GHL-PUBLICAR/lote-sitio/por-pagina/060-en-electrodomesticos/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `74b60430a017` | https://ilatekpr.com/en/electrodomesticos | CREAR PÁGINA | `servicios/electrodomesticos/en/HEAD-TEMPLATE.html` · `48a7c57773f2` |
| 59 | Servicios | `061-en-empozamiento-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/061-en-empozamiento-de-techos/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `407d8904a8d4` | https://ilatekpr.com/en/empozamiento-de-techos | CREAR PÁGINA | `servicios/empozamiento-de-techos/en/HEAD-TEMPLATE.html` · `b9c5c15135d8` |
| 60 | Legales | `062-en-garantia` | `GHL-PUBLICAR/lote-sitio/por-pagina/062-en-garantia/2-CODIGO-CUSTOM-HTML.html` · 199 KB · `a9ce1e744579` | https://ilatekpr.com/en/garantia | CREAR PÁGINA | `garantia/en/HEAD-TEMPLATE.html` · `1dfb102c6265` · **SEO → Custom Head** |
| 61 | Home | `063-en-home` | `GHL-PUBLICAR/lote-sitio/por-pagina/063-en-home/2-CODIGO-CUSTOM-HTML.html` · 435 KB · `9579cfbe4698` | https://ilatekpr.com/en/home | CREAR PÁGINA | `home/en/HEAD-TEMPLATE.html` · `857acde019f6` |
| 62 | Categorías | `064-en-impermeabilizacion-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/064-en-impermeabilizacion-de-techos/2-CODIGO-CUSTOM-HTML.html` · 237 KB · `bbc7508f8511` | https://ilatekpr.com/en/impermeabilizacion-de-techos | CREAR PÁGINA | `categorias/impermeabilizacion-de-techos/en/HEAD-TEMPLATE.html` · `66e480ffce2c` |
| 63 | Servicios | `065-en-inspeccion-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/065-en-inspeccion-de-techos/2-CODIGO-CUSTOM-HTML.html` · 233 KB · `bac566f7e07d` | https://ilatekpr.com/en/inspeccion-de-techos | CREAR PÁGINA | `servicios/inspeccion-de-techos/en/HEAD-TEMPLATE.html` · `e6ca7d9671ba` |
| 64 | Categorías | `066-en-inspeccion-y-mantenimiento-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/066-en-inspeccion-y-mantenimiento-de-techos/2-CODIGO-CUSTOM-HTML.html` · 240 KB · `3c9682e47dc9` | https://ilatekpr.com/en/inspeccion-y-mantenimiento-de-techos | CREAR PÁGINA | `categorias/inspeccion-y-mantenimiento-de-techos/en/HEAD-TEMPLATE.html` · `5a55261f24a0` |
| 65 | Servicios | `067-en-instalacion-y-reemplazo-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/067-en-instalacion-y-reemplazo-de-techos/2-CODIGO-CUSTOM-HTML.html` · 237 KB · `8249f2f8bd25` | https://ilatekpr.com/en/instalacion-y-reemplazo-de-techos | CREAR PÁGINA | `servicios/instalacion-y-reemplazo-de-techos/en/HEAD-TEMPLATE.html` · `ec3d0bd25ae8` |
| 66 | Servicios | `068-en-lavado-a-presion` | `GHL-PUBLICAR/lote-sitio/por-pagina/068-en-lavado-a-presion/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `77fccb0074ef` | https://ilatekpr.com/en/lavado-a-presion | CREAR PÁGINA | `servicios/lavado-a-presion/en/HEAD-TEMPLATE.html` · `6a65c7afa22b` |
| 67 | Servicios | `069-en-lavado-a-presion-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/069-en-lavado-a-presion-techos/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `af7c5a7ea950` | https://ilatekpr.com/en/lavado-a-presion-techos | CREAR PÁGINA | `servicios/lavado-a-presion-techos/en/HEAD-TEMPLATE.html` · `7ccefbecce6a` |
| 68 | Categorías | `070-en-limpieza-comercial` | `GHL-PUBLICAR/lote-sitio/por-pagina/070-en-limpieza-comercial/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `08e63e4c8970` | https://ilatekpr.com/en/limpieza-comercial | CREAR PÁGINA | `categorias/limpieza-comercial/en/HEAD-TEMPLATE.html` · `1450e3918865` |
| 69 | Servicios | `071-en-limpieza-de-mudanza` | `GHL-PUBLICAR/lote-sitio/por-pagina/071-en-limpieza-de-mudanza/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `d6f4daadb041` | https://ilatekpr.com/en/limpieza-de-mudanza | CREAR PÁGINA | `servicios/limpieza-de-mudanza/en/HEAD-TEMPLATE.html` · `12562f57a93a` |
| 70 | Servicios | `072-en-limpieza-de-techos-y-canaletas` | `GHL-PUBLICAR/lote-sitio/por-pagina/072-en-limpieza-de-techos-y-canaletas/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `9045da2df718` | https://ilatekpr.com/en/limpieza-de-techos-y-canaletas | CREAR PÁGINA | `servicios/limpieza-de-techos-y-canaletas/en/HEAD-TEMPLATE.html` · `d7e5e0bdd6c2` |
| 71 | Servicios | `073-en-limpieza-estandar` | `GHL-PUBLICAR/lote-sitio/por-pagina/073-en-limpieza-estandar/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `8b9335cab1c2` | https://ilatekpr.com/en/limpieza-estandar | CREAR PÁGINA | `servicios/limpieza-estandar/en/HEAD-TEMPLATE.html` · `47f6f8e28855` |
| 72 | Categorías | `074-en-limpieza-industrial` | `GHL-PUBLICAR/lote-sitio/por-pagina/074-en-limpieza-industrial/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `e7ab22f96803` | https://ilatekpr.com/en/limpieza-industrial | CREAR PÁGINA | `categorias/limpieza-industrial/en/HEAD-TEMPLATE.html` · `a0d43fa98395` |
| 73 | Servicios | `075-en-limpieza-profunda` | `GHL-PUBLICAR/lote-sitio/por-pagina/075-en-limpieza-profunda/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `71582233d103` | https://ilatekpr.com/en/limpieza-profunda | CREAR PÁGINA | `servicios/limpieza-profunda/en/HEAD-TEMPLATE.html` · `d3167b60720a` |
| 74 | Categorías | `076-en-limpieza-residencial` | `GHL-PUBLICAR/lote-sitio/por-pagina/076-en-limpieza-residencial/2-CODIGO-CUSTOM-HTML.html` · 230 KB · `2c7c04a6b780` | https://ilatekpr.com/en/limpieza-residencial | CREAR PÁGINA | `categorias/limpieza-residencial/en/HEAD-TEMPLATE.html` · `f66056e68f5a` |
| 75 | Servicios | `077-en-mantenimiento-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/077-en-mantenimiento-de-techos/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `03ef494ac1e3` | https://ilatekpr.com/en/mantenimiento-de-techos | CREAR PÁGINA | `servicios/mantenimiento-de-techos/en/HEAD-TEMPLATE.html` · `91a679027950` |
| 76 | Servicios | `078-en-membrana-asfaltica` | `GHL-PUBLICAR/lote-sitio/por-pagina/078-en-membrana-asfaltica/2-CODIGO-CUSTOM-HTML.html` · 233 KB · `6e09470f206f` | https://ilatekpr.com/en/membrana-asfaltica | CREAR PÁGINA | `servicios/membrana-asfaltica/en/HEAD-TEMPLATE.html` · `e6bc0b119000` |
| 77 | Servicios | `079-en-organizacion` | `GHL-PUBLICAR/lote-sitio/por-pagina/079-en-organizacion/2-CODIGO-CUSTOM-HTML.html` · 228 KB · `4ebcb60e4ace` | https://ilatekpr.com/en/organizacion | CREAR PÁGINA | `servicios/organizacion/en/HEAD-TEMPLATE.html` · `8aac083df1af` |
| 78 | Legales | `080-en-politica` | `GHL-PUBLICAR/lote-sitio/por-pagina/080-en-politica/2-CODIGO-CUSTOM-HTML.html` · 213 KB · `ed82f6d6e458` | https://ilatekpr.com/en/politica | CREAR PÁGINA | `politica-de-privacidad/en/HEAD-TEMPLATE.html` · `070483eb2c88` · **SEO → Custom Head** |
| 79 | Servicios | `081-en-post-construccion` | `GHL-PUBLICAR/lote-sitio/por-pagina/081-en-post-construccion/2-CODIGO-CUSTOM-HTML.html` · 229 KB · `bb84bc1af867` | https://ilatekpr.com/en/post-construccion | CREAR PÁGINA | `servicios/post-construccion/en/HEAD-TEMPLATE.html` · `003e72a205d9` |
| 80 | Servicios | `082-en-recubrimiento-elastomerico` | `GHL-PUBLICAR/lote-sitio/por-pagina/082-en-recubrimiento-elastomerico/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `811437f44894` | https://ilatekpr.com/en/recubrimiento-elastomerico | CREAR PÁGINA | `servicios/recubrimiento-elastomerico/en/HEAD-TEMPLATE.html` · `819e0b574f45` |
| 81 | Servicios | `083-en-reparacion-de-filtraciones` | `GHL-PUBLICAR/lote-sitio/por-pagina/083-en-reparacion-de-filtraciones/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `7a5847932ec4` | https://ilatekpr.com/en/reparacion-de-filtraciones | CREAR PÁGINA | `servicios/reparacion-de-filtraciones/en/HEAD-TEMPLATE.html` · `6d6c89d0cbe9` |
| 82 | Servicios | `084-en-reparacion-de-goteras` | `GHL-PUBLICAR/lote-sitio/por-pagina/084-en-reparacion-de-goteras/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `662b840c97d8` | https://ilatekpr.com/en/reparacion-de-goteras | CREAR PÁGINA | `servicios/reparacion-de-goteras/en/HEAD-TEMPLATE.html` · `197d22e90cc4` |
| 83 | Servicios | `085-en-reparacion-de-grietas-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/085-en-reparacion-de-grietas-techos/2-CODIGO-CUSTOM-HTML.html` · 237 KB · `2e16cb103b11` | https://ilatekpr.com/en/reparacion-de-grietas-techos | CREAR PÁGINA | `servicios/reparacion-de-grietas-techos/en/HEAD-TEMPLATE.html` · `4d48dfa1299a` |
| 84 | Categorías | `086-en-reparacion-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/086-en-reparacion-de-techos/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `b4e86cfc7b8f` | https://ilatekpr.com/en/reparacion-de-techos | CREAR PÁGINA | `categorias/reparacion-de-techos/en/HEAD-TEMPLATE.html` · `4ddfdcf61293` |
| 85 | Servicios | `087-en-reparacion-post-huracan` | `GHL-PUBLICAR/lote-sitio/por-pagina/087-en-reparacion-post-huracan/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `8e19f04a684b` | https://ilatekpr.com/en/reparacion-post-huracan | CREAR PÁGINA | `servicios/reparacion-post-huracan/en/HEAD-TEMPLATE.html` · `18209c6b3077` |
| 86 | Reseñas | `088-en-resenas` | `GHL-PUBLICAR/lote-sitio/por-pagina/088-en-resenas/2-CODIGO-CUSTOM-HTML.html` · 216 KB · `825ccd3d1473` | https://ilatekpr.com/en/resenas | CREAR PÁGINA | `resenas/en/HEAD-TEMPLATE.html` · `23de41d091b7` · **SEO → Custom Head** |
| 87 | Servicios | `089-en-sellado-acrilico` | `GHL-PUBLICAR/lote-sitio/por-pagina/089-en-sellado-acrilico/2-CODIGO-CUSTOM-HTML.html` · 233 KB · `8453fc202bd2` | https://ilatekpr.com/en/sellado-acrilico | CREAR PÁGINA | `servicios/sellado-acrilico/en/HEAD-TEMPLATE.html` · `79fa47723247` |
| 88 | Servicios | `090-en-sellado-de-poliuretano` | `GHL-PUBLICAR/lote-sitio/por-pagina/090-en-sellado-de-poliuretano/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `c5104d59f51c` | https://ilatekpr.com/en/sellado-de-poliuretano | CREAR PÁGINA | `servicios/sellado-de-poliuretano/en/HEAD-TEMPLATE.html` · `3027d3524074` |
| 89 | Servicios | `091-en-sellado-de-silicona` | `GHL-PUBLICAR/lote-sitio/por-pagina/091-en-sellado-de-silicona/2-CODIGO-CUSTOM-HTML.html` · 233 KB · `4c1b5406abc3` | https://ilatekpr.com/en/sellado-de-silicona | CREAR PÁGINA | `servicios/sellado-de-silicona/en/HEAD-TEMPLATE.html` · `6888f9032c97` |
| 90 | Categorías | `092-en-sellado-de-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/092-en-sellado-de-techos/2-CODIGO-CUSTOM-HTML.html` · 272 KB · `3aa3d643f6a2` | https://ilatekpr.com/en/sellado-de-techos | CREAR PÁGINA | `categorias/sellado-de-techos/en/HEAD-TEMPLATE.html` · `45714ad86e33` |
| 91 | Servicios | `093-en-sellado-de-techos-comercial` | `GHL-PUBLICAR/lote-sitio/por-pagina/093-en-sellado-de-techos-comercial/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `e48b5665c451` | https://ilatekpr.com/en/sellado-de-techos-comercial | CREAR PÁGINA | `servicios/sellado-de-techos-comercial/en/HEAD-TEMPLATE.html` · `172d21a1c754` |
| 92 | Servicios | `094-en-sellado-de-techos-industrial` | `GHL-PUBLICAR/lote-sitio/por-pagina/094-en-sellado-de-techos-industrial/2-CODIGO-CUSTOM-HTML.html` · 235 KB · `9b77d062af9b` | https://ilatekpr.com/en/sellado-de-techos-industrial | CREAR PÁGINA | `servicios/sellado-de-techos-industrial/en/HEAD-TEMPLATE.html` · `da113cd7815d` |
| 93 | Servicios | `095-en-sellado-de-techos-residencial` | `GHL-PUBLICAR/lote-sitio/por-pagina/095-en-sellado-de-techos-residencial/2-CODIGO-CUSTOM-HTML.html` · 236 KB · `565ef47f0c29` | https://ilatekpr.com/en/sellado-de-techos-residencial | CREAR PÁGINA | `servicios/sellado-de-techos-residencial/en/HEAD-TEMPLATE.html` · `69f31bc5d5ac` |
| 94 | Categorías | `096-en-servicios` | `GHL-PUBLICAR/lote-sitio/por-pagina/096-en-servicios/2-CODIGO-CUSTOM-HTML.html` · 284 KB · `c2f14d5e1ad1` | https://ilatekpr.com/en/servicios | CREAR PÁGINA | `categorias/servicios/en/HEAD-TEMPLATE.html` · `d7c1818f657d` |
| 95 | Categorías | `097-en-servicios-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/097-en-servicios-techos/2-CODIGO-CUSTOM-HTML.html` · 376 KB · `f1d4d9bd2f43` | https://ilatekpr.com/en/servicios-techos | CREAR PÁGINA | `categorias/techos/en/HEAD-TEMPLATE.html` · `16877d1157e1` |
| 96 | Categorías | `098-en-techos` | `GHL-PUBLICAR/lote-sitio/por-pagina/098-en-techos/2-CODIGO-CUSTOM-HTML.html` · 286 KB · `251ce260d06f` | https://ilatekpr.com/en/techos | CREAR PÁGINA | `categorias/techos/en/HEAD-TEMPLATE.html` · `16877d1157e1` |
| 97 | Servicios | `099-en-techos-de-asfalto` | `GHL-PUBLICAR/lote-sitio/por-pagina/099-en-techos-de-asfalto/2-CODIGO-CUSTOM-HTML.html` · 232 KB · `a851e6f8cfa6` | https://ilatekpr.com/en/techos-de-asfalto | CREAR PÁGINA | `servicios/techos-de-asfalto/en/HEAD-TEMPLATE.html` · `b01c4f4c0cac` |
| 98 | Servicios | `100-en-techos-de-concreto` | `GHL-PUBLICAR/lote-sitio/por-pagina/100-en-techos-de-concreto/2-CODIGO-CUSTOM-HTML.html` · 233 KB · `e2f296b7c7dc` | https://ilatekpr.com/en/techos-de-concreto | CREAR PÁGINA | `servicios/techos-de-concreto/en/HEAD-TEMPLATE.html` · `c770e8de8257` |
| 99 | Servicios | `101-en-techos-de-madera` | `GHL-PUBLICAR/lote-sitio/por-pagina/101-en-techos-de-madera/2-CODIGO-CUSTOM-HTML.html` · 233 KB · `4fdcf9ee09c9` | https://ilatekpr.com/en/techos-de-madera | CREAR PÁGINA | `servicios/techos-de-madera/en/HEAD-TEMPLATE.html` · `f2bd4f6f04c0` |
| 100 | Servicios | `102-en-techos-de-teja` | `GHL-PUBLICAR/lote-sitio/por-pagina/102-en-techos-de-teja/2-CODIGO-CUSTOM-HTML.html` · 232 KB · `10cb7d2d468b` | https://ilatekpr.com/en/techos-de-teja | CREAR PÁGINA | `servicios/techos-de-teja/en/HEAD-TEMPLATE.html` · `bc00f79a784c` |
| 101 | Servicios | `103-en-techos-de-zinc` | `GHL-PUBLICAR/lote-sitio/por-pagina/103-en-techos-de-zinc/2-CODIGO-CUSTOM-HTML.html` · 232 KB · `05d495ed4c3d` | https://ilatekpr.com/en/techos-de-zinc | CREAR PÁGINA | `servicios/techos-de-zinc/en/HEAD-TEMPLATE.html` · `107c3a89720a` |
| 102 | Servicios | `104-en-techos-planos` | `GHL-PUBLICAR/lote-sitio/por-pagina/104-en-techos-planos/2-CODIGO-CUSTOM-HTML.html` · 232 KB · `d02405c7f0eb` | https://ilatekpr.com/en/techos-planos | CREAR PÁGINA | `servicios/techos-planos/en/HEAD-TEMPLATE.html` · `0d12f6d4892d` |
| 103 | Categorías | `105-en-techos-por-segmento` | `GHL-PUBLICAR/lote-sitio/por-pagina/105-en-techos-por-segmento/2-CODIGO-CUSTOM-HTML.html` · 234 KB · `4b2cfb8dd93a` | https://ilatekpr.com/en/techos-por-segmento | CREAR PÁGINA | `categorias/techos-por-segmento/en/HEAD-TEMPLATE.html` · `ecb5db3b529a` |
| 104 | Legales | `106-en-terminos` | `GHL-PUBLICAR/lote-sitio/por-pagina/106-en-terminos/2-CODIGO-CUSTOM-HTML.html` · 207 KB · `7dbb2d4f38f8` | https://ilatekpr.com/en/terminos | CREAR PÁGINA | `terminos-y-condiciones/en/HEAD-TEMPLATE.html` · `78640b29e57e` · **SEO → Custom Head** |
| 105 | Servicios | `107-en-tragaluces` | `GHL-PUBLICAR/lote-sitio/por-pagina/107-en-tragaluces/2-CODIGO-CUSTOM-HTML.html` · 231 KB · `d0994c51d6de` | https://ilatekpr.com/en/tragaluces | CREAR PÁGINA | `servicios/tragaluces/en/HEAD-TEMPLATE.html` · `c2c40072598f` |
| 106 | Servicios | `108-en-ventanas` | `GHL-PUBLICAR/lote-sitio/por-pagina/108-en-ventanas/2-CODIGO-CUSTOM-HTML.html` · 228 KB · `c8ca0f26638d` | https://ilatekpr.com/en/ventanas | CREAR PÁGINA | `servicios/ventanas/en/HEAD-TEMPLATE.html` · `e5e8690ba6c1` |
> **Cómo leer la tabla:** «Cuerpo a pegar» es el archivo que va en **Custom Code** (se pega entero). «Cabecera» solo existe en las 8 páginas del §2 y va en **SEO → Custom Head**; en las demás, el canonical viaja dentro del cuerpo o lo pone el panel SEO de GHL. El sha256 de 12 caracteres sirve para comprobar que el archivo no cambió: `sha256sum <archivo>` debe empezar por esos 12.

---

## 5. Rojos conocidos, fuera del lote

Estos verificadores están en rojo **hoy** y **no** bloquean el lote. Se documentan con su conteo medido en esta pasada. No se tocaron: son familias de páginas distintas o quedaron explícitamente fuera de este encargo.

| Rojo | Conteo medido | Por qué queda fuera |
|---|---|---|
| `verify-social-cards` | 80 fallos en **20 páginas `blog-*`** (185 tarjetas revisadas) | Blog |
| `verify-blog-en` | **25 avisos** en pares `/blog…` | Blog |
| `verify-cannibalization --strict` | **1 hallazgo** (dos FAQ del blog al 100 %) | Blog |
| `verify-structure --migration` | **47 HTML** marcados como cambiados | Guard histórico: falla por diseño |
| `faq-parity` global | **4.492 páginas**, `schema_sin_h3` **3.301** | Blog y comparativas antiguas. **El lote da 0** |
| `verificar-funnel-ghl` | **1.112 canónicas** de subdominio | Las landings municipales se publican por su propio funnel |
| `audit-link-graph` | **3 huérfanas**: `/comunidades`, `/en/communities`, `/en/home` | Se resuelven al crear esas 3 páginas |
| `verify-en` | **112 fallos** en 48 copias EN | Enlazan a páginas ES que aún no están publicadas |
| `verify-en-parity` | **12 de 51 pares** | Diferencias de tokens/cifras entre copias; cada artefacto es coherente consigo mismo |
| `verify-samples` | **6 muestras** con enlaces sin destino | Se resuelven al publicar `/techos`, `/comunidades`, `/en/home` |
| `scripts/audita-ghl.mjs` | 3 fallos, 8 avisos | 2 fallos nacen de premisas viejas del auditor (da `/comunidades` por no publicada; exige hijos en el índice de sitemap) y 1 es de blog |

**Consecuencia práctica:** publica primero el español y crea `/techos`, `/comunidades` y `/en/home` antes de dar el lote por cerrado. Mientras no existan, los verificadores de enlaces las verán como huérfanas o sin destino.

### Fuera de alcance por decisión expresa (no se tocó nada)
- El arreglo de FAQ de las landings de Comunidades (30.024 de 36.226 puntos de penalización).
- Los acordeones legales más allá de las cabeceras nuevas.
- `src/faq/faq-core.mjs` y cualquier interior de verificador.
- Cualquier página de `blog/`.

---

## 6. Qué cambió en esta pasada

1. **8 cabeceras nuevas** (`HEAD-TEMPLATE.html`) para garantía, política, términos y reseñas, en ES y EN: `description` + Open Graph + Twitter, sin duplicar `<title>`, canonical ni hreflang. Los **cuerpos de esas 8 páginas no se tocaron** (sus fechas de modificación son del 21–22 de noviembre, anteriores a esta pasada).
2. **Reparación del único rojo propio:** `verify-internal-links` exigía el contrato de localización (token de municipio + `data-ilatek-local-content`) en toda cabecera. Las 8 se pasaron por el formateador oficial del proyecto, sin tocar el verificador → **exit 0**.
3. **Índice del lote refrescado:** `00-CHECKLIST.csv` conservaba bytes y sha256 de antes de las últimas ediciones; se actualizaron esas dos columnas de las 106 filas desde los bytes reales. Nada más del CSV cambió.
4. **ZIP regenerado:** `por-pagina.zip` era del 16 de noviembre y traía bytes viejos (el cuerpo de garantía dentro del ZIP no coincidía con el del disco). Ahora son las 106 carpetas actuales + `_CABECERAS/` con las 8 cabeceras, y el sha del ZIP coincide con el disco.
5. **Este informe** se reescribió con la medición de hoy, incluida la tabla de los 106 y el detalle de las 8 cabeceras.

---

## 7. Lo que no se puede hacer desde este entorno

- **Publicar en GHL:** no hay sesión. Nada de este lote está publicado; las acciones «CREAR PÁGINA» siguen pendientes.
- **Validar las tarjetas sociales reales:** hace falta publicar y pasar las URLs por los depuradores de Facebook/LinkedIn. Aquí solo se comprobó que cada cabecera tiene las 16 etiquetas, `og:url` = canonical y la imagen existe en el CDN.
- **Comprobar los CDN externos** (`filesafe`, `leadconnector`, `reputationhub`): dependen de terceros y no se pueden verificar sin red.
- **Commitear o desplegar:** prohibido por el plan. Las 230 eliminaciones locales (`comunidades/landings/**`, `assets/`, `tools/`) siguen sin commitear a propósito: subirlas rompería el CDN de los heroes.
