// Ilatek · Techos · kit de autoría de contenido por slug.
// Une la copy de secciones (en los clusters de data) con la capa META por slug
// —dueña de títulos de sección, precio y FAQ de cierre— para que cada landing
// reciba encabezados y descripciones propios de su servicio.
import { META } from './data/meta.mjs';

const WEBP = 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/';
const RAW = 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/';
// Copias WebP recomprimidas de las fotos de techos (ver techos/optimize-shots.mjs),
// servidas desde el mismo pipeline de assets/optimized que el resto del sitio.
const OPT = WEBP + 'techos/';

// URL optimizada (WebP 1200 px) para una foto del CDN de GHL. El JPEG original
// sigue siendo el respaldo del <img>, así que un archivo que falte no rompe nada.
export function optimized(url) {
  return OPT + url.replace(CDN, '').replace(/\.[a-z]+$/i, '') + '.webp';
}

export const ASSETS = {
  postconstruccion: ['svc-postconstruccion-800.webp', '6ab171a7de8ed1c29fac079f.jpg'],
  presion: ['svc-presion-800.webp', '6ab1756e966c1acf6d443f69.jpeg'],
  comercial: ['limpieza-comercial-800.webp', '6ab0c2d44091fa65e6a436d3.png'],
  industrial: ['limpieza-industrial-800.webp', '6ab0c2d4ff484614db70610c.png'],
  residencial: ['limpieza-residencial-800.webp', '6ab0c2d4ff484614db70610b.png'],
  conocenos: ['conocenos-900.webp', '6ab0a4884091fa65e6a1ce3d.jpg'],
  profunda: ['limpieza-profunda-1000.webp', '6aac6cd7254a2c54081fa165.png'],
};

// Imágenes reales de la librería de medios de GHL (folder "Mantenimiento y Sellado
// de Techos", location 8OxUENFVM60EKzqsTcoD), leídas vía API (GET /medias/files).
// Asignación GLOBAL sobre las 51 imágenes: hero = orientación vertical (nativa
// h>w) y "Qué incluye" = horizontal (w>h); los nombres nombrados por servicio van
// a su servicio. Solo se reutiliza una misma foto en los dos huecos cuando la
// librería no tiene una segunda imagen relevante para esa página (oxidación,
// silicona, membrana, poliuretano, acrílico, teja, limpieza, canaletas, lavado,
// tragaluces). Ver el informe para las páginas que la librería no cubre del todo.
export const CDN = 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/';
export const TECHOS_IMG = {
  techos: { hero: CDN + '6ac046fe8493229874263a27.jpg', incl: CDN + '6ac046fef30b488137bfa568.jpg' },
  'reparacion-de-techos': { hero: CDN + '6ac046f30edabbe5a4a763bc.jpg', incl: CDN + '6ac046fd02569bee7cbccca0.jpg' },
  'reparacion-de-goteras': { hero: CDN + '6ac046fc150d6ea53dbd517a.jpg', incl: CDN + '6ac046fc02569bee7cbccc91.jpg' },
  'reparacion-de-filtraciones': { hero: CDN + '6ac046fc8493229874263a03.jpg', incl: CDN + '6ac046fb84932298742639df.jpg' },
  'reparacion-de-grietas-techos': { hero: CDN + '6ac046fb0edabbe5a4a7647c.jpg', incl: CDN + '6ac046fb85f560d1666999ff.jpg' },
  'empozamiento-de-techos': { hero: CDN + '6ac046fb3b8e61adf5632061.jpg', incl: CDN + '6ac046fb7bca8cd20c402253.jpg' },
  'reparacion-post-huracan': { hero: CDN + '6ac046f83b8e61adf5632035.jpg', incl: CDN + '6ac046f57bca8cd20c4021df.jpg' },
  'sellado-de-techos': { hero: CDN + '6ac046f8849322987426396f.jpg', incl: CDN + '6ac0427e0edabbe5a4a724d7.jpg' },
  'sellado-de-silicona': { hero: CDN + '6ac046f585f560d1666999aa.jpg', incl: CDN + '6ac046f585f560d1666999aa.jpg' },
  'membrana-asfaltica': { hero: CDN + '6ac046f82c503e697d5ff24e.jpg', incl: CDN + '6ac046f82c503e697d5ff24e.jpg' },
  'recubrimiento-elastomerico': { hero: CDN + '6ac046f302569bee7cbccbf4.jpg', incl: CDN + '6ac046f32c503e697d5ff1fa.jpg' },
  'sellado-de-poliuretano': { hero: CDN + '6ac046f28493229874263903.jpg', incl: CDN + '6ac046f28493229874263903.jpg' },
  'sellado-acrilico': { hero: CDN + '6ac046f52c503e697d5ff222.jpg', incl: CDN + '6ac046f52c503e697d5ff222.jpg' },
  'impermeabilizacion-de-techos': { hero: CDN + '6ac046f5849322987426393b.jpg', incl: CDN + '6ac046f802569bee7cbccc2c.jpg' },
  'techos-de-concreto': { hero: CDN + '6ac046f27bca8cd20c4021bf.jpg', incl: CDN + '6ac046f32c503e697d5ff1fa.jpg' },
  'techos-planos': { hero: CDN + '6ac046f32c503e697d5ff20a.jpg', incl: CDN + '6ac046ee150d6ea53dbd5051.jpg' },
  'techos-de-zinc': { hero: CDN + '6ac046f202569bee7cbccbe0.jpg', incl: CDN + '6ac046f00edabbe5a4a763a0.jpg', heroWebp: WEBP + 'techos/techos-de-metal-y-zinc.webp' },
  'techos-de-asfalto': { hero: CDN + '6ac046f82c503e697d5ff24e.jpg', incl: CDN + '6ac046f57bca8cd20c4021df.jpg' },
  'techos-de-teja': { hero: CDN + '6ac046f084932298742638d7.jpg', incl: CDN + '6ac046f084932298742638d7.jpg' },
  'techos-de-madera': { hero: CDN + '6ac046f0f30b488137bfa494.jpg', incl: CDN + '6ac046ee3b8e61adf5631fc5.jpg' },
  'techos-por-segmento': { hero: CDN + '6ac046f0150d6ea53dbd50a0.jpg', incl: CDN + '6ac046ee150d6ea53dbd5051.jpg' },
  'sellado-de-techos-residencial': { hero: CDN + '6ac046f07bca8cd20c4021a3.jpg', incl: CDN + '6ac0427e0edabbe5a4a724d7.jpg' },
  'sellado-de-techos-comercial': { hero: CDN + '6ac046ee85f560d1666998eb.jpg', incl: CDN + '6ac046f00edabbe5a4a763a0.jpg' },
  'sellado-de-techos-industrial': { hero: CDN + '6ac046ee0edabbe5a4a76380.jpg', incl: CDN + '6ac046ee849322987426388b.jpg' },
  'inspeccion-y-mantenimiento-de-techos': { hero: CDN + '6ac046ec3b8e61adf5631fa2.jpg', incl: CDN + '6ac046f585f560d166699993.jpg' },
  'inspeccion-de-techos': { hero: CDN + '6ac046ec0edabbe5a4a76342.jpg', incl: CDN + '6ac046ecf30b488137bfa41c.jpg' },
  'mantenimiento-de-techos': { hero: CDN + '6ac046f98493229874263987.jpg', incl: CDN + '6ac046f8f30b488137bfa4ee.jpg' },
  'limpieza-de-techos-y-canaletas': { hero: CDN + '6ac046ee150d6ea53dbd5044.jpg', incl: CDN + '6ac046ee150d6ea53dbd5044.jpg' },
  'canaletas-y-bajantes': { hero: CDN + '6ac046ecf30b488137bfa427.jpg', incl: CDN + '6ac046ecf30b488137bfa427.jpg' },
  'lavado-a-presion-techos': { hero: CDN + '6ac046ecc478ac55358ec4c6.jpg', incl: CDN + '6ac046ecc478ac55358ec4c6.jpg' },
  tragaluces: { hero: CDN + '6ac046ec3b8e61adf5631fa8.jpg', incl: CDN + '6ac046ec3b8e61adf5631fa8.jpg' },
  'instalacion-y-reemplazo-de-techos': { hero: CDN + '6ac046f00edabbe5a4a763a0.jpg', incl: CDN + '6ac046ee849322987426388b.jpg' },
};

// Fotos relacionadas con un slug: la portada propia de la tarjeta mas las dos fotos
// de su landing (hero e incluye), sin repetir. Alimenta el fundido interno de las
// tarjetas del hub, y vive aqui porque este archivo es el dueno del mapa de imagenes.
export function shots(slug, primary) {
  const t = TECHOS_IMG[slug] || {};
  const all = [primary, t.hero, t.incl].filter(Boolean);
  return all.filter((u, i) => all.indexOf(u) === i).map((raw) => ({ webp: optimized(raw), raw }));
}

export function pic(asset, { alt, title, badge, caption }) {
  const [webp, raw] = ASSETS[asset] || ASSETS.postconstruccion;
  return { webp: WEBP + webp, raw: RAW + raw, alt, title, badge, caption };
}

// Toda la copy genérica de cierre ("¿Por qué elegir…?") vive aquí, en META,
// y no replicada en cada entrada de data: un solo dueño por comportamiento.
const WHY_GENERIC = /^¿Por qué elegir Ilatek Techos/i;

export function mk(p) {
  const meta = META[p.slug];
  if (!meta) throw new Error(`Falta la entrada de META para el slug "${p.slug}"`);
  const noun = p.noun || p.eyebrow.toLowerCase();

  // Imagen real de GHL si el slug tiene una asignada; si no, se conserva la de kit.
  const ov = TECHOS_IMG[p.slug];
  // heroWebp/inclWebp = portada o foto propia (no viene del CDN de GHL): se usa
  // tal cual. La foto de GHL sigue siendo `raw`, el respaldo del <img>.
  const hero = ov && ov.hero ? { ...p.hero, webp: ov.heroWebp || optimized(ov.hero), raw: ov.hero } : p.hero;
  const incl = ov && ov.incl ? { ...p.incl, webp: ov.inclWebp || optimized(ov.incl), raw: ov.incl } : p.incl;

  const faq = (p.faq || [])
    .filter((f) => !WHY_GENERIC.test(f.q))
    .concat([{ q: meta.whyQ, a: meta.whyA }]);

  return {
    role: 'child',
    ...p,
    hero,
    incl,
    noun,
    faq,
    benTitle: meta.benTitle,
    process: { title: meta.procTitle, lead: meta.procLead },
    price: meta.price,
    serviceName: meta.serviceName,
    serviceDesc: meta.serviceDesc,
    faqTitle: p.faqTitle || `Preguntas frecuentes sobre ${noun}.`,
    ctaTitle: p.ctaTitle || 'Protege tu techo antes de la próxima lluvia.',
    ctaText:
      p.ctaText ||
      `Solicita tu cotización gratis de ${noun} en {{custom_values.county_name_and_state}} y recibe precio claro y por escrito — con inspección incluida y cobertura en los 78 municipios de Puerto Rico.`,
  };
}
