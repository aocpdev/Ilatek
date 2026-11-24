/**
 * Traduce el SEO del HEAD inglés (title, description, og:* y twitter:*) desde el
 * HEAD español del mismo par, protegiendo los custom values.
 *
 * El HEAD EN se generó copiando el SEO español, así que la página inglesa se
 * publicaba en GHL con título y description en español. Aquí se traducen y se
 * comprueba el resultado antes de dar el archivo por bueno.
 *
 *   node tools/build-en-head-seo.mjs            # aplica
 *   node tools/build-en-head-seo.mjs --check    # solo informa (exit 1 si hay)
 */
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=es&tl=en&q=';
const pages = JSON.parse(fs.readFileSync('docs/estructura.json', 'utf8')).pages;
// Marcas de español que no aparecen en un título inglés legítimo.
const ES = /\b(de|del|la|las|los|para|con|por|desde|tu|su|garantía|techos|techo|precio|cotización|servicio|gratis|años|más|sin)\b/i;
const check = process.argv.includes('--check');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translate(text) {
  const marks = [];
  const body = text.replace(/\{\{custom_values\.[a-z_]+\}\}/gi, (m) => {
    marks.push(m);
    return `Zq${marks.length - 1}Z`;
  });
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(API + encodeURIComponent(body), { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status === 429) throw new Error('429');
      const data = await res.json();
      const out = (Array.isArray(data) ? data.join('') : String(data ?? '')).replace(/\s+/g, ' ').trim();
      if (!out) throw new Error('vacío');
      const vuelta = out.replace(/Zq(\d+)Z/gi, (m, n) => marks[Number(n)] ?? m);
      if (marks.length && (vuelta.match(/Zq\d+Z/gi) || []).length) throw new Error('marcas perdidas');
      return vuelta;
    } catch (err) {
      if (i === 3) throw err;
      await sleep(1200 * (i + 1));
    }
  }
}

/** Título final: núcleo traducido + marca original tras « | ».
 *  Cuando el núcleo lleva un custom value no se recorta: su longitud real la
 *  fija GHL al publicar, y cortar dejaría preposiciones sueltas («from $250 at»). */
function fitTitle(core, sufijo) {
  let nucleo = core.replace(/\s+/g, ' ').trim();
  if (!/\{\{custom_values/.test(nucleo)) {
    const tope = sufijo ? 65 - sufijo.length - 3 : 65;
    if (nucleo.length > tope) {
      const corte = nucleo.slice(0, tope);
      nucleo = corte.slice(0, corte.lastIndexOf(' ')).replace(/[\s,;:.|-]+$/, '');
    }
  }
  return sufijo ? `${nucleo} | ${sufijo}` : nucleo;
}

/** Description 110–165, cortando en frontera de frase. */
function fitDesc(raw) {
  let s = raw.replace(/\s+/g, ' ').trim();
  if (s.length > 165) {
    s = s.slice(0, 165);
    const corte = Math.max(s.lastIndexOf('. '), s.lastIndexOf(', '));
    s = (corte > 90 ? s.slice(0, corte) : s.slice(0, s.lastIndexOf(' '))).replace(/[\s,;:.-]+$/, '') + '.';
  }
  if (s.length < 110) s = s.replace(/[.\s]+$/, '') + '. Free quote and written warranty.';
  return s;
}

const attr = (v) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** Sustituye content (y su data-ilatek-local-content) dentro de una meta. */
function setMeta(html, key, test, value) {
  return html.replace(new RegExp(`<meta\\b[^>]*\\b${test}="${key}"[^>]*>`, 'i'), (tag) => {
    let salida = tag.replace(/(\bcontent=")[^"]*(")/i, (_, a, b) => a + attr(value) + b);
    salida = salida.replace(/(\bdata-ilatek-local-content=")[^"]*(")/i, (_, a, b) => a + encodeURIComponent(value) + b);
    return salida;
  });
}

let aplicados = 0;
const pendientes = [];
const errores = [];

for (const p of pages) {
  const enDir = p.file.replace(/[/\\]es[/\\].*$/, '/en');
  const enHead = path.join(enDir, 'HEAD-TEMPLATE.html');
  const esHead = path.join(p.file.replace(/[/\\]es[/\\].*$/, '/es'), 'HEAD-TEMPLATE.html');
  if (!fs.existsSync(enHead)) continue;

  let html = fs.readFileSync(enHead, 'utf8');
  const tituloActual = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '';
  const descActual = /<meta name="description" content="([^"]*)"/i.exec(html)?.[1] ?? '';
  const nucleoActual = tituloActual.split(' | ')[0].replace(/\{\{[^}]+\}\}/g, '');
  if (!ES.test(nucleoActual) && !ES.test(descActual.replace(/\{\{[^}]+\}\}/g, ''))) continue;

  pendientes.push(p.slug);
  if (check) continue;

  const fuente = fs.existsSync(esHead) ? fs.readFileSync(esHead, 'utf8') : html;
  const fuenteTitulo = /<title>([\s\S]*?)<\/title>/i.exec(fuente)?.[1] ?? tituloActual;
  const fuenteDesc = /<meta name="description" content="([^"]*)"/i.exec(fuente)?.[1] ?? descActual;

  // La marca («Ilatek Techos») no se traduce: es nombre propio.
  const partesEs = fuenteTitulo.replace(/\s+/g, ' ').trim().split(' | ');
  const sufijo = partesEs.length > 1 ? partesEs.pop() : '';
  // El endpoint a veces devuelve el texto origen: se reintenta hasta verlo inglés.
  const enIngles = async (texto) => {
    for (let i = 0; i < 3; i++) {
      const salida = await translate(texto);
      if (!ES.test(salida.replace(/\{\{[^}]+\}\}/g, ''))) return salida;
      await sleep(900);
    }
    return '';
  };
  const nucleoTrad = await enIngles(partesEs.join(' | '));
  const descTrad = await enIngles(fuenteDesc);
  if (!nucleoTrad || !descTrad) { errores.push(`${p.slug}: la traducción no llegó en inglés`); continue; }
  const titulo = fitTitle(nucleoTrad, sufijo);
  const desc = fitDesc(descTrad);

  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${attr(titulo)}</title>`);
  html = setMeta(html, 'description', 'name', desc);
  html = setMeta(html, 'og:title', 'property', titulo);
  html = setMeta(html, 'og:description', 'property', desc);
  html = setMeta(html, 'twitter:title', 'name', titulo);
  html = setMeta(html, 'twitter:description', 'name', desc);

  // Comprobación antes de escribir: nada de español y sin romper el resto.
  const tituloFinal = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '';
  const descFinal = /<meta name="description" content="([^"]*)"/i.exec(html)?.[1] ?? '';
  const problemas = [];
  // Solo el núcleo: la marca («Ilatek Techos») es nombre propio y contiene «Techos».
  const nucleoFinal = tituloFinal.split(' | ')[0];
  if (ES.test(nucleoFinal.replace(/\{\{[^}]+\}\}/g, ''))) problemas.push('título sigue en español');
  if (ES.test(descFinal.replace(/\{\{[^}]+\}\}/g, ''))) problemas.push('description sigue en español');
  if (tituloFinal.length > 65 && !/\{\{custom_values/.test(tituloFinal)) problemas.push(`título ${tituloFinal.length} car.`);
  if (descFinal.length < 110 || descFinal.length > 165) problemas.push(`description ${descFinal.length} car.`);
  if (!/hreflang="en"/.test(html)) problemas.push('sin hreflang en');
  if (problemas.length) { errores.push(`${p.slug}: ${problemas.join(', ')}`); continue; }

  fs.writeFileSync(enHead, html);
  aplicados++;
  if (aplicados % 10 === 0) console.log(`  ${aplicados} heads traducidos`);
}

if (check) {
  console.log(`HEADS EN con SEO en español: ${pendientes.length}`);
  pendientes.slice(0, 8).forEach((s) => console.log('  -', s));
  process.exit(pendientes.length ? 1 : 0);
}
console.log(`HEADS EN con SEO traducido: ${aplicados}`);
if (errores.length) {
  console.error(`✗ ${errores.length} sin aplicar:`);
  errores.slice(0, 10).forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
