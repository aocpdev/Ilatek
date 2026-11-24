// Ilatek · Posts programáticos por pueblo (subdominios <municipio>.ilatekpr.com).
//
// Modelo ya establecido (el de .tmp-social-posts.json y el de comunidades):
//   * título  = H1 real de ESA landing (no se inventa)
//   * cuerpo  = párrafo de entrada de ESA página, sin precios
//   * redes   = Facebook, Instagram, Pinterest (tablero propio) y Google
//               Business Profile (acción BOOK), las cuatro en el mismo post
//   * comentario = enlace de agendar de ese pueblo; en limpieza el CTA rota
//   * horario = 25 por día en hora de Puerto Rico (AST, UTC-4)
//
// Uso:
//   node tools/pueblos-social.mjs --plan                     # cola de los 78 pueblos
//   node tools/pueblos-social.mjs --plan --muni adjuntas,carolina
//   node tools/pueblos-social.mjs --create --muni adjuntas   # sube y programa
//   node tools/pueblos-social.mjs --verify --muni adjuntas
//   node tools/pueblos-social.mjs --dry-run
//
// Estados: .tmp-pueblos-plan.json (cola + copy), .tmp-pueblos-shots.json
// (capturas hechas), .tmp-pueblos-posts.json (posts programados).
import fs from 'node:fs';
import path from 'node:path';
import { verificarLanding, ajustarSlot } from './landing-gate.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const API = 'https://services.leadconnectorhq.com';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '.mcp.json'), 'utf8')).mcpServers.ghl.env;
const PIT = cfg.ZJ_GHL_PIT;
const LOC = cfg.ZJ_GHL_LOCATION;

// Autor de los posts: cuenta del propietario en la subcuenta Ilatek - PR.
const USER = 'lrgREN7IQe6y2iRW4Epe';

const ACCOUNTS = {
  facebook: '6acda865eb91805c4588f867_8OxUENFVM60EKzqsTcoD_1230828613443086_page',
  instagram: '6acda898cf4cd6226dbd3983_8OxUENFVM60EKzqsTcoD_17841443104235049',
  pinterest: '6ab421b5f7a629112fd7fced_8OxUENFVM60EKzqsTcoD_1146799630022429248_profile',
  google: '6ab039f0dd6ff043728d0614_8OxUENFVM60EKzqsTcoD_12294364361346557718',
};
const PINTEREST_OAUTH = '6ab421b5f7a629112fd7fced';
const PINTEREST_BOARD = '1146799561305219041';
const NETWORKS = [ACCOUNTS.google, ACCOUNTS.facebook, ACCOUNTS.instagram, ACCOUNTS.pinterest];
// Google Business Profile va a 1 publicación por día: más se considera spam y
// afecta el posicionamiento, así que solo el primer post de cada fecha lleva
// Google. Las otras tres redes siguen en todos.
const NETWORKS_SIN_GMB = [ACCOUNTS.facebook, ACCOUNTS.instagram, ACCOUNTS.pinterest];

const PLAN = path.join(ROOT, '.tmp-pueblos-plan.json');
const SHOTS = path.join(ROOT, '.tmp-pueblos-shots.json');
const UPLOADS = path.join(ROOT, '.tmp-pueblos-uploads.json');
const LEDGER = path.join(ROOT, '.tmp-pueblos-posts.json');
const MUNI_DIR = path.join(ROOT, '..', 'ilatek-municipios');

// ---- catálogo -------------------------------------------------------------
const estructura = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/estructura.json'), 'utf8'));
const CATALOG = Object.fromEntries(
  estructura.pages
    .filter((p) => p.group === 'limpieza' || p.group === 'techos')
    .map((p) => [p.slug, p.group]),
);

function municipios() {
  return fs
    .readdirSync(MUNI_DIR)
    .filter((f) => /^es-.*\.llms\.txt$/.test(f))
    .map((f) => f.replace(/^es-/, '').replace(/\.llms\.txt$/, ''))
    .sort();
}

// ---- copy -----------------------------------------------------------------
// Emoji por familia de servicio: el mismo criterio del modelo publicado.
const EMOJI = [
  [/gotera|filtracion|empozamiento|humedad/, '💧'],
  [/post-huracan/, '🌀'],
  [/grieta|concreto/, '🪨'],
  [/membrana|poliuretano|elastomerico|silicona|acrilico|sellado/, '🛡️'],
  [/impermeabiliz/, '☔'],
  [/zinc|metal|teja|madera|asfalto|shingle/, '🏠'],
  [/inspeccion/, '🔍'],
  [/mantenimiento/, '🗓️'],
  [/canaleta|limpieza-de-techos|lavado-a-presion-techos/, '🌿'],
  [/instalacion|reemplazo/, '🏗️'],
  [/residencial|estandar|profunda|mudanza|post-construccion|airbnb/, '🧹'],
  [/comercial|industrial|organizacion|alfombras|electrodomesticos|ventanas|lavado-a-presion/, '🏢'],
  [/tragaluz/, '🔆'],
  [/techos|tragaluces/, '🏠'],
];
const emojiFor = (slug) => (EMOJI.find(([re]) => re.test(slug)) || [null, '🔧'])[1];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', iexcl: '¡', iquest: '¿' };
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&([a-zA-Z0-9#]+);/g, (m, e) => ENTITIES[e] ?? m);

const pascal = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

const STOP = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'en', 'a', 'con', 'para']);
const tag = (name) => '#' + name.split(/[\s-]+/).filter((w) => w && !STOP.has(w.toLowerCase())).map(pascal).join('');

// Los posts no mencionan precios: se descarta la oración que los traiga.
function sinPrecios(text) {
  return String(text)
    .split(/(?<=[.!?])\s+/)
    .filter((s) => !/\$|\bprecio\b|\bcotizaci[oó]n\b/i.test(s))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// El H1 de varias landings municipales cierra con "desde $X": los posts no
// mencionan precios, así que se recorta la cláusula completa (no solo el
// número), igual que hace el modelo de techos.
const PRICE_RULES = [
  /\s*(?:,|—|–|-)?\s*desde\s+\$\s?[\d.,]+(?:\s+por\s+(?:pie\u00b2|pie2|labor))?/gi,
  /,?\s*con\s+cotizaci[oó]n\s+\$\s?0[^.]*\.?/gi,
  /\s*Cotizaci[oó]n\s+\$\s?0[^.]*\.?/gi,
];
function noPrice(text) {
  let t = String(text);
  for (const re of PRICE_RULES) t = t.replace(re, '');
  t = t.replace(/\s*\$\s?[\d.,]+[^.]*\.?/g, '');
  t = t.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/([.,;:])\1+/g, '$1').trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function h1Of(html) {
  const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (!m) return '';
  return decode(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// Párrafo de entrada de la landing (el que sigue al H1). La página municipal
// abre con una tira de contacto que hay que descartar.
function leadOf(html) {
  const ps = [...html.matchAll(/<p[^>]*>([\s\S]{40,600}?)<\/p>/gi)]
    .map((m) => decode(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim())
    .filter((t) => t.length >= 90)
    .filter((t) => !/\|\|\|DV\|\|\||\[email|@gmail\.com/i.test(t));
  return ps[0] || '';
}

// En limpieza el CTA rota entre posts; en techos se conserva el del modelo.
const CTA_LIMPIEZA = [
  'Agenda tu limpieza',
  'Agenda una visita al hogar',
  'Reserva tu limpieza',
  'Solicita tu visita',
];
const hash = (s) => [...s].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
const sinPunto = (s) => String(s).replace(/[.\s]+$/, '');

function buildEntry(muni, slug, group, url, html) {
  const title = noPrice(h1Of(html));
  const lead = sinPrecios(leadOf(html));
  const tags = [tag(muni), group === 'techos' ? '#Techos' : '#Limpieza', `#${pascal(slug)}`, '#Ilatek', '#PuertoRico'].join(' ');
  const booking = `https://${muni}.ilatekpr.com/${group === 'techos' ? 'cotizacion-techos' : 'cotizacion'}`;
  const cta = group === 'techos'
    ? '📅 Agenda hoy'
    : `📅 ${CTA_LIMPIEZA[hash(`${muni}/${slug}`) % CTA_LIMPIEZA.length]}`;
  const summary = [
    title,
    `${emojiFor(slug)} ${lead}`,
    '✅ agenda con $50 descontables del total · garantía por escrito',
    '📍 Cobertura en los 78 municipios de Puerto Rico',
    tags,
  ].join('\n\n');
  return {
    muni,
    slug,
    group,
    url,
    booking,
    title,
    summary,
    hashtags: tags,
    followUpComment: `${cta}: ${sinPunto(title)} 👉 ${booking}`,
  };
}

// ---- red ----------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 3) {
  for (let n = 0; n < tries; n++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ilatek-pueblos/1.0' } });
      if (res.ok) return await res.text();
      if (res.status === 404) return '';
    } catch {
      /* reintento */
    }
    await sleep(600 * (n + 1));
  }
  return '';
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

// ---- agenda: 25 posts por día en AST (UTC-4 todo el año) ------------------
// Topes diarios por red, fijados por el propietario (noviembre 2026):
//   Facebook   25/día vía la API oficial de Graph
//   Instagram  25/día, límite de Graph para publicaciones automáticas
//   Pinterest  20–30 pins/día (más se marca como spam)
//   Google     1 post/día (más se considera spam y afecta el posicionamiento)
// La más estrecha manda: 25 por día. Facebook, Instagram y Pinterest van en
// todos los posts; Google solo en el primero de cada fecha, que es el único
// hueco diario que le toca.
const MAX_POR_DIA = 25;
// 25 franjas de 07:00 a 21:30 (una cada ~36 min): reparte las publicaciones sin
// ráfagas en el mismo minuto, que es lo que delata una automatización.
function franjas(extraMin = 0) {
  const inicio = 7 * 60 + extraMin;
  const fin = 21 * 60 + 30 + extraMin;
  return Array.from({ length: MAX_POR_DIA }, (_, i) => {
    const min = Math.round(inicio + (i * (fin - inicio)) / (MAX_POR_DIA - 1));
    return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  });
}
const SLOTS = { weekday: franjas(0), weekend: franjas(30) };
const AST_OFFSET_H = 4;
// Desfase fijo por franja (0–6 min): las cuentas no publican a la misma hora
// exacta todos los días, que es el patrón que delata una automatización.
const desfase = (semilla) => hash(semilla) % 7;
const astToUtc = (dateStr, hhmm, extraMin = 0) => {
  const [h, m] = hhmm.split(':').map(Number);
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h + AST_OFFSET_H, m + extraMin)).toISOString();
};

// Última franja ya usada por cualquier agenda (techos + pueblos) para seguir
// la cola sin dejar huecos ni duplicar horarios.
function lastScheduled() {
  const stamps = [];
  for (const file of [path.join(ROOT, '.tmp-social-schedule.json'), LEDGER]) {
    if (!fs.existsSync(file)) continue;
    const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const v of Object.values(doc.posts || {})) if (v.at) stamps.push(v.at);
  }
  return stamps.sort().pop() || new Date().toISOString();
}

// Última franja de la agenda de techos: la cola de pueblos empieza justo
// después, sin dejar huecos antes de lo ya programado.
function ultimoTechos() {
  const file = path.join(ROOT, '.tmp-social-schedule.json');
  if (!fs.existsSync(file)) return null;
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ats = Object.values(doc.posts || {}).map((r) => r.at).filter(Boolean).sort();
  return ats.pop() || null;
}

// Franjas que la agenda de techos ya ocupa: la cola de pueblos las salta para
// que dos posts nunca caigan en la misma hora.
function agendaTechosAts() {
  const file = path.join(ROOT, '.tmp-social-schedule.json');
  if (!fs.existsSync(file)) return [];
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Object.values(doc.posts || {}).map((r) => r.at).filter(Boolean);
}

function nextSlots(count, after, ocupados = null) {
  const out = [];
  const ast = new Date(Date.parse(after) - AST_OFFSET_H * 3600e3);
  let day = new Date(Date.UTC(ast.getUTCFullYear(), ast.getUTCMonth(), ast.getUTCDate(), 12));
  for (let guard = 0; out.length < count && guard < 4000; guard++, day = new Date(day.getTime() + 86400000)) {
    const dateStr = day.toISOString().slice(0, 10);
    const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
    const times = dow === 0 || dow === 6 ? SLOTS.weekend : SLOTS.weekday;
    for (const time of times) {
      const at = astToUtc(dateStr, time, desfase(dateStr + time));
      if (Date.parse(at) <= Date.parse(after) || Date.parse(at) <= Date.now()) continue;
      if (ocupados && ocupados.has(at)) continue;
      out.push({ date: dateStr, time, at });
      if (out.length >= count) break;
    }
  }
  return out;
}

// Orden de pueblos barajado pero estable: la misma semilla da la misma
// permutación en --reorder y en --create, así nadie se reprograma dos veces por
// accidente. Sirve para cubrir la isla por rondas (cada ronda de 78 posts pasa
// por los 78 pueblos) en vez de ir en orden alfabético de Adjuntas a Yauco.
const SEMILLA_PUEBLOS = 20261104;
function barajar(items, semilla) {
  let s = semilla >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Reparte la cola por rondas de pueblos: dos posts consecutivos nunca son de la
// misma landing ni del mismo pueblo, y dentro de cada pueblo se alterna limpieza
// con techos. Así una misma red no recibe siete variantes casi idénticas de
// X pueblo el mismo día (política de contenido repetitivo de Google y Pinterest,
// y señal de bot para Meta).
function intercalar(items) {
  const porPueblo = new Map();
  for (const p of items) {
    if (!porPueblo.has(p.muni)) porPueblo.set(p.muni, []);
    porPueblo.get(p.muni).push(p);
  }
  const colas = barajar([...porPueblo.entries()], SEMILLA_PUEBLOS).map(([, lista], k) => {
      lista.sort((a, b) =>
        a.group === b.group ? a.slug.localeCompare(b.slug) : a.group === 'limpieza' ? -1 : 1,
      );
      const limpieza = lista.filter((p) => p.group === 'limpieza');
      const techos = lista.filter((p) => p.group !== 'limpieza');
      const alternado = [];
      for (let i = 0; i < Math.max(limpieza.length, techos.length); i++) {
        if (limpieza[i]) alternado.push(limpieza[i]);
        if (techos[i]) alternado.push(techos[i]);
      }
      // Cada pueblo entra en la ronda con un desfase distinto: dos posts
      // seguidos no comparten ni pueblo ni landing (misma plantilla de copy en
      // 78 pueblos seguidos también se lee como contenido repetitivo).
      const off = alternado.length ? k % alternado.length : 0;
      return alternado.slice(off).concat(alternado.slice(0, off));
    });
  const out = [];
  for (let i = 0; out.length < items.length; i++) {
    let agrego = false;
    for (const cola of colas) {
      if (i < cola.length) {
        out.push(cola[i]);
        agrego = true;
      }
    }
    if (!agrego) break;
  }
  return out;
}

// ---- cuerpo del post ------------------------------------------------------
function postBody(entry, mediaUrl, at, conGoogle = true) {
  const body = {
    accountIds: conGoogle ? NETWORKS : NETWORKS_SIN_GMB,
    summary: entry.summary,
    media: [{ url: mediaUrl, type: 'image/png' }],
    status: 'scheduled',
    scheduleDate: at,
    type: 'post',
    followUpComment: entry.followUpComment,
    userId: USER,
    createdBy: USER,
    pinterestPostDetails: {
      boardIds: { [PINTEREST_OAUTH]: PINTEREST_BOARD },
      title: entry.title.length > 100 ? `${entry.title.slice(0, 97)}...` : entry.title,
      link: entry.url,
    },
  };
  if (conGoogle) {
    body.gmbPostDetails = { gmbEventType: 'STANDARD', actionType: 'BOOK', url: entry.url };
  }
  return body;
}

// Qué posts llevan Google: el primero de cada fecha en la agenda. Es
// determinista y se recalcula igual en --create, --reorder, --update-media y
// --verify, así nunca hay dos posts de Google el mismo día.
function primerasDelDia(registros) {
  const m = new Map();
  for (const r of registros) {
    if (!r?.at) continue;
    const d = r.date || String(r.at).slice(0, 10);
    if (!m.has(d) || r.at < m.get(d)) m.set(d, r.at);
  }
  return m;
}
const conGoogle = (primeras, r) => primeras.get(r.date || String(r.at).slice(0, 10)) === r.at;

// La caché va por archivo + fecha de modificación: si la captura se rehace con
// otro encuadre, la misma ruta sube una imagen nueva en vez de reutilizar la
// vieja.
const uploadKey = (file) => `${file}|${Math.round(fs.statSync(file).mtimeMs)}`;

async function upload(file) {
  const cache = fs.existsSync(UPLOADS) ? JSON.parse(fs.readFileSync(UPLOADS, 'utf8')) : {};
  const key = uploadKey(file);
  if (cache[key]) return cache[key];
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)], { type: 'image/png' }), path.basename(file));
  form.append('locationId', LOC);
  for (let n = 0; n < 3; n++) {
    const res = await fetch(`${API}/medias/upload-file`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28' },
      body: form,
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.url) {
      cache[key] = json.url;
      fs.writeFileSync(UPLOADS, JSON.stringify(cache, null, 2));
      return json.url;
    }
    await sleep(1500 * (n + 1));
  }
  throw new Error(`no se pudo subir ${path.basename(file)}`);
}

// ---- modos ----------------------------------------------------------------
const args = process.argv.slice(2);
const mode = args.find((a) => a.startsWith('--')) || '--plan';
const muniArg = args.indexOf('--muni');
const ONLY = muniArg > -1 ? args[muniArg + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
const limitArg = args.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(args[limitArg + 1]) : Infinity;

const targetMunis = () => (ONLY ? ONLY : municipios());

if (mode === '--plan') {
  const all = targetMunis();
  console.log(`pueblos: ${all.length}${ONLY ? ` (${ONLY.join(', ')})` : ''}`);
  const plan = { generado: new Date().toISOString(), pueblos: all, posts: [] };
  const problems = [];
  await mapLimit(all, 4, async (muni) => {
    const sitemap = await get(`https://${muni}.ilatekpr.com/sitemap.xml`);
    if (!sitemap) {
      problems.push(`${muni}: sitemap sin respuesta`);
      return;
    }
    const urls = new Map();
    for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const slug = m[1].replace(/\/$/, '').split('/').pop();
      if (CATALOG[slug] && !/-\d{4,}$/.test(slug)) urls.set(slug, m[1]);
    }
    if (!urls.size) {
      problems.push(`${muni}: sin landings del catálogo`);
      return;
    }
    // El sitemap de varios subdominios omite landings que sí están vivas (cinco
    // de techos). Se completan probando el resto del catálogo contra el
    // subdominio: si alguna no existe, buildEntry la descarta como 'sin HTML'.
    for (const slug of Object.keys(CATALOG)) {
      if (slug === 'techos' || urls.has(slug)) continue;
      urls.set(slug, `https://${muni}.ilatekpr.com/${slug}`);
    }
    const entries = await mapLimit([...urls], 6, async ([slug, url]) => {
      const html = await get(url);
      if (!html) {
        problems.push(`${muni}/${slug}: sin HTML`);
        return null;
      }
      const entry = buildEntry(muni, slug, CATALOG[slug], url, html);
      if (!entry.title) problems.push(`${muni}/${slug}: sin H1`);
      if (!entry.summary.includes(entry.title)) problems.push(`${muni}/${slug}: copy incompleto`);
      if (entry.summary.length > 800) problems.push(`${muni}/${slug}: summary ${entry.summary.length} (Pinterest 800)`);
      if (/\$/.test(entry.summary)) problems.push(`${muni}/${slug}: menciona precio`);
      return entry;
    });
    plan.posts.push(...entries.filter(Boolean));
  });
  plan.posts.sort((a, b) => a.muni.localeCompare(b.muni) || a.slug.localeCompare(b.slug));
  // La cola se acumula por pueblo: se puede planificar en tandas sin borrar
  // los posts ya programados de los pueblos anteriores.
  const prev = fs.existsSync(PLAN) ? JSON.parse(fs.readFileSync(PLAN, 'utf8')) : { posts: [], pueblos: [] };
  const kept = (prev.posts || []).filter((p) => !all.includes(p.muni));
  const merged = [...kept, ...plan.posts].sort((a, b) => a.muni.localeCompare(b.muni) || a.slug.localeCompare(b.slug));
  fs.writeFileSync(
    PLAN,
    JSON.stringify({ generado: new Date().toISOString(), pueblos: [...new Set([...(prev.pueblos || []), ...all])].sort(), posts: merged }, null, 2),
  );
  console.log(`landings en esta tanda: ${plan.posts.length} | en la cola total: ${merged.length} | problemas: ${problems.length}`);
  problems.slice(0, 10).forEach((p) => console.log('  !', p));
  const byMuni = plan.posts.reduce((a, p) => ((a[p.muni] = (a[p.muni] || 0) + 1), a), {});
  console.log('por pueblo:', Object.entries(byMuni).map(([m, n]) => `${m}:${n}`).join('  '));
  console.log('plan:', PLAN);
  process.exit(problems.length ? 1 : 0);
}

const planDoc = fs.existsSync(PLAN) ? JSON.parse(fs.readFileSync(PLAN, 'utf8')) : { posts: [] };
let queue = planDoc.posts.filter((p) => (ONLY ? ONLY.includes(p.muni) : true));
// En --create el límite se aplica más abajo, sobre los pendientes.
if (Number.isFinite(LIMIT) && mode !== '--create') queue = queue.slice(0, LIMIT);

if (mode === '--dry-run') {
  const orden = intercalar(queue);
  const slots = nextSlots(orden.length, lastScheduled());
  const perDay = {};
  slots.forEach((s, i) => {
    perDay[s.date] = (perDay[s.date] || 0) + 1;
  });
  console.log(`posts: ${queue.length} | ${Object.keys(perDay).length} días | desde ${slots[0]?.date} hasta ${slots[slots.length - 1]?.date}`);
  Object.entries(perDay).forEach(([d, n]) => console.log(`  ${d}: ${n}`));
  console.log('\n--- muestra ---\n' + (orden[0]?.summary || '') + '\n\n[comentario] ' + (orden[0]?.followUpComment || ''));
  console.log('\n--- primeros 14 del orden intercalado ---');
  slots.slice(0, 14).forEach((s, i) => console.log(`  ${s.date} ${s.time} AST (${s.at.slice(11, 16)} UTC)  ${orden[i].muni}/${orden[i].slug}`));
  process.exit(0);
}

if (mode === '--create') {
  const shots = fs.existsSync(SHOTS) ? JSON.parse(fs.readFileSync(SHOTS, 'utf8')) : {};
  const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : { posts: {} };
  ledger.posts ||= {};
  const save = () => {
    ledger.generado = new Date().toISOString();
    ledger.zona = 'America/Puerto_Rico (AST, UTC-4)';
    ledger.franjas = SLOTS;
    ledger.redes = ACCOUNTS;
    fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
  };
  // El límite se aplica a los pendientes (no a la cola completa): así
  // `--create --limit 1` prueba de verdad un post nuevo.
  let pending = intercalar(queue.filter((p) => !ledger.posts[`${p.muni}/${p.slug}`]?.id));
  if (Number.isFinite(LIMIT)) pending = pending.slice(0, LIMIT);
  const sinImagen = pending.filter((p) => !shots[`${p.muni}/${p.slug}`]);
  console.log(`cola: ${queue.length} | pendientes: ${pending.length} | sin captura: ${sinImagen.length}`);
  if (sinImagen.length) {
    console.log('  ! faltan capturas:', sinImagen.slice(0, 5).map((p) => `${p.muni}/${p.slug}`).join(', '));
    process.exit(1);
  }
  const ocupados = new Set([...Object.values(ledger.posts).map((r) => r.at), ...agendaTechosAts()]);
  const slots = nextSlots(pending.length, lastScheduled(), ocupados);
  const primeras = primerasDelDia(slots);
  let ok = 0;
  const fails = [];
  for (let i = 0; i < pending.length; i++) {
    const entry = pending[i];
    const key = `${entry.muni}/${entry.slug}`;
    const slot = slots[i];
    // Candado: el pueblo tiene que responder 200 antes de programar su post.
    const gate = await verificarLanding(entry.url);
    if (!gate.ok) {
      console.log(`SALTADO ${key}: ${gate.motivo}`);
      continue;
    }
    slot.at = ajustarSlot(slot.at, gate.publicadoEn);
    try {
      const gmb = conGoogle(primeras, slot);
      const media = await upload(shots[key]);
      const res = await fetch(`${API}/social-media-posting/${LOC}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody(entry, media, slot.at, gmb)),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 200)}`);
      const id = json?.results?.post?._id || json?.results?.post?.id || json?.results?.id || '';
      if (!id) throw new Error('sin id en la respuesta');
      ledger.posts[key] = { id, date: slot.date, time: slot.time, at: slot.at, media, title: entry.title, gmb };
      save();
      ok++;
      console.log(`ok ${slot.date} ${slot.time} AST  ${key}`);
    } catch (e) {
      fails.push(`${key}: ${e.message}`);
      console.log(`FALLO ${key}: ${e.message}`);
    }
    await sleep(320);
  }
  save();
  console.log(`\ncreados: ${ok} | fallos: ${fails.length} | total registrados: ${Object.keys(ledger.posts).length}`);
  fails.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

// Cambió el encuadre del hero: se reemplaza la imagen de los posts ya creados,
// conservando su misma franja horaria.
if (mode === '--update-media') {
  const shots = fs.existsSync(SHOTS) ? JSON.parse(fs.readFileSync(SHOTS, 'utf8')) : {};
  const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
  const save = () => {
    ledger.generado = new Date().toISOString();
    fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
  };
  const targets = queue.filter((p) => ledger.posts[`${p.muni}/${p.slug}`]?.id && shots[`${p.muni}/${p.slug}`]);
  const primeras = primerasDelDia(Object.values(ledger.posts));
  let ok = 0, same = 0;
  const fails = [];
  for (const entry of targets) {
    const key = `${entry.muni}/${entry.slug}`;
    const rec = ledger.posts[key];
    try {
      const media = await upload(shots[key]);
      const gmb = conGoogle(primeras, rec);
      if (media === rec.media && rec.gmb === gmb) {
        same++;
        continue;
      }
      const res = await fetch(`${API}/social-media-posting/${LOC}/posts/${rec.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody(entry, media, rec.at, gmb)),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      rec.media = media;
      rec.encuadre = 'centrado';
      rec.gmb = gmb;
      ok++;
      console.log(`ok ${key}`);
    } catch (e) {
      fails.push(`${key}: ${e.message}`);
      console.log(`FALLO ${key}: ${e.message}`);
    }
    await sleep(320);
  }
  save();
  console.log(`\nimágenes actualizadas: ${ok} | ya iguales: ${same} | fallos: ${fails.length}`);
  fails.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

// Reordena los posts YA creados para que sigan el mismo intercalado por pueblo
// que los nuevos. Solo cambia la fecha/hora programada: no borra, no toca el
// copy ni la imagen (la imagen la reemplaza --update-media).
if (mode === '--reorder') {
  const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
  const claves = new Set(Object.keys(ledger.posts).filter((k) => ledger.posts[k]?.id));
  const orden = intercalar(planDoc.posts).filter((p) => claves.has(`${p.muni}/${p.slug}`));
  if (!orden.length) {
    console.log('no hay posts creados que reordenar');
    process.exit(0);
  }
  const ancla = ultimoTechos() || Object.values(ledger.posts).map((r) => r.at).sort()[0];
  const desde = new Date(Date.parse(ancla) - 60000).toISOString();
  // Solo se reparten los posts ya creados: así el calendario queda compacto y
  // los que falten por crear se añaden detrás cuando se creen, sin dejar huecos.
  const slots = nextSlots(orden.length, desde);
  const primeras = primerasDelDia(slots);
  console.log(`reordenando ${orden.length} posts | primero ${slots[0].date} ${slots[0].time} AST | último ${slots[slots.length - 1].date}`);
  let ok = 0, same = 0;
  const fails = [];
  for (let i = 0; i < orden.length; i++) {
    const entry = orden[i];
    const key = `${entry.muni}/${entry.slug}`;
    const rec = ledger.posts[key];
    const slot = slots[i];
    // Reordenar nunca puede adelantar un post a antes del lanzamiento.
    const gate = await verificarLanding(entry.url);
    if (gate.ok) slot.at = ajustarSlot(slot.at, gate.publicadoEn);
    const gmb = conGoogle(primeras, slot);
    if (rec.at === slot.at && rec.gmb === gmb) {
      same++;
      continue;
    }
    try {
      const res = await fetch(`${API}/social-media-posting/${LOC}/posts/${rec.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody(entry, rec.media, slot.at, gmb)),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      rec.at = slot.at;
      rec.date = slot.date;
      rec.time = slot.time;
      rec.gmb = gmb;
      ledger.generado = new Date().toISOString();
      fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
      ok++;
      if (ok % 25 === 0) console.log(`  ${ok}/${orden.length}`);
    } catch (e) {
      fails.push(`${key}: ${e.message}`);
      console.log(`FALLO ${key}: ${e.message}`);
    }
    await sleep(280);
  }
  console.log(`
reordenados: ${ok} | ya en su sitio: ${same} | fallos: ${fails.length}`);
  fails.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

if (mode === '--verify') {
  const shots = fs.existsSync(SHOTS) ? JSON.parse(fs.readFileSync(SHOTS, 'utf8')) : {};
  const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
  const keys = queue.map((p) => `${p.muni}/${p.slug}`).filter((k) => ledger.posts[k]?.id);
  const byKey = Object.fromEntries(planDoc.posts.map((p) => [`${p.muni}/${p.slug}`, p]));
  const primeras = primerasDelDia(Object.values(ledger.posts));
  let ok = 0;
  const fails = [];
  const perDay = {};
  for (let i = 0; i < keys.length; i += 4) {
    await Promise.all(
      keys.slice(i, i + 4).map(async (key) => {
        const rec = ledger.posts[key];
        const entry = byKey[key];
        const res = await fetch(`${API}/social-media-posting/${LOC}/posts/${rec.id}`, {
          headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28' },
        });
        const json = await res.json().catch(() => ({}));
        const p = json.post || json.results?.post || json;
        const bad = [];
        if (!res.ok) bad.push(`http ${res.status}`);
        if (p.status !== 'scheduled') bad.push(`status ${p.status}`);
        if (new Date(p.scheduleDate).toISOString() !== rec.at) bad.push('fecha distinta');
        const conGmb = conGoogle(primeras, rec);
        const esperadas = conGmb ? 4 : 3;
        if ((p.accountIds || []).length !== esperadas) bad.push(`cuentas ${(p.accountIds || []).length} (esperadas ${esperadas})`);
        if (p.pinterestPostDetails?.boardIds?.[PINTEREST_OAUTH] !== PINTEREST_BOARD) bad.push('sin tablero Pinterest');
        if (p.pinterestPostDetails?.link !== entry.url) bad.push('pin sin URL');
        if (conGmb && p.gmbPostDetails?.url !== entry.url) bad.push('GMB sin URL');
        if (!String(p.followUpComment || '').includes(entry.booking)) bad.push('comentario sin link de agendar');
        if (String(p.summary || '').split('\n')[0].trim() !== entry.title) bad.push('título != H1');
        if (String(p.summary || '').length > 800) bad.push(`summary ${String(p.summary).length}`);
        if ((p.media || [])[0]?.url !== rec.media) bad.push('imagen distinta');
        if (bad.length) fails.push(`${key}: ${bad.join(', ')}`);
        else ok++;
        perDay[rec.date] = (perDay[rec.date] || 0) + 1;
      }),
    );
  }
  console.log(`verificados: ${ok}/${keys.length} | fallos: ${fails.length}`);
  console.log('por día:', Object.entries(perDay).sort().map(([d, n]) => `${d}:${n}`).join('  '));
  fails.slice(0, 12).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

console.log(`modo desconocido: ${mode}`);
process.exit(1);
