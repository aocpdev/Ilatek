#!/usr/bin/env node
/**
 * Prepara el mapa de traducción de una landing.
 *
 * Uso: node tools/en-extract.mjs <slug> [--write]
 *
 * - Siembra src/en/<slug>.json con los pares data-es/data-en que la propia
 *   página ya trae (traducción aprobada, se reutiliza tal cual).
 * - Lista aparte las cadenas visibles sin par, que son las que faltan.
 * - No traduce nada por su cuenta: solo inventaria y reutiliza.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, structure } from './site-paths.mjs';

const EXTRA = {
  servicios: 'categorias/limpieza/es/landing-pages/ghl-servicios-landing.html',
  'servicios-techos': 'categorias/techos/es/landing-pages/servicios-techos.html',
  home: 'home/es/landing-pages/ghl-home-multiservicios.html',
  resenas: 'resenas/ghl-resenas-landing.html',
  garantia: 'garantia/ghl-garantia-embed.html',
  politica: 'politica-de-privacidad/ghl-politica-embed.html',
  terminos: 'terminos-y-condiciones/ghl-terminos-embed.html',
  communities: 'Comunidades/landing-pages/comunidades.html',
};
const esPage = slug => EXTRA[slug] || (structure.pages.find(p => p.slug === slug) || {}).file;

export function stringsOf(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '');
  const pairs = new Map();
  for (const m of body.matchAll(/<([a-z0-9-]+)\b([^>]*)>/gi)) {
    const attrs = m[2];
    const en = (attrs.match(/\bdata-en="([^"]*)"/i) || [])[1];
    const es = (attrs.match(/\bdata-es="([^"]*)"/i) || [])[1];
    if (en && es) pairs.set(es.trim(), en.trim());
  }
  const seen = new Set();
  for (const m of body.matchAll(/>([^<>]{3,})</g)) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t && /[a-záéíóúñ]{3}/i.test(t)) seen.add(t);
  }
  for (const m of body.matchAll(/\b(alt|title|aria-label|placeholder)="([^"]{3,})"/gi)) {
    const t = m[2].trim();
    if (/[a-záéíóúñ]{3}/i.test(t)) seen.add(t);
  }
  return { pairs, strings: [...seen] };
}


const slug = process.argv[2];
if (!slug) { console.error('Uso: node tools/en-extract.mjs <slug> [--write]'); process.exit(1); }
const file = esPage(slug);
if (!file || !fs.existsSync(path.join(ROOT, file))) { console.error('Slug sin página: ' + slug); process.exit(1); }

const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
const { pairs, strings } = stringsOf(html);
const map = {};
const missing = [];
for (const s of strings) {
  if (pairs.has(s)) map[s] = pairs.get(s);
  else missing.push(s);
}
const target = path.join(ROOT, 'src/en', slug + '.json');
const early = process.argv.find(a => a.startsWith('--'));
fs.mkdirSync(path.join(ROOT, 'src/en'), { recursive: true });
// El listado de pendientes se escribe siempre: es el inventario de trabajo.
fs.writeFileSync(path.join(ROOT, 'src/en', '_pendientes-' + slug + '.txt'), missing.join('\n') + '\n', 'utf8');
if (early === '--write') {
  fs.writeFileSync(target, JSON.stringify(map, null, 1) + '\n', 'utf8');
}
console.log(`${slug}: ${strings.length} cadenas · ${Object.keys(map).length} reutilizadas de data-en · ${missing.length} pendientes`);
if (early === '--write') console.log('  escrito', path.relative(ROOT, target), 'y src/en/_pendientes-' + slug + '.txt');
