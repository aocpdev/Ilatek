// Genera comunidades/landings/sitemap.xml con UNA URL por landing del
// subdominio de comunidades:
//
//   https://comunidades.ilatekpr.com/<municipio>/<comunidad>/sellado-de-techo
//   https://comunidades.ilatekpr.com/<municipio>/<comunidad>/limpieza
//
// Son URLs limpias (sin .html). El sitemap se arma desde el disco, que es lo
// que se publica, y se cruza contra master-database.json para que nunca liste
// una ruta sin index.html ni se olvide una comunidad con landing generada.
//
//   node comunidades/scripts/generar-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';
import { outRoot, loadLandingRecords, COMMUNITY_SITE } from './landings/config.mjs';
import { SLUGS } from './landings/copy.mjs';

const KINDS = ['techos', 'limpieza'];
const destino = path.join(outRoot, 'sitemap.xml');
const fecha = ms => new Date(ms).toISOString().slice(0, 10);

// Comunidades con landing segun el registro (misma regla que generar-landings.mjs).
const records = loadLandingRecords();

const urls = [];
const faltantes = [];
for (const r of records) {
  for (const kind of KINDS) {
    const archivo = path.join(outRoot, r.municipalitySlug, r.slug, SLUGS[kind], 'index.html');
    if (!fs.existsSync(archivo)) {
      faltantes.push(`${r.municipalitySlug}/${r.slug}/${SLUGS[kind]}`);
      continue;
    }
    const url = `${COMMUNITY_SITE}/${r.municipalitySlug}/${r.slug}/${SLUGS[kind]}`;
    if (url.includes('.html')) throw new Error(`URL con .html en el sitemap: ${url}`);
    urls.push({ url, lastmod: fecha(fs.statSync(archivo).mtimeMs) });
  }
}
if (faltantes.length) {
  throw new Error(
    `Faltan ${faltantes.length} index.html (sitemap no listado):\n  ${faltantes.slice(0, 10).join('\n  ')}` +
    (faltantes.length > 10 ? `\n  … y ${faltantes.length - 10} mas. Ejecutar generar-landings.mjs.` : '')
  );
}

// Directorios en disco que el registro ya no contempla: el sitemap los ignora,
// pero conviene saberlo porque quedarian publicados sin enlace.
const esperadas = new Set(records.map(r => `${r.municipalitySlug}/${r.slug}`));
const sobrantes = [];
for (const muni of fs.readdirSync(outRoot, { withFileTypes: true })) {
  if (!muni.isDirectory()) continue;
  for (const com of fs.readdirSync(path.join(outRoot, muni.name), { withFileTypes: true })) {
    if (!com.isDirectory()) continue;
    if (!esperadas.has(`${muni.name}/${com.name}`)) sobrantes.push(`${muni.name}/${com.name}`);
  }
  const servicios = fs.readdirSync(path.join(outRoot, muni.name), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .flatMap(d => fs.readdirSync(path.join(outRoot, muni.name, d.name), { withFileTypes: true })
      .filter(s => s.isDirectory() && !Object.values(SLUGS).includes(s.name))
      .map(s => `${muni.name}/${d.name}/${s.name}`));
  sobrantes.push(...servicios);
}

urls.sort((a, b) => a.url.localeCompare(b.url, 'en'));
const unicas = new Set(urls.map(u => u.url));
if (unicas.size !== urls.length) throw new Error(`URLs duplicadas en el sitemap: ${urls.length - unicas.size}`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\r
<!-- comunidades.ilatekpr.com — generado por comunidades/scripts/generar-sitemap.mjs.\r
     No editar a mano: se reescribe al regenerar las landings.\r
     ${urls.length} URLs = ${records.length} comunidades x ${KINDS.length} servicios. -->\r
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\r
${urls.map(({ url, lastmod }) => `  <url>\r
    <loc>${url}</loc>\r
    <lastmod>${lastmod}</lastmod>\r
    <changefreq>monthly</changefreq>\r
    <priority>0.6</priority>\r
  </url>`).join('\r\n')}\r
</urlset>\r
`;

fs.writeFileSync(destino, xml, 'utf8');
if (sobrantes.length) {
  console.warn(`Aviso: ${sobrantes.length} rutas en disco fuera del registro (no van al sitemap): ${sobrantes.slice(0, 5).join(', ')}`);
}
console.log(
  `sitemap.xml generado: ${urls.length} URLs (${records.length} comunidades x ${KINDS.length} servicios) ` +
  `en ${path.relative(process.cwd(), destino)}`
);
