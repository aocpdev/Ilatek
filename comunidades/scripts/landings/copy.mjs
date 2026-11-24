// Textos de las dos landings de la comunidad: sellado de techo y limpieza.
// Solo afirma lo que el registro verificado sostiene. Servicios: slugs de docs/estructura.json.
// Las landings viven en comunidades.ilatekpr.com (HTML estático, sin tokens de GHL):
// el canonical usa ese subdominio y los enlaces a servicios usan URL absoluta
// del dominio principal, que no depende del token {{custom_values.website_url}}.
//
// El H1 es literal, tal como lo pidió el usuario:
//   Sellado de techo en <Comunidad>, <Municipio> Puerto Rico
//   Servicio de Limpieza en <Comunidad>, <Municipio> Puerto Rico
// El <title> es independiente y puede ser comercial.
import { COMMUNITY_SITE, COTIZACION_TECHOS, COTIZACION_LIMPIEZA } from './config.mjs';

// Foto de cada servicio: las 8 fotos de la SEGUNDA tanda, vendidas como WebP en
// landings/img/ y servidas desde el propio subdominio. En cada página (tres
// niveles por debajo de comunidades/) la ruta relativa es ../../../img/; publicada
// resuelve a /img/<archivo> del host. NO usar cdn.jsdelivr.net
// gh/aocpdev/Ilatek@main: ese CDN todavía sirve los bytes de la PRIMERA tanda.
const IMG = '../../../img/';

export const TECHOS_SERVICES = [
  ['sellado-de-techos-residencial', 'Sellado de techos residencial', 'Sellado con silicona, membrana asfáltica, elastomérico, poliuretano o acrílico.', `${IMG}techos-sellado-residencial.webp`],
  ['inspeccion-y-mantenimiento-de-techos', 'Inspección y mantenimiento de techos', 'Revisión del estado del techo y plan de mantenimiento.', `${IMG}techos-inspeccion-mantenimiento.webp`],
  ['impermeabilizacion-de-techos', 'Impermeabilización de techos', 'Protección contra filtraciones y humedad.', `${IMG}techos-impermeabilizacion.webp`],
  ['reparacion-de-filtraciones', 'Reparación de filtraciones', 'Atención a filtraciones y humedad en el techo.', `${IMG}techos-reparacion-filtraciones.webp`],
];

export const LIMPIEZA_SERVICES = [
  ['limpieza-residencial', 'Limpieza residencial', 'Limpieza profesional de la vivienda.', `${IMG}limpieza-residencial.webp`],
  ['limpieza-profunda', 'Limpieza profunda', 'Limpieza a fondo de la vivienda.', `${IMG}limpieza-profunda.webp`],
  ['lavado-a-presion', 'Lavado a presión', 'Limpieza a presión de superficies exteriores.', `${IMG}limpieza-lavado-presion.webp`],
  ['limpieza-de-techos-y-canaletas', 'Limpieza de techos y canaletas', 'Limpieza de techos y canaletas.', `${IMG}limpieza-techos-canaletas.webp`],
];

// Archivos vendidos permitidos con su sha256: las guardas comprueban que cada
// página enlaza un archivo de este registro y que landings/img/ contiene
// EXACTAMENTE estos bytes (que no vuelva a colarse la primera tanda).
export const IMG_DIR = 'img';
export const IMG_HASHES = {
  'limpieza-lavado-presion.webp': 'c49af7d7991644a56943c2ac1b19c57859abaf3e6a9c20816d261f7dfd1f629c',
  'limpieza-profunda.webp': 'e7599cfa27be6aaa4e14a9b3462d5f5a98923c7dfe7daad856659866d43e53f1',
  'limpieza-residencial.webp': '4dadf5de658e009a8d0155bed4430ddc4ca13ecb9894e5ae5002bead3e61f1c9',
  'limpieza-techos-canaletas.webp': '527d871016849998a8f716e4489ea774cf926a3764cc4603e5a26a7048c3d83c',
  'techos-impermeabilizacion.webp': 'b0ec53e7c11bb46f821c5db033a2d6d21b44491dac2d93eb59a543d454f1db84',
  'techos-inspeccion-mantenimiento.webp': '7b8c4805d0145143644ba21dffe07a714cb5f460925b6ebf6e148847252af08e',
  'techos-reparacion-filtraciones.webp': 'd9a789984dbea064f874c971c281299a60c964837bf4dba3f61d65f57bab388c',
  'techos-sellado-residencial.webp': '72e211a6747f2dbbaf383b8e6b9657618e8a431833117ea33cadbcc934711ec6',
};
// Nombre del archivo vendido al que apunta un src, o null si no es de /img/.
export const IMG_ARCHIVO = src => {
  const m = String(src).match(/^\.\.\/\.\.\/\.\.\/img\/(.+\.webp)$/);
  return m ? m[1] : null;
};

// Rutas públicas (sin .html): comunidades.ilatekpr.com/<municipio>/<comunidad>/<servicio>
export const SLUGS = { techos: 'sellado-de-techo', limpieza: 'limpieza' };

const urlFor = (r, kind) =>
  `${COMMUNITY_SITE}/${r.municipalitySlug}/${r.slug}/${SLUGS[kind]}`;

// ¿El nombre de la comunidad ya lleva el municipio? («Alturas de Adjuntas»,
// «Condado», «Palmas del Mar»…). Se compara sin acentos ni mayúsculas y por
// palabra completa, para no confundir «Florida» con «Florida Heights».
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const llevaMunicipio = (name, muni) => {
  const n = norm(name);
  const m = norm(muni);
  if (!m) return false;
  const escapado = m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escapado}($|[^a-z0-9])`).test(n);
};

export function copyFor(r, kind) {
  const T = kind === 'techos';
  const muni = r.municipality;
  // Si el nombre ya trae el pueblo («Alturas de Adjuntas»), no se repite:
  //   Alturas de Adjuntas Puerto Rico   ·   La Granja, Adjuntas Puerto Rico
  const yaLleva = llevaMunicipio(r.name, muni);
  const donde = yaLleva ? r.name : `${r.name}, ${muni}`;          // comunidad (+ pueblo si falta)
  const place = yaLleva ? `${r.name} Puerto Rico` : `${r.name}, ${muni} Puerto Rico`;        // literal del H1
  const placeFull = yaLleva ? `${r.name}, Puerto Rico` : `${r.name}, ${muni}, Puerto Rico`;   // prosa, meta y FAQ
  const h1 = T ? `Sellado de techo en ${place}` : `Servicio de Limpieza en ${place}`;
  const type = r.type || 'comunidad residencial';

  return {
    T,
    muni,
    donde,
    place,
    placeFull,
    canonical: urlFor(r, kind),
    h1,
    title: T
      ? `Sellado de techo en ${donde} | Ilatek Property Solution`
      : `Servicio de limpieza en ${donde} | Ilatek Property Solution`,
    desc: T
      ? `Sellado de techo en ${placeFull}. Conozca los sistemas de sellado residencial de Ilatek y solicite su cotización de techos.`
      : `Servicio de limpieza en ${placeFull}. Conozca los servicios de limpieza residencial de Ilatek y reserve su limpieza.`,
    keywords: T
      ? [`sellado de techo ${r.name}`, `sellado de techos ${muni}`, 'sellado de techos Puerto Rico', 'impermeabilización de techos', 'Ilatek Property Solution']
      : [`servicio de limpieza ${r.name}`, `limpieza residencial ${muni}`, 'limpieza residencial Puerto Rico', 'limpieza de techos y canaletas', 'Ilatek Property Solution'],
    services: T ? TECHOS_SERVICES : LIMPIEZA_SERVICES,
    // CTA a la página de cotización del servicio; desde ahí se llega al
    // calendario de Go High Level de techos o de limpieza.
    cta: T
      ? { href: COTIZACION_TECHOS, text: 'Agenda tu sellado' }
      : { href: COTIZACION_LIMPIEZA, text: 'Agenda tu limpieza' },
    faqs: T
      ? [
          [`¿Ofrecen sellado de techo en ${donde}?`, `Ilatek atiende sellado de techo residencial en ${muni}, Puerto Rico. Confirme la disponibilidad exacta en ${r.name} al solicitar la cotización.`],
          [`¿Qué tipo de comunidad es ${r.name}?`, `Tipo de comunidad según fuentes públicas consultadas el ${r.dateVerified}: ${type}.`],
          ['¿Cuándo conviene sellar un techo?', 'Conviene revisar el techo cuando aparecen grietas, manchas de humedad, desprendimiento de la capa protectora o filtraciones. Una inspección define el sistema adecuado.'],
          ['¿Qué materiales se usan para sellar un techo?', 'Silicona, membrana asfáltica, elastomérico, poliuretano o acrílico, según el tipo de techo y su estado.'],
          ['¿Cómo agendo el sellado de mi techo?', 'El botón Agenda tu sellado abre el formulario de cotización de techos. Complete los datos y coordinamos la visita.'],
        ]
      : [
          [`¿Ofrecen limpieza residencial en ${donde}?`, `Ilatek ofrece limpieza residencial en ${muni}, Puerto Rico. Confirme la disponibilidad exacta en ${r.name} al solicitar la reserva.`],
          [`¿Qué tipo de comunidad es ${r.name}?`, `Tipo de comunidad según fuentes públicas consultadas el ${r.dateVerified}: ${type}.`],
          ['¿Qué servicios de limpieza puedo solicitar?', 'Limpieza residencial, limpieza profunda, lavado a presión y limpieza de techos y canaletas.'],
          ['¿Cómo reservo la limpieza?', 'El botón Agenda tu limpieza abre el formulario de cotización de limpieza. Complete los datos y coordinamos la visita.'],
        ],
  };
}
