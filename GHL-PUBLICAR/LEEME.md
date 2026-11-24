# Qué pegar en GHL — Blog Ilatek (138 landings)

Todo lo de esta carpeta está listo para copiar y pegar. Cada landing tiene su propia carpeta en `por-pagina/`.

## Los cuatro archivos de cada landing

| Archivo | Dónde va en GHL |
|---|---|
| `1-PAGINA.txt` | Nombre y slug al crear/clonar la página. Es una guía, no se pega. |
| `2-CODIGO-CUSTOM-HTML.html` | Elemento **Custom HTML/JavaScript** → *Custom Code* → *Open Code Editor*. Borra lo que haya y pega esto entero. |
| `3-HEAD-SEO.html` | **Settings → Tracking Code → HEADER**. No va dentro del Custom HTML. |
| `4-SEO-CAMPOS.txt` | Panel **SEO** de la página: title, description, keywords, social image y canonical. |

## Orden por landing

1. Websites → **Blog - Home** → ⋮ → **Clone**.
2. En el clon → ⋮ → **Edit**: nombre y slug de `1-PAGINA.txt`.
3. Abrir el clon → elemento **Custom HTML/JavaScript** → **Custom Code** → **Open Code Editor**.
4. Seleccionar todo, borrar y pegar `2-CODIGO-CUSTOM-HTML.html`. **Save**.
5. SEO: pegar los campos de `4-SEO-CAMPOS.txt`.
6. Settings → Tracking Code → HEADER: pegar `3-HEAD-SEO.html`.
7. **Publish** y abrir la URL publicada.

## Orden recomendado

Empieza por la **001** (`/blog`, la página maestra ya publicada) para confirmar el flujo con una sola landing, revísala en móvil y escritorio, y solo entonces sigue con la 002 en adelante.

## Índice y control

- `00-CHECKLIST.csv`: las 138 landings con nombre, slug, URL, título y carpeta. La última columna (`publicada`) se rellena a mano.

## Carpeta `sitio/`

No se pega en ninguna página: son los archivos del dominio para revisar que acompañen al blog.

- `robots.txt` — debe permitir `/blog/` y declarar los dos sitemaps.
- `sitemap-blog.xml` — las 138 URLs con `lastmod`.
- `llms-blog.txt` — índice para modelos (`/blog/llms.txt` en el dominio).
- `llms.txt` — índice raíz del sitio.
- `seo-blog.csv` — la hoja de metadatos de las 138 páginas.

## Avisos

- Pega el código **completo**: los embeds ya traen menú, pie, JSON-LD y el schema de navegación. No añadas header ni footer global en esa página.
- No pegues `3-HEAD-SEO.html` dentro del Custom HTML: duplicaría `<title>` y canonical.
- Los embeds de esta carpeta son la versión con el menú en una sola línea; las páginas ya publicadas conservan la versión anterior hasta que se vuelva a pegar.
- El archivo de cada landing pesa entre 40 y 120 KB: al pegarlo, espera a que el editor termine de guardar antes de publicar.
