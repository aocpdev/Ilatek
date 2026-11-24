// Plantilla HTML de las dos landings de la comunidad (sellado de techo y
// limpieza): head SEO, hero de imagen con panel de vidrio, tarjetas de servicio,
// banda de CTA intermedia, FAQ y cierre de reserva. Sin nav ni breadcrumb: la
// página arranca en el hero con la tarjeta.
//
// El movimiento es progresivo: sin JavaScript todo se ve; con JavaScript los
// bloques .reveal entran escalonados y se respeta prefers-reduced-motion, donde
// el CSS no aplica la animación.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MAIN_SITE, HERO_IMAGE, heroDe, heroUrl, FAVICON_FILE, TOUCH_ICON_FILE } from './config.mjs';
import { schemaFor } from './schema.mjs';

// Gobernanza de indexabilidad: una landing de comunidad solo es indexable si
// tiene al menos 2 facts locales verificados para su municipio/comunidad/servicio.
// Sin facts confirmados, noindex,follow. El registro vive en
// Comunidades/data/facts-locales.json y lo comparte tools/apply-community-indexability.mjs.
const FACTS_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data/facts-locales.json');
let LOCAL_FACTS = { communities: {} };
try { LOCAL_FACTS = JSON.parse(fs.readFileSync(FACTS_PATH, 'utf8')); } catch { /* todo noindex */ }
function robotsFor(r, c) {
  const key = `${r.municipalitySlug}/${r.slug}/${c.T ? 'sellado-de-techo' : 'limpieza'}`;
  const list = LOCAL_FACTS.communities && LOCAL_FACTS.communities[key];
  const verified = Array.isArray(list)
    ? list.filter(f => f && f.estado === 'verificado' && f.valor !== null && f.valor !== '').length
    : 0;
  return verified >= 2 ? 'index, follow' : 'noindex, follow';
}

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ctaHtml = c =>
  `<a class="cta" href="${esc(c.href)}">${esc(c.text)}<span aria-hidden="true">→</span></a>`;

// El pie se resuelve en la generación: esto es HTML estático en otro host, sin
// GHL que sustituya merge tokens, así que {{right_now.year}} nunca puede quedar
// escrito en la página. El año se congela al generar y se actualiza al regenerar.
const BUILD_YEAR = new Date().getFullYear();
// Logo circular servido desde el propio subdominio (<img> en landings/img/).
const LOGO = '../../../img/ilatek-logo-circle-512.png';
// Iconos ligeros (32 px y 180 px) generados desde ese mismo logo.
const FAVICON = `../../../img/${FAVICON_FILE}`;
const TOUCH_ICON = `../../../img/${TOUCH_ICON_FILE}`;

// Destinos reales tomados del footer compartido (ghl-footer-embed.html), no
// inventados aquí. Los iconos son SVG inline para no añadir hosts ni assets.
const SOCIAL = [
  { name: 'Facebook', href: 'https://www.facebook.com/ilatek.pr/', icon: '<path d="M14.5 8.5h-2v7h-3v-7H8v-2.6h1.5V4.6C9.5 3.1 10.3 2 12.2 2h2.3v2.6h-1.4c-.6 0-.9.3-.9.9v1.4h2.4z"/>' },
  { name: 'Instagram', href: 'https://www.instagram.com/ilatek.pr/', icon: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/>' },
  { name: 'YouTube', href: 'https://www.youtube.com/@Ilatekpr', icon: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.4l5 2.6-5 2.6z" fill="currentColor" stroke="none"/>' },
];

function footer() {
  const social = SOCIAL.map(s =>
    `<a href="${s.href}" aria-label="${s.name}" target="_blank" rel="noopener nofollow"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">${s.icon}</svg></a>`).join('');
  return `  <footer class="site-footer">
    <div class="sf-inner">
      <a class="sf-brand" href="${MAIN_SITE}/" aria-label="Ilatek, inicio">
        <img src="${LOGO}" alt="Ilatek Property Solution" width="64" height="64" loading="lazy" decoding="async">
      </a>
      <div class="sf-social">${social}</div>
      <p class="sf-credit">© ${BUILD_YEAR}. Made with <svg class="sf-heart" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 20.3 4.6 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.6.6.6-.6a4.8 4.8 0 0 1 6.8 6.8z"/></svg><span class="sr-only">love</span> by <a href="https://devasks.com/" target="_blank" rel="noopener noreferrer">Devasks</a></p>
    </div>
  </footer>`;
}

// Observador de aparición. Marca <html class="js"> para que el CSS pueda
// esconder los bloques antes de revelarlos; sin soporte, los muestra ya.
const REVEAL = `<script>(function(){var d=document,r=d.documentElement;r.classList.add('js');var els=[].slice.call(d.querySelectorAll('.reveal'));if(!('IntersectionObserver'in window)){els.forEach(function(e){e.classList.add('in')});return}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.12});els.forEach(function(e){io.observe(e)})})();</script>`;

function head(r, c) {
  const robots = robotsFor(r, c);
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<meta name="keywords" content="${esc(c.keywords.join(', '))}">
<meta name="robots" content="${robots}">
<meta name="geo.region" content="PR">
<meta name="geo.placename" content="${esc(c.donde)}">
<link rel="canonical" href="${c.canonical}">
<link rel="icon" type="image/png" sizes="32x32" href="${FAVICON}">
<link rel="apple-touch-icon" sizes="180x180" href="${TOUCH_ICON}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(c.h1)}">
<meta property="og:description" content="${esc(c.desc)}">
<meta property="og:url" content="${c.canonical}">
<meta property="og:image" content="${heroUrl(r.municipalitySlug, r.slug, c.T ? 'techos' : 'limpieza')}">
<meta property="og:locale" content="es_PR">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Outfit:wght@600;800&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(schemaFor(r, c))}</script>
<link rel="stylesheet" href="../../../styles.css">
</head>
<body>`;
}

function hero(r, c, { lead, ctas }) {
  const media = heroDe(r.municipalitySlug, r.slug, c.T ? 'techos' : 'limpieza');
  return `  <section class="hero" aria-labelledby="h1">
    <img class="hero-media" src="${media}" alt="${esc(`${c.T ? 'Sellado de techos' : 'Limpieza residencial'} en ${r.name}, ${r.municipality}`)}" fetchpriority="high">
    <div class="hero-inner">
      <div class="hero-copy reveal">
        <p class="eyebrow">${esc(r.type || 'Comunidad residencial')} · ${esc(c.muni)}</p>
        <h1 id="h1">${esc(c.h1)}</h1>
        ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
        <div class="cta-row">${ctas}</div>
      </div>
    </div>
  </section>`;
}

function serviceGrid(r, c, title, subtitle) {
  // La tarjeta no es enlace: solo la foto lleva el enlace al servicio, para el
  // backlink desde este subdominio. El href queda en el markup (los crawlers lo
  // siguen) pero styles.css le aplica pointer-events:none: hacer clic en la
  // card no navega a ninguna parte. El alt combina servicio y comunidad para el
  // SEO local. El revelado va en el <li> y el hover en la tarjeta: así la
  // transición del revelado (que termina en transform:none) no pisa el hover.
  const items = c.services.map(([slug, name, text, image], i) =>
    `<li class="reveal" style="--i:${i % 4}"><article class="tile">
      <a class="tile-media" href="${MAIN_SITE}/${slug}"><img src="${esc(image)}" alt="${esc(`${name} en ${c.placeFull}`)}" width="800" height="500" loading="lazy" decoding="async"></a>
      <div class="tile-body"><strong>${esc(name)}</strong><span>${esc(text)}</span></div>
    </article></li>`).join('');
  return `  <section aria-labelledby="services-title">
    <div class="section-head reveal">
      <h2 id="services-title">${esc(title)}</h2>
      ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
    </div>
    <ul class="grid">${items}</ul>
  </section>`;
}

function faqBlock(r, c) {
  const rows = c.faqs.map(([q, a]) => `<details><summary><h3>${esc(q)}</h3></summary><p>${esc(a)}</p></details>`).join('');
  return `  <section class="faq" aria-labelledby="faq-title">
    <div class="section-head reveal">
      <h2 id="faq-title">Preguntas frecuentes sobre ${esc(r.name)}</h2>
    </div>
    ${rows}
  </section>`;
}

function band(ctas, title, text) {
  return `  <section class="band reveal" id="cotizar" aria-labelledby="band-title">
    <div>
      <h2 id="band-title">${esc(title)}</h2>
      <p>${esc(text)}</p>
    </div>
    <div class="cta-row">${ctas}</div>
  </section>`;
}

function close(r, ctas) {
  return `  <section class="final reveal" aria-labelledby="final-title">
    <h2 id="final-title">${esc(`Reserva tu servicio en ${r.name}`)}</h2>
    <p>${esc('Completa la cotización en línea y coordinamos la visita.')}</p>
    <div class="cta-row">${ctas}</div>
  </section>`;
}

export function renderPage(r, c) {
  const label = c.T ? 'Sellado de techos' : 'Limpieza';

  return `${head(r, c)}
<main>
${hero(r, c, {
    lead: c.T
      ? `Sellado e impermeabilización de techos para viviendas en ${c.donde}.`
      : `Limpieza residencial y profunda para viviendas en ${c.donde}.`,
    ctas: ctaHtml(c.cta),
  })}
${serviceGrid(r, c, `Servicios de ${label.toLowerCase()} para ${r.name}`, 'Elige el servicio que necesitas y solicita tu cotización.')}
${band(ctaHtml(c.cta), `Agenda ${label.toLowerCase()} en ${r.name}`, 'Completa la cotización y coordinamos la visita.')}
${faqBlock(r, c)}
${close(r, ctaHtml(c.cta))}
</main>
${footer()}
${REVEAL}
</body>
</html>
`;
}
