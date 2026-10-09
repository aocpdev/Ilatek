// Ilatek · Techos · QA de RENDERIZADO (se ejecuta con el skill browser-automation).
// Recorre las 34 landings servidas en http://127.0.0.1:4321 a 1440 y 390, y afirma
// sobre el DOM RENDERIZADO: encabezados/descripciones por servicio, cero copy de
// limpieza tras resolver tokens, JSON-LD parseable con Service/BreadcrumbList/Offer
// == precio visible (+ RoofingContractor/WebSite/FAQPage 1:1), cero errores de
// consola, cero requests fallidos locales y cero desborde horizontal.
//   node <skill>/browser.mjs http://127.0.0.1:4321/ghl-techos-landing.html --script Ilatek/techos/qa-render.mjs
import { buildTree } from './lib/model.mjs';

const BASE = 'http://127.0.0.1:4321';
const WIDTHS = [1440, 390];

// Reimplementación en cliente de la política de lib/audit.mjs.
const GUARD = `(() => {
  const FORBIDDEN = [/impecable/i, /servicios de limpieza/i, /limpieza (de|para) (casas?|hogares?|oficinas?|interiores?)/i, /cuidado de sus hogares/i, /\\balfombras?\\b/i, /\\bmoqueta\\b/i, /electrodom[ée]stic/i, /limpieza (residencial|comercial|industrial)\\b/i];
  const CLEAN_WORD = /(limpieza|limpiar|limpiamos|limpiando|limpiador)/gi;
  const ROOF_CONTEXT = /tech|techo|canaleta|canal[oó]n|desag[üu]e|superficie|losa|tragaluz|impermeab|sellado/i;
  const cleanErrs = [];
  const body = document.body.innerText;
  FORBIDDEN.forEach((re) => { const m = body.match(re); if (m) cleanErrs.push('prohibido: ' + m[0]); });
  const units = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,li,p,figcaption,summary,dt,dd,button')].map((el) => el.innerText.replace(/\\s+/g, ' ').trim()).filter(Boolean);
  [...document.images].forEach((im) => { if (im.alt) units.push(im.alt); });
  units.forEach((unit) => {
    const rx = new RegExp(CLEAN_WORD.source, 'gi'); let m;
    while ((m = rx.exec(unit))) { if (!ROOF_CONTEXT.test(unit)) cleanErrs.push('"' + m[0] + '" sin techo en: ' + unit.slice(0, 80)); }
  });
  return cleanErrs;
})()`;

function pageData(spec) {
  return `(() => {
    const out = {};
    out.overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth;
    const html = document.documentElement.outerHTML;
    out.unresolvedTokens = (document.body.innerText.match(/\\{\\{custom_values\\./g) || []).length;
    let attrTokens = 0;
    document.querySelectorAll('*').forEach((el) => [...el.attributes].forEach((a) => { if (a.value.includes('{{custom_values.')) attrTokens++; }));
    out.attrTokens = attrTokens;
    out.cleanErrs = ${GUARD};
    out.h1 = [...document.querySelectorAll('h1')].map((e) => e.innerText.trim());
    out.h2 = [...document.querySelectorAll('main h2')].map((e) => e.innerText.trim());
    out.bodyText = document.body.innerText.replace(/\\s+/g, ' ');
    out.faqVisible = document.querySelectorAll('details.ilt-faq-item').length;
    const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent);
    out.jsonBlocks = blocks.length;
    let graph = null, faq = null, parseErr = null, types = [];
    blocks.forEach((b) => {
      try {
        const o = JSON.parse(b);
        if (o['@graph']) { graph = o['@graph']; o['@graph'].forEach((n) => types.push(n['@type'])); }
        else { types.push(o['@type']); if (o['@type'] === 'FAQPage') faq = o.mainEntity; }
      } catch (e) { parseErr = e.message; }
    });
    out.parseErr = parseErr;
    out.types = types;
    const node = (t) => (graph || []).find((n) => n['@type'] === t);
    const svc = node('Service'), biz = node('RoofingContractor'), bc = node('BreadcrumbList');
    out.serviceName = svc && svc.name;
    out.serviceDesc = svc && svc.description;
    out.offer = svc && svc.offers ? { price: svc.offers.price, currency: svc.offers.priceCurrency, desc: svc.offers.description, itemOffered: svc.offers.itemOffered && svc.offers.itemOffered['@id'] } : null;
    out.makesOffer = biz && biz.makesOffer && biz.makesOffer[0] ? biz.makesOffer[0].price : null;
    out.providerId = svc && svc.provider && svc.provider['@id'];
    out.bizId = biz && biz['@id'];
    out.breadcrumb = bc && bc.itemListElement ? bc.itemListElement.map((i) => i.name) : null;
    out.faqPage = faq ? faq.length : 0;
    return out;
  })()`;
}

export default async function run(page) {
  const pages = buildTree();
  const rows = [];
  const fails = [];
  const externalFailures = new Set();

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const p of pages) {
      const slug = p.slug;
      const url = `${BASE}/ghl-${slug}-landing.html`;
      const consoleErrors = [];
      const failedLocal = [];
      const failedExternal = [];
      const onConsole = (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); };
      const onFailed = (r) => {
        const u = r.url();
        const line = `${u.slice(0, 90)} ${(r.failure() && r.failure().errorText) || ''}`;
        if (u.startsWith(BASE)) failedLocal.push(line);
        else { failedExternal.push(line); externalFailures.add(u.split('?')[0]); }
      };
      page.on('console', onConsole);
      page.on('requestfailed', onFailed);

      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(250); // resolver + reveal
      const d = await page.evaluate(pageData());

      page.off('console', onConsole);
      page.off('requestfailed', onFailed);

      const problems = [];
      // 1. tokens resueltos
      if (d.unresolvedTokens) problems.push(`tokens sin resolver: ${d.unresolvedTokens}`);
      if (d.attrTokens) problems.push(`tokens en atributos: ${d.attrTokens}`);
      // 2. copy de limpieza
      if (d.cleanErrs.length) problems.push(`limpieza: ${d.cleanErrs.slice(0, 2).join(' | ')}`);
      // 3. especificidad por servicio (texto que el modelo exige)
      // Comparación sin distinguir mayúsculas: los títulos van en text-transform:uppercase
      // y innerText devuelve el texto YA transformado por CSS.
      const low = d.bodyText.toLowerCase();
      const need = [p.eyebrow, p.benTitle, p.process.title, p.process.lead, `Cobertura de ${p.eyebrow.toLowerCase()} en toda la isla`];
      need.forEach((n) => {
        const text = String(n).replace(/<[^>]+>/g, '').toLowerCase();
        if (n && !low.includes(text)) problems.push(`falta texto por servicio: "${String(n).slice(0, 50)}"`);
      });
      // 4. jerarquía de un solo H1
      if (d.h1.length !== 1) problems.push(`h1 = ${d.h1.length}`);
      // 5. JSON-LD
      if (d.parseErr) problems.push(`JSON-LD no parsea: ${d.parseErr}`);
      ['RoofingContractor', 'WebSite', 'Service', 'BreadcrumbList', 'FAQPage'].forEach((t) => { if (!d.types.includes(t)) problems.push(`falta nodo ${t}`); });
      if (!d.offer) problems.push('Service sin Offer');
      else {
        if (String(d.offer.price) !== String(p.price.amount)) problems.push(`Offer.price ${d.offer.price} != ${p.price.amount}`);
        if (String(d.makesOffer) !== String(p.price.amount)) problems.push(`makesOffer.price ${d.makesOffer} != ${p.price.amount}`);
        if (!d.bodyText.toLowerCase().includes(String(p.price.text).toLowerCase())) problems.push(`precio visible "${p.price.text}" ausente`);
      }
      if (!d.serviceDesc) problems.push('Service sin description');
      // 6. breadcrumb
      if (!d.breadcrumb || d.breadcrumb.length !== p.breadcrumb.length) problems.push(`breadcrumb ${d.breadcrumb && d.breadcrumb.length} != ${p.breadcrumb.length}`);
      // 7. FAQPage 1:1
      if (d.faqPage !== d.faqVisible) problems.push(`FAQPage ${d.faqPage} != visible ${d.faqVisible}`);
      // 8. consola / red / overflow
      if (consoleErrors.length) problems.push(`console: ${consoleErrors[0]}`);
      if (failedLocal.length) problems.push(`request local fallida: ${failedLocal[0]}`);
      if (d.overflow > 1) problems.push(`overflow ${d.overflow}px`);

      const row = { slug, width, ok: problems.length === 0, problems };
      rows.push(row);
      if (problems.length) fails.push({ slug, width, problems });
    }
  }

  const pass = rows.filter((r) => r.ok).length;
  // Tabla por slug y ancho: "w1440/w390" = pasó / "—" = falló.
  const table = pages.map((p) => {
    const at = (w) => rows.find((r) => r.slug === p.slug && r.width === w);
    return {
      slug: p.slug,
      role: p.role,
      w1440: at(1440).ok ? 'pass' : 'fail',
      w390: at(390).ok ? 'pass' : 'fail',
      problems: [...at(1440).problems, ...at(390).problems],
    };
  });
  return {
    summary: {
      pages: pages.length,
      checks: rows.length,
      pass,
      fail: rows.length - pass,
      externalRequestsFailed: [...externalFailures].length,
      externalFailuresSample: [...externalFailures].slice(0, 5),
    },
    failures: fails,
    table,
  };
}
