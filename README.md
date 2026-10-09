# Ilatek

Cotizador de limpieza residencial en español para integrar en GoHighLevel (GHL).

Incluye cinco pasos: datos básicos, servicios, extras, resumen y calendario. Calcula el precio estimado y la duración, muestra el aviso de depósito de $50 y carga el calendario con un indicador de espera.

## Usar en GHL

1. Abre `ghl-custom-code-embedded.html` y copia todo su contenido.
2. Pégalo en un elemento **Custom Code** de tu página en GHL.
3. Guarda y revisa la página publicada. La imagen de la protagonista ya está incrustada en este archivo.

Para personalizar el calendario, pega el contenido completo de `ilatek-calendar-custom-code.html` en **Widget appearance → Insert custom code**, incluyendo las etiquetas `<style>` y `</style>`. No pegues CSS sin esas etiquetas en ese campo: se mostrará como texto.

## Home Page

`home-page/ghl-head-seo.html` trae los bloques de head SEO (robots, canonical, Open Graph, Twitter, geo) de `/home` + las 13 landings de limpieza, un bloque ▼▼ por slug, Cada bloque ▼▼ ya está **incluido dentro del embed de su respectiva landing** (al inicio del markup, antes de `<section>`): al pegar el embed en el Custom Code de la página, el SEO viaja con el código — scraper-safe (los meta tags están en el HTML, no se inyectan con JS). Los archivos agregados (`ghl-head-seo.html` / `techos/ghl-techos-head-seo.html`) quedan como respaldo y para revisión. Si GHL "sanitiza" el Custom Code y elimina meta tags, usa el plan B: pegar el bloque del slug en **Settings → Tracking Code → HEADER**. Las social images (og:image/twitter:image) apuntan al CDN de GHL: la imagen hero/archivo real de cada landing (mapa RAW de `ghl-performance-head.html` y embeds de cada página), las 14 URLs verificadas HTTP 200. Los 33 slugs de techos viven aparte en `techos/ghl-techos-head-seo.html`.

`home-page/ghl-custom-code.html` es la landing de inicio para pegar tal cual en un elemento **Custom Code** de la página de inicio en GoHighLevel. Usa los tokens `{{custom_values.*}}` de GHL (ubicación, contacto, redes) e incluye JSON-LD y el widget de reseñas.

Todos los botones y enlaces de cotización (nav, hero, servicio, CTA y footer) apuntan fijos a `https://ilatekpr.com/cotizacion`.

`home-page/ghl-home-completo.html` es la versión todo-en-uno de la home. Orden de secciones: hero (con botón "Conoce el servicio" que hace smooth scroll al carrusel), categorías en carrusel 3D infinito (la tarjeta frontal siempre grande al centro; las otras 2 giradas y hundidas en perspectiva; rota cada 4.2s en todos los dispositivos, se pausa solo al hover sobre una tarjeta (hover en el escenario no detiene), clic o Enter en una tarjeta lateral la trae al frente; **swipe horizontal con el dedo gira el carrusel** (izquierda=siguiente, derecha=anterior, sin interferir con el scroll vertical); tarjetas más cercanas entre sí (`--side-x` 205px escritorio / 160px tablet / 36vw móvil); zoom de imagen moderno igual al del carrusel de servicios; badges glassmorphism; tarjetas compactas 380px con imagen 164px y botón siempre visible dentro del escenario — profundidad `--lift` reducida a 130px para que la proyección 3D no recorte el contenido; en móvil (≤560px) la tarjeta completa (imagen 132px, textos y botón 42px) cabe en una pantalla de teléfono con escenario de 520px), proceso, carrusel de los 10 servicios más solicitados (auto-slide infinito en todos los dispositivos, se pausa con hover; cada tarjeta es un enlace completo a `{{website_url}}/nombre-del-servicio` usando el slug de cada servicio, con **precio blanco con glow neón** + botón verde "Ver más" en el pie de la tarjeta y **drag con el dedo/ratón** (solo se activa con gesto claramente horizontal —umbral 10px y 1.2× el vertical—; el scroll vertical de la página nunca se bloquea; el loop del marquee es controlado por JavaScript: al soltar la cinta **queda exactamente donde el usuario la dejó** (sin volver a una posición interna), continúa con un toque de inercia según la velocidad del flick y retoma su desplazamiento base de 42px/s; un drag no dispara el clic)), conócenos, directorio de los 78 municipios (con padding simétrico arriba/abajo: 112px escritorio, 84px ≤900px, 64px ≤560px), servicio principal (Limpieza Profunda), beneficios, reseñas, cobertura, sección de Preguntas Frecuentes desplegable (acordeón nativo `details/summary`) con schema `FAQPage` para SEO/AI y CTA final. Es el archivo listo para copiar y pegar completo en el Custom Code de la home.

**Jerarquía semántica de headings:** H1 único en el hero · H2 para los títulos de sección · **H3 exclusivo del FAQ** (las 10 preguntas del acordeón, alineadas 1:1 con el schema `FAQPage`) · H4 para subsecciones (pasos del Proceso, Beneficios, paneles de Conócenos, Limpieza Profunda) · H5 para títulos de tarjetas (Categorías 3D, tarjetas del carrusel, CTA del carrusel). El estilo visual se preserva con selectores por sección (`.ilcg-body h5`, `.ils-body h5`, `.il-benefit h4`, etc.). Los dos schemas JSON-LD embebidos (`FAQPage` con 10 preguntas y `@graph` HouseCleaning+WebSite) permanecen válidos e intactos.

Todas las menciones de ubicación usan el custom value `{{custom_values.county_name_and_state}}` (también en `alt`/`title` de imágenes y en las tarjetas del carrusel, que lo resuelven a nivel runtime); nunca se hardcodea un pueblo. Las imágenes del carrusel se cambian en el bloque `PEGA AQUI TUS IMAGENES` de su script.

**Rendimiento (todas las animaciones intactas):** el poster de 1.9MB del `<video>` del hero fue eliminado (el overlay WebP inline de 107KB lo sustituye con el mismo fade) y el video usa `preload="none"` — no se descarga hasta que el navegador lo reproduce, ahorrando ~2MB al primer render · un solo `@import` de Google Fonts (antes 6 duplicados que se descargaban en serie, ahora un request variable-font) + `preconnect` a `fonts.googleapis.com`/`fonts.gstatic.com` · `defer` en el script externo del widget de reseñas (ya no bloquea el parseo) · el marquee del carrusel y la rotación 3D se **pausan automáticamente fuera del viewport** (IntersectionObserver: `animation-play-state` en el track, `stop3d()` en la 3D) y el video del hero se pausa/reanuda con el scroll (chequeo de visibilidad cada 400ms; la reanudación solo ocurre si la pausa fue automática) · `content-visibility:auto` en el directorio de pueblos y el FAQ (el navegador se salta el render de lo que no se ve). Verificado en preview: pausa/reanudación del marquee y del video al entrar/salir del viewport, fade del poster, autoplay, 0 errores de consola, 62 tokens intactos.

Las secciones también están como embeds independientes en `home-page/`: `ghl-cobertura-embed.html` (directorio de municipios) y `ghl-faq-embed.html` (FAQ), por si se pegan por separado en GHL.

## Política de Privacidad

`politica-de-privacidad/ILATEK-Politica-Privacidad.html` es la página completa y `politica-de-privacidad/ghl-politica-embed.html` es la versión lista para pegar en un elemento **Custom Code** de GHL. Usa los mismos tokens `{{custom_values.*}}` (sitio web, correo y teléfono de contacto) y acordeones nativos, igual que los Términos y Condiciones. Sustituye las fechas de entrada en vigor y de última actualización del encabezado cuando corresponda.

## Reseñas

- **`resenas/ghl-resenas-embed.html`** es el **embed standalone** del triple widget (Google/Limpieza/Techos) que vive dentro de las 51 páginas con `il-reviews-tabs` — no reemplazarlo sin actualizar esas páginas.
- **`resenas/ghl-resenas-landing.html`** es la **landing completa de confianza de `/resenas`** (2026-10-08): hero de confianza, 6 badges SVG, stats, el triple widget verbatim, tarjetas de los fundadores, FAQ de confianza de 8 preguntas con schema `FAQPage` y CTA verde con calendario GHL. Pegar en Custom Code de la página `/resenas` junto al nav universal y el footer. Tokens `{{custom_values.*}}` con resolutor runtime y fallbacks reales.

El bloque de reseñas (`section#ilatek-reviews`) vive en las 51 páginas con `il-reviews-tabs` (17 en `home-page/`, 1 en `resenas/`, 33 en `techos/`) y tiene **3 pestañas**: `Reseñas de Google`, `Reseñas de Limpieza` y `Reseñas de Techos` (widget ReputationHub `widgetId=6ac3eb680432b6ce3f30b035`, reviews de Mantenimiento de Techos).

- El iframe de Techos se carga con `data-src` al activar su pestaña (igual que Limpieza) y lleva `src="about:blank"`: sin un `src` válido, `review-widget.js` rompe con `new URL('')` y **no aplica alturas a ningún widget de la página** (bug confirmado en producción; con el fix, `lc.setHeight` se aplica a los tres).
- El JS de las pestañas es genérico (itera `.il-reviews-tab` y usa `aria-controls`), así que aguanta 3 pestañas sin tocar el script.
- `resenas/ghl-resenas-embed.html` es la página nueva `/resenas` (slug `resenas`) con las 3 pestañas, H1 propio y CTA; pégala en Custom Code de una página nueva en GHL, junto al nav y al footer. El enlace `Reseñas` del menú (`home-page/ghl-nav-embed.html` y `techos/ghl-techos-nav-embed.html`) apunta a `{{custom_values.website_url}}/resenas`.

## Menú y /techos

- El menú de techos (`techos/ghl-techos-nav-embed.html`) lleva el mismo motor híbrido es/en (píldora + capa Google Translate en páginas sin traducciones propias) que el menú universal.
- El menú universal (`home-page/ghl-nav-embed.html`) da prioridad a **Mantenimiento de Techos**: es el primer enlace del nav; en el mega-panel las categorías de techos van antes que Limpieza ("Techos · Mantenimiento" primero, Limpieza al final) y el drawer móvil hereda ese orden; Techos va antes que Limpieza en Empleos, en el dropdown de "Agenda tu Servicio" y en los enlaces "Todos los Servicios" del pie del mega. El enlace "Todos los Servicios de Mantenimiento de Techos" del pie del mega (y su copia integrada en el home multiservicios, y el del menú de techos) apunta siempre a `{{custom_values.website_url}}/servicios-techos` (antes `/home` o `/techos`). El enlace desktop «Acerca de Nosotros» del menú universal apunta a `{{custom_values.website_url}}/limpieza/#ilatek-conocenos` (el del drawer conserva `/#ilatek-faq`).
- El icono de la pestaña `Reseñas de Google` del widget `il-reviews-tabs` es una imagen `<img class="il-sico">` (15×15, recorte circular) con la "G" de Google alojada en `https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ac6fe59195f9172eddf11b8.jpg` — presente en las 51 páginas con el widget (17 en `home-page/`, 1 en `resenas/`, 33 en `techos/`); sustituye al SVG inline anterior.
- El home multiservicios abre con el hero «Ilatek Property Solution» (foto de equipo a pantalla completa, CDN `media/6ac72f698c077584b4edd068.jpg`, scrim navy, contenido centrado, 2 botones pill a `/cotizacion-techos` y `/cotizacion`): zoom sutil al hover, reveal al cargar, `prefers-reduced-motion` lo desactiva. Sustituyó al hero `.ms-hero` (foto de casa); ya no aplica el hack de altura `min-height:calc(1.02em*3)` del H1 ni las claves i18n `h1/heroSub/fact*` (podadas del diccionario). El resolutor de tokens del hero se conserva (marcador `msHeroTokens`).
- La página `/techos` consolida a `/home`: los enlaces internos (menús, footer, breadcrumbs del schema, logo) apuntan a `/home`; el canonical y og:url de su bloque SEO son `https://ilatekpr.com/home`; salió del sitemap (`sitemap.xml` y fragmento) y `llms-techos.txt` lo documenta. La redirección real se configura en GHL.

## Home Multiservicios

`home-page/ghl-home-multiservicios.html` es el home nuevo "Compañía de Multiservicios" (embed todo-en-uno para GHL). Estructura: Hero Multiservicios (CTAs Techos + Limpieza) · Mantenimiento de Techos con links a las 5 landings madre (Reparación, Sellado, Impermeabilización, Techos por Segmento, Inspección y Mantenimiento) · Airbnb & Turnover · Limpieza (9 servicios) · Reseñas 3 pestañas en orden Reseñas de Mantenimiento de Techos · Reseñas de Google (centro, activa por default) · Reseñas de Limpieza — widgets reasignados por nombre; solo en este home · CTA final con calendarios duales. **Nav integrado**: el embed ya trae el menú universal (píldora es/en incluida); el footer sigue pegándose aparte. Sin referencias a oxidación por decisión del cliente.

**Custom values en Custom Code:** GHL **no procesa** `{{custom_values.*}}` dentro de elementos Custom Code — el hero (`ms-hero`) lleva su propio resolutor runtime (mismo patrón que el resto de secciones): county → `Puerto Rico` (o `data-location-label` si GHL lo resolviera) y `website_url` → origen actual. Si al publicar se ven tokens literales en una sección nueva, copiar ese patrón.

**Altura del hero ES=EN:** el H1 ES ocupa 3 líneas y el EN 2, así que el H1 reserva `min-height:calc(1.02em * 3)` — el hero mide exactamente lo mismo en ambos idiomas (727/725/692/643 px a 1920/1440/1280/390).

**Toggle ES/EN (fase 2):** el menú universal (`ghl-nav-embed.html`) trae un botón cápsula es/en (`.iln-lang` dentro de `.iln-langwrap`) siempre visible (motor híbrido: traducciones propias cuando la página las tiene, capa Google Translate cuando no). Traduce textos y atributos con cuatro modos de nodo: `data-en` (texto plano; `data-en-html` para innerHTML), `data-attr` (+`data-attr2`/`data-es2`/`data-en2` para un segundo atributo) y `data-en-key` (rich text EN desde `window.ILATEK_I18N`, con snapshot `_ilEsHtml` para restaurar el ES original). Cambia `<html lang>`, persiste en `localStorage` (clave `ilatek-lang`; el boot aplica el idioma guardado en cada carga) y emite el evento `ilatek:lang` que sincroniza footer, marquee (rebuild bilingüe de títulos, kickers, descripciones y precios EN) y auto-slide off en EN. En el home traduce hero, ambos carruseles 3D, proceso, marquee, Airbnb, cobertura (placeholder incluido), reseñas (pestañas), FAQ completa (qa1–qa10) y CTA final. El footer (`ghl-footer-embed.html`) escucha el mismo evento y lee localStorage al cargar. El county se resuelve dinámicamente leyendo `data-location-label` del contenido de la página.

**Nota de mantenimiento:** en `ghl-home-multiservicios.html`, `website`, `county` y `function token` del carrusel de servicios viven a nivel del IIFE (no dentro de `buildCards`): `buildCards()` se re-ejecuta en cada cambio de idioma y el bloque de resolución de tokens usa esas variables después de la llamada inicial.

Verificado en preview local (1280/390): ida y vuelta es↔en completa (nav, mega-panel, footer, H1 con `<em>` restaurado, facts, tarjetas 3D, marquee EN, Airbnb, cobertura, FAQ, CTA), persistencia tras recarga con `ilatek-lang=en`, toggle visible en todas las páginas (rama auto vía GT), sin scroll horizontal a 390px y consola limpia; swipe y pausa al hover probados en los dos carruseles 3D (rotación 4.2s, reanudación al salir, giro por gesto ≥48px).

## Archivos

- `home-page/ghl-custom-code.html`: landing de inicio para GHL Custom Code; botones de cotización hacia https://ilatekpr.com/cotizacion.
- `resenas/ghl-resenas-embed.html`: página de reseñas `/resenas` (3 pestañas: Google, Limpieza, Techos) para Custom Code en GHL.
- `ghl-custom-code.html`: versión editable con imagen local.
- `ghl-custom-code-embedded.html`: versión autónoma lista para copiar en GHL.
- `ilatek-calendar-custom-code.html`: estilos del calendario con las etiquetas HTML necesarias.
- `ilatek-calendar-ghl.css`: estilos CSS de referencia; requiere etiquetas `<style>` para el campo Insert custom code.
- `assets/latina-cleaner.png`: imagen utilizada, sin tatuaje.
- `assets/latina-cleaner-tattoo.png`: variante anterior de la imagen, actualmente no utilizada.
- `terminos-y-condiciones/ILATEK-Terminos-Condiciones.html`: página completa de Términos y Condiciones.
- `terminos-y-condiciones/ghl-terminos-embed.html`: versión de Términos para pegar en Custom Code en GHL.
- `politica-de-privacidad/ILATEK-Politica-Privacidad.html`: página completa de Política de Privacidad (basada en la plantilla de Términos).
- `politica-de-privacidad/ghl-politica-embed.html`: versión de Política de Privacidad para pegar en Custom Code en GHL.

## Calendario y depósito

El último paso integra el calendario de ILATEK alojado en GHL. La disponibilidad, la reserva y el cobro de $50 se gestionan en ese calendario. El cotizador no procesa pagos ni añade automáticamente el depósito al precio calculado.

Las respuestas del cotizador no se transfieren automáticamente al registro de la reserva. Cualquier conexión con campos de contacto o automatizaciones requiere una integración adicional.

## Editar

Los precios y el cálculo están en `ghl-custom-code.html`. Después de editarlo, actualiza también la versión incrustada para mantener ambas versiones sincronizadas. Los colores se definen como variables CSS en `.pcq`.

Guardar el proyecto en GitHub no actualiza automáticamente la página publicada en GHL; hay que reemplazar allí el código cuando haya cambios.
