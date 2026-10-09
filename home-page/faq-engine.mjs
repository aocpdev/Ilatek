// Ilatek · FAQ engine: el MECANISMO. Una sola lista por página genera el H3 visible
// y el JSON-LD FAQPage a la vez. No hay modo alternativo: todas las páginas pasan
// por aquí, así el H3 y el schema no pueden divergir.
//   node faq-engine.mjs emit   → escribe faq-source.mjs extrayendo el copy visible actual
//   node faq-engine.mjs build  → reescribe grid + schema desde faq-source.mjs y verifica
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractFaqs, checkHtml } from './faq-core.mjs';
import { VARIANTS, renderGrid, renderSchema } from './faq-render.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOME = `${HERE}`;
const DENTAL = process.env.DENTAL_FILE || 'C:/Users/Omele/Documents/LeadFlowSnap/seoflow/ghl-home-completo.html';

// Todas las páginas con FAQ visible. `variant` selecciona el markup de faq-render.
export const PAGES = [
  { id: 'home', file: `${HOME}/ghl-home-completo.html`, variant: 'ilfaq' },
  { id: 'home-opt', file: `${HOME}/ghl-home-completo-optimizado.html`, variant: 'ilfaq' },
  { id: 'faq-embed', file: `${HOME}/ghl-faq-embed.html`, variant: 'ilfaq' },
  { id: 'servicios', file: `${HOME}/ghl-servicios-landing.html`, variant: 'ilsx' },
  { id: 'airbnb', file: `${HOME}/ghl-airbnb-turnover-landing.html`, variant: 'ilc2' },
  { id: 'alfombras', file: `${HOME}/ghl-alfombras-landing.html`, variant: 'ilc2' },
  { id: 'electrodomesticos', file: `${HOME}/ghl-electrodomesticos-landing.html`, variant: 'ilc2' },
  { id: 'limpieza-comercial', file: `${HOME}/ghl-limpieza-comercial-landing.html`, variant: 'ilc2' },
  { id: 'limpieza-de-mudanza', file: `${HOME}/ghl-limpieza-de-mudanza-landing.html`, variant: 'ilc2' },
  { id: 'limpieza-estandar', file: `${HOME}/ghl-limpieza-estandar-landing.html`, variant: 'ilc2' },
  { id: 'limpieza-industrial', file: `${HOME}/ghl-limpieza-industrial-landing.html`, variant: 'ilc2' },
  { id: 'limpieza-profunda', file: `${HOME}/ghl-limpieza-profunda-landing.html`, variant: 'ilc2' },
  { id: 'limpieza-residencial', file: `${HOME}/ghl-limpieza-residencial-landing.html`, variant: 'ilr' },
  { id: 'organizacion', file: `${HOME}/ghl-organizacion-landing.html`, variant: 'ilc2' },
  { id: 'post-construccion', file: `${HOME}/ghl-post-construccion-landing.html`, variant: 'ilc2' },
  { id: 'ventanas', file: `${HOME}/ghl-ventanas-landing.html`, variant: 'ilc2' },
  { id: 'lavado', file: `${HOME}/ghl-lavado-a-presion-landing.html`, variant: 'ilc2' },
  { id: 'dental', file: DENTAL, variant: 'ilfaq' },
];

// Reescribe una página desde su lista: grid visible + JSON-LD.
export function transform(html, variant, faqs) {
  const v = VARIANTS[variant];
  return renderSchema(renderGrid(html, v, faqs), faqs);
}

function emit() {
  const data = {};
  for (const p of PAGES) {
    data[p.id] = extractFaqs(fs.readFileSync(p.file, 'utf8'), VARIANTS[p.variant].gridRe);
  }
  const content =
    '// GENERADO por `node faq-engine.mjs emit` desde el copy visible actual.\n' +
    '// Fuente única por página: esta lista genera el H3 visible Y el JSON-LD FAQPage.\n' +
    'export const FAQ_SOURCES = ' + JSON.stringify(data, null, 2) + ';\n';
  fs.writeFileSync(path.join(HERE, 'faq-source.mjs'), content, 'utf8');
  console.log(`✓ faq-source.mjs escrito (${Object.keys(data).length} páginas)`);
}

async function build() {
  const { FAQ_SOURCES } = await import('./faq-source.mjs');
  let failed = 0;
  for (const p of PAGES) {
    const faqs = FAQ_SOURCES[p.id];
    if (!faqs || !faqs.length) { failed++; console.error(`✗ ${p.id}: sin preguntas`); continue; }
    const out = transform(fs.readFileSync(p.file, 'utf8'), p.variant, faqs);
    fs.writeFileSync(p.file, out, 'utf8');
    const errs = checkHtml(out);
    if (errs.length) { failed++; console.error(`✗ ${p.id}: ${errs.join(' | ')}`); }
    else console.log(`✓ ${p.id}: ${faqs.length} preguntas (${p.variant})`);
  }
  console.log(failed ? `\nFallos: ${failed}` : '\n✓ FAQ sincronizado y verificado');
  if (failed) process.exitCode = 1;
}

// La interfaz (CLI) solo corre cuando se ejecuta el archivo, no al importarlo.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2];
  if (cmd === 'emit') emit();
  else if (cmd === 'build') build();
  else { console.log('uso: node faq-engine.mjs emit|build'); process.exitCode = 1; }
}
