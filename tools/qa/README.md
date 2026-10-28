# tools/qa — tokenización de titulares, puente `dv-ghl-values` y QA del runtime

Herramientas que producen y prueban el estándar **value-driven** de las
landings: titulares (H1/H2/FAQ) con `{{custom_values.business__county_name}}`,
resolvers que leen `data-*` crudos contra los slots del puente y el harness de
Playwright que exige 0 tokens crudos visibles.

## Raíz del repo: descubierta, no asumida

Cada script **descubre la raíz del repositorio caminando hacia arriba hasta el
directorio que contiene `.git`** (Python: primer padre con `.git`; Node:
`repoRoot()` con `existsSync`). No hay profundidad fija ni nombre de carpeta
(`Ilatek/`) grabado: el repo puede clonarse con cualquier nombre y en cualquier
ubicación.

```
cualquier/ruta/mi-clon/   <- raíz descubierta (.git); aquí viven categorias/, servicios/…
└── tools/qa/             <- estos scripts
```

Los artefactos de QA (`shots/`) se escriben **dentro de la raíz del repo**
(`REPO/shots`, ya ignorado por git), no junto al clon. Aun así, los módulos
`runtime_qa.mjs`/`legal_qa.py` guardan capturas con rutas relativas al cwd, así
que la invocación recomendada es desde la raíz del repo.

## Requisitos

- Python 3.10+ (solo stdlib; `legal_qa.py` requiere Playwright de Python).
- Node 18+ y Playwright para Chromium. Resolución, en orden: `import
  'playwright'` (dependencia local), `$PLAYWRIGHT_MODULES/playwright`,
  `<repo>/node_modules/playwright`, `<repo>/../scripts/.qaenv/node_modules/playwright`
  (layout histórico del workspace). Si no aparece: `npm i playwright && npx
  playwright install chromium` o exporta `PLAYWRIGHT_MODULES` apuntando a un
  `node_modules` que lo contenga.

## Orden de uso

| Script | Qué hace |
|---|---|
| `python Ilatek/tools/qa/populate_headings.py` | Tokeniza titulares locales (H1 hero completo, H2, FAQ de precio) — idempotente. |
| `python Ilatek/tools/qa/fix_resolver_bridge.py [--check]` | Inserta el helper `ILATEK_BRIDGE` y parchea los resolvers para resolver `data-*` crudos contra el puente (idempotente). |
| `python Ilatek/tools/qa/audit_tokens_global.py` | Audita que solo existan los `custom_values` canónicos (0 no-canon = PASS) → `shots/audit-tokens-global.json`. |
| `python Ilatek/tools/qa/build_runtime_harness.py` | Construye las copias del harness (sentinel/resolver/original) e imprime `TMP=…`. |
| `node tools/qa/run_runtime_qa.mjs` | QA completo del runtime del home → `<repo>/shots/qa-result4.json`. |
| `node tools/qa/qa_tokenized_headings.mjs` | Contrato bridge-only: 3 casos con variantes de puente + barrido de los 47 canónicos. |
| `python Ilatek/tools/qa/ghl_paste_map.py [dominio]` | Mapa URL del sitemap → archivo canónico. |
| `python Ilatek/tools/qa/verify_value_driven.py [dominio] --pueblo <Pueblo>` | Barrido live del sitemap (exit 2 si falla) → `shots/verify-value-driven.json`. |
| `python Ilatek/tools/qa/legal_harness.py` / `legal_qa.py` | Harness y QA de las 3 páginas legales → `shots/legal-qa.json`. |
| `scripts/check_landing_pages.sh` / `check_rendered_values.sh` | Utilidades de curl sobre `/tmp` (no dependen del repo). |
| `fix_homepage.py`, `inventory_home_multiservicios.py`, `retouch_avatar.py` | Utilidades puntuales de la misión (home con valores horneados, inventario, retoque de avatar). |
| `runtime_qa.mjs` | Módulo interno que `run_runtime_qa.mjs` importa (no se ejecuta solo). |

Validación de referencia (Oct 2026): `qa_tokenized_headings.mjs` ALL GREEN,
`audit_tokens_global.py` exit 0, `faq-parity` en su línea base documentada
(`55/458/10/10/33`) y `run_runtime_qa.mjs` con 0 tokens crudos visibles.
