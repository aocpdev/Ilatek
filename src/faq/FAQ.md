# FAQ engine — una sola fuente por página

Las 17 fuentes originales de FAQ de ILATEK ahora se resuelven mediante
`docs/estructura.json` en categorías, servicios, componentes y archivo. La landing dental
externa participa únicamente si se proporciona `DENTAL_FILE`. Se usa el mismo mecanismo: una lista
por página produce el H3 visible **y** el bloque JSON-LD `FAQPage` a la vez, así
no pueden volver a divergir. No hay modo alternativo.

## Módulos

| Módulo | Es dueño de | No hace |
|---|---|---|
| `faq-core.mjs` | el MODELO y la REGLA: normalización (`text`, `question`, `flat`), `faqItems`, `visibleFaqs`, `schemaFaqs`, `extractFaqs`, `checkHtml` | IO, render |
| `faq-render.mjs` | la PRESENTACIÓN: `VARIANTS` por familia de markup, `renderGrid`, `renderSchema` | IO |
| `faq-engine.mjs` | el MECANISMO + interfaz: la lista `PAGES`, `emit`, `build`, CLI | — |
| `faq-source.mjs` | los DATOS: la copia única por página (`FAQ_SOURCES`) | — |
| `faq-parity.mjs` | la COMPROBACIÓN (IO): escanea carpetas y reporta | — |

## Flujo de datos

```
grid visible ──emit──▶ faq-source.mjs ──build──▶ grid visible (byte a byte)
                                        └──────▶ JSON-LD FAQPage (mismo texto)
```

`build` además verifica cada página con `checkHtml` antes de darla por buena.

## Regla

La pregunta del schema se toma **tal cual** del H3 visible; la respuesta del schema
se deriva del MISMO HTML del `<p>` (texto plano), así es idéntica a la visible.
La copia visible es la fuente de verdad: no se reescribe salvo que el H3 esté roto.

## Uso

```bash
node Ilatek/src/faq/faq-engine.mjs emit   # extrae el copy visible → faq-source.mjs
node Ilatek/src/faq/faq-engine.mjs build  # genera grid + schema y verifica
node Ilatek/src/faq/faq-parity.mjs        # escanea las 52 páginas de las dos carpetas
```

Esperado: `respuestas_divergentes=0; items_sin_pregunta=0` y `build` idempotente.
El copy visible del H3 es byte a byte igual: `git diff` no debe tocar líneas con
`<details>`, `<summary>`, `<h3>` ni `<p>`.

Nota: las 34 páginas de `Ilatek/techos` tienen su propio motor (ya de fuente única)
y no pasan por este.

Estado al reorganizar (2026-10-10): el verificador general ya tenía discrepancias
previas; consultar `documentacion/VERIFICACION.md`. No ejecutar `build` como parte
de un traslado de carpetas: puede reemplazar contenido editado directamente.
El modelo actual de techos contiene 32 páginas; sus archivos de entrega están
en `categorias/` y `servicios/`, no junto al generador.
