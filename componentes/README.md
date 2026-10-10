# Componentes compartidos

Fragmentos reutilizables trasladados desde `home-page/`; no son landings de categoría o servicio.

- `ghl-nav-embed.html`: menú universal independiente. El Home multiservicios ya lo incluye.
- `ghl-categorias-embed.html`, `ghl-categorias-mini-3d.html`, `ghl-categorias-3d-grandes.html`: variantes del carrusel de categorías, no páginas de categoría.
- `ghl-servicios-carousel-embed.html`: carrusel de servicios.
- `ghl-cobertura-embed.html`: directorio de cobertura.
- `ghl-faq-embed.html`: FAQ independiente, mantenido por `src/faq/`.
- `ghl-conocenos-embed.html`, `ghl-conocenos-section.html`: secciones de presentación.
- `ghl-performance-head.html`, `ghl-container-fit.css`, `ghl-form-contacto-center.css`: utilidades existentes.

Los medios del Home completo están inventariados en [home/es/ASSETS.json](../home/es/ASSETS.json). El footer global permanece en [ghl-footer-embed.html](../ghl-footer-embed.html). No pegar una sección adicional si ya está integrada en el HTML de la página.
