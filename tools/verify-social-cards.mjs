// Ilatek · verifica las tarjetas sociales 1200×630 de todo el sitio.
// Falla si: falta una tarjeta del plan, el WebP no mide 1200×630, el HEAD de la
// página no apunta a su tarjeta, o faltan width/height/alt/twitter:card.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/social/plan.json'), 'utf8'));
// El HEAD SEO no puede servir la tarjeta desde jsDelivr (este repo da 404 ahí),
// así que cada tarjeta se publica en la Media Library de GHL y el mapa de
// subidas es la fuente de verdad de la URL que debe llevar el bloque.
const CDN = 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/';
const MEDIA = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'blog/data/ghl-media.json'), 'utf8')).files || {};
  } catch {
    return {};
  }
})();

let failures = 0;
const fail = (slug, msg) => { failures++; console.error(`✗ ${slug}: ${msg}`); };

// Medidas del WebP sin dependencias: VP8 (con pérdida), VP8L y VP8X.
function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (kind === 'VP8L') {
    const bits = buf.subarray(21, 25).readUInt32LE(0);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === 'VP8X') {
    const w = buf[24] | (buf[25] << 8) | (buf[26] << 16);
    const h = buf[27] | (buf[28] << 8) | (buf[29] << 16);
    return { width: w + 1, height: h + 1 };
  }
  return null;
}

const blockOf = (text, slug) => {
  const esc = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`<!-- ▼▼ ${esc}(?: ·[^\\n]*)? ▼▼ -->`).exec(text);
  if (!m) return '';
  const endMark = `<!-- ▲▲ fin ${slug} ▲▲ -->`;
  const end = text.indexOf(endMark, m.index);
  return text.slice(m.index, end < 0 ? undefined : end);
};

for (const card of plan.cards) {
  const file = path.join(ROOT, card.card);
  if (!fs.existsSync(file)) { fail(card.name, `falta ${card.card}`); continue; }
  const size = webpSize(fs.readFileSync(file));
  if (!size) fail(card.name, 'no es un WebP válido');
  else if (size.width !== 1200 || size.height !== 630) fail(card.name, `mide ${size.width}×${size.height}`);

  const headPath = path.join(ROOT, card.head);
  if (!fs.existsSync(headPath)) { fail(card.name, `falta el HEAD ${card.head}`); continue; }
  const text = fs.readFileSync(headPath, 'utf8');
  const block = blockOf(text, card.headBlock) || text;

  // Dos rutas válidas para la MISMA tarjeta: la copia publicada en GHL (la que
  // sirve el blog) y el CDN del repo (la que usan las landings). Cualquier otra
  // URL, o la tarjeta de otra página, sigue siendo fallo.
  const allowed = new Set([MEDIA[card.card]?.url, CDN + card.card].filter(Boolean));
  const og = [...block.matchAll(/<meta\s+property=["']og:image["'][^>]*content=["']([^"']+)["']/gi)].map((m) => m[1]);
  if (og.length !== 1) fail(card.name, `${og.length} og:image (debe ser 1)`);
  else if (!allowed.has(og[0])) fail(card.name, `og:image no es la tarjeta (${og[0]})`);
  const tw = (/<meta\s+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i.exec(block) || [])[1];
  if (!allowed.has(tw)) fail(card.name, 'twitter:image no apunta a la tarjeta');
  if (!/<meta\s+property=["']og:image:width["']\s+content=["']1200["']/i.test(block)) fail(card.name, 'falta og:image:width 1200');
  if (!/<meta\s+property=["']og:image:height["']\s+content=["']630["']/i.test(block)) fail(card.name, 'falta og:image:height 630');
  const alt = (/<meta\s+property=["']og:image:alt["']\s+content=["']([^"']+)["']/i.exec(block) || [])[1];
  if (!alt || alt.length < 12) fail(card.name, 'og:image:alt vacío o corto');
  if (!/<meta\s+name=["']twitter:card["']\s+content=["']summary_large_image["']/i.test(block)) fail(card.name, 'falta twitter:card');
}

const names = plan.cards.map((c) => c.name);
const dup = names.filter((n, i) => names.indexOf(n) !== i);
if (dup.length) { failures++; console.error('✗ tarjetas duplicadas:', dup.slice(0, 5).join(', ')); }

console.log(`\nTarjetas sociales: ${plan.cards.length} páginas · fallos: ${failures}`);
console.log(`  WebP 1200×630 existentes: ${plan.cards.filter((c) => fs.existsSync(path.join(ROOT, c.card))).length}/${plan.cards.length}`);
if (failures) process.exitCode = 1;
else console.log('✓ OK: cada página tiene tarjeta propia y su HEAD apunta a ella.');
