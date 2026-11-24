# Revisión y arreglo — Ilatek (ilatekpr.com)

**Fecha:** 2026-11-21 · **Alcance:** Home ES/EN + lote de 106 páginas · **Modo:** revisión, corrección en archivos y verificación. **No se publicó en GHL, no se hizo commit, push, PR ni merge.**

**Regla respetada:** no se cambiaron URLs, slugs, estructura del lote ni custom values. Los `{{custom_values.*}}` siguen exactamente en el código. No se inventaron precios, garantías, reseñas, teléfonos, direcciones ni servicios.

---

## Punto 1 — `robots.txt` y `llms.txt`

### (a) Qué encontré

- El `llms.txt` **en vivo** era la versión vieja de limpieza: publicaba `$0.07/pie²` estándar, `$0.15/pie²` profunda, `$0.75/pie²` alfombras y `$0.50/pie²` garaje. Contradice el precio publicado en la home y el schema (`desde $250 por servicio`).
- El `robots.txt` en vivo no bloqueaba el lote, pero tenía un comentario obsoleto (“/blog 404”, hoy 200), no mencionaba `/home`, `/en/` ni el lote, y no anunciaba `llms.txt`.
- El `llms.txt` del repo enlazaba a `/blog/llms.txt`, que **responde 404**.
- `/dnf/` está en el `robots.txt` del repo como `Disallow`, pero **responde 404**.
- El blog sí existe: `/blog`, `/blog/comparativas`, `/blog/preguntas-frecuentes` y `/blog/comunidades-y-servicios` responden **200**. El sitemap del blog (`/blog/sitemap-blog.xml`) responde **404**.

### (b) Qué cambié

- **`robots.txt`** (raíz y copia en `REVISION-2026-11-21/robots.txt`):
  - `User-agent: *` + `Allow: /`.
  - **Sin `Disallow`**: se eliminó `/dnf/` porque no existe.
  - Se aclara que las 106 páginas del lote, `/home`, `/en/home`, `/cotizacion`, `/cotizacion-techos`, `/sitemap.xml` y el blog quedan permitidos por `Allow: /`.
  - Se mantienen y amplían los bots de IA: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Applebot, Applebot-Extended, CCBot, Amazonbot, Bingbot, FacebookBot, Twitterbot.
  - Se anuncia `Sitemap: https://ilatekpr.com/sitemap.xml` y `llms.txt`.
- **`llms.txt`** (raíz y copia en `REVISION-2026-11-21/llms.txt`):
  - Sellado de techos primero; limpieza como línea secundaria.
  - Precios corregidos a **desde $250 por servicio**; limpieza residencial **desde $250 por servicio**; inspección/depósito **$50 descontable**.
  - Se eliminaron las comparativas de precio contradictorias (“más alto”, “más bajo”, “más económico”, “cuesta más”) porque los cinco sistemas publican desde $250.
  - Se eliminó `/blog/llms.txt` (404).
  - Se añadió sección **English** con `/en/home`, `/en/sellado-de-techos`, `/en/limpieza-estandar` y `/en/limpieza-residencial`.
  - Se añadió la limitación de **dirección postal completa** a los datos no publicados.
  - Se mantienen los PENDIENTES: duración del elastómero, plazo de garantía, DACO, reseñas/rating, permisos, años de operación.

### (c) Qué NO toqué

- No añadí páginas al sitemap ni al `llms.txt` sin comprobar que respondieran 200.
- No bloqueé ninguna página del lote, `/home`, `/en/` ni los cotizadores.
- No cambié el sitemap en vivo.
- No publiqué los archivos: el `llms.txt` y `robots.txt` en vivo siguen siendo los viejos hasta que se suban.

### (d) Cómo lo verifiqué

- Extraje los **30 enlaces únicos** de `llms.txt` y los pedí con `curl -L`: **todos 200**.
- `robots.txt`: **0 `Disallow`**, `Allow: /`, sitemap y llms presentes.
- `/blog/llms.txt` ya no aparece en el archivo.
- `/blog`, `/blog/comparativas`, `/blog/preguntas-frecuentes`, `/blog/comunidades-y-servicios`: **200**.
- `/dnf/`: **404**, por eso se eliminó la regla.

---

## Punto 2 — Flujo del informe de inspección con fotos

### (a) Qué encontré

- Las páginas `012-inspeccion-de-techos` y `013-inspeccion-y-mantenimiento-de-techos` ya prometen informe con fotos y prioridades.
- En GHL hay **3 formularios**: `Calendar - Emergencia` (`mB0wlqTWsMjyYo9kq1F5`), `Contáctanos` (`9UJpNQSLzMmFyzEirLWh`) y `Calendar` (`dEZ6L7tZoEqax2uNoQDc`). **No hay formulario de informe de inspección.**
- Hay workflows de captura, agenda, notificaciones y reseña, pero **ninguno de informe de inspección**.
- El informe se escribe a mano en una nota/correo; por eso cambia de formato y las fotos no siempre quedan en orden.

### (b) Qué cambié / entregué

- **`informe-flujo-inspeccion.md`** con un flujo de **3 pasos** y **6 fotos en orden fijo**:
  1. Techo general.
  2. Acceso y perímetro.
  3. Desagües y canaletas.
  4. Penetraciones y sellos.
  5. Hallazgo principal.
  6. Interior relacionado (si aplica).
- Plantilla de **informe de una página** con resultado, prioridades, fotos con pie, sistema recomendado, precio desde $250 por servicio, inspección de $50 descontable y siguiente paso.
- Reglas de simplificación: no pedir fotos antes, no duplicar dirección/teléfono, no crear formulario nuevo, no borrar fotos, no añadir precio al informe.

### (c) Qué NO toqué

- **No cambié formularios ni workflows de GHL.**
- **No añadí herramientas, campos ni automatizaciones.**
- No publiqué nada.

### (d) Cómo lo verifiqué

- Revisión estática del documento y de las páginas 012/013.
- Confirmé por MCP que los formularios y workflows existentes son los indicados.
- No se probó el flujo en GHL porque no se aplicó.

---

## Punto 3 — Secuencia de emails para servicio recurrente

### (a) Qué encontré

- No existe una secuencia específica de seguimiento recurrente en los 18+ workflows listados. Hay `Captura de Lead`, `Agendó Limpieza`, `Agendó Mantenimiento de Techo`, `Reseña post-servicio` y `Review Request after Opportunity Won`, pero no una secuencia de conversión de cliente puntual a recurrente.
- El remitente documentado es `ilatek.pr.lead@gmail.com`.
- No hay ofertas ni descuentos autorizados; no se inventaron.

### (b) Qué cambié / entregué

- **`emails/secuencia-recurrente-es-en.md`** con **5 emails + 1 variante de techos**, en ES y EN completos:
  1. **Día 0:** informe y fotos. CTA: responder si algo no quedó bien.
  2. **Día 2:** elegir frecuencia (semanal, quincenal o mensual). CTA: `/cotizacion`.
  3. **Día 7:** limpiar vs. mantener; profunda cada 3–4 meses. CTA: agendar.
  4. **Día 21:** inspección de techos por $50 descontable. CTA: `/cotizacion-techos`.
  5. **Día 45:** reactivación y próximo servicio. CTA: responder/agendar.
- Cada email tiene **un solo objetivo y una sola CTA**.
- Se usan solo datos publicados: limpieza desde $250 por servicio; inspección de techos $50 descontable; horario y cobertura verificados.
- Se añadió la regla de consentimiento: si no autorizó marketing, solo se envía el email 1 de entrega del informe.

### (c) Qué NO toqué

- **No cambié el remitente.**
- **No creé ni modifiqué automatizaciones, workflows ni campañas en GHL.**
- **No añadí descuentos, ofertas ni precios nuevos.**

### (d) Cómo lo verifiqué

- Los enlaces de los emails (`/cotizacion`, `/cotizacion-techos`) responden **200**.
- Revisión de que cada email tenga un solo CTA y ningún precio no verificado.
- No se envió ningún email de prueba.

---

## Punto 4 — Schema markup

### (a) Qué encontré

- **Home ES en vivo:** `Organization`, `WebPage` (`#webpage-servicios`), **11 `Service`** y `FAQPage` con **23** preguntas. **Faltan `LocalBusiness` y `BreadcrumbList`.**
- **Home EN en vivo:** `ContactPage`, `Organization` (`#organization`), `PostalAddress`, `FAQPage` con **10** preguntas, `WebPage` y `WebSite`. **Faltan `LocalBusiness` y `BreadcrumbList`.**
- El artefacto `001-inicio` contiene solo el `FAQPage` de 23 preguntas porque el `Organization`/`WebPage`/`Service` vive en los ajustes de GHL, no en el bloque. Por eso **no se duplicaron**.
- `036-sellado-acrilico` y la mayoría de los servicios ya tienen `RoofingContractor`/`HouseCleaning`, `BreadcrumbList` y `FAQPage` válidos. **38 artefactos no tienen `BreadcrumbList`; 12 no tienen tipo de negocio** (home, legal, comunidades, reseñas).

### (b) Qué cambié / entregué

- **`schema/home-es-localbusiness-breadcrumb.jsonld`** y **`schema/home-en-localbusiness-breadcrumb.jsonld`**:
  - `LocalBusiness` + `RoofingContractor` con `@id` `https://ilatekpr.com/#localbusiness`.
  - `parentOrganization` referencia `#organization` (ES absoluto; EN relativo, como el `Organization` en vivo).
  - `address` solo país/región (`PR`), sin inventar calle.
  - Horario lunes–sábado 8:00–18:00, pago efectivo/ATH Móvil/transferencia, `sameAs` Facebook/Instagram/YouTube.
  - `BreadcrumbList` de Inicio/Home.
- **No se añadió un segundo `FAQPage`**: el de 23 preguntas ya existe en `001-inicio`.
- **`001-inicio`:** se corrigió el `@id` del FAQPage de `https://ilatekpr.com//#faq` a `https://ilatekpr.com/#faq` (`home/es/landing-pages/home.html:4261`).
- **`063-en-home`:** el FAQPage de 10 preguntas queda intacto y válido; no se le añadieron preguntas invisibles.

### (c) Qué NO toqué

- No borré ni reescribí `Organization`, `WebPage` ni los 11 `Service` existentes.
- No añadí reseñas, `AggregateRating`, licencia DACO, dirección de calle ni datos de negocio no verificados.
- No añadí `FAQPage` a la EN con preguntas que no están visibles en la página.
- No toqué los 38/12 artefactos restantes; se listan como PENDIENTE porque requieren una decisión de alcance.

### (d) Cómo lo verifiqué

- Los dos JSON-LD parsean con `JSON.parse`: **válidos**.
- `001-inicio`: **1 bloque JSON-LD, 0 inválidos, 23 preguntas**.
- `063-en-home`: **2 bloques, 0 inválidos, 10 preguntas** (las 10 visibles).
- No hay `//#` en ningún `@id`.
- No hay `LocalBusiness` duplicado en el HTML en vivo (no existía).
- **Limitación:** el schema aparte está resuelto para el dominio principal; debe pegarse en un campo nativo de GHL o publicarse con los valores resueltos. GHL no resuelve `{{custom_values.*}}` dentro del bloque Custom HTML.

---

## Punto 5 — ES y EN como dos versiones separadas

### (a) Qué encontré

- `/en/home` responde **200** y tiene contenido EN, pero el HTML en vivo se sirve con `<html lang="es">` y `<title>` en español.
- La home ES **no tiene hreflang**. La EN sí tiene hreflang, pero apunta la versión ES a la raíz y no está en el `<head>` servido de forma consistente.
- Ambas versiones usan canonical a `https://ilatekpr.com` (la EN debería ser `/en/home`).
- Desajuste de precio: la home ES decía “desde $250” y la EN decía “pricing is by square foot” y “at desde $250”. El dato correcto del sitio es **desde $250 por servicio**, no por pie cuadrado.
- El H1 de ambas era solo la marca.
- El toggle de la misma URL sigue existiendo en el nav/pie, pero **no es la solución final**: las URLs separadas ya existen y se entregan con su propio HEAD.

### (b) Qué cambié

- **`HEAD-home-es.html`** (copia de `home/es/HEAD-TEMPLATE.html`):
  - Título que empieza por **Sellado y Mantenimiento de Techos**.
  - Description que empieza por sellado, con $50 descontable y garantía escrita.
  - Canonical a `https://{{custom_values.website_url}}/`.
  - `hreflang="es"` a la raíz, `hreflang="en"` a `/en/home`, `x-default` a la raíz.
  - `og:url`, `og:locale` `es_PR`, `og:site_name`, `twitter:title`, `twitter:description`, `robots`.
- **`HEAD-home-en.html`** (copia de `home/en/HEAD-TEMPLATE.html`):
  - Título EN “Roof Sealing and Maintenance…”.
  - Canonical a `/en/home`.
  - `hreflang` es/en/x-default.
  - `og:locale` `en_US`, `og:site_name`, `og:url`, Twitter cards, `robots`.
- **H1 de la home ES** (`home/es/landing-pages/home.html:1900` y `001-inicio/...:1900`): `Sellado de Techos y Limpieza en {{custom_values.business__county_name}}`.
- **H1 de la home EN** (`home/en/landing-pages/home.en.html:1906` y `063-en-home/...:1906`): `Roof Sealing and Cleaning in {{custom_values.business__county_name}}`.
- **Precios:** se eliminó `at desde`, `a desde`, `by square foot`, `per-square-foot`, `$58/mes` y “Plan from $58its service page”. La home EN ahora dice **per job** y **from $250**; la ES dice **desde $250**.
- **`home/en/README.md`** actualizado: la página EN ya existe en `/en/home`; no se debe publicar con título ES ni `lang="es"`.

### (c) Qué NO toqué

- **No cambié URLs, slugs ni estructura.** `/en/home` y los 51 pares ES/EN siguen igual.
- **No implementé el `lang="en"` del servidor**: eso depende de GHL. El HEAD no puede cambiar el `<html lang>`; el bloque 063 lo hace por JS, pero no es la solución final.
- **No cambié el nav/pie compartido** para las 53 páginas EN: el HTML estático sigue en español y el runtime lo cambia a EN. Romper la paridad del nav/pie afectaría los 106 artefactos.
- **No traduje las 13 preguntas que solo están en ES** para el FAQPage EN.
- **No eliminé el toggle**: sigue como control de navegación, pero las versiones separadas son las que se entregan.

### (d) Cómo lo verifiqué

- `HEAD-home-es.html` y `HEAD-home-en.html`: título, canonical y hreflang correctos; `hreflang` es/en/x-default presentes.
- H1 correcto en `001-inicio` y `063-en-home`.
- **0** coincidencias de `per-square-foot`, `by square foot`, `$58`, `$2.50`, `$0.07`, `$0.15`, `pie²`, `per sq ft`, `a/at desde $250`, `its service page` y `Rust and rust` en los dos artefactos.
- `sync-artifacts --check`: **106/0**.
- **No se probó en navegador** el resultado visual ni el `lang` servido por GHL; la verificación fue estática y HTTP de solo lectura.

---

## Punto 6 — Revisión final de residuos

El detalle completo está en **`residuos.md`**. Resumen:

- **Arreglados en la home:** H1 de marca, “a desde”/“at desde”, “by square foot”, “per-square-foot”, “$58/mes”, “$58its service page”, “Rust and rust”, `@id` con doble barra, `alt` generados después del resolver.
- **Arreglados en archivos del sitio:** `llms.txt` viejo con precios por pie cuadrado, enlace 404 a `/blog/llms.txt`, comentario de blog 404 y `Disallow` a `/dnf/`.
- **PENDIENTES que requieren GHL o un dato del dueño:** `lang` EN, título EN en vivo, nav/pie EN estático de 53 páginas, FAQ EN de 23, BreadcrumbList/LocalBusiness en 38/12 páginas, resolución de custom values dentro del bloque, dirección postal, teléfono oficial, plazo de garantía, DACO, rating/conteo de reseñas, duración del elastómero, meta keywords, `/home` duplicada, sitemap, footer H2/H6.

---

## Tabla resumen

| Punto | Estado | Archivo entregado | Pregunta pendiente |
|---|---|---|---|
| 1. `robots.txt` / `llms.txt` | **ARREGLADO** (repo) / **PENDIENTE PUBLICAR** | `REVISION-2026-11-21/robots.txt`, `REVISION-2026-11-21/llms.txt` | Ninguna para el contenido; falta subirlos a GHL. |
| 2. Informe con fotos | **ARREGLADO** (propuesta) / **PENDIENTE GHL** | `REVISION-2026-11-21/informe-flujo-inspeccion.md` | ¿Campos actuales del calendario y si el correo permite 6 adjuntos? |
| 3. Emails recurrentes | **ARREGLADO** (textos ES/EN) / **PENDIENTE GHL** | `REVISION-2026-11-21/emails/secuencia-recurrente-es-en.md` | ¿Autorizas aplicar la secuencia en GHL sin cambiar el remitente? |
| 4. Schema | **ARREGLADO** (home) / **PENDIENTE** (EN 23 y 38/12) | `REVISION-2026-11-21/schema/home-es-localbusiness-breadcrumb.jsonld`, `home-en-localbusiness-breadcrumb.jsonld` | ¿Dirección, teléfono, garantía, DACO, rating y duración del elastómero? |
| 5. ES/EN separados | **ARREGLADO** (HEAD/H1/precios) / **PENDIENTE** (lang y nav/pie EN) | `REVISION-2026-11-21/HEAD-home-es.html`, `HEAD-home-en.html`, `001-inicio/`, `063-en-home/` | ¿GHL sirve `/en/home` con `lang="en"`? ¿Autorizas el fallback EN del nav/pie? |
| 6. Residuos | **ARREGLADO** (home) / **PENDIENTE** (GHL/datos) | `REVISION-2026-11-21/residuos.md` | Ver lista de PENDIENTES abajo. |

---

## Archivos entregados

```
GHL-PUBLICAR/REVISION-2026-11-21/
├── INFORME-REVISION.md
├── residuos.md
├── informe-flujo-inspeccion.md
├── robots.txt
├── llms.txt
├── HEAD-home-es.html
├── HEAD-home-en.html
├── schema/
│   ├── home-es-localbusiness-breadcrumb.jsonld
│   └── home-en-localbusiness-breadcrumb.jsonld
├── emails/
│   └── secuencia-recurrente-es-en.md
├── 001-inicio/
│   ├── 1-PAGINA.txt
│   └── 2-CODIGO-CUSTOM-HTML.html  (447 KB, sha256 e088bea8c31c…)
└── 063-en-home/
    ├── 1-PAGINA.txt
    └── 2-CODIGO-CUSTOM-HTML.html  (435 KB, sha256 6ebbe53a08ee…)
```

También quedaron actualizadas las fuentes:
`home/es/landing-pages/home.html`, `home/en/landing-pages/home.en.html`, `home/es/HEAD-TEMPLATE.html`, `home/en/HEAD-TEMPLATE.html`, `home/es/seo.json`, `home/es/SEO-GHL.md`, `home/en/README.md`, `robots.txt`, `llms.txt`.

---

## Verificación final

| Comprobación | Resultado |
|---|---|
| `node tools/sync-artifacts.mjs --check` | **106 artefactos / 0 problemas** |
| JSON-LD `001-inicio` | **válido**, 0 inválidos, **23** preguntas FAQPage |
| JSON-LD `063-en-home` | **válido**, 0 inválidos, **10** preguntas FAQPage (las visibles) |
| `@id` con `//#` | **0** |
| Residuos de precio/voz en 001 y 063 | **0** en todas las variantes buscadas |
| Barrido de los 106 artefactos | **0 páginas con hits** de precios viejos, per-sq-ft, `$58`, `pie²` o `a/at desde` |
| Title/description renderizados (ES/EN) | **57/52** caracteres de title y **150/141** de description al resolver el custom value |
| Enlaces de `llms.txt` | **30/30 responden 200** |
| `robots.txt` | `Allow: /`, **0 `Disallow`**, sitemap y llms |
| Publicación / commit / push / PR | **No se hizo** |
| Prueba visual en navegador | **No se hizo**; verificación estática y HTTP |

---

## PENDIENTES con pregunta exacta

1. **Dirección postal:** ¿cuál es la dirección completa que podemos publicar en `LocalBusiness`? (Hoy solo país/región `PR`).
2. **Teléfono oficial:** `business__phone` = `+17874953277`; `telefono_contacto` = `939-357-7351`. ¿Cuál va en el schema?
3. **Garantía:** ¿plazo exacto en años, cobertura y exclusiones?
4. **DACO / reseñas / elastómero:** ¿número de licencia DACO, plataforma/conteo/rating real de reseñas y duración publicada del elastómero?
5. **GHL EN:** ¿GHL puede servir `/en/home` con `lang="en"` y el HEAD nuevo? Si no, ¿autorizas un script de `lang` en esa URL separada?
6. **Nav/pie EN:** ¿autorizas cambiar el contrato de paridad para que las 53 páginas EN tengan el fallback estático en inglés? Afecta los 106.
7. **FAQ EN:** ¿autorizas traducir y añadir las 13 preguntas que solo están en ES para que el FAQPage EN tenga 23?
8. **Schema restante:** ¿autorizas `BreadcrumbList` en 38 páginas y tipo de negocio en 12?
9. **Custom values:** ¿el bloque Custom HTML se publica sin el motor de custom values? Si es así, ¿resolvemos por dominio antes de pegar o movemos `alt`/schema a campos nativos?
10. **GHL puntos 2 y 3:** ¿autorizas aplicar el flujo de informe y la secuencia de emails? No se cambiaron formularios ni workflows.
11. **SEO en vivo:** ¿autorizas eliminar `meta keywords`, corregir bot tags, redirigir `/home` a `/` y revisar el sitemap en GHL?
12. **Footer:** ¿autorizas cambiar los 9 H2 y el CTA H6 del pie compartido? Afecta los 106 artefactos.
