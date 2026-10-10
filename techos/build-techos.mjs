// Ilatek · Techos · build: genera las 34 landings + artefactos SEO y VALIDA
// que no se publique copy de limpieza ni falte schema. Uso:
//   node Ilatek/techos/build-techos.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPage } from './lib/page.mjs';
import { buildTree } from './lib/model.mjs';
import { validateModel, auditHtml } from './lib/audit.mjs';
import { UPDATED } from './lib/data/build.mjs';
import { pageFile, projectPath } from '../tools/site-paths.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const ILATEK = path.resolve(OUT, '..');
const TODAY = UPDATED;

export const pages = buildTree();

// La política de contenido/schema vive en lib/audit.mjs (dueño único).

// ─────────────────────────── generación ───────────────────────────
let failures = 0;
const fail = (slug, errs) => { failures++; console.error(`✗ ${slug}: ${errs.join(' | ')}`); };

const written = [];
pages.forEach((p) => {
  const modelErrs = validateModel(p);
  if (modelErrs.length) fail(p.slug, modelErrs);
  const html = buildPage(p);
  const htmlErrs = auditHtml(p, html);
  if (htmlErrs.length) fail(p.slug, htmlErrs);
  const file = pageFile(p.slug);
  // GHL sirve los embeds sin header Content-Type con charset: sin esta declaración el
  // navegador adivina latin-1 y los acentos se pintan como "ReparaciÃ³n". El contrato
  // de internal-links reinyecta su bloque AL FRENTE del embed; el charset va justo
  // detrás de él (sigue dentro de los primeros 1024 bytes, la detección del
  // navegador no cambia) y el verifier de idempotencia se queda estable.
  const withCharset = html.replace(/<meta charset="utf-8">\n?/, '')
    // El bloque de internal-links se reinyecta AL FRENTE por el contrato de
    // enlaces (formatPage): el charset va justo detrás de él, dentro de los
    // primeros 1024 bytes, para que la detección del navegador no cambie.
    .replace('<!-- ILATEK:INTERNAL-LINKS:END -->\n', '<!-- ILATEK:INTERNAL-LINKS:END -->\n<meta charset="utf-8">\n');
  fs.writeFileSync(projectPath(file), withCharset, 'utf8');
  written.push({ slug: p.slug, role: p.role, bytes: Buffer.byteLength(html), file });
});

// ─────────────────────────── HEAD SEO ───────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const headSeo = [
  '<!-- ═══════════════════════════════════════════════════════════',
  '  ILATEK · Techos · Head SEO + AEO/GEO (title, meta description, robots,',
  '  canonical, Open Graph, Twitter y geo).',
  '  DÓNDE PEGAR: GHL → editar la página → Settings → Tracking Code → HEADER.',
  '  Pega SOLO el bloque ▼▼ del slug de ESA página. Cada bloque trae un único',
  '  link canonical activo: nunca pegues dos páginas en el mismo HEAD.',
  '═══════════════════════════════════════════════════════════ -->',
  '',
  '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
  '',
  ...pages.map((p) => {
    const url = 'https://{{custom_values.website_url}}/' + (p.slug === 'techos' ? 'home' : p.slug);
    const t = esc(p.metaTitle);
    const d = esc(p.metaDescription);
    const im = esc(p.hero.raw);
    return [
      '<!-- ▼▼ /' + p.slug + ' ▼▼ -->',
      '<title>' + t + '</title>',
      '<meta name="description" content="' + d + '">',
      '<link rel="canonical" href="' + url + '">',
      '<meta property="og:type" content="website">',
      '<meta property="og:locale" content="es_PR">',
      '<meta property="og:site_name" content="Ilatek Techos">',
      '<meta property="og:title" content="' + t + '">',
      '<meta property="og:description" content="' + d + '">',
      '<meta property="og:url" content="' + url + '">',
      '<meta property="og:image" content="' + im + '">',
      '<meta name="twitter:card" content="summary_large_image">',
      '<meta name="twitter:title" content="' + t + '">',
      '<meta name="twitter:description" content="' + d + '">',
      '<meta name="twitter:image" content="' + im + '">',
      '<meta name="geo.region" content="US-PR">',
      '<meta name="geo.placename" content="Puerto Rico">',
      '<!-- ▲▲ fin /' + p.slug + ' ▲▲ -->',
      '',
    ].join('\n');
  }),
].join('\n');
fs.writeFileSync(path.join(OUT, 'ghl-techos-head-seo.html'), headSeo, 'utf8');

// ─────────────────────────── Sitemap: fragmento + bloque en sitemap.xml ───────────────────────────
const urlEntries = pages.filter(function (p) { return p.role !== 'hub'; }).map(
  (p) => `  <url><loc>https://ilatekpr.com/${p.slug}</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>${p.role === 'hub' ? '0.9' : p.role === 'mother' ? '0.8' : '0.7'}</priority></url>`
);
fs.writeFileSync(path.join(OUT, 'techos-sitemap-fragment.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>\n`, 'utf8');

const mainSitemapPath = path.join(ILATEK, 'sitemap.xml');
const main = fs.readFileSync(mainSitemapPath, 'utf8');
const S = main.indexOf('<!-- TECHOS:START -->');
const E = main.indexOf('<!-- TECHOS:END -->');
if (S < 0 || E < 0 || E < S) {
  failures++;
  console.error('✗ sitemap.xml: faltan los marcadores TECHOS:START / TECHOS:END');
} else {
  const rebuilt = main.slice(0, S) + `<!-- TECHOS:START -->\n${urlEntries.join('\n')}\n  ` + main.slice(E);
  fs.writeFileSync(mainSitemapPath, rebuilt, 'utf8');
}

// ─────────────────────────── reporte ───────────────────────────
console.log(`\nIlatek Techos · ${written.length} páginas generadas en categorias/ y servicios/ (ver docs/estructura.json)`);
written.forEach((w) => console.log(`  ${String(w.role).padEnd(6)} /${w.slug.padEnd(38)} ${String(w.bytes).padStart(7)} B`));
const roles = written.reduce((a, w) => ((a[w.role] = (a[w.role] || 0) + 1), a), {});
console.log(`\nRoles: ${Object.entries(roles).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
console.log(`Fallos: ${failures}`);
if (failures) process.exitCode = 1;
