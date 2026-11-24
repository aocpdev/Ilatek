// Ilatek · verifica el sitemap generado contra URLs heredadas y duplicados.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure } from './site-paths.mjs';

const EN_EXTRA = {
  servicios: 'categorias/servicios/es/landing-pages/servicios.html',
  'servicios-techos': 'categorias/techos/es/landing-pages/servicios-techos.html',
};
// Pares cuyo archivo EN no sigue el patrón <carpeta>/en/landing-pages/<slug>.en.html
// derivado del ES: se declaran explícitamente y se comprueba igual su existencia.
const EN_FILE = { communities: 'Comunidades/en/landing-pages/communities.en.html' };
// Slugs EN cuyo par ES se publica con otro nombre (`/communities` → `/comunidades`).
const ES_SLUG = { communities: 'comunidades' };

const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const errors = [];
const seen = new Set();
for (const loc of locs) {
  if (seen.has(loc)) errors.push(`duplicada: ${loc}`);
  seen.add(loc);
  if (/\/home-\d+$/.test(loc) || /\/[a-z0-9-]+-\d{4,}$/.test(loc)) errors.push(`heredada: ${loc}`);
}
for (const required of ['https://ilatekpr.com/sellado-de-techos', 'https://ilatekpr.com/garantia', 'https://ilatekpr.com/resenas']) {
  if (!seen.has(required)) errors.push(`falta ${required}`);
}
if (seen.has('https://ilatekpr.com/techos')) errors.push('incluye /techos (legacy canonical a home)');
if (seen.has('https://ilatekpr.com/blog')) errors.push('incluye /blog con el blog no publicado');

// Cada URL /en/ del sitemap debe tener su HTML generado y su par ES anunciado.
for (const loc of locs) {
  const m = /^https:\/\/ilatekpr\.com\/en\/([a-z0-9-]+)$/.exec(loc);
  if (!m) continue;
  const slug = m[1];
  const esFile = EN_EXTRA[slug] || structure.pages.find((p) => p.slug === slug)?.file;
  const folder = esFile ? path.dirname(path.dirname(path.dirname(esFile))) : null;
  const enHtml = EN_FILE[slug]
    ? path.join(ROOT, EN_FILE[slug])
    : folder ? path.join(ROOT, folder, 'en', 'landing-pages', slug + '.en.html') : null;
  if (!enHtml || !fs.existsSync(enHtml)) errors.push(`/en/ sin página generada: ${loc}`);
  // El home español se anuncia en la raíz (`/`), no en `/home`; su copia EN es
  // `/en/home`, así que el par válido para ese slug es la raíz.
  const esPair = slug === 'home' ? 'https://ilatekpr.com/' : 'https://ilatekpr.com/' + (ES_SLUG[slug] || slug);
  if (!seen.has(esPair)) errors.push(`par ES ausente para ${loc}`);
}

if (errors.length) {
  console.error('✗ Sitemap');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✓ Sitemap: ${locs.length} URLs únicas, sin sufijos heredados, con money/garantía/reseñas`);
