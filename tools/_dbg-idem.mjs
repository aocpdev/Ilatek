// Debug: ¿qué fase de formatPage introduce el CRLF?
import fs from 'node:fs';
import * as m from './internal-link-contract.mjs';

const f = 'home/es/landing-pages/ghl-home-multiservicios.html';
const src = fs.readFileSync(f, 'utf8');

const blockRE = /<!-- ILATEK:INTERNAL-LINKS:START -->[\s\S]*?<!-- ILATEK:INTERNAL-LINKS:END -->\s*/g;
let text = src.replace(blockRE, '');
text = m.normalizeTemplates(text);
text = m.localizeHtml ? m.localizeHtml(text) : text;
console.log('tras localize: CRLF?', text.includes('\r'));
text = text.replace(/<a\b[^>]*>/gi, (tag) => tag.replace(/x/, 'x')); // passthrough no toca
// La fase anchor con la implementación real no está exportada; emular con
// formatPage pero parando antes: correr formatPage sobre un subconjunto que
// solo contenga el <style> sospechoso:
const j = text.indexOf('<style>');
const probe = text.slice(j, j + 500);
const after = m.formatPage('<div>' + probe + '</div>', '/home');
console.log('solo el <style> a traves de formatPage: CRLF?', after.includes('\r'));
if (after.includes('\r')) {
  const i = after.indexOf('\r');
  console.log('alrededores:', JSON.stringify(after.slice(i - 60, i + 40)));
}
