// Ilatek · capa de rendimiento global (idempotente y con guardia de SEO).
//
// Aplica a TODAS las páginas publicables los arreglos que PageSpeed mide y que
// no dependen del contenido:
//   · preconnect: si el archivo tiene más de 3, deja solo los tres orígenes que
//     importan, aunque estén repartidos en varios bloques del documento.
//   · imágenes: decoding=async; la primera imagen real en eager +
//     fetchpriority=high; el resto en lazy. Nunca toca URLs ni srcset.
//   · iframes de terceros (reseñas, agenda, vídeo): loading=lazy.
//   · Google Fonts: display=swap y sin etiquetas duplicadas.
//
// Reglas de seguridad:
//   · Solo se transforma el marcado: el interior de <script> y <style> no se toca.
//   · Antes de escribir se compara la firma SEO (title, canonical, description,
//     robots, h1, número de h2, JSON-LD, todos los href, src de img e iframe).
//     Si difiere, el archivo se aborta: el SEO programático no se rompe.
//
// Uso:
//   node tools/perf-global.mjs --check
//   node tools/perf-global.mjs --write
//   node tools/perf-global.mjs --check --roots=techos,servicios
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (name) => argv.some((a) => a === `--${name}`);
const value = (name, def) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
};
const WRITE = flag('write');
const SAMPLE = flag('sample');
const ROOTS = value(
  'roots',
  'techos,servicios,categorias,home,Comunidades/landings,blog,resenas,garantia,politica-de-privacidad,terminos-y-condiciones,componentes,ilatek-municipios'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const KEEP_PRECONNECT = [
  { href: 'https://fonts.gstatic.com', crossorigin: true },
  { href: 'https://cdn.jsdelivr.net', crossorigin: false },
  { href: 'https://assets.cdn.filesafe.space', crossorigin: false },
];
const THIRD_PARTY_IFRAME = /reputationhub|msgsndr|leadconnectorhq\.com\/widget|youtube\.com\/embed|google\.com\/maps/i;
const CODE_BLOCK = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const PRECONNECT_TAG = /<link\b[^>]*rel=["']preconnect["'][^>]*>/gi;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(p, out);
    } else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Ejecuta fn solo sobre el marcado; <script> y <style> pasan intactos.
function mapMarkup(html, fn) {
  let out = '';
  let last = 0;
  let m;
  CODE_BLOCK.lastIndex = 0;
  while ((m = CODE_BLOCK.exec(html))) {
    out += fn(html.slice(last, m.index)) + m[0];
    last = CODE_BLOCK.lastIndex;
  }
  return out + fn(html.slice(last));
}

const markupOf = (html) => html.replace(CODE_BLOCK, ' ');

function seoSignature(html) {
  const markup = markupOf(html);
  const ld = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) =>
    m[1].replace(/\s+/g, '')
  );
  const pick = (re) => [...markup.matchAll(re)].map((m) => m[1].replace(/\s+/g, ' ').trim());
  const payload = {
    title: pick(/<title[^>]*>([\s\S]*?)<\/title>/gi),
    canonical: pick(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)/gi).concat(
      pick(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/gi)
    ),
    description: pick(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)/gi),
    robots: pick(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)/gi),
    h1: pick(/<h1[^>]*>([\s\S]*?)<\/h1>/gi),
    h2Count: pick(/<h2[^>]*>([\s\S]*?)<\/h2>/gi).length,
    ld,
    links: pick(/<a[^>]+href=["']([^"']+)["']/gi).sort(),
    imgs: pick(/<img[^>]+src=["']([^"']+)["']/gi),
    iframes: pick(/<iframe[^>]+src=["']([^"']+)["']/gi),
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

// ——— transformaciones ———
function fixPreconnect(html, stats) {
  const total = (markupOf(html).match(PRECONNECT_TAG) || []).length;
  if (total <= 3) return html;
  let removed = 0;
  let inserted = false;
  const block = KEEP_PRECONNECT.map(
    (p) => `<link rel="preconnect" href="${p.href}"${p.crossorigin ? ' crossorigin' : ''}>`
  ).join('\n');
  const out = mapMarkup(html, (markup) => {
    const tags = [...markup.matchAll(PRECONNECT_TAG)];
    if (!tags.length) return markup;
    let m = markup;
    for (const t of tags) m = m.replace(t[0], '');
    if (!inserted) {
      inserted = true;
      m = m.slice(0, tags[0].index) + block + '\n' + m.slice(tags[0].index);
    }
    removed += tags.length;
    return m;
  });
  stats.preconnect = (stats.preconnect || 0) + Math.max(0, removed - KEEP_PRECONNECT.length);
  return out;
}

function fixFonts(html, stats) {
  let changed = 0;
  const seen = new Set();
  const out = mapMarkup(html, (markup) =>
    markup.replace(/<link\b[^>]*href=["'](https:\/\/fonts\.googleapis\.com\/css2?\?[^"']*)["'][^>]*>/gi, (tag, href) => {
      let h = href;
      if (!/display=/.test(h)) {
        h += '&display=swap';
        changed++;
      }
      if (seen.has(h)) {
        changed++;
        return '';
      }
      seen.add(h);
      return tag.replace(href, h);
    })
  );
  stats.fonts = (stats.fonts || 0) + changed;
  return out;
}

// Acepta atributos con comillas o sin ellas: loading=lazy y loading="lazy".
function setAttr(tag, name, val) {
  const quoted = new RegExp(`\\b${name}=["'][^"']*["']`, 'i');
  const bare = new RegExp(`\\b${name}=[^\\s">]+`, 'i');
  if (quoted.test(tag)) return tag.replace(quoted, `${name}="${val}"`);
  if (bare.test(tag)) return tag.replace(bare, `${name}="${val}"`);
  return tag.replace(/<img\b/i, `<img ${name}="${val}"`);
}

function fixImages(html, stats) {
  let first = true;
  let n = 0;
  const out = mapMarkup(html, (markup) =>
    markup.replace(/<img\b[^>]*>/gi, (tag) => {
      if (/src=["']?data:/i.test(tag)) return tag;
      let t = tag;
      const isFirst = first;
      if (isFirst) first = false;
      if (!/\bdecoding=/i.test(t)) t = t.replace(/<img\b/i, '<img decoding="async"');
      if (isFirst) {
        t = setAttr(t, 'loading', 'eager');
        if (!/\bfetchpriority=/i.test(t)) t = t.replace(/<img\b/i, '<img fetchpriority="high"');
      } else if (!/\bloading=/i.test(t)) {
        t = setAttr(t, 'loading', 'lazy');
      }
      if (t !== tag) n++;
      return t;
    })
  );
  stats.img = (stats.img || 0) + n;
  return out;
}

function fixIframes(html, stats) {
  let n = 0;
  const out = mapMarkup(html, (markup) =>
    markup.replace(/<iframe\b[^>]*>/gi, (tag) => {
      if (!THIRD_PARTY_IFRAME.test(tag) || /\bloading=/i.test(tag)) return tag;
      n++;
      return tag.replace(/<iframe\b/i, '<iframe loading="lazy"');
    })
  );
  stats.iframe = (stats.iframe || 0) + n;
  return out;
}

function transform(html) {
  const stats = {};
  let out = fixPreconnect(html, stats);
  out = fixFonts(out, stats);
  out = fixImages(out, stats);
  out = fixIframes(out, stats);
  return { html: out, stats };
}

// ——— recorrido ———
const files = ROOTS.flatMap((r) => walk(path.resolve(ROOT, r)));
const totals = { files: 0, changed: 0, skipped: 0, preconnect: 0, fonts: 0, img: 0, iframe: 0 };
const broken = [];

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const { html: next, stats } = transform(html);
  totals.files++;
  if (next === html) continue;
  if (seoSignature(html) !== seoSignature(next)) {
    totals.skipped++;
    broken.push(path.relative(ROOT, f));
    continue;
  }
  totals.changed++;
  for (const k of ['preconnect', 'fonts', 'img', 'iframe']) totals[k] += stats[k] || 0;
  if (SAMPLE && totals.changed <= 3) console.log(`• ${path.relative(ROOT, f)} → ${JSON.stringify(stats)}`);
  if (WRITE) fs.writeFileSync(f, next, 'utf8');
}

console.log(
  `${WRITE ? '✓ aplicado' : '· simulación'} · archivos=${totals.files} cambiados=${totals.changed} ` +
    `preconnect=${totals.preconnect} fonts=${totals.fonts} imgs=${totals.img} iframes=${totals.iframe}`
);
if (totals.skipped) {
  console.error(`✗ ${totals.skipped} archivo(s) abortados por la guardia de SEO:`);
  broken.slice(0, 10).forEach((b) => console.error('  - ' + b));
  process.exit(1);
}
