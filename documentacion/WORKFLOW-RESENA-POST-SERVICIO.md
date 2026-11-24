# Workflow · Reseña post-servicio — Limpieza y Techos

Subcuenta **Ilatek - PR** (`8OxUENFVM60EKzqsTcoD`). Automation independiente: no modifica
`Hook Cotizo`, `Agendó Limpieza`, `Agendó Mantenimiento de Techo` ni `ILATEK · Maestro · Captura PR`.

## Objetivo

Reserva pagada (Limpieza o Mantenimiento de Techos) → 2 h después de que termine el servicio →
email pidiendo reseña con enlace directo a Google → etiqueta `review-request-sent`.

## Identificadores

| Pieza | Valor |
|---|---|
| Workflow | `b292f2be-baff-462f-a985-b2c2e5c7e12c` — *Reseña post-servicio — Limpieza y Techos* (publicado, v9) |
| Trigger | `heNYao2HRISKBtDqWELu` — *Customer Booked Appointment* (activo) |
| Etiqueta automática | `review-request-sent` (`oDKOx4bnDNwjA1vn16Pa`) |
| Etiqueta manual | `review-collected` (`gokwqFgrySN66jiY9w90`) |
| Enlace de reseña | `https://search.google.com/local/writereview?placeid=ChIJv2HVG4Tduk0RzcHpdiORzug` |

Calendarios incluidos en el trigger:

- `i5HZobZjuSZcDl43qgOG` — Reserva tu limpieza | ILATEK
- `wM8KQhsYjEQAo0HbNGIh` — Reserva tu mantenimiento de techos | ILATEK

Ambos tienen `slotDuration` de **4 horas** y cobran el depósito de **$50** al reservar
(verificado en el feed de pagos: `entitySourceType: calendar`, `amount: 50`, `status: succeeded`),
por eso el trigger de cita reservada equivale a "reserva pagada" y no hace falta `Payment Received`.

## Estructura del workflow

1. **Trigger** — `customer_appointment` con condiciones:
   - `calendar.id` ∈ {Limpieza, Techos}
   - `contactMode` ∈ {contact}
   - `contact.tags` **no contiene** `review-collected` → nadie que ya dejó reseña vuelve a recibir el email.
2. **Wait** — anclado al **inicio** de la cita (`type: appointment` + `appointmentStartAfter`), `360` minutos =
   4 h de turno + 2 h. Es decir: el email sale 2 h después del fin real del servicio.
   `appointmentCondition: skip` (si la fecha ya pasó, no deja al contacto colgado).
   Por ser una espera **de cita** (no un temporizador suelto), es la pieza que activa la salida por
   cancelación descrita abajo.
3. **Email** — desde `ilatek.pr.lead@gmail.com` / *Ilatek Property Solution*, asunto
   `{{contact.first_name}}, ¿nos regalas 30 segundos? ⭐`, botón "Deja tu reseña en Google"
   (verde `#0B7A4B`) + la URL plana debajo, y una línea final con `{{appointment.end_time}}`
   como comprobación de fecha del servicio.
4. **Add tag** — `review-request-sent`.

`allowMultiple: true`: un cliente que vuelve a contratar puede entrar de nuevo.

## Uso del staff

- El email y la etiqueta `review-request-sent` son automáticos; no hay nada que hacer.
- Cuando llegue una reseña nueva en **Reputation → Reviews**, aplicar la etiqueta
  `review-collected` al contacto. Con eso el trigger deja de pedirle reseña en el futuro.
- Clientes que ya habían dejado reseña quedaron marcados con `review-collected`
  (Sheila Vargas Torres, Osvaldo Melendez — ver *Límites* para los que no se pudieron casar).

## Verificación realizada

- Workflow leído de vuelta tras publicar: `status: published`, 3 pasos, wait `360` min
  anclado al inicio de la cita, email con el enlace de `writereview` y la etiqueta correcta.
- Trigger leído de vuelta: `active: true`, 3 condiciones (calendarios + `contactMode` + guarda de etiqueta).
- Workflows existentes comprobados sin cambios: `Hook Cotizo` v23, `Agendó Limpieza` v74,
  `Agendó Mantenimiento de Techo` v4, `ILATEK · Maestro · Captura PR` v5 — todos `published`.
- Etiquetas aplicadas y verificadas por ID de contacto:
  `HotyEMXNsgvoufzxsGkG` (Sheila) y `icyYmxWNsdtOaSQR4iEB` (Osvaldo) → `review-collected`.

## Guarda de cancelación / no-show

**Cómo queda protegido:** el paso de espera está ligado a la cita (`type: appointment` +
`appointmentStartAfter`), no es una espera de tiempo suelta. En workflows disparados por un evento de
cita, cuando la cita pasa a **Cancelled / Invalid / No Show**, HighLevel saca al contacto del
workflow y no ejecuta los pasos siguientes (*Appointment scenarios in Workflow*, escenario 2:
"the customer will be pulled out of the workflow, and no further actions will occur"). El email y la
etiqueta viven **después** de esa espera, así que una cita cancelada no llega a ellos. La guarda va
por tanto en la propia espera de cita; no hace falta nodo condicional.

**Qué se probó y se descartó** (para no reintentarlo a ciegas):

| Intento | Respuesta real de la API | Resultado |
|---|---|---|
| `if_else` con condición de estado de cita (`conditionType: appointment`) | PUT **200**, el nodo se guarda tal cual | Descartado: el servidor no valida la semántica de la condición (guarda lo que se envía) y HighLevel solo ofrece **Rescheduled / Start Date / End Date** como filtros de cita para el trigger *Customer Booked Appointment*, no *Status*. Un nodo así se guarda y nunca coincide → se revirtió a la versión buena. |
| `appointmentCondition` de la espera con `continue` / `cancel` / `canceled` / `noshow` / `stop` / `appointment_cancelled` | **400** `Appointment Condition has an invalid value "…". Please choose a valid option.` | Enum estricto: solo `skip` es válido, y `skip` controla el caso "la fecha ya pasó", no la cancelación. |
| Condición `appointment.status` en el trigger | Esquema admitido (el trigger es `customer_appointment`) | No aplicada: se evalúa al entrar y no retira una ejecución ya en curso; además filtrar por estado puede bloquear reservas nuevas si el estado inicial de la cita no está en la lista. |

## Límites conocidos

- **No se ejecutó un envío real.** Dispararlo exige una reserva real en uno de los dos calendarios,
  y eso cobra el depósito de $50. La comprobación es de configuración (workflow publicado,
  trigger activo y pasos guardados), no de una ejecución con contacto real.
- **La salida por cancelación no se observó en vivo.** Exigiría reservar y cancelar una cita real
  (cobra el depósito de $50), así que se apoya en el comportamiento documentado por HighLevel y en
  que la espera quedó guardada como espera de cita.
- **3 de las 5 reseñas de Google no tienen contacto en el CRM** (DESIREE OLAVARRIA, Kaylee Brown,
  It's Demo Corp), así que no hay a quién etiquetar. Además hay contactos duplicados
  (`osvaldo d. meléndez`, `aida cintron` / `aidacintronfernandez`): solo se etiquetó la coincidencia
  exacta, no los duplicados.
- **La UI del builder no renderiza en el navegador de automatización**, por eso todo se hizo por la
  API interna (`backend.leadconnectorhq.com/workflow/...`). Para cambios visuales hay que abrir el
  workflow en el navegador normal.
