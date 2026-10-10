// Ilatek · Techos · Clúster A — Reparación de Techos (madre + hijos).
import { mk, pic } from '../kit.mjs';

const LINK = '{{custom_values.website_url}}/cotizacion';

export const reparacion = [
  mk({
    slug: 'reparacion-de-techos',
    role: 'mother',
    eyebrow: 'Reparación de techos',
    noun: 'reparación de techos',
    h1before: 'Reparación de Techos en Puerto Rico que',
    h1em: 'detiene filtraciones',
    h1after: 'de raíz.',
    metaTitle: 'Reparación de Techos en Puerto Rico | Ilatek Techos',
    metaDescription:
      'Reparación de techos en Puerto Rico desde $250: goteras, filtraciones y grietas en techos de concreto, zinc y asfalto. Inspección gratis, garantía por escrito y 78 municipios.',
    hero: pic('postconstruccion', {
      alt: 'Equipo de Ilatek Techos reparando un techo en Puerto Rico — sellado de filtraciones y goteras en {{custom_values.county_name_and_state}}',
      title: 'Reparación de Techos en Puerto Rico · Ilatek Techos',
      badge: 'Inspección gratis · Garantía escrita',
    }),
    incl: pic('presion', {
      alt: 'Reparación de techos de concreto y zinc de Ilatek Techos en Puerto Rico — tratamiento de grietas y filtraciones',
      title: 'Reparación de techos en Puerto Rico · Ilatek Techos',
      caption: 'Concreto · Zinc · Asfalto · Membranas',
    }),
    heroSub:
      'Ilatek repara techos de concreto, zinc y asfalto en {{custom_values.county_name_and_state}} <b>desde $250</b>: sellamos goteras, filtraciones y grietas con materiales certificados y garantía por escrito. Inspección gratis y cobertura en los 78 municipios.',
    facts: [
      { b: '$250', s: 'por reparación', label: 'Diagnóstico incluido' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'drop', h: 'Filtraciones resueltas de raíz', p: 'No pintamos encima: localizamos el punto real de entrada de agua y sellamos la causa, no solo la mancha visible del techo.' },
      { icon: 'shield', h: 'Garantía por escrito', p: 'Cada reparación se entrega con garantía de mano de obra. Si vuelve a filtrar dentro del periodo cubierto, regresamos.' },
      { icon: 'clock', h: 'Respuesta rápida', p: 'Atendemos emergencias de goteras y techos dañados con visita prioritaria: detener el agua hoy evita daños mayores mañana.' },
    ],
    benTitle: 'Más que tapar un hueco: devolverle la vida a tu techo.',
    incluye: {
      title: 'Todo lo que incluye nuestra reparación de techos.',
      answer:
        '<b>Sí, es una reparación completa.</b> Ilatek evalúa tu techo, identifica la causa de la filtración y ejecuta la reparación correcta para el material de tu techo — cubriendo concreto, zinc, asfalto (shingles), teja y membranas planas.',
      checks: [
        'Inspección y diagnóstico del techo sin costo',
        'Sellado de goteras y puntos de filtración',
        'Reparación de grietas y uniones abiertas',
        'Sustitución de láminas y piezas dañadas',
        'Corrección de empozamientos y pendientes',
        'Garantía por escrito del trabajo realizado',
      ],
      cta: 'Cotiza tu reparación',
    },
    extra: {
      eyebrow: 'Servicios de reparación',
      title: 'Reparamos el problema específico de tu techo.',
      kids: [
        { slug: 'reparacion-de-goteras', name: 'Reparación de Goteras', desc: 'Goteras activas durante la lluvia: localizamos y sellamos el punto exacto en concreto, zinc o asfalto.' },
        { slug: 'reparacion-de-filtraciones', name: 'Reparación de Filtraciones', desc: 'Agua que penetra y daña el interior: sellado profundo de filtraciones y humedad en techos.' },
        { slug: 'reparacion-de-grietas-techos', name: 'Reparación de Grietas', desc: 'Grietas en losas y techos de concreto: sellado estructural que evita que el agua entre.' },
        { slug: 'empozamiento-de-techos', name: 'Corrección de Empozamientos', desc: 'Agua estancada que se filtra con el tiempo: corregimos la pendiente y el drenaje del techo.' },
        { slug: 'reparacion-post-huracan', name: 'Reparación Post-Huracán', desc: 'Techos dañados por viento y lluvia: estabilización, reparación y documentación para tu seguro.' },
      ],
      cta: { slug: 'cotizacion', label: 'Solicita tu cotización gratis' },
    },
    faq: [
      { q: '¿Cuánto cuesta reparar un techo en Puerto Rico?', a: 'Las reparaciones de techo de Ilatek <b>comienzan desde $250</b> para trabajos puntuales de goteras y grietas. El precio final depende del tamaño del área, el tipo de techo (concreto, zinc o asfalto) y el alcance de la reparación. Usa el cotizador y recibe tu número real en minutos.' },
      { q: '¿La inspección del techo tiene costo?', a: '<b>No.</b> La evaluación inicial de tu techo es gratis: subimos, identificamos el problema y te explicamos qué necesita — sin compromiso de contratar.' },
      { q: '¿Qué tipos de techo reparan?', a: 'Reparamos <b>techos de concreto (losas), zinc y metal, asfalto (shingles), teja, madera y techos planos con membrana</b>. Cada material requiere un tratamiento y sellador distinto; lo definimos en la inspección.' },
      { q: '¿Cómo sé si mi techo necesita reparación?', a: 'Señales claras: <b>manchas de humedad en el cielo raso, goteras durante la lluvia, tejas o láminas desplazadas, óxido visible, burbujas en el techo sellado y olor a humedad</b> en el ático o la segunda planta.' },
      { q: '¿Cuánto tarda una reparación de techo?', a: 'La mayoría de las reparaciones puntuales se completan en <b>un día</b>. Trabajos mayores —sustitución de láminas, corrección de pendientes o reparación post-huracán— pueden tomar de 1 a 3 días; te damos el tiempo estimado en la cotización.' },
      { q: '¿La reparación tiene garantía?', a: '<b>Sí.</b> Todo trabajo se entrega con garantía de mano de obra por escrito. Si el problema reaparece dentro del periodo cubierto, regresamos a corregirlo sin costo.' },
      { q: '¿Atienden emergencias de goteras?', a: 'Sí: atendemos <b>emergencias y trabajos planificados</b>. Si tu techo está filtrando ahora, priorizamos la visita para detener el agua antes de que dañe el interior. Reservas con el depósito de $50 descontable.' },
      { q: '¿Por qué reparar con Ilatek Techos?', a: 'Diagnóstico honesto, materiales certificados, <b>precio desde $250 por escrito</b>, inspección gratis, garantía de mano de obra y cobertura en los 78 municipios — con el respaldo de Ilatek en {{custom_values.county_name_and_state}}.' },
    ],
  }),

  mk({
    slug: 'reparacion-de-goteras',
    eyebrow: 'Reparación de goteras',
    noun: 'reparación de goteras',
    h1before: 'Reparación de Goteras en Puerto Rico que',
    h1em: 'detiene el agua',
    h1after: 'hoy mismo.',
    metaTitle: 'Reparación de Goteras en Puerto Rico | Ilatek Techos',
    metaDescription:
      'Reparación de goteras en techos de concreto, zinc y asfalto en Puerto Rico desde $250. Localizamos y sellamos el punto exacto. Inspección gratis y garantía escrita.',
    hero: pic('presion', { alt: 'Reparación de goteras en el techo en Puerto Rico — sellado del punto de filtración en {{custom_values.county_name_and_state}}', title: 'Reparación de Goteras en Puerto Rico · Ilatek Techos', badge: 'Goteras activas · Visita prioritaria' }),
    incl: pic('postconstruccion', { alt: 'Sellado de goteras de techo de Ilatek Techos en Puerto Rico — reparación de láminas y filtraciones', title: 'Reparación de goteras en Puerto Rico · Ilatek Techos', caption: 'Detección de causa · Sellado exacto' }),
    heroSub:
      'Una gotera que gotea hoy dañará tu cielo raso, tu pintura y tu instalación eléctrica mañana. Ilatek localiza el punto real de la filtración y lo sella en {{custom_values.county_name_and_state}} <b>desde $250</b>, con inspección gratis y garantía escrita.',
    facts: [
      { b: '$250', s: 'por gotera', label: 'Reparación puntual' },
      { b: '1', s: 'día típico', label: 'Trabajo completado' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'drop', h: 'Punto exacto, no manchas', p: 'La gotera aparece lejos de su origen. Rastreamos la entrada real del agua por la pendiente del techo y sellamos ahí, no donde gotea.' },
      { icon: 'bolt', h: 'Protege tu electricidad', p: 'El agua que baja junto a cables y cajas eléctricas es un riesgo de incendio. Detener la gotera rápido protege tu familia.' },
      { icon: 'shield', h: 'Garantía de mano de obra', p: 'Sellamos con materiales adecuados al material del techo y respaldamos el trabajo por escrito — si reaparece, volvemos.' },
    ],
    incluye: {
      title: 'Así detenemos tu gotera paso a paso.',
      answer:
        '<b>Una gotera se repara en el punto de entrada, no donde gotea.</b> Inspeccionamos el techo completo, rastreamos el agua por pendientes y uniones, y sellamos la causa con el producto correcto para concreto, zinc o asfalto.',
      checks: [
        'Rastreo del punto real de entrada de agua',
        'Sellado de uniones, traslapes y remates',
        'Sellado de tornillos y clavos expuestos',
        'Refuerzo de los bordes y la cumbrera',
        'Despeje de canaletas que causan rebose',
        'Prueba de agua y garantía por escrito',
      ],
      cta: 'Repara tu gotera hoy',
    },
    extra: {
      eyebrow: 'Señales',
      title: 'Cómo saber que tu gotera viene del techo.',
      items: [
        { tag: 'Interior', h: 'Mancha que crece', p: 'Una mancha café o amarilla que aumenta tras cada lluvia es señal de entrada activa de agua en el techo.' },
        { tag: 'Interior', h: 'Goteo durante la lluvia', p: 'Si gotea mientras llueve y para al secarse, el agua está entrando por el techo, no por plomería.' },
        { tag: 'Exterior', h: 'Burbujas o desprendimiento', p: 'El sellador viejo que se infla o despega deja pasar agua por debajo: hay que removerlo y resellar.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta reparar una gotera en Puerto Rico?', a: 'La reparación de goteras de Ilatek <b>comienza desde $250</b>, incluyendo diagnóstico y sellado del punto de entrada. El precio depende del tamaño del área y del tipo de techo. Recibe tu número exacto con el cotizador.' },
      { q: '¿Por qué gotea mi techo si no veo ningún hueco?', a: 'El agua viaja por la pendiente y las capas del techo antes de caer: <b>el origen suele estar a metros de la mancha visible</b>. Por eso inspeccionamos toda la superficie, las uniones y los remates antes de sellar.' },
      { q: '¿Pueden reparar la gotera mientras llueve?', a: 'Podemos <b>estabilizar</b> y detener el agua con sellador de emergencia durante la lluvia, pero el sellado definitivo requiere superficie seca para adherir bien. Coordinamos la visita definitiva al despejar.' },
      { q: '¿La gotera en techo de zinc se repara igual que en concreto?', a: 'No: <b>cada material usa distinto sellador y preparación</b>. En zinc tratamos corrosión y sellamos uniones metálicas; en concreto rellenamos grietas y aplicamos impermeabilizante. Usamos el producto correcto para cada techo.' },
      { q: '¿Cuánto tarda en repararse una gotera?', a: 'Una gotera puntual se repara normalmente en <b>un solo día</b>. Casos con varias entradas o daño estructural pueden requerir 2 a 3 visitas, lo cual te informamos antes de empezar.' },
      { q: '¿Reparar la gotera detiene el moho?', a: 'Detener la filtración es el primer paso: <b>sin agua no hay moho nuevo</b>. Si ya hay hongos en el interior, recomendamos tratar la zona después de sellar el techo para eliminar la humedad acumulada.' },
      { q: '¿Cuánto cuesta una inspección por goteras?', a: '<b>Nada.</b> La inspección para localizar tu gotera es gratis. Subimos al techo, identificamos la causa y te damos el precio por escrito sin compromiso.' },
      { q: '¿Por qué elegir Ilatek para reparar goteras?', a: 'Encontramos la causa real, no tapamos a ciegas: <b>precio desde $250</b>, inspección gratis, garantía de mano de obra, visita prioritaria para goteras activas y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'reparacion-de-filtraciones',
    eyebrow: 'Reparación de filtraciones',
    noun: 'reparación de filtraciones',
    h1before: 'Reparación de Filtraciones de Agua en Techos de',
    h1em: 'Puerto Rico',
    h1after: 'que protege tu hogar.',
    metaTitle: 'Reparación de Filtraciones de Agua en Techos | Ilatek Techos',
    metaDescription:
      'Reparación de filtraciones de agua en techos en Puerto Rico desde $300. Sellado profundo de humedad y filtraciones en concreto, zinc y asfalto con garantía escrita.',
    hero: pic('industrial', { alt: 'Reparación de filtraciones de agua en techo en Puerto Rico — sellado profundo en {{custom_values.county_name_and_state}}', title: 'Reparación de Filtraciones en Techos · Ilatek Techos', badge: 'Sellado profundo · Garantía escrita' }),
    incl: pic('postconstruccion', { alt: 'Impermeabilización de filtraciones de techo de Ilatek Techos en Puerto Rico — tratamiento de humedad', title: 'Reparación de filtraciones en Puerto Rico · Ilatek Techos', caption: 'Humedad tratada · Estructura protegida' }),
    heroSub:
      'Una filtración silenciosa daña vigas, varillas y cielo raso antes de que la notes. Ilatek sella filtraciones y humedad en techos de {{custom_values.county_name_and_state}} <b>desde $300</b>, con inspección gratis y garantía por escrito.',
    facts: [
      { b: '$300', s: 'por filtración', label: 'Sellado profundo' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'shield', h: 'Protege la estructura', p: 'El agua que se filtra oxida las varillas del techo y debilita la losa. Sellarla a tiempo evita reparaciones estructurales costosas.' },
      { icon: 'drop', h: 'Sellado multicapa', p: 'Removemos el sellador vencido, preparamos la superficie y aplicamos membrana para un sellado profundo, no una capa superficial.' },
      { icon: 'clock', h: 'Menos daño, menos costo', p: 'Ignorar una filtración sale el doble de caro después. Actuar en la primera señal detiene el daño y el gasto.' },
    ],
    incluye: {
      title: 'Cómo sellamos una filtración de raíz.',
      answer:
        '<b>Una filtración es agua que ya entró a las capas del techo.</b> Ilatek remueve el material vencido, corrige el punto de entrada y aplica un sistema de sellado que impermeabiliza la superficie completa — no un parche aislado.',
      checks: [
        'Remoción de sellador y material dañado',
        'Lavado a presión del área del techo',
        'Corrección de empozamientos y pendientes',
        'Aplicación de primer de adherencia',
        'Membrana impermeabilizante certificada',
        'Garantía por escrito del sellado',
      ],
      cta: 'Cotiza tu filtración',
    },
    extra: {
      eyebrow: 'Daños que evitas',
      title: 'Lo que una filtración hace si la ignoras.',
      items: [
        { tag: 'Estructura', h: 'Varillas oxidadas', p: 'El agua dentro de la losa oxida el acero de refuerzo hasta que se expande y revienta el concreto.' },
        { tag: 'Interior', h: 'Cielo raso y pintura', p: 'Manchas, desprendimiento de pintura y cielo raso hinchado que hay que sustituir completo.' },
        { tag: 'Salud', h: 'Moho y humedad', p: 'Un ambiente húmedo crónico cría hongos perjudiciales para las vías respiratorias de tu familia.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta reparar una filtración de techo?', a: 'El sellado de filtraciones de Ilatek <b>comienza desde $300</b>. El precio final depende del área afectada y del sistema de sellado necesario para tu tipo de techo. Cotiza y recibe tu precio en minutos.' },
      { q: '¿Cómo distingo una filtración de una gotera?', a: 'La <b>gotera</b> es agua visible que cae; la <b>filtración</b> es penetración de humedad que no siempre gotea — se nota por manchas, olor a humedad, pintura que se despega o cielo raso hinchado. Ambas son agua entrando al techo.' },
      { q: '¿Qué tipo de sellado utilizan?', a: 'Usamos <b>membranas impermeabilizantes certificadas</b> (asfálticas, elastoméricas y de silicona) según el material del techo, siempre sobre primer de adherencia y tras remover el material vencido.' },
      { q: '¿Cuánto dura el sellado de una filtración?', a: 'Un sellado bien aplicado con silicona 100% dura <b>de 20 a 25 años</b>; las membranas asfálticas y los acrílicos duran entre 7 y 15 años. La duración depende del sistema y del mantenimiento.' },
      { q: '¿Pueden sellar solo la parte que filtra?', a: 'Sí, sellamos el área afectada; pero si el sellador del resto del techo ya está vencido, recomendamos el sistema completo para que no aparezcan nuevas filtraciones al lado. Te explicamos ambas opciones con precio.' },
      { q: '¿Cuánto tarda el trabajo?', a: 'Depende del área: una filtración puntual se resuelve en <b>uno o dos días</b>, incluyendo remoción, lavado a presión, primer y membrana. El tiempo de curado varía por el clima de Puerto Rico; te lo indicamos al terminar.' },
      { q: '¿La reparación de filtración tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito. Si la filtración reaparece dentro del periodo cubierto, regresamos a corregirla.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Aplicamos el sistema correcto para cada techo, <b>desde $300</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios — protegiendo tu hogar en {{custom_values.county_name_and_state}}.' },
    ],
  }),

  mk({
    slug: 'reparacion-de-grietas-techos',
    eyebrow: 'Reparación de grietas',
    noun: 'reparación de grietas en techos',
    h1before: 'Reparación de Grietas en Techos de',
    h1em: 'Concreto y Losas',
    h1after: 'en Puerto Rico.',
    metaTitle: 'Reparación de Grietas en Techos de Concreto | Ilatek Techos',
    metaDescription:
      'Reparación de grietas en techos de concreto y losas en Puerto Rico desde $275. Sellado estructural que detiene la entrada de agua con garantía por escrito.',
    hero: pic('comercial', { alt: 'Reparación de grietas en techo de concreto en Puerto Rico — sellado de losa en {{custom_values.county_name_and_state}}', title: 'Reparación de Grietas en Techos · Ilatek Techos', badge: 'Sellado estructural' }),
    incl: pic('postconstruccion', { alt: 'Sellado de grietas en losa de concreto de Ilatek Techos en Puerto Rico — reparación de techos', title: 'Reparación de grietas en techos · Ilatek Techos', caption: 'Sellado flexible · Resistente al calor' }),
    heroSub:
      'Una grieta en la losa es una puerta abierta al agua y al óxido de las varillas. Ilatek sella grietas en techos de concreto de {{custom_values.county_name_and_state}} <b>desde $275</b>, con sellador flexible y garantía escrita.',
    facts: [
      { b: '$275', s: 'por grieta', label: 'Sellado puntual' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'shield', h: 'Sella y refuerza', p: 'Rellenamos la grieta con sellador flexible que acompaña el movimiento del concreto, en lugar de uno rígido que se vuelve a partir.' },
      { icon: 'bolt', h: 'Frena el óxido de varillas', p: 'Al cerrar la grieta, el agua y el oxígeno ya no alcanzan el acero de refuerzo — quitamos la causa de la corrosión.' },
      { icon: 'tag', h: 'Más barato que resellar todo', p: 'Sellar grietas puntuales a tiempo conserva el resto del techo y evita tener que rehacer la impermeabilización completa.' },
    ],
    incluye: {
      title: 'Cómo sellamos grietas en techos de concreto.',
      answer:
        '<b>Una grieta no se tapa con cemento rígido.</b> Perfilamos la grieta, la rellenamos con sellador flexible y la cubrimos con membrana impermeabilizante para que el movimiento normal del concreto no vuelva a abrirla.',
      checks: [
        'Perfilado y sellado de la grieta',
        'Relleno con sellador polimérico flexible',
        'Sellado de uniones de losa y remates',
        'Aplicación de membrana sobre la grieta',
        'Tratamiento de grietas de retracción',
        'Garantía por escrito del sellado',
      ],
      cta: 'Sella tus grietas',
    },
    extra: {
      eyebrow: 'Tipos de grietas',
      title: 'No todas las grietas son iguales.',
      items: [
        { tag: 'Superficial', h: 'Grieta capilar', p: 'Fina y superficial por retracción del concreto: se sella con membrana y no compromete la estructura.' },
        { tag: 'Activa', h: 'Grieta que se mueve', p: 'Abre y cierra con el calor: requiere sellador flexible que siga el movimiento sin partirse.' },
        { tag: 'Serio', h: 'Grieta profunda', p: 'Si es ancha y penetra la losa, puede exponer varillas. Requiere evaluación estructural y sellado reforzado.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta sellar una grieta en un techo?', a: 'Ilatek sella grietas en techos <b>desde $275</b>. El precio depende de la profundidad, la longitud y cuántas grietas tenga el techo. Con el cotizador obtienes tu precio estimado al instante.' },
      { q: '¿Qué sellador usan para las grietas?', a: 'Usamos <b>selladores poliméricos flexibles y membranas impermeabilizantes</b>. Evitamos el cemento rígido porque se vuelve a partir con el movimiento térmico normal del concreto en Puerto Rico.' },
      { q: '¿Las grietas del techo son peligrosas?', a: 'Las grietas capilares suelen ser cosméticas, pero <b>una grieta profunda deja pasar agua hasta las varillas de refuerzo</b>, que se oxidan y expanden. Por eso conviene sellarlas apenas aparecen.' },
      { q: '¿Por qué se agrieta un techo de concreto?', a: 'Por <b>retracción del concreto al fraguar, cambios de temperatura, asentamiento de la estructura o falta de sellado en juntas</b>. En Puerto Rico, el sol y las lluvias intensas aceleran el proceso.' },
      { q: '¿Se puede sellar la grieta si está mojada?', a: 'No de forma definitiva: <b>el sellador necesita superficie seca para adherir</b>. Si hay lluvia activa, estabilizamos y volvemos cuando la superficie esté seca para el sellado permanente.' },
      { q: '¿Cómo sabré si la grieta necesitaba reparación estructural?', a: '<b>En la inspección lo determinamos.</b> Si la grieta expone varillas oxidadas o atraviesa toda la losa, te lo decimos de frente y cotizamos el refuerzo necesario, sin venderte de más.' },
      { q: '¿Cuánto tarda sellar las grietas de un techo?', a: 'Un techo residencial típico se completa <b>el mismo día</b>, incluyendo lavado a presión, relleno y membrana. Techos grandes o con muchas grietas pueden extenderse a dos días; te lo confirmamos en la cotización.' },
      { q: '¿Por qué elegir Ilatek Techos para tus grietas?', a: 'Sellador flexible correcto, diagnóstico honesto y <b>precio desde $275</b> con inspección gratis y garantía por escrito, cubriendo {{custom_values.county_name_and_state}} y los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'empozamiento-de-techos',
    eyebrow: 'Empozamientos de agua',
    noun: 'corrección de empozamientos',
    h1before: 'Corrección de Empozamientos de Agua en Techos de',
    h1em: 'Puerto Rico',
    h1after: 'que evita filtraciones.',
    metaTitle: 'Empozamiento de Agua en Techos | Ilatek Techos',
    metaDescription:
      'Corrección de empozamientos de agua en techos planos y losas en Puerto Rico desde $350. Corregimos pendiente y drenaje para evitar filtraciones. Inspección gratis.',
    hero: pic('industrial', { alt: 'Corrección de empozamiento de agua en techo en Puerto Rico — drenaje y pendiente en {{custom_values.county_name_and_state}}', title: 'Empozamiento de agua en techos · Ilatek Techos', badge: 'Drenaje corregido' }),
    incl: pic('comercial', { alt: 'Corrección de pendiente y drenaje de techo de Ilatek Techos en Puerto Rico — empozamiento', title: 'Empozamiento de techos en Puerto Rico · Ilatek Techos', caption: 'Pendiente · Drenaje · Membrana' }),
    heroSub:
      'El agua estancada en tu techo es la causa silenciosa de las filtraciones: pesa, penetra y oxida. Ilatek corrige empozamientos en techos de {{custom_values.county_name_and_state}} <b>desde $350</b>, arreglando drenaje y pendiente con garantía escrita.',
    facts: [
      { b: '$350', s: 'por corrección', label: 'Drenaje incluido' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
      { b: '$0', s: 'inspección', label: 'Evaluación gratis' },
    ],
    benefits: [
      { icon: 'drop', h: 'Sin agua estancada', p: 'Corregimos la pendiente y los desagües para que el agua salga del techo en vez de quedarse empozada penetrando la losa.' },
      { icon: 'shield', h: 'Menos peso en la estructura', p: 'Cada pulgada de agua empozada pesa y castiga la estructura. Eliminarla alarga la vida de tu techo.' },
      { icon: 'clock', h: 'Evita la filtración futura', p: 'Resolvemos el empozamiento antes de que el agua se abra paso: es la prevención más efectiva de filtraciones.' },
    ],
    incluye: {
      title: 'Cómo eliminamos el empozamiento de tu techo.',
      answer:
        '<b>Un empozamiento se corrige corrigiendo el agua, no solo el charco.</b> Evaluamos la pendiente, despejamos y reparamos desagües, y aplicamos el material que restablece el flujo de agua hacia las salidas.',
      checks: [
        'Evaluación de pendiente y puntos bajos',
        'Despeje y reparación de desagües del techo',
        'Sellado de grietas de la zona empozada',
        'Nivelación con material de relleno',
        'Aplicación de membrana impermeabilizante',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Corrige tu empozamiento',
    },
    extra: {
      eyebrow: 'Causas',
      title: 'Por qué se empoza el agua en tu techo.',
      items: [
        { tag: 'Drenaje', h: 'Desagües tapados', p: 'Hojas, arena y escombros obstruyen las salidas y el agua no tiene por dónde ir.' },
        { tag: 'Pendiente', h: 'Pendiente perdida', p: 'Con los años la losa se asienta y pierde su inclinación: el agua se queda quieta donde ya no fluye.' },
        { tag: 'Superficie', h: 'Superficie hundida', p: 'Áreas dañadas o selladores vencidos crean concavidades donde el agua se acumula.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta corregir un empozamiento de techo?', a: 'La corrección de empozamientos de Ilatek <b>comienza desde $350</b>, incluyendo evaluación de pendiente y drenaje. El precio depende del área afectada y del estado de los desagües. Cotiza para tu número exacto.' },
      { q: '¿Por qué es malo que se empoze el agua en el techo?', a: 'El agua estancada <b>pesa sobre la estructura, se filtra por la losa y oxida las varillas de refuerzo</b>. Con el tiempo se convierte en goteras y daños mucho más costosos de reparar.' },
      { q: '¿Un empozamiento siempre causa filtración?', a: 'No de inmediato, pero <b>es la causa más común</b>: el agua quieta presiona la superficie hasta que encuentra un paso. Corregirlo temprano evita la filtración futura.' },
      { q: '¿Cómo corrigen la pendiente del techo?', a: 'Evaluamos los puntos bajos y aplicamos <b>material de relleno y membranas que restablecen el flujo</b> hacia los desagües. No demolimos la losa: reparamos la superficie para recuperar la pendiente.' },
      { q: '¿Pueden arreglar solo el desagüe tapado?', a: 'Si el empozamiento se debe únicamente a un drenaje obstruido, <b>sí</b>. Si además falta pendiente, te lo explicamos con ambas opciones y precio para que decidas.' },
      { q: '¿Cada cuánto debo despejar los desagües del techo?', a: 'Recomendamos revisar y despejar los desagües del techo <b>al menos dos veces al año</b>, y siempre tras la temporada de lluvias o una tormenta, para que el agua no se estanque.' },
      { q: '¿La corrección de empozamiento tiene garantía?', a: '<b>Sí</b>, cada corrección se entrega con garantía de mano de obra por escrito. Si el empozamiento reaparece dentro del periodo cubierto, regresamos.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Atacamos la causa del empozamiento —drenaje y pendiente— <b>desde $350</b>, con inspección gratis, garantía escrita y cobertura en los 78 municipios, protegiendo tu techo en {{custom_values.county_name_and_state}}.' },
    ],
  }),



  mk({
    slug: 'reparacion-post-huracan',
    eyebrow: 'Reparación post-huracán',
    noun: 'reparación de techo post-huracán',
    h1before: 'Reparación de Techos Post-Huracán en',
    h1em: 'Puerto Rico',
    h1after: ': estabilizamos y reparamos.',
    metaTitle: 'Reparación de Techos Post-Huracán | Ilatek Techos',
    metaDescription:
      'Reparación de techos post-huracán en Puerto Rico desde $350: estabilización, tarping, reparación y documentación para el seguro. Atención prioritaria.',
    hero: pic('postconstruccion', { alt: 'Reparación de techo dañado por huracán en Puerto Rico — estabilización y sellado en {{custom_values.county_name_and_state}}', title: 'Reparación de techos post-huracán · Ilatek Techos', badge: 'Atención prioritaria' }),
    incl: pic('presion', { alt: 'Reparación post-huracán de techos de Ilatek Techos en Puerto Rico — láminas y sellado de emergencia', title: 'Reparación post-huracán · Ilatek Techos', caption: 'Estabilizar · Documentar · Reparar' }),
    heroSub:
      'Después de una tormenta, cada hora que pasa con el techo abierto multiplica el daño. Ilatek estabiliza, documenta y repara techos dañados por huracán en {{custom_values.county_name_and_state}} <b>desde $350</b> — con atención prioritaria y garantía escrita.',
    facts: [
      { b: '$350', s: 'emergencia', label: 'Estabilización' },
      { b: '24h', s: 'respuesta', label: 'Visita prioritaria' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'clock', h: 'Estabilizamos primero', p: 'Lo urgente es cerrar la entrada de agua: cubrimos y aseguramos el área dañada antes de la reparación definitiva.' },
      { icon: 'shield', h: 'Documentamos para tu seguro', p: 'Levantamos evidencia fotográfica del daño y del alcance para que tu reclamación al seguro sea sólida.' },
      { icon: 'bolt', h: 'Reparación seria', p: 'Sustituimos láminas, sellamos y reforzamos lo que el viento y la lluvia dañaron, con materiales y garantía de mano de obra.' },
    ],
    incluye: {
      title: 'Cómo atendemos un techo dañado por huracán.',
      answer:
        '<b>Primero se estabiliza, después se repara.</b> Ilatek asegura el techo para detener el agua, documenta el daño para tu seguro y ejecuta la reparación definitiva con el material correcto.',
      checks: [
        'Inspección de daños y evaluación de riesgo',
        'Estabilización y cubrimiento del área',
        'Documentación fotográfica para el seguro',
        'Sustitución de láminas y piezas perdidas',
        'Sellado de juntas, remates y penetraciones',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Solicita atención post-huracán',
    },
    extra: {
      eyebrow: 'Daños típicos',
      title: 'Qué deja un huracán en los techos de Puerto Rico.',
      items: [
        { tag: 'Zinc', h: 'Láminas levantadas o voladas', p: 'El viento arranca láminas y deja el techo abierto a la lluvia: hay que cubrir y reponer.' },
        { tag: 'Losas', h: 'Grietas y remates rotos', p: 'La fuerza del viento y los escombros vuelan remates y abren grietas nuevas en las losas.' },
        { tag: 'Agua', h: 'Filtraciones generalizadas', p: 'La lluvia intensa se abre paso por donde el techo quedó debilitado, filtrándose al interior.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta reparar un techo después de un huracán?', a: 'La atención post-huracán de Ilatek <b>comienza desde $350</b> para la estabilización y evaluación, con la reparación definitiva cotizada por separado. Atendemos con visita prioritaria.' },
      { q: '¿Atienden emergencias inmediatamente?', a: 'Sí: damos <b>atención prioritaria</b> a techos dañados con riesgo de filtración activa. Coordinamos la visita junto a ti y reservas con el depósito descontable de $50.' },
      { q: '¿Qué hacen primero en un techo dañado?', a: '<b>Estabilizar el techo</b> para detener la entrada de agua — cubrir, asegurar y sellar provisionalmente — antes de la reparación definitiva. Así se evita que el daño interior siga creciendo.' },
      { q: '¿Documentan el daño para el seguro?', a: 'Sí: <b>levantamos evidencia fotográfica del daño</b> y del alcance para respaldar tu reclamación. Es un servicio que muchos propietarios desconocen y que marca la diferencia con la aseguradora.' },
      { q: '¿Qué pasa si el techo está muy dañado para reparar?', a: 'Si el daño hace la reparación inviable, <b>te lo decimos de frente</b> y trabajamos la estabilización y el diagnóstico para que puedas planificar el reemplazo con información clara.' },
      { q: '¿Puedo pedir la reparación sin reclamar al seguro?', a: '<b>Sí.</b> Reparamos con o sin reclamación. Si decides no usar el seguro, te damos el precio de la reparación por escrito igual.' },
      { q: '¿La reparación post-huracán tiene garantía?', a: '<b>Sí.</b> El trabajo definitivo se entrega con garantía de mano de obra por escrito, igual que cualquier otra reparación de techo de Ilatek.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Respuesta prioritaria, estabilización, documentación para el seguro y reparación seria con garantía — <b>desde $350</b> y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),
];
