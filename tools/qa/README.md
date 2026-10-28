# tools/qa — tokenización de titulares, puente `dv-ghl-values` y QA del runtime

Herramientas que producen y prueban el estándar **value-driven** de las
landings: titulares (H1/H2/FAQ) con `{{custom_values.business__county_name}}`,
resolvers que leen `data-*` crudos contra los slots del puente y el harness de
Playwright que exige 0 tokens crudos visibles.

## Layout que esperan

Los scripts resuelven la raíz del workspace como **tres niveles arriba** de este
directorio (`../../..`), es decir, esperan el repo clonado con el nombre
`Ilatek/` dentro de un directorio de trabajo:

```
<workspace>/            <- raíz que los scripts llaman ROOT (cwd recomendado)
└── Ilatek/             <- este repositorio
    ├── categorias/…    (canónicos)
    ├── servicios/…
    └── tools/qa/       <- estos scripts
```

Los `shots/` de QA se escriben **relativos al cwd**, así que ejecuta desde
`<workspace>`. Si el repo se clona en otro sitio, ajusta esa profundidad (una
línea: `ROOT`/`parents[3]`) o mueve el checkout a la estructura de arriba.

## Requisitos

- Python 3.10+ (solo stdlib; `legal_qa.py` requiere Playwright de Python).
- Node 18+ y Playwright para Chromium. El harness lo busca primero en
  `node_modules/playwright` y cae a `<workspace>/scripts/.qaenv`; si no existe,
  instala: `npm i playwright && npx playwright install chromium` o define el
  paquete donde `require.resolve('playwright')` lo encuentre.

## Orden de uso

| Script | Qué hace |
|---|---|
| `python Ilatek/tools/qa/populate_headings.py` | Tokeniza titulares locales (H1 hero completo, H2, FAQ de precio) — idempotente. |
| `python Ilatek/tools/qa/fix_resolver_bridge.py [--check]` | Inserta el helper `ILATEK_BRIDGE` y parchea los resolvers para resolver `data-*` crudos contra el puente (idempotente). |
| `python Ilatek/tools/qa/audit_tokens_global.py` | Audita que solo existan los `custom_values` canónicos (0 no-canon = PASS) → `shots/audit-tokens-global.json`. |
| `python Ilatek/tools/qa/build_runtime_harness.py` | Construye las copias del harness (sentinel/resolver/original) e imprime `TMP=…`. |
| `node Ilatek/tools/qa/run_runtime_qa.mjs` | QA completo del runtime del home → `shots/qa-result4.json`. |
| `node Ilatek/tools/qa/qa_tokenized_headings.mjs` | Contrato bridge-only: 3 casos con variantes de puente + barrido de los 47 canónicos. |
| `python Ilatek/tools/qa/ghl_paste_map.py [dominio]` | Mapa URL del sitemap → archivo canónico. |
| `python Ilatek/tools/qa/verify_value_driven.py [dominio] --pueblo <Pueblo>` | Barrido live del sitemap (exit 2 si falla) → `shots/verify-value-driven.json`. |
| `python Ilatek/tools/qa/legal_harness.py` / `legal_qa.py` | Harness y QA de las 3 páginas legales → `shots/legal-qa.json`. |
| `scripts/check_landing_pages.sh` / `check_rendered_values.sh` | Utilidades de curl sobre `/tmp` (no dependen del repo). |
| `fix_homepage.py`, `inventory_home_multiservicios.py`, `retouch_avatar.py` | Utilidades puntuales de la misión (home con valores horneados, inventario, retoque de avatar). |
| `runtime_qa.mjs` | Módulo interno que `run_runtime_qa.mjs` importa (no se ejecuta solo). |

Validación de referencia (Oct 2026): `qa_tokenized_headings.mjs` ALL GREEN,
`audit_tokens_global.py` exit 0, `faq-parity` en su línea base documentada
(`55/458/10/10/33`) y `run_runtime_qa.mjs` con 0 tokens crudos visibles.
