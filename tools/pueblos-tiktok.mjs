// Ilatek · Serie de TikTok por municipio en Social Planner.
// 2 publicaciones al día (9:00 a.m. y 9:00 p.m. AST) para los 78 pueblos,
// en orden alfabético.
//
// Uso:
//   node tools/pueblos-tiktok.mjs --plan     # valida y escribe .tmp-tiktok-plan.json
//   node tools/pueblos-tiktok.mjs --create   # crea los posts programados
//
// Registro: .tmp-tiktok-ledger.json (un municipio no se repite nunca).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API = 'https://services.leadconnectorhq.com';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '.mcp.json'), 'utf8')).mcpServers.ghl.env;
const PIT = cfg.ZJ_GHL_PIT;
const LOC = cfg.ZJ_GHL_LOCATION;
const USER = 'lrgREN7IQe6y2iRW4Epe';
const VIDEO = 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ac1ac62195f9172ed56568c.mp4';

const H = { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', Accept: 'application/json' };
const AST = 4 * 3600e3;

const MUNICIPIOS = [
  'Adjuntas', 'Aguada', 'Aguadilla', 'Aguas Buenas', 'Aibonito', 'Añasco',
  'Arecibo', 'Arroyo', 'Barceloneta', 'Barranquitas', 'Bayamón', 'Cabo Rojo',
  'Caguas', 'Camuy', 'Canóvanas', 'Carolina', 'Cataño', 'Cayey', 'Ceiba',
  'Ciales', 'Cidra', 'Coamo', 'Comerío', 'Corozal', 'Culebra', 'Dorado',
  'Fajardo', 'Florida', 'Guánica', 'Guayama', 'Guayanilla', 'Guaynabo',
  'Gurabo', 'Hatillo', 'Hormigueros', 'Humacao', 'Isabela', 'Jayuya',
  'Juana Díaz', 'Juncos', 'Lajas', 'Lares', 'Las Marías', 'Las Piedras',
  'Loíza', 'Luquillo', 'Manatí', 'Maricao', 'Maunabo', 'Mayagüez', 'Moca',
  'Morovis', 'Naguabo', 'Naranjito', 'Orocovis', 'Patillas', 'Peñuelas',
  'Ponce', 'Quebradillas', 'Rincón', 'Río Grande', 'Sabana Grande',
  'Salinas', 'San Germán', 'San Juan', 'San Lorenzo', 'San Sebastián',
  'Santa Isabel', 'Toa Alta', 'Toa Baja', 'Trujillo Alto', 'Utuado',
  'Vega Alta', 'Vega Baja', 'Vieques', 'Villalba', 'Yabucoa', 'Yauco',
];

const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');
const sinAcentos = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function hash(s) {
  let x = 5381;
  for (const c of s) x = ((x * 33) ^ c.charCodeAt(0)) >>> 0;
  return x;
}
const pick = (arr, slug, salt) => arr[hash(slug + salt) % arr.length];

// ---- copy (TikTok: gancho corto, 2–3 líneas y hashtags) --------------------
const GANCHO = [
  (m) => `Sellado de techos en ${m} 🛡️ Impermeabilización y waterproofing con productos Conspro.`,
  (m) => `¿Filtraciones en ${m}? 💧 Sellado, impermeabilización y mantenimiento de techos.`,
  (m) => `Techos en ${m} ☔ Sello, membrana e impermeabilización con productos Conspro.`,
  (m) => `${m} 🇵🇷 Sellado e impermeabilización de techos, residencial y comercial.`,
  (m) => `En ${m} cuidamos tu techo 🏠 Sellado, waterproofing y mantenimiento preventivo.`,
  (m) => `${m}: antes de la próxima lluvia 🌧️ Protege el techo con sellado y productos Conspro.`,
];

const CUERPO = [
  'Protección contra filtraciones, humedad y exposición al sol.',
  'Mantenimiento preventivo para que el agua no llegue adentro.',
  'Superficies tratadas y selladas para repeler la lluvia.',
  'Techos de concreto, zinc, asfalto y membranas planas.',
  'Inspección primero, luego el sellado que corresponde.',
  'Residencial y comercial, con productos Conspro.',
];

const CTA = [
  (m, url) => `📅 Agenda hoy 👉 ${url}`,
  (m, url) => `📅 Cotiza tu inspección 👉 ${url}`,
  (m, url) => `📍 Servicio en ${m} y todo Puerto Rico 👉 ${url}`,
];

function build(municipio) {
  const slug = slugify(municipio);
  const url = `https://${slug}.ilatekpr.com/sellado-de-techos`;
  const etiqueta = sinAcentos(municipio).replace(/\s+/g, '');
  const summary = [
    pick(GANCHO, slug, 'gancho')(municipio),
    pick(CUERPO, slug, 'cuerpo'),
    pick(CTA, slug, 'cta')(municipio, url),
    '',
    `#SelladoDeTechos #${etiqueta} #PuertoRico #Impermeabilizacion #Conspro #Waterproofing #Techos`,
  ].join('\n');
  return { municipio, slug, url, summary };
}

// ---- cola ----------------------------------------------------------------
const posts = MUNICIPIOS.slice()
  .sort((a, b) => a.localeCompare(b, 'es'))
  .map(build);

const problemas = [];
const vistos = new Set();
for (const p of posts) {
  if (p.summary.length > 2200) problemas.push(`${p.slug}: caption ${p.summary.length} > 2200`);
  if (!p.summary.includes(p.municipio)) problemas.push(`${p.slug}: falta el municipio`);
  if (!p.summary.includes(p.url)) problemas.push(`${p.slug}: falta el enlace`);
  if (!/#SelladoDeTechos/.test(p.summary)) problemas.push(`${p.slug}: faltan hashtags`);
  if (vistos.has(p.summary)) problemas.push(`${p.slug}: caption duplicado`);
  vistos.add(p.summary);
}
console.log(`municipios: ${posts.length} | problemas: ${problemas.length}`);
problemas.slice(0, 10).forEach((x) => console.log('  !', x));
if (problemas.length) process.exit(1);
console.log(`captions únicos: ${vistos.size}/${posts.length}`);
console.log(`primero: ${posts[0].municipio} | último: ${posts[posts.length - 1].municipio}`);

// ---- calendario: 2 al día, 9:00 a.m. y 9:00 p.m. AST ----------------------
const SLOTS = ['09:00', '21:00'];
const astToUtc = (fecha, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const [y, mo, d] = fecha.split('-').map(Number);
  return Date.UTC(y, mo - 1, d, h + 4, m);
};
const fechaAst = (ms) => new Date(ms - AST).toISOString().slice(0, 10);
const ast = (iso) => new Date(Date.parse(iso) - AST).toISOString().replace('T', ' ').slice(0, 16) + ' AST';

function agenda(count) {
  const out = [];
  const dia0 = fechaAst(Date.now());
  for (let d = 0; out.length < count && d < 200; d++) {
    const fecha = new Date(Date.parse(dia0 + 'T12:00:00Z') + d * 86400e3).toISOString().slice(0, 10);
    for (const hhmm of SLOTS) {
      const ms = astToUtc(fecha, hhmm);
      if (ms <= Date.now() + 5 * 60e3) continue;
      out.push(new Date(ms).toISOString());
      if (out.length >= count) break;
    }
  }
  return out;
}

const slots = agenda(posts.length);
if (slots.length < posts.length) throw new Error(`solo ${slots.length} franjas para ${posts.length} posts`);
const plan = posts.map((p, i) => ({ ...p, at: slots[i] }));

const dias = {};
for (const p of plan) {
  const d = fechaAst(Date.parse(p.at));
  dias[d] = (dias[d] || 0) + 1;
}
console.log(`\nagenda: ${ast(plan[0].at)} → ${ast(plan[plan.length - 1].at)}`);
console.log(`días: ${Object.keys(dias).length} | por día: ${[...new Set(Object.values(dias))].join(',')}`);
plan.slice(0, 4).forEach((p) => console.log(`  ${ast(p.at)}  ${p.municipio}`));

const modo = process.argv[2] || '--plan';
if (modo === '--plan') {
  fs.writeFileSync(path.join(ROOT, '.tmp-tiktok-plan.json'), JSON.stringify(plan, null, 2));
  console.log('\n--- muestra ---\n' + plan[0].summary + '\n\n--- segunda ---\n' + plan[1].summary);
  process.exit(0);
}

// ---- crear ---------------------------------------------------------------
const acc = await (await fetch(`${API}/social-media-posting/${LOC}/accounts`, { headers: H })).json();
const cuenta = acc.results.accounts.find((a) => a.platform === 'tiktok');
if (!cuenta) throw new Error('no hay cuenta de TikTok conectada');
if (!cuenta.active || cuenta.isExpired) throw new Error(`cuenta de TikTok inactiva/expirada: ${cuenta.expire}`);
console.log(`\ncuenta: ${cuenta.name} (${cuenta.type}) activa hasta ${cuenta.expire}`);

const LEDGER = path.join(ROOT, '.tmp-tiktok-ledger.json');
const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : { posts: {} };
ledger.posts ||= {};
const guardar = () => {
  ledger.generado = new Date().toISOString();
  ledger.zona = 'America/Puerto_Rico (AST, UTC-4)';
  ledger.video = VIDEO;
  ledger.cuenta = cuenta.id;
  ledger.franjas = SLOTS;
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
};

let ok = 0;
let saltados = 0;
const fallos = [];
for (const p of plan) {
  if (ledger.posts[p.slug]?.id) { saltados++; continue; }
  const body = {
    accountIds: [cuenta.id],
    summary: p.summary,
    media: [{ url: VIDEO, type: 'video/mp4' }],
    status: 'scheduled',
    scheduleDate: p.at,
    type: 'post',
    userId: USER,
    createdBy: USER,
    tiktokPostDetails: { privacyLevel: 'PUBLIC_TO_EVERYONE' },
  };
  try {
    const enviar = () => fetch(`${API}/social-media-posting/${LOC}/posts`, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let res = await enviar();
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 2500));
      res = await enviar();
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 220)}`);
    const saved = json.results?.post || json.post || {};
    if (saved.status && saved.status !== 'scheduled') throw new Error(`quedó en ${saved.status}`);
    ledger.posts[p.slug] = { id: saved._id, at: p.at, status: 'scheduled' };
    guardar();
    ok++;
    console.log(`ok ${ast(p.at)}  ${p.municipio}  ${saved._id}`);
  } catch (e) {
    fallos.push(`${p.municipio}: ${e.message}`);
    console.log(`FALLO ${p.municipio}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 350));
}
guardar();
console.log(`\ncreados: ${ok} | ya existían: ${saltados} | fallos: ${fallos.length}`);
fallos.slice(0, 10).forEach((f) => console.log('  !', f));
process.exit(fallos.length ? 1 : 0);
