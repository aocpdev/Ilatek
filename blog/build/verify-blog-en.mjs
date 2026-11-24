/**
 * Verifica la capa inglesa del blog: que cada página tenga su copia EN, el
 * toggle y el hreflang recíproco, el schema en inglés con URLs /blog/en, los
 * alt traducidos y ningún enlace que salga de la capa inglesa.
 *
 *   node build/verify-blog-en.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = 'https://{{custom_values.website_url}}';
const indice = JSON.parse(fs.readFileSync(path.join(ROOT, 'indice.json'), 'utf8')).paginas;
const enPath = (p) => (p === '/blog' ? '/blog/en' : p.startsWith('/blog/en') ? p : '/blog/en' + p.slice('/blog'.length));

const SPANISH = /\b(de la|del techo|para tu|con una|los techos|las tejas|según|también|además|puede ser|debe ser|cuando se|hacia|desde el|precio por|más que|sin embargo|porque|aunque|mientras)\b/i;
const errors = [];
const counts = { es: 0, en: 0, schema: 0, alts: 0 };

for (const page of indice) {
  const isEn = page.path.startsWith('/blog/en');
  const esFile = isEn ? null : path.join(ROOT, page.file);
  const enFile = isEn ? path.join(ROOT, page.file) : path.join(ROOT, 'en', page.file);
  const esPath = isEn ? null : page.path;

  if (!fs.existsSync(enFile)) { errors.push(`falta copia EN: ${page.path}`); continue; }
  counts.en++;
  const html = fs.readFileSync(enFile, 'utf8');

  // toggle + hreflang (las 10 páginas que solo existen en inglés no declaran par)
  if (!html.includes('id="ilbn-lang"')) errors.push(`${page.path}: sin toggle ES/EN`);
  const alternates = [...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/gi)].map((m) => m[0]);
  if (esPath) {
    for (const lang of ['es', 'en', 'x-default']) {
      if (!alternates.some((a) => a.includes(`hreflang="${lang}"`))) errors.push(`${page.path}: sin hreflang ${lang}`);
    }
  } else if (alternates.some((a) => a.includes('hreflang="es"'))) errors.push(`${page.path}: declara par ES inexistente`);
  if (!html.includes('ILATEK:EN-COPY')) errors.push(`${page.path}: sin marca de copia EN`);
  if (!esPath) { counts.es++; continue; }

  // ES tiene que existir y anunciar su par
  if (!fs.existsSync(esFile)) { errors.push(`falta original ES: ${page.path}`); continue; }
  counts.es++;
  const esHtml = fs.readFileSync(esFile, 'utf8');
  if (!esHtml.includes(`hreflang="en" href="${SITE}${enPath(page.path)}"`)) errors.push(`${page.path}: el ES no anuncia su par EN`);
  if (!html.includes(`hreflang="es" href="${SITE}${page.path}"`)) errors.push(`${page.path}: el EN no anuncia su par ES`);

  // schema: JSON válido, en inglés y con URLs /blog/en
  for (const m of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { errors.push(`${page.path}: JSON-LD inválido`); continue; }
    counts.schema++;
    const flat = JSON.stringify(data);
    if (/"inLanguage":"es"/i.test(flat)) errors.push(`${page.path}: schema con inLanguage="es"`);
    if (/"url":"https:\/\/\{\{custom_values\.website_url\}\}\/blog(?!\/en)/.test(flat)) errors.push(`${page.path}: schema con URL /blog sin /en`);
    const hasEs = /"inLanguage":"es"/i.test(JSON.stringify(data));
    if (!hasEs && data['@type'] === 'BlogPosting' && !/"inLanguage":"en"/i.test(flat)) errors.push(`${page.path}: BlogPosting sin inLanguage="en"`);
  }

  // enlaces internos a la capa inglesa
  for (const m of html.matchAll(/data-ilatek-path="([^"]*)"/g)) {
    const t = m[1];
    if (/\/blog\/en\/en\//.test(t)) errors.push(`${page.path}: enlace duplicado /blog/en/en (${t})`);
  }

  // alt traducidos
  for (const m of html.matchAll(/<img\b[^>]*\balt="([^"]*)"/gi)) {
    counts.alts++;
    const alt = m[1].trim();
    if (!alt) { errors.push(`${page.path}: img sin alt`); continue; }
    if (SPANISH.test(alt)) errors.push(`${page.path}: alt en español «${alt.slice(0, 60)}»`);
  }

  // texto visible sin español evidente
  const visible = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  const hits = [...visible.matchAll(new RegExp(SPANISH.source, 'gi'))].length;
  if (hits > 6) errors.push(`${page.path}: texto en español (${hits} marcas)`);
}

// las 10 páginas que ya estaban en inglés también deben tener toggle
for (const page of indice.filter((p) => p.path.startsWith('/blog/en'))) {
  const f = path.join(ROOT, page.file);
  if (fs.existsSync(f) && !fs.readFileSync(f, 'utf8').includes('id="ilbn-lang"')) errors.push(`${page.path}: sin toggle`);
}

console.log(`Copias EN: ${counts.en} · pares ES: ${counts.es} · bloques JSON-LD: ${counts.schema} · alt: ${counts.alts}`);
if (errors.length) {
  console.error(`✗ Blog EN: ${errors.length} fallos`);
  errors.slice(0, 25).forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log('✓ Blog EN: copias completas, toggle y hreflang recíprocos, schema en inglés, alt traducidos.');
