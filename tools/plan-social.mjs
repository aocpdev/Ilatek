// Ilatek · plan de tarjetas sociales 1200×630.
// Reúne cada página publicada (home, limpieza, techos y las 118 del blog) con:
//   · el título real de su H1,
//   · una foto de fondo DEL SERVICIO que representa (no una genérica),
//   · la variante de color en ciclo estricto verde → blanca → azul.
//
// Salida: assets/social/plan.json (lo consume tools/build-social-cards.py y lo
// verifica tools/verify-social-cards.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { structure } from './site-paths.mjs';
import { TECHOS_IMG } from '../techos/lib/kit.mjs';
import { cardImage } from '../blog/build/card-images.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'assets', 'social');
const SITE = 'https://ilatekpr.com';
const CDN = 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/social/';
const VARIANTS = ['green', 'white', 'blue'];

const decode = (s = '') => String(s)
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

const clip = (s, max = 118) => {
  const t = decode(s).replace(/\{\{\s*custom_values\.[a-z_]+\s*\}\}/gi, 'Puerto Rico');
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, '').replace(/[.,;:]$/, '');
};

const cleanTitle = (raw) => {
  let t = decode(raw).replace(/\{\{\s*custom_values\.[a-z_]+\s*\}\}/gi, 'Puerto Rico');
  t = t.replace(/\s*\|\s*Ilatek[^|]*$/i, '').replace(/\s+/g, ' ').trim();
  t = t.replace(/\b(vs|dr|dra|sr|sra|no|etc|aprox)\./gi, '$1');
  t = t.split(/(?<=[.!?])\s/)[0].replace(/[.\s]+$/, '');
  if (t.length > 54) {
    const cut = t.search(/\s(?:para|que|con|sin|cuando|mientras|donde|porque)\s/i);
    if (cut > 18) t = t.slice(0, cut);
  }
  if (t.length > 66) t = t.slice(0, 66).replace(/\s+\S*$/, '');
  return t.replace(/[.,;:\s]+$/, '');
};

const first = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1]) : '';
};

const blockOf = (text, slug) => {
  const start = text.indexOf(`<!-- ▼▼ /${slug} ▼▼ -->`);
  if (start < 0) return '';
  const end = text.indexOf(`<!-- ▲▲ fin /${slug} ▼▼ -->`, start);
  const end2 = text.indexOf(`<!-- ▲▲ fin /${slug} ▲▲ -->`, start);
  const stop = end2 >= 0 ? end2 : end;
  return text.slice(start, stop < 0 ? undefined : stop);
};
const metaIn = (text, key) =>
  first(text, new RegExp(`<meta\\s+(?:property|name)=["']${key}["']\\s+content=["']([\\s\\S]*?)["']`, 'i')) ||
  first(text, new RegExp(`<meta\\s+content=["']([\\s\\S]*?)["']\\s+(?:property|name)=["']${key}["']`, 'i'));
const titleIn = (text) => first(text, /<title\b[^>]*>([\s\S]*?)<\/title>/i);

const pageHead = (rel) => {
  const f = path.join(ROOT, rel);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
};
const TECHOS_HEAD = pageHead('techos/ghl-techos-head-seo.html');
const LIMPIEZA_HEAD = pageHead('documentacion/seo/limpieza-head-original.html');

const altOf = (title) => (title.includes('Ilatek') ? `${title} — Puerto Rico` : `${title} — Ilatek`);

const kickerOf = (slug, file) => {
  if (slug.startsWith('blog/')) return 'Blog Ilatek';
  if (slug === 'home') return 'Ilatek';
  if (slug === 'servicios') return 'Servicios';
  if (file.includes('techos') || /^(sellado|techo|membrana|gotera|canaleta|tragalu|impermeabiliz|recubrimiento|reparacion|inspeccion|mantenimiento|limpieza-de-techos|lavado-a-presion-techos|empozamiento|instalacion)/.test(slug)) return 'Techos';
  return 'Limpieza';
};

// ── Foto de fondo: archivo local del servicio cuando exista ──────────────────
const local = (rel) => (fs.existsSync(path.join(ROOT, rel)) ? rel : '');
function resolvePhoto(url) {
  if (!url) return '';
  const clean = String(url).split('?')[0];
  // Copia local dentro del repo (jsDelivr / raw.githubusercontent / ruta relativa).
  const m = clean.match(/\/assets\/(.+)$/);
  if (m) {
    const rel = 'assets/' + m[1];
    if (local(rel)) return rel;
  }
  // Foto de GHL: assets/optimized/techos/<media-id>.webp
  const id = (clean.match(/media\/([a-f0-9]{24})\./) || [])[1];
  if (id) {
    const rel = `assets/optimized/techos/${id}.webp`;
    if (local(rel)) return rel;
  }
  return /^https?:/.test(clean) ? clean : '';
}

function landingPhoto(html, slug) {
  // Techos: la foto de hero del propio servicio (sin rótulo incrustado).
  if (TECHOS_IMG[slug]?.hero) {
    const p = resolvePhoto(TECHOS_IMG[slug].hero);
    if (p) return p;
  }
  // Limpieza / home / servicios: su foto social propia, que ya es del servicio
  // (el rótulo inferior queda tapado por la tarjeta).
  const social = `assets/optimized/social/${slug}.jpg`;
  if (local(social)) return social;
  // Primera foto de servicio de la propia landing (sin logo ni iconos).
  for (const m of html.matchAll(/<img\b[^>]*src="([^"]+)"/gi)) {
    const src = m[1];
    if (!/assets\/|filesafe|leadconnectorhq/i.test(src)) continue;
    if (/logo|icon|favicon|sprite/i.test(src)) continue;
    const p = resolvePhoto(src);
    if (p) return p;
  }
  return 'assets/optimized/techos/6ac8583f195f9172ed03ad7b.webp';
}

const cards = [];

// ——— 1. Blog ———
const indice = JSON.parse(fs.readFileSync(path.join(ROOT, 'blog', 'indice.json'), 'utf8'));
for (const p of indice.paginas) {
  const name = p.path === '/blog' ? 'blog-home' : 'blog-' + p.path.replace(/^\/blog\//, '').replace(/\//g, '-');
  const title = cleanTitle(String(p.title).replace(/\s*\|\s*Ilatek\s*$/i, ''));
  const esHome = p.path === '/blog';
  // El home del blog usa la foto del equipo de la home (la misma del hero),
  // no una foto de techo: es la portada del archivo completo.
  const photo = esHome
    ? local('assets/optimized/social/blog-home.jpg')
    : resolvePhoto(cardImage({ slug: p.path.replace(/^\/blog\//, ''), h1: title, grupo: p.grupo, familia: p.cluster, meta: p.keyword }).src);
  cards.push({
    name,
    path: p.path,
    url: SITE + p.path,
    title,
    subtitle: clip(p.description, 118),
    kicker: esHome ? 'Blog' : 'Blog Ilatek',
    alt: altOf(title),
    bg: photo || 'assets/optimized/techos/6ac8583f195f9172ed03ad7b.webp',
    source: 'blog/' + p.file,
    head: 'blog/embeds/head-seo.html',
    headBlock: p.path,
    card: `assets/social/${name}-1200.webp`,
  });
}

// ——— 2. Landings ———
for (const page of structure.pages) {
  const file = path.join(ROOT, page.file);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const slug = page.slug;
  const techosBlock = blockOf(TECHOS_HEAD, slug);
  const limpiezaBlock = blockOf(LIMPIEZA_HEAD, slug);
  const headText = techosBlock || limpiezaBlock || html;
  const headFile = techosBlock ? 'techos/ghl-techos-head-seo.html'
    : (limpiezaBlock ? 'documentacion/seo/limpieza-head-original.html' : page.file);
  const h1 = first(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title = cleanTitle(h1 || titleIn(headText) || titleIn(html));
  if (!title) continue;
  const desc = metaIn(headText, 'description') || metaIn(html, 'description');
  cards.push({
    name: slug,
    path: '/' + slug,
    url: SITE + '/' + slug,
    title,
    subtitle: clip(desc, 118),
    kicker: kickerOf(slug, page.file),
    alt: altOf(title),
    bg: landingPhoto(html, slug),
    source: page.file,
    head: headFile,
    headBlock: '/' + slug,
    card: `assets/social/${slug}-1200.webp`,
  });
}

const seen = new Set();
const unique = cards.filter((c) => (seen.has(c.name) ? false : (seen.add(c.name), true)));
unique.sort((a, b) => (a.path === '/blog' ? -1 : b.path === '/blog' ? 1 : a.path.localeCompare(b.path)));
unique.forEach((c, i) => { c.variant = VARIANTS[i % 3]; });

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify({
  generado: new Date().toISOString(),
  size: { width: 1200, height: 630 },
  cdn: CDN,
  total: unique.length,
  cards: unique,
}, null, 2) + '\n', 'utf8');

const byVariant = unique.reduce((a, c) => ((a[c.variant] = (a[c.variant] || 0) + 1), a), {});
const missingBg = unique.filter((c) => !c.bg || !fs.existsSync(path.join(ROOT, c.bg)) && /^assets\//.test(c.bg)).length;
console.log(`Plan social: ${unique.length} tarjetas (${Object.entries(byVariant).map(([k, v]) => `${k}=${v}`).join(' · ')}) · fondos locales faltantes: ${missingBg}`);
