// Reorganiza los posts YA programados para que cada día tenga como máximo
// 7 publicaciones por red (Facebook, Instagram, Pinterest) y exactamente
// 1 en Google Business Profile (más de una al día se marca como spam).
//
// Uso:
//   node tools/social-reorg.mjs --plan     crea el plan (no toca la API)
//   node tools/social-reorg.mjs --apply    aplica el plan con PUT (idempotente)
//   node tools/social-reorg.mjs --verify   relee la agenda y audita los topes
//
// El plan se guarda en social-reorg/plan-<fecha>.json y se reutiliza en
// --apply/--verify: así un corte a mitad no cambia el orden ni duplica fechas.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'social-reorg');
fs.mkdirSync(DIR, { recursive: true });

const PIT = JSON.stringify(JSON.parse(fs.readFileSync(path.join(ROOT, '.mcp.json'), 'utf8'))).match(/pit-[a-z0-9-]+/i)[0];
const LOC = '8OxUENFVM60EKzqsTcoD';
const API = 'https://services.leadconnectorhq.com';
const H = { Authorization: `Bearer ${PIT}`, Version: '2021-07-28', 'Content-Type': 'application/json' };
const GMB = '6ab039f0dd6ff043728d0614_8OxUENFVM60EKzqsTcoD_12294364361346557718';

// Topes del propietario (noviembre 2026): 7 por red y día, 1 de Google al día.
const POR_DIA = 7;
const HORAS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const AST_OFFSET_H = 4;
const INICIO = process.env.INICIO || '2026-11-05';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const planFiles = () => fs.readdirSync(DIR).filter((f) => f.startsWith('plan-') && f.endsWith('.json')).sort();
function planPath() {
  const f = planFiles();
  if (!f.length) throw new Error('no hay plan: corre --plan primero');
  return path.join(DIR, f[f.length - 1]);
}

async function listar() {
  const all = [];
  for (let skip = 0, guard = 0; guard < 200; guard++) {
    const r = await fetch(`${API}/social-media-posting/${LOC}/posts/list`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({ type: 'scheduled', skip: String(skip), limit: '100' }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`list ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
    const arr = j.results?.posts || j.posts || [];
    all.push(...arr);
    if (arr.length < 100) break;
    skip += 100;
  }
  return all;
}

// URL del post: la del pin; si el post no la trae (pasa en algunos de
// comunidades), se saca del copy. Google rechaza gmbPostDetails sin URL.
const urlOf = (rec) => {
  const pin = rec?.pinterestPostDetails?.link;
  if (pin && /^https?:\/\//.test(pin)) return pin;
  const m = `${rec?.summary || ''} ${rec?.followUpComment || ''}`.match(/https?:\/\/[^\s)"']+/);
  return m ? m[0].replace(/[.,)]+$/, '') : '';
};

// La API responde 429 cuando se le pide demasiado seguido: se reintenta con
// espera creciente (y el Retry-After si viene) antes de darlo por fallido.
async function put(id, body) {
  for (let n = 0; n < 6; n++) {
    const r = await fetch(`${API}/social-media-posting/${LOC}/posts/${id}`, { method: 'PUT', headers: H, body: JSON.stringify(body) });
    if (r.ok) return r;
    const txt = (await r.text()).slice(0, 160);
    if (r.status === 429 || r.status >= 500) {
      const espera = Number(r.headers.get('retry-after')) * 1000 || 3000 * 2 ** n;
      console.log(`  ${r.status} en ${id}: espero ${Math.round(espera / 1000)}s`);
      await sleep(espera);
      continue;
    }
    throw new Error(`${r.status} ${txt}`);
  }
  throw new Error('429/5xx tras 6 intentos');
}

const horaAst = (fecha, hora, extra) => {
  const [h, m] = hora.split(':').map(Number);
  const [y, mo, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h + AST_OFFSET_H, m + extra)).toISOString();
};
const fechaDe = (iso) => iso.slice(0, 10);

// Plan: se conserva el orden actual de la cola (el intercalado por pueblo ya
// está construido) y solo se espacian las fechas a 7 por día.
if (process.argv.includes('--plan')) {
  const posts = (await listar()).filter((p) => p.status === 'scheduled');
  posts.sort((a, b) => String(a.scheduleDate).localeCompare(String(b.scheduleDate)) || String(a._id).localeCompare(String(b._id)));
  const items = [];
  let dia = new Date(`${INICIO}T12:00:00Z`);
  for (let i = 0, k = 0; i < posts.length; i++, k++) {
    if (k && k % POR_DIA === 0) {
      dia = new Date(dia.getTime() + 86400000);
    }
    const fecha = dia.toISOString().slice(0, 10);
    const dow = new Date(`${fecha}T12:00:00Z`).getUTCDay();
    const finDeSemana = dow === 0 || dow === 6;
    const idx = k % POR_DIA;
    const extra = finDeSemana ? 30 : 0;
    const at = horaAst(fecha, HORAS[idx], extra);
    items.push({ id: posts[i]._id, at, gmb: false, url: urlOf(posts[i]), antes: posts[i].scheduleDate, rec: posts[i] });
  }
  // Un solo Google por día, y solo si el post tiene URL válida.
  const diasVistos = new Set();
  for (const it of items) {
    const d = fechaDe(it.at);
    if (diasVistos.has(d)) continue;
    if (it.url) { it.gmb = true; diasVistos.add(d); }
  }
  const dias = new Set(items.map((x) => fechaDe(x.at)));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = path.join(DIR, `plan-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify({ generado: new Date().toISOString(), porDia: POR_DIA, inicio: INICIO, items }, null, 1));
  console.log(`plan: ${items.length} posts | ${dias.size} días | ${INICIO} -> ${[...dias].sort().pop()}`);
  console.log('Google al día:', items.filter((x) => x.gmb).length, '| sin Google:', items.filter((x) => !x.gmb).length);
  console.log('archivo:', path.relative(ROOT, file));
  process.exit(0);
}

if (process.argv.includes('--apply')) {
  const plan = JSON.parse(fs.readFileSync(planPath(), 'utf8'));
  const stateFile = path.join(DIR, 'estado.json');
  const estado = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
  let ok = 0, same = 0;
  const fails = [];
  for (const it of plan.items) {
    const rec = it.rec;
    if (estado[it.id] === it.at) { same++; continue; }
    const cuenta = (rec.accountIds || []).filter((a) => a !== GMB);
    const body = {
      accountIds: it.gmb ? [...cuenta, GMB] : cuenta,
      summary: rec.summary,
      media: rec.media,
      status: 'scheduled',
      scheduleDate: it.at,
      type: 'post',
      followUpComment: rec.followUpComment,
      userId: rec.userId || rec.createdBy,
      createdBy: rec.createdBy || rec.userId,
      pinterestPostDetails: rec.pinterestPostDetails,
    };
    if (it.gmb) {
      body.gmbPostDetails = { gmbEventType: 'STANDARD', actionType: 'BOOK', url: it.url || urlOf(rec) };
    }
    try {
      await put(it.id, body);
      estado[it.id] = it.at;
      fs.writeFileSync(stateFile, JSON.stringify(estado));
      ok++;
      if (ok % 50 === 0) console.log(`  ${ok}/${plan.items.length} | ${it.at}`);
    } catch (e) {
      fails.push(`${it.id} ${it.at}: ${e.message}`);
      console.log(`FALLO ${it.id}: ${e.message}`);
    }
    await sleep(420);
  }
  console.log(`\nmovidos: ${ok} | ya estaban: ${same} | fallos: ${fails.length}`);
  fails.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

if (process.argv.includes('--verify')) {
  const posts = (await listar()).filter((p) => p.status === 'scheduled');
  const canales = { facebook: 0, instagram: 0, pinterest: 0, google: 0 };
  const porDia = {};
  for (const p of posts) {
    const d = fechaDe(p.scheduleDate);
    porDia[d] = porDia[d] || { facebook: 0, instagram: 0, pinterest: 0, google: 0, total: 0 };
    porDia[d].total++;
    for (const a of p.accountIds || []) {
      if (a.includes('_page')) { porDia[d].facebook++; canales.facebook++; }
      else if (a.includes('17841443')) { porDia[d].instagram++; canales.instagram++; }
      else if (a.includes('1146799630022429248')) { porDia[d].pinterest++; canales.pinterest++; }
      else if (a === GMB) { porDia[d].google++; canales.google++; }
    }
  }
  const dias = Object.keys(porDia).sort();
  const max = { facebook: 0, instagram: 0, pinterest: 0, google: 0 };
  const malos = [];
  for (const d of dias) {
    for (const k of Object.keys(max)) max[k] = Math.max(max[k], porDia[d][k]);
    if (porDia[d].facebook > 7 || porDia[d].instagram > 7 || porDia[d].pinterest > 7 || porDia[d].google > 1) malos.push(d);
  }
  console.log(`programados: ${posts.length} | días: ${dias.length} | ${dias[0]} -> ${dias[dias.length - 1]}`);
  console.log('totales por red:', JSON.stringify(canales));
  console.log('máximo por día:', JSON.stringify(max));
  console.log('días fuera de tope:', malos.length, malos.slice(0, 10).join(' '));
  const ejemplo = dias.slice(0, 3).map((d) => `${d}: ${JSON.stringify(porDia[d])}`);
  ejemplo.forEach((e) => console.log('  ', e));
  process.exit(malos.length ? 1 : 0);
}

// Pase final: deja cada día en 7 posts como máximo, 1 solo de Google, y
// devuelve Pinterest a los posts que lo perdieron por no traer tablero.
if (process.argv.includes('--normalize')) {
  const PIN_OATH = '6ab421b5f7a629112fd7fced_8OxUENFVM60EKzqsTcoD_1146799630022429248_profile';
  const PIN_BOARD = '1146799561305219041';
  const posts = (await listar()).filter((p) => p.status === 'scheduled');
  const porDia = {};
  for (const p of posts) (porDia[fechaDe(p.scheduleDate)] = porDia[fechaDe(p.scheduleDate)] || []).push(p);
  const dias = Object.keys(porDia).sort();
  for (const d of dias) porDia[d].sort((a, b) => String(a.scheduleDate).localeCompare(String(b.scheduleDate)));

  // Sobrantes de los días con más de 7: se van al final del calendario.
  const sobrantes = [];
  for (const d of dias) while (porDia[d].length > POR_DIA) sobrantes.push(porDia[d].pop());
  let dia = new Date(`${dias[dias.length - 1]}T12:00:00Z`);
  const nuevos = {};
  for (const p of sobrantes) {
    let fecha = dia.toISOString().slice(0, 10);
    if ((porDia[fecha] || []).length >= POR_DIA) {
      dia = new Date(dia.getTime() + 86400000);
      fecha = dia.toISOString().slice(0, 10);
      porDia[fecha] = [];
    }
    porDia[fecha].push(p);
    nuevos[p._id] = fecha;
  }

  const cambios = [];
  for (const [fecha, lista] of Object.entries(porDia).sort()) {
    const dow = new Date(`${fecha}T12:00:00Z`).getUTCDay();
    const extra = dow === 0 || dow === 6 ? 30 : 0;
    lista.sort((a, b) => String(a.scheduleDate).localeCompare(String(b.scheduleDate)));
    const objetivo = lista.find((p) => urlOf(p)) || lista[0];
    lista.forEach((p, idx) => {
      const cuentas = (p.accountIds || []).filter((a) => a !== GMB);
      const debeGmb = p._id === objetivo._id;
      const deseadas = debeGmb ? [...cuentas, GMB] : cuentas;
      const sinPin = !deseadas.includes(PIN_OATH);
      if (sinPin) deseadas.push(PIN_OATH);
      const at = nuevos[p._id] ? horaAst(nuevos[p._id], HORAS[idx] || '20:00', extra) : p.scheduleDate;
      const url = urlOf(p);
      const cuerpo = {
        accountIds: deseadas,
        summary: p.summary,
        media: p.media,
        status: 'scheduled',
        scheduleDate: at,
        type: 'post',
        followUpComment: p.followUpComment,
        userId: p.userId || p.createdBy,
        createdBy: p.createdBy || p.userId,
        pinterestPostDetails: {
          boardIds: { [PIN_OATH]: PIN_BOARD },
          title: String(String(p.summary || '').split('\n')[0]).slice(0, 97),
          link: p.pinterestPostDetails?.link || url,
        },
      };
      if (debeGmb) cuerpo.gmbPostDetails = { gmbEventType: 'STANDARD', actionType: 'BOOK', url };
      const igual = at === p.scheduleDate && deseadas.length === (p.accountIds || []).length && p.pinterestPostDetails?.boardIds?.[PIN_OATH] === PIN_BOARD && Boolean(p.gmbPostDetails?.url) === debeGmb;
      if (!igual) cambios.push({ id: p._id, cuerpo, etiqueta: `${fecha}${sinPin ? ' +pin' : ''}${nuevos[p._id] ? ' movido' : ''}` });
    });
  }
  console.log(`a corregir: ${cambios.length} de ${posts.length} | sobrantes reubicados: ${sobrantes.length}`);
  let ok = 0;
  const fails = [];
  for (const c of cambios) {
    try {
      await put(c.id, c.cuerpo);
      ok++;
      if (ok % 50 === 0) console.log(`  ${ok}/${cambios.length}`);
    } catch (e) {
      fails.push(`${c.etiqueta} ${c.id}: ${e.message}`);
      console.log(`FALLO ${c.id}: ${e.message}`);
    }
    await sleep(400);
  }
  console.log(`\nnormalizados: ${ok} | fallos: ${fails.length}`);
  fails.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

// Corrige solo los días que quedaron con 0 o con más de 1 post de Google:
// lista la agenda real, elige el post con URL más temprano del día y ajusta.
if (process.argv.includes('--fix-gmb')) {
  const posts = (await listar()).filter((p) => p.status === 'scheduled');
  const porDia = {};
  for (const p of posts) (porDia[fechaDe(p.scheduleDate)] = porDia[fechaDe(p.scheduleDate)] || []).push(p);
  let ok = 0;
  const fails = [];
  for (const [d, lista] of Object.entries(porDia).sort()) {
    lista.sort((a, b) => String(a.scheduleDate).localeCompare(String(b.scheduleDate)));
    const con = lista.filter((p) => (p.accountIds || []).includes(GMB));
    if (con.length === 1) continue;
    const objetivo = (con.length ? con : lista).find((p) => urlOf(p)) || lista[0];
    for (const p of lista) {
      const debe = p._id === objetivo._id;
      const tiene = (p.accountIds || []).includes(GMB);
      if (debe === tiene) continue;
      const cuerpo = {
        accountIds: debe ? [...(p.accountIds || []).filter((a) => a !== GMB), GMB] : (p.accountIds || []).filter((a) => a !== GMB),
        summary: p.summary,
        media: p.media,
        status: 'scheduled',
        scheduleDate: p.scheduleDate,
        type: 'post',
        followUpComment: p.followUpComment,
        userId: p.userId || p.createdBy,
        createdBy: p.createdBy || p.userId,
        pinterestPostDetails: p.pinterestPostDetails,
      };
      if (debe) cuerpo.gmbPostDetails = { gmbEventType: 'STANDARD', actionType: 'BOOK', url: urlOf(p) };
      try {
        await put(p._id, cuerpo);
        ok++;
        console.log(`ok ${d} ${debe ? '+google' : '-google'} ${p._id}`);
      } catch (e) {
        fails.push(`${d} ${p._id}: ${e.message}`);
        console.log(`FALLO ${p._id}: ${e.message}`);
      }
      await sleep(260);
    }
  }
  console.log(`\najustes de Google: ${ok} | fallos: ${fails.length}`);
  fails.slice(0, 10).forEach((f) => console.log('  !', f));
  process.exit(fails.length ? 1 : 0);
}

console.log('modo desconocido: usa --plan, --apply o --verify');
process.exit(1);
