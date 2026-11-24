// Ilatek · localiza las imágenes de las páginas publicadas.
//
// Reglas (plan aprobado):
//  · Una imagen que apunta a una copia local (`assets/optimized/...`) y el
//    archivo existe, se deja como está.
//  · Una imagen externa (filesafe.space, leadconnectorhq) o sin copia local se
//    sustituye por una imagen local del servicio de esa página, con el título
//    del servicio en `alt`/`title`.
//  · Un `src` vacío o roto también se sustituye.
//  · Nunca se usa la tarjeta social/OG como imagen de la página.
//  · Toda imagen recibe `loading`, `decoding` y `width`/`height` cuando faltan.
//
// Uso:
//   node tools/localize-images.mjs                 informe
//   node tools/localize-images.mjs --apply         aplica el plan completo
//   node tools/localize-images.mjs --broken        solo src vacíos/rotos (HTTP != 200)
//   node tools/localize-images.mjs --broken --apply
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';
import { shellFiles } from './page-shell.mjs';

const APPLY = process.argv.includes('--apply');
const BROKEN_ONLY = process.argv.includes('--broken');
const JSdelivr = 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/';
const CACHE = path.join(ROOT, '.tmp-media-cache.json');

/* ---------- inventario de imágenes locales ---------- */
function walk(dir, out) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(webp|png|jpe?g)$/i.test(entry.name)) out.push(p.replace(/\\/g, '/'));
  }
  return out;
}
const LOCAL = walk(path.join(ROOT, 'assets/optimized'), [])
  .map((abs) => ({ abs, rel: abs.slice(abs.indexOf('assets/optimized')) }))
  .filter((f) => !f.rel.startsWith('assets/optimized/social/'));
const LOCAL_BY_NAME = new Map(LOCAL.map((f) => [path.parse(f.rel).name, f]));
const FAMILY = {
  techos: LOCAL.filter((f) => f.rel.includes('/techos/')),
  // Solo fotos de servicio: nada de retratos, blog ni tarjetas sociales.
  limpieza: LOCAL.filter((f) => !f.rel.includes('/techos/') && /\/(svc-|limpieza-|conocenos-)/.test(f.rel)),
};

/* ---------- dimensiones sin dependencias ---------- */
function webpSize(buf) {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  const fmt = buf.toString('ascii', 12, 16);
  if (fmt === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (fmt === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (fmt === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  return null;
}
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}
const sizeCache = new Map();
function localSize(rel) {
  if (sizeCache.has(rel)) return sizeCache.get(rel);
  let size = null;
  try {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    size = webpSize(buf) || pngSize(buf) || jpegSize(buf);
  } catch { size = null; }
  sizeCache.set(rel, size);
  return size;
}

/* ---------- disponibilidad de URLs externas ---------- */
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
async function reachable(url) {
  if (cache[url] !== undefined) return cache[url];
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
    cache[url] = res.status >= 200 && res.status < 400;
  } catch {
    cache[url] = false;
  }
  return cache[url];
}

/* ---------- utilidades de marcado ---------- */
const strip = (s) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const localToUrl = (rel) => JSdelivr + encodeURI(rel);

function pageFamily(file) {
  return /(^|\/)(categorias\/techos|servicios\/techos|techos|techos-)/.test(file) || /techos/.test(file)
    ? 'techos'
    : 'limpieza';
}
function pageTitle(html) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title = h1 ? strip(h1[1]) : '';
  return title || 'Servicio de Ilatek Property Solution';
}

function resolve(src) {
  if (!src) return { keep: false, rel: null };
  if (/^data:/i.test(src) || src.includes("+esc(")) return { keep: true, rel: null };
  const m = src.match(/^https:\/\/cdn\.jsdelivr\.net\/gh\/aocpdev\/Ilatek@main\/(.+)$/);
  if (m) {
    const rel = decodeURI(m[1]);
    return { keep: fs.existsSync(path.join(ROOT, rel)), rel };
  }
  return { keep: false, rel: null };
}

function pickImage(family, index) {
  const pool = FAMILY[family].length ? FAMILY[family] : LOCAL;
  // Evita repetir la misma imagen dentro de la misma página: rota por familia.
  return pool[index % pool.length];
}

/* ---------- lectura de páginas ---------- */
const pages = [];
const externals = new Set();
for (const file of shellFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  if (!tags.length) continue;
  pages.push({ file, html, tags, family: pageFamily(file), title: pageTitle(html) });
  for (const tag of tags) {
    const src = (tag.match(/\bsrc="([^"]*)"/i) || [, ''])[1];
    if (!src || resolve(src).keep) continue;
    externals.add(src);
  }
}

/* ---------- comprobación de URLs (solo en modo --broken) ---------- */
if (BROKEN_ONLY) {
  const list = [...externals];
  const queue = list.filter((u) => cache[u] === undefined);
  let cursor = 0;
  const worker = async () => {
    while (cursor < queue.length) {
      const url = queue[cursor++];
      await reachable(url);
    }
  };
  await Promise.all(Array.from({ length: 10 }, worker));
}

/* ---------- proceso ---------- */
const stats = { pages: 0, imgs: 0, kept: 0, replaced: 0, attrs: 0, samples: [] };

for (const page of pages) {
  const { file, html, tags, family, title } = page;
  let index = 0;
  stats.pages++;
  const decisions = [];
  for (const tag of tags) {
    const src = (tag.match(/\bsrc="([^"]*)"/i) || [, ''])[1];
    stats.imgs++;
    const { keep } = resolve(src);
    if (keep) { stats.kept++; continue; }
    if (BROKEN_ONLY && src && cache[src] !== false) { stats.kept++; continue; }
    decisions.push({ tag, src, pick: pickImage(family, index++), title });
  }
  if (!decisions.length) continue;
  let next = html;
  for (const d of decisions) {
    let rebuilt = d.tag;
    rebuilt = rebuilt.replace(/\bsrc="[^"]*"/i, `src="${localToUrl(d.pick.rel)}"`);
    const alt = `alt="${escAttr(d.title)}"`;
    if (/\balt="[^"]*"/i.test(rebuilt)) rebuilt = rebuilt.replace(/\balt="[^"]*"/i, alt);
    else rebuilt = rebuilt.replace(/<img\b/i, `<img ${alt}`);
    if (/\btitle="[^"]*"/i.test(rebuilt)) rebuilt = rebuilt.replace(/\btitle="[^"]*"/i, `title="${escAttr(d.title)}"`);
    const size = localSize(d.pick.rel);
    if (size && !/\bwidth=/i.test(rebuilt)) rebuilt = rebuilt.replace(/<img\b/i, `<img width="${size.width}" height="${size.height}"`);
    if (!/\bdecoding=/i.test(rebuilt)) rebuilt = rebuilt.replace(/<img\b/i, '<img decoding="async"');
    if (!/\bloading=/i.test(rebuilt)) rebuilt = rebuilt.replace(/<img\b/i, '<img loading="lazy"');
    if (rebuilt === d.tag) continue;
    next = next.replace(d.tag, rebuilt);
    stats.replaced++;
    stats.attrs++;
    if (stats.samples.length < 4) stats.samples.push({ file, from: d.src.slice(0, 90), to: d.pick.rel });
  }
  // Segunda pasada: carga diferida, decodificación asíncrona y tamaño real para
  // no perder rendimiento ni CLS (el hero se queda en carga inmediata).
  let seen = 0;
  next = next.replace(/<img\b[^>]*>/gi, (tag) => {
    let out = tag;
    const src = (tag.match(/\bsrc="([^"]*)"/i) || [, ''])[1];
    const hero = /fetchpriority="high"/i.test(tag) || seen < 3;
    seen++;
    if (!/\bdecoding=/i.test(out)) out = out.replace(/<img\b/i, '<img decoding="async"');
    if (!/\bloading=/i.test(out)) out = out.replace(/<img\b/i, `<img loading="${hero ? 'eager' : 'lazy'}"`);
    if (!/\bwidth=/i.test(out)) {
      const rel = resolve(src).rel;
      const size = rel ? localSize(rel) : null;
      if (size) out = out.replace(/<img\b/i, `<img width="${size.width}" height="${size.height}"`);
    }
    if (out !== tag) stats.attrs++;
    return out;
  });
  if (next !== html && APPLY) fs.writeFileSync(path.join(ROOT, file), next);
}
fs.writeFileSync(CACHE, JSON.stringify(cache, null, 0));

console.log(JSON.stringify({
  modo: BROKEN_ONLY ? 'solo-rotas' : 'plan-completo',
  aplicado: APPLY,
  paginas: stats.pages,
  imagenes: stats.imgs,
  conservadas: stats.kept,
  sustituidas: stats.replaced,
  urlsVerificadas: Object.keys(cache).length,
}, null, 2));
for (const s of stats.samples) console.log('  ·', s.file, '|', s.from, '→', s.to);
