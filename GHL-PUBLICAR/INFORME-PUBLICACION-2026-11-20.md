# Informe de publicación — lote del sitio (106 artefactos)

**Fecha:** 20 de noviembre de 2026 · **Última comprobación:** 21/11/2026, cierre del home EN, **Fase 2 punto 5 (acordeones legales dentro del `FAQPage`)**, **localización del literal «Puerto Rico» de los FAQ al Custom Value del condado (§14)** y **prueba fresca de publicación: los 28 verificadores re-ejecutados uno por uno contra los bytes finales (§13)**, con re-medición de los 106 contra esos bytes (tabla de los 106, tabla 2.1 y verificadores recalculados; estado del árbol re-medido con `git status --porcelain`, `git status --porcelain -uall`, `git diff --stat`, `git diff --cached --stat` y `git log --oneline -3`).
**Estado del árbol: sin cambios** respecto a la comprobación anterior — **231 borrados pendientes (`D`)**, **819 modificados (`M`)** y **1 106 entradas sin seguimiento** (colapsado), sin entradas nuevas, restauradas ni añadidas al índice (sección 6 y 12.4).
**Sin commit, push, PR ni merge.**

> **Cómo leer este informe.** Cada número de abajo lo volvió a calcular un script sobre los archivos en disco
> en este turno; no viene copiado de un informe anterior. La tabla de los 106 se genera de esos mismos
> datos medidos, así que si un artefacto cambia, la fila deja de coincidir y el generador lo delata
> (**filas con discrepancia: 0**).

## 1. Veredicto

**Los 106 artefactos del lote se pueden pegar en GoHighLevel tal como están.** 16/26 verificadores en verde; de los 10 rojos, 9 están fuera del lote y el décimo (`faq-parity`) **ya no imputa ningún hallazgo al lote**: los 6 artefactos legales se cerraron el 21/11 (3.7) y todo lo que queda en su log es de otras familias (blog y `Comunidades/`). La prueba fresca del 21/11 (§13) confirma el veredicto con los bytes de hoy: **16/26 scripts en verde**, los mismos **10 rojos fuera del lote** y las dos comprobaciones nacidas para el lote (`verify-en-parity` **51/51**, `sync-artifacts --check` **106/0**) en verde.

| Comprobación (medida ahora) | Resultado |
|---|---|
| `1-PAGINA.txt` (sha256) vs el archivo a pegar | **106/106** |
| Artefacto idéntico a su origen del repo | **106/106** |
| Filas del informe vs bytes reales (sha, nombre, URL, acción, KB) | **0 discrepancias** |
| `sync-artifacts --check` | **106 artefactos / 0 problemas** |
| `verify-page-shell` | **0** (109 delivery + 32 roof) |
| Verificadores re-ejecutados (28 filas, §13) | **16/26 en verde · 10 rojos fuera del lote · lote 106/0** |
| `{{custom_values.*}}` por página (mínimo del lote) | **120** tokens · 106/106 páginas |
| `dv-ghl-values` por página (mínimo del lote) | **16** · 106/106 páginas |
| `FAQPage` en JSON-LD | **106/106** |
| `test-faq`: respuestas divergentes en todo el sitio | **0** (eran 20, todas del home EN) |
| `test-faq`: filas del lote con hallazgo | **0** (eran 6: los acordeones legales) |
| Tokens `{{custom_values.*}}` pegados a una palabra en el copy visible | **0** en los 106 |
| Copy retirado (`ilcl-form`, «Recibe tu precio», «inspección gratis», `ilf-brand`, «Oportunidades») | **0** |
| Pie nuevo (Explora + `/servicios` + `/techos` con `data-ilatek-path`) | **106/106** |
| URLs de la Media Library de GHL (og/twitter/tarjetas) | **65 distintas · 65 responden 200 sin sesión** (1675 referencias) |
| Tarjetas de servicio con `data-slug`: imagen del servicio correcto | **36 nodos · 6 pares únicos · 6/6 correctos** |
| `blog/llms.txt` | sha256 `48cd16fda144` |
| Archivos de `blog/` dentro del lote | **0** |
| `.mjs` u ocultos dentro de `GHL-PUBLICAR` | **0** |
| Tamaño total del lote | 25,7 MB de HTML en 106 archivos |

## 2. Los 106 artefactos (tabla generada desde los bytes de ahora)

Se pega **un solo archivo** por página: `2-CODIGO-CUSTOM-HTML.html` completo en el elemento *Custom HTML/JavaScript* (Custom Code → Open Code Editor, borrar lo anterior, pegar, Save). `1-PAGINA.txt` es la guía de nombre/slug/URL: no se pega.

| Carpeta | Nombre en GHL | URL | Acción | sha256 | Tamaño |
|---|---|---|---|---|---|
| 001-inicio | Sitio - Inicio | https://ilatekpr.com/ | REPUBLICAR | `7680a1e8a8fa` | 446 KB |
| 002-airbnb-turnover | Sitio - Airbnb Turnover | https://ilatekpr.com/airbnb-turnover | REPUBLICAR | `e3435ead2f90` | 229 KB |
| 003-alfombras | Sitio - Alfombras | https://ilatekpr.com/alfombras | REPUBLICAR | `c1a561d8ba98` | 229 KB |
| 004-canaletas-y-bajantes | Sitio - Canaletas y Bajantes | https://ilatekpr.com/canaletas-y-bajantes | REPUBLICAR | `3beff5794c95` | 235 KB |
| 005-comunidades | Sitio - Comunidades | https://ilatekpr.com/comunidades | CREAR PÁGINA | `ac11c234e461` | 618 KB |
| 008-electrodomesticos | Sitio - Electrodomesticos | https://ilatekpr.com/electrodomesticos | REPUBLICAR | `2dd332821eab` | 229 KB |
| 009-empozamiento-de-techos | Sitio - Empozamiento De Techos | https://ilatekpr.com/empozamiento-de-techos | REPUBLICAR | `c36fafdc3d84` | 236 KB |
| 010-garantia | Sitio - Garantia | https://ilatekpr.com/garantia | REPUBLICAR | `e32d0e58e930` | 201 KB |
| 011-impermeabilizacion-de-techos | Sitio - Impermeabilizacion De Techos | https://ilatekpr.com/impermeabilizacion-de-techos | REPUBLICAR | `33ff9394905a` | 238 KB |
| 012-inspeccion-de-techos | Sitio - Inspeccion De Techos | https://ilatekpr.com/inspeccion-de-techos | REPUBLICAR | `0a82a2944b96` | 235 KB |
| 013-inspeccion-y-mantenimiento-de-techos | Sitio - Inspeccion y Mantenimiento De Techos | https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos | REPUBLICAR | `1e4c44f2c738` | 241 KB |
| 014-instalacion-y-reemplazo-de-techos | Sitio - Instalacion y Reemplazo De Techos | https://ilatekpr.com/instalacion-y-reemplazo-de-techos | REPUBLICAR | `f045bb9c0f66` | 238 KB |
| 015-lavado-a-presion | Sitio - Lavado A Presion | https://ilatekpr.com/lavado-a-presion | REPUBLICAR | `5e6460bc30d7` | 229 KB |
| 016-lavado-a-presion-techos | Sitio - Lavado A Presion Techos | https://ilatekpr.com/lavado-a-presion-techos | REPUBLICAR | `faf3b3818c53` | 235 KB |
| 017-limpieza-comercial | Sitio - Limpieza Comercial | https://ilatekpr.com/limpieza-comercial | REPUBLICAR | `8e0db9906cea` | 229 KB |
| 018-limpieza-de-mudanza | Sitio - Limpieza De Mudanza | https://ilatekpr.com/limpieza-de-mudanza | REPUBLICAR | `9968128e3037` | 229 KB |
| 019-limpieza-de-techos-y-canaletas | Sitio - Limpieza De Techos y Canaletas | https://ilatekpr.com/limpieza-de-techos-y-canaletas | REPUBLICAR | `be80cc03372f` | 238 KB |
| 020-limpieza-estandar | Sitio - Limpieza Estandar | https://ilatekpr.com/limpieza-estandar | REPUBLICAR | `8f7a411d16fe` | 229 KB |
| 021-limpieza-industrial | Sitio - Limpieza Industrial | https://ilatekpr.com/limpieza-industrial | REPUBLICAR | `ba4a9973ff26` | 229 KB |
| 022-limpieza-profunda | Sitio - Limpieza Profunda | https://ilatekpr.com/limpieza-profunda | REPUBLICAR | `14debd49745a` | 229 KB |
| 023-limpieza-residencial | Sitio - Limpieza Residencial | https://ilatekpr.com/limpieza-residencial | REPUBLICAR | `a77fa2d41cbf` | 230 KB |
| 024-mantenimiento-de-techos | Sitio - Mantenimiento De Techos | https://ilatekpr.com/mantenimiento-de-techos | REPUBLICAR | `e6ad618b3631` | 235 KB |
| 025-membrana-asfaltica | Sitio - Membrana Asfaltica | https://ilatekpr.com/membrana-asfaltica | REPUBLICAR | `43351674d903` | 234 KB |
| 026-organizacion | Sitio - Organizacion | https://ilatekpr.com/organizacion | REPUBLICAR | `6728c43ad5cc` | 228 KB |
| 027-politica | Sitio - Politica | https://ilatekpr.com/politica | CREAR PÁGINA | `ee9545ee383b` | 216 KB |
| 028-post-construccion | Sitio - Post Construccion | https://ilatekpr.com/post-construccion | REPUBLICAR | `2c5880b9943d` | 229 KB |
| 029-recubrimiento-elastomerico | Sitio - Recubrimiento Elastomerico | https://ilatekpr.com/recubrimiento-elastomerico | REPUBLICAR | `f5adaad3ef6c` | 237 KB |
| 030-reparacion-de-filtraciones | Sitio - Reparacion De Filtraciones | https://ilatekpr.com/reparacion-de-filtraciones | REPUBLICAR | `5959ab345275` | 237 KB |
| 031-reparacion-de-goteras | Sitio - Reparacion De Goteras | https://ilatekpr.com/reparacion-de-goteras | REPUBLICAR | `fef3adad1da0` | 237 KB |
| 032-reparacion-de-grietas-techos | Sitio - Reparacion De Grietas Techos | https://ilatekpr.com/reparacion-de-grietas-techos | REPUBLICAR | `cf627208f700` | 239 KB |
| 033-reparacion-de-techos | Sitio - Reparacion De Techos | https://ilatekpr.com/reparacion-de-techos | REPUBLICAR | `0daef8387ae9` | 238 KB |
| 034-reparacion-post-huracan | Sitio - Reparacion Post Huracan | https://ilatekpr.com/reparacion-post-huracan | REPUBLICAR | `728e03912ebf` | 236 KB |
| 035-resenas | Sitio - Resenas | https://ilatekpr.com/resenas | REPUBLICAR | `f48061d3d6bc` | 216 KB |
| 036-sellado-acrilico | Sitio - Sellado Acrilico | https://ilatekpr.com/sellado-acrilico | REPUBLICAR | `99dd64e2e695` | 235 KB |
| 037-sellado-de-poliuretano | Sitio - Sellado De Poliuretano | https://ilatekpr.com/sellado-de-poliuretano | REPUBLICAR | `93fa8c749713` | 235 KB |
| 038-sellado-de-silicona | Sitio - Sellado De Silicona | https://ilatekpr.com/sellado-de-silicona | REPUBLICAR | `f85b1a0b1fc1` | 235 KB |
| 039-sellado-de-techos | Sitio - Sellado De Techos | https://ilatekpr.com/sellado-de-techos | REPUBLICAR | `19f54418b063` | 275 KB |
| 040-sellado-de-techos-comercial | Sitio - Sellado De Techos Comercial | https://ilatekpr.com/sellado-de-techos-comercial | REPUBLICAR | `af3496528c48` | 236 KB |
| 041-sellado-de-techos-industrial | Sitio - Sellado De Techos Industrial | https://ilatekpr.com/sellado-de-techos-industrial | REPUBLICAR | `63df76d64d15` | 236 KB |
| 042-sellado-de-techos-residencial | Sitio - Sellado De Techos Residencial | https://ilatekpr.com/sellado-de-techos-residencial | REPUBLICAR | `3a93a0cb27f2` | 237 KB |
| 043-servicios | Sitio - Servicios | https://ilatekpr.com/servicios | REPUBLICAR | `2a4cfd9c94ca` | 285 KB |
| 044-servicios-techos | Sitio - Servicios Techos | https://ilatekpr.com/servicios-techos | REPUBLICAR | `4b9789417545` | 382 KB |
| 045-techos | Sitio - Techos | https://ilatekpr.com/techos | CREAR PÁGINA | `e3056c9182d1` | 289 KB |
| 046-techos-de-asfalto | Sitio - Techos De Asfalto | https://ilatekpr.com/techos-de-asfalto | REPUBLICAR | `01a858af618a` | 234 KB |
| 047-techos-de-concreto | Sitio - Techos De Concreto | https://ilatekpr.com/techos-de-concreto | REPUBLICAR | `88a3e80daae3` | 235 KB |
| 048-techos-de-madera | Sitio - Techos De Madera | https://ilatekpr.com/techos-de-madera | REPUBLICAR | `870554430031` | 234 KB |
| 049-techos-de-teja | Sitio - Techos De Teja | https://ilatekpr.com/techos-de-teja | REPUBLICAR | `5b29ed505274` | 234 KB |
| 050-techos-de-zinc | Sitio - Techos De Zinc | https://ilatekpr.com/techos-de-zinc | REPUBLICAR | `0cfb6fa81172` | 234 KB |
| 051-techos-planos | Sitio - Techos Planos | https://ilatekpr.com/techos-planos | REPUBLICAR | `bee211f54f51` | 234 KB |
| 052-techos-por-segmento | Sitio - Techos Por Segmento | https://ilatekpr.com/techos-por-segmento | REPUBLICAR | `9416e01c5ff5` | 235 KB |
| 053-terminos | Sitio - Terminos | https://ilatekpr.com/terminos | CREAR PÁGINA | `d4d5443e48e1` | 210 KB |
| 054-tragaluces | Sitio - Tragaluces | https://ilatekpr.com/tragaluces | REPUBLICAR | `22ddf6a0b349` | 232 KB |
| 055-ventanas | Sitio - Ventanas | https://ilatekpr.com/ventanas | REPUBLICAR | `5834f5781490` | 229 KB |
| 056-en-airbnb-turnover | Sitio - Airbnb Turnover (EN) | https://ilatekpr.com/en/airbnb-turnover | CREAR PÁGINA | `d30acffd12bd` | 229 KB |
| 057-en-alfombras | Sitio - Alfombras (EN) | https://ilatekpr.com/en/alfombras | CREAR PÁGINA | `f8c97e4b9ca6` | 228 KB |
| 058-en-canaletas-y-bajantes | Sitio - Canaletas y Bajantes (EN) | https://ilatekpr.com/en/canaletas-y-bajantes | CREAR PÁGINA | `adf24c1597da` | 233 KB |
| 059-en-communities | Sitio - Communities (EN) | https://ilatekpr.com/en/communities | CREAR PÁGINA | `74723d4c9e6b` | 617 KB |
| 060-en-electrodomesticos | Sitio - Electrodomesticos (EN) | https://ilatekpr.com/en/electrodomesticos | CREAR PÁGINA | `b7c62dfa61bd` | 229 KB |
| 061-en-empozamiento-de-techos | Sitio - Empozamiento De Techos (EN) | https://ilatekpr.com/en/empozamiento-de-techos | CREAR PÁGINA | `c4d76e2fa441` | 234 KB |
| 062-en-garantia | Sitio - Garantia (EN) | https://ilatekpr.com/en/garantia | CREAR PÁGINA | `7b7df4c360a3` | 199 KB |
| 063-en-home | Sitio - Home (EN) | https://ilatekpr.com/en/home | CREAR PÁGINA | `eae9c2bd359e` | 436 KB |
| 064-en-impermeabilizacion-de-techos | Sitio - Impermeabilizacion De Techos (EN) | https://ilatekpr.com/en/impermeabilizacion-de-techos | CREAR PÁGINA | `f3961dcd2ded` | 237 KB |
| 065-en-inspeccion-de-techos | Sitio - Inspeccion De Techos (EN) | https://ilatekpr.com/en/inspeccion-de-techos | CREAR PÁGINA | `1175fa6d7069` | 233 KB |
| 066-en-inspeccion-y-mantenimiento-de-techos | Sitio - Inspeccion y Mantenimiento De Techos (EN) | https://ilatekpr.com/en/inspeccion-y-mantenimiento-de-techos | CREAR PÁGINA | `e771cf3d6809` | 240 KB |
| 067-en-instalacion-y-reemplazo-de-techos | Sitio - Instalacion y Reemplazo De Techos (EN) | https://ilatekpr.com/en/instalacion-y-reemplazo-de-techos | CREAR PÁGINA | `288c8130d82a` | 237 KB |
| 068-en-lavado-a-presion | Sitio - Lavado A Presion (EN) | https://ilatekpr.com/en/lavado-a-presion | CREAR PÁGINA | `77fccb0074ef` | 229 KB |
| 069-en-lavado-a-presion-techos | Sitio - Lavado A Presion Techos (EN) | https://ilatekpr.com/en/lavado-a-presion-techos | CREAR PÁGINA | `c9e4483b618d` | 234 KB |
| 070-en-limpieza-comercial | Sitio - Limpieza Comercial (EN) | https://ilatekpr.com/en/limpieza-comercial | CREAR PÁGINA | `08e63e4c8970` | 229 KB |
| 071-en-limpieza-de-mudanza | Sitio - Limpieza De Mudanza (EN) | https://ilatekpr.com/en/limpieza-de-mudanza | CREAR PÁGINA | `d6f4daadb041` | 229 KB |
| 072-en-limpieza-de-techos-y-canaletas | Sitio - Limpieza De Techos y Canaletas (EN) | https://ilatekpr.com/en/limpieza-de-techos-y-canaletas | CREAR PÁGINA | `254c6e93d8cd` | 236 KB |
| 073-en-limpieza-estandar | Sitio - Limpieza Estandar (EN) | https://ilatekpr.com/en/limpieza-estandar | CREAR PÁGINA | `1423d0610ad4` | 229 KB |
| 074-en-limpieza-industrial | Sitio - Limpieza Industrial (EN) | https://ilatekpr.com/en/limpieza-industrial | CREAR PÁGINA | `e7ab22f96803` | 229 KB |
| 075-en-limpieza-profunda | Sitio - Limpieza Profunda (EN) | https://ilatekpr.com/en/limpieza-profunda | CREAR PÁGINA | `03434e4e168e` | 229 KB |
| 076-en-limpieza-residencial | Sitio - Limpieza Residencial (EN) | https://ilatekpr.com/en/limpieza-residencial | CREAR PÁGINA | `2c7c04a6b780` | 230 KB |
| 077-en-mantenimiento-de-techos | Sitio - Mantenimiento De Techos (EN) | https://ilatekpr.com/en/mantenimiento-de-techos | CREAR PÁGINA | `094ad1403df5` | 234 KB |
| 078-en-membrana-asfaltica | Sitio - Membrana Asfaltica (EN) | https://ilatekpr.com/en/membrana-asfaltica | CREAR PÁGINA | `cceb48e957b5` | 233 KB |
| 079-en-organizacion | Sitio - Organizacion (EN) | https://ilatekpr.com/en/organizacion | CREAR PÁGINA | `94e21f0e1639` | 228 KB |
| 080-en-politica | Sitio - Politica (EN) | https://ilatekpr.com/en/politica | CREAR PÁGINA | `8556eec3ab3d` | 212 KB |
| 081-en-post-construccion | Sitio - Post Construccion (EN) | https://ilatekpr.com/en/post-construccion | CREAR PÁGINA | `bb84bc1af867` | 229 KB |
| 082-en-recubrimiento-elastomerico | Sitio - Recubrimiento Elastomerico (EN) | https://ilatekpr.com/en/recubrimiento-elastomerico | CREAR PÁGINA | `7d10084ff107` | 235 KB |
| 083-en-reparacion-de-filtraciones | Sitio - Reparacion De Filtraciones (EN) | https://ilatekpr.com/en/reparacion-de-filtraciones | CREAR PÁGINA | `33160baf5155` | 235 KB |
| 084-en-reparacion-de-goteras | Sitio - Reparacion De Goteras (EN) | https://ilatekpr.com/en/reparacion-de-goteras | CREAR PÁGINA | `0667801f7489` | 235 KB |
| 085-en-reparacion-de-grietas-techos | Sitio - Reparacion De Grietas Techos (EN) | https://ilatekpr.com/en/reparacion-de-grietas-techos | CREAR PÁGINA | `d0fd345d4ec7` | 237 KB |
| 086-en-reparacion-de-techos | Sitio - Reparacion De Techos (EN) | https://ilatekpr.com/en/reparacion-de-techos | CREAR PÁGINA | `669ce35ba126` | 236 KB |
| 087-en-reparacion-post-huracan | Sitio - Reparacion Post Huracan (EN) | https://ilatekpr.com/en/reparacion-post-huracan | CREAR PÁGINA | `ff5ea386dd02` | 234 KB |
| 088-en-resenas | Sitio - Resenas (EN) | https://ilatekpr.com/en/resenas | CREAR PÁGINA | `645a9c23d4cf` | 216 KB |
| 089-en-sellado-acrilico | Sitio - Sellado Acrilico (EN) | https://ilatekpr.com/en/sellado-acrilico | CREAR PÁGINA | `4375b4f7a067` | 233 KB |
| 090-en-sellado-de-poliuretano | Sitio - Sellado De Poliuretano (EN) | https://ilatekpr.com/en/sellado-de-poliuretano | CREAR PÁGINA | `ec927f4d3cd8` | 234 KB |
| 091-en-sellado-de-silicona | Sitio - Sellado De Silicona (EN) | https://ilatekpr.com/en/sellado-de-silicona | CREAR PÁGINA | `72079efa92cf` | 233 KB |
| 092-en-sellado-de-techos | Sitio - Sellado De Techos (EN) | https://ilatekpr.com/en/sellado-de-techos | CREAR PÁGINA | `694daf2807d6` | 272 KB |
| 093-en-sellado-de-techos-comercial | Sitio - Sellado De Techos Comercial (EN) | https://ilatekpr.com/en/sellado-de-techos-comercial | CREAR PÁGINA | `453e0daa71ed` | 235 KB |
| 094-en-sellado-de-techos-industrial | Sitio - Sellado De Techos Industrial (EN) | https://ilatekpr.com/en/sellado-de-techos-industrial | CREAR PÁGINA | `f8852c314887` | 235 KB |
| 095-en-sellado-de-techos-residencial | Sitio - Sellado De Techos Residencial (EN) | https://ilatekpr.com/en/sellado-de-techos-residencial | CREAR PÁGINA | `587b8fdde03a` | 235 KB |
| 096-en-servicios | Sitio - Servicios (EN) | https://ilatekpr.com/en/servicios | CREAR PÁGINA | `6703a083b159` | 284 KB |
| 097-en-servicios-techos | Sitio - Servicios Techos (EN) | https://ilatekpr.com/en/servicios-techos | CREAR PÁGINA | `da80c0da7a33` | 376 KB |
| 098-en-techos | Sitio - Techos (EN) | https://ilatekpr.com/en/techos | CREAR PÁGINA | `3c3d52f7f011` | 286 KB |
| 099-en-techos-de-asfalto | Sitio - Techos De Asfalto (EN) | https://ilatekpr.com/en/techos-de-asfalto | CREAR PÁGINA | `bc7a8da99810` | 232 KB |
| 100-en-techos-de-concreto | Sitio - Techos De Concreto (EN) | https://ilatekpr.com/en/techos-de-concreto | CREAR PÁGINA | `1eda375fab38` | 233 KB |
| 101-en-techos-de-madera | Sitio - Techos De Madera (EN) | https://ilatekpr.com/en/techos-de-madera | CREAR PÁGINA | `403013317de1` | 233 KB |
| 102-en-techos-de-teja | Sitio - Techos De Teja (EN) | https://ilatekpr.com/en/techos-de-teja | CREAR PÁGINA | `eb44940c8bcb` | 232 KB |
| 103-en-techos-de-zinc | Sitio - Techos De Zinc (EN) | https://ilatekpr.com/en/techos-de-zinc | CREAR PÁGINA | `ef640d8458a3` | 232 KB |
| 104-en-techos-planos | Sitio - Techos Planos (EN) | https://ilatekpr.com/en/techos-planos | CREAR PÁGINA | `00d83a0c363c` | 232 KB |
| 105-en-techos-por-segmento | Sitio - Techos Por Segmento (EN) | https://ilatekpr.com/en/techos-por-segmento | CREAR PÁGINA | `811c927d83fc` | 234 KB |
| 106-en-terminos | Sitio - Terminos (EN) | https://ilatekpr.com/en/terminos | CREAR PÁGINA | `da3077456556` | 207 KB |
| 107-en-tragaluces | Sitio - Tragaluces (EN) | https://ilatekpr.com/en/tragaluces | CREAR PÁGINA | `a2da18e88e28` | 231 KB |
| 108-en-ventanas | Sitio - Ventanas (EN) | https://ilatekpr.com/en/ventanas | CREAR PÁGINA | `d29c34818a28` | 228 KB |

**Acciones:** REPUBLICAR (49) · CREAR PÁGINA (57).

## 2.1 Cuerpo EN alineado con el ES (21 de noviembre de 2026)

Los 51 artefactos EN del lote se regeneraron desde el gemelo ES de cada uno con el pipeline del
repo (`en-extract` → `en-autotranslate` → `build-en`), y después se les devolvió el menú y el pie
canónicos con `composeShell`. El ES es la única fuente: no se escribió copy a mano.

> En el cierre del 21/11 sí hubo dos retoques mínimos y localizados: siete valores del mapa `src/en/home.json`
> con el token pegado (solo se añadieron espacios) y la frase `qa2` del diccionario `ILATEK_I18N` del home ES,
> que escribía «Puerto Rico» donde el ES usa `{{custom_values.county_name_and_state}}`. Detalle en 3.1.

Qué se corrigió:

- **117 entradas de memoria de traducción con cifras viejas** (93 en las 38 landings del lote y 24 en
  `resenas`; se re-tradujeron 93 tras retirarlas del mapa): «from $150» donde el ES dice «desde $250», «$0 quote scheduled with $50 refundable»
  donde el ES dice «agenda con $50 descontables del total», «precio por servicio» y «$6.00its service
  page²» donde el ES dice «desde $250 por servicio». Se retiraron del mapa y se volvieron a traducir
  desde el ES actual.
- **202 pares `data-es`/`data-en`** (menú y bloques con par bilingüe) que `en-extract` marcaba como
  reutilizables pero nunca llegaban al mapa. Ahora alimentan la traducción.
- **`/servicios` (096)** se estaba generando desde otra página ES (`categorias/servicios/…`); el ES
  real es `categorias/limpieza/es/landing-pages/ghl-servicios-landing.html`. Corregido el `EXTRA` de
  `en-extract` y `build-en`.
- **Cinco páginas fuera del pipeline** (`communities`, `garantia`, `politica`, `resenas`,
  `terminos`) se incorporaron al `EXTRA` de ambos tools y se regeneraron desde el ES de cada una.
- **Una frase del ES de 066** («La inspección es gratuita…») contradecía los facts del propio lote
  ($50 descontables) y el guard de `sync-artifacts`. Se corrigió en el ES (texto y `data-en`) y se
  regeneraron los dos artefactos (013 y 066).

### Comprobación automática de paridad

`tools/verify-en-parity.mjs` recorre los 51 pares EN↔ES del lote (emparejados por URL) y falla si:

1. aparece una cadena en español en el cuerpo visible del EN (fuera del menú y el pie, que son el
   shell canónico compartido y se traducen en runtime);
2. el multiconjunto de números del cuerpo visible no coincide con el del ES;
3. cambia la estructura: `h1`/`h2`/`h3`, número de `<details>` del FAQ, destinos `data-ilatek-path`
   (normalizando el prefijo `/en`) o número de bloques JSON-LD;
4. el EN usa una clave `{{custom_values.*}}` que el ES no usa.

Resultado de la última ejecución: **51 pares · 51 en paridad · 0 infracciones**.

Excepciones documentadas (no son texto a traducir): marcas y nombres propios (`Ilatek`,
`Ilatek Techos`, `Devasks`), topónimos (`Puerto Rico`, `zinc`), rutas y atributos (`href`, `src`,
`data-*`), los espejos `data-es`/`data-en` del runtime, y los valores del JSON-LD, que se comparan
por forma (número de bloques) y no por texto porque el EN expande la respuesta FAQ con el texto
completo. Los tokens se comparan como vocabulario: donde el ES escribe el correo o el dominio
literales, el EN usa la clave equivalente y GHL renderiza el mismo valor.

### sha256 antes → después (54 artefactos)

| Artefacto | Antes | Ahora | Tamaño |
|---|---|---|---|
| 013-inspeccion-y-mantenimiento-de-techos | `decf6fce2202` | `1e4c44f2c738` | 241 → 241 KB |
| 056-en-airbnb-turnover | `5e2da310cc4b` | `d30acffd12bd` | 230 → 229 KB |
| 057-en-alfombras | `2a32a2f95df9` | `f8c97e4b9ca6` | 230 → 228 KB |
| 058-en-canaletas-y-bajantes | `a29a61d88836` | `a64a3ad44d35` | 239 → 233 KB |
| 059-en-communities | `d6234e38198c` | `74723d4c9e6b` | 617 → 617 KB |
| 060-en-electrodomesticos | `1764c7780899` | `b7c62dfa61bd` | 230 → 229 KB |
| 061-en-empozamiento-de-techos | `6d277fbf4cdb` | `c4d76e2fa441` | 240 → 234 KB |
| 062-en-garantia | `a69f88c6514e` | `7b7df4c360a3` | 196 → 199 KB |
| 063-en-home | `f04772ab1f25` | `eae9c2bd359e` | 428 → 436 KB |
| 064-en-impermeabilizacion-de-techos | `3ce32401ba49` | `a24ecb30b155` | 242 → 237 KB |
| 065-en-inspeccion-de-techos | `98c9341c731b` | `1175fa6d7069` | 239 → 233 KB |
| 066-en-inspeccion-y-mantenimiento-de-techos | `3a5e8c143476` | `e771cf3d6809` | 246 → 240 KB |
| 067-en-instalacion-y-reemplazo-de-techos | `bd4db7515f87` | `288c8130d82a` | 243 → 237 KB |
| 068-en-lavado-a-presion | `499c47acd44e` | `77fccb0074ef` | 230 → 229 KB |
| 069-en-lavado-a-presion-techos | `90beff705651` | `c9e4483b618d` | 239 → 234 KB |
| 070-en-limpieza-comercial | `2401d546e08e` | `08e63e4c8970` | 230 → 229 KB |
| 071-en-limpieza-de-mudanza | `8fe59a9bda13` | `d6f4daadb041` | 231 → 229 KB |
| 072-en-limpieza-de-techos-y-canaletas | `cc340dbd2dc1` | `254c6e93d8cd` | 242 → 236 KB |
| 073-en-limpieza-estandar | `8e0771e25625` | `1423d0610ad4` | 230 → 229 KB |
| 074-en-limpieza-industrial | `912268d85bcb` | `e7ab22f96803` | 230 → 229 KB |
| 075-en-limpieza-profunda | `950159c29703` | `03434e4e168e` | 230 → 229 KB |
| 076-en-limpieza-residencial | `bc8cadb3c3d7` | `2c7c04a6b780` | 231 → 230 KB |
| 077-en-mantenimiento-de-techos | `ee635acd8b5a` | `094ad1403df5` | 239 → 234 KB |
| 078-en-membrana-asfaltica | `fa0fc2cbd716` | `cceb48e957b5` | 239 → 233 KB |
| 079-en-organizacion | `a67cfa7c4457` | `94e21f0e1639` | 229 → 228 KB |
| 080-en-politica | `cce6d6fb73dd` | `8556eec3ab3d` | 200 → 212 KB |
| 081-en-post-construccion | `206543a73b7e` | `bb84bc1af867` | 230 → 229 KB |
| 082-en-recubrimiento-elastomerico | `524c06f03f7d` | `7d10084ff107` | 241 → 235 KB |
| 083-en-reparacion-de-filtraciones | `49b502813f22` | `8cc818112b6b` | 241 → 235 KB |
| 084-en-reparacion-de-goteras | `759ca9345cae` | `35299cfabdc3` | 241 → 235 KB |
| 085-en-reparacion-de-grietas-techos | `81bc764efdef` | `fd5d8fce898a` | 242 → 237 KB |
| 086-en-reparacion-de-techos | `0676826b8d21` | `61ae6b53954d` | 241 → 236 KB |
| 087-en-reparacion-post-huracan | `7806c5cb71d5` | `ff5ea386dd02` | 240 → 234 KB |
| 088-en-resenas | `0e61709dd599` | `956dfcbb86d1` | 218 → 216 KB |
| 089-en-sellado-acrilico | `35fb59e64fdd` | `79939e78fcc4` | 239 → 233 KB |
| 090-en-sellado-de-poliuretano | `9fb67d4b2699` | `ec927f4d3cd8` | 240 → 234 KB |
| 091-en-sellado-de-silicona | `b97f54f9afd4` | `72079efa92cf` | 239 → 233 KB |
| 092-en-sellado-de-techos | `19d562b87bcd` | `af0ed97b0a3f` | 262 → 272 KB |
| 093-en-sellado-de-techos-comercial | `aceac83296fb` | `453e0daa71ed` | 240 → 235 KB |
| 094-en-sellado-de-techos-industrial | `5d07f9d3ae2a` | `f8852c314887` | 241 → 235 KB |
| 095-en-sellado-de-techos-residencial | `ff167497a418` | `920c0cb988f4` | 241 → 235 KB |
| 096-en-servicios | `411106a4a5ff` | `28c49a2254c5` | 358 → 284 KB |
| 097-en-servicios-techos | `0e0e45c852b8` | `da80c0da7a33` | 384 → 376 KB |
| 098-en-techos | `08b6fae9e94c` | `111696f8fb76` | 293 → 285 KB |
| 099-en-techos-de-asfalto | `492cad73f68d` | `a24cabee2490` | 238 → 232 KB |
| 100-en-techos-de-concreto | `35c38cf07b00` | `1eda375fab38` | 238 → 233 KB |
| 101-en-techos-de-madera | `d7b522f5ed23` | `403013317de1` | 238 → 233 KB |
| 102-en-techos-de-teja | `5b7b60ce8edb` | `eb44940c8bcb` | 238 → 232 KB |
| 103-en-techos-de-zinc | `a101d0aaf1e8` | `de1351d652cc` | 238 → 232 KB |
| 104-en-techos-planos | `424176896e43` | `00d83a0c363c` | 238 → 232 KB |
| 105-en-techos-por-segmento | `b22ca0478920` | `811c927d83fc` | 239 → 234 KB |
| 106-en-terminos | `2112370f3f52` | `da3077456556` | 202 → 207 KB |
| 107-en-tragaluces | `4a0c7f395f19` | `a2da18e88e28` | 237 → 231 KB |
| 108-en-ventanas | `728168588546` | `d29c34818a28` | 229 → 228 KB |

> **Nota de cierre (21/11/2026).** La columna «Ahora» de esta tabla y las filas de la sección 2 están calculadas con los bytes finales de hoy: las 53 copias EN se regeneraron desde su ES al reparar el home (sección 3.1) y `1-PAGINA.txt` se reescribió con el sha nuevo de cada una. La columna «Antes» conserva el sha previo a la misión de alineación.

## 3. Verificadores (los 26 re-ejecutados contra los bytes finales del 21 de noviembre de 2026)

Esta pasada es la **auditoría de regresión** del arreglo del home EN: los logs están en
`Ilatek/.tmp-verify/regresion/` y la atribución de cada rojo, archivo por archivo, en la sección 3.5.

**Ejecución fresca, después de la reparación del home EN.** Cada verificador corrió en su propio proceso (`node <script>`, sin encadenar con `&&`), con el exit capturado por separado y el log en `Ilatek/.tmp-verify/2026-11-21/`. El plan nombraba 22; el árbol tiene **26 scripts ejecutables** y se han corrido los 26. `verify-en-parity` (guardián del lote) y `sync-artifacts --check` (manifiesto) van aparte, como filas 27 y 28: son las comprobaciones nacidas para los 106 (la otra que los lee es `test-faq`, fila 21). La ejecución del 20/11 queda como histórico en la sección 12.1.

| # | Verificador | Familia | Exit | ¿Toca el lote? | Evidencia / archivos afectados |
|---|---|---|---|---|---|
| 1 | `verify-structure` | Packs de página: estructura, medios, scripts | **0** | no | 47 páginas · `failures: []` · 995 copias de medios · 608 bloques de script |
| 2 | `verify-structure --migration` | Guard histórico de migración | **1** | fuera del lote | 47/47 fallos, todos `HTML changed` (exige HTML idéntico al original; por diseño). Ej.: `home/es/landing-pages/ghl-home-multiservicios.html`, `servicios/airbnb-turnover/es/landing-pages/ghl-airbnb-turnover-landing.html` |
| 3 | `verify-techos` | 32 páginas generadas de techos | **0** | no | 32/32 en schema, precio, FAQ, alt, Open Graph, canonical/sitemap/llms |
| 4 | `verify-internal-links` | Contrato de enlaces + idempotencia | **0** | no | 279 archivos · `urlNormalization: passed` · `idempotence: passed`. En esta jornada se corrigieron dos copias planas en CRLF (`techos-de-concreto.html`, `techos-planos.html`) y se re-canonicalizó `home/es/landing-pages/ghl-home-multiservicios.html` |
| 5 | `verify-page-shell` | Header y pie canónicos | **0** | no | 109 delivery files + 32 páginas de techos · sin componentes duplicados · idempotente |
| 6 | `verify-location` | SEO local, alt/title, espejos markdown/HEAD | **0** | no | 47 documentos SEO · 2 141 imágenes · 97 decorativas |
| 7 | `verify-responsive` | Reglas responsive en CSS | **0** | no | 94 heroes · 296 controles de flecha · `idempotence: passed` |
| 8 | `verify-seo-integrity` | SEO on-page, canonical, hreflang | **0** | no | canónicas self · 59 anchors al money en 9 variantes |
| 9 | `verify-schema-prices` | Precios en JSON-LD | **0** | no | money sin precio verificado · silicona con $250 verificado |
| 10 | `verify-sitemap` | Sitemap | **0** | no | 98 URLs únicas, sin sufijos heredados |
| 11 | `verify-faq-words` | FAQ y recuento de palabras | **0** | no | 23 preguntas, todas de 40–60 palabras |
| 12 | `verify-anchor-ratio` | Proporción de anchors | **0** | no | 2/46 409 en 779 páginas (0,00 %) |
| 13 | `verify-social-cards` | Tarjetas sociales 1200×630 | **1** | fuera del lote | 185 páginas · **80 fallos en 20 páginas, todas `blog-*`/`blog-en-*`** (0 no-blog) · WebP existentes 185/185 |
| 14 | `verify-cannibalization` | Canibalización (normal) | **0** | no | 194 preguntas · 1 hallazgo · sin exportes de GSC (avisa, no falla) |
| 15 | `verify-cannibalization --strict` | Canibalización estricta | **1** | fuera del lote | 1 hallazgo: «¿Cuánto dura el sellado de un techo?» (blog) vs «¿Cuánto dura el sellado de techo?» (garantía) · 0 exportes de Search Console |
| 16 | `verify-nav` | Menú y pie en las 109 páginas | **0** | no | menú `8a92d7a3` · pie `52a91468` · **1 variante de cada** · 0 fallos |
| 17 | `verify-nav-live` | Menú/pie del sitio publicado (red) | **1** | fuera del lote | 98 rutas de `ilatekpr.com` · 98 con HTTP 200 · **98/98 con clase «estructura»** (mide producción, no el lote) |
| 18 | `verify-en` | Paridad ES/EN de las landings fuente | **1** | fuera del lote | 48 copias EN · **104 fallos**: 48 «texto en español» (el mismo comentario de contrato, dentro de `<!-- … -->`, no visible), 48 enlaces a `/comunidades` + 1 a `/…` (páginas del lote con acción `CREAR PÁGINA`, hoy 404, fuera de su lista de destinos) y 6 de `home`/`servicios` (hreflang del HEAD fuente, `/en/resenas` aún sin copia, y tokens de `servicios.html`: 109/73 frente a 102/0; el artefacto ES `043-servicios` tiene 102/0, así que el EN coincide con su ES real). El home ya no pierde tokens: 87/87 |
| 19 | `verify-samples` | Muestras de enlazado interno | **1** | fuera del lote | 6 problemas: `en/home`, `comunidades` y `techos` «sin destino» porque no están en su índice de sitemap (las dos últimas son páginas del lote con acción `CREAR PÁGINA` y hoy 404) |
| 20 | `verify-ghl-publish` | Compara una URL publicada | **2** | fuera del lote | Exit 2 = uso: exige `<url>` y `--expect=home\|legal\|landing` |
| 21 | `test-faq (faq-parity)` | FAQ HTML ↔ JSON-LD en todo el sitio | **1** | no (el lote está a 0) | 4 490 páginas · **0 H3 sin schema** (eran 226) · 3 301 schema sin H3 (todo fuera del lote) · **0 respuestas divergentes** · 2 571 ítems sin pregunta. **Las 106 filas del lote están a 0**: los acordeones legales (`010`, `027`, `053` y sus EN `062`, `080`, `106`) quedaron 20/20, 21/21 y 29/29 tras la Fase 2 punto 5 (3.7). El exit 1 viene solo de blog y `Comunidades/` |
| 22 | `test-responsive (browser)` | Responsive en navegador (Playwright) | **1** | fuera del lote | No ejecutable: `Cannot find module 'playwright'` |
| 23 | `verify-longtail` | Longtail del blog | **0** | no | 100 posts · 565 imágenes con alt |
| 24 | `verify-blog` | Blog ES | **0** | no | 138 páginas · 740 anclas verificadas |
| 25 | `verify-blog-en` | Pares ES/EN del blog | **1** | fuera del lote | 138 copias · **256 fallos**, todos pares `/blog…` («el ES no anuncia su par EN» y viceversa) |
| 26 | `verify-embeds` | Embeds del blog | **0** | no | 266 embeds · 0 fallos |
| 27 | `verify-en-parity` | **Guard del lote** ES↔EN | **0** | **sí (lote)** | 51 pares · 51 en paridad · 0 infracciones |
| 28 | `sync-artifacts --check` | **Manifiesto del lote** | **0** | **sí (lote)** | 106 artefactos · 0 problemas · 248 KB de media |

### 3.1 Lo que se reparó en esta pasada

Todas las reparaciones son de causa y ninguna toca copy ajeno al home:

1. **`rebuildFaq` de `tools/build-en.mjs`** exigía `<p>` pelado (`<p>respuesta</p>`). Las FAQ del home usan `<p data-en-key="qaN">`, así que el `FAQPage` nunca se reconstruía y conservaba el texto español del ES. Ahora acepta `<p\b[^>]*>` y reconstruye las 10 respuestas desde la FAQ visible. Efecto en las 53 copias EN: `FAQPage` reconstruido en todas (5–23 preguntas por página).
2. **`applyI18n` (nuevo en `build-en`)** aplica a los elementos con `data-en-key` el diccionario `window.ILATEK_I18N` que la propia página ES ya trae (27 bloques en el home, incluidos los 10 `qaN`). Es la traducción inglesa ya publicada del sitio: no se inventó copy. Elimina los pegotes de la traducción fragmentaria («IlatekCovers», «reservationsIlatekin», «waterproofing y inspection»).
3. **`tidyPlaceholders` (nuevo en `build-en`)** separa un `{{custom_values.*}}` de la palabra a la que quedó pegado. Recorrió las 53 copias EN: **0 tokens pegados** en el texto visible de los 106 artefactos (antes, 201 nodos con el token pegado antes y 55 después; 53/53 artefactos afectados).
4. **Siete valores del mapa `src/en/home.json`** con el token pegado se corrigieron con las palabras que ya estaban en la frase (p. ej. «All roofing services in{{…}}» → «in {{…}}»), y la entrada de «Conoce quiénes somos… cada servicio de Ilatek en {{…}}» pasó a «…the purpose that guides each Ilatek service in {{…}}».
5. **`qa2` del diccionario I18N del home ES** escribía «Puerto Rico's tropical climate» donde el ES usa el token; se restauró `\u007b\u007bcustom_values.county_name_and_state\u007d\u007d`. Resultado: **87 tokens de condado en ES y 87 en EN** (antes 85 en EN). El cambio se hizo en el ES y la copia se regeneró desde él.
6. **Dos copias planas en CRLF** (`servicios/techos-de-concreto/…/techos-de-concreto.html` y `servicios/techos-planos/…/techos-planos.html`) rompían la idempotencia de `verify-internal-links`; se pasaron por el `formatPage` del contrato. El `.gitattributes` ya exigía `*.html text eol=lf` por esto.

**Alcance del cambio de bytes:** las 53 copias EN se regeneraron desde su ES (52 cambiaron respecto de su estado anterior; el home además cambió por el arreglo de FAQ), y `sync-artifacts` reescribió sus 53 artefactos y actualizó `1-PAGINA.txt` (sha + KB). El artefacto ES `001-inicio` **no cambió**: su origen es `home/es/landing-pages/home.html`, no el `ghl-home-multiservicios.html` que se tocó.

### 3.2 Rojos: 10 en total, 9 fuera del lote

**Ninguno de los nueve logs de fuera del lote menciona `GHL-PUBLICAR`** (grep = 0 en `migration`, `social-cards`, `samples`, `nav-live`, `blog-en`, `en`, `cannibalization-strict`, `responsive-browser` y `ghl-publish`), y `verify-nav-live` excluye la carpeta en su constante `EXCL`. Lo que miden:

| Rojo | Qué mide realmente |
|---|---|
| `verify-structure --migration` | Guard histórico: exige HTML idéntico al original y las páginas se editaron a propósito |
| `verify-social-cards` | 20 páginas del blog (`blog-*` y `blog-en-*`), ninguna del lote |
| `verify-cannibalization --strict` | Un par de preguntas casi iguales entre blog y garantía; sin exportes de GSC |
| `verify-nav-live` | El sitio **ya publicado** en ilatekpr.com (98 rutas) |
| `verify-en` | Las copias EN de las landings fuente, con dos falsos positivos (comentario HTML y rutas que aún dan 404) y dos comparaciones contra fuentes ES más nuevas |
| `verify-samples` | Enlaces a `/comunidades` y `/techos`, que el lote crea (`CREAR PÁGINA`) y hoy no existen |
| `verify-ghl-publish` | Uso: necesita una URL publicada como argumento |
| `test-responsive (browser)` | Entorno: falta el módulo `playwright` |
| `verify-blog-en` | 138 pares `/blog…`: el ES no anuncia su par EN |

La atribución archivo por archivo de los diez rojos está en la sección 3.5, y la prueba de que ninguno
proviene de los cambios de este turno, en la 3.6.

El décimo rojo, `test-faq`, ya **no imputa nada al lote**: `respuestas_divergentes` pasó de 20 a **0** y los 6 artefactos legales quedaron a cero el 21/11 con la Fase 2 punto 5 (3.7). Lo que queda en su log (`schema_sin_h3=3 301`, `items_sin_pregunta=2 571`) está en blog, `Comunidades/`, respaldos de `documentacion/` y una copia `-backup`, nunca en los 106.

### 3.3 El home EN, antes y después

| Comprobación sobre `063-en-home` | Antes | Ahora |
|---|---|---|
| Respuestas del `FAQPage` divergentes de la FAQ visible | **10** | **0** |
| Respuestas del `FAQPage` en español | 10 de 10 | **0** |
| `IlatekCovers` / «waterproofing y inspection» / «reservationsIlatekin» | presente | **0** |
| Tokens `{{custom_values.county_name_and_state}}` (EN vs ES) | 85 vs 87 | **87 vs 87** |
| Tokens pegados a palabras en el texto visible (106 artefactos) | 53 artefactos | **0** |
| Preguntas visibles / preguntas en schema / orden | 10 / 10 / ES | 10 / 10 / ES |
| sha256 (12) | `b0bcb4dd4f55` | **`eae9c2bd359e`** |

Ejemplo del defecto y de su arreglo, en la primera pregunta («What roofing services does Ilatek offer?»):

- **Antes, visible:** «IlatekCovers the entire life cycle of your roof: roof repair (leaks, leaks, cracks and blockages)…»
- **Antes, schema:** «Ilatek cubre todo el ciclo de vida de tu techo: reparación de techos (goteras, filtraciones…)…»
- **Ahora, visible y schema:** «Ilatek covers your roof's whole life cycle: roof repair (leaks, seepage, cracks and ponding), roof sealing with the right system for every surface, waterproofing and inspection & preventive maintenance…»

### 3.4 Veredicto de esta pasada

- **Los 106 artefactos quedan sin reservas propias:** `sync-artifacts --check` **106 / 0**, manifiesto `1-PAGINA.txt` ↔ bytes **106/106**, `verify-en-parity` **51/51 con 0 infracciones**, `verify-page-shell` en verde e idempotente, `test-faq` con **0 respuestas divergentes** en todo el sitio y **0 tokens pegados** en el copy visible.
- **`063-en-home` ya no es una excepción:** FAQ visible y `FAQPage` íntegramente en inglés, 10 preguntas en el mismo orden que el ES, tokens 87/87 y sha nuevo `eae9c2bd359e` reflejado en las tablas 2 y 2.1.
- **`test-faq` ya no marca nada dentro del lote:** los 6 artefactos legales pasaron de 20/5, 21/5 y 29/5 a **20/20, 21/21 y 29/29** con la Fase 2 punto 5 (3.7). Todo el rojo restante de `faq-parity` está en `Comunidades/`, el blog y respaldos de `documentacion/`.
- **9 rojos siguen fuera del lote:** blog (tarjetas, pares EN, canibalización), `Comunidades/` (FAQ masivo), producción publicada (`nav-live`), guard histórico (`migration`), enlaces a páginas que el propio lote crea (`samples`, `en`) y el entorno sin Playwright.
- **Atribución cerrada:** la tabla 3.5 mapea cada rojo a sus archivos y lo clasifica como preexistente, guard por diseño, uso o entorno, y la 3.6 demuestra con los bytes del respaldo que las 53 copias EN no perdieron tokens, estructura ni preguntas: **cero fallos atribuibles a este turno**.

### 3.5 Atribución de cada rojo, archivo por archivo

Regla aplicada: un fallo es **de este turno** solo si el verificador reporta un archivo que está dentro de
los 106 artefactos o dentro de los bytes que este turno reescribió (las 53 copias EN, el home ES,
`tools/build-en.mjs` y `src/en/home.json`) **y** su causa desaparece al volver al byte previo. Si el disparador ya está en el
respaldo `.tmp-verify/en-before/`, es preexistente; si el archivo reportado no está en ese conjunto, el turno
no pudo introducirlo. Los logs de esta pasada están en `Ilatek/.tmp-verify/regresion/`.

| Verificador (exit) | Archivos concretos que reporta | ¿Dentro de los 106? | ¿En los bytes reescritos este turno? | Clasificación | Evidencia de bytes |
|---|---|---|---|---|---|
| `verify-en` (**1**) | las 53 copias EN: 48 con comentario y enlace, más `home` (enlace suelto, `/en/resenas` y 2 `hreflang`) y `servicios` (mapeo de tokens) | los artefactos EN sí; los archivos fuente no son artefactos | **sí** (las 53) | **preexistente** (0 causas nuevas) | 104 fallos antes y después, diff de líneas = 0 nuevas; los 4 disparadores están idénticos en el respaldo (3.6) |
| `test-faq (faq-parity)` (**1**) | 635 filas: 485 `blog/`, 126 `GHL-PUBLICAR/por-pagina` (blog→GHL), 9 páginas legales (copia `ILATEK-*` y `documentacion/`), 8 `documentacion/` y 1 `home/es/…-backup.html`; **0 del lote** | no | las 3 fuentes EN legales sí (Fase 2 punto 5) | **fuera del lote**; las legales del lote quedaron a 0 (3.7) | `h3_sin_schema` 226 → **0** en todo el sitio; `respuestas_divergentes=0` |
| `verify-social-cards` (**1**) | 20 páginas: 11 `blog-en-*` y 9 `blog-*` | no | no | **preexistente**, familia blog | `og:image` apunta a la media `797f9018-…webp` y faltan `width/height` 1200×630; el turno no toca `blog/` |
| `verify-blog-en` (**1**) | 138 pares `/blog…` (256 fallos: el ES no anuncia su par EN y viceversa) | no | no | **preexistente**, familia blog | solo pares `/blog…`; el turno no toca `blog/` |
| `verify-cannibalization --strict` (**1**) | 2 páginas: `blog/…sellado…` y `garantia/…` | no | no | **preexistente** | 1 hallazgo entre dos preguntas del blog y la página de garantías, ninguna reescrita este turno |
| `verify-nav-live` (**1**) | 98 rutas de `ilatekpr.com` | no | no | **preexistente**, mide producción | 98/98 con shell en el sitio publicado; 0 no publicadas, 0 con despliegue desactualizado |
| `verify-structure --migration` (**1**) | 47/47 páginas `*/es/*` | no (los artefactos no son esas rutas) | incluye la fuente ES del home; las otras 46 no se tocaron | **guard por diseño** | 47/47 fallan con `HTML changed`: exige HTML idéntico al original y el sitio entero se migró |
| `verify-samples` (**1**) | 3 destinos: `en/home`, `comunidades`, `techos` (6 problemas) | `comunidades` y `techos` son artefactos con acción `CREAR PÁGINA` | no (son URLs del sitemap) | **preexistente** | los tres destinos no están en el índice del sitemap; `sitemap.xml` no se tocó este turno |
| `verify-ghl-publish` (**2**) | — | — | — | **uso** | exit 2: exige una URL publicada y `--expect=home\|legal\|landing` |
| `test:responsive` en navegador (**1**) | — | — | — | **entorno** | `Cannot find module 'playwright'`; no llega a abrir página |

**Cero fallos atribuidos a los cambios de este turno.** Los dos únicos rojos que tocan los 106 son
`test-faq` (6 artefactos legales, Fase 2) y `verify-en` (sus fuentes EN, con los mismos disparadores que
antes del turno); ninguno de los dos cambia de cifras ni de líneas respecto del pase previo.

### 3.6 Prueba de no regresión de los cambios de este turno

Contra el respaldo de las 53 copias EN previas a la reparación (`Ilatek/.tmp-verify/en-before/`):

| Comprobación | Método | Resultado |
|---|---|---|
| Tokens `{{custom_values.*}}` por clave | multiconjunto respaldo ↔ bytes actuales, 53 archivos | **0 archivos con claves perdidas**. El único cambio es el previsto: `county_name_and_state` 85 → 87 en el home (337 → 339 tokens) |
| Estructura | `h1`, `h2`, `h3`, `<details>`, bloques JSON-LD, `FAQPage`, `dv-ghl-values`, 53 archivos | **0 diferencias** |
| Preguntas | preguntas visibles (`<details>`) y `<Question>` del schema, 53 archivos | **0 cambios** de número |
| Disparadores de `verify-en` | comentario ES, `/comunidades`, `/'+s.slug+'`, `/en/resenas` en respaldo ↔ ahora | **53/53 idénticos** (mismos archivos, mismas apariciones). El home conserva 5 `hreflang` igual que el ES y el respaldo |
| Fallos de `verify-en` | diff exacto de las 104 líneas `✗` del pase previo ↔ ahora | **104 = 104**: 0 líneas nuevas, 0 desaparecidas |
| `faq-parity` del lote | las 6 filas legales, columna por columna | **idénticas** al pase previo: 20/5/15, 21/5/16, 29/5/24, 20/5/16+1, 21/5/17+1, 29/5/25+1 |
| Schema legal EN (pasada de regresión) | `<Question>` en respaldo ↔ ahora | 5 → 5, 5 → 5, 5 → 5. Después, la Fase 2 punto 5 los llevó a 20/21/29 (3.7) |
| Home EN | tokens y preguntas | 87/87 tokens, 10 visibles, 10 en `FAQPage` |
| Artefacto `063-en-home` | `1-PAGINA.txt`, tabla 2 y tabla 2.1 | `eae9c2bd359e` · 436 KB en los tres sitios |
| Manifiesto | sha256 de los 106 artefactos ↔ `1-PAGINA.txt` | **106/106** |
| Gates del lote | `sync-artifacts --check`, `verify-en-parity`, `verify-page-shell` | **0 / 0 / 0** |

Ninguna de las 53 copias EN ganó ni perdió una sola clave de custom value, una etiqueta de estructura o
una pregunta; el único delta de contenido es el token recuperado en el home y las respuestas del FAQ que
pasaron de español a inglés.

### 3.7 Fase 2, punto 5: acordeones legales cerrados (21/11/2026)

Aprobado por el propietario en este hilo. Estado de partida: los tres legales (ES y EN) tenían los
títulos de sus acordeones en `<h3>` dentro del `<summary>`, pero el `FAQPage` solo listaba las 5
preguntas del final. El verificador los contaba como FAQ: `h3_sin_schema` 15/16/24 en ES,
16/17/25 en EN y `schema_sin_h3` 1 en cada EN (6 artefactos del lote).

Qué se cambió (aditivo, sin tocar una palabra del copy):

- **`tools/build-en.mjs`**: `rebuildFaq` dejó de exigir que el `<p>` fuera hijo directo del
  `<summary>` y ahora usa el mismo modelo que el verificador (`faqItems` de `src/faq/faq-core.mjs`:
  `<h3>` dentro del `<details>` + `<p>` a cualquier profundidad). Antes los acordeones legales
  (`summary → div.section-body → p`) quedaban fuera del schema EN; ahora entran igual que en ES.
- **Las 3 fuentes ES**: se regeneró su `FAQPage` desde los acordeones visibles (20/21/29 preguntas).
  `name` = texto del `<h3>` visible; `acceptedAnswer.text` = texto del primer `<p>` del acordeón,
  calculado con el mismo `text()` que usa el verificador, así que no puede divergir. El volcado JSON
  conserva el formato del bloque (2 espacios, mismo orden de claves) y fuera de él no cambió un byte.
- **Las 3 copias EN**: regeneradas por `build-en` (garantia 20, politica 21, terminos 29), con el
  menú y el pie canónicos devueltos por `composeShell`.
- **Los 6 artefactos**: reescritos por `sync-artifacts` con su `1-PAGINA.txt` (sha + KB).

| Comprobación | Antes | Ahora |
|---|---|---|
| `faq-parity`: filas del lote con hallazgo | 6 | **0** |
| `010` / `027` / `053` (H3 vs schema) | 20/5 · 21/5 · 29/5 | **20/20 · 21/21 · 29/29** |
| `062` / `080` / `106` | 20/5 (+1) · 21/5 (+1) · 29/5 (+1) | **20/20 · 21/21 · 29/29** |
| `checkHtml` de los 6 artefactos | 15 · 16 · 24 · 16 · 17 · 25 errores | **0 en los 6** |
| `h3_sin_schema` en todo el sitio | 226 | **0** |
| `schema_sin_h3` | 3 307 | 3 301 (todo fuera del lote) |
| `respuestas_divergentes` | 0 | **0** |
| sha del lote | — | `010` `e32d0e58e930` · `027` `ee9545ee383b` · `053` `d4d5443e48e1` · `062` `7b7df4c360a3` · `080` `8556eec3ab3d` · `106` `da3077456556` |
| `sync --check` · `page-shell` · `parity` · `structure` · `links` · `nav` · `location` · `seo` · `faq-words` | 0 | **0** |
| `verify-en` | 104 | 104 (diff de líneas = 0) |

**Blast radius:** de las 53 copias EN solo cambiaron las 3 legales (hash antes/después con
`build-en --all` + `composeShell`); las otras 50 quedaron byte a byte idénticas.

**Advertencia de criterio:** el `FAQPage` legal ahora espeja *todos* los acordeones, incluidos los
títulos numerados de sección («(1) Compromiso de Calidad»), que no son preguntas. Es la
consecuencia directa de la regla del verificador —todo `<h3>` visible dentro de un acordeón con
texto debe estar en el schema— y de la instrucción aprobada. Si se prefiere un `FAQPage` con solo
preguntas reales, hace falta cambiar el modelo (marcar los acordeones de sección como no-FAQ), lo
que toca `faq-core`/`build-en` y no está aprobado.

## 4. Los puntos que se auditaron a fondo en este turno

### 4.1 La supuesta regresión de tokens

El turno anterior anotó que en una landing ES los `{{custom_values.*}}` habían caído «de 220 a 87». Medido ahora, token por token:

| Medición | Valor |
|---|---|
| Artefacto `002-airbnb-turnover`: total `{{custom_values.*}}` | **168** |
| De ellos, `business__county_name` | **48** |
| Token en `<title>` / `og:title` / `<h1>` | **sí / sí / sí** |
| Mínimo de tokens en cualquiera de los 106 | **123** |

El «87» era el recuento del literal `business__county_name`, no del total: nunca hubo una página con 87 tokens. La diferencia frente a `HEAD` es **uniforme en los 47 orígenes versionados** (≈−170 cada uno) y proviene de dos cambios de contenido ya aprobados: (a) el pie nuevo dejó de repetir `https://{{custom_values.website_url}}/…` en cada enlace y pasó a rutas con `data-ilatek-path` (por eso `website_url` baja 126→96 en la landing de airbnb), y (b) se retiraron bloques duplicados y comentarios de andamiaje. No se ha reescrito ningún token a mano ni se ha «restaurado» un recuento inventado: cada página conserva su título, su H1 y su párrafo `dv-ghl-values` con los tokens vivos.

### 4.2 Las URLs reescritas, comprobadas por red

- **1675** referencias a `assets.cdn.filesafe.space` en el lote → **65 URLs distintas**, todas pedidas **sin cookies ni sesión**: **65/65 responden 200** (0 fallos).
- Las reescrituras de este trabajo fueron de tarjetas sociales y de `contentUrl` del JSON-LD; ese mismo host es el que acaba de verificarse.

### 4.3 Las tarjetas, comprobadas por asunto

- **36 nodos** con `data-slug` inspeccionados uno a uno (6 pares distintos slug+imagen). Todos los pares son los esperados y cada uno apunta a su propio servicio:

| slug | imagen que carga |
|---|---|
| `mantenimiento-de-techos` | Servicio de Mantenimiento Preventivo de Techos - Ilatek Property Solution - 1.jpg |
| `reparacion-de-techos` | Servicio de Reparación de Techos - Ilatek Property Solution - 1.jpg |
| `sellado-de-techos` | Servicio de Sellado de Techos - Ilatek Property Solution - 1.jpg |
| `impermeabilizacion-de-techos` | Servicio de Impermeabilizacion - Ilatek Property Solution - 1.jpg |
| `techos-por-segmento` | Servicio de Mantenimiento de Techos por segmento - Ilatek Property Solution - 1.jpg |
| `inspeccion-y-mantenimiento-de-techos` | Servicio de Inspección y Mantenimiento de Techos - Ilatek Property Solution - 1.jpg |

- Además se revisó la **primera imagen de servicio de los 106 artefactos** contra su slug (normalizando acentos): **98 páginas con imagen**, todas con archivo existente y 200 (las 8 restantes son Comunidades y páginas legales, que no llevan tarjetas de servicio). Un caso queda **señalado y sin tocar**: `050-techos-de-zinc` usa `Servicio de Instalacion de Tragaluz y Skylights - …jpg` en la sección de metal y zinc (alt: «Techos de metal y zinc»). Abrí la foto: muestra el sellado de un tragaluz, no un techo de zinc. No la sustituí porque no existe una foto de zinc en `assets/services-images/techos/` y cambiarla a ciegas sería empeorarla.

## 5. Blog: el estado real

- **0 de los 106** artefactos proviene de `blog/` (orígenes: `servicios` 72, `categorias` 22, `home` 2, `Comunidades` 2, `garantia` 2, `resenas` 2, legales 4).
- `blog/llms.txt`: sha256 **`48cd16fda1446ce4797d25a79197b1531f655231fd87e6d420a29765c19fc558`** (coincide con `48cd16fda144…`).
- `blog/` tiene **535 HTML**; **43** referencian `assets/services-images/` (normalización de imágenes ya pedida) y **0** contienen `desde $150`. No se ha revertido ninguno.
- Archivos normalizados (los 43): `blog/02-comparativas/index.html`, `blog/03-comunidades-servicios/index.html`, `blog/embeds/blog.html`, `blog/embeds/comparativas.html`, `blog/embeds/comunidades-y-servicios.html`, `blog/embeds/en-en-comparativas.html`, `blog/embeds/en-en-comunidades-ilatekpr-como-funciona.html`, `blog/embeds/en-en-comunidades-y-servicios.html`, `blog/embeds/en-en-guia-de-servicios-de-techos-de-ilatek.html`, `blog/embeds/en-en-ilatek-y-el-recubrimiento-elastomerico.html`, `blog/embeds/en-en-ilatek-y-el-sellado-acrilico.html`, `blog/embeds/en-en-ilatek-y-el-sellado-de-poliuretano.html`, `blog/embeds/en-en-ilatek-y-el-sellado-de-silicona.html`, `blog/embeds/en-en-ilatek-y-la-membrana-asfaltica.html`, `blog/embeds/en-en-preguntas-frecuentes-sellado-de-techos-clima-y-huracanes.html`, `blog/embeds/en-en-preguntas-frecuentes-sellado-de-techos-garantia-y-leyes.html`, `blog/embeds/en-en-preguntas-frecuentes-sellado-de-techos-materiales.html`, `blog/embeds/en-en-preguntas-frecuentes-sellado-de-techos-precio.html`, `blog/embeds/en-en-preguntas-frecuentes-sellado-de-techos-proceso.html`, `blog/embeds/en-en-preguntas-frecuentes-sellado-de-techos-tipos-de-techo.html`, `blog/embeds/en-en-preguntas-frecuentes.html`, `blog/embeds/en-en-sellado-de-techos-con-ilatek-property-solution.html`, `blog/embeds/en-en.html`, `blog/embeds/home.html`, `blog/en/01-preguntas-frecuentes/index.html`, `blog/en/01-preguntas-frecuentes/preguntas-frecuentes-sellado-de-techos-clima-y-huracanes.html`, `blog/en/01-preguntas-frecuentes/preguntas-frecuentes-sellado-de-techos-garantia-y-leyes.html`, `blog/en/01-preguntas-frecuentes/preguntas-frecuentes-sellado-de-techos-materiales.html`, `blog/en/01-preguntas-frecuentes/preguntas-frecuentes-sellado-de-techos-precio.html`, `blog/en/01-preguntas-frecuentes/preguntas-frecuentes-sellado-de-techos-proceso.html`, `blog/en/01-preguntas-frecuentes/preguntas-frecuentes-sellado-de-techos-tipos-de-techo.html`, `blog/en/02-comparativas/index.html`, `blog/en/03-comunidades-servicios/comunidades-ilatekpr-como-funciona.html`, `blog/en/03-comunidades-servicios/guia-de-servicios-de-techos-de-ilatek.html`, `blog/en/03-comunidades-servicios/ilatek-y-el-recubrimiento-elastomerico.html`, `blog/en/03-comunidades-servicios/ilatek-y-el-sellado-acrilico.html`, `blog/en/03-comunidades-servicios/ilatek-y-el-sellado-de-poliuretano.html`, `blog/en/03-comunidades-servicios/ilatek-y-el-sellado-de-silicona.html`, `blog/en/03-comunidades-servicios/ilatek-y-la-membrana-asfaltica.html`, `blog/en/03-comunidades-servicios/index.html`, `blog/en/03-comunidades-servicios/sellado-de-techos-con-ilatek-property-solution.html`, `blog/en/index.html`, `blog/index.html`.

## 6. Estado del árbol

Medido con `git status --porcelain` y `git status --porcelain -uall` el **20/11/2026 a las 15:32**, más `git diff --stat` (**1 004 archivos, +87 980 / −117 727**), `git diff --cached --stat` (**vacío**) y `git log --oneline -3` (`c577d51`). Es el mismo estado que en la comprobación anterior: **no cambió nada**.

| Estado | Entradas | Desglose por directorio de primer nivel |
|---|---|---|
| `D` — borrados pendientes, sin commitear | **231** | `comunidades/` **204** (todas bajo `comunidades/landings/**`, estructura vieja) · `assets/` **26** (con **0 `M`** y **0 `A`**: solo borrados previos) · `tools/` **1** · `blog/` **0** |
| `M` — modificados | **819** | `documentacion/` 321 · `servicios/` 222 · `home-page/` 116 · `categorias/` 61 · `techos/` 19 · `comunidades/` 17 · **raíz** 14 (`.gitignore`, `AGENTS.md`, `README.md`, `llms.txt`, `llms-pueblo.txt`, `package.json`, `package-lock.json`, `robots.txt`, `sitemap.xml`, `ghl-custom-code.html`, `ghl-custom-code-embedded.html`, `ghl-custom-code-paste.html`, `ghl-footer-embed.html`, `ilatek-calendar-custom-code.html`) · `tools/` 10 · `componentes/` 9 · `resenas/` 8 · `home/` 7 · `src/` 4 · `archivo/` 3 · `garantia/` 2 · `politica-de-privacidad/` 2 · `terminos-y-condiciones/` 2 · `Comunidades/` 1 · `portal/` 1 |
| `A` — añadidos al índice | **0** | — |
| `R` — renombrados | **0** | — |
| `??` — sin seguimiento (archivo por archivo con `-uall`) | **11 947** | `assets/` 3 809 · `Comunidades/` 3 534 · `screenshots/` 1 141 · `comunidades imagenes/` 1 112 · `GHL-PUBLICAR/` 778 · `blog/` 588 · `servicios/` 377 · `documentacion/` 235 · `categorias/` 120 · `src/` 100 · `tools/` 61 · archivos sueltos de la raíz 43 (capturas `verif-*.png`, `blog-hero-*.png`, `longtail-*.png`, `.verif-imagenes.py`…) · `home/` 25 · `scripts/` 8 · `pdf/` 4 · `techos/` 4 · `social-reorg/` 2 · `admin/` 1 · `cotizacion-techos/` 1 · `garantia/` 1 · `politica-de-privacidad/` 1 · `resenas/` 1 · `terminos-y-condiciones/` 1 |
| **Total de entradas** | **12 997** | — |

Sin `-uall` (modo por defecto, que colapsa los directorios sin seguimiento) el mismo árbol da **2 156 entradas: 819 `M` + 231 `D` + 1 106 `??`**. Es decir: cuando una nota antigua hablaba de «X entradas sin seguimiento» no se refería a archivos distintos, sino al mismo árbol contado con directorios colapsados; el número de archivos reales es el de la tabla (11 947).

**Reconciliación 230 → 231 (misma población, ninguna baja nueva).** La cifra **230** viene del plan aprobado y de la auditoría anterior, que se hizo **a mano**: 204 `comunidades/landings/**` + **25** `assets/**` (citando solo `hero-poster-1280.webp`) + 1 `tools/**` = 230. El conjunto real de `assets/**` tiene **26** entradas: `assets/hero-poster.png`, `assets/hero-poster.webp`, `assets/optimized/hero-loop-720.mp4`, `assets/optimized/hero-poster-1280.webp` y 22 `assets/optimized/techos/*.webp`; el recuento manual agrupó `hero-poster.png` y `hero-poster.webp` en una sola. Por eso **230 y 231 describen el mismo conjunto de borrados previos**: 204 + 26 + 1 = 231. En esta pasada **no hay entradas `D` nuevas, ni restauradas, ni añadidas al índice**: los 26 archivos de `assets/` siguen ausentes en el disco y `git diff --cached --stat` está vacío.

**Distinción que hay que leer junta:** en `assets/` hay **26 borrados pendientes (`D`)** previos, **0 `M`**, **0 `A`** y **0 `D` nuevas**; en `blog/` hay **0 `D`**, **0 `M`** y **0 `A`** — está **entero sin seguimiento** (588 archivos `??`), con `blog/llms.txt` en sha256 `48cd16fda144`. Es decir: «0 modificados» y «26 borrados pendientes» hablan de cosas distintas y ambas son ciertas a la vez.

- **0** archivos `.mjs` u ocultos dentro de `GHL-PUBLICAR`.
- Los scripts y mediciones de esta auditoría vivieron en `Ilatek/.tmp-verify/` y **se borraron al terminar**. `.tmp*` está en el `.gitignore` (línea 17), así que ni los de esta sesión ni los antiguos aparecen en `git status`: por eso las cifras de arriba no los cuentan. En la raíz del repo quedan **122 elementos `.tmp-*` de sesiones anteriores** (ledgers de TikTok/YouTube, capturas de GHL, scripts sueltos): no son de este trabajo y no se han tocado, porque borrarlos sin revisarlos podría eliminar datos de otras tareas.
- **Fase 2 intacta**: no se tocaron el `<h3>` de FAQ en Comunidades, los títulos de acordeón legales ni `faq-core.mjs`.

## 7. Cómo pegar cada página
1. Websites → página existente (o **Clone** si la acción es `CREAR PÁGINA`) → ⋮ → **Edit**.
2. Nombre y slug según `1-PAGINA.txt`.
3. Elemento **Custom HTML/JavaScript** → *Custom Code* → *Open Code Editor* → seleccionar todo, borrar y pegar `2-CODIGO-CUSTOM-HTML.html` entero → **Save**.
4. **Publish** y abrir la URL del manifiesto: hero con su foto, precios, FAQ y el pie nuevo.

## 8. Ajuste del 20 de noviembre: `/garantia` sin hero ni widget de reseñas

Las dos páginas de garantía (`010-garantia` y `062-en-garantia`) se actualizaron a petición del propietario. Cambios, todos aditivos salvo lo que se pidió retirar:

| Cambio | Detalle |
|---|---|
| **Hero retirado** | Se eliminó el `<section class="ilh-hero">` completo (título grande, CTA «Solicita tu cotización», los tres datos 78/$50/Por escrito y la tarjeta con foto). La página abre directamente en el acordeón con la información legal. |
| **Título de página** | Para no quedarse sin `<h1>` (SEO y accesibilidad), el acordeón lleva un H1 compacto: «Garantía de Servicio» / «Service Warranty». |
| **Widget de reseñas retirado** | Se eliminaron los bloques `ILATEK:REVIEWS:TABS` y `ILATEK:REVIEWS:TABS:JS`: pestañas Google/Limpieza/Techos, los tres iframes de `reputationhub.site`, la hoja de estilos `.il-reviews*` y los dos scripts del widget (resize y tabs). 0 referencias a `reputationhub` en ambas páginas. |
| **Padding** | `#ilatek-garantia` pasa a `padding:clamp(28px,4vw,64px) clamp(16px,4vw,40px)`; el contenido deja de pegarse a los bordes. |
| **Espacios en blanco** | Reglas nuevas: `summary{white-space:normal;overflow-wrap:break-word;gap:12px}` y `white-space:normal;text-wrap:pretty` en intro, cuerpo, listas y tablas. |
| **Sin barra horizontal** | Al no haber hero, nada recortaba el bleed del pie; se añade `html:has(#ilatek-garantia){overflow-x:clip}`. |

**Intacto y verificado:** 22 acordeones y 22 `summary` por página, `FAQPage` (1), párrafo `dv-ghl-values` (45), tokens `{{custom_values.*}}` (120 ES / 128 EN; los 5 que faltan eran los del hero eliminado), FAQ, JSON-LD, menú y pie.

**Verificadores tras el cambio:** `sync-artifacts --check` 106/0 · `verify-page-shell` 0 · `verify-structure` 0 · `verify-nav` 0 · `verify-location` 0 · `verify-seo-integrity` 0 · `verify-faq-words` 0 · `verify-internal-links` 0.

**Nuevos shas:** `010-garantia` → `447ae4fec84d` (194 KB) · `062-en-garantia` → `a69f88c6514e` (196 KB), ya reflejados en la tabla de arriba.

## 9. Ajuste del 20 de noviembre: imágenes de la segunda sección («Qué incluye»)

La banda «Qué incluye» (`ilc2-incluye`, la que aparece en la captura de `/ventanas`) ya no tiene ninguna imagen que venga de fuera de las dos carpetas aprobadas.

**Medición (146 landings, 2.472 archivos HTML revisados, ES y EN):**

| Concepto | Antes | Ahora |
|---|---|---|
| Imágenes de la banda «incluye» en `assets/services-images/techos` | 65 | **94** |
| Imágenes de la banda «incluye» en `assets/services-images/limpieza` | 30 | **42** |
| **Residuos** (tarjetas `social/`, PNG de la Media Library, URLs de GHL) | **13** | **0** |

**Qué se cambió (solo atributos de imagen, nada de copy ni de estructura):**

- `servicios/inspeccion-de-techos`, `limpieza-de-techos-y-canaletas`, `mantenimiento-de-techos`, `sellado-de-poliuretano`, `sellado-de-techos-residencial`, `techos-de-madera`, `techos-de-teja`, `techos-de-zinc`, `techos-de-concreto`, `techos-planos` (ES y EN, variante `ghl-*` y la copia plana): la foto de la banda pasa a la foto de su propio servicio dentro de `assets/services-images/techos/`.
- `assets/services-images/social/*` (tarjetas 1200×630 con texto quemado) ya no se usa como foto de sección en ninguna página.
- `home` (ES y EN): el carrusel de techos tenía la misma foto repetida tras el barrido; ahora usa tres fotos distintas de `techos/`. Los retratos de los fundadores se restauraron a su URL original (no son fotos de servicio y no existen en las dos carpetas).
- `ASSETS.json` de los packs tocados (`home/es`, `inspeccion-de-techos/es`, `limpieza-de-techos-y-canaletas/es`, `mantenimiento-de-techos/es`, `sellado-de-poliuretano/es`, `sellado-de-techos-residencial/es`, `techos-de-madera/es`, `techos-de-teja/es`, `techos-de-zinc/es`, `techos-de-concreto/es`, `techos-planos/es`) quedó reconciliado: `verify-structure` exige que cada URL declarada tenga archivo local con los mismos bytes.

**Restos que se quedan a propósito** (no son fotos de tarjeta de servicio): 20 imágenes de GHL en el cuerpo de las páginas, que son los retratos de los fundadores (Luis A. Cardec, Aida Cintrón) y fotos de equipo de marca del home y de los hubs; y las 6 referencias `assets/optimized/` del home, que es el póster del hero y resuelve por el CDN del repositorio.

**Verificación de este ajuste:** `sync-artifacts --check` **106 / 0** · `verify-page-shell` **0** · `verify-structure` **0 fallos** · `verify-location` **0** · `verify-seo-integrity` **0** · `verify-nav` **0** · `verify-internal-links` **0** · `verify-faq-words` **0** · las 10 URLs nuevas de foto responden **200** sin sesión · la tabla de los 106 se recalculó desde los bytes de ahora (**0 filas con discrepancia**).

## 10. Verificación visual y global de la segunda sección (cierre)

**Auditoría global (este pase, sobre el árbol actual):** 3.584 archivos HTML revisados en `servicios/`, `categorias/`, `home/` y `Comunidades/`; **136 páginas** tienen banda «Qué incluye» con imagen y su foto está repartida así:

| Carpeta | Imágenes |
|---|---|
| `assets/services-images/techos` | **94** |
| `assets/services-images/limpieza` | **42** |
| Fuera de las dos carpetas | **0** |

Además, las 34 URLs únicas que usan esas bandas responden **200** sin sesión.

**Dos defectos que la auditoría de texto no veía y esta pasada sí (ya corregidos):**
1. **URL duplicada** en 5 packs (inspección de techos, limpieza de techos y canaletas, mantenimiento de techos, sellado de poliuretano, sellado residencial): la `src` quedó como `…/main/assets/https://raw.githubusercontent.com/…/main/assets/services-images/techos/…`, así que **la imagen no cargaba** aunque el texto decía «techos». 20 archivos corregidos (los 5 packs en `ASSETS.json` + `ghl-*` + copia plana, y sus 5 artefactos).
2. **Proxy de GHL envolviendo una URL del repo** en `techos-de-madera` ES y EN: la `src` era `https://images.leadconnectorhq.com/image/…/u_https://raw.githubusercontent.com/…`. 4 archivos corregidos (ES, EN, `ASSETS.json` y el artefacto `101-en-techos-de-madera`).

**Comprobación visual (capturas reales, no en blanco):**

| Página | Foto de la banda | naturalWidth | Puntos de la lista |
|---|---|---|---|
| `/ventanas` | `limpieza/Limpieza de Ventanas - Ilatek Property Solution - 1.jpg` | 1376 × 768 | 6 |
| `/limpieza-de-techos-y-canaletas` | `techos/Servicio de Limpieza de Techos y Canaletas - Ilatek Property Solution - 1.jpg` | 1376 × 768 | 6 |
| `/sellado-de-techos-residencial` | `techos/Servicio de Sellado Residencial - Ilatek Property Solution - 1.jpg` | 1376 × 768 | 6 |

Capturas guardadas en `Ilatek/verif-01b-ventanas.png`, `Ilatek/verif-02-limpieza-techos-canaletas.png` y `Ilatek/verif-03-sellado-residencial.png`. En las tres se ven la foto, su rótulo (por ejemplo «Técnica sin rayas · seguros para cristales tintados») y el CTA de la banda.

**Nota de entorno:** las capturas a 1.440 px de ancho salen en blanco en este equipo (el compositor del navegador no repinta tras redimensionar), así que las pruebas visuales se hicieron a 628–786 px de ancho, donde la banda apila el texto y la foto.

**Intacto:** las 20 fotos de marca que se dejaron a propósito (retratos de Luis A. Cardec y Aida Cintrón en `home` ES/EN, fotos de equipo del home y de los hubs) siguen en su URL original; los 231 borrados locales siguen sin tocar y no hay commit, push, PR ni merge.

**Verificadores de este cierre:** `sync-artifacts --check` **106 / 0** · `verify-page-shell` **0** · `verify-structure` **0** · `verify-seo-integrity` **0** · `verify-internal-links` **0** · `verify-location` **0** · `verify-nav` **0**.

## 11. La foto de «Qué incluye» ya no repite la del hero

**Medición previa:** 104 de las 138 landings con banda «Qué incluye» mostraban **la misma foto que el hero** (la `- 1.jpg` del servicio).

**Qué se hizo:**
- **105 páginas** (ES y EN, variantes `ghl-*` y copia plana) pasaron la foto de la banda a **otra toma del mismo servicio** en la misma carpeta aprobada (`… - 2.jpg`, o `- 3.jpg` cuando la 2 ya se usaba en otra sección de la página). Ninguna página cambió de carpeta ni de servicio.
- **31 páginas** tenían además `width`/`height` heredados del póster viejo (`1778x1000` y `1000x750`) con una foto de `1376x768`: se corrigieron a las medidas reales del archivo, así que tampoco hay deformación.
- **46 fotos** se declararon en los `ASSETS.json` de sus packs (verificador de estructura en verde).
- **Excepción documentada:** `limpieza-de-mudanza` solo tiene una toma en `limpieza/` (`- 1.jpg`), así que su banda usa una foto de espacio vacío de la misma carpeta (`Limpieza Post-Construccion - 2.jpg`). Conviene reemplazarla cuando exista una segunda toma propia de mudanza.

**Auditoría posterior (todo el sitio):** 136 páginas con banda e imagen · `techos` **94** · `limpieza` **42** · fuera de las dos carpetas **0** · fotos repetidas del hero **0** · medidas declaradas que no coinciden con el archivo **0**.

**Comprobación visual (navegador, DOM + captura):**

| Página | Hero | Banda «Qué incluye» | naturalWidth |
|---|---|---|---|
| `/ventanas` | `Limpieza de Ventanas … - 1.jpg` | `Limpieza de Ventanas … - 2.jpg` | 1376 × 768 |
| `/sellado-de-techos-residencial` | `Servicio de Sellado Residencial … - 1.jpg` | `Servicio de Sellado Residencial … - 2.jpg` | 1376 × 768 |
| `/limpieza-de-techos-y-canaletas` | `Servicio de Limpieza de Techos y Canaletas … - 1.jpg` | `Servicio de Limpieza de Techos y Canaletas … - 2.jpg` | 1376 × 768 |

Capturas: `Ilatek/verif-hero-01-ventanas-incluye.png`, `Ilatek/verif-hero-01c-ventanas-hero-foto.png` (hero, para comparar),
`Ilatek/verif-hero-02b-residencial.png` y `Ilatek/verif-hero-03-canaletas.png`.

**Intacto:** las 20 fotos de marca (retratos de los fundadores, equipo del home y hubs) no se tocaron; los 231 borrados locales siguen sin tocar; sin commit, push, PR ni merge.

**Verificadores tras el cambio:** `sync-artifacts --check` **106 / 0** · `verify-page-shell` 0 · `verify-structure` 0 · `verify-seo-integrity` 0 · `verify-internal-links` 0 · `verify-location` 0 · `verify-nav` 0.

## 12. Cierre de verificación del árbol actual (20 de noviembre de 2026)

**Comprobado:** 20 de noviembre de 2026 a las 15:32, en el árbol de trabajo tal como quedó después del cambio de fotos de la banda «Qué incluye». Sin commit, push, PR ni merge; los 231 borrados pendientes siguen pendientes y sin restaurar.

### 12.1 Los 26 verificadores, uno por uno (histórico: ejecución del 20/11 a las 15:32)

> La ejecución vigente, contra los bytes actuales, es la de la **sección 3** (21/11/2026). Esta tabla se conserva como histórico de la pasada anterior.

| # | Verificador | Exit | Lote | Archivos afectados / evidencia |
|---|---|---|---|---|
| 1 | `verify-structure` | **0** | — | `"failures": []` |
| 2 | `verify-structure --migration` | **1** | por diseño | Guard histórico: marca «HTML changed» en las páginas editadas a propósito, p. ej. `servicios/membrana-asfaltica/es/landing-pages/ghl-membrana-asfaltica-landing.html`, `servicios/techos-de-asfalto/es/landing-pages/ghl-techos-de-asfalto-landing.html` |
| 3 | `verify-techos` | **0** | — | — |
| 4 | `verify-internal-links` | **0** | — | — |
| 5 | `verify-page-shell` | **0** | — | «109 delivery files + 32 generated roof pages; no duplicate components» |
| 6 | `verify-location` | **0** | — | — |
| 7 | `verify-responsive` | **0** | — | — |
| 8 | `verify-seo-integrity` | **0** | — | — |
| 9 | `verify-schema-prices` | **0** | — | — |
| 10 | `verify-sitemap` | **0** | — | — |
| 11 | `verify-faq-words` | **0** | — | — |
| 12 | `verify-anchor-ratio` | **0** | — | — |
| 13 | `verify-social-cards` | **1** | fuera del lote | 185 páginas · 80 fallos · **0 no-blog** (todas `blog-*` / `blog-en-*`) |
| 14 | `verify-cannibalization` | **0** | — | — |
| 15 | `verify-cannibalization --strict` | **1** | fuera del lote | 1 hallazgo: «¿Cuánto dura el sellado de un techo?» (blog) vs «¿Cuánto dura el sellado de techo?» (garantía); sin exportes de GSC |
| 16 | `verify-nav` | **0** | — | fallos: 0 |
| 17 | `verify-nav-live` | **1** | fuera del lote | Mide por red el sitio **publicado** (98 rutas), p. ej. `/en/membrana-asfaltica`, `/membrana-asfaltica`: «estructura» |
| 18 | `verify-en` | **1** | fuera del lote | Paridad ES/EN de las fuentes: p. ej. `airbnb-turnover` con nombres de Custom Value distintos y tokens perdidos |
| 19 | `verify-samples` | **1** | fuera del lote | «landing poliuretano … sin-destino:2 comunidades techos» |
| 20 | `verify-ghl-publish` | **2** | fuera del lote | Exit 2 = uso: exige una URL publicada como argumento |
| 21 | `test-faq (faq-parity)` | **1** | fuera del lote (histórico del 20/11; los acordeones legales se cerraron el 21/11, ver 3.7) | RESUMEN: `paginas=4490; h3=20056; h3_sin_schema=220; schema_sin_h3=3301; respuestas_divergentes=0; items_sin_pregunta=2571`. Dentro del lote, los 132 desajustes eran los **acordeones legales** (010-garantia 20 vs 5, 027-politica 21 vs 5, 053-terminos 29 vs 5 y sus versiones EN): es el arreglo de la Fase 2, no una regresión de imágenes. Las 101 páginas de servicio del lote están 8 vs 8 |
| 22 | `test-responsive (browser)` | **1** | fuera del lote | No ejecutable: `Cannot find module 'playwright'` |
| 23 | `verify-longtail` | **0** | — | — |
| 24 | `verify-blog` | **0** | — | — |
| 25 | `verify-blog-en` | **1** | fuera del lote | 256 fallos, todos pares `/blog…` («el ES no anuncia su par EN») |
| 26 | `verify-embeds` | **0** | — | 266 embeds · 0 fallos |

**Ninguna regresión del cambio de imágenes:** los verificadores que cubren el lote (structure, page-shell, internal-links, location, seo, sitemap, faq-words, anchor-ratio, nav, schema-prices, techos, blog, longtail, embeds) están en **verde**; los 10 rojos son los mismos de siempre y ninguno mide las fotos.

### 12.2 El lote, contra los bytes de hoy

| Comprobación | Resultado |
|---|---|
| Artefactos en `por-pagina/` | **106** |
| `1-PAGINA.txt` (sha256 de 12 caracteres + KB) vs bytes reales | **106/106** |
| `sync-artifacts --check` | **106 artefactos / 0 problemas** |
| Pie nuevo («Explora» + `/servicios` + `/techos` + `data-ilatek-path`) | **106/106** |
| `FAQPage` en JSON-LD | **106/106** |
| `{{custom_values.*}}` | **106/106** |
| `dv-ghl-values` | **106/106** |
| Copy retirado (`ilcl-form`, «Recibe tu precio», «inspección gratis», `ilf-brand`, «Oportunidades», `pie²`) | **0** |
| Tabla de este informe vs bytes reales | **0 filas con discrepancia** |

**Qué se pega en cada página:** un solo archivo, `2-CODIGO-CUSTOM-HTML.html`, completo, en el elemento *Custom HTML/JavaScript* (Custom Code → Open Code Editor, borrar lo anterior, pegar, Save). `1-PAGINA.txt` es la guía de nombre, slug, URL y acción: no se pega. No hay que añadir header ni footer global: ya vienen dentro del archivo.

### 12.3 Banda «Qué incluye»

| Comprobación | Resultado |
|---|---|
| Páginas con banda e imagen (ES/EN, `ghl-*` y copia plana) | **136** |
| Fotos en `assets/services-images/techos` | **94** |
| Fotos en `assets/services-images/limpieza` | **42** |
| Fotos fuera de las dos carpetas | **0** |
| Páginas que repiten la foto del hero | **0** |
| Medidas declaradas que no coinciden con el archivo | **0** |

### 12.4 Árbol y blog (medido el 20/11/2026 15:32)

| Comprobación | Resultado |
|---|---|
| `git status --porcelain -uall` · total de entradas | **12 997** |
| `D` — borrados pendientes | **231** = `comunidades/` **204** + `assets/` **26** + `tools/` **1** |
| `M` — modificados | **819** (**0** en `blog/` y **0** en `assets/`) |
| `A` / `R` | **0** / **0** |
| `??` — sin seguimiento | **11 947** archivo por archivo · **1 106** colapsado · `blog/` 588 `??` · `assets/` 3 809 `??` |
| `assets/` | **26 `D` · 0 `M` · 0 `A`** · 3 809 `??` — solo borrados previos, ninguno nuevo |
| `blog/` | **0 `D` · 0 `M` · 0 `A`** · 588 `??` · `llms.txt` = `48cd16fda144` |
| Reconciliación 230 → 231 | **misma población**: 230 era el recuento manual del plan (25 `assets/**`) y 231 es el medido (26: `hero-poster.png` + `hero-poster.webp` contados por separado) |
| Borrados pendientes de `assets/` | **26**, siguen pendientes y ninguno restaurado: `hero-poster.png`, `hero-poster.webp`, `hero-loop-720.mp4`, `hero-poster-1280.webp` y 22 `techos/*.webp` siguen sin existir en el disco |
| Entradas `D`, `M` o `A` **nuevas** en `assets/` o `blog/` durante este trabajo | **0** (las 26 `D` de `assets/` son previas; en `blog/` no hay ninguna `D` ni `M`) |
| `blog/llms.txt` sha256 | `48cd16fda144` (sin cambios) |
| Último commit | `c577d51 comunidades: funnel de Isla Verde publicado y guía del lote` — sin commits nuevos |
| ¿Cambió el estado del árbol desde la comprobación anterior? | **No**: mismos 231 `D`, mismos 819 `M`, mismo conjunto de `??` |

## 13. Prueba fresca de publicación (21 de noviembre de 2026, bytes finales)

Pasada obligatoria de la Fase 1 del plan, ejecutada **después** de la Fase 2 punto 5 y contra los
bytes que hoy hay en disco. Cada verificador corrió en su propio proceso (`node <script>`), sin
encadenar con `&&`, con el exit capturado por separado. Los 28 logs están en
`Ilatek/.tmp-verify/2026-11-21-final/` (`exits.txt` + un `.log` por fila).

### 13.1 Los 28 verificadores, uno por uno

| # | Verificador | Exit | ¿Toca el lote? | Evidencia de esta pasada |
|---|---|---|---|---|
| 1 | `verify-structure` | **0** | no | `failures: []` · 995 copias de medios · 608 bloques de script · 17 fuentes FAQ |
| 2 | `verify-structure --migration` | **1** | fuera del lote | 47/47 `HTML changed` (guard histórico por diseño) |
| 3 | `verify-techos` | **0** | no | 32/32 schema, precio, FAQ, alt, Open Graph, canonical/sitemap/llms |
| 4 | `verify-internal-links` | **0** | no | 279 archivos · `urlNormalization: passed` · `idempotence: passed` |
| 5 | `verify-page-shell` | **0** | no | 109 delivery files + 32 páginas de techos · idempotente |
| 6 | `verify-location` | **0** | no | 47 documentos SEO · 2 141 imágenes · 97 decorativas |
| 7 | `verify-responsive` | **0** | no | 94 heroes · 296 controles de flecha · 174 capas de tipo fluido · idempotente |
| 8 | `verify-seo-integrity` | **0** | no | canónicas self · 59 anchors al money en 9 variantes |
| 9 | `verify-schema-prices` | **0** | no | money sin precio verificado · silicona con $250 verificado |
| 10 | `verify-sitemap` | **0** | no | 98 URLs únicas, sin sufijos heredados |
| 11 | `verify-faq-words` | **0** | no | 23 preguntas, todas de 40–60 palabras |
| 12 | `verify-anchor-ratio` | **0** | no | 2/46 409 (0,00 %) en 779 páginas |
| 13 | `verify-social-cards` | **1** | fuera del lote | 185 páginas · **80 fallos en 20 páginas `blog-*`/`blog-en-*`** · WebP 185/185 |
| 14 | `verify-cannibalization` | **0** | no | 194 preguntas · 1 hallazgo · avisa, no falla |
| 15 | `verify-cannibalization --strict` | **1** | fuera del lote | 1 hallazgo blog ↔ garantía · sin exportes de GSC |
| 16 | `verify-nav` | **0** | no | 109 páginas · menú `8a92d7a3` · pie `52a91468` · 1 variante de cada · 0 fallos |
| 17 | `verify-nav-live` | **1** | fuera del lote | 98 rutas del sitemap · 98 con HTTP 200 · 0 no publicadas · 0 desactualizadas (mide producción) |
| 18 | `verify-en` | **1** | fuera del lote | 48 copias EN fuente · **104 fallos**, los mismos de siempre (comentario HTML, `/comunidades`, `/en/resenas`, hreflang, mapeo de `servicios`) |
| 19 | `verify-samples` | **1** | fuera del lote | 6 problemas: `en/home`, `comunidades` y `techos` fuera del índice del sitemap |
| 20 | `verify-ghl-publish` | **2** | fuera del lote | Exit 2 = uso: exige `<url>` y `--expect=home\|legal\|landing` |
| 21 | `test-faq (faq-parity)` | **1** | **no: el lote está a 0** | 4 490 páginas · `h3` 20 068 · `h3_sin_schema` **0** · `schema_sin_h3` 3 301 (todo fuera del lote) · `respuestas_divergentes` **0** · `items_sin_pregunta` 2 571. **106 filas del lote, 0 con hallazgo, 1 011 H3 = 1 011 schema** |
| 22 | `test-responsive (browser)` | **1** | fuera del lote | No ejecutable: `Cannot find module 'playwright'` |
| 23 | `verify-longtail` | **0** | no | 100 posts · 194 preguntas únicas · 565 imágenes con alt |
| 24 | `verify-blog` | **0** | no | 138 páginas · 740 anclas verificadas |
| 25 | `verify-blog-en` | **1** | fuera del lote | 138 copias · 256 fallos, todos pares `/blog…` |
| 26 | `verify-embeds` | **0** | no | 266 embeds · `data-ilatek-path` 266/266 · canonical 266/266 |
| 27 | `verify-en-parity` | **0** | **sí (lote)** | 51 pares · **51 en paridad · 0 infracciones** |
| 28 | `sync-artifacts --check` | **0** | **sí (lote)** | **106 artefactos · 0 problemas · 248 KB de media** |

**Resultado:** 16/26 scripts en verde (los mismos 10 rojos de la sección 3, sin cambios de cifras) y
las dos comprobaciones del lote (filas 27 y 28) en verde. **Ningún rojo menciona los 106:**
`grep GHL-PUBLICAR` = 0 en `migration`, `social-cards`, `cannibalization --strict`, `nav-live`,
`en`, `samples`, `ghl-publish`, `responsive-browser` y `blog-en`. En `faq-parity` las 232 filas
`GHL-PUBLICAR` son las 106 del lote (**todas a 0**) y 126 copias `GHL-PUBLICAR/por-pagina` del blog,
fuera del lote.

### 13.2 Re-auditoría de los 106 (manifiesto y bytes)

| Comprobación | Resultado |
|---|---|
| `1-PAGINA.txt` (sha256 12) vs sha256 real del archivo a pegar | **106/106** coinciden, 0 desajustes |
| KB del manifiesto vs tamaño real | **106/106** |
| Campos del manifiesto (`Nombre en GHL`, `Slug`, `URL`, `Acción`, `Estado hoy`, `Archivo a pegar`, `Origen en el repo`, `Sección de clima`) | **106/106** completos |
| Acciones declaradas | **49 `REPUBLICAR` + 57 `CREAR PÁGINA` = 106** |
| Copy retirado (`ilcl-form`, «Recibe tu precio», «inspección gratis», `pie²`, `ilf-brand`, «Oportunidades») | **0 ocurrencias en los 106** |
| Pie nuevo («Explora» + `data-ilatek-path`, rejilla 2 col.) | **106/106** |
| `FAQPage` en JSON-LD | **106/106** |
| `{{custom_values.*}}` / `dv-ghl-values` | **106/106 · 106/106** |
| Referencias a imágenes del CDN dentro de los 106 | **390 referencias · 28 URLs únicas · 28/28 existen en `HEAD`** (incluida `assets/optimized/hero-poster-1280.webp`) |
| `sync-artifacts --check` | **106 / 0 problemas** |
| `verify-en-parity` | **51/51 en paridad · 0 infracciones** |
| `faq-parity`: filas del lote con hallazgo | **0 de 106** |
| `blog/llms.txt` | sha256 `48cd16fda144` (sin cambios) |
| `blog/` modificado o borrado | **0 `M` · 0 `D`** (sus 692 rutas `??` son copias EN sin seguimiento, ajenas al lote) |
| Estado del árbol | `D` **231** · `M` **819** · `??` **11 957** · staged **0** |
| Diff acumulado | 1 004 archivos, +88 400 / −117 707 |
| `HEAD` | `c577d51` — sin commit, push, PR ni merge |

### 13.3 Qué se pega en cada página

Un solo archivo por página: `GHL-PUBLICAR/lote-sitio/por-pagina/<carpeta>/2-CODIGO-CUSTOM-HTML.html`
completo, en el elemento *Custom HTML/JavaScript* → *Custom Code* → *Open Code Editor* (borrar lo
anterior, pegar, **Save** → **Publish**). `1-PAGINA.txt` no se pega: es la guía de nombre, slug, URL,
acción y estado. La lista de los 106 con su URL, acción, sha y tamaño es la tabla de la sección 2, y
sus shas coinciden con los bytes de hoy (13.2). Los pasos manuales, en la sección 7.

### 13.4 Cierre (Fase 3 del plan)

- `sync-artifacts --check`: **106 / 0**; manifiesto ↔ bytes **106/106**; media 248 KB.
- `verify-page-shell`: **0** (109 + 32, idempotente).
- Conteos del plan a cero: copy retirado **0**, tokens pegados **0**, filas del lote con hallazgo **0**.
- `verify-en-parity` **51/51**; `test-faq` con `h3_sin_schema` **0** y `respuestas_divergentes` **0**.
- `blog/llms.txt` = `48cd16fda144`; **0 archivos modificados o borrados en `blog/`**.
- Árbol sin cambios respecto de la medición anterior: **231 `D`, 819 `M`, 0 staged**, `HEAD` `c577d51`.
- Sin scripts ni arneses nuevos en el árbol: los logs y el `exits.txt` viven en `.tmp-verify/` (fuera de git).

**Fase 2 pendiente por decisión, no por olvido:** el punto 4 (FAQ de `Comunidades/`) y el punto 6
(`faq-core.mjs`, falsos positivos del home) siguen sin ejecutar porque el plan los condiciona a una
aprobación explícita que no se ha dado; el punto 5 (acordeones legales) está cerrado en la sección 3.7.

## 14. «Puerto Rico» literal en los FAQ → Custom Value del condado (21/11/2026)

Petición del propietario: en los ítems de FAQ que escriben «Puerto Rico» a mano, sustituir ese
literal por `{{custom_values.county_name_and_state}}` en las fuentes ES y EN, regenerar con
`build-en` + `sync-artifacts` y reportar qué artefactos cambian de sha sin tocar el resto del copy.

**Criterio aplicado (y por qué no son los 58 ítems enteros).** Se sustituye cuando el literal designa
el mercado local: preguntas «¿… en Puerto Rico?», «En Puerto Rico recomendamos…», «materiales
comunes en Puerto Rico», «empresa local de Puerto Rico». **No** se sustituye la cobertura insular
(«los 78 municipios de Puerto Rico», «78 municipalities of Puerto Rico», «Puerto Rico’s 78
municipalities»): el Custom Value es un municipio con estado —`documentacion/LOCALIZACION-SEO.md`
indica configurarlo como `Bayamón, Puerto Rico`— y «los 78 municipios de Bayamón, Puerto Rico» sería
una afirmación falsa. Quedan **27 menciones de ese tipo en 22 artefactos**, todas de cobertura
insular. Por eso tampoco se tocaron las páginas de limpieza con «78 municipios» ni `044-servicios-techos`.

| Paso | Resultado |
|---|---|
| Menciones en los FAQ | **62** repartidas en 58 ítems: **35 sustituidas**, **27 conservadas** (cobertura insular) en 22 páginas |
| Fuentes ES modificadas | **15** (home + 14 landings); en cada una, la línea del acordeón y la del `FAQPage` |
| Mapas `src/en/*.json` | **14**, una clave renombrada por nodo de texto (clave ES y valor EN con el token) |
| Copias EN regeneradas | **14**, únicas que cambian tras `build-en --all` + `apply-page-shell` |
| Artefactos con sha nuevo | **29** (15 ES + 14 EN); los otros **77 quedan byte a byte idénticos** |
| `sync-artifacts --check` | **106 / 0 problemas** |
| `verify-en-parity` | **51/51 · 0 infracciones** |
| `verify-page-shell` | **0** (109 + 32, idempotente) |
| `faq-parity` | 4 490 páginas · **106 filas del lote con 0 hallazgos** · `h3_sin_schema` **0** · `respuestas_divergentes` **0** |
| `verify-en` | **103** (era 104: el token nuevo elimina el aviso «nombres de Custom Value distintos» de `servicios`; el «token `county_name_and_state` se perdió: 2 vs 73» es el desajuste preexistente de esa página) |
| Tokens pegados a palabra | **0** (los `}}i` que detecta un grep ingenuo son JavaScript minificado previo) |

**Los 29 shas nuevos** (la tabla de la sección 2 ya está actualizada con estos bytes):

| Artefacto | sha256 | Tamaño |
|---|---|---|
| 001-inicio | `7680a1e8a8fa` | 446 KB |
| 004-canaletas-y-bajantes | `3beff5794c95` | 235 KB |
| 011-impermeabilizacion-de-techos | `33ff9394905a` | 238 KB |
| 030-reparacion-de-filtraciones | `5959ab345275` | 237 KB |
| 031-reparacion-de-goteras | `fef3adad1da0` | 237 KB |
| 032-reparacion-de-grietas-techos | `cf627208f700` | 239 KB |
| 033-reparacion-de-techos | `0daef8387ae9` | 238 KB |
| 035-resenas | `f48061d3d6bc` | 216 KB |
| 036-sellado-acrilico | `99dd64e2e695` | 235 KB |
| 039-sellado-de-techos | `19f54418b063` | 275 KB |
| 042-sellado-de-techos-residencial | `3a93a0cb27f2` | 237 KB |
| 043-servicios | `2a4cfd9c94ca` | 285 KB |
| 045-techos | `e3056c9182d1` | 289 KB |
| 046-techos-de-asfalto | `01a858af618a` | 234 KB |
| 050-techos-de-zinc | `0cfb6fa81172` | 234 KB |
| 058-en-canaletas-y-bajantes | `adf24c1597da` | 233 KB |
| 064-en-impermeabilizacion-de-techos | `f3961dcd2ded` | 237 KB |
| 083-en-reparacion-de-filtraciones | `33160baf5155` | 235 KB |
| 084-en-reparacion-de-goteras | `0667801f7489` | 235 KB |
| 085-en-reparacion-de-grietas-techos | `d0fd345d4ec7` | 237 KB |
| 086-en-reparacion-de-techos | `669ce35ba126` | 236 KB |
| 088-en-resenas | `645a9c23d4cf` | 216 KB |
| 089-en-sellado-acrilico | `4375b4f7a067` | 233 KB |
| 092-en-sellado-de-techos | `694daf2807d6` | 272 KB |
| 095-en-sellado-de-techos-residencial | `587b8fdde03a` | 235 KB |
| 096-en-servicios | `6703a083b159` | 284 KB |
| 098-en-techos | `3c3d52f7f011` | 286 KB |
| 099-en-techos-de-asfalto | `bc7a8da99810` | 232 KB |
| 103-en-techos-de-zinc | `ef640d8458a3` | 232 KB |

**Ejemplos (ES visible y schema, EN visible):**

- «¿Cuánto cuesta sellar un techo en **Puerto Rico**?» → «¿Cuánto cuesta sellar un techo en **{{custom_values.county_name_and_state}}**?» (`001-inicio`; el `data-en` del conmutador y el `name` del `FAQPage` llevan el mismo token).
- «En **Puerto Rico** recomendamos revisar el techo una vez al año…» → «En **{{custom_values.county_name_and_state}}** recomendamos…» (`042`), y su EN «In **{{custom_values.county_name_and_state}}** we recommend checking the roof…» (`095`).
- «¿Ilatek es una empresa local de **Puerto Rico**?» → «¿Ilatek es una empresa local de **{{custom_values.county_name_and_state}}**?» (`035` / `088`).
- Se conserva: «… los **78 municipios de Puerto Rico**» (`017`, `018`, `020`, `021`, `022`, `023`, `031`, `043`, `044`, `045` y sus EN).

> La columna «Ahora» de la tabla 2.1 (sección 2.1) es el estado del 21/11 **antes** de este cambio;
> para las 14 copias EN afectadas, el sha vigente es el de esta sección y el de la tabla 2.
