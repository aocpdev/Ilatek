// Ilatek · mide el perfil de anchors del cluster de sellado.
// Regla del propietario: el anchor exacto "Sellado de techos en Puerto Rico"
// debe quedar por debajo del 40% del total de anchors del cluster. El cluster se
// mide sobre las páginas que se publican (categorías, servicios, techos, home y
// blog), no sobre respaldos históricos de documentacion/.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';

const EXACT = /^sellado de techos? en puerto rico$/i;
const DIRS = ['categorias', 'servicios', 'techos', 'home', 'blog'];
const LIMIT = 0.4;

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
}
for (const dir of DIRS) {
  const full = path.join(ROOT, dir);
  if (fs.existsSync(full)) walk(full);
}

let links = 0;
let exact = 0;
let clusterLinks = 0;
let clusterExact = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    links++;
    const text = strip(m[2]);
    const isExact = EXACT.test(text);
    if (isExact) exact++;
    // Denominador real: todo enlace cuyo destino sea el cluster de sellado,
    // sin lookahead (los href del blog terminan justo después del slug).
    if (String(m[1]).indexOf('/sellado-de-techos') !== -1 || isExact) {
      clusterLinks++;
      if (isExact) clusterExact++;
    }
  }
}

const ratio = links ? exact / links : 0;
const clusterRatio = clusterLinks ? clusterExact / clusterLinks : 0;
const pct = (n) => (100 * n).toFixed(2) + '%';

// La regla se mide donde importa: entre los enlaces que apuntan al cluster de
// sellado. El ratio global se informa como contexto (nav y footer diluyen).
if (clusterRatio >= LIMIT) {
  console.error(`✗ Anchors al cluster: ${clusterExact}/${clusterLinks} exactos (${pct(clusterRatio)}), por encima del 40%`);
  process.exit(1);
}
if (ratio >= LIMIT) {
  console.error(`✗ Anchors: el exacto es ${exact}/${links} (${pct(ratio)}), por encima del 40%`);
  process.exit(1);
}
console.log(
  `✓ Anchors: exacto ${exact}/${links} en ${files.length} páginas del cluster (${pct(ratio)}, límite ${pct(LIMIT)}); ` +
  `dentro del cluster de sellado ${clusterExact}/${clusterLinks} (${pct(clusterRatio)})`
);
