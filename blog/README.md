# Blog ILATEK — sellado de techos en Puerto Rico

Motor de SEO programático del proyecto. Genera 118 páginas en español (`es-PR`) que comparan
sistemas de sellado, responden las preguntas que se buscan en Google y conectan con las
comunidades y landings de servicio de `ilatekpr.com`. Todo termina en el CTA
`/cotizacion-techos`.

## Por qué páginas propias y no el blog nativo de GHL

El blog nativo de GHL usa la ruta fija `/b/`, no permite Custom Code en el cuerpo del post,
no acepta Custom Values ni un schema distinto por artículo y no admite archivos por categoría.
Por eso cada entrada es una **página normal con slug `/blog/<slug>`**: mantiene el mismo shell,
el mismo contrato de enlaces y el mismo footer que las landings, y el schema viaja dentro del
fragmento.

## Estructura

```
blog/
  build/                  generador, verificador y hoja de estilo
  data/                   catálogos: sistemas, marcas, posts, preguntas, editoriales
  seo/seo-blog.csv        ruta, título, descripción, canonical, sección y palabra clave
  01-preguntas-frecuentes/  6 clústeres + hub
  02-comparativas/       100 posts + hub
  03-comunidades-servicios/ 8 puentes + hub
  index.html              hub raíz /blog
  indice.json             inventario de las 118 páginas
  sitemap-blog.xml        solo URLs del blog
  INVENTARIO.md           tabla legible del lote
```

Rutas publicadas:

| Ruta | Página |
| --- | --- |
| `/blog` | hub raíz |
| `/blog/comparativas` | hub de las 100 comparativas |
| `/blog/preguntas-frecuentes` | hub de los 6 clústeres |
| `/blog/comunidades-y-servicios` | hub de los 8 puentes |
| `/blog/<slug>` | 100 comparativas + 8 puentes |
| `/blog/preguntas-frecuentes-<clúster>` | 6 clústeres |

## Regenerar

```bash
node blog/build/build-blog.mjs    # escribe las 118 páginas, el índice, el CSV y el sitemap
node blog/build/verify-blog.mjs   # audita enlaces, anclas, schema, tokens y SEO
```

El generador es determinista: los datos viven en `data/` y el texto de los 20 posts
principales en `data/editoriales.json`. Para añadir un post, agrega el objeto a
`data/posts.json`, vuelve a construir y el índice, el CSV, el sitemap, las relacionadas y
los enlaces entrantes se recalculan solos.

## Publicar en GHL

1. Crea una página con la URL exacta de la tabla (por ejemplo `/blog/cintron-vs-danosa`).
2. Pega el HTML completo en un bloque de Custom Code. **No** agregues header ni footer:
   el fragmento ya trae el nav y el footer del proyecto, una sola vez cada uno.
3. Copia título, descripción y canonical desde `seo/seo-blog.csv` al panel SEO nativo.
   La página no lleva `<title>` ni `<meta name="description">` para no duplicarlos.
4. Al terminar el lote, sube `sitemap-blog.xml` a Search Console junto al sitemap principal.

## Reglas que el verificador hace cumplir

- Un solo `<h1>` por página y un solo nav y un solo footer.
- Todos los enlaces internos pasan por el contrato `https://{{custom_values.website_url}}/ruta`
  con su `data-ilatek-path`, sin dominios literales ni rutas relativas.
- Cada enlace `#ancla` apunta a un `id` que existe en la página de destino.
- Ninguna página queda huérfana: todas reciben al menos un enlace interno.
- JSON-LD parseable (Article, BreadcrumbList, FAQPage y CollectionPage según el caso).
- El CTA `data-ilatek-path="/cotizacion-techos"` aparece en las 118 páginas.
- El CSV cubre las 118 rutas y el canonical coincide con `https://ilatekpr.com` + ruta.
- El sitemap tiene exactamente las mismas 118 URLs.

## Contenido y límites legales

- Solo se publican precios que la empresa publica en su propio sitio, con enlace y fecha de
  verificación. Si no hay precio público, la página dice "no publicado" y no se inventa.
- Se comparan hechos verificables. No hay logos, fotos ni material de terceros, ni se afirma
  afiliación, patrocinio o recomendación oficial de ninguna marca.
- Cada página cierra con el bloque de comparación y el aviso de marcas registradas.

El crédito "Hecho con 🤍 por Devasks", las redes sociales y el logo que vuelve a
`ilatekpr.com` vienen del footer compartido del proyecto, por lo que se actualizan en un
solo lugar.
