# Bot de conversación — Ilatek PR

Estado: **5 de noviembre de 2026** · Subcuenta **Ilatek - PR** (`8OxUENFVM60EKzqsTcoD`).

## 1. Qué está mal en el bot actual

El bot que se ve en pantalla (`/ai-agents/conversation-ai/agent/D9H8BankMDm8PaDcolyh2`) está, en los
hechos, vacío: los tres campos de texto siguen con el texto de ejemplo del producto.

| Campo de la UI | Lo que tiene hoy | Problema |
| --- | --- | --- |
| Personality & Style | *"You are a helpful assistant for [business name]…"* | Es el placeholder, con el corchete sin reemplazar |
| Intent Behind conversation | *"Your goal is to assist the customer with their queries."* | Genérico; no pide datos ni lleva a cotizar |
| Additional Information | *"Maintain a casual… booking that whenever they need to"* | Texto de ejemplo, con errores de redacción |

Y el error **"The Flow is invalid"** del panel de prueba no viene de los textos: el agente está en
modo *Flow Based Builder* con el flujo vacío. Sin nodo de inicio ni respuesta, el test no tiene qué
ejecutar. Se arregla de una de dos formas:

1. **Bot Goals** (recomendado): dejar el agente en modo de objetivos, donde el prompt manda y no
   hace falta dibujar flujo.
2. **Flow Builder**: agregar el nodo de inicio y al menos una respuesta antes de probar.

## 2. Copy definitivo (pegar tal cual en la UI)

Los tres textos están calibrados con los precios y el horario reales de `llms.txt`. El JSON completo
está en `documentacion/bot-lead-collector.json`.

**Personality & Style of the bot**

> Cálido, empático y confiable. Habla español de Puerto Rico, tutea con respeto y usa frases cortas.
> Escucha primero, tranquiliza y después propone un siguiente paso concreto, sin presión de venta.
> Nunca suena a guion de telemercadeo: suena a alguien del equipo que de verdad quiere ayudar.

**Intent Behind conversation**

> Convertir cada conversación en una solicitud de cotización completa (servicio, municipio, medidas y
> fecha) o en una cita reservada, sin fricción, sin inventar precios y dejando al cliente con la
> sensación de que está en buenas manos.

**Additional Information & Business Context**

> Eres el asistente de Ilatek Property Solutions, empresa puertorriqueña de limpieza (residencial,
> comercial e industrial) y techos, fundada por Luis A. Cardec y Aida Cintron. Atiendes de lunes a
> sábado, 8:00 a.m. a 6:00 p.m., y das servicio en los 78 municipios de Puerto Rico.
>
> TU TRABAJO
> 1. Entender qué necesita la persona y en qué municipio está.
> 2. Dar un estimado honesto con los precios de abajo.
> 3. Llevarla al cotizador con precio real en minutos, o dejarla lista para que el equipo la llame.
> 4. Cerrar con un resumen y el siguiente paso claro.
>
> CÓMO CONVERSAR
> - Pregunta una o dos cosas por mensaje, nunca un cuestionario.
> - Orden sugerido: servicio y municipio, tamaño o alcance, fecha deseada, extras, nombre y teléfono
>   o correo.
> - Reconoce lo que la persona siente antes de cotizar (mudanza, visita, negocio, gotera).
> - Mensajes de 2 a 4 líneas, sin markdown, sin listas largas, sin emojis.
> - Si la persona escribe en inglés, responde en inglés con el mismo tono.
> - Si no entiendes un dato, pide que lo aclare en vez de suponerlo.
>
> PRECIOS QUE PUEDES DECIR (son los publicados; no inventes otros)
> - Limpieza estándar: $0.07 por pie cuadrado.
> - Limpieza profunda: $0.15 por pie cuadrado.
> - Alfombras: $0.75 por pie cuadrado.
> - Ventanas: interiores $10 cada una, exteriores $25 cada una.
> - Electrodomésticos: refrigerador $40, horno $30, lavadora o secadora $10 cada una.
> - Organización: despensa o clóset $50 cada uno, garaje $0.50 por pie cuadrado.
> - Sellado de techos desde $2.50 por pie cuadrado, en 5 pasos.
> - Impermeabilización de techos desde $3.00 por pie cuadrado.
> - Reparación de techos desde $250.
> - Inspección de techo gratis; mantenimiento desde $250 por labor.
> - La reserva se asegura con un depósito de $50 que se descuenta del total.
>
> COTIZADORES
> - Limpieza: https://ilatekpr.com/cotizacion
> - Techos: https://ilatekpr.com/cotizacion-techos
> Cuando el caso encaje, ofrece el enlace como el camino más rápido a un precio exacto.
>
> LÍMITES (no los cruces)
> - No inventes precios, descuentos, garantías, reseñas, fechas disponibles ni nombres de técnicos.
> - No prometas una fecha u hora: solo el calendario confirma disponibilidad.
> - No pidas ni aceptes números de tarjeta, cuentas bancarias ni documentos de identidad por chat.
> - No hables de otros clientes ni compartas datos de terceros.
> - Si preguntan por un servicio que no está en la lista, di que lo consultas con el equipo.
>
> CUÁNDO PASAR A UNA PERSONA
> - La persona pide hablar con alguien, tiene una queja o un problema en un trabajo en curso.
> - El trabajo es grande, especial o fuera de lo publicado (industrial, post-construcción compleja,
>   varios edificios).
> - Hay una duda de precio que no puedes resolver con los datos de arriba.
> - La conversación lleva más de 8 intercambios sin avanzar.
> En esos casos di con calma que Luis o Aida le escriben personalmente y confirma el mejor teléfono
> y horario para llamarle.
>
> CIERRE
> Resume en una línea lo que entendiste (servicio, municipio, alcance, fecha), confirma el contacto
> y di qué pasa después: el equipo revisa y le escribe con la cotización o la confirmación. Agradece
> con calidez, sin frases de venta.

**Tono:** los dos chips que ya están puestos (Empathetic, Trustworthy) son correctos; no hay que
cambiarlos.

## 3. Agente configurado por API

Como el bot de la UI no es legible con el token de integración (la búsqueda lo oculta), se creó uno
completo con los mismos textos:

| Dato | Valor |
| --- | --- |
| ID | `pao6SQ0McaPP8QgVqmYP` |
| Nombre | **Ilatek · Asistente de Leads 24/7** |
| Modo | `suggestive` (redacta; una persona aprueba el envío) |
| Canales | **Live chat** asignado en la UI (canal "Ilatek", todos los contactos) |
| Espera | 20 segundos |
| Tope | 25 mensajes antes de pasar a humano |

Está en modo **suggestive** a propósito: no gasta en respuestas automáticas sin tu visto bueno. En la
UI, un clic en *Mode → Auto-Pilot* lo pone a contestar solo; el tope de 25 mensajes ya está puesto
para que no se extienda sin control.

Para usarlo hay que marcarlo como primario del canal en la UI (la API no expone ese endpoint). Si
prefieres el bot que ya tienes, pega los tres textos de la sección 2 y arregla el flujo; son
equivalentes.

## 4. Lo que la API sí permite (probado)

```
GET  /conversation-ai/agents/search              # lista; oculta agentes en borrador
GET  /conversation-ai/agents/{id}
POST /conversation-ai/agents
PUT  /conversation-ai/agents/{id}
GET  /conversation-ai/agents/{id}/actions
```

Host `services.leadconnectorhq.com`, cabecera `Version: v3`, token de integración con scope
`conversation-ai`. Trampas encontradas:

- El id real del bot original es `D9H8BankMDm8PaDcoLyh` (el enlace que circuló traía un `2` de más),
  pero la API igual responde `404 Agent not found`: los agentes *Flow based* no están en ese endpoint.
- `search` informa `totalCount: 1` pero devuelve `agents: []` cuando el único agente está en
  borrador; el conteo no sirve para deducir el id.
- `channels` acepta **solo strings** (`WebChat`, `Live_Chat`, `Email`, `SMS`, `IG`, `FB`,
  `WhatsApp`, `GMB`, `TIKTOK`); enviar objetos devuelve 422.
- No hay endpoint para marcar el canal primario ni para probar el bot; eso vive solo en la UI.

## 5. El flujo que el bot referencia

El panel abre el flujo así:

```
/automation/workflow/81c18c71-9e6a-4501-a462-b98f61df5b3c?convTriggerBotId=D9H8BankMDm8PaDcolyh2
```

Ese workflow **no está entre los 12 workflows de la subcuenta**: la lista completa (incluye el
borrador `Website Chat - Email Follow Up`) no lo contiene, y la ruta pública `/workflows/{id}` ni
siquiera existe — solo se llega por la UI. Es decir, el bot apunta a un flujo que el motor no puede
resolver, y de ahí sale *"The Flow is invalid"*.

Consecuencia práctica: no basta con llenar los textos. Hay que **recrear el flujo** dentro del
builder o **desvincular** ese trigger del bot. Ambas cosas se hacen en pantalla.

## 6. Pendiente

- Marcar el agente primario del canal y decidir si pasa a Auto-Pilot.
- Conectar el handoff del bot con el workflow maestro (`documentacion/WORKFLOW-MAESTRO-CAPTURA.md`)
  para que cada conversación calificada cree la oportunidad y la tarea.
- Cargar la base de conocimiento con los precios y las preguntas frecuentes del sitio.

## 7. Lo que se hizo en la UI (5 nov)

- Los tres textos se pegaron y **se guardaron en el bot original**: 288 / 233 / 3.131 caracteres,
  verificados recargando la página.
- El panel lo dice en Bot Goals, letra chica: *"Bot trial in the flow-based builder is currently
  experiencing some issues. Please test your bot in the live environment"*. Ese es el origen del
  "Flow is invalid": no es un error de configuración del negocio, es el builder de flujos de GHL.
- Al agente prompt-based (`pao6SQ0McaPP8QgVqmYP`) se le asignó **Live chat** en
  Agent Deployment → Live chat → Set up → canal "Ilatek" → Add channel. Queda como *Available*,
  "Ilatek", "All contacts". Working hours: Off (responde a toda hora).
- SMS se descartó: pide elegir números de LC Phone y no hay autorización de compra.
- El modo del agente prompt-based quedó en **Suggestive** porque el panel muestra "Token Usage Cost";
  no se activó Auto-Pilot sin autorización. Un clic en Mode → Auto-Pilot lo pone a contestar solo.
- Truco de UI que sí funciona para estos modales: son Vue con `hr-*`; los clics sintéticos por JS no
  disparan los handlers, hay que usar clics de ratón sobre las coordenadas del botón.

## 8. Prueba real del agente (5 nov, 08:40)

Hecha en el chat de prueba del builder (*"Nothing here reaches your contacts"*), sin tocar contactos.

- Lead: *"Hola, necesito limpieza profunda en Bayamón, 1200 pies cuadrados para el sábado"*
- Respuesta: reconoció municipio y fecha (sábado 7 de noviembre), calculó **$180** (1.200 × $0.15),
  ofreció extras (ventanas, alfombras, electrodomésticos) y pidió nombre y contacto para la cotización.
- Segundo mensaje: *"¿Y cuánto me sale? Es que me mudo el sábado y la casa está bien sucia"*
- Respuesta: empatizó con la mudanza, repitió el estimado y ofreció el enlace de cotización o una
  llamada del equipo, volviendo a pedir el teléfono.

Cumple lo pedido: precio correcto sin inventar, tono empático, una o dos preguntas por mensaje, no
promete disponibilidad y siempre empuja al siguiente paso.

## 9. Falta un punto de entrada en la web

`ilatekpr.com` **no tiene el widget de chat instalado**: la única pieza externa que carga es el widget
de reseñas de ReputationHub. El canal Live chat quedó asignado al agente, pero sin el snippet del chat
en las landings no hay forma de que un visitante inicie la conversación.

Para publicarlo de verdad hace falta pegar el código del Chat Widget de GHL en las páginas (o usar el
canal Email, que ya funciona con el correo de la subcuenta).
