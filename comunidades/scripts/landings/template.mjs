// Plantilla HTML de una landing: head SEO, hero de imagen completa, servicios, FAQ y CTA final.
// Dos variantes: página de servicio (sellado de techos / limpieza) y página de
// comunidad, que es la URL canónica de la comunidad y enlaza sus dos servicios.
import { COMMUNITY_SITE, MAIN_SITE, HERO_IMAGE } from './config.mjs';
import { schemaFor } from './schema.mjs';
import { STYLES } from './styles.mjs';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function head(r, c) {
  const heroAlt = `Vista de ${r.name}, ${r.municipality}, Puerto Rico`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<meta name="keywords" content="${esc(c.keywords.join(', '))}">
<meta name="robots" content="index, follow">
<meta name="geo.region" content="PR">
<meta name="geo.placename" content="${esc(`${r.name}, ${c.muni}`)}">
<link rel="canonical" href="${c.canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(c.h1)}">
<meta property="og:description" content="${esc(c.desc)}">
<meta property="og:url" content="${c.canonical}">
<meta property="og:image" content="${HERO_IMAGE}">
<meta property="og:locale" content="es_PR">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=Outfit:wght@600;800&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(schemaFor(r, c))}</script>
<style>
${STYLES}
</style>
</head>
<body>`;
}

export function renderPage(r, c) {
  const servicesHtml = c.services.map(([s, name, text]) =>
    `<li><a href="${MAIN_SITE}/${s}"><strong>${esc(name)}</strong><span>${esc(text)}</span></a></li>`).join('');
  const faqHtml = c.faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  const servicesTitle = c.T
    ? `Servicios de sellado de techos para ${r.name}`
    : `Servicios de limpieza para ${r.name}`;
  const crumbHtml = `<nav class="crumbs" aria-label="Ruta de navegación"><a href="${MAIN_SITE}/">Ilatek</a><span aria-hidden="true">/</span><a href="${esc(c.hubUrl)}">${esc(r.name)}</a><span aria-hidden="true">/</span><span aria-current="page">${c.T ? 'Sellado de techos' : 'Limpieza'}</span></nav>`;

  return `${head(r, c)}
<main>
  ${crumbHtml}
  <section class="hero" aria-labelledby="h1">
    <img class="hero-media" src="${HERO_IMAGE}" alt="${esc(`Vista de ${r.name}, ${r.municipality}, Puerto Rico`)}" fetchpriority="high">
    <div class="hero-copy">
      <h1 id="h1">${esc(c.h1)}</h1>
      <a class="cta" href="${esc(c.cta.href)}">${esc(c.cta.text)}</a>
    </div>
  </section>
  <section aria-labelledby="services-title">
    <h2 id="services-title">${esc(servicesTitle)}</h2>
    <ul class="svc">${servicesHtml}</ul>
  </section>
  <section aria-labelledby="faq-title">
    <h2 id="faq-title">Preguntas frecuentes sobre ${esc(r.name)}</h2>
    ${faqHtml}
  </section>
  <section class="final-cta" aria-label="Solicitar servicio">
    <a class="cta" href="${esc(c.cta.href)}">${esc(c.cta.text)}</a>
  </section>
  <p class="note">Información basada en fuentes públicas consultadas el ${esc(r.dateVerified)}. Los precios citados son referencias de anuncios y no tasaciones.</p>
</main>
</body>
</html>
`;
}

export function renderHub(r, c) {
  const servicesHtml = c.services.map(([s, name, text]) =>
    `<li><a href="${MAIN_SITE}/${s}"><strong>${esc(name)}</strong><span>${esc(text)}</span></a></li>`).join('');
  const faqHtml = c.faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  const hubHtml = c.hubLinks.map(l => `<a class="cta" href="${esc(l.href)}">${esc(l.text)}</a>`).join('');
  const source = String(r.sources || '').split(';').map(s => s.trim()).filter(Boolean)[0] || '';
  const crumbHtml = `<nav class="crumbs" aria-label="Ruta de navegación"><a href="${MAIN_SITE}/">Ilatek</a><span aria-hidden="true">/</span><span aria-current="page">${esc(r.name)}</span></nav>`;

  return `${head(r, c)}
<main>
  ${crumbHtml}
  <section class="hero" aria-labelledby="h1">
    <img class="hero-media" src="${HERO_IMAGE}" alt="${esc(`Vista de ${r.name}, ${r.municipality}, Puerto Rico`)}" fetchpriority="high">
    <div class="hero-copy">
      <h1 id="h1">${esc(c.h1)}</h1>
      <p class="lead">${esc(r.type || 'Comunidad residencial')} en ${esc(r.municipality)}, Puerto Rico. Elige el servicio que necesitas y cotiza en minutos.</p>
      <div class="cta-row">${hubHtml}</div>
    </div>
  </section>
  <section aria-labelledby="services-title">
    <h2 id="services-title">Servicios de Ilatek para ${esc(r.name)}</h2>
    <ul class="svc">${servicesHtml}</ul>
  </section>
  <section aria-labelledby="about-title">
    <h2 id="about-title">Sobre ${esc(r.name)}</h2>
    <p class="lead">${esc(r.evidence)}</p>
    <p class="note">Información basada en fuentes públicas consultadas el ${esc(r.dateVerified)}.${source ? ` <a href="${esc(source)}" rel="nofollow noopener" target="_blank">Ver la fuente</a>.` : ''}</p>
  </section>
  <section aria-labelledby="faq-title">
    <h2 id="faq-title">Preguntas frecuentes sobre ${esc(r.name)}</h2>
    ${faqHtml}
  </section>
  <section class="final-cta" aria-label="Solicitar servicio">
    <a class="cta" href="${esc(c.cta.href)}">${esc(c.cta.text)}</a>
    <a class="cta cta--alt" href="${esc(c.ctaLimpieza.href)}">${esc(c.ctaLimpieza.text)}</a>
  </section>
</main>
</body>
</html>
`;
}
