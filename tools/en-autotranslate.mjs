#!/usr/bin/env node
/**
 * Rellena src/en/<slug>.json traduciendo las cadenas de
 * src/en/_pendientes-<slug>.txt (las que genera tools/en-extract.mjs).
 *
 * Reglas:
 * - {{custom_values.*}}, los nombres de marca y las rutas /slug nunca se envían
 *   al traductor: la cadena se parte por ellos y solo se traduce el texto.
 *   Los tokens vuelven byte a byte y la ruta se sustituye por una frase inglesa.
 * - Las cadenas que venían codificadas (%20…) se devuelven codificadas.
 * - Nunca sobrescribe una traducción que ya exista en el mapa (memoria).
 * - Caché en src/en/_mt-cache.json: la misma cadena no se pide dos veces.
 *
 * Uso: node tools/en-autotranslate.mjs <slug> [...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';

const CACHE_FILE = path.join(ROOT, 'src/en/_mt-cache.json');
const API = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=es&tl=en&q=';
const SPLIT_RE = /(\{\{[^}]+\}\}|Ilatek Property Solution|Ilatek Techos|Ilatek|Devasks|\/(?:[a-z0-9-]+\/?)+)/g;
const BATCH_SIZE = 8;
const SHORT = { 'Sí.': 'Yes.', 'Sí:': 'Yes:', 'Sí': 'Yes', 'sí': 'yes', 'No.': 'No.', 'No': 'No' };

const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};
const saveCache = () => fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(text, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(API + encodeURIComponent(text), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(25000),
      });
      if (res.status === 429) throw new Error('HTTP 429');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const out = Array.isArray(data) ? data.join('') : String(data ?? '');
      if (!out.trim()) throw new Error('respuesta vacía');
      return out;
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(1500 * (i + 1));
    }
  }
}

/** Un lote de líneas simples: cada línea vuelve en su propia línea. */
async function translateBatch(texts) {
  const key = 'BATCH\u0001' + texts.join('\n');
  if (cache[key] !== undefined) return cache[key].split('\n');
  const out = await request(texts.join('\n'));
  const parts = out.split('\n');
  if (parts.length !== texts.length) throw new Error('lote desalineado');
  cache[key] = out;
  return parts;
}

/** Traduce solo el texto; tokens, marcas y rutas se copian tal cual. */
async function translateLine(line) {
  const parts = line.split(SPLIT_RE);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === undefined || part === '') continue;
    if (i % 2 === 1) { out.push(part.startsWith('/') ? 'its service page' : part); continue; }
    if (!/[a-záéíóúñ]/i.test(part)) { out.push(part); continue; }
    const key = 'SEG\u0001' + part;
    if (cache[key] === undefined) cache[key] = await request(part);
    out.push(cache[key]);
  }
  return out.join('').replace(/\s{2,}/g, ' ').trim();
}

const isSimple = (line) => !/\{\{|\/|Ilatek|Devasks|%/.test(line);

async function pool(items, worker, size) {
  const out = new Array(items.length);
  const errors = [];
  let next = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      try { out[i] = await worker(items[i], i); } catch (err) { errors.push([items[i], err.message]); out[i] = null; }
    }
  });
  await Promise.all(runners);
  return { out, errors };
}

const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!slugs.length) { console.error('Uso: node tools/en-autotranslate.mjs <slug> [...]'); process.exit(1); }

let translated = 0;
let failed = 0;
for (const slug of slugs) {
  const pendingFile = path.join(ROOT, 'src/en', `_pendientes-${slug}.txt`);
  const mapFile = path.join(ROOT, 'src/en', `${slug}.json`);
  if (!fs.existsSync(pendingFile)) { console.error(`✗ ${slug}: falta ${path.relative(ROOT, pendingFile)}`); failed++; continue; }
  const lines = fs.readFileSync(pendingFile, 'utf8').split(/\r?\n/).filter((l, i, a) => !(i === a.length - 1 && l === ''));
  const map = fs.existsSync(mapFile) ? JSON.parse(fs.readFileSync(mapFile, 'utf8')) : {};

  // Respuestas de una palabra: no siempre entran en la lista de pendientes,
  // así que se resuelven siempre y el mapa las cubre en cualquier contexto.
  for (const [es, en] of Object.entries(SHORT)) if (map[es] === undefined) map[es] = en;

  const todo = lines.filter((line) => map[line] === undefined && line !== 'undefined' && /[a-záéíóúñ]/i.test(line));
  const simple = todo.filter(isSimple);
  const complex = todo.filter((line) => !isSimple(line));
  let errors = 0;

  // Lotes de líneas simples (8 por petición) con caída a línea suelta.
  const batches = [];
  for (let i = 0; i < simple.length; i += BATCH_SIZE) batches.push(simple.slice(i, i + BATCH_SIZE));
  const { out: batchOut, errors: batchErr } = await pool(batches, async (batch) => {
    try { return await translateBatch(batch); } catch { return null; }
  }, 3);
  batches.forEach((batch, bi) => {
    if (batchOut[bi]) { batch.forEach((line, i) => { map[line] = batchOut[bi][i]; translated++; }); }
    else batch.forEach((line) => complex.push(line)); // reintento suelto
  });
  errors += batchErr.length ? 0 : 0;

  const { out, errors: lineErr } = await pool(complex, async (line) => {
    let encoded = false;
    let plain = line;
    if (/%[0-9A-Fa-f]{2}/.test(line)) {
      try { plain = decodeURIComponent(line); encoded = true; } catch { encoded = false; plain = line; }
    }
    const text = await translateLine(plain);
    return encoded ? encodeURIComponent(text) : text;
  }, 3);
  complex.forEach((line, i) => {
    if (out[i] === null || out[i] === undefined) return;
    map[line] = out[i];
    translated++;
  });
  errors += lineErr.length;

  fs.writeFileSync(mapFile, JSON.stringify(map, null, 2) + '\n');
  saveCache();
  const left = lines.filter((l) => map[l] === undefined && l !== 'undefined' && /[a-záéíóúñ]/i.test(l));
  console.log(`${slug}: mapa ${Object.keys(map).length} · traducidas ${todo.length - left.length} · fallos ${errors} · quedan ${left.length}`);
  (lineErr.length ? lineErr : batchErr).slice(0, 2).forEach(([l, e]) => console.log(`   ✗ ${String(l).slice(0, 45)} → ${e}`));
  failed += left.length;
}
saveCache();
console.log(`Traducidas en esta corrida: ${translated} · cadenas sin traducir: ${failed}`);
if (failed) process.exit(1);
