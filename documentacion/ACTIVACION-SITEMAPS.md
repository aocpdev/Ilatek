# Activación del `sitemap.xml` por municipio

Procedimiento verificado el **30 de octubre de 2026** en las 78 subcuentas: las 78 sirven su
sitemap con **61 URLs** propias. Antes de esto, 76 de 78 respondían **200 con 0 bytes**.

Esto completa el paso 5 de [activación de dominio y fields](ACTIVACION-DOMINIOS-Y-FIELDS.md).

## Lo primero: no se genera solo

El sitemap **no aparece por conectar el dominio ni por publicar el sitio**. La documentación
oficial de HighLevel lo describe como un objeto que se crea a mano una vez por dominio:

> «Once clicked, you will be brought the Connected Products page for that domain. Next to the
> desired asset, click the 3 dots icon. […] One of these actions is labeled "XML Sitemap". […]
> Once you are satisfied with your XML sitemap, click the "Generate & Save" button.»
> — [XML Sitemaps, HighLevel Support](https://help.gohighlevel.com/support/solutions/articles/48001182524-xml-sitemaps)

De ahí el síntoma que despista: `https://<slug>.ilatekpr.com/sitemap.xml` responde **200 con
0 bytes**. No es un fallo, es un dominio al que nunca se le creó el sitemap. En el objeto del
dominio se ve como `xmlMappingPath` y `xmlMappingUrl` en `null`; cuando existe, apuntan a
`location/<loc>/domain/<domId>/xml-json`.

## Requisitos

| Requisito | Dónde |
|---|---|
| Dominio conectado con `Connected Products: Website` | paso 2 de la guía de activación |
| Páginas del Website publicadas y con `Ilatek / Home` | paso 4 |
| Sesión de GHL en el navegador (solo para la vía API) | Chrome con puerto de depuración |

## Procedimiento en la interfaz

1. **Settings → Domains & URL Redirects → Domains.**
2. En el dominio padre (`ilatekpr.com`), **Manage**.
3. En la fila del subdominio, el **menú de tres puntos** (el botón pequeño a la derecha de
   `1 Website`). Se abre con `XML Sitemap`, `Edit`, `Delete`.
4. **XML Sitemap** abre el asistente en dos pasos.
5. Paso 1 — *Select the funnels you want to add to XML sitemap*: **marcar la casilla del funnel
   `Ilatek`**. Al marcarla se despliegan sus 60 páginas y quedan todas seleccionadas.
6. **Proceed**.
7. Paso 2 — *Custom XML sitemap*: **Add new** y en **Custom Path** escribir `sitemap.xml`.
8. **Generate & Save**. El aviso confirma:
   `You have now created XML Site for this domain […] https://<slug>.ilatekpr.com/sitemap.xml`.

### Dos trampas que cuestan un sitemap malo

**Custom Path viene con `test_path?item=123` escrito como valor**, no como placeholder. Si se
guarda sin cambiarlo, el sitemap se publica con esa ruta basura y una sola URL —así salió el
primer intento en Yauco:

```xml
<url><loc>https://yauco.ilatekpr.com/test_path?item=123</loc><lastmod>2026-10-30</lastmod></url>
```

**Hacer clic en el nombre del funnel solo despliega el acordeón.** Las casillas siguen en
`aria-checked="false"` y el sitemap sale vacío. Hay que marcar la casilla, que es la que arrastra
las 60 páginas.

Si ya se guardó mal: en el paso 2, tres puntos de la fila → **Edit** → corregir la ruta →
**Generate & Save** (o **Delete** y crearlo de nuevo).

## Procedimiento por API

Es la vía usada en los 78 (segundos por municipio, sin depender de la UI). Las cabeceras
—`token`, `channel`, `source`, `version`— se copian de cualquier petición que haga la propia app;
no hay que inventarlas ni pedir credenciales nuevas.

```
GET  /funnels/domain/?locationId=<loc>
     → domains[]: elegir el que tenga url == "<slug>.ilatekpr.com" y quedarse con su id (domainId)

GET  /funnels/funnel/list/by-location-and-domain?locationId=<loc>&domainId=<domainId>
     → funnels[]: ya viene con la forma exacta del mapping

POST /funnels/domain/xml-sitemap
```

Cuerpo del `POST`:

```json
{
  "locationId": "<loc>",
  "domainId": "<domainId>",
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
        {
          "name": "Home",
          "url": "/home",
          "selected": true,
          "pageId": "<id de la página>",
          "id": "<uuid de la página>",
          "type": "optin_funnel_page"
        }
      ]
    }
  ],
  "custom": [{ "path": "sitemap.xml", "lastMod": "2026-10-30" }]
}
```

Reglas del cuerpo:

- `mapping` es **tal cual** lo devuelve el `GET`, con dos cambios: `selected: true` en el funnel y
  `selected: true` en cada hijo. El resto de campos se deja como venga.
- `custom[0].path` debe ser `sitemap.xml`; `lastMod` es la fecha del día (`YYYY-MM-DD`).
- Respuesta: **201** con el XML ya generado. No hace falta volver a la UI.

## Verificar

```bash
s=yauco
curl -s --max-time 25 https://$s.ilatekpr.com/sitemap.xml | grep -c "<loc>"
curl -s --max-time 25 https://$s.ilatekpr.com/sitemap.xml | grep -o "<loc>[^<]*" | grep -vc "https://$s.ilatekpr.com"
```

| Comprobación | Criterio |
|---|---|
| HTTP | **200** |
| URLs | **61** (`<loc>`), con `Home` incluido |
| Dominio | la segunda orden devuelve **0**: ninguna URL apunta a otro subdominio |
| Latencia | el contenido aparece en menos de un minuto tras el `POST` |

## Resultado del 30 de octubre de 2026

| Dato | Valor |
|---|---|
| Subcuentas activadas | **78/78** |
| Respuesta del `POST` | **201** en las 78 |
| URLs por sitemap | **61** en las 78 (mín. 61, máx. 61) |
| Sitemaps válidos y con URLs propias | **78/78** |

Detalle por municipio en [activacion-municipios/sitemaps-78.json](activacion-municipios/sitemaps-78.json)
y [activacion-municipios/verificacion-78.json](activacion-municipios/verificacion-78.json).

## Cuándo hay que regenerarlo

- Cuando se **añaden páginas nuevas** al Website (no entran solas al sitemap).
- Cuando se **quita una página** y no debe seguir listada.
- Cuando cambia el **Custom Path**.

Se repite el mismo `POST` con el `mapping` fresco: es idempotente, reemplaza el sitemap del
dominio. Si además se cambió la ruta, conviene reenviar el sitemap a Google Search Console.
