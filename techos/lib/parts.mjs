// Ilatek · Techos · extractores de bloques compartidos.
// Los bloques de Cobertura y Reviews se toman del código fuente del home para
// conservar su estructura byte a byte, PERO su copy de encabezado/descripción
// se SUSTITUYE por el texto del servicio de cada landing: el home habla de
// limpieza y nosotros hablamos de techos. Si un texto esperado no aparece,
// el build FALLA en vez de publicar copy de limpieza.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ILATEK = path.resolve(HERE, '..', '..');
export const ROOT = path.resolve(ILATEK, '..');

function read(rel) {
  return fs.readFileSync(path.join(ILATEK, rel), 'utf8');
}

function swap(src, from, to, label) {
  if (!src.includes(from)) throw new Error(`No se encontró el texto de ${label} en el bloque compartido`);
  return src.split(from).join(to);
}

// Cobertura: section + su script del generador de 78 municipios, con encabezado
// y descripción del servicio de la landing.
export function coberturaSection(cfg) {
  const src = read('componentes/ghl-cobertura-embed.html');
  const i = src.indexOf('<section id="ilatek-cobertura-dir"');
  if (i < 0) throw new Error('No se encontró la sección de cobertura');
  let out = src.slice(i).trim();

  // El slug del servicio se estampa en el root de la sección para que el script
  // del bloque construya https://<pueblo>.ilatekpr.com/<servicio>. El home (y
  // cualquier página sin cfg.slug) no lo lleva y cae al subdominio raíz de hoy.
  if (cfg.slug) {
    out = swap(
      out,
      '<section id="ilatek-cobertura-dir"',
      `<section id="ilatek-cobertura-dir" data-service-slug="${cfg.slug}"`,
      'data-service-slug de cobertura'
    );
  }

  out = swap(out, 'aria-label="Cobertura de limpieza de Ilatek en Puerto Rico"', `aria-label="Cobertura de ${cfg.label} de Ilatek Techos en Puerto Rico"`, 'aria-label de cobertura');
  out = swap(out, 'aria-label="Municipios de Puerto Rico con servicio de Ilatek"', `aria-label="Municipios de Puerto Rico con servicio de ${cfg.label}"`, 'aria-label de municipios');

  const headerFrom = `    <header class="icd-head">
      <div>
        <span class="icd-eyebrow">Cobertura local</span>
        <h2>Limpieza impecable, <em>Cobertura en Toda la Isla</em>.</h2>
      </div>
      <p>Explora los servicios de limpieza de <strong>Ilatek</strong> disponibles en los <strong>78 municipios de Puerto Rico</strong> y visita la página de tu pueblo. Atendemos hogares en <strong>{{custom_values.county_name_and_state}}</strong> y toda la isla.</p>
    </header>`;
  const headerTo = `    <header class="icd-head">
      <div>
        <span class="icd-eyebrow">${cfg.eyebrow}</span>
        <h2>${cfg.titleHtml}</h2>
      </div>
      <p>${cfg.text}</p>
    </header>`;
  out = swap(out, headerFrom, headerTo, 'encabezado de cobertura');

  return out;
}

// Reviews: markup + su CSS + el script de tabs. Se reescribe el id del root y
// el copy genérico ("cuidado de sus hogares") por el del servicio de techos.
export function reviewsParts(rootId, cfg) {
  const src = read('servicios/alfombras/es/landing-pages/ghl-alfombras-landing.html');

  const styleMatch = src.match(/<style>\s*\/\* Utilidades compartidas[\s\S]*?<\/style>/);
  if (!styleMatch) throw new Error('No se encontró el CSS de reviews');
  const style = styleMatch[0];

  const sectionMatch = src.match(/<section id="ilatek-reviews"[\s\S]*?<\/section>/);
  if (!sectionMatch) throw new Error('No se encontró el markup de reviews');
  let markup = sectionMatch[0];
  markup = swap(markup, '<h2 id="ilatek-reviews-title" class="il-display">La experiencia de nuestros clientes.</h2>', `<h2 id="ilatek-reviews-title" class="il-display">${cfg.title}</h2>`, 'título de reviews');
  markup = swap(markup, '<p>Conoce las reseñas compartidas por personas que confiaron en Ilatek para el cuidado de sus hogares.</p>', `<p>${cfg.subtitle}</p>`, 'subtítulo de reviews');
  markup = swap(markup, 'title="Reseñas de Google de clientes de Ilatek"', `title="${cfg.googleTitle}"`, 'título del iframe de Google');
  markup = swap(markup, 'title="Reseñas de Limpieza de Ilatek"', `title="${cfg.selfieTitle}"`, 'título del iframe Selfie');
  // El tab del widget de limpieza se llama "Limpieza" (copy prohibido en el
  // sitio de techos sin contexto): el auditor lo rechaza. Se reetiqueta a
  // "Servicios", que es lo que muestra ese tab de reseñas.
  markup = swap(markup, '>Limpieza</button>', '>Servicios</button>', 'tab Limpieza de reviews');

  const tabsMatch = src.match(/<!-- Tabs de reviews[\s\S]*?<\/script>/);
  if (!tabsMatch) throw new Error('No se encontró el script de tabs de reviews');
  const tabs = tabsMatch[0]
    .replace(/ilatek-alfombras/g, rootId)
    .replace(/ilc2Tabs/g, 'iltTabs');

  return { style, markup, tabs };
}


// Img alt/title patch: cubre imágenes nativas de GHL y de widgets inyectados, que
// llegan sin alt. Rellena alt (y title) con el title del elemento, un encabezado
// cercano o el nombre del servicio; salta las decorativas.
export function imgAltTitlePatch() {
  const js = [
    '(function(){',
    'var d=document;',
    "function near(el){var n=el.closest('figure,article,section,div');var h=n&&n.querySelector('h1,h2,h3');return h?h.textContent.replace(/\\s+/g,' ').trim():''}",
    'function fix(){var imgs=d.images;for(var i=0;i<imgs.length;i++){var im=imgs[i];',
    "if(im.closest('[aria-hidden=\"true\"]')||im.closest('a[aria-label]'))continue;",
    "var alt=(im.getAttribute('alt')||'').trim(),title=(im.getAttribute('title')||'').trim();",
    "if(!alt){var s=title||near(im)||'Inspeccion, reparacion y sellado de techos en Puerto Rico - Ilatek Techos';alt=s.length>125?s.slice(0,122)+'...':s;im.setAttribute('alt',alt)}",
    "if(!title){var t=alt.length>60?alt.slice(0,57)+'...':alt;im.setAttribute('title',t)}}}",
    "if(d.readyState==='loading'){d.addEventListener('DOMContentLoaded',fix)}else{fix()}",
    "window.addEventListener('load',fix)})();",
  ].join('');
  return [
    '<!-- Img alt/title patch (cubre imagenes nativas de GHL y widgets): rellena alt + title -->',
    '<script>',
    js,
    '</script>',
  ].join('\n');
}
