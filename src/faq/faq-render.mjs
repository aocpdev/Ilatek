// Ilatek · FAQ render: la PRESENTACIÓN. Convierte una lista {q, a} en (1) el grid
// de <details> visibles y (2) el bloque JSON-LD FAQPage. No lee ni escribe archivos.
// `q` es la pregunta en texto; `a` es el HTML visible de la respuesta (fuente de verdad).

// Una variante por familia de markup. Los nombres de clase no son uniformes entre
// familias (ilfaq-item vs ilsx-faq-item), por eso se declaran explícitos.
export const VARIANTS = {
  ilfaq: { gridRe: /(<div class="ilfaq-grid[^"]*">)([\s\S]*?)(\n[ \t]*<\/div>)/, item: 'ilfaq-item', chevron: 'ilfaq-chevron', indent: '      ', summaryIndent: '        ', blank: true, glyph: true, openFirst: true, single: false },
  ilsx: { gridRe: /(<div class="ilsx-faq-grid[^"]*">)([\s\S]*?)(\n[ \t]*<\/div>)/, item: 'ilsx-faq-item', chevron: 'ilsx-faq-chevron', indent: '          ', summaryIndent: '            ', blank: false, glyph: true, openFirst: true, single: false },
  ilc2: { gridRe: /(<div class="ilc2-faq-list">)([\s\S]*?)(\n[ \t]*<\/div>)/, item: 'ilc2-faq-item', chevron: 'ilc2-chevron', indent: '          ', summaryIndent: '          ', blank: false, glyph: false, openFirst: false, single: true },
  ilr: { gridRe: /(<div class="ilr-faq-list">)([\s\S]*?)(\n[ \t]*<\/div>)/, item: 'ilr-faq-item', chevron: 'ilr-chevron', indent: '          ', summaryIndent: '          ', blank: false, glyph: false, openFirst: false, single: true },
};

// Item de FAQ. El markup debe reproducir byte a byte el existente.
export function renderItem(f, v, first, indent) {
  const open = first && v.openFirst ? ' open' : '';
  const q = v.glyph ? `<i>?</i>${f.q}` : f.q;
  const inner = v.single ? indent : indent + '  ';
  if (v.single) {
    return `${indent}<details class="${v.item}"${open}><summary><h3>${q}</h3><span class="${v.chevron}" aria-hidden="true">▾</span></summary><p>${f.a}</p></details>`;
  }
  return `${indent}<details class="${v.item}"${open}>\n` +
    `${inner}<summary><h3>${q}</h3><span class="${v.chevron}" aria-hidden="true">▾</span></summary>\n` +
    `${inner}<p>${f.a}</p>\n` +
    `${indent}</details>`;
}

// Reemplaza el grid visible completo usando la lista. Se conserva la sangría por
// ÍNDICE de cada <details> original (el markup puede estar anidado a distinta
// profundidad o tener sangrías mixtas), para que el resultado sea byte a byte igual.
export function renderGrid(html, v, faqs) {
  const g = html.match(v.gridRe);
  if (!g) throw new Error(`no encontré el grid FAQ (${v.item})`);
  const indents = [...g[2].matchAll(/\n([ \t]*)<details/g)].map((m) => m[1]);
  const body = faqs
    .map((f, i) => renderItem(f, v, i === 0, indents[i] ?? indents[0] ?? v.indent))
    .join(v.blank ? '\n\n' : '\n');
  return html.replace(v.gridRe, (_m, openTag, _inner, close) => `${openTag}\n${body}${close}`);
}

// Reemplaza el bloque JSON-LD FAQPage conservando sus claves extra (@id, inLanguage…).
export function renderSchema(html, faqs) {
  let changed = false;
  const out = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (m, inner) => {
    if (!/"@type"\s*:\s*"FAQPage"/.test(inner)) return m;
    changed = true;
    return `<script type="application/ld+json">${buildSchemaInner(faqs, inner)}</script>`;
  });
  if (!changed) throw new Error('no encontré el bloque JSON-LD FAQPage');
  return out;
}

function buildSchemaInner(faqs, originalInner) {
  const baseIndent = (originalInner.match(/\n([ \t]*)\{/) || [, '  '])[1];
  const qIndent = (originalInner.match(/\n([ \t]*){"@type":"Question"/) || [, baseIndent + '  '])[1];
  let obj = {};
  try { obj = JSON.parse(originalInner.slice(originalInner.indexOf('{'), originalInner.lastIndexOf('}') + 1)); } catch (e) { obj = {}; }
  let header = '{"@context":"https://schema.org","@type":"FAQPage"';
  for (const k of Object.keys(obj)) {
    if (['@context', '@type', 'mainEntity'].includes(k)) continue;
    header += ',' + JSON.stringify(k) + ':' + JSON.stringify(obj[k]);
  }
  header += ',"mainEntity":[';
  const qs = faqs.map((f) => qIndent + JSON.stringify({
    '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
  }));
  return `\n${baseIndent}${header}\n${qs.join(',\n')}\n${baseIndent}]}\n${baseIndent}`;
}

// Texto plano del HTML de la respuesta (quita tags y decodifica entidades) usando
// el mismo modelo que faq-core para que la respuesta sea idéntica a la visible.
import { text as coreText } from './faq-core.mjs';
const plain = (html) => coreText(html);
