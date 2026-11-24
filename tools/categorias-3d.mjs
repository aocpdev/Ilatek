#!/usr/bin/env node
/**
 * Carrusel 3D de categorías: un solo componente, dos variantes.
 *
 * Reutiliza el componente existente (componentes/ghl-categorias-3d-grandes.html)
 * SIN duplicar su CSS ni su JS: extrae el bloque <style> del carrusel, la
 * <section id="ilatek-categorias"> y el <script> de rotación, y solo reescribe
 * los textos y las tarjetas cuando se le pasa una especificación
 * (src/categorias-3d/<slug>.json).
 *
 * Los Custom Values del componente se copian byte a byte.
 *
 * Uso:
 *   node tools/categorias-3d.mjs --emit limpieza   # variante tal cual
 *   node tools/categorias-3d.mjs --emit techos     # variante desde spec
 *   node tools/categorias-3d.mjs --mount <slug> <page.html>
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';

const COMPONENTE = 'componentes/ghl-categorias-3d-grandes.html';
const OUT_DIR = 'componentes/build';
const MARCA = 'id="ilatek-categorias"';

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const write = (rel, txt) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, txt);
};

function piezas() {
  const src = read(COMPONENTE);
  const estilos = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[0]);
  const style = estilos.find(s => s.includes('ilcg-'));
  const sec = src.match(/<section id="ilatek-categorias"[\s\S]*?<\/section>/i);
  if (!style || !sec) throw new Error('componente sin estilo o sección de carrusel');
  const script = [...src.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => m[0])
    .find(s => s.includes('ilcg'));
  if (!script) throw new Error('componente sin script de carrusel');
  return { style, section: sec[0], script, src };
}

const sinFuentes = html => html
  .replace(/\s*<link[^>]*rel="preconnect"[^>]*>/gi, '')
  .replace(/\s*<link[^>]*fonts\.googleapis[^>]*>/gi, '');

const svgs = src => [...src.matchAll(/<i class="ilcg-badge"[\s\S]*?<\/i>/g)].map(m => m[0]);

function tarjeta(spec, badge) {
  const items = spec.items.map(t => `<li><i aria-hidden="true">✓</i> ${t}</li>`).join(' ');
  const token = 'https://{{custom_values.website_url}}';
  return [
    '<article class="ilcg-card">',
    `<div class="ilcg-media"><img fetchpriority="high" src="${spec.imagen}" onerror="this.onerror=null;this.src='${spec.imagenFallback}'" width="800" height="451" loading="lazy" decoding="async" alt="${spec.alt}" title="${spec.title}"></div>`,
    badge,
    '<div class="ilcg-body">',
    `<span class="ilcg-kicker">${spec.kicker}</span>`,
    `<h5 class="il-h3-keep">${spec.h5}</h5>`,
    `<p>${spec.parrafo}</p>`,
    `<ul class="ilcg-list">${items}</ul>`,
    `<a class="ilcg-btn" href="${token}${spec.path}" data-ilatek-path="${spec.path}" aria-label="${spec.aria}">${spec.cta}</a>`,
    '</div>',
    '</article>',
  ].join(' ');
}

function tarjetaCta(cta) {
  const token = 'https://{{custom_values.website_url}}';
  return `<a class="ilcg-btn" href="${token}${cta.path}" data-ilatek-path="${cta.path}" aria-label="${cta.aria}">${cta.texto}</a>`;
}

function varianteDesdeSpec(base, spec) {
  let html = base;
  html = html.replace(/(<span class="ilcg-eyebrow">)[\s\S]*?(<\/span>)/, `$1${spec.eyebrow}$2`);
  html = html.replace(/(<h2 id="ilatek-categorias-title">)[\s\S]*?(<\/h2>)/, `$1${spec.titulo}$2`);
  html = html.replace(/(<h2 id="ilatek-categorias-title">[\s\S]*?<\/h2>\s*<p>)[\s\S]*?(<\/p>)/, `$1${spec.intro}$2`);
  html = html.replace(/(<div class="ilcg-stage"[^>]*aria-label=")[^"]*(")/, `$1${spec.etiqueta}$2`);
  const badges = svgs(base);
  const cards = [...html.matchAll(/<article class="ilcg-card">[\s\S]*?<\/article>/g)];
  if (cards.length !== spec.tarjetas.length) throw new Error(`tarjetas: ${cards.length} vs spec ${spec.tarjetas.length}`);
  cards.forEach((m, i) => { html = html.replace(m[0], tarjeta(spec.tarjetas[i], badges[i] || badges[0])); });
  // los comentarios numeran las tarjetas originales; en la variante sobran
  html = html.replace(/\s*<!-- =+ (?:TARJETA \d+ · [A-ZÁÉÍÓÚ]+|CTA GENERAL) =+ -->/g, '');
  const cta = spec.ctaFinal;
  if (cta) {
    html = html.replace(/(<p class="ilcg-cta-title">)[\s\S]*?(<\/p>)/, `$1${cta.titulo}$2`);
    html = html.replace(/(<p class="ilcg-cta-title">[\s\S]*?<\/p>\s*<p>)[\s\S]*?(<\/p>)/, `$1${cta.parrafo}$2`);
    html = html.replace(/<a class="ilcg-btn"[^>]*data-ilatek-path="\/cotizacion"[^>]*>[\s\S]*?<\/a>/, tarjetaCta(cta));
  }
  return html;
}

export function fragmento(slug) {
  const { style, section, script } = piezas();
  let sec = sinFuentes(section);
  if (slug !== 'limpieza') {
    const spec = JSON.parse(read(`src/categorias-3d/${slug}.json`));
    sec = varianteDesdeSpec(sec, spec);
  }
  return { html: `${style}\n${sec}\n${script}`, section: sec };
}

function emit(slug) {
  const { html } = fragmento(slug);
  const out = `${OUT_DIR}/categorias-3d-${slug}.html`;
  write(out, html + '\n');
  console.log(`${out}: ${html.length} bytes`);
}

function mount(slug, page) {
  const { section } = fragmento(slug);
  const src = read(page);
  if (src.includes(MARCA)) {
    console.log(`${page}: ya tiene ${MARCA}, no se toca`);
    return 0;
  }
  const ancla = '<section id="ilatek-clima"';
  const i = src.indexOf(ancla);
  if (i < 0) throw new Error(`${page}: no encuentro el ancla ${ancla}`);
  const out = src.slice(0, i) + section + '\n\n' + src.slice(i);
  write(page, out);
  console.log(`${page}: carrusel ${slug} insertado antes de #ilatek-clima`);
  return 0;
}

const argv = process.argv.slice(2);
if (argv[0] === '--emit' && argv[1]) emit(argv[1]);
else if (argv[0] === '--mount' && argv[1] && argv[2]) mount(argv[1], argv[2]);
else console.log('uso: --emit <slug> | --mount <slug> <page.html>');
