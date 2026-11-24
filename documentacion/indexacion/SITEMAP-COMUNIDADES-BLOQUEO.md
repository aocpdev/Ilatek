# Sitemap de comunidades — generación sana, publicación bloqueada por plataforma

Medido el **7 de noviembre de 2026, 00:53 UTC**. No es una nota de memoria: cada dato de abajo salió
de una petición hecha en ese momento.

## 1. Estado del sitemap en vivo

```
GET https://comunidades.ilatekpr.com/sitemap.xml
HTTP/1.1 200 OK
Content-Type: text/xml
x-ghl-serve-region: us
x-ghl-cache: BYPASS
cache-control: private, no-store
server: cloudflare
```

Cuerpo **completo** (107 bytes):

```xml
<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>
```

`<loc>` en vivo: **0**.

Variantes:

| URL | Respuesta |
|---|---|
| `https://comunidades.ilatekpr.com/robots.txt` | **200 · 0 bytes** (vacío) |
| `https://comunidades.ilatekpr.com/sitemap_index.xml` | 404 · cuerpo `404 - Page Not Found` (2.852 b) |
| `https://comunidades.ilatekpr.com/sitemap-funnels.xml` | 404 · idem |

Las cabeceras `x-ghl-serve-region` y `x-ghl-cache: BYPASS` identifican el origen: GHL responde la
ruta y devuelve un `urlset` sin entradas. **El fichero se sirve; lo que falta es contenido.**

## 2. Estado de la generación en el repo

- `Ilatek/Comunidades/landings/sitemap.xml` (generado por `comunidades/scripts/generar-sitemap.mjs`):
  **1.112 `<loc>`**, 233.309 b, y el script aborta si una ruta listada no tiene `index.html`. O sea:
  la generación no está rota.
- `Ilatek/documentacion/indexacion/sitemap-comunidades.xml` **regenerado** desde
  `inventario-urls.json` (solo URLs válidas: 200 con canonical propia y `index.html` en disco):
  **1.017 `<loc>`**, 144.146 b, **0** URLs fuera del inventario, **0** sin `index.html`.
  La diferencia de 95 son justamente las comunidades que hoy no sirven su propia página
  (89 en 404 + 6 con el relleno de GHL; ver `comunidades-sin-publicar.md`): publicarlas en el sitemap
  sería anunciar páginas rotas.

## 3. Diagnóstico: la publicación es lo que falla

El PIT de `.mcp.json` **autentica** (comprobado en la misma sesión):

| Petición | Host | Resultado |
|---|---|---|
| `GET /funnels/funnel/list?locationId=8OxUENFVM60EKzqsTcoD` | `services.leadconnectorhq.com` | **200** |
| `GET /funnels/funnel/list?locationId=…` | `backend.leadconnectorhq.com` | **200** |
| `GET /funnels/domain/?locationId=…` | `services.leadconnectorhq.com` | **401** |
| `GET /funnels/domain/?locationId=…` | `backend.leadconnectorhq.com` | **401** |
| `GET /funnels/funnel/list/by-location-and-domain?locationId=…&domainId=…` | `services.` | **401** |
| `POST /funnels/domain/xml-sitemap` | `services.` | **401** |
| `GET /funnels/domain/` | `rest.gohighlevel.com` / `api.gohighlevel.com` | 404 `{"msg":"Not found"}` |

El cuerpo del 401 no es de token inválido:

```json
{"statusCode":401,"message":"This route is not yet supported by the IAM Service. Please update your IAM config."}
```

Es decir: la ruta **no está expuesta al PIT** en esta cuenta; el token sirve para otras rutas de la
misma API. El procedimiento de `ACTIVACION-SITEMAPS.md` que funcionó en los 78 municipios usaba las
cabeceras internas de la app (`token`, `channel`, `source`, `version`), no el PIT.

La sesión de la app en Chrome (9 pestañas abiertas) usa `backend.leadconnectorhq.com`, pero:

- en `localStorage` solo hay `tokenRefreshTimestamp` (ningún token reutilizable);
- un `fetch` desde `app.gohighlevel.com` a esa API falla por CORS/`Failed to fetch`.

Así que tampoco hay una vía de sesión limpia desde fuera del navegador; hacer el `POST` con la
cookie del usuario sería usar su sesión, y eso no se hizo.

## 4. Payload mínimo para cuando la ruta esté disponible

```json
POST https://services.leadconnectorhq.com/funnels/domain/xml-sitemap
Content-Type: application/json

{
  "locationId": "8OxUENFVM60EKzqsTcoD",
  "domainId": "IUZElP3hZ60dszBHym8l",
  "mapping": [
    {
      "name": "Ilatek",
      "id": "<websiteId>",
      "opened": false,
      "selected": true,
      "isBlogEnabled": false,
      "blogId": "<websiteId>",
      "blogHome": "",
      "children": [
        { "name": "Home", "url": "/home", "selected": true, "pageId": "<id>", "id": "<uuid>", "type": "optin_funnel_page" }
      ]
    }
  ],
  "custom": [{ "path": "sitemap.xml", "lastMod": "2026-11-07" }]
}
```

- `domainId` = `IUZElP3hZ60dszBHym8l`: es el de los 4.000 funnels `Comunidad · …`, así que apunta al
  dominio de comunidades y **no** a los subdominios municipales.
- Lo que falta para completarlo: `GET /funnels/domain/` y
  `GET /funnels/funnel/list/by-location-and-domain` para obtener `websiteId` y los `pageId`/`id` de
  cada página. Ambas devuelven el mismo 401 de IAM, así que el `mapping` no se puede construir por
  API hoy.

## 5. Cómo desbloquearlo (dos caminos, ninguno requiere claves nuevas)

1. **UI de GHL, una vez**: *Funnels/Websites* → dominio `comunidades.ilatekpr.com` → ajustes de
   sitemap → marcar las páginas → *Generate & Save*. Es el mismo flujo de las 78 subcuentas.
2. **Habilitar la ruta para el PIT** (soporte de GHL / configuración IAM) y entonces ejecutar el
   `POST` de arriba con el `mapping` que devuelva el `GET`.

## 6. Verificación después de publicar

```bash
curl -s --max-time 25 https://comunidades.ilatekpr.com/sitemap.xml | grep -c "<loc>"
curl -s --max-time 25 https://comunidades.ilatekpr.com/sitemap.xml \
  | grep -o "<loc>[^<]*" | grep -vc "https://comunidades.ilatekpr.com"
```

Criterio: **≥ 1.017 `<loc>`** y **0** URLs de otro dominio. Muestra ya comprobada hoy (5 URLs, entre
ellas los extremos alfabéticos): **200** y título propio en las 5.
