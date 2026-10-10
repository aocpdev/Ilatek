// Ilatek · Techos · auditoría de contenido y schema.
// Único dueño de las REGLAS: qué copy está prohibido, qué requiere contexto de
// techo, qué campos exige el modelo y qué nodos JSON-LD/piezas SEO debe tener
// una landing. Lo consumen build-techos.mjs (antes de escribir) y verify-techos.mjs
// (sobre los archivos ya escritos), así la política no se duplica.

// Copy de limpieza de propiedades: NUNCA puede aparecer en una landing de techos.
import { hasGeo, hasRating } from './data/business.mjs';

export const FORBIDDEN = [
  /impecable/i,
  /servicios de limpieza/i,
  /limpieza (de|para) (casas?|hogares?|oficinas?|interiores?)/i,
  /cuidado de sus hogares/i,
  /\balfombras?\b/i,
  /\bmoqueta\b/i,
  /electrodom[ée]stic/i,
  /limpieza (residencial|comercial|industrial)\b/i,
];

// Páginas cuyo SERVICIO ES limpiar techos: ahí "limpieza" es del techo, no de la casa.
const CLEAN_WORD = /(limpieza|limpiar|limpiamos|limpiando|limpiador)/gi;
const ROOF_CONTEXT = /tech|techo|canaleta|canal[oó]n|desag[üu]e|superficie|losa|tragaluz|impermeab|sellado/i;

export const SCHEMA_TYPES = ['RoofingContractor', 'WebSite', 'WebPage', 'Service', 'BreadcrumbList', 'FAQPage'];

export function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

// Unidad de copy auditable: el propio elemento (título, párrafo, item, caption).
// El contexto de techo se exige DENTRO del elemento, no en los vecinos.
export function copyUnits(html) {
  const units = [...html.matchAll(/<(h[1-6]|li|p|figcaption|summary|dt|dd|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((m) => stripTags(m[2]).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  // alt text también es copy visible para lectores de pantalla
  [...html.matchAll(/\balt="([^"]*)"/gi)].forEach((m) => units.push(m[1]));
  return units;
}

export function cleanGuard(html) {
  // The global navigation/footer intentionally link both business lines.
  // Keep the strict roofing-only copy rule for the actual landing content.
  html=html.replace(/<!-- ILATEK:SHELL:(HEADER|FOOTER):START -->[\s\S]*?<!-- ILATEK:SHELL:\1:END -->/g,'');
  const errs = [];
  FORBIDDEN.forEach((re) => {
    const m = html.match(re);
    if (m) errs.push(`copy de limpieza prohibido: "${m[0]}"`);
  });
  copyUnits(html).forEach((unit) => {
    const rx = new RegExp(CLEAN_WORD.source, 'gi');
    let m;
    while ((m = rx.exec(unit))) {
      if (!ROOF_CONTEXT.test(unit)) errs.push(`"${m[0]}" sin contexto de techo en: "${unit.slice(0, 90)}"`);
    }
  });
  return errs;
}

// Ninguna <img> puede quedar sin alt: un alt vacío solo vale si la imagen
// está marcada como decorativa (aria-hidden o la pila del carrusel ilt3-shot).
export function imgAltErrors(html) {
  const errs = [];
  const DECO = /aria-hidden="true"|class="[^"]*\bilt3-shot\b/;
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  imgs.forEach((tag, i) => {
    const m = tag.match(/\balt\s*=\s*"([^"]*)"/);
    if (!m) errs.push('img #' + (i + 1) + ' sin alt');
    else if (m[1].trim() === '' && !DECO.test(tag)) errs.push('img #' + (i + 1) + ' alt vacío sin marcador decorativo');
  });
  return errs;
}

export const REQUIRED = ['slug', 'eyebrow', 'h1before', 'h1em', 'h1after', 'metaTitle', 'metaDescription',
  'hero', 'incl', 'heroSub', 'facts', 'benefits', 'benTitle', 'process', 'price', 'serviceName',
  'serviceDesc', 'incluye', 'extra', 'faq', 'breadcrumb'];

export function validateModel(p) {
  const errs = [];
  REQUIRED.forEach((k) => { if (!p[k]) errs.push(`falta ${k}`); });
  if (p.facts && p.facts.length !== 3) errs.push('facts != 3');
  if (p.benefits && p.benefits.length !== 3) errs.push('benefits != 3');
  if (p.incluye && (!p.incluye.checks || p.incluye.checks.length !== 6)) errs.push('incluye.checks != 6');
  if (p.process && (!p.process.title || !p.process.lead)) errs.push('process sin title/lead');
  if (p.price && !(p.price.amount != null && p.price.text && p.price.unitText)) errs.push('price incompleto');
  if (p.breadcrumb && p.breadcrumb.length < 2) errs.push('breadcrumb demasiado corto');
  if (p.faq) {
    if (p.faq.length < 8) errs.push('faq < 8');
    const seen = new Set();
    p.faq.forEach((f) => { if (seen.has(f.q)) errs.push(`FAQ duplicada: ${f.q}`); seen.add(f.q); });
  }
  if (p.extra && !p.extra.kids && (!p.extra.items || p.extra.items.length !== 3)) errs.push('extra requiere kids o 3 items');
  return errs;
}

// Analiza el JSON-LD de una landing ya generada. Devuelve { errors, graph, faq, types }.
export function readSchema(html) {
  const errors = [];
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1].trim());
  const types = [];
  let graph = null;
  let faq = null;
  blocks.forEach((b) => {
    try {
      const o = JSON.parse(b);
      if (o['@graph']) { graph = o['@graph']; o['@graph'].forEach((n) => types.push(n['@type'])); }
      else { types.push(o['@type']); if (o['@type'] === 'FAQPage') faq = o.mainEntity; }
    } catch (e) { errors.push('JSON-LD no parsea'); }
  });
  return { errors, graph, faq, types };
}

// Audit completo del HTML de una página contra su modelo.
export function auditHtml(page, html) {
  const errs = cleanGuard(html);
  errs.push(...imgAltErrors(html));
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) errs.push('h1 != 1');
  if (/href="#\//.test(html)) errs.push('href="#/"');
  if (/(?:href|src)="https:\/\/ilatekpr\.com/.test(html)) errs.push('URL hardcodeada en atributo');
  if (!/\{\{custom_values\.website_url\}\}/.test(html)) errs.push('sin tokens');
  if (!/ilatek-cobertura-dir/.test(html)) errs.push('sin cobertura');
  if (!/ilatek-reviews/.test(html)) errs.push('sin reviews');
  if (/\[confirmar|\bTODO:|FIXME\b|lorem ipsum/i.test(stripTags(html))) errs.push('placeholder visible');

  const visible = stripTags(html);
  if (!visible.toLowerCase().includes(page.price.text.toLowerCase())) errs.push(`precio visible "${page.price.text}" no aparece en el texto`);

  const { errors: schErrs, graph, faq, types } = readSchema(html);
  errs.push(...schErrs);

  SCHEMA_TYPES.forEach((t) => { if (!types.includes(t)) errs.push(`falta nodo ${t}`); });

  const node = (t) => (graph || []).find((n) => n['@type'] === t);
  const svc = node('Service');
  if (svc && (!svc.offers || String(svc.offers.price) !== String(page.price.amount))) errs.push('Service.offers.price != precio visible');
  const biz = node('RoofingContractor');
  if (biz && (!biz.makesOffer || !biz.makesOffer[0] || String(biz.makesOffer[0].price) !== String(page.price.amount))) errs.push('makesOffer.price != precio visible');
  const bc = node('BreadcrumbList');
  if (bc && (!bc.itemListElement || bc.itemListElement.length !== page.breadcrumb.length)) errs.push('BreadcrumbList no coincide con la jerarquía');
  if (faq && faq.length !== page.faq.length) errs.push(`FAQPage ${faq.length} != FAQ visible ${page.faq.length}`);
  const wp = node('WebPage');
  if (wp) {
    if (!wp.datePublished || !wp.dateModified) errs.push('WebPage sin datePublished/dateModified');
    if (!wp.speakable || !wp.speakable.cssSelector) errs.push('WebPage sin speakable');
  }
  const svcImgs = svc && Array.isArray(svc.image) ? svc.image : [];
  if (!svcImgs.length || svcImgs.some((im) => im['@type'] !== 'ImageObject')) errs.push('Service sin ImageObject[]');
  if (biz && !biz.hasOfferCatalog) errs.push('RoofingContractor sin hasOfferCatalog');
  if (hasGeo() && (!biz.address || !biz.geo)) errs.push('business con geo pero schema sin address/geo');
  if (!hasGeo() && biz && biz.geo) errs.push('GeoCoordinates publicado sin datos reales');
  if (hasRating() && !biz.aggregateRating) errs.push('business con rating pero schema sin aggregateRating');
  if (!hasRating() && biz && biz.aggregateRating) errs.push('AggregateRating publicado sin datos reales');

  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  scripts.forEach((m, i) => {
    try { new Function(m[1]); } catch (e) { errs.push(`script #${i + 1}: ${e.message}`); }
  });
  return errs;
}
