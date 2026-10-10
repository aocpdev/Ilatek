// Ilatek · Techos · Clúster C — Impermeabilización y Tipos de Techo.
import { mk, pic } from '../kit.mjs';

export const impermeabilizacion = [
  mk({
    slug: 'impermeabilizacion-de-techos',
    role: 'mother',
    eyebrow: 'Impermeabilización',
    noun: 'impermeabilización de techos',
    h1before: 'Impermeabilización de Techos en',
    h1em: 'Puerto Rico',
    h1after: 'para cada tipo de techo.',
    metaTitle: 'Impermeabilización de Techos en Puerto Rico | Ilatek Techos',
    metaDescription:
      'Impermeabilización de techos en Puerto Rico desde $3.00 por pie². Sellado de concreto, techos planos, zinc, asfalto, teja y madera. Inspección gratis y garantía escrita.',
    hero: pic('industrial', {
      alt: 'Impermeabilización de techos de Ilatek Techos en Puerto Rico — {{custom_values.county_name_and_state}}',
      title: 'Impermeabilización de techos · Ilatek Techos',
      badge: 'Concreto · Zinc · Asfalto · Teja',
    }),
    incl: pic('comercial', {
      alt: 'Impermeabilización de losa y techo plano de Ilatek Techos en Puerto Rico',
      title: 'Impermeabilización de techos · Ilatek Techos',
      caption: 'Cada techo, su sistema',
    }),
    heroSub:
      'Cada tipo de techo pide un sistema distinto de impermeabilización. Ilatek sella concreto, techos planos, zinc, asfalto, teja y madera en {{custom_values.county_name_and_state}} <b>desde $3.00 por pie²</b>, con inspección gratis y garantía escrita.',
    facts: [
      { b: '$3.00', s: 'por pie²', label: 'Precio base' },
      { b: '6', s: 'tipos de techo', label: 'Cubiertos' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'shield', h: 'Sistema por material', p: 'No es lo mismo impermeabilizar una losa de concreto que un techo de zinc: usamos el producto correcto para cada superficie.' },
      { icon: 'drop', h: 'Barrera continua', p: 'Sellamos grietas, uniones y penetraciones para que el agua no tenga por dónde entrar, en vez de parches aislados.' },
      { icon: 'clock', h: 'Protección que dura', p: 'Con preparación correcta y el sistema adecuado, la impermeabilización protege tu techo por años, no meses.' },
    ],
    benTitle: 'Impermeabilización a la medida de tu techo.',
    incluye: {
      title: 'Qué incluye impermeabilizar tu techo.',
      answer:
        '<b>Impermeabilizar es crear una barrera que el agua no atraviesa.</b> Ilatek prepara la superficie, corrige las fallas y aplica el sistema (membrana, silicona, coating o tratamiento específico) según el material de tu techo.',
      checks: [
        'Inspección y diagnóstico del tipo de techo',
        'Preparación de la superficie del techo',
        'Sellado de grietas, uniones y remates',
        'Corrección de empozamientos y drenaje',
        'Aplicación del sistema impermeabilizante',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu impermeabilización',
    },
    extra: {
      eyebrow: 'Por tipo de techo',
      title: 'Impermeabilizamos todo tipo de techo en Puerto Rico.',
      kids: [
        { slug: 'techos-de-concreto', name: 'Techos de Concreto / Losas', desc: 'Las losas son el techo más común de la isla: sellamos grietas y filtraciones para que el agua no penetre.' },
        { slug: 'techos-planos', name: 'Techos Planos y Membranas', desc: 'Techos planos con membrana EPDM, TPO o asfáltica: impermeabilización para superficies de poca pendiente.' },
        { slug: 'techos-de-zinc', name: 'Techos de Zinc y Metal', desc: 'Tratamos la oxidación, sellamos traslapes y tornillos, y protegemos el metal contra la corrosión.' },
        { slug: 'techos-de-asfalto', name: 'Techos de Asfalto (Shingles)', desc: 'Sellado y sustitución de shingles sueltos o dañados para que el agua no se cuele por debajo.' },
        { slug: 'techos-de-teja', name: 'Techos de Teja', desc: 'Tratamiento cuidadoso de tejas: sellamos traslapes y remates sin dañar la pieza.' },
        { slug: 'techos-de-madera', name: 'Techos de Madera', desc: 'Sellado y protección de techos de madera contra la humedad, el comején y la filtración.' },
      ],
      cta: { slug: 'cotizacion', label: 'Solicita tu cotización gratis' },
    },
    faq: [
      { q: '¿Cuánto cuesta impermeabilizar un techo?', a: 'La impermeabilización de techos de Ilatek <b>comienza desde $3.00 por pie²</b> instalada. El precio depende del tipo de techo, el sistema necesario y el área. Cotiza para tu número exacto.' },
      { q: '¿Qué es la impermeabilización de un techo?', a: 'Es el proceso de <b>crear una barrera que impide el paso del agua</b> por la superficie del techo, sellando grietas, uniones y poros con membranas, silicona o coatings según el material.' },
      { q: '¿Cuánto dura la impermeabilización?', a: 'Depende del sistema: <b>silicona 100% de 20 a 25 años, poliuretano 10 a 15, membrana asfáltica 10 a 15 y acrílico 7 a 10</b>. Con mantenimiento periódico la protección se extiende.' },
      { q: '¿Cada cuánto se impermeabiliza un techo?', a: 'Según el sistema y la exposición, entre <b>5 y 10 años</b> para la mayoría de techos. En Puerto Rico, por el sol y la lluvia, recomendamos una inspección anual para detectar fallas temprano.' },
      { q: '¿Impermeabilizar sella las goteras existentes?', a: 'La impermeabilización <b>sella el agua que aún no ha entrado y las microfisuras</b>. Las goteras activas se reparan primero en su punto de origen; después se impermeabiliza la superficie completa.' },
      { q: '¿Trabajan techos comerciales e industriales?', a: 'Sí: impermeabilizamos <b>techos residenciales, comerciales e industriales</b>, incluidos losas grandes, techos planos con membrana y naves industriales.' },
      { q: '¿La impermeabilización incluye garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito con materiales certificados. Si el sistema falla en el periodo cubierto, regresamos.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Usamos el sistema correcto para cada tipo de techo, <b>desde $3.00 por pie²</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'techos-de-concreto',
    eyebrow: 'Techos de concreto',
    noun: 'reparación de techos de concreto',
    h1before: 'Reparación e Impermeabilización de Techos de Concreto',
    h1em: '(Losas) en Puerto Rico',
    h1after: '.',
    metaTitle: 'Reparación de Techos de Concreto (Losas) | Ilatek Techos',
    metaDescription:
      'Reparación e impermeabilización de techos de concreto y losas en Puerto Rico desde $3.00 por pie². Sellado de grietas y filtraciones con garantía escrita.',
    hero: pic('comercial', { alt: 'Reparación de techo de concreto y losa en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Techos de concreto · Ilatek Techos', badge: 'Sellado de losas' }),
    incl: pic('industrial', { alt: 'Impermeabilización de losa de concreto por Ilatek Techos en Puerto Rico — techo de concreto', title: 'Impermeabilización de losas · Ilatek Techos', caption: 'Grietas selladas · Membrana aplicada' }),
    heroSub:
      'La losa de concreto es el techo más común en Puerto Rico: resistente, pero propensa a grietas y filtraciones con el tiempo. Ilatek repara e impermeabiliza techos de concreto en {{custom_values.county_name_and_state}} <b>desde $3.00 por pie²</b>, con garantía escrita.',
    facts: [
      { b: '$3.00', s: 'por pie²', label: 'Impermeabilización' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'shield', h: 'Sella las grietas del concreto', p: 'Rellenamos las grietas con sellador flexible y aplicamos membrana para que el agua no penetre la losa.' },
      { icon: 'bolt', h: 'Frena el óxido de varillas', p: 'Al cerrar las entradas de agua, protegemos el acero de refuerzo que se oxida dentro del concreto.' },
      { icon: 'drop', h: 'Aguanta huracanes', p: 'Una losa bien impermeabilizada resiste vientos de categoría 5 y la lluvia intensa del Caribe sin filtrar.' },
    ],
    incluye: {
      title: 'Cómo impermeabilizamos una losa de concreto.',
      answer:
        '<b>Una losa no se sella con pintura.</b> Ilatek limpia la superficie, corrige grietas y empozamientos, aplica primer y coloca el sistema impermeabilizante que forma la barrera sobre el concreto.',
      checks: [
        'Lavado a presión de la losa',
        'Sellado de grietas y juntas de colado',
        'Corrección de empozamientos',
        'Aplicación de primer de adherencia',
        'Membrana o silicona impermeabilizante',
        'Garantía por escrito del sistema',
      ],
      cta: 'Cotiza tu losa',
    },
    extra: {
      eyebrow: 'Problemas típicos',
      title: 'Qué le pasa al concreto con los años.',
      items: [
        { tag: 'Grietas', h: 'Retracción y calor', p: 'El sol y las variaciones de temperatura abren grietas por donde entra el agua.' },
        { tag: 'Óxido', h: 'Varillas oxidadas', p: 'El agua que penetra oxida el acero interno hasta reventar el concreto desde adentro.' },
        { tag: 'Agua', h: 'Empozamiento', p: 'La losa pierde pendiente con el tiempo y el agua se estanca, filtrándose lentamente.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta reparar un techo de concreto?', a: 'La reparación e impermeabilización de techos de concreto de Ilatek <b>comienza desde $3.00 por pie²</b>. El precio depende del área y del estado de la losa. Cotiza para tu número exacto.' },
      { q: '¿Por qué se filtra una losa de concreto?', a: 'Por <b>grietas de retracción, juntas abiertas, empozamientos y pérdida de pendiente</b>. El agua encuentra esas fallas y penetra la losa, apareciendo como manchas o goteras.' },
      { q: '¿Cómo sellan las grietas de una losa?', a: 'Perfilamos la grieta, la rellenamos con <b>sellador polimérico flexible</b> y la cubrimos con membrana impermeabilizante para que no vuelva a abrirse con el movimiento del concreto.' },
      { q: '¿Las varillas oxidadas del techo se pueden reparar?', a: 'Si el óxido es incipiente, <b>tratamos el acero, restauramos el recubrimiento y sellamos</b>. Si ya hay daño estructural mayor, te lo informamos y recomendamos el refuerzo necesario.' },
      { q: '¿Cuánto dura la impermeabilización de una losa?', a: 'Con silicona 100%, <b>de 20 a 25 años</b>; con membrana asfáltica, de 10 a 15; con acrílico, de 7 a 10. La duración depende del sistema y del mantenimiento.' },
      { q: '¿Puedo usar mi losa como terraza después de impermeabilizar?', a: 'Sí, con el sistema adecuado para tránsito: <b>membrana asfáltica o poliuretano resisten el pisoteo</b> mejor que un acrílico. Lo definimos según el uso que le darás.' },
      { q: '¿La reparación de la losa tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito; si la filtración reaparece dentro del periodo cubierto, regresamos a corregirla.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Sellamos grietas y filtraciones de losas con el sistema correcto, <b>desde $3.00 por pie²</b>, inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'techos-planos',
    eyebrow: 'Techos planos',
    noun: 'impermeabilización de techos planos',
    h1before: 'Impermeabilización de Techos Planos y Membranas en',
    h1em: 'Puerto Rico',
    h1after: ' (EPDM, TPO y asfáltica).',
    metaTitle: 'Impermeabilización de Techos Planos (EPDM, TPO) | Ilatek Techos',
    metaDescription:
      'Impermeabilización de techos planos en Puerto Rico desde $3.50 por pie². Membranas EPDM, TPO y asfálticas selladas con garantía escrita. Inspección gratis.',
    hero: pic('comercial', { alt: 'Impermeabilización de techo plano en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Techos planos · Ilatek Techos', badge: 'EPDM · TPO · Asfáltica' }),
    incl: pic('industrial', { alt: 'Membrana impermeabilizante en techo plano por Ilatek Techos en Puerto Rico', title: 'Techos planos y membranas · Ilatek Techos', caption: 'Membrana continua · Drenaje correcto' }),
    heroSub:
      'Los techos planos acumulan agua y exigen una membrana que cubra toda la superficie sin fallas. Ilatek impermeabiliza techos planos en {{custom_values.county_name_and_state}} <b>desde $3.50 por pie²</b>, corrigiendo drenaje y con garantía escrita.',
    facts: [
      { b: '$3.50', s: 'por pie²', label: 'Sistema completo' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'shield', h: 'Membrana continua', p: 'Cubrimos toda la superficie sin uniones débiles, la causa número uno de filtraciones en techos planos.' },
      { icon: 'drop', h: 'Drenaje que funciona', p: 'Corregimos pendiente y desagües para que el agua salga rápido y no se empoce sobre la membrana.' },
      { icon: 'bolt', h: 'Resiste el tránsito', p: 'Las membranas modernas aguantan el paso en azoteas y la instalación de equipos sin romperse.' },
    ],
    incluye: {
      title: 'Cómo impermeabilizamos un techo plano.',
      answer:
        '<b>En un techo plano el agua no corre sola: hay que ayudarla.</b> Ilatek limpia la superficie, corrige pendiente y desagües, aplica primer y coloca la membrana (EPDM, TPO o asfáltica) sellando cada junta.',
      checks: [
        'Preparación de la superficie del techo',
        'Corrección de pendiente y empozamientos',
        'Reparación de desagües y bajantes',
        'Primer de adherencia',
        'Membrana EPDM, TPO o asfáltica',
        'Sellado de juntas y garantía escrita',
      ],
      cta: 'Cotiza tu techo plano',
    },
    extra: {
      eyebrow: 'Membranas',
      title: 'Qué membrana conviene en tu techo plano.',
      items: [
        { tag: 'Blanca', h: 'TPO', p: 'Membrana termoplástica reflectiva, resistente y de fácil sellado por calor: muy usada en techos comerciales.' },
        { tag: 'Elástica', h: 'EPDM', p: 'Membrana de caucho muy flexible y duradera, ideal para techos con movimiento térmico.' },
        { tag: 'Reforzada', h: 'Asfáltica modificada', p: 'Alta resistencia al tránsito y al punzonamiento para azoteas de servicio.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta impermeabilizar un techo plano?', a: 'La impermeabilización de techos planos de Ilatek <b>comienza desde $3.50 por pie²</b>. El precio depende del área, el tipo de membrana y el estado del drenaje. Cotiza para tu número exacto.' },
      { q: '¿Por qué se filtra un techo plano?', a: 'Por <b>membranas vencidas, juntas mal selladas, desagües tapados y empozamientos</b>. Al no tener pendiente pronunciada, el agua se queda más tiempo y encuentra cualquier falla.' },
      { q: '¿Qué membrana es mejor, EPDM o TPO?', a: '<b>Depende del uso.</b> El TPO blanco refleja el calor y se suelda por calor; el EPDM es más elástico y tolera el movimiento. Elegimos según tránsito, exposición y presupuesto.' },
      { q: '¿Cuánto dura una membrana en techo plano?', a: 'Con buena instalación, <b>de 10 a 20 años</b> según el tipo. Las inspecciones periódicas permiten reparar puntos antes de que falle toda la superficie.' },
      { q: '¿Pueden impermeabilizar sobre la membrana vieja?', a: 'En algunos casos sí, si la membrana existente está firme; si está suelta o con humedad atrapada, <b>hay que removerla</b>. Lo determinamos en la inspección con una prueba de humedad.' },
      { q: '¿Cuánto tarda el trabajo?', a: 'Un techo plano residencial toma <b>2 a 4 días</b>; superficies comerciales grandes requieren más tiempo. Te damos el estimado en la cotización.' },
      { q: '¿La impermeabilización del techo plano tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre el sistema aplicado, con membranas certificadas.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Corregimos drenaje y colocamos la membrana correcta, <b>desde $3.50 por pie²</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'techos-de-zinc',
    eyebrow: 'Techos de zinc',
    noun: 'reparación de techos de zinc',
    h1before: 'Reparación y Sellado de Techos de Zinc y Metal en',
    h1em: 'Puerto Rico',
    h1after: '.',
    metaTitle: 'Reparación de Techos de Zinc y Metal | Ilatek Techos',
    metaDescription:
      'Reparación y sellado de techos de zinc y metal en Puerto Rico desde $400. Tratamiento de óxido, sellado de traslapes y protección anticorrosiva con garantía escrita.',
    hero: pic('presion', { alt: 'Techos de metal y zinc en Puerto Rico — instalación, sellado y protección en {{custom_values.county_name_and_state}}', title: 'Techos de metal y zinc · Ilatek Techos', badge: 'Metal y zinc · Sellado' }),
    incl: pic('postconstruccion', { alt: 'Sellado y tratamiento anticorrosivo de techo de zinc por Ilatek Techos en Puerto Rico', title: 'Techos de zinc · Ilatek Techos', caption: 'Traslapes · Tornillos · Anticorrosivo' }),
    heroSub:
      'Los techos de zinc son comunes en anexos, garajes y quioscos, pero el óxido y el viento los castigan. Ilatek repara y sella techos de zinc en {{custom_values.county_name_and_state}} <b>desde $400</b>, con tratamiento anticorrosivo y garantía escrita.',
    facts: [
      { b: '$400', s: 'por trabajo', label: 'Tratamiento incluido' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'shield', h: 'Frena el óxido', p: 'Tratamos la corrosión activa y aplicamos recubrimiento que protege el metal por más tiempo.' },
      { icon: 'bolt', h: 'Sella traslapes y tornillos', p: 'Sellamos las uniones entre láminas y los tornillos flojos, que son las entradas de agua más comunes.' },
      { icon: 'clock', h: 'Asegura contra el viento', p: 'Reforzamos las fijaciones para que las láminas no se levanten con los vientos de tormenta.' },
    ],
    incluye: {
      title: 'Cómo reparamos un techo de zinc.',
      answer:
        '<b>En el zinc, el enemigo es el óxido y los traslapes abiertos.</b> Ilatek limpia el metal, trata la corrosión, aprieta y sella tornillos, sella las uniones entre láminas y aplica protección anticorrosiva.',
      checks: [
        'Cepillado y preparación del metal',
        'Tratamiento del óxido activo',
        'Sellado de traslapes y uniones',
        'Reemplazo de tornillos y fijaciones',
        'Recubrimiento anticorrosivo',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu techo de zinc',
    },
    extra: {
      eyebrow: 'Problemas típicos',
      title: 'Qué daña un techo de zinc en Puerto Rico.',
      items: [
        { tag: 'Óxido', h: 'Corrosión por sal y humedad', p: 'La brisa salina de la costa y la humedad constante perforan el zinc sin protección.' },
        { tag: 'Agua', h: 'Traslapes abiertos', p: 'Las uniones entre láminas se aflojan y dejan pasar el agua directamente.' },
        { tag: 'Viento', h: 'Láminas levantadas', p: 'Tornillos flojos o herrumbrados permiten que el viento levante las láminas en tormentas.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta reparar un techo de zinc?', a: 'La reparación y sellado de techos de zinc de Ilatek <b>comienza desde $400</b>, incluyendo tratamiento anticorrosivo y sellado de uniones. El precio depende del área y del estado del metal.' },
      { q: '¿Por qué se oxida tan rápido el zinc en Puerto Rico?', a: 'Por el <b>aire salino de la costa, la humedad y la lluvia constante</b>. Sin recubrimiento protector, el zinc se perfora en pocos años y comienza a gotear.' },
      { q: '¿Se puede reparar un techo de zinc oxidado?', a: '<b>Si el óxido es superficial o puntual, sí</b>: se trata y se protege. Si ya perforó grandes áreas, evaluamos sustituir las láminas dañadas. Te lo decimos claro.' },
      { q: '¿Qué sellador se usa en techos de zinc?', a: 'Usamos <b>selladores y recubrimientos específicos para metal</b>, con tratamiento anticorrosivo previo, porque un sellador para concreto no adhiere bien al zinc.' },
      { q: '¿Cómo sellan las uniones entre láminas?', a: 'Aplicamos <b>sellador flexible en los traslapes</b> y reponemos tornillos y arandelas de sellado para que el agua no pase por las uniones ni por las fijaciones.' },
      { q: '¿Cuánto tarda el trabajo?', a: 'Un techo de zinc de anexo o garaje se completa normalmente en <b>uno a dos días</b>, según el área y el grado de oxidación.' },
      { q: '¿La reparación del techo de zinc tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre el tratamiento y sellado aplicado.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Tratamos el óxido de raíz, sellamos uniones y protegemos el metal, <b>desde $400</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'techos-de-asfalto',
    eyebrow: 'Techos de asfalto',
    noun: 'reparación de techos de asfalto',
    h1before: 'Reparación de Techos de Asfalto (Shingles) en',
    h1em: 'Puerto Rico',
    h1after: '.',
    metaTitle: 'Reparación de Techos de Asfalto (Shingles) | Ilatek Techos',
    metaDescription:
      'Reparación de techos de asfalto y shingles en Puerto Rico desde $350. Sustitución de tejas dañadas y sellado de filtraciones con garantía escrita. Inspección gratis.',
    hero: pic('residencial', { alt: 'Reparación de techo de asfalto y shingles en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Techos de asfalto · Ilatek Techos', badge: 'Shingles reparados' }),
    incl: pic('postconstruccion', { alt: 'Reparación de shingles de techo por Ilatek Techos en Puerto Rico — filtraciones selladas', title: 'Techos de asfalto · Ilatek Techos', caption: 'Shingles sustituidos · Sellado de filtraciones' }),
    heroSub:
      'Los shingles de asfalto se levantan, se parten y dejan pasar el agua por debajo. Ilatek repara techos de asfalto en {{custom_values.county_name_and_state}} <b>desde $350</b>, sustituyendo piezas dañadas y sellando filtraciones, con garantía escrita.',
    facts: [
      { b: '$350', s: 'por reparación', label: 'Piezas incluidas' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'bolt', h: 'Reponemos shingles dañados', p: 'Sustituimos las tejas sueltas, partidas o faltantes para reconstruir la barrera donde el agua se cuela.' },
      { icon: 'drop', h: 'Sellamos por debajo', p: 'El agua en un techo de asfalto entra por las capas inferiores: sellamos la entrada, no solo la teja visible.' },
      { icon: 'clock', h: 'Prolonga la vida del techo', p: 'Reparar a tiempo las piezas dañadas evita tener que reemplazar todo el techo de asfalto antes de tiempo.' },
    ],
    incluye: {
      title: 'Cómo reparamos un techo de asfalto.',
      answer:
        '<b>En un techo de asfalto, una teja rota es una entrada de agua.</b> Ilatek identifica las piezas dañadas, repone los shingles y sella las capas inferiores y los remates para cortar la filtración.',
      checks: [
        'Inspección de shingles sueltos o faltantes',
        'Sustitución de piezas dañadas',
        'Sellado de tapajuntas y remates',
        'Tratamiento de las capas inferiores',
        'Sellado de penetraciones y canales',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu techo de asfalto',
    },
    extra: {
      eyebrow: 'Señales',
      title: 'Cuándo tu techo de asfalto necesita reparación.',
      items: [
        { tag: 'Piezas', h: 'Shingles sueltos', p: 'Tejas levantadas o volando tras el viento: cada una es un punto por donde entra el agua.' },
        { tag: 'Superficie', h: 'Grietas y decoloración', p: 'Shingles secos y agrietados por el sol pierden su capacidad de impermeabilizar.' },
        { tag: 'Interior', h: 'Manchas en el techo interior', p: 'Manchas y humedad debajo indican que el agua ya pasó las capas del asfalto.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta reparar un techo de asfalto?', a: 'La reparación de techos de asfalto de Ilatek <b>comienza desde $350</b>, incluyendo sustitución de shingles dañados y sellado. El precio depende del área y del alcance. Cotiza para tu número exacto.' },
      { q: '¿Qué son los shingles y por qué fallan?', a: 'Los shingles son tejas de asfalto que forman la cubierta del techo. Fallan por <b>sol intenso, viento, humedad y envejecimiento</b>: se secan, se agrietan y se levantan, dejando pasar el agua.' },
      { q: '¿Se pueden reparar solo algunas tejas?', a: '<b>Sí</b>, si el daño es localizado reponemos solo las piezas afectadas y sellamos la zona. Si el techo está deteriorado en general, te explicamos las opciones.' },
      { q: '¿Cuánto dura un techo de asfalto?', a: 'Un techo de asfalto dura <b>de 15 a 25 años</b> según la calidad del shingle y el mantenimiento. En Puerto Rico, el sol y la lluvia pueden acortar su vida, por eso conviene revisarlo cada año.' },
      { q: '¿Es mejor reparar o reemplazar el techo de asfalto?', a: 'Si el daño es puntual, <b>reparar</b> es lo rentable; si más del 30% del techo está deteriorado o tiene filtraciones generalizadas, suele convenir <b>reemplazar</b>. Te damos ambas cotizaciones.' },
      { q: '¿Cuánto tarda la reparación?', a: 'Una reparación puntual de shingles se completa normalmente <b>el mismo día</b>. Áreas mayores o remates extensos pueden requerir dos jornadas.' },
      { q: '¿La reparación del techo de asfalto tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre el trabajo de sustitución y sellado.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Sustituimos las piezas correctas y sellamos la entrada real del agua, <b>desde $350</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'techos-de-teja',
    eyebrow: 'Techos de teja',
    noun: 'reparación de techos de teja',
    h1before: 'Reparación y Sellado de Techos de Teja en',
    h1em: 'Puerto Rico',
    h1after: '.',
    metaTitle: 'Reparación de Techos de Teja | Ilatek Techos',
    metaDescription:
      'Reparación y sellado de techos de teja en Puerto Rico desde $400. Sellado de traslapes y remates sin dañar la pieza, con garantía escrita. Inspección gratis.',
    hero: pic('residencial', { alt: 'Reparación de techo de teja en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Techos de teja · Ilatek Techos', badge: 'Trato cuidadoso de la teja' }),
    incl: pic('postconstruccion', { alt: 'Sellado de techo de teja por Ilatek Techos en Puerto Rico — traslapes y remates', title: 'Techos de teja · Ilatek Techos', caption: 'Traslapes sellados · Remates firmes' }),
    heroSub:
      'Las tejas son hermosas pero delicadas: una pieza suelta o un traslape abierto deja pasar el agua. Ilatek repara y sella techos de teja en {{custom_values.county_name_and_state}} <b>desde $400</b>, con cuidado de la pieza y garantía escrita.',
    facts: [
      { b: '$400', s: 'por trabajo', label: 'Sellado incluido' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'shield', h: 'Sin dañar la teja', p: 'Trabajamos con cuidado para sellar y reparar sin romper piezas que son costosas de reponer.' },
      { icon: 'drop', h: 'Sellamos traslapes', p: 'El agua entra por los traslapes y remates: los sellamos con producto compatible para que no se filtre.' },
      { icon: 'clock', h: 'Conservamos la estética', p: 'Reparamos de forma que el techo mantenga su apariencia original, sin parches visibles.' },
    ],
    incluye: {
      title: 'Cómo reparamos un techo de teja.',
      answer:
        '<b>La teja no se pisa ni se fuerza: se trabaja con método.</b> Ilatek inspecciona las piezas, repone las quebradas, sella traslapes y remates, y verifica la capa impermeable debajo de la teja.',
      checks: [
        'Inspección de piezas quebradas o movidas',
        'Reposición cuidadosa de tejas',
        'Sellado de traslapes y cumbrera',
        'Revisión de la capa impermeable inferior',
        'Sellado de remates y penetraciones',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu techo de teja',
    },
    extra: {
      eyebrow: 'Señales',
      title: 'Qué revisar en un techo de teja.',
      items: [
        { tag: 'Piezas', h: 'Tejas rotas o movidas', p: 'Una pieza quebrada o deslizada expone la capa de abajo y deja pasar el agua.' },
        { tag: 'Uniones', h: 'Traslapes abiertos', p: 'Con el tiempo los sellos de los traslapes se abren: por ahí se filtra la lluvia.' },
        { tag: 'Cumbrera', h: 'Remates sueltos', p: 'La cumbrera y los bordes son los puntos más vulnerables: si están sueltos, entra el agua.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta reparar un techo de teja?', a: 'La reparación y sellado de techos de teja de Ilatek <b>comienza desde $400</b>. El precio depende del número de piezas a reponer y del área a sellar. Cotiza para tu número exacto.' },
      { q: '¿Por qué se filtra un techo de teja?', a: 'Por <b>piezas quebradas o movidas, traslapes abiertos y remates sueltos</b>. La teja es la cubierta, pero la impermeabilidad real está en la capa inferior; si la teja falla, el agua pasa.' },
      { q: '¿Se puede sellar una teja sin quitarla?', a: '<b>En muchos casos sí</b>: sellamos traslapes y fijaciones sin desmontar la pieza. Si está quebrada, se repone con cuidado para no dañar las vecinas.' },
      { q: '¿Con qué sellan los techos de teja?', a: 'Usamos <b>selladores compatibles con teja</b> y de alta adherencia, evitando productos que manchen o dañen la pieza. El objetivo es sellar sin alterar la estética.' },
      { q: '¿Cuánto dura la reparación de un techo de teja?', a: 'Una reparación puntual se completa en <b>uno o dos días</b>; el sellado de toda la superficie puede tomar más según el área y el acceso al techo.' },
      { q: '¿Se pueden reponer tejas quebradas?', a: '<b>Sí.</b> Reponemos las piezas dañadas cuando están disponibles, o sellamos de forma impermeable si la pieza no se consigue, cuidando siempre la apariencia.' },
      { q: '¿La reparación de la teja tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre la reparación y el sellado realizado.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Trabajamos la teja con cuidado, sellamos sin dañarla y conservamos su estética, <b>desde $400</b>, con inspección gratis y garantía escrita en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'techos-de-madera',
    eyebrow: 'Techos de madera',
    noun: 'sellado de techos de madera',
    h1before: 'Sellado y Protección de Techos de Madera en',
    h1em: 'Puerto Rico',
    h1after: '.',
    metaTitle: 'Sellado y Protección de Techos de Madera | Ilatek Techos',
    metaDescription:
      'Sellado y protección de techos de madera en Puerto Rico desde $350. Tratamiento contra humedad, comején y filtración con garantía escrita. Inspección gratis.',
    hero: pic('residencial', { alt: 'Sellado y protección de techo de madera en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Techos de madera · Ilatek Techos', badge: 'Contra humedad y comején' }),
    incl: pic('postconstruccion', { alt: 'Protección de techo de madera por Ilatek Techos en Puerto Rico — tratamiento antihumedad', title: 'Techos de madera · Ilatek Techos', caption: 'Humedad tratada · Madera protegida' }),
    heroSub:
      'La madera del techo sufre con la humedad, el sol y el comején. Ilatek la sella y protege en {{custom_values.county_name_and_state}} <b>desde $350</b>, cortando la filtración y prolongando la vida de la estructura, con garantía escrita.',
    facts: [
      { b: '$350', s: 'por trabajo', label: 'Sellado incluido' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'drop', h: 'Corta la humedad', p: 'Sellamos las entradas de agua que mantienen la madera húmeda, la causa del deterioro y del comején.' },
      { icon: 'shield', h: 'Protector de madera', p: 'Aplicamos selladores y protectores que repelen el agua y frenan el envejecimiento del material.' },
      { icon: 'clock', h: 'Alarga la estructura', p: 'Proteger la madera a tiempo evita tener que sustituir vigas y tablones de un techo estructural.' },
    ],
    incluye: {
      title: 'Cómo sellamos y protegemos un techo de madera.',
      answer:
        '<b>En la madera, la humedad es el enemigo principal.</b> Ilatek identifica y sella las filtraciones, aplica protector repelente y trata las zonas afectadas por humedad u hongos.',
      checks: [
        'Inspección de humedad y estado de la madera',
        'Sellado de filtraciones del techo',
        'Aplicación de protector repelente',
        'Tratamiento de zonas con hongos',
        'Revisión de fijaciones y estructura',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu techo de madera',
    },
    extra: {
      eyebrow: 'Riesgos',
      title: 'Qué daña un techo de madera.',
      items: [
        { tag: 'Humedad', h: 'Filtraciones constantes', p: 'El agua que se filtra mantiene la madera húmeda y acelera su deterioro y pudrición.' },
        { tag: 'Plagas', h: 'Comején', p: 'La madera húmeda atrae comején, que devora la estructura desde adentro sin que se note.' },
        { tag: 'Sol', h: 'Resecamiento y grietas', p: 'La exposición directa al sol reseca y agrieta la madera, abriendo nuevas entradas de agua.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta sellar un techo de madera?', a: 'El sellado y protección de techos de madera de Ilatek <b>comienza desde $350</b>. El precio depende del área, el estado de la madera y el tratamiento necesario. Cotiza para tu número exacto.' },
      { q: '¿Por qué se daña la madera del techo?', a: 'Por <b>humedad constante, sol intenso y comején</b>. El agua que se filtra mantiene la madera húmeda y la vuelve vulnerable a hongos, pudrición y plagas.' },
      { q: '¿Se puede salvar un techo de madera con humedad?', a: '<b>Si el daño no es avanzado, sí</b>: sellamos la filtración, tratamos la humedad y aplicamos protector. Si hay pudrición estructural, te informamos qué partes hay que sustituir.' },
      { q: '¿Qué protector usan para la madera?', a: 'Aplicamos <b>protectores repelentes de agua</b> específicos para madera, que reducen la absorción de humedad y frenan el envejecimiento del material.' },
      { q: '¿El tratamiento contra comején está incluido?', a: 'El sellado previene la humedad que atrae al comején, pero <b>el tratamiento de plagas es un servicio aparte</b>. En la inspección te indicamos si hace falta.' },
      { q: '¿Cuánto tarda el trabajo?', a: 'Un techo de madera residencial se sella y protege en <b>uno a dos días</b>, dependiendo del área y del tratamiento necesario.' },
      { q: '¿La protección del techo de madera tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre el sellado y la protección aplicada.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Cortamos la humedad y protegemos la madera con productos correctos, <b>desde $350</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),
];
