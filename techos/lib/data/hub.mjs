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
    'Reparación y sellado de techos en Puerto Rico: goteras, filtraciones, impermeabilización y mantenimiento. Precios desde $250, agenda con $50 descontables del total y 78 municipios.',
  hero: pic('industrial', {
    alt: 'Reparación y sellado de techos de Ilatek Techos en Puerto Rico — {{custom_values.business__county_name}}',
    title: 'Reparación y Sellado de Techos en Puerto Rico · Ilatek Techos',
    badge: 'Agenda con $50 descontables del total · Garantía escrita',
  }),
  incl: pic('postconstruccion', {
    alt: 'Equipo de Ilatek Techos reparando y sellando techos en Puerto Rico',
    title: 'Ilatek Techos · Puerto Rico',
    caption: 'Reparación · Sellado · Mantenimiento',
  }),
  heroSub:
    'Ilatek Techos repara, sella e impermeabiliza techos en {{custom_values.business__county_name}}: <b>reparación de goteras, filtraciones y sellado</b>. Agenda con $50 descontables del total, garantía por escrito y cobertura en los 78 municipios de Puerto Rico.',
  facts: [
    { b: '$250', s: 'por servicio', label: 'Sellado de techos' },
    { b: '$250', s: 'reparaciones', label: 'Desde' },
    { b: '78', s: 'municipios', label: 'Cobertura en PR' },
  ],
  benefits: [
    { icon: 'shield', h: 'Reparación y sellado', p: 'Cubrimos todo el ciclo: desde una gotera puntual hasta el sellado completo de tu techo, con garantía por escrito.' },
    { icon: 'drop', h: 'Todo tipo de techo', p: 'Concreto, losas, techos planos, zinc, asfalto, teja y madera: cada superficie con el sistema que le corresponde.' },
    { icon: 'tag', h: 'Precio claro por servicio', p: 'Cotización transparente por servicio o por servicio, con agenda con $50 descontables del total y sin sorpresas al final.' },
  ],
  benTitle: 'Un solo equipo para todo tu techo.',
  incluye: {
    title: 'Todo lo que hacemos en tu techo.',
    answer:
      '<b>Ilatek Techos es la división de techos de Ilatek.</b> Reparamos filtraciones y goteras, sellamos e impermeabilizamos superficies, damos mantenimiento preventivo e instalamos techos nuevos — con agenda con $50 descontables del total y garantía escrita.',
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
    title: 'Todos los servicios de techos en {{custom_values.business__county_name}}.',
    lead: 'Ilatek Techos repara, sella e impermeabiliza techos en toda la isla. Elige una categoría y entra directo al servicio que necesitas en {{custom_values.business__county_name}}.',
    kids: [
      { slug: 'reparacion-de-techos', name: 'Reparación de Techos', desc: 'Goteras, filtraciones, grietas, empozamientos, oxidación y reparación post-huracán.' },
      { slug: 'sellado-de-techos', name: 'Sellado de Techos', desc: 'Silicona 100%, membrana asfáltica, elastomérico, poliuretano y acrílico.' },
      { slug: 'impermeabilizacion-de-techos', name: 'Impermeabilización y Tipos de Techo', desc: 'Concreto, techos planos, zinc, asfalto, teja y madera, cada uno con su sistema.' },
      { slug: 'techos-por-segmento', name: 'Techos por Segmento', desc: 'Soluciones para propiedades residenciales, comerciales e industriales.' },
      { slug: 'inspeccion-y-mantenimiento-de-techos', name: 'Inspección y Mantenimiento', desc: 'Agenda con $50 descontables del total, mantenimiento desde $250, despeje de techos, canaletas y lavado a presión.' },
    ],
    cta: { slug: 'cotizacion', label: 'Solicita tu cotización por $50 descontables del total' },
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
        img: CDN + '6ac046fa2c503e697d5ff288.jpg', hubWebp: 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/techos/hub/mantenimiento.webp',
        feat: ['Agenda con $50 descontables del total', 'Moho y oxidación', 'Desde $250', 'Informe con fotos'],
        featured: true,
      },
      {
        slug: 'reparacion-de-techos',
        kicker: 'Reparación',
        icon: 'drop',
        name: 'Reparación de Techos',
        desc: 'Goteras, filtraciones, grietas, empozamientos, oxidación y reparación post-huracán con garantía escrita.',
        img: CDN + '6ac046fa2c503e697d5ff288.jpg', hubWebp: 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/techos/hub/reparacion.webp',
        feat: ['Goteras desde $250', 'Grietas y empozamientos', 'Post-huracán', 'Garantía escrita'],
      },
      {
        slug: 'sellado-de-techos',
        kicker: 'Sellado',
        icon: 'shield',
        name: 'Sellado de Techos',
        desc: 'Silicona 100%, membrana asfáltica, elastomérico, poliuretano y acrílico: el sistema correcto para cada superficie.',
        img: CDN + '6ac046f585f560d1666999aa.jpg', hubWebp: 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/techos/hub/sellado.webp',
        feat: ['Silicona y poliuretano', 'Membrana y elastomérico', 'Desde $250', 'Garantía escrita'],
      },
      {
        slug: 'impermeabilizacion-de-techos',
        kicker: 'Impermeabilización',
        icon: 'drop',
        name: 'Impermeabilización y Tipos de Techo',
        desc: 'Concreto, techos planos, zinc, asfalto, teja y madera, cada uno impermeabilizado con el sistema que le corresponde.',
        img: CDN + '6ac046f802569bee7cbccc2c.jpg', hubWebp: 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/techos/hub/impermeabilizacion.webp',
        feat: ['Concreto, zinc y teja', 'Techos planos', 'Sistema por tipo', 'Garantía escrita'],
      },
      {
        slug: 'techos-por-segmento',
        kicker: 'Por segmento',
        icon: 'home',
        name: 'Techos por Segmento',
        desc: 'Soluciones para propiedades residenciales, comerciales e industriales, con logística adaptada a cada espacio.',
        img: CDN + '6ac046f8f30b488137bfa4ee.jpg', hubWebp: 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/techos/hub/segmento.webp',
        feat: ['Residencial y comercial', 'Industrial', 'Sin cerrar tu operación', 'Garantía escrita'],
      },
      {
        slug: 'inspeccion-y-mantenimiento-de-techos',
        kicker: 'Inspección',
        icon: 'clock',
        name: 'Inspección y Mantenimiento',
        desc: 'Agenda con $50 descontables del total, mantenimiento desde $250, despeje de techos, canaletas y lavado a presión programado.',
        img: CDN + '6ac046f82c503e697d5ff24e.jpg', hubWebp: 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/techos/hub/inspeccion.webp',
        feat: ['Agenda con $50 descontables del total', 'Limpieza y canaletas', 'Instalación y reemplazo', 'Informe con fotos'],
      },
    ],
  },
  faqTitle: 'Preguntas frecuentes sobre techos.',
  faq: [
    { q: '¿Qué hace Ilatek Techos en Puerto Rico?', a: 'Ilatek Techos es la división de techos de Ilatek: repara goteras y filtraciones desde $250, sella desde $250, impermeabiliza concreto, zinc, asfalto, teja, madera y techos planos, y da mantenimiento e instalación en los 78 municipios.' },
    { q: '¿Cuánto cuesta reparar o sellar un techo?', a: 'Las reparaciones comienzan desde $250 y el sellado desde $250; el precio por servicio se cotiza desde $250 según el sistema. Un techo promedio arranca en $2,400 y el estimado final se confirma después de la agenda con $50 descontables del total.' },
    { q: '¿Cuánto cuesta la inspección del techo?', a: 'Sí. La inspección y el diagnóstico no tienen costo ni compromiso: subimos al techo, revisamos superficie, juntas y desagüe, y entregamos el alcance por escrito. El trabajo se reserva con un depósito de $50 que se descuenta del total.' },
    { q: '¿Qué tipos de techo cubren?', a: 'Cubrimos concreto y losas, techos planos, zinc y metal, asfalto (shingles), teja y madera. Cada superficie pide un sistema distinto: silicona en losas expuestas, membrana asfáltica donde hay tránsito y acrílico en mantenimiento de techos ya sellados.' },
    { q: '¿Trabajan residencial, comercial e industrial?', a: 'Sí. Atendemos hogares, comercios y plantas industriales con el mismo proceso de inspección, preparación y membrana, y con logística adaptada para no interrumpir tu operación. La cobertura es de 78 municipios y el plazo se define por área y sistema.' },
    { q: '¿Los trabajos tienen garantía?', a: 'Cada trabajo se entrega con garantía escrita de mano de obra sobre materiales certificados. El plazo exacto y las exclusiones se documentan antes de comenzar; no prometemos una duración que no esté respaldada por el fabricante o por el contrato firmado.' },
    { q: '¿En qué municipios brindan servicio?', a: 'Servimos los 78 municipios de Puerto Rico, incluido {{custom_values.business__county_name}}. La visita o inspección cuesta $50, descontables del total, y la fecha se reserva con $50 descontables del total. El tiempo de obra va de 1 a 2 días en acrílico y de 2 a 4 en membrana.' },
    { q: '¿Por qué elegir Ilatek Techos?', a: 'Porque cubre el techo completo con un solo proveedor: reparación desde $250, sellado desde $250, agenda con $50 descontables del total, garantía escrita y precios publicados por sistema. La elección del sistema se hace por sustrato y uso, no por marca.' },
  ],
});
