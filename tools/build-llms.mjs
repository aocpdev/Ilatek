// Ilatek · genera llms.txt con la oferta real de techos primero.
// Solo publica cifras que estén en el registro de hechos con estado verificado.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './site-paths.mjs';
import { systemRows, verifiedValue } from '../techos/lib/facts.mjs';
import { moneyFaq, plainAnswer } from '../techos/lib/data/money-faq.mjs';

const SITE = 'https://ilatekpr.com';
const lines = [];
lines.push('# Ilatek Techos · Property Solutions');
lines.push('');
lines.push('> Ilatek Techos es la línea principal de Ilatek Property Solutions en Puerto Rico: sellado, impermeabilización, reparación y mantenimiento de techos en los 78 municipios. La limpieza residencial y comercial es una línea secundaria.');
lines.push('');
lines.push('## Techos');
lines.push('');
lines.push('- [Sellado de techos](https://ilatekpr.com/sellado-de-techos): cinco sistemas (silicona 100%, membrana asfáltica, elastomérico, poliuretano y acrílico), diagnóstico, preparación de superficie, aplicación y garantía escrita de mano de obra.');
lines.push('- [Impermeabilización de techos](https://ilatekpr.com/impermeabilizacion-de-techos): concreto, techos planos, zinc, asfalto, teja y madera.');
lines.push('- [Reparación de techos](https://ilatekpr.com/reparacion-de-techos): goteras, filtraciones, grietas, empozamiento y daños.');
lines.push('- [Inspección y mantenimiento](https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos): inspección, mantenimiento, limpieza de techos y canaletas.');
lines.push('- [Techos por segmento](https://ilatekpr.com/techos-por-segmento): residencial, comercial e industrial.');
lines.push('');
lines.push('## Precios base verificados');
lines.push('');
const desde = verifiedValue('precio-sellado-desde');
if (desde) lines.push(`- Sellado de techos: ${desde}.`);
for (const s of systemRows()) {
  if (s.price) lines.push(`- ${s.nombre}: ${s.price}.`);
}
lines.push('');
lines.push('Los precios son base por servicio y se confirman por escrito después de la inspección. No incluyen reparaciones estructurales ni trabajos adicionales.');
lines.push('');
lines.push('## Duración publicada por sistema');
lines.push('');
for (const s of systemRows()) {
  lines.push(s.duration
    ? `- ${s.nombre}: ${s.duration}.`
    : `- ${s.nombre}: duración pendiente de confirmación; no se publica una cifra.`);
}
lines.push('');
lines.push('## Preguntas frecuentes');
lines.push('');
for (const f of moneyFaq) {
  lines.push(`- ${f.q} ${plainAnswer(f.a)}`);
}
lines.push('');
lines.push('## Proceso y condiciones');
lines.push('');
const cobertura = verifiedValue('cobertura-municipios');
const deposito = verifiedValue('deposito-reserva');
const inspeccion = verifiedValue('inspeccion');
const horario = verifiedValue('horario');
const garantia = verifiedValue('garantia-escrita');
if (cobertura) lines.push(`- Cobertura: ${cobertura}.`);
if (inspeccion) lines.push(`- ${inspeccion}.`);
if (deposito) lines.push(`- Reserva: ${deposito}.`);
if (garantia) lines.push(`- Garantía: ${garantia}.`);
if (horario) lines.push(`- Horario: ${horario}.`);
lines.push('- Página de cotización: https://ilatekpr.com/cotizacion.');
lines.push('');
lines.push('## Límites de esta información');
lines.push('');
lines.push('No se publican años de operación, número de licencia DACO, póliza de responsabilidad, certificaciones de fabricante, plazo de garantía en años, cantidad de techos sellados, conteo o rating de reseñas, requisitos de permisos OGPe/DACO, tiempo de respuesta ni credenciales del responsable técnico hasta que el propietario los confirme. Este archivo no debe usarse para inferir esos datos.');
lines.push('');
lines.push('## Páginas principales');
lines.push('');
lines.push('- [Inicio](https://ilatekpr.com/home)');
lines.push('- [Garantías](https://ilatekpr.com/garantia)');
lines.push('- [Reseñas](https://ilatekpr.com/resenas)');
lines.push('- [Política de privacidad](https://ilatekpr.com/politica-de-privacidad)');
lines.push('- [Términos y condiciones](https://ilatekpr.com/terminos-y-condiciones)');
lines.push('');
lines.push('## Limpieza (línea secundaria)');
lines.push('');
lines.push('- [Servicios de limpieza](https://ilatekpr.com/servicios): residencial, comercial e industrial.');
lines.push('- [Limpieza estándar](https://ilatekpr.com/limpieza-estandar): precio por servicio.');
lines.push('- [Limpieza profunda](https://ilatekpr.com/limpieza-profunda): precio por servicio.');
lines.push('- [Cotizador](https://ilatekpr.com/cotizacion): precio en minutos y reserva con depósito de $50 descontable.');
lines.push('');

// Blog: el índice completo va en /blog/llms.txt; el archivo raíz enlaza los
// hubs y el índice para no convertirlo en una lista de 118 URLs.
const blogIndexPath = path.join(ROOT, 'blog/indice.json');
let blogPages = [];
if (fs.existsSync(blogIndexPath)) {
  try { blogPages = JSON.parse(fs.readFileSync(blogIndexPath, 'utf8')).paginas || []; } catch { /* índice aún no generado */ }
}
const md = (s = '') => String(s).replace(/\s+/g, ' ').trim().replace(/\[/g, '(').replace(/\]/g, ')');
const blogLine = (p) => `- [${md(p.title)}](${SITE}${p.path}): ${md(p.description)}`;

if (blogPages.length) {
  const hubs = blogPages.filter(p => p.grupo === 'indice');
  const comparativas = blogPages.filter(p => p.grupo !== 'indice' && p.grupo !== 'faq' && p.grupo !== 'puente');
  const faqClusters = blogPages.filter(p => p.grupo === 'faq');
  const puentes = blogPages.filter(p => p.grupo === 'puente');

  lines.push('## Blog');
  lines.push('');
  for (const p of hubs) lines.push(blogLine(p));
  lines.push(`- [Índice completo del blog para asistentes](${SITE}/blog/llms.txt): ${blogPages.length} páginas con título y descripción, agrupadas por comparativas, preguntas frecuentes y comunidades.`);
  lines.push('');

  const blogLines = [
    '# Blog Ilatek · Sellado de techos en Puerto Rico',
    '',
    `> ${blogPages.length} páginas de comparativas, preguntas frecuentes y servicios de sellado de techos en Puerto Rico. Precios publicados, fuente y fecha de verificación.`,
    '',
    '## Índices',
    '',
    ...hubs.map(blogLine),
    '',
    `## Comparativas (${comparativas.length})`,
    '',
    ...comparativas.map(blogLine),
    '',
    `## Preguntas frecuentes (${faqClusters.length})`,
    '',
    ...faqClusters.map(blogLine),
    '',
    `## Comunidades y servicios (${puentes.length})`,
    '',
    ...puentes.map(blogLine),
    '',
    '## Nota',
    '',
    'Las URLs de este índice se publican cuando las páginas existan en el host. Los precios son los publicados por cada empresa y se confirman en la inspección; este archivo no sustituye una cotización.'
  ];
  fs.writeFileSync(path.join(ROOT, 'blog/llms.txt'), blogLines.join('\n') + '\n', 'utf8');
}

fs.writeFileSync(path.join(ROOT, 'llms.txt'), lines.join('\n'), 'utf8');
console.log(`llms.txt: ${lines.length} líneas, techos primero, ${systemRows().filter((s) => s.price).length} precios de sistema verificados${blogPages.length ? `, ${blogPages.length} páginas de blog enlazadas` : ''}`);
