// Ilatek · Techos · Clúster D — Soluciones por Segmento.
import { mk, pic } from '../kit.mjs';

export const segmentos = [
  mk({
    slug: 'techos-por-segmento',
    role: 'mother',
    eyebrow: 'Por segmento',
    noun: 'sellado de techos por segmento',
    h1before: 'Sellado de Techos Residencial, Comercial e Industrial en',
    h1em: 'Puerto Rico',
    h1after: '.',
    metaTitle: 'Sellado de Techos Residencial, Comercial e Industrial | Ilatek Techos',
    metaDescription:
      'Sellado y reparación de techos residencial, comercial e industrial en Puerto Rico desde $2.50 por pie². Sistemas por segmento con garantía escrita e inspección gratis.',
    hero: pic('industrial', {
      alt: 'Sellado de techos residencial, comercial e industrial de Ilatek Techos en Puerto Rico',
      title: 'Techos por segmento · Ilatek Techos',
      badge: 'Residencial · Comercial · Industrial',
    }),
    incl: pic('comercial', {
      alt: 'Sellado de techo comercial e industrial por Ilatek Techos en Puerto Rico — {{custom_values.county_name_and_state}}',
      title: 'Sellado por segmento · Ilatek Techos',
      caption: 'Sistema según el uso del techo',
    }),
    heroSub:
      'No es lo mismo el techo de una casa que el de un edificio comercial: el tránsito, el tamaño y el horario cambian el sistema. Ilatek sella los tres segmentos en {{custom_values.county_name_and_state}} <b>desde $2.50 por pie²</b>, con garantía escrita.',
    facts: [
      { b: '$2.50', s: 'por pie²', label: 'Precio base' },
      { b: '3', s: 'segmentos', label: 'Cubiertos' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'home', h: 'Residencial sin complicarte', p: 'Coordinamos la visita, protegemos tu espacio y trabajamos sin interrumpir la rutina de tu familia.' },
      { icon: 'tag', h: 'Comercial sin cerrar', p: 'Planificamos el trabajo por fases y horarios para que tu negocio siga operando mientras sellamos el techo.' },
      { icon: 'shield', h: 'Industrial a escala', p: 'Manejo de superficies grandes y exigentes con materiales de alta resistencia y documentación del trabajo.' },
    ],
    benTitle: 'El sistema correcto para el uso de tu techo.',
    incluye: {
      title: 'Qué incluye el sellado según tu segmento.',
      answer:
        '<b>El segmento define el sistema y la logística.</b> Ilatek evalúa tu techo, define el sellador adecuado y planifica el trabajo — horarios, fases y accesos — según sea residencial, comercial o industrial.',
      checks: [
        'Evaluación del techo según el segmento',
        'Sistema de sellado adecuado al uso',
        'Planificación de horarios y fases',
        'Protección del área y equipos',
        'Ejecución con materiales certificados',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu segmento',
    },
    extra: {
      eyebrow: 'Segmentos',
      title: 'Elige el servicio de tu tipo de propiedad.',
      kids: [
        { slug: 'sellado-de-techos-residencial', name: 'Sellado Residencial', desc: 'Casas y hogares: sellado e impermeabilización de techos residenciales con trato cuidado.' },
        { slug: 'sellado-de-techos-comercial', name: 'Sellado Comercial', desc: 'Edificios, tiendas y oficinas: sellado planificado para operar sin cerrar el negocio.' },
        { slug: 'sellado-de-techos-industrial', name: 'Sellado Industrial', desc: 'Naves y plantas: sistemas de alta resistencia para techos de gran superficie.' },
      ],
      cta: { slug: 'cotizacion', label: 'Solicita tu cotización gratis' },
    },
    faq: [
      { q: '¿Cuánto cuesta sellar un techo residencial, comercial o industrial?', a: 'El sellado de techos de Ilatek <b>comienza desde $2.50 por pie²</b> en todos los segmentos. El precio varía según el sistema, el área y el tipo de superficie. Para proyectos grandes cotizamos por pie² con descuento de escala.' },
      { q: '¿Qué diferencia hay entre sellado residencial, comercial e industrial?', a: 'Cambia el <b>sistema y la logística</b>: el residencial prioriza el trato y el cuidado del espacio; el comercial, la continuidad del negocio; el industrial, la escala y la resistencia de los materiales.' },
      { q: '¿Trabajan en edificios comerciales sin cerrar el negocio?', a: '<b>Sí.</b> Planificamos por fases y horarios para que tu negocio siga operando mientras sellamos el techo, minimizando interrupciones.' },
      { q: '¿Sellan techos industriales de gran superficie?', a: 'Sí: manejamos <b>naves, plantas y galpones</b> de gran tamaño con membranas y sistemas de alta resistencia, y documentamos el trabajo para tu expediente.' },
      { q: '¿Usan el mismo producto para todos los segmentos?', a: '<b>No.</b> El producto depende de la superficie, el tránsito y la exposición. Un techo residencial suele llevar silicona; uno comercial con equipos, membrana o poliuretano.' },
      { q: '¿Ofrecen factura para negocios?', a: '<b>Sí.</b> Emitimos factura e informamos el alcance del trabajo por escrito, útil para gastos operativos y para reclamos si aplica.' },
      { q: '¿El sellado comercial e industrial tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito en todos los segmentos, con materiales certificados.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Adaptamos sistema y logística a tu tipo de propiedad, <b>desde $2.50 por pie²</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'sellado-de-techos-residencial',
    eyebrow: 'Sellado residencial',
    noun: 'sellado de techos residencial',
    h1before: 'Sellado de Techos Residencial en',
    h1em: 'Puerto Rico',
    h1after: ' para tu hogar.',
    metaTitle: 'Sellado de Techos Residencial en Puerto Rico | Ilatek Techos',
    metaDescription:
      'Sellado de techos residencial en Puerto Rico desde $2.50 por pie². Protege tu hogar de filtraciones con inspección gratis y garantía escrita. 78 municipios.',
    hero: pic('residencial', { alt: 'Sellado de techo residencial en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Sellado de techos residencial · Ilatek Techos', badge: 'Para tu hogar' }),
    incl: pic('postconstruccion', { alt: 'Sellado de techo de residencia por Ilatek Techos en Puerto Rico — protección de hogar', title: 'Sellado residencial · Ilatek Techos', caption: 'Tu casa protegida · Trato cuidado' }),
    heroSub:
      'Tu casa merece un techo que no gotee. Ilatek sella techos residenciales en {{custom_values.county_name_and_state}} <b>desde $2.50 por pie²</b>: protegemos tu hogar de las filtraciones sin complicarte, con inspección gratis y garantía escrita.',
    facts: [
      { b: '$2.50', s: 'por pie²', label: 'Precio base' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'home', h: 'Trato cuidado', p: 'Protegemos tu espacio, trabajamos ordenados y dejamos la casa limpia: el servicio pensado para hogares.' },
      { icon: 'shield', h: 'Protege tu inversión', p: 'El techo es la primera defensa de tu casa: sellarlo a tiempo evita daños caros en el interior.' },
      { icon: 'tag', h: 'Precio por pie²', p: 'Pagas por lo que mide tu techo, con cotización clara y por escrito, sin sorpresas.' },
    ],
    incluye: {
      title: 'Qué incluye el sellado de tu casa.',
      answer:
        '<b>Un buen sellado residencial se prepara antes de aplicarse.</b> Ilatek limpia el techo, corrige grietas y empozamientos, aplica primer y coloca el sellador adecuado para el material de tu casa.',
      checks: [
        'Inspección del techo de tu casa',
        'Lavado a presión del techo',
        'Sellado de grietas y filtraciones',
        'Corrección de empozamientos',
        'Aplicación del sistema de sellado',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza el sellado de tu casa',
    },
    extra: {
      eyebrow: 'Ideal para',
      title: 'Cuándo sellar el techo de tu casa.',
      items: [
        { tag: 'Señales', h: 'Notas manchas o humedad', p: 'Si aparecen manchas o humedad en el techo interior, el techo necesita sellado y reparación ya.' },
        { tag: 'Tiempo', h: 'Tiene más de 5 años sellado', p: 'Si no recuerdas cuándo se selló, probablemente ya cumplió su ciclo y conviene revisarlo.' },
        { tag: 'Prevención', h: 'Antes del huracán', p: 'Sellar antes de la temporada de lluvias te deja tranquilo cuando llegue la tormenta.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta sellar un techo residencial?', a: 'El sellado de techos residencial de Ilatek <b>comienza desde $2.50 por pie²</b>. Un techo típico de 1,200 pies² se cotiza en minutos. El precio final depende del sistema y la condición del techo.' },
      { q: '¿Cada cuánto se sella el techo de una casa?', a: 'En Puerto Rico recomendamos revisar el techo <b>una vez al año</b> y sellar cada 5 a 10 años, según el sistema. La silicona 100% dura de 20 a 25 años; el acrílico, de 7 a 10.' },
      { q: '¿Tengo que estar en la casa durante el trabajo?', a: 'No es obligatorio, pero <b>te recomendamos estar para la inspección y para recibir el trabajo</b>. Coordinamos la visita según tu disponibilidad.' },
      { q: '¿Protegen las plantas y muebles del patio?', a: 'Sí: <b>cubrimos y protegemos</b> lo que esté en el área de trabajo y dejamos el patio como estaba.' },
      { q: '¿Qué sistema de sellado conviene para mi casa?', a: 'Depende del techo: para <b>losas de concreto</b> suele ir silicona o membrana; para <b>techos planos</b>, silicona o membrana; para techos de zinc, tratamiento anticorrosivo. Lo definimos en la inspección.' },
      { q: '¿Cuánto tarda el sellado de una casa?', a: 'Un techo residencial típico se sella en <b>1 a 3 días</b>, según el área y el sistema. Te damos el estimado en la cotización.' },
      { q: '¿El sellado residencial tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito; si el sellado falla en el periodo cubierto, regresamos.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Protegemos tu casa con el sistema correcto, trato cuidado y <b>precio por pie² desde $2.50</b>, inspección gratis y garantía escrita en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'sellado-de-techos-comercial',
    eyebrow: 'Sellado comercial',
    noun: 'sellado de techos comercial',
    h1before: 'Sellado de Techos Comercial en',
    h1em: 'Puerto Rico',
    h1after: ' sin cerrar tu negocio.',
    metaTitle: 'Sellado de Techos Comercial en Puerto Rico | Ilatek Techos',
    metaDescription:
      'Sellado de techos comercial en Puerto Rico desde $2.50 por pie². Trabajo planificado para operar sin cerrar. Inspección gratis y garantía escrita. 78 municipios.',
    hero: pic('comercial', { alt: 'Sellado de techo comercial en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Sellado de techos comercial · Ilatek Techos', badge: 'Sin cerrar tu negocio' }),
    incl: pic('industrial', { alt: 'Sellado de techo comercial por Ilatek Techos en Puerto Rico — edificios y oficinas', title: 'Sellado comercial · Ilatek Techos', caption: 'Por fases · Horarios flexibles' }),
    heroSub:
      'Una filtración en tu negocio cuesta ventas y clientes. Ilatek sella techos comerciales en {{custom_values.county_name_and_state}} <b>desde $2.50 por pie²</b>, planificando el trabajo para que no tengas que cerrar, con inspección gratis y garantía escrita.',
    facts: [
      { b: '$2.50', s: 'por pie²', label: 'Precio base' },
      { b: '3', s: 'turnos', label: 'Horarios flexibles' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'tag', h: 'Opera sin cerrar', p: 'Planificamos por fases y en horarios que no afecten tus horas pico, para que tu negocio siga abierto.' },
      { icon: 'shield', h: 'Protege tu inventario', p: 'Una filtración puede dañar mercancía y equipos. Sellamos para que el agua no amenace tu operación.' },
      { icon: 'clock', h: 'Menos interrupción', p: 'Trabajamos eficiente y coordinado con tu equipo, reduciendo el tiempo de trabajo sobre el techo.' },
    ],
    incluye: {
      title: 'Qué incluye el sellado comercial.',
      answer:
        '<b>En un techo comercial, la logística es tan importante como el material.</b> Ilatek evalúa la superficie, define el sistema resistente al uso y planifica fases y horarios para no interrumpir la operación.',
      checks: [
        'Evaluación del techo y del uso comercial',
        'Sistema resistente al tránsito de equipos',
        'Planificación por fases y horarios',
        'Protección de equipos y áreas',
        'Ejecución con membranas certificadas',
        'Garantía por escrito y documentación',
      ],
      cta: 'Cotiza tu techo comercial',
    },
    extra: {
      eyebrow: 'Ideal para',
      title: 'Negocios que protegemos.',
      items: [
        { tag: 'Retail', h: 'Tiendas y comercios', p: 'Donde el techo cubre inventario sensible a la humedad y las filtraciones dañan mercancía.' },
        { tag: 'Oficinas', h: 'Oficinas y edificios', p: 'Techos con equipos de aire y cableado que no pueden mojarse.' },
        { tag: 'Servicios', h: 'Restaurantes y clínicas', p: 'Espacios donde una filtración afecta la operación y la experiencia del cliente.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta sellar un techo comercial?', a: 'El sellado de techos comercial de Ilatek <b>comienza desde $2.50 por pie²</b>, con descuentos por escala en superficies grandes. El precio depende del área, el sistema y el acceso. Cotizamos por proyecto.' },
      { q: '¿Tengo que cerrar mi negocio para el trabajo?', a: '<b>No es necesario.</b> Planificamos por fases y en horarios que no afecten tu operación; en la mayoría de los casos el negocio sigue abierto durante el sellado.' },
      { q: '¿Trabajan de noche o en fin de semana?', a: '<b>Podemos coordinar horarios fuera de tu hora pico</b>, incluyendo noches o fines de semana si el negocio lo requiere. Se define al cotizar.' },
      { q: '¿Qué sistema usan en techos comerciales?', a: 'Normalmente <b>membranas (TPO, EPDM o asfáltica) y poliuretano</b>, porque resisten el tránsito y los equipos sobre la azotea. Elegimos según el uso del techo.' },
      { q: '¿Protegen los equipos de la azotea?', a: '<b>Sí.</b> Cubrimos y protegemos aires acondicionados, ductos y cableado antes de aplicar el sellador, y los dejamos limpios al terminar.' },
      { q: '¿Dan factura y documentación?', a: '<b>Sí.</b> Emitimos factura e informamos el alcance por escrito; también documentamos con fotos el antes y el después cuando se solicita.' },
      { q: '¿El sellado comercial tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito, con membranas y materiales certificados.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Sellamos tu techo comercial sin detener tu operación, <b>desde $2.50 por pie²</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'sellado-de-techos-industrial',
    eyebrow: 'Sellado industrial',
    noun: 'sellado de techos industrial',
    h1before: 'Sellado de Techos Industrial en',
    h1em: 'Puerto Rico',
    h1after: ' para grandes superficies.',
    metaTitle: 'Sellado de Techos Industrial en Puerto Rico | Ilatek Techos',
    metaDescription:
      'Sellado de techos industrial en Puerto Rico. Sistemas de alta resistencia para naves y plantas. Cotización por pie² con inspección gratis y garantía escrita.',
    hero: pic('industrial', { alt: 'Sellado de techo industrial en Puerto Rico — naves y plantas en {{custom_values.county_name_and_state}}', title: 'Sellado de techos industrial · Ilatek Techos', badge: 'Alta resistencia' }),
    incl: pic('comercial', { alt: 'Sellado de techo industrial por Ilatek Techos en Puerto Rico — gran superficie', title: 'Sellado industrial · Ilatek Techos', caption: 'Grandes superficies · Materiales de alta resistencia' }),
    heroSub:
      'Las naves y plantas exigen techos que resistan calor, tránsito y grandes superficies. Ilatek sella techos industriales en {{custom_values.county_name_and_state}} con sistemas de alta resistencia <b>desde $2.50 por pie²</b>, con cotización por escala e inspección gratis con garantía escrita.',
    facts: [
      { b: 'Alta', s: 'resistencia', label: 'Sistemas industriales' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'shield', h: 'Materiales de alta resistencia', p: 'Usamos membranas y sistemas capaces de soportar el tránsito, el calor y los equipos propios de una operación industrial.' },
      { icon: 'tag', h: 'Escala y eficiencia', p: 'Manejamos grandes superficies con planificación por fases y precios por pie² con descuento por volumen.' },
      { icon: 'clock', h: 'Coordinación operativa', p: 'Trabajamos con tu equipo de mantenimiento para no interrumpir la producción ni la seguridad de la planta.' },
    ],
    incluye: {
      title: 'Qué incluye el sellado industrial.',
      answer:
        '<b>En industrial, el sistema se diseña para la operación.</b> Ilatek evalúa la superficie y el uso, propone el sistema de mayor resistencia y lo ejecuta coordinando con tu operación, con documentación y garantía.',
      checks: [
        'Evaluación técnica de la superficie',
        'Sistema de sellado de alta resistencia',
        'Planificación por fases con tu equipo',
        'Protección de equipos y seguridad',
        'Ejecución con membranas certificadas',
        'Documentación y garantía por escrito',
      ],
      cta: 'Solicita cotización industrial',
    },
    extra: {
      eyebrow: 'Entornos',
      title: 'Superficies industriales que sellamos.',
      items: [
        { tag: 'Naves', h: 'Naves y galpones', p: 'Techos amplios de poca pendiente donde la membrana continua ofrece la mejor barrera.' },
        { tag: 'Plantas', h: 'Plantas de producción', p: 'Techos con equipos y ductos que requieren sellado resistente y coordinación operativa.' },
        { tag: 'Almacenes', h: 'Almacenes y centros de distribución', p: 'Donde una filtración amenaza inventario y equipos de valor.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta sellar un techo industrial?', a: 'El sellado industrial de Ilatek se cotiza <b>por pie² con tarifa de escala</b>, partiendo de $2.50 por pie². Para grandes superficies el precio por pie² baja. Cotizamos el proyecto con visita técnica.' },
      { q: '¿Qué sistemas usan en techos industriales?', a: 'Principalmente <b>membranas TPO, EPDM y asfálticas modificadas de gran espesor</b>, elegidas por resistencia al tránsito, al calor y al punzonamiento propio de la operación.' },
      { q: '¿Trabajan sin interrumpir la producción?', a: '<b>Sí.</b> Coordinamos por fases con tu equipo de mantenimiento y respetamos los protocolos de seguridad de la planta para no detener la operación.' },
      { q: '¿Manejan techos de gran tamaño?', a: 'Sí: <b>naves, plantas, galpones y almacenes</b> de gran superficie, con planificación de recursos y cronograma por etapas.' },
      { q: '¿Documentan el trabajo para auditorías?', a: '<b>Sí.</b> Podemos documentar el alcance y el antes/después con fotos, útil para expedientes de mantenimiento y reclamos de seguro.' },
      { q: '¿Cuánto tiempo toma un proyecto industrial?', a: 'Depende del área: un proyecto industrial puede tomar <b>varias semanas</b>. Entregamos un cronograma por fases en la propuesta.' },
      { q: '¿El sellado industrial tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito con membranas certificadas y proceso documentado.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Sistemas de alta resistencia, manejo de gran escala y coordinación operativa, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),
];
