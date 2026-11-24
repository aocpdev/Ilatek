// Ilatek · Techos · FAQ de la página money (/sellado-de-techos).
// Fuente única: la usan la landing (HTML) y tools/build-llms.mjs (texto plano),
// así la pregunta visible y la que leen los asistentes nunca divergen.
// Cada respuesta: 40–60 palabras, una cifra o criterio verificable y UN enlace
// contextual al final. Ningún dato pendiente se escribe como si estuviera
// confirmado (garantía, duración del elastomérico, credenciales).
const SITE = 'https://{{custom_values.website_url}}';
const a = (path, label) => `<a href="${SITE}${path}">${label}</a>.`;

export const moneyFaq = [
  {
    q: '¿Cuánto cuesta sellar un techo por servicio?',
    a: `El precio publicado va desde $250 instalado, según el sistema. Cada sistema se cotiza por trabajo desde $250, según el tamaño y la condición del techo. El estimado final depende del área y la condición del techo. ${a('/cotizacion', 'Calcula tu precio en el cotizador')}`,
  },
  {
    q: '¿Cuánto cuesta sellar un techo mediano?',
    a: `Con el precio publicado desde $250 por trabajo, el total se cierra después de la visita o inspección, porque el acceso, las juntas y la preparación cambian el alcance del trabajo. ${a('/cotizacion', 'Cotiza con las medidas reales de tu techo')}`,
  },
  {
    q: '¿Por qué varía el precio del sellado?',
    a: `Varía por cuatro factores verificables: el sistema elegido, el área en pies cuadrados, la condición de la superficie y la preparación necesaria. La silicona cuesta más por servicio que el acrílico, pero publica 20 a 25 años de duración frente a 7 a 10 del acrílico. ${a('/sellado-de-techos', 'Compara los cinco sistemas y sus precios')}`,
  },
  {
    q: '¿Cuánto cuesta el sellado de silicona 100%?',
    a: `La silicona 100% se publica desde $250 instalada, el precio de entrada más alto de los cinco sistemas. Incluye preparación, primer y aplicación; el estimado final se confirma después de la inspección. ${a('/sellado-de-silicona', 'Ver el detalle del sellado de silicona')}`,
  },
  {
    q: '¿Cuánto cuesta la membrana asfáltica?',
    a: `La membrana asfáltica se publica desde $250 instalada, por trabajo. Es el sistema de mayor espesor y resistencia al tránsito, por eso cuesta más que un coating líquido como el elastomérico o el acrílico. ${a('/membrana-asfaltica', 'Ver membrana asfáltica para techos')}`,
  },
  {
    q: '¿Cuánto cuesta el sellado de poliuretano?',
    a: `El poliuretano se publica desde $250 instalado, el precio de entrada más alto entre los cinco sistemas. Se justifica en azoteas con equipos o paso frecuente, donde la resistencia mecánica pesa más que el precio por servicio. ${a('/sellado-de-poliuretano', 'Ver sellado de poliuretano')}`,
  },
  {
    q: '¿Cuánto cuesta el sellado acrílico?',
    a: `El acrílico se publica desde $250 instalado, el precio de entrada más bajo de los cinco sistemas. Rinde de 7 a 10 años, así que se plantea como mantenimiento periódico y no como solución definitiva para un techo deteriorado. ${a('/sellado-acrilico', 'Ver sellado acrílico')}`,
  },
  {
    q: '¿Cuánto cuesta el recubrimiento elastomérico?',
    a: `El recubrimiento elastomérico se publica desde $250 instalado. Su acabado blanco refleja la radiación solar y baja la temperatura de la superficie, lo que ayuda en techos que acumulan calor y en el consumo de aire acondicionado. ${a('/recubrimiento-elastomerico', 'Ver recubrimiento elastomérico')}`,
  },
  {
    q: '¿Cuánto dura un techo sellado con silicona?',
    a: `La silicona 100% publica una duración de 20 a 25 años sobre superficie preparada. Es la mayor vida útil entre los cinco sistemas: el poliuretano y la membrana publican 10 a 15 años, y el acrílico 7 a 10. El mantenimiento y la exposición costera ajustan ese plazo. ${a('/sellado-de-silicona', 'Ver duración y proceso de la silicona')}`,
  },
  {
    q: '¿Cuánto dura la membrana asfáltica?',
    a: `La membrana asfáltica publica una duración de 10 a 15 años. Su ventaja no es la longevidad máxima, sino el espesor y la resistencia al tránsito: por eso se recomienda en techos que se pisan, que tienen equipos o que están muy deteriorados. ${a('/membrana-asfaltica', 'Ver membrana asfáltica')}`,
  },
  {
    q: '¿Cuánto dura el poliuretano en un techo?',
    a: `El poliuretano publica una duración de 10 a 15 años. Requiere inspección periódica para retocar antes de que la capa empiece a degradarse, sobre todo en azoteas con equipos y paso frecuente, donde el roce desgasta primero las zonas de tránsito. ${a('/inspeccion-y-mantenimiento-de-techos', 'Ver inspección y mantenimiento de techos')}`,
  },
  {
    q: '¿Cuánto dura el sellado acrílico?',
    a: `El acrílico publica una duración de 7 a 10 años. En Puerto Rico la radiación UV y la humedad pueden acortar ese plazo, así que conviene revisarlo y recubrirlo periódicamente. Es el sistema más económico por servicio y el que antes pide mantenimiento. ${a('/sellado-acrilico', 'Ver sellado acrílico')}`,
  },
  {
    q: '¿Cuánto dura el recubrimiento elastomérico?',
    a: `Ilatek no publica un plazo de duración para el elastomérico. Se confirma en la inspección según la exposición y el mantenimiento del techo. Lo que sí está publicado es su función: refleja la radiación solar, baja la temperatura de la superficie y sella microfisuras del concreto. ${a('/recubrimiento-elastomerico', 'Consulta el sistema en la inspección')}`,
  },
  {
    q: '¿Qué sistema conviene para un techo plano?',
    a: `En techos planos la silicona 100% es la opción de mayor duración publicada, 20 a 25 años, y mantiene elasticidad frente al empozamiento. La membrana asfáltica compite cuando hay tránsito. La elección depende del sustrato y del uso, no de la marca. ${a('/techos-planos', 'Ver sellado para techos planos')}`,
  },
  {
    q: '¿Silicona o acrílico para mi techo?',
    a: `La silicona publica 20 a 25 años desde $250; el acrílico, 7 a 10 años desde $250. Si el techo ya tiene acrílico y solo necesita mantenimiento, el acrílico es más económico. Si buscas la mayor vida útil sin volver a sellar pronto, la silicona gana. ${a('/sellado-de-techos', 'Compara los cinco sistemas')}`,
  },
  {
    q: '¿Silicona o membrana asfáltica?',
    a: `La silicona gana en elasticidad y duración publicada, 20 a 25 años; la membrana gana en espesor y resistencia al tránsito, con 10 a 15 años. Si el techo se pisa o tiene equipos, la membrana sostiene mejor. Si es una losa expuesta al sol, la silicona. ${a('/membrana-asfaltica', 'Ver membrana asfáltica')}`,
  },
  {
    q: '¿Se puede sellar sobre un sellado viejo?',
    a: `No directamente. El sellador vencido debe removerse porque impide la adherencia, y aplicar una capa nueva encima de material suelto provoca desprendimientos. El proceso de Ilatek incluye remoción, lavado a presión, corrección de empozamientos, primer y membrana impermeabilizante. ${a('/sellado-de-techos', 'Ver el proceso de sellado')}`,
  },
  {
    q: '¿Cuánto tarda el trabajo de sellado?',
    a: `Depende del sistema y del área. El acrílico publica 1 a 2 días en un techo residencial; la silicona y el poliuretano, 2 a 3 días; la membrana, 2 a 4. Las superficies comerciales grandes requieren más jornadas, y el curado depende del clima. ${a('/cotizacion', 'Agenda tu inspección y recibe el estimado')}`,
  },
  {
    q: '¿La inspección tiene algún costo?',
    a: `La visita o inspección cuesta $50 y se descuenta del total del servicio, sin compromiso. Ilatek sube al techo, diagnostica la condición de la superficie y entrega el precio por escrito. El alcance queda definido antes de comenzar. ${a('/cotizacion', 'Reserva tu agenda con $50 descontables del total')}`,
  },
  {
    q: '¿Qué depósito piden para agendar el trabajo?',
    a: `Se reserva la fecha con un depósito de $50, que se descuenta del total del trabajo. No es un cargo adicional: es la forma de separar la fecha y confirmar el alcance acordado en la cotización, con cobertura en los 78 municipios. ${a('/cotizacion', 'Agenda tu inspección')}`,
  },
  {
    q: '¿Cada cuánto se le da mantenimiento a un techo sellado?',
    a: `Ilatek recomienda inspección anual. En Puerto Rico el sol, la lluvia y la brisa salina aceleran el desgaste, y una revisión a tiempo evita que una microfisura se convierta en filtración. El sistema aplicado define cuándo toca retocar la superficie. ${a('/inspeccion-y-mantenimiento-de-techos', 'Ver inspección y mantenimiento de techos')}`,
  },
  {
    q: '¿Qué cubre la garantía del sellado?',
    a: `Ilatek entrega garantía escrita de mano de obra con materiales certificados. El plazo exacto y las exclusiones se documentan antes de comenzar; no se promete una duración de garantía que no esté respaldada por el fabricante o por el contrato firmado. ${a('/garantia', 'Lee las condiciones de garantía')}`,
  },
];

// Texto plano para llms.txt: conserva la respuesta y convierte el enlace en una
// URL real (nunca el token de GHL, que no resuelve fuera del sitio).
export function plainAnswer(html) {
  return String(html)
    .replace(/<a\b[^>]*href="https:\/\/\{\{custom_values\.website_url\}\}([^"]*)"[^>]*>([\s\S]*?)<\/a>/g,
      (m, path, label) => `${label} (https://ilatekpr.com${path})`)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
