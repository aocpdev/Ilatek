# Reglas del proyecto ILATEK

## Enlaces internos — requisito del propietario

- Todo enlace de navegación a una página de este sitio debe usar en el HTML fuente `https://{{custom_values.website_url}}/ruta`. Nunca dejar `{{custom_values.website_url}}/ruta`, una ruta relativa ni el dominio de producción escrito directamente en un CTA.
- En GHL, `website_url` contiene el dominio sin protocolo ni barra final, por ejemplo `ilatekpr.com`. No cambiar los nombres de Custom Values.
- Conservar paths, parámetros y fragmentos. Los saltos a una sección mantienen su scroll mediante el runtime compartido. No convertir referencias SVG `href="#icono"` en enlaces web.
- Los destinos en otros hosts (portal, subdominios municipales, CDNs, calendarios, reseñas, redes), `tel:` y `mailto:` se conservan. No inventar paths equivalentes para ellos. Sitemap/robots/llms públicos necesitan URLs reales, no tokens GHL.
- `src/compartido/internal-links.js` es la fuente del runtime; `tools/internal-link-contract.mjs` aplica el contrato a los embeds. Mantenerlos autónomos para copiar a Custom Code sin recursos JavaScript locales adicionales.
- Los generadores deben respetar el mismo contrato. Después de cambiar runtime o links: `node tools/apply-internal-links.mjs`, `node tools/package-pages.mjs`, `npm test`. No ejecutar generadores de contenido para un cambio puramente mecánico de URLs.
- No publicar en GHL ni hacer push sin solicitud. Preservar cambios locales del usuario.

Guía detallada: `documentacion/ENLACES-INTERNOS.md`. Mapa de archivos: `docs/estructura.json`.

## Header y footer — requisito del propietario

- Cada landing de entrega debe incluir una sola navegación `#ilatek-nav` y un solo `#ilatek-footer`. No añadirlos a widgets parciales, HEAD SEO ni archivos históricos.
- Seguir el proceso de componentes compartidos de Aires Inverters adaptado a ILATEK; no regenerar contenido ni imponer una estructura ajena.
- Fuente del menú: `componentes/ghl-nav-embed.html`. Fuente del footer: `ghl-footer-embed.html`. El Home conserva su menú integrado y sus ajustes propios.
- `tools/page-shell.mjs` ensambla los componentes inline para copiar el HTML completo en GHL. Tras editar componentes: `npm run sync:layout`, `npm test` y verificación de navegador. Nunca ejecutar los generadores de contenido solo para sincronizar header/footer.
- El hero reserva la altura del menú más 32/48/64 px en móvil/tablet/desktop mediante `src/compartido/responsive-layout.css`; no añadir también el separador de 92 px a las páginas de servicios. Home mantiene su composición centrada. El runtime mide solo la barra fija, nunca el drawer abierto.
- `data-attr` traduce únicamente el atributo indicado; jamás sobrescribir `textContent` con una etiqueta ARIA. Las flechas de pueblos son SVG inline con etiquetas accesibles ES/EN, normalizadas en `tools/responsive-contract.mjs`. Comprobar con `npm run test:responsive` al cambiar header, hero o directorio.
- En el header expandido mostrar únicamente la imagen del logo, sin la palabra Ilatek duplicada ni tarjeta, borde o padding decorativo. Conservar la barra de 64 px y el área del logo de 52 px. El fondo blanco uniforme de la barra integra el fondo del asset original; mantener su etiqueta accesible de enlace al inicio.
- Solo al contraerse por scroll, el logo utiliza una tarjeta glass de 64 × 64 px, radio de 20 px y borde de 1 px que se resalta con hover/foco. Sin hexágono ni aumento de tamaño. En ese estado, clic, Enter o Espacio abren la navegación sin navegar al inicio; restaurar la semántica de enlace al expandir. Mantener fallback sin backdrop-filter.
- En móvil/tablet, ES/EN va a la derecha, inmediatamente antes del botón de menú, con separación de 8 px y objetivos táctiles de 44 px. Hamburguesa y X comparten una celda centrada de 22 px; no posicionar absolutamente el SVG dentro del span de cierre.
- En desktop, conservar el orden real de elementos y de teclado: navegación → ES/EN → Login → agenda. El idioma se presenta como opción del menú, sin cápsula, con el mismo espaciado que los enlaces; el Login de la barra se oculta en móvil, que conserva su enlace dentro del drawer.

## Localización SEO e imágenes — Delta System

- El Custom Value confirmado por el propietario es exactamente `{{custom_values.county_name_and_state}}`, no `business__county_name`. Usarlo en Title, Description, metadatos sociales y textos descriptivos alt/title de las imágenes.
- Conservar el alt vacío de las imágenes decorativas. No añadir localidad a URLs de assets, no inventar oficinas ni afirmar que una foto documenta un trabajo realizado en un pueblo.
- `tools/location-contract.mjs` aplica el contrato al formatear los entregables; `src/compartido/location-values.js` resuelve imágenes y metadatos para vista previa y llegada tardía del párrafo GHL. Las plantillas codificadas conservan la localidad al cambiar ES/EN.
- Actualizar fuentes, sincronizar layout, ejecutar `node tools/apply-internal-links.mjs` y `node tools/package-pages.mjs`, luego pruebas. Los SEO-GHL.md se generan desde el HEAD real: no corregir únicamente el Markdown.
- La publicación requiere validar que GHL entregue los metadatos resueltos en el HTML inicial. JavaScript local no acredita indexación ni vistas previas sociales correctas.
