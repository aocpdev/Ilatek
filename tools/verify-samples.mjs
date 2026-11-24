// Verificación de muestra: money, 5 landings, familia, 2 marca, 2 intención.
// Comprueba 1 solo H1 y que cada enlace interno tenga archivo destino real.
import fs from 'node:fs';
import path from 'node:path';

const rows = JSON.parse(fs.readFileSync('documentacion/seo/auditoria-grafo-enlaces.json', 'utf8')).rows;
const byUrl = new Map(rows.map((r) => [r.url, r.file]));
const posts = JSON.parse(fs.readFileSync('blog/data/posts.json', 'utf8'));
const list = Array.isArray(posts) ? posts : posts.posts;

const blogFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) blogFiles.push(p.replace(/\\/g, '/'));
  }
})('blog');
// Rutas que viven solo en GHL (no empaquetadas aquí y fuera del sitemap de 48).
const FUERA_DEL_SITEMAP = new Set([
  'cotizacion-techos', 'reclutamiento-empleo', 'reclutamiento-empleo-techos',
  'cotizacion', 'servicios-techos',
]);
const ALIAS_LOCAL = {
  home: 'home/es/landing-pages/ghl-home-multiservicios.html',
  garantia: 'garantia/ILATEK-Garantias.html',
  'politica-de-privacidad': 'politica-de-privacidad/ILATEK-Politica-Privacidad.html',
  'terminos-y-condiciones': 'terminos-y-condiciones/ILATEK-Terminos-Condiciones.html',
};
const BLOG_HUB = {
  comparativas: 'blog/02-comparativas/index.html',
  'preguntas-frecuentes': 'blog/01-preguntas-frecuentes/index.html',
  'comunidades-y-servicios': 'blog/03-comunidades-servicios/index.html',
};
const blogResolves = (href) => {
  const slug = href.replace(/^blog\/?/, '').replace(/\/$/, '');
  if (!slug) return fs.existsSync('blog/index.html');
  if (BLOG_HUB[slug]) return fs.existsSync(BLOG_HUB[slug]);
  const tail = slug.split('/').pop();
  return blogFiles.some((f) => f.includes('/' + slug + '/') || path.basename(f, '.html') === tail);
};

const group = (g, n = 2) => list.filter((p) => p.grupo === g).slice(n, n + 1).map((p) => p.slug);
const samples = [
  ['money', 'https://ilatekpr.com/'],
  ['landing silicona', 'https://ilatekpr.com/sellado-de-silicona'],
  ['landing membrana', 'https://ilatekpr.com/membrana-asfaltica'],
  ['landing elastomerico', 'https://ilatekpr.com/recubrimiento-elastomerico'],
  ['landing poliuretano', 'https://ilatekpr.com/sellado-de-poliuretano'],
  ['landing acrilico', 'https://ilatekpr.com/sellado-acrilico'],
];

let bad = 0;
const check = (label, file) => {
  if (!file || !fs.existsSync(file)) { console.log('FALTA', label, file); bad++; return; }
  const html = fs.readFileSync(file, 'utf8');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  const hrefs = [...new Set([...html.matchAll(/href="https:\/\/\{\{custom_values\.website_url\}\}\/([^"#?]+)"/g)].map((m) => m[1]))];
  const resolves = (raw) => {
    const h = raw.replace(/\/$/, '');
    if (ALIAS_LOCAL[h]) return fs.existsSync(ALIAS_LOCAL[h]);
    if (h.startsWith('blog')) return blogResolves(h);
    return !!byUrl.get('https://ilatekpr.com/' + h);
  };
  const missing = hrefs.filter((h) => !FUERA_DEL_SITEMAP.has(h.replace(/\/$/, '')) && !resolves(h));
  const landings = hrefs.filter((h) => /^(sellado-de-silicona|membrana-asfaltica|recubrimiento-elastomerico|sellado-de-poliuretano|sellado-acrilico)$/.test(h));
  console.log(`${label.padEnd(22)} h1:${h1} internos:${String(hrefs.length).padStart(3)} landings:${landings.length} sin-destino:${missing.length} ${missing.slice(0, 3).join(' ')}`);
  if (h1 !== 1 || missing.length) bad++;
};

for (const [label, url] of samples) check(label, byUrl.get(url));
check('familia', 'blog/02-comparativas/posts/' + group('familia', 0)[0] + '.html');
for (const [i, slug] of [...group('marca', 0), ...group('marca', 12)].entries()) check('marca ' + (i + 1), 'blog/02-comparativas/posts/' + slug + '.html');
for (const [i, slug] of [...group('intencion', 0), ...group('intencion', 20)].entries()) check('intencion ' + (i + 1), 'blog/02-comparativas/posts/' + slug + '.html');

console.log(bad ? `PROBLEMAS: ${bad}` : 'OK: 11 muestras con un solo H1 y todos los enlaces internos con destino real');
process.exit(bad ? 1 : 0);
