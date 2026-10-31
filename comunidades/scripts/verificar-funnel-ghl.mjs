// Verifica los payloads que preparar-funnel-ghl.mjs deja para GHL.
//
// Comprueba la estructura acordada (un funnel por comunidad, dos páginas
// hermanas con un solo servicio cada una) y que el HTML no lleve rutas
// relativas, tokens de GHL ni enlaces a assets fuera de la Media Library.
//
// Uso:
//   node scripts/verificar-funnel-ghl.mjs
//   node scripts/verificar-funnel-ghl.mjs --only carolina/isla-verde

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const comunidades = path.resolve(here, '..');
const outRoot = path.join(comunidades, 'data', 'ghl');
const SITE = 'https://comunidades.ilatekpr.com';
const SLUGS = { techos: 'sellado-de-techo', limpieza: 'limpieza' };

const args = process.argv.slice(2);
const only = args.includes('--only') ? String(args[args.indexOf('--only') + 1] || '') : '';
const onlySet = new Set(only.split(',').map(s => s.trim()).filter(Boolean));

const errors = [];
const fail = (msg) => errors.push(msg);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const indexPath = path.join(outRoot, 'index.json');
if (!fs.existsSync(indexPath)) {
  console.error('Falta data/ghl/index.json: corre primero preparar-funnel-ghl.mjs');
  process.exit(2);
}
const index = readJson(indexPath);
if (index.domain !== 'comunidades.ilatekpr.com') fail(`index.domain inesperado: ${index.domain}`);

const funnels = index.funnels.filter(f => !onlySet.size || onlySet.has(`${f.municipalitySlug}/${f.slug}`));
if (!funnels.length) {
  console.error(`No hay funnels en el índice para ${[...onlySet].join(', ') || '(todos)'}`);
  process.exit(2);
}

const seenPaths = new Set();
let pagesChecked = 0;
let assetsChecked = 0;

for (const item of funnels) {
  const key = `${item.municipalitySlug}/${item.slug}`;
  const label = `${key}`;
  if (seenPaths.has(item.funnelPath)) fail(`${label}: funnelPath duplicado ${item.funnelPath}`);
  seenPaths.add(item.funnelPath);
  if (item.funnelPath !== key) fail(`${label}: funnelPath ${item.funnelPath} no coincide con ${key}`);
  if (!item.funnelName.includes(item.community) || !item.funnelName.includes(item.municipality)) {
    fail(`${label}: funnelName no nombra comunidad y municipio`);
  }

  const payloadPath = path.join(outRoot, 'funnels', item.municipalitySlug, `${item.slug}.json`);
  if (!fs.existsSync(payloadPath)) {
    fail(`${label}: falta ${path.relative(comunidades, payloadPath)}`);
    continue;
  }
  const payload = readJson(payloadPath);
  if (payload.funnelPath !== key) fail(`${label}: payload.funnelPath ${payload.funnelPath}`);
  if (payload.domain !== 'comunidades.ilatekpr.com') fail(`${label}: domain ${payload.domain}`);
  if (!Array.isArray(payload.pages) || payload.pages.length !== 2) {
    fail(`${label}: se esperaban 2 páginas, hay ${payload.pages?.length}`);
    continue;
  }

  const kinds = payload.pages.map(p => p.kind).sort().join(',');
  if (kinds !== 'limpieza,techos') fail(`${label}: kinds ${kinds}`);

  for (const page of payload.pages) {
    pagesChecked++;
    const where = `${label}/${page.path}`;
    const expectedUrl = `${SITE}/${key}/${SLUGS[page.kind]}`;
    if (page.path !== SLUGS[page.kind]) fail(`${where}: path ${page.path} no es ${SLUGS[page.kind]}`);
    if (page.url !== expectedUrl) fail(`${where}: url ${page.url} no es ${expectedUrl}`);
    if (page.canonical !== expectedUrl) fail(`${where}: canonical ${page.canonical}`);

    if (!page.seo?.title) fail(`${where}: sin title`);
    if (!page.seo?.description) fail(`${where}: sin description`);
    if (!/^https:\/\//.test(page.seo?.image || '')) fail(`${where}: image no absoluta`);
    if (!page.html.includes('<style>')) fail(`${where}: HTML sin <style>`);
    if (!page.html.includes('<main>')) fail(`${where}: HTML sin <main>`);
    if (!page.html.includes('<footer class="site-footer">')) fail(`${where}: HTML sin footer`);
    if (/\.\.\/\.\.\/\.\.\//.test(page.html)) fail(`${where}: quedan rutas relativas ../../../`);
    if (/\{\{\s*custom_values/.test(page.html)) fail(`${where}: quedan tokens de GHL`);
    // Mojibake: el payload se leyó con cp1252 en vez de UTF-8. Rompe acentos y
    // símbolos en el texto publicado ("TURÃ­STICO", "â†'").
    if (/[\uFFFDÃÂ]|â€|ï¿½/.test(page.html)) {
      fail(`${where}: mojibake (leer el HTML en UTF-8, no en la codificación del sistema)`);
    }
    if ((page.html.match(/<main>/g) || []).length !== 1) fail(`${where}: más de un <main>`);

    if (page.jsonLd) {
      try {
        const data = JSON.parse(page.jsonLd);
        const list = Array.isArray(data) ? data : [data];
        if (!list.some(n => n?.url === expectedUrl)) fail(`${where}: JSON-LD sin url canónica`);
      } catch (e) {
        fail(`${where}: JSON-LD inválido (${e.message})`);
      }
    }

    // Todo asset del cuerpo debe ser una URL absoluta (CDN de GHL o el CDN
    // compartido); nunca una ruta relativa al documento.
    for (const m of page.html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const value = m[1];
      if (value.startsWith('#')) continue;
      if (/^(?:https?:|mailto:|tel:)/.test(value)) { assetsChecked++; continue; }
      fail(`${where}: asset/enlace no absoluto: ${value.slice(0, 120)}`);
    }
  }
}

if (errors.length) {
  console.error(`Fallos (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`OK · ${funnels.length} funnel(s) · ${pagesChecked} páginas · ${assetsChecked} enlaces/assets verificados`);
