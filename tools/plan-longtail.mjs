// Ilatek · plan de long tail para el blog.
// Construye 2 preguntas por post (200 en total) usando SOLO:
//   · las 40 preguntas ya verificadas de blog/data/preguntas.json,
//   · los hechos verificados de documentacion/seo/hechos-sellado-2026-11-07.json.
// Nada de cifras nuevas: si un dato está pendiente, no se publica.
// Salida: blog/data/longtail.json (lo consume blog/build/build-blog.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = path.join(ROOT, 'blog');
const REGISTRY = JSON.parse(fs.readFileSync(path.join(ROOT, 'documentacion/seo/hechos-sellado-2026-11-07.json'), 'utf8'));
const POSTS = JSON.parse(fs.readFileSync(path.join(BLOG, 'data/posts.json'), 'utf8')).posts;
const PREGUNTAS = JSON.parse(fs.readFileSync(path.join(BLOG, 'data/preguntas.json'), 'utf8')).preguntas;

const verified = (id) => {
  const f = REGISTRY.hechos.find((h) => h.id === id);
  return f && f.estado === 'verificado' && f.valor ? f : null;
};
const value = (id) => (verified(id) || {}).valor || '';
const money = (txt) => {
  const m = String(txt).match(/\$\s*([\d.]+)/);
  return m ? Number(m[1]) : null;
};

const SYSTEMS = REGISTRY.sistemas.map((s) => ({
  id: s.id,
  nombre: s.nombre,
  precio: value(s.precioFact),
  precioNum: money(value(s.precioFact)),
  duracion: value(s.duracionFact) || null,
  mejor: s.mejorPara || '',
  tiempo: s.criterios?.tiempo?.estado === 'verificado' ? s.criterios.tiempo.valor : null,
}));

const RANGO = value('rango-publicado');
const GARANTIA = value('garantia-escrita');
const COBERTURA = value('cobertura');
const INSPECCION = value('inspeccion');
const DURACIONES = SYSTEMS.filter((s) => s.duracion)
  .map((s) => `${s.nombre.toLowerCase()} ${s.duracion}`).join(', ');
const TIEMPOS = SYSTEMS.filter((s) => s.tiempo)
  .map((s) => `${s.nombre.toLowerCase()} ${s.tiempo}`).join('; ');

const DISPONIBILIDAD = `La cobertura publicada es de ${COBERTURA} y la ${INSPECCION.toLowerCase()}.`;

// Sujeto en forma nominal para que cualquier plantilla lea bien:
// "Garantía de sellado de techo…" → "el sellado de techo".
function temaDe(p) {
  let t = String(p.h1 || p.titulo).split(':')[0].replace(/[¿?]/g, '').trim()
    .replace(/\s*\|\s*Ilatek.*$/i, '')
    .replace(/\s+en Puerto Rico$/i, '')
    .replace(/^cu[aá]nto\s+(cuesta|dura|tarda)\s+/i, '')
    .replace(/^cu[aá]ndo\s+/i, '')
    .replace(/^d[oó]nde\s+/i, '')
    .replace(/^por\s+qu[eé]\s+/i, '')
    .replace(/^qu[eé]\s+garant[ií]a\s+(debe\s+incluir\s+)?/i, '')
    .replace(/^garant[ií]a\s+de\s+/i, '')
    .replace(/^precio\s+(de|del)\s+/i, '')
    .replace(/^c[oó]mo\s+se\s+(sella|hace)\s+/i, '')
    .replace(/^sellar\s+/i, 'sellado de ')
    .replace(/^impermeabilizar\s+/i, 'impermeabilización de ')
    .replace(/^reparar\s+/i, 'reparación de ')
    .replace(/\s+/g, ' ').trim();
  t = t.charAt(0).toLowerCase() + t.slice(1);
  if (!/^(el|la|los|las)\b/.test(t)) t = 'el ' + t;
  return t
    .replace(/\bel el\b/g, 'el').replace(/\bel la\b/g, 'la')
    .replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al');
}

const TEMPLATES = {
  precio: (tema) => ({
    pregunta: `¿Cuánto cuesta ${tema} en Puerto Rico?`,
    respuesta: `El rango publicado entre las páginas de Ilatek es de ${RANGO}. Para ${tema} el precio final depende del área, del estado de la losa y del sistema elegido, así que conviene pedir la cotización por escrito con el precio por servicio, el número de manos y la garantía. ${DISPONIBILIDAD}`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
  duracion: (tema) => ({
    pregunta: `¿Cuánto dura ${tema}?`,
    respuesta: `Depende del sistema: ${DURACIONES}. La duración real depende más de la preparación que del producto, y por eso la inspección previa define si el techo admite un recubrimiento o necesita corrección de pendiente y remates antes de aplicar.`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
  garantia: (tema) => ({
    pregunta: `¿Qué garantía debe incluir ${tema}?`,
    /* La garantía se pide por escrito, no se improvisa. */
    respuesta: `La referencia publicada es: ${GARANTIA}. Para ${tema}, pide el documento antes de firmar y comprueba que nombre el área tratada, el sistema y los productos, el plazo, las exclusiones y quién responde legalmente. Una promesa verbal no sirve para reclamar una filtración.`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
  tiempo: (tema) => ({
    pregunta: `¿Cuánto tarda ${tema}?`,
    respuesta: `Los tiempos publicados por sistema son: ${TIEMPOS}. Son plazos de un techo residencial típico con preparación incluida; si hay que corregir pendiente, reponer tornillos o esperar una ventana seca, el trabajo se extiende y se avisa en la cotización.`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
  clima: (tema) => ({
    pregunta: `¿Se puede aplicar ${tema} con lluvia o con el techo mojado?`,
    respuesta: `No con garantía. La silicona exige superficie seca, el acrílico pierde adhesión en húmedo y la membrana asfáltica no se instala sobre agua; aplicar sobre humedad atrapa el agua y el problema vuelve en meses. Para ${tema} hay que esperar una ventana seca y confirmar que la losa drenó.`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
  mantenimiento: (tema) => ({
    pregunta: `¿Cada cuánto hay que revisar ${tema}?`,
    respuesta: `La recomendación publicada es una inspección anual y el repaso del acabado cuando el sistema lo pide. En ${tema} conviene revisar antes de la temporada de lluvias, limpiar los desagües y corregir cualquier grieta o remate abierto para que el mantenimiento no se convierta en un trabajo mayor.`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
  sustrato: (tema, s) => ({
    pregunta: `¿Qué sistema conviene para ${tema}?`,
    respuesta: `El sistema publicado para ese caso es ${s.nombre.toLowerCase()}: ${s.mejor.toLowerCase()}. ${s.duracion ? `Su duración publicada es de ${s.duracion}.` : ''} Antes de aplicarlo hay que corregir la causa —grietas, tornillos, traslapes o pendiente— porque ningún recubrimiento arregla un sustrato que sigue moviéndose o acumulando agua.`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
  revision: (tema) => ({
    pregunta: `¿Qué conviene revisar antes de ${tema.replace(/^el /, 'del ')}?`,
    respuesta: `Antes del trabajo se revisan pendiente y drenaje, grietas activas, remates, penetraciones y el estado del sellado anterior. Esa inspección define si el techo admite un recubrimiento o si primero hay que corregir la causa; la inspección publicada es sin compromiso y cubre ${COBERTURA}.`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
  comparar: (a, b) => ({
    pregunta: `¿Cuál conviene más: ${a} o ${b}?`,
    respuesta: `${a} y ${b} se comparan por sistema, precio publicado y respaldo escrito, no por el anuncio más fuerte. El rango publicado va de ${RANGO}, y las duraciones documentadas son ${DURACIONES}. La decisión depende de tu techo: sustrato, pendiente, tránsito y garantía que puedas exigir por escrito.`,
    fuente: 'https://ilatekpr.com/sellado-de-techos',
  }),
};

const tablaSistemas = () => ({
  caption: 'Precio y duración publicados por sistema. Se confirman en la inspección.',
  headers: ['Sistema', 'Precio desde', 'Duración publicada', 'Mejor para'],
  rows: SYSTEMS.map((s) => [s.nombre, s.precio.replace(/^desde\s/i, ''), s.duracion || 'Se confirma en la inspección', s.mejor]),
});
const tablaCostos = () => {
  const sizes = [800, 1200, 2000];
  return {
    caption: 'Costo de entrada por tamaño, calculado con el precio publicado por servicio.',
    headers: ['Sistema', ...sizes.map((n) => `${n.toLocaleString('en-US')} pie\u00b2`)],
    rows: SYSTEMS.filter((s) => s.precioNum).map((s) => [
      s.nombre,
      ...sizes.map((n) => 'desde $' + (s.precioNum * n).toLocaleString('en-US', { maximumFractionDigits: 0 })),
    ]),
  };
};
const tablaGarantia = () => ({
  caption: 'Qué debe decir la garantía antes de firmar.',
  headers: ['Documento', 'Qué debe incluir'],
  rows: [
    ['Área tratada', 'La superficie exacta y los pies cuadrados cubiertos.'],
    ['Sistema aplicado', 'Nombre del sistema, productos y número de manos.'],
    ['Plazo', 'Años por escrito; si no hay plazo, no es una garantía completa.'],
    ['Exclusiones', 'Qué anula la garantía y qué daños no cubre.'],
    ['Responsable', 'Quién firma y si cubre mano de obra o solo material.'],
    ['Reclamo', 'Cómo se reporta una filtración y en cuánto tiempo se responde.'],
  ],
});

const SUBSTRATO = {
  'metal-zinc': 'poliuretano', 'losa-cementicia': 'silicona-100', 'tpo-pvc': 'tpo-pvc',
  'membrana-asfaltica': 'membrana-asfaltica', 'membrana-liquida': 'elastomerico',
  'sistema-multicapa': 'silicona-100', 'acrilico-elastomerico': 'acrilico', 'poliuretano': 'poliuretano',
  'silicona-100': 'silicona-100',
};

function tiposPara(p) {
  const slug = p.slug;
  if (/garantia|licencia|permiso|seguro|condominio|junta|contratista/.test(slug)) return ['garantia', 'mantenimiento'];
  if (/lluvia|mojado|huracan|clima|calor|curado|olor/.test(slug)) return ['clima', 'duracion'];
  if (/tarda|tiempo|demora/.test(slug)) return ['tiempo', 'precio'];
  if (/cuanto-cuesta|precio|costo|mano-de-obra|varia/.test(slug)) return ['precio', 'duracion'];
  if (/zinc|teja|madera|asfalto|shingle|concreto|aluminio|terraza|paneles|aire|moho|empozamiento/.test(slug)) return ['sustrato', 'precio'];
  if (/mantenimiento|cada-cuantos/.test(slug)) return ['mantenimiento', 'duracion'];
  return ['precio', 'duracion'];
}

const normal = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?.,:;¡!]/g, ' ').replace(/\s+/g, ' ').trim();
const parecidas = (a, b) => {
  const A = new Set(normal(a).split(' '));
  const B = new Set(normal(b).split(' '));
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / Math.max(A.size, B.size);
};

const out = { generado: new Date().toISOString(), total: 0, posts: {} };
const vistas = new Set();
const vistasArr = [];
// Las curadas ya ocupan su texto: ninguna derivada puede repetirlas.
PREGUNTAS.forEach((q) => vistas.add(q.pregunta));
const yaVista = (q) => vistas.has(q) || vistasArr.some((v) => parecidas(v, q) >= 0.86);
let total = 0;

for (const p of POSTS) {
  const tema = temaDe(p);
  const [t1, t2] = tiposPara(p);
  const famId = p.familias[0];
  const sys = SYSTEMS.find((s) => SUBSTRATO[famId] === s.id) || SYSTEMS[0];
  const preguntas = [];

  const curada = PREGUNTAS.find((q) => q.post === p.slug);
  if (curada) preguntas.push({ pregunta: curada.pregunta, respuesta: curada.respuesta, fuente: curada.fuente });

  const vs = p.titulo.split(/\s+vs\.?\s+/i);
  const candidatas = vs.length === 2
    ? [TEMPLATES.comparar(vs[0].trim(), vs[1].replace(/\|.*/, '').trim()), TEMPLATES.garantia(tema), TEMPLATES.precio(tema)]
    : [TEMPLATES[t1](tema, sys), TEMPLATES[t2](tema, sys), TEMPLATES.garantia(tema)];

  for (const c of candidatas) {
    if (preguntas.length >= 2) break;
    // Evita repetir en otra forma la misma pregunta (en este post o en otro).
    if (preguntas.some((q) => parecidas(q.pregunta, c.pregunta) > 0.72)) continue;
    if (yaVista(c.pregunta)) continue;
    preguntas.push(c);
  }
  for (const key of ['precio', 'duracion', 'garantia', 'mantenimiento', 'clima', 'tiempo', 'sustrato', 'revision']) {
    if (preguntas.length >= 2) break;
    const c = TEMPLATES[key](tema, sys);
    if (!yaVista(c.pregunta) && !preguntas.some((q) => parecidas(q.pregunta, c.pregunta) > 0.72)) preguntas.push(c);
  }
  // Último recurso: una revisión previa, siempre ligada al tema del post.
  if (preguntas.length < 2) {
    const c = TEMPLATES.revision(tema, sys);
    if (!yaVista(c.pregunta) && !preguntas.some((q) => q.pregunta === c.pregunta)) preguntas.push(c);
  }
  // Si el tema ya estaba cubierto, se publica una sola pregunta en este post
  // antes que repetir texto en dos URLs (eso es canibalización).
  if (!preguntas.length) throw new Error('sin preguntas para ' + p.slug);

  const tabla = /(^|-)(vs|comparativa)/.test(p.slug) || p.grupo === 'familia'
    ? tablaSistemas()
    : /precio|cuesta|costo|mano-de-obra/.test(p.slug) ? tablaCostos() : tablaGarantia();

  preguntas.forEach((q) => { vistas.add(q.pregunta); vistasArr.push(q.pregunta); });
  out.posts[p.slug] = { preguntas, tabla };
  total += preguntas.length;
}

out.total = total;
fs.writeFileSync(path.join(BLOG, 'data/longtail.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Long tail: ${total} preguntas en ${Object.keys(out.posts).length} posts · únicas: ${vistas.size}`);
