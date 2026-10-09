// Ilatek · comprobación de paridad FAQ. Reejecutable:
//   node Ilatek/home-page/faq-parity.mjs             → escanea las dos carpetas
//   node Ilatek/home-page/faq-parity.mjs <dir> [...]  → escanea los directorios dados
// La regla vive en faq-core.mjs (checkHtml); aquí solo hay IO y el reporte.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkHtml, visibleFaqs, schemaFaqs } from './faq-core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const DEFAULT_ROOTS = [path.join(ROOT, 'Ilatek'), 'C:/Users/Omele/Documents/LeadFlowSnap'];

function walk(dir, out) {
  let es;
  try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of es) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.html?$/i.test(e.name)) out.push(p);
  }
  return out;
}

const roots = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROOTS;
const files = roots.flatMap((r) => walk(r, [])).sort();
const rows = [];
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const vis = visibleFaqs(html);
  const sch = schemaFaqs(html);
  if (!vis.length && !sch.length) continue;
  const errs = checkHtml(html);
  const count = (pfx) => errs.filter((e) => e.startsWith(pfx)).length;
  rows.push({
    rel: f.replace(ROOT + path.sep, '').split(path.sep).join('/'),
    vis: vis.length, sch: sch.length,
    h3No: count('H3 sin schema'), schNo: count('schema sin H3'),
    ansNo: count('respuesta divergente'), orphanNo: count('item de FAQ'),
  });
}

console.log('archivo;h3;schema;h3_sin_schema;schema_sin_h3;respuestas');
rows.forEach((r) => console.log(`${r.rel};${r.vis};${r.sch};${r.h3No};${r.schNo};${r.ansNo}`));

const t = rows.reduce((a, r) => ({
  pages: a.pages + 1, h3: a.h3 + r.vis,
  h3No: a.h3No + r.h3No, schNo: a.schNo + r.schNo,
  ansNo: a.ansNo + r.ansNo, orphanNo: a.orphanNo + r.orphanNo,
}), { pages: 0, h3: 0, h3No: 0, schNo: 0, ansNo: 0, orphanNo: 0 });

console.log(`\nRESUMEN;paginas=${t.pages};h3=${t.h3};h3_sin_schema=${t.h3No};schema_sin_h3=${t.schNo};respuestas_divergentes=${t.ansNo};items_sin_pregunta=${t.orphanNo}`);
if (t.h3No || t.schNo || t.ansNo || t.orphanNo) process.exitCode = 1;
