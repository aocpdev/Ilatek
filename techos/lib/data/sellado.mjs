// Ilatek · Techos · Clúster B — Sellado de Techos (madre + sistemas).
import { mk, pic } from '../kit.mjs';

export const sellado = [
  mk({
    slug: 'sellado-de-techos',
    role: 'mother',
    eyebrow: 'Sellado de techos',
    noun: 'sellado de techos',
    h1before: 'Sellado de Techos en Puerto Rico que',
    h1em: 'impermeabiliza de verdad',
    h1after: 'tu propiedad.',
    metaTitle: 'Sellado de Techos en Puerto Rico | Ilatek Techos',
    metaDescription:
      'Sellado de techos en Puerto Rico desde $2.50 por pie²: silicona 100%, membrana asfáltica, elastomérico, poliuretano y acrílico. Inspección gratis y garantía escrita.',
    hero: pic('industrial', {
      alt: 'Sellado de techos de Ilatek Techos en Puerto Rico — impermeabilización en {{custom_values.county_name_and_state}}',
      title: 'Sellado de Techos en Puerto Rico · Ilatek Techos',
      badge: 'Sistemas certificados · Garantía escrita',
    }),
    incl: pic('comercial', {
      alt: 'Aplicación de membrana impermeabilizante en techo en Puerto Rico — sellado de techos Ilatek',
      title: 'Sellado de techos en Puerto Rico · Ilatek Techos',
      caption: 'Primer · Membrana · Sellado final',
    }),
    heroSub:
      'Ilatek sella techos residenciales, comerciales e industriales en {{custom_values.county_name_and_state}} <b>desde $2.50 por pie²</b>: removemos el material vencido, corregimos empozamientos y aplicamos el sistema de sellado correcto para tu techo — con garantía por escrito.',
    facts: [
      { b: '$2.50', s: 'por pie²', label: 'Precio base' },
      { b: '5', s: 'sistemas', label: 'De sellado' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'shield', h: 'Sistema de 5 pasos', p: 'Remoción, lavado a presión, corrección de empozamientos, primer y membrana: el proceso completo que hace que el sellado dure años, no meses.' },
      { icon: 'drop', h: 'Producto correcto por techo', p: 'No todo techo lleva el mismo sellador. Recomendamos silicona, membrana, elastomérico, poliuretano o acrílico según tu superficie.' },
      { icon: 'tag', h: 'Precio por pie², sin sorpresas', p: 'Pagas por lo que mide tu techo: cotización clara por metro cuadrado, con el alcance y el sistema definidos por escrito.' },
    ],
    benTitle: 'Sellado profesional, no una capa de pintura.',
    incluye: {
      title: 'Qué incluye un sellado de techo completo.',
      answer:
        '<b>Un sellado serio se prepara antes de aplicarse.</b> Ilatek remueve el material vencido, lava a presión, corrige empozamientos, aplica primer de adherencia y coloca la membrana impermeabilizante que corresponde a tu superficie.',
      checks: [
        'Remoción de selladores y pinturas vencidas',
        'Lavado a presión del techo',
        'Corrección de empozamientos y pendiente',
        'Aplicación de primer de adherencia',
        'Membrana impermeabilizante certificada',
        'Garantía por escrito del sellado',
      ],
      cta: 'Cotiza tu sellado',
    },
    extra: {
      eyebrow: 'Sistemas de sellado',
      title: 'Elige el sistema correcto para tu techo.',
      kids: [
        { slug: 'sellado-de-silicona', name: 'Sellado con Silicona 100%', desc: 'El sistema de mayor durabilidad: silicona pura que mantiene su elasticidad y sella techos planos y concreto.' },
        { slug: 'membrana-asfaltica', name: 'Membrana Asfáltica', desc: 'Membrana modificada de gran espesor para techos sometidos a tráfico y a sol intenso.' },
        { slug: 'recubrimiento-elastomerico', name: 'Recubrimiento Elastomérico', desc: 'Coating elástico blanco que refleja el calor y sella microfisuras del concreto.' },
        { slug: 'sellado-de-poliuretano', name: 'Sellado de Poliuretano', desc: 'Sellador de alta resistencia mecánica y química para superficies exigentes.' },
        { slug: 'sellado-acrilico', name: 'Sellado Acrílico', desc: 'Opción económica y reflectiva para mantenimiento periódico de techos ya sellados.' },
      ],
      cta: { slug: 'cotizacion', label: 'Solicita tu cotización gratis' },
    },
    faq: [
      { q: '¿Cuánto cuesta sellar un techo en Puerto Rico?', a: 'El sellado de techos de Ilatek <b>comienza desde $2.50 por pie²</b> instalado. El precio final varía según el sistema (silicona, membrana, poliuretano o acrílico), el tamaño del techo y su condición. Un techo típico de 1,200 pies² se cotiza en minutos.' },
      { q: '¿Cada cuánto se debe sellar un techo?', a: 'La mayoría de los techos necesitan sellado <b>cada 5 a 10 años</b>, dependiendo del sistema. La silicona 100% dura de 20 a 25 años; el acrílico, de 7 a 10. En Puerto Rico, el sol y la lluvia aceleran el desgaste, por eso recomendamos inspección anual.' },
      { q: '¿Qué sistema de sellado es mejor?', a: 'Depende de tu techo: la <b>silicona 100%</b> ofrece la mayor vida útil; la <b>membrana asfáltica</b>, gran resistencia; el <b>elastomérico</b>, reflejo del calor; el <b>poliuretano</b>, dureza mecánica. Lo definimos según superficie y uso.' },
      { q: '¿Qué incluye el sellado de techo?', a: 'El <b>sistema de 5 pasos</b>: remoción de material vencido, lavado a presión, corrección de empozamientos, aplicación de primer y colocación de la membrana asfáltica o sellador final.' },
      { q: '¿Sellan techos comerciales e industriales?', a: 'Sí: sellamos <b>techos residenciales, comerciales e industriales</b>, incluyendo losas grandes, techos planos con membrana y naves industriales. El sistema y el precio se ajustan al tamaño y tránsito de la superficie.' },
      { q: '¿Cuánto dura un sellado de techo?', a: 'La silicona 100% bien aplicada dura <b>20 a 25 años</b>; el poliuretano, 10 a 15; la membrana asfáltica, 10 a 15; y el acrílico, 7 a 10 años. La duración depende del sistema y del mantenimiento.' },
      { q: '¿Ofrecen garantía en el sellado?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito. Utilizamos materiales certificados y procesos comprobados para que el techo quede protegido de verdad.' },
      { q: '¿Por qué elegir Ilatek Techos para sellar?', a: 'Proceso de 5 pasos, materiales certificados, <b>precio por pie² desde $2.50</b>, inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'sellado-de-silicona',
    eyebrow: 'Sellado con silicona 100%',
    noun: 'sellado de silicona',
    h1before: 'Sellado de Techos con Silicona 100% en',
    h1em: 'Puerto Rico',
    h1after: 'que dura 20 años o más.',
    metaTitle: 'Sellado de Silicona 100% para Techos | Ilatek Techos',
    metaDescription:
      'Sellado de techo con silicona 100% en Puerto Rico desde $3.50 por pie². Máxima elasticidad y durabilidad de 20 a 25 años. Inspección gratis y garantía escrita.',
    hero: pic('industrial', { alt: 'Sellado de techo con silicona 100% en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Sellado de silicona 100% · Ilatek Techos', badge: '20–25 años de durabilidad' }),
    incl: pic('comercial', { alt: 'Aplicación de silicona 100% en techo de Ilatek Techos en Puerto Rico — sellado impermeable', title: 'Sellado de silicona en Puerto Rico · Ilatek Techos', caption: 'Elasticidad permanente · Resistente al UV' }),
    heroSub:
      'La silicona 100% es el sistema de sellado más duradero para techos en Puerto Rico: mantiene su elasticidad por décadas frente al sol y la lluvia. Ilatek lo aplica en {{custom_values.county_name_and_state}} <b>desde $3.50 por pie²</b>, con garantía escrita.',
    facts: [
      { b: '$3.50', s: 'por pie²', label: 'Sistema completo' },
      { b: '20–25', s: 'años', label: 'Durabilidad' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'shield', h: 'Máxima durabilidad', p: 'La silicona 100% bien aplicada dura <b>20 a 25 años</b>, muy por encima del acrílico (7–10) o el poliuretano (10–15).' },
      { icon: 'drop', h: 'Elasticidad permanente', p: 'Acompaña el movimiento del techo sin cuartearse: por eso sella los techos planos y de concreto expuestos al calor intenso.' },
      { icon: 'bolt', h: 'Resiste el clima extremo', p: 'Soporta radiación UV, lluvia torrencial y brisa salina sin degradarse — ideal para el Caribe.' },
    ],
    incluye: {
      title: 'Cómo se aplica la silicona 100%.',
      answer:
        '<b>La silicona sella de verdad solo sobre superficie preparada.</b> Removemos el material viejo, lavamos a presión, corregimos empozamientos y aplicamos primer; después la silicona 100%, que se adhiere y elasticiza.',
      checks: [
        'Remoción de sellador acrílico o uretano vencido',
        'Lavado a presión del techo',
        'Corrección de empozamientos',
        'Aplicación de primer de adherencia',
        'Silicona 100% en capa uniforme',
        'Garantía por escrito del sistema',
      ],
      cta: 'Cotiza tu sellado de silicona',
    },
    extra: {
      eyebrow: 'Ideal para',
      title: 'Cuándo conviene la silicona 100%.',
      items: [
        { tag: 'Techos planos', h: 'Losas y techos planos', p: 'Donde el agua se empoza y el sol pega todo el día, la silicona ofrece la mejor barrera duradera.' },
        { tag: 'Última vez', h: 'Si quieres sellar y olvidarte', p: 'Para quien no quiere volver a sellar pronto: es el sistema de mayor vida útil del mercado.' },
        { tag: 'Clima crítico', h: 'Zonas costeras', p: 'En la costa, con brisa salina y UV intenso, la elasticidad de la silicona resiste mejor que otros selladores.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta sellar un techo con silicona?', a: 'El sellado con silicona 100% de Ilatek <b>comienza desde $3.50 por pie²</b> instalado, con rango de mercado entre $3.50 y $6.50 según la condición. Un techo de 1,200 pies² se cotiza en minutos.' },
      { q: '¿Cuánto dura la silicona en un techo?', a: 'La silicona 100% bien aplicada dura <b>de 20 a 25 años</b>, siempre que se aplique sobre superficie preparada. Es la mayor durabilidad entre los sistemas de sellado comunes.' },
      { q: '¿La silicona es mejor que la membrana asfáltica?', a: '<b>Depende del techo.</b> La silicona gana en durabilidad y elasticidad; la membrana asfáltica gana en resistencia al tránsito. Si tu techo se pisa, recomendamos membrana; si es una losa, silicona.' },
      { q: '¿Pueden aplicar silicona sobre el sellador viejo?', a: '<b>No directamente.</b> El sellador vencido debe removerse porque impide la adherencia; aplicar silicona encima de una capa suelta es un error que causa desprendimientos.' },
      { q: '¿La silicona blanca o la gris, cuál conviene?', a: 'Ambas sellan igual: <b>la blanca refleja el calor</b> y baja la temperatura del techo (ayuda a la factura de aire); la gris se usa más por estética. Te asesoramos según tu caso.' },
      { q: '¿Cuánto tarda aplicar la silicona?', a: 'Un techo residencial típico toma <b>2 a 3 días</b>, incluyendo remoción, lavado, primer y aplicación. El curado depende del clima; con sol caribeño es relativamente rápido.' },
      { q: '¿El sellado de silicona tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre el sistema aplicado, con materiales certificados.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Silicona 100% real (no mezclas), preparación completa de 5 pasos, <b>desde $3.50 por pie²</b>, inspección gratis y garantía escrita en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'membrana-asfaltica',
    eyebrow: 'Membrana asfáltica',
    noun: 'membrana asfáltica',
    h1before: 'Membrana Asfáltica para Techos en',
    h1em: 'Puerto Rico',
    h1after: ': sellado de alta resistencia.',
    metaTitle: 'Membrana Asfáltica para Techos | Ilatek Techos',
    metaDescription:
      'Instalación de membrana asfáltica en techos en Puerto Rico desde $4.00 por pie². Sellado de gran espesor y resistencia al tránsito. Inspección gratis y garantía escrita.',
    hero: pic('comercial', { alt: 'Instalación de membrana asfáltica en techo en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Membrana asfáltica para techos · Ilatek Techos', badge: 'Alta resistencia al tránsito' }),
    incl: pic('industrial', { alt: 'Membrana asfáltica aplicada en techo por Ilatek Techos en Puerto Rico — sellado impermeable', title: 'Membrana asfáltica en Puerto Rico · Ilatek Techos', caption: 'Membrana modificada · Resiste el sol' }),
    heroSub:
      'La membrana asfáltica da a tu techo un sellado grueso y resistente al tránsito y al sol. Ilatek la instala en {{custom_values.county_name_and_state}} <b>desde $4.00 por pie²</b>, con preparación completa y garantía por escrito.',
    facts: [
      { b: '$4.00', s: 'por pie²', label: 'Sistema completo' },
      { b: '10–15', s: 'años', label: 'Durabilidad' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'shield', h: 'Gran espesor protector', p: 'La membrana modificada forma una capa más gruesa que un simple coating, ideal para techos con tránsito o exposición fuerte.' },
      { icon: 'bolt', h: 'Resiste el sol intenso', p: 'Formulada para soportar la radiación del Caribe sin resquebrajarse ni perder adherencia.' },
      { icon: 'drop', h: 'Sella micro y macrofisuras', p: 'Cubre grietas, juntas y uniones para impermeabilizar la superficie con una barrera continua.' },
    ],
    incluye: {
      title: 'Cómo instalamos la membrana asfáltica.',
      answer:
        '<b>La membrana exige una base limpia y con primer.</b> Ilatek remueve el material viejo, lava a presión, aplica primer y coloca la membrana modificada, sellando juntas y remates para una barrera continua.',
      checks: [
        'Remoción de uretano, cemento y pinturas vencidas',
        'Lavado a presión del techo',
        'Corrección de empozamientos',
        'Primer de adherencia asfáltico',
        'Colocación de membrana modificada',
        'Sellado de juntas y garantía escrita',
      ],
      cta: 'Cotiza tu membrana',
    },
    extra: {
      eyebrow: 'Ideal para',
      title: 'Dónde rinde más la membrana asfáltica.',
      items: [
        { tag: 'Comercial', h: 'Techos con tránsito', p: 'Azoteas de edificios donde se camina o se instalan equipos: la membrana resiste el pisoteo.' },
        { tag: 'Grandes áreas', h: 'Losas extensas', p: 'En superficies amplias la membrana ofrece cobertura continua y uniforme, sin tantas uniones.' },
        { tag: 'Refuerzo', h: 'Techos ya sellados', p: 'Sirve para renovar un techo cuyo coating anterior ya cumplió su vida útil.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta instalar membrana asfáltica?', a: 'La membrana asfáltica de Ilatek <b>comienza desde $4.00 por pie²</b> instalada. El precio depende del área, la condición del techo y el espesor de la membrana. Cotiza para tu número exacto.' },
      { q: '¿Cuánto dura una membrana asfáltica?', a: 'Una membrana modificada bien instalada dura <b>de 10 a 15 años</b>, con inspecciones periódicas que permitan retocarla antes de que falle.' },
      { q: '¿Qué diferencia hay entre membrana y coating?', a: 'El <b>coating</b> es una capa líquida; la <b>membrana</b> es una lámina de mayor espesor y resistencia. Si tu techo recibe tránsito o está muy deteriorado, la membrana sostiene mejor.' },
      { q: '¿La membrana asfáltica se instala en caliente?', a: 'Existen sistemas aplicados <b>con calor (soplete) y sistemas autoadhesivos</b>. Elegimos el método según la superficie y las condiciones, buscando la mejor adherencia.' },
      { q: '¿Se puede instalar membrana sobre techo de concreto?', a: '<b>Sí</b>, es uno de sus usos más comunes: sobre la losa de concreto, con primer y corrección previa de empozamientos, forma una barrera impermeable duradera.' },
      { q: '¿Cuánto tarda el trabajo?', a: 'Depende del área: una azotea residencial puede tomar <b>2 a 4 días</b>; superficies comerciales grandes requieren más tiempo. Te damos el estimado en la cotización.' },
      { q: '¿La membrana asfáltica tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito, con materiales certificados y proceso comprobado.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Membrana de calidad, preparación completa con primer, <b>desde $4.00 por pie²</b>, inspección gratis y garantía escrita en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'recubrimiento-elastomerico',
    eyebrow: 'Recubrimiento elastomérico',
    noun: 'recubrimiento elastomérico',
    h1before: 'Recubrimiento Elastomérico para Techos en',
    h1em: 'Puerto Rico',
    h1after: ': sella y refresca.',
    metaTitle: 'Recubrimiento Elastomérico para Techos | Ilatek Techos',
    metaDescription:
      'Recubrimiento elastomérico para techos en Puerto Rico desde $3.00 por pie². Coating elástico blanco que refleja el calor y sella microfisuras. Inspección gratis.',
    hero: pic('industrial', { alt: 'Recubrimiento elastomérico blanco en techo en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Recubrimiento elastomérico · Ilatek Techos', badge: 'Refleja el calor' }),
    incl: pic('comercial', { alt: 'Coating elastomérico aplicado en techo por Ilatek Techos en Puerto Rico — sellado reflectivo', title: 'Recubrimiento elastomérico · Ilatek Techos', caption: 'Elástico · Reflectivo · Sellador' }),
    heroSub:
      'El recubrimiento elastomérico blanco sella microgrietas y refleja el calor del sol, bajando la temperatura del techo. Ilatek lo aplica en {{custom_values.county_name_and_state}} <b>desde $3.00 por pie²</b>, con garantía escrita.',
    facts: [
      { b: '$3.00', s: 'por pie²', label: 'Sistema completo' },
      { b: '5–10', s: 'años', label: 'Durabilidad' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'bolt', h: 'Refleja el calor', p: 'El acabado blanco devuelve la radiación solar y reduce la temperatura del techo, aliviando el calor interior.' },
      { icon: 'drop', h: 'Elástico y sellador', p: 'Se expande y contrae con el techo sin cuartearse, cubriendo las microfisuras por donde se filtra el agua.' },
      { icon: 'tag', h: 'Buen costo-beneficio', p: 'Más económico que la silicona o la membrana asfáltica, con resultados sólidos para mantenimiento periódico.' },
    ],
    incluye: {
      title: 'Cómo aplicamos el recubrimiento elastomérico.',
      answer:
        '<b>El elastomérico rinde cuando la superficie está limpia.</b> Ilatek remueve residuos, lava a presión, corrige empozamientos y aplica el coating en capas uniformes que sellan y reflejan el calor.',
      checks: [
        'Lavado a presión del techo',
        'Corrección de empozamientos y pendiente',
        'Sellado de grietas y uniones',
        'Aplicación de primer de adherencia',
        'Coating elastomérico blanco en capas',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu recubrimiento',
    },
    extra: {
      eyebrow: 'Ideal para',
      title: 'Cuándo conviene el elastomérico.',
      items: [
        { tag: 'Calor', h: 'Techos que calientan la casa', p: 'Si el segundo piso es un horno, el acabado reflectivo baja la temperatura y el uso del aire acondicionado.' },
        { tag: 'Mantenimiento', h: 'Renovar un techo sellado', p: 'Perfecto para reactivar un techo cuyo coating anterior ya cumplió su ciclo.' },
        { tag: 'Microfisuras', h: 'Concreto con grietas finas', p: 'Cubre las microfisuras del concreto que dejan pasar la humedad antes de convertirse en goteras.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta el recubrimiento elastomérico?', a: 'El recubrimiento elastomérico de Ilatek <b>comienza desde $3.00 por pie²</b> instalado. El precio depende del área y del estado del techo. Cotiza para tu número exacto.' },
      { q: '¿El elastomérico baja la temperatura del techo?', a: '<b>Sí.</b> Su acabado blanco refleja la radiación solar y reduce la temperatura de la superficie, lo que se nota en el calor interior y en el consumo de aire acondicionado.' },
      { q: '¿Cuánto dura un recubrimiento elastomérico?', a: 'Dura <b>de 5 a 10 años</b> según la exposición y el mantenimiento. Es menor que la silicona (20–25) pero mucho más económico, ideal para renovar cada cierto tiempo.' },
      { q: '¿Sella filtraciones el elastomérico?', a: 'Sella <b>microfisuras y superficies porosas</b>. Si el techo tiene goteras activas o grietas profundas, primero hay que reparar esa entrada y después aplicar el coating.' },
      { q: '¿Se puede aplicar sobre techo de zinc?', a: 'Sí, con preparación previa: <b>tratamos la oxidación y aplicamos primer</b> para que el elastomérico adhiera bien al metal y proteja contra la corrosión.' },
      { q: '¿Cuánto tarda la aplicación?', a: 'Un techo residencial típico se cubre en <b>1 a 2 días</b>, incluyendo lavado a presión, sellado de grietas y capas de coating. El secado depende del clima.' },
      { q: '¿El recubrimiento elastomérico tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre el sistema aplicado, con materiales certificados.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Coating reflectivo aplicado con preparación completa, <b>desde $3.00 por pie²</b>, inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'sellado-de-poliuretano',
    eyebrow: 'Sellado de poliuretano',
    noun: 'sellado de poliuretano',
    h1before: 'Sellado de Poliuretano para Techos en',
    h1em: 'Puerto Rico',
    h1after: ': alta resistencia.',
    metaTitle: 'Sellado de Poliuretano para Techos | Ilatek Techos',
    metaDescription:
      'Sellado de poliuretano para techos en Puerto Rico desde $4.50 por pie². Alta resistencia mecánica y química para superficies exigentes. Inspección gratis.',
    hero: pic('comercial', { alt: 'Sellado de poliuretano en techo en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Sellado de poliuretano · Ilatek Techos', badge: 'Alta resistencia' }),
    incl: pic('industrial', { alt: 'Aplicación de sellador de poliuretano en techo por Ilatek Techos en Puerto Rico', title: 'Sellado de poliuretano · Ilatek Techos', caption: 'Dureza mecánica · Adherencia fuerte' }),
    heroSub:
      'El poliuretano forma un sellado de gran dureza y adherencia para los techos más exigidos. Ilatek lo aplica en {{custom_values.county_name_and_state}} <b>desde $4.50 por pie²</b>, preparando la superficie y con garantía escrita.',
    facts: [
      { b: '$4.50', s: 'por pie²', label: 'Sistema completo' },
      { b: '10–15', s: 'años', label: 'Durabilidad' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'shield', h: 'Dureza mecánica', p: 'Resiste el tránsito y el roce mejor que un coating ligero: ideal para techos donde se camina o se colocan equipos.' },
      { icon: 'bolt', h: 'Adherencia fuerte', p: 'Se aferra al sustrato y forma una película continua resistente al desprendimiento y al desgaste.' },
      { icon: 'clock', h: 'Vida útil larga', p: 'Con 10 a 15 años de durabilidad, es un paso intermedio entre el acrílico económico y la silicona de 25 años.' },
    ],
    incluye: {
      title: 'Cómo aplicamos el poliuretano.',
      answer:
        '<b>El poliuretano necesita base firme y limpia.</b> Removemos el material vencido, lavamos a presión, aplicamos primer, corregimos fallas y colocamos el poliuretano en capas que forman una película resistente.',
      checks: [
        'Remoción del sellador anterior vencido',
        'Lavado a presión del techo',
        'Corrección de grietas y empozamientos',
        'Primer de adherencia',
        'Poliuretano en capas uniformes',
        'Garantía por escrito del sistema',
      ],
      cta: 'Cotiza tu sellado de poliuretano',
    },
    extra: {
      eyebrow: 'Ideal para',
      title: 'Dónde destaca el poliuretano.',
      items: [
        { tag: 'Tránsito', h: 'Techos de servicio', p: 'Azoteas donde hay equipos, mantenimiento o paso frecuente: resiste mejor el pisoteo.' },
        { tag: 'Comercial', h: 'Naves y edificios', p: 'Superficies grandes que requieren un sellado duradero con buena relación costo-resistencia.' },
        { tag: 'Exigencia', h: 'Sustratos problemáticos', p: 'Donde otros selladores fallan por falta de adherencia, el poliuretano aferra con firmeza.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta el sellado de poliuretano?', a: 'El sellado de poliuretano de Ilatek <b>comienza desde $4.50 por pie²</b> instalado. El precio varía según el área y la condición del techo. Cotiza y recibe tu número en minutos.' },
      { q: '¿Cuánto dura el poliuretano en un techo?', a: 'El poliuretano bien aplicado dura <b>de 10 a 15 años</b>. Requiere inspección periódica para retocar antes de que la capa empiece a degradarse.' },
      { q: '¿El poliuretano es mejor que la silicona?', a: '<b>Depende del uso.</b> El poliuretano gana en dureza mecánica y resistencia al tránsito; la silicona gana en elasticidad y vida útil (20–25 años). Elegimos según tu techo.' },
      { q: '¿Se puede aplicar poliuretano sobre concreto?', a: '<b>Sí</b>, con primer de adherencia y corrección previa de grietas y empozamientos. Es una de las superficies más comunes para este sistema.' },
      { q: '¿El poliuretano sella goteras activas?', a: 'Primero hay que <b>reparar la entrada de agua</b>; el poliuretano luego impermeabiliza la superficie. Aplicarlo sobre una gotera activa no resuelve el problema de raíz.' },
      { q: '¿Cuánto tarda la aplicación?', a: 'Un techo residencial toma <b>2 a 3 días</b> con la preparación incluida. Superficies comerciales grandes requieren más jornadas; te lo indicamos en la cotización.' },
      { q: '¿Ofrecen garantía en el poliuretano?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito con materiales certificados y proceso comprobado.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'Poliuretano de alta resistencia, preparación completa, <b>desde $4.50 por pie²</b>, inspección gratis y garantía escrita en los 78 municipios de Puerto Rico.' },
    ],
  }),

  mk({
    slug: 'sellado-acrilico',
    eyebrow: 'Sellado acrílico',
    noun: 'sellado acrílico',
    h1before: 'Sellado Acrílico para Techos en',
    h1em: 'Puerto Rico',
    h1after: ': la opción reflectiva económica.',
    metaTitle: 'Sellado Acrílico para Techos | Ilatek Techos',
    metaDescription:
      'Sellado acrílico para techos en Puerto Rico desde $2.00 por pie². Opción económica y reflectiva para mantenimiento periódico. Inspección gratis y garantía escrita.',
    hero: pic('industrial', { alt: 'Sellado acrílico blanco en techo en Puerto Rico — {{custom_values.county_name_and_state}}', title: 'Sellado acrílico · Ilatek Techos', badge: 'Económico y reflectivo' }),
    incl: pic('comercial', { alt: 'Aplicación de sellador acrílico en techo por Ilatek Techos en Puerto Rico', title: 'Sellado acrílico · Ilatek Techos', caption: 'Reflectivo · Mantenimiento periódico' }),
    heroSub:
      'El sellado acrílico es la opción más económica para mantener tu techo sellado y reflejando calor. Ilatek lo aplica en {{custom_values.county_name_and_state}} <b>desde $2.00 por pie²</b>, con preparación y garantía escrita.',
    facts: [
      { b: '$2.00', s: 'por pie²', label: 'Opción económica' },
      { b: '7–10', s: 'años', label: 'Durabilidad' },
      { b: '78', s: 'municipios', label: 'Cobertura en PR' },
    ],
    benefits: [
      { icon: 'tag', h: 'El más económico', p: 'Buen sellado a menor precio por pie²: ideal cuando buscas mantener el techo protegido con presupuesto ajustado.' },
      { icon: 'bolt', h: 'Reflectivo blanco', p: 'Su acabado blanco refleja el sol y ayuda a bajar la temperatura del techo y del interior.' },
      { icon: 'clock', h: 'Fácil de renovar', p: 'Se puede recoating cada ciertos años para prolongar la protección sin rehacer todo el sistema.' },
    ],
    incluye: {
      title: 'Cómo aplicamos el sellado acrílico.',
      answer:
        '<b>El acrílico rinde sobre superficie limpia y sana.</b> Ilatek lava a presión, corrige grietas, aplica primer y cubre con capas de acrílico reflectivo que sellan y protegen el techo.',
      checks: [
        'Lavado a presión del techo',
        'Sellado de grietas y uniones',
        'Corrección de empozamientos',
        'Primer de adherencia',
        'Capas de acrílico reflectivo',
        'Garantía por escrito del trabajo',
      ],
      cta: 'Cotiza tu sellado acrílico',
    },
    extra: {
      eyebrow: 'Ideal para',
      title: 'Cuándo elegir el acrílico.',
      items: [
        { tag: 'Presupuesto', h: 'Mantener con menor costo', p: 'Cuando quieres proteger el techo gastando menos, con la idea de renovar en unos años.' },
        { tag: 'Refrescar', h: 'Bajar el calor', p: 'Para techos donde el objetivo principal es reflejar el sol y aliviar el calor interior.' },
        { tag: 'Ya sellado', h: 'Techo con coating previo', p: 'Para renovar un techo que ya tiene acrílico y que cumple su ciclo de mantenimiento.' },
      ],
    },
    faq: [
      { q: '¿Cuánto cuesta el sellado acrílico?', a: 'El sellado acrílico de Ilatek <b>comienza desde $2.00 por pie²</b>, la opción más económica. El precio depende del área y del estado del techo. Cotiza para tu número exacto.' },
      { q: '¿Cuánto dura el sellado acrílico?', a: 'El acrílico dura <b>de 7 a 10 años</b>, aunque en Puerto Rico la radiación UV y la humedad pueden acortar su vida. Por eso conviene revisarlo y recoatarlo periódicamente.' },
      { q: '¿El acrílico es tan bueno como la silicona?', a: '<b>No en durabilidad:</b> la silicona dura 20–25 años y el acrílico 7–10. Pero el acrílico cuesta menos y sirve muy bien para mantenimiento periódico.' },
      { q: '¿El acrílico sella filtraciones?', a: 'Sella <b>superficies porosas y microfisuras</b>. Si hay goteras o grietas profundas, primero se repara la entrada de agua y luego se aplica el acrílico.' },
      { q: '¿Se puede aplicar acrílico sobre otro sellador?', a: '<b>Depende del estado del sellador anterior.</b> Si está firme y limpio, se prepara y se recubre; si está suelto o vencido, hay que removerlo primero. Lo evaluamos en la inspección.' },
      { q: '¿Cuánto tarda la aplicación?', a: 'Un techo residencial se cubre en <b>1 a 2 días</b>, incluyendo lavado a presión, sellado de grietas y capas. El secado depende del clima.' },
      { q: '¿El sellado acrílico tiene garantía?', a: '<b>Sí.</b> Entregamos garantía de mano de obra por escrito sobre el sistema aplicado, con materiales certificados.' },
      { q: '¿Por qué elegir Ilatek Techos?', a: 'La opción más económica con preparación correcta, <b>desde $2.00 por pie²</b>, inspección gratis, garantía escrita y cobertura en los 78 municipios de Puerto Rico.' },
    ],
  }),
];
