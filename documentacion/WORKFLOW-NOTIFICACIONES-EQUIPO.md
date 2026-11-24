# Avisos al equipo y correo al cliente — regla y auditoría de workflows

Estado: **14 de noviembre de 2026** · Subcuenta **Ilatek - PR** (`8OxUENFVM60EKzqsTcoD`).

## 1. Regla

| Qué | Cómo viaja | Costo |
| --- | --- | --- |
| Aviso al equipo interno | Acción **Internal Notification** (`internal_notification`) | **$0** — campanita en la web y push en la app **LeadConnector** |
| Correo al lead o al cliente | Acción **Email** con `to: {{contact.email}}` | correo saliente |

Derivadas:

- La notificación interna **no** usa `email`, `sms` ni `whatsapp`: esos campos se quedan en `null`.
  Con `userType: "all"` llega a los dos usuarios de la subcuenta (Aida Cintron y Luis Cardec);
  con `userType: "assign"` llega al responsable del contacto.
- El correo **nunca** lleva `cc`/`bcc` con direcciones del equipo. La acción Email de GHL entrega
  siempre al contacto del workflow (ver `WORKFLOW-AGENDAR-LIMPIEZA.md` §8), así que un aviso
  interno puesto ahí termina en el buzón del cliente.
- Contenido interno (nombre, teléfono, dirección, notas, totales internos) va solo en la
  notificación y en la nota del contacto, no en el correo.

## 2. Auditoría de los 16 workflows

| Workflow | Pasos | Aviso interno | Correo |
| --- | --- | --- | --- |
| `b5f42a19` Agendó Limpieza (v74) | 5 | notificación, `all` | al cliente |
| `063ad6dd` Agendó Mantenimiento de Techo (**v5**) | 4 | notificación, `all` | al cliente |
| `ab2fa196` Hook Cotizo (v23) | 6 | notificación, `all` | al cliente |
| `399e8778` Captura de Lead - Seccion Clima (v14) | 7 | notificación, `all` | al cliente |
| `b292f2be` Reseña post-servicio (v9) | 3 | — (no hace falta) | al cliente |
| `95c505c9` Lead Qualification Menu (v9) | 18 | 5 notificaciones, `all` | al cliente (plantilla) |
| `40c4f165` Interés de Empleo (v6) | 3 | notificación, `all` | — |
| `8ae01f41` Nueva Aplicación - Limpieza (v4) | 5 | notificación, `assign` | — |
| `f37d2cfb` Nueva Aplicación - Techo (v3) | 5 | notificación, `assign` | — |
| `f2e61e0a` · `baf9e1e5` · `a22c45ee` Tag (v5/v4/v6) | 1 | — | — |
| `80757738` New Workflow 1790061251648 (v3) | 1 | **ninguno** | — |
| `71869d69` (chat iniciado, **sin nombre**, v15) | 1 | — | — |
| `0eec9f65` · `1da0719b` borradores | 0 | — | — |

Ningún workflow tiene ya `cc`/`bcc` con direcciones del equipo ni avisos internos por correo.
Las notificaciones internas no tienen canales de pago configurados.

## 3. Cambio aplicado el 14/11/2026 — `063ad6dd` v4 → v5

Era el único workflow que avisaba al equipo por correo. El paso `Email` enviaba al **contacto**
un cuerpo interno (`Nombre / Email / Teléfono / Dirección / Fecha y Hora`) con **cuatro
direcciones internas en copia**: `ilatek.pr.lead@gmail.com`, `axelcastrodev@gmail.com`,
`ilatek.pr@gmail.com`, `fullnessmindset@gmail.com`. El cliente recibía el contenido interno y
cada reserva gastaba cinco correos.

Ahora:

1. **Notificar al equipo (mantenimiento de techos agendado)** — notificación interna, `userType:
   all`, sin canales de pago, con cliente, teléfono, correo, dirección, servicio, municipio, cita,
   total y depósito; abre la oportunidad.
2. **Email Estimado al cliente (mantenimiento agendado)** — `cc` y `bcc` vacíos, asunto
   `Estimado {{contact.first_name}}, tu mantenimiento de techos está agendado` y el mismo molde
   del correo de limpieza agendada (resumen de la cita, total, depósito, teléfono de contacto).

El trigger no se tocó: sigue en el calendario de techos (`wM8KQhsYjEQAo0HbNGIh`), sin solaparse
con el de limpieza (`i5HZobZjuSZcDl43qgOG`).

## 4. Cómo se editó

El cuerpo del `PUT` es el **documento del workflow** (no el objeto del `GET`): los pasos van en
`workflowData.templates`, y `name`, `version` y `status` en el primer nivel. Enviar el objeto del
`GET` entero deja los pasos un nivel más abajo y el workflow queda mudo
(`WORKFLOW-MAESTRO-CAPTURA.md` §6.1).

```bash
PUT https://backend.leadconnectorhq.com/workflow/8OxUENFVM60EKzqsTcoD/063ad6dd-f51a-4196-a9f6-4d98478b5bb5
{ "workflowData": { "templates": [ …4 pasos… ] }, "name": "Agendó Mantenimiento de Techo",
  "version": 4, "status": "published", …ajustes del documento… }
```

## 5. Verificación

Lectura de vuelta tras el `PUT` (`200`, versión 5):

- `status: published`, nombre intacto, `allowMultiple` y `timezone` conservados.
- 4 pasos con la cadena `parentKey`/`next` íntegra.
- Email: `cc: ""`, `bcc: ""`, asunto al cliente.
- Notificación: `userType: all`, `email`/`sms`/`whatsapp` en `null`.

**No se ejecutó una reserva real**: el calendario de techos cobra el depósito de $50 al reservar.
La comprobación es de configuración, no de una ejecución con contacto.

## 6. Pendientes detectados (no modificados)

- `80757738` — formulario `9UJpNQSLzMmFyzEirLWh` → crea oportunidad y **no avisa a nadie**.
  Habría que añadirle una notificación interna si ese formulario sigue en uso.
- `71869d69` — workflow de chat iniciado **sin nombre** y con un solo paso (tarea de 15 min);
  no aparece en la lista de automatizaciones por falta de nombre.
- `95c505c9` — el correo de seguimiento usa una plantilla (`6aea870965f5fcfbc4c2d98a`) que no se
  abrió en esta revisión; va al contacto, pero conviene confirmar su contenido.
- Los tres workflows de etiqueta (`f2e61e0a`, `baf9e1e5`, `a22c45ee`) y el `71869d69` no avisan
  al equipo; es intencional en las etiquetas, no en el chat.
