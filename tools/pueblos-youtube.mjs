// Ilatek · Serie de YouTube por municipio en Social Planner.
// Un video por hora, en orden alfabético, desde el primer municipio pendiente.
//
// Uso:
//   node tools/pueblos-youtube.mjs --plan     # valida y escribe .tmp-youtube-plan.json
//   node tools/pueblos-youtube.mjs --create   # crea los posts programados
//   node tools/pueblos-youtube.mjs --create --limit 3
//
// Registro: .tmp-youtube-ledger.json (un municipio no se repite nunca).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API = 'https://services.leadconnectorhq.com';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '.mcp.json'), 'utf8')).mcpServers.ghl.env;
const PIT = cfg.ZJ_GHL_PIT;
const LOC = cfg.ZJ_GHL_LOCATION;
const USER = 'lrgREN7IQe6y2iRW4Epe';
const YT = '6ab421183903f7c7e5fe9439_8OxUENFVM60EKzqsTcoD_UCIjm2P75StmlI9TMEn8EDaw_profile';
const VIDEO = 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ac1ac62195f9172ed56568c.mp4';

const H = { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', Accept: 'application/json' };
const HOUR = 3600e3;
const AST = 4 * HOUR;

// 78 municipios oficiales, en español con acentos.
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

// Municipios ya publicados en YouTube (lista del propietario).
const YA_PUBLICADOS = [
  'Arroyo', 'Barceloneta', 'Barranquitas', 'Bayamón', 'Cabo Rojo', 'Caguas',
  'Camuy', 'Canóvanas', 'Cataño', 'Adjuntas', 'Aguada', 'Aguadilla',
  'Aguas Buenas', 'Aibonito', 'Añasco', 'Arecibo', 'Carolina', 'Gurabo',
  'San Lorenzo', 'Trujillo Alto',
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

// ---- copy -----------------------------------------------------------------
const INTRO = [
  (m) => `En ${m}, ILATEK Property Solutions trabaja el sellado y la impermeabilización de techos con productos Conspro, formulados para proteger la superficie del techo y frenar la entrada de agua.`,
  (m) => `ILATEK Property Solutions atiende ${m} con sellado, impermeabilización y mantenimiento de techos. Utilizamos productos Conspro, pensados para reforzar la protección de la superficie y reducir las filtraciones.`,
  (m) => `Para las propiedades en ${m}, ILATEK Property Solutions ofrece sellado e impermeabilización de techos. Los productos Conspro que aplicamos están orientados a proteger el techo y a mantener el agua fuera de la estructura.`,
  (m) => `El sellado de techos en ${m} es parte del trabajo de ILATEK Property Solutions: impermeabilización, mantenimiento y protección de superficies con productos Conspro, diseñados para resistir la exposición al agua y al sol.`,
  (m) => `ILATEK Property Solutions acompaña a los dueños de propiedad en ${m} con soluciones de sellado e impermeabilización de techos, apoyadas en productos Conspro para proteger la superficie y prevenir filtraciones.`,
];

const IMPORTANCIA = [
  `El mantenimiento preventivo del techo es lo que evita que un problema pequeño se convierta en una filtración costosa. La lluvia, la humedad constante y la exposición directa al sol van abriendo grietas y desgastando las capas de protección, y por ahí entra el agua que después aparece como manchas en el techo interior o en las paredes.`,
  `Un techo sin mantenimiento pierde primero la capa protectora y después la capacidad de repeler el agua. Entre la lluvia, la humedad y el sol, las superficies se cuartean y las filtraciones encuentran paso. Revisar y sellar a tiempo cuesta menos que reparar lo que el agua ya dañó.`,
  `La humedad es el enemigo silencioso de cualquier propiedad. Cuando el agua se filtra por el techo, el daño no se queda arriba: alcanza el cielo raso, el aislamiento y la estructura. El mantenimiento preventivo y el sellado a tiempo mantienen la superficie protegida contra la lluvia y la exposición al sol.`,
  `Entre el sol que cuartea y la lluvia que se filtra, el techo es la parte de la propiedad que más castigo recibe. Un programa de mantenimiento preventivo, con limpieza de superficie y sellado, prolonga la vida útil del techo y reduce el riesgo de filtraciones y humedad dentro de la estructura.`,
];

const SERVICIOS_A = [
  'Sellado e impermeabilización de techos',
  'Waterproofing de techos',
  'Protección contra filtraciones',
  'Reparación y mantenimiento de techos',
  'Tratamiento de superficies de techo',
  'Aplicación de productos Conspro',
  'Soluciones para techos residenciales y comerciales',
];
const SERVICIOS_B = [
  'Sellado de techos e impermeabilización de superficies',
  'Waterproofing para techos en Puerto Rico',
  'Protección contra filtraciones y humedad',
  'Mantenimiento y reparación de techos',
  'Tratamiento y preparación de superficies de techo',
  'Aplicación de sistemas y productos Conspro',
  'Techos residenciales, comerciales e industriales',
];

const SEO_1 = [
  (m) => `Si buscas sellado de techos en ${m}, en ILATEK Property Solutions atendemos techos residenciales y comerciales con un enfoque directo: revisar la superficie, identificar los puntos por donde puede entrar el agua y aplicar el sistema de impermeabilización que corresponda.`,
  (m) => `Para impermeabilización de techos en ${m}, ILATEK Property Solutions evalúa la condición del techo y aplica sellado y productos Conspro sobre las áreas expuestas, con el objetivo de mantener la superficie protegida y reducir el riesgo de filtraciones.`,
  (m) => `El sellado de techos en ${m} requiere mirar más allá de la mancha visible. En ILATEK Property Solutions revisamos la superficie del techo para encontrar los puntos de entrada de agua antes de aplicar el sellador o la membrana de impermeabilización.`,
  (m) => `En ${m}, el waterproofing de techos se trabaja sobre la superficie que recibe toda la lluvia. ILATEK Property Solutions prepara el área, corrige lo que impide una buena adherencia y aplica el sistema de sellado con productos Conspro.`,
];

const SEO_2 = [
  `La impermeabilización de techos en Puerto Rico tiene un reto adicional: sol intenso, lluvia frecuente y cambios de temperatura que castigan la superficie. Por eso el mantenimiento de techos debe ser parte del plan de la propiedad y no solo una reacción cuando ya hay goteras. El waterproofing y la reparación de filtraciones funcionan mejor cuando se atienden a tiempo.`,
  `El mantenimiento de techos en Puerto Rico no es un lujo: es la diferencia entre una filtración atendida a tiempo y un daño que alcanza el interior de la propiedad. Con el clima de la isla, el waterproofing y la protección de superficies son parte del cuidado básico de todo techo, residencial o comercial.`,
  `La reparación de filtraciones empieza por entender de dónde viene el agua. En el clima de Puerto Rico, la combinación de lluvia y sol constante hace que el waterproofing y el mantenimiento de techos sean tareas periódicas, no un arreglo de una sola vez. Proteger la superficie es proteger toda la propiedad.`,
  `Con lluvia frecuente y sol fuerte durante todo el año, el mantenimiento de techos en Puerto Rico debe ser preventivo. El sellado y el waterproofing mantienen la superficie preparada para repeler el agua, y la reparación de filtraciones a tiempo evita que el problema llegue al interior de la propiedad.`,
];

function items(slug) {
  const skip = hash(slug + 'skip') % 7;
  const usarB = hash(slug + 'ab') % 2 === 1;
  const fuente = usarB ? SERVICIOS_B : SERVICIOS_A;
  return fuente.filter((_, i) => i !== skip).slice(0, 6).map((s) => `• ${s}`).join('\n');
}

const TITULOS = [
  (m) => `Sellado de Techos en ${m} Puerto Rico | ILATEK Property Solutions`,
  (m) => `Sellado de Techos en ${m} Puerto Rico | ILATEK Property Solutions`,
  (m) => `Sellado de Techos en ${m} Puerto Rico | ILATEK Property Solutions`,
  (m) => `Sellado e Impermeabilización de Techos en ${m}, Puerto Rico | ILATEK`,
  (m) => `Sellado de Techos en ${m}, PR | ILATEK Property Solutions`,
];

function build(municipio) {
  const slug = slugify(municipio);
  const url = `https://${slug}.ilatekpr.com/sellado-de-techos`;
  const titulo = pick(TITULOS, slug, 'title')(municipio);
  const descripcion = [
    `📅 Sellado de Techos en Puerto Rico Agenda Hoy 👉🏼 ${url}`,
    'Atendemos Todo 🇵🇷 Puerto Rico',
    '',
    pick(INTRO, slug, 'intro')(municipio),
    '',
    pick(IMPORTANCIA, slug, 'imp'),
    '',
    'SERVICIOS:',
    items(slug),
    '',
    pick(SEO_1, slug, 'seo1')(municipio),
    '',
    pick(SEO_2, slug, 'seo2'),
    '',
    `📍 Servicio en ${municipio}, Puerto Rico`,
    '🏠 Techos residenciales y comerciales',
    '🛠️ Sellado e impermeabilización de techos',
    '🔹 Productos Conspro',
    '',
    'ILATEK Property Solutions — Protegiendo tu propiedad desde el techo.',
    '',
    `#SelladoDeTechos #PuertoRico #ImpermeabilizacionDeTechos #${sinAcentos(municipio).replace(/\s+/g, '')} #Waterproofing #Conspro #Filtraciones #MantenimientoDeTechos #TechosResidenciales #TechosComerciales #ILATEK #PropertySolutions`,
  ].join('\n');
  return { municipio, slug, url, titulo, descripcion };
}

// ---- cola ----------------------------------------------------------------
const hechos = new Set(YA_PUBLICADOS.map(slugify));
const pendientes = MUNICIPIOS.slice()
  .sort((a, b) => a.localeCompare(b, 'es'))
  .filter((m) => !hechos.has(slugify(m)));
const posts = pendientes.map(build);

// ---- validación ----------------------------------------------------------
const problemas = [];
const vistos = new Set();
for (const p of posts) {
  if (p.titulo.length > 100) problemas.push(`${p.slug}: título ${p.titulo.length} > 100`);
  if (p.descripcion.length > 5000) problemas.push(`${p.slug}: descripción ${p.descripcion.length} > 5000`);
  if (!p.titulo.includes(p.municipio)) problemas.push(`${p.slug}: falta el municipio en el título`);
  if (!p.descripcion.includes(p.url)) problemas.push(`${p.slug}: falta el enlace local`);
  if (!/#SelladoDeTechos/.test(p.descripcion)) problemas.push(`${p.slug}: faltan hashtags`);
  if (vistos.has(p.descripcion)) problemas.push(`${p.slug}: descripción duplicada`);
  vistos.add(p.descripcion);
}
console.log(`municipios: ${MUNICIPIOS.length} | publicados: ${YA_PUBLICADOS.length} | pendientes: ${posts.length}`);
console.log(`problemas: ${problemas.length}`);
problemas.slice(0, 10).forEach((x) => console.log('  !', x));
if (problemas.length) process.exit(1);
console.log(`descripciones únicas: ${vistos.size}/${posts.length}`);
console.log(`primero: ${posts[0].municipio} | último: ${posts[posts.length - 1].municipio}`);

// ---- calendario: una por hora -------------------------------------------
const inicio = process.env.START ? Date.parse(process.env.START) : Math.ceil(Date.now() / HOUR) * HOUR;
const agenda = posts.map((p, i) => ({ ...p, at: new Date(inicio + i * HOUR).toISOString() }));
const ast = (iso) => new Date(Date.parse(iso) - AST).toISOString().replace('T', ' ').slice(0, 16) + ' AST';
console.log(`\nagenda: ${ast(agenda[0].at)} → ${ast(agenda[agenda.length - 1].at)} (${agenda.length} horas)`);
agenda.slice(0, 5).forEach((p) => console.log(`  ${ast(p.at)}  ${p.municipio}`));

const modo = process.argv[2] || '--plan';
const PLAN = path.join(ROOT, '.tmp-youtube-plan.json');

if (modo === '--plan') {
  fs.writeFileSync(PLAN, JSON.stringify(agenda, null, 2));
  console.log(`\nplan: ${PLAN}`);
  console.log('\n--- muestra 1 ---\n' + agenda[0].titulo + '\n\n' + agenda[0].descripcion);
  console.log('\n--- muestra 2 ---\n' + agenda[1].titulo + '\n\n' + agenda[1].descripcion);
  process.exit(0);
}

// ---- reprogramar dentro de los límites ------------------------------------
// YouTube: videos.insert cuesta 1.600 unidades de una cuota diaria de 10.000,
// o sea ~6 subidas al día, y la cuota reinicia a medianoche del Pacífico.
// Se programan 5 al día (margen de 1) y todas las franjas caen en la misma
// fecha del Pacífico: 09:00–19:00 AST = 05:00–15:00 PST.
const SLOTS = ['09:00', '11:30', '14:00', '16:30', '19:00'];
const astToUtc = (fecha, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const [y, mo, d] = fecha.split('-').map(Number);
  return Date.UTC(y, mo - 1, d, h + 4, m);
};
const fechaAst = (ms) => new Date(ms - AST).toISOString().slice(0, 10);

function agendaSegura(count) {
  const out = [];
  const dia0 = fechaAst(Date.now());
  for (let d = 0; out.length < count && d < 90; d++) {
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

// ---- crear ---------------------------------------------------------------
const LEDGER = path.join(ROOT, '.tmp-youtube-ledger.json');
const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : { posts: {} };
ledger.posts ||= {};
const guardar = () => {
  ledger.generado = new Date().toISOString();
  ledger.zona = 'America/Puerto_Rico (AST, UTC-4)';
  ledger.video = VIDEO;
  ledger.cuenta = YT;
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
};

if (modo === '--reschedule') {
  const orden = Object.keys(ledger.posts);
  const slots = agendaSegura(orden.length);
  if (slots.length < orden.length) throw new Error(`solo ${slots.length} franjas para ${orden.length} posts`);
  console.log(`reprogramando ${orden.length} posts en ${slots.length} franjas: 5 al día, hora de Puerto Rico`);
  let movidos = 0;
  let publicados = 0;
  const fallosRe = [];
  for (const [i, slug] of orden.entries()) {
    const rec = ledger.posts[slug];
    const nuevo = slots[i];
    try {
      const cur = await fetch(`${API}/social-media-posting/${LOC}/posts/${rec.id}`, { headers: H });
      const cj = await cur.json().catch(() => ({}));
      const cp = cj.results?.post || cj.post || cj;
      if (cp.status && cp.status !== 'scheduled') {
        publicados++;
        console.log(`omito ${slug}: ${cp.status}`);
        continue;
      }
      const body = {
        accountIds: [YT],
        summary: cp.summary,
        media: cp.media,
        status: 'scheduled',
        scheduleDate: nuevo,
        type: 'post',
        userId: USER,
        createdBy: USER,
        youtubePostDetails: { type: 'video', title: cp.youtubePostDetails?.title || rec.titulo },
      };
      const res = await fetch(`${API}/social-media-posting/${LOC}/posts/${rec.id}`, {
        method: 'PUT', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 180)}`);
      const saved2 = json.results?.post || json.post || {};
      if (saved2.status && saved2.status !== 'scheduled') throw new Error(`quedó en ${saved2.status}`);
      const at = saved2.scheduleDate || nuevo;
      ledger.posts[slug] = { ...rec, at, status: 'scheduled' };
      guardar();
      movidos++;
      console.log(`ok ${ast(at)}  ${slug}`);
    } catch (e) {
      fallosRe.push(`${slug}: ${e.message}`);
      console.log(`FALLO ${slug}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`\nmovidos: ${movidos} | ya publicados: ${publicados} | fallos: ${fallosRe.length}`);
  fallosRe.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fallosRe.length ? 1 : 0);
}

const limiteIdx = process.argv.indexOf('--limit');
const limite = limiteIdx > -1 ? Number(process.argv[limiteIdx + 1]) : Infinity;

let ok = 0;
let saltados = 0;
const fallos = [];
for (const p of agenda) {
  if (ok >= limite) break;
  if (ledger.posts[p.slug]?.id) { saltados++; continue; }
  const body = {
    accountIds: [YT],
    summary: p.descripcion,
    media: [{ url: VIDEO, type: 'video/mp4' }],
    status: 'scheduled',
    scheduleDate: p.at,
    type: 'post',
    userId: USER,
    createdBy: USER,
    youtubePostDetails: { type: 'video', title: p.titulo },
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
    ledger.posts[p.slug] = { id: saved._id, at: p.at, titulo: p.titulo, status: 'scheduled' };
    guardar();
    ok++;
    console.log(`ok ${ast(p.at)}  ${p.municipio}  ${saved._id}`);
  } catch (e) {
    fallos.push(`${p.municipio}: ${e.message}`);
    console.log(`FALLO ${p.municipio}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 400));
}
guardar();
console.log(`\ncreados: ${ok} | ya existían: ${saltados} | fallos: ${fallos.length}`);
fallos.slice(0, 10).forEach((f) => console.log('  !', f));
process.exit(fallos.length ? 1 : 0);
