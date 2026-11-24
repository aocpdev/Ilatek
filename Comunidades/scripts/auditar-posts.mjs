// Ilatek · Auditoría de los posts sociales de comunidades.
//
// Revisa cada post contra la API (el contenido REAL que hay en GHL, no el del
// ledger) y contra los enlaces e imágenes que publica. No modifica nada.
//
// Uso:
//   node scripts/auditar-posts.mjs                 # contenido y estado
//   node scripts/auditar-posts.mjs --http          # además comprueba URL e imagen
//   node scripts/auditar-posts.mjs --only carolina/isla-verde
//   node scripts/auditar-posts.mjs --severity error   # no lista los avisos
//
// Códigos de salida, igual que auditar-publicadas.py:
//   0 todo en verde · 1 hay hallazgos · 2 el filtro no seleccionó ningún post
//
// Regla dura: un post solo puede estar en `draft` (sin fecha) o en `scheduled`
// con su fecha. Cualquier otro estado —publicado, borrador con fecha, programado
// sin fecha— es un error.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API = 'https://services.leadconnectorhq.com';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '..', '.mcp.json'), 'utf8')).mcpServers.ghl.env;
const PIT = cfg.ZJ_GHL_PIT;
const LOC = cfg.ZJ_GHL_LOCATION;

const LEDGER = path.join(ROOT, 'data/ghl/social-posts.json');
const REPORT = path.join(ROOT, 'data/ghl/social-posts-audit.json');
const MD = path.join(ROOT, 'data/ghl/social-posts-audit.md');
const HOST = 'comunidades.ilatekpr.com';
const MAX_REDES = 2100; // tope propio del proyecto para el texto del post
const MIN_TEXTO = 120;

const SEGMENTO = { techos: 'sellado-de-techo', limpieza: 'limpieza' };

const args = process.argv.slice(2);
const conHttp = args.includes('--http');
const onlyArg = args.indexOf('--only');
const only = onlyArg > -1 ? args[onlyArg + 1] : null;
const sevArg = args.indexOf('--severity');
const severidadMinima = sevArg > -1 ? args[sevArg + 1] : 'warn';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// La API limita lecturas en paralelo (429): se reintenta con espera creciente.
async function getPost(id, tries = 6) {
  for (let n = 0; n < tries; n++) {
    const res = await fetch(`${API}/social-media-posting/${LOC}/posts/${id}`, {
      headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28' },
    });
    if (res.status !== 429) {
      const json = await res.json().catch(() => ({}));
      return { status: res.status, ok: res.ok, p: json.post || json.results?.post || json };
    }
    await sleep(1500 * (n + 1));
  }
  return { status: 429, ok: false, p: {} };
}

async function estadoHttp(url) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IlatekAudit/1.0)' } });
    return res.status;
  } catch (e) {
    return `red:${String(e.message).slice(0, 40)}`;
  }
}

const MOJIBAKE = /[ÃÂ]|â€|�/;
const PLACEHOLDER = /\$\{|\bundefined\b|\bNaN\b|\[object Object\]/;

function auditar(key, entrada, p, http) {
  const [municipio, slug, kind] = key.split('/');
  const hallazgos = [];
  const mal = (regla, detalle) => hallazgos.push({ severidad: 'error', regla, detalle });
  const aviso = (regla, detalle) => hallazgos.push({ severidad: 'warn', regla, detalle });

  const summary = String(p.summary || '');
  const comentario = String(p.followUpComment || '');
  const media = (p.media || [])[0]?.url || '';
  const urlEsperada = `https://${HOST}/${municipio}/${slug}/${SEGMENTO[kind]}`;

  // --- estado: borrador sin fecha o programado con fecha ---
  const fecha = p.scheduledAt || p.scheduleDate || '';
  if (!['draft', 'scheduled'].includes(p.status)) mal('estado', `status "${p.status}" (draft o scheduled)`);
  if (p.status === 'scheduled' && !fecha) mal('programado', 'scheduled sin fecha');
  if (p.status === 'draft' && fecha) mal('programado', `borrador con fecha: ${fecha}`);
  const cuentas = (p.accountIds || []).length;
  if (cuentas !== 2 && cuentas !== 3) mal('cuentas', `${cuentas} cuentas (2 sin Google, 3 con Google)`);
  if (!media) mal('imagen', 'sin media');
  else if (media !== entrada.image) mal('imagen', 'la imagen del post no es la del ledger');

  // --- enlaces ---
  if (!summary.includes(entrada.url)) mal('enlace_texto', 'la URL no está en el texto del post');
  if (!comentario.includes(entrada.url)) mal('enlace_comentario', 'la URL no está en el comentario');
  if (!entrada.url.endsWith(`/${municipio}/${slug}/${SEGMENTO[kind]}`)) {
    mal('enlace_servicio', `la URL no corresponde a ${SEGMENTO[kind]}: ${entrada.url}`);
  }
  if (!entrada.url.startsWith(`https://${HOST}/`)) aviso('enlace_host', `dominio distinto de ${HOST}: ${entrada.url}`);

  // --- texto ---
  if (!summary) mal('texto', 'sin texto');
  else {
    if (summary.length > MAX_REDES) mal('texto_largo', `${summary.length} chars (> ${MAX_REDES})`);
    if (summary.length < MIN_TEXTO) aviso('texto_corto', `${summary.length} chars (< ${MIN_TEXTO})`);
    if (PLACEHOLDER.test(summary)) mal('placeholder', 'quedó un ${…}/undefined/NaN en el texto');
    if (MOJIBAKE.test(summary)) mal('encoding', 'mojibake en el texto (Ã/Â/â€/�)');
    if (!/\n\n/.test(summary)) aviso('formato', 'sin párrafos separados por línea en blanco');
    if (!entrada.url.includes(HOST)) mal('enlace_invalido', `URL mal formada: ${entrada.url}`);
    if (!summary.toLowerCase().includes(slug.replace(/-/g, ' ').split(' ')[0])) {
      // el nombre puede estar escrito con otra forma; solo se avisa
      aviso('comunidad_en_texto', 'el slug de la comunidad no aparece literal en el texto');
    }
  }

  // --- hashtags ---
  const tags = summary.match(/#[^\s#]+/g) || [];
  if (tags.length < 4) mal('hashtags', `solo ${tags.length} hashtags (mínimo 4)`);
  if (/(^|\s)#(\s|$)/.test(summary)) mal('hashtags', 'hay un # suelto');
  if (new Set(tags.map((t) => t.toLowerCase())).size !== tags.length) aviso('hashtags', 'hashtag repetido');

  // --- comentario ---
  if (!comentario) mal('comentario', 'sin comentario de seguimiento');

  // --- HTTP ---
  if (http) {
    if (http.pagina !== 200) mal('url_http', `${entrada.url} devuelve ${http.pagina}`);
    if (http.imagen !== 200) mal('imagen_http', `la imagen devuelve ${http.imagen}`);
  }

  return hallazgos;
}

const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8')).posts || {};
let claves = Object.keys(ledger).sort();
if (only) claves = claves.filter((k) => k === only || k.startsWith(`${only}/`));
if (!claves.length) {
  console.log(`No hay posts que auditar con --only "${only}". Revisa el filtro o el ledger ${path.relative(ROOT, LEDGER)}.`);
  process.exit(2);
}

const resultados = [];
const CONC = 3;
for (let i = 0; i < claves.length; i += CONC) {
  await Promise.all(
    claves.slice(i, i + CONC).map(async (key) => {
      const entrada = ledger[key];
      const { status, p } = await getPost(entrada.id);
      let http = null;
      if (conHttp) {
        const pagina = await estadoHttp(entrada.url);
        const imagen = await estadoHttp(entrada.image);
        http = { pagina, imagen };
      }
      const hallazgos = status === 200
        ? auditar(key, entrada, p, http)
        : [{ severidad: 'error', regla: 'api', detalle: `GET del post devolvió ${status}` }];
      resultados.push({
        key,
        id: entrada.id,
        status: p.status || '',
        chars: String(p.summary || '').length,
        hallazgos,
        http,
      });
    }),
  );
}

const errores = resultados.filter((r) => r.hallazgos.some((h) => h.severidad === 'error'));
const avisos = resultados.filter((r) => r.hallazgos.some((h) => h.severidad === 'warn'));
const porRegla = {};
for (const r of resultados) for (const h of r.hallazgos) porRegla[h.regla] = (porRegla[h.regla] || 0) + 1;
const imgs = new Set(resultados.map((r) => ledger[r.key].image));

fs.writeFileSync(
  REPORT,
  JSON.stringify(
    {
      generado: new Date().toISOString(),
      location: LOC,
      comprobado_http: conHttp,
      totales: { posts: resultados.length, errores: errores.length, avisos: avisos.length },
      por_regla: porRegla,
      imagenes_distintas: `${imgs.size}/${resultados.length}`,
      posts: resultados,
    },
    null,
    2,
  ),
);

const porMunicipio = {};
for (const r of errores) {
  const m = r.key.split('/')[0];
  porMunicipio[m] = porMunicipio[m] || [];
  porMunicipio[m].push(r);
}
const md = [
  '# Auditoría de posts sociales · comunidades',
  '',
  `Generada: ${new Date().toISOString()} · comprobación HTTP: ${conHttp ? 'sí' : 'no'}`,
  '',
  `- Posts auditados: **${resultados.length}**`,
  `- Con errores: **${errores.length}**`,
  `- Con avisos: **${avisos.length}**`,
  `- Imágenes distintas: **${imgs.size}/${resultados.length}**`,
  '',
  '## Errores por regla',
  '',
  ...(Object.keys(porRegla).length ? Object.entries(porRegla).map(([k, v]) => `- \`${k}\`: ${v}`) : ['- ninguno']),
  '',
  '## Detalle por municipio',
  '',
  ...Object.keys(porMunicipio).sort().flatMap((m) => [
    `### ${m}`,
    '',
    ...porMunicipio[m].flatMap((r) => [
      `- \`${r.key}\` (${r.chars} chars)`,
      ...r.hallazgos.map((h) => `  - ${h.severidad === 'error' ? '❌' : '⚠️'} ${h.regla}: ${h.detalle}`),
    ]),
    '',
  ]),
];
fs.writeFileSync(MD, md.join('\n'), 'utf8');

console.log(`posts: ${resultados.length} | errores: ${errores.length} | avisos: ${avisos.length} | imágenes distintas: ${imgs.size}/${resultados.length}`);
if (Object.keys(porRegla).length) console.log('por regla: ' + JSON.stringify(porRegla));
const mostrar = severidadMinima === 'error' ? errores : [...errores, ...avisos];
mostrar.slice(0, 12).forEach((r) => {
  console.log(`  ${r.key}`);
  r.hallazgos
    .filter((h) => severidadMinima !== 'error' || h.severidad === 'error')
    .forEach((h) => console.log(`    ${h.severidad === 'error' ? '!' : '~'} ${h.regla}: ${h.detalle}`));
});
console.log(`reporte: ${path.relative(ROOT, REPORT)} · resumen: ${path.relative(ROOT, MD)}`);
process.exit(errores.length ? 1 : 0);
