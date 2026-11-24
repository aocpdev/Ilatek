# Prompt para el agente que publica el sitio Ilatek en GoHighLevel

Copia todo lo que hay debajo de la línea y dáselo a un agente con control del navegador (Computer Use, Playwright o el navegador con la sesión de GoHighLevel ya iniciada).

---

Trabajas dentro de GoHighLevel y publicas páginas web. Tu tarea es pegar, una por una, las 106 páginas preparadas de un lote en el sitio **ilatekpr.com**, dejando cada una publicada y comprobada. No diseñas, no traduces, no editas contenido: **pegas lo que hay en el archivo, tal cual, y publicas**.

## 0. Lo que tienes que saber antes de tocar nada

- La sesión de GoHighLevel ya está abierta en el navegador. Subcuenta (location): **XG0ggFh3pBPpA5s0Pe37**. Antes de empezar, comprueba que la barra de direcciones de GHL contiene ese id; si no coincide o hay otra subcuenta seleccionada, **detente y avisa**.
- Dominio de destino: **https://ilatekpr.com**. No cambies el dominio, no añadas www, no toques DNS ni el dominio personalizado.
- El lote está en el equipo, en `Ilatek/GHL-PUBLICAR/lote-sitio/`. Hay 106 carpetas, una por página, dentro de `por-pagina/`. Cada carpeta tiene dos archivos:
  - `1-PAGINA.txt` → metadatos: nombre en GHL, slug, URL, acción (REPUBLICAR o CREAR), estado de hoy, hash, origen en el repo. **No se pega**: sirve para saber el nombre y el slug.
  - `2-CODIGO-CUSTOM-HTML.html` → el código completo. **Es lo único que se pega**, entero, del primer carácter al último.
- El orden de trabajo es `Ilatek/GHL-PUBLICAR/lote-sitio/00-CHECKLIST.csv`, columna `n`, de menor a mayor. Las filas 6 y 7 ya no existen (se retiraron dos páginas de prueba), así que la numeración salta de 5 a 8. La lista completa, con carpeta y URL de cada fila, está al final de este prompt.
- Resumen del lote: **49 REPUBLICAR** (hoy responden HTTP 200 con el HTML viejo) y **57 CREAR** (hoy responden HTTP 404). Nunca borres una página existente ni cambies el slug de una página existente.

## 1. Reglas duras (si dudas, para y pregunta)

1. **Pegar exacto.** Abre `2-CODIGO-CUSTOM-HTML.html` con un editor de texto, Ctrl+A, Ctrl+C y pega en el editor de GHL. No reformatees, no limpies espacios, no traduzcas, no quites comentarios, no cambies comillas ni signos.
2. **Un solo bloque por página.** El código va dentro del elemento Custom HTML/JavaScript existente (REPUBLICAR) o en uno nuevo (CREAR). No lo repartas en varios bloques y no lo pongas en el HEADER de la página.
3. **No toques el header ni el footer del tema.** Título, descripción, footer global y scripts de GHL se quedan como están. El código pegado ya trae su propio footer; si activas el footer del tema saldrá duplicado.
4. **No crees custom fields ni custom values.** No toques formularios, webhooks, calendarios, contactos ni automatizaciones.
5. **No toques el menú ni el footer del código pegado.** Si algo del menú o del footer se ve mal, no lo corrijas a mano en GHL: anótalo y sigue. El lote se corrige en el repo, no en GHL.
6. **Ningún correo.** No envíes correos ni notificaciones por ninguna vía, ni de prueba a ti mismo.
7. **Paso a paso.** Termina una página completa (pegar, guardar, publicar, comprobar URL) antes de empezar la siguiente. No dejes dos a medias.

## 2. Cómo republicar una página existente (49 filas REPUBLICAR)

1. En GHL: **Sites → Websites → pestaña Pages**. Busca la página por su nombre, que siempre empieza por `Sitio - `; el nombre exacto está en el campo `Nombre en GHL` de `1-PAGINA.txt`.
2. Ábrela con **⋯ → Edit** (no Preview, no Settings).
3. En el editor, localiza el elemento **Custom HTML / Custom JavaScript** que contiene el menú del sitio (es el bloque grande). Haz clic en él y abre **Custom Code → Open Code Editor**.
4. Dentro del editor: **Ctrl+A** y **Supr** hasta dejarlo vacío. Comprueba que quedó vacío de verdad arrastrando la barra hasta el final.
5. **Ctrl+V** con el contenido de `2-CODIGO-CUSTOM-HTML.html`. Espera: los archivos pesan entre 20 y 620 KB y el editor tarda en asentar el texto. No escribas nada mientras pega.
6. Comprueba que el pegado está completo: la primera línea y la última del archivo deben aparecer igual en el editor (Ctrl+Inicio y Ctrl+Fin). Si falta un trozo, borra todo y pega otra vez.
7. **Save** arriba a la derecha y espera a que desaparezca el aviso de guardado. Después **Publish** y confirma en el diálogo.
8. Abre `https://ilatekpr.com/<slug>` en una pestaña nueva y haz la comprobación del punto 4. Si sigues viendo el menú viejo, es caché de GHL: pulsa **Publish** una vez más y recarga con Ctrl+F5.

## 3. Cómo crear una página nueva (57 filas CREAR)

1. En GHL: **Sites → Websites → Pages → + New Page** (o el botón equivalente de la subcuenta).
2. Nombre de la página: el del campo `Nombre en GHL` de su `1-PAGINA.txt`, exacto (por ejemplo `Sitio - Garantia (EN)`). Ese nombre es solo interno.
3. Path/slug: el de la columna `slug` del checklist (`garantia`, `en/garantia`, `en/home`, …). Sin barra inicial, sin `.html`, todo en minúsculas y con guiones. La única excepción es la home raíz, marcada `(raíz)`, que va con `/`.
4. Elige plantilla en blanco (empty page). **No** añadas header, footer ni secciones del tema.
5. Añade un elemento **Custom HTML/JavaScript**, abre su **Custom Code → Open Code Editor** y pega el archivo entero como en el punto 2, pasos 4 a 7.
6. Publica y abre la URL: debe responder 200 y verse el menú nuevo.

## 4. Qué comprobar en cada página tras publicar (10 segundos)

- **Menú:** cinco ítems completos y visibles (Servicios, Blog, Comunidades, Reseñas, Trabajos, Nosotros, según el idioma), **ninguno recortado**, y el enlace **Blog** funciona.
- **Toggle ES/EN:** una sola vez, junto al botón de login, con la etiqueta del idioma contrario (`EN` en páginas ES, `ES` en páginas EN). Al pulsarlo debe llevar a su gemela y **nunca** a `/error-ilatek-404`.
- **Clima:** sol de día o luna con fase de noche, en las páginas que lo llevan (el `1-PAGINA.txt` lo indica en `Sección de clima`).
- **Footer:** completo, con enlaces y redes, una sola vez.
- **Móvil** (solo en la 001, la 027, la 053 y una EN al azar): la hamburguesa abre y cierra el panel.

Si algo falla, no lo arregles en GHL: apunta `n`, slug y qué viste, y sigue con la siguiente.

## 5. Registro del avance

Mantén `Ilatek/GHL-PUBLICAR/publicadas.csv` con las columnas `n;slug;accion;estado;http;nota`, una fila por página y en el mismo orden del checklist:

- `estado`: `publicada` o `fallo`.
- `http`: el código que devolvió la URL al abrirla después de publicar (200 esperado; 404 significa que no quedó publicada o que el slug está mal).
- `nota`: solo si hubo algo raro (caché, editor lento, menú recortado, toggle ausente).

Guarda ese archivo tras cada página. Si el proceso se corta, retómalo leyéndolo: no repitas las que ya estén en `publicada` con HTTP 200.

## 6. Cuándo parar y avisar (no adivines)

- La subcuenta de GHL no es `XG0ggFh3pBPpA5s0Pe37`.
- Una página existente no aparece por su nombre, o hay dos con el mismo nombre.
- GHL pide algo que no está en el lote: slug ocupado por otra página, plan o upgrade, verificación, CAPTCHA.
- El editor no admite el archivo completo y se trunca dos veces seguidas.
- Error 500 repetido al publicar.

En esos casos detente, describe la página (`n` y slug), lo que viste y qué opción elegirías, y espera instrucciones.

## 7. Informe final que debes entregar

1. Tabla de las 106 filas: `n | slug | acción | HTTP tras publicar | estado`.
2. Totales: publicadas, fallidas, no intentadas.
3. Páginas que siguen dando 404 y por qué (slug ocupado, editor, caché).
4. Confirmación de que no se tocó header, footer del tema, custom fields, formularios, webhooks ni correos.
5. Si tienes terminal en el equipo, cierra con estas dos comprobaciones y pega su salida:
   - `node tools/verify-nav.mjs` → debe terminar en `total de fallos: 0`.
   - `node tools/verify-nav-live.mjs` con las rutas del lote → el cuadre esperado al terminar es `A 0 + B 0 + C 0 + D 106 = 106`; cualquier letra distinta de 0 señala páginas sin publicar (B), sin republicar (C) o con el menú recortado (A).

## 8. Aviso sobre el idioma en tres páginas legales

En `/garantia`, `/politica`, `/terminos` y sus versiones `/en/...` el menú puede mostrarse en el idioma guardado del visitante en vez del de la URL. Es un defecto conocido del motor de traducción de esas páginas, no del pegado: publícalas igual y anótalo en la nota. No intentes corregirlo editando el código en GHL.

## 9. Lista completa y ordenada (106 páginas)

```
001  REPUBLICAR por-pagina/001-inicio                                  + (raíz)  ->  https://ilatekpr.com/
002  REPUBLICAR por-pagina/002-airbnb-turnover                         + airbnb-turnover  ->  https://ilatekpr.com/airbnb-turnover
003  REPUBLICAR por-pagina/003-alfombras                               + alfombras  ->  https://ilatekpr.com/alfombras
004  REPUBLICAR por-pagina/004-canaletas-y-bajantes                    + canaletas-y-bajantes  ->  https://ilatekpr.com/canaletas-y-bajantes
005  CREAR      por-pagina/005-comunidades                             + comunidades  ->  https://ilatekpr.com/comunidades
006  REPUBLICAR por-pagina/008-electrodomesticos                       + electrodomesticos  ->  https://ilatekpr.com/electrodomesticos
007  REPUBLICAR por-pagina/009-empozamiento-de-techos                  + empozamiento-de-techos  ->  https://ilatekpr.com/empozamiento-de-techos
008  REPUBLICAR por-pagina/010-garantia                                + garantia  ->  https://ilatekpr.com/garantia
009  REPUBLICAR por-pagina/011-impermeabilizacion-de-techos            + impermeabilizacion-de-techos  ->  https://ilatekpr.com/impermeabilizacion-de-techos
010  REPUBLICAR por-pagina/012-inspeccion-de-techos                    + inspeccion-de-techos  ->  https://ilatekpr.com/inspeccion-de-techos
011  REPUBLICAR por-pagina/013-inspeccion-y-mantenimiento-de-techos    + inspeccion-y-mantenimiento-de-techos  ->  https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos
012  REPUBLICAR por-pagina/014-instalacion-y-reemplazo-de-techos       + instalacion-y-reemplazo-de-techos  ->  https://ilatekpr.com/instalacion-y-reemplazo-de-techos
013  REPUBLICAR por-pagina/015-lavado-a-presion                        + lavado-a-presion  ->  https://ilatekpr.com/lavado-a-presion
014  REPUBLICAR por-pagina/016-lavado-a-presion-techos                 + lavado-a-presion-techos  ->  https://ilatekpr.com/lavado-a-presion-techos
015  REPUBLICAR por-pagina/017-limpieza-comercial                      + limpieza-comercial  ->  https://ilatekpr.com/limpieza-comercial
016  REPUBLICAR por-pagina/018-limpieza-de-mudanza                     + limpieza-de-mudanza  ->  https://ilatekpr.com/limpieza-de-mudanza
017  REPUBLICAR por-pagina/019-limpieza-de-techos-y-canaletas          + limpieza-de-techos-y-canaletas  ->  https://ilatekpr.com/limpieza-de-techos-y-canaletas
018  REPUBLICAR por-pagina/020-limpieza-estandar                       + limpieza-estandar  ->  https://ilatekpr.com/limpieza-estandar
019  REPUBLICAR por-pagina/021-limpieza-industrial                     + limpieza-industrial  ->  https://ilatekpr.com/limpieza-industrial
020  REPUBLICAR por-pagina/022-limpieza-profunda                       + limpieza-profunda  ->  https://ilatekpr.com/limpieza-profunda
021  REPUBLICAR por-pagina/023-limpieza-residencial                    + limpieza-residencial  ->  https://ilatekpr.com/limpieza-residencial
022  REPUBLICAR por-pagina/024-mantenimiento-de-techos                 + mantenimiento-de-techos  ->  https://ilatekpr.com/mantenimiento-de-techos
023  REPUBLICAR por-pagina/025-membrana-asfaltica                      + membrana-asfaltica  ->  https://ilatekpr.com/membrana-asfaltica
024  REPUBLICAR por-pagina/026-organizacion                            + organizacion  ->  https://ilatekpr.com/organizacion
025  CREAR      por-pagina/027-politica                                + politica  ->  https://ilatekpr.com/politica
026  REPUBLICAR por-pagina/028-post-construccion                       + post-construccion  ->  https://ilatekpr.com/post-construccion
027  REPUBLICAR por-pagina/029-recubrimiento-elastomerico              + recubrimiento-elastomerico  ->  https://ilatekpr.com/recubrimiento-elastomerico
028  REPUBLICAR por-pagina/030-reparacion-de-filtraciones              + reparacion-de-filtraciones  ->  https://ilatekpr.com/reparacion-de-filtraciones
029  REPUBLICAR por-pagina/031-reparacion-de-goteras                   + reparacion-de-goteras  ->  https://ilatekpr.com/reparacion-de-goteras
030  REPUBLICAR por-pagina/032-reparacion-de-grietas-techos            + reparacion-de-grietas-techos  ->  https://ilatekpr.com/reparacion-de-grietas-techos
031  REPUBLICAR por-pagina/033-reparacion-de-techos                    + reparacion-de-techos  ->  https://ilatekpr.com/reparacion-de-techos
032  REPUBLICAR por-pagina/034-reparacion-post-huracan                 + reparacion-post-huracan  ->  https://ilatekpr.com/reparacion-post-huracan
033  REPUBLICAR por-pagina/035-resenas                                 + resenas  ->  https://ilatekpr.com/resenas
034  REPUBLICAR por-pagina/036-sellado-acrilico                        + sellado-acrilico  ->  https://ilatekpr.com/sellado-acrilico
035  REPUBLICAR por-pagina/037-sellado-de-poliuretano                  + sellado-de-poliuretano  ->  https://ilatekpr.com/sellado-de-poliuretano
036  REPUBLICAR por-pagina/038-sellado-de-silicona                     + sellado-de-silicona  ->  https://ilatekpr.com/sellado-de-silicona
037  REPUBLICAR por-pagina/039-sellado-de-techos                       + sellado-de-techos  ->  https://ilatekpr.com/sellado-de-techos
038  REPUBLICAR por-pagina/040-sellado-de-techos-comercial             + sellado-de-techos-comercial  ->  https://ilatekpr.com/sellado-de-techos-comercial
039  REPUBLICAR por-pagina/041-sellado-de-techos-industrial            + sellado-de-techos-industrial  ->  https://ilatekpr.com/sellado-de-techos-industrial
040  REPUBLICAR por-pagina/042-sellado-de-techos-residencial           + sellado-de-techos-residencial  ->  https://ilatekpr.com/sellado-de-techos-residencial
041  REPUBLICAR por-pagina/043-servicios                               + servicios  ->  https://ilatekpr.com/servicios
042  REPUBLICAR por-pagina/044-servicios-techos                        + servicios-techos  ->  https://ilatekpr.com/servicios-techos
043  CREAR      por-pagina/045-techos                                  + techos  ->  https://ilatekpr.com/techos
044  REPUBLICAR por-pagina/046-techos-de-asfalto                       + techos-de-asfalto  ->  https://ilatekpr.com/techos-de-asfalto
045  REPUBLICAR por-pagina/047-techos-de-concreto                      + techos-de-concreto  ->  https://ilatekpr.com/techos-de-concreto
046  REPUBLICAR por-pagina/048-techos-de-madera                        + techos-de-madera  ->  https://ilatekpr.com/techos-de-madera
047  REPUBLICAR por-pagina/049-techos-de-teja                          + techos-de-teja  ->  https://ilatekpr.com/techos-de-teja
048  REPUBLICAR por-pagina/050-techos-de-zinc                          + techos-de-zinc  ->  https://ilatekpr.com/techos-de-zinc
049  REPUBLICAR por-pagina/051-techos-planos                           + techos-planos  ->  https://ilatekpr.com/techos-planos
050  REPUBLICAR por-pagina/052-techos-por-segmento                     + techos-por-segmento  ->  https://ilatekpr.com/techos-por-segmento
051  CREAR      por-pagina/053-terminos                                + terminos  ->  https://ilatekpr.com/terminos
052  REPUBLICAR por-pagina/054-tragaluces                              + tragaluces  ->  https://ilatekpr.com/tragaluces
053  REPUBLICAR por-pagina/055-ventanas                                + ventanas  ->  https://ilatekpr.com/ventanas
054  CREAR      por-pagina/056-en-airbnb-turnover                      + en/airbnb-turnover  ->  https://ilatekpr.com/en/airbnb-turnover
055  CREAR      por-pagina/057-en-alfombras                            + en/alfombras  ->  https://ilatekpr.com/en/alfombras
056  CREAR      por-pagina/058-en-canaletas-y-bajantes                 + en/canaletas-y-bajantes  ->  https://ilatekpr.com/en/canaletas-y-bajantes
057  CREAR      por-pagina/059-en-communities                          + en/communities  ->  https://ilatekpr.com/en/communities
058  CREAR      por-pagina/060-en-electrodomesticos                    + en/electrodomesticos  ->  https://ilatekpr.com/en/electrodomesticos
059  CREAR      por-pagina/061-en-empozamiento-de-techos               + en/empozamiento-de-techos  ->  https://ilatekpr.com/en/empozamiento-de-techos
060  CREAR      por-pagina/062-en-garantia                             + en/garantia  ->  https://ilatekpr.com/en/garantia
061  CREAR      por-pagina/063-en-home                                 + en/home  ->  https://ilatekpr.com/en/home
062  CREAR      por-pagina/064-en-impermeabilizacion-de-techos         + en/impermeabilizacion-de-techos  ->  https://ilatekpr.com/en/impermeabilizacion-de-techos
063  CREAR      por-pagina/065-en-inspeccion-de-techos                 + en/inspeccion-de-techos  ->  https://ilatekpr.com/en/inspeccion-de-techos
064  CREAR      por-pagina/066-en-inspeccion-y-mantenimiento-de-techos + en/inspeccion-y-mantenimiento-de-techos  ->  https://ilatekpr.com/en/inspeccion-y-mantenimiento-de-techos
065  CREAR      por-pagina/067-en-instalacion-y-reemplazo-de-techos    + en/instalacion-y-reemplazo-de-techos  ->  https://ilatekpr.com/en/instalacion-y-reemplazo-de-techos
066  CREAR      por-pagina/068-en-lavado-a-presion                     + en/lavado-a-presion  ->  https://ilatekpr.com/en/lavado-a-presion
067  CREAR      por-pagina/069-en-lavado-a-presion-techos              + en/lavado-a-presion-techos  ->  https://ilatekpr.com/en/lavado-a-presion-techos
068  CREAR      por-pagina/070-en-limpieza-comercial                   + en/limpieza-comercial  ->  https://ilatekpr.com/en/limpieza-comercial
069  CREAR      por-pagina/071-en-limpieza-de-mudanza                  + en/limpieza-de-mudanza  ->  https://ilatekpr.com/en/limpieza-de-mudanza
070  CREAR      por-pagina/072-en-limpieza-de-techos-y-canaletas       + en/limpieza-de-techos-y-canaletas  ->  https://ilatekpr.com/en/limpieza-de-techos-y-canaletas
071  CREAR      por-pagina/073-en-limpieza-estandar                    + en/limpieza-estandar  ->  https://ilatekpr.com/en/limpieza-estandar
072  CREAR      por-pagina/074-en-limpieza-industrial                  + en/limpieza-industrial  ->  https://ilatekpr.com/en/limpieza-industrial
073  CREAR      por-pagina/075-en-limpieza-profunda                    + en/limpieza-profunda  ->  https://ilatekpr.com/en/limpieza-profunda
074  CREAR      por-pagina/076-en-limpieza-residencial                 + en/limpieza-residencial  ->  https://ilatekpr.com/en/limpieza-residencial
075  CREAR      por-pagina/077-en-mantenimiento-de-techos              + en/mantenimiento-de-techos  ->  https://ilatekpr.com/en/mantenimiento-de-techos
076  CREAR      por-pagina/078-en-membrana-asfaltica                   + en/membrana-asfaltica  ->  https://ilatekpr.com/en/membrana-asfaltica
077  CREAR      por-pagina/079-en-organizacion                         + en/organizacion  ->  https://ilatekpr.com/en/organizacion
078  CREAR      por-pagina/080-en-politica                             + en/politica  ->  https://ilatekpr.com/en/politica
079  CREAR      por-pagina/081-en-post-construccion                    + en/post-construccion  ->  https://ilatekpr.com/en/post-construccion
080  CREAR      por-pagina/082-en-recubrimiento-elastomerico           + en/recubrimiento-elastomerico  ->  https://ilatekpr.com/en/recubrimiento-elastomerico
081  CREAR      por-pagina/083-en-reparacion-de-filtraciones           + en/reparacion-de-filtraciones  ->  https://ilatekpr.com/en/reparacion-de-filtraciones
082  CREAR      por-pagina/084-en-reparacion-de-goteras                + en/reparacion-de-goteras  ->  https://ilatekpr.com/en/reparacion-de-goteras
083  CREAR      por-pagina/085-en-reparacion-de-grietas-techos         + en/reparacion-de-grietas-techos  ->  https://ilatekpr.com/en/reparacion-de-grietas-techos
084  CREAR      por-pagina/086-en-reparacion-de-techos                 + en/reparacion-de-techos  ->  https://ilatekpr.com/en/reparacion-de-techos
085  CREAR      por-pagina/087-en-reparacion-post-huracan              + en/reparacion-post-huracan  ->  https://ilatekpr.com/en/reparacion-post-huracan
086  CREAR      por-pagina/088-en-resenas                              + en/resenas  ->  https://ilatekpr.com/en/resenas
087  CREAR      por-pagina/089-en-sellado-acrilico                     + en/sellado-acrilico  ->  https://ilatekpr.com/en/sellado-acrilico
088  CREAR      por-pagina/090-en-sellado-de-poliuretano               + en/sellado-de-poliuretano  ->  https://ilatekpr.com/en/sellado-de-poliuretano
089  CREAR      por-pagina/091-en-sellado-de-silicona                  + en/sellado-de-silicona  ->  https://ilatekpr.com/en/sellado-de-silicona
090  CREAR      por-pagina/092-en-sellado-de-techos                    + en/sellado-de-techos  ->  https://ilatekpr.com/en/sellado-de-techos
091  CREAR      por-pagina/093-en-sellado-de-techos-comercial          + en/sellado-de-techos-comercial  ->  https://ilatekpr.com/en/sellado-de-techos-comercial
092  CREAR      por-pagina/094-en-sellado-de-techos-industrial         + en/sellado-de-techos-industrial  ->  https://ilatekpr.com/en/sellado-de-techos-industrial
093  CREAR      por-pagina/095-en-sellado-de-techos-residencial        + en/sellado-de-techos-residencial  ->  https://ilatekpr.com/en/sellado-de-techos-residencial
094  CREAR      por-pagina/096-en-servicios                            + en/servicios  ->  https://ilatekpr.com/en/servicios
095  CREAR      por-pagina/097-en-servicios-techos                     + en/servicios-techos  ->  https://ilatekpr.com/en/servicios-techos
096  CREAR      por-pagina/098-en-techos                               + en/techos  ->  https://ilatekpr.com/en/techos
097  CREAR      por-pagina/099-en-techos-de-asfalto                    + en/techos-de-asfalto  ->  https://ilatekpr.com/en/techos-de-asfalto
098  CREAR      por-pagina/100-en-techos-de-concreto                   + en/techos-de-concreto  ->  https://ilatekpr.com/en/techos-de-concreto
099  CREAR      por-pagina/101-en-techos-de-madera                     + en/techos-de-madera  ->  https://ilatekpr.com/en/techos-de-madera
100  CREAR      por-pagina/102-en-techos-de-teja                       + en/techos-de-teja  ->  https://ilatekpr.com/en/techos-de-teja
101  CREAR      por-pagina/103-en-techos-de-zinc                       + en/techos-de-zinc  ->  https://ilatekpr.com/en/techos-de-zinc
102  CREAR      por-pagina/104-en-techos-planos                        + en/techos-planos  ->  https://ilatekpr.com/en/techos-planos
103  CREAR      por-pagina/105-en-techos-por-segmento                  + en/techos-por-segmento  ->  https://ilatekpr.com/en/techos-por-segmento
104  CREAR      por-pagina/106-en-terminos                             + en/terminos  ->  https://ilatekpr.com/en/terminos
105  CREAR      por-pagina/107-en-tragaluces                           + en/tragaluces  ->  https://ilatekpr.com/en/tragaluces
106  CREAR      por-pagina/108-en-ventanas                             + en/ventanas  ->  https://ilatekpr.com/en/ventanas
```
