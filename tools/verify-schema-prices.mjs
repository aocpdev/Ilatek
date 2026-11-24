// Ilatek · verifica que el JSON-LD no publique precios ni ratings no verificados.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, pageFile } from './site-paths.mjs';

const errors = [];
const readPage = (slug) => fs.readFileSync(path.join(ROOT, pageFile(slug)), 'utf8');

function nodes(html) {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed['@graph'])) out.push(...parsed['@graph']);
      else out.push(parsed);
    } catch {
      errors.push('JSON-LD no parsea');
    }
  }
  return out;
}
function walk(node, fn) {
  if (!node || typeof node !== 'object') return;
  fn(node);
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((x) => walk(x, fn));
    else if (v && typeof v === 'object') walk(v, fn);
  }
}

const money = readPage('sellado-de-techos');
const moneyNodes = nodes(money);
let moneyOffers = 0, moneyRatings = 0;
moneyNodes.forEach((n) => walk(n, (x) => {
  if (x['@type'] === 'Offer') {
    moneyOffers++;
    if ('price' in x || 'priceSpecification' in x) errors.push('money: Offer publica precio sin hecho verificado para el slug');
  }
  if (x['@type'] === 'AggregateRating') moneyRatings++;
}));
if (!moneyOffers) errors.push('money: no se encontró ningún Offer (se esperaba al menos el catálogo)');
if (moneyRatings) errors.push(`money: ${moneyRatings} AggregateRating sin reseñas verificadas`);

const silicona = readPage('sellado-de-silicona');
const siliconaNodes = nodes(silicona);
let siliconaPrice = null;
siliconaNodes.forEach((n) => walk(n, (x) => {
  if (x['@type'] === 'Offer' && 'price' in x) siliconaPrice = x.price;
  if (x['@type'] === 'AggregateRating') errors.push('silicona: AggregateRating sin reseñas verificadas');
}));
const siliconaFact = JSON.parse(fs.readFileSync(new URL('../documentacion/seo/hechos-sellado-2026-11-07.json', import.meta.url), 'utf8'))
  .hechos.find((h) => h.id === 'precio-silicona');
const siliconaExpected = String((String(siliconaFact && siliconaFact.valor).match(/\$\s*([\d]+)/) || [null, null])[1]);
if (String(siliconaPrice) !== siliconaExpected) errors.push(`silicona: Offer.price ${siliconaPrice} != ${siliconaExpected} verificado`);

if (errors.length) {
  console.error('✗ Schema precios/ratings');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✓ Schema: money sin precio/rating no verificado; silicona con $${siliconaExpected} verificado`);
