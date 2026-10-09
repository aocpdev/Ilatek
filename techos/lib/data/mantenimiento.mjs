// Ilatek · Techos · Clúster E — Inspección, Mantenimiento y Complementos.
import { mk, pic } from '../kit.mjs';

export const mantenimiento = [
  mk({
    slug: 'inspeccion-y-mantenimiento-de-techos',
    role: 'mother',
    eyebrow: 'Inspección y mantenimiento',
    noun: 'inspección y mantenimiento de techos',
    h1before: 'Inspección y Mantenimiento de Techos en',
    h1em: 'Puerto Rico',
    h1after: '.',
    metaTitle: 'Inspección y Mantenimiento de Techos | Ilatek Techos',
    metaDescription:
      'Inspección de techos gratis y mantenimiento preventivo en Puerto Rico desde $58 al mes. Limpieza de techos, canaletas, lavado a presión y más. 78 municipios.',
    hero: pic('presion', {
      alt: 'Inspección y mantenimiento de techos de Ilatek Techos en Puerto Rico — {{custom_values.county_name_and_state}}',
      title: 'Inspección y mantenimiento de techos · Ilatek Techos',
      badge: 'Inspección gratis',
    }),
    incl: pic('postconstruccion', {
      alt: 'Mantenimiento preventivo de techos por Ilatek Techos en Puerto Rico — limpieza y revisión',
      title: 'Mantenimiento de techos · Ilatek Techos',
      caption: 'Inspección · Limpieza del techo · Prevención',
    }),
    heroSub:
      'El mejor momento para tu techo es antes de que falle. Ilatek inspecciona tu techo <b>gratis</b> y da mantenimiento preventivo en {{custom_values.county_name_and_state}} <b>desde $58 al mes</b>, con limpieza, canaletas, lavado y garantía escrita.',
    facts: [
      { b: '$0', s: 'inspección', label: 'Diagnóstico gratis' },
      { b: '$58', s: 'al mes', label: 'Plan de mantenimiento' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'clock', h: 'Prevenir cuesta menos', p: 'Mantener el techo evita goteras y reparaciones caras. Actuar en la inspección anual sale mucho más barato que reparar el daño.' },
      { icon: 'shield', h: 'Plan a tu medida', p: 'Definimos un plan de mantenimiento según tu techo y su exposición, con visitas programadas.' },
      { icon: 'drop', h: 'Todo el techo cuidado', p: 'Limpieza, canaletas, desagües, lavado y sellado preventivo: un solo responsable para el cuidado de tu techo.' },
    ],
    benTitle: 'Cuida tu techo antes de que te cueste caro.',
    incluye: {
      title: 'Qué incluye el cuidado de tu techo.',
      answer:
        '<b>La inspección es gratuita y el mantenimiento es a la medida.</b> Ilatek revisa el techo, limpia, despeja desagües y canaletas, lava a presión y aplica el sellado preventivo que tu techo necesita.',
      checks: [
        'Inspección completa del techo sin costo',
        'Limpieza de escombros y hojas del techo',
        'Limpieza de canaletas y bajantes',
        'Lavado a presión de la superficie',
        'Sellado preventivo de fallas menores',
        'Informe con fotos y garantía escrita',
      ],
      cta: 'Solicita tu inspección gratis',
    },
    extra: {
      eyebrow: 'Servicios',
      title: 'Todo lo que necesita tu techo.',
      kids: [
        { slug: 'inspeccion-de-techos', name: 'Inspección de Techos', desc: 'Evaluación completa y gratis de tu techo, con informe fotográfico y recomendaciones.' },
        { slug: 'mantenimiento-de-techos', name: 'Mantenimiento Preventivo', desc: 'Plan de visitas periódicas desde $58 al mes para mantener tu techo protegido.' },
        { slug: 'limpieza-de-techos-y-canaletas', name: 'Limpieza de Techos y Canaletas', desc: 'Removemos hojas, arena y escombros que obstruyen el drenaje de tu techo.' },
        { slug: 'canaletas-y-bajantes', name: 'Canaletas y Bajantes', desc: 'Limpieza, reparación e instalación de canaletas y bajantes para que el agua corra.' },
        { slug: 'lavado-a-presion-techos', name: 'Lavado a Presión de Techos', desc: 'Limpieza profunda a presión que prepara y alarga la vida del techo.' },
        { slug: 'tragaluces', name: 'Tragaluces / Skylights', desc: 'Sellado e instalación de tragaluces sin filtraciones ni humedad.' },
        { slug: 'instalacion-y-reemplazo-de-techos', name: 'Instalación y Reemplazo', desc: 'Techos nuevos y reemplazo completo cuando reparar ya no es suficiente.' },
      ],
      cta: { slug: 'cotizacion', label: 'Solicita tu cotización gratis' },
    },
    faq: [
      { q: '¿Cuánto cuesta inspeccionar y dar mantenimiento a un techo?', a: 'La <b>inspección de techos de Ilatek es gratis</b>. El mantenimiento preventivo comienza <b>desde $58 al mes</b> y varía según el tamaño del techo y las visitas necesarias. Cotiza para tu plan.' },
      { q: '¿Cuántas veces al año debo darle mantenimiento al techo?', a: 'Recomendamos <b>al menos una inspección anual</b> y limpieza de canaletas dos veces al año. Techos en zonas costeras o con árboles cerca pueden necesitar más frecuencia.' },
      { q: '¿Por qué dar mantenimiento si mi techo está bien?', a: 'Porque <b>prevenir cuesta mucho menos que reparar</b>. El mantenimiento detecta fallas tempranas, cuando aún son baratas, y evita goteras y daños estructurales.' },
      { q: '¿El plan de mantenimiento incluye reparaciones?', a: 'El plan incluye <b>inspección, limpieza, desagües y sellado preventivo</b>. Las reparaciones mayores se cotizan por separado, pero como cliente del plan tienes prioridad y visitas programadas.' },
      { q: '¿Qué revisan en la inspección de techos?', a: 'Revisamos <b>grietas, selladores vencidos, empozamientos, desagües, canaletas, uniones y remates</b>. Te entregamos un informe con fotos y las recomendaciones por prioridad.' },
      { q: '¿La inspección tiene algún costo o compromiso?', a: '<b>No.</b> La inspección es gratis y sin compromiso: te explicamos el estado de tu techo y las opciones, y decides con calma.' },
      { q: '¿Ofrecen mantenimiento a negocios y comercios?', a: 'Sí: planes de mantenimiento para <b>techos comerciales e industriales</b>, con visitas programadas y documentación para tu expediente.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Inspección gratis, mantenimiento <b>desde $58 al mes</b>, limpieza, canaletas y lavado en un solo proveedor, con garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'inspeccion-de-techos',
    eyebrow: 'Inspección de techos',
    noun: 'inspección de techos',
    h1before: 'Inspección de Techos Gratis en',
    h1em: 'Puerto Rico',
    h1after: ': diagnóstico con fotos.',
    metaTitle: 'Inspección de Techos Gratis en Puerto Rico | Ilatek Techos',
    metaDescription:
      'Inspección de techos gratis en Puerto Rico. Diagnóstico completo con informe fotográfico, sin compromiso. Detectamos filtraciones y daños a tiempo. 78 municipios.',
    hero: pic('presion', { alt: 'Inspección de techos gratis en Puerto Rico — diagnóstico en {{custom_values.county_name_and_state}}', title: 'Inspección de techos gratis · Ilatek Techos', badge: '100% gratis' }),
    incl: pic('postconstruccion', { alt: 'Inspección profesional de techo por Ilatek Techos en Puerto Rico — informe fotográfico', title: 'Inspección de techos · Ilatek Techos', caption: 'Informe con fotos · Sin compromiso' }),
    heroSub:
      'No sabrás el estado de tu techo hasta que alguien lo revise. Ilatek inspecciona tu techo <b>gratis</b> en {{custom_values.county_name_and_state}}: subimos, documentamos el estado con fotos y te damos recomendaciones por prioridad, sin compromiso.',
    facts: [
      { b: '$0', s: 'costo', label: 'Inspección gratis' },
      { b: 'Sin', s: 'compromiso', label: 'Decides con calma' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'clock', h: 'Detecta a tiempo', p: 'Una inspección encuentra filtraciones y fallas cuando aún son baratas de arreglar, antes de que dañen el interior.' },
      { icon: 'shield', h: 'Informe honesto', p: 'Te decimos el estado real del techo y las prioridades, sin venderte trabajo que no necesitas.' },
      { icon: 'tag', h: 'Sin costo ni compromiso', p: 'La inspección es totalmente gratis: te sirve incluso si decides no contratar el servicio.' },
    ],
    incluye: {
      title: 'Qué revisamos en tu techo.',
      answer:
        '<b>Una inspección completa vale más que un vistazo desde el patio.</b> Ilatek sube al techo, revisa cada componente, toma fotos y entrega un informe con las recomendaciones ordenadas por prioridad.',
      checks: [
        'Revisión de grietas y selladores vencidos',
        'Chequeo de empozamientos y pendientes',
        'Evaluación de desagües y canaletas',
        'Inspección de uniones, remates y penetraciones',
        'Detección de óxido en zinc y varillas',
        'Informe fotográfico con recomendaciones',
      ],
      cta: 'Programa tu inspección gratis',
    },
    extra: {
      eyebrow: 'Señales que revisamos',
      title: 'Lo que buscamos cuando subimos.',
      items: [
        { tag: 'Sellador', h: 'Sellador vencido', p: 'Capas de sellador que se despegan o burbujean son la primera señal de filtración futura.' },
        { tag: 'Agua', h: 'Zonas de empozamiento', p: 'Áreas donde el agua se queda quieta señalan problemas de pendiente o drenaje.' },
        { tag: 'Metal', h: 'Óxido y tornillos', p: 'Revisamos corrosión en zinc y tornillos sueltos que comprometen las láminas.' },
      ],
    },
    faq: [
      { q: '¿La inspección de techo es realmente gratis?', a: '<b>Sí, totalmente gratis.</b> Subimos al techo, hacemos el diagnóstico y te entregamos las recomendaciones sin costo ni compromiso de contratar. Te sirve para tomar decisiones con información real.' },
      { q: '¿Qué me entregan después de la inspección?', a: 'Te damos un <b>informe del estado del techo con fotos</b> y recomendaciones ordenadas por prioridad — qué es urgente, qué es preventivo y qué puede esperar.' },
      { q: '¿Cada cuánto debo inspeccionar mi techo?', a: 'Recomendamos una inspección <b>al menos una vez al año</b>, y siempre después de una tormenta o huracán para detectar daños ocultos.' },
      { q: '¿La inspección encuentra todas las filtraciones?', a: 'La inspección visual detecta la mayoría de las fallas; en casos de humedad atrapada podemos requerir una <b>prueba de agua</b> para confirmar el punto exacto de entrada.' },
      { q: '¿Tengo que estar presente durante la inspección?', a: 'Es recomendable para que veas en persona los hallazgos, pero <b>no es obligatorio</b>: podemos documentar con fotos y explicarte por teléfono o en persona después.' },
      { q: '¿Inspeccionan techos comerciales e industriales?', a: '<b>Sí.</b> Inspeccionamos techos residenciales, comerciales e industriales, con la profundidad y documentación que requiera cada tipo de propiedad.' },
      { q: '¿La inspección incluye la reparación?', a: 'No: la inspección es solo el diagnóstico. <b>Si detectamos algo, te cotizamos la reparación por separado</b> y tú decides si la haces con nosotros.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Inspección <b>gratis</b>, diagnósticos honestos con fotos, sin presión de venta, y cobertura en los 78 municipios de Puerto Rico con el respaldo de Ilatek.' },
    ],
  }),

  mk({
    slug: 'mantenimiento-de-techos',
    eyebrow: 'Mantenimiento preventivo',
    noun: 'mantenimiento de techos',
    h1before: 'Mantenimiento Preventivo de Techos en',
    h1em: 'Puerto Rico',
    h1after: ' desde $58 al mes.',
    metaTitle: 'Mantenimiento Preventivo de Techos | Ilatek Techos',
    metaDescription:
      'Mantenimiento preventivo de techos en Puerto Rico desde $58 al mes. Visitas programadas de inspección, limpieza y sellado preventivo. Garantía escrita. 78 municipios.',
    hero: pic('postconstruccion', { alt: 'Mantenimiento preventivo de techos en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Mantenimiento de techos · Ilatek Techos', badge: 'Desde $58/mes' }),
    incl: pic('presion', { alt: 'Plan de mantenimiento de techo por Ilatek Techos en Puerto Rico — visitas programadas', title: 'Mantenimiento preventivo · Ilatek Techos', caption: 'Visitas programadas · Techo al día' }),
    heroSub:
      'Un plan de mantenimiento mantiene tu techo sano y detecta problemas antes de que sean caros. Ilatek ofrece mantenimiento preventivo en {{custom_values.county_name_and_state}} <b>desde $58 al mes</b>, con visitas programadas e informe fotográfico.',
    facts: [
      { b: '$58', s: 'al mes', label: 'Plan preventivo' },
      { b: '2', s: 'visitas/año', label: 'Programadas' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'clock', h: 'Cero sorpresas', p: 'Con visitas programadas detectamos fallas antes de que se conviertan en goteras y gastos grandes.' },
      { icon: 'shield', h: 'Prioridad de servicio', p: 'Como cliente del plan tienes atención prioritaria cuando el techo presenta cualquier problema.' },
      { icon: 'tag', h: 'Pago mensual accesible', p: 'Repartes el cuidado de tu techo en una cuota mensual desde $58, sin un gasto grande de una sola vez.' },
    ],
    incluye: {
      title: 'Qué incluye el plan de mantenimiento.',
      answer:
        '<b>El mantenimiento previene, no repara.</b> Incluye visitas programadas de inspección, limpieza de la superficie y desagües, y sellado preventivo de fallas menores, con informe después de cada visita.',
      checks: [
        'Inspección programada en cada visita',
        'Limpieza de superficie y desagües',
        'Limpieza de canaletas y bajantes',
        'Sellado preventivo de fallas menores',
        'Informe fotográfico tras cada visita',
        'Prioridad en reparaciones',
      ],
      cta: 'Solicita tu plan de mantenimiento',
    },
    extra: {
      eyebrow: 'Frecuencia',
      title: 'Qué plan conviene a tu techo.',
      items: [
        { tag: 'Básico', h: 'Casa y techo en buen estado', p: 'Una o dos visitas al año para inspección, limpieza y sellado preventivo puntual.' },
        { tag: 'Reforzado', h: 'Zonas con árboles o costa', p: 'Más frecuencia donde hay hojas, arena o brisa salina que desgastan el techo más rápido.' },
        { tag: 'Comercial', h: 'Negocios y edificios', p: 'Plan con documentación y visitas programadas para mantener la operación sin sorpresas.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta el mantenimiento de un techo?', a: 'El plan de mantenimiento preventivo de Ilatek <b>comienza desde $58 al mes</b>. El precio depende del tamaño del techo y de la frecuencia de visitas. Te cotizamos el plan a tu medida.' },
      { q: '¿Qué incluye el plan de mantenimiento?', a: 'Incluye <b>inspecciones programadas, limpieza de superficie y desagües, limpieza de canaletas y sellado preventivo de fallas menores</b>, con un informe fotográfico después de cada visita.' },
      { q: '¿Vale la pena el mantenimiento preventivo?', a: '<b>Sí.</b> Prevenir cuesta mucho menos que reparar: el mantenimiento detecta fallas cuando son baratas y evita goteras, daños estructurales y reparaciones de miles de dólares.' },
      { q: '¿Cuántas visitas al año incluye?', a: 'Depende del plan: normalmente <b>una a tres visitas al año</b>. En zonas con muchos árboles o en la costa, recomendamos más frecuencia.' },
      { q: '¿El plan cubre reparaciones mayores?', a: 'El plan cubre <b>prevención y fallas menores</b>. Las reparaciones mayores se cotizan aparte, pero los clientes del plan tienen prioridad de agenda y precio preferente.' },
      { q: '¿Hay contrato de permanencia?', a: 'Te explicamos las condiciones <b>con transparencia antes de firmar</b>. El objetivo es que el plan te convenga; no buscamos atarte con letra pequeña.' },
      { q: '¿Ofrecen planes para negocios?', a: 'Sí: <b>planes comerciales e industriales</b> con visitas programadas y documentación, para mantener el techo de tu operación en buen estado.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Mantenimiento preventivo <b>desde $58 al mes</b>, visitas programadas, informe fotográfico, prioridad de servicio y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'limpieza-de-techos-y-canaletas',
    eyebrow: 'Limpieza de techos',
    noun: 'limpieza de techos y canaletas',
    h1before: 'Limpieza de Techos y Canaletas en',
    h1em: 'Puerto Rico',
    h1after: ' desde $150.',
    metaTitle: 'Limpieza de Techos y Canaletas | Ilatek Techos',
    metaDescription:
      'Limpieza de techos y canaletas en Puerto Rico desde $150. Removemos hojas, arena y escombros que obstruyen el drenaje. Inspección gratis y garantía escrita.',
    hero: pic('presion', { alt: 'Limpieza de techos y canaletas en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Limpieza de techos y canaletas · Ilatek Techos', badge: 'Desde $150' }),
    incl: pic('postconstruccion', { alt: 'Limpieza de techos y canaletas por Ilatek Techos en Puerto Rico — drenaje despejado', title: 'Limpieza de techos y canaletas · Ilatek Techos', caption: 'Hojas fuera · Agua corriendo' }),
    heroSub:
      'Hojas, arena y escombros tapan tu techo y obstruyen el drenaje, causando empozamientos y filtraciones. Ilatek limpia techos y canaletas en {{custom_values.county_name_and_state}} <b>desde $150</b>, con inspección gratis y garantía escrita.',
    facts: [
      { b: '$150', s: 'por servicio', label: 'Limpieza completa' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'drop', h: 'Drenaje despejado', p: 'Al remover la obstrucción, el agua corre y deja de empozarse sobre tu techo, cortando la causa de filtraciones.' },
      { icon: 'shield', h: 'Menos peso y daño', p: 'La suciedad acumulada pesa y retiene humedad: limpiarla protege la superficie y la estructura.' },
      { icon: 'clock', h: 'Preparación para sellar', p: 'Un techo limpio es la base para cualquier sellado o impermeabilización que necesites después.' },
    ],
    incluye: {
      title: 'Qué incluye la limpieza de tu techo.',
      answer:
        '<b>Un techo limpio drena y dura más.</b> Ilatek remueve hojas, arena, escombros y residuos de la superficie, despeja canaletas y bajantes, y verifica que el agua corra libremente hacia las salidas.',
      checks: [
        'Remoción de hojas y escombros',
        'Barrido y limpieza de la superficie',
        'Despeje de canaletas y bajantes',
        'Revisión de desagües del techo',
        'Retiro de residuos del área',
        'Informe del estado del techo',
      ],
      cta: 'Cotiza tu limpieza',
    },
    extra: {
      eyebrow: 'Cuándo hacerlo',
      title: 'Momentos para limpiar tu techo.',
      items: [
        { tag: 'Temporada', h: 'Antes de las lluvias', p: 'Limpiar el techo antes de la temporada de lluvias deja el drenaje listo para la lluvia intensa.' },
        { tag: 'Árboles', h: 'Si hay árboles cerca', p: 'Las hojas caen en el techo y las canaletas: conviene limpiarlas con más frecuencia.' },
        { tag: 'Señal', h: 'Si el agua se empoza', p: 'Si notas agua estancada o el techo se ve sucio, es momento de limpiar y revisar el drenaje.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta limpiar un techo y las canaletas?', a: 'La limpieza de techos y canaletas de Ilatek <b>comienza desde $150</b>. El precio depende del tamaño del techo y del grado de acumulación. Cotiza para tu número exacto.' },
      { q: '¿Cada cuánto debo limpiar el techo y las canaletas?', a: 'Recomendamos limpiar el techo <b>al menos dos veces al año</b>, y siempre tras la temporada de lluvias o una tormenta. Con árboles cerca, puede requerir más frecuencia.' },
      { q: '¿Por qué es importante limpiar las canaletas?', a: 'Porque las canaletas tapadas <b>rebosan y mandan el agua al techo o a la pared</b>, causando empozamientos, filtraciones y daño a la fachada.' },
      { q: '¿La limpieza del techo incluye retirar los escombros?', a: 'Sí: <b>removemos toda la suciedad y los residuos</b> del techo y los retiramos, dejando el área limpia. No dejamos los desechos en tu patio.' },
      { q: '¿La limpieza puede dañar el techo?', a: 'No: usamos <b>herramientas y métodos adecuados a cada superficie</b>. En tejas o materiales delicados trabajamos con especial cuidado.' },
      { q: '¿Ofrecen solo limpieza de canaletas?', a: 'Sí, también ofrecemos <b>limpieza específica de canaletas y bajantes</b> como servicio aparte, si es lo único que tu techo necesita.' },
      { q: '¿Cuánto tarda la limpieza del techo?', a: 'Un techo residencial típico se limpia en <b>unas pocas horas</b>; los techos grandes o muy obstruidos pueden requerir el día completo.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Limpiamos a fondo, despejamos el drenaje y revisamos el techo, <b>desde $150</b>, con inspección gratis y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'canaletas-y-bajantes',
    eyebrow: 'Canaletas y bajantes',
    noun: 'canaletas y bajantes',
    h1before: 'Canales, Canaletas y Bajantes para Techos en',
    h1em: 'Puerto Rico',
    h1after: ' desde $200.',
    metaTitle: 'Canaletas y Bajantes para Techos | Ilatek Techos',
    metaDescription:
      'Limpieza, reparación e instalación de canaletas y bajantes en Puerto Rico desde $200. Drenaje que funciona para proteger tu techo. Inspección gratis.',
    hero: pic('postconstruccion', { alt: 'Instalación de canaletas y bajantes en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Canaletas y bajantes · Ilatek Techos', badge: 'Drenaje que funciona' }),
    incl: pic('presion', { alt: 'Limpieza e instalación de canaletas y bajantes por Ilatek Techos en Puerto Rico', title: 'Canaletas y bajantes · Ilatek Techos', caption: 'Limpieza de canaletas · Reparación · Instalación' }),
    heroSub:
      'Las canaletas dirigen el agua lejos del techo y de las paredes. Ilatek las limpia, repara o instala en {{custom_values.county_name_and_state}} <b>desde $200</b>, para que tu drenaje funcione y no cause filtraciones, con garantía escrita.',
    facts: [
      { b: '$200', s: 'por trabajo', label: 'Drenaje incluido' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'drop', h: 'El agua va donde debe', p: 'Con canaletas y bajantes en buen estado, el agua sale lejos de tu techo y de tus paredes, sin filtrarse.' },
      { icon: 'shield', h: 'Protege paredes y cimientos', p: 'El agua que escurre por las paredes las mancha y daña; dirigirla correctamente protege toda la casa.' },
      { icon: 'clock', h: 'Menos mantenimiento', p: 'Un sistema de drenaje limpio y bien instalado necesita menos reparaciones y dura más.' },
    ],
    incluye: {
      title: 'Qué hacemos con tus canaletas y bajantes.',
      answer:
        '<b>Un drenaje correcto empieza en la canaleta.</b> Ilatek limpia el canal, repara las piezas dañadas o sueltas, sella las uniones y, si falta, instala o reemplaza canaletas y bajantes.',
      checks: [
        'Limpieza de canaletas y bajantes',
        'Reparación de piezas sueltas o rotas',
        'Sellado de uniones y remates',
        'Corrección de pendiente de la canaleta',
        'Instalación o reemplazo si hace falta',
        'Informe y garantía por escrito',
      ],
      cta: 'Cotiza tus canaletas',
    },
    extra: {
      eyebrow: 'Señales',
      title: 'Cuándo tus canaletas necesitan atención.',
      items: [
        { tag: 'Rebose', h: 'El agua rebosa', p: 'Cuando la canaleta está tapada o mal pendiente, el agua se sale y cae sobre el techo o las paredes.' },
        { tag: 'Daño', h: 'Piezas sueltas', p: 'Canaletas desprendidas o partidas dejan de guiar el agua y hay que repararlas o reemplazarlas.' },
        { tag: 'Manchas', h: 'Paredes manchadas', p: 'Manchas en la fachada indican que el agua no se está dirigiendo bien: revisar canaletas y bajantes.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta instalar o reparar canaletas y bajantes?', a: 'El trabajo de canaletas y bajantes de Ilatek <b>comienza desde $200</b>. El precio depende de si es limpieza, reparación o instalación nueva, y de los pies lineales. Cotiza para tu número exacto.' },
      { q: '¿Por qué se tapan las canaletas?', a: 'Por <b>hojas, arena, ramas y escombros</b> que se acumulan con el viento y la lluvia. Con el tiempo forman una obstrucción que impide el paso del agua.' },
      { q: '¿Qué pasa si no limpio las canaletas?', a: 'El agua rebosa y cae sobre el techo o las paredes, causando <b>empozamientos, filtraciones, manchas en la fachada y humedad</b>. Por eso conviene limpiarlas al menos dos veces al año.' },
      { q: '¿Instalan canaletas nuevas?', a: '<b>Sí.</b> Si tu vivienda no tiene canaletas o están muy dañadas, instalamos el sistema de canaletas y bajantes adecuado para dirigir el agua lejos del techo.' },
      { q: '¿De qué material son las canaletas?', a: 'Trabajamos con <b>aluminio, metal y PVC</b>, entre otros materiales comunes en Puerto Rico. Seleccionamos el más adecuado según tu techo y presupuesto.' },
      { q: '¿Reparan canaletas desprendidas?', a: '<b>Sí.</b> Reajustamos las fijaciones, sellamos las uniones y reponemos piezas dañadas para que la canaleta vuelva a cumplir su función.' },
      { q: '¿Cuánto tarda el trabajo?', a: 'La limpieza y reparación de canaletas de una casa se completan normalmente en <b>unas horas o un día</b>. Una instalación nueva puede tomar más, según los pies lineales.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Limpiamos, reparamos o instalamos canaletas y bajantes para que tu drenaje funcione, <b>desde $200</b>, con inspección gratis y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'lavado-a-presion-techos',
    eyebrow: 'Lavado a presión',
    noun: 'lavado a presión de techos',
    h1before: 'Lavado a Presión de Techos en',
    h1em: 'Puerto Rico',
    h1after: ' desde $0.15 por pie².',
    metaTitle: 'Lavado a Presión de Techos | Ilatek Techos',
    metaDescription:
      'Lavado a presión de techos en Puerto Rico desde $0.15 por pie². Limpieza profunda que prepara y alarga la vida del techo. Inspección gratis y garantía escrita.',
    hero: pic('presion', { alt: 'Lavado a presión de techos en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Lavado a presión de techos · Ilatek Techos', badge: 'Desde $0.15/pie²' }),
    incl: pic('postconstruccion', { alt: 'Lavado a presión de techo por Ilatek Techos en Puerto Rico — limpieza profunda', title: 'Lavado a presión · Ilatek Techos', caption: 'Superficie limpia · Lista para sellar' }),
    heroSub:
      'La suciedad y el moho pegado se comen el sellado de tu techo y aceleran su deterioro. Ilatek lava a presión en {{custom_values.county_name_and_state}} <b>desde $0.15 por pie²</b>: deja la superficie limpia y lista, con inspección gratis y garantía escrita.',
    facts: [
      { b: '$0.15', s: 'por pie²', label: 'Precio base' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'drop', h: 'Limpieza profunda del techo', p: 'Removemos suciedad, hongos y residuos pegados que el barrido no quita, devolviendo el color a la superficie.' },
      { icon: 'shield', h: 'Prepara para sellar', p: 'Un techo limpio es indispensable para que el sellador o membrana adhiera bien: es el paso previo de todo buen sellado.' },
      { icon: 'clock', h: 'Alarga la vida del techo', p: 'Quitar la suciedad que retiene humedad frena el deterioro y prolonga la vida de la superficie.' },
    ],
    incluye: {
      title: 'Qué incluye el lavado a presión.',
      answer:
        '<b>El lavado a presión no es solo estética: es preparación.</b> Ilatek lava la superficie con presión controlada, remueve suciedad y hongos, y revisa el estado del techo para el sellado que siga.',
      checks: [
        'Lavado con presión controlada según superficie',
        'Remoción de suciedad, moho y residuos',
        'Limpieza de desagües tras el lavado',
        'Revisión del estado del techo',
        'Preparación para sellado o impermeabilización',
        'Informe del estado del techo',
      ],
      cta: 'Cotiza tu lavado a presión',
    },
    extra: {
      eyebrow: 'Ideal para',
      title: 'Cuándo conviene el lavado a presión.',
      items: [
        { tag: 'Previo', h: 'Antes de sellar', p: 'Siempre conviene lavar antes de aplicar sellador: la adherencia depende de una superficie limpia.' },
        { tag: 'Estética', h: 'Techos sucios o con moho', p: 'Si el techo se ve manchado o con hongos, el lavado a presión recupera su apariencia.' },
        { tag: 'Mantenimiento', h: 'Como parte del plan', p: 'El lavado se integra al mantenimiento periódico para mantener el techo en buen estado.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta lavar un techo a presión?', a: 'El lavado a presión de techos de Ilatek <b>comienza desde $0.15 por pie²</b>. El precio depende del área y del grado de suciedad. Cotiza para tu número exacto.' },
      { q: '¿El lavado a presión puede dañar mi techo?', a: 'No si se hace con <b>presión y boquilla adecuadas a cada superficie</b>. Ajustamos la presión según el material para limpiar sin dañar el techo.' },
      { q: '¿Cada cuánto se debe lavar un techo?', a: 'Normalmente <b>una vez al año</b>, o dos si hay mucho moho, árboles cerca o brisa salina. Se puede integrar al plan de mantenimiento.' },
      { q: '¿El lavado a presión sella las filtraciones?', a: 'No por sí solo: el lavado <b>limpia y prepara</b>. Si hay filtraciones, el lavado se combina con reparación y sellado.' },
      { q: '¿Lavan techos de cualquier material?', a: 'Sí: <b>concreto, zinc, asfalto y membranas</b>, ajustando la presión y el método a cada superficie para no dañarla.' },
      { q: '¿El lavado incluye limpiar los desagües?', a: 'Después de lavar, <b>verificamos y despejamos los desagües</b> para que la suciedad removida no obstruya el drenaje del techo.' },
      { q: '¿Cuánto tarda el lavado?', a: 'Un techo residencial típico se lava en <b>unas horas</b>; los techos grandes pueden tomar el día completo, según el área y la suciedad.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Lavamos con presión correcta para cada superficie, <b>desde $0.15 por pie²</b>, con inspección gratis y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'tragaluces',
    eyebrow: 'Tragaluces',
    noun: 'tragaluces y skylights',
    h1before: 'Tragaluces y Skylights para Techos en',
    h1em: 'Puerto Rico',
    h1after: ': sellado e instalación.',
    metaTitle: 'Tragaluces y Skylights para Techos | Ilatek Techos',
    metaDescription:
      'Sellado e instalación de tragaluces y skylights en Puerto Rico desde $450. Ilumina tu espacio sin filtraciones ni humedad. Inspección gratis y garantía escrita.',
    hero: pic('residencial', { alt: 'Tragaluz y skylight en techo de Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Tragaluces y skylights · Ilatek Techos', badge: 'Luz sin filtraciones' }),
    incl: pic('postconstruccion', { alt: 'Instalación y sellado de tragaluz por Ilatek Techos en Puerto Rico — skylight sin humedad', title: 'Tragaluces · Ilatek Techos', caption: 'Sellado perimetral · Sin humedad' }),
    heroSub:
      'Los tragaluces dan luz natural, pero son un punto clásico de filtraciones si no están bien sellados. Ilatek instala y sella tragaluces en {{custom_values.county_name_and_state}} <b>desde $450</b>, con inspección gratis y garantía escrita.',
    facts: [
      { b: '$450', s: 'por trabajo', label: 'Sellado incluido' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'drop', h: 'Sellado perimetral', p: 'La filtración de un tragaluz casi siempre viene del sello perimetral: lo reforzamos para cerrar el paso del agua.' },
      { icon: 'shield', h: 'Ilumina sin riesgo', p: 'Disfrutas la luz natural del tragaluz sin la humedad ni las manchas que trae una filtración mal resuelta.' },
      { icon: 'clock', h: 'Instalación correcta', p: 'Instalamos el tragaluz con el sistema de sellado adecuado desde el inicio, para evitar problemas futuros.' },
    ],
    incluye: {
      title: 'Qué incluye el trabajo del tragaluz.',
      answer:
        '<b>El tragaluz filtra por su perímetro, no por el vidrio.</b> Ilatek revisa y refuerza el sellado alrededor del tragaluz, corrige el flashings y, si es instalación nueva, lo coloca con el sistema impermeable correcto.',
      checks: [
        'Revisión del sellado perimetral',
        'Refuerzo de flashing y remates',
        'Sellado del encuentro tragaluz-techo',
        'Corrección de filtraciones existentes',
        'Instalación nueva con sistema impermeable',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu tragaluz',
    },
    extra: {
      eyebrow: 'Problemas típicos',
      title: 'Por qué filtra un tragaluz.',
      items: [
        { tag: 'Sello', h: 'Sellador perimetral vencido', p: 'El sellador alrededor del tragaluz se agrieta con el sol y deja pasar el agua por el borde.' },
        { tag: 'Flashing', h: 'Flashing mal colocado', p: 'El remate metálico que une el tragaluz al techo debe estar bien integrado para desviar el agua.' },
        { tag: 'Instalación', h: 'Instalación deficiente', p: 'Un tragaluz mal instalado filtra desde el primer día: hay que corregir el encuentro con el techo.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta instalar o sellar un tragaluz?', a: 'El trabajo de tragaluces de Ilatek <b>comienza desde $450</b>, dependiendo de si es sellado de uno existente o instalación nueva. El precio varía según el tamaño y el tipo de techo. Cotiza para tu número exacto.' },
      { q: '¿Por qué filtra agua un tragaluz?', a: 'Casi siempre por el <b>sellado perimetral vencido o un flashing mal integrado</b>. El agua se cuela por el borde, no por el vidrio, y aparece como mancha o goteo en el techo interior.' },
      { q: '¿Se puede reparar un tragaluz que filtra?', a: '<b>Sí.</b> En la mayoría de los casos reforzamos el sellado perimetral y corregimos el remate; si el tragaluz está mal instalado, se corrige el encuentro con el techo.' },
      { q: '¿Instalan tragaluces nuevos?', a: '<b>Sí.</b> Instalamos tragaluces con el sistema impermeable correcto desde el inicio, para que entreguen luz natural sin filtraciones.' },
      { q: '¿El tragaluz afecta el sellado general del techo?', a: 'Es un punto crítico: <b>cualquier penetración en el techo es un lugar propenso a filtrar</b>, por eso su sellado debe ser especialmente cuidadoso.' },
      { q: '¿Cuánto tarda el trabajo?', a: 'El sellado de un tragaluz existente suele tomar <b>un día</b>; una instalación nueva depende del tamaño y del tipo de techo, generalmente uno a dos días.' },
      { q: '¿El trabajo del tragaluz tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre el sellado o la instalación realizada.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Sellamos e instalamos tragaluces sin filtraciones, <b>desde $450</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'instalacion-y-reemplazo-de-techos',
    eyebrow: 'Instalación y reemplazo',
    noun: 'instalación y reemplazo de techos',
    h1before: 'Instalación y Reemplazo de Techos en',
    h1em: 'Puerto Rico',
    h1after: ' desde $6.00 por pie².',
    metaTitle: 'Instalación y Reemplazo de Techos | Ilatek Techos',
    metaDescription:
      'Instalación y reemplazo de techos en Puerto Rico desde $6.00 por pie². Techos nuevos de zinc, concreto y membrana con garantía escrita. Inspección gratis.',
    hero: pic('postconstruccion', { alt: 'Instalación y reemplazo de techos en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Instalación y reemplazo de techos · Ilatek Techos', badge: 'Desde $6.00/pie²' }),
    incl: pic('comercial', { alt: 'Reemplazo e instalación de techo por Ilatek Techos en Puerto Rico — techo nuevo', title: 'Instalación de techos · Ilatek Techos', caption: 'Techos nuevos · Garantía de instalación' }),
    heroSub:
      'Cuando reparar ya no es suficiente, instalar un techo nuevo es la solución definitiva. Ilatek reemplaza e instala techos en {{custom_values.county_name_and_state}} <b>desde $6.00 por pie²</b>, con inspección gratis y garantía escrita.',
    facts: [
      { b: '$6.00', s: 'por pie²', label: 'Instalación' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'shield', h: 'Solución definitiva', p: 'Un techo nuevo resuelve de raíz las filtraciones recurrentes y te da tranquilidad por muchos años.' },
      { icon: 'tag', h: 'Instalación correcta', p: 'Instalamos con el sistema y las fijaciones adecuadas al viento y la lluvia de Puerto Rico, no improvisamos.' },
      { icon: 'clock', h: 'Garantía de instalación', p: 'Respaldamos la instalación por escrito, con materiales certificados y mano de obra especializada.' },
    ],
    incluye: {
      title: 'Qué incluye la instalación de un techo.',
      answer:
        '<b>Un techo nuevo se juzga por cómo se instala, no solo por el material.</b> Ilatek evalúa la estructura, retira el techo viejo, prepara la base e instala el sistema nuevo con fijaciones y sellado correctos para el clima.',
      checks: [
        'Evaluación de la estructura existente',
        'Remoción del techo viejo',
        'Preparación y refuerzo de la base',
        'Instalación con materiales certificados',
        'Sellado de uniones y penetraciones',
        'Garantía por escrito de la instalación',
      ],
      cta: 'Cotiza tu techo nuevo',
    },
    extra: {
      eyebrow: 'Cuándo reemplazar',
      title: 'Señales de que toca techo nuevo.',
      items: [
        { tag: 'Recurrencia', h: 'Filtraciones que vuelven', p: 'Si ya reparaste varias veces y sigue filtrando, el techo cumplió su vida útil.' },
        { tag: 'Estado', h: 'Deterioro generalizado', p: 'Óxido extendido, láminas perforadas o shingles destruidos: reparar ya no es rentable.' },
        { tag: 'Estructura', h: 'Daño estructural', p: 'Cuando la base o la estructura está comprometida, hay que reemplazar, no solo sellar.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta instalar o reemplazar un techo?', a: 'La instalación y reemplazo de techos de Ilatek <b>comienza desde $6.00 por pie²</b> instalado. El precio depende del material, el área y si hay que reparar la estructura. Cotizamos tu proyecto con visita técnica.' },
      { q: '¿Cuándo conviene reemplazar el techo en vez de repararlo?', a: 'Cuando hay <b>filtraciones recurrentes, deterioro generalizado o daño estructural</b>. Si ya reparaste varias veces sin éxito, un techo nuevo es más rentable a largo plazo.' },
      { q: '¿Qué materiales de techo instalan?', a: 'Instalamos <b>techos de zinc y metal, membranas para techos planos, sistemas de concreto y asfalto</b>, según el diseño de tu propiedad y tus necesidades.' },
      { q: '¿Cuánto tarda instalar un techo?', a: 'Un techo residencial puede tomar <b>de varios días a un par de semanas</b>, según el tamaño y el material. Proyectos comerciales o industriales requieren más tiempo; te damos un cronograma.' },
      { q: '¿Retiran el techo viejo?', a: 'Sí: <b>removemos el techo existente</b>, preparamos la base y retiramos los escombros, dejando el área lista para la instalación nueva.' },
      { q: '¿La instalación incluye garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre la instalación, con materiales certificados y proceso correcto.' },
      { q: '¿Trabajan techos comerciales e industriales?', a: '<b>Sí.</b> Instalamos y reemplazamos techos residenciales, comerciales e industriales, con planificación por fases para no interrumpir tu operación.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Instalamos correctamente, con garantía escrita y materiales certificados, <b>desde $6.00 por pie²</b>, con inspección gratis y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),
];
