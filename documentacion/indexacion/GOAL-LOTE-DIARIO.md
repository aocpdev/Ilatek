# Lote diario de indexación — qué falta y cómo lanzarlo

Estado al **7 de noviembre de 2026**. Este documento existe para que puedas lanzar el lote cada día
con una instrucción corta, sin volver a explicar el proyecto.

## 1. Estado real hoy

| Canal | Estado | Cifras |
|---|---|---|
| Inventario (Fase 0) | ✅ rehecho el 7 nov | 1.172 listadas → **1.055 vivas** (38 servicios + 1.017 comunidades); 6 páginas de relleno descartadas |
| Bing | ✅ al día, sin errores | **238 aceptadas** (38 servicios + 200 comunidades: 100 el 6 nov, 100 el 7 nov) |
| Bing cola | ⏳ pendiente | **917 comunidades** en `pendientes-bing.txt`, las 917 probadas con HTTP real → ~10 días a 100/día |
| Google Search Console | ✅ operativo por la interfaz (como usuario) | **46** solicitadas el 6 nov; techo medido ~**46/día** → ver `RUTINA-GSC-DIARIA.md` |
| Sitemap de comunidades | ⛔ bloqueado por la plataforma | en vivo: 200 · `text/xml` · 107 b · `<urlset/>` vacío. En el repo: `sitemap-comunidades.xml` con **1.017 `<loc>`** (0 fuera del inventario). `POST /funnels/domain/xml-sitemap` → **401 IAM**; evidencia y payload en `SITEMAP-COMUNIDADES-BLOQUEO.md` |
| Sitemap del blog | ⏳ pendiente de que el blog esté live | `/sitemap-blog.xml` y `/blog` dan 404/soft-404. Al publicarse: enviar el XML a Bing y a Search Console (ver §7) |
| IndexNow | ⏳ script listo, falta la clave | `scripts/indexacion/indexnow.mjs` manda las 867 en un POST; bloqueado hasta servir `https://comunidades.ilatekpr.com/<clave>.txt` (ver `documentacion/INDEXNOW.md`) |

## 2. Qué necesito de ti

### Bing — nada, ya está ✅

La API key que me diste ya funciona y está guardada en `Ilatek/.tmp-keys/bing.key` (ignorada por
git). Alternativa: exportar `BING_API_KEY` en el entorno. No hace falta nada más.

Límite real de esta cuenta, medido (no el teórico de 10.000): **100 URLs/día y 2.500/mes por sitio**,
y es adaptativa — baja al consumirse. `GetUrlSubmissionQuota.DailyQuota` es la **cuota restante**.

### Google — falta un archivo y dos permisos

1. **Google Cloud Console** → proyecto propio (o uno existente) → *APIs y servicios* → habilitar
   **Google Search Console API**.
2. *IAM y administración* → **Cuentas de servicio** → crear una → *Claves* → **Crear clave nueva**
   → tipo **JSON** → descargar.
3. Guardar el JSON en el proyecto como **`Ilatek/.tmp-keys/gsc-service-account.json`**
   (la carpeta ya está en `.gitignore`). No hace falta pegarme nada por chat.
4. **Search Console** → *Configuración → Usuarios y permisos* → añadir el `client_email` del JSON
   como **Propietario**. Vale la propiedad de dominio `sc-domain:ilatekpr.com` (cubre subdominios);
   si no la tienes, añade `https://ilatekpr.com/` y `https://comunidades.ilatekpr.com/`.

Con eso: `GOOGLE_APPLICATION_CREDENTIALS=Ilatek/.tmp-keys/gsc-service-account.json node scripts/indexacion/gsc-sitemaps.mjs --yes`

Recordatorio: Google **no** tiene API de "solicitar indexación" masiva. Lo que se envía es el
sitemap de cada propiedad; el rastreo lo decide Google. El script se niega a enviar un sitemap vacío
(por eso hoy omitiría comunidades, que es justo lo correcto).

### Opcional — PIT de GHL (para arreglar el sitemap de comunidades)

Sin esto no puedo publicar el sitemap corregido ni su `robots.txt`: el PIT de `.mcp.json` responde
**401** y el MCP de GHL no expone funnels ni dominios. Renueva el PIT (GHL → Settings → Private
Integrations) y se aplica el `POST /funnels/domain/xml-sitemap` de
`documentacion/ACTIVACION-SITEMAPS.md`, que ya funcionó en los 78 municipios.

## 3. La instrucción que puedes darme cada día

Cópiala tal cual:

> Ejecuta el lote diario de indexación: corre `node scripts/indexacion/lote-diario.mjs --yes`,
> respeta la cuota que devuelva Bing para cada host (no pases del `DailyQuota`), no envíes URLs del
> blog ni de los subdominios municipales, y comprueba el resultado contra `ledger-bing.csv`. Si
> existe `Ilatek/.tmp-keys/gsc-service-account.json`, envía también los sitemaps a Search Console
> con `gsc-sitemaps.mjs --yes`. Termina con el reporte del día en una tabla y dime qué queda.

Si quieres variantes: «lanza el lote diario con máximo 50 URLs» o «solo revisa la cuota y el estado,
sin enviar».

## 4. Qué hace el runner y qué no

`scripts/indexacion/lote-diario.mjs`

- Consume **`pendientes-bing.txt`**, no el inventario: así nunca reenvía lo ya aceptado.
- Consulta cuota por host; si un host está en 0, sus URLs se quedan en cola.
- Envía en lotes (100 por defecto), con pausa de 2,5 s + jitter y 3 reintentos con backoff en 429/5xx.
- Mueve lo aceptado a `enviadas-bing.txt`, deja el ledger incremental y escribe
  `documentacion/indexacion/diario/<fecha>.md`.
- Sin `--yes` es dry-run: consulta cuota y muestra el plan, sin tocar nada.
- **No** usa la Indexing API de Google (solo vale para `JobPosting`), **no** reparte envíos entre
  varias cuentas para esquivar límites y **no** toca el blog ni los municipios.

## 5. Comandos útiles

```bash
# plan del día (sin enviar)
node scripts/indexacion/lote-diario.mjs

# envío real del día
node scripts/indexacion/lote-diario.mjs --yes

# estado de cola y cuota
wc -l Ilatek/documentacion/indexacion/pendientes-bing.txt
cat Ilatek/documentacion/indexacion/ledger-bing.csv

# inventario (si cambian las landings publicadas)
node scripts/indexacion/inventario.mjs

# sitemaps a Search Console (requiere el JSON)
node scripts/indexacion/gsc-sitemaps.mjs --yes
```

Cuando la cola llegue a 0, el proyecto queda notificado en Bing al 100 % de sus URLs vivas. Lo que
falte de indexación real depende de que Google y Bing rastreen, y de que se publiquen las **95
comunidades** que hoy no sirven su propia página (89 en 404 y 6 con el relleno de GHL). La lista
exacta, con la prueba de cada una, está en `comunidades-sin-publicar.md`. De las 145 que estaban sin
publicar el 6 nov, 50 ya se publicaron y las demás van cayendo: el número cambia entre pasadas.

## 6. Camino para indexar todo (sin Google Cloud si hace falta)

Notificar no es indexar. De las **1.055 URLs vivas**, la notificación en Bing ya cubre **238** y
cubrirá el resto en unos 10 días. Lo que de verdad limita "indexar todo" son cuatro cosas, y solo
una es de Google:

| Bloqueo | Páginas afectadas | Quién lo desbloquea |
|---|---|---|
| 95 comunidades sin publicar (89 en 404 + 6 con página de relleno) | 95 | publicar sus funnels en GHL (ver `comunidades-sin-publicar.md`) |
| `sitemap.xml` y `robots.txt` de comunidades vacíos | 1.017 | ruta de sitemap no expuesta al PIT (401 IAM, comprobado el 7 nov): UI de GHL una vez o habilitar la ruta — ver `SITEMAP-COMUNIDADES-BLOQUEO.md` |
| Canonical municipal → dominio principal | 4.758 | decisión: corregir canonical por subdominio o asumir la consolidación |
| Credenciales de Search Console | 1.055 | ti o Apps Script (ver abajo) |

### Google sin Google Cloud: Apps Script

`gsc-sitemaps.gs` envía los sitemaps usando **tu propia cuenta de Google** dentro de Apps Script, sin
cuenta de servicio y sin claves: el token lo emite el script para el usuario que lo ejecuta, que debe
tener permiso en Search Console. Montaje en 5 minutos (está en la cabecera del archivo).

Si un `PUT` responde 403 por API deshabilitada, el proyecto implícito de Apps Script necesita un
proyecto de Cloud vinculado —gratuito y sin claves—; es el único paso que toca Cloud y el archivo lo
explica. El plan B sin nada de Cloud es la UI: una vez publicados los sitemaps, darlos de alta en
Search Console → Sitemaps (una decena de clics) y dejar que rastree.

La opción de "pedir indexación" una por una en la UI no escala a 1.005 URLs y tampoco hace falta
(aunque desde el 6 de noviembre de 2026 un runner hace ese mismo flujo por la interfaz a ~46 URLs
aceptadas por día; comando y reanudación en `RUTINA-GSC-DIARIA.md`):
con sitemap válido, `robots.txt` declarándolo y enlaces internos, Google descubre solo. Lo que no
existe —ni con Cloud ni sin él— es una API de indexación masiva para páginas normales.

## 7. Pendiente — cuando el blog esté live

Instrucción vigente (7 nov 2026): **cuando el blog esté publicado, enviar su sitemap a Bing y a
Search Console**. No enviarlo antes.

### Disparador (los tres deben cumplirse)

| Comprobación | Hoy (7 nov 2026) | Cuándo está listo |
|---|---|---|
| `https://ilatekpr.com/blog` | 200 pero sirve el home (soft-404), sin `ilb-main`, canonical del home | 200 con `ilb-main` y canonical `https://ilatekpr.com/blog` |
| `https://ilatekpr.com/sitemap-blog.xml` | 404 | 200, `application/xml`, **118 `<loc>`** |
| `https://ilatekpr.com/blog/comparativas` | 404 | 200 |

Si `/blog` sigue siendo soft-404 o el XML da 404, **no se envía nada**: Bing y Google registrarían
un sitemap roto.

### Envío a Bing

La propiedad verificada es `https://ilatekpr.com/`; el feed del blog es del mismo host, así que va
bajo esa propiedad con `SubmitFeed` (POST JSON, no GET):

```bash
# firma: POST https://ssl.bing.com/webmaster/api.svc/json/SubmitFeed?apikey=<bing.key>
# body: {"siteUrl":"https://ilatekpr.com/","feedUrl":"https://ilatekpr.com/sitemap-blog.xml"}
# verificar después: GET GetFeeds?apikey=<bing.key>&siteUrl=https://ilatekpr.com/
```

No hace falta `AddSite` para el blog: es el mismo host ya verificado.

### Envío a Search Console

Propiedad de dominio `sc-domain:ilatekpr.com` (cubre el host y los subdominios). El runner actual
`scripts/indexacion/gsc-sitemaps.mjs` recorre solo `https://<host>/sitemap.xml`, **no** el del blog;
para el blog hay que hacer el `PUT` aparte:

```text
PUT https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Ailatekpr.com/sitemaps/https%3A%2F%2Filatekpr.com%2Fsitemap-blog.xml
Authorization: Bearer <token OAuth con scope webmasters>
```

Después, `GET` de la misma ruta para confirmar que quedó registrado y sin errores. Los 79 sitemaps
de host siguen yendo con `node scripts/indexacion/gsc-sitemaps.mjs --yes`.

### Requisito que falta para GSC

Hoy `Ilatek/.tmp-keys/` solo tiene `bing.key` e `indexnow.key`: **no existe
`gsc-service-account.json`**. Para el `PUT` automático hace falta ese JSON (ver §2) y añadir su
`client_email` como Propietario de `sc-domain:ilatekpr.com`. Sin él, la alternativa es
`gsc-sitemaps.gs` en Apps Script o la UI de Search Console → Sitemaps.

## 8. Sitemaps municipales en Bing — estado 8 nov 2026 (cierre)

Propiedad: `https://ilatekpr.com/`. **Los 78 sitemaps municipales están dados de alta** (0 sin
feed): HTTP 200, `text/xml`, 61 `<loc>` cada uno (4.758 URLs). Se enviaron con `SubmitFeed` y,
cuando la API entró en `ThrottleHost`, con la UI de Bing (`Submit sitemap` / `Re-submit`).

| Estado | Feeds | Municipios |
|---|---:|---:|
| Sitemap principal | 1 Success (60 URLs) | — |
| Municipios con al menos un feed Success | 69 | 69 |
| Municipios sin ningún feed Success | 13 feeds con error (incluye duplicados) | 9 |
| **Total** | **83** | **78** |

Municipios sin ningún Success: `canovanas`, `maricao`, `moca`, `morovis`, `patillas`,
`quebradillas`, `rincon`, `sabana-grande`, `villalba`. Los 78 sitemaps son válidos: 200/61 a
`bingbot`, IPv4 e IPv6 y XML válido; en la muestra de `maricao`, las 61 URLs responden 200. El error
de Bing (`The page is not accessible`) es de acceso de su crawler, no del sitemap ni del hosting.

De los 11 errores originales, 9 ya tienen un feed Success (`arroyo` se recuperó con una URL fresca
`?refresh=20261108`); `canovanas` y `maricao` siguen sin él. De los 29 que faltaban, 22 procesaron y
7 (`moca`, `morovis`, `patillas`, `quebradillas`, `rincon`, `sabana-grande`, `villalba`) siguen con
error. La UI empezó a devolver `An unexpected error occurred on the server side` y la API sigue en
`ThrottleHost`: los 9 restantes hay que reintentarlos cuando Bing libere el cupo (o vía soporte).

Comunidades: su sitemap sigue vacío (200, `text/xml`, 107 b, **0 `<loc>`**); no se envía. El
`sitemap-comunidades.xml` local tiene 1.017 URLs, pero no está publicado.

Nota: durante las pruebas se añadieron 29 subdominios como sitios no verificados en Bing. No son
necesarios para aceptar los feeds y se pueden verificar por DNS o eliminar después.
