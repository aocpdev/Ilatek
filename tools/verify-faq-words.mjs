// Ilatek · verifica la forma del FAQ visible de la página money:
//   · entre 15 y 25 preguntas (el cluster necesita cobertura comercial real)
//   · cada respuesta de 40–60 palabras contadas sobre el texto visible
//   · exactamente UN enlace contextual, al final de la respuesta
// Falla si una respuesta se alarga, se queda corta o acumula enlaces.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, pageFile } from './site-paths.mjs';

const file = path.join(ROOT, pageFile('sellado-de-techos'));
const html = fs.readFileSync(file, 'utf8');
const items = [...html.matchAll(/<details class="ilt-faq-item">([\s\S]*?)<\/details>/g)].map((m) => m[1]);

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const errors = [];

if (items.length < 15 || items.length > 25) {
  errors.push(`FAQ visible: ${items.length} preguntas (se esperan 15–25)`);
}

items.forEach((item, i) => {
  const q = strip((item.match(/<summary>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || '');
  const answer = (item.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || '';
  const words = strip(answer).split(' ').filter(Boolean).length;
  const links = (answer.match(/<a\b/g) || []).length;
  if (words < 40 || words > 60) errors.push(`FAQ ${i + 1} (${q.slice(0, 48)}): ${words} palabras (40–60)`);
  if (links !== 1) errors.push(`FAQ ${i + 1} (${q.slice(0, 48)}): ${links} enlaces (se espera 1)`);
  if (links === 1 && !/<\/a>\.?\s*$/.test(answer)) {
    errors.push(`FAQ ${i + 1} (${q.slice(0, 48)}): el enlace no está al final de la respuesta`);
  }
});

if (errors.length) {
  console.error('✗ FAQ de la página money');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✓ FAQ money: ${items.length} preguntas, todas de 40–60 palabras con un enlace contextual al final`);
