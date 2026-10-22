// Textos de cada landing: H1, meta SEO, CTA, servicios enlazados y FAQ.
// Solo afirma lo que el registro verificado sostiene. Servicios: slugs de docs/estructura.json.
// Las landings viven en comunidades.ilatekpr.com (HTML estático, sin tokens de GHL):
// el canonical usa ese subdominio y los enlaces a servicios usan URL absoluta
// del dominio principal, que no depende del token {{custom_values.website_url}}.
import { COMMUNITY_SITE, MAIN_SITE, COTIZACION_TECHOS, COTIZACION_LIMPIEZA } from './config.mjs';

export const TECHOS_SERVICES = [
  ['sellado-de-techos-residencial', 'Sellado de techos residencial', 'Sellado con silicona, membrana asfáltica, elastomérico, poliuretano o acrílico.'],
  ['inspeccion-y-mantenimiento-de-techos', 'Inspección y mantenimiento de techos', 'Revisión del estado del techo y plan de mantenimiento.'],
  ['impermeabilizacion-de-techos', 'Impermeabilización de techos', 'Protección contra filtraciones y humedad.'],
  ['reparacion-de-filtraciones', 'Reparación de filtraciones', 'Atención a filtraciones y humedad en el techo.'],
];

export const LIMPIEZA_SERVICES = [
  ['limpieza-residencial', 'Limpieza residencial', 'Limpieza profesional de la vivienda.'],
  ['limpieza-profunda', 'Limpieza profunda', 'Limpieza a fondo de la vivienda.'],
  ['lavado-a-presion', 'Lavado a presión', 'Limpieza a presión de superficies exteriores.'],
  ['limpieza-de-techos-y-canaletas', 'Limpieza de techos y canaletas', 'Limpieza de techos y canaletas.'],
];

export function copyFor(r, kind) {
  const T = kind === 'techos';
  const muni = r.municipality;
  const place = `${r.name}, ${muni}, Puerto Rico`;
  const pagePath = `/${r.municipalitySlug}/${r.slug}/${T ? 'sellado-de-techos' : 'limpieza'}`;
  const hubPath = `/${r.municipalitySlug}/${r.slug}`;
  const h1 = T
    ? `Sellado de Techo en ${place} | Ilatek Property Solution`
    : `Servicio de Limpieza en ${place}`;
  const type = r.type || 'comunidad residencial';

  return {
    kind,
    T,
    muni,
    place,
    pagePath,
    hubPath,
    hubUrl: `${COMMUNITY_SITE}${hubPath}`,
    canonical: `${COMMUNITY_SITE}${pagePath}`,
    h1,
    title: h1,
    desc: T
      ? `Sellado de techo en ${place}. Conozca los sistemas de sellado residencial de Ilatek y solicite su cotización de techos.`
      : `Servicio de limpieza en ${place}. Conozca los servicios de limpieza residencial de Ilatek y reserve su limpieza.`,
    keywords: T
      ? [`sellado de techo ${r.name}`, `sellado de techos ${muni}`, 'sellado de techos Puerto Rico', 'impermeabilización de techos', 'Ilatek Property Solution']
      : [`servicio de limpieza ${r.name}`, `limpieza residencial ${muni}`, 'limpieza residencial Puerto Rico', 'limpieza de techos y canaletas', 'Ilatek Property Solution'],
    services: T ? TECHOS_SERVICES : LIMPIEZA_SERVICES,
    cta: T
      ? { href: COTIZACION_TECHOS, text: 'Sellame el Techo' }
      : { href: COTIZACION_LIMPIEZA, text: 'Reserva tu Limpieza' },
    faqs: T
      ? [
          [`¿Ofrecen sellado de techo en ${r.name}, ${muni}?`, `Ilatek atiende sellado de techo residencial en ${muni}, Puerto Rico. Confirme la disponibilidad exacta en ${r.name} al solicitar la cotización.`],
          [`¿Qué tipo de comunidad es ${r.name}?`, `Tipo de comunidad según fuentes públicas consultadas el ${r.dateVerified}: ${type}.`],
          ['¿Cuándo conviene sellar un techo?', 'Conviene revisar el techo cuando aparecen grietas, manchas de humedad, desprendimiento de la capa protectora o filtraciones. Una inspección define el sistema adecuado.'],
          ['¿Qué materiales se usan para sellar un techo?', 'Silicona, membrana asfáltica, elastomérico, poliuretano o acrílico, según el tipo de techo y su estado.'],
        ]
      : [
          [`¿Ofrecen limpieza residencial en ${r.name}, ${muni}?`, `Ilatek ofrece limpieza residencial en ${muni}, Puerto Rico. Confirme la disponibilidad exacta en ${r.name} al solicitar la reserva.`],
          [`¿Qué tipo de comunidad es ${r.name}?`, `Tipo de comunidad según fuentes públicas consultadas el ${r.dateVerified}: ${type}.`],
          ['¿Qué servicios de limpieza puedo solicitar?', 'Limpieza residencial, limpieza profunda, lavado a presión y limpieza de techos y canaletas.'],
          ['¿Cómo reservo la limpieza?', 'Use el botón Reserva tu Limpieza de esta página para ir al formulario de cotización.'],
        ],
  };
}

// Página de la comunidad: una URL canónica por comunidad
// (comunidades.ilatekpr.com/<municipio>/<comunidad>) que enlaza sus dos
// páginas de servicio y los dos formularios de cotización.
export function hubCopy(r) {
  const muni = r.municipality;
  const place = `${r.name}, ${muni}, Puerto Rico`;
  const pagePath = `/${r.municipalitySlug}/${r.slug}`;
  const type = r.type || 'comunidad residencial';
  const c = copyFor(r, 'techos');

  return {
    ...c,
    kind: 'hub',
    pagePath,
    hubPath: pagePath,
    hubUrl: `${COMMUNITY_SITE}${pagePath}`,
    canonical: `${COMMUNITY_SITE}${pagePath}`,
    h1: `Servicios de techos y limpieza en ${place}`,
    title: `Techos y limpieza en ${place} | Ilatek Property Solution`,
    desc: `Sellado de techos y limpieza residencial en ${place}. Conoce los servicios de Ilatek para esta comunidad y solicita tu cotización.`,
    keywords: [`${r.name} ${muni}`, `servicios para comunidades ${muni}`, 'sellado de techos Puerto Rico', 'limpieza residencial Puerto Rico', 'Ilatek Property Solution'],
    services: [...TECHOS_SERVICES, ...LIMPIEZA_SERVICES],
    type,
    hubLinks: [
      { href: `${COMMUNITY_SITE}${pagePath}/sellado-de-techos`, text: 'Sellado de techos' },
      { href: `${COMMUNITY_SITE}${pagePath}/limpieza`, text: 'Limpieza residencial' },
    ],
    cta: { href: COTIZACION_TECHOS, text: 'Cotiza tu techo' },
    ctaLimpieza: { href: COTIZACION_LIMPIEZA, text: 'Cotiza tu limpieza' },
    faqs: [
      [`¿Ilatek presta servicios en ${r.name}, ${muni}?`, `Ilatek presta sellado de techos y limpieza residencial en ${muni}, Puerto Rico. Confirme la disponibilidad exacta en ${r.name} al solicitar su cotización.`],
      [`¿Qué tipo de comunidad es ${r.name}?`, `Tipo de comunidad según fuentes públicas consultadas el ${r.dateVerified}: ${type}.`],
      ['¿Cómo cotizo?', 'Solicite su cotización de techos o de limpieza desde esta página: cada servicio lleva a su propio formulario de reserva.'],
    ],
  };
}

export { MAIN_SITE };
