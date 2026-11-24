// Rutas, URLs públicas y carga de registros para el generador de landings LUXURY.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const comunidades = path.resolve(here, '..', '..');
// Estructura aplanada (literal del pedido): los pueblos cuelgan directo de
// comunidades/, sin nivel intermedio:
//   comunidades/<pueblo>/<comunidad>/sellado-de-techo/index.html
//   comunidades/<pueblo>/<comunidad>/limpieza/index.html
// Los assets compartidos viven en la misma raíz: comunidades/styles.css,
// comunidades/img/ y comunidades/hero/. Desde
// <pueblo>/<comunidad>/<servicio>/ la ruta relativa sigue siendo ../../../:
// el aplanado elimina un nivel y a la vez lo sube, así que la profundidad
// no cambia y las páginas no necesitan retoque.
export const outRoot = path.join(comunidades, 'landings');

// Base pública de las landings de comunidad. Se publican en el subdominio
// propio como HTML estático: ahí no hay GHL que resuelva tokens, así que las
// URL de la página son concretas y nunca llevan {{custom_values.*}}.
export const COMMUNITY_SITE = 'https://comunidades.ilatekpr.com';

// Dominio principal de Ilatek. Los enlaces a servicios y los CTA usan URL
// absoluta porque la landing vive en otro origen y no puede resolver
// {{custom_values.website_url}}.
export const MAIN_SITE = 'https://ilatekpr.com';

// Directorio de héroes por comunidad, en la raíz del repo Ilatek. El hero
// promovido lo usa el hero de las landings (heroDe); la info card del pin
// del mapa del home ya no existe en el DOM generado.
export const HEROES_DIR = comunidades;

// Logo circular de Ilatek para el pie de las landings. Vive en /assets del
// repositorio y el generador lo copia a landings/img/ para servirlo desde el
// propio subdominio (nada de CDNs de terceros en el pie).
export const LOGO_SRC = path.resolve(comunidades, '..', 'assets', 'ilatek-logo-circle-512.png');
export const LOGO_FILE = 'ilatek-logo-circle-512.png';

// Iconos del sitio: versiones ligeras del logo (32 px para la pestaña, 180 px
// para iOS). Se generan desde el logo circular original y se copian junto al
// resto de assets para no cargar 88 KB en cada pestaña.
export const FAVICON_SRC = path.resolve(comunidades, '..', 'assets', 'favicon-32.png');
export const FAVICON_FILE = 'favicon-32.png';
export const TOUCH_ICON_SRC = path.resolve(comunidades, '..', 'assets', 'apple-touch-icon-180.png');
export const TOUCH_ICON_FILE = 'apple-touch-icon-180.png';

// Imagen de portada (hero) de todas las landings de comunidad.
export const HERO_IMAGE = 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ab0a4884091fa65e6a1ce3d.jpg';

// Carpeta servida con los héroes promovidos en la raíz de comunidades/
// (el generador la llena desde HEROES_DIR). La usan heroDe, el generador y el
// guardián.
export const HERO_DIR = 'hero';

// Hero por comunidad: el generador copia cada héroe promovido
// (Ilatek/Comunidades/<slug>-hero.jpg — licencia CC0 / dominio público
// verificada y pertinencia revisada) a comunidades/hero/. La landing usa la
// suya
// si existe; si no, la foto compartida. Ruta relativa al documento
// (<municipio>/<comunidad>/<servicio>/): tres niveles arriba es la raíz del
// subdominio, donde vive hero/.
// Imágenes nuevas por comunidad, una por servicio, como las entrega el cliente:
// "Ilatek/comunidades imagenes/<Comunidad> - limpieza.png" y
// "<Comunidad> - sellado de techos.png". El generador las convierte a WebP y las
// sirve desde hero/; la landing de cada servicio usa la suya.
export const IMAGENES_DIR = path.resolve(comunidades, '..', 'comunidades imagenes');

const sinAcentos = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Archivo de portada de una comunidad para un servicio: techos -> sellado de techos.
export function heroArchivo(municipioSlug, slug, kind) {
  const muni = String(municipioSlug || '').replace(/[^a-z0-9-]/gi, '');
  const limpio = String(slug || '').replace(/[^a-z0-9-]/gi, '');
  if (!limpio) return '';
  return `${muni ? muni + '-' : ''}${limpio}-${kind === 'techos' ? 'techos' : 'limpieza'}.webp`;
}

// Mapa slug -> { limpieza: ruta, techos: ruta } desde la carpeta de imágenes.
// Cuando el nombre de la comunidad se repite en varios pueblos, el archivo trae
// el municipio entre paréntesis ("Campo Real (Arecibo)") y ese es el desempate.
export function imagenesPorComunidad() {
  const mapa = new Map();
  let archivos = [];
  try { archivos = fs.readdirSync(IMAGENES_DIR).filter(f => /\.png$/i.test(f)); } catch { return mapa; }
  const candidatos = new Map();
  for (const r of loadLandingRecords()) {
    for (const clave of [r.name, ...String(r.alternates || '').split(/[;|]/)]) {
      const n = sinAcentos(clave);
      if (!n) continue;
      if (!candidatos.has(n)) candidatos.set(n, []);
      if (!candidatos.get(n).includes(r)) candidatos.get(n).push(r);
    }
  }
  for (const archivo of archivos) {
    const partes = archivo.replace(/\.png$/i, '').split(' - ');
    const servicio = partes.pop();
    const kind = /sellado/i.test(servicio) ? 'techos' : /limpieza/i.test(servicio) ? 'limpieza' : null;
    if (!kind) continue;
    let nombre = partes.join(' - ');
    let municipio = '';
    const par = nombre.match(/\(([^)]+)\)\s*$/);
    if (par) { municipio = sinAcentos(par[1]); nombre = nombre.replace(par[0], '').trim(); }
    const lista = candidatos.get(sinAcentos(nombre));
    if (!lista || !lista.length) continue;
    const r = (municipio && lista.find(x => sinAcentos(x.municipality) === municipio || sinAcentos(x.municipalitySlug) === municipio)) || lista[0];
    const clave = `${r.municipalitySlug}/${r.slug}`;
    if (!mapa.has(clave)) mapa.set(clave, { municipalitySlug: r.municipalitySlug, slug: r.slug });
    mapa.get(clave)[kind] = path.join(IMAGENES_DIR, archivo);
  }
  return mapa;
}

// Hero por comunidad y servicio: primero la foto nueva del servicio; si esa
// comunidad todavía no tiene imagen, el héroe promovido de antes
// (<slug>-hero.jpg); si tampoco, la foto compartida. Ruta relativa al documento
// (<municipio>/<comunidad>/<servicio>/): tres niveles arriba es la raíz del
// subdominio, donde vive hero/.
export function heroDe(municipioSlug, slug, kind) {
  try {
    const nueva = heroArchivo(municipioSlug, slug, kind);
    if (nueva && fs.existsSync(path.join(outRoot, HERO_DIR, nueva))) return `../../../${HERO_DIR}/${nueva}`;
    const viejo = `${String(slug || '').replace(/[^a-z0-9-]/gi, '')}-hero.jpg`;
    if (viejo !== '-hero.jpg' && fs.existsSync(path.join(outRoot, HERO_DIR, viejo))) return `../../../${HERO_DIR}/${viejo}`;
  } catch { /* sin héroe por comunidad: foto compartida */ }
  return HERO_IMAGE;
}

// URL absoluta de esa misma portada, para og:image.
export function heroUrl(municipioSlug, slug, kind) {
  try {
    const nueva = heroArchivo(municipioSlug, slug, kind);
    if (nueva && fs.existsSync(path.join(outRoot, HERO_DIR, nueva))) return `${COMMUNITY_SITE}/${HERO_DIR}/${nueva}`;
  } catch { /* foto compartida */ }
  return HERO_IMAGE;
}

// Destinos de los CTA según la variante.
export const COTIZACION_TECHOS = 'https://ilatekpr.com/cotizacion-techos';
export const COTIZACION_LIMPIEZA = 'https://ilatekpr.com/cotizacion';

// Calendarios de Go High Level: el CTA de cada página reserva directo en el
// calendario de su servicio, sin pasar por el formulario de cotización.
export const CALENDARIO_TECHOS = 'https://link.msgsndr.com/widget/booking/wM8KQhsYjEQAo0HbNGIh';
export const CALENDARIO_LIMPIEZA = 'https://link.msgsndr.com/widget/booking/i5HZobZjuSZcDl43qgOG';

// Comunidades con landing: las verificadas, sin importar el tier. La regla es
// la misma que `scripts/consolidar.py` usa para el landingStatus — UNVERIFIED o
// confianza LOW no genera página porque no hay evidencia que la sostenga
// (Master Prompt, regla 8) — y el servicio tiene que ser pertinente.
export function loadLandingRecords() {
  const db = JSON.parse(fs.readFileSync(path.join(comunidades, 'master-database.json'), 'utf8'));
  return (Array.isArray(db) ? db : db.records).filter(r =>
    r.priority !== 'UNVERIFIED' &&
    r.confidence !== 'LOW' &&
    String(r.relevantServices || '').trim() !== '');
}
