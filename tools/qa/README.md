# tools/qa — tokenización de titulares, puente `dv-ghl-values` y QA del runtime

Herramientas que producen y prueban el estándar **value-driven** de las
landings: titulares (H1/H2/FAQ) con `{{custom_values.business__county_name}}`,
resolvers que leen `data-*` crudos contra los slots del puente y el harness de
Playwright que exige 0 tokens crudos visibles.

## Estructura: un solo dueño por pieza

```
tools/qa/
├── custom-values.json          contrato único: 13 nombres canónicos + slots/separador del puente
├── repo_root.py                raíz del repo + arranque de Chromium (Python); lo importan los .py
├── repo_root.mjs               raíz del repo + Playwright (Node); lo importan los .mjs
├── bridge/ilatek-bridge.html   plantilla del helper ILATEK_BRIDGE
├── fix_resolver_bridge.py      renderiza la plantilla e inyecta helper + alias de resolver
├── audit_tokens_global.py      audita los nombres de token contra el contrato
├── qa_tokenized_headings.mjs   contrato bridge-only + barrido de los 66 consumidores
└── …resto de utilidades
```

- **Raíz del repo: descubierta, no asumida.** `repo_root.py` / `repo_root.mjs`
  suben hasta el primer directorio con `.git`. No hay profundidad fija ni
  carpeta `Ilatek/` grabada: el clon puede llamarse y vivir donde sea.
- **Helper del puente: una sola definición.** El cuerpo vive en
  `bridge/ilatek-bridge.html` con cuatro placeholders (`__SLOT_MAP__`,
  `__SEPARATOR__`, `__MIN_SLOT_COUNT__`, `__PIXEL_SLOT__`) que
  `fix_resolver_bridge.py` renderiza con `custom-values.json` antes de
  inyectarlo. **No editar el helper dentro de un canónico**: se regenera. Sin
  `--check`, el fixer re-renderiza los helpers obsoletos; `--check` verifica que
  el helper embebido en los 47 canónicos sea byte a byte el del template
  (reporta `DRIFT` si no).
- **Alias y statements: generados.** `ilBV.attr(...)||ilBV.slot(N)` sale de
  `ATTR_TOKEN` + el orden de slots del contrato; no hay reemplazos escritos a
  mano por forma (solo la lista de statements originales que hay que parchear).
  El parche del pueblo se aplica en **todos** los archivos con resolver propio,
  no solo en los canónicos nuevos: los componentes de tarjetas (`A-web`), el
  carrusel sin respaldo (`C3`) y las variantes largas del nav se resolvían con su
  propio literal y el pueblo de la sección no coincidía con el del H1.
- **El pueblo no se escribe en el HTML.** Los titulares y subtítulos de sección
  que decían «… en Puerto Rico» en duro pasan a
  `{{custom_values.business__county_name}}` (`apply_town_literals`), así que la
  localidad sale del mismo custom value que el H1 y las tarjetas. El texto legal
  (`garantia/`, `terminos-y-condiciones/`, `politica-de-privacidad/`) se salta a
  propósito: ahí «en Puerto Rico» es jurisdicción. **Queda pendiente el copy que
  se pinta desde datos**: el JSON-LD (135 ocurrencias en 48 archivos) y el FAQ de
  `componentes/ghl-faq-embed.html`, cuyos H3 visibles salen del propio schema.
  No es markup estático y va en una pasada aparte.
  Como el fixer es idempotente, `--check` también detecta si alguien vuelve a
  escribir el pueblo a mano en un titular (sale como `DRIFT`).
- **Nombres canónicos: uno solo.** `custom-values.json` es la lista exacta del
  owner; `audit_tokens_global.py` y `qa_tokenized_headings.mjs` la leen en vez de
  retipear los nombres o el orden de slots. El último slot es **`pixel_id`**: el
  helper inicia el Meta Pixel con ese id (solo si es numérico válido) una sola
  vez; `min_slots: 6` deja que un párrafo viejo de 6 slots siga resolviendo
  pueblo/contacto aunque todavía no traiga el pixel.
- **Cobertura: quien lee el puente, lleva el helper.** No hay lista de nombres:
  los 66 archivos publicables que contienen `dv-ghl-values` (47 canónicos +
  home + legales/embeds + componentes) reciben el helper renderizado y por tanto
  el pixel. La home es `ghl-home-multiservicios.html`, que no termina en
  `-landing.html`: una regla por nombre la dejaba fuera y sin pixel.
- **Canales de resolución, en orden.** párrafo nativo / `data-*` expandidos →
  `<title>`/`og:description` (GHL expande ahí el pueblo del mismo custom value) →
  subdominio (`juncos.ilatekpr.com` → Juncos, con acentos desde
  `custom-values.json → town_accents`) → `brand` del contrato. Un `data-*` con el
  literal genérico (`Puerto Rico`) cuenta como vacío: no bloquea al subdominio.
  `ILATEK_BRIDGE.source()` dice de dónde salió (`parrafo|meta|host|data`).
- **Marca como última instancia, no como primer recurso.** `brand` del contrato
  fija email, teléfono, dominio, redes y `pixel_id` (el que GHL ya enciende en la
  raíz). Así el embed funciona sin Paragraph nativo; el párrafo solo aporta lo
  que sea distinto por location.
- **Pixel: obligatorio en cada consumidor del puente.** `audit_tokens_global.py`
  exige helper + bootstrap (`fbevents.js`) + API `pixel` en los 66 y falla
  (exit 1) si alguno pierde el pixel, deja el token crudo o conserva un gate
  exacto de 6 slots; el probe exige `fbq('init', <id resuelto>)` y `PageView`
  reales (request a `connect.facebook.net` interceptada en QA).
- **Párrafo y walkers: tolerantes al slot extra.** Los walkers propios de cada
  página (`ILATEK_LINKS`, `ILATEK_GEO`, footer) exigían `parts.length === 6` y
  descartaban el párrafo de 7 del contrato, tirando los enlaces internos al
  dominio central; ahora aceptan `min_slots` o más (`<`/`>=`), lo que el fixer
  aplica y `audit_tokens_global.py` exige (0 gates exactos).
- **Un solo init y un solo PageView.** El helper decide el pixel con la página
  ya cargada (`load`), reutiliza el `fbq` de GHL cuando la página lo enciende por
  su cuenta (funnel settings) y no duplica `init`, `PageView` ni `fbevents.js`;
  prefiere el párrafo completo aunque haya uno viejo antes, y una segunda copia
  del helper en la misma página sale sin duplicar nada. Un `pixel_id`
  explícitamente inválido en el párrafo no carga terceros y no lanza; un slot
  vacío usa el pixel de marca del contrato.
- **Playwright: una sola resolución**, en `repo_root.mjs`: `import 'playwright'`
  → `$PLAYWRIGHT_MODULES/playwright` → `<repo>/node_modules/playwright` →
  `<repo>/../scripts/.qaenv/node_modules/playwright`.

- **Portador en el embed, sin gate.** El fixer deja, justo después del helper,
  un `<p class="dv-ghl-values" id="dv-ghl-values" hidden>` con los 7 tokens
  (generado desde `custom-values.json`, una sola fuente). Ese portador se
  oculta siempre por CSS y **no es contenido**: si se barriera, el bridge
  leería su propio reemplazo como si GHL lo hubiera expandido. La página no
  se oculta ni se encolan handlers: pinta de inmediato y los values se
  aplican cuando aparecen (párrafo nativo expandido > `data-*` > literal).
  Estados de diagnóstico en `<html data-ilatek-values>`: `ready` | `missing`.
  Ojo: GHL **no** expande tokens dentro del Custom Code (verificado en vivo:
  69 crudos en texto y 399 en atributos), así que el portador solo puebla si
  se pega además el Paragraph nativo del builder.

Los artefactos de QA (`shots/`) se escriben **dentro de la raíz del repo**
(`REPO/shots`, ignorado por git), no junto al clon.

## Requisitos

- Python 3.10+ (solo stdlib; `legal_qa.py` requiere Playwright de Python).
- Node 18+ y Playwright para Chromium. Si no aparece: `npm i playwright && npx
  playwright install chromium` o exportá `PLAYWRIGHT_MODULES` apuntando a un
  `node_modules` que lo contenga.

## Orden de uso

| Script | Qué hace |
|---|---|
| `python tools/qa/populate_headings.py` | Tokeniza titulares locales (H1 hero completo, H2, FAQ de precio) — idempotente. |
| `python tools/qa/fix_resolver_bridge.py [--check]` | Inyecta el helper renderizado (helper + pixel) en los 66 consumidores del puente, parchea los resolvers de los canónicos y hace tolerantes los gates de 6 slots (idempotente; sin `--check` re-renderiza helpers obsoletos, con `--check` valida helper, gates y `ilBV.slot`). |
| `python tools/qa/audit_tokens_global.py` | Audita que solo existan los `custom_values` del contrato y que los 66 consumidores del puente tengan el Meta Pixel y 0 gates exactos-6 (exit 1 si falta) → `shots/audit-tokens-global.json`. |
| `python tools/qa/build_runtime_harness.py` | Construye las copias del harness (sentinel / resolver / original / late / missing / double / badpixel) e imprime `TMP=…`. |
| `node tools/qa/run_runtime_qa.mjs` | QA completo del runtime del home + los cuatro bordes del bridge (párrafo tardío, ausente, doble y píxel inválido) → `<repo>/shots/qa-result4.json`. Exit 1 si un borde del bridge falla. |
| `node tools/qa/qa_tokenized_headings.mjs` | Contrato bridge-only: casos con variantes de puente, bordes del pixel (párrafo después, dos párrafos, helper duplicado, ids inválidos) y barrido de los 66 consumidores; exige pueblo, un `init` + un `PageView`, enlaces al subdominio y cero tokens crudos. |
| `python tools/qa/ghl_paste_map.py [dominio]` | Mapa URL del sitemap → archivo canónico. |
| `python tools/qa/verify_value_driven.py [dominio] --pueblo <Pueblo>` | Barrido live del sitemap: puente con `min_slots` o más (del contrato), title/pueblo y, en Chromium sobre la URL servida, el estado `ready` (o `missing` con su razón), el pixel encendido (`fbq('init')` con el id, un `PageView`, un `fbevents.js`, sin tokens visibles). Exit 2 si falla o si no hay render → `shots/verify-value-driven.json`. |
| `python tools/qa/legal_harness.py` / `legal_qa.py` | Harness y QA de las 3 páginas legales → `shots/legal-qa.json`. |
| `tools/qa/check_landing_pages.sh` / `check_rendered_values.sh` | Utilidades de curl sobre `/tmp` (no dependen del repo). |
| `fix_homepage.py`, `inventory_home_multiservicios.py`, `retouch_avatar.py` | Utilidades puntuales de la misión (home con valores horneados, inventario, retoque de avatar). |
| `runtime_qa.mjs` | Módulo interno que `run_runtime_qa.mjs` importa (no se ejecuta solo). |

Validación de referencia (Oct 2026): `qa_tokenized_headings.mjs` ALL GREEN
(150 PASS / 0 FAIL / 1 SKIP, 66 consumidores), `audit_tokens_global.py` exit 0
(66/66 con pixel), `fix_resolver_bridge.py --check` 0 drift, `faq-parity` en su
línea base documentada (`55/458/10/10/33`) y `run_runtime_qa.mjs` exit 0 con 0
tokens crudos visibles.
