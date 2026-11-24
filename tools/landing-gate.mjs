// Ilatek · Candado de landing para todo post social.
//
// Regla: un post no se programa (ni se publica) si la página que enlaza no está
// lanzada. Para las landings de comunidad, además, el ledger tiene que decir
// "publicado" y la URL tiene que responder 200. Para cualquier otra landing
// (ilatekpr.com, subdominios de municipio) basta con que responda 200.
//
// El horario tampoco puede quedar antes del lanzamiento: ajustarSlot() empuja
// cualquier franja anterior a publicadoEn + MARGEN_MIN.
//
// Uso desde un planificador:
//   import { verificarLanding, ajustarSlot } from './landing-gate.mjs';
//   const gate = await verificarLanding(url);
//   if (!gate.ok) { console.log(`SALTADO: ${gate.motivo}`); continue; }
//   slot.at = ajustarSlot(slot.at, gate.publicadoEn);
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const LEDGER = path.join(ROOT, 'Comunidades/data/ghl/index.json');

// Colchón entre el lanzamiento del landing y el primer post que lo promociona.
export const MARGEN_MIN = 120;

let _idx = null;
function indice() {
  if (!_idx) {
    const doc = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
    _idx = new Map(doc.funnels.map((f) => [`${f.municipalitySlug}/${f.slug}`, f]));
  }
  return _idx;
}

const _http = new Map();

export async function landingEnVivo(url) {
  if (_http.has(url)) return _http.get(url);
  let out;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    out = { ok: res.ok, status: res.status };
  } catch (e) {
    out = { ok: false, status: 0, error: e.message };
  }
  _http.set(url, out);
  return out;
}

export function comunidadDeUrl(url) {
  const m = /^https?:\/\/comunidades\.ilatekpr\.com\/([^/?#]+)\/([^/?#]+)(?:\/([^/?#]+))?/.exec(url || '');
  if (!m) return null;
  return { municipalitySlug: m[1], slug: m[2], kind: m[3] || null, key: `${m[1]}/${m[2]}` };
}

// Devuelve { ok, motivo, comunidad, publicadoEn }.
export async function verificarLanding(url) {
  const c = comunidadDeUrl(url);
  if (c) {
    const f = indice().get(c.key);
    if (!f) return { ok: false, motivo: `comunidad fuera del ledger (${c.key})`, comunidad: c, publicadoEn: null };
    if (f.status !== 'publicado') {
      return { ok: false, motivo: `landing ${f.status} (${c.key})`, comunidad: c, publicadoEn: null };
    }
    const vivo = await landingEnVivo(url);
    if (!vivo.ok) {
      return { ok: false, motivo: `landing responde ${vivo.status} (${c.key})`, comunidad: c, publicadoEn: f.publishedAt || null };
    }
    return { ok: true, motivo: 'landing en vivo', comunidad: c, publicadoEn: f.publishedAt || null };
  }
  const vivo = await landingEnVivo(url);
  return {
    ok: vivo.ok,
    motivo: vivo.ok ? 'landing en vivo' : `landing responde ${vivo.status}`,
    comunidad: null,
    publicadoEn: null,
  };
}

// Nunca antes de publicadoEn + margen.
export function ajustarSlot(slotAt, publicadoEn, margenMin = MARGEN_MIN) {
  if (!publicadoEn) return slotAt;
  const minimo = new Date(Date.parse(publicadoEn) + margenMin * 60000).toISOString();
  return Date.parse(slotAt) < Date.parse(minimo) ? minimo : slotAt;
}
