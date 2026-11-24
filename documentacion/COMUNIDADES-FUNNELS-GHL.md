# Funnels por comunidad en `comunidades.ilatekpr.com`

Runbook del build masivo. Modelo corregido: **dos funnels por comunidad, uno por
servicio, con una sola página cada uno**. No son dos *steps* del mismo funnel.

```text
Comunidad · <Comunidad> (<Municipio>) · Techos
  página  /<municipio>/<comunidad>/sellado-de-techo

Comunidad · <Comunidad> (<Municipio>) · Limpieza
  página  /<municipio>/<comunidad>/limpieza
```

Publicadas y verificadas hoy (las dos plantillas de revisión):

| Plantilla | Página | URL | Estado |
|---|---|---|---|
| `PLANTILLA · Techos` | Sellado de techo | `/plantilla/techos` | 200 · 147 KB · GTM + Pixel + favicon + chat |
| `PLANTILLA · Limpieza` | Limpieza | `/plantilla/limpieza` | 200 · 146 KB · GTM + Pixel + favicon + chat |

Piloto repuesto y verificado con el driver del lote (2026-10-31 23:01):

| Funnel | URL publicada | Estado |
|---|---|---|
| `Comunidad · Isla Verde (Carolina) · Techos` | `/carolina/isla-verde/sellado-de-techo` | 200 · 147 KB · gate OK |
| `Comunidad · Isla Verde (Carolina) · Limpieza` | `/carolina/isla-verde/limpieza` | 200 · 146 KB · gate OK |

Los paths quedaron exactos, sin números, y los dos viejos con sufijo
(`-246757`, `-811950`) responden **404**.

## 1. Modelo: dos funnels por comunidad

Cada servicio tiene **su propio funnel y su propia página**. Nada de una página
que mezcle techos y limpieza, y nada de una secuencia de steps.

- **2 funnels × 177 comunidades = 354 funnels.** Cada uno con una página.
- Las URLs públicas no cambian respecto al piloto: `/<municipio>/<comunidad>/sellado-de-techo`
  y `/<municipio>/<comunidad>/limpieza`.
- La URL publicada es **siempre** `/<municipio>/<comunidad>/<servicio>`, sin
  números ni sufijos.
- El **Path del funnel** es administrativo y **nunca puede ser igual al del
  step**: GHL lo trata como conflicto y le pega números al path publicado
  (medido: `/carolina/isla-verde/sellado-de-techo-811950`, `-246757`). Se usa
  `/<municipio>/<comunidad>-techos` y `/<municipio>/<comunidad>-limpieza`, que
  es determinista y no choca ni con el step ni entre los dos funnels.
  Medido: el domino sirve el **path del step tal cual**, sin anteponer el del
  funnel. Con funnel `/plantilla` + step `/plantilla/techos` la URL es
  `/plantilla/techos`; con step `/techos` era `/techos`. Por eso el path del
  step **siempre** se escribe completo (`/<municipio>/<comunidad>/<servicio>`).
- Se separan por campaña: cada funnel recibe el tráfico de su servicio.

## 2. La plantilla debe tener UNA página

Hay **dos plantillas**, una por servicio, cada una con **una sola página**. El
bulk no arranca hasta que existan las dos.

| | `PLANTILLA · Techos` | `PLANTILLA · Limpieza` |
|---|---|---|
| ID | `2batSdUruZigPSJaALiw` | `1EDEQjVlWjSUIo0clnX6` |
| Páginas | **1** (`Techos`) | **1** (`Limpieza`) |
| Path del funnel (administrativo) | `/plantilla` | `/plantilla` |
| Path del step = URL | `/plantilla/techos` | `/plantilla/limpieza` |
| Chat widget | `Ilatek` | `Ilatek` |
| Dominio | `comunidades.ilatekpr.com` (`domainId` `IUZElP3hZ60dszBHym8l`) | igual |
| Favicon, head, body | puestos y releídos | puestos y releídos |

Estados:

- [x] `PLANTILLA · Techos` creada (clon de Isla Verde + poda de la página de
      limpieza).
- [x] `PLANTILLA · Limpieza` creada (clon de la de techos, página renombrada y
      con su path).
- [x] Ambas con dominio, favicon, tracking, embed, SEO y **publicadas**.
- [ ] Bulk: pendiente de reponer el piloto con el modelo nuevo.

## 3. Hechos verificados

| # | Hecho | Cómo se comprobó | Consecuencia |
|---|---|---|---|
| 1 | El clon **no hereda** dominio, favicon, head ni body | Settings del clon recién hecho | Se escriben los 5 campos en **cada** clon |
| 2 | El clon **sí hereda** el chat widget (`Ilatek`) y el Path | Mismo Settings | Aun así se reescriben para no depender de ello |
| 3 | El clon añade sufijo **` Clone`** a los nombres de página y crea una **variación** | Panel `Pages` del clon | La plantilla se dejó con **una** página para no arrastrar basura |
| 4 | **El path del step y el `URL Path/Slug` de la página son el mismo valor** | Leer ambos | Se escribe una sola vez, en `Edit page details` |
| 5 | El panel `Pages` opera sobre la página que se elige, no sobre la del step abierto | Cruzó A con B en el primer clon | Se selecciona la fila por nombre, nunca por posición |
| 6 | Cambiar el Path del funnel **después** de los de página provoca `Some paths are updated due to url conflicts with other funnels!` y GHL reescribe URLs | `alert` nativo capturado | **Settings antes** de tocar paths de página |
| 7 | Los slugs publicados **no se despublican** al cambiarlos | `/sellado-de-techo` sigue sirviendo Isla Verde | Los paths se fijan **antes** del primer publish |
| 8 | La API tarda en reflejar los steps del clon | Falló "Falta el step" | `steps_map()` reintenta hasta 90 s |
| 9 | GHL abre `alert`/`confirm` nativos | El driver murió con `No dialog is showing` | Handler `pg.on("dialog")` con `try/except` |
| 10 | Borrar funnel **no** pide `DELETE`; borrar step **sí** | Dos modales distintos | No confundirlos |
| 11 | El CDN corta sockets en tandas largas | Falló la subida 7/354 | `uploadAsset` reintenta 4× con backoff |
| 12 | 177 comunidades tienen hero propio | `landings/hero/` vs 556 landings | 354 páginas |
| 13 | La URL publicada es el **path del step**, completo; el path del funnel no se antepone | Step `/techos` → `/techos`; step `/plantilla/techos` → `/plantilla/techos` | El step lleva la ruta entera |
| 14 | Un funnel **sin dominio** (`domainId` vacío) publica sin URL y responde 404 | `PLANTILLA · Limpieza` dio 404 con el embed ya inyectado | Conectar dominio y confirmar `domainId` por API |
| 15 | Settings **hidrata tarde**: escribir antes de que cargue hace que React lo borre y `Save` guarda vacío | 3 intentos con favicon/head en 0; el log mostraba `llenado: 0 0 4026` | Esperar a que `Name` tenga valor y releer los 5 campos |
| 16 | El modal del Code Editor deja `.hr-modal-mask` interceptando clics | `#pg-funnel-builder__btn--save` bloqueado | Esperar a que no haya máscaras antes de Save/Publish |
| 17 | El título SEO **no** viaja con la página clonada | Limpieza publicó con el title de techos | Reescribir `SEO → Content` en cada página |
| 18 | El widget de chat tapa el pie en mobile | Captura a 390 px: logo y crédito detrás del globo | `.sf-inner { padding-bottom: 188px }` en mobile |
| 19 | Regenerar con `--all` expande el índice a las 556 landings | `index.json` pasó de 177 a 556 | Regenerar con la cola: `--only "$(paste -sd, data/ghl/cola-hero.txt)"` |
| 20 | Path del funnel **igual** al del step → GHL le pega números al publicado | `set_step_path` devolvió `…/sellado-de-techo-811950` y luego `-246757` | Funnel en `/<municipio>/<comunidad>-<servicio>`; el step en la ruta limpia |
| 21 | Recargar Settings después de elegir dominio **descarta la selección** | 3 vueltas con `domainId` vacío y la página publicada sin URL | Se elige el dominio y se sigue en el mismo formulario hasta el `Save` |
| 22 | El CDN sirve la copia anterior unos segundos después del publish | El gate midió `--pad: 16px` (CSS viejo) en una página ya correcta | `cache_bust()` + segunda medición a los 25 s antes de fallar |
| 23 | **El embed se guarda en el modelo pero el `Publish` puede publicar el snapshot anterior** | El editor mostraba 25 038 chars de Hacienda Buena y la página viva seguía con el h1 de Isla Verde (35 menciones) | Esperar 12 s después del `Save` y **comprobar el contenido en la URL** (`publicada_con`) antes de la imagen social y del gate |
| 24 | El `<title>` se actualiza antes que el cuerpo | `publicada_con` dio OK por el título mientras el h1 seguía siendo de Isla Verde; la imagen social de limpieza salió con el hero de **techos** | `publicada_con` y el gate leen el **`<h1>`**, no todo el HTML |
| 25 | El CDN puede tardar **minutos**, no segundos | La página de limpieza seguía stale a los 50 s y ya estaba bien a los ~4 min | Ventana de espera de 240 s; el gate no falla una página por impaciencia |
| 26 | El clone arrastra el H1 y el hero de la plantilla | Limpieza servía "Sellado de techo en Isla Verde" | El gate exige el **servicio** en el H1 (`sellado` / `limpieza`), no solo la comunidad |
| 27 | **Con el drawer de SEO abierto, el `Save` de la página no commitea el SEO** | El input de `Images` tenía la imagen nueva y la página viva seguía con la de techos en limpieza | Cerrar el drawer (`Escape`) antes de `Save` y exigir `og_imagen` en el gate |
| 28 | El og:image también se propaga con retraso | Tras publicar, la página seguía apuntando a la imagen anterior | `og_publicada()` con ventana de 240 s y reintento de SEO+publish |

## 4. Reglas duras

1. **Dos funnels por comunidad**, uno por servicio, una página cada uno.
2. **Se clona la plantilla**; nunca se crea desde cero.
3. **Un solo punto de escritura del path**: `Edit page details` del step.
4. **Settings antes que paths de página.**
5. **Paths antes del primer publish.**
6. **El HTML se lee en UTF-8** (con cp1252 aparecen `TURÃ­STICO`, `Â·`, `â†'`).
7. **En mobile no hay margen lateral: el aire es padding interno.** La regla
   es *sangrado completo + padding*, nunca `margin` que deje ver el fondo por
   los cantos (ese filo claro de 16 px era lo que afeaba el borde). Bloque
   `@media (max-width: 640px)` de `landings/styles.css`:
   - `--pad: 18px`, que es el inset del texto (ni pegado al borde ni con aire
     de más).
   - `main > :not(.hero) { width:100%; max-width:100%; margin-inline:0;
     padding-left/right: var(--pad) }`: cada bloque ocupa el ancho real de la
     pantalla y el padding lo separa del canto. Antes el `max-width:
     calc(100% - 2*var(--pad))` recortaba el bloque y dibujaba el marco claro.
   - `.band` y `.final` (superficies de color) van a sangre con `border-radius:
     0`, para que el color toque el canto en vez de flotar sobre un marco.
   - `.hero-inner` y `.sf-inner` reciben `padding-left/right: var(--pad)`; ya no
     se pone el padding lateral a 0 en `body/main/section/footer`.
   - **Los envoltorios de GHL sí siguen a 0** (`.c-section`, `.c-row`,
     `.c-column`, sus `.inner`, `.c-custom-code`,
     `.c-custom-code__custom-code`) con `padding-left/right: 0 !important`:
     su columna añadía ~40 px de gotera y es la que hay que neutralizar; el
     inset lo pone el propio embed.

   Medido dentro de la estructura de GHL a 390 px: `sectionPad = 0`,
   `columnPad = 0`, hero/banda/cierre/pie de 0 a 390, H1, lead y tarjetas a
   18 px, `overflowX = 0`.
8. **El texto no se parte mal en mobile.** En el mismo bloque:
   - `.eyebrow` → 10 px, `letter-spacing: .06em`, `flex-wrap`, centrado y
     `text-wrap: balance`: el eyebrow largo (p. ej. *DISTRITO COSTERO
     RESIDENCIAL/TURÍSTICO · CAROLINA*) entra en un renglón y no deja el `·`
     colgando.
   - `h1` → `clamp(25px, 6.6vw, 33px)`, `line-height: 1.16`,
     `overflow-wrap: normal`, `word-break: normal`, `hyphens: none`,
     `text-wrap: balance`: sin palabras cortadas ni líneas huérfanas.
   - `.lead` → 15.5 px, `text-wrap: pretty`.

   Verificado a 390 px (Isla Verde): eyebrow en 1 línea, H1 en 2 líneas,
   texto a 18 px del canto. Cualquier cambio de CSS obliga a regenerar los
   payloads (`preparar-funnel-ghl.mjs`) antes de inyectar.
9. **El scrollbar es invisible en mobile** (la página sigue desplazándose).
   Dentro del mismo `@media (max-width: 640px)`:
   `html { scrollbar-width: none; -ms-overflow-style: none }` y
   `html::-webkit-scrollbar, body::-webkit-scrollbar { width:0; height:0; display:none }`.
   Verificado a 390 px: `innerWidth = clientWidth = 390` y `scrollbar-width: none`,
   con la página aún desplazable. El screenshot de la imagen social ya forzaba
   el scrollbar oculto; ahora la página viva también.
10. **El scroll termina en el footer.** `html, body { margin:0; padding:0;
    overscroll-behavior-y: none }` y `footer { margin-bottom: 0 }` dentro del
    bloque móvil: no se encadena el scroll al shell de GHL ni queda rebote
    elástico mostrando espacio vacío debajo del footer.

    Auditoría **en las páginas vivas** (`/plantilla/techos` y `/plantilla/limpieza`)
    a 360 / 390 / 430 px:

    | Métrica | Resultado |
    |---|---|
    | Eyebrow | 1 línea |
    | H1 | 2 líneas (25 / 25.8 / 28.4 px) |
    | Lead | 2 líneas |
    | Scrollbar | oculto (`innerWidth = clientWidth`) |
    | Desborde horizontal | 0 px |
    | Espacio bajo el footer | 0 px (`footer.bottom = 844` con `scrollY = max`) |
    | Bloques (`.hero`, `.band`, `.final`, pie) | de 0 a 390 (a sangre) |
    | Inset del texto (H1, lead, tarjetas) | `18px` por lado |
    | `.c-section`, `.c-column` padding | `0px` (el inset lo pone el embed) |
    | Scroll disponible | sí |
11. **El pie reserva el alto del chat en mobile.** El widget de GHL va fijo
    abajo a la derecha y tapaba logo, redes y crédito. `.site-footer .sf-inner {
    padding-bottom: 188px }` dentro del bloque móvil: el contenido del pie sube y
    el scroll sigue terminando en el footer (el relleno es del pie, no un hueco
    después).
12. **Favicon, tracking y chat se configuran en cada funnel.** El Meta Pixel va
    en el head tracking; los embeds no lo repiten. Si el funnel no tiene dominio
    enlazado, el publish no genera URL.
13. **Ninguna comunidad se empieza hasta que la anterior pase el gate.**
14. **Cada comunidad se revisa entera antes de pasar a la siguiente.** Al
    terminar sus dos funnels se corre el gate de las dos páginas y no se marca
    `publicado` hasta que estén **todos** los checks en verde: `status`, `peso`,
    `mojibake`, `h1`, `servicio`, `title`, `gtm`, `pixel`, `chat`, `favicon`,
    `og`, **`og_imagen`** (el og:image tiene que ser el screenshot de **ese**
    servicio), `sin_page` y los tres móviles. Si algo falla, el driver aborta y
    no empieza la comunidad siguiente.
15. **Una sola pestaña de GHL.** Todo el trabajo de funnels se hace en la pestaña
    ya abierta. Se abren pestañas nuevas **solo** para probar los live previews
    (`/plantilla/...`), nunca dos sesiones de la app: dos pestañas con el builder
    abierto duplican los `Save` y dejan máscaras y frames viejos.

## 5. Runbook por funnel

### Fase 0 — Cola y payloads (repo)

```bash
cd Comunidades
node scripts/cola-hero.mjs                      # 177 comunidades → data/ghl/cola-hero.txt
KEYS=$(paste -sd, data/ghl/cola-hero.txt)
node scripts/preparar-funnel-ghl.mjs --only "$KEYS" --upload
node scripts/verificar-funnel-ghl.mjs
```

### Fase 1 — Clonar

`Sites → Funnels → ⋯ (fila PLANTILLA · Techos) → Clone`.

- Modal `Clone funnel`: **Funnel name** = `Comunidad · <Comunidad> (<Municipio>) · Techos`
  (o `· Limpieza`); location `Ilatek - PR` ya viene marcada → **Confirm**.
- Resolver el `_id` nuevo por diferencia contra la lista de la API.

### Fase 2 — Settings (primero)

`Settings`, en el orden de la UI:

1. **Funnel details**: Name, **Domain**, **Path**
   `/<municipio>/<comunidad>-techos` (o `-limpieza`), **Favicon**
   `https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ab044d04091fa65e69921f6.png`
2. **Tracking & scripts**: **Head** (GTM `GTM-PQMR2TDB`, GA4 `G-BTVFHT1X8G`,
   **Meta Pixel `2092249571384387`**) y **Body**.
3. **Chat widget**: `Ilatek`.
4. **Save** y releer para confirmar que el Path quedó.

**Antes de escribir nada**, esperar a que el formulario hidrate: el input `Name`
(`Please Input` nº0) tiene que mostrar el nombre del funnel. Si se escriben los
textos antes de ese momento, React los reescribe al llegar los datos y **Save
guarda vacío** (favicon y head en 0). Después de `Save`, reabrir Settings y
releer los cinco campos; no darlo por bueno sin esa lectura.

### Conectar el dominio (obligatorio antes de publicar)

El clon **nace sin dominio**: el selector muestra `Please select a domain`. La
página no sirve en `comunidades.ilatekpr.com` hasta que se conecta.

1. En `Funnel details → Domain` (`#funnels`), abrir el desplegable y elegir
   `comunidades.ilatekpr.com`.
2. Si **no aparece** en la lista: usar el enlace
   `Can't find your domain? Purchase or connect domain` → `Settings → Domains &
   URL Redirects → Add domain` → apuntar el DNS que indique GHL (registro A al
   IP que muestra, o CNAME) → esperar la verificación.
3. Confirmar que el dominio tiene el producto **Funnels** habilitado, no solo
   Website. Sin eso, el funnel no resuelve.
4. Volver al funnel → `Settings` → `Domain` → seleccionar → **Save**.
   Cambiar el dominio recarga la vista: hay que volver a resolver el frame antes
   de tocar los demás campos.
5. Verificar después del publish: `https://comunidades.ilatekpr.com/<path>`
   devuelve 200 con el contenido. Si da 404 o el navegador avisa de certificado,
   el dominio no está conectado a Funnels o el DNS aún no propagó.

### Fase 3 — Path de la página

`Steps` → abrir el step → **`Edit page details`** (`#edit-page`):

| Campo | Techos | Limpieza |
|---|---|---|
| Name | `Sellado de techo` | `Limpieza` |
| Path | `/municipio/comunidad/sellado-de-techo` | `/municipio/comunidad/limpieza` |

→ **Update page**. Se escribe con `/` inicial y completo; se relee para
confirmar que GHL no lo reescribió.

### Fase 4 — Embed

Builder → **Custom HTML/JavaScript** → **Open Code Editor** → pegar
`pages[n].html` del payload → **Save**.

El editor es CodeMirror dentro de un modal: escribir por su API
(`el.CodeMirror.setValue(html)`) es lo único que no se pierde; el clic/typed
sobre el canvas cierra el modal. Tras `Save`, esperar a que
`.hr-modal-mask` desaparezca: si sigue ahí, intercepta el clic en
`#pg-funnel-builder__btn--save` y el publish no ocurre (barra de URL vacía).

**Guardar el embed no es publicarlo.** El `Save` de la página tarda: si el
`Publish` sale 5 s después, publica el snapshot anterior y la página viva se
queda con el contenido de la plantilla aunque el editor muestre el bueno. Por
eso el driver espera 12 s y después exige que el HTML vivo contenga el nombre de
la comunidad (`publicada_con`) antes de sacar la imagen social: la URL en la
barra no prueba nada sobre el contenido.

### Fase 5 — SEO y publicar

`SEO & AI search optimization` → **Content**: Title y Description → **Save** →
**Publish**. El title se escribe **en cada página**: el clon conserva el del
origen (limpieza llegó a publicar con el title de techos).

#### Canonical por página (paso obligatorio desde la tanda 13)

Cada página declara **su propia URL** como canónica. El valor ya está en el
payload (`pages[].canonical`), así que no se teclea: es exactamente
`https://comunidades.ilatekpr.com/<municipio>/<comunidad>/<servicio>`.

1. Abrir el step en el builder y el panel **SEO Meta Data**
   (`#hl-builder-seo-meta-data-button`).
2. Rellenar **Canonical** con `pages[].canonical`: se abre con **Links & tags →
   Canonical links → Add**, que muestra un campo con placeholder
   `https://example.com`; se pega la URL y se confirma con el `Add` del modal.
   Comprobado en esta cuenta el 2026-11-01: en `Content` no hay un campo
   *Canonical URL* suelto, va en `Links & tags`.
3. **Escape** para cerrar el drawer y después `Save` → `Publish`: con el drawer
   abierto el `Save` no commitea el SEO (pitfall 27).
4. Verificar en la página viva: `<link rel="canonical" href="<la URL de esa
   página>">`. Si el href es el de la otra página o falta, el paso no se hizo.

**Backfill de las ya publicadas** (33 comunidades, 66 páginas):

```bash
cd Comunidades
python scripts/marcar-canonical.py                        # todas las publicadas
python scripts/marcar-canonical.py --only guaynabo/la-lomita --limit 1
```

Es idempotente (si la URL ya está en la sección no añade otra fila), publica
cada página para que el cambio se sirva y **falla** si alguna no muestra su
`canonical` en vivo. En el alta nuevo el paso lo hace el propio driver dentro
de `set_seo`, así que las tandas siguientes lo llevan sin comando aparte.

Después de **Publish**, leer la barra del builder: tiene que mostrar
`https://comunidades.ilatekpr.com/<path>`. Si está vacía, el funnel no tiene
dominio enlazado o el modal quedó abierto.

### Publicar las dos plantillas de revisión

```bash
cd Comunidades
node scripts/preparar-funnel-ghl.mjs --only carolina/isla-verde   # regenera payloads
python scripts/publicar-plantillas.py                            # dominio + settings + path + embed + publish + gate
```

El script usa **una sola pestaña** de GHL, espera la hidratación de Settings,
verifica el `domainId` por API, escribe el path completo del step, inyecta el
embed por CodeMirror, cierra el modal y publica. Deja las URLs y su estado en
`data/ghl/plantillas.json`:

| Plantilla | URL |
|---|---|
| Techos | `https://comunidades.ilatekpr.com/plantilla/techos` |
| Limpieza | `https://comunidades.ilatekpr.com/plantilla/limpieza` |

### Fase 6 — Imagen social (una por funnel, con su comunidad y servicio)

La imagen social es un **screenshot de la propia página publicada**, 1200×630 y
**sin scrollbar**; se sube a la Media Library y se pega en `SEO → Images` de esa
página.

```python
pg.set_viewport_size({"width": 1200, "height": 630})
pg.goto(url_publicada, wait_until="load")
pg.add_style_tag(content=(
    "html{scrollbar-width:none!important}"
    "body{overflow:hidden!important}"
    "::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}"))
pg.screenshot(path=f"screenshots/og-<municipio>-<comunidad>-<servicio>.png")
```

- `url_publicada` es la de **esa** comunidad y **ese** servicio, nunca la del
  piloto: el hero, el H1 y el CTA del screenshot deben ser los de la página.
- Archivo: `og-<municipio>-<comunidad>-<servicio>.png`.
- Después de pegar la URL en **Images**: `Save` → `Publish`.

Verificado en Jardines de Adjuntas: techos muestra su hero de urbanización y
"Agenda tu sellado"; limpieza su hero de interior y "Agenda tu limpieza".

### Fase 7 — Gate (por funnel)

| Check | Criterio |
|---|---|
| `status` | 200 |
| `peso` | > 120 KB |
| `mojibake` | 0 `Ã` / `Â` / `â€` |
| `h1` / `title` | contienen la comunidad |
| `servicio` | el H1 contiene `sellado` (techos) o `limpieza` (limpieza) |
| `gtm` / `pixel` | `GTM-PQMR2TDB` y `fbq(` |
| `chat` / `favicon` | `chat-widget` y `6ab044d04091fa65e69921f6` |
| `og` | `og:image` |
| `og_imagen` | el `og:image` es el screenshot subido para **ese** servicio |
| `sin_page` | `…-page` devuelve 404 |
| `movil_ancho` | en 360 / 390 / 430 px: `hero`, `.band` y `.final` de 0 al ancho y `docW = vw` |
| `movil_inset` | H1 y tarjetas a 18 px del canto (se acepta 14–24) |
| `movil_scroll` | al bajar del todo, el pie termina en el borde de la pantalla |

Si falla, el script aborta y no toca la comunidad siguiente.

## 6. Pitfalls ya pagados

- **Dos páginas en un funnel**: es el modelo viejo. Cada servicio va en su funnel.
- **Confiar en la herencia del clon**: no trae dominio, favicon, head ni body.
- **Editar el slug desde `Pages`**: seleccionar la fila equivocada cruza páginas.
  El path se cambia solo en `Edit page details`.
- **Settings después de los paths**: dispara el aviso de conflicto y GHL
  reescribe las URLs (sufijos `-226218`, `-page`).
- **Publicar antes de fijar paths**: deja URLs viejas vivas para siempre.
- **Modal de clon**: si no se reescribe `Funnel name`, nace como `… Copy`.
- **Lag de la API** tras clonar: esperar los dos steps.
- **Diálogos nativos** sin handler: tumban el driver.
- **Borrar**: funnel → `Delete` directo; step → escribir `DELETE`.
- **Socket del CDN**: reintentar la subida, no abortar el lote.
- **Página vacía**: 200 con ~58 KB y sin title = embed no inyectado.
- **Confiar en el path del funnel**: la URL es el path del step; el del funnel
  no se antepone. Un step `/techos` publica en la raíz.
- **Publicar sin dominio**: `domainId` vacío = publish sin URL y 404. Se
  comprueba por API, no por lo que muestra el selector (`Please select a domain`
  aparece incluso después de guardarlo bien).
- **Escribir en Settings antes de que hidrate**: se pierde en silencio y `Save`
  guarda vacío.
- **Dejar el modal abierto**: la máscara bloquea Save/Publish; el síntoma es la
  barra de URL vacía sin mensaje de error.
- **Cambiar el path de un step ya publicado**: el path viejo sigue sirviendo la
  misma página (`/sellado-de-techo` siguió vivo tras mover a `/techos`).
- **Cerrar el tab de GHL**: se pierde la sesión de trabajo del funnel en curso;
  una sola pestaña para la app, pestañas nuevas solo para previews.
- **Reset de conexión en la subida de la imagen social**: `WinError 10054` en el
  POST multipart de `upload_media` (tanda 08), con la página **ya publicada**, así
  que abortar la comunidad por un corte transitorio cuesta 5 min de rehacer. La
  subida reintenta 3 veces con espera 4 s / 8 s y solo para errores de conexión;
  cualquier otro fallo sigue abortando para no enmascarar un problema real.
- **Tabla de `Sites → Funnels` paginada**: muestra **15 filas** ordenadas por
  `recent`, así que con suficientes comunidades la fila `PLANTILLA · Techos` cae
  fuera de la primera página y el clon aborta con `No está la plantilla
  'PLANTILLA · Techos'`. Pasó en la tanda 04 (esmeralda, 2026-11-01): `clone_funnel`
  ahora escribe `PLANTILLA` en `Search for funnels` cuando la fila no está a la
  vista, y el lote sigue sin intervención manual.

## 7. Estado (2026-11-01)

- [x] Dos plantillas, una página cada una, con path en el step:
      `/plantilla/techos` y `/plantilla/limpieza`.
- [x] Ambas con dominio, favicon, head (GTM + GA4 + Pixel), body, chat `Ilatek`,
      SEO propio y **publicadas** (200 · 147/146 KB).
- [x] Revisión mobile en las páginas vivas a 360 / 390 / 430 px: bloques a
      sangre (0 px de margen lateral), texto a 18 px de padding, sin desborde,
      sin scrollbar, scroll que termina en el footer, pie con espacio para el
      chat.
- [x] 177 payloads regenerados con el CSS final (354 páginas); verificador OK
      (6 372 enlaces/assets).
- [x] Consistencia comprobada: las **354 páginas** del lote llevan el bloque
      móvil nuevo (`--pad: 18px`, `margin-inline: 0`, `border-radius: 0` en
      banda y cierre, `padding-bottom: 188px` del pie, scrollbar oculto).
      Muestreadas Carolina, Humacao y Ponce (los dos servicios) a 360 / 390 /
      430 px en el mismo HTML que se inyecta: hero/banda/cierre/pie de 0 al
      ancho, H1 y tarjetas a 18 px, `docW = vw`, sin desborde, scroll que
      termina en el pie. El resto de las 2 224 landings locales usan el mismo
      `template.mjs` y el mismo `styles.css` (ninguna con `<style>` propio).
- [x] 363 assets en la Media Library: muestra de 12 al azar → todos 200.
- [x] `index.json`: 177 funnels, todos en `pendiente` (nada a medias) — estado
      del 2026-10-31, antes del piloto; hoy hay 6 en `publicado`.
- [x] Driver del lote (`alta-funnel-ghl.py`) con los cinco arreglos del
      pre-flight: hidratación de Settings con relectura de los 5 campos,
      `domainId` por API, embed por `CodeMirror.setValue`, espera de
      `.hr-modal-mask` con la barra de URL como prueba del publish y gate
      móvil en 360 / 390 / 430 px.
- [x] **Auditoría de las publicadas**: las **24 comunidades** publicadas (las 21
      anteriores más The Enclave, The Isles y The Legacy), **48/48 landings en
      verde** (18/18 checks: ruta, dominio, embed, título, chat,
      favicon, GTM + GA4 + Pixel, texto, peso, og:image del servicio, sin
      `-page` y móvil 360/390/430). Script: `scripts/auditar-publicadas.py`.
- [x] **Piloto repuesto** con el driver del lote: dos funnels, paths exactos
      `/carolina/isla-verde/sellado-de-techo` y `/carolina/isla-verde/limpieza`,
      200 · 147/146 KB, gate HTTP + móvil OK, `index.json` en `publicado`.
- [x] **Tanda 03** (2026-11-01): `bayamon/riviera`, `bayamon/riviera-parkview`
      y `cabo-rojo/golf-y-playa`, **3/3 comunidades y 6/6 gates**, sin abortos,
      32.7 min de reloj. Log: `.tmp-ghl-ui/lote-tanda-03.log`.
- [x] **Tanda 04** (2026-11-01): `carolina/condesa-del-mar`, `carolina/esmeralda`
      y `carolina/marbella-del-caribe-este`, **3/3 comunidades y 6/6 gates**. Tuvo
      un `ABORTA` por la tabla de funnels paginada (ver pitfalls), se corrigió el
      driver y el relanzamiento terminó sin incidencias. Logs:
      `.tmp-ghl-ui/lote-tanda-04.log` y `lote-tanda-04b.log`.
- [x] **Tanda 05** (2026-11-01): `carolina/sevilla`, `carolina/villamar` y
      `carolina/vistamar`, **3/3 comunidades y 6/6 gates**, sin abortos, 30.7 min de
      reloj, ya con el arreglo de la tabla paginada (las tres clonaron sin
      intervención). Log: `.tmp-ghl-ui/lote-tanda-05.log`.
- [x] **Tanda 06** (2026-11-01): `carolina/vistamar-marina`,
      `carolina/waldorf-tower` y `ceiba/the-village-at-the-hill`, **3/3 comunidades
      y 6/6 gates**, sin abortos, 30.9 min de reloj. Primera comunidad fuera de
      Carolina. Log: `.tmp-ghl-ui/lote-tanda-06.log`.
- [x] **Tanda 07** (2026-11-01): `culebra/costa-bonita-beach-resort`,
      `dorado/dorado-beach-east` y `dorado/east-beach`, **3/3 comunidades y 6/6
      gates**, sin abortos, 31.3 min de reloj. Primera tanda con dos comunidades del
      mismo municipio nuevo (Dorado): paths, embeds y `og:image` propios en las
      cuatro páginas, sin arrastrar la hermana de municipio. Log:
      `.tmp-ghl-ui/lote-tanda-07.log`.
- Ojo con el **largo del embed como prueba**: The Isles y The Legacy publican
  exactamente 24 936 / 24 442 chars porque la plantilla sustituye nombres de igual
  longitud. El largo no distingue entre esas dos comunidades; la prueba válida es
  `scripts/verificar-contenido.py`, que exige el **embed propio verbatim** en la
  página viva (ver 9.b).
- [x] **Tanda 08** (2026-11-01): `dorado/la-cala`, `dorado/livingston-estates` y
      `dorado/plantation-village`, **3/3 comunidades y 6/6 gates**. Un `ABORTA` por
      red en la subida de la imagen social (ver pitfalls), corregido con reintento y
      reanudado con la idempotencia. Cruce entre las cinco comunidades de Dorado
      comprobado: 0 frases ajenas y 10/10 `og:image` distintas. Logs:
      `.tmp-ghl-ui/lote-tanda-08.log` y `lote-tanda-08b.log`.
- [x] **Tanda 09** (2026-11-01): `dorado/the-enclave`, `dorado/the-isles` y
      `dorado/the-legacy`, **3/3 comunidades y 6/6 gates**, sin abortos, 37.3 min de
      reloj. Cruce de las **8 comunidades de Dorado** comprobado: 0 frases ajenas y
      **16/16 `og:image`** distintas. Log: `.tmp-ghl-ui/lote-tanda-09.log`.
- [x] **Verificación de contenido permanente** (2026-11-01): el control que se
      reescribía y borraba en cada tanda (`.tmp-contenido-*.py`) es ahora
      `scripts/verificar-contenido.py`, con dueño junto al auditor y tests en
      `scripts/tests/test_verificar_contenido.py`. Corre sobre las 24 publicadas:
      **48/48 páginas en verde** (`exit 0`), y falla a propósito con embed cruzado,
      payload alterado y filtro vacío (ver 9.b).
- [x] **Tanda 10** (2026-11-01): `dorado/west-beach`, `dorado/west-point` y
      `fajardo/pena-mar-ocean-club`, **3/3 comunidades y 6/6 gates**, sin abortos,
      10.4 / 10.3 / 10.4 min. Primera tanda que cambia de municipio a mitad (las dos
      de Dorado y la tercera de Fajardo). Cierre con las dos piezas permanentes:
      **54/54 landings** en el auditor (18/18 checks, `exit 0`) y **54/54 páginas**
      con embed verbatim propio y `og:image` única en el verificador de contenido
      (`exit 0`). Sin arrastre de Dorado a Fajardo: 0 frases de las 10 comunidades
      de Dorado en las dos páginas de Peña Mar y sus 2 `og:image` distintas de las
      16 de Dorado. Logs: `.tmp-ghl-ui/lote-tanda-10.log`, `auditoria-10.log` y
      `contenido-10.log`.
- [x] **Tanda 11** (2026-11-01): `fajardo/puertas-del-sol`,
      `fajardo/the-ocean-club-at-seven-seas` y `guaynabo/estancias-de-torrimar`,
      **3/3 comunidades y 6/6 gates**, sin abortos, 10.4 / 10.4 / 13.5 min. Dos
      comunidades de Fajardo y la primera de Guaynabo (municipio nuevo). Cierre:
      **60/60 landings** en el auditor (18/18 checks, `exit 0`) y **60/60 páginas**
      en el verificador de contenido (`exit 0`). Sin arrastre entre municipios: 0
      frases de Dorado ni de Peña Mar en las 6 páginas nuevas, y 6/6 `og:image`
      distintas. Logs: `.tmp-ghl-ui/lote-tanda-11.log`, `auditoria-11.log` y
      `contenido-11.log`.
- [x] **Tanda 12** (2026-11-01): `guaynabo/garden-hills-north`, `guaynabo/la-lomita`
      y `guaynabo/las-casonas`, **3/3 comunidades y 6/6 gates**, las tres del mismo
      municipio (vecinas entre sí). Primer intento con `ABORTA` en la primera
      comunidad por la **lectura de vuelta del path** (`Locator.input_value` a
      ciegas tras 2 s fijos): se arregló `set_step_path` —espera a que monte el
      modal y reintenta la relectura hasta 3 veces— y la reanudación reutilizó el
      funnel clonado, **sin duplicar**. Tiempos: 9.4 / 10.4 / 11.3 min. Cierre:
      **66/66 landings** en el auditor (18/18 checks, `exit 0`) y **66/66 páginas**
      en el verificador de contenido (`exit 0`). Sin arrastre: 0 frases de las otras
      comunidades de Guaynabo ni de otros municipios en las 6 páginas nuevas, y 6/6
      `og:image` distintas. Logs: `.tmp-ghl-ui/lote-tanda-12.log`,
      `lote-tanda-12b.log`, `auditoria-12.log` y `contenido-12.log`.
- [x] **Canonical por página** (paso nuevo desde la tanda 13, pedido el
      2026-11-01): cada página declara su propia URL como canónica con el valor
      que ya trae `pages[].canonical` del payload. **Backfill cerrado**: las 33
      comunidades anteriores al paso quedaron con su canonical propio verificado
      en vivo. Desde la tanda 13 el canonical se escribe **dentro del proceso**
      (`set_seo(..., canonical=...)`), así que cada página nueva nace con el
      suyo. Procedimiento en [Fase 5](#fase-5--seo-y-publicar).
- [ ] Lote: 144 comunidades restantes (LUXURY → HIGH → MEDIUM). Siguiente en la
      cola de producción: `guaynabo/san-patricio`. Comandos, precondiciones y
      reanudación en [Lanzar una tanda](#lanzar-una-tanda-comandos).

## 8. Pre-flight del lote

El contenido está listo y el **driver ya se actualizó** con lo aprendido en las
plantillas. `alta-funnel-ghl.py` incorpora los seis arreglos:

| # | Qué se arregló | Cómo se comprueba |
|---|---|---|
| 1 | Settings espera la hidratación y relee **los cinco campos** tras `Save` (no solo el path) | Log `settings vuelta n: {...}` y reintento hasta 3 veces; si queda vacío, aborta |
| 2 | `domainId` verificado por API antes de publicar | `if not domain_id(fid): raise` + log del `domainId` en cada vuelta |
| 3 | Embed por `CodeMirror.setValue`, con lectura del largo de vuelta | Log `embed <n> chars`; si CodeMirror no está, lanza en vez de guardar a medias |
| 4 | `cerrar_mascara()` antes de `Save`/`Publish` y la **barra de URL** como prueba del publish | `save_publish` devuelve la URL y `build` la compara con la esperada; 2 intentos |
| 5 | Gate móvil en 360 / 390 / 430 px sobre la página viva | `movil_ancho`, `movil_inset` (18 px ± 4), `movil_scroll` (fin del scroll en el pie) |
| 6 | `Edit page details` espera a que monte el modal y **reintenta la lectura de vuelta** del path (3 intentos, tras cerrar la máscara) | Log `no abrió el modal…` / `no se pudo releer el path…`; sin esto un modal lento costaba 30 s de timeout y `ABORTA` la comunidad con el funnel ya clonado (tanda 12) |

Verificado: `gate` y `gate_movil` contra `/plantilla/techos` dan **todo en verde**
(11 checks HTTP + 3 móviles) y el gate móvil **falla** contra una página de prueba
con 16 px de margen lateral y texto pegado al canto (`movil_ancho` y
`movil_inset` en `False`), así que no pasa por bueno cualquier cosa.

Además, antes de soltar los 175:

1. **Reponer el piloto** (Isla Verde) con los dos funnels y pasar el gate: es el
   ensayo que valida el orden completo.
2. **Tiempo real medido**: el piloto (2 funnels, desde cero) tardó **5.6 min** →
   ~16 h para las 174 comunidades restantes en corrida continua. Pero el
   2026-11-01 Residences at Rio, **reutilizando** el funnel ya clonado, tardó
   **10.7 min**: las esperas de `Save`/`Publish` y de la imagen social pesan más
   que el clonado. La tanda 03 lo confirmó con tres mediciones más: **10.3 / 10.2 /
   12.2 min** por comunidad (Riviera, Riviera Parkview, Golf y Playa). La tanda 04
   dio **11.4 / 10.2 / 10.2 min** (Condesa del Mar, Esmeralda, Marbella del Caribe
   Este), la tanda 05 **10.3 / 10.2 / 10.2 min** (Sevilla, Villamar, Vistamar) y la
   tanda 06 **10.3 / 10.4 / 10.2 min** (Vistamar Marina, Waldorf Tower, The Village
   at the Hill), la tanda 07 **10.5 / 10.3 / 10.5 min** (Costa Bonita, Dorado Beach
   East, East Beach), la tanda 08 **13.3 / 6.5 / 10.4 min** (La Cala, Livingston
   Estates —reanudada, con funnel ya creado— y Plantation Village) y la tanda 09
   **10.4 / 13.2 / 13.7 min** (The Enclave, The Isles, The Legacy) y la tanda 10
   **10.4 / 10.3 / 10.4 min** (West Beach, West Point, Peña Mar Ocean Club) y la
   tanda 11 **10.4 / 10.4 / 13.5 min** (Puertas del Sol, The Ocean Club, Estancias
   de Torrimar) y la tanda 12 **9.4 / 10.4 / 11.3 min** (Garden Hills North, La
   Lomita, Las Casonas). La media se ha movido a ~12 min en las últimas tandas; con
   144 pendientes eso son ~29 h, así que se planifica por tandas de 3–5 comunidades
   y no en una corrida única.
3. **Correr de noche y por tandas** con una lista de pendientes filtrada (ver
   *Lanzar una tanda*), que la idempotencia ya está: lo que figura `publicado`
   en `index.json` se saltea.
4. Revisar el `ledger` después de cada tanda y no borrar funnels a mano: el
   path viejo sigue sirviendo aunque se mueva el step.

### Lanzar una tanda (comandos)

Precondiciones — si falta una, el driver aborta en la **primera** comunidad sin
publicar nada:

| # | Precondición | Cómo se comprueba |
|---|---|---|
| 1 | Chrome del propietario abierto con la sesión de GHL, CDP en 9222 | `curl -s http://127.0.0.1:9222/json/version` devuelve JSON |
| 2 | PIT de la API vigente | `.mcp.json` → `mcpServers.ghl.env.ZJ_GHL_PIT`; si venció, la primera llamada sale 401/403 y el log dice `ABORTA` antes de clonar. Se comprueba con el **mismo endpoint y headers que el driver** (ver abajo) |
| 3 | Ledger al día | `data/ghl/index.json` con `publicado` / `pendiente` |
| 4 | Payload de cada comunidad de la tanda | `data/ghl/funnels/<municipio>/<comunidad>.json`; solo se regenera (Fase 0) si cambió el CSS o la plantilla |
| 5 | **Cuenta de GHL activa** (no en `hold` por pago) | Abrir un funnel en el navegador: si redirige a `app.gohighlevel.com/inactive?type=failed-payment` la cuenta está bloqueada. El driver lo manifiesta como `'NoneType' object has no attribute 'get_by_role'` en `open_builder`, y **el PIT sigue respondiendo 200**: el bloqueo es de la cuenta, no de la API |

**Comprobar el PIT sin falsos negativos.** Un `403` desde `urllib` sin headers no
es una credencial vencida: es **Cloudflare Error 1010** por la firma del cliente
(pasa incluso con el PIT sano). La comprobación válida usa el mismo endpoint y
headers que el driver, y con eso responde 200:

```bash
cd Comunidades
python -c "
import json, pathlib, urllib.request
pit = json.loads(pathlib.Path('../.mcp.json').read_text(encoding='utf-8'))['mcpServers']['ghl']['env']['ZJ_GHL_PIT']
req = urllib.request.Request(
    'https://services.leadconnectorhq.com/funnels/funnel/list?locationId=8OxUENFVM60EKzqsTcoD&limit=100&offset=0',
    headers={'Authorization': f'Bearer {pit}', 'Version': '2021-07-28',
             'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (ilatek-batch)'})
with urllib.request.urlopen(req, timeout=60) as r:
    print('API', r.status, 'funnels', len(json.loads(r.read())['funnels']))
"
```

La cola de producción es `data/ghl/cola-hero.txt` (177 hoy, en orden LUXURY →
HIGH → MEDIUM). **Solo entran las comunidades con sus dos heroes propios** en
`landings/hero/`: `cola-hero.mjs` exige el par (techos y limpieza) porque con
una sola foto una de las dos páginas saldría con la foto compartida.

Esa cola ya no es un techo fijo: el lote de imágenes la alimenta solo.

```bash
cd Comunidades/scripts/imagenes
python -u lote-automatico.py --tanda 40 --espera 8    # Flow, reanudable
```

`lote-automatico.py` pide las fotos que faltan (los pares a medias primero),
corre `generar-landings.mjs` —que convierte los PNG a WebP en `landings/hero/`—
y luego `cola-hero.mjs`, que reescribe la cola con lo que hay en disco. La lista
`.tmp-pendientes.txt` que consume el driver se rearma en el mismo paso, así que
el supervisor de publicación ve las comunidades nuevas sin reiniciar nada. Si
Flow agota la cuota o pierde la sesión, el lote se detiene y se reanuda con el
mismo comando; no hay que tocar código.

Inventario del objetivo completo (medido 2026-11-01):

| Conjunto | Comunidades | Páginas |
|---|---|---|
| Landings generadas (meta: **1112 páginas**) | 556 | 1112 |
| Con payload de GHL | 556 | 1112 |
| En la cola (par de heroes propio) | 177 | 354 |
| Publicadas | 77 | 154 |
| En producción de heroes (lote de Flow) | 379 | 758 |

Las 379 sin hero ya tienen payload (Fase 0 del 2026-11-01: 378 comunidades,
0 fallos), así que en cuanto tengan su foto entran en la cola sin tocar código.
Mientras tanto, el trabajo publicable es el de las 144 pendientes de la cola
(288 páginas, ~28 h al ritmo medido). `--limit` se aplica **después** de
descartar lo ya publicado, así que `--limit 3` son siempre 3 comunidades nuevas;
`--start` sí salta sobre la lista recibida. La cola de pendientes se regenera
con:

```bash
cd Comunidades
python - <<'PY'
import json, pathlib
idx = json.loads(pathlib.Path("data/ghl/index.json").read_text(encoding="utf-8"))
pub = {f"{f['municipalitySlug']}/{f['slug']}" for f in idx["funnels"] if f.get("status") == "publicado"}
cola = [l.strip() for l in pathlib.Path("data/ghl/cola-hero.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
pend = [k for k in cola if k not in pub]
pathlib.Path(".tmp-pendientes.txt").write_text("\n".join(pend) + "\n", encoding="utf-8")
print(len(pend), "pendientes; sigue:", pend[0])
PY

mkdir -p ../.tmp-ghl-ui
nohup python scripts/alta-funnel-ghl.py --list .tmp-pendientes.txt --limit 3 \
  > ../.tmp-ghl-ui/lote-$(date +%Y%m%d-%H%M).log 2>&1 &
```

Banderas del driver:

| Bandera | Qué hace |
|---|---|
| `--only mun/com` | una sola comunidad; repetible |
| `--list archivo` | lista de comunidades, una por línea |
| `--start N` | salta las primeras N **de la lista recibida** |
| `--limit N` | corta a N comunidades |

Idempotencia: lo que ya figura `publicado` se saltea aunque venga en la lista
(el log imprime `Ya publicadas y verificadas: n · pendientes: m`).

### Supervisor del lote (sin intervención)

`scripts/supervisar-lote.py` es la forma recomendada para las pendientes: una
comunidad cuesta 10-14 min y este entorno corta los procesos a los ~4, así que el
supervisor lanza **una página por corrida** (`--servicio`), relanza lo que se
cortó y cierra cada tanda de 3 comunidades con `verificar-contenido.py` y
`auditar-publicadas.py`, anotando el resultado en `progress.md`.

```bash
cd Comunidades
python scripts/supervisar-lote.py --plan             # próximas tandas, sin publicar
python scripts/supervisar-lote.py --max-tandas 2     # dos tandas y sale
python -u scripts/supervisar-lote.py --esperar-cdp 1440   > ../.tmp-ghl-ui/supervisor.log 2>&1 &
```

- Estado en `.tmp-supervisor.json` (tandas, rojas, bloqueadas, intentos): se puede
  matar y relanzar sin repetir nada; el ledger manda.
- Candado en el puerto 8791: dos supervisores sobre la misma pestaña de GHL se
  cruzan los Settings y dejan clones duplicados (incidente del 2026-11-05).
- **Tres carriles como máximo, y con reparto**: `--carril N` (0-2) abre pestaña
  propia, usa su estado (`.tmp-supervisor-N.json`) y su candado (8791+N), reclama
  cada comunidad en `.tmp-reclamos.json` (caducidad 30 min) y comparte bloqueadas
  y rojas con los demás. El carril 0 tiene que correr esta versión (deja
  `.tmp-carril-0.latido`); sin ese latido los otros esperan 90 s y salen con
  código 3 sin tocar GHL. **Cuatro sigue prohibido en el código** (`--carril`
  valida 0-2): fue lo que cruzó Loíza con Guayanilla y dejó clones repetidos. Tres
  es el punto que pidió el propietario el 2026-11-06 y está **en observación**.
- El `funnel_id` del clon se acepta **solo por nombre** (exacto o normalizado sin
  `Copy`/`(2)`): aceptar "cualquier id nuevo" es lo que deja a un carril
  escribiendo dos comunidades en el funnel de la otra.
- `--esperar-cdp N` lo deja esperando a que vuelva el puerto 9222 si Chrome se
  reinició sin `--remote-debugging-port`; sin esa bandera sale con código 2.
- **Sin chat widget** (`--sin-chat`, existe también en el driver): esta corrida deja
  el widget en `none`. No se toca el selector, `settings_vivos` no lo exige (no
  reescribe Settings por su culpa) y `gate` da `chat` por bueno. Si el clon ya
  traía `Ilatek` heredado de la plantilla, el log lo avisa pero **no se quita**:
  deseleccionarlo desde la UI no está soportado.
- **Aviso de saturación** (`--aviso-min N`, 25 por defecto; 0 lo apaga): si el lote
  entero pasa N minutos sin cerrar una comunidad —cuenta el último verde de
  **cualquier** carril— escribe `AVISO: … min sin cerrar ninguna comunidad`, con el
  estado del CDP y las pestañas abiertas. Sale antes de que empiecen los bloqueos
  por hidratación; si se repite, bajar de tres carriles a dos.
- **Un verificador ciego no pone a nadie en rojo**: si `auditar-publicadas.py` o
  `verificar-contenido.py` no llegan a dar veredicto (traceback, timeout de CDP,
  corte), la comunidad queda "sin veredicto" y se reintenta; no se bloquea. El
  2026-11-06 un `connect_over_cdp: Timeout 180000ms exceeded` marcó seis
  comunidades de Dorado en rojo y bloqueó dos que servían bien.
- **Las pestañas no se cierran, se reutilizan** (`AGENTS.md`): el driver guarda el
  `targetId` de su pestaña en `.tmp-carril-N.pestana` y la retoma en la corrida
  siguiente, así que un corte ya no deja pestañas sueltas. Antes abría una por
  corrida; con 24 acumuladas (96 targets) Playwright dejó de enlazar y el
  verificador "falló" en seis comunidades de Dorado que estaban bien.
- **`publicado` significa que SUS DOS páginas sirven su contenido ahora mismo**:
  `actualizar_ledger()` consulta las dos URLs antes de anotar (el 2026-11-05 la
  limpieza de `luquillo/brisas-del-mar` quedó en 404 y el ledger la dio por
  buena, así que nadie volvía a mirarla). Si una no responde, sigue `pendiente`.
- **Las rojas van primero**: una publicada que sale en rojo se reencola al
  principio y la reparación republica **solo la página que falló**
  (`--force --servicio`), nunca la hermana buena: republicar de más es lo que
  cruza paths.
- **Barrido continuo** (`--barrido N`; 2 por tanda y 50 al agotar la cola): repasa
  las publicadas que no constan en verde con cursor persistente (`sweep_i`), así
  que se corta y se reanuda sin repetir. Dos reparaciones sin verde = bloqueada
  para revisión manual, no bucle infinito.
- Una excepción en una comunidad no tumba la corrida: se anota y se sigue con la
  siguiente (la tanda 1 murió por un carácter raro al escribir el log).
- `.tmp-ghl-ui/colero.py` (4 carriles) queda retirado: fue el que cruzó el path de
  Loíza con Guayanilla y dejó clones duplicados.

Vigilar con `tail -f ../.tmp-ghl-ui/lote-*.log` (`.tmp*` está en `.gitignore`).
Marcadores por comunidad, en orden: `[n/N] municipio/comunidad` →
`embed <n> chars` → `gate Techos: OK` → `gate Limpieza: OK` → cierre con
`Publicadas y verificadas: n`. Cada comunidad son **dos páginas**.

**Reanudar tras un fallo.** El driver ya **no corta el lote**: anota la
comunidad (`FALLA <clave>: <motivo>`), sigue con la siguiente y sale con
**código 1** al final, así que una página flaky no frena la tanda. El ledger se
actualiza **por comunidad** en cuanto pasa el gate y al relanzar la idempotencia
salta las publicadas. Antes de relanzar, mirar el motivo: un `Target page, context or
browser has been closed` se resuelve reabriendo la pestaña de GHL; un 401/403 es
el PIT; un `gate … FALLA` es contenido y hay que ver la landing; `No está la
plantilla…` es la tabla paginada (ya cubierta por el buscador del driver, basta
relanzar).

**Cerrar la tanda** con dos pasos sobre **todas** las publicadas, no solo las
recién hechas: la auditoría de la sección 9 (estructura, 18 checks) y
`scripts/verificar-contenido.py` de la 9.b (que el embed publicado sea el de su
payload). Ninguno de los dos acepta un filtro vacío como verde.

### Lanzar el lote sin conflictos

Un conflicto aquí es una de tres cosas: dos corridas escribiendo Settings en el
**mismo** funnel, dos funnels nuevos con el mismo nombre (los clones `(2)`, `(3)`)
o un path ya usado que GHL resuelve con sufijo (`…-811950`). Las tres nacen de la
misma raíz: el espacio de nombres de funnels y paths es **de la location**, no de
la pestaña. Por eso el reparto se hace por **comunidades reclamadas**, no por
pestañas.

#### 0. Prerrequisitos (si falta uno, no se lanza)

```bash
# CDP vivo: sin esto el driver no ve GHL y el verificador no puede opinar
curl -s -m 5 http://127.0.0.1:9222/json/version | head -c 120
# candados libres: 8791 (carril 0) y 8792 (carril 1)
netstat -ano | grep -E ":879[12]"
```

Si el 9222 no responde, Chrome está abierto sin la bandera: ciérralo del todo y
reábrelo con

```bash
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

Chrome 136+ solo respeta la bandera con perfil propio: si el puerto sigue sin
escuchar, añade `--user-data-dir=C:\Users\Omele\chrome-cdp` (y vuelve a iniciar
sesión en GHL una vez). La ventana y el proceso del propietario no se cierran
desde los scripts.

#### 1. Ensayo en seco (siempre)

```bash
cd Comunidades
python scripts/supervisar-lote.py --plan --carril 0   # tandas y pendientes reales
python scripts/supervisar-lote.py --plan --carril 1   # lo que vería el segundo
```

`--plan` no toca GHL: comprueba que el ledger y la cola cuadran y si hay
bloqueadas nuevas. Los dos carriles deben dar el **mismo número** cuando no hay
reclamos en curso.

#### 2. Modo A — un carril (lo normal)

```bash
cd Comunidades
python -u scripts/supervisar-lote.py --esperar-cdp 720 >> ../.tmp-ghl-ui/supervisor.log 2>&1 &
```

- `--esperar-cdp 720` lo deja esperando a Chrome en vez de morir: cuando vuelve,
  arranca solo.
- Una página por corrida, tanda de 3 comunidades, barrido de 2 publicadas por
  tanda. Ritmo medido: **4-9 min por comunidad** según los cortes.
- Se puede matar y relanzar cuando se quiera: el ledger manda y el estado
  (`.tmp-supervisor.json`) guarda rojas, bloqueadas, cursor del barrido e intentos.

#### 3. Modo B — dos o tres carriles (opcional, solo con reparto)

```bash
cd Comunidades
# 1) primero el 0: es quien deja el latido que habilitan los demás
python -u scripts/supervisar-lote.py --esperar-cdp 720 --carril 0 >> ../.tmp-ghl-ui/supervisor-c0.log 2>&1 &
# 2) los demás esperan hasta 90 s el latido del 0 y comprueban que no se solapan
python -u scripts/supervisar-lote.py --esperar-cdp 720 --carril 1 >> ../.tmp-ghl-ui/supervisor-c1.log 2>&1 &
python -u scripts/supervisar-lote.py --esperar-cdp 720 --carril 2 >> ../.tmp-ghl-ui/supervisor-c2.log 2>&1 &
```

| Garantía | Mecanismo |
|---|---|
| No publican la misma comunidad | una ficha `.tmp-reclamos/<comunidad>.claim` por comunidad, creada con `O_EXCL`: crear el fichero ES el candado (caduca a los 30 min) |
| No comparten pestaña ni selectores | cada carril abre la suya (`--carril N` del driver) |
| No se pisan el estado | `.tmp-supervisor-N.json` por carril |
| No se roban el candado | 8791 + N |
| Ninguno republica lo que el otro mandó a revisión | `compartidas()`: bloqueadas y rojas se leen de todos los `.tmp-supervisor*.json` |

Límites, sin adornos: **tres como máximo** (el código rechaza 3+ con código 2);
con cuatro la SPA de GHL no hidrata y los clones salen repetidos. El carril 1 se niega a arrancar (**código 3**) si el 0
no dejó `.tmp-carril-0.latido`, porque un carril 0 sin reparto no reclama nada y
acabría eligiendo las mismas comunidades. Los carriles 1 y 2 están probados en
vivo** desde 2026-11-06: las tres primeras tandas salieron con comunidades
disjuntas. Aun así, al arrancar mira los logs y confírmalo.

#### 4. Diagnóstico: síntoma → causa → qué hacer

| Síntoma en el log | Causa | Acción |
|---|---|---|
| `auditoría: exit 1 · sin veredicto` | CDP saturado o caído (`connect_over_cdp: Timeout`) | no es página mala: el supervisor la deja sin veredicto y sigue. Podar pestañas o reabrir Chrome |
| Muchas `page-builder` abiertas, 96 targets | pestañas huérfanas de corridas antiguas | no se cierran desde los scripts (`AGENTS.md`): el driver reutiliza la de su carril; las sobrantes las cierra el propietario |
| `El clon no apareció con su nombre` | nombre tocado en GHL o carrera de clones | relanzar; a propósito no se acepta un id ajeno |
| URL con `-811950`, `ruta` en rojo | path ya usado en la location | reparar **solo** esa página con `--force --servicio` |
| `FALLA limpieza` en contenido | embed del otro servicio | `--force --servicio limpieza` para esa comunidad |
| `exit 124` | el supervisor mató al driver tras `--corte` (900 s) | no es fallo: el driver reanuda por fast-path |
| `exit 2` del supervisor | sin CDP | reabrir Chrome con la bandera |
| `exit 3` del carril 1 | el carril 0 no tiene latido | relanzar el 0 y esperar su primera tanda |
| `BLOQUEADA tras 5 intentos` | fallo real de la página | revisión manual, no insistir en bucle |

#### 5. Cerrar (verde de verdad)

```bash
cd Comunidades
python scripts/verificar-contenido.py --only <mun/com>
python scripts/auditar-publicadas.py --only <mun/com>
```

El supervisor ya lo hace por tanda y lo anota en `progress.md`. `publicado` solo se
escribe si **las dos** URLs sirven su contenido en ese momento; un `exit 0` de uno
solo de los dos scripts no cierra nada.

#### 6. Reglas que no se negocian

1. Un driver por pestaña; dos carriles como máximo y con reparto.
2. Reparar solo la página que falla (`--force --servicio`), nunca la hermana.
3. Ni se cierra ni se reinicia el Chrome del propietario, ni sus pestañas, desde
   los scripts: se reutiliza la pestaña del carril.
4. Cuatro carriles, `colero.py` y republicar "para arreglar" sin mirar el gate,
   fuera: cada uno ya costó una tanda.

### El hero propio no lo pone el driver

La foto de cada comunidad se sirve desde la Media Library, no por ruta relativa:
el embed que se pega en GHL solo lleva URLs absolutas. Por eso el orden es

1. `node scripts/generar-landings.mjs` — PNG a WebP y regenera las 1112 landings.
2. `node scripts/preparar-funnel-ghl.mjs --only <clave> --upload` — sube el WebP
   y reescribe `data/ghl/funnels/<mun>/<slug>.json`. Sin este paso la página se
   publica con la foto compartida aunque el WebP exista (pasó con Mansiones
   Monte Verde: canonical y 200 correctos, hero ajeno).
3. `python scripts/alta-funnel-ghl.py --only <clave>` — publica con ese payload.

`lote-automatico.py` ya encadena 1 y 2 en `refrescar_cola()` para cada tanda.
Para rehacer una comunidad ya publicada, el driver acepta `--force`: sin él la
salta porque el ledger dice `publicado`. `preparar-funnel-ghl.mjs` conserva ese
estado al rehacer el índice; antes lo pisaba con `pendiente` y la comunidad
desaparecía del recuento.

## 9. Auditoría por landing (checklist obligatorio)

Esta es la lista que se corre **al terminar cada landing**, antes de tocar la
siguiente. Todo lo que está marcado *gate* lo ejecuta el driver solo y aborta la
comunidad si algo falla; lo marcado *driver* se comprueba en el flujo (Settings,
publish, contenido); lo marcado *manual* es la revisión visual que se hace una vez
por comunidad.

| # | Check | Criterio | Cómo |
|---|---|---|---|
| 1 | Ruta | `/municipio/comunidad/servicio`, **sin números** ni sufijos | `ruta` (gate) |
| 2 | Dominio | `domainId` = `IUZElP3hZ60dszBHym8l` y la URL responde 200 | `domain_id()` + `status` |
| 3 | Settings | nombre, path del funnel, favicon, head y body releídos tras `Save` | `set_settings()` (driver) |
| 4 | Chat | widget `Ilatek` activo en el funnel | `chat` (gate) |
| 5 | Embed | el HTML es **el del proyecto** para esa comunidad y servicio (H1 propio, no el de la plantilla) | `h1` + `servicio` (gate) + `publicada_con()` |
| 6 | Título | `<title>` con la comunidad | `title` (gate) |
| 7 | Favicon | `6ab044d04091fa65e69921f6` | `favicon` (gate) |
| 8 | Tracking | GTM `GTM-PQMR2TDB`, GA4 `G-BTVFHT1X8G`, Meta Pixel `2092249571384387` | `gtm`, `ga4`, `pixel` (gate) |
| 9 | Texto | sin mojibake (`Ã`, `Â`, `â€`) | `mojibake` (gate) |
| 10 | Peso | > 120 KB (embed completo) | `peso` (gate) |
| 11 | Imagen social | `og:image` es el **screenshot de esa página**: sellado para techos, limpieza para limpieza | `og`, `og_imagen` (gate) |
| 12 | Sin duplicado | `…-page` responde 404 | `sin_page` (gate) |
| 13 | Móvil · ancho | hero, banda y cierre de 0 al ancho real y `docW = vw` | `movil_ancho` (gate, 360/390/430) |
| 14 | Móvil · inset | H1 y tarjetas a 18 px del canto | `movil_inset` (gate) |
| 15 | Móvil · scroll | al bajar del todo el pie termina en el borde; el globo del chat no tapa logo/redes/crédito | `movil_scroll` (gate) + captura |
| 16 | Ledger | `index.json` pasa a `publicado` **solo** con todo lo anterior en verde | `actualizar_ledger()` |

Extra que se revisa a ojo en la primera community de cada tanda: que el hero y
el H1 sean los de **esa** comunidad (no los de Isla Verde), que la banda de CTA
llegue a los dos cantos y que la imagen social se vea con el hero correcto.

La lista se ejecuta sola:

```bash
cd Comunidades
python scripts/auditar-publicadas.py                        # todas las publicadas
python scripts/auditar-publicadas.py --only carolina/isla-verde
python scripts/auditar-publicadas.py --todas                # incluye pendientes
```

Imprime `OK/FALLA`, el marcador `n/18` y qué punto de esta lista falló; sale con
código 1 si algo no está en verde y con **código 2 si el filtro no devuelve
ninguna landing** (un typo en `--only` o un ledger vacío no son un aprobado). Usa
una sola pestaña y la deja abierta.

Última corrida (2026-11-01, tras la tanda 12 con las 33 comunidades):
**66/66 landings, 18/18 checks cada una** (`exit 0`).

El check de *embed* del auditor compara el largo publicado contra el del payload
de **esa** página (`sellado-de-techo` ≠ `limpieza`), así que una página con el
embed de su hermana sale en rojo. Verificación manual del 2026-11-01 en Residences
at Rio, por si hay que repetirla a mano: embed publicado = embed del payload
(25 048 / 24 554 chars), `h1`/`title` del servicio correcto, `og:image` distinta
(la del screenshot de cada página) y ningún bloque del servicio hermano en el
cuerpo; las únicas frases compartidas entre las dos páginas son boilerplate
(tokens CSS, script de revelado y nota de tipo de comunidad).

Quirk conocido, solo cosmético: en la API de GHL el *step* del funnel de Limpieza
suele conservar el nombre `Sellado de techo` (`/sellado-de-techo-1452`), igual en
Isla Verde, Hacienda Buena y Residences at Rio. El path público y el contenido
publicados son los de limpieza; el nombre del step no se publica.

Dos cosas que también forman parte del proceso:

- El payload de cada página se guarda **en cuanto se sube su imagen social**
  (`guardar_payload`), no al final: si el run muere a mitad, la auditoría no
  marca un fallo falso por comparar contra un JSON viejo.
- El `save_publish` espera 12 s después del `Save` y el `og:image` se verifica en
  la página viva con ventana de 240 s; el driver no da por buena una landing
  hasta verlo.

## 9.b Verificación de contenido (cierre obligatorio de cada tanda)

La auditoría de la sección 9 mira **estructura**: ruta, dominio, chat, tracking,
peso, móvil. No dice si el cuerpo publicado es el de **esa** página. Eso lo
comprueba `scripts/verificar-contenido.py`, que es el paso de cierre de cada
tanda y sustituye al script de usar y tirar (`.tmp-contenido-*.py`) que se
reescribía y borraba tanda tras tanda.

```bash
cd Comunidades
python scripts/verificar-contenido.py                # todas las publicadas
python scripts/verificar-contenido.py --only dorado/the-isles --only dorado/the-legacy
python scripts/verificar-contenido.py --list .tmp-tanda.txt   # una comunidad por línea
```

Solo verifica lo que el ledger da por `publicado`: una comunidad pendiente en la
lista sale como aviso y se omite (`--list .tmp-pendientes.txt` no sirve, ese
archivo es la cola de lo que **falta**).

Por página comprueba cuatro cosas:

| Check | Criterio |
|---|---|
| Embed propio | el HTML del payload de **esa** página aparece **verbatim** en la página viva |
| Servicio hermano | 0 frases exclusivas del otro servicio de la misma comunidad |
| Vecinas | 0 frases exclusivas de otra comunidad del municipio con el mismo servicio |
| Imagen social | `og:image` presente y distinta de la de **cualquier** otra página comprobada |

Las frases solo cubren lo que la identidad exacta no ve (texto de otra página
pegado sin su embed) y se comparan **solo si son exclusivas** de la otra página:
las de plantilla (CTA, pie, aviso) se repiten a propósito.

La identidad exacta es la que cierra el hueco del método anterior: comparar "al
menos 3 frases propias presentes" dejaba pasar un payload editado cuando la
mayoría de sus frases seguía en vivo. Ahora una sola palabra cambiada en el
payload hace que el embed publicado deje de coincidir → rojo. Comprobado el
2026-11-01 contra las páginas vivas de The Isles, sustituyendo su payload por el
de The Enclave (falla) y alterando una palabra del suyo (falla).

Códigos de salida, los mismos que el auditor: **0** todo verde, **1** alguna
página con fallo, **2** el filtro no devolvió ninguna página (un typo en `--only`
no es un aprobado). Solo hace HTTP: no necesita el Chrome de GHL ni Playwright.

```bash
python scripts/tests/test_verificar_contenido.py      # contrato de la pieza
```

Los tests fijan el contrato en tabla: página correcta y con texto de plantilla
pasan; embed de la hermana, payload con una frase alterada, texto de la vecina
pegado, payload sin embed, og repetida y filtro vacío fallan.

Última corrida (2026-11-01, tras la tanda 12): **66/66 páginas en verde** sobre las
33 comunidades publicadas, `exit 0`, 66 `og:image` distintas. Tests: **8/8**.

El check de vecinas es por **municipio**, que es donde el cruce es probable (mismo
servicio, nombre y copy hermanos). Cuando una tanda cambia de municipio, la
identidad verbatim ya prueba que el embed es el de su payload; el cruce contra el
municipio anterior se hace a mano con los helpers de la pieza (`exclusivas`,
`texto_plano`) sobre la página viva, como en la tanda 10 (Fajardo vs. las 10
comunidades de Dorado: 0 frases).
