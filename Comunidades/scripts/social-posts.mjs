// Ilatek · Posts de Social Planner para las comunidades ya publicadas.
// Dos posts por comunidad: uno de Sellado de techos y uno de Limpieza, cada uno
// con la imagen social 1200x630 de SU página (pages[].seo.image de la Media
// Library) y el enlace a su landing en comunidades.ilatekpr.com.
//
// El "título" del post es el H1 de su landing (Facebook e Instagram no tienen
// campo de título: la primera línea del texto hace ese papel). La descripción
// arranca con el emoji del servicio y no menciona precios.
//
// Uso:
//   node scripts/social-posts.mjs --plan             # escribe el plan, no publica
//   node scripts/social-posts.mjs --create --limit 1 # una comunidad de prueba
//   node scripts/social-posts.mjs --create           # todas las publicadas
//   node scripts/social-posts.mjs --update --limit 1 # refresca copy de un post
//   node scripts/social-posts.mjs --verify           # comprueba lo creado
//
// Los posts se crean como BORRADORES (status draft) y el resultado queda en
// data/ghl/social-posts.json, así que relanzar no duplica: salta lo ya creado.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API = 'https://services.leadconnectorhq.com';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '..', '.mcp.json'), 'utf8')).mcpServers.ghl.env;
const PIT = cfg.ZJ_GHL_PIT;
const LOC = cfg.ZJ_GHL_LOCATION;

const ACCOUNTS = {
  facebook: '6acda865eb91805c4588f867_8OxUENFVM60EKzqsTcoD_1230828613443086_page',
  instagram: '6acda898cf4cd6226dbd3983_8OxUENFVM60EKzqsTcoD_17841443104235049',
};

const PLAN = path.join(ROOT, 'data/ghl/social-posts-plan.json');
const RESULT = path.join(ROOT, 'data/ghl/social-posts.json');

const SERVICES = {
  techos: { label: 'Sellado de techos', tag: 'SelladoDeTechos', emoji: '🛡️' },
  limpieza: { label: 'Limpieza', tag: 'Limpieza', emoji: '🧹' },
};

// ---- datos ----------------------------------------------------------------
const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ghl/index.json'), 'utf8'));
const publicadas = index.funnels
  .filter((f) => f.status === 'publicado')
  .sort((a, b) => String(a.publishedAt || '').localeCompare(String(b.publishedAt || '')) || a.slug.localeCompare(b.slug));

function payload(f) {
  const file = path.join(ROOT, 'data/ghl/funnels', f.municipalitySlug, `${f.slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// ---- título: H1 de la landing ---------------------------------------------
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ',
};

function h1Of(pg) {
  const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(pg.html || '');
  if (!m) return '';
  return m[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&([a-zA-Z]+);/g, (s, e) => ENTITIES[e] ?? s)
    .replace(/\s+/g, ' ')
    .trim();
}

// ---- copy -----------------------------------------------------------------
const pascal = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

const STOP = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'en', 'a']);
const tag = (name) => '#' + name.split(/[\s-]+/).filter((w) => w && !STOP.has(w.toLowerCase())).map(pascal).join('');

function hashtags(comunidad, municipio, kind) {
  return [tag(comunidad), tag(municipio), `#${SERVICES[kind].tag}`, '#Ilatek', '#PuertoRico'].join(' ');
}

// Descripción (el emoji del servicio lo antepone buildPosts; sin precios).
const TEXTS = {
  techos: [
    (c, m, url, tags) =>
      `En ${c} (${m}), el techo aguanta sol fuerte y lluvia constante todo el año.\n\nSellado profesional con inspección previa, preparación de la superficie y garantía por escrito. Un solo equipo se encarga del diagnóstico, el sellado y el seguimiento.\n\n✅ Inspección previa al servicio\n🧰 Materiales para clima tropical\n📍 Cobertura en todo Puerto Rico\n\nSolicita tu inspección en ${c} 👉 ${url}\n\n${tags}`,
    (c, m, url, tags) =>
      `¿Goteras, humedad o empozamiento en tu techo en ${c}?\n\nAntes de la próxima tormenta conviene revisarlo. Detectamos el punto exacto de la filtración, sellamos y te dejamos por escrito qué se trabajó y con qué garantía.\n\n✅ Diagnóstico claro antes de subir al techo\n🧰 Reparación y sellado en una sola visita\n📍 ${m} y todo Puerto Rico\n\nAgenda tu inspección 👉 ${url}\n\n${tags}`,
    (c, m, url, tags) =>
      `Cada temporada de lluvia en ${m} pone a prueba los techos de ${c}.\n\nUn techo sellado a tiempo evita goteras, manchas y reparaciones mayores. Trabajamos con preparación de superficie y sistemas de sellado pensados para el clima de la isla.\n\n✅ Garantía por escrito\n🧰 Equipo propio, sin subcontratas\n📍 Servicio en ${m}\n\nSolicita tu inspección 👉 ${url}\n\n${tags}`,
  ],
  limpieza: [
    (c, m, url, tags) =>
      `Una casa limpia cambia el día. En ${c}, ${m}, llegamos con equipo y productos profesionales para dejar cada espacio listo.\n\n✅ Cocina, baños, pisos y áreas comunes\n🧰 Personal entrenado\n📋 Servicio a tu medida\n\nReserva tu limpieza en ${c} 👉 ${url}\n\n${tags}`,
    (c, m, url, tags) =>
      `¿Mudanza, post-construcción o limpieza a fondo en ${c}?\n\nCubrimos lo que la limpieza del diario no alcanza: polvo fino, grasa acumulada, ventanas y rincones. Entregamos el espacio listo para usarse.\n\n✅ Productos y equipo incluidos\n🧰 Un solo equipo para todo el servicio\n📍 Servicio en ${m}\n\nSolicita tu limpieza 👉 ${url}\n\n${tags}`,
    (c, m, url, tags) =>
      `En ${c} (${m}) la humedad y el polvo se acumulan rápido. Una limpieza profunda cada cierto tiempo alarga la vida de pisos, muebles y electrodomésticos.\n\n✅ Limpieza residencial, comercial e industrial\n🧰 Personal con experiencia\n📋 Servicio a tu medida\n\nAgenda tu servicio 👉 ${url}\n\n${tags}`,
  ],
};

const hash = (s) => [...s].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);

function buildPosts(f, data) {
  const out = [];
  for (const pg of data.pages) {
    const kind = pg.kind;
    if (!SERVICES[kind]) continue;
    const svc = SERVICES[kind];
    const variants = TEXTS[kind];
    const v = variants[hash(`${f.municipalitySlug}/${f.slug}/${kind}`) % variants.length];
    const tags = hashtags(f.community, f.municipality, kind);
    const title = h1Of(pg);
    out.push({
      key: `${f.municipalitySlug}/${f.slug}/${kind}`,
      municipalitySlug: f.municipalitySlug,
      slug: f.slug,
      community: f.community,
      municipality: f.municipality,
      kind,
      title,
      url: pg.url,
      image: pg.seo?.image || '',
      summary: title ? `${title}\n\n${svc.emoji} ${v(f.community, f.municipality, pg.url, tags)}` : '',
      followUpComment: `📅 Agenda hoy: ${svc.label} en ${f.community}, ${f.municipality} 👉 ${pg.url}`,
    });
  }
  return out;
}

// ---- helpers --------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// La API limita peticiones en paralelo (429): se reintenta con espera creciente.
async function api(pathname, init = {}, tries = 6) {
  let res;
  for (let n = 0; n < tries; n++) {
    res = await fetch(API + pathname, {
      ...init,
      headers: {
        Authorization: `Bearer ${PIT}`,
        Version: '2021-07-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers || {}),
      },
    });
    if (res.status !== 429) return res;
    await sleep(1500 * (n + 1));
  }
  return res;
}

async function getPost(id) {
  const res = await api(`/social-media-posting/${LOC}/posts/${id}`);
  const json = await res.json().catch(() => ({}));
  return { res, p: json.post || json.results?.post || json };
}

function body(post) {
  return {
    accountIds: [ACCOUNTS.facebook, ACCOUNTS.instagram],
    summary: post.summary,
    media: [{ url: post.image, type: post.image.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg' }],
    status: 'draft',
    type: 'post',
    followUpComment: post.followUpComment,
  };
}

const ledger = fs.existsSync(RESULT) ? JSON.parse(fs.readFileSync(RESULT, 'utf8')) : { posts: {} };
ledger.posts ||= {};
const save = () => {
  ledger.generado = new Date().toISOString();
  ledger.cuenta = { location: LOC, redes: ['facebook', 'instagram'], estado: 'draft' };
  fs.writeFileSync(RESULT, JSON.stringify(ledger, null, 2));
};

// ---- argumentos -----------------------------------------------------------
const args = process.argv.slice(2);
// --dry-run es un modificador de --schedule, no un modo por sí solo.
const mode = args.includes('--schedule') ? '--schedule' : args.find((a) => a.startsWith('--')) || '--plan';
const limitArg = args.indexOf('--limit');
const onlyArg = args.indexOf('--only');
const limit = limitArg > -1 ? Number(args[limitArg + 1]) : Infinity;
const only = onlyArg > -1 ? args[onlyArg + 1] : null;

let queue = publicadas;
if (only) queue = queue.filter((f) => `${f.municipalitySlug}/${f.slug}` === only || f.slug === only);
if (Number.isFinite(limit)) queue = queue.slice(0, limit);

const posts = [];
const problems = [];
for (const f of queue) {
  const data = payload(f);
  if (!data) {
    problems.push(`${f.municipalitySlug}/${f.slug}: sin payload`);
    continue;
  }
  for (const p of buildPosts(f, data)) {
    if (!p.title) problems.push(`${p.key}: sin h1`);
    if (!p.image) problems.push(`${p.key}: sin imagen social`);
    if (!p.summary) problems.push(`${p.key}: sin texto`);
    if (p.summary.length > 2100) problems.push(`${p.key}: summary ${p.summary.length} chars`);
    if (/\bprecio/i.test(p.summary)) problems.push(`${p.key}: menciona precio`);
    posts.push(p);
  }
}

console.log(`comunidades: ${queue.length} | posts: ${posts.length} | problemas: ${problems.length}`);
problems.slice(0, 10).forEach((x) => console.log('  !', x));
if (problems.length) process.exit(1);

if (mode === '--plan') {
  fs.writeFileSync(PLAN, JSON.stringify({ generado: new Date().toISOString(), posts }, null, 2));
  console.log('plan:', PLAN);
  console.log('\n--- muestra ---\n' + posts[0].summary + '\n\n[comentario] ' + posts[0].followUpComment);
  process.exit(0);
}

// La API exige el usuario que crea o edita el post: se resuelve en la location,
// con el dueño (ilatek.pr@gmail.com) primero para que el borrador quede a su nombre.
async function resolveUserId() {
  const res = await api(`/users/?locationId=${LOC}`);
  const json = await res.json().catch(() => ({}));
  const users = json.users || [];
  const owner = users.find((u) => /^ilatek\.pr@gmail\.com$/i.test(u.email || '')) || users[0];
  if (!owner?.id) throw new Error(`no se pudo resolver userId (${res.status})`);
  return owner.id;
}

// ---- verificación ---------------------------------------------------------
if (mode === '--verify') {
  const keys = Object.keys(ledger.posts);
  const expected = new Map(posts.map((p) => [p.key, p]));
  const fails = [];
  let ok = 0;
  const queueCheck = keys.filter((k) => expected.has(k));
  const CONC = 3;
  for (let i = 0; i < queueCheck.length; i += CONC) {
    await Promise.all(
      queueCheck.slice(i, i + CONC).map(async (key) => {
        const post = expected.get(key);
        const { res, p } = await getPost(ledger.posts[key].id);
        const media = (p.media || [])[0]?.url || '';
        const summary = String(p.summary || '');
        const bad = [];
        if (!res.ok) bad.push(`http ${res.status}`);
        if (!['draft', 'scheduled'].includes(p.status)) bad.push(`status ${p.status}`);
        if (media !== post.image) bad.push('imagen distinta');
        if (summary.split('\n')[0].trim() !== post.title) bad.push('título ≠ h1');
        if (!summary.includes(SERVICES[post.kind].emoji)) bad.push('sin emoji');
        if (/\bprecio/i.test(summary)) bad.push('menciona precio');
        if (!summary.includes(post.url)) bad.push('sin URL en el texto');
        if (!String(p.followUpComment || '').includes(post.url)) bad.push('sin URL en el comentario');
        if (![2, 3].includes((p.accountIds || []).length)) bad.push(`cuentas ${(p.accountIds || []).length}`);
        if (bad.length) fails.push(`${key}: ${bad.join(', ')}`);
        else ok++;
      }),
    );
  }
  const imgs = new Set(keys.map((k) => ledger.posts[k].image));
  console.log(`verificados: ${ok}/${queueCheck.length} | fallos: ${fails.length} | imágenes distintas: ${imgs.size}/${keys.length}`);
  fails.slice(0, 15).forEach((f) => console.log('  !', f));
  const missing = posts.filter((p) => !ledger.posts[p.key]?.id).map((p) => p.key);
  if (missing.length) console.log(`  ! sin crear: ${missing.length} (${missing.slice(0, 5).join(', ')})`);
  process.exit(fails.length || missing.length ? 1 : 0);
}

// ---- actualizar copy de borradores ya creados ------------------------------
if (mode === '--update') {
  const USER_ID = await resolveUserId();
  console.log(`usuario creador: ${USER_ID}`);
  let ok = 0;
  let skipped = 0;
  const fails = [];
  const CONC = 2;
  for (let i = 0; i < posts.length; i += CONC) {
    await Promise.all(
      posts.slice(i, i + CONC).map(async (post) => {
        const rec = ledger.posts[post.key];
        if (!rec?.id) {
          skipped++;
          return;
        }
        const res = await api(`/social-media-posting/${LOC}/posts/${rec.id}`, {
          method: 'PUT',
          body: JSON.stringify({ userId: USER_ID, ...body(post) }),
        });
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          fails.push(`${post.key}: http ${res.status} ${t.slice(0, 120)}`);
          return;
        }
        rec.title = post.title;
        rec.updatedAt = new Date().toISOString();
        ok++;
        console.log(`ok ${post.key}`);
      }),
    );
    save();
  }
  save();
  console.log(`\nactualizados: ${ok} | sin id: ${skipped} | fallos: ${fails.length}`);
  fails.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

// ---- programación (7/día en horas fijas, Google solo el primero de cada fecha) ----
//
// Comparte el calendario con los otros dos lotes de la misma cuenta: pueblos
// (.tmp-pueblos-posts.json) y techos (.tmp-social-schedule.json). El tope de 25
// al día es de la cuenta, no de cada lote, así que primero se ocupan las franjas
// que ellos dejan libres y solo después se sigue la cola hacia adelante.
const GOOGLE = '6ab039f0dd6ff043728d0614_8OxUENFVM60EKzqsTcoD_12294364361346557718';
const MAX_POR_DIA = 7;
const AST_OFFSET_H = 4;
const OTROS_LOTES = [
  path.join(ROOT, '..', '.tmp-pueblos-posts.json'),
  path.join(ROOT, '..', '.tmp-social-schedule.json'),
];

function franjas(extraMin = 0) {
  // Rejilla fija de comunidades: 08, 10, 12, 14, 16, 18 y 20 AST. Las franjas
  // impares y la madrugada quedan libres para publicar a mano todos los días.
  const inicio = 8 * 60 + extraMin;
  const fin = 20 * 60 + extraMin;
  return Array.from({ length: MAX_POR_DIA }, (_, i) => {
    const min = Math.round(inicio + (i * (fin - inicio)) / (MAX_POR_DIA - 1));
    return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  });
}
const SLOTS = { weekday: franjas(0), weekend: franjas(30) };
const desfase = (semilla) => hash(semilla) % 7;
const astToUtc = (dateStr, hhmm, extraMin = 0) => {
  const [h, m] = hhmm.split(':').map(Number);
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h + AST_OFFSET_H, m + extraMin)).toISOString();
};
const fechaAst = (at) => new Date(Date.parse(at) - AST_OFFSET_H * 3600e3).toISOString().slice(0, 10);

// Techos y pueblos no usan todas las franjas de la rejilla (techos va 4 al día a
// horas redondas), así que además de la hora ocupada hay que contar cuántos
// posts lleva cada fecha: el tope de 25 es del día completo, no de la franja.
function agendaAjena() {
  const ats = new Set();
  const porFecha = new Map();
  const gmb = new Set();
  for (const file of OTROS_LOTES) {
    if (!fs.existsSync(file)) continue;
    const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const r of Object.values(doc.posts || {})) {
      if (!r.at) continue;
      const d = r.date || fechaAst(r.at);
      ats.add(r.at);
      porFecha.set(d, (porFecha.get(d) || 0) + 1);
      if (r.gmb || (r.redes || []).includes('google')) gmb.add(d);
    }
  }
  return { ats, porFecha, gmb };
}

function franjasLibres(count, ocupados, porFecha) {
  const out = [];
  const desde = Date.now() + 10 * 60e3;
  const hoy = new Date(Date.now() - AST_OFFSET_H * 3600e3);
  let dia = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate(), 12);
  for (let guard = 0; out.length < count && guard < 1500; guard++, dia += 86400000) {
    const dateStr = new Date(dia).toISOString().slice(0, 10);
    const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
    const times = dow === 0 || dow === 6 ? SLOTS.weekend : SLOTS.weekday;
    let enElDia = porFecha.get(dateStr) || 0;
    for (const time of times) {
      if (enElDia >= MAX_POR_DIA) break;
      const at = astToUtc(dateStr, time, desfase(dateStr + time));
      if (Date.parse(at) <= desde || ocupados.has(at)) continue;
      out.push({ date: dateStr, time, at });
      enElDia++;
      if (out.length >= count) break;
    }
  }
  return out;
}

// Dos posts seguidos nunca son de la misma comunidad: se alternan las
// comunidades y dentro de cada una limpieza con techos.
function ordenar(posts) {
  const porFunnel = new Map();
  for (const p of posts) {
    const k = `${p.municipalitySlug}/${p.slug}`;
    if (!porFunnel.has(k)) porFunnel.set(k, []);
    porFunnel.get(k).push(p);
  }
  const colas = [...porFunnel.values()].map((l) =>
    l.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'limpieza' ? -1 : 1)),
  );
  const out = [];
  for (let i = 0; out.length < posts.length; i++) for (const c of colas) if (c[i]) out.push(c[i]);
  return out;
}

function scheduledBody(post, at, conGoogle) {
  return {
    accountIds: conGoogle
      ? [ACCOUNTS.facebook, ACCOUNTS.instagram, GOOGLE]
      : [ACCOUNTS.facebook, ACCOUNTS.instagram],
    summary: post.summary,
    media: [{ url: post.image, type: post.image.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg' }],
    status: 'scheduled',
    scheduleDate: at,
    type: 'post',
    followUpComment: post.followUpComment,
    ...(conGoogle ? { gmbPostDetails: { gmbEventType: 'STANDARD', actionType: 'BOOK', url: post.url } } : {}),
  };
}

// Crea los que faltan y fecha los borradores que ya existen. Es idempotente:
// un post con franja asignada no se vuelve a tocar.
async function programar(USER_ID, dry) {
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ghl/index.json'), 'utf8'));
  let listas = idx.funnels
    .filter((f) => f.status === 'publicado')
    .sort((a, b) => String(a.publishedAt || '').localeCompare(String(b.publishedAt || '')) || a.slug.localeCompare(b.slug));
  if (only) listas = listas.filter((f) => `${f.municipalitySlug}/${f.slug}` === only || f.slug === only);
  if (Number.isFinite(limit)) listas = listas.slice(0, limit);

  const todos = [];
  const problemas = [];
  for (const f of listas) {
    const data = payload(f);
    if (!data) {
      problemas.push(`${f.municipalitySlug}/${f.slug}: sin payload`);
      continue;
    }
    for (const p of buildPosts(f, data)) {
      if (!p.image) problemas.push(`${p.key}: sin imagen social`);
      if (!p.summary) problemas.push(`${p.key}: sin texto`);
      if (p.summary.length > 2100) problemas.push(`${p.key}: summary ${p.summary.length} chars`);
      todos.push(p);
    }
  }

  const pendientes = ordenar(todos.filter((p) => !ledger.posts[p.key]?.slot));
  console.log(
    `publicadas: ${listas.length} | posts: ${todos.length} | sin programar: ${pendientes.length} | problemas: ${problemas.length}`,
  );
  problemas.slice(0, 8).forEach((x) => console.log('  !', x));
  if (!pendientes.length) return { creados: 0, fechados: 0, fallos: [] };

  const { ats, porFecha, gmb } = agendaAjena();
  const yaPuestos = Object.values(ledger.posts).filter((r) => r.slot);
  const ocupados = new Set([...ats, ...yaPuestos.map((r) => r.slot)]);
  for (const r of yaPuestos) {
    const d = r.date || fechaAst(r.slot);
    porFecha.set(d, (porFecha.get(d) || 0) + 1);
    if (r.gmb) gmb.add(d);
  }
  const slots = franjasLibres(pendientes.length, ocupados, porFecha);
  const primeros = new Map();
  for (const s of slots) if (!primeros.has(s.date)) primeros.set(s.date, s.at);
  const llevaGoogle = (s) => primeros.get(s.date) === s.at && !gmb.has(s.date);

  const porDia = {};
  slots.forEach((s, i) => (porDia[s.date] = (porDia[s.date] || 0) + 1));
  const dias = Object.keys(porDia).sort();
  console.log(`franjas: ${slots.length} | ${dias.length} días | ${dias[0]} → ${dias[dias.length - 1]} | máx/día ${Math.max(...Object.values(porDia))}`);
  console.log(`con Google: ${slots.filter(llevaGoogle).length}`);

  if (dry) {
    const combinado = Math.max(...dias.map((d) => porDia[d] + (porFecha.get(d) || 0)));
    console.log(`máx/día sumando pueblos y techos: ${combinado}`);
    console.log('\n--- primeros 10 ---');
    slots.slice(0, 10).forEach((s, i) =>
      console.log(`  ${s.date} ${s.time} AST  ${llevaGoogle(s) ? 'GMB ' : '    '}${pendientes[i].key}`),
    );
    return { creados: 0, fechados: 0, fallos: [], dry: true, slots };
  }

  let creados = 0;
  let fechados = 0;
  const fallos = [];
  for (let i = 0; i < pendientes.length && i < slots.length; i++) {
    const post = pendientes[i];
    const slot = slots[i];
    const g = llevaGoogle(slot);
    const rec = ledger.posts[post.key];
    try {
      if (rec?.id) {
        const res = await api(`/social-media-posting/${LOC}/posts/${rec.id}`, {
          method: 'PUT',
          body: JSON.stringify({ userId: USER_ID, ...scheduledBody(post, slot.at, g) }),
        });
        if (!res.ok) throw new Error(`${res.status} ${(await res.text().catch(() => '')).slice(0, 140)}`);
        rec.slot = slot.at;
        rec.date = slot.date;
        rec.time = slot.time;
        rec.gmb = g;
        fechados++;
        console.log(`ok ${slot.date} ${slot.time} ${g ? 'GMB ' : '    '}${post.key}`);
      } else {
        const res = await api(`/social-media-posting/${LOC}/posts`, {
          method: 'POST',
          body: JSON.stringify({ userId: USER_ID, ...scheduledBody(post, slot.at, g) }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 140)}`);
        const id = json?.results?.post?._id || json?.results?.post?.id || json?.results?.id;
        if (!id) throw new Error('sin id en la respuesta');
        ledger.posts[post.key] = {
          id,
          title: post.title,
          image: post.image,
          url: post.url,
          slot: slot.at,
          date: slot.date,
          time: slot.time,
          gmb: g,
          createdAt: new Date().toISOString(),
        };
        creados++;
        console.log(`ok ${slot.date} ${slot.time} ${g ? 'GMB ' : '    '}${post.key} (nuevo)`);
      }
      save();
    } catch (e) {
      fallos.push(`${post.key}: ${e.message}`);
      console.log(`FALLO ${post.key}: ${e.message}`);
    }
    await sleep(300);
  }
  save();
  console.log(`\ncreados: ${creados} | fechados: ${fechados} | fallos: ${fallos.length}`);
  fallos.slice(0, 10).forEach((f) => console.log('  !', f));
  return { creados, fechados, fallos };
}

if (mode === '--schedule') {
  const dry = args.includes('--dry-run');
  const wait = args.includes('--wait');
  const USER_ID = dry ? null : await resolveUserId();
  let r = await programar(USER_ID, dry);
  while (wait) {
    const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ghl/index.json'), 'utf8'));
    const faltan = idx.funnels.filter((f) => f.status !== 'publicado').length;
    if (!faltan) {
      console.log('todas las comunidades están publicadas: no queda nada por programar');
      break;
    }
    console.log(`quedan ${faltan} comunidades publicándose: reviso en 10 min`);
    await sleep(600e3);
    r = await programar(USER_ID, dry);
  }
  process.exit(r.fallos?.length ? 1 : 0);
}

// ---- creación -------------------------------------------------------------
const USER_ID = await resolveUserId();
console.log(`usuario creador: ${USER_ID}`);

async function createPost(post) {
  const res = await api(`/social-media-posting/${LOC}/posts`, {
    method: 'POST',
    body: JSON.stringify({ userId: USER_ID, ...body(post) }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 300)}`);
  return json?.results?.post?._id || json?.results?.post?.id || json?.results?.id || JSON.stringify(json).slice(0, 200);
}

let created = 0;
let skipped = 0;
let failed = 0;
for (const post of posts) {
  if (ledger.posts[post.key]?.id) {
    skipped++;
    continue;
  }
  try {
    const id = await createPost(post);
    ledger.posts[post.key] = { id, title: post.title, image: post.image, url: post.url, at: new Date().toISOString() };
    save();
    created++;
    console.log(`ok ${post.key} -> ${id}`);
  } catch (e) {
    failed++;
    console.log(`FALLO ${post.key}: ${e.message}`);
  }
  await sleep(350);
}
save();
console.log(`\ncreados: ${created} | ya existían: ${skipped} | fallos: ${failed} | total registrados: ${Object.keys(ledger.posts).length}`);
if (failed) process.exit(1);
