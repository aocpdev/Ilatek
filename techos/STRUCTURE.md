# Ilatek Techos — estructura

Sección de techos de Ilatek (34 landings = hub + 5 madres + 28 hijas), publicada
como Custom Code en GHL. Este documento es el mapa de dueños: cada concern tiene
un solo módulo que lo posee. Las siguientes pasadas se construyen encima de esto.

## Módulos (lib/)

| Módulo | Posee | No hace |
|---|---|---|
| `lib/data/hub.mjs` | copy del hub | nada más |
| `lib/data/{reparacion,sellado,impermeabilizacion,segmentos,mantenimiento}.mjs` | copy de secciones de cada clúster; **el primer elemento es la madre** | no define jerarquía |
| `lib/data/meta.mjs` | capa SEO/AEO por slug: `benTitle`, `procTitle`, `procLead`, `price`, `serviceName`, `serviceDesc`, `whyQ/whyA` (34 entradas) | no renderiza |
| `lib/model.mjs` | **jerarquía** hub → madre → hija; `buildTree()` deriva los `breadcrumb` del orden de los clústers | no conoce HTML |
| `lib/kit.mjs` | fusión copy-de-sección + `META[slug]`; quita el FAQ genérico y anexa `whyQ/whyA`; `pic()`/`ASSETS` | no conoce el DOM |
| `lib/css.mjs` | sistema de diseño scopeado bajo `__ROOT__` | — |
| `lib/parts.mjs` | bloques compartidos del home (cobertura, reviews) con swap de encabezado/descripción; **lanza** si falta el texto fuente | no arma la página |
| `lib/schema.mjs` | JSON-LD: `RoofingContractor(+makesOffer)` · `WebSite` · `Service(+Offer)` · `BreadcrumbList` · `FAQPage` | — |
| `lib/page.mjs` | ensamblado de la landing (9 secciones + resolver de custom values) | no valida |
| `lib/audit.mjs` | **política**: `FORBIDDEN`, `cleanGuard`, `validateModel`, `readSchema`, `auditHtml` | no escribe |

## Orquestación (raíz)

- `build-techos.mjs` — genera las 34 landings y los artefactos SEO (head-seo,
  fragmento y bloque `TECHOS:START/END` dentro de `Ilatek/sitemap.xml`), y audita
  cada página **antes** de escribirla con `lib/audit.mjs`. Falla con exit code ≠ 0.
- `verify-techos.mjs` — NO genera: relee los artefactos ya escritos y prueba el
  resultado publicado (schema en 34/34, precio schema == visible, FAQPage 1:1,
  cero copy de limpieza, canonical/sitemap/llms = exactamente los 34 slugs).
- `serve-techos.mjs` — servidor estático de QA que sirve en **UTF-8 explícito**.
  Imprescindible: las landings son fragmentos sin `<meta charset>`, así que sin ese
  charset el navegador decodifica como cp1252 y cualquier aserción sobre el texto
  renderizado da falso negativo. GHL sirve sus páginas en UTF-8.
- `qa-render.mjs` — prueba de **renderizado** (skill browser-automation): recorre
  las 34 landings a 1440 y 390 y afirma sobre el DOM real (texto por servicio,
  tokens resueltos, copy de limpieza, JSON-LD completo, consola, red, overflow).
- `img-audit.mjs` — lista qué asset stock usa cada ranura (hero/incluye) por slug.

## Flujo de datos

```
data/*.mjs ──mk()──▶ kit (inyecta META[slug]) ──▶ model.buildTree() (breadcrumb)
                                                        │
                                     page.buildPage(page)│
                                                        ▼
                                             HTML ──audit.auditHtml──▶ disco
```

Regla de capas: la **jerarquía** la posee `model.mjs`; la **capa por slug** la
posee `meta.mjs`; la **política de publicación** la posee `audit.mjs`. Nadie más
duplica esas tres cosas.

## Uso

```bash
node Ilatek/techos/build-techos.mjs                 # genera + valida (Fallos: 0 requerido)
node Ilatek/techos/verify-techos.mjs                # prueba los artefactos escritos
node Ilatek/techos/serve-techos.mjs 4321 &           # sirve en UTF-8
node <skill>/browser.mjs http://127.0.0.1:4321/ghl-techos-landing.html \
     --script Ilatek/techos/qa-render.mjs            # prueba el DOM renderizado
node Ilatek/techos/img-audit.mjs                     # mapa de imágenes por slug
```

Nota: las aserciones deben comparar **sin distinguir mayúsculas** sobre el texto
renderizado — `innerText` devuelve el texto ya afectado por `text-transform`.

## Reglas fijas

- 6 custom values, cero URLs/teléfonos/emails hardcodeados; JSON-LD usa tokens.
- Cobertura y Reviews: estructura byte-idéntica al home; solo cambian encabezado/descripción.
- Copy de limpieza de propiedades prohibido; "limpieza/limpiar/…" exige contexto de techo dentro del mismo elemento.
