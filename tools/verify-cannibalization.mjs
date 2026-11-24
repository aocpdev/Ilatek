// Ilatek · verificador de canibalización contra Search Console.
//
// Compara las 200 preguntas long tail del blog con los datos de Search Console
// exportados a CSV. No usa credenciales ni llama a la API: lee exportes que el
// propietario deja en documentacion/seo/search-console/.
//
// Exportar en Search Console → Rendimiento → Exportar → CSV (pestaña Consultas
// y, si se puede, la vista filtrada por página). El archivo ideal trae dos
// columnas: consulta y página.
//
// Uso:
//   node tools/verify-cannibalization.mjs
//   node tools/verify-cannibalization.mjs --dir ruta/a/exportes --strict
//   node tools/verify-cannibalization.mjs --min-impressions 10
//
// Sin exportes: avisa y valida solo la duplicación interna entre preguntas
// (siempre ejecutable en CI). Con exportes: detecta consultas servidas por más
// de una URL y preguntas que compiten con una página que no es la suya.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_DIR = path.join(ROOT, 'documentacion/seo/search-console');
const REPORT = path.join(ROOT, 'documentacion/seo/canibalizacion-report.md');

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const has = (name) => args.includes('--' + name);
const MIN_IMP = Number(flag('min-impressions', '1'));
const STRICT = has('strict');
const DIR = path.resolve(ROOT, flag('dir', DEFAULT_DIR));

const LIMITE_SIMILITUD = 0.62;  // pregunta ↔ consulta de GSC
const LIMITE_INTERNAS = 0.9;    // pregunta ↔ pregunta

const STOP = new Set(('de la el los las un una unos unas y o en para por con sin que se su sus al del lo como mas más es son ' +
  'a mi tu te le les nos me si no ya muy esta este esto estas estos cuando donde cual cuales cuanto cuanta cuantos cuantas ' +
  'hay ser esta está estan están hacer hace hasta desde entre sobre tras cada todo toda todos todas otro otra').split(/\s+/));

const norm = (s) => String(s || '')
  .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/https?:\/\/[^/]+/g, ' ')
  .replace(/[^a-z0-9ñ\s/-]/g, ' ')
  .replace(/\s+/g, ' ').trim();

const tokens = (s) => norm(s).split(/[\s/-]+/).filter((t) => t.length > 2 && !STOP.has(t));
const jaccard = (a, b) => {
  const A = new Set(tokens(a)), B = new Set(tokens(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
};
const cobertura = (q, consulta) => {
  const A = tokens(q), B = new Set(tokens(consulta));
  if (!A.length) return 0;
  return A.filter((t) => B.has(t)).length / A.length;
};

// ——— lectura de CSV (coma o punto y coma, con o sin comillas) ———
function splitCsv(line, delim) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === delim && !quoted) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

const COL = {
  query: [/^consultas?/i, /^top quer/i, /^query/i, /^b[uú]squeda/i],
  page: [/^p[aá]ginas?/i, /^top pages?/i, /^page/i, /^url/i],
  clicks: [/^clics?/i, /^clicks?/i],
  impressions: [/^impresiones/i, /^impressions?/i],
  position: [/^posici[oó]n/i, /^position/i],
};
const pick = (headers, patterns) => headers.findIndex((h) => patterns.some((p) => p.test(h)));

function parseFile(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const delim = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const headers = splitCsv(lines[0], delim);
  const iq = pick(headers, COL.query);
  const ip = pick(headers, COL.page);
  if (iq < 0) return [];
  const ic = pick(headers, COL.clicks);
  const ii = pick(headers, COL.impressions);
  const ipos = pick(headers, COL.position);
  const rows = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsv(line, delim);
    const query = cols[iq];
    if (!query) continue;
    rows.push({
      query,
      page: ip >= 0 ? (cols[ip] || '') : '',
      clicks: ic >= 0 ? Number(String(cols[ic]).replace(/[^\d.]/g, '')) || 0 : 0,
      impressions: ii >= 0 ? Number(String(cols[ii]).replace(/[^\d.]/g, '')) || 0 : 0,
      position: ipos >= 0 ? Number(String(cols[ipos]).replace(/[^\d.]/g, '')) || 0 : 0,
      file: path.basename(file),
    });
  }
  return rows;
}

function gscRows(dir) {
  if (!fs.existsSync(dir)) return { rows: [], files: [] };
  const files = fs.readdirSync(dir, { recursive: true })
    .map((f) => path.join(dir, String(f)))
    .filter((f) => fs.statSync(f).isFile() && /\.csv$/i.test(f) && !/[\\/]fixtures[\\/]/i.test(f));
  const rows = [];
  for (const f of files) rows.push(...parseFile(f));
  return { rows, files };
}

const longtail = JSON.parse(fs.readFileSync(path.join(ROOT, 'blog/data/longtail.json'), 'utf8'));
const preguntas = Object.entries(longtail.posts).flatMap(([slug, b]) =>
  b.preguntas.map((q) => ({ slug, path: '/blog/' + slug, ...q })));

const problemas = [];
const avisos = [];

// ——— 1. duplicación interna entre las 200 preguntas ———
for (let i = 0; i < preguntas.length; i++) {
  for (let j = i + 1; j < preguntas.length; j++) {
    const s = jaccard(preguntas[i].pregunta, preguntas[j].pregunta);
    if (s >= LIMITE_INTERNAS) {
      problemas.push(`preguntas casi iguales (${(s * 100).toFixed(0)}%): «${preguntas[i].pregunta}» (${preguntas[i].slug}) vs «${preguntas[j].pregunta}» (${preguntas[j].slug})`);
    }
  }
}

const { rows, files } = gscRows(DIR);
let conPagina = 0;

if (!rows.length) {
  avisos.push(`sin exportes de Search Console en ${path.relative(ROOT, DIR)}`);
} else {
  // ——— 2. una consulta servida por varias URLs ———
  const porConsulta = new Map();
  for (const r of rows) {
    if (!r.page || r.impressions < MIN_IMP) continue;
    const k = norm(r.query);
    if (!porConsulta.has(k)) porConsulta.set(k, []);
    porConsulta.get(k).push(r);
  }
  for (const [q, lista] of porConsulta) {
    const paginas = [...new Set(lista.map((r) => r.page.replace(/\/$/, '')))];
    if (paginas.length > 1) {
      const detalle = paginas.map((p) => {
        const rs = lista.filter((r) => r.page.replace(/\/$/, '') === p);
        const imp = rs.reduce((s, r) => s + r.impressions, 0);
        const pos = Math.min(...rs.map((r) => r.position || 999));
        return `${p} (${imp} imp., pos. ${pos})`;
      }).join(' · ');
      problemas.push(`consulta «${q}» con ${paginas.length} URLs: ${detalle}`);
    }
  }

  // ——— 3. preguntas long tail que compiten con otra URL ———
  conPagina = rows.filter((r) => r.page).length;
  for (const q of preguntas) {
    let mejor = null;
    for (const r of rows) {
      const c = cobertura(q.pregunta, r.query);
      if (c < 0.8) continue;
      const j = jaccard(q.pregunta, r.query);
      if (j < LIMITE_SIMILITUD && c < 0.95) continue;
      if (!mejor || r.impressions > mejor.impressions) mejor = { ...r, score: Math.max(j, c) };
    }
    if (!mejor) continue;
    if (mejor.page && normalizarRuta(mejor.page) !== q.path) {
      problemas.push(`«${q.pregunta}» (${q.path}) compite con ${normalizarRuta(mejor.page)} por «${mejor.query}» (${mejor.impressions} imp., pos. ${mejor.position})`);
    }
  }
}

function normalizarRuta(u) {
  try {
    const { pathname } = new URL(u);
    return pathname.replace(/\/$/, '') || '/';
  } catch { return String(u).replace(/\/$/, ''); }
}

// ——— reporte ———
const lineas = [
  '# Canibalización · preguntas long tail vs Search Console',
  '',
  `Generado: ${new Date().toISOString()}`,
  `Preguntas analizadas: ${preguntas.length}`,
  `Exportes leídos: ${files.length}${files.length ? ' → ' + files.map((f) => path.basename(f)).join(', ') : ''}`,
  `Filas con página: ${conPagina}`,
  '',
  '## Hallazgos',
  '',
  ...(problemas.length ? problemas.map((p) => `- ${p}`) : ['- Sin canibalización detectada con los datos disponibles.']),
  '',
  ...(avisos.length ? ['## Avisos', '', ...avisos.map((a) => `- ${a}`), ''] : []),
  '## Cómo actualizar los datos',
  '',
  '1. Search Console → Rendimiento → Exportar → CSV.',
  '2. Descarga la pestaña **Consultas** y, si está disponible, la vista con **consultas + páginas**.',
  '3. Copia los CSV en `documentacion/seo/search-console/`.',
  '4. Ejecuta `node tools/verify-cannibalization.mjs --strict`.',
].join('\n');
fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, lineas + '\n', 'utf8');

console.log('\nCanibalización · verificación');
console.log(`  preguntas: ${preguntas.length}`);
console.log(`  exportes GSC: ${files.length}${files.length ? '' : ' (sin datos)'} · filas con página: ${conPagina}`);
if (avisos.length) avisos.forEach((a) => console.log('  aviso: ' + a));
if (problemas.length) {
  console.log(`  hallazgos: ${problemas.length}`);
  problemas.slice(0, 12).forEach((p) => console.log('   - ' + p));
  if (problemas.length > 12) console.log(`   … y ${problemas.length - 12} más`);
  console.log(`  reporte: ${path.relative(ROOT, REPORT)}`);
  if (STRICT) process.exit(1);
  console.log('✓ Revisión completada (usa --strict para fallar si hay hallazgos).');
  process.exit(0);
}
console.log('✓ Sin canibalización detectada.');
