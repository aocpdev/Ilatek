/**
 * Construye la capa inglesa del blog: una copia EN por cada página ES, con el
 * menú traducido y su toggle ES/EN, hreflang recíproco, alt de imágenes en
 * inglés y el mismo schema (BlogPosting, FAQPage, BreadcrumbList…) en inglés.
 *
 * Dos fases: (1) traduce todo lo pendiente a una caché, (2) escribe las copias.
 *
 *   node build/build-blog-en.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, 'en/.lang-cache.json');
const API = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=es&tl=en&q=';
const SITE = 'https://{{custom_values.website_url}}';
const BLOCK = /<(p|li|h1|h2|h3|h4|h5|summary|dd|dt|td|th|caption|legend|label|figcaption|blockquote|button|option|a|span|strong|em|cite|small)\b[^>]*>[\s\S]*?<\/\1>/gi;
// Restos fuera de bloque: nodos de texto con marcas claras de español.
const ES_RES = /\b(de|del|la|las|los|una?|para|con|por|que|son|el|en el|más|según|desde|hasta|si|tu|su|sus|tiene|hay|también|pero|porque|cuando|donde|este|esta|estos|estas|al|le|les|nos|muy|sin|sobre|fue|ser|está|están)\b/gi;
const ES_RES_MIN = 2;
const ATTR = /\b(alt|title|aria-label|placeholder)="([^"]{2,})"/g;
const TEXT_KEYS = new Set(['name', 'headline', 'description', 'text', 'alternateName', 'caption',
  'keywords', 'abstract', 'title', 'slogan', 'disambiguatingDescription']);
const URL_KEYS = new Set(['@id', 'url', 'item', 'sameAs', 'contentUrl', 'embedUrl', 'image']);

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const enPath = (p) => (p === '/blog' ? '/blog/en' : p.startsWith('/blog/en') ? p : '/blog/en' + p.slice('/blog'.length));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (t) => t.replace(/\s+/g, ' ').trim();

/** Protege etiquetas y custom values para que el traductor no los toque. */
function protect(html) {
  const marks = [];
  const text = html.replace(/<[^>]+>|\{\{custom_values\.[a-z_]+\}\}/gi, (m) => {
    marks.push(m);
    return `Zq${marks.length - 1}Z`;
  });
  return { text, marks };
}
const restore = (s, marks) => s.replace(/Zq(\d+)Z/gi, (m, i) => (marks[Number(i)] !== undefined ? marks[Number(i)] : m));

async function requestBatch(lines, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(API + encodeURIComponent(lines.join('\n')), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(30000),
      });
      if (res.status === 429) throw new Error('HTTP 429');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const flat = Array.isArray(data) ? data.join('') : String(data ?? '');
      const out = flat.split('\n');
      if (out.length !== lines.length) throw new Error('lote ' + out.length + '/' + lines.length);
      return out.map((s) => s.trim());
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(1200 * (i + 1));
    }
  }
}

// ── fase 1 · cola de traducción ─────────────────────────────────────────────
const indice = JSON.parse(fs.readFileSync(path.join(ROOT, 'indice.json'), 'utf8')).paginas;
const esPages = indice.filter((p) => !p.path.startsWith('/blog/en'));

function unitsOf(page) {
  const raw = fs.readFileSync(path.join(ROOT, page.file), 'utf8');
  const html = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const units = new Set();
  for (const m of html.matchAll(BLOCK)) {
    const inner = /^<[^>]+>([\s\S]*)<\/[a-z0-9]+>$/i.exec(m[0])?.[1] ?? '';
    const { text } = protect(inner);
    if (/[a-záéíóúñ]{2}/i.test(text)) units.add(norm(text));
  }
  for (const m of html.matchAll(ATTR)) if (/[a-záéíóúñ]{2}/i.test(m[2])) units.add(norm(m[2]));
  // nodos de texto sueltos que igual llevan español (caption, leyendas, spans)
  for (const m of html.matchAll(/>([^<]{6,})</g)) {
    const t = m[1].trim();
    if (!/[a-záéíóúñ]/i.test(t)) continue;
    if ((t.match(ES_RES) || []).length < ES_RES_MIN) continue;
    units.add(norm(t));
  }
  for (const m of raw.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (v, k) => {
        if (Array.isArray(v)) return v.forEach((x) => walk(x));
        if (v && typeof v === 'object') return Object.entries(v).forEach(([kk, vv]) => {
          if (URL_KEYS.has(kk)) return;
          if (TEXT_KEYS.has(kk) && typeof vv === 'string' && /[a-záéíóúñ]{2}/i.test(vv)) units.add(norm(vv));
          else walk(vv, kk);
        });
      };
      walk(JSON.parse(m[1]));
    } catch { /* schema inválido: lo reporta el verificador */ }
  }
  return [...units];
}

const pending = new Set();
for (const page of esPages) for (const u of unitsOf(page)) if (cache[u] === undefined) pending.add(u);
const queue = [...pending];
console.log(`páginas ES: ${esPages.length} · strings pendientes: ${queue.length} · en caché: ${Object.keys(cache).length}`);

let cursor = 0;
async function worker(id) {
  while (cursor < queue.length) {
    const slice = queue.slice(cursor, cursor + 8);
    cursor += 8;
    try {
      const out = await requestBatch(slice);
      slice.forEach((s, i) => (cache[s] = out[i]));
    } catch (err) {
      console.error('✗ lote', cursor, err.message);
    }
    if (cursor % 400 < 8) {
      fs.writeFileSync(CACHE, JSON.stringify(cache));
      console.log(`  traducidos ${cursor}/${queue.length}`);
    }
  }
}
await Promise.all(Array.from({ length: 14 }, (_, i) => worker(i)));
fs.writeFileSync(CACHE, JSON.stringify(cache));
console.log('caché:', Object.keys(cache).length);

// ── fase 2 · escritura ──────────────────────────────────────────────────────
const tr = (text) => {
  const k = norm(text);
  if (!k) return text;
  return cache[k] === undefined ? text : cache[k];
};

function translateFragment(html) {
  const { text, marks } = protect(html);
  const out = tr(text);
  // Si el traductor se comió una marca, se traduce segmento a segmento.
  if (out === text || /Zq\d+Z/.test(text) && (text.match(/Zq\d+Z/gi) || []).length !== (out.match(/Zq\d+Z/gi) || []).length) {
    const parts = html.split(/(<[^>]+>|\{\{custom_values\.[a-z_]+\}\})/i);
    return parts.map((p) => (/^</.test(p) || /^\{\{/.test(p) ? p : tr(p))).join('');
  }
  return restore(out, marks);
}

const TOGGLE_CSS = `<style id="ilbn-lang-css">#ilbn-lang{display:inline-flex;align-items:center;gap:2px;margin:0 8px 0 0;padding:2px;border:1px solid rgba(17,22,75,.14);border-radius:999px;background:#fff}
#ilbn-lang a{display:inline-flex;align-items:center;justify-content:center;min-width:38px;min-height:30px;padding:0 8px;border-radius:999px;font:700 12px/1 system-ui,sans-serif;letter-spacing:.04em;text-decoration:none;color:#11164b;opacity:.7}
#ilbn-lang a[aria-current="true"]{background:#11164b;color:#fff;opacity:1}
#ilbn-lang a:focus-visible{outline:2px solid #009640;outline-offset:2px}</style>`;

function toggle(es) {
  const en = enPath(es);
  return `${TOGGLE_CSS}<div id="ilbn-lang" role="group" aria-label="Idioma / Language"><a href="${SITE}${es}" data-ilatek-path="${es}" hreflang="es" lang="es">ES</a><a href="${SITE}${en}" data-ilatek-path="${en}" hreflang="en" lang="en" aria-current="true">EN</a></div>`;
}

function mapUrl(v) {
  if (typeof v !== 'string') return v;
  const m = /^(https:\/\/\{\{custom_values\.website_url\}\})(\/blog[^#?]*)?(.*)$/.exec(v);
  if (!m) return v;
  if (!m[2]) return v;
  return m[1] + enPath(m[2]) + m[3];
}

function translateJson(value, key = '') {
  if (Array.isArray(value)) return value.map((v) => translateJson(v));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === 'inLanguage') out[k] = 'en';
      else if (URL_KEYS.has(k)) out[k] = translateJson(mapUrl(v), k);
      else if (TEXT_KEYS.has(k) && typeof v === 'string') out[k] = tr(v);
      else out[k] = translateJson(v, k);
    }
    return out;
  }
  return value;
}

let done = 0;
for (const page of esPages) {
  const raw = fs.readFileSync(path.join(ROOT, page.file), 'utf8');
  const crlf = raw.includes('\r\n');
  let html = raw.replace(/\r\n/g, '\n');

  // guiones y estilos intactos
  const scripts = [];
  html = html.replace(/<script\b(?![^>]*type="application\/ld\+json")[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi, (m) => {
    scripts.push(m);
    return `\u0002${scripts.length - 1}\u0002`;
  });

  // bloques y atributos
  html = html.replace(BLOCK, (block) => {
    const m = /^(<[^>]+>)([\s\S]*?)(<\/[a-z0-9]+>)$/i.exec(block);
    return m ? m[1] + translateFragment(m[2]) + m[3] : block;
  });
  html = html.replace(ATTR, (m, name, value) => `${name}="${tr(value).replace(/"/g, '&quot;')}"`);

  // restos de español en nodos de texto fuera de los bloques habituales
  html = html.replace(/>([^<]{6,})</g, (m, text) => {
    const t = text.trim();
    if (!/[a-záéíóúñ]/i.test(t) || (t.match(ES_RES) || []).length < ES_RES_MIN) return m;
    return '>' + translateFragment(text) + '<';
  });

  html = html.replace(/\u0002(\d+)\u0002/g, (_, i) => scripts[Number(i)]);

  // schema
  html = html.replace(/<script\b([^>]*)type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi, (m, attrs, body) => {
    try {
      const open = m.slice(0, m.indexOf('>') + 1);
      return open + JSON.stringify(translateJson(JSON.parse(body))) + '</script>';
    } catch {
      return m;
    }
  });

  // alternates: se borran las que traía el original y se reescriben al final
  html = html.replace(/<link\b[^>]*rel="alternate"[^>]*>\s*/gi, '');

  // el traductor devuelve «blog» en minúscula: el menú lo escribe con mayúscula
  html = html.replace(/(<nav class="ilbn-links"[^>]*>\s*<a\b[^>]*>)\s*blog\s*(<\/a>)/i, '$1Blog$2');

  // enlaces internos del blog
  html = html.replace(/data-ilatek-path="\/blog(?!\/en)([^"]*)"/g, (_, rest) => `data-ilatek-path="/blog/en${rest}"`);
  const siteRe = SITE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(siteRe + '/blog(?!\\/en)', 'g'), SITE + '/blog/en');

  // cabecera, idioma, toggle y marca
  {
    const es = page.path;
    html = html.replace(/<meta charset="utf-8">/i,
      (m) => `${m}\n<link rel="alternate" hreflang="es" href="${SITE}${es}">\n<link rel="alternate" hreflang="en" href="${SITE}${enPath(es)}">\n<link rel="alternate" hreflang="x-default" href="${SITE}${es}">`);
  }
  if (!html.includes('id="ilbn-lang"')) {
    const block = toggle(page.path);
    if (/<a class="ilbn-login"[^>]*>[\s\S]*?<\/a>/.test(html)) html = html.replace(/(<a class="ilbn-login"[^>]*>[\s\S]*?<\/a>)/, (m) => `${m}\n    ${block}`);
    else html = html.replace(/(<section id="ilatek-nav"[^>]*>)/, (m) => `${m}\n${block}`);
  }
  if (!html.includes('ILATEK:EN-COPY')) {
    html = html.replace(/<meta charset="utf-8">/i,
      (m) => `${m}\n<!-- ILATEK:EN-COPY -->\n<script>/* Copia EN: el HTML ya viene traducido; se fija el idioma del documento. */document.documentElement.setAttribute("lang","en");try{localStorage.setItem("ilatek-lang","en")}catch(e){}</script>`);
  }

  const dest = path.join(ROOT, 'en', page.file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, crlf ? html.replace(/\n/g, '\r\n') : html);
  done++;
  if (done % 20 === 0 || done === esPages.length) console.log(`  escritas ${done}/${esPages.length}`);
}
console.log('copias EN escritas:', done);
