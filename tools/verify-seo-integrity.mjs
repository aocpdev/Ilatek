// Ilatek · verificación de integridad SEO sobre el HTML/XML generado.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure, pageFile } from './site-paths.mjs';

const errors = [];
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const canonicals = (html) => [...stripComments(html).matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)].map((m) => m[0]);
const hrefOf = (tag) => (tag.match(/href=["']([^"']+)/i) || [])[1] || '';
const stripTags = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function expectSelf(label, rel, expectedPath, { optional = false } = {}) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { errors.push(`${label}: falta ${rel}`); return; }
  const tags = canonicals(fs.readFileSync(file, 'utf8'));
  if (!tags.length) {
    if (!optional) errors.push(`${label}: sin canonical activo`);
    return;
  }
  if (tags.length > 1) errors.push(`${label}: ${tags.length} canonical activos`);
  const href = hrefOf(tags[0]);
  if (!href.includes(expectedPath)) errors.push(`${label}: canonical ${href} no apunta a ${expectedPath}`);
}

expectSelf('/garantia', 'garantia/ILATEK-Garantias.html', '/garantia');
expectSelf('/resenas', 'resenas/ghl-resenas-landing.html', '/resenas');
expectSelf('/resenas preview', 'resenas/_preview-resenas.html', '/resenas');

// Ninguna página del manifest puede canonicalizar a la home salvo home/techos.
for (const page of structure.pages) {
  const file = path.join(ROOT, page.file);
  if (!fs.existsSync(file)) continue;
  for (const tag of canonicals(fs.readFileSync(file, 'utf8'))) {
    const href = hrefOf(tag);
    const isHome = /^https:\/\/\{\{custom_values\.website_url\}\}\/?$/.test(href) || /\/home\/?$/.test(href);
    if (isHome && page.slug !== 'home' && page.slug !== 'techos') {
      errors.push(`${page.slug}: canonical a la home (${href})`);
    }
  }
}

// Head de techos: cada bloque canonicaliza a su slug; solo el legacy /techos va a /home.
const head = read('techos/ghl-techos-head-seo.html');
for (const m of head.matchAll(/<!-- ▼▼ \/([^ ]+) ▼▼ -->([\s\S]*?)<!-- ▲▲ fin \/\1 ▲▲ -->/g)) {
  const slug = m[1];
  const tags = canonicals(m[2]);
  if (tags.length !== 1) { errors.push(`head techos /${slug}: ${tags.length} canonical`); continue; }
  const href = hrefOf(tags[0]);
  const expected = slug === 'techos' ? '/home' : `/${slug}`;
  if (!href.includes(expected)) errors.push(`head techos /${slug}: ${href} != ${expected}`);
  if (slug !== 'techos' && /\/home\/?$/.test(href)) errors.push(`head techos /${slug}: canonical a home`);
}

// Silicona: H1, cuerpo y schema con el mismo rango 20 a 25; sin el claim viejo.
const silicona = read(pageFile('sellado-de-silicona'));
const h1 = stripTags((silicona.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
if (!/20 a 25/.test(h1)) errors.push(`silicona: H1 no dice 20 a 25 (${h1.slice(0, 120)})`);
if (/5 años o más/i.test(silicona)) errors.push('silicona: queda el claim "5 años o más"');
const schemaText = [...silicona.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(' ');
const bodyText = stripTags(silicona.replace(/<script[\s\S]*?<\/script>/gi, ' '));
const occurrences = (bodyText.match(/20 a 25/g) || []).length + (schemaText.match(/20 a 25/g) || []).length;
if (occurrences < 3) errors.push(`silicona: 20 a 25 aparece ${occurrences} veces entre cuerpo y schema (mínimo 3)`);
if (!/20 a 25/.test(schemaText)) errors.push('silicona: schema sin 20 a 25');

// llms.txt: techos primero, sin la descripción vieja de empresa de limpieza.
const llms = read('llms.txt');
if (!llms.startsWith('# Ilatek Techos')) errors.push('llms.txt: no empieza por la línea de techos');
if (/^> Empresa de limpieza/m.test(llms)) errors.push('llms.txt: sigue describiendo a Ilatek como empresa de limpieza');
if (!/## Techos/.test(llms)) errors.push('llms.txt: falta la sección de techos');
if (/agosto|septiembre|octubre|noviembre|diciembre/i.test(llms) && !/noviembre 2026/.test(llms)) errors.push('llms.txt: posible fecha no verificada');

// Anchors al money page: el texto exacto repetido ya no puede existir y debe
// haber variedad descriptiva. Se revisan las páginas del manifest.
const exactMoney = /^sellado de techos? en puerto rico$/i;
let moneyLinks = 0, exactMoneyLinks = 0;
const moneyTexts = new Set();
for (const page of structure.pages) {
  const html = read(page.file);
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    // El href capturado termina en el propio slug, así que el separador se
    // comprueba con $: con un lookahead el enlace real nunca contaba.
    if (!/(?:^|\/)sellado-de-techos(?:[#?]|$)/.test(m[1])) continue;
    moneyLinks++;
    const text = stripTags(m[2]);
    moneyTexts.add(text);
    if (exactMoney.test(text)) exactMoneyLinks++;
  }
}
if (exactMoneyLinks > 0) errors.push(`${exactMoneyLinks} anchors exactos "Sellado de techos en Puerto Rico" siguen en el manifest`);
if (moneyLinks > 0 && moneyTexts.size < 3) errors.push(`anchors al money page poco diversos: ${moneyTexts.size} variantes en ${moneyLinks} enlaces`);

if (errors.length) {
  console.error('✗ SEO integrity');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✓ SEO integrity: canónicas self, silicona 20–25 coherente, llms.txt techos primero, ${moneyLinks} anchors al money en ${moneyTexts.size} variantes (0 exactos)`);
