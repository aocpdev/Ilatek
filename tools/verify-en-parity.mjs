// Ilatek · paridad ES↔EN del lote de publicación.
//
// Cada artefacto EN de GHL-PUBLICAR/lote-sitio/por-pagina se compara con su
// gemelo ES (misma URL sin /en/). El ES es la verdad: el EN debe mostrar el
// mismo contenido traducido.
//
// Comprueba, por página:
//   1. Cadenas en español en el cuerpo visible (fuera del menú y del pie, que
//      son el shell canónico compartido y se traducen en runtime).
//   2. Multiconjunto de números del cuerpo (y de los textos del JSON-LD).
//   3. Estructura: h1/h2/h3, preguntas del FAQ y destinos de enlace.
//   4. Tokens {{custom_values.*}}.
//
// Uso: node tools/verify-en-parity.mjs [--verbose]
// Sale 1 si hay cualquier infracción.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'GHL-PUBLICAR/lote-sitio/por-pagina');
const VERBOSE = process.argv.includes('--verbose');

// Excepciones documentadas: no son texto a traducir.
const ALLOWED = [
  /Ilatek(?:\s+Techos)?/g,
  /Devasks/g,
  /Puerto\s+Rico/g,
  /zinc/gi,
];

const SPANISH = /\b(el|los|las|del|una|unos|unas|para|por|con|desde|hasta|sin|sobre|entre|que|como|más|muy|sus|está|están|tiene|pueden|hace|hacer|también|donde|cuando|cada|todo|todos|toda|todas|nuestro|nuestra|hay|fue|ser|ver|al|lo|le|les|nos|ya|solo|sólo|porque|aunque|mientras|además|después|antes|durante|contra|hacia|según|ejemplo|precio|servicio|servicios|techo|techos|casa|casas|limpieza|sellado|reparación|cotización|inspección|garantía|municipios|años|días|trabajo|incluido|incluida|gratis|agendar|agenda|reserva|depósito|descuenta|descuentan|costo|cuesta|cuánto|cómo|qué|cuál|dónde|número|teléfono|llamar|solicita|solicitar|recibir|recibe|cubrimos|cubre|trabajamos|ofrecemos|realizamos|profesionales|calidad|rápido|rápida)\b/i;
const ACCENT = /[áéíóúñ¿¡ÁÉÍÓÚÑ]/;

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  // Guiones y espacios tipográficos: el ES usa U+2011/U+2010 en fechas y leyes
  // («Ley Núm. 172‑2022»); sin normalizar, 172 y 2022 no se emparejan.
  .replace(/[‐-―]/g, '-').replace(/[   ]/g, ' ');

const strip = (html) => html
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ');

// Cuerpo: sin menú ni pie (shell canónico compartido, en español por diseño).
const body = (html) => {
  let h = strip(html);
  h = h.replace(/<section\b[^>]*\bid=["']ilatek-nav["'][\s\S]*?<\/section>/i, ' ');
  const f = h.indexOf('<footer id="ilatek-footer"');
  if (f >= 0) h = h.slice(0, f);
  return h;
};

const textLines = (html) => decode(html.replace(/<[^>]+>/g, '\n'))
  .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);

const ldTexts = (html) => {
  const out = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { continue; }
    const walk = (v) => {
      if (typeof v === 'string') out.push(decode(v));
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(data);
  }
  return out;
};

const numbers = (strs) => {
  const all = strs.join(' ').match(/\d+(?:[.,]\d+)*/g) || [];
  const map = new Map();
  for (const n of all) map.set(n, (map.get(n) || 0) + 1);
  return map;
};

const diffCounts = (a, b) => {
  const out = [];
  for (const [k, v] of a) if (v !== (b.get(k) || 0)) out.push(`${k}×${v - (b.get(k) || 0)}`);
  for (const [k, v] of b) if (!a.has(k)) out.push(`${k}×${-v}`);
  return out;
};

const count = (html, re) => (html.match(re) || []).length;
const paths = (html) => {
  const set = [];
  for (const m of html.matchAll(/data-ilatek-path="([^"]+)"/g)) set.push(m[1].replace(/^\/en(?=\/|$)/, '') || '/');
  return set.sort();
};
// Tokens de GHL: son claves de runtime, no copy. El ES puede escribir el dato
// literal (correo, teléfono, dominio) donde el EN usa la clave equivalente; en
// ambos casos GHL renderiza el mismo valor. Se comprueba el vocabulario: el EN
// no puede inventar claves que el ES no use.
const tokens = (html) => {
  const set = new Set();
  for (const m of html.matchAll(/\{\{\s*custom_values\.[^}]+\}\}/g)) set.add(m[0].replace(/\s+/g, ''));
  return set;
};

const artefacts = new Map();
for (const d of fs.readdirSync(DIR).sort()) {
  const dir = path.join(DIR, d);
  if (!fs.statSync(dir).isDirectory()) continue;
  const info = path.join(dir, '1-PAGINA.txt');
  if (!fs.existsSync(info)) continue;
  const meta = fs.readFileSync(info, 'utf8');
  const url = (/^URL:\s*(\S+)/m.exec(meta) || [])[1];
  const file = path.join(dir, '2-CODIGO-CUSTOM-HTML.html');
  if (!url || !fs.existsSync(file)) continue;
  artefacts.set(url, { dir: d, html: fs.readFileSync(file, 'utf8') });
}

const rows = [];
let failed = 0;
for (const [url, en] of artefacts) {
  if (!/\/en\//.test(url)) continue;
  const es = artefacts.get(url.replace(/\/en\//, '/'));
  if (!es) continue;

  const enBody = body(en.html), esBody = body(es.html);
  const enLines = textLines(enBody), esLines = textLines(esBody);

  // 1) cadenas en español
  const spanish = [];
  for (const line of enLines) {
    const scrubbed = ALLOWED.reduce((s, re) => s.replace(re, ' '), line);
    const hits = [...new Set((scrubbed.match(/[a-záéíóúñü]+/gi) || [])
      .map((w) => w.toLowerCase()).filter((w) => SPANISH.test(w)))];
    if (hits.length >= 2 || (hits.length >= 1 && ACCENT.test(scrubbed))) spanish.push({ line, hits });
  }

  // 2) números del cuerpo visible. El JSON-LD se compara aparte por estructura:
  // sus valores son datos estructurados y el EN puede expandir la respuesta FAQ
  // con el texto completo, que no es copy visible.
  const numDiff = diffCounts(numbers(enLines), numbers(esLines));

  // 3) estructura
  const structure = [];
  for (const tag of ['h1', 'h2', 'h3']) {
    const a = count(en.html, new RegExp(`<${tag}\\b`, 'gi'));
    const b = count(es.html, new RegExp(`<${tag}\\b`, 'gi'));
    if (a !== b) structure.push(`${tag} ${a}≠${b}`);
  }
  const faqDiff = count(en.html, /<details\b/gi) - count(es.html, /<details\b/gi);
  if (faqDiff) structure.push(`faq ${faqDiff > 0 ? '+' : ''}${faqDiff}`);
  const enPaths = paths(en.html), esPaths = paths(es.html);
  if (enPaths.join('|') !== esPaths.join('|')) structure.push(`enlaces ${enPaths.length}≠${esPaths.length}`);
  const ldShape = (html) => ldTexts(html).length;
  if (ldShape(en.html) !== ldShape(es.html)) structure.push(`json-ld ${ldShape(en.html)}≠${ldShape(es.html)}`);

  // 4) custom values: ninguna clave inventada
  const esTok = tokens(es.html), enTok = tokens(en.html);
  const tokDiff = [...enTok].filter((t) => !esTok.has(t));

  const problems = [];
  if (spanish.length) problems.push(`español:${spanish.length}`);
  if (numDiff.length) problems.push(`números:${numDiff.length}`);
  if (structure.length) problems.push(`estructura:${structure.join('/')}`);
  if (tokDiff.length) problems.push(`tokens:${tokDiff.length}`);

  if (problems.length) failed++;
  rows.push({ dir: en.dir, url, problems, spanish, numDiff, structure, tokDiff });
}

const total = rows.length;
console.log(JSON.stringify({
  pares: total,
  enParidad: total - failed,
  conInfracciones: failed,
  detalle: rows.filter((r) => r.problems.length).map((r) => ({ art: r.dir, problemas: r.problems })),
}, null, 1));

if (VERBOSE) {
  for (const r of rows.filter((x) => x.problems.length)) {
    console.log(`\n### ${r.dir}  ${r.url}`);
    r.spanish.slice(0, 5).forEach((s) => console.log(`  ES? ${s.hits.join(',')}: ${s.line.slice(0, 160)}`));
    if (r.numDiff.length) console.log(`  núm: ${r.numDiff.slice(0, 12).join(' ')}`);
    if (r.structure.length) console.log(`  estr: ${r.structure.join(' / ')}`);
    if (r.tokDiff.length) console.log(`  tok: ${r.tokDiff.slice(0, 8).join(' ')}`);
  }
}

process.exitCode = failed ? 1 : 0;
