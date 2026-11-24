# Punto 6 — Revisión final de residuos

**Alcance:** Home ES (`001-inicio`), Home EN (`063-en-home`) y los 106 artefactos del lote. No se publicó nada. La revisión en vivo se hizo por HTTP (solo lectura) el 2026-11-21.

**Método:** barrido de texto visible y de diccionarios ocultos (`ILATEK_I18N`), JSON-LD, `robots.txt`, `llms.txt`, formularios y workflows. Se buscaron precios viejos, precios ES/EN que no coinciden, `per-square-foot`, `$0.07`, `$0.15`, `$2.50`, `pie²`, `$58`, palabras pegadas, `a desde`, `at desde`, `{{custom_values.*}}` sin resolver y rutas inexistentes.

## Residuos encontrados y arreglados

| # | Dónde | Residuo | Estado | Corrección / archivo |
|---|---|---|---|---|
| 1 | Home ES, hero | `<h1>Ilatek Property Solution</h1>` (solo marca) | ARREGLADO | `home/es/landing-pages/home.html:1900` y `001-inicio/2-CODIGO-CUSTOM-HTML.html:1900`: H1 descriptivo con custom value. |
| 2 | Home ES, tarjetas de limpieza | “a desde $250” en descripciones/alt | ARREGLADO | Se cambió a “desde $250”. Queda “área desde $250”, que es español correcto, no el residuo “a desde”. |
| 3 | Home EN, `EN_DESC` | “at desde $250” (4 veces) | ARREGLADO | `from $250` en `home/en/landing-pages/home.en.html`; 0 en `063-en-home`. |
| 4 | Home EN, FAQ visible | “At Ilatek pricing is by square foot” | ARREGLADO | “At Ilatek pricing is per job”; `home/en/landing-pages/home.en.html:4166`. |
| 5 | Home EN, FAQPage JSON-LD | “pricing is by square foot” | ARREGLADO | “pricing is per job”; `home/en/landing-pages/home.en.html:4218`. |
| 6 | Home ES, diccionario EN oculto (`qa5`) | “pricing is by square foot” | ARREGLADO | “pricing is per job”; `home/es/landing-pages/home.html:1747`. |
| 7 | Home ES, diccionario EN oculto (`faq20`) | “published per-square-foot pricing” | ARREGLADO | “published per-service pricing”; `home/es/landing-pages/home.html:1747`. |
| 8 | Home EN, features de techos | “Rust and rust” | ARREGLADO | “Mold and rust”; `home/en/landing-pages/home.en.html:2282`. |
| 9 | Home ES/EN, features de techos | “Plan desde $58/mes” y “Plan from $58its service page” (precio no verificado + palabra pegada) | ARREGLADO | “Plan de mantenimiento” / “Maintenance plan”; `home/es/...:2276` y `home/en/...:2282`. Se eliminó el precio de $58/mes porque no está en los hechos verificados. |
| 10 | Home ES/EN, descripción de techos | “planes desde $58/mes” / “plans from $58its service page” | ARREGLADO | “planes de mantenimiento” / “maintenance plans”; `home/es/...:2358` y `home/en/...:2364`. |
| 11 | Home ES, FAQPage | `@id` con doble barra: `https://ilatekpr.com//#faq` | ARREGLADO | `https://ilatekpr.com/#faq`; `home/es/landing-pages/home.html:4261` y `001-inicio/...:4261`. |
| 12 | Home ES/EN, tarjetas | 34 `alt` con `{{custom_values.county_name_and_state}}` sin resolver | ARREGLADO EN CÓDIGO / PENDIENTE EN GHL | Causa: las tarjetas se crean después del resolver y el `alt` quedaba con el token. Se expuso `ILATEK_GEO.refresh` y se llama después de `trackEl.innerHTML=html` (`home/es/...:349,2840`; `home/en/...:349,2846`). El HTML estático seguirá con tokens hasta que GHL los resuelva o se publique. |
| 13 | Home EN en vivo | `<title>` en español y `<html lang="es">` | ARREGLADO EN ARCHIVO / PENDIENTE EN GHL | `home/en/HEAD-TEMPLATE.html` con título EN, canonical, hreflang y OG. GHL debe servir `lang="en"`; no se puede forzar desde el body sin JS. |
| 14 | Home ES en vivo | Sin hreflang | ARREGLADO EN ARCHIVO / PENDIENTE EN GHL | `home/es/HEAD-TEMPLATE.html:6-9` con canonical raíz y hreflang es/en/x-default. |
| 15 | `llms.txt` en vivo | Precios por pie cuadrado ($0.07, $0.15, $0.75, $0.50) y enlaces al blog | ARREGLADO EN REPO / PENDIENTE PUBLICAR | `llms.txt` reescrito: sellado primero, $250 por servicio, limpieza desde $250 por servicio, sin `/blog/llms.txt` (404). |
| 16 | `robots.txt` en vivo | Comentario de blog 404, `/dnf/` inexistente, sin mención de /home, /en o lote | ARREGLADO EN REPO / PENDIENTE PUBLICAR | `robots.txt` nuevo: `Allow: /`, sin `Disallow`, bots de IA permitidos, sitemap y llms anunciados. |
| 17 | `llms.txt` | Comparativas de precio contradictorias (“más alto”, “más bajo”, “más económico”, “cuesta más”) cuando los cinco sistemas publican desde $250 | ARREGLADO | Se eliminaron las comparativas de precio; se conservan duración y uso. 30 enlaces verificados: todos 200. |
| 18 | `llms.txt` | Enlace a `/blog/llms.txt` (404) | ARREGLADO | Se eliminó; quedan `/blog`, `/blog/comparativas`, `/blog/preguntas-frecuentes` y `/blog/comunidades-y-servicios` (200). |
| 19 | `robots.txt` | `Disallow: /dnf/` (404) y comentario “/blog 404” (hoy 200) | ARREGLADO | Se eliminó el `Disallow` y el comentario obsoleto. |

## Residuos que NO se pueden cerrar sin un dato o sin tocar GHL

| # | Dónde | Residuo / riesgo | Estado | Pregunta exacta |
|---|---|---|---|---|
| A | 53 artefactos EN | El nav/pie compartido se sirve en español en el HTML estático y el runtime lo cambia a EN. Un crawler sin JS ve español en el menú/pie. | PENDIENTE | ¿Autorizas cambiar el contrato de paridad del nav/pie para que las páginas EN tengan el fallback estático en inglés? Implica tocar `componentes/ghl-nav-embed.html`, `ghl-footer-embed.html` y regenerar los 106. |
| B | Home EN | FAQPage con 10 preguntas visibles; la home ES tiene 23. | PENDIENTE | ¿Autorizas traducir y añadir a la página EN las 13 preguntas que solo están en ES, para que el FAQPage EN también tenga 23? |
| C | 38 artefactos | Sin `BreadcrumbList`. | PENDIENTE | ¿Autorizas añadir `BreadcrumbList` (Inicio > página) a las 38 páginas que no lo tienen? |
| D | 12 artefactos | Sin `LocalBusiness`/`RoofingContractor`/`HouseCleaning` (home, legal, comunidades, reseñas). | PENDIENTE | ¿Autorizas añadir el tipo de negocio que corresponda a esas 12 páginas? |
| E | 106 artefactos | Los `{{custom_values.*}}` se sirven crudos en el HTML; GHL no los resuelve dentro del bloque Custom HTML. El valor `county_name_and_state` sí existe (`Puerto Rico`). | PENDIENTE | ¿El bloque se publica como Custom Code sin el motor de custom values? Si es así, ¿lo resolvemos por dominio antes de pegar o movemos los `alt`/schema a campos nativos? |
| F | Home/schema | `LocalBusiness` solo tiene país/región; no hay calle publicada. | PENDIENTE | ¿Cuál es la dirección postal completa que podemos publicar? |
| G | Home/schema | Teléfono: el custom value `business__phone` es `+17874953277`; `telefono_contacto` es `939-357-7351`. El schema usa el primero. | PENDIENTE | ¿Cuál de los dos es el teléfono público oficial para el schema? |
| H | Home/schema | Garantía escrita sin plazo en años. | PENDIENTE | ¿Cuál es el plazo exacto, cobertura y exclusiones de la garantía? |
| I | Home/schema | Sin licencia DACO, sin rating/conteo de reseñas, sin duración del elastómero. | PENDIENTE | ¿Número de licencia DACO, plataforma/conteo/rating real de reseñas y duración publicada del elastómero? |
| J | Home EN en vivo | `lang="es"` y título ES. | PENDIENTE | ¿GHL puede servir `/en/home` con `lang="en"` y el HEAD nuevo? Si no, ¿autorizas un script de `lang` en esa URL separada? |
| K | Home en vivo | Meta keywords de 86 frases y bot tags mal formados. | PENDIENTE | ¿Autorizas eliminar `meta keywords` y corregir los bot tags en el panel SEO de GHL? |
| L | `/` y `/home` | Ambas responden 200; el canonical ya apunta a `/`. | PENDIENTE | ¿Redirigimos `/home` a `/` en GHL o mantenemos el canonical? |
| M | Sitemap | El sitemap en vivo tiene 60 URLs; el prompt reporta 404 y duplicados. | PENDIENTE | ¿Autorizas revisar y corregir el sitemap en GHL (sin añadir URLs hasta comprobar 200)? |
| N | Footer | 9 títulos H2 y CTA final H6. | PENDIENTE | ¿Autorizas cambiar la jerarquía del pie compartido? Afecta los 106 artefactos. |
| O | Home en vivo | 34 `alt` sin resolver. | PENDIENTE DE VERIFICAR | La corrección de código está; no se pudo comprobar en producción porque no se publicó. ¿Se valida al publicar `001-inicio`? |
| P | Puntos 2 y 3 | Formularios y workflows de GHL. | PENDIENTE | ¿Autorizas aplicar el flujo de informe y la secuencia de emails en GHL? No se cambiaron formularios ni workflows. |

## Verificación ejecutada

- `node tools/sync-artifacts.mjs --check`: **106 artefactos / 0 problemas**.
- JSON-LD de `001-inicio` y `063-en-home`: **válido, 0 bloques inválidos**. FAQPage: **23** preguntas ES y **10** EN (coinciden con las visibles).
- Residuos en los dos artefactos: **0** para `per-square-foot`, `by square foot`, `$58`, `$2.50`, `$0.07`, `$0.15`, `pie²`, `per sq ft`, `a desde $250`, `at desde $250`, `its service page`, `Rust and rust`.
- Barrido de los **106 artefactos**: **0 páginas con hits** para `$0.07`, `$0.15`, `$0.75`, `$0.50`, `$2.50`, `per sq ft`, `per-square-foot`, `pie²`, `$58`, `by square foot`, `at desde $250` y `a desde $250`.
- `llms.txt`: **30 enlaces únicos, todos 200**; 0 enlaces a `/blog/llms.txt`; 0 afirmaciones “más alto/bajo” de precio.
- `robots.txt`: `Allow: /`, **0 `Disallow`**, sitemap y llms anunciados.
- **No se publicó, no se hizo commit, push, PR ni merge.**
- **No se probó en navegador** el resultado visual; la verificación fue estática y HTTP de solo lectura.
