// Genera data/mapa-comunidades.json: la fuente de datos del mapa de comunidades
// del Home y del indice del subdominio comunidades.ilatekpr.com.
//
// Entradas:
//   master-database.json          -> comunidades verificadas (564) y su prioridad
//   regiones.json                 -> region de servicio de cada municipio
//   data/_coordenadas-municipios.json -> punto de cada municipio (Wikipedia)
//   data/_coordenadas-comunidades.json -> punto de cada comunidad LUXURY (OSM)
//
// Regla: si una comunidad no tiene punto propio verificado, NO se inventa uno:
// se marca como aproximada y el mapa la lista dentro de su municipio.
// El punto propio sale de OpenStreetMap y solo se acepta si el nombre coincide
// exactamente y el punto cae dentro del poligono del municipio.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const db = read('master-database.json');
const records = Array.isArray(db) ? db : db.records;
const regiones = read('regiones.json');
const muniCoords = read('data/_coordenadas-municipios.json');
const comCoords = read('data/_coordenadas-comunidades.json').comunidades;

const SITE = 'https://comunidades.ilatekpr.com';
const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// regiones.json y master-database.json identifican el municipio por slug, pero
// no siempre con la misma grafia. Se resuelve por slug y, si no aparece, por
// nombre normalizado, para que ningun municipio se quede sin comunidades.
const masterBySlug = new Map(records.map(r => [r.municipalitySlug, r]));
const masterByName = new Map(records.map(r => [norm(r.municipality), r]));
const muniName = {};
const muniRegion = {};
for (const region of regiones.regions) {
  for (const slug of region.municipios) muniRegion[slug] = region.slug;
}
for (const r of records) muniName[r.municipalitySlug] = r.municipality;

// Comunidades por municipio con su estado de publicacion.
const byMuni = new Map();
for (const r of records) {
  const entry = {
    slug: r.slug,
    name: r.name,
    priority: r.priority,
    status: r.landingStatus,
    published: r.landingStatus === 'NEW',
    services: String(r.relevantServices || '').split(';').map(s => s.trim()).filter(Boolean),
  };
  if (!byMuni.has(r.municipalitySlug)) byMuni.set(r.municipalitySlug, []);
  byMuni.get(r.municipalitySlug).push(entry);
}

// Conteos de comunidades conocidas por municipio (todas las prioridades).
const knownByMuni = new Map();
for (const r of records) knownByMuni.set(r.municipalitySlug, (knownByMuni.get(r.municipalitySlug) || 0) + 1);

const regions = regiones.regions.map(region => ({
  slug: region.slug,
  label: region.label,
  labelEn: region.labelEn || region.label,
  municipalities: region.municipios.map(slug => {
    const rec = masterBySlug.get(slug) || masterByName.get(norm(slug));
    const masterSlug = rec ? rec.municipalitySlug : slug;
    const name = rec ? rec.municipality : (muniName[slug] || slug);
    const coord = muniCoords[masterSlug] || muniCoords[slug] || null;
    const communities = (byMuni.get(masterSlug) || []).sort((a, b) => a.name.localeCompare(b.name))
      .map(c => {
        const point = comCoords[c.slug] || {};
        return {
          slug: c.slug,
          name: c.name,
          url: `${SITE}/${masterSlug}/${c.slug}`,
          services: c.services,
          published: c.published,
          priority: c.priority,
          lat: point.lat ?? null,
          lon: point.lon ?? null,
          accuracy: point.status || 'sin-coordenada',
        };
      });
    return {
      slug: masterSlug,
      name,
      lat: coord ? coord.lat : null,
      lon: coord ? coord.lon : null,
      communitiesKnown: knownByMuni.get(masterSlug) || 0,
      communitiesPublished: communities.filter(c => c.published).length,
      communities,
    };
  }),
}));

const allCommunities = regions.flatMap(r => r.municipalities.flatMap(m => m.communities));
const published = allCommunities.filter(c => c.published);
const exact = published.filter(c => c.accuracy === 'exacta');

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  site: SITE,
  source: {
    municipalities: 'Wikipedia (coordenadas de la infobox)',
    communities: 'OpenStreetMap (Overpass y Nominatim), validado contra el poligono del municipio',
  },
  totals: {
    municipalities: regions.reduce((n, r) => n + r.municipalities.length, 0),
    communitiesKnown: records.length,
    communitiesPublished: published.length,
    communitiesWithExactPoint: exact.length,
  },
  regions,
};

fs.writeFileSync(path.join(root, 'data', 'mapa-comunidades.json'), JSON.stringify(out, null, 1) + '\n', 'utf8');
console.log(`mapa-comunidades.json: ${out.totals.communitiesPublished} comunidades publicadas de ${out.totals.communitiesKnown} · ${exact.length} con punto exacto · ${out.totals.municipalities} municipios`);
