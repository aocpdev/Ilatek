#!/usr/bin/env node
/**
 * Verifica que cada copia inglesa generada sea publicable:
 * - existe y conserva los Custom Values byte a byte (mismos conteos que el ES)
 * - sus enlaces internos van a /en/... y conservan data-ilatek-path
 * - el cuerpo visible no tiene español (se admite el nombre de marca)
 * - el FAQ visible coincide 1:1 con su FAQPage en JSON-LD
 * - todos los bloques JSON-LD parsean
 * - el HEAD EN declara canonical propia y el par hreflang recíproco
 * - el documento se declara en inglés al cargar
 *
 * Uso: node tools/verify-en.mjs   (sale != 0 si algo falla)
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT, structure } from './site-paths.mjs';

const TOKEN = '{{custom_values.website_url}}';
const PREFIX = 'https://' + TOKEN;
const EXTRA = {
  servicios: 'categorias/servicios/es/landing-pages/servicios.html',
  'servicios-techos': 'categorias/techos/es/landing-pages/servicios-techos.html',
};
// Los mapas de garantía, legales, reseñas y comunidades no son landings de
// servicio y no tienen entrada en `structure`: este verificador no las mide y
// las trata como trabajo en curso, igual que un mapa sin copia construida.
const esPage = slug => EXTRA[slug] || structure.pages.find(p => p.slug === slug)?.file;
const enFile = slug => {
  const folder = path.dirname(path.dirname(path.dirname(esPage(slug))));
  return path.join(folder, 'en', 'landing-pages', slug + '.en.html');
};

const SPANISH = /\b(?:para|desde|techos|techo|servicio|servicios|los|las|una|del|por|más|todo|todos|garantía|inspección|reparación|sellado|trabajo|precio|nuestro|con|sin|año|antes|después|llámanos|cotiza)\b/i;
// Rutas del blog (destinos españoles legítimos para los enlaces de las landings).
const BLOG_PATHS = (() => {
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'blog/indice.json'), 'utf8'));
    return Object.fromEntries(idx.paginas.map((p) => [p.path.replace(/^\//, ''), true]));
  } catch { return {}; }
})();
const BRAND = /Ilatek Techos/gi;

const slugs = fs.readdirSync(path.join(ROOT, 'src/en')).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => f.replace(/\.json$/, ''));
let failures = 0;
const ok = (cond, slug, msg) => { if (!cond) { failures++; console.error(`✗ ${slug}: ${msg}`); } };

// Un destino /en/ solo es válido si su copia está construida y tiene HEAD EN
// propio: un mapa de traducción no basta, y un HTML suelto sin HEAD no es
// publicable.
const built = slug => {
  try {
    const enPath = enFile(slug);
    return fs.existsSync(enPath) &&
      fs.existsSync(path.join(path.dirname(path.dirname(enPath)), 'HEAD-TEMPLATE.html'));
  } catch { return false; }
};
const wip = [];
for (const slug of slugs) {
  const esRel = esPage(slug);
  if (!esRel) { wip.push(slug); continue; }
  const enPath = enFile(slug);
  const esPath = path.join(ROOT, esRel);
  // Un mapa sin copia construida es trabajo en curso, no una copia publicable.
  if (!fs.existsSync(enPath)) { wip.push(slug); continue; }
  const en = fs.readFileSync(enPath, 'utf8');
  const es = fs.readFileSync(esPath, 'utf8');

  // Custom Values: los enlaces conservan exactamente los mismos; ningún token se
  // pierde y no aparece ningún nombre nuevo. Los tokens de localidad pueden subir
  // porque el FAQPage reconstruido refleja el texto visible en inglés.
  const names = t => [...new Set([...t.matchAll(/\{\{custom_values\.([a-z_]+)\}\}/g)].map(m => m[1]))].sort();
  ok(JSON.stringify(names(en)) === JSON.stringify(names(es)), slug, `nombres de Custom Value distintos: ${names(en).join(',')} vs ${names(es).join(',')}`);
  const count = (t, n) => (t.match(new RegExp('\\{\\{custom_values\\.' + n + '\\}\\}', 'g')) || []).length;
  ok(count(en, 'website_url') === count(es, 'website_url'), slug, `website_url cambió: ${count(en, 'website_url')} vs ${count(es, 'website_url')}`);
  for (const n of names(es)) {
    ok(count(en, n) >= count(es, n), slug, `token ${n} se perdió: ${count(en, n)} vs ${count(es, n)}`);
  }

  // Enlaces y marca de idioma
  ok(en.includes('data-ilatek-path="/en/'), slug, 'sin enlaces data-ilatek-path="/en/...');
  ok(/setAttribute\("lang","en"\)/.test(en), slug, 'no declara lang="en" al cargar');

  // Español visible (fuera de scripts/estilos y sin el nombre de marca)
  const visible = en.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '');
  const leftovers = [...visible.matchAll(/>([^<>]+)</g)]
    .map(m => m[1].replace(/\s+/g, ' ').trim())
    .filter(t => t && SPANISH.test(t.replace(BRAND, ' ')));
  ok(leftovers.length === 0, slug, `texto en español: ${leftovers.slice(0, 3).join(' | ')}`);

  // JSON-LD parseable + FAQ 1:1
  const blocks = [...en.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  let faq = null;
  for (const b of blocks) {
    let data;
    try { data = JSON.parse(b); } catch (e) { failures++; console.error(`✗ ${slug}: JSON-LD inválido (${e.message.slice(0, 50)})`); continue; }
    const found = [].concat(data).find(x => x && x['@type'] === 'FAQPage');
    if (found) faq = found;
  }
  const visibleQ = [...en.matchAll(/<details\b[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>/g)]
    .map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/[▾▴▲▼→←↗↓↑]/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim());
  if (visibleQ.length) {
    ok(faq !== null, slug, 'FAQ visible sin FAQPage');
    if (faq) {
      const names = (faq.mainEntity || []).map(q => q.name);
      ok(names.length === visibleQ.length, slug, `FAQ ${names.length} en schema vs ${visibleQ.length} visibles`);
      ok(names.every((n, i) => n === visibleQ[i]), slug, 'FAQ y schema no coinciden en orden o texto');
    }
  }

  // Destinos del menú: cada enlace /en/ debe tener copia inglesa. Un enlace a
  // /en/<ruta> sin página publicada sería un 404 en el menú completo.
  const EN_STATIC = ['garantia', 'politica-de-privacidad', 'terminos-y-condiciones'];
  const ES_STATIC = ['cotizacion', 'cotizacion-techos', 'resenas', 'reclutamiento-empleo',
    'reclutamiento-empleo-techos', 'politica-de-privacidad', 'terminos-y-condiciones', 'blog',
    'servicios', 'servicios-techos', 'garantia'];
  const esSlugs = new Set([...structure.pages.map(p => p.slug), ...ES_STATIC]);
  // El blog es un destino español válido: sus rutas viven en blog/indice.json,
  // no en docs/estructura.json, así que se validan contra ese índice.
  const blogPaths = new Set(Object.keys(BLOG_PATHS));
  const allTargets = [...new Set([...en.matchAll(/data-ilatek-path="([^"#?]*)"/g)].map(m => m[1]))];
  for (const target of allTargets) {
    if (target === '' || target === '/') continue;
    const english = target.startsWith('/en/') || target === '/en';
    const clean = target.replace(/^\/en\/?/, '').replace(/^\//, '');
    if (english) ok(EN_STATIC.includes(clean) || built(clean), slug, `enlace a ${target} sin copia inglesa publicable`);
    else ok(esSlugs.has(clean) || blogPaths.has(clean) || blogPaths.has(clean.replace(/^blog\//, '')), slug, `enlace a ${target} sin página española`);
  }

  // Schema propio de la página EN: idioma inglés e identidad /en/<slug>.
  ok(!/"inLanguage":"es"/i.test(en), slug, 'JSON-LD con inLanguage="es"');
  const ownIdentity = blocks.some(b => {
    try {
      const data = JSON.parse(b);
      const arr = Array.isArray(data) ? data : (data['@graph'] || [data]);
      return arr.some(n => n && (String(n.url || '').includes('/en/' + slug) || String(n['@id'] || '').includes('/en/' + slug)));
    } catch { return false; }
  });
  ok(ownIdentity, slug, 'JSON-LD sin url/@id de la propia ruta /en/' + slug);

  // HEAD EN
  // Si la carpeta aloja varias copias EN, cada página trae su HEAD propio.
  const headDir = path.dirname(path.dirname(enPath));
  const ownHead = path.join(headDir, `HEAD-TEMPLATE-${slug}.html`);
  const headPath = fs.existsSync(ownHead) ? ownHead : path.join(headDir, 'HEAD-TEMPLATE.html');
  ok(fs.existsSync(headPath), slug, 'falta HEAD-TEMPLATE.html de la copia EN');
  if (fs.existsSync(headPath)) {
    const head = fs.readFileSync(headPath, 'utf8');
    ok(head.includes(`rel="canonical" href="${PREFIX}/en/${slug}"`), slug, 'canonical EN no apunta a /en/' + slug);
    ok(head.includes(`hreflang="en" href="${PREFIX}/en/${slug}"`), slug, 'falta hreflang en');
    ok(head.includes(`hreflang="es" href="${PREFIX}/${slug}"`), slug, 'falta hreflang es recíproco');
    ok(/og:locale" content="en_/.test(head), slug, 'og:locale no es inglés');
  }
}

const copies = slugs.length - wip.length;
console.log(`\nCopias EN verificadas: ${copies} · fallos: ${failures}`);
if (wip.length) console.log(`En preparación (mapa sin copia): ${wip.join(', ')}`);
if (failures) process.exit(1);
console.log('✓ OK: tokens intactos, enlaces /en/, cuerpo en inglés, FAQ 1:1 y HEAD EN con hreflang.');
