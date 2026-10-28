# Runbook: landing multiservicios por location (flujo snapshot)

El HTML (`ghl-home-multiservicios.html`) no se modifica por pueblo. El valor
del pueblo entra al sitio por **dos canales que GHL SÍ resuelve**, nunca por
el HTML pegado:

1. **SEO nativo del panel** (title / meta description con
   `{{custom_values.business__county_name}}` en el campo SEO de la página):
   GHL lo sustituye server-side al servir la página — verificado en vivo en
   juncos.ilatekpr.com 2026-10-27 (`<title>...en Juncos, Puerto Rico</title>`).
2. **Un Paragraph NATIVO de GHL** (elemento del builder, NO custom code) con
   clase `dv-ghl-values` pegado ANTES del Custom Code, cuyo texto es el de
   [CUSTOM-VALUES-PARRAFO.txt](../../documentacion/CUSTOM-VALUES-PARRAFO.txt)
   (6 tokens unidos por `|||DV|||`). GHL expande esos tokens porque es un
   elemento nativo de página; el runtime los lee, los propaga a TODO el DOM
   (textos, teléfonos, hrefs, redes, alt/aria) y oculta ese párrafo.

⚠️ Los tokens dentro del **Custom Code** LO SIRVE GHL TAL CUAL: nunca se
expande ahí. El HTML tokenizado es correcto: sus resolvers consumen los dos
canales de arriba. Si falta el Paragraph nativo, el sitio no se rompe: los
resolvers caen a "Puerto Rico" y hrefs al dominio central (nunca token crudo
visible tras runtime).

---

## 1. Los 6 Custom Values (crear en el location MASTER)

Settings del location → **Custom Values** → crear con estos nombres EXACTOS
(minúsculas, con los dos guiones donde corre):

| Nombre exacto | Valor ejemplo (Juncos) | Qué alimenta |
|---|---|---|
| `business__county_name` | `Juncos` | Textos visible, title/meta SEO, alt/aria |
| `business__phone` | `+1 787 320 9447` | Teléfonos y enlaces tel: |
| `business__email` | `ilatek.pr@gmail.com` | Correos y enlaces mailto: |
| `website_url` | `juncos.ilatekpr.com` (sin `https://`) | Todos los hrefs internos |
| `facebook_url` | URL completa de Facebook | Redes del footer |
| `instagram_url` | URL completa de Instagram | Redes del footer |

⚠️ **`website_url` sin esquema**: el HTML construye `https://` + valor;
con `https://` adentro salen CTAs con doble esquema.

Unificado 2026-10-27: el set ya NO usa `county_name_and_state` — todo el
árbol canónico consume `business__county_name` (swap de ~15k ocurrencias en
239 archivos). Si el campo SEO del panel tenía el token viejo, cambiarlo por
el nuevo. Copias históricas (`.tmp-*`, `archivo/`) conservaron el token
viejo a propósito.

⚠️ Riesgos típicos: values creados como **Custom Fields** no aplican; nombre
mal escrito → token crudo; el canvas del builder SIEMPRE muestra tokens
crudos; la prueba real es la página publicada (paso 5).

## 2. Cada página del location (home + 47 landings) lleva 2 piezas

1. **Custom Code** con el HTML completo (solo cambio por página: su HTML).
2. **Paragraph nativo** ANTES del Custom Code:
   - texto exacto de [CUSTOM-VALUES-PARRAFO.txt](../../documentacion/CUSTOM-VALUES-PARRAFO.txt)
   - clase CSS del párrafo: `dv-ghl-values`
   - sin otros estilos; el runtime lo oculta solo.
   Sin este párrafo el body queda en fallback ("Puerto Rico").

## 3. Snapshot

1. Location MASTER: los 6 values + páginas con Custom Code + Paragraph
   nativo `dv-ghl-values`.
2. Vista de agencia → **Account Settings → Snapshots** → New → elegir el
   location master → crear. Values y páginas viajan en el snapshot.

## 4. Nuevo pueblo (location nuevo)

1. Importar el snapshot → los 6 values llegan con los valores del master.
2. Cambiar los values (sobre todo `business__county_name` y `website_url`
   con el subdominio del pueblo nuevo).
3. Conectar `pueblo.ilatekpr.com` (Domain Settings).
4. **Publish**. Cambiar un value NO redibuja una página publicada: cada
   cambio exige republish (cache ~60 s).

## 5. Verificación (2 comandos)

```bash
# (a) SEO server-side: GHL debió expandir el title con el pueblo
curl -s https://pueblo.ilatekpr.com/home | grep -m1 '<title>'
# esperado: <title>...en <Pueblo>...</title> — token crudo = revisar campo SEO

# (b) puente nativo expandido server-side para el runtime
curl -s https://pueblo.ilatekpr.com/home | grep -m1 'dv-ghl-values'
# esperado: texto con '<Pueblo>|||DV|||<email>|||DV|||...' SIN {{...}}
# token crudo = falta value, nombre mal escrito, o el Paragraph no es nativo
```

Fallback en vivo: si falta el value, la página muestra "Puerto Rico" y no
token crudo — el sitio nunca se ve roto.

## 6. Mantenimiento del set

- Cambios de HTML solo en el MASTER + re-snapshot (o republish local).
- La resolución runtime vive en `Ilatek/embeds/` y en las 3 legales
  (garantía / privacidad / términos) con walker propio + title.

## 7. Herramientas de la misión (estándar obligatorio, Oct 2026)

Un pueblo solo se da por VERDE con el estándar **value-driven total: ningún
municipio fijo en ninguna página** (la exigencia del owner reemplaza el
estado anterior, donde las landings verdes traían el pueblo literalizado).

| Script | Qué hace |
|---|---|
| `scripts/audit_tokens_global.py` | Audita que solo existan los 14 `custom_values` exactos del owner (access_token, business__county_domain, business__county_name, business__email, business__phone, business_id, county_name_and_state, facebook_url, instagram_url, pixel_id, precio_total, website_favicon, website_url) en archivos publicables. 0 no-canon = PASS. |
| `node scripts/run_runtime_qa.mjs` | QA local del runtime (Playwright en `scripts/.qaenv`): copia tokenizada + variantes bridge/resolver; exige 0 tokens crudos visibles, secciones pobladas con el value, href resuelto y 0 errores JS → `shots/qa-result4.json`. GREEN antes de tocar GHL. |
| `python scripts/fix_resolver_bridge.py [–check]` | (idempotente; 47 canónicos). Inserta helper `ILATEK_BRIDGE` al inicio del fragmento y parchea TODOS los resolvers (iltro A, secciones B1/B2/B3, nav C, footer D) para que resuelvan tokens crudos de data-* contra los slots del puente (literal gana; 'Puerto Rico' solo sin puente; alias propio por statement → 0 errores). `node scripts/qa_tokenized_headings.mjs` = contrato producción bridge-only: 3 casos detallados con variantes de puente (sellado-de-techos ok/ausente/malformado, techos-de-zinc ok/ausente, techos ok/ausente — techos y zinc prueban el h2 POSITIVO; el h2 estático de sellado reporta SKIP) + **barrido de los 47 canónicos publicables** en ok-bridge: cada titular tokenizado (h1/h2/h3) resuelve TestCounty y 0 tokens crudos visibles. |
| `python scripts/ghl_paste_map.py [dominio]` | Mapea 60/60 URLs del sitemap del pueblo a su archivo canónico (`Ilatek/servicios|categorias/<slug>/es/landing-pages/...`); marca NATIVA-GHL (páginas del builder) y clones con sufijo. |
| `python scripts/verify_value_driven.py [dominio] --pueblo <Pueblo>` | Barrido live del sitemap (60 URLs): para páginas con Custom Code exige puente `dv-ghl-values` EXPANDIDO por GHL (6 slots, 0 `{{}}`), `<title>` con el pueblo y **cero literales del pueblo fuera de title/meta/puente**; para NATIVA-GHL exige 0 crudos + title expandido. Exit 2 si alguna falla. JSON en `shots/verify-value-driven.json`. |

### Flujo de repaste (landings hoy literalizadas → value-driven)

1. `python scripts/ghl_paste_map.py` → checklist URL→archivo canónico.
2. Por página (lotes de 2-3 para no dejar el live caído): reemplazar el
   Custom Code por el canónico tokenizado + Paragraph nativo `dv-ghl-values`
   (sección 2) + Publish.
3. `python scripts/verify_value_driven.py --pueblo <Pueblo>` → todo verde
   antes del siguiente lote. Nativa-GHL: solo Publish (sin custom code; los
   textos fijos se cambian por valores/tokens en el builder).

### Titulares tokenizados (H1/H2/FAQ) — Oct 2026

`scripts/populate_headings.py` (idempotente) convierte "Puerto Rico" →
`{{custom_values.business__county_name}}` en los titulares locales de los
canónicos. **H1 hero: barrido completo** ("todas las landings, sin
excepciones"): todo `Puerto Rico` dentro del `<h1>` pasa a token, conservándolo
en el mismo elemento interno donde el marcado lo partía (`en <em>Puerto
Rico</em>` → `en <em>{{…county_name}}</em>`). **H2.ilt-extra-title, preguntas
FAQ de precio y locales en `h3` visible + JSON-LD FAQPage sincronizados**: vía
lista literal (`EXACT`/`PRICE_Q`) en
`servicios|categorias/*/es/landing-pages/ghl-*-landing.html`,
`Ilatek/src/faq/faq-source.mjs` y `Ilatek/componentes/ghl-faq-embed.html`.
Quedan genéricos a propósito: cobertura ("¿Atienden mi área…?", "¿Cubren mi
área en Puerto Rico?", "¿Cubren mi zona industrial…?"), claims de isla
("Reseñas… en Puerto Rico", "78 municipios", "La favorita de Puerto Rico",
intake de reseñas, aria-labels) y otras menciones de país. Como los titulares
viajan dentro del Custom Code, **el repaste con este cambio exige re-copiar
el canónico actualizado** (los Custom Code ya pegados con titulares
literales seguirán sin poblarse hasta el repaste).

### Línea base (2026-10-27, Juncos)

`shots/verify-value-driven.json`: 60/60 FALLA con el estándar nuevo — landings
con el pueblo grabado ~653 veces (`lit=653`, HTML literal pegado), home sin
puente (fallback "Puerto Rico"), nativas del builder con literales (~520) y
titles genéricos ("...en Puerto Rico"). El repaste según flujo de arriba es lo
que convierte esa línea base en 60/60 verde.
