import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_PATH = 'blog/data/fotos-tarjetas.json';
const POSTS = JSON.parse(fs.readFileSync('blog/data/posts.json', 'utf8')).posts;
const DATA = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const FOTOS = DATA.fotos;

// Fotos que no son de sellado de techos: no deben usarse ni como relleno.
const BAD = /limpieza|lavado|airbnb|turnover|electrodom|alfombra|organizaci|ventana|mudanza|post-construcci|tragaluz|skylight/i;

const TOPICS = [
  ['silicona', /silicona/i, /silicona/i, 10],
  ['poliuretano', /poliuretano/i, /poliuretano/i, 10],
  ['acrilico', /acr[ií]lico|elast[oó]mer/i, /acr[ií]lico|elast[oó]mer/i, 10],
  ['membrana', /membrana|asf[aá]ltica|l[ií]quida|tpo|pvc|multicapa/i, /membrana|asf[aá]ltica|tpo|pvc/i, 10],
  ['zinc', /zinc|metal|aluminio/i, /zinc|metal/i, 8],
  ['concreto', /concreto|hormigon|losa/i, /concreto/i, 8],
  ['madera', /madera/i, /instalaci[oó]n|reemplazo/i, 8],
  ['teja', /teja|shingle/i, /instalaci[oó]n|reemplazo/i, 8],
  ['asfalto', /asfalto/i, /asf[aá]ltica|membrana/i, 8],
  ['plano', /plano|empozamiento/i, /plano|empozamiento/i, 6],
  ['gotera', /gotera|filtraci[oó]n|grieta/i, /gotera|filtraci[oó]n|grieta/i, 6],
  ['canaleta', /canaleta|bajante/i, /canaleta|bajante/i, 6],
  ['impermeabilizacion', /impermeabiliz/i, /impermeabiliz/i, 6],
  ['inspeccion', /inspecci[oó]n/i, /inspecci[oó]n/i, 4],
  ['mantenimiento', /mantenimiento|cada cu[aá]ntos|prolongar/i, /mantenimiento/i, 4],
  ['comercial', /comercial|condominio|escolar/i, /comercial/i, 4],
  ['industrial', /industrial/i, /industrial/i, 4],
  ['residencial', /residencial|casa/i, /residencial/i, 4],
  ['instalacion', /instalaci[oó]n|reemplazo|madera|teja|shingle/i, /instalaci[oó]n|reemplazo/i, 4],
  ['reflectivo', /reflectivo|energ[ií]a/i, /acr[ií]lico|reflectivo/i, 4]
];

const norm = (s) => String(s)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const postText = (p) => [p.slug, p.h1].join(' ');
const postTopics = (p) => new Map(TOPICS.filter(([, re]) => re.test(postText(p))).map(([k, , , w]) => [k, w]));
const imageTopics = (title) => new Map(TOPICS.filter(([, , re]) => re.test(norm(title))).map(([k, , , w]) => [k, w]));

// Todas las fotos válidas, no solo una por título: así cada tarjeta puede
// recibir una imagen distinta aunque el servicio se repita.
const catalog = Object.entries(FOTOS)
  .map(([slug, f]) => ({ title: f.titulo, slug, file: f.archivo, origen: f.origen }))
  .filter((c) => !BAD.test(c.title));

// Para las tarjetas sin tema de producto (marcas, precios, garantía) se usan
// fotos de servicio general antes que instalación o reemplazo.
const genericOrder = [
  /^Sellado de Techos$/i,
  /^Servicio de Sellado de Techos$/i,
  /^Reparacion de Techos en Puerto Rico$/i,
  /^Servicio de Reparaci[oó]n de Techos$/i,
  /^Todos los Servicios de Mantenimiento de Techos en Puerto Rico$/i,
  /^Servicio de Impermeabilizacion$/i,
  /^Servicio de Inspecci[oó]n/i,
  /^Servicio de Mantenimiento/i
];
const isGeneric = (c) => genericOrder.some((re) => re.test(c.title));

const use = new Map();
const plans = POSTS.map((p) => {
  const pt = postTopics(p);
  const candidates = catalog.map((c) => {
    const it = imageTopics(c.title);
    let score = 0;
    for (const [k, w] of pt) if (it.has(k)) score += w;
    return { ...c, score };
  }).sort((a, b) => b.score - a.score || (use.get(a.slug) || 0) - (use.get(b.slug) || 0) || a.title.localeCompare(b.title));

  // Sin tema: primero una foto genérica de sellado/mantenimiento, luego
  // cualquier foto de techos, siempre la menos usada.
  const fallback = catalog
    .filter(isGeneric)
    .sort((a, b) => (use.get(a.slug) || 0) - (use.get(b.slug) || 0) || a.title.localeCompare(b.title))[0]
    || candidates[0];
  const best = candidates[0].score > 0 ? candidates[0] : { ...fallback, score: 0 };
  use.set(best.slug, (use.get(best.slug) || 0) + 1);
  return { post: p, pick: best, target: FOTOS[p.slug].archivo, score: best.score };
});

const repeats = [...use.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
const fallbacks = plans.filter((p) => p.score === 0);
const badPicks = plans.filter((p) => BAD.test(p.pick.title));

console.log(`posts ${plans.length} · títulos de foto distintos ${use.size} · sin coincidencia ${fallbacks.length} · repetidas ${repeats.length} · fotos no-techos usadas ${badPicks.length}`);
console.log('--- primeras 15 ---');
plans.slice(0, 15).forEach((p) => console.log(`${p.post.slug} -> ${p.pick.title}`));
console.log('--- sin coincidencia (primeras 15) ---');
fallbacks.slice(0, 15).forEach((p) => console.log(`${p.post.slug} -> ${p.pick.title}`));
console.log('--- repetidas ---');
repeats.forEach(([t, n]) => console.log(`${n}x ${t}`));

if (!process.argv.includes('--write')) {
  console.log('DRY RUN: no se escribió nada. Usa --write para aplicar.');
  process.exit(0);
}
if (badPicks.length) {
  console.error('ERROR: hay fotos que no son de techos en la selección.');
  process.exit(1);
}

// Leer todos los buffers antes de sobrescribir para no copiar una imagen ya reemplazada.
const buffers = new Map(Object.entries(FOTOS).map(([slug, f]) => [slug, fs.readFileSync(path.join(ROOT, f.archivo))]));
for (const p of plans) {
  fs.writeFileSync(path.join(ROOT, p.target), buffers.get(p.pick.slug));
  FOTOS[p.post.slug].titulo = p.pick.title;
  FOTOS[p.post.slug].origen = p.pick.origen;
}
DATA.generado = '2026-11-08';
fs.writeFileSync(DATA_PATH, JSON.stringify(DATA, null, 2) + '\n');
console.log('OK: fotos reasignadas y fotos-tarjetas.json actualizado.');
