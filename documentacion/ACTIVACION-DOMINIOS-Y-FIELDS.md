# Activación de dominio, fields y custom values por municipio

Procedimiento **verificado en vivo** con Adjuntas el 30 de octubre de 2026: subdominio
conectado al Website, cuatro fields iguales a los de `ilatekpr.com`, página por defecto y 404
asignadas, `robots.txt` y `llms.txt` publicados idénticos a sus archivos y los 13 custom values
escritos con el pueblo correcto.

## 0. Prerrequisito: los custom values del municipio

Sin esto, el sitio carga pero el pueblo sale en blanco. El síntoma típico es un título como
`Compañía Multiservicios en  | Ilatek Property Solution` (dos espacios donde debería ir el
municipio) porque `{{custom_values.county_name_and_state}}` está vacío.

```bash
# Un municipio
node tools/ghl/crear-subcuentas.mjs --valores --only adjuntas

# Los 78 (idempotente: actualiza por id, no duplica)
node tools/ghl/crear-subcuentas.mjs --valores
```

Escribe **13** valores por subcuenta. Los dos que se quedan vacíos a propósito son
`Business ID` y `Access Token` (ver [tools/ghl/README.md](../tools/ghl/README.md)).

**Regla del propietario:** `{{custom_values.website_url}}` debe ser **idéntico** a
`{{custom_values.business__county_domain}}`, es decir el subdominio del pueblo
(`adjuntas.ilatekpr.com`), no `ilatekpr.com`. Así los enlaces internos no saltan al dominio
principal.

| Custom value | Valor |
|---|---|
| `Website Url` | `<slug>.ilatekpr.com` |
| `Business - County Domain` | `<slug>.ilatekpr.com` |
| `Business - County Name` | `<Municipio>, Puerto Rico` |
| `County Name And State` | `<Municipio>, Puerto Rico` |
| `Website - Region` / `Website - State` | `Puerto Rico` / `PR` |

## 1. Conectar el subdominio

**Settings → Domains & URL Redirects → Domains → Connect a domain** y elegir
**Funnel/Website/Store/Blog/Webinar**:

1. Escribir `<slug>.ilatekpr.com` y **Continue**.
2. **Continue** otra vez; GHL busca el proveedor (*Finding provider details…*,
   *Retrieving DNS records…*).
3. Cuando muestra la tabla de registros, pulsar **Verify records**.

Queda un bloque **External Domains (1)** con el dominio padre (`ilatekpr.com`, DNS en GoDaddy)
y el subdominio listado en **Sub Domains**, con **Connected Products: None** por ahora.

## 2. Asignar el producto Website

En **Sites → Websites → (el sitio) → Settings**, campo **Domain** (`#funnels`): elegir el
subdominio y **Save**. En la tarjeta del dominio, *Connected Products* pasa de `None` a
`Website` y *Action Required* queda en **Set Default Page**.

## 3. Llenar los fields

En esa misma pantalla (**Website → Settings**), los cuatro valores son los de `ilatekpr.com`:

| Campo | Valor |
|---|---|
| **Favicon URL** | `https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ab044d04091fa65e69921f6.png` |
| **Head tracking code** | gtag.js + GTM — **15.926 bytes**, sha256_16 `3313057230e647b6` |
| **Body tracking code** | GTM noscript — **4.026 bytes**, sha256_16 `94e33fe3760fb111` |
| **Chat widget** | `Ilatek` |

Listos para pegar en [activacion-municipios/tracking-head.html](activacion-municipios/tracking-head.html)
y [activacion-municipios/tracking-body.html](activacion-municipios/tracking-body.html).

## 4. Página por defecto, 404 y archivos SEO

**Domains & URL Redirects → Manage** (en el dominio padre) → en la fila del subdominio,
**Set Default Page**. El diálogo **Edit Domain** tiene los cuatro campos:

| Campo | Valor |
|---|---|
| Default Page | `Ilatek / Home` |
| Set default 404/Error Page | `Ilatek / 404` |
| Robots.txt code | contenido de `es-<slug>.robots.txt` |
| llms.txt | contenido de `es-<slug>.llms.txt` |

Guardar. Sin Default Page el subdominio responde **404** en la raíz aunque el Website exista:
es el estado en que estaba Adjuntas antes de esta activación.

## 5. XML Sitemap

El `sitemap.xml` **no se genera solo** al conectar el dominio: hay que crearlo una vez por
dominio. Es el procedimiento oficial de HighLevel
([XML Sitemaps](https://help.gohighlevel.com/support/solutions/articles/48001182524-xml-sitemaps)).

**Domains & URL Redirects → Manage** → en la fila del subdominio, el menú de tres puntos →
**XML Sitemap**:

1. Marcar el funnel `Ilatek` (se despliegan las 60 páginas y se marcan todas). Ojo: hacer clic
   en el nombre solo despliega el acordeón; hay que marcar la casilla del funnel.
2. **Proceed**.
3. **Add new** → en **Custom Path** escribir `sitemap.xml` (el campo viene con el ejemplo
   `test_path?item=123`; si se deja así, el sitemap se publica con esa ruta basura).
4. **Generate & Save**. El aviso confirma la URL `https://<slug>.ilatekpr.com/sitemap.xml`.

**Por API**, que es como se hizo en los 78 (unos segundos por municipio):

```
GET  /funnels/domain/?locationId=<loc>                                  → domainId
GET  /funnels/funnel/list/by-location-and-domain?locationId=<loc>&domainId=<dom>
POST /funnels/domain/xml-sitemap
     { locationId, domainId,
       mapping: <funnels con selected=true y cada child.selected=true>,
       custom: [{ path: "sitemap.xml", lastMod: "<hoy>" }] }
```

El `POST` responde **201** con el XML ya generado. Las cabeceras (`token`, `channel`,
`source`) se toman de cualquier petición de la propia app: no hay que inventarlas.

El procedimiento completo —cuerpo exacto del `POST`, las trampas del asistente y cuándo hay que
regenerarlo— está en [Activación del sitemap por municipio](ACTIVACION-SITEMAPS.md).

## 6. Verificar

```bash
s=adjuntas
curl -s -o /dev/null -w "home %{http_code}\n"     --max-time 25 https://$s.ilatekpr.com/
curl -s -o /dev/null -w "robots %{http_code}\n"   --max-time 25 https://$s.ilatekpr.com/robots.txt
curl -s -o /dev/null -w "llms %{http_code}\n"     --max-time 25 https://$s.ilatekpr.com/llms.txt
curl -s -o /dev/null -w "sitemap %{http_code}\n"  --max-time 25 https://$s.ilatekpr.com/sitemap.xml
curl -s --max-time 25 https://$s.ilatekpr.com/ | grep -o "<title>[^<]*</title>"
```

| Comprobación | Criterio |
|---|---|
| Home | **200** |
| Título | contiene el municipio (`… en Adjuntas, Puerto Rico …`) |
| robots.txt / llms.txt | **200** y byte a byte iguales a `es-<slug>.robots.txt` / `.llms.txt` |
| sitemap.xml | **61 URLs**, todas en `https://<slug>.ilatekpr.com/` |
| Tokens | sin `{{custom_values.*}}` visibles |
| Chat | el widget `Ilatek` carga |

Un `sitemap.xml` que responde **200 con 0 bytes** significa que ese dominio nunca tuvo sitemap:
no se genera solo, hay que crearlo con el paso 5. Cuando está creado sirve las 61 URLs en menos
de un minuto.

## Registro de la verificación

**Adjuntas** — 30 de octubre de 2026. Location `a2exPBDC6lltfgRUJYNC`, Website
`onNnDzv7Cg73cv7IOVaq` (el id `k71P2…` que aparecía en el muestreo del 29 de octubre estaba
obsoleto).

| Paso | Resultado |
|---|---|
| Custom values | 13/13 · `Website Url` = `adjuntas.ilatekpr.com` |
| Dominio | `External Domains (1)` · `Sub Domains: adjuntas.ilatekpr.com` · `Connected Products: Website` |
| Fields | favicon ✓ · head `3313057230e647b6` ✓ · body `94e33fe3760fb111` ✓ · chat `Ilatek` ✓ |
| Default Page / 404 | `Ilatek / Home` · `Ilatek / 404` |
| robots.txt / llms.txt | 200 · idénticos (1.927 y 5.354 caracteres) |
| Home | 200 · título `Compañía Multiservicios en Adjuntas, Puerto Rico` |
| Enlaces internos | apuntan a `https://adjuntas.ilatekpr.com/…` |
| sitemap.xml | creado después del registro inicial: **61 URLs** (ver cierre) |

**Aguadilla** — 30 de octubre de 2026, segundo municipio activado de punta a punta: dominio
conectado, `Connected Products: Website`, favicon y tracking iguales a `ilatekpr.com`,
`Ilatek / Home` + `Ilatek / 404`, `robots.txt` y `llms.txt` idénticos a sus archivos. Home
**200** y título `Compañía Multiservicios en Aguadilla, Puerto Rico`.

**Las 78 subcuentas** — 30 de octubre de 2026, tras corregir `Website Url`. Auditoría de los 15
custom values contra el contrato: **78/78 correctos, 0 problemas**
([auditoria-custom-values-2026-10-30.json](activacion-municipios/auditoria-custom-values-2026-10-30.json)). Comprobación pública
posterior: `adjuntas`, `aguada` y `juncos` responden 200 con su municipio en el título.

## Cierre: los 78 activados

30 de octubre de 2026, lote completo sobre las 78 subcuentas. Las cinco fases (dominio, producto,
fields, página + archivos, y XML sitemap) se aplicaron a todas; las que ya las tenían se
detectaron y se saltaron (por eso el lote se puede relanzar sin miedo).

| Comprobación (pública, los 78) | Resultado |
|---|---|
| Home | **200** en los 78 |
| Título con el municipio | **78/78** |
| `robots.txt` y `llms.txt` | **200** y byte a byte iguales a sus archivos: **78/78** |
| Head tracking (`G-BTVFHT1X8G`) | presente en los 78 |
| Body tracking (`GTM-PQMR2TDB`) | presente en los 78 |
| Chat widget `Ilatek` | carga en los 78 |
| Favicon estándar | en los 78 |
| `Connected Products: Website` | en los 78 |
| `sitemap.xml` | **61 URLs** propias en los **78/78** |

Detalle por municipio en
[verificacion-78.json](activacion-municipios/verificacion-78.json) y
[sitemaps-78.json](activacion-municipios/sitemaps-78.json).

**Dos cosas que dejó el lote y conviene saber:**

1. **Juncos** tenía un `robots.txt` viejo (720 caracteres) porque el paso 4 se salta el diálogo
   cuando `Set Default Page` ya está hecho, y ahí viven los dos archivos. Se corrigió por API:
   `PUT /funnels/domain/{domainId}` con `{locationId, robotsTxtCode}`. Ahora sirve los 2.001
   caracteres del archivo. Si un municipio ya tenía páginas, hay que reescribir los archivos por
   esa vía, no por la UI.
2. **sitemap.xml**: al principio solo Aguada y Juncos lo tenían, porque el sitemap **no se genera
   solo** al conectar el dominio. Los 76 restantes se crearon con el paso 5 y hoy los 78 sirven
   **61 URLs** propias ([sitemaps-78.json](activacion-municipios/sitemaps-78.json)). En el objeto
   del dominio eso se ve como `xmlMappingPath` / `xmlMappingUrl` rellenos (antes `null`).

   Dos trampas del asistente, ya recogidas arriba: hacer clic en el nombre del funnel solo
   despliega el acordeón sin marcar nada, y **Custom Path** viene con el ejemplo
   `test_path?item=123` — si no se cambia a `sitemap.xml`, el sitemap se publica con esa ruta
   basura y una sola URL.
