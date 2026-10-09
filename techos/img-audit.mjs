// Ilatek · Techos · auditoría de imágenes.
// Lista, por slug y por ranura (hero / incluye), qué asset stock usa cada landing.
// Sirve para saber qué páginas muestran fotos de otro servicio hasta tener
// fotografía real de techos.
// Uso: node Ilatek/techos/img-audit.mjs
import { buildTree } from './lib/model.mjs';
import { ASSETS } from './lib/kit.mjs';

const byFile = {};
for (const [key, [webp]] of Object.entries(ASSETS)) byFile[webp] = key;

function assetOf(url) {
  const file = url.split('/').pop();
  return byFile[file] || file;
}

const pages = buildTree();
const rows = pages.map((p) => ({
  slug: p.slug,
  role: p.role,
  hero: assetOf(p.hero.webp),
  incluye: assetOf(p.incl.webp),
}));

console.log('slug                                   role    hero             incluye');
rows.forEach((r) => console.log(`${r.slug.padEnd(38)} ${r.role.padEnd(7)} ${r.hero.padEnd(16)} ${r.incluye}`));

const counts = {};
rows.forEach((r) => { counts[r.hero] = (counts[r.hero] || 0) + 1; });
console.log('\nAssets usados en hero:', JSON.stringify(counts));
console.log(`\nSlugs: ${rows.length} · assets distintos: ${new Set(rows.flatMap((r) => [r.hero, r.incluye])).size}`);
