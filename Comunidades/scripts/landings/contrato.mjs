// Contrato estructural de las landings de comunidad.
//
// Las guardas comparaban texto (regex con el orden de atributos fijo), así que
// se les escapaban anclas correctas escritas al revés y anclas nuevas fuera de
// la página. Aquí las etiquetas se parsean de verdad: los atributos se leen por
// nombre, sin importar el orden, las comillas ni el espaciado. Las reglas que
// devuelve `violaciones()` son las mismas que aplica scripts/qc-pass.py (mismos
// ids), y ninguno de los dos módulos escribe nada.
import { MAIN_SITE, COMMUNITY_SITE } from './config.mjs';
import { copyFor, SLUGS } from './copy.mjs';

// Destinos reales del pie compartido, en el orden en que los escribe la
// plantilla. La lista blanca es el multiconjunto completo: un ancla nueva, aun
// con host permitido, tiene que hacer fallar la suite.
export const REDES = [
  'https://www.facebook.com/ilatek.pr/',
  'https://www.instagram.com/ilatek.pr/',
  'https://www.youtube.com/@Ilatekpr',
];
export const DEVASKS = 'https://devasks.com/';
// 3 CTAs + 4 fotos de servicio + logo, 3 redes y Devasks del pie.
export const ANCLAS_POR_PAGINA = 12;

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

function decodificar(texto) {
  return texto.replace(/&(#?[a-zA-Z0-9]+);/g, (m, clave) => ENTIDADES[clave.toLowerCase()] ?? m);
}

// Texto visible de un fragmento: fuera SVG (iconos), fuera lo marcado
// aria-hidden (la flecha del CTA) y fuera cualquier etiqueta.
export function textoVisible(fragmento) {
  return decodificar(
    fragmento
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<[a-zA-Z][^>]*\baria-hidden="true"[^>]*>[\s\S]*?<\/[a-zA-Z][a-zA-Z0-9-]*>/g, ' ')
      .replace(/<[^>]*>/g, ' '),
  ).replace(/\s+/g, ' ').trim();
}

// Tokenizador de etiquetas de apertura y cierre. Los atributos salen en un
// objeto por nombre; el valor se lee entre comillas dobles, simples o sin
// comillas, y los saltos de línea son solo separadores. El contenido de
// <script> y <style> se salta para no confundirlo con marcado.
export function parsearEtiquetas(html) {
  const etiquetas = [];
  let i = 0;
  while (i < html.length) {
    const inicio = html.indexOf('<', i);
    if (inicio === -1) break;
    if (html.startsWith('<!--', inicio)) {
      const fin = html.indexOf('-->', inicio + 4);
      i = fin === -1 ? html.length : fin + 3;
      continue;
    }
    const siguiente = html[inicio + 1] ?? '';
    if (siguiente === '/') {
      let j = inicio + 2;
      let nombre = '';
      while (j < html.length && /[a-zA-Z0-9:-]/.test(html[j])) nombre += html[j++];
      const fin = html.indexOf('>', j);
      const cierre = fin === -1 ? html.length : fin + 1;
      if (nombre) etiquetas.push({ nombre: nombre.toLowerCase(), cierre: true, inicio, fin: cierre, attrs: {}, orden: [], selfClose: true });
      i = cierre;
      continue;
    }
    if (!/[a-zA-Z]/.test(siguiente)) {
      i = inicio + 1;
      continue;
    }
    let j = inicio + 1;
    let nombre = '';
    while (j < html.length && /[a-zA-Z0-9:-]/.test(html[j])) nombre += html[j++];
    const attrs = {};
    const orden = [];
    let selfClose = false;
    while (j < html.length) {
      while (j < html.length && /\s/.test(html[j])) j++;
      if (html[j] === '>') { j++; break; }
      if (html[j] === '/' && html[j + 1] === '>') { selfClose = true; j += 2; break; }
      const claveInicio = j;
      while (j < html.length && !/[\s=>]/.test(html[j]) && !(html[j] === '/' && html[j + 1] === '>')) j++;
      if (j === claveInicio) { j++; continue; }
      const clave = html.slice(claveInicio, j).toLowerCase();
      let valor = '';
      if (html[j] === '=') {
        j++;
        while (j < html.length && /\s/.test(html[j])) j++;
        const comilla = html[j];
        if (comilla === '"' || comilla === "'") {
          const cierre = html.indexOf(comilla, j + 1);
          valor = cierre === -1 ? html.slice(j + 1) : html.slice(j + 1, cierre);
          j = cierre === -1 ? html.length : cierre + 1;
        } else {
          const valorInicio = j;
          while (j < html.length && !/[\s>]/.test(html[j])) j++;
          valor = html.slice(valorInicio, j);
        }
      }
      if (!(clave in attrs)) { attrs[clave] = valor; orden.push(clave); }
    }
    const tag = { nombre: nombre.toLowerCase(), cierre: false, inicio, fin: j, attrs, orden, selfClose: selfClose || VOID.has(nombre.toLowerCase()) };
    etiquetas.push(tag);
    // El cuerpo de un <script>/<style> no es marcado: se salta entero.
    if (!tag.selfClose && (tag.nombre === 'script' || tag.nombre === 'style')) {
      const cierre = html.toLowerCase().indexOf(`</${tag.nombre}`, j);
      if (cierre !== -1) { j = cierre; }
    }
    i = j;
  }
  return etiquetas;
}

export const clasesDe = attrs => String(attrs.class ?? '').split(/\s+/).filter(Boolean);

export function anclas(html) {
  const salida = [];
  const abiertas = [];
  for (const t of parsearEtiquetas(html)) {
    if (t.nombre !== 'a') continue;
    if (t.cierre) {
      const a = abiertas.pop();
      if (a) { a.finDoc = t.fin; a.finTexto = t.inicio; salida.push(a); }
      continue;
    }
    const a = {
      href: t.attrs.href ?? null,
      attrs: t.attrs,
      clases: clasesDe(t.attrs),
      inicio: t.inicio,
      finEtiqueta: t.fin,
      finTexto: null,
      finDoc: null,
      anidada: abiertas.length > 0,
    };
    if (!t.selfClose) abiertas.push(a);
    else { a.finTexto = t.fin; a.finDoc = t.fin; salida.push(a); }
  }
  for (const a of salida) a.texto = textoVisible(html.slice(a.finEtiqueta, a.finTexto ?? a.finEtiqueta));
  const incompletas = abiertas.filter(a => !a.finDoc);
  for (const a of incompletas) { a.finTexto = a.finEtiqueta; a.finDoc = html.length; a.texto = ''; }
  return salida.sort((a, b) => a.inicio - b.inicio);
}

function cierreDe(etiquetas, desde, nombre) {
  let profundidad = 0;
  for (let k = desde; k < etiquetas.length; k++) {
    const t = etiquetas[k];
    if (t.nombre !== nombre) continue;
    if (t.cierre) {
      profundidad--;
      if (profundidad === 0) return t;
    } else if (!t.selfClose) {
      profundidad++;
    }
  }
  return null;
}

// Cada tarjeta de servicio: la etiqueta <article class="tile">, sus anclas
// internas (solo la foto debe llevar enlace) y el alt de su imagen.
export function tarjetas(html) {
  const etiquetas = parsearEtiquetas(html);
  const salida = [];
  for (let k = 0; k < etiquetas.length; k++) {
    const t = etiquetas[k];
    if (t.cierre || t.nombre !== 'article' || !clasesDe(t.attrs).includes('tile')) continue;
    const cierre = cierreDe(etiquetas, k, 'article');
    const interior = html.slice(t.fin, cierre ? cierre.inicio : html.length);
    const dentro = anclas(interior);
    const img = parsearEtiquetas(interior).find(e => e.nombre === 'img');
    salida.push({
      inicio: t.inicio,
      fin: cierre ? cierre.fin : html.length,
      attrs: t.attrs,
      anclas: dentro.map(a => ({ href: a.href, clases: a.clases })),
      alt: img ? img.attrs.alt ?? null : null,
    });
  }
  return salida;
}

// Contexto esperado de una página a partir del registro y su variante. Todo
// sale del mismo copy que usa el generador: si el copy cambia, la guarda cambia
// con él y no hay una segunda lista de textos que mantener.
export function contextoDe(r, servicio) {
  const kind = servicio === SLUGS.limpieza ? 'limpieza' : 'techos';
  const c = copyFor(r, kind);
  const hermana = servicio === SLUGS.limpieza ? SLUGS.techos : SLUGS.limpieza;
  const servicios = c.services.map(([slug]) => `${MAIN_SITE}/${slug}`);
  const esperado = new Map();
  const sumar = (href, veces = 1) => esperado.set(href, (esperado.get(href) ?? 0) + veces);
  // Tres llamadas a la acción, las cuatro fotos de servicio y el pie heredado.
  sumar(c.cta.href, 3);
  for (const href of servicios) sumar(href);
  sumar(`${MAIN_SITE}/`);
  for (const href of REDES) sumar(href);
  sumar(DEVASKS);
  return {
    rel: `${r.municipalitySlug}/${r.slug}/${servicio}`,
    servicio,
    comunidad: r.name,
    municipio: r.municipality,
    muniSlug: r.municipalitySlug,
    comunidadSlug: r.slug,
    booking: c.cta.href,
    textoCta: c.cta.text,
    hermana,
    rutaHermana: `${COMMUNITY_SITE}/${r.municipalitySlug}/${r.slug}/${hermana}`,
    sitioComunidad: COMMUNITY_SITE,
    servicios,
    esperado,
  };
}

// Reglas del contrato. Cada violación lleva el id de la regla que la detecta:
// las dos guardas (JS y Python) reportan los mismos ids.
export function violaciones(html, ctx, { estilos = '' } = {}) {
  const fuera = [];
  const add = (regla, detalle) => fuera.push({ regla, detalle });
  const as = anclas(html);
  const ctas = as.filter(a => a.clases.includes('cta'));

  if (as.length !== ANCLAS_POR_PAGINA) add('anclas.conteo', `${as.length} anclas en la página, se esperan ${ANCLAS_POR_PAGINA}`);
  if (ctas.length !== 3) add('cta.conteo', `${ctas.length} a.cta, se esperan 3`);
  for (const a of ctas) {
    if (a.href !== ctx.booking) add('cta.href', `a.cta apunta a ${a.href ?? '(sin href)'}, la variante reserva en ${ctx.booking}`);
    if (a.texto !== ctx.textoCta) add('cta.texto', `a.cta dice «${a.texto}», su variante dice «${ctx.textoCta}»`);
  }
  for (const a of as) {
    if (a.href && a.href.startsWith(`${ctx.sitioComunidad}/`)) {
      add('hermana', a.href === ctx.rutaHermana
        ? `enlaza la landing hermana: ${a.href}`
        : `ancla al subdominio de comunidad: ${a.href}`);
    }
  }

  const fichas = tarjetas(html);
  if (fichas.length !== 4) add('tarjeta.conteo', `${fichas.length} tarjetas de servicio, se esperan 4`);
  const enlaces = [];
  for (const [i, ficha] of fichas.entries()) {
    const media = ficha.anclas.filter(a => a.clases.includes('tile-media'));
    const otras = ficha.anclas.filter(a => !a.clases.includes('tile-media'));
    const envuelta = as.find(a => a.inicio < ficha.inicio && ficha.fin <= a.finDoc);
    if (envuelta) add('tarjeta.enlace', `la tarjeta ${i + 1} está envuelta en un ancla a ${envuelta.href ?? '(sin href)'}`);
    if (media.length !== 1) add('tarjeta.enlace', `la tarjeta ${i + 1} tiene ${media.length} a.tile-media, se espera 1`);
    for (const otra of otras) add('tarjeta.enlace', `la tarjeta ${i + 1} tiene un ancla fuera de la foto: ${otra.href ?? '(sin href)'}`);
    const sobrantes = Object.keys(ficha.attrs).filter(k => k === 'role' || k === 'tabindex' || k === 'href' || k.startsWith('on'));
    if (sobrantes.length) add('tarjeta.inerte', `la tarjeta ${i + 1} lleva ${sobrantes.join(', ')}`);
    if (/\bcursor\s*:/i.test(ficha.attrs.style ?? '')) add('tarjeta.inerte', `la tarjeta ${i + 1} fija cursor en línea`);
    if (!ficha.alt) add('tarjeta.alt', `la tarjeta ${i + 1} no tiene imagen con alt`);
    else if (!ficha.alt.includes(ctx.comunidad) || !ficha.alt.includes(ctx.municipio)) add('tarjeta.alt', `alt sin comunidad y municipio: «${ficha.alt}»`);
    if (media.length === 1) enlaces.push(media[0].href);
  }
  if (fichas.length && enlaces.length === fichas.length) {
    const reales = enlaces.map(h => h ?? '(sin href)').sort();
    const esperados = [...ctx.servicios].sort();
    if (JSON.stringify(reales) !== JSON.stringify(esperados)) add('tarjeta.href', `las fotos enlazan ${reales.join(', ')}; se esperan ${esperados.join(', ')}`);
  }
  if (estilos) {
    const regla = estilos.match(/(?:^|[\s,}])\.tile\s*\{([^}]*)\}/);
    if (regla && /\bcursor\s*:/i.test(regla[1])) add('tarjeta.inerte', '.tile define cursor en la hoja compartida');
  }

  // Lista blanca de destinos: el multiconjunto de href tiene que ser el del
  // contrato, no un subconjunto. Así un enlace nuevo en el pie o en la banda
  // falla aunque su host ya estuviera permitido.
  const reales = new Map();
  for (const a of as) {
    const clave = a.href ?? '(sin href)';
    reales.set(clave, (reales.get(clave) ?? 0) + 1);
  }
  const diferencias = [];
  for (const [href, veces] of ctx.esperado) {
    const vistas = reales.get(href) ?? 0;
    if (vistas !== veces) diferencias.push(`${href} × ${vistas} (esperado ${veces})`);
  }
  for (const [href, veces] of reales) {
    if (!ctx.esperado.has(href)) diferencias.push(`${href} × ${veces} (fuera de la lista blanca)`);
  }
  if (diferencias.length) add('destinos', diferencias.join('; '));

  return fuera;
}
