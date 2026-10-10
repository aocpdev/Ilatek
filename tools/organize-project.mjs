// One-time, non-destructive migration. Run without --apply to inspect the plan.
// Existing target files are never overwritten. The manifest is the audit trail.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CLUSTERS } from '../techos/lib/model.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestFile = path.join(ROOT, 'docs/estructura.json');
if (fs.existsSync(manifestFile)) throw new Error('Migration already recorded; use package-pages.mjs to refresh metadata/assets.');
const moves = {};
const pages = [];
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
function page(old, folder, slug, group, category, status = 'existente') {
  const target = `${folder}/es/landing-pages/${path.basename(old)}`;
  moves[old] = target;
  const html = fs.readFileSync(path.join(ROOT, old), 'utf8');
  pages.push({slug, group, category, folder, file: target, original: old,
    originalSha256: hash(html), status,
    english: /data-en(?:[=\s-])|ILATEK_I18N/.test(html) ? 'selector-integrado' : 'sin-landing-independiente'});
}
page('home-page/ghl-home-multiservicios.html', 'home', 'home', 'home', null);
const cleaningCategories = new Set(['limpieza-residencial', 'limpieza-comercial', 'limpieza-industrial']);
for (const name of fs.readdirSync(path.join(ROOT, 'home-page')).sort()) {
  if (!/^ghl-.*-landing\.html$/.test(name)) continue;
  const slug = name.slice(4, -13);
  const isCategory = cleaningCategories.has(slug) || slug === 'servicios';
  const folder = isCategory ? `categorias/${slug === 'servicios' ? 'limpieza' : slug}` : `servicios/${slug}`;
  page(`home-page/${name}`, folder, slug, 'limpieza', isCategory ? 'limpieza' : 'limpieza');
}
const roofCategories = new Set(CLUSTERS.map(c => c[0].slug));
const roofParents = new Map(CLUSTERS.flatMap(c => c.slice(1).map(p => [p.slug, c[0].slug])));
for (const name of fs.readdirSync(path.join(ROOT, 'techos')).sort()) {
  if (!/^ghl-.*-landing\.html$/.test(name)) continue;
  const slug = name.slice(4, -13);
  const isCategory = roofCategories.has(slug) || slug === 'techos';
  page(`techos/${name}`, `${isCategory ? 'categorias' : 'servicios'}/${slug}`, slug, 'techos',
    roofParents.get(slug) || 'techos', slug === 'techos' ? 'legacy-canonical-home' : 'existente');
}
function walk(dir) {
  return fs.readdirSync(path.join(ROOT, dir), {withFileTypes: true}).flatMap(e =>
    e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
}
for (const old of walk('home-page')) {
  if (moves[old]) continue;
  const name = path.basename(old);
  if (name.startsWith('faq-') || name === 'FAQ.md') moves[old] = `src/faq/${name}`;
  else if (['ghl-home-completo.html','ghl-home-completo-optimizado.html','ghl-custom-code.html'].includes(name))
    moves[old] = `archivo/home-limpieza/${name}`;
  else if (name === 'ghl-head-seo.html') moves[old] = `documentacion/seo/limpieza-head-original.html`;
  else moves[old] = `componentes/${name}`;
}
moves['README.md'] = 'documentacion/HISTORIAL-PROYECTO.md';
const manifest = {version: 1, migratedAt: new Date().toISOString(),
  conventions: 'home|categorias|servicios / slug / es|en; landing-pages, assets, SEO-GHL.md',
  languages: 'ES existente; EN por selector donde existe. No se inventan landings EN ni URLs /en/.',
  moves, pages};
console.log(JSON.stringify({pages: pages.length, moves: Object.keys(moves).length,
  destinations: pages.map(p => p.file)}, null, 2));
if (!process.argv.includes('--apply')) process.exit(0);
for (const [old, target] of Object.entries(moves)) {
  if (!fs.existsSync(path.join(ROOT, old))) throw new Error(`Missing source: ${old}`);
  if (fs.existsSync(path.join(ROOT, target))) throw new Error(`Refusing overwrite: ${target}`);
}
for (const [old, target] of Object.entries(moves)) {
  fs.mkdirSync(path.dirname(path.join(ROOT, target)), {recursive: true});
  fs.renameSync(path.join(ROOT, old), path.join(ROOT, target));
}
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
// Remove only empty directories left by the exact moves above.
function empty(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) if (e.isDirectory()) empty(path.join(dir,e.name));
  if (!fs.readdirSync(dir).length) fs.rmdirSync(dir);
}
empty(path.join(ROOT, 'home-page'));
console.log('Migration recorded in docs/estructura.json. HTML preserved byte-for-byte.');
