# Por qué /blog y /sitemap-blog.xml devuelven 404

Fecha de la evidencia: 2026-11-07.

## Lo que sí existe en el repositorio

- `blog/build/build-blog.mjs` genera las páginas del blog.
- `blog/` contiene 118 archivos HTML generados.
- `blog/sitemap-blog.xml` contiene 118 URLs.

## Lo que responde el sitio publicado

- `https://ilatekpr.com/blog` → **404**.
- `https://ilatekpr.com/sitemap-blog.xml` → **404**.

## Causa

No es un bug del generador ni del contenido: el build produce los archivos, pero el host de producción es GoHighLevel y **no publica la carpeta `blog/` como rutas estáticas**. Tampoco existe una página/funnel de GHL montada en `/blog` que renderice el índice. El XML del blog tampoco se sube ni se registra en el sitemap principal. Por eso el contenido existe en código pero no tiene URL viva.

## Cambio necesario (no aplicado aquí)

1. Publicar `blog/` como rutas estáticas en `ilatekpr.com` (o crear una página `/blog` en GHL que renderice el índice y las entradas).
2. Subir `blog/sitemap-blog.xml` a una URL viva.
3. Enlazarlo desde `sitemap.xml` (o desde un sitemap index) cuando `/blog` responda 200.
4. Cambiar `blog/publicacion.json` a `"publicado": true` y correr `npm run build:sitemap`.

Mientras eso no ocurra, `tools/build-sitemap.mjs` excluye el blog a propósito: listar 118 URLs que devuelven 404 sería peor que no listarlas. Este documento no afirma que el blog esté resuelto.
