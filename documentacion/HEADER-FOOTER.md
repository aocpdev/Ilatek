# Header y footer integrados — ILATEK

Se sigue el criterio de Aires Inverters (componentes compartidos → landing completa → verificación), adaptado al proyecto existente. No se reemplazaron las fuentes de contenido ni se generaron nuevas traducciones.

## Fuentes y entregables

- Menú universal: [componentes/ghl-nav-embed.html](../componentes/ghl-nav-embed.html).
- Footer global: [ghl-footer-embed.html](../ghl-footer-embed.html). Se conserva esta ubicación para no romper referencias existentes.
- Ensamblador y lista explícita de entregables: [tools/page-shell.mjs](../tools/page-shell.mjs).
- Home: mantiene su menú integrado y añade el footer al final, fuera del contenido.
- Categorías y servicios: menú universal al principio, contenido existente y footer al final.
- También se completan la landing actual de reseñas, los embeds legales y las dos versiones actuales del cotizador (embedded y paste): 52 archivos de entrega en total.

Los archivos históricos, documentos legales exportables, previews antiguos, widgets de reseñas, calendarios y fragmentos de secciones no reciben estos componentes: no son las landings completas de entrega.

## Uso en GHL

Copiar el HTML completo de la landing en un Custom Code. **No pegar otra vez el menú o footer** ni mantener una sección global equivalente duplicada en esa página. No se ha editado GHL automáticamente.

Cada entrega contiene HTML/CSS/JS inline; no necesita cargar archivos locales ni descargar el header/footer con JavaScript. Los enlaces internos conservan `https://{{custom_values.website_url}}/ruta`. Los assets nuevos compartidos se incluyen en los inventarios y carpetas de las 47 páginas organizadas.

## Mantenimiento

1. Editar la fuente compartida correspondiente. El menú integrado del Home se mantiene deliberadamente, con sus ajustes de diseño y traducción.
2. Ejecutar `npm run sync:layout`. Para medios nuevos aún no respaldados, ejecutar `node tools/package-pages.mjs --download`.
3. Ejecutar `npm test` y las pruebas de navegador. Comprobar menú desktop/móvil, idioma, footer, ausencia de duplicados y que el menú fijo no tape el contenido.

La sincronización es idempotente y no regenera precios, calendarios, FAQ ni contenido. El generador de techos usa el mismo ensamblador, para que futuras páginas no pierdan el header/footer. No editar manualmente los bloques entre marcadores `ILATEK:SHELL` en las landings: serán reemplazados al sincronizar.

## Verificación de esta integración

- `npm test`: aprobado; 52 archivos de entrega y las 32 salidas del generador de techos tienen exactamente un menú y un footer, con un único runtime de enlaces.
- `tools/test-page-shell-browser.mjs`: 58 casos aprobados en Chromium aislado, con todas las entregas a 390 px y seis muestras a 1280 px; menú, cierre con Escape, ES/EN del footer, valores tardíos, enlaces y ausencia de scroll horizontal/errores JavaScript.
- Las pruebas de navegador bloquean servicios externos; no reservan citas, cobran depósitos ni validan la traducción remota de Google o widgets externos.
- Comparación contra el commit previo: contenido original preservado en las 47 páginas del catálogo, excluyendo únicamente los nuevos bloques compartidos.
- Inventarios actualizados: 888 referencias de medios con respaldo local; se mantienen los 58 avisos previos de CDN con respaldo WebP. Los nuevos medios del footer se descargaron correctamente.
- Cambios locales, pendientes de publicación en GitHub y de instalación en GHL.

## Corrección responsive y flechas — 2026-10-10

- La variante histórica de limpieza tenía `padding-top:0` y el menú fijo no reservaba espacio. Las entregas actuales usaban un separador de 92 px además del padding del hero. Se unifica la reserva: altura real del menú + 32 px hasta 560 px, + 48 px hasta 1100 px y + 64 px en desktop. Se elimina el separador redundante solo en heroes de servicios; se mantienen los diseños de cotizador, reseñas y legales. Home conserva su composición centrada con un mínimo seguro.
- Fuentes: `src/compartido/responsive-layout.css`, `src/compartido/responsive-layout.js` y `tools/responsive-contract.mjs`. El formateador incorpora todo inline en los archivos para GHL. Los tres archivos históricos de limpieza se benefician del espacio cuando se combinan con el menú, pero no reciben automáticamente header/footer.
- Causa confirmada de las flechas: el traductor del menú copiaba el `aria-label` a `textContent` cuando el botón no tenía hijos HTML. Ahora solo cambia el atributo. Las flechas son SVG inline de 22 px en botones de al menos 44 px; conservan etiquetas para lectores de pantalla, estados deshabilitados y foco de teclado.
- `tools/test-responsive-browser.mjs` prueba las 52 entregas y tres variantes históricas a 390, 768 y 1440 px, con muestras adicionales a 360 y 1024 px y rotación a 844 × 390. Comprueba separación, overflow, menús, Escape, flechas ES/EN, paginación, búsqueda sin acentos, sin resultados y reinicio. Sirve imágenes desde respaldos locales; bloquea fuentes y servicios externos.
- Para GHL: reemplazar **todo** el Custom Code de la landing, no solo el CSS. La corrección también modifica el JavaScript de idiomas. No añadir un menú global duplicado. Si se utilizan componentes separados, reemplazar tanto el menú como el directorio de cobertura.
- La prueba local no reproduce todos los estilos globales de una cuenta GHL. Tras pegar y guardar, revisar la vista previa y la página publicada a los tres tamaños. No se ha publicado ni modificado GHL desde esta tarea.
- Resultado: 52 entregas actuales (164 combinaciones página/ancho) y tres variantes históricas (11 combinaciones), más 25 comprobaciones de rotación, sin overflow ni errores JavaScript al terminar las correcciones. Se inspeccionaron capturas de Home, limpieza original, limpieza residencial, alfombras, techos y pueblos. Las 58 comprobaciones de regresión de menú/footer/idiomas/Custom Values y `npm test` también pasaron. Fuentes remotas y servicios externos bloqueados: la apariencia tipográfica final debe revisarse en GHL.
- En la variante histórica se corrigió además una referencia a `kk`/`isEn` inexistentes en su carrusel monolingüe. El contrato de localización conserva ahora el label propio `s.kicker`; no se alteran los precios ni los enlaces del carrusel.

## Logo sin tarjeta — 2026-10-10

- Se elimina exclusivamente el texto `<b>Ilatek</b>` del enlace de marca del menú. El nombre permanece dentro del diseño original del logo y en sus etiquetas accesibles; el contenido de las páginas y el footer no se cambian.
- La imagen conserva un espacio fijo de 52 × 52 px, sin padding, borde, fondo decorativo, redondeado ni sombra. La barra conserva sus 64 px de alto, también en modo compacto. El fondo blanco uniforme del menú evita que el fondo blanco del archivo original se perciba como una tarjeta sobre el antiguo fondo translúcido; no se modifica ni se genera un logo nuevo.
- El enlace al inicio conserva su `aria-label`, alt/title localizados y foco visible. La corrección se aplica por el formateador compartido al Home integrado, al componente de navegación y a las entregas sincronizadas. La prueba responsive verifica dimensiones, ausencia de texto duplicado, menú compacto y expansión al recibir foco.
- Reemplazar el HTML completo en GHL. Cambios locales, sin publicación ni push.

## Controles móviles alineados — 2026-10-10

- La hamburguesa y la X comparten una celda de grid de 22 × 22 px dentro del mismo botón de 44 × 44 px. Se elimina el posicionamiento absoluto del SVG anidado que desplazaba la X; se conserva el foco visible y se respeta movimiento reducido.
- Hasta 1100 px, el selector ES/EN ocupa el lado derecho, a 8 px del botón de menú. Se simplifica a etiquetas con el idioma activo resaltado, sin borde exterior ni sombra, pero con un objetivo táctil de 44 px. Desktop conserva su disposición y la barra sigue midiendo 64 px.
- `test-responsive-browser.mjs` comprueba coordenadas de ambos iconos abiertos/cerrados, alineación y separación del idioma, botones reales de cambio ES/EN, cierre con X/Escape, dimensiones y modo compacto. Los cambios se incorporan inline al sincronizar; no requieren archivos CSS externos en GHL.

## Orden desktop — 2026-10-10

- Orden de la barra: logo, opciones de navegación, ES/EN, Login y agenda. Se mueve el enlace Login fuera del grupo central y se reordena el HTML real; Tab recorre idioma → Login → agenda, sin discrepancia con la posición visual. Su URL y el Login del drawer se conservan.
- Idioma integrado como opción del menú: tamaño de letra de 14 px, sin cápsula ni sombra; idioma activo subrayado en verde. Una misma separación adaptable de 16–24 px se utiliza entre las opciones de navegación, idioma, Login y CTA.
- La distribución móvil se conserva: idioma junto al botón hamburguesa/X. Se mantiene la altura de 64 px y se ocultan los controles secundarios al contraer el menú al logo.
- Pruebas responsive ampliadas a 1101 y 1250 px, además de móvil, tablet y 1440 px: separación uniforme, ausencia de solapamientos, orden de teclado y apertura/cierre de menús. Cambios locales, sin publicación en GHL ni push.

## Tarjeta glass al contraer — 2026-10-10

- Excepción al diseño sin tarjeta del menú expandido: únicamente en el estado compacto de scroll, el logo recibe una tarjeta de 64 × 64 px con esquinas de 20 px, fondo translúcido, desenfoque, sombra ligera y borde de 1 px. El borde azul se acentúa con hover y foco de teclado. No se utiliza forma hexagonal ni se aumenta la huella del control.
- El asset original sigue intacto, a 52 × 52 px; solo se redondea su presentación en ese estado. Hay fondo alternativo para navegadores sin `backdrop-filter` y el header expandido conserva su altura y distribución anteriores.
- En compacto, el logo anuncia «Abrir menú de navegación» (ES/EN), admite clic, Enter y Espacio, y abre el drawer móvil o el menú de servicios desktop sin navegar al inicio. Al expandirse recupera su enlace original. El foco por sí solo ya no expande el control; permite reconocer el borde y activarlo explícitamente.
- Fuentes: CSS compartido y normalización del script en `tools/responsive-contract.mjs`. La sincronización mantiene los embeds autónomos. Las pruebas verifican medidas, borde, hover, semántica y las tres activaciones, además de conservar URL, apertura y cierre con Escape.
- Cambios locales. Para GHL se debe reemplazar el HTML completo del entregable; no se ha publicado en GHL ni enviado a GitHub.
