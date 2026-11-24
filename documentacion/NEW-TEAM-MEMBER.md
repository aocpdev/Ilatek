# New Team Member: página → endpoint → usuario de GHL

Estado: **16 de noviembre de 2026** · Subcuenta **Ilatek - PR** (`8OxUENFVM60EKzqsTcoD`).

Página: `ilatekpr.com/admin/new-team-member` → `admin/new-team-member.html`,
generada con `node tools/build-new-team-member.mjs` desde
`documentacion/bloques/alta-usuario-form.html`. Es interna
(`noindex,nofollow`) y la opera la oficina, no el colaborador. No usa workflow
ni webhook de GHL: el navegador llama directo a `POST /ghl/alta`.

Cadena implementada:

```
documentacion/bloques/alta-usuario-form.html   (consola del operador)
        │  POST /ghl/alta  + cabecera x-ilatek-token (código interno)
        ▼
Endpoint create-user  (Worker en Sites)
        │
        ├─► POST /users/                crea el usuario (token de agencia)
        ├─► POST /medias/upload-file    sube la foto y la pone en profilePhoto
        ├─► GET/PUT /calendars/{id}     enlaza los calendarios del admin elegido
        └─► POST /contacts/{id}/notes   guarda las notas del submit
```

## 1. Piezas y ids

| Pieza | Valor |
| --- | --- |
| Workflow | `Alta de usuario (equipo)` — `6501acb2-e5ad-4d4e-8599-5739b4fd5d89` (**Published**, 16-nov-2026 17:58) |
| Acción | `#1 Custom webhook` → `POST` al endpoint, cabecera `x-ilatek-token`, body JSON de 16 campos |
| URL del trigger | `https://services.leadconnectorhq.com/hooks/8OxUENFVM60EKzqsTcoD/webhook-trigger/82c6e141-e230-4f23-8f0e-d9cdcab8a110` |
| Trigger | Inbound webhook (premium: cobra por ejecución) |
| Mapping reference | `Request ryIO4Uc707pBwnAXw51V` (16-nov-2026 17:28) |
| Endpoint | `tools/ghl/worker/create-user-worker.mjs` → Sites `7f3c1a2e-9b64-4d7a-8c15-2f6e9a04d3b8` |
| URL del endpoint (preview) | `https://site-8d8067c6633841d388bbc85f5b916b26.freebuff.page` |
| Manifiesto de despliegue | `tools/ghl/worker/deploy.json` |
| Versión Node (local) | `tools/ghl/create-user-webhook.mjs` |

El endpoint tiene dos implementaciones con el mismo contrato: la de Node para
probar en local y la de Worker para producción. Cambios de comportamiento van
en las dos.

## 2. Rutas del endpoint

| Ruta | Uso |
| --- | --- |
| `POST /ghl/create-user` | acción Webhook del workflow; exige `x-ilatek-token` |
| `GET /ghl/eligibility?email=` | consulta pública del formulario; devuelve `{eligible}` y CORS `*` |
| `GET /health` | diagnóstico: qué variables faltan, sin exponer valores |

Comprobado en producción: `/health` responde `200` con
`requiredTag: "team"`, `admins: ["luis","aida"]`.

## 3. Variables del endpoint

En Sites → Secrets. Las dos marcadas **[obligatorio]** bloquean la creación de
usuarios mientras falten (el endpoint responde `503 NOT_CONFIGURED`).

| Nombre | Valor |
| --- | --- |
| `GHL_PIT` **[obligatorio]** | token **de agencia** con `users.write` |
| `GHL_COMPANY_ID` **[obligatorio]** | id de la agencia dueña de la subcuenta |
| `GHL_WEBHOOK_SECRET` **[obligatorio]** | secreto compartido; el workflow lo manda en `x-ilatek-token` |
| `GHL_LOCATION_ID` | por defecto `8OxUENFVM60EKzqsTcoD` |
| `GHL_REQUIRED_TAG` | por defecto `team`; vacío = no exige etiqueta |
| `GHL_LINK_CALENDARS=0` | desactiva el enlace de calendarios |
| `DRY_RUN=1` | valida sin llamar a GHL |

## 4. Etiqueta `team`

El contacto debe existir en la subcuenta con la etiqueta `team`:

- el formulario lo comprueba en el paso 1 contra `/ghl/eligibility` y **falla
  cerrado** (sin respuesta positiva no se avanza ni se envía);
- el endpoint lo vuelve a comprobar antes de crear el usuario y responde
  `403 NO_TEAM_CONTACT` o `403 NO_TEAM_TAG`.

## 5. Alta desde la consola del operador (flujo actual)

El workflow ya no interviene: el formulario es interno y lo llena la oficina.
El envío va directo al endpoint en la ruta `POST /ghl/alta`, con el código
interno en la cabecera `x-ilatek-token` (el mismo valor de
`GHL_WEBHOOK_SECRET`). Ese código lo escribe el operador una vez y el navegador
lo recuerda en `localStorage`; no se guarda en GHL.

Por qué no se dispara por MCP: el servidor MCP `ghl` corre en el PC del
owner (stdio, dentro de Freebuff). Un navegador no puede invocarlo y, si se
apagara esa máquina, dejarían de entrar altas. El endpoint en Sites no depende
de ninguna máquina local.

Qué hace `POST /ghl/alta`, en orden:

1. Crea o reutiliza el contacto (dedupe por email) y le pone los campos nativos
   `firstName`, `lastName`, `phone`, `city` (primer municipio) y `source`.
2. Le pone las etiquetas `team` y `equipo-<admin>`.
3. Sube la foto a `/medias/upload-file` y la usa como `profilePhoto`.
4. Crea el usuario con `POST /users/` y devuelve la contraseña temporal.
5. Enlaza los calendarios del equipo elegido.
6. Deja una **nota** en el contacto con todo lo que marcó el operador (equipo,
   cobertura completa, horario, urgencias, notas, quién lo registró, usuario
   creado). No se crean custom fields nuevos.
7. Envía la bienvenida **solo si `WELCOME_EMAIL=1`** (hoy apagado: falta la
   aprobación explícita del borrador).

Antiduplicados: el email solo se marca como procesado **después** de que el
usuario exista en GHL. Si el alta falla antes (token, GHL, validación), el
operador puede reintentar el mismo correo y no recibe `deduplicated`; mientras
que un reintento de un alta que sí se creó responde `deduplicated: true` con el
aviso «Ese email ya se dio de alta hace unos minutos».

Comprobado tras desplegar: `/health` informa `altaRoute: "/ghl/alta"` y
`welcome: false`; el preflight responde `204` con
`access-control-allow-headers: content-type, x-ilatek-token`; un `POST` sin
código o con código incorrecto devuelve `401 UNAUTHORIZED` con `acao: *`.

Pendiente para que una alta real funcione:

1. Poner en Sites → Secrets `GHL_PIT` y `GHL_COMPANY_ID` (sin ellos, `503
   NOT_CONFIGURED`).
2. Aprobar el borrador del correo de bienvenida y activar `WELCOME_EMAIL=1`.
3. Probar un alta con un correo de prueba y revisar contacto, etiquetas, nota y
   contraseña devuelta.

## 6. Campos que viajan del formulario al endpoint

`email`, `first_name`, `last_name`, `full_name`, `phone`, `admin`,
`admin_user_id`, `admin_team`, `admin_calendars`, `towns`, `towns_text`,
`coverage_all_island`, `availability` / `availability_json`, `availability_text`,
`emergency_same_day`, `emergency_same_day_text`, `notes`, `summary_text`,
`photo_base64`, `photo_name`.

El trigger admite **1 MB** de payload: la foto en base64 puede pasarse y hacer
fallar el envío completo. Conviene comprimirla en el navegador o mandarla aparte
antes de producción.

## 7. Pendiente conocido

- **Correo de bienvenida**: `documentacion/bloques/email-bienvenida.html` usa
  `{{custom_values.equipo_lider}}` y `{{custom_values.equipo_lider_email}}`, que
  todavía no existen como custom values. Además, ningún correo se activa sin la
  confirmación explícita del borrador.
- **Contraseña temporal**: `POST /users/` no envía invitación; el endpoint
  devuelve `temporaryPassword` y el workflow debe entregarla por su canal.
