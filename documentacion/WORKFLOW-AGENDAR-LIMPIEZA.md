# Agendar limpieza: cotizador → webhook → oportunidad → avisos → nota

Estado: **4 de noviembre de 2026** · Subcuenta **Ilatek - PR** (`8OxUENFVM60EKzqsTcoD`).

El circuito está implementado y probado con ejecuciones reales en los dos workflows: **Hook
Cotizo** (recibe el webhook de la página) y **Agendó Limpieza** (se dispara con la cita). Ambos
crean el contacto con todos sus campos, la oportunidad con sus 7 custom fields y el valor, la
nota de origen, la etiqueta, la notificación interna al equipo y el correo "Estimado {nombre}"
al cliente.

**Pendiente real:** el **correo al equipo**. La acción Email de GHL, creada por API en esta
subcuenta, entrega siempre al contacto del workflow e ignora el destinatario; se probaron 16
variantes de esquema sin éxito (sección 8). Hoy el equipo recibe la **notificación interna** en
la app, y el correo al equipo está **desactivado** para no filtrar contenido interno al cliente.

## 1. Dónde vive cada cosa

| Pieza | ID real |
| --- | --- |
| Sitio | `XG0ggFh3pBPpA5s0Pe37` |
| Página *Limpieza - Cotización Gratis* | `GV7PWESENVKtDXU8kN6w` |
| Custom Code del calculador (con el bloque anexado) | `mpH_lwWunP` |
| Bloque publicado | `documentacion/bloques/cotizador-webhook-calendario.html` (marcador `ilag-agendar`) |
| Webhook del trigger | `59a8eede-f640-4746-88f2-2a912a128203` |
| Workflow del webhook | **Hook Cotizo** `ab2fa196-4d71-4b80-9e68-bdad248baa9c` (v23, published) |
| Workflow de la cita | **Agendó Limpieza** `b5f42a19-d107-4a52-864b-5fb992fb9482` (v74, published) |
| Pipeline | `koKZMpsg4GfYKzPkVcHb` (Cotizaciones) |
| Etapa de Hook Cotizo | `bb571230-5385-4d2e-aa20-04bd1bd7cff0` (New Lead) |
| Etapa de Agendó Limpieza (sin cambios) | `08498f48-169e-4fa3-8026-df1771be69c1` |

El webhook de la página pertenece al trigger **Inbound Webhook** de **Hook Cotizo**; un
workflow sólo ejecuta el webhook de su propio trigger, así que el circuito del cotizador vive
ahí y "Agendó Limpieza" cubre la cita reservada.

## 2. Payload que envía la página

```text
https://services.leadconnectorhq.com/hooks/8OxUENFVM60EKzqsTcoD/webhook-trigger/59a8eede-f640-4746-88f2-2a912a128203
```

Se dispara al pulsar **Continuar a agendar** y abre el calendario en la misma acción. Cada valor
viaja tres veces: clave simple, `contact.*` y `opportunity.*`.

| Clave | Contenido |
| --- | --- |
| `event` | `cotizacion_limpieza` |
| `submission_id` | id estable por sesión (`cot-…`) |
| `submitted_at`, `source`, `page_url`, `calendario_url` | contexto del envío |
| `pipeline_id` / `pipeline_stage_id` | Cotizaciones / New Lead |
| `opportunity_name` | `Nombre Apellido — Tipo de servicio — Municipio` |
| `firstName`, `lastName`, `full_name`, `phone`, `email` | datos del cliente |
| `valor_oportunidad`, `deposito_requerido` | total y depósito (50) |
| `tipo_de_servicio`, `municipio`, `areas`, `extras` | detalle del servicio |
| `resumen` | texto completo de la cotización |

## 3. Custom fields usados

| Campo de oportunidad | ID |
| --- | --- |
| `opportunity.municipio` | `6YBO5uQly5cokHPf0vNd` |
| `opportunity.areas` | `SsiKnb57uLObHUw1bNto` |
| `opportunity.extras` | `aECupBvmz48FQPjcrj3c` |
| `opportunity.deposito_requerido` | `VFR1N0SePhNnu8mJ65vl` |
| `opportunity.tipo_de_servicio` | `IinrGiapXExDcFz1cHdQ` |
| `opportunity.id_cotizacion` | `yTe2QLX9m6hYv9WRjDax` |
| `opportunity.resumen_cotizacion` | `PAC0wbyJEh1bqGgfNAHP` |

Campos de contacto: `municipio` `QBsTjW2NEw7hYxxhZK3W`, `areas` `dssqHKFODRjOeHxWhBhx`,
`extras` `5MSZgiTTaqWibXT6z0pE`, `id_cotizacion` `AJ88MJ0tYmiI47VWdvWT`, `resumen_cotizacion`
`1SyTkG5HCcuYVQ0OPfXp`, `tipo_de_servicio` `eSm642SOUAkHhge6sAQ8`, `deposito_requerido`
`v4C8NxYrf0qbP0zEQdhi`, `valor_oportunidad` `N66uBgSaA6HPZWfA0A5i`.

## 4. Hook Cotizo v23 (webhook de la página)

1. **Create contact** — nombre, apellido, correo, teléfono y los 8 custom fields, todos desde
   `{{inboundWebhookRequest.*}}`.
2. **Nota: origen y datos del cliente** — acción `add_notes` (sección 6).
3. **Create or update opportunity** — pipeline `Cotizaciones`, etapa `New Lead`, nombre
   `{{inboundWebhookRequest.opportunity_name}}`, valor
   `{{inboundWebhookRequest.valor_oportunidad}}`, duplicados desactivados y los 7 custom fields.
4. **Add Tag** — `nueva cotizacion`.
5. **Notificar al equipo** — notificación interna con cliente, teléfono, correo, servicio,
   municipio, áreas, extras, total y depósito.
6. **Email Estimado al cliente** — `to: {{contact.email}}`.

## 5. Agendó Limpieza v74 (cita reservada)

Conserva su trigger de cita y su etapa `08498f48-169e-4fa3-8026-df1771be69c1`:

1. **Add Tag** — `booked`.
2. **Create or update opportunity** — nombre `{{contact.first_name}} {{contact.last_name}}`,
   valor `{{contact.valor_oportunidad}}` y los 7 custom fields desde `{{contact.*}}`.
3. **Nota: origen y datos de la cita** — acción `add_notes`.
4. **Notificar al equipo (limpieza agendada)** — interna, con los datos del servicio y
   `{{appointment.start_time}}`.
5. **Email Estimado al cliente (limpieza agendada)** — `to: {{contact.email}}`, asunto
   `Estimado {{contact.first_name}}, tu limpieza está agendada`.

`{{contact.full_name}}` no renderiza en esta cuenta: los textos usan
`{{contact.first_name}} {{contact.last_name}}`.

## 6. Notas de origen y datos

Acción `add_notes` con `attributes: { type: "add_notes", html, color: "#FEF0C7", title }`. No hay
documentación pública: se obtuvo del catálogo del builder (`actionFactory.add_notes → class
Note`). Los tipos `add_note`, `create_note`, `note`, `add_contact_note` y `contact_note` no
existen (`action has a corrupted type`).

**Hook Cotizo** (tras crear el contacto):

```html
<p><b>Origen:</b> Cotizador web — <a href="https://ilatekpr.com/cotizacion">ilatekpr.com/cotizacion</a></p>
<p><b>Solicitud:</b> {{inboundWebhookRequest.submission_id}} · {{inboundWebhookRequest.submitted_at}}</p>
<p><b>Cliente:</b> {{inboundWebhookRequest.full_name}} · {{inboundWebhookRequest.phone}} · {{inboundWebhookRequest.email}}</p>
<p><b>Servicio:</b> {{inboundWebhookRequest.tipo_de_servicio}} · <b>Municipio:</b> {{inboundWebhookRequest.municipio}}</p>
<p><b>Áreas:</b> {{inboundWebhookRequest.areas}}<br><b>Extras:</b> {{inboundWebhookRequest.extras}}</p>
<p><b>Total:</b> ${{inboundWebhookRequest.valor_oportunidad}} · <b>Depósito:</b> ${{inboundWebhookRequest.deposito_requerido}}</p>
```

**Agendó Limpieza** (después de la oportunidad):

```html
<p><b>Origen:</b> Cita reservada en el calendario «Reserva tu limpieza | ILATEK»</p>
<p><b>Cita:</b> {{appointment.start_time}}</p>
<p><b>Cliente:</b> {{contact.first_name}} {{contact.last_name}} · {{contact.phone}} · {{contact.email}}</p>
<p><b>Servicio:</b> {{contact.tipo_de_servicio}} · <b>Municipio:</b> {{contact.municipio}}</p>
<p><b>Áreas:</b> {{contact.areas}}<br><b>Extras:</b> {{contact.extras}}</p>
<p><b>Total:</b> ${{contact.valor_oportunidad}} · <b>Depósito:</b> ${{contact.deposito_requerido}}</p>
```

## 7. Cómo se editaron (sin UI, reproducible)

```bash
# token = cookie access-token-v1 del origen app.gohighlevel.com (leída por CDP en el puerto 9222)
curl -s "https://backend.leadconnectorhq.com/workflow/8OxUENFVM60EKzqsTcoD/<workflowId>" \
  -H "Authorization: Bearer $TOKEN" -H "channel: APP" -H "source: WEB_USER" -H "Version: 2021-07-28"

curl -s -X PUT "https://backend.leadconnectorhq.com/workflow/8OxUENFVM60EKzqsTcoD/<workflowId>" \
  -H "Authorization: Bearer $TOKEN" -H "channel: APP" -H "source: WEB_USER" \
  -H "Version: 2021-07-28" -H "Content-Type: application/json" --data @workflow.json
```

Cada `PUT` sube `version` y deja el workflow `published`. Las acciones se enlazan con
`next`/`parentKey` y se ordenan con `order` (hay que renumerar la cadena al insertar pasos).

## 8. Correo al equipo: lo que se probó (pendiente)

La acción Email creada por API **siempre envía al contacto del workflow**. Evidencia:

- Con el cliente en un dominio sin MX (`@example.invalid`) y el equipo en Gmail, **todos** los
  correos internos registraron el error del dominio del cliente:
  `No MX for example.invalid, lookup example.invalid …`, y **ninguno** llegó al contacto de
  `axelcastrodev@gmail.com` (se creó un contacto temporal para comprobarlo).
- Se probaron 16 esquemas de destinatario: `to` con una dirección, con lista separada por comas
  y por punto y coma, `to` como array de strings, array de objetos, y las claves `emailTo`,
  `recipient`, `toEmail`, `cc`, `emailType`, `toType`, `recipientType`, `sendTo`, `isCustomEmail`,
  `emailToType`, `sendToContact: false`, `skipContact`. En los 16 el correo salió hacia el
  cliente.
- Un array en `to` se rechaza: `Action validation failed for email: To: Expected string`.

Por eso las acciones "Email al equipo" se **retiraron** de ambos workflows: si se dejan, el
cliente recibe el contenido interno. Mientras tanto el equipo se entera por la **notificación
interna** (paso 5 y paso 4).

Para completarlo hace falta una de estas dos cosas:

1. En el builder (Automation → Hook Cotizo → Email), configurar el destinatario como
   **Custom email** y guardar; hay que verificar en una ejecución real que el correo no caiga en
   el hilo del cliente (misma prueba del dominio sin MX).
2. Enviar el aviso a un servicio de correo transaccional (por ejemplo Resend) mediante una acción
   de webhook con la clave en Secrets, en vez de la acción Email de GHL.

## 9. Verificación real (4 de noviembre de 2026)

**Hook Cotizo v23** — payload completo al webhook real (`200`):

| Comprobación | Resultado |
| --- | --- |
| Contacto | `6p7nAlFMgiV92tJO9nq7`, *Mar Soler Final*, etiqueta `nueva cotizacion` |
| Campos del contacto | municipio `Dorado`, áreas `Habitaciones: 5 \| Baños completos: 3`, extras `Horno: 1`, tipo `Limpieza Profunda`, depósito `50`, valor `227.6`, `id_cotizacion` `cot-fin-…`, resumen completo |
| Oportunidad | `spylEAtKXR7yIazkS5pa`, *Mar Soler Final — Limpieza Profunda — Dorado*, **$227.6**, 7 custom fields con valor |
| Nota | 1 nota con origen, solicitud, cliente, teléfono, correo, servicio, municipio, áreas, extras, total y depósito |
| Notificación interna | paso `internal_notification` ejecutado (verificado con `201`/`succeeded: true` en el log de una ejecución anterior; hoy el endpoint de logs no devolvió filas) |
| Correos en el hilo | **1**: `Estimado Mar, recibimos tu cotización de limpieza`, sin error de entrega |

**Agendó Limpieza v74** — contacto real + `POST /contacts/{id}/workflow/…` (`201`):

| Comprobación | Resultado |
| --- | --- |
| Contacto | `UvGrg6aSZY3MLkjqT7Wq`, *Nora Vega Final*, etiqueta `booked` |
| Campos del contacto | municipio `Juncos`, áreas `Habitaciones: 3 \| Baños completos: 2`, extras `Ventanas: 2`, tipo `Limpieza Estándar`, depósito `50`, valor `176.2`, `id_cotizacion`, resumen |
| Oportunidad | `ErYsa5bydpBHirFZMdOb`, *Nora Vega Final*, **$176.2**, 7 custom fields con valor |
| Nota | 1 nota de origen y cita |
| Notificación interna | paso ejecutado |
| Correos en el hilo | **1**: `Estimado Nora, tu limpieza está agendada`, sin error de entrega |

Registros de prueba borrados (`DELETE` 200 en las dos oportunidades y los dos contactos, más los
contactos temporales de las pruebas de enrutamiento).

## 10. Repetir la prueba

1. Cotizador: abrir `https://ilatekpr.com/cotizacion`, completar tipo, municipio, áreas y datos,
   pulsar **Continuar a agendar**; revisar contacto, nota, oportunidad, campana y conversación.
2. Cita: crear un contacto con los campos cargados y
   `POST /contacts/{id}/workflow/b5f42a19-d107-4a52-864b-5fb992fb9482`.
3. Notas: `GET /contacts/{id}/notes`; correos: `GET /conversations/{id}/messages` (tipo 3).
4. Borrar los registros: `DELETE /opportunities/{id}` y `DELETE /contacts/{id}`.
