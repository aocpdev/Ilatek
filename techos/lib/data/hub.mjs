// Ilatek · Techos · Hub de sección /techos.
import { mk, pic, CDN } from '../kit.mjs';

export const hub = mk({
  slug: 'techos',
  role: 'hub',
  eyebrow: 'Ilatek Techos',
  noun: 'reparación y sellado de techos',
  h1before: 'Reparación y Sellado de Techos en',
  h1em: 'Puerto Rico',
  h1after: '.',
  metaTitle: 'Reparación y Sellado de Techos en Puerto Rico | Ilatek Techos',
  metaDescription:
    'Reparación y sellado de techos en Puerto Rico: goteras, filtraciones, impermeabilización y mantenimiento. Precios desde $2.50 por pie², inspección gratis y 78 municipios.',
  hero: pic('industrial', {
    alt: 'Reparación y sellado de techos de Ilatek Techos en Puerto Rico — {{custom_values.county_name_and_state}}',
    title: 'Reparación y Sellado de Techos en Puerto Rico · Ilatek Techos',
    badge: 'Inspección gratis · Garantía escrita',
  }),
  incl: pic('postconstruccion', {
    alt: 'Equipo de Ilatek Techos reparando y sellando techos en Puerto Rico',
    title: 'Ilatek Techos · Puerto Rico',
    caption: 'Reparación · Sellado · Mantenimiento',
  }),
  heroSub:
    'Ilatek Techos repara, sella e impermeabiliza techos en {{custom_values.county_name_and_state}}: <b>reparación de goteras y filtraciones desde $250</b> y <b>sellado desde $2.50 por pie²</b>. Inspección gratis, garantía por escrito y cobertura en los 78 municipios de Puerto Rico.',
  facts: [
    { b: '$2.50', s: 'por pie²', label: 'Sellado de techos' },
    { b: '$250', s: 'reparaciones', label: 'Desde' },
    { b: '78', s: 'municipios', label: 'Cobertura en PR' },
  ],
  benefits: [
    { icon: 'shield', h: 'Reparación y sellado', p: 'Cubrimos todo el ciclo: desde una gotera puntual hasta el sellado completo de tu techo, con garantía por escrito.' },
    { icon: 'drop', h: 'Todo tipo de techo', p: 'Concreto, losas, techos planos, zinc, asfalto, teja y madera: cada superficie con el sistema que le corresponde.' },
    { icon: 'tag', h: 'Precio claro por pie²', p: 'Cotización transparente por pie² o por servicio, con inspección gratis y sin sorpresas al final.' },
  ],
  benTitle: 'Un solo equipo para todo tu techo.',
  incluye: {
    title: 'Todo lo que hacemos en tu techo.',
    answer:
      '<b>Ilatek Techos es la división de techos de Ilatek.</b> Reparamos filtraciones y goteras, sellamos e impermeabilizamos superficies, damos mantenimiento preventivo e instalamos techos nuevos — con inspección gratis y garantía escrita.',
    checks: [
      'Reparación de goteras y filtraciones',
      'Sellado e impermeabilización de techos',
      'Tratamiento por tipo de techo',
      'Mantenimiento preventivo programado',
      'Despeje de techos, canaletas y lavado a presión',
      'Instalación y reemplazo de techos',
    ],
    cta: 'Solicita tu cotización',
  },
  extra: {
    eyebrow: 'Servicios',
    title: 'Todos los servicios de techos en {{custom_values.county_name_and_state}}.',
    lead: 'Ilatek Techos repara, sella e impermeabiliza techos en toda la isla. Elige una categoría y entra directo al servicio que necesitas en {{custom_values.county_name_and_state}}.',
    kids: [
      { slug: 'reparacion-de-techos', name: 'Reparación de Techos', desc: 'Goteras, filtraciones, grietas, empozamientos, oxidación y reparación post-huracán.' },
      { slug: 'sellado-de-techos', name: 'Sellado de Techos', desc: 'Silicona 100%, membrana asfáltica, elastomérico, poliuretano y acrílico.' },
      { slug: 'impermeabilizacion-de-techos', name: 'Impermeabilización y Tipos de Techo', desc: 'Concreto, techos planos, zinc, asfalto, teja y madera, cada uno con su sistema.' },
      { slug: 'techos-por-segmento', name: 'Techos por Segmento', desc: 'Soluciones para propiedades residenciales, comerciales e industriales.' },
      { slug: 'inspeccion-y-mantenimiento-de-techos', name: 'Inspección y Mantenimiento', desc: 'Inspección gratis, planes desde $58/mes, despeje de techos, canaletas y lavado a presión.' },
    ],
    cta: { slug: 'cotizacion', label: 'Solicita tu cotización gratis' },
    // Carrusel 3D del hub: tarjeta destacada (mantenimiento y tratamiento) +
    // una tarjeta por categoría (madre). Cada una con su foto real de la
    // librería de GHL, kicker y 3 viñetas para la vista frontal expandida.
    cards: [
      {
        slug: 'mantenimiento-de-techos',
        // Madre de la que cuelga: sus hermanas llenan la columna que quedaba vacia.
        parent: 'inspeccion-y-mantenimiento-de-techos',
        kicker: 'Lo más solicitado',
        icon: 'clock',
        name: 'Mantenimiento y tratamiento',
        desc: 'El servicio que más piden en Puerto Rico: inspección, limpieza y tratamiento preventivo para que tu techo dure y no vuelva a gotear.',
        img: CDN + '6ac046fa2c503e697d5ff288.jpg',
        feat: ['Inspección gratis', 'Moho y oxidación', 'Plan desde $58/mes', 'Informe con fotos'],
        featured: true,
      },
      {
        slug: 'reparacion-de-techos',
        kicker: 'Reparación',
        icon: 'drop',
        name: 'Reparación de Techos',
        desc: 'Goteras, filtraciones, grietas, empozamientos, oxidación y reparación post-huracán con garantía escrita.',
        img: CDN + '6ac046f57bca8cd20c4021df.jpg',
        feat: ['Goteras desde $250', 'Grietas y empozamientos', 'Post-huracán', 'Garantía escrita'],
      },
      {
        slug: 'sellado-de-techos',
        kicker: 'Sellado',
        icon: 'shield',
        name: 'Sellado de Techos',
        desc: 'Silicona 100%, membrana asfáltica, elastomérico, poliuretano y acrílico: el sistema correcto para cada superficie.',
        img: CDN + '6ac046f585f560d1666999aa.jpg',
        feat: ['Silicona y poliuretano', 'Membrana y elastomérico', 'Desde $2.50 por pie²', 'Garantía escrita'],
      },
      {
        slug: 'impermeabilizacion-de-techos',
        kicker: 'Impermeabilización',
        icon: 'drop',
        name: 'Impermeabilización y Tipos de Techo',
        desc: 'Concreto, techos planos, zinc, asfalto, teja y madera, cada uno impermeabilizado con el sistema que le corresponde.',
        img: CDN + '6ac046f802569bee7cbccc2c.jpg',
        feat: ['Concreto, zinc y teja', 'Techos planos', 'Sistema por tipo', 'Garantía escrita'],
      },
      {
        slug: 'techos-por-segmento',
        kicker: 'Por segmento',
        icon: 'home',
        name: 'Techos por Segmento',
        desc: 'Soluciones para propiedades residenciales, comerciales e industriales, con logística adaptada a cada espacio.',
        img: CDN + '6ac046f8f30b488137bfa4ee.jpg',
        feat: ['Residencial y comercial', 'Industrial', 'Sin cerrar tu operación', 'Garantía escrita'],
      },
      {
        slug: 'inspeccion-y-mantenimiento-de-techos',
        kicker: 'Inspección',
        icon: 'clock',
        name: 'Inspección y Mantenimiento',
        desc: 'Inspección gratis, planes desde $58/mes, despeje de techos, canaletas y lavado a presión programado.',
        img: CDN + '6ac046f82c503e697d5ff24e.jpg',
        feat: ['Inspección gratis', 'Limpieza y canaletas', 'Instalación y reemplazo', 'Informe con fotos'],
      },
    ],
  },
  faqTitle: 'Preguntas frecuentes sobre techos.',
  faq: [
    { q: '¿Qué hace Ilatek Techos en Puerto Rico?', a: 'Ilatek Techos es la división de techos de Ilatek: <b>reparamos, sellamos e impermeabilizamos techos</b> de concreto, zinc, asfalto, teja, madera y techos planos, además de mantenimiento, despeje e instalación de techos nuevos.' },
    { q: '¿Cuánto cuesta reparar o sellar un techo?', a: 'Las reparaciones <b>comienzan desde $250</b> (goteras, filtraciones, grietas) y el sellado <b>desde $2.50 por pie²</b> instalado. El precio final depende del tipo de techo y el alcance. Recibe tu número en minutos con el cotizador.' },
    { q: '¿La inspección del techo es gratis?', a: '<b>Sí.</b> La inspección y el diagnóstico de tu techo son totalmente gratis y sin compromiso: subimos, identificamos el estado y te explicamos las opciones.' },
    { q: '¿Qué tipos de techo cubren?', a: 'Cubrimos <b>concreto y losas, techos planos con membrana, zinc y metal, asfalto (shingles), teja y madera</b>. Cada uno se trata con el sistema y sellador que le corresponde.' },
    { q: '¿Trabajan residencial, comercial e industrial?', a: '<b>Sí.</b> Atendemos hogares, comercios y plantas industriales, con sistemas y logística adaptados a cada segmento — incluso trabajando sin que tengas que cerrar.' },
    { q: '¿Los trabajos tienen garantía?', a: '<b>Sí.</b> Cada reparación, sellado e instalación se entrega con garantía de mano de obra por escrito. Si algo falla en el periodo cubierto, regresamos.' },
    { q: '¿En qué municipios brindan servicio?', a: 'Brindamos servicio en los <b>78 municipios de Puerto Rico</b>, incluyendo {{custom_values.county_name_and_state}}. Reserva con el depósito descontable de $50 al confirmar tu visita.' },
    { q: '¿Por qué elegir Ilatek Techos?', a: 'Porque cubrimos todo el techo en un solo proveedor: <b>reparación desde $250, sellado desde $2.50 por pie²</b>, inspección gratis, garantía escrita y materiales certificados — con el respaldo de Ilatek.' },
  ],
});
