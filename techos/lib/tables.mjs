// Ilatek · Techos · tablas AEO compartidas (landing money y blog).
// Una sola definición para las dos tablas: lista de precios y comparativa 5×8.
// Cada fila de sistema enlaza a su landing de servicio, que es
// lo que sostiene el enlazado programático entre la landing money y las páginas
// de cada sistema. Los valores salen del registro de hechos: una celda sin hecho
// verificado se publica como pendiente, nunca inventada.
import { comparisonRows, registryDate, systemRows, verifiedFact } from './facts.mjs';

const PENDING = 'Se confirma en la inspección';

// Sistema del registro → landing publicada que lo explica.
export const SYSTEM_PATHS = {
  'silicona-100': '/sellado-de-silicona',
  'membrana-asfaltica': '/membrana-asfaltica',
  'elastomerico': '/recubrimiento-elastomerico',
  'poliuretano': '/sellado-de-poliuretano',
  'acrilico': '/sellado-acrilico',
};

export const systemPath = (id) => SYSTEM_PATHS[id] || null;

const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Nombre del sistema como enlace a su landing; sin ruta conocida, texto plano.
function systemLabel(id, name, hrefFor) {
  const path = systemPath(id);
  const href = path && hrefFor ? hrefFor(id) : null;
  if (!href) return esc(name);
  return `<a href="${esc(href)}">${esc(name)}</a>`;
}

// M2 · lista de los cinco sistemas con su precio de entrada.
export function priceListHtml({ hrefFor } = {}) {
  const rows = systemRows().map((system) => {
    const price = system.price ? esc(system.price) : PENDING;
    return `            <li><b>${systemLabel(system.id, system.nombre, hrefFor)}</b><span>${price}</span></li>`;
  }).join('\n');
  return `          <ul class="ilt-aeo-list">\n${rows}\n          </ul>`;
}

// M2-b · precio base por sistema CON su fuente y la fecha de verificación.
// La fuente sale del propio hecho (`url` o el slug citado en `fuente`), nunca de
// una lista paralela: si el hecho cambia, la tabla cambia.
function sourceOf(system) {
  const fact = verifiedFact(system.precioFact);
  if (!fact) return null;
  if (fact.url) return String(fact.url).replace(/^https?:\/\/[^/]+/, '');
  const m = String(fact.fuente || '').match(/\/([a-z0-9-]{3,})/);
  return m ? '/' + m[1] : null;
}

export function priceSourceTableHtml({ tableClass = 'ilt-aeo-table ilt-aeo-table--price', wrapperClass = 'ilt-aeo-tablewrap', caption = '', hrefFor } = {}) {
  const date = registryDate(true);
  const body = systemRows().map((system) => {
    const path = sourceOf(system);
    const href = path && hrefFor ? hrefFor(system.id) : null;
    const price = system.price ? esc(system.price) : PENDING;
    const source = href
      ? `<a href="${esc(href)}">Publicado en ${esc(path)}</a>`
      : esc((verifiedFact(system.precioFact) || {}).fuente || PENDING);
    return `              <tr><th scope="row" data-label="Sistema">${systemLabel(system.id, system.nombre, hrefFor)}</th><td data-label="Precio base">${price}</td><td data-label="Fuente">${source}</td><td data-label="Verificado">${esc(date)}</td></tr>`;
  }).join('\n');
  return `          <div class="${wrapperClass}">
            <table class="${tableClass}">
              ${caption ? `<caption>${esc(caption)}</caption>` : ''}
              <thead><tr><th scope="col">Sistema</th><th scope="col">Precio base</th><th scope="col">Fuente</th><th scope="col">Verificado</th></tr></thead>
              <tbody>
${body}
              </tbody>
            </table>
          </div>`;
}

// M3 · los cinco sistemas × ocho criterios, con el sistema enlazado.
export function comparisonTableHtml({ tableClass = 'ilt-aeo-table', wrapperClass = 'ilt-aeo-tablewrap', caption = '', hrefFor } = {}) {
  const rows = comparisonRows();
  const head = rows.labels.map((l) => `<th scope="col">${esc(l)}</th>`).join('');
  const body = rows.rows.map((row) => {
    const cells = row.cells.map((cell, i) => {
      if (i !== 0) return `<td data-label="${esc(rows.labels[i])}">${esc(cell || PENDING)}</td>`;
      const name = systemLabel(row.id, cell || PENDING, hrefFor);
      return `<th scope="row" data-label="${esc(rows.labels[0])}">${name}</th>`;
    }).join('');
    return `              <tr>${cells}</tr>`;
  }).join('\n');
  return `          <div class="${wrapperClass}">
            <table class="${tableClass}">
              ${caption ? `<caption>${esc(caption)}</caption>` : ''}
              <thead><tr>${head}</tr></thead>
              <tbody>
${body}
              </tbody>
            </table>
          </div>`;
}


