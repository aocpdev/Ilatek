// Verifica el lote de blog contra su propio índice.
// Uso: node blog/build/verify-blog.mjs
//
// Comprueba: catálogo y editoriales, precios con fuente, cobertura de páginas,
// un solo nav/footer, contrato de enlaces internos, JSON-LD válido, CTA obligatorio,
// hoja SEO completa y sitemap sincronizado.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ilatekpr.com';
const TOKEN = '{{custom_values.website_url}}';
const read = (f) => fs.readFileSync(path.join(BLOG, f), 'utf8');
const json = (f) => JSON.parse(read(f));

const sistemas = json('data/sistemas.json');
const catalogo = json('data/posts.json');
const editoriales = json('data/editoriales.json');
const preguntas = json('data/preguntas.json');
const indice = json('indice.json');

const errores = [];
const avisos = [];
const fail = (m) => errores.push(m);
const warn = (m) => avisos.push(m);

// ——— catálogo ———
const posts = catalogo.posts;
// El tamaño del catálogo no es fijo: el lote crece añadiendo posts a data/posts.json.
const slugs = new Set();
const famIds = new Set(sistemas.familias.map((f) => f.id));
const marcaIds = new Set(sistemas.marcas.map((m) => m.id));
for (const p of posts) {
  if (!/^[a-z0-9-]+$/.test(p.slug)) fail(`slug inválido: ${p.slug}`);
  if (slugs.has(p.slug)) fail(`slug duplicado: ${p.slug}`);
  slugs.add(p.slug);
  if (!p.grupo) fail(`${p.slug}: falta grupo`);
  for (const f of ['titulo', 'h1', 'meta', 'kw', 'angulo']) {
    if (!p[f] || String(p[f]).trim().length < 8) fail(`${p.slug}: falta ${f}`);
  }
  if (!p.familias.length) fail(`${p.slug}: sin familia`);
  p.familias.forEach((f) => famIds.has(f) || fail(`${p.slug}: familia desconocida ${f}`));
  p.marcas.forEach((m) => marcaIds.has(m) || fail(`${p.slug}: marca desconocida ${m}`));
  if (p.titulo.length > 68) warn(`${p.slug}: título de ${p.titulo.length} caracteres`);
  if (p.meta.length < 110 || p.meta.length > 168) warn(`${p.slug}: meta de ${p.meta.length} caracteres`);
}

// Los editoriales a mano son opcionales por post: aquí solo se valida su forma.
for (const e of editoriales.editoriales) {
  if (!slugs.has(e.slug)) fail(`editorial de slug inexistente: ${e.slug}`);
  if (!e.intro || !e.secciones?.length || !e.veredicto) fail(`editorial ${e.slug}: incompleto`);
}

if (preguntas.preguntas.length < 35) fail(`preguntas: ${preguntas.preguntas.length}`);
const qids = new Set();
for (const q of preguntas.preguntas) {
  if (qids.has(q.id)) fail(`pregunta duplicada: ${q.id}`);
  qids.add(q.id);
  if (!slugs.has(q.post)) fail(`pregunta ${q.id}: post inexistente ${q.post}`);
  if (!/^https?:\/\//.test(q.fuente || '')) fail(`pregunta ${q.id}: sin fuente`);
  if ((q.respuesta || '').length < 80) fail(`pregunta ${q.id}: respuesta corta`);
}

// ——— precios ———
for (const m of sistemas.marcas) {
  if (!/^https?:\/\//.test(m.sitio || '')) fail(`marca ${m.id}: sitio inválido`);
  for (const p of m.precios || []) {
    if (!/^https?:\/\//.test(p.url || '')) fail(`marca ${m.id}: precio sin URL de fuente (${p.producto})`);
    if (!/^(desde\s)?\$[\d.]+/.test(p.precio || '')) fail(`marca ${m.id}: precio mal formado (${p.precio})`);
  }
}

// ——— páginas ———
const files = indice.paginas.map((p) => p.file);
for (const p of indice.paginas) {
  if (!fs.existsSync(path.join(BLOG, p.file))) fail(`índice: falta el archivo ${p.file}`);
}
const paths = new Set(indice.paginas.map((p) => p.path));
if (!indice.paginas.length) fail('índice: sin páginas');
if (Number(indice.total) !== indice.paginas.length) fail(`índice: total ${indice.total} no coincide con ${indice.paginas.length} páginas`);
// Cobertura: cada post del catálogo tiene que tener su página generada.
for (const p of posts) if (!paths.has('/blog/' + p.slug)) fail(`catálogo: el post ${p.slug} no tiene página generada`);
if (new Set(files).size !== files.length) fail('índice: archivos duplicados');
if (paths.size !== indice.paginas.length) fail('índice: rutas duplicadas');

const enlaces = new Map();
const anclas = [];
for (const p of indice.paginas) {
  const html = read(p.file);
  const nav = (html.match(/id="ilatek-nav"/g) || []).length;
  const footer = (html.match(/id="ilatek-footer"/g) || []).length;
  if (nav !== 1) fail(`${p.file}: ${nav} navegaciones`);
  if (footer !== 1) fail(`${p.file}: ${footer} footers`);
  if (!/Devasks/.test(html)) fail(`${p.file}: falta el crédito de Devasks`);
  if (!/ilatekpr\.com/.test(html)) fail(`${p.file}: falta la referencia a ilatekpr.com`);

  // El nav y el footer son componentes compartidos: sus Custom Values y sus enlaces
  // ya cumplen el contrato del proyecto. Aquí solo se audita el cuerpo del artículo.
  const mainMatch = html.match(/<main id="ilb-main">([\s\S]*)<\/main>/);
  const body = mainMatch ? mainMatch[1] : '';
  if (!body) fail(`${p.file}: sin bloque main identificable`);

  const h1 = (body.match(/<h1\b/g) || []).length;
  if (h1 !== 1) fail(`${p.file}: ${h1} etiquetas H1`);

  // Las ilustraciones usan <title> dentro de <svg> como nombre accesible: eso es
  // correcto. Lo que no puede aparecer es un título de documento en el cuerpo.
  const bodySinSvg = body.replace(/<svg\b[\s\S]*?<\/svg>/gi, '');
  if (/<title\b/i.test(bodySinSvg)) fail(`${p.file}: contiene <title> de documento en el artículo`);

  for (const f of body.matchAll(/<figure class="ilb-fig">([\s\S]*?)<\/figure>/g)) {
    if (!/<svg\b[^>]*role="img"/.test(f[1])) fail(`${p.file}: la figura no expone rol de imagen`);
    if (!/<title\b/.test(f[1])) fail(`${p.file}: la ilustración no tiene nombre accesible`);
  }

  if (/<(?:html|head|body)\b/i.test(body)) fail(`${p.file}: el artículo no es un fragmento pegable en GHL`);
  if (/<meta\s+name=["']description/i.test(html)) fail(`${p.file}: contiene meta description duplicada`);

  for (const m of body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/g)) {
    const tag = m[0];
    const href = m[1];
    if (/^(tel:|mailto:|#)/.test(href)) continue;
    if (/^https?:\/\/(www\.)?ilatekpr\.com/i.test(href)) fail(`${p.file}: dominio literal ${href}`);
    if (href.startsWith('/')) fail(`${p.file}: ruta relativa ${href}`);
    if (href.startsWith('https://' + TOKEN) && !/data-ilatek-path=/.test(tag)) fail(`${p.file}: enlace sin data-ilatek-path ${href}`);
  }

  // Tokens canónicos del owner que el footer puede imprimir tal cual.
  const TOKENS_OK = new Set(['website_url', 'business__phone']);
  for (const m of body.matchAll(/\{\{custom_values\.([a-z_]+)\}\}/g)) {
    if (!TOKENS_OK.has(m[1])) fail(`${p.file}: token crudo no permitido ${m[0]}`);
  }

  for (const b of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    if (/undefined|\bNaN\b/.test(b[1])) fail(`${p.file}: JSON-LD con valor undefined/NaN`);
    try {
      JSON.parse(b[1].replaceAll(`https://${TOKEN}`, 'https://ejemplo.test'));
    } catch (e) {
      fail(`${p.file}: JSON-LD inválido (${e.message.slice(0, 50)})`);
    }
  }

  if (/\bundefined\b/.test(body)) fail(`${p.file}: el artículo contiene la palabra undefined`);
  // Toda página cierra con un CTA de cotización. Las páginas de techos cotizan por
  // /cotizacion-techos y las de limpieza por /cotizacion: el contrato exige el CTA,
  // no una ruta concreta del embudo.
  if (!/data-ilatek-path="\/cotizacion(-techos)?"/.test(body)) fail(`${p.file}: falta el CTA de cotización`);

  let internos = 0;
  for (const m of body.matchAll(/data-ilatek-path="(\/blog[^"]*)"/g)) {
    const [ruta, hash] = m[1].split('#');
    const target = (ruta || '/blog').replace(/\/$/, '') || '/blog';
    enlaces.set(target, (enlaces.get(target) || 0) + 1);
    if (hash) anclas.push({ file: p.file, target, hash });
    internos++;
  }
  if (!internos) fail(`${p.file}: sin enlaces internos al blog`);
}

for (const t of enlaces.keys()) {
  if (!paths.has(t)) fail(`enlace roto: ${t} no existe en el índice`);
}

// Cada ancla apunta a un id real: así los índices de cada post no se rompen.
const archivoDe = new Map(indice.paginas.map((p) => [p.path, p.file]));
for (const a of anclas) {
  const destino = archivoDe.get(a.target);
  if (!destino) continue;
  if (!read(destino).includes(`id="${a.hash}"`)) fail(`${a.file}: el ancla #${a.hash} no existe en ${a.target}`);
}

const huerfanas = [...paths].filter((p) => !enlaces.has(p));
if (huerfanas.length) fail(`páginas sin enlaces entrantes: ${huerfanas.slice(0, 5).join(', ')}${huerfanas.length > 5 ? '…' : ''}`);

// ——— hoja SEO ———
const csv = read('seo/seo-blog.csv').trim().split('\n');
if (csv.length - 1 !== indice.paginas.length) fail(`seo-blog.csv: ${csv.length - 1} filas para ${indice.paginas.length} páginas`);
const seoRutas = new Set();
for (const line of csv.slice(1)) {
  const cols = line.match(/"(?:[^"]|"")*"/g) || [];
  if (cols.length !== 6) {
    fail(`seo-blog.csv: fila con ${cols.length} columnas`);
    continue;
  }
  const [ruta, titulo, desc, canonical] = cols.map((c) => c.slice(1, -1).replace(/""/g, '"'));
  seoRutas.add(ruta);
  if (!paths.has(ruta)) fail(`seo-blog.csv: ruta fuera del índice ${ruta}`);
  if (canonical !== SITE + ruta) fail(`seo-blog.csv: canonical incorrecto para ${ruta}`);
  if (desc.length < 60 || desc.length > 175) warn(`${ruta}: descripción de ${desc.length} caracteres`);
  if (!titulo.trim()) fail(`seo-blog.csv: título vacío en ${ruta}`);
}
for (const p of paths) if (!seoRutas.has(p)) fail(`seo-blog.csv: falta ${p}`);

// ——— sitemap ———
const sm = read('sitemap-blog.xml');
if (/\{\{/.test(sm)) fail('sitemap: contiene tokens sin resolver');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
// El sitemap anuncia cada página ES y su copia EN (las que ya son EN van una vez).
const enPair = (p) => (p === '/blog' ? '/blog/en' : p.startsWith('/blog/en') ? p : '/blog/en' + p.slice('/blog'.length));
const esperadas = new Set();
for (const p of indice.paginas) { esperadas.add(p.path); if (!p.path.startsWith('/blog/en')) esperadas.add(enPair(p.path)); }
if (locs.length !== esperadas.size) fail(`sitemap: ${locs.length} URLs para ${esperadas.size} páginas (ES + EN)`);
for (const l of locs) if (!esperadas.has(l.replace(SITE, '').replace('https://ilatekpr.com', ''))) fail(`sitemap: URL fuera del índice ${l}`);

// ——— reporte ———
const porGrupo = {};
for (const p of indice.paginas) porGrupo[p.grupo] = (porGrupo[p.grupo] || 0) + 1;
console.log('\nBlog ILATEK — verificación');
console.log(` posts: ${posts.length} · editoriales a mano: ${editoriales.editoriales.length} · preguntas: ${preguntas.preguntas.length}`);
console.log(` familias: ${sistemas.familias.length} · marcas: ${sistemas.marcas.length}`);
console.log(` páginas: ${indice.paginas.length} → ${Object.entries(porGrupo).map(([g, n]) => `${g}:${n}`).join(' ')}`);
console.log(` enlaces internos distintos: ${enlaces.size} · anclas verificadas: ${anclas.length}`);
if (avisos.length) {
  console.log(`\nAvisos (${avisos.length}):`);
  avisos.slice(0, 25).forEach((a) => console.log(' · ' + a));
  if (avisos.length > 25) console.log(` · … y ${avisos.length - 25} más`);
}
if (errores.length) {
  console.log(`\nErrores (${errores.length}):`);
  errores.slice(0, 40).forEach((e) => console.log(' ✗ ' + e));
  if (errores.length > 40) console.log(` ✗ … y ${errores.length - 40} más`);
  process.exit(1);
}
console.log('\nOK: índice, enlaces, schema, precios con fuente, SEO y sitemap verificados.\n');
