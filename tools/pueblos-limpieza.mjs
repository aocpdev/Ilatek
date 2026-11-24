// Ilatek · Serie de LIMPIEZA por municipio en Social Planner.
// 1 publicación por semana, 5:00 p.m. AST, rotando los 14 landings de limpieza.
// Redes: YouTube, TikTok, Instagram, Facebook, Pinterest (video) y Google
// Business Profile (imagen, se crea aparte porque GMB no acepta video).
//
// Uso:
//   node tools/pueblos-limpieza.mjs --plan
//   node tools/pueblos-limpieza.mjs --create [--limit N]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API = 'https://services.leadconnectorhq.com';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '.mcp.json'), 'utf8')).mcpServers.ghl.env;
const PIT = cfg.ZJ_GHL_PIT;
const LOC = cfg.ZJ_GHL_LOCATION;
const USER = 'lrgREN7IQe6y2iRW4Epe';
const AST = 4 * 3600e3;

// Master vertical 1080x1920 subido a GHL (mismo contenido del video, mejor resolución).
const VIDEO = 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ae9493bc9d5b7168da85bb1.mp4';

const ACC = {
  youtube: '6ab421183903f7c7e5fe9439_8OxUENFVM60EKzqsTcoD_UCIjm2P75StmlI9TMEn8EDaw_profile',
  tiktok: null, // se resuelve al correr: el id completo no es el que imprime la API truncado
  instagram: '6acda898cf4cd6226dbd3983_8OxUENFVM60EKzqsTcoD_17841443104235049',
  facebook: '6acda865eb91805c4588f867_8OxUENFVM60EKzqsTcoD_1230828613443086_page',
  pinterest: '6ab421b5f7a629112fd7fced_8OxUENFVM60EKzqsTcoD_1146799630022429248_profile',
};
const PINTEREST_OAUTH = '6ab421b5f7a629112fd7fced';
const PINTEREST_BOARD = '1146799561305219041';

// Los 14 landings de limpieza del proyecto (docs/estructura.json, group=limpieza).
// El nombre es el servicio real de cada landing; se cita en cada publicación.
const LANDINGS = [
  { slug: 'limpieza-residencial', nombre: 'Limpieza Residencial', que: 'casas y apartamentos: limpieza regular, profunda, mudanzas y post-construcción' },
  { slug: 'limpieza-profunda', nombre: 'Limpieza Profunda', que: 'renovación área por área de la propiedad' },
  { slug: 'limpieza-comercial', nombre: 'Limpieza Comercial', que: 'oficinas, tiendas, áreas comunes y condominios' },
  { slug: 'limpieza-industrial', nombre: 'Limpieza Industrial', que: 'almacenes, pisos industriales y áreas operacionales' },
  { slug: 'limpieza-estandar', nombre: 'Limpieza Estándar', que: 'mantenimiento regular del hogar' },
  { slug: 'limpieza-de-mudanza', nombre: 'Limpieza de Mudanza', que: 'entrada y salida de propiedades (move-in / move-out)' },
  { slug: 'post-construccion', nombre: 'Limpieza Post-Construcción', que: 'limpieza fina después de una obra' },
  { slug: 'airbnb-turnover', nombre: 'Limpieza de Airbnb y Rentals', que: 'turnovers de alquileres a corto plazo' },
  { slug: 'ventanas', nombre: 'Limpieza de Ventanas', que: 'cristales interiores y exteriores' },
  { slug: 'alfombras', nombre: 'Limpieza de Alfombras', que: 'alfombras y tapicería' },
  { slug: 'electrodomesticos', nombre: 'Limpieza de Electrodomésticos', que: 'refrigerador, horno, lavadora y secadora' },
  { slug: 'lavado-a-presion', nombre: 'Lavado a Presión', que: 'exteriores, terrazas, verjas y pisos' },
  { slug: 'organizacion', nombre: 'Organización de Espacios', que: 'orden y organización de áreas de la propiedad' },
  { slug: 'servicios', nombre: 'Servicios de Limpieza', que: 'el catálogo completo: residencial, comercial e industrial' },
];

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
const hash = (s) => {
  let x = 5381;
  for (const c of s) x = ((x * 33) ^ c.charCodeAt(0)) >>> 0;
  return x;
};
const pick = (arr, key, salt) => arr[hash(key + salt) % arr.length];

const AZUL = [
  (m, l) => `En ${m}, ILATEK Property Solutions ofrece ${l.nombre.toLowerCase()}: ${l.que}. Un servicio pensado para que la propiedad se mantenga limpia, ordenada y lista para usarse.`,
  (m, l) => `${l.nombre} en ${m} con ILATEK Property Solutions. Cubrimos ${l.que}, con un equipo que llega a la propiedad y trabaja sobre lo que realmente hace falta.`,
  (m, l) => `Para propiedades en ${m}, ILATEK Property Solutions trabaja ${l.nombre.toLowerCase()}, que incluye ${l.que}. La limpieza se ajusta al tamaño y al estado real del espacio.`,
  (m, l) => `ILATEK Property Solutions atiende ${m} con ${l.nombre.toLowerCase()}. El servicio cubre ${l.que} y se coordina con el cliente antes de la visita.`,
];

const IMPORTANCIA = [
  'Mantener un espacio limpio no es solo estética: reduce polvo y alérgenos, protege las superficies y evita que el desorden se convierta en deterioro. La limpieza periódica alarga la vida de pisos, muebles y acabados.',
  'Una limpieza bien hecha ahorra dinero. El polvo y la humedad acumulados dañan superficies y obligan a reemplazarlas antes de tiempo; la limpieza periódica mantiene la propiedad en mejor estado y más fácil de mantener.',
  'Cada espacio se ensucia distinto: no es lo mismo una casa habitada, una oficina en operación o un alquiler que cambia de huésped cada semana. Por eso el servicio se adapta al uso real de la propiedad.',
  'La constancia es lo que mantiene el resultado. Una limpieza profunda deja el espacio a punto, y el mantenimiento regular evita que vuelva a acumularse la suciedad que cuesta más sacar después.',
];

const CIERRE = (m, l) => [
  `📍 Servicio en ${m}, Puerto Rico`,
  `🧽 ${l.nombre}`,
  '🏠 Residencial y comercial',
  '🔹 Equipo propio de ILATEK Property Solutions',
  '',
  'ILATEK Property Solutions — Limpieza y techos en los 78 municipios.',
];

function build(municipio, landing, i) {
  const mSlug = slugify(municipio);
  const url = `https://${mSlug}.ilatekpr.com/${landing.slug}`;
  const etiqueta = sinAcentos(municipio).replace(/\s+/g, '');
  const tagServicio = landing.nombre.replace(/\s+/g, '');
  const tags = `#${tagServicio} #${etiqueta} #PuertoRico #Limpieza #ILATEK #PropertySolutions`;

  const tituloYT = `${landing.nombre} en ${municipio} Puerto Rico | ILATEK Property Solutions`.slice(0, 100);

  const descYT = [
    `📅 ${landing.nombre} en Puerto Rico — Agenda Hoy 👉🏼 ${url}`,
    'Atendemos Todo 🇵🇷 Puerto Rico',
    '',
    pick(AZUL, mSlug, 'azul')(municipio, landing),
    '',
    pick(IMPORTANCIA, mSlug, 'imp'),
    '',
    'INCLUYE:',
    `• ${landing.nombre}`,
    `• ${landing.que.charAt(0).toUpperCase() + landing.que.slice(1)}`,
    '• Atención residencial y comercial',
    '• Coordinación directa con ILATEK Property Solutions',
    '',
    `Si buscas ${landing.nombre.toLowerCase()} en ${municipio}, este es el servicio: ${landing.que}. Puedes ver el detalle y agendar en ${url}`,
    '',
    ...CIERRE(municipio, landing),
    '',
    tags,
  ].join('\n');

  const corto = [
    `${landing.nombre} en ${municipio} 🧽`,
    `${landing.que.charAt(0).toUpperCase() + landing.que.slice(1)}.`,
    `📅 Agenda hoy 👉 ${url}`,
    '',
    tags,
  ].join('\n');

  return { municipio, landing, url, tituloYT, descYT, corto, semana: i };
}

// ---- calendario: 1 por semana, 5:00 p.m. AST ------------------------------
const semana = 7 * 86400e3;
const PRIMERA = process.env.PRIMERA ? Date.parse(process.env.PRIMERA) : Date.now() + 6 * 60e3;
const cinco = (ms) => {
  const d = new Date(ms - AST);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 17 + 4, 0);
};

const posts = MUNICIPIOS.map((m, i) => build(m, LANDINGS[i % LANDINGS.length], i)).map((p, i) => ({
  ...p,
  at: new Date(i === 0 ? PRIMERA : cinco(PRIMERA + i * semana)).toISOString(),
}));

const ast = (iso) => new Date(Date.parse(iso) - AST).toISOString().replace('T', ' ').slice(0, 16) + ' AST';

const problemas = [];
const vistos = new Set();
for (const p of posts) {
  if (p.tituloYT.length > 100) problemas.push(`${p.slug || p.municipio}: título > 100`);
  if (p.descYT.length > 5000) problemas.push(`${p.municipio}: desc YT > 5000`);
  if (!p.descYT.includes(p.url)) problemas.push(`${p.municipio}: falta enlace`);
  if (!p.descYT.toLowerCase().includes(p.landing.nombre.toLowerCase())) problemas.push(`${p.municipio}: no cita el servicio`);
  if (vistos.has(p.descYT)) problemas.push(`${p.municipio}: descripción duplicada`);
  vistos.add(p.descYT);
}
console.log(`pueblos: ${posts.length} | landings: ${LANDINGS.length} | problemas: ${problemas.length}`);
problemas.slice(0, 8).forEach((x) => console.log('  !', x));
if (problemas.length) process.exit(1);
console.log(`descripciones únicas: ${vistos.size}/${posts.length}`);
console.log(`primera: ${ast(posts[0].at)}  ${posts[0].municipio} · ${posts[0].landing.nombre}`);
console.log(`última:  ${ast(posts[posts.length - 1].at)}  ${posts[posts.length - 1].municipio} · ${posts[posts.length - 1].landing.nombre}`);
console.log(`rotación primeras 5: ${posts.slice(0, 5).map((p) => p.landing.slug).join(' → ')}`);

const modo = process.argv[2] || '--plan';
if (modo === '--plan') {
  fs.writeFileSync(path.join(ROOT, '.tmp-limpieza-plan.json'), JSON.stringify(posts, null, 2));
  console.log('\n--- muestra (YouTube) ---\n' + posts[0].tituloYT + '\n\n' + posts[0].descYT);
  console.log('\n--- muestra (redes cortas) ---\n' + posts[0].corto);
  process.exit(0);
}

// ---- crear ---------------------------------------------------------------
const LEDGER = path.join(ROOT, '.tmp-limpieza-ledger.json');
const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : { posts: {} };
ledger.posts ||= {};
const guardar = () => {
  ledger.generado = new Date().toISOString();
  ledger.zona = 'America/Puerto_Rico (AST, UTC-4)';
  ledger.video = VIDEO;
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
};

const limiteIdx = process.argv.indexOf('--limit');
const limite = limiteIdx > -1 ? Number(process.argv[limiteIdx + 1]) : Infinity;

async function crear(body, etiqueta) {
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
  if (!res.ok) throw new Error(`${etiqueta}: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  const saved = json.results?.post || json.post || {};
  if (saved.status && saved.status !== 'scheduled') throw new Error(`${etiqueta}: quedó en ${saved.status}`);
  return saved._id;
}

// Cuenta de TikTok real (id completo, pedido a la API para no hardcodearlo mal).
const accList = await (await fetch(`${API}/social-media-posting/${LOC}/accounts`, {
  headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', Accept: 'application/json' },
})).json();
const ttAcc = accList.results.accounts.find((a) => a.platform === 'tiktok');
if (!ttAcc) throw new Error('no hay cuenta de TikTok conectada');
ACC.tiktok = ttAcc.id;
console.log(`tiktok: ${ttAcc.name} | ${ttAcc.id}`);

let ok = 0;
let intentos = 0;
let saltados = 0;
const fallos = [];
for (const p of posts) {
  if (intentos >= limite) break;
  intentos++;
  if (ledger.posts[p.municipio]?.social) { saltados++; continue; }
  const base = { media: [{ url: VIDEO, type: 'video/mp4' }], status: 'scheduled', type: 'post', userId: USER, createdBy: USER };
  try {
    let yt = ledger.posts[p.municipio]?.yt || null;
    if (!yt) {
      yt = await crear({
        ...base,
        accountIds: [ACC.youtube],
        summary: p.descYT,
        scheduleDate: p.at,
        youtubePostDetails: { type: 'video', title: p.tituloYT },
      }, `${p.municipio} YouTube`);
      // Se guarda el de YouTube antes de seguir: si el resto falla, no se pierde.
      ledger.posts[p.municipio] = { yt, at: p.at, landing: p.landing.slug, url: p.url };
      guardar();
    }

    const social = await crear({
      ...base,
      accountIds: [ACC.tiktok, ACC.instagram, ACC.facebook, ACC.pinterest],
      summary: p.corto,
      scheduleDate: p.at,
      tiktokPostDetails: { privacyLevel: 'PUBLIC_TO_EVERYONE' },
      pinterestPostDetails: {
        boardIds: { [PINTEREST_OAUTH]: PINTEREST_BOARD },
        title: p.tituloYT.slice(0, 100),
        link: p.url,
      },
    }, `${p.municipio} redes`);

    ledger.posts[p.municipio] = { ...ledger.posts[p.municipio], social, at: p.at, landing: p.landing.slug, url: p.url };
    guardar();
    ok++;
    console.log(`ok ${ast(p.at)}  ${p.municipio} · ${p.landing.slug}`);
  } catch (e) {
    fallos.push(e.message);
    console.log(`FALLO ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 350));
}
guardar();
console.log(`\ncreados: ${ok} | ya existían: ${saltados} | fallos: ${fallos.length}`);
fallos.slice(0, 8).forEach((f) => console.log('  !', f));
process.exit(fallos.length ? 1 : 0);
