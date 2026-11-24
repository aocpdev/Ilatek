// Ilatek · Blog · genera GHL-PUBLICAR/: todo lo que se pega en GHL, una carpeta por landing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const BLOG = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'GHL-PUBLICAR');

const manifest = JSON.parse(fs.readFileSync(path.join(BLOG, 'embeds/paginas.json'), 'utf8'));
const indice = JSON.parse(fs.readFileSync(path.join(BLOG, 'indice.json'), 'utf8')).paginas;
const kw = new Map(indice.map((p) => [p.path, p.keyword || '']));

// Bloques HEAD: <!-- ▼▼ /ruta · Nombre ▼▼ -->
const headRaw = fs.readFileSync(path.join(BLOG, 'embeds/head-seo.html'), 'utf8');
const parts = headRaw.split(/<!-- ▼▼ (.+?) ▼▼ -->/);
const heads = new Map();
for (let i = 1; i < parts.length; i += 2) {
  const label = parts[i];
  heads.set(label.split(' · ')[0].trim(), parts[i + 1].trim());
}

const slugOf = (p) => (p === '/blog' ? 'blog' : p.replace(/^\/blog\//, '').replace(/\//g, '-'));
const pad = (n) => String(n).padStart(3, '0');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'por-pagina'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'sitio'), { recursive: true });

const rows = [];
let missingHead = 0, totalBytes = 0;
manifest.paginas.forEach((p, i) => {
  const n = i + 1;
  const dirName = pad(n) + '-' + slugOf(p.path);
  const dir = path.join(OUT, 'por-pagina', dirName);
  fs.mkdirSync(dir, { recursive: true });

  const embed = fs.readFileSync(path.join(ROOT, p.embed), 'utf8');
  totalBytes += Buffer.byteLength(embed);
  fs.writeFileSync(path.join(dir, '2-CODIGO-CUSTOM-HTML.html'), embed);

  const head = heads.get(p.path);
  if (!head) missingHead++;
  fs.writeFileSync(path.join(dir, '3-HEAD-SEO.html'), head || 'FALTA EL BLOQUE HEAD\n');

  fs.writeFileSync(
    path.join(dir, '1-PAGINA.txt'),
    [
      'PÁGINA EN GHL',
      'Nombre: ' + p.builder,
      'Slug: ' + p.path.replace(/^\//, ''),
      'URL final: ' + p.canonical,
      'Carpeta: por-pagina/' + dirName,
      '',
      'Orden dentro de la página:',
      '  1) Crear/clonar la página con ese nombre y ese slug.',
      '  2) Elemento Custom HTML/JavaScript → Custom Code → Open Code Editor →',
      '     borrar todo y pegar el contenido de 2-CODIGO-CUSTOM-HTML.html.',
      '  3) SEO de la página: campos de 4-SEO-CAMPOS.txt.',
      '  4) Settings → Tracking Code → HEADER: contenido de 3-HEAD-SEO.html.',
      '  5) Publicar y comprobar la URL.',
    ].join('\n') + '\n'
  );

  fs.writeFileSync(
    path.join(dir, '4-SEO-CAMPOS.txt'),
    [
      'CAMPOS DEL PANEL SEO (copiar y pegar uno por uno)',
      'Title: ' + p.title,
      'Description: ' + p.description,
      'Keywords: ' + (kw.get(p.path) || ''),
      'Social image: ' + p.ogImage,
      'Canonical: ' + p.canonical,
    ].join('\n') + '\n'
  );

  rows.push([n, p.builder, p.path.replace(/^\//, ''), p.canonical, p.title, dirName].join(';'));
});

fs.writeFileSync(
  path.join(OUT, '00-CHECKLIST.csv'),
  'n;nombre_en_ghl;slug;url;title;carpeta;publicada\n' +
    rows.map((r) => r + ';').join('\n') + '\n'
);

// Copias del sitio (no se pegan en la página): robots, sitemap, llms, CSV SEO.
const sitio = [
  ['robots.txt', path.join(ROOT, 'robots.txt')],
  ['sitemap-blog.xml', path.join(BLOG, 'sitemap-blog.xml')],
  ['llms-blog.txt', path.join(BLOG, 'llms.txt')],
  ['llms.txt', path.join(ROOT, 'llms.txt')],
  ['seo-blog.csv', path.join(BLOG, 'seo/seo-blog.csv')],
];
for (const [name, src] of sitio) if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, 'sitio', name));

const total = manifest.paginas.length;
fs.writeFileSync(
  path.join(OUT, 'LEEME.md'),
  [
    '# Qué pegar en GHL — Blog Ilatek (' + total + ' landings)',
    '',
    'Todo lo de esta carpeta está listo para copiar y pegar. Cada landing tiene su propia carpeta en `por-pagina/`.',
    '',
    '## Los cuatro archivos de cada landing',
    '',
    '| Archivo | Dónde va en GHL |',
    '|---|---|',
    '| `1-PAGINA.txt` | Nombre y slug al crear/clonar la página. Es una guía, no se pega. |',
    '| `2-CODIGO-CUSTOM-HTML.html` | Elemento **Custom HTML/JavaScript** → *Custom Code* → *Open Code Editor*. Borra lo que haya y pega esto entero. |',
    '| `3-HEAD-SEO.html` | **Settings → Tracking Code → HEADER**. No va dentro del Custom HTML. |',
    '| `4-SEO-CAMPOS.txt` | Panel **SEO** de la página: title, description, keywords, social image y canonical. |',
    '',
    '## Orden por landing',
    '',
    '1. Websites → **Blog - Home** → ⋮ → **Clone**.',
    '2. En el clon → ⋮ → **Edit**: nombre y slug de `1-PAGINA.txt`.',
    '3. Abrir el clon → elemento **Custom HTML/JavaScript** → **Custom Code** → **Open Code Editor**.',
    '4. Seleccionar todo, borrar y pegar `2-CODIGO-CUSTOM-HTML.html`. **Save**.',
    '5. SEO: pegar los campos de `4-SEO-CAMPOS.txt`.',
    '6. Settings → Tracking Code → HEADER: pegar `3-HEAD-SEO.html`.',
    '7. **Publish** y abrir la URL publicada.',
    '',
    '## Orden recomendado',
    '',
    'Empieza por la **001** (`/blog`, la página maestra ya publicada) para confirmar el flujo con una sola landing, revísala en móvil y escritorio, y solo entonces sigue con la 002 en adelante.',
    '',
    '## Índice y control',
    '',
    '- `00-CHECKLIST.csv`: las ' + total + ' landings con nombre, slug, URL, título y carpeta. La última columna (`publicada`) se rellena a mano.',
    '',
    '## Carpeta `sitio/`',
    '',
    'No se pega en ninguna página: son los archivos del dominio para revisar que acompañen al blog.',
    '',
    '- `robots.txt` — debe permitir `/blog/` y declarar los dos sitemaps.',
    '- `sitemap-blog.xml` — las ' + total + ' URLs con `lastmod`.',
    '- `llms-blog.txt` — índice para modelos (`/blog/llms.txt` en el dominio).',
    '- `llms.txt` — índice raíz del sitio.',
    '- `seo-blog.csv` — la hoja de metadatos de las ' + total + ' páginas.',
    '',
    '## Avisos',
    '',
    '- Pega el código **completo**: los embeds ya traen menú, pie, JSON-LD y el schema de navegación. No añadas header ni footer global en esa página.',
    '- No pegues `3-HEAD-SEO.html` dentro del Custom HTML: duplicaría `<title>` y canonical.',
    '- Los embeds de esta carpeta son la versión con el menú en una sola línea; las páginas ya publicadas conservan la versión anterior hasta que se vuelva a pegar.',
    '- El archivo de cada landing pesa entre 40 y 120 KB: al pegarlo, espera a que el editor termine de guardar antes de publicar.',
  ].join('\n') + '\n'
);

console.log('landings empaquetadas:', total);
console.log('carpetas:', fs.readdirSync(path.join(OUT, 'por-pagina')).length);
console.log('peso total de embeds:', (totalBytes / 1024 / 1024).toFixed(2), 'MB');
console.log('heads faltantes:', missingHead);
console.log('archivos en sitio/:', fs.readdirSync(path.join(OUT, 'sitio')).length);
