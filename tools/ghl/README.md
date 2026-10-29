# tools/ghl — alta de subcuentas por municipio

Un municipio, una subcuenta (location) de GHL, con sus custom values ya puestos
para que `{{custom_values.business__county_name}}` pinte el pueblo desde el
primer día.

## Piezas

| Archivo | Qué es |
|---|---|
| `municipios.json` | Los 78 municipios en orden alfabético, con su ZIP principal. Dueño único de nombres y ZIP. |
| `crear-subcuentas.mjs` | Deriva slug, subdominio y `countyValue`; arma el payload; crea y escribe custom values. |

El slug se deriva del nombre (sin acentos, con guiones) y se cruza contra
`town_accents` de `tools/qa/custom-values.json`: si la lista se desvía de un
nombre acentuado, el script aborta antes de crear nada. Los valores de marca
(email, teléfono, redes) salen de ese mismo contrato; no se retipean aquí.

## Requisitos

- Plan **Agency Pro** (la API solo crea locations en agencia).
- PIT con `locations.write` — un token de location **no** puede crear locations.
- Token en el entorno (`GHL_PIT=pit-…`) o en `tmp-ghl-pit.txt` en la raíz del
  repo con la línea `GHL_PIT=pit-…`. Ese archivo está cubierto por `tmp-*` en
  `.gitignore`; el script nunca lo imprime ni lo copia al reporte.
- `GHL_COMPANY_ID` (id de la agencia) en el entorno o con `--company`.

## Dos credenciales posibles

| Vía | Cabeceras | Sirve para |
|---|---|---|
| **PIT de agencia** (`GHL_PIT=pit-…`) | `Version: v3` | crear locations y leer snapshots por nombre |
| **Token de sesión de la app web** | `Version: 2021-07-28` + `channel: APP` + `source: WEB_USER` | crear locations, custom values y buscar; **no** `/snapshots` |

Con la segunda hay que pasar el id del snapshot a mano (`--snapshot`), porque
`GET /snapshots` responde `401 Token source/channel mismatch`. El id aparece en
la URL del alta manual: `/accounts/search?snapshot=<id>&s_type=own&l_type=saas`.

Variables: `GHL_API_VERSION`, `GHL_SOURCE`, `GHL_CHANNEL`.

## Uso

```bash
# 0. Inventario de solo lectura: qué municipios ya tienen subcuenta
node tools/ghl/crear-subcuentas.mjs --estado

# 1. Revisar los 78 payloads sin escribir nada (modo por defecto)
node tools/ghl/crear-subcuentas.mjs

# 2. Piloto: UNA location (Adjuntas) + sus custom values
GHL_COMPANY_ID=… node tools/ghl/crear-subcuentas.mjs --crear

# 3. Lote por ventana alfabética
GHL_COMPANY_ID=… node tools/ghl/crear-subcuentas.mjs --crear --limit 10 --from Caguas --to Dorado

# 4. Solo (re)escribir custom values de una location que ya existe
node tools/ghl/crear-subcuentas.mjs --valores --only juncos
```

Opciones: `--crear`, `--valores`, `--sync-values`, `--limit N`, `--only slug,slug`,
`--from`, `--to`, `--company`, `--email`, `--phone`, `--snapshot` (id),
`--snapshot-name` (por defecto `Ilatek`), `--saas`, `--contact-id`,
`--provider-location`, `--saas-plan`, `--price`.

Códigos de salida: `0` ok · `2` falta companyId · `3` falta token · `4` snapshot
no resuelto · `5` error de la API (p. ej. token inválido) · `6` `--saas` sin
`--contact-id`.

## Qué escribe por location

El molde es el del alta manual de la agencia (Devaks), campo por campo:

| Campo GHL | Valor |
|---|---|
| First Name / Last Name | `Luis y Aida` / `Ilatek` |
| Email | `ilatek.pr@gmail.com` (el de la cuenta; GHL lo verifica una vez por location) |
| Business Name | `Ilatek - <Municipio>` (con guion, como el alta manual) |
| Business Phone | `+19393577351` |
| Street Address / City | el municipio |
| Country / State | `PR` → se ve „Puerto Rico” |
| Zip | el ZIP principal de `municipios.json` |
| Website | `<slug>.ilatekpr.com` |
| Time Zone | `GMT-04:00 America/Santo_Domingo` (AST, el del desplegable de GHL) |
| Snapshot | `Ilatek` (pestaña *My Snapshots*, tipo `own`) — se resuelve a su id |
| Tipo de cuenta | SaaS/cliente (`l_type=saas` en el alta manual) |

Dos correos distintos, a propósito: el de la **cuenta** es el del molde
(`ilatek.pr@gmail.com`), y el que **publica el sitio** sigue siendo
`business__email` del contrato (`info@ilatekpr.com`).

## Custom values: el snapshot trae nombres, no valores

Verificado en la agencia: el snapshot crea los 15 custom values con el nombre y
la carpeta correctos pero **el valor vacío**. Por eso el script, tras crear la
location, **espera** a que el snapshot termine de importarlos y después los
rellena.

La API los identifica por **nombre visible** (`Business - County Name`), no por
la clave: mandar `business__county_name` como nombre crea un valor aparte y deja
el del snapshot vacío.

Los **13** que se escriben, con su valor:

| Nombre visible | Valor |
|---|---|
| `Business - County Name` | `<Municipio>, Puerto Rico` |
| `Business - County Domain` | `<slug>.ilatekpr.com` |
| `Business - Email` | `info@ilatekpr.com` |
| `Business - Phone` | `939-357-7351` |
| `Website Url` | `ilatekpr.com` (sin protocolo, como exige el contrato de enlaces) |
| `Facebook Url` / `Instagram Url` | los perfiles de marca |
| `County Name And State` | `<Municipio>, Puerto Rico` |
| `Website Favicon` | el favicon de marca |
| `Pixel ID` | snippet de Meta con `brand.pixel_id` |
| `Precio Total` | `{{opportunity.valor_oportunidad}}` |
| `Website - Region` | `Puerto Rico` |
| `Website - State` | `PR` |

Se actualiza por `id` con `PUT` (leyendo antes la lista), así que correrlo dos
veces no duplica nada.

### Los dos que se quedan vacíos, a propósito

`Business ID` y `Access Token` **no se escriben**, y no es un pendiente:

- **Business ID**: la agencia no tiene registro de business por location
  (`GET /businesses/?locationId=…` devuelve `businesses: []`), así que el único
  id que se podría poner sería inventado. Un id falso rompe cualquier enlace que
  lo use; vacío, el campo simplemente no resuelve.
- **Access Token**: es una credencial OAuth de Facebook (carpeta `Facebook`). No
  se puede fabricar ni copiar entre subcuentas: cada una la obtiene al conectar
  su propia página. Un valor de relleno rompería la integración.

Los dos quedan vacíos también en la subcuenta de referencia del owner (Juncos),
y ninguna página del repo lee `{{custom_values.business_id}}` ni
`{{custom_values.access_token}}`.

## Snapshot y tipo de cuenta

El alta manual carga el snapshot **`Ilatek`** y crea la location como **cliente
(SaaS)**. La API separa las dos cosas:

- **Snapshot:** `POST /locations/` solo acepta el **id**, no el nombre. El script
  lo resuelve con `GET /snapshots/?companyId=…` (scope `snapshots.readonly`) y
  aborta sin crear nada si no lo encuentra. Con `--snapshot <id>` te salatas la
  resolución si el PIT no tiene ese scope.
- **SaaS:** `POST /saas/enable-saas/{locationId}` es una llamada **aparte**, y en
  V2 exige `contactId` (la subcuenta de pagos de la agencia). Por eso no es
  automático: sin `--saas` las locations nacen como subcuentas de agencia, con
  snapshot y páginas pero **sin rebilling**. Con `--saas` y `--contact-id` se
  replica el alta manual al completo.

## Seguridad

- Sin `--crear` (o `--valores`) **no hay ninguna escritura**.
- Con `--crear` y sin `--limit`, crea **una sola** location: el piloto.
- Las locations que ya existen se saltan por nombre (no se duplican).
- Reporte por corrida en `shots/ghl-subcuentas-*.json` (ignorado por git).
