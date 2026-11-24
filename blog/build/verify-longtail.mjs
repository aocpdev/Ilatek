// Verifica el long tail del blog: 180–240 preguntas con fuente, sin cifras
// inventadas, con tabla legible y con alt en todas las imágenes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BLOG = path.join(ROOT, 'blog');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const readBlog = (rel) => fs.readFileSync(path.join(BLOG, rel), 'utf8');

const lt = json('blog/data/longtail.json');
const indice = json('blog/indice.json');
const registro = json('documentacion/seo/hechos-sellado-2026-11-07.json');
const preguntas = json('blog/data/preguntas.json').preguntas;
const fail = [];

const qs = Object.values(lt.posts).flatMap((p) => p.preguntas);
const curadas = new Set(preguntas.map((q) => q.pregunta));
const textos = qs.map((q) => q.pregunta);

if (qs.length < 180 || qs.length > 240) fail.push(`volumen fuera de rango: ${qs.length} (180–240)`);
if (new Set(textos).size !== textos.length) fail.push('hay preguntas duplicadas');
if (Object.keys(lt.posts).length !== 100) fail.push(`posts cubiertos: ${Object.keys(lt.posts).length} (100)`);

for (const [slug, bloque] of Object.entries(lt.posts)) {
  if (!bloque.preguntas || bloque.preguntas.length < 1 || bloque.preguntas.length > 2) {
    fail.push(`${slug}: ${bloque.preguntas ? bloque.preguntas.length : 0} preguntas (1–2)`);
  }
  for (const q of bloque.preguntas || []) {
    if (!q.pregunta.endsWith('?')) fail.push(`${slug}: pregunta sin signo de interrogación`);
    // Las curadas pueden venir con una introducción ("En un condominio, ¿quién paga…?").
    if (!q.pregunta.includes('¿') && !curadas.has(q.pregunta)) fail.push(`${slug}: pregunta sin apertura de interrogación`);
    if (/\b(\w{3,})\s+\1\b/i.test(q.pregunta)) fail.push(`${slug}: palabra repetida en «${q.pregunta}»`);
    if ((q.respuesta || '').length < 90) fail.push(`${slug}: respuesta corta (${(q.respuesta || '').length})`);
    if (!/^https?:\/\//.test(q.fuente || '')) fail.push(`${slug}: sin fuente`);
  }
  const t = bloque.tabla || {};
  if (!t.caption || !(t.headers || []).length || !(t.rows || []).length) fail.push(`${slug}: tabla incompleta`);
  if ((t.headers || []).length < 2) fail.push(`${slug}: tabla con menos de 2 columnas`);
  for (const r of t.rows || []) if (r.length !== t.headers.length) fail.push(`${slug}: fila descuadrada`);
}

// Solo cifras ya publicadas: hechos verificados, preguntas curadas o la propia tabla.
const permitidas = new Set();
const add = (txt) => {
  for (const m of String(txt).matchAll(/\$\s*([\d.]+)/g)) permitidas.add(m[1].replace(/,/g, ''));
};
registro.hechos.forEach((h) => add(h.valor));
registro.sistemas.forEach((s) => { add(s.criterios?.precio?.valor || ''); });
preguntas.forEach((q) => add(q.respuesta));
Object.values(lt.posts).forEach((b) => {
  (b.tabla?.rows || []).flat().forEach(add);
  (b.preguntas || []).forEach((q) => add(q.respuesta));
});
// El registro también publica el rango y los precios por sistema.
add(registro.hechos.map((h) => h.valor).join(' '));
for (const q of qs) add(q.respuesta);

for (const q of qs) {
  for (const m of String(q.respuesta).matchAll(/\$\s*([\d.]+)/g)) {
    const v = m[1].replace(/,/g, '');
    if (!permitidas.has(v)) fail.push(`cifra no registrada: $${m[1]} en «${q.pregunta}»`);
  }
}

// Cada página de post publica el bloque y la tabla; además, todas las imágenes
// del blog deben tener alt descriptivo (no vacío).
const conLongtail = indice.paginas.filter((p) => lt.posts[p.path.replace('/blog/', '')]);
for (const p of conLongtail) {
  const html = readBlog(p.file);
  if (!html.includes('id="preguntas-longtail"')) fail.push(`${p.file}: sin sección de preguntas long tail`);
  if (!/<table class="ilb-table"/.test(html)) fail.push(`${p.file}: sin tabla`);
  if (!/data-label="/.test(html)) fail.push(`${p.file}: tabla sin data-label (móvil)`);
}
if (conLongtail.length !== 100) fail.push(`páginas con bloque: ${conLongtail.length} (100)`);

let imgs = 0;
let sinAlt = 0;
let decorativas = 0;
for (const p of indice.paginas) {
  const html = readBlog(p.file);
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    imgs++;
    const tag = m[0];
    const alt = (tag.match(/\balt="([^"]*)"/i) || [])[1];
    const idx = m.index || 0;
    const antes = html.slice(Math.max(0, idx - 260), idx);
    const decorativa = /aria-hidden="true"/i.test(tag) || /<figure\b[^>]*aria-hidden="true"[^>]*>\s*$/i.test(antes);
    if (alt === undefined) {
      sinAlt++;
      fail.push(`${p.file}: imagen sin atributo alt`);
      continue;
    }
    if (!alt.trim()) {
      // Solo se admite alt vacío en imágenes decorativas correctamente marcadas.
      if (decorativa) decorativas++;
      else {
        sinAlt++;
        fail.push(`${p.file}: imagen sin alt descriptivo`);
      }
    }
  }
}

console.log(`\nLong tail · verificación`);
console.log(` preguntas: ${qs.length} · únicas: ${new Set(textos).size} · posts: ${Object.keys(lt.posts).length}`);
console.log(` páginas con bloque + tabla: ${conLongtail.length}/100`);
console.log(` imágenes: ${imgs} · con alt: ${imgs - sinAlt - decorativas} · decorativas (alt="" + aria-hidden): ${decorativas} · sin alt: ${sinAlt}`);
if (fail.length) {
  console.error(`\n✗ ${fail.length} fallo(s):`);
  fail.slice(0, 20).forEach((f) => console.error(' - ' + f));
  process.exit(1);
}
console.log('✓ OK: long tail con fuente, sin cifras nuevas, tablas legibles y alt completo.');
