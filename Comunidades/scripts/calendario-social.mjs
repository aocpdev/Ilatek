// Ilatek · Calendario social de comunidades, con candado de landing.
//
// Ningún post queda programado antes de que su landing esté publicada en el
// ledger y respondiendo 200. El calendario sigue siendo una propuesta: cada
// entrada lleva programar:false y publicar:false hasta la aprobación del dueño.
//
// Uso:
//   node scripts/calendario-social.mjs --audit   # valida el calendario actual
//   node scripts/calendario-social.mjs --plan     # propone los posts que faltan
//   node scripts/calendario-social.mjs --fix      # mueve entradas que violan el candado
//
// --audit sale con código 1 si hay alguna violación (sirve de gate en la cola).
import fs from 'node:fs';
import path from 'node:path';
import { verificarLanding, ajustarSlot, MARGEN_MIN } from '../../tools/landing-gate.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CAL = path.join(ROOT, 'data/ghl/social-posts-calendar.json');
const IDX = path.join(ROOT, 'data/ghl/index.json');
const PLAN = path.join(ROOT, '..', '.tmp-calendario-social-plan.json');

// Cadencia del calendario: 6 posts/día, lunes a sábado, AST (UTC-4, sin DST).
const HORAS = [9, 11, 13, 15, 17, 19];
const AST = 4;

const cal = JSON.parse(fs.readFileSync(CAL, 'utf8'));
const idx = JSON.parse(fs.readFileSync(IDX, 'utf8'));
const funnels = new Map(idx.funnels.map((f) => [`${f.municipalitySlug}/${f.slug}`, f]));

const mode = process.argv.slice(2).find((a) => a.startsWith('--')) || '--audit';

// ---- franjas --------------------------------------------------------------
function franjasDesde(desdeIso, n, ocupados = new Set()) {
  const out = [];
  const desde = Date.parse(desdeIso);
  const d0 = new Date(desde - AST * 3600000);
  let dia = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), d0.getUTCDate());
  for (let d = 0; d < 900 && out.length < n; d++, dia += 86400000) {
    if (new Date(dia).getUTCDay() === 0) continue; // domingo no se publica
    for (const h of HORAS) {
      const at = new Date(dia + (h + AST) * 3600000).toISOString();
      if (Date.parse(at) < desde || ocupados.has(at)) continue;
      out.push(at);
      if (out.length >= n) break;
    }
  }
  return out;
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

// ---- auditoría ------------------------------------------------------------
async function auditar() {
  const posts = Object.values(cal.posts);
  const res = [];
  await pool(posts, 8, async (p) => res.push({ p, g: await verificarLanding(p.url) }));
  const viol = [];
  for (const { p, g } of res) {
    if (!p.scheduledAt) {
      viol.push({ p, g, motivo: 'sin fecha programada' });
      continue;
    }
    if (!g.ok) {
      viol.push({ p, g, motivo: g.motivo });
      continue;
    }
    const minimo = ajustarSlot(p.scheduledAt, g.publicadoEn);
    if (Date.parse(p.scheduledAt) < Date.parse(minimo)) {
      viol.push({ p, g, motivo: `programado ${p.scheduledAt} antes del mínimo ${minimo}` });
    }
  }
  return { total: posts.length, viol };
}

if (mode === '--audit' || mode === '--fix') {
  const { total, viol } = await auditar();
  console.log(`revisados: ${total} | violaciones: ${viol.length}`);
  viol.slice(0, 10).forEach((v) => console.log('  !', v.p.key, '·', v.motivo));
  if (mode === '--audit') process.exit(viol.length ? 1 : 0);

  if (!viol.length) {
    console.log('nada que corregir');
    process.exit(0);
  }
  // Se reubican solo las entradas cuya landing ya está viva: las que aún no se
  // publican quedan bloqueadas y sin fecha utilizable (nunca se programan).
  const ocupados = new Set(Object.values(cal.posts).map((p) => p.scheduledAt).filter(Boolean));
  for (const v of viol) ocupados.delete(v.p.scheduledAt);
  let movidos = 0;
  let bloqueados = 0;
  for (const v of viol) {
    const p = v.p;
    if (!v.g.ok || !v.g.publicadoEn) {
      p.programar = false;
      p.publicar = false;
      p.bloqueado = v.motivo;
      bloqueados++;
      continue;
    }
    const [at] = franjasDesde(ajustarSlot(p.scheduledAt, v.g.publicadoEn), 1, ocupados);
    if (!at) continue;
    p.scheduledAt = at;
    p.bloqueado = null;
    p.programar = false;
    p.publicar = false;
    ocupados.add(at);
    movidos++;
  }
  cal.generado = new Date().toISOString();
  cal.politica = `Ningún post se programa ni se publica sin aprobación explícita y sin su landing publicado (margen ${MARGEN_MIN} min).`;
  fs.writeFileSync(CAL, JSON.stringify(cal, null, 2));
  console.log(`reubicados: ${movidos} | bloqueados por landing pendiente: ${bloqueados}`);
  process.exit(0);
}

// ---- plan: posts que faltan para las comunidades ya publicadas -------------
if (mode === '--plan') {
  const existentes = new Set(Object.values(cal.posts).map((p) => p.key));
  const ocupados = new Set(Object.values(cal.posts).map((p) => p.scheduledAt).filter(Boolean));
  const KIND = {
    techos: 'sellado-de-techo',
    limpieza: 'limpieza',
  };
  const publicadas = idx.funnels.filter((f) => f.status === 'publicado');
  const nuevos = [];
  for (const f of publicadas) {
    for (const [kind, last] of Object.entries(KIND)) {
      const key = `${f.municipalitySlug}/${f.slug}/${kind}`;
      if (existentes.has(key)) continue;
      nuevos.push({
        key,
        community: f.community,
        municipality: f.municipalitySlug,
        municipalityName: f.municipality,
        slug: f.slug,
        kind,
        url: `https://comunidades.ilatekpr.com/${f.funnelPath}/${last}`,
        publicadoEn: f.publishedAt,
      });
    }
  }
  // Se ordenan por antigüedad del landing: primero lo que lleva más tiempo en vivo.
  nuevos.sort((a, b) => String(a.publicadoEn).localeCompare(String(b.publicadoEn)));
  let cursor = new Date().toISOString();
  for (const n of nuevos) {
    const desde = ajustarSlot(cursor, n.publicadoEn);
    const [at] = franjasDesde(desde, 1, ocupados);
    if (!at) break;
    n.scheduledAt = at;
    n.revision = 'pendiente';
    n.programar = false;
    n.publicar = false;
    ocupados.add(at);
    cursor = at;
  }
  const faltan = nuevos.filter((n) => !n.scheduledAt);
  const fechas = nuevos.map((n) => n.scheduledAt).filter(Boolean).sort();
  fs.writeFileSync(PLAN, JSON.stringify({ generado: new Date().toISOString(), zona: cal.zona, posts: nuevos }, null, 2));
  console.log(`comunidades publicadas: ${publicadas.length} | posts ya en calendario: ${existentes.size}`);
  console.log(`propuestos: ${nuevos.length} | sin franja: ${faltan.length}`);
  console.log(`ventana: ${fechas[0]} → ${fechas[fechas.length - 1]}`);
  console.log('plan:', PLAN);
  console.log('no se creó nada en GHL: todas las entradas quedan programar:false / publicar:false');
  process.exit(0);
}

console.log('modo no reconocido: usa --audit, --plan o --fix');
process.exit(2);
