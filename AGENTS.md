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
