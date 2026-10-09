// Ilatek · FAQ core: el MODELO, sin IO ni render.
// Único dueño de "qué es una pregunta/respuesta de FAQ" y de la regla de paridad:
// la pregunta del H3 visible y su respuesta deben coincidir con el FAQPage.
// Lo usan faq-engine.mjs (relleno) y faq-parity.mjs (comprobación).

const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', uuml: 'ü', ntilde: 'ñ', iquest: '¿', iexcl: '¡', hellip: '…', mdash: '—', ndash: '–', sup2: '²' };

export function decode(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n))
    .replace(/&([a-z]+|#39);/gi, (m, e) => (ENT[e] !== undefined ? ENT[e] : m));
}

// Texto plano visible de un fragmento de HTML.
export function text(html) {
  return decode(String(html).replace(/<[^>]*>/g, ' ')).replace(/[\u200b\u00a0]/g, ' ').replace(/[▾↗↓→▪]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Pregunta del H3, sin la insignia decorativa "?" de <i>?</i>.
export function question(html) {
  return text(html).replace(/^\?\s*/, '').trim();
}

// Comparación insensible a espacios: los tags se renderizan como espacios y el
// schema los quita, así que solo importa el TEXTO.
export const flat = (s) => String(s).replace(/\s+/g, '');

// Items de FAQ visibles en el orden del documento ({ q, a }), con o sin pregunta.
export function faqItems(html) {
  const out = [];
  for (const it of html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)) {
    const h = it[1].match(/<h3>([\s\S]*?)<\/h3>/);
    const p = it[1].match(/<p>([\s\S]*?)<\/p>/);
    if (!p) continue;
    out.push({ q: h ? question(h[1]) : null, a: text(p[1]) });
  }
  return out;
}

// Preguntas + respuestas del FAQPage (JSON-LD).
export function schemaFaqs(html) {
  const out = [];
  for (const b of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let o;
    try { o = JSON.parse(b[1]); } catch (e) { continue; }
    const stack = [o];
    while (stack.length) {
      const n = stack.pop();
      if (!n || typeof n !== 'object') continue;
      if (Array.isArray(n)) { stack.push(...n); continue; }
      if (n['@type'] === 'FAQPage' && Array.isArray(n.mainEntity)) {
        n.mainEntity.forEach((q) => out.push({ q: text(q.name || ''), a: text((q.acceptedAnswer || {}).text || '') }));
      }
      if (n['@graph']) stack.push(n['@graph']);
      if (n.mainEntity) stack.push(n.mainEntity);
    }
  }
  return out;
}

// Solo los items con pregunta (los que el schema debe espejar).
export const visibleFaqs = (html) => faqItems(html).filter((x) => x.q);

// Lista fuente de una página: { q, a } con `a` como HTML visible crudo (para
// regenerar el grid y derivar el `text` del schema). `gridRe` acota al grid FAQ.
export function extractFaqs(html, gridRe) {
  const g = gridRe ? html.match(gridRe) : null;
  const scope = g ? g[2] : html;
  const out = [];
  for (const it of scope.matchAll(/<details class="[^"]*faq-item"[^>]*>([\s\S]*?)<\/details>/g)) {
    const h = it[1].match(/<h3>([\s\S]*?)<\/h3>/);
    const p = it[1].match(/<p>([\s\S]*?)<\/p>/);
    if (!h || !p) continue;
    out.push({ q: question(h[1]), a: p[1].trim() });
  }
  return out;
}

// Regla de paridad. Devuelve [] cuando la página está correcta.
export function checkHtml(html) {
  const errs = [];
  for (const it of faqItems(html)) {
    if (!it.q) errs.push('item de FAQ sin pregunta (H3 ausente)');
  }
  const vis = visibleFaqs(html);
  const sch = schemaFaqs(html);
  if (vis.length && !sch.length) return [`FAQ visible sin FAQPage (${vis.length} preguntas)`];
  const schNames = sch.map((x) => flat(x.q));
  vis.forEach((v) => { if (!schNames.includes(flat(v.q))) errs.push(`H3 sin schema: "${v.q.slice(0, 70)}"`); });
  const visNames = vis.map((x) => flat(x.q));
  sch.forEach((s) => { if (!visNames.includes(flat(s.q))) errs.push(`schema sin H3: "${s.q.slice(0, 70)}"`); });
  vis.forEach((v) => {
    const s = sch.find((x) => flat(x.q) === flat(v.q));
    if (s && flat(s.a) !== flat(v.a)) errs.push(`respuesta divergente: "${v.q.slice(0, 70)}"`);
  });
  return errs;
}
