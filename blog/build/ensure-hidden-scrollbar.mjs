// Ilatek · Blog · garantiza que el contenedor de reseñas no muestre scrollbar (Firefox + WebKit).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG = path.resolve(HERE, '..');
const NEED = ['scrollbar-width:none', '-ms-overflow-style:none', 'overscroll-behavior:contain'];

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html') || e.name === 'blog.css') files.push(p);
  }
})(BLOG);
files.push(path.join(HERE, 'render.mjs'));

let changed = 0, missingRule = 0, missingWebkit = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (!src.includes('.ilb-reviews')) continue;
  let s = src;

  const m = s.match(/\.ilb-reviews\{([^}]*)\}/);
  if (!m) { missingRule++; continue; }
  let body = m[1];
  let touched = false;
  for (const prop of NEED) {
    const name = prop.split(':')[0];
    if (!new RegExp(name.replace('-', '\-') + '\s*:').test(body)) {
      body += (body.trim().endsWith(';') ? '' : ';') + prop;
      touched = true;
    }
  }
  if (touched) s = s.replace(m[0], '.ilb-reviews{' + body + '}');

  if (!/\.ilb-reviews::-webkit-scrollbar\{/.test(s)) {
    s = s.replace(/(\.ilb-reviews\{[^}]*\})/, '$1\n.ilb-reviews::-webkit-scrollbar{display:none;width:0;height:0}\n.ilb-reviews::-webkit-scrollbar-track,.ilb-reviews::-webkit-scrollbar-thumb{background:transparent}');
    missingWebkit++;
  }
  if (s !== src) { fs.writeFileSync(f, s); changed++; }
}
console.log('archivos con scrollbar asegurado:', changed, '| sin regla .ilb-reviews:', missingRule, '| regla webkit añadida:', missingWebkit);
