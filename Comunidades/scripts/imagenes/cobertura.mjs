// Mide cuántas comunidades tienen una foto REAL y con licencia en Wikimedia
// Commons. No descarga nada: solo consulta la API y escribe un informe con el
// candidato por comunidad y el motivo del descarte.
//
//   node scripts/imagenes/cobertura.mjs            # todas
//   node scripts/imagenes/cobertura.mjs --limite 30
//   node scripts/imagenes/cobertura.mjs --tier LUXURY
//
// La búsqueda es textual y se exige que el nombre de la comunidad aparezca en
// el título o en la descripción del archivo: sin eso, "La Granja Adjuntas"
// devuelve comedias del siglo XIX y PDFs escaneados.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const comunidades = path.resolve(here, '..', '..');
const UA = 'IlatekBot/1.0 (https://ilatekpr.com; contacto@ilatekpr.com)';

const LICENCIAS_OK = /^(cc0|cc by|cc-by|public domain|pd|dominio p)/i;
const RUIDO = /(\.pdf|\.djvu|\.svg|\.ogg|\.webm|\.tif{1,2}$|mapa|map of|flag|bandera|coat of arms|escudo|seal|logo|diagram|plano|satellite|landsat)/i;

const dormir = ms => new Promise(r => setTimeout(r, ms));

async function api(params) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({ format: 'json', origin: '*', ...params }).toString();
  for (let intento = 0; intento < 3; intento++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    await dormir(1500 * (intento + 1));
  }
  throw new Error(`Commons respondió con error para ${url.searchParams.get('srsearch') || url.searchParams.get('titles')}`);
}

// Sin acentos y en minúsculas: "Alturas de Adjuntas" debe casar con "alturas de adjuntas".
const normal = s => String(s ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

// Una palabra del nombre que no sea genérica: así "Residencial Alturas" exige "alturas".
const PALABRAS_GENERICAS = new Set([
  'residencial', 'urbanizacion', 'comunidad', 'barrio', 'sector', 'urbanizaciones', 'extension',
  'de', 'del', 'la', 'las', 'el', 'los', 'y', 'en',
]);

function ancla(nombre) {
  const palabras = normal(nombre).split(/[^a-z0-9]+/).filter(p => p.length > 2 && !PALABRAS_GENERICAS.has(p));
  return palabras.sort((a, b) => b.length - a.length)[0] || null;
}

async function candidatos(comunidad) {
  const consulta = `"${comunidad.name}" ${comunidad.municipality}`;
  const busqueda = await api({
    action: 'query', list: 'search', srsearch: consulta, srnamespace: '6', srlimit: '8',
  });
  const titulos = (busqueda.query?.search || []).map(x => x.title).filter(t => !RUIDO.test(t));
  if (!titulos.length) return { estado: 'sin-resultados', consulta };

  const info = await api({
    action: 'query', titles: titulos.slice(0, 8).join('|'), prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
  });
  const paginas = Object.values(info.query?.pages || {});
  const anclaNombre = ancla(comunidad.name);
  const municipio = normal(comunidad.municipality);

  const validos = [];
  for (const p of paginas) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const meta = ii.extmetadata || {};
    const licencia = meta.LicenseShortName?.value || '';
    const descripcion = `${meta.ImageDescription?.value || ''} ${meta.ObjectName?.value || ''}`;
    const texto = normal(`${p.title} ${descripcion}`);
    const mencionaComunidad = anclaNombre ? texto.includes(anclaNombre) : false;
    const mencionaMunicipio = texto.includes(municipio);

    if (!/^image\/(jpeg|png|webp)$/.test(ii.mime)) continue;
    if (ii.width < 1200) continue;
    if (!LICENCIAS_OK.test(licencia)) continue;
    if (!mencionaComunidad) continue;

    validos.push({
      titulo: p.title,
      url: ii.url,
      ancho: ii.width,
      alto: ii.height,
      licencia,
      autor: (meta.Artist?.value || '').replace(/<[^>]+>/g, '').trim() || 'desconocido',
      pagina: ii.descriptionurl,
      mencionaMunicipio,
    });
  }

  if (!validos.length) return { estado: 'sin-foto-de-la-comunidad', consulta };

  // Preferimos las que además nombran el municipio y el mayor ancho útil.
  validos.sort((a, b) => (b.mencionaMunicipio - a.mencionaMunicipio) || (b.ancho - a.ancho));
  return { estado: 'con-foto', consulta, foto: validos[0], alternativas: validos.length };
}

const args = process.argv.slice(2);
const limite = args.includes('--limite') ? Number(args[args.indexOf('--limite') + 1]) : Infinity;
const tier = args.includes('--tier') ? args[args.indexOf('--tier') + 1] : null;

const db = JSON.parse(fs.readFileSync(path.join(comunidades, 'master-database.json'), 'utf8'));
const todos = (Array.isArray(db) ? db : db.records).filter(r => r.priority !== 'UNVERIFIED');
let lista = tier ? todos.filter(r => r.priority === tier) : todos;
lista = lista.slice(0, limite);

const resultados = [];
let i = 0;
for (const c of lista) {
  i++;
  try {
    const r = await candidatos(c);
    resultados.push({ slug: c.slug, municipality: c.municipality, name: c.name, priority: c.priority, ...r });
  } catch (e) {
    resultados.push({ slug: c.slug, municipality: c.municipality, name: c.name, priority: c.priority, estado: 'error', error: e.message });
  }
  if (i % 10 === 0 || i === lista.length) {
    const con = resultados.filter(r => r.estado === 'con-foto').length;
    console.log(`${i}/${lista.length} · con foto: ${con} · sin foto: ${i - con}`);
  }
  await dormir(400);
}

const informe = path.join(here, 'cobertura.json');
fs.writeFileSync(informe, JSON.stringify(resultados, null, 1), 'utf8');

const cuenta = {};
for (const r of resultados) cuenta[r.estado] = (cuenta[r.estado] || 0) + 1;
console.log('\nResumen:', JSON.stringify(cuenta));
console.log('Informe:', path.relative(process.cwd(), informe));
