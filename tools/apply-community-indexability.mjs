// Ilatek · gobernanza de indexabilidad de las landings de comunidad.
// Una landing solo es indexable si tiene al menos 2 facts locales verificados
// para ESA comunidad y ESE servicio. Sin facts, queda noindex,follow.
// El mismo criterio vive en Comunidades/scripts/landings/template.mjs para que
// una regeneración futura no vuelva a publicar 1.112 doorways en masa.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const LANDINGS = path.join(ROOT, 'Comunidades/landings');
const FACTS_PATH = path.join(ROOT, 'Comunidades/data/facts-locales.json');

let facts = { communities: {} };
if (fs.existsSync(FACTS_PATH)) {
  try { facts = JSON.parse(fs.readFileSync(FACTS_PATH, 'utf8')); } catch { /* todo noindex */ }
}

function verifiedCount(key) {
  const list = facts.communities && facts.communities[key];
  if (!Array.isArray(list)) return 0;
  return list.filter((f) => f && f.estado === 'verificado' && f.valor !== null && f.valor !== '').length;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

if (!fs.existsSync(LANDINGS)) {
  console.log('Comunidades: no hay carpeta landings; nada que hacer.');
  process.exit(0);
}

let changed = 0, indexable = 0, noindex = 0;
for (const file of walk(LANDINGS)) {
  const rel = path.relative(LANDINGS, file).replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.length < 4) continue;
  const key = `${parts[0]}/${parts[1]}/${parts[2]}`;
  const robots = verifiedCount(key) >= 2 ? 'index, follow' : 'noindex, follow';
  if (robots.startsWith('index')) indexable++; else noindex++;

  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${robots}">`);
  } else {
    html = html.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, `$1\n<meta name="robots" content="${robots}">`);
  }
  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    changed++;
  }
}

console.log(`Comunidades: ${changed} archivos actualizados · indexables=${indexable} · noindex=${noindex} · facts=${Object.keys(facts.communities || {}).length}`);
