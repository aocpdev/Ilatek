# tools/qa — tokenización de titulares, puente `dv-ghl-values` y QA del runtime

Herramientas que producen y prueban el estándar **value-driven** de las
landings: titulares (H1/H2/FAQ) con `{{custom_values.business__county_name}}`,
resolvers que leen `data-*` crudos contra los slots del puente y el harness de
Playwright que exige 0 tokens crudos visibles.

## Estructura: un solo dueño por pieza

```
tools/qa/
├── custom-values.json          contrato único: 13 nombres canónicos + slots/separador del puente
├── repo_root.py                raíz del repo (Python); lo importan todos los .py
├── repo_root.mjs               raíz del repo + Playwright (Node); lo importan los .mjs
├── bridge/ilatek-bridge.html   plantilla del helper ILATEK_BRIDGE
├── fix_resolver_bridge.py      renderiza la plantilla e inyecta helper + alias de resolver
├── audit_tokens_global.py      audita los nombres de token contra el contrato
├── qa_tokenized_headings.mjs   contrato bridge-only + barrido de los 47 canónicos
└── …resto de utilidades
```

- **Raíz del repo: descubierta, no asumida.** `repo_root.py` / `repo_root.mjs`
  suben hasta el primer directorio con `.git`. No hay profundidad fija ni
  carpeta `Ilatek/` grabada: el clon puede llamarse y vivir donde sea.
- **Helper del puente: una sola definición.** El cuerpo vive en
  `bridge/ilatek-bridge.html` con tres placeholders (`__SLOT_MAP__`,
  `__SEPARATOR__`, `__SLOT_COUNT__`) que `fix_resolver_bridge.py` renderiza con
  `custom-values.json` antes de inyectarlo. **No editar el helper dentro de un
  canónico**: se regenera. `--check` verifica que el helper embebido en los 47
  canónicos sea byte a byte el del template (reporta `DRIFT` si no).
- **Alias y statements: generados.** `ilBV.attr(...)||ilBV.slot(N)` sale de
  `ATTR_TOKEN` + el orden de slots del contrato; no hay reemplazos escritos a
  mano por forma (solo la lista de statements originales que hay que parchear).
- **Nombres canónicos: uno solo.** `custom-values.json` es la lista exacta del
  owner; `audit_tokens_global.py` y `qa_tokenized_headings.mjs` la leen en vez de
  retipear los nombres o el orden de slots.
- **Playwright: una sola resolución**, en `repo_root.mjs`: `import 'playwright'`
  → `$PLAYWRIGHT_MODULES/playwright` → `<repo>/node_modules/playwright` →
  `<repo>/../scripts/.qaenv/node_modules/playwright`.

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
| `python tools/qa/fix_resolver_bridge.py [--check]` | Inyecta el helper renderizado y parchea los resolvers para resolver `data-*` crudos contra el puente (idempotente; `--check` valida también el helper). |
| `python tools/qa/audit_tokens_global.py` | Audita que solo existan los `custom_values` del contrato (0 no-canon = PASS) → `shots/audit-tokens-global.json`. |
| `python tools/qa/build_runtime_harness.py` | Construye las copias del harness (sentinel/resolver/original) e imprime `TMP=…`. |
| `node tools/qa/run_runtime_qa.mjs` | QA completo del runtime del home → `<repo>/shots/qa-result4.json`. |
| `node tools/qa/qa_tokenized_headings.mjs` | Contrato bridge-only: casos con variantes de puente + barrido de los 47 canónicos. |
| `python tools/qa/ghl_paste_map.py [dominio]` | Mapa URL del sitemap → archivo canónico. |
| `python tools/qa/verify_value_driven.py [dominio] --pueblo <Pueblo>` | Barrido live del sitemap (exit 2 si falla) → `shots/verify-value-driven.json`. |
| `python tools/qa/legal_harness.py` / `legal_qa.py` | Harness y QA de las 3 páginas legales → `shots/legal-qa.json`. |
| `tools/qa/check_landing_pages.sh` / `check_rendered_values.sh` | Utilidades de curl sobre `/tmp` (no dependen del repo). |
| `fix_homepage.py`, `inventory_home_multiservicios.py`, `retouch_avatar.py` | Utilidades puntuales de la misión (home con valores horneados, inventario, retoque de avatar). |
| `runtime_qa.mjs` | Módulo interno que `run_runtime_qa.mjs` importa (no se ejecuta solo). |

Validación de referencia (Oct 2026): `qa_tokenized_headings.mjs` ALL GREEN,
`audit_tokens_global.py` exit 0, `faq-parity` en su línea base documentada
(`55/458/10/10/33`) y `run_runtime_qa.mjs` con 0 tokens crudos visibles.
