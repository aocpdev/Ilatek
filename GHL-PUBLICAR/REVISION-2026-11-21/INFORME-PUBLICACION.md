# Informe de publicación — lote de 106 artefactos

**Fecha:** 2026-11-21 · **HEAD:** c577d51 · **Sin commit, push, PR, merge ni publicación en GHL.**

## 1. Veredicto

Los **106 artefactos están listos para publicar**. Cada carpeta se pega como **un solo embed**; el home son dos páginas distintas (ES y EN).

| Comprobación | Resultado |
|---|---|
| Carpetas con exactamente manifiesto + embed | **106/106** |
| sha256 y KB del embed vs 1-PAGINA.txt | **106/106 coinciden, 0 desajustes** |
| 1-PAGINA.txt con URL y acción | **106/106** (49 REPUBLICAR + 57 CREAR PÁGINA) |
| FAQPage por página | **106/106 (exactamente 1)** · **1011** preguntas · **0** divergentes |
| Tokens custom_values / dv-ghl-values | **18559** tokens · **106/106** con dv-ghl-values |
| Footer nuevo: «Explora» + /servicios + /techos con data-ilatek-path y rejilla 2 col. | **106/106** |
| Menú / pie únicos por embed | **106/106 (1 y 1)** |
| Copy retirado (ilcl-form, «Recibe tu precio», «inspección gratis», pie², ilf-brand, «Oportunidades», tarjetas) | **0 en los 106** |
| section/script/div balanceados | **106/106** (1013 secciones, 1510 scripts) |
| Referencias @main/assets/… existentes en HEAD | **390 referencias · 28 URLs · 28/28 en HEAD** |

### Cambios de este turno

- **001 y 063** se regeneraron tras corregir el typo FAQ comienzdesde → comienza desde y restaurar la idempotencia del HEAD. Sus hashes actuales son **e088bea8c31c** y **6ebbe53a08ee**.
- **Los otros 104 artefactos no cambiaron**: el diff de los 106 sha antes/después solo tiene las líneas de 001 y 063.
- **Reparaciones del turno:** `apply-page-shell` corrigió el shell de la home EN (40 caracteres), `apply-internal-links` restauró los atributos de localización del HEAD y el typo `comienzdesde` se corrigió a `comienza desde` en la home ES. Después de eso, `verify-page-shell`, `verify-internal-links` y `faq-parity` del lote quedaron en **0**.
- **HEAD ES/EN:** las copias `HEAD-home-es.html` y `HEAD-home-en.html` se actualizaron con los `data-ilatek-local-content` que exige `formatPage`; `apply-internal-links` dio **0 files** en la segunda pasada.
- No se modificó ningún archivo versionado de blog/ ni se regeneraron landings de Comunidades/. Fase 2 (FAQ de Comunidades, acordeones legales, detector del home) **no se ejecutó**.

| Artefacto | sha al inicio del turno | sha al cierre |
|---|---|---|
| 001-inicio | 3e173df05571 | e088bea8c31c |
| 063-en-home | 8b1a711e2a93 | 6ebbe53a08ee |
| Los otros 104 | sin cambio | sin cambio |

## 2. Qué se pega en cada página

1. GHL → la página del nombre indicado.
2. Elemento **Custom HTML/JavaScript** → **Custom Code** → **Open Code Editor**.
3. Borrar el contenido anterior del editor y pegar **el archivo completo** 2-CODIGO-CUSTOM-HTML.html de esa carpeta.
4. **Save** → **Publish**.

No se pega ningún trozo suelto. La ruta completa de cada artefacto es `GHL-PUBLICAR/lote-sitio/por-pagina/<carpeta>/2-CODIGO-CUSTOM-HTML.html`. Para la **home ES** se pega además el HEAD entregado en REVISION-2026-11-21/HEAD-home-es.html; para la **home EN**, HEAD-home-en.html. El resto de páginas se pegan solo con su embed; no se entrega un HEAD aparte para ellas.

## 3. Los 106

| # | Carpeta en por-pagina/ | URL final | Acción | KB | sha256 | Se pega |
|---|---|---|---|---|---|---|
| 1 | 001-inicio | https://ilatekpr.com/ | **REPUBLICAR** | 447 | e088bea8c31c | Embed + HEAD ES |
| 2 | 002-airbnb-turnover | https://ilatekpr.com/airbnb-turnover | **REPUBLICAR** | 229 | e3435ead2f90 | Embed |
| 3 | 003-alfombras | https://ilatekpr.com/alfombras | **REPUBLICAR** | 229 | c1a561d8ba98 | Embed |
| 4 | 004-canaletas-y-bajantes | https://ilatekpr.com/canaletas-y-bajantes | **REPUBLICAR** | 235 | 61e2ca39ecf2 | Embed |
| 5 | 005-comunidades | https://ilatekpr.com/comunidades | **CREAR PÁGINA** | 618 | ac11c234e461 | Embed |
| 8 | 008-electrodomesticos | https://ilatekpr.com/electrodomesticos | **REPUBLICAR** | 229 | 2dd332821eab | Embed |
| 9 | 009-empozamiento-de-techos | https://ilatekpr.com/empozamiento-de-techos | **REPUBLICAR** | 236 | b7a60de45f85 | Embed |
| 10 | 010-garantia | https://ilatekpr.com/garantia | **REPUBLICAR** | 201 | 7d7c83313d0e | Embed |
| 11 | 011-impermeabilizacion-de-techos | https://ilatekpr.com/impermeabilizacion-de-techos | **REPUBLICAR** | 238 | 16c66b6edbb8 | Embed |
| 12 | 012-inspeccion-de-techos | https://ilatekpr.com/inspeccion-de-techos | **REPUBLICAR** | 235 | 15f89d46236e | Embed |
| 13 | 013-inspeccion-y-mantenimiento-de-techos | https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos | **REPUBLICAR** | 241 | 5dd4fbdddccc | Embed |
| 14 | 014-instalacion-y-reemplazo-de-techos | https://ilatekpr.com/instalacion-y-reemplazo-de-techos | **REPUBLICAR** | 238 | 22a3188a3c13 | Embed |
| 15 | 015-lavado-a-presion | https://ilatekpr.com/lavado-a-presion | **REPUBLICAR** | 229 | 5e6460bc30d7 | Embed |
| 16 | 016-lavado-a-presion-techos | https://ilatekpr.com/lavado-a-presion-techos | **REPUBLICAR** | 235 | 4e6671fe536b | Embed |
| 17 | 017-limpieza-comercial | https://ilatekpr.com/limpieza-comercial | **REPUBLICAR** | 229 | 8e0db9906cea | Embed |
| 18 | 018-limpieza-de-mudanza | https://ilatekpr.com/limpieza-de-mudanza | **REPUBLICAR** | 229 | 9968128e3037 | Embed |
| 19 | 019-limpieza-de-techos-y-canaletas | https://ilatekpr.com/limpieza-de-techos-y-canaletas | **REPUBLICAR** | 238 | fe9cbbb6ba4e | Embed |
| 20 | 020-limpieza-estandar | https://ilatekpr.com/limpieza-estandar | **REPUBLICAR** | 229 | 8f7a411d16fe | Embed |
| 21 | 021-limpieza-industrial | https://ilatekpr.com/limpieza-industrial | **REPUBLICAR** | 229 | ba4a9973ff26 | Embed |
| 22 | 022-limpieza-profunda | https://ilatekpr.com/limpieza-profunda | **REPUBLICAR** | 229 | 14debd49745a | Embed |
| 23 | 023-limpieza-residencial | https://ilatekpr.com/limpieza-residencial | **REPUBLICAR** | 230 | a77fa2d41cbf | Embed |
| 24 | 024-mantenimiento-de-techos | https://ilatekpr.com/mantenimiento-de-techos | **REPUBLICAR** | 235 | a6925ea94d5c | Embed |
| 25 | 025-membrana-asfaltica | https://ilatekpr.com/membrana-asfaltica | **REPUBLICAR** | 234 | b2187df44171 | Embed |
| 26 | 026-organizacion | https://ilatekpr.com/organizacion | **REPUBLICAR** | 228 | 6728c43ad5cc | Embed |
| 27 | 027-politica | https://ilatekpr.com/politica | **CREAR PÁGINA** | 216 | 5d65d595e3af | Embed |
| 28 | 028-post-construccion | https://ilatekpr.com/post-construccion | **REPUBLICAR** | 229 | 2c5880b9943d | Embed |
| 29 | 029-recubrimiento-elastomerico | https://ilatekpr.com/recubrimiento-elastomerico | **REPUBLICAR** | 237 | 0e3629b653d3 | Embed |
| 30 | 030-reparacion-de-filtraciones | https://ilatekpr.com/reparacion-de-filtraciones | **REPUBLICAR** | 237 | fc54f80be679 | Embed |
| 31 | 031-reparacion-de-goteras | https://ilatekpr.com/reparacion-de-goteras | **REPUBLICAR** | 237 | 5cdcf4459fbb | Embed |
| 32 | 032-reparacion-de-grietas-techos | https://ilatekpr.com/reparacion-de-grietas-techos | **REPUBLICAR** | 239 | b069dccd378d | Embed |
| 33 | 033-reparacion-de-techos | https://ilatekpr.com/reparacion-de-techos | **REPUBLICAR** | 238 | d3796b0a9ec9 | Embed |
| 34 | 034-reparacion-post-huracan | https://ilatekpr.com/reparacion-post-huracan | **REPUBLICAR** | 236 | deb06f706fff | Embed |
| 35 | 035-resenas | https://ilatekpr.com/resenas | **REPUBLICAR** | 216 | ae9d21283fca | Embed |
| 36 | 036-sellado-acrilico | https://ilatekpr.com/sellado-acrilico | **REPUBLICAR** | 235 | 8656d421f1ae | Embed |
| 37 | 037-sellado-de-poliuretano | https://ilatekpr.com/sellado-de-poliuretano | **REPUBLICAR** | 235 | 7fd6049606ee | Embed |
| 38 | 038-sellado-de-silicona | https://ilatekpr.com/sellado-de-silicona | **REPUBLICAR** | 235 | f49ebe1ccf08 | Embed |
| 39 | 039-sellado-de-techos | https://ilatekpr.com/sellado-de-techos | **REPUBLICAR** | 275 | ce895a193393 | Embed |
| 40 | 040-sellado-de-techos-comercial | https://ilatekpr.com/sellado-de-techos-comercial | **REPUBLICAR** | 236 | 6b737bdc41a2 | Embed |
| 41 | 041-sellado-de-techos-industrial | https://ilatekpr.com/sellado-de-techos-industrial | **REPUBLICAR** | 237 | c558062a5177 | Embed |
| 42 | 042-sellado-de-techos-residencial | https://ilatekpr.com/sellado-de-techos-residencial | **REPUBLICAR** | 237 | ffe83eb7a34a | Embed |
| 43 | 043-servicios | https://ilatekpr.com/servicios | **REPUBLICAR** | 285 | f5e5c0a247aa | Embed |
| 44 | 044-servicios-techos | https://ilatekpr.com/servicios-techos | **REPUBLICAR** | 382 | db6a61ad0a1f | Embed |
| 45 | 045-techos | https://ilatekpr.com/techos | **CREAR PÁGINA** | 289 | 520687330c75 | Embed |
| 46 | 046-techos-de-asfalto | https://ilatekpr.com/techos-de-asfalto | **REPUBLICAR** | 234 | ccff245be0d6 | Embed |
| 47 | 047-techos-de-concreto | https://ilatekpr.com/techos-de-concreto | **REPUBLICAR** | 235 | 12c3c030df1d | Embed |
| 48 | 048-techos-de-madera | https://ilatekpr.com/techos-de-madera | **REPUBLICAR** | 234 | 612b9a69faf3 | Embed |
| 49 | 049-techos-de-teja | https://ilatekpr.com/techos-de-teja | **REPUBLICAR** | 234 | bcd0a62094fe | Embed |
| 50 | 050-techos-de-zinc | https://ilatekpr.com/techos-de-zinc | **REPUBLICAR** | 234 | ca5fa85f3d26 | Embed |
| 51 | 051-techos-planos | https://ilatekpr.com/techos-planos | **REPUBLICAR** | 234 | 0f5055097fe2 | Embed |
| 52 | 052-techos-por-segmento | https://ilatekpr.com/techos-por-segmento | **REPUBLICAR** | 235 | a18fb74ddc40 | Embed |
| 53 | 053-terminos | https://ilatekpr.com/terminos | **CREAR PÁGINA** | 210 | 3d567039fac8 | Embed |
| 54 | 054-tragaluces | https://ilatekpr.com/tragaluces | **REPUBLICAR** | 232 | 40a48b640e74 | Embed |
| 55 | 055-ventanas | https://ilatekpr.com/ventanas | **REPUBLICAR** | 229 | 5834f5781490 | Embed |
| 56 | 056-en-airbnb-turnover | https://ilatekpr.com/en/airbnb-turnover | **CREAR PÁGINA** | 229 | d30acffd12bd | Embed |
| 57 | 057-en-alfombras | https://ilatekpr.com/en/alfombras | **CREAR PÁGINA** | 228 | f8c97e4b9ca6 | Embed |
| 58 | 058-en-canaletas-y-bajantes | https://ilatekpr.com/en/canaletas-y-bajantes | **CREAR PÁGINA** | 233 | 1408bb4fd306 | Embed |
| 59 | 059-en-communities | https://ilatekpr.com/en/communities | **CREAR PÁGINA** | 617 | d12c8c9cdaed | Embed |
| 60 | 060-en-electrodomesticos | https://ilatekpr.com/en/electrodomesticos | **CREAR PÁGINA** | 229 | b7c62dfa61bd | Embed |
| 61 | 061-en-empozamiento-de-techos | https://ilatekpr.com/en/empozamiento-de-techos | **CREAR PÁGINA** | 234 | 3c03f598335d | Embed |
| 62 | 062-en-garantia | https://ilatekpr.com/en/garantia | **CREAR PÁGINA** | 199 | a9ce1e744579 | Embed |
| 63 | 063-en-home | https://ilatekpr.com/en/home | **CREAR PÁGINA** | 435 | 6ebbe53a08ee | Embed + HEAD EN |
| 64 | 064-en-impermeabilizacion-de-techos | https://ilatekpr.com/en/impermeabilizacion-de-techos | **CREAR PÁGINA** | 237 | c0f52f2eaa16 | Embed |
| 65 | 065-en-inspeccion-de-techos | https://ilatekpr.com/en/inspeccion-de-techos | **CREAR PÁGINA** | 233 | bac566f7e07d | Embed |
| 66 | 066-en-inspeccion-y-mantenimiento-de-techos | https://ilatekpr.com/en/inspeccion-y-mantenimiento-de-techos | **CREAR PÁGINA** | 240 | 47e64c3958d1 | Embed |
| 67 | 067-en-instalacion-y-reemplazo-de-techos | https://ilatekpr.com/en/instalacion-y-reemplazo-de-techos | **CREAR PÁGINA** | 237 | 08c62107e984 | Embed |
| 68 | 068-en-lavado-a-presion | https://ilatekpr.com/en/lavado-a-presion | **CREAR PÁGINA** | 229 | 77fccb0074ef | Embed |
| 69 | 069-en-lavado-a-presion-techos | https://ilatekpr.com/en/lavado-a-presion-techos | **CREAR PÁGINA** | 234 | 570df0416506 | Embed |
| 70 | 070-en-limpieza-comercial | https://ilatekpr.com/en/limpieza-comercial | **CREAR PÁGINA** | 229 | 08e63e4c8970 | Embed |
| 71 | 071-en-limpieza-de-mudanza | https://ilatekpr.com/en/limpieza-de-mudanza | **CREAR PÁGINA** | 229 | d6f4daadb041 | Embed |
| 72 | 072-en-limpieza-de-techos-y-canaletas | https://ilatekpr.com/en/limpieza-de-techos-y-canaletas | **CREAR PÁGINA** | 236 | ec5f8c17847c | Embed |
| 73 | 073-en-limpieza-estandar | https://ilatekpr.com/en/limpieza-estandar | **CREAR PÁGINA** | 229 | 1423d0610ad4 | Embed |
| 74 | 074-en-limpieza-industrial | https://ilatekpr.com/en/limpieza-industrial | **CREAR PÁGINA** | 229 | e7ab22f96803 | Embed |
| 75 | 075-en-limpieza-profunda | https://ilatekpr.com/en/limpieza-profunda | **CREAR PÁGINA** | 229 | 03434e4e168e | Embed |
| 76 | 076-en-limpieza-residencial | https://ilatekpr.com/en/limpieza-residencial | **CREAR PÁGINA** | 230 | 2c7c04a6b780 | Embed |
| 77 | 077-en-mantenimiento-de-techos | https://ilatekpr.com/en/mantenimiento-de-techos | **CREAR PÁGINA** | 234 | a93d85272c13 | Embed |
| 78 | 078-en-membrana-asfaltica | https://ilatekpr.com/en/membrana-asfaltica | **CREAR PÁGINA** | 233 | d8d7c9af62f2 | Embed |
| 79 | 079-en-organizacion | https://ilatekpr.com/en/organizacion | **CREAR PÁGINA** | 228 | 94e21f0e1639 | Embed |
| 80 | 080-en-politica | https://ilatekpr.com/en/politica | **CREAR PÁGINA** | 215 | 57aa421cb91c | Embed |
| 81 | 081-en-post-construccion | https://ilatekpr.com/en/post-construccion | **CREAR PÁGINA** | 229 | bb84bc1af867 | Embed |
| 82 | 082-en-recubrimiento-elastomerico | https://ilatekpr.com/en/recubrimiento-elastomerico | **CREAR PÁGINA** | 235 | 1c69d350e726 | Embed |
| 83 | 083-en-reparacion-de-filtraciones | https://ilatekpr.com/en/reparacion-de-filtraciones | **CREAR PÁGINA** | 235 | f538e773aef9 | Embed |
| 84 | 084-en-reparacion-de-goteras | https://ilatekpr.com/en/reparacion-de-goteras | **CREAR PÁGINA** | 235 | 9335422f6d21 | Embed |
| 85 | 085-en-reparacion-de-grietas-techos | https://ilatekpr.com/en/reparacion-de-grietas-techos | **CREAR PÁGINA** | 237 | 1b105e05d7dd | Embed |
| 86 | 086-en-reparacion-de-techos | https://ilatekpr.com/en/reparacion-de-techos | **CREAR PÁGINA** | 236 | 180d7a5cbe61 | Embed |
| 87 | 087-en-reparacion-post-huracan | https://ilatekpr.com/en/reparacion-post-huracan | **CREAR PÁGINA** | 235 | ed83253ab329 | Embed |
| 88 | 088-en-resenas | https://ilatekpr.com/en/resenas | **CREAR PÁGINA** | 216 | 825ccd3d1473 | Embed |
| 89 | 089-en-sellado-acrilico | https://ilatekpr.com/en/sellado-acrilico | **CREAR PÁGINA** | 233 | 78a157cb6c77 | Embed |
| 90 | 090-en-sellado-de-poliuretano | https://ilatekpr.com/en/sellado-de-poliuretano | **CREAR PÁGINA** | 234 | 264ea99dd969 | Embed |
| 91 | 091-en-sellado-de-silicona | https://ilatekpr.com/en/sellado-de-silicona | **CREAR PÁGINA** | 233 | 588da4390e41 | Embed |
| 92 | 092-en-sellado-de-techos | https://ilatekpr.com/en/sellado-de-techos | **CREAR PÁGINA** | 272 | b166540f380e | Embed |
| 93 | 093-en-sellado-de-techos-comercial | https://ilatekpr.com/en/sellado-de-techos-comercial | **CREAR PÁGINA** | 235 | 48d42a7e0792 | Embed |
| 94 | 094-en-sellado-de-techos-industrial | https://ilatekpr.com/en/sellado-de-techos-industrial | **CREAR PÁGINA** | 235 | b6d4548326d6 | Embed |
| 95 | 095-en-sellado-de-techos-residencial | https://ilatekpr.com/en/sellado-de-techos-residencial | **CREAR PÁGINA** | 236 | aefaa64ba26c | Embed |
| 96 | 096-en-servicios | https://ilatekpr.com/en/servicios | **CREAR PÁGINA** | 284 | 1f2f90adb263 | Embed |
| 97 | 097-en-servicios-techos | https://ilatekpr.com/en/servicios-techos | **CREAR PÁGINA** | 376 | a8161ab9d3de | Embed |
| 98 | 098-en-techos | https://ilatekpr.com/en/techos | **CREAR PÁGINA** | 286 | cd3ac288c39c | Embed |
| 99 | 099-en-techos-de-asfalto | https://ilatekpr.com/en/techos-de-asfalto | **CREAR PÁGINA** | 232 | 8f92ccd9e28b | Embed |
| 100 | 100-en-techos-de-concreto | https://ilatekpr.com/en/techos-de-concreto | **CREAR PÁGINA** | 233 | 5eaadddd75a9 | Embed |
| 101 | 101-en-techos-de-madera | https://ilatekpr.com/en/techos-de-madera | **CREAR PÁGINA** | 233 | 099598471119 | Embed |
| 102 | 102-en-techos-de-teja | https://ilatekpr.com/en/techos-de-teja | **CREAR PÁGINA** | 232 | 6d91f90ecbd0 | Embed |
| 103 | 103-en-techos-de-zinc | https://ilatekpr.com/en/techos-de-zinc | **CREAR PÁGINA** | 232 | 41e6e8267ffa | Embed |
| 104 | 104-en-techos-planos | https://ilatekpr.com/en/techos-planos | **CREAR PÁGINA** | 232 | 7442579a7fd7 | Embed |
| 105 | 105-en-techos-por-segmento | https://ilatekpr.com/en/techos-por-segmento | **CREAR PÁGINA** | 234 | d854cdeca046 | Embed |
| 106 | 106-en-terminos | https://ilatekpr.com/en/terminos | **CREAR PÁGINA** | 207 | b138734c6965 | Embed |
| 107 | 107-en-tragaluces | https://ilatekpr.com/en/tragaluces | **CREAR PÁGINA** | 231 | 0d6284cb0caf | Embed |
| 108 | 108-en-ventanas | https://ilatekpr.com/en/ventanas | **CREAR PÁGINA** | 228 | d29c34818a28 | Embed |

**Total:** 49 REPUBLICAR · 57 CREAR PÁGINA · 106 artefactos.

Los 106 sha de la tabla coinciden con su `1-PAGINA.txt`; `MANIFIESTO-106.csv` lo registra en la columna `coincide` con **106/106 en `sí`**.

## 4. Verificadores ejecutados por separado

Resumen en REVISION-2026-11-21/verificadores.csv. La tabla recoge el exit real y la salida clave de cada comando.

| Etiqueta | Comando | Exit | Alcance | Resultado / atribución |
|---|---|---|---|---|
| 01-sync | node tools/sync-artifacts.mjs --check | **0** | Lote | 106 artefactos / 0 problemas |
| 02-shell-1 | node tools/verify-page-shell.mjs | **0** | Lote | 109 delivery + 32 roof; verde |
| 02b-shell-2 | node tools/verify-page-shell.mjs | **0** | Lote | 109 delivery + 32 roof; verde (2.ª) |
| 03-apply-shell-1 | node tools/apply-page-shell.mjs | **0** | Lote | 0 updated; 109 delivery |
| 03b-apply-shell-2 | node tools/apply-page-shell.mjs | **0** | Lote | 0 updated; 109 delivery (2.ª) |
| 03c-apply-links-1 | node tools/apply-internal-links.mjs | **0** | Lote | 0 files; idempotente |
| 03d-apply-links-2 | node tools/apply-internal-links.mjs | **0** | Lote | 0 files; idempotente (2.ª) |
| 04-structure | node tools/verify-structure.mjs | **0** | Lote | estructura canónica |
| 05-links | node tools/verify-internal-links.mjs | **0** | Lote | 17.277 anchors; 2.612 scripts; idempotence passed |
| 06-nav | node tools/verify-nav.mjs | **0** | Lote | fallos: 0 |
| 07-location | node tools/verify-location.mjs | **0** | Lote | contrato de ubicación |
| 08-seo | node tools/verify-seo-integrity.mjs | **0** | Lote | canónicas, llms, anchors |
| 09-faq-words | node tools/verify-faq-words.mjs | **0** | Lote | 23 preguntas money, 40–60 palabras |
| 10-en-parity | node tools/verify-en-parity.mjs | **0** | Lote | 51 pares; 0 infracciones |
| 11-anchor | node tools/verify-anchor-ratio.mjs | **0** | Lote | 2/46.409 exactos (0,00 %) |
| 12-schema-prices | node tools/verify-schema-prices.mjs | **0** | Lote | precios solo verificados |
| 13-sitemap | node tools/verify-sitemap.mjs | **0** | Lote | 98 URLs |
| 14-faq-lote | node src/faq/faq-parity.mjs GHL-PUBLICAR/lote-sitio/por-pagina | **0** | Lote | 106 páginas · 1.011 preguntas · 0 hallazgos |
| 15-samples | node tools/verify-samples.mjs | **1** | Fuera / destinos del lote | 6 problemas: en/home, comunidades, techos (los crea el lote; no bloquea) |
| 16-ghl-publish | node tools/verify-ghl-publish.mjs | **2** | No ejecutable | Requiere URL publicada; exit 2 de uso |
| 17-en | node tools/verify-en.mjs | **1** | Fuera del lote | 48 copias EN; 104 fallos preexistentes en servicios/categorías |
| 18-social | node tools/verify-social-cards.mjs | **1** | Fuera del lote | 185 páginas; 80 fallos en 20 blog-*; 185/185 WebP existen |
| 19-blog-en | node blog/build/verify-blog-en.mjs | **1** | Fuera del lote | Pares ES/EN de /blog |
| 20-test-faq | node src/faq/faq-parity.mjs | **1** | Fuera del lote | 4.492 páginas; 3.301 schema_sin_h3 + 2.571 items_sin_pregunta + 3 divergentes |
| 21-cannibalization | node tools/verify-cannibalization.mjs --strict | **1** | Fuera del lote | 1 hallazgo en blog |
| 22-migration | node tools/verify-structure.mjs --migration | **1** | Fuera del lote | Guard histórico; falla por diseño |
| 23-responsive | node tools/verify-responsive.mjs | **0** | Lote | 97 hero pages; idempotence passed |

### Atribución de los rojos

- **15-samples (1):** 6 destinos que **crea el propio lote** (/en/home, /comunidades, /techos). No es un fallo del embed; se resuelve al publicar esas páginas. **No bloquea.**
- **16-ghl-publish (2):** el script exige una URL publicada; sin URL devuelve 2 de uso. **No ejecutable antes de publicar.**
- **17-en (1):** 48 copias EN de servicios/ y categorias/ (fuera de los 106 artefactos); 104 fallos preexistentes de token county_name, /comunidades y hreflang. **No toca el lote.**
- **18-social (1):** 20 páginas blog-*; 80 fallos; las 185 tarjetas WebP existen. **Fuera del lote.**
- **19-blog-en (1):** pares ES/EN de /blog. **Fuera del lote.**
- **20-test-faq (1):** 4.492 páginas; 3.301 schema_sin_h3 + 2.571 items_sin_pregunta + 3 divergentes en blog y landings municipales. El lote (14-faq-lote) está en **0**. **No bloquea.**
- **21-cannibalization (1):** 1 hallazgo en blog («¿Cuánto dura el sellado…?»). **Fuera del lote.**
- **22-migration (1):** guard histórico; falla por diseño. **Fuera del lote.**

Los rojos **no bloquean la publicación** del lote: ninguno pertenece a los 106 embeds.

## 5. Cierre Fase 3 — pasada 2026-11-21 15:16 -0500

Pasada única de esta sesión. Se recalcularon los 106 sha256 desde los archivos; no se reutilizó el informe para validar.

| Comprobación | Salida real |
|---|---|
| Filas del informe / carpetas del lote / filas del manifiesto | **106 / 106 / 106** |
| sha256 real vs fila del informe | **106/106; 0 desajustes** |
| sha256 real vs 1-PAGINA.txt | **106/106** |
| URL, acción y qué se pega (HEAD en 001/063) | **106/106** |
| `node tools/sync-artifacts.mjs --check` | **0** · `{"modo":"auditoría","artefactos":106,"tamanoMedioKB":248,"problemas":0}` |
| `node tools/verify-page-shell.mjs` (1.ª) | **0** · `Header/footer verified: 109 delivery files + 32 generated roof pages; no duplicate components.` |
| `node tools/verify-page-shell.mjs` (2.ª) | **0** · idéntica salida |
| `node tools/verify-internal-links.mjs` | **0** · `files:280, pages:47, anchorsAndGeneratedAnchors:17277, parsedScriptBlocks:2612, urlNormalization:passed, idempotence:passed` |
| `node src/faq/faq-parity.mjs GHL-PUBLICAR/lote-sitio/por-pagina` | **0** · `RESUMEN;paginas=106;h3=1011;h3_sin_schema=0;schema_sin_h3=0;respuestas_divergentes=0;items_sin_pregunta=0` |
| `sha256sum blog/llms.txt` | **48cd16fda1446ce4797d25a79197b1531f655231fd87e6d420a29765c19fc558** |
| `git status --porcelain -- blog` | **`?? blog/`**; `--untracked-files=no` vacío |
| `git status --porcelain` | **2.161 líneas**; mismos cambios preexistentes; sin cambios nuevos fuera de `GHL-PUBLICAR` |
| `git status --porcelain --untracked-files=all` | **13.030 líneas**; idéntico antes/después de las comprobaciones (`cmp`); sin cambios nuevos fuera de `GHL-PUBLICAR` |
| `git log -1 --oneline` | **`c577d51 comunidades: funnel de Isla Verde publicado y guía del lote`** |
| `git diff --cached --name-only` | **vacío** |
| Commit / push / PR / merge / publicación | **No se hizo** |

`apply-internal-links` no se re-ejecutó para no escribir fuera del lote; `verify-internal-links` confirma `idempotence: passed`.

## 6. Manifiesto

- **MANIFIESTO-106.csv** (esta carpeta) es el manifiesto actual: 106 filas con carpeta, URL, acción, bytes, KB, sha256 completo, sha de 1-PAGINA.txt y qué se pega.
- El 00-CHECKLIST.csv histórico conserva los tamaños de la primera entrega; **sus 106 hashes están desfasados** porque el lote se re-sincronizó después. No se usa para validar esta publicación. La fuente operativa es el 1-PAGINA.txt de cada carpeta, y **106/106 coinciden** con el embed.

## 7. Límites

- No se publicó en GHL y no se hizo commit/push/PR/merge.
- No se probó el render visual en navegador; la verificación fue estática y de contrato.
- verify-ghl-publish no se puede ejecutar sin una URL publicada.
- Los rojos de blog y landings municipales siguen abiertos, pero **no pertenecen a este lote**.

## 8. Alcance fuera del lote — igualdad byte a byte no probada

- **`Comunidades/bloques/bloque-mapa-home.html`**: sigue `M`; `mtime` y `ctime` **2026-11-19 13:21:10**, anteriores a esta pasada. No hubo escritura en esta pasada. La única copia disponible (`.tmp-cambio/Comunidades/bloques/bloque-mapa-home.html`) es la versión de **HEAD `f487491`**, no el estado modificado previo; por tanto **no se puede probar la igualdad byte a byte** contra una copia del estado previo. No contiene `data-ilatek-*` y se deja intacto.
- **`tools/qa/populate_headings.py`**, **`tools/qa/qa_tokenized_headings.mjs`** y **`tools/responsive-contract.mjs`**: siguen como `M` preexistentes; sus `mtime`/`ctime` son **2026-11-21 02:53, 03:14 y 01:39**, anteriores a esta pasada. No los escribí en esta pasada y no hay copia previa de su contenido, así que **no se puede probar la igualdad byte a byte**. No se revirtieron para no borrar trabajo previo ajeno a este lote.
- **`assets/`**: los 25 borrados son preexistentes y no se tocaron; `hero-poster-1280.webp` sigue en `HEAD`.
- **`blog/`**: `?? blog/`; **0 archivos versionados modificados** y `blog/llms.txt` conserva `48cd16fd…`.
- **Sin publicación, commit, push, PR, merge ni staging.**
