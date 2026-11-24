// Ilatek · Serie de LIMPIEZA en Google Business Profile (GMB no acepta video).
// Usa la tarjeta generada en shots/gmb-limpieza/cards/ y el calendario de la serie.
//
// Uso:
//   node tools/pueblos-limpieza-gmb.mjs --plan
//   node tools/pueblos-limpieza-gmb.mjs --create [--limit N]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API = 'https://services.leadconnectorhq.com';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '.mcp.json'), 'utf8')).mcpServers.ghl.env;
const PIT = cfg.ZJ_GHL_PIT;
const LOC = cfg.ZJ_GHL_LOCATION;
const USER = 'lrgREN7IQe6y2iRW4Epe';
const AST = 4 * 3600e3;

const GOOGLE = '6ab039f0dd6ff043728d0614_8OxUENFVM60EKzqsTcoD_12294364361346557718';
const CARD_DIR = path.join(ROOT, 'shots/gmb-limpieza/cards');
const STATE = path.join(ROOT, '.tmp-limpieza-gmb.json');

const plan = JSON.parse(fs.readFileSync(path.join(ROOT, '.tmp-limpieza-plan.json'), 'utf8'));
const ledgerFile = path.join(ROOT, '.tmp-limpieza-ledger.json');
const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : { posts: {} };

const estado = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { media: {}, posts: {} };
estado.media ||= {};
estado.posts ||= {};
const guardar = () => {
  estado.generado = new Date().toISOString();
  fs.writeFileSync(STATE, JSON.stringify(estado, null, 2));
};

const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');
const hash = (s) => {
  let x = 5381;
  for (const c of s) x = ((x * 33) ^ c.charCodeAt(0)) >>> 0;
  return x;
};
const pick = (arr, key, salt) => arr[hash(key + salt) % arr.length];

const INTRO = [
  (m, l) => `${l.nombre} en ${m} con ILATEK Property Solutions: ${l.que}. Coordinamos la visita y trabajamos sobre lo que la propiedad realmente necesita.`,
  (m, l) => `ILATEK Property Solutions ofrece ${l.nombre.toLowerCase()} en ${m}. El servicio cubre ${l.que}, con un equipo propio que llega a la propiedad.`,
  (m, l) => `Para propiedades en ${m}, ${l.nombre.toLowerCase()} de ILATEK Property Solutions incluye ${l.que}. La limpieza se ajusta al tamaño y al estado del espacio.`,
  (m, l) => `${l.nombre} en ${m}: ${l.que}. Lo atiende el equipo de ILATEK Property Solutions, con coordinación directa antes de cada visita.`,
];

const VALOR = [
  'La limpieza periódica reduce polvo y alérgenos, protege las superficies y evita que el desorden se convierta en deterioro.',
  'El polvo y la humedad acumulados dañan pisos, muebles y acabados; mantener la limpieza al día alarga la vida de la propiedad.',
  'Cada espacio se ensucia distinto: no es lo mismo una casa habitada, una oficina en operación o un alquiler que cambia de huésped cada semana.',
  'La constancia es lo que mantiene el resultado: una limpieza profunda deja el espacio a punto y el mantenimiento evita que se acumule de nuevo.',
];

const gmbText = (municipio, landing, url) => {
  const key = slugify(municipio);
  return [
    `🧽 ${landing.nombre} en ${municipio}`,
    '',
    pick(INTRO, key, 'intro')(municipio, landing),
    '',
    pick(VALOR, key, 'valor'),
    '',
    `📍 ${municipio}, Puerto Rico`,
    `📅 Agenda hoy: ${url}`,
  ].join('\n');
};

const items = plan.map((p) => {
  const m = p.municipio;
  const card = path.join(CARD_DIR, `${slugify(m)}--${p.landing.slug}.png`);
  const at = ledger.posts?.[m]?.at || p.at;
  return {
    municipio: m,
    landing: p.landing,
    url: p.url,
    at,
    card,
    texto: gmbText(m, p.landing, p.url),
  };
});

const ast = (iso) => new Date(Date.parse(iso) - AST).toISOString().replace('T', ' ').slice(0, 16) + ' AST';

const problemas = [];
for (const it of items) {
  if (!fs.existsSync(it.card)) problemas.push(`${it.municipio}: falta ${path.basename(it.card)}`);
  if (it.texto.length > 1450) problemas.push(`${it.municipio}: texto ${it.texto.length} > 1450`);
  if (!it.texto.includes(it.url)) problemas.push(`${it.municipio}: falta enlace`);
  if (!it.texto.toLowerCase().includes(it.landing.nombre.toLowerCase())) problemas.push(`${it.municipio}: no cita el servicio`);
}
console.log(`gmb: ${items.length} | problemas: ${problemas.length}`);
problemas.slice(0, 8).forEach((x) => console.log('  !', x));
const largos = items.map((i) => i.texto.length);
console.log(`texto: min ${Math.min(...largos)} / max ${Math.max(...largos)} caracteres`);
console.log(`únicos: ${new Set(items.map((i) => i.texto)).size}/${items.length}`);
console.log(`primera: ${ast(items[0].at)}  ${items[0].municipio} · ${items[0].landing.nombre}`);
console.log(`última:  ${ast(items[items.length - 1].at)}  ${items[items.length - 1].municipio}`);
if (problemas.length) process.exit(1);

const modo = process.argv[2] || '--plan';
if (modo === '--plan') {
  console.log('\n--- muestra (Google Business Profile) ---\n' + items[0].texto);
  process.exit(0);
}

// ---- subir imagen ---------------------------------------------------------
async function subir(it) {
  if (estado.media[it.municipio]) return estado.media[it.municipio];
  const nombre = `gmb-${slugify(it.municipio)}--${it.landing.slug}.png`;
  const form = new FormData();
  form.append('locationId', LOC);
  form.append('name', nombre);
  form.append('type', 'image');
  form.append('file', new Blob([fs.readFileSync(it.card)], { type: 'image/png' }), nombre);
  const res = await fetch(`${API}/medias/upload-file`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', Accept: 'application/json' },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(`${it.municipio} subida: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  estado.media[it.municipio] = json.url;
  guardar();
  return json.url;
}

// ---- crear post -----------------------------------------------------------
async function crear(it, mediaUrl) {
  const body = {
    accountIds: [GOOGLE],
    media: [{ url: mediaUrl, type: 'image/png' }],
    status: 'scheduled',
    type: 'post',
    userId: USER,
    createdBy: USER,
    scheduleDate: it.at,
    summary: it.texto,
  };
  const enviar = () => fetch(`${API}/social-media-posting/${LOC}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let res = await enviar();
  if (res.status === 429 || res.status >= 500) {
    await new Promise((r) => setTimeout(r, 2500));
    res = await enviar();
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${it.municipio} GMB: ${res.status} ${JSON.stringify(json).slice(0, 300)}`);
  const saved = json.results?.post || json.post || {};
  if (!saved._id) throw new Error(`${it.municipio} GMB: respuesta sin id ${JSON.stringify(json).slice(0, 200)}`);
  if (saved.status && saved.status !== 'scheduled') throw new Error(`${it.municipio} GMB: quedó en ${saved.status}`);
  return saved;
}

// ---- verificar ------------------------------------------------------------
async function verificar(id) {
  const res = await fetch(`${API}/social-media-posting/${LOC}/posts/${id}`, {
    headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', Accept: 'application/json' },
  });
  const json = await res.json().catch(() => ({}));
  const p = json.results?.post || json.post || json;
  return p;
}

const ahora = Date.now();
const limiteIdx = process.argv.indexOf('--limit');
const limite = limiteIdx > -1 ? Number(process.argv[limiteIdx + 1]) : Infinity;

let ok = 0;
const fallos = [];
let intentos = 0;
for (const it of items) {
  if (intentos >= limite) break;
  intentos++;
  if (estado.posts[it.municipio]) continue;
  if (Date.parse(it.at) <= ahora) {
    fallos.push(`${it.municipio}: fecha vencida (${ast(it.at)})`);
    console.log(`SALTO ${it.municipio}: ${ast(it.at)} ya pasó`);
    continue;
  }
  try {
    const mediaUrl = await subir(it);
    const saved = await crear(it, mediaUrl);
    estado.posts[it.municipio] = { id: saved._id, at: it.at, media: mediaUrl, landing: it.landing.slug, url: it.url };
    guardar();
    const check = await verificar(saved._id);
    const mediaOk = JSON.stringify(check.media || '').includes(mediaUrl.slice(-24));
    if (check.status !== 'scheduled' || !mediaOk) {
      throw new Error(`${it.municipio} verificación: status=${check.status} media=${mediaOk}`);
    }
    ok++;
    console.log(`ok ${ast(it.at)}  ${it.municipio} · ${it.landing.slug}`);
  } catch (e) {
    fallos.push(e.message);
    console.log(`FALLO ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 350));
}
guardar();
console.log(`\ncreados: ${ok} | ya existían: ${Object.keys(estado.posts).length - ok} | fallos: ${fallos.length}`);
fallos.slice(0, 8).forEach((f) => console.log('  !', f));
process.exit(fallos.length ? 1 : 0);
