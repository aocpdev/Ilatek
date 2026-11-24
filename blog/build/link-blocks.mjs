// Ilatek · Blog · bloques de enlace por entidad (marca e intención).
// Cada post enlaza a la landing del sistema que le corresponde, con una tabla
// propia de su entidad: la marca con sus precios de lista, la intención con los
// sistemas que esa pregunta toca. Nunca la comparativa 5×8 (esa vive solo en los
// 21 posts de familia). Un solo origen de datos: sistemas.json + facts.mjs.
import { money, verifiedValue } from '../../techos/lib/facts.mjs'; export const SERVICE_LANDINGS = [ { path: '/sellado-de-silicona', label: 'Silicona 100%' }, { path: '/membrana-asfaltica', label: 'Membrana asfáltica' }, { path: '/recubrimiento-elastomerico', label: 'Recubrimiento elastomérico' }, { path: '/sellado-de-poliuretano', label: 'Poliuretano' }, { path: '/sellado-acrilico', label: 'Sellado acrílico' },
]; const esc = (value) => String(value) .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const low = (s) => String(s).toLowerCase(); // Ancla descriptiva y distinta por post: el mismo sistema no repite el mismo
// texto en 100 páginas. Se evita el ancla exacta de la landing money.
const VARIANTS = [ (n) => `${n}: precio y aplicación`, (n) => `Ver el servicio de ${low(n)}`, (n) => `${n} por Ilatek`, (n) => `Cómo se aplica ${low(n)}`,
];
export function anchorFor(fam, post, salt = '') { let text = VARIANTS[hash(post.slug + fam.id + salt) % VARIANTS.length](fam.nombre); if (/^sellado de techos? en puerto rico$/i.test(text)) text = 'Ver sellado de techos en Puerto Rico'; return esc(text);
} // Producto de la marca que corresponde a una familia (búsqueda por nombre).
const PRODUCT_HINTS = { 'silicona-100': /silicon/i, 'poliuretano': /poliuretan/i, 'acrilico-elastomerico': /acril|elastom/i, 'membrana-asfaltica': /membrana|asfalt|duroseal/i, 'membrana-liquida': /membrana|duroseal|liquida/i, 'sistema-multicapa': /sistema|maravilla|king|protocolo|multicapa/i, 'tpo-pvc': /tpo|pvc/i, 'metal-zinc': /metal|zinc/i, 'losa-cementicia': /cement|losas/i,
};
function productFor(marca, fam) { const hints = PRODUCT_HINTS[fam.id]; const hit = (marca.precios || []).find((p) => hints && hints.test(p.producto)); return hit || null;
} // Bloque de marca: qué sistemas vende esa marca, con su precio de lista y el
// enlace a la landing de Ilatek que explica ese sistema.
export function brandBlock(post, marca, famById, { hrefFor } = {}) { const fams = (marca.familias || []).map((id) => famById.get(id)).filter(Boolean).slice(0, 5); if (!fams.length) return null; const rows = fams.map((f) => { const p = productFor(marca, f); const price = p ? `${esc(p.precio)} · ${esc(p.unidad)}` : 'No publica precio de lista'; return [`<a href="${esc(hrefFor(f))}">${anchorFor(f, post, marca.id)}</a>`, price]; }); return { caption: `Sistemas que ${marca.nombre} fabrica o distribuye y que Ilatek instala. Precio de lista publicado por la marca (${marca.sitio}); no es el precio de instalación.`, headers: [`Sistema (cómo lo instala Ilatek)`, `Precio de lista de ${marca.nombre}`], rows, };
} // Bloque de intención: los sistemas que la pregunta toca, con el precio base
// por pie² publicado por Ilatek y su landing.
export function intentBlock(post, familias, { hrefFor } = {}) { if (!familias.length) return null; const rows = familias.map((f) => { const amount = money.amount(f.id); const price = amount === null ? 'Se confirma en la inspección' : `${money.format(amount)} por pie²`; return [`<a href="${esc(hrefFor(f))}">${anchorFor(f, post)}</a>`, price]; }); return { caption: 'Sistemas de sellado que responden a esta pregunta, con el precio base publicado por Ilatek (noviembre 2026) por pie cuadrado.', headers: ['Sistema (cómo lo instala Ilatek)', 'Precio base publicado'], rows, };
} // Enlaces de los 6 clusters a las cinco landings de sistema, con ancla variada.
export function clusterLinks(clusterId, { urlFor } = {}) { return SERVICE_LANDINGS.map((s) => { const fam = { id: s.path.slice(1), nombre: s.label }; const text = anchorFor(fam, { slug: 'cluster-' + clusterId }, 'cl'); return `<li><a href="${esc(urlFor(s.path))}">${text}</a></li>`; }).join('\n');
} // Precio verificado de un sistema (para auditoría/cobertura).
export const publishedPrice = (factId) => verifiedValue(factId);
