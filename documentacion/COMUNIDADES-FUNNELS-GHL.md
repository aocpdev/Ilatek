# Funnels por comunidad en `comunidades.ilatekpr.com`

Guía del build masivo, escrita a partir del **piloto Isla Verde (Carolina)**, ya
publicado y verificado. Sigue estos pasos tal cual para cada comunidad.

```
funnel  /<municipio>/<comunidad>
  página A  /<municipio>/<comunidad>/sellado-de-techo
  página B  /<municipio>/<comunidad>/limpieza
```

Piloto en producción:

```
https://comunidades.ilatekpr.com/carolina/isla-verde/sellado-de-techo
https://comunidades.ilatekpr.com/carolina/isla-verde/limpieza
```

## Reglas que no se negocian

1. **Un funnel por comunidad, con dos páginas hermanas (A y B).** GHL llama
   *steps* a las páginas, pero aquí **no forman una secuencia**: A y B son
   entradas directas e independientes. Nunca un funnel por servicio (serían
   1.112) y nunca dos servicios en la misma landing.
2. **El path que manda es el del builder**: `Pages → ⋯ → Edit → URL Path/Slug`.
   Ese valor es el que aparece en la barra superior del builder y el que GHL
   publica. El path del step en la config del funnel no basta: si no se toca el
   del builder, la página sale en la raíz (`/sellado-de-techo-491161`).
3. **Siempre la sección guardada `Embed Template`** como contenedor; lo único
   que cambia por página es el HTML dentro del bloque Custom Code.
4. **El HTML del embed se lee en UTF-8** (`open(..., encoding="utf-8")`). Leerlo
   con la codificación del sistema (cp1252 en Windows) mete mojibake:
   `TURÃ­STICO`, `Â·`, `â†'`. Ya pasó una vez; no debe repetirse.
5. **Favicon, tracking y chat widget se configuran una vez por funnel**, no por
   página. El head/body tracking arrastra también el Meta Pixel.
6. **La imagen social es un screenshot de la propia página publicada**
   (1200×630, sin scrollbar), subido a la Media Library.

## Fase 0 — Generar el payload (repo)

```bash
cd Ilatek/Comunidades

# Piloto / una sola comunidad
node scripts/preparar-funnel-ghl.mjs --only carolina/isla-verde --upload

# Lote completo (sube solo los assets que falten)
node scripts/preparar-funnel-ghl.mjs --all --upload

# Verifica estructura, canonical, JSON-LD y rutas relativas
node scripts/verificar-funnel-ghl.mjs --only carolina/isla-verde
```

Salidas:

| Ruta | Contenido |
|---|---|
| `data/ghl/funnels/<municipio>/<comunidad>.json` | `funnelName`, `funnelPath`, `pages[]` con `name`, `path`, `url`, `seo{title,description,image}`, `jsonLd` y `html`. |
| `data/ghl/preview/<municipio>/<comunidad>/<servicio>.html` | Vista previa autónoma del mismo fragmento. |
| `data/ghl/assets.json` | Manifiesto asset → URL de la Media Library con `sha256` (no resube). |
| `data/ghl/index.json` | Ledger de funnels y estado. |

**Filtro de comunidades:** solo se construyen las que tienen **hero propio
generado**. Las que siguen con la foto compartida por defecto se quedan fuera
del lote (`Comunidades/ledger.md` marca cuáles están `PROMOCIONADA`).

## Fase 1 — Crear el funnel

Sesión de GHL abierta en el Chrome del propietario (`--remote-debugging-port=9222`).
La API pública v2 **no crea funnels ni páginas**: solo lista y gestiona redirects.
Todo el alta es por UI; Playwright solo acelera los clics.

1. Sites → Funnels → **New Funnel** → *Build from scratch*.
2. Nombre: `Comunidad · <Comunidad> (<Municipio>)`.
3. Funnel path: `<municipio>/<comunidad>` · Dominio: `comunidades.ilatekpr.com`.
4. Página 1 → nombre `Sellado de techo` (A). Página 2 → nombre `Limpieza` (B).
5. En el builder, insertar la sección guardada **`Embed Template`**
   (panel `+` → Saved Assets → Section Templates). Es la única sección de la
   página: define el ancho completo y el contenedor del embed.

## Fase 2 — Path anidado de cada página

Para **cada** página (A y B):

1. `Pages` (dropdown del toolbar) → `⋯` de la página → **Edit**.
2. `URL Path/Slug`:
   - A → `/carolina/isla-verde/sellado-de-techo`
   - B → `/carolina/isla-verde/limpieza`
3. **Update page** y comprobar la barra superior del builder:
   `https://comunidades.ilatekpr.com/<municipio>/<comunidad>/<servicio>`.
   Si no aparece la ruta anidada ahí, está mal: repetir el paso.

Atajo que funciona y ahorra errores: **clonar la página A** (`Pages → ⋯ → Clone
→ Clone to this Funnel`), renombrarla a `Limpieza`, cambiarle el path y
reemplazar solo el código del embed. Así hereda sección, ancho y ajustes.

Si sobra una página vacía, `⋯ → Delete` pide escribir `DELETE` en el campo de
confirmación antes de habilitar el botón.

## Fase 3 — Inyectar el embed

1. Clic en **Custom HTML/JavaScript** dentro del canvas.
2. Panel derecho → **Open Code Editor**.
3. Clic dentro del editor → `Ctrl+A` → pegar el HTML de `pages[n].html`
   (insertar de una vez, sin teclear).
4. **Save** y luego **Publish**.

El fragmento ya trae `<style>`, `<main>`, footer y el script de revelado; las
imágenes apuntan a `assets.cdn.filesafe.space`.

## Fase 4 — Favicon, tracking y chat (una vez por funnel)

Botón de ajustes del funnel (engranaje del toolbar derecho):

- **Favicon**: `https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ab044d04091fa65e69921f6.png`
- **Head tracking** y **Body tracking**:
  `documentacion/activacion-municipios/tracking-head.html` y
  `.../tracking-body.html` (GTM `GTM-PQMR2TDB`, GA4 `G-BTVFHT1X8G` y **Meta
  Pixel `2092249571384387`**, que viaja en el head tracking del funnel).
- **Chat widget**: seleccionar el widget **Ilatek**
  (`chatWidgetId 6acd30f2114cfe74b0732225`, “isChatWidgetLive” activo).

Los embeds **no** llevan el Pixel: va en el head del funnel, así se carga una
sola vez por página y no se duplica.

## Fase 5 — SEO y imagen social

Botón **SEO & AI search optimization**:

1. **Content** → `Title` y `Description` desde `pages[n].seo`.
2. **Images** → pegar la URL de la imagen social.

La imagen social se genera así (screenshot real de la página ya publicada):

```python
pg.set_viewport_size({"width": 1200, "height": 630})
pg.goto(url, wait_until="load")
pg.add_style_tag(content=(
    "html{scrollbar-width:none!important}"
    "body{overflow:hidden!important}"
    "::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}"
))
pg.screenshot(path=f"screenshots/og-{slug}.png")   # 1200×630, sin scrollbar
```

Luego se sube a la Media Library:

```bash
curl -s -X POST "https://services.leadconnectorhq.com/medias/upload-file" \
  -H "Authorization: Bearer $GHL_PIT" -H "Version: 2021-07-28" \
  -F "file=@screenshots/og-<slug>.png;type=image/png" \
  -F "locationId=8OxUENFVM60EKzqsTcoD"
```

y se pega la URL que devuelve en **Images**.

## Fase 6 — Publicar

`Publish` en el builder de **cada** página. No hay publicación por funnel: cada
página se publica por separado. Después del publish, GHL tarda unos segundos (y
a veces cachea) en refrescar `title` y `og:image`.

## Verificación (obligatoria antes de pasar a la siguiente)

```bash
for p in "/<municipio>/<comunidad>/sellado-de-techo" "/<municipio>/<comunidad>/limpieza"; do
  curl -s "https://comunidades.ilatekpr.com$p" -o .tmp/p.html
  echo "$p bytes=$(wc -c < .tmp/p.html) mojibake=$(grep -o 'Ã' .tmp/p.html | wc -l)"
done
```

| Comprobación | Criterio |
|---|---|
| Rutas | 200 en A y B; la barra del builder muestra la ruta anidada |
| Contenido | `<h1>` propio de la comunidad y servicio; tamaño ≫ shell vacío (~142 KB vs ~58 KB) |
| Codificación | **0** ocurrencias de `Ã` / `Â` / `â€`; acentos y `·`, `→` correctos |
| SEO | `<title>`, `meta description`, `og:title` y `og:image` con el screenshot |
| Tracking | `GTM-PQMR2TDB` presente, `fbq(` presente, favicon presente, `chat-widget` presente |
| Assets | Imágenes desde `assets.cdn.filesafe.space` |
| Raíz | `/<municipio>/<comunidad>` sirve la página A (red de seguridad, sin hub) |
| Logs | Sin errores de consola ni 404 de assets |

## Lote

- Orden: **68 LUXURY → 86 HIGH → 402 MEDIUM**, filtrando por hero propio.
- Lotes de 5–10 comunidades: crear, publicar dos páginas y verificar antes de
  seguir.
- Idempotencia: consultar la lista de funnels de la location
  (`GET /funnels/funnel/list`) y saltar el `funnelPath` que ya exista.
- `data/ghl/index.json` es el ledger: `pendiente` → `creado` → `publicado`.

## Pitfalls ya pagados

- **Path raíz por defecto.** Al crear la página, GHL le pone un slug aleatorio
  (`sellado-de-techo-491161`) y la publica en la raíz. Se corrige en
  `Edit → URL Path/Slug`; el path del step en la config no lo arregla.
- **Mojibake.** Leer el payload sin `encoding="utf-8"` corrompe acentos y
  símbolos (`TURÃ­STICO`, `Agenda tu limpieza â†'`). Reinyectar con UTF-8.
- **Página vacía.** Un `Custom Code` recién insertado no tiene código: si se
  publica sin pegar el HTML, la URL responde 200 pero sin contenido (~58 KB).
- **Doble sección.** Insertar `Embed Template` dos veces duplica el embed.
  Comprobar que el canvas tenga una sola sección antes de publicar.
- **Delete.** El botón solo se habilita al escribir `DELETE` en el diálogo.
- **Cache.** Tras cambiar el SEO, `og:image` puede tardar en refrescar.

## Estado actual (2026-10-31)

- [x] Adaptador (`preparar-funnel-ghl.mjs`) y verificador.
- [x] Barrido de las **1.112 landings**: UTF-8 válido, sin mojibake; único
      carácter no-ASCII fuera de acentos es `©` en el footer.
- [x] Piloto **Isla Verde (Carolina)** publicado y verificado:
      - A `/carolina/isla-verde/sellado-de-techo`
      - B `/carolina/isla-verde/limpieza`
      - Favicon, GTM/GA4/Meta Pixel, chat widget Ilatek y SEO con screenshot
        1200×630 sin scrollbar.
- [ ] Lote LUXURY → HIGH → MEDIUM.
