// Ilatek · Techos · verificación POST-ESCRITURA de los artefactos en disco.
// No genera nada: lee los 34 ghl-*-landing.html y los archivos SEO ya escritos
// y comprueba contra el modelo (buildTree) que el resultado publicado cumple:
//   · JSON-LD parsea y trae Service + BreadcrumbList + makesOffer/Offer en 34/34
//   · el precio del schema == el "desde $X" visible
//   · FAQPage espejo 1:1 del FAQ visible
//   · cero copy de limpieza en encabezados/descripciones/alt
//   · canonical, sitemap (#TECHOS) y llms-techos.txt referencian exactamente los 34 slugs
// Uso: node Ilatek/techos/verify-techos.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTree } from './lib/model.mjs';
import { cleanGuard, readSchema, stripTags, imgAltErrors } from './lib/audit.mjs';
import { pageFile } from '../tools/site-paths.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const ILATEK = path.resolve(OUT, '..');
const pages = buildTree();
const slugs = pages.map((p) => p.slug);
const slugSet = new Set(slugs);

let problems = 0;
const fail = (where, msg) => { problems++; console.error(`  ✗ ${where}: ${msg}`); };
const read = (p) => fs.readFileSync(path.join(ILATEK, p), 'utf8');

// ─────────────────────────── 1. HTML por página ───────────────────────────
let schemaOk = 0;
let faqParityOk = 0;
let priceOk = 0;
let cleanOk = 0;
let altOk = 0;

for (const p of pages) {
  const file = pageFile(p.slug);
  if (!fs.existsSync(path.join(ILATEK, file))) { fail(p.slug, 'archivo faltante'); continue; }
  const html = read(file);

  const { errors, graph, faq } = readSchema(html);
  if (errors.length) { fail(p.slug, errors.join('; ')); continue; }
  const byType = (t) => (graph || []).find((n) => n['@type'] === t);
  const svc = byType('Service');
  const biz = byType('RoofingContractor');
  const bc = byType('BreadcrumbList');

  const schemaErrs = [];
  if (!svc) schemaErrs.push('sin Service');
  if (!bc) schemaErrs.push('sin BreadcrumbList');
  if (!bc || !bc.itemListElement || bc.itemListElement.length !== p.breadcrumb.length) schemaErrs.push('BreadcrumbList != jerarquía');
  if (!biz || !biz.makesOffer || !biz.makesOffer[0]) schemaErrs.push('sin makesOffer');
  if (svc && (!svc.provider || svc.provider['@id'] !== biz['@id'])) schemaErrs.push('Service.provider != biz');
  if (!svc || !svc.offers || svc.offers['@type'] !== 'Offer') schemaErrs.push('Service sin Offer');
  if (schemaErrs.length) fail(p.slug, `schema: ${schemaErrs.join('; ')}`);
  else schemaOk++;

  // precio schema == "desde $X" visible
  const visible = stripTags(html).toLowerCase();
  const priceInText = visible.includes(p.price.text.toLowerCase());
  const priceInSchema = svc && String(svc.offers.price) === String(p.price.amount)
    && String(biz.makesOffer[0].price) === String(p.price.amount);
  if (!priceInText || !priceInSchema) fail(p.slug, `precio: visible=${priceInText} schema=${priceInSchema}`);
  else priceOk++;

  // FAQPage 1:1 con el FAQ visible
  const visibleFaq = (html.match(/<details class="ilt-faq-item">/g) || []).length;
  if (!faq || faq.length !== visibleFaq) fail(p.slug, `FAQPage ${faq ? faq.length : 0} != visible ${visibleFaq}`);
  else faqParityOk++;

  // cero copy de limpieza
  const cleanErrs = cleanGuard(html);
  if (cleanErrs.length) fail(p.slug, `limpieza: ${cleanErrs.slice(0, 3).join(' | ')}`);
  else cleanOk++;

  // cobertura de alt: ninguna imagen sin alt (vacio solo si es decorativa)
  const altErrs = imgAltErrors(html);
  if (altErrs.length) fail(p.slug, 'alt: ' + altErrs.slice(0, 3).join(' | '));
  else altOk++;
}

// ─────────────────────────── 2. Canonical (head-seo) ───────────────────────────
// Verify public slugs after resolving the deployment's domain-only Custom Value.
const headSeo = read('techos/ghl-techos-head-seo.html').replaceAll('https://{{custom_values.website_url}}','https://ilatekpr.com');
const canonicals = [...headSeo.matchAll(/<link rel="canonical" href="https:\/\/ilatekpr\.com\/([a-z0-9-]*)">/g)].map((m) => m[1]);
const canonicalSet = new Set(canonicals);
const canonErrs = [];
const canonSlugs = slugs.map(function (s) { return s === 'techos' ? 'home' : s; });
const canonSet = new Set(canonSlugs);
if (canonicals.length !== canonSlugs.length) canonErrs.push(`${canonicals.length} canonical != ${canonSlugs.length} esperados`);
canonSlugs.forEach(function (s) { if (!canonicalSet.has(s)) canonErrs.push(`falta canonical /${s}`); });
canonicals.forEach(function (s) { if (!canonSet.has(s)) canonErrs.push(`canonical extra /${s}`); });
if (canonErrs.length) fail('head-seo', canonErrs.join('; '));

const ogTitles = (headSeo.match(/<meta property="og:title"/g) || []).length;
const ogTitleOk = ogTitles === slugs.length ? slugs.length : 0;
if (ogTitles !== slugs.length) fail('head-seo', ogTitles + ' og:title != ' + slugs.length + ' esperados');

// ─────────────────────────── 3. Sitemap: fragmento + sitemap.xml ───────────────────────────
const sitemapSlugs = slugs.filter(function (s) { return s !== 'techos'; });
const sitemapSet = new Set(sitemapSlugs);
function checkSitemapBlock(where, xml, locs) {
  const errs = [];
  if (locs.length !== sitemapSlugs.length) errs.push(`${locs.length} loc != ${sitemapSlugs.length}`);
  sitemapSlugs.forEach(function (s) { if (!locs.includes(s)) errs.push(`falta /${s}`); });
  locs.forEach(function (s) { if (!sitemapSet.has(s)) errs.push(`loc extra /${s}`); });
  if (errs.length) fail(where, errs.join('; '));
}

const frag = read('techos/techos-sitemap-fragment.xml');
checkSitemapBlock('sitemap-fragment', frag,
  [...frag.matchAll(/<loc>https:\/\/ilatekpr\.com\/([a-z0-9-]*)<\/loc>/g)].map((m) => m[1]));

const main = read('sitemap.xml');
const S = main.indexOf('<!-- TECHOS:START -->');
const E = main.indexOf('<!-- TECHOS:END -->');
if (S < 0 || E < 0 || E < S) fail('sitemap.xml', 'sin marcadores TECHOS:START/END');
else {
  const block = main.slice(S, E);
  checkSitemapBlock('sitemap.xml', block,
    [...block.matchAll(/<loc>https:\/\/ilatekpr\.com\/([a-z0-9-]*)<\/loc>/g)].map((m) => m[1]));
}

// ─────────────────────────── 4. llms-techos.txt ───────────────────────────
const llms = read('techos/llms-techos.txt');
const llmsMissing = slugs.filter((s) => !new RegExp(`[/\\]]${s}[)\\s]`).test(llms));
if (llmsMissing.length) fail('llms-techos.txt', `faltan ${llmsMissing.join(', ')}`);

// ─────────────────────────── reporte ───────────────────────────
const n = pages.length;
console.log(`\nIlatek Techos · verificación de artefactos (${n} páginas, ${problems} problemas)`);
console.log(`  schema Service+Breadcrumb+Offer : ${schemaOk}/${n}`);
console.log(`  precio schema == visible        : ${priceOk}/${n}`);
console.log(`  FAQPage 1:1 con FAQ visible     : ${faqParityOk}/${n}`);
console.log(`  sin copy de limpieza            : ${cleanOk}/${n}`);
console.log(`  alt presente en imagenes        : ${altOk}/${n}`);
console.log(`  Open Graph (og:title)           : ${ogTitleOk}/${n}`);
console.log(`  canonicals / sitemap / llms.txt : ${problems === 0 ? 'OK' : 'revisar arriba'}`);
console.log(problems === 0 ? '\n✓ VERIFICADO\n' : '\n✗ NO VERIFICADO\n');
if (problems) process.exitCode = 1;
