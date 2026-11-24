// Auditoría de indexabilidad del host de comunidades contra producción.
// Uso: node scripts/audita-indexacion.mjs [--limite N]
// Cada una de las 1.112 landings de comunidades.ilatekpr.com debe:
//   200 · indexable · sin {{ sin sustituir · canonical = su copia en <municipio>.ilatekpr.com
// (se acepta también el canonical propio mientras la migración no esté publicada),
// y ningún canonical puede apuntar fuera de las 1.112 parejas previstas.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SUB = 'https://comunidades.ilatekpr.com';
const limiteArg = process.argv.indexOf('--limite');
const LIMITE = limiteArg > 0 ? Number(process.argv[limiteArg + 1]) : 0;

/* ---------- las 1.112 parejas, tomadas del árbol del repo ---------- */
const pares = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') {
      const t = path.relative(path.join(ROOT, 'Comunidades/landings'), p).replace(/\\/g, '/').split('/');
      if (t.length === 4) {
        pares.push({
          propia: `${SUB}/${t[0]}/${t[1]}/${t[2]}`,
          pueblo: `https://${t[0]}.ilatekpr.com/${t[1]}/${t[2]}`
        });
      }
    }
  }
})(path.join(ROOT, 'Comunidades/landings'));
pares.sort((a, b) => a.propia.localeCompare(b.propia, 'es'));

const permitidos = new Set();
for (const p of pares) {
  permitidos.add(p.propia);
  permitidos.add(p.pueblo);
}
const objetivo = LIMITE ? pares.slice(0, LIMITE) : pares;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
async function trae(url, intentos = 2) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 25000);
      const r = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 Ilatek-Audit/1.0' } });
      clearTimeout(t);
      const txt = await r.text();
      return { status: r.status, txt, url: r.url };
    } catch (e) {
      if (i === intentos) return { status: 0, txt: '', error: String(e.message || e) };
      await dormir(400 * i);
    }
  }
}
async function enParalelo(items, limite, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limite, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k], k);
      }
    })
  );
  return out;
}

console.log(`Auditando ${objetivo.length} URLs de comunidades y su canonical al pueblo…`);
const t0 = Date.now();
const res = await enParalelo(objetivo, 10, async (par) => {
  const r = await trae(par.propia);
  const canon = (r.txt.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1] || null;
  const robots = (r.txt.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) || [])[1] || null;
  const llaves = (r.txt.match(/\{\{/g) || []).length;
  const noindex = !!robots && /noindex/i.test(robots);
  const destino = canon === par.pueblo ? 'pueblo' : canon === par.propia ? 'propia (migración pendiente)' : 'ajeno';
  return {
    url: par.propia,
    esperado: par.pueblo,
    status: r.status,
    bytes: r.txt.length,
    canonical: canon,
    destino,
    problema:
      r.status !== 200
        ? 'http ' + r.status
        : noindex
          ? 'noindex'
          : canon !== par.pueblo && canon !== par.propia
            ? 'canonical≠pueblo'
            : llaves
              ? 'plantilla sin sustituir'
              : ''
  };
});

const malas = res.filter((r) => r.problema);
const canonAjenos = [...new Set(res.map((r) => r.canonical).filter((c) => c && !permitidos.has(c)))];
const vacias = res.filter((r) => r.status === 200 && r.bytes < 20000);
const migradas = res.filter((r) => r.destino === 'pueblo').length;
const pendientes = res.filter((r) => r.destino === 'propia (migración pendiente)').length;

/* ---------- el sitemap vivo del host de comunidades (si aún existe) ---------- */
const vivo = await trae(SUB + '/sitemap.xml');
const locsVivo = vivo.status === 200 ? [...vivo.txt.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()) : [];
const planas = locsVivo.filter((u) => new URL(u).pathname.split('/').filter(Boolean).length < 3);
const muestraPlan = planas.slice(0, 30);
const canonesPlan = await enParalelo(muestraPlan, 8, async (u) => {
  const r = await trae(u);
  return { url: u, status: r.status, canonical: (r.txt.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1] || null };
});
const planFuera = canonesPlan.filter((c) => c.canonical && !permitidos.has(c.canonical));

const resumen = {
  landingsEnRepo: pares.length,
  auditadas: objetivo.length,
  ok: res.length - malas.length,
  problemas: malas.length,
  detalleProblemas: malas.slice(0, 15).map((m) => `${m.problema} · ${m.url}`),
  canonicalAlPueblo: migradas,
  canonicalPropioMigracionPendiente: pendientes,
  canonicosFueraDelConjunto: canonAjenos.slice(0, 15),
  paginasSospechosamenteVacias: vacias.length,
  sitemapVivoDeComunidades: { status: vivo.status, locs: locsVivo.length, planas: planas.length },
  planasDentroDelConjunto: `${muestraPlan.length - planFuera.length}/${muestraPlan.length}`,
  planasFuera: planFuera.slice(0, 8),
  segundos: Math.round((Date.now() - t0) / 1000)
};
console.log(JSON.stringify(resumen, null, 1));
process.exit(resumen.problemas || canonAjenos.length || planFuera.length ? 1 : 0);
