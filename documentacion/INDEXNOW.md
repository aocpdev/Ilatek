# IndexNow — qué falta para activarlo y cómo

Estado al **6 de noviembre de 2026**: script listo, envío **bloqueado por un solo archivo**.

## 1. Por qué conviene

La cola de Bing tiene **867 URLs de `comunidades.ilatekpr.com`**. Por la URL Submission API de
Bing, a 100/día, son **9 días**. Por IndexNow, que acepta **10.000 URLs por request**, es **un
solo POST**.

IndexNow lo consumen Bing, Yandex, Seznam y Naver. **Google no participa**: para Google sigue
mandando el sitemap y el rastreo normal.

## 2. El único bloqueo: servir la clave en la raíz del host

La clave ya existe en `Ilatek/.tmp-keys/indexnow.key` (32 caracteres hex, formato válido:
`[A-Za-z0-9-]{8,128}`). Lo que falta es que el host la sirva:

```
https://comunidades.ilatekpr.com/<clave>.txt   →  200, text/plain, contenido = la clave
```

Hoy responde **404** (comprobado). El protocolo admite dos formas de verificar la propiedad:

| Opción | Dónde va el archivo | Cuándo usarla |
|---|---|---|
| **1 (recomendada)** | raíz del host: `/<clave>.txt` | cubre todas las URLs del host |
| 2 (`keyLocation`) | cualquier carpeta del mismo host | **solo cubre URLs en o bajo esa carpeta**; con nuestras rutas (`/<municipio>/<comunidad>/…`) obliga a la raíz igual |

No hay verificación por DNS: son archivo en la raíz o `keyLocation`. Y el archivo debe seguir
siendo accesible **siempre**, no solo al enviar.

### Comprobación exacta (la misma que hace el script)

```bash
K=$(cat Ilatek/.tmp-keys/indexnow.key)
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "https://comunidades.ilatekpr.com/$K.txt"
curl -s "https://comunidades.ilatekpr.com/$K.txt"   # debe imprimir exactamente la clave
```

Si eso no da `200` con la clave dentro, **no envíes**: sería un `403`.

## 3. Cómo publicar el archivo en los hosts de GHL

`comunidades.ilatekpr.com` (y los 78 municipios) son dominios de funnels de GHL, y GHL **no
sirve archivos sueltos en la raíz**. Tres caminos, de menor a mayor riesgo:

### A · Página de funnel con ruta `<clave>.txt` (probar primero, riesgo bajo)

1. En el funnel `Ilatek`, añade un paso nuevo con **Custom Path** = `<clave>.txt`
   (la clave, punto, `txt`).
2. Contenido del paso: una sola línea de texto con la clave, sin nada más.
3. Publica y comprueba con el `curl` de arriba.

IndexNow solo exige que la clave aparezca en el contenido servido, no un `Content-Type`
concreto, así que un `text/html` con la clave dentro suele pasar la verificación. Si GHL rechaza
el punto en la ruta, este camino no sirve: pasa al B.

**Coste:** un paso de funnel sin enlaces, no toca ninguna landing publicada.

Si GHL no admite el punto en la ruta, la alternativa realista es pedir a **soporte de GHL** que
sirva ese archivo en la raíz del dominio, o mover el dominio a un hosting donde se pueda publicar
un archivo suelto. Las 867 URLs viven todas en `comunidades.ilatekpr.com`, así que **un solo
archivo desbloquea toda la cola**.

### B · Cloudflare Worker — descartado con el DNS actual (medido el 6 nov)

```
comunidades.ilatekpr.com → CNAME sites.ludicrous.cloud  (hosting de funnels de GHL)
ilatekpr.com (NS)        → ns19/ns20.domaincontrol.com  (GoDaddy, sin Cloudflare)
```

Un Worker en `/<clave>.txt` obligaría a mover el DNS a Cloudflare y poner el subdominio en proxy:
cambia el camino TLS de un sitio publicado y arriesga la verificación de dominio de GHL. No vale
la pena por un archivo; si algún día se migra el DNS, el Worker son tres líneas e intercepta solo
esa ruta.

### C · Solo el dominio propio (`ilatekpr.com`)

Si `ilatekpr.com` se sirve desde un hosting propio, ahí el archivo es trivial. Pero su cola de
Bing está a cero (38 URLs ya aceptadas), así que **no desbloquea las 867**: sirve solo para
futuras URLs del dominio principal.

## 4. Uso del script

```bash
# plan + verificación de clave (no envía)
node scripts/indexacion/indexnow.mjs

# envío real de toda la cola
node scripts/indexacion/indexnow.mjs --yes

# un host, o un máximo de URLs
node scripts/indexacion/indexnow.mjs --host=comunidades.ilatekpr.com --max=200 --yes

# clave en una ruta no raíz (opción 2)
node scripts/indexacion/indexnow.mjs --keylocation=https://comunidades.ilatekpr.com/keys/<clave>.txt --yes
```

Qué hace:

- Lee la cola `pendientes-bing.txt` y agrupa por host.
- **Verifica la clave en vivo antes de enviar**; si no está, marca el host `bloqueado` en el
  ledger, no envía y sale con código **2**.
- POST a `https://api.indexnow.org/indexnow` con `host`, `key`, `urlList` (y `keyLocation` si se
  pasó). Reintentos con backoff en `429` y `5xx`.
- `200` y `202` cuentan como aceptado (`202` = validación de clave pendiente).
- Lo aceptado pasa a `enviadas-bing.txt` y **sale de la cola**, para que el lote diario de Bing no
  gaste cuota repitiéndolo.
- Escribe `ledger-indexnow.csv` (incremental) y `diario/<fecha>-indexnow.md`.

## 5. Diagnóstico

| Respuesta | Significa | Qué hacer |
|---|---|---|
| `200` / `202` | aceptado | nada; `202` es normal la primera vez |
| `400` | JSON mal formado | revisa `host`, `key` y que `urlList` sea un array de URLs absolutas |
| `403` | clave no verificada | el `curl` da 404, contenido distinto o el archivo dejó de servirse |
| `422` | URL de otro host o clave mal formada | no mezcles hosts en un POST; clave `[A-Za-z0-9-]{8,128}` |
| `429` | demasiados envíos | el script ya reintenta con backoff; baja `--lote` o espera |

## 6. Lo que IndexNow no arregla

- **No sustituye al sitemap**: `comunidades.ilatekpr.com/sitemap.xml` sigue vacío y `robots.txt`
  con 0 bytes. Eso se arregla publicando el sitemap por GHL.
- **No hace que Google indexe**: Google no usa IndexNow.
- **No arregla las 145 comunidades en 404**: notificar una URL que no existe no la crea.
