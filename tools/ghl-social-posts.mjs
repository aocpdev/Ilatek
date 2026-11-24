// Ilatek · Publicaciones programáticas SEO para Social Planner de GHL.
// Fuente de verdad del copy: techos/lib/data/meta.mjs (serviceName, serviceDesc,
// benTitle, procLead, price). Imágenes: social por slug + hero de su landing.
// Uso:
//   node tools/ghl-social-posts.mjs --plan     # escribe .tmp-social-posts.json
//   node tools/ghl-social-posts.mjs --create   # sube imágenes y crea borradores
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { META } from '../techos/lib/data/meta.mjs';
import { TECHOS_IMG, TECHOS_IMG_SOCIAL } from '../techos/lib/kit.mjs';
import { buildTree } from '../techos/lib/model.mjs';
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

// Modelo ya publicado en la cuenta (post de comunidades): Pinterest necesita
// el tablero por OAuth y Google Business Profile el enlace de la acción.
const PINTEREST_OAUTH = '6ab421b5f7a629112fd7fced';
const PINTEREST_BOARD = '1146799561305219041';
const NETWORKS = [ACCOUNTS.google, ACCOUNTS.facebook, ACCOUNTS.instagram, ACCOUNTS.pinterest];
// Google Business Profile: 1 al día como tope; entra solo en el primero de cada fecha.
const NETWORKS_SIN_GMB = [ACCOUNTS.facebook, ACCOUNTS.instagram, ACCOUNTS.pinterest];

const SLUGS = require_estructura();
const UPLOAD_CACHE = path.join(ROOT, '.tmp-social-uploads.json');
const RESULT = path.join(ROOT, '.tmp-social-posts-result.json');
const PLAN = path.join(ROOT, '.tmp-social-posts.json');

function require_estructura() {
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/estructura.json'), 'utf8'));
  return doc.pages.filter((p) => p.group === 'techos').map((p) => p.slug);
}

// Emoji por familia de servicio: uno para la variación de beneficio y otro para
// la de proceso, para que las dos versiones no se lean como duplicados.
const EMOJI = [
  [/gotera|filtracion|empozamiento|humedad/, ['💧', '☔']],
  [/post-huracan/, ['🌀', '🛠️']],
  [/grieta|concreto/, ['🪨', '🏗️']],
  [/membrana|poliuretano|elastomerico|silicona|acrilico|sellado/, ['🛡️', '🧴']],
  [/impermeabiliz/, ['☔', '🛡️']],
  [/zinc|metal/, ['🔩', '🛠️']],
  [/asfalto|shingle/, ['🏠', '🔨']],
  [/teja/, ['🧱', '🔨']],
  [/madera/, ['🪵', '🌿']],
  [/inspeccion/, ['🔍', '📋']],
  [/mantenimiento/, ['🗓️', '🧰']],
  [/canaleta|limpieza|lavado/, ['🌿', '🧹']],
  [/tragaluz/, ['🔆', '🪟']],
  [/instalacion|reemplazo/, ['🏗️', '🆕']],
  [/residencial/, ['🏡', '🏠']],
  [/comercial/, ['🏢', '📈']],
  [/industrial/, ['🏭', '⚙️']],
  [/segmento/, ['🏘️', '📐']],
];
const baseEmoji = (slug) => (EMOJI.find(([re]) => re.test(slug)) || [null, ['🏠', '🔧']])[1];

const pascal = (s) => s.replace(/(^|\s|-)[a-záéíóúñ0-9]/gi, (m) => m.toUpperCase()).replace(/[\s-]/g, '');
function hashtags(slug, serviceName) {
  const words = slug.split('-');
  const core = pascal(words.join(' '));
  const stop = new Set(['de', 'en', 'para', 'y', 'el', 'la', 'los', 'las', 'puerto', 'rico']);
  const significant = serviceName
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((w) => w && !stop.has(w))
    .map(pascal);
  const tags = new Set(['#IlatekTechos', '#PuertoRico', '#Techos', `#${core}`, `#${significant.slice(0, 2).join('')}`, '#Impermeabilizacion']);
  return [...tags].slice(0, 5).join(' ');
}

const cleanName = (serviceName) => serviceName.replace(/\s+en\s+Puerto\s+Rico$/i, '');

// ---- título = H1 real de la landing -------------------------------------
// GHL no expone un campo `title` para Facebook/Instagram: la primera línea del
// summary es lo que se lee como título, así que ahí va el H1 tal cual, sin
// emoji y sin precio.
const PAGES = Object.fromEntries(buildTree().map((p) => [p.slug, p]));
function rawH1(slug) {
  const p = PAGES[slug];
  if (!p) return META[slug].serviceName;
  return [p.h1before, p.h1em, p.h1after]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// El sitio vende con "desde $X" en H1 y descripciones; los posts no mencionan
// precios, así que se recorta la cláusula completa (no solo el número).
const PRICE_RULES = [
  /\s*(?:,|—|–|-)?\s*desde\s+\$\s?[\d.,]+(?:\s+por\s+(?:pie\u00b2|pie2|labor))?/gi,
  /,?\s*con\s+cotizaci[oó]n\s+\$\s?0[^.]*\.?/gi,
  /\s*Cotizaci[oó]n\s+\$\s?0[^.]*\.?/g,
];
function noPrice(text) {
  let t = String(text);
  for (const re of PRICE_RULES) t = t.replace(re, '');
  t = t.replace(/\s*\$\s?[\d.,]+[^.]*\.?/g, '');
  t = t
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/([.,;:])\1+/g, '$1')
    .trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}
function titleFor(slug) {
  const t = noPrice(rawH1(slug));
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function buildPost(slug, variant) {
  const meta = META[slug];
  const [e1, e2] = baseEmoji(slug);
  const url = `https://ilatekpr.com/${slug}`;
  const tags = hashtags(slug, meta.serviceName);
  const title = titleFor(slug);
  const summary =
    variant === 'A'
      ? `${title}\n\n${e1} ${meta.benTitle}\n\n${noPrice(meta.serviceDesc)}\n\n✅ agenda con $50 descontables del total · garantía por escrito\n📍 Cobertura en los 78 municipios de Puerto Rico\n\n${tags}`
      : `${title}\n\n${e2} ${meta.procLead}\n\n🧰 Un solo equipo: diagnóstico, sellado y garantía\n📋 Cotización clara antes de subir al techo\n\n${tags}`;
  return {
    slug,
    variant,
    url,
    title,
    summary,
    followUpComment: `📅 Agenda hoy: ${cleanName(meta.serviceName)} en Puerto Rico 👉 ${url}`,
  };
}

// ---- imágenes -------------------------------------------------------------
const heroId = (rawUrl) => rawUrl.split('/').pop();
async function localImageFor(kind, slug) {
  if (kind === 'social') {
    const p = path.join(ROOT, 'assets/optimized/social', `${slug}.jpg`);
    return fs.existsSync(p) ? p : null;
  }
  const hero = TECHOS_IMG[slug]?.hero;
  if (!hero) return null;
  const p = path.join(ROOT, 'assets/optimized/techos', heroId(hero).replace(/\.[a-z]+$/i, '.webp'));
  return fs.existsSync(p) ? p : null;
}
// Cuatro landings declaran una sola foto (hero == incluye y sin social propia).
// Para su segunda variación se usa el hero del servicio hermano del mismo cluster.
const RELATED = {
  'membrana-asfaltica': 'techos-de-asfalto',
  'sellado-de-poliuretano': 'sellado-de-techos',
  'sellado-de-silicona': 'sellado-de-techos',
  'limpieza-de-techos-y-canaletas': 'canaletas-y-bajantes',
};
function pickImages(slug) {
  const socialRaw = TECHOS_IMG_SOCIAL[slug] || TECHOS_IMG[slug]?.hero || null;
  const heroRaw = TECHOS_IMG[slug]?.hero || null;
  const inclRaw = TECHOS_IMG[slug]?.incl || null;
  // Imagen A = social de la landing; B = un hero distinto. Si la landing solo
  // declara una foto (social == hero), B usa su segunda foto (incluye).
  let b = heroRaw && heroRaw !== socialRaw ? heroRaw : inclRaw && inclRaw !== socialRaw ? inclRaw : null;
  let bSlug = slug;
  if (!b && RELATED[slug]) {
    bSlug = RELATED[slug];
    b = TECHOS_IMG[bSlug]?.hero || TECHOS_IMG[bSlug]?.incl || null;
  }
  return { a: socialRaw, b, bSlug };
}

async function toJpegBuffer(file) {
  return sharp(file).rotate().resize({ width: 1200, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 85 }).toBuffer();
}

async function upload(file, name) {
  const cache = fs.existsSync(UPLOAD_CACHE) ? JSON.parse(fs.readFileSync(UPLOAD_CACHE, 'utf8')) : {};
  if (cache[file]) return cache[file];
  const buf = await toJpegBuffer(file);
  const form = new FormData();
  form.append('file', new Blob([buf], { type: 'image/jpeg' }), name);
  form.append('locationId', LOC);
  const res = await fetch(`${API}/medias/upload-file`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28' },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(`upload ${name}: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  cache[file] = json.url;
  fs.writeFileSync(UPLOAD_CACHE, JSON.stringify(cache, null, 2));
  return json.url;
}

// ---- API ------------------------------------------------------------------
// Un solo cuerpo para borrador, edición y programación: las cuatro redes
// comparten texto e imagen y GHL desdobla el post en una publicación por
// plataforma, cada una con sus detalles de Pinterest y Google.
function postBody(post, mediaUrl, status = 'draft', scheduleDate = null, conGoogle = true) {
  const body = {
    accountIds: conGoogle ? NETWORKS : NETWORKS_SIN_GMB,
    summary: post.summary,
    media: [{ url: mediaUrl, type: 'image/jpeg' }],
    status,
    ...(scheduleDate ? { scheduleDate } : {}),
    type: 'post',
    followUpComment: post.followUpComment,
    userId: USER,
    createdBy: USER,
    pinterestPostDetails: {
      boardIds: { [PINTEREST_OAUTH]: PINTEREST_BOARD },
      title: post.title.length > 100 ? `${post.title.slice(0, 97)}...` : post.title,
      link: post.url,
    },
  };
  if (conGoogle) {
    body.gmbPostDetails = { gmbEventType: 'STANDARD', actionType: 'BOOK', url: post.url };
  }
  return body;
}

async function createPost(post, mediaUrl) {
  const body = postBody(post, mediaUrl);
  for (const version of ['2021-07-28', 'v3']) {
    const res = await fetch(`${API}/social-media-posting/${LOC}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PIT}`, Version: version, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return json?.results?.post?._id || json?.results?.post?.id || JSON.stringify(json).slice(0, 200);
    if (version === 'v3') throw new Error(`create ${post.slug}-${post.variant}: ${res.status} ${JSON.stringify(json).slice(0, 300)}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- main -----------------------------------------------------------------
const mode = process.argv[2] || '--plan';
const posts = SLUGS.flatMap((slug) => [buildPost(slug, 'A'), buildPost(slug, 'B')]);
const problems = [];
for (const p of posts) {
  const { a, b, bSlug } = pickImages(p.slug);
  p.images = { a, b, bSlug };
  if (!a) problems.push(`${p.slug}: sin imagen social`);
  if (!b) problems.push(`${p.slug}: sin segunda imagen distinta`);
  // Pinterest admite 800 caracteres: por encima, GHL recorta el texto en las
  // cuatro redes, porque un post lleva un solo resumen para todas.
  if (p.summary.length > 800) problems.push(`${p.slug}-${p.variant}: summary ${p.summary.length} chars (Pinterest 800)`);
  if (/\$/.test(p.summary)) problems.push(`${p.slug}-${p.variant}: menciona precio`);
  if (/\$/.test(p.title)) problems.push(`${p.slug}-${p.variant}: precio en el título`);
  const glued = p.summary.split('\n').filter((l) => !/^#/.test(l)).find((l) => /[a-záéíóúñ][A-ZÁÉÍÓÚÑ]/.test(l));
  if (glued) problems.push(`${p.slug}-${p.variant}: palabras pegadas → ${glued.slice(0, 60)}`);
}
console.log(`posts: ${posts.length} | landings: ${SLUGS.length} | problemas: ${problems.length}`);
problems.slice(0, 10).forEach((x) => console.log('  !', x));
if (problems.length) process.exit(1);

if (mode === '--plan') {
  fs.writeFileSync(PLAN, JSON.stringify(posts, null, 2));
  console.log('plan:', PLAN);
  console.log('\n--- muestra ---\n' + posts[0].summary + '\n\n[comentario] ' + posts[0].followUpComment);
  process.exit(0);
}

// Reescribe el copy de los borradores ya creados (mismos ids, misma imagen).
if (mode === '--update') {
  const done = JSON.parse(fs.readFileSync(RESULT, 'utf8'));
  const uploads = fs.existsSync(UPLOAD_CACHE) ? JSON.parse(fs.readFileSync(UPLOAD_CACHE, 'utf8')) : {};
  let updated = 0, bad = 0;
  for (const post of posts) {
    const key = `${post.slug}-${post.variant}`;
    const rec = done[key];
    const media = rec && (uploads[rec.image] || rec.media);
    if (!rec?.id || !media) {
      bad++;
      console.log(`SIN DATOS ${key}`);
      continue;
    }
    try {
      const res = await fetch(`${API}/social-media-posting/${LOC}/posts/${rec.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody(post, media)),
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
      updated++;
    } catch (e) {
      bad++;
      console.log(`FALLO ${key}: ${e.message}`);
    }
    await sleep(300);
  }
  console.log(`\nactualizados: ${updated} | fallos: ${bad}`);
  process.exit(bad ? 1 : 0);
}

// ---- programación: 25 posts por día en hora de Puerto Rico -----------------
// Puerto Rico usa AST todo el año (UTC-4, sin horario de verano). Topes diarios
// por red: Facebook 25, Instagram 25, Pinterest 20–30, Google 1. La más estrecha
// manda: 25 franjas de 07:00 a 21:30 (una cada ~36 min), y Google solo en el
// primer post de cada fecha. El fin de semana el patrón corre media hora más tarde.
const MAX_POR_DIA = 25;
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
const SCHEDULE = path.join(ROOT, '.tmp-social-schedule.json');

const todayAst = () => new Date(Date.now() - AST_OFFSET_H * 3600e3).toISOString().slice(0, 10);
const astToUtc = (dateStr, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h + AST_OFFSET_H, m)).toISOString();
};

// Agenda las primeras `count` franjas futuras, una por post, a 25 por día.
function agendaFor(count) {
  const out = [];
  const start = new Date(`${process.env.START || todayAst()}T12:00:00Z`);
  for (let d = 0; out.length < count && d < 60; d++) {
    const dateStr = new Date(start.getTime() + d * 86400000).toISOString().slice(0, 10);
    const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
    const times = dow === 0 || dow === 6 ? SLOTS.weekend : SLOTS.weekday;
    for (const time of times) {
      const at = astToUtc(dateStr, time);
      if (Date.parse(at) <= Date.now()) continue;
      out.push({ date: dateStr, time, at });
      if (out.length >= count) break;
    }
  }
  return out;
}

if (mode === '--schedule' || mode === '--dry-run') {
  const done = JSON.parse(fs.readFileSync(RESULT, 'utf8'));
  const uploads = JSON.parse(fs.readFileSync(UPLOAD_CACHE, 'utf8'));
  // Las 32 fichas A y después las 32 B: las dos versiones del mismo servicio
  // quedan separadas varios días en vez de salir seguidas.
  const queue = [...posts.filter((p) => p.variant === 'A'), ...posts.filter((p) => p.variant === 'B')];
  const slots = agendaFor(queue.length);
  if (slots.length < queue.length) throw new Error(`solo ${slots.length} franjas para ${queue.length} posts`);
  // Google Business Profile: un post al día, siempre el primero de la fecha.
  const primeras = new Map();
  for (const s of slots) if (!primeras.has(s.date)) primeras.set(s.date, s.at);
  const plan = queue.map((post, i) => {
    const key = `${post.slug}-${post.variant}`;
    const rec = done[key];
    const media = rec && (uploads[rec.image] || rec.media);
    if (!rec?.id || !media) throw new Error(`SIN DATOS ${key}`);
    return { key, post, id: rec.id, media, ...slots[i] };
  });
  const perDay = plan.reduce((acc, x) => ((acc[x.date] = (acc[x.date] || 0) + 1), acc), {});
  console.log(`agenda: ${plan.length} posts | ${Object.keys(perDay).length} días | ${plan[0].date} → ${plan[plan.length - 1].date}`);
  for (const [date, n] of Object.entries(perDay)) {
    const times = plan.filter((x) => x.date === date).map((x) => x.time).join('  ');
    console.log(`  ${date}  ${String(n).padStart(2)} posts  ${times} AST`);
  }
  if (mode === '--dry-run') process.exit(0);

  const ledger = fs.existsSync(SCHEDULE) ? JSON.parse(fs.readFileSync(SCHEDULE, 'utf8')) : { posts: {} };
  ledger.posts ||= {};
  const save = () => {
    ledger.generado = new Date().toISOString();
    ledger.zona = 'America/Puerto_Rico (AST, UTC-4, sin horario de verano)';
    ledger.franjas = SLOTS;
    ledger.cuentas = ACCOUNTS;
    fs.writeFileSync(SCHEDULE, JSON.stringify(ledger, null, 2));
  };

  let ok = 0, skipped = 0;
  const fails = [];
  for (const [idx, item] of plan.entries()) {
    if (ledger.posts[item.key]?.at && !process.env.FORCE) {
      skipped++;
      continue;
    }
    try {
      // Candado: no se programa nada cuya landing no esté lanzada y en vivo.
      const gate = await verificarLanding(item.post.url);
      if (!gate.ok) {
        skipped++;
        console.log(`SALTADO ${item.key}: ${gate.motivo}`);
        continue;
      }
      item.at = ajustarSlot(item.at, gate.publicadoEn);
      const res = await fetch(`${API}/social-media-posting/${LOC}/posts/${item.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody(item.post, item.media, 'scheduled', item.at, primeras.get(item.date) === item.at)),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 240)}`);
      const saved = json.post || json.results?.post || {};
      if (saved.status && saved.status !== 'scheduled') throw new Error(`quedó en ${saved.status}`);
      ledger.posts[item.key] = { id: item.id, date: item.date, time: item.time, at: item.at, status: 'scheduled', redes: ['facebook', 'instagram', 'pinterest', 'google'] };
      save();
      ok++;
      console.log(`ok ${item.date} ${item.time} AST  ${item.key}`);
    } catch (e) {
      fails.push(`${item.key}: ${e.message}`);
      console.log(`FALLO ${item.key}: ${e.message}`);
    }
    await sleep(350);
  }
  save();
  console.log(`\nprogramados: ${ok} | ya estaban: ${skipped} | fallos: ${fails.length}`);
  fails.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

const done = fs.existsSync(RESULT) ? JSON.parse(fs.readFileSync(RESULT, 'utf8')) : {};
let created = 0, failed = 0;
const ONLY = process.env.ONLY;
for (const post of (ONLY ? posts.filter((p) => `${p.slug}-${p.variant}` === ONLY) : posts)) {
  const key = `${post.slug}-${post.variant}`;
  if (done[key]?.id) continue;
  try {
    const fileA = await localImageFor('social', post.slug);
    const fileB = (await localImageFor('hero', post.images.bSlug)) || fileA;
    const file = post.variant === 'A' ? fileA : fileB;
    if (!file) throw new Error('sin archivo local');
    const url = await upload(file, `ilatek-${post.slug}-${post.variant}.jpg`);
    const id = await createPost(post, url);
    done[key] = { id, image: file, at: new Date().toISOString() };
    fs.writeFileSync(RESULT, JSON.stringify(done, null, 2));
    created++;
    console.log(`ok ${key} -> ${id}`);
  } catch (e) {
    failed++;
    console.log(`FALLO ${key}: ${e.message}`);
  }
  await sleep(400);
}
console.log(`\ncreados: ${created} | fallos: ${failed} | total registrados: ${Object.keys(done).length}`);
if (failed) process.exit(1);
