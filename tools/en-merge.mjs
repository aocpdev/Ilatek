#!/usr/bin/env node
/**
 * Fusiona traducciones en src/en/<slug>.json sin teclear las claves a mano.
 *
 * Uso: node tools/en-merge.mjs <slug> <archivo.json>
 *
 * El archivo es un array alineado, línea por línea, con src/en/_pendientes-<slug>.txt.
 * Las posiciones con null se omiten; si otra página ya tradujo esa misma cadena,
 * se reutiliza (memoria de traducción) para no repetir trabajo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';

const [slug, patchFile] = process.argv.slice(2);
if (!slug || !patchFile) { console.error('Uso: node tools/en-merge.mjs <slug> <archivo.json>'); process.exit(1); }

const pendingPath = path.join(ROOT, 'src/en', '_pendientes-' + slug + '.txt');
const target = path.join(ROOT, 'src/en', slug + '.json');
const source = JSON.parse(fs.readFileSync(patchFile, 'utf8'));
const pending = fs.readFileSync(pendingPath, 'utf8').split('\n');
if (pending[pending.length - 1] === '') pending.pop();
const isArray = Array.isArray(source);
if (isArray && source.length !== pending.length) {
  console.error(`Desalineado: ${source.length} traducciones para ${pending.length} cadenas.`);
  process.exit(1);
}
if (!isArray) {
  const known = new Set(pending);
  const unknown = Object.keys(source).filter(k => !known.has(k));
  if (unknown.length) {
    console.error(`Claves que no están en la lista de pendientes (${unknown.length}):`);
    unknown.slice(0, 6).forEach(k => console.error('  · ' + k.slice(0, 110)));
    process.exit(1);
  }
}

const map = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : {};
const memory = new Map();
for (const f of fs.readdirSync(path.join(ROOT, 'src/en'))) {
  if (!f.endsWith('.json') || f.startsWith('_')) continue;
  if (f === slug + '.json') continue;
  for (const [es, en] of Object.entries(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/en', f), 'utf8')))) {
    if (!memory.has(es)) memory.set(es, en);
  }
}

let added = 0, reused = 0, skipped = 0;
pending.forEach((es, i) => {
  const value = isArray ? source[i] : source[es];
  if (typeof value === 'string' && value.trim()) { map[es] = value; added++; return; }
  if (!(es in map) && memory.has(es)) { map[es] = memory.get(es); reused++; return; }
  skipped++;
});
fs.writeFileSync(target, JSON.stringify(map, null, 1) + '\n', 'utf8');
const stillPending = pending.filter(es => !(es in map));
console.log(`${slug}: ${added} traducidas · ${reused} reutilizadas · ${skipped} sin traducir · ${stillPending.length} pendientes de ${pending.length}`);
if (stillPending.length) {
  console.log('primeras pendientes:');
  stillPending.slice(0, 8).forEach(p => console.log('  · ' + p.slice(0, 110)));
}
