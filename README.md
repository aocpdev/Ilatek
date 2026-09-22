# Ilatek

Cotizador de limpieza residencial en español para integrar en GoHighLevel (GHL).

Incluye cinco pasos: datos básicos, servicios, extras, resumen y calendario. Calcula el precio estimado y la duración, muestra el aviso de depósito de $50 y carga el calendario con un indicador de espera.

## Usar en GHL

1. Abre `ghl-custom-code-embedded.html` y copia todo su contenido.
2. Pégalo en un elemento **Custom Code** de tu página en GHL.
3. Guarda y revisa la página publicada. La imagen de la protagonista ya está incrustada en este archivo.

Para personalizar el calendario, pega el contenido completo de `ilatek-calendar-custom-code.html` en **Widget appearance → Insert custom code**, incluyendo las etiquetas `<style>` y `</style>`. No pegues CSS sin esas etiquetas en ese campo: se mostrará como texto.

## Home Page

`home-page/ghl-custom-code.html` es la landing de inicio para pegar tal cual en un elemento **Custom Code** de la página de inicio en GoHighLevel. Usa los tokens `{{custom_values.*}}` de GHL (ubicación, contacto, redes) e incluye JSON-LD y el widget de reseñas.

Todos los botones y enlaces de cotización (nav, hero, servicio, CTA y footer) apuntan fijos a `https://ilatekpr.com/cotizacion`.

`home-page/ghl-home-completo.html` es la versión todo-en-uno de la home. Orden de secciones: hero (con botón "Conoce el servicio" que hace smooth scroll al carrusel), categorías en carrusel 3D infinito (la tarjeta frontal siempre grande al centro; las otras 2 giradas y hundidas en perspectiva; rota cada 4.2s en todos los dispositivos, se pausa solo al hover sobre una tarjeta (hover en el escenario no detiene), clic o Enter en una tarjeta lateral la trae al frente; **swipe horizontal con el dedo gira el carrusel** (izquierda=siguiente, derecha=anterior, sin interferir con el scroll vertical); tarjetas más cercanas entre sí (`--side-x` 205px escritorio / 160px tablet / 36vw móvil); zoom de imagen moderno igual al del carrusel de servicios; badges glassmorphism; tarjetas compactas 380px con imagen 164px y botón siempre visible dentro del escenario — profundidad `--lift` reducida a 130px para que la proyección 3D no recorte el contenido; en móvil (≤560px) la tarjeta completa (imagen 132px, textos y botón 42px) cabe en una pantalla de teléfono con escenario de 520px), proceso, carrusel de los 10 servicios más solicitados (auto-slide infinito en todos los dispositivos, se pausa con hover; cada tarjeta es un enlace completo a `{{website_url}}/nombre-del-servicio` usando el slug de cada servicio, con **precio blanco con glow neón** + botón verde "Ver más" en el pie de la tarjeta y **drag con el dedo/ratón** (solo se activa con gesto claramente horizontal —umbral 10px y 1.2× el vertical—; el scroll vertical de la página nunca se bloquea; el marquee se pausa mientras arrastras y retoma al soltar; un drag no dispara el clic)), conócenos, directorio de los 78 municipios (con padding simétrico arriba/abajo: 112px escritorio, 84px ≤900px, 64px ≤560px), servicio principal (Limpieza Profunda), beneficios, reseñas, cobertura, sección de Preguntas Frecuentes desplegable (acordeón nativo `details/summary`) con schema `FAQPage` para SEO/AI y CTA final. Es el archivo listo para copiar y pegar completo en el Custom Code de la home.

**Jerarquía semántica de headings:** H1 único en el hero · H2 para los títulos de sección · **H3 exclusivo del FAQ** (las 10 preguntas del acordeón, alineadas 1:1 con el schema `FAQPage`) · H4 para subsecciones (pasos del Proceso, Beneficios, paneles de Conócenos, Limpieza Profunda) · H5 para títulos de tarjetas (Categorías 3D, tarjetas del carrusel, CTA del carrusel). El estilo visual se preserva con selectores por sección (`.ilcg-body h5`, `.ils-body h5`, `.il-benefit h4`, etc.). Los dos schemas JSON-LD embebidos (`FAQPage` con 10 preguntas y `@graph` HouseCleaning+WebSite) permanecen válidos e intactos.

Todas las menciones de ubicación usan el custom value `{{custom_values.county_name_and_state}}` (también en `alt`/`title` de imágenes y en las tarjetas del carrusel, que lo resuelven a nivel runtime); nunca se hardcodea un pueblo. Las imágenes del carrusel se cambian en el bloque `PEGA AQUI TUS IMAGENES` de su script.

**Rendimiento (todas las animaciones intactas):** el poster de 1.9MB del `<video>` del hero fue eliminado (el overlay WebP inline de 107KB lo sustituye con el mismo fade) y el video usa `preload="none"` — no se descarga hasta que el navegador lo reproduce, ahorrando ~2MB al primer render · un solo `@import` de Google Fonts (antes 6 duplicados que se descargaban en serie, ahora un request variable-font) + `preconnect` a `fonts.googleapis.com`/`fonts.gstatic.com` · `defer` en el script externo del widget de reseñas (ya no bloquea el parseo) · el marquee del carrusel y la rotación 3D se **pausan automáticamente fuera del viewport** (IntersectionObserver: `animation-play-state` en el track, `stop3d()` en la 3D) y el video del hero se pausa/reanuda con el scroll (chequeo de visibilidad cada 400ms; la reanudación solo ocurre si la pausa fue automática) · `content-visibility:auto` en el directorio de pueblos y el FAQ (el navegador se salta el render de lo que no se ve). Verificado en preview: pausa/reanudación del marquee y del video al entrar/salir del viewport, fade del poster, autoplay, 0 errores de consola, 62 tokens intactos.

Las secciones también están como embeds independientes en `home-page/`: `ghl-cobertura-embed.html` (directorio de municipios) y `ghl-faq-embed.html` (FAQ), por si se pegan por separado en GHL.

## Política de Privacidad

`politica-de-privacidad/ILATEK-Politica-Privacidad.html` es la página completa y `politica-de-privacidad/ghl-politica-embed.html` es la versión lista para pegar en un elemento **Custom Code** de GHL. Usa los mismos tokens `{{custom_values.*}}` (sitio web, correo y teléfono de contacto) y acordeones nativos, igual que los Términos y Condiciones. Sustituye las fechas de entrada en vigor y de última actualización del encabezado cuando corresponda.

## Archivos

- `home-page/ghl-custom-code.html`: landing de inicio para GHL Custom Code; botones de cotización hacia https://ilatekpr.com/cotizacion.
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
