// Ilatek · Auditoría del grafo de enlaces internos.
// Comprueba que cada URL del sitemap tenga al menos un enlace entrante desde el
// cuerpo de otra página (se excluyen menú y pie, que son navegación global).
// Escribe documentacion/seo/auditoria-grafo-enlaces.md y falla si hay huérfanas.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';

const SITE = 'https://ilatekpr.com';
const OUT = path.join(ROOT, 'documentacion/seo/auditoria-grafo-enlaces.md');
const JSONOUT = path.join(ROOT, 'documentacion/seo/auditoria-grafo-enlaces.json');

// ——— 1. URL del sitemap → archivo local ———
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const FIXED = {
  [SITE + '/']: 'home/es/landing-pages/ghl-home-multiservicios.html',
  [SITE + '/resenas']: 'resenas/ghl-resenas-landing.html',
  [SITE + '/servicios']: 'categorias/servicios/es/landing-pages/ghl-servicios-landing.html',
  [SITE + '/garantia']: 'garantia/ILATEK-Garantias.html',
};
function fileFor(url) {
  if (FIXED[url] && fs.existsSync(path.join(ROOT, FIXED[url]))) return FIXED[url];
  const slug = url.replace(SITE + '/', '').replace(/\/$/, '');
  for (const dir of ['categorias', 'servicios', 'home']) {
    const candidate = `${dir}/${slug}/es/landing-pages/ghl-${slug}-landing.html`;
    if (fs.existsSync(path.join(ROOT, candidate))) return candidate;
  }
  return null;
}
const target = new Map(); // archivo → url
for (const url of urls) {
  const file = fileFor(url);
  if (file) target.set(file, url);
}

// ——— 2. Fuentes: cuerpo de las páginas publicadas (sin nav ni footer) ———
const DIRS = ['categorias', 'servicios', 'home', 'techos', 'blog', 'resenas'];
const sources = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'assets') continue;
      walk(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.html') && !/_preview|\.pre-/.test(entry.name)) {
      sources.push(path.relative(ROOT, path.join(dir, entry.name)).replace(/\\/g, '/'));
    }
  }
}
for (const d of DIRS) {
  const full = path.join(ROOT, d);
  if (fs.existsSync(full)) walk(full);
}

const stripShell = (html) => html
  .replace(/<section id="ilatek-nav"[\s\S]*?<\/section>/gi, ' ')
  .replace(/<footer id="ilatek-footer"[\s\S]*?<\/footer>/gi, ' ')
  .replace(/<nav[^>]*class="ilbn"[\s\S]*?<\/nav>/gi, ' ')
  .replace(/<footer[^>]*class="ilbf"[\s\S]*?<\/footer>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ');

// URL de cada archivo fuente (para evitar contar el autoenlace).
function urlOf(file) {
  if (file === 'home/es/landing-pages/ghl-home-multiservicios.html') return SITE + '/';
  if (file === 'resenas/ghl-resenas-landing.html') return SITE + '/resenas';
  const m = file.match(/^(?:categorias|servicios|home)\/([^/]+)\/es\/landing-pages\/ghl-/);
  if (m) return SITE + '/' + m[1];
  const b = file.match(/^blog\/(.+)\/index\.html$/);
  if (b) return SITE + '/blog/' + (b[1] === '' ? '' : b[1]);
  const bp = file.match(/^blog\/([^/]+)\/posts\/(.+)\.html$/);
  if (bp) return SITE + '/blog/' + bp[1] + '/' + bp[2];
  const bc = file.match(/^blog\/([^/]+)\/(.+)\.html$/);
  if (bc) return SITE + '/blog/' + bc[1] + '/' + bc[2];
  return null;
}

const inbound = new Map(urls.map((u) => [u, new Set()]));
const outbound = new Map();
for (const file of sources) {
  const html = stripShell(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  let self = urlOf(file);
  if (self === SITE + '/home') self = SITE + '/';
  const outs = new Set();
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    let href = m[1].replace(/&amp;/g, '&');
    // normaliza el token de GHL: las páginas servidas lo resuelven al dominio.
    href = href.replace(/^https?:\/\/\{\{[^}]+\}\}/, SITE).replace(/^\{\{[^}]+\}\}/, '');
    if (href.includes('{{') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('/')) href = SITE + href;
    if (!href.startsWith(SITE)) continue;
    href = href.split('#')[0].replace(/\/$/, '') || SITE;
    let norm = href === SITE ? SITE + '/' : href;
    // La home publica se enlaza como /home, pero el sitemap la declara como /.
    if (norm === SITE + '/home') norm = SITE + '/';
    if (!inbound.has(norm) || norm === self) continue;
    outs.add(norm);
    inbound.get(norm).add(file);
  }
  outbound.set(file, outs);
}

// ——— 3. Informe ———
const orphans = urls.filter((u) => (inbound.get(u) || new Set()).size === 0);
const rows = urls.map((u) => {
  const file = fileFor(u) || '';
  const inb = inbound.get(u) || new Set();
  const outs = (outbound.get(file) || new Set()).size;
  return { url: u, file: file || '', inbound: inb.size, outbound: outs, sources: [...inb].slice(0, 4) };
});
const sorted = [...rows].sort((a, b) => a.inbound - b.inbound);

const md = [
  '# Auditoría del grafo de enlaces internos',
  '',
  `Generado: ${new Date().toISOString().slice(0, 10)} · URLs del sitemap: ${urls.length} · Huérfanas: ${orphans.length}`,
  '',
  'Un enlace cuenta como entrante si aparece en el cuerpo de otra página del sitio;',
  'menú y pie se excluyen porque son navegación global.',
  '',
  '| URL | Archivo | Entrantes | Salientes |',
  '| --- | --- | --- | --- |',
  ...sorted.map((r) => `| ${r.url.replace(SITE, '') || '/'} | ${r.file} | ${r.inbound} | ${r.outbound} |`),
  '',
  '## Huérfanas',
  '',
  orphans.length ? orphans.map((u) => `- ${u}`).join('\n') : 'Ninguna.',
  '',
].join('\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
fs.writeFileSync(JSONOUT, JSON.stringify({ generated: new Date().toISOString(), urls: urls.length, orphans, rows: sorted }, null, 2) + '\n');

console.log(`Grafo: ${urls.length} URLs · ${sources.length} páginas fuente · huérfanas: ${orphans.length}`);
if (orphans.length) {
  console.error('Huérfanas:\n' + orphans.map((u) => '  - ' + u).join('\n'));
  process.exit(1);
}
console.log('OK: cada URL del sitemap tiene al menos un enlace entrante desde el cuerpo.');
