# Workflow maestro de captura — Ilatek PR

Estado: **5 de noviembre de 2026** · Subcuenta **Ilatek - PR** (`8OxUENFVM60EKzqsTcoD`).
Publicado y probado con una ejecución real de punta a punta.

Captura cualquier lead de la isla, de cualquier servicio, por un solo punto de entrada y lo
convierte en contacto + nota + oportunidad + etiquetas + aviso interno + tarea + correo de
bienvenida, sin intervención humana.

## 1. Piezas

| Pieza | ID |
| --- | --- |
| Workflow | `399e8778-41f8-4d43-a057-c470d5ea67d7` |
| Trigger | `58Mcw8HwICP6Mjo2Wchf` |
| Webhook | `https://services.leadconnectorhq.com/hooks/8OxUENFVM60EKzqsTcoD/webhook-trigger/58Mcw8HwICP6Mjo2Wchf` |
| Pipeline / etapa | Cotizaciones `koKZMpsg4GfYKzPkVcHb` / New Lead `bb571230-5385-4d2e-aa20-04bd1bd7cff0` |
| Responsable de la tarea | Luis Cardec `lrgREN7IQe6y2iRW4Epe` |
| Remitente del correo | `ilatek.pr.lead@gmail.com` |

El workflow **no toca** `Hook Cotizo` (`ab2fa196…`) ni `Agendó Limpieza` (`b5f42a19…`): son
circuitos separados y siguen publicados como estaban. El maestro escucha su propio webhook, no
el del cotizador, así que no se duplican oportunidades.

## 2. Pasos (7)

1. **Crear o actualizar contacto** — nombre, apellido, correo, teléfono y 14 campos.
2. **Nota de oportunidad** — origen, página, solicitud, cliente, servicio, municipio, zona,
   intención, urgencia, áreas, extras, total, depósito, mensaje, campaña, consentimiento y la
   próxima acción con SLA.
3. **Crear o actualizar oportunidad** — nombre `Nombre Apellido — Servicio — Municipio`, valor,
   etapa New Lead, sin duplicados, con 12 campos.
4. **Etiquetar** — `lead-nuevo`, `requiere-seguimiento`.
5. **Notificar al equipo** — título accionable y enlace a la oportunidad.
6. **Tarea** — asignada a Luis, texto con SLA de 15 minutos y guion de contacto.
7. **Correo de bienvenida** — tono empático, enlaces a los dos cotizadores, horario, teléfono y
   firma de Luis y Aida.

## 3. Contrato del payload

`POST` al webhook con `Content-Type: application/json`. Todos los campos son opcionales salvo
nombre y un canal de contacto.

| Clave | Ejemplo | Uso |
| --- | --- | --- |
| `nombre`, `apellido` | `Mar`, `Soler` | Nombre del contacto y de la oportunidad |
| `email`, `telefono` | `mar@correo.com`, `+17875550101` | Contacto y destinatario del correo |
| `servicio` | `Techos — Reparación de goteras` | Campo *Tipo de servicio* |
| `municipio`, `zona` | `Bayamón`, `Metro` | Segmentación geográfica |
| `areas`, `extras` | `Techo plano 1,200 pies2`, `Canaletas` | Detalle del trabajo |
| `valor`, `deposito` | `350`, `50` | Valor de la oportunidad |
| `origen` | `Landing municipio` | Atribución |
| `pagina` | `https://bayamon.ilatekpr.com/` | URL exacta de entrada |
| `intencion`, `urgencia` | `urgente`, `alta` | Priorización |
| `mensaje` | texto libre | Lo que escribió el cliente |
| `utm_source`, `utm_campaign` | `google`, `techos-metro` | Campaña |
| `consentimiento` | `si` / `no` | Base para futuros envíos |
| `lead_score` | `85` | Puntuación propia |
| `id_solicitud`, `resumen`, `fecha` | `qa-001`, texto, ISO | Trazabilidad |

## 4. Verificación real (5 de noviembre de 2026)

Payload de prueba con servicio de techos, municipio Bayamón, valor 350 y urgencia alta.

| Comprobación | Resultado |
| --- | --- |
| Webhook | `200` — *request sent to trigger execution server* |
| Contacto | creado con nombre, teléfono, correo y los campos de servicio, municipio, origen, intención, página, zona, lead score y consentimiento |
| Etiquetas | `lead-nuevo`, `requiere-seguimiento` |
| Nota | 1 nota con origen, solicitud, cliente, servicio, municipio, zona, urgencia, áreas, extras, total, depósito, mensaje, campaña y próxima acción |
| Oportunidad | *Prueba Maestro QA — Techos — Reparación de goteras — Bayamón*, **$350**, etapa New Lead, 12 campos con valor |
| Notificación interna | paso ejecutado |
| Tarea | creada y asignada, con SLA y guion |
| Correo | enviado: la conversación registra `TYPE_EMAIL` con el cuerpo de bienvenida |
| Circuitos previos | `Hook Cotizo` y `Agendó Limpieza` intactos |

Se repitió la prueba dos veces más (limpieza profunda en Ponce y sellado de techos en Caguas) con
el mismo resultado: contacto, **1 nota**, oportunidad con **12 campos**, **1 tarea** y **1 correo**
en la conversación (`TYPE_EMAIL`). Los tres registros de prueba se borraron, igual que el único
workflow huérfano que dejaron los experimentos. La subcuenta queda con **12 workflows y 0
huérfanos**, y el maestro en `published` v4.

## 5. Límites conocidos

- **Sin ramificación por servicio.** La cuenta no tiene ningún workflow con condicionales y la
  API interna rechaza el esquema no probado; el maestro es lineal y resuelve el servicio por
  campo, no por etiqueta. Si se necesita `servicio-techos` / `servicio-limpieza` automático, hay
  que crear el condicional desde el builder.
- **La tarea no acepta vencimiento en minutos por API.** El validador solo admite `days`; la
  tarea queda a 1 día como respaldo y el SLA de 15 minutos viaja en el título, el cuerpo y el
  aviso interno.
- **Un solo punto de entrada.** Las páginas y formularios deben apuntar al webhook; hoy el
  cotizador de limpieza sigue usando su propio circuito.

## 6. Cómo se creó (reproducible)

La API pública v2 no crea workflows. Se usó la sesión web de la app:

```bash
GET  /workflow/<loc>/<id>?includeTriggers=true     # lee pasos y triggers
POST /workflow/<loc>                               # crea el workflow → {id}
PUT  /workflow/<loc>/<id>                          # cuerpo = objeto de GET + version (+status)
POST /workflow/<loc>/trigger                       # trigger con camelCase: workflowId, locationId
```

Cabeceras: `Authorization: Bearer <access-token-v1>`, `channel: APP`, `source: WEB_USER`,
`Version: 2021-07-28`.

Dos trampas pagadas:

1. `PUT` **exige `version`**; sin ella responde `422 Version is required`.
2. El endpoint de triggers **ignora `workflow_id` en snake_case y devuelve `200`**: hay que
   enviar `workflowId` (camelCase) o el trigger no queda vinculado y el workflow nunca dispara.
3. `includeTriggers=true` anida los pasos un nivel más: `workflowData.workflowData.templates`.

### 6.1 Corrección importante sobre el `PUT` (14 de noviembre de 2026)

La receta «cuerpo = objeto de GET + `version`» **no es correcta** y deja el workflow
publicado pero **mudo**: el webhook responde `200` y no se crea nada.

Lo comprobado en la cuenta:

- `PUT` **reemplaza** `workflowData` del documento por el `workflowData` del cuerpo. La
definición ejecutable tiene que ir en ese nivel: `{"workflowData": {"templates": [ …7 pasos… ]},
"name": "…", "version": N, "status": "published"}`.
- Si se envía el objeto del `GET` completo (metadatos con los pasos anidados un nivel más
abajo), los pasos quedan fuera de `templates` y el motor no ejecuta ninguno: el builder muestra
el lienzo vacío y las ejecuciones no aparecen en *Execution logs*.
- El `name` del workflow viaja como campo **de primer nivel** del cuerpo; si se omite, el
workflow queda sin nombre en la lista.
- Añadir `city` a los `fields` del paso *Crear o actualizar contacto* **sí funciona** con la
forma plana: `{"field": "city", "value": "{{inboundWebhookRequest.municipio}}", "title": "City",
"type": "string", "date": ""}`. Verificado el 14/11/2026: el contacto nace con `city` = municipio.
- La ejecución puede tardar **30–60 s** en reflejarse en GHL. Comprobar a los 10 s lleva a
concluir, falsamente, que el workflow está mudo.
- Un `PUT` crea una versión nueva (`filePath` …`/N`) y la deja activa aunque `status` ya fuera
`published`; el `version` del documento no siempre coincide con la versión del archivo.

**Regla de oro tras cualquier edición por API:** el `200` del webhook no prueba nada.
Hay que reenviar un payload real, esperar hasta un minuto y comprobar el contacto (incluida la
ciudad), la nota y la oportunidad en GHL.

### 6.2 Incidente del 14 de noviembre de 2026 (para no repetirlo)

Al mapear la ciudad se envió un `PUT` con el objeto del `GET` completo. El workflow quedó
`published` con nombre y trigger intactos, pero **sin ejecutar** durante ~13 minutos: el webhook
respondía `200` y no se creaba nada. Se detectó porque la prueba real no produjo contacto, se
restauró la definición plana (`{"templates": [ … ]}`) y se revalidó con payloads reales. Ningún
lead real cayó en esa ventana (solo quedaron los registros QA).

## 7. Siguiente paso sugerido

Enrutar al webhook los formularios nativos, el chat, los funnels de comunidad y el cotizador de
techos; y replicar el workflow en las 78 subcuentas municipales cuando exista un token con
alcance de agencia (el PIT actual solo ve Ilatek - PR).
