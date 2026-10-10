// Ilatek · Techos · ensamblador de la landing completa.
// 1 H1 (hero) · H2 por sección · H3 en tarjetas/FAQ · Cobertura y Reviews verbatim.
import { pageCss } from './css.mjs';
import { shots } from './kit.mjs';
import { coberturaSection, reviewsParts, imgAltTitlePatch } from './parts.mjs';
import { bizSchema, faqSchema } from './schema.mjs';

const ICONS = {
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
  drop: '<path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  wallet: '<path d="M3 7h18v12H3z"/><path d="M3 11h18"/><circle cx="16" cy="13" r="1"/>',
  star: '<path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 3 1.2-6-4.5-4.2 6.1-.8z"/>',
};

function svg(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">${ICONS[name] || ICONS.check}</svg>`;
}

// Ancla de la sección de agenda: los CTA de cotización de la landing bajan al
// calendario embebido en vez de salir a /cotizacion (una sola ruta de conversión).
const AGENDA_ANCHOR = '#ilt-agenda';

// El respaldo onerror cae en el poster del sitio (jsDelivr, siempre vivo): las
// fotos del CDN de GHL devuelven 404 para varias tarjetas y el fallback anterior
// repetia ese 404, dejando tarjetas sin fondo.
// Pila de fotos de una tarjeta del carrusel: la primera visible y el resto listas
// para el fundido interno. Solo la primera lleva alt real; las demás son la misma
// foto en otro momento del fundido, así que van decorativas y marcadas aria-hidden
// para que el auditor las distinga de un alt olvidado.
function shotStack(cfg, list) {
  const alt = cfg.name + ' de Ilatek Techos en {{custom_values.county_name_and_state}}';
  return list
    .map((shot, i) => {
      const on = i === 0;
      return '<img class="ilt3-shot' + (on ? ' is-on' : '') + '"' + (on ? '' : ' aria-hidden="true"') +
        ' src="' + shot.webp + '" onerror="this.onerror=null;this.src=\'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/hero-poster-1280.webp\'" width="1376" height="768" loading="lazy" decoding="async" alt="' + (on ? alt : '') + '" title="' + cfg.name + ' · Ilatek Techos">';
    })
    .join('');
}

function img(f, opts) {
  return `<img src="${f.webp}" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/hero-poster-1280.webp'" width="${opts.w}" height="${opts.h}" loading="${opts.loading}" decoding="async"${opts.priority ? ' fetchpriority="high"' : ''} alt="${f.alt}" title="${f.title}">`;
}

export function buildPage(page) {
  const rootId = page.slug === 'techos' ? 'ilatek-techos' : 'ilatek-techos-' + page.slug;
  const cov = coberturaSection(coberturaCfg(page));
  const rev = reviewsParts(rootId, reviewsCfg(page));

  const parts = [];
  parts.push(`<!--
  ILATEK · Techos · Landing /${page.slug} (${page.role})
  Sección de techos de Ilatek: reparación y sellado de techos en Puerto Rico.
  1 H1 · H2 por sección · H3 en tarjetas/FAQ. Custom values (6) + resolver runtime con fallbacks reales.
  Cobertura y Reviews: bloques VERBATIM del home (78 municipios + tabs Google/Selfie).
  Canonical self-referencing /${page.slug}: ver Ilatek/techos/ghl-techos-head-seo.html (se pega en GHL Tracking Code HEADER).
-->`);
  parts.push(`<section id="${rootId}" aria-label="Ilatek ${page.eyebrow} {{custom_values.county_name_and_state}}"
  data-location-label="{{custom_values.county_name_and_state}}"
  data-business-email="{{custom_values.business__email}}"
  data-business-phone="{{custom_values.business__phone}}"
  data-website-url="{{custom_values.website_url}}"
  data-facebook-url="{{custom_values.facebook_url}}"
  data-instagram-url="{{custom_values.instagram_url}}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&family=Outfit:wght@500..800&display=swap">
  <style>${pageCss(rootId)}</style>`);

  parts.push(`  <main>
    <script>(function(){document.documentElement.classList.add('ilt-anim');setTimeout(function(){if(!window.__iltReady)document.documentElement.classList.remove('ilt-anim')},2500)})();</script>`);
  parts.push(heroSection(page));
  parts.push(benefitsSection(page));
  parts.push(incluyeSection(page));
  parts.push(page.directory ? directorySection(page) : extraSection(page));
  parts.push(processSection(page));
  parts.push('    <!-- 6. COBERTURA: sección idéntica al home (78 municipios, verbatim) -->');
  parts.push(cov);
  parts.push('    <!-- 7. REVIEWS: patrón del home (tabs Google/Selfie, verbatim) -->');
  parts.push(rev.style);
  parts.push(rev.markup);
  parts.push(faqSection(page));
  parts.push(ctaSection(page));
  parts.push(calendarSection(page));
  parts.push('  </main>');
  parts.push(resolverScript(rootId));
  parts.push(bizSchema(page));
  parts.push(faqSchema(page));
  parts.push(rev.tabs);
  parts.push(imgAltTitlePatch());
  parts.push('</section>');
  parts.push('');
  return parts.join('\n');
}

function heroSection(page) {
  const facts = page.facts
    .map((f) => `            <div><b><i>${f.b}</i> ${f.s}</b><span>${f.label}</span></div>`)
    .join('\n');
  return `    <!-- 1. HERO -->
    <header class="ilt-hero">
      <div class="ilt-shell ilt-hero-grid">
        <div class="ilt-hero-copy ilt-reveal">
          <span class="ilt-eyebrow">${page.eyebrow}</span>
          <h1 class="ilt-display">${(page.h1before + ' <em>' + page.h1em + '</em> ' + page.h1after).replace(/\s+([.,;:!?])/g, '$1')}</h1>
          <p class="ilt-hero-sub">${page.heroSub}</p>
          <div class="ilt-hero-actions">
            <a class="ilt-button" href="${AGENDA_ANCHOR}"><span>Solicita tu cotización</span><span aria-hidden="true">↗</span></a>
            <a class="ilt-text-link" href="#${page.slug === 'techos' ? 'ilatek-techos' : 'ilatek-techos-' + page.slug}-incluye">Qué incluye el servicio ↓</a>
          </div>
          <div class="ilt-hero-facts">
${facts}
          </div>
        </div>
        <figure class="ilt-hero-card ilt-reveal">
          ${img(page.hero, { w: 1200, h: 1320, loading: 'eager', priority: true })}
          <span class="ilt-hero-badge"><i></i>${page.hero.badge}</span>
        </figure>
      </div>
    </header>`;
}

function benefitsSection(page) {
  const cards = page.benefits
    .map(
      (b) => `          <article class="ilt-ben ilt-reveal">
            <i class="ilt-ben-ico" aria-hidden="true">${svg(b.icon)}</i>
            <h3>${b.h}</h3>
            <p>${b.p}</p>
          </article>`
    )
    .join('\n');
  return `    <!-- 2. BENEFICIOS -->
    <section class="ilt-benefits" aria-labelledby="ilt-ben-title">
      <div class="ilt-shell">
        <header class="ilt-reveal" style="max-width:690px;margin:0 auto;text-align:center"><span class="ilt-eyebrow">${page.benEyebrow}</span><h2 id="ilt-ben-title" class="ilt-display" style="margin:16px 0 0;font-size:clamp(36px,4vw,54px)">${page.benTitle}</h2></header>
        <div class="ilt-ben-grid">
${cards}
        </div>
      </div>
    </section>`;
}

function incluyeSection(page) {
  const checks = page.incluye.checks.map((c) => `            <li><i>✓</i> ${c}</li>`).join('\n');
  return `    <!-- 3. QUÉ INCLUYE -->
    <section class="ilt-incluye" id="${page.slug === 'techos' ? 'ilatek-techos' : 'ilatek-techos-' + page.slug}-incluye" aria-labelledby="ilt-incl-title">
      <div class="ilt-shell ilt-incl-grid">
        <div class="ilt-incl ilt-reveal">
          <span class="ilt-eyebrow">Qué incluye</span>
          <h2 id="ilt-incl-title" class="ilt-display">${page.incluye.title}</h2>
          <p class="ilt-incl-answer">${page.incluye.answer}</p>
          <ul class="ilt-checks">
${checks}
          </ul>
          <div class="ilt-hero-actions">
            <a class="ilt-button" href="${AGENDA_ANCHOR}"><span>${page.incluye.cta}</span><span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <figure class="ilt-media ilt-reveal">
          ${img(page.incl, { w: 1200, h: 900, loading: 'lazy' })}
          <figcaption>${page.incl.caption}</figcaption>
        </figure>
      </div>
    </section>`;
}

function extraSection(page) {
  const head = `        <header class="ilt-reveal" style="max-width:690px;margin:0 auto;text-align:center"><span class="ilt-eyebrow">${page.extra.eyebrow}</span><h2 id="ilt-extra-title" class="ilt-display" style="margin:16px 0 0;font-size:clamp(36px,4vw,54px)">${page.extra.title}</h2></header>`;

  if (page.extra.kids) {
    const kids = page.extra.kids
      .map(
        (k) => `          <a class="ilt-kid ilt-reveal" href="{{custom_values.website_url}}/${k.slug}">
            <h3>${k.name}</h3>
            <p>${k.desc}</p>
            <span>${k.cta || 'Ver servicio'}</span>
          </a>`
      )
      .join('\n');
    // El CTA de cotización baja al calendario; los demás conservan su slug.
    const ctaHref = page.extra.cta && page.extra.cta.slug === 'cotizacion'
      ? AGENDA_ANCHOR
      : `{{custom_values.website_url}}/${page.extra.cta ? page.extra.cta.slug : ''}`;
    const cta = page.extra.cta
      ? `\n        <div class="ilt-xcta ilt-reveal"><a class="ilt-button" href="${ctaHref}"><span>${page.extra.cta.label}</span><span aria-hidden="true">↗</span></a></div>`
      : '';
    return `    <!-- 4. SERVICIOS RELACIONADOS -->
    <section class="ilt-extra" aria-labelledby="ilt-extra-title">
      <div class="ilt-shell">
${head}
        <div class="ilt-kids">
${kids}
        </div>${cta}
      </div>
    </section>`;
  }

  const cards = page.extra.items
    .map(
      (it) => `          <article class="ilt-xcard ilt-reveal">
            ${it.tag ? `<span class="ilt-tag">${it.tag}</span>` : ''}
            <h3>${it.h}</h3>
            <p>${it.p}</p>
          </article>`
    )
    .join('\n');
  return `    <!-- 4. ${page.extra.eyebrow} -->
    <section class="ilt-extra" aria-labelledby="ilt-extra-title">
      <div class="ilt-shell">
${head}
        <div class="ilt-xgrid">
${cards}
        </div>
      </div>
    </section>`;
}

// El hub es la página principal: un carrusel 3D en caja de vidrio esmerilado con
// una tarjeta destacada (mantenimiento y tratamiento) + las 5 categorías. Cada
// tarjeta enlaza su landing y lista sus servicios (hijas) para no perder el
// enlazado interno del directorio anterior.
function directorySection(page) {
  const kidsBySlug = {};
  (page.directory || []).forEach((cat) => { kidsBySlug[cat.slug] = cat.children || []; });
  const cardsCfg = page.extra.cards || page.directory.map((c) => ({ slug: c.slug, name: c.name }));

  const cards = cardsCfg
    .map((cfg) => {
      // Una tarjeta que no es madre (la destacada) toma las hermanas de su categoria
      // desde el mismo arbol, para no repetir aqui la jerarquia del sitio.
      const kidsOf = kidsBySlug[cfg.slug] || (cfg.parent ? (kidsBySlug[cfg.parent] || []).filter((k) => k.slug !== cfg.slug) : []);
      const imgs = shots(cfg.slug, cfg.img, { hubWebp: cfg.hubWebp });
      const kids = kidsOf
        .map((c) => `<a href="{{custom_values.website_url}}/${c.slug}">${c.name}</a>`)
        .join('');
      const feat = (cfg.feat || [])
        .map((f) => `<li><i>✓</i><span>${f}</span></li>`)
        .join('');
      const subs = kids ? `<div class="ilt3-sub">${kids}</div>` : '';
      return `      <article class="ilt3-card" data-slug="${cfg.slug}"${cfg.featured ? ' data-featured="true"' : ''}>
        <div class="ilt3-media" data-shots="${imgs.length}">${shotStack(cfg, imgs)}<i class="ilt3-badge" aria-hidden="true">${svg(cfg.icon || 'check')}</i></div>
        <div class="ilt3-body">
          <div class="ilt3-head">
            <span class="ilt3-kicker">${cfg.kicker || 'Servicio'}</span>
            <h3 class="ilt3-title"><a href="{{custom_values.website_url}}/${cfg.slug}">${cfg.name}</a></h3>
            <p class="ilt3-desc">${cfg.desc || ''}</p>
          </div>
          <div class="ilt3-cols">
            <ul class="ilt3-feat">${feat}</ul>
            <div class="ilt3-side">
              ${subs}
            </div>
          </div>
          <a class="ilt3-btn" href="{{custom_values.website_url}}/${cfg.slug}"><span>${cfg.featured ? 'Ver servicio' : 'Ver categoría'}</span><span aria-hidden="true">↗</span></a>
        </div>
      </article>`;
    })
    .join('\n');

  const dots = cardsCfg
    .map((cfg) => `        <button type="button" class="ilt3-dot" aria-label="Ver ${cfg.name}"></button>`)
    .join('\n');

  return `    <!-- 4. CARRUSEL 3D DE CATEGORÍAS (hub: destacada + 5 categorías) -->
    <section class="ilt-extra ilt3-sec" aria-labelledby="ilt-extra-title">
      <div class="ilt-shell">
        <header class="ilt-reveal" style="max-width:690px;margin:0 auto;text-align:center"><span class="ilt-eyebrow">${page.extra.eyebrow}</span><h2 id="ilt-extra-title" class="ilt-display" style="margin:16px 0 0;font-size:clamp(36px,4vw,54px)">${page.extra.title}</h2>${page.extra.lead ? `<p style="margin:16px 0 0;color:var(--muted);font-size:16px;line-height:1.65">${page.extra.lead}</p>` : ''}</header>
        <div class="ilt3-box ilt-reveal">
          <div class="ilt3-stage" role="group" aria-roledescription="carrusel" aria-label="Categorías de techos de Ilatek">
${cards}
          </div>
          <div class="ilt3-dots">
${dots}
          </div>
          <p class="ilt3-hint">Haz clic en una tarjeta lateral para traerla al frente · usa ← → o desliza</p>
        </div>
      </div>
    </section>
${carouselScript()}`;
}

function processSection(page) {
  const cfg = page.process || {};
  const steps = (cfg.steps || defaultProcess(page)).map(
    (s, i) => `          <article class="ilt-reveal">
            <span>PASO ${i + 1}</span>
            <h3>${s.h}</h3>
            <p>${s.p}</p>
          </article>`
  ).join('\n');
  return `    <!-- 5. PROCESO -->
    <section class="ilt-process" aria-labelledby="ilt-proc-title">
      <div class="ilt-shell">
        <header class="ilt-proc-head ilt-reveal"><span class="ilt-eyebrow">Cómo funciona</span><h2 id="ilt-proc-title" class="ilt-display">${cfg.title}</h2><p>${cfg.lead}</p></header>
        <div class="ilt-proc-grid">
${steps}
        </div>
      </div>
    </section>`;
}

function defaultProcess(page) {
  return [
    { h: `Cotiza tu ${page.noun} gratis`, p: `Usa el cotizador de Ilatek o escríbenos: evaluamos tu techo y te damos el precio de ${page.noun} por escrito en minutos — sin compromiso.` },
    { h: 'Inspección y agenda', p: `Confirmamos el alcance de ${page.noun} con una inspección del techo, defines la fecha y reservas con el depósito de $50, que se descuenta del total.` },
    { h: 'Trabajo terminado', p: `Ejecutamos ${page.noun} con materiales certificados, protegemos el área y te entregamos la garantía por escrito.` },
  ];
}

// Cobertura y reviews son shared blocks: conservan su estructura y su script,
// pero su copy de encabezado/descripción se toma del servicio de cada landing.
function coberturaCfg(page) {
  return {
    slug: page.slug,
    label: page.noun,
    eyebrow: page.eyebrow,
    titleHtml: `Cobertura de <em>${page.eyebrow.toLowerCase()}</em> en toda la isla.`,
    text: `Ilatek Techos brinda ${page.noun} en los <strong>78 municipios de Puerto Rico</strong>. Atendemos tu área en <strong>{{custom_values.county_name_and_state}}</strong> y toda la isla: busca tu pueblo en el directorio y visita su página.`,
  };
}

function reviewsCfg(page) {
  return {
    title: 'Clientes que protegieron su techo con Ilatek.',
    subtitle: `Reseñas de personas que confiaron en Ilatek Techos para ${page.noun} en Puerto Rico.`,
    googleTitle: 'Reseñas de Google de clientes de Ilatek Techos',
    selfieTitle: 'Selfie reviews de clientes de Ilatek Techos',
  };
}

function faqSection(page) {
  const items = page.faq
    .map(
      (f) => `          <details class="ilt-faq-item"><summary><h3>${f.q}</h3><span class="ilt-chevron" aria-hidden="true">▾</span></summary><p>${f.a}</p></details>`
    )
    .join('\n');
  return `    <!-- 8. FAQ (preguntas reales de este servicio + FAQPage verbatim) -->
    <section class="ilt-faq" aria-labelledby="ilt-faq-title">
      <div class="ilt-shell">
        <header class="ilt-faq-head ilt-reveal"><span class="ilt-eyebrow">Preguntas frecuentes</span><h2 id="ilt-faq-title" class="ilt-display">${page.faqTitle}</h2></header>
        <div class="ilt-faq-list">
${items}
        </div>
      </div>
    </section>`;
}

// Cierre de la página: UNA sola acción + la información que orienta la decisión.
// Las tres razones se derivan del modelo (precio del servicio + política común),
// así cada landing hereda su propia ancla de precio sin copy duplicada.
function ctaSection(page) {
  const facts = [
    { icon: 'wallet', b: 'Precio claro por escrito', s: `${page.price.text}, confirmado después de la inspección.` },
    { icon: 'check', b: 'Inspección sin compromiso', s: 'Subimos, diagnosticamos y te explicamos las opciones.' },
    { icon: 'shield', b: 'Garantía de mano de obra', s: 'Respaldada por escrito en cada trabajo que hacemos.' },
  ]
    .map((f) => `          <li><i aria-hidden="true">${svg(f.icon)}</i><div><b>${f.b}</b><span>${f.s}</span></div></li>`)
    .join('\n');
  return `    <!-- 9. CTA de cierre: una acción principal con información que ayuda a decidir -->
    <section class="ilt-cta" aria-labelledby="ilt-cta-title">
      <div class="ilt-shell">
        <div class="ilt-cta-box ilt-reveal">
          <div class="ilt-cta-copy">
            <span class="ilt-cta-eyebrow">Cotización gratis</span>
            <h2 id="ilt-cta-title" class="ilt-display">${page.ctaTitle}</h2>
            <p>${page.ctaText}</p>
            <div class="ilt-cta-actions">
              <a class="ilt-button" href="${AGENDA_ANCHOR}"><span>Solicita tu cotización gratis</span><span aria-hidden="true">↗</span></a>
              <small>Respuesta en minutos · Sin compromiso</small>
            </div>
          </div>
          <ul class="ilt-cta-facts">
${facts}
          </ul>
        </div>
      </div>
    </section>`;
}

// Sección 10: calendario de reservas de GoHighLevel embebido. El iframe lo
// reconoce el iframe-resizer de GHL (form_embed.js) porque su src incluye
// "/booking"; el script es externo, así que no lo audita el guard de <script>
// inline. Mismo bloque en las 34 landings, con las custom values resueltas en
// runtime por el resolver.
function calendarSection() {
  return `    <!-- 10. AGENDA: calendario de reservas de GHL embebido -->
    <section class="ilt-cal" id="ilt-agenda" aria-labelledby="ilt-cal-title">
      <div class="ilt-shell">
        <header class="ilt-cal-head ilt-reveal">
          <span class="ilt-eyebrow">Agenda tu inspección</span>
          <h2 id="ilt-cal-title" class="ilt-display">Reserva tu inspección gratis en minutos.</h2>
          <p>Elige el día y la hora que te convengan. Atendemos {{custom_values.county_name_and_state}} y los 78 municipios de Puerto Rico.</p>
        </header>
        <div class="ilt-cal-box ilt-reveal">
          <div class="ilt-cal-embed">
            <iframe src="https://link.msgsndr.com/widget/booking/wM8KQhsYjEQAo0HbNGIh" allow="payment" scrolling="no" title="Agenda tu inspección de techos — Ilatek Techos" id="wM8KQhsYjEQAo0HbNGIh_1791075788803"></iframe>
          </div>
          <p class="ilt-cal-fallback">¿No carga el calendario? <a href="{{custom_values.website_url}}/cotizacion">Solicita tu cotización aquí</a>.</p>
        </div>
      </div>
      <script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>
      <!-- Los CTA de cotización bajan aquí con scroll suave (respeta reduce-motion) -->
      <script>(function(){var t=document.getElementById('ilt-agenda');if(!t)return;var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;document.addEventListener('click',function(e){var el=e.target;while(el&&el!==document){if(el.tagName==='A'&&el.getAttribute('href')==='#ilt-agenda'){e.preventDefault();t.scrollIntoView({behavior:rm?'auto':'smooth',block:'start'});return}el=el.parentNode}},false)})();</script>
    </section>`;
}

// Script autocontenido del carrusel del hub. Toma SU sección con
// document.currentScript para sobrevivir a id duplicado / múltiples inserciones.
// Desktop/tablet ancha: coverflow 3D (3 roles + bucle) animando transform/opacity.
// Mobile (<=820px): las 6 tarjetas se apilan en vertical (no hay carrusel): sin
// rotacion, sin autoplay, sin clics secuestrados y sin trabajo por frame. En ambos modos
// respeta prefers-reduced-motion, pausa en hover/focus/pestaña oculta/fuera de
// vista y ajusta la altura de la caja a la tarjeta más alta (solo en 3D).
function carouselScript() {
  return `  <!-- Carrusel 3D del hub (autocontenido, no depende del resolver) -->
  <script>
  (function(){
    var cs=document.currentScript, root=(cs&&cs.closest)?cs.closest('.ilt3-sec'):null;
    if(!root){var secs=document.querySelectorAll('.ilt3-sec');root=secs.length?secs[secs.length-1]:null}
    if(!root||root.dataset.ilt3Ready)return; root.dataset.ilt3Ready='true';
    var stage=root.querySelector('.ilt3-stage'); if(!stage)return;
    var cards=[].slice.call(stage.querySelectorAll('.ilt3-card'));
    if(cards.length<2)return;
    var dots=[].slice.call(root.querySelectorAll('.ilt3-dot'));
    var N=cards.length;
    var order=cards.map(function(_,i){return i});
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    /* Corte del coverflow 3D. Por debajo las 6 tarjetas se apilan en vertical: no hay
       carrusel que animar, solo la pagina desplazandose. */
    var mqFlat=window.matchMedia?window.matchMedia('(max-width:820px)'):null;
    function flat(){return !!(mqFlat&&mqFlat.matches)}
    var timer=null, paused=false, inView=true, rafSize=false;
    function apply(){
      if(flat()){cards.forEach(function(c){c.classList.remove('is-front','is-left','is-right','is-hidden');c.removeAttribute('aria-hidden')});return}
      cards.forEach(function(c,i){var p=order[i];c.classList.toggle('is-front',p===0);c.classList.toggle('is-left',p===N-1);c.classList.toggle('is-right',p===1);c.classList.toggle('is-hidden',p>1&&p<N-1);c.setAttribute('aria-hidden',p>1?'true':'false')});
      dots.forEach(function(d,k){var a=k===order.indexOf(0);d.classList.toggle('is-active',a);d.setAttribute('aria-current',a?'true':'false')});
    }
    function size(){if(flat()){stage.style.height='';cards.forEach(function(c){c.style.height=''});return}cards.forEach(function(c){c.style.height=''});var h=0;cards.forEach(function(c){if(c.offsetHeight>h)h=c.offsetHeight});if(!h)return;cards.forEach(function(c){c.style.height=h+'px'});stage.style.height=(h+40)+'px'}
    /* Programa fn en el proximo frame, con respaldo por timeout: algunos webviews y
       las pestanas en segundo plano pausan rAF, y el trabajo quedaria sin hacerse. */
    function soon(fn){var done=false,run=function(){if(done)return;done=true;fn()};if(window.requestAnimationFrame)requestAnimationFrame(run);setTimeout(run,32)}
    /* Lecturas de layout agrupadas en un frame: sin thrash al redimensionar. */
    function sizeSoon(){if(rafSize)return;rafSize=true;soon(function(){rafSize=false;size()})}
    function step(dir){if(flat())return;order=order.map(function(p){return(p+dir+N)%N});apply()}
    function stop(){if(timer){clearInterval(timer);timer=null}}
    function start(){if(flat()||reduce||timer||paused||!inView)return;timer=setInterval(function(){step(1)},4200)}
    function goto(i){if(i<0)i=N-1;if(i>=N)i=0;if(flat())return;var n=0;while(order.indexOf(0)!==i&&n<N){step(1);n++}}
    /* Cambio de modo (responsive en vivo): limpia el estado del otro modo. */
    function onMode(){if(flat()){stop();order=cards.map(function(_,i){return i});apply();size()}else{size();apply();start()}}
    apply();size();
    window.addEventListener('resize',sizeSoon,{passive:true});
    if(window.ResizeObserver){var ro=new ResizeObserver(sizeSoon);cards.forEach(function(c){ro.observe(c)})}
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(sizeSoon)['catch'](function(){})}
    window.addEventListener('load',sizeSoon);
    cards.forEach(function(c,i){
      /* En mobile la tarjeta NO se secuestra: el clic sigue su enlace normal. */
      c.addEventListener('click',function(e){if(flat()||order[i]===0)return;e.preventDefault();e.stopPropagation();goto(i);stop();paused=true;setTimeout(function(){paused=false;start()},6500)},true);
      c.addEventListener('keydown',function(e){if(flat()||(e.key!=='Enter'&&e.key!==' ')||order[i]===0)return;e.preventDefault();goto(i);stop();paused=true;setTimeout(function(){paused=false;start()},6500)});
      c.addEventListener('mouseenter',function(){if(flat())return;paused=true;stop()});
      c.addEventListener('mouseleave',function(){if(flat())return;paused=false;start()});
    });
    dots.forEach(function(d,k){d.addEventListener('click',function(){goto(k);stop();paused=true;setTimeout(function(){paused=false;start()},6500)})});
    stage.addEventListener('focusin',function(){paused=true;stop()});
    stage.addEventListener('focusout',function(e){if(!stage.contains(e.relatedTarget)){paused=false;start()}});
    root.addEventListener('keydown',function(e){if(flat())return;if(e.key==='ArrowLeft'){e.preventDefault();step(-1);stop()}else if(e.key==='ArrowRight'){e.preventDefault();step(1);stop()}});
    document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
    /* Swipe con el dedo SOLO en el coverflow: en mobile no hay carrusel que girar. */
    (function(){var sx=0,sy=0,tr=false;stage.addEventListener('pointerdown',function(e){if(flat())return;sx=e.clientX;sy=e.clientY;tr=true},{passive:true});window.addEventListener('pointerup',function(e){if(!tr)return;tr=false;var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4){step(dx<0?1:-1);stop();paused=true;setTimeout(function(){paused=false;start()},6500)}},{passive:true});window.addEventListener('pointercancel',function(){tr=false},{passive:true})})();
    if('IntersectionObserver' in window){new IntersectionObserver(function(en){en.forEach(function(x){inView=x.isIntersecting;inView?start():stop()})},{threshold:.15}).observe(stage)}else{inView=true}
    /* Fundido interno de fotos: solo la tarjeta activa (la del frente) releva su
       pila cada 5s. Las laterales y las ocultas se quedan en su primera foto, asi
       el fundido ocurre donde se mira y no en tarjetas que nadie ve. En la pila de
       mobile no hay tarjeta activa, asi que no hay marcha que correr; con
       prefers-reduced-motion la activa tambien se queda en su primera foto. */
    if(!reduce){
      var zz=2;
      setInterval(function(){
        var card=root.querySelector('.ilt3-card.is-front');
        var m=card?card.querySelector('.ilt3-media[data-shots]'):null;
        if(!m)return;
        var s=[].slice.call(m.querySelectorAll('.ilt3-shot'));
        if(s.length<2)return;
        var next=(s.indexOf(m.querySelector('.ilt3-shot.is-on'))+1)%s.length;
        s.forEach(function(x){x.classList.remove('is-on')});
        s[next].classList.add('is-on');
        s[next].style.zIndex=String(++zz);
      },5000);
    }
    if(mqFlat){var onMq=function(){onMode()};if(mqFlat.addEventListener)mqFlat.addEventListener('change',onMq);else if(mqFlat.addListener)mqFlat.addListener(onMq)}
    onMode();
  })();
  </script>`;
}

function resolverScript(rootId) {
  return `  <!-- Resolver custom values de respaldo (fallbacks reales, nunca '#') -->
  <script>
  (function(){
    var root=document.getElementById('${rootId}'); if(!root||root.dataset.iltReady)return; root.dataset.iltReady='true';
    function clean(v){v=String(v||'').replace(/\\u00a0/g,' ').trim();return /^\\s*\\{\\{[^}]+\\}\\}\\s*$/.test(v)?'':v}
    function token(name){return '{'+'{custom_values.'+name+'}'+'}'}
    var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.dataset.websiteUrl)||'https://ilatekpr.com', phone=clean(root.dataset.businessPhone), email=clean(root.dataset.businessEmail), fb=clean(root.dataset.facebookUrl)||'https://www.facebook.com/ilatek.pr/', ig=clean(root.dataset.instagramUrl)||'https://www.instagram.com/ilatek.pr/';
    var values={};
    values[token('county_name_and_state')]=county;
    values[token('website_url')]=website;
    values[token('business__phone')]=phone;
    values[token('business__email')]=email;
    values[token('facebook_url')]=fb;
    values[token('instagram_url')]=ig;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[],node;
    while(node=walker.nextNode()){if(node.parentElement&&node.parentElement.tagName!=='SCRIPT'&&node.parentElement.tagName!=='STYLE')nodes.push(node)}
    nodes.forEach(function(n){Object.keys(values).forEach(function(k){n.nodeValue=n.nodeValue.split(k).join(values[k])})});
    Array.prototype.forEach.call([root].concat([].slice.call(root.querySelectorAll('*'))),function(el){
      Array.prototype.forEach.call(el.attributes||[],function(a){
        var v=a.value;Object.keys(values).forEach(function(k){v=v.split(k).join(values[k])});
        if(v!==a.value)el.setAttribute(a.name,v);
      });
    });
    var els=[].slice.call(root.querySelectorAll('.ilt-reveal'));
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('is-visible');io.unobserve(en.target)}})},{threshold:.12});
      els.forEach(function(el){io.observe(el)});
    }else{els.forEach(function(el){el.classList.add('is-visible')})}
    window.addEventListener('load',function(){els.forEach(function(el){if(el.getBoundingClientRect().top<window.innerHeight)el.classList.add('is-visible')})});
    window.__iltReady=true;
  })();
  </script>`;
}
