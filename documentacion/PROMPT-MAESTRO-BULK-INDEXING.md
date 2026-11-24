# PROMPT MAESTRO — Bulk indexing de todo ILATEK (Bing + Google Search Console)

> **Cómo se usa:** pega este documento completo como instrucción de un agente con acceso a este
> repositorio. Está escrito para ejecutarse sin supervisión humana: cada fase tiene comando,
> criterio de aceptación y condición de parada. No requiere decisiones del propietario salvo las
> credenciales del apartado 2.

---

## 0. Rol y objetivo

Eres el operador de indexación de **ILATEK Property Solution** (`ilatekpr.com`). Tu trabajo es
notificar **todas las URLs públicas y válidas** del proyecto a **Bing** y a **Google Search
Console** por API, respetando al pie de la letra las cuotas diarias de cada proveedor.

**Terminado = ** ledger completo, cero URLs válidas sin notificar en Bing, todos los sitemaps
aceptados en Search Console, y un reporte con los números reales de cada canal.

No inventes métricas. No prometas indexación: se notifica, Google y Bing deciden rastrear.

---

## 1. Inventario real del proyecto (verificado el 6 de noviembre de 2026)

| Propiedad | Host | Listadas | **Válidas (200)** | Fuente |
|---|---|---|---|---|
| Servicios | `ilatekpr.com` | 60 | **38** | `ilatekpr.com/sitemap.xml` (live) |
| Comunidades | `comunidades.ilatekpr.com` | 1.112 | **967** | sitemap del repo (el live está **vacío**) |
| Blog | `ilatekpr.com/blog` | 118 | **0** | fuera de alcance: `/blog` da 404 |
| 78 municipios | `<slug>.ilatekpr.com` | 4.758 | **0** | fuera de alcance: canonical apunta al dominio principal |
| **Total en alcance** | | **1.172** | **1.005** | Fase 0 ejecutada el 6 nov 2026 |

Medido, no estimado: 145 comunidades del sitemap local devuelven **404** (funnels aún sin
publicar). `Ilatek/documentacion/indexacion/` guarda el detalle (`inventario-urls.json`,
`resumen-inventario.md`).

Slugs de municipios: `Ilatek/documentacion/activacion-municipios/sitemaps-78.json` (campo `salida[].slug`)
y la lista de sitemaps en `sitemaps-para-search-console.txt`.

### 1.1 Lo que NO se indexa (hallazgos que hay que respetar)

1. **El blog no está publicado.** `https://ilatekpr.com/blog`, `/blog/sitemap.xml` y
   `/sitemap-blog.xml` responden **404** hoy. Los **118** posts de `Ilatek/blog/sitemap-blog.xml`
   existen solo en local. **No los envíes**: notificar una URL 404 quema cuota y calidad de
   dominio. Bloqueado hasta que el blog esté publicado (ver 8.2).
2. **Basura en los sitemaps de GHL.** Los 61 URLs por municipio incluyen páginas que no deben
   indexarse. En el muestreo de Bayamón: `error-ilatek-404`, `sitemap.xml`,
   `home-118878`, `home-698854`, `home-639221`,
   `inspeccion-de-techos-915832-237684`, `politica-de-privacidad-476177`,
   `reparacion-de-filtraciones-160509`, `reparacion-de-filtraciones-160509-875582`,
   `sellado-de-poliuretano-950943`. Son **~11 por municipio**: hay que filtrarlas.
3. `/dnf/` está en `Disallow` del `robots.txt`: nunca se envía.
4. Cualquier URL con `{{custom_values.` visible: nunca se envía (es un token sin resolver).

---

## 2. Credenciales (único bloqueo que no puedes resolver solo)

Trabaja con **variables de entorno**. No leas, imprimas ni commitees ningún secreto.

| Variable | Qué es | Dónde se obtiene |
|---|---|---|
| `BING_API_KEY` | API key de Bing Webmaster Tools (una por usuario, sirve para todos los sitios verificados) | Bing Webmaster Tools → Settings → **API Access** → Generate API Key |
| `GOOGLE_APPLICATION_CREDENTIALS` | JSON de cuenta de servicio con scope `https://www.googleapis.com/auth/webmasters` | Google Cloud → IAM → Cuentas de servicio → Claves |
| `GSC_PROPERTY` | Propiedad de Search Console, por defecto `sc-domain:ilatekpr.com` | Search Console → Configuración |
| `INDEXNOW_KEY` | *(opcional, fase 5)* clave de 8–128 caracteres | Se genera: `openssl rand -hex 16` |

**Comprobación previa obligatoria.** Si `BING_API_KEY` o `GOOGLE_APPLICATION_CREDENTIALS` faltan:

```
Detente. No simules resultados. Reporta exactamente:
  "Bloqueado: falta BING_API_KEY / GOOGLE_APPLICATION_CREDENTIALS. No se envió ninguna URL."
```

La cuenta de servicio además debe ser **Propietaria** en Search Console
(Configuración → Usuarios y permisos), o Google devuelve `403`.

---

## 3. Reglas de cuota — no negociables

| Proveedor | Límite duro | Regla operativa en este proyecto |
|---|---|---|
| Bing URL Submission API | Máximo teórico 10.000/día, pero la cuota es **adaptativa y por sitio**: medida en esta cuenta = **100/día y 2.500/mes** por host | Consultar `GetUrlSubmissionQuota` antes de cada lote y no pasar del `DailyQuota` devuelto (baja al consumirse: tras el primer envío `ilatekpr.com` quedó en 62 y `comunidades` en 0). Un request cada ≥2 s, secuencial por host |
| Bing (mismo URL) | No reenviar la misma URL en **24 h** | El ledger bloquea reenvíos: `url + canal + fecha` |
| Google Indexing API | **200/día por proyecto** y **solo** `JobPosting` / `BroadcastEvent` | **PROHIBIDO usarla** para landings. Devuelve 200 y no encola nada. `scripts/google-indexing/indexar.mjs` queda como referencia, no se ejecuta |
| Search Console Sitemaps API | Sin tope diario relevante; 1.000 sitemaps visibles por propiedad | 1 `PUT` por sitemap y host. Idempotente |
| Search Console URL Inspection API | **2.000/día y 600/min por propiedad** | Solo muestreo de control: máx. **50 URLs por host**, 1 consulta/s |
| Search Analytics API | 1.200/min por sitio | Solo lectura, para el reporte |

**Prohibiciones expresas**

- No repartir envíos entre varios proyectos de Google Cloud ni varias cuentas de Bing para
  esquivar cuotas: es motivo de revocación de acceso.
- No usar proxies, rotadores de IP ni servicios de "indexación instantánea" de terceros.
- No enviar URLs `http://`, con `www`, con mayúsculas, con parámetros de tracking
  (`?utm_`, `?fbclid`, `?gclid`) ni con fragmento `#`.
- No enviar la misma URL dos veces en el mismo día ni en 24 h.

**Si un proveedor responde cuota agotada:** escribe lo pendiente en `pendientes-<canal>.txt`,
cierra limpio y deja el estado en el ledger. **No reintentes en bucle.**

---

## 4. Arquitectura por canal (por qué así)

- **Bing → URL Submission API, no IndexNow.** IndexNow exige servir un archivo de clave en la
  raíz de **cada** host; en GHL solo se controlan `robots.txt` y `llms.txt`, así que las 79
  propiedades no pueden verificarse por clave. La URL Submission API se autentica con
  `apikey` + `siteUrl` y es la vía viable. IndexNow se activa en fase 5 solo si el propietario
  aloja la clave en la raíz.
- **Google → Search Console API.** Google **no tiene API pública de "solicitar indexación" masiva**:
  el botón de la UI no existe en API. Lo que sí existe y se hace aquí: **enviar/reenviar el
  sitemap de cada propiedad** (`sitemaps.submit`) y **verificar** con URL Inspection. Todo lo demás
  es rastreo normal, enlaces internos y tiempo. No hay atajo y no se debe insinuar que lo hay.

---

## 5. Fase 0 — Inventario filtrado (bloqueante)

Genera `Ilatek/documentacion/indexacion/inventario-urls.json` con una entrada por URL:

```json
{ "url": "https://bayamon.ilatekpr.com/sellado-de-techos",
  "host": "bayamon.ilatekpr.com",
  "tier": 2, "sitemap": "ghl", "estado": "validada",
  "http": 200, "canonicalOk": true }
```

Procedimiento:

1. Descarga los sitemaps **en vivo** (nunca uses copias locales como fuente):
   `https://ilatekpr.com/sitemap.xml`, `https://comunidades.ilatekpr.com/sitemap.xml` y
   `https://<slug>.ilatekpr.com/sitemap.xml` para los 78 slugs.
2. Normaliza: `https` forzado, host en minúsculas, sin `/` final salvo raíz, sin query ni hash,
   sin duplicados (comparación por `href` normalizado).
3. **Filtros de exclusión** (descarta y anota el motivo):
   - ruta que contiene `{{custom_values.` o `{{`
   - `error-ilatek-404`, `404`, `/sitemap.xml`, `test_path`, `/dnf/`, `/portal/`
   - `-gracias`, `gracias-por-aplicar`, `/thank`
   - patrón `home-\d+` o cualquier ruta que termine en `-\d{4,}(-\d{4,})?`
   - host distinto de `*.ilatekpr.com`
4. **Verificación HTTP en vivo** de cada URL candidata: `HEAD` y, si falla, `GET`.
   Solo entra con **200**. 301/302 → sigue el destino y usa la URL final si es del mismo host;
   404/410/5xx → `"estado": "descartada"` con motivo.
5. **Canonical:** 200 y `<link rel="canonical">` apuntando a sí misma (o ausente). Si apunta a
   otra URL, se envía **la canónica**, no la original. Comprueba también que no haya
   `<meta name="robots" content="noindex">`.
6. Concurrencia de verificación: máximo **8** en paralelo, 1 reintento, timeout 20 s.

**Criterio de aceptación:** `inventario-urls.json` con totales por host y por motivo de descarte,
y `resumen-inventario.md` con esta tabla rellena con cifras reales (no con las estimadas de §1):

| Host | Listadas | Válidas | Descartadas | Motivos |
|---|---|---|---|---|

---

## 6. Fase 1 — Bing (Bulk URL Submission API)

Script a crear: `scripts/indexacion/bing-bulk.mjs` (Node ≥18, sin dependencias).

**Endpoints**

```
GET  https://ssl.bing.com/webmaster/api.svc/json/GetUrlSubmissionQuota?apikey=$BING_API_KEY&siteUrl=https://<host>
POST https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=$BING_API_KEY
     Content-Type: application/json; charset=utf-8
     { "siteUrl": "https://<host>", "urlList": ["https://<host>/a", "https://<host>/b"] }
```

**Reglas del script**

- Agrupa por `host`; **un host a la vez**, nunca en paralelo entre hosts.
- Lotes de **≤500** URLs (objetivo 250–400 si el host tiene sitemap inestable).
- Antes de cada host: `GetUrlSubmissionQuota` → si `DailyQuota - DailyRemaining < urls del host`,
  no envíes ese host; anótalo como pendiente del día siguiente.
- Pausa de **2 s + jitter 0–500 ms** entre requests; `Retry-After` si viene cabecera.
- Reintentos: 429 y 5xx con backoff exponencial 1→2→4→8 s, **máximo 3**; nunca reintentar 400/403.
- `200` con `{"d":null}` = aceptado. Cualquier otra cosa = fila de error con `http` y cuerpo.
- Escritura incremental del ledger tras **cada** request (si el proceso muere, no se pierde nada).

**Ledger** `documentacion/indexacion/ledger-bing.csv`:
`fecha_utc,host,url,canal,estado,http,error,lote_id`

**Orden de envío (prioridad si el cupo aprieta):**

1. `ilatekpr.com` — 47 URLs (1 lote).
2. Los 78 municipios, alfabético — ~50 válidas cada uno, **1 lote por host**.
3. `comunidades.ilatekpr.com` — ~1.112 URLs, 3 lotes.

Con 10.000/día por dominio, **todo el proyecto cabe en una sola pasada**. No obstante mantén el
pacing: parece tráfico legítimo, y uno masivo sin pausa es el que se bloquea.

`--dry-run` obligatorio antes del envío real: imprime host, lotes, URLs y cuota consultada,
y no hace ni un `POST`.

**Criterio de aceptación:** cada host con `estado=ok` para el 100 % de sus válidas, o pendiente
declarado por cuota en `pendientes-bing.txt`. Cero `403`.

**Operación diaria:** `node scripts/indexacion/lote-diario.mjs --yes` consume `pendientes-bing.txt`
(nunca el inventario completo, para no reenviar lo ya aceptado), consulta la cuota restante de cada
host, envía lo que cabe y mueve lo aceptado a `enviadas-bing.txt`. Deja reporte en
`documentacion/indexacion/diario/<fecha>.md`. Instrucciones y requisitos en
[GOAL-LOTE-DIARIO.md](indexacion/GOAL-LOTE-DIARIO.md).

---

## 7. Fase 2 — Google Search Console (sitemaps)

Script a crear: `scripts/indexacion/gsc-sitemaps.mjs` con `google-auth-library`
(ya instalada en `scripts/google-indexing/node_modules`).

```
PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl codificado}/sitemaps/{feedpath codificado}
```

- Primero `GET /sites` para listar propiedades y comprobar `permissionLevel` (`siteOwner` /
  `siteFullUser`). Sin permiso → reporta y salta.
- Envía **el sitemap de cada host**, no uno global:
  `https://ilatekpr.com/sitemap.xml`, `https://<slug>.ilatekpr.com/sitemap.xml` ×78,
  `https://comunidades.ilatekpr.com/sitemap.xml`.
- Con propiedad de dominio (`sc-domain:ilatekpr.com`) el `PUT` debe ser aceptado para subdominios.
  Si Google responde 400/403, añade la propiedad URL-prefix `https://<host>/` (`sites.add`) y
  reintenta ese host una sola vez.
- Reenviar un sitemap es idempotente: hazlo también cuando cambien páginas
  (`ACTIVACION-SITEMAPS.md` §"Cuándo hay que regenerarlo").
- Pausa 1 s entre `PUT`. Después de cada uno, `GET .../sitemaps/{feedpath}` y guarda
  `isPending`, `isSitemapsIndex`, `warnings`, `errors`, `lastDownloaded`.

**Criterio de aceptación:** 80/80 hosts con sitemap aceptado (o excepción documentada con el
código HTTP exacto), y 0 `errors` de parseo en el `GET` de verificación.

---

## 8. Fase 3 — Google: verificación de cobertura (no es envío)

1. **URL Inspection API** (`POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`),
   con `inspectionUrl` + `siteUrl`, muestreo de **máximo 50 URLs por host**, 1/s.
   Guarda `indexStatusResult.verdict`, `coverageState` y `lastCrawlTime`.
   Lectura honesta: `verdict=NEUTRAL` o `coverageState="URL is unknown to Google"` a las 24 h es
   normal en dominios nuevos; **no** justifica reenviar ni "forzar".
2. **Search Analytics** (`POST /searchAnalytics/query`, 1.200/min) para el reporte de impresiones
   por host de los últimos 28 días.
3. Si tras 7 días un host sigue con 0 URLs descubiertas: revisa `robots.txt`, canonical y que el
   sitemap esté enlazado. No lances más envíos desde Bing.

---

## 9. Fase 4 — Reporte

`documentacion/indexacion/REPORTE-<YYYY-MM-DD>.md` con:

| Canal | Hosts | URLs válidas | Aceptadas | Errores | Pendientes |
|---|---|---|---|---|---|
| Bing URL Submission | | | | | |
| GSC Sitemaps | | | | | |
| GSC Inspección (muestra) | | | | — | — |

Más: 10 primeras filas de error tipificadas, cuota restante por proveedor al cerrar, y la lista de
URLs descartadas por motivo. **Cero cifras estimadas: todo del ledger.**

---

## 10. Fase 5 — IndexNow (opcional, requiere acción del propietario)

Solo si el propietario puede publicar un archivo de clave en la raíz de cada host
(`https://<host>/<INDEXNOW_KEY>.txt` con el valor de la clave dentro):

```
POST https://api.indexnow.org/indexnow
{ "host": "<host>", "key": "<INDEXNOW_KEY>",
  "keyLocation": "https://<host>/<INDEXNOW_KEY>.txt",
  "urlList": ["https://<host>/a", "..."] }
```

Máximo 10.000 por request; `200`/`202` = aceptado; 403 = clave no verificada; 429 = frenar.
No sustituye a la fase 1: es un extra multi-motor (Bing, Yandex, Seznam, Naver).
Si la clave no se puede alojar, **declara la fase no aplicable** y sigue.

---

## 11. Definición de terminado (checklist)

- [ ] `inventario-urls.json` generado desde sitemaps **en vivo**, con verificación HTTP 200.
- [ ] `ledger-bing.csv` cubre el 100 % de las válidas, o `pendientes-bing.txt` justificado.
- [ ] `GET GetUrlSubmissionQuota` final registrado por host: nunca negativo ni forzado.
- [ ] Ninguna URL enviada dos veces en 24 h (verificable en el ledger).
- [ ] 80/80 sitemaps en Search Console aceptados, con su `GET` de verificación.
- [ ] Cero uso de la Indexing API para landings.
- [ ] `REPORTE-<fecha>.md` con cifras del ledger.
- [ ] Ningún secreto en el repo, en logs ni en el reporte.

---

## 12. Bloqueos conocidos que debes reportar, no sortear

1. **Blog sin publicar** — fuera de alcance por instrucción del propietario (6 nov 2026). `/blog`
   da 404 y sus 118 URLs no se envían a ningún buscador.
2. **`comunidades.ilatekpr.com/sitemap.xml` sirve un `<urlset>` vacío.** El mismo host responde
   `robots.txt` con **0 bytes** y la raíz con 404. Son los campos del dominio en GHL vacíos y el
   xml-sitemap guardado sin páginas seleccionadas. El sitemap corregido (967 URLs vivas) está en
   `documentacion/indexacion/sitemap-comunidades.xml`, pendiente de publicar vía GHL.
3. **Los 78 subdominios municipales quedan fuera**: su canonical apunta a `ilatekpr.com/<ruta>`,
   así que Google no los trataría como páginas propias.
4. **PIT de GHL vencido** — `GET /funnels/domain/` responde **401**, y el servidor MCP de GHL no
   expone herramientas de funnels/dominios. Sin PIT vigente no se regenera el xml-sitemap ni se
   escribe `robotsTxtCode`.
5. **Cuenta de servicio sin permiso de Propietario** en Search Console → `403 PERMISSION_DENIED`.
6. **Sin `GOOGLE_APPLICATION_CREDENTIALS`** no hay fase 2 posible: `gsc-sitemaps.mjs` sale con
   código 2 y no envía nada.
7. **IndexNow no aplica**: la clave no está publicada en la raíz de ningún host (404 en los tres
   comprobados) y GHL no permite servir archivos sueltos en la raíz.

---

## 13. Estilo de trabajo

- Un host a la vez, un canal a la vez, ledger siempre.
- `--dry-run` antes de todo envío real; resume el plan en 10 líneas antes de ejecutar.
- Nada de `--yes` a ciegas ni de bucles de reintento infinitos.
- Si algo no cuadra (404 masivos, cuota rara, host sin permiso): **para ese host**, documenta y
  continúa con el siguiente. No abortes el lote entero por un municipio.
- Al cerrar: números reales, bloqueos explícitos y qué haría falta para desbloquearlos.
