# Informe de publicación — lote GHL Ilatek (106 artefactos)

**Fecha de ejecución:** 2026-11-21 (America/Puerto_Rico) · **HEAD:** `c577d51` · **Árbol:** 822 archivos modificados (M), 231 eliminados (D), 1.108 sin seguimiento (??), 0 en stage. **No se hizo commit, push, PR ni merge.**

**Alcance:** los 106 artefactos de `GHL-PUBLICAR/lote-sitio/por-pagina/`. La Fase 2 del plan (FAQ de Comunidades, acordeones legales, detector del home) **no se ejecutó**.

**Veredicto del lote: PASS.** 106/106 sha256 reales coinciden con su manifiesto; 0 problemas de sincronización; 0 copy retirado; footer nuevo, `FAQPage`, `{{custom_values.*}}` y `dv-ghl-values` presentes en los 106; 0 referencias CDN ausentes en `HEAD`; paridad FAQ/JSON-LD del lote en 0. Los verificadores en rojo son de otras familias de páginas o de entorno y quedan identificados abajo con su cifra real. Queda una regresión site-wide declarada: `verify-en` 103→105 (+2) por la regla de conteo de tokens EN≥ES; se detalla en §5 y §7.

## 1. Método y evidencia

Todo lo que sigue se calculó sobre el árbol actual y los logs de la sesión; no se copió de informes anteriores:

- **Auditoría de los 106:** lectura de cada `1-PAGINA.txt` y `2-CODIGO-CUSTOM-HTML.html`; sha256 y bytes reales; URL, acción y sha del manifiesto; conteos de copy retirado; `FAQPage`; tokens `{{custom_values.*}}`; `dv-ghl-values`; nav/pie; secciones/scripts; footer «Explora»; y extracción de cada referencia `cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/…` y `raw.githubusercontent.com/aocpdev/Ilatek/main/…` comprobada con `git cat-file -e HEAD:<ruta>`.
- **Verificadores:** 31 ejecuciones independientes, cada una con su salida completa y su exit code en un log propio. La tabla de exit codes está en `.tmp-verify/2026-11-21-cierre/exits.tsv`.
- **Reparación de alineación (estado observado):** **16 artefactos** tienen mtime de regeneración `2026-11-21T15:50:36–37` y sus 16 fuentes `15:50:34–35`; hoy esos 16 suman **36** nombres `FAQPage` con `business__county_name` alineados con su `<h3>` (recuento propio) y `fix-jsonld-parity.mjs` no encuentra ningún `"name"` con el token viejo pendiente (`files: 0, tokens: 0`). El script declara **34** reemplazos como objetivo, pero esa ejecución no dejó un log con el conteo: **34 no se usa aquí como cifra medida**. La paridad del lote sí está verificada en `21-faq-parity-lote.log`: `106 páginas · 1.011 preguntas · 0 h3_sin_schema · 0 schema_sin_h3 · 0 divergentes`. Los shas actuales de `001-inicio` y `063-en-home` son `8228387eeddc` y `d1d5e72aba8f` (§3 y `audit-106.json`).

**Evidencia en crudo:** `.tmp-verify/2026-11-21-cierre/` (31 logs finales + `exits.tsv` + `audit-106.json` + `audit-106.tsv`; baseline de `HEAD` en `baseline-head/`, con sus 31 logs y `exits.tsv`).

**Recálculo de cierre (este turno):** sha256 de los 106 → **106/106**; `{{custom_values.*}}` → **18.557**; `FAQPage` exactamente 1 en cada uno de los 106; `dv-ghl-values` → **106/106** y footer con «Explora» + `/servicios` + `/techos` **dentro del `<footer>`** → **106/106**; copy retirado → **0**; CDN → **390 jsDelivr + 672 raw = 1.062**, **95 rutas únicas**, **0 ausentes en `HEAD`**.

## 2. Resumen de los 106

| Comprobación | Resultado |
|---|---|
| Artefactos con URL y acción | **106/106** |
| Acciones | **49 REPUBLICAR + 57 CREAR PÁGINA** (`REPUBLICAR` / `CREAR` en el manifiesto) |
| sha256 real = sha256 del manifiesto | **106/106** |
| KB real = KB del manifiesto | **106/106** |
| Copy retirado (`ilcl-form`, «Recibe tu precio», «inspección gratis», `pie²`, `ilf-brand`, «Oportunidades», tarjetas `services-images/social/`) | **0** en los 106 |
| Footer nuevo («Explora» + `/servicios` + `/techos` con `data-ilatek-path`) | **106/106** (comprobado dentro del `<footer>`) |
| `FAQPage` | **106/106** (1 por página) |
| `dv-ghl-values` | **106/106** |
| Tokens `{{custom_values.*}}` | **18.557** |
| Referencias a imágenes/sitio por CDN | **1.062** (390 jsDelivr + 672 raw) · **95 rutas únicas** · **0 ausentes en `HEAD`** |
| `faq-parity` del lote | **106 páginas · 1.011 preguntas · 0/0/0/0** |
| `sync-artifacts --check` | **106 artefactos · 0 problemas** |
| `verify-page-shell` (2 pasadas) | **verde** · 109 delivery + 32 roof · 2.ª pasada sin cambios |
| `blog/llms.txt` | `48cd16fd…` sin cambios en este turno; `blog/` está sin seguimiento en este snapshot (no hay baseline en `HEAD`) |

## 3. Tabla verificable (una fila por artefacto)

| # | Artefacto (`por-pagina/`) | URL pública | Acción | sha256 real del archivo | sha256 del manifiesto | ¿Coincide? |
|---|---|---|---|---|---|---|
| 001 | 001-inicio | https://ilatekpr.com/ | REPUBLICAR | `8228387eeddccc94410a3dfcc2679b7c3e92a775d93e9057a9f3d5455f41f383` | `8228387eeddc` | sí |
| 002 | 002-airbnb-turnover | https://ilatekpr.com/airbnb-turnover | REPUBLICAR | `e3435ead2f90d9137a853f9c4636a12988d5d307d689edc557ae97af385cfc4c` | `e3435ead2f90` | sí |
| 003 | 003-alfombras | https://ilatekpr.com/alfombras | REPUBLICAR | `c1a561d8ba98be7bed51e2640234395e2c7346c042372cbc534f7255bb5aeb9c` | `c1a561d8ba98` | sí |
| 004 | 004-canaletas-y-bajantes | https://ilatekpr.com/canaletas-y-bajantes | REPUBLICAR | `61e2ca39ecf265a46eac73eebaa82f6cf003c5b712eff0eb034607576d752e51` | `61e2ca39ecf2` | sí |
| 005 | 005-comunidades | https://ilatekpr.com/comunidades | CREAR | `ac11c234e461515b10943b2a46d9fa3fdba622c93099b4049968bb286d71ee25` | `ac11c234e461` | sí |
| 008 | 008-electrodomesticos | https://ilatekpr.com/electrodomesticos | REPUBLICAR | `2dd332821eab3d973ed874682775e9ef5a8c3f1441d6a1012af26c0cba598680` | `2dd332821eab` | sí |
| 009 | 009-empozamiento-de-techos | https://ilatekpr.com/empozamiento-de-techos | REPUBLICAR | `b7a60de45f85e5f933a7f7079e6f9b9b8e4c0ccf98ca42d09de2552908db3760` | `b7a60de45f85` | sí |
| 010 | 010-garantia | https://ilatekpr.com/garantia | REPUBLICAR | `7d7c83313d0e91cd3470b172ecb12f6024089f970d6255f3cd64c43ff5952c1c` | `7d7c83313d0e` | sí |
| 011 | 011-impermeabilizacion-de-techos | https://ilatekpr.com/impermeabilizacion-de-techos | REPUBLICAR | `16c66b6edbb8b7824a9a329a4b79fa4a31faab11e79bf424da845dda3e415cad` | `16c66b6edbb8` | sí |
| 012 | 012-inspeccion-de-techos | https://ilatekpr.com/inspeccion-de-techos | REPUBLICAR | `15f89d46236e33ac7d0fcaaf1ce1e535610ae5606267a22f5ddf851f6413889a` | `15f89d46236e` | sí |
| 013 | 013-inspeccion-y-mantenimiento-de-techos | https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos | REPUBLICAR | `5dd4fbdddccc5cddf2e6fbb2b4d2cd3965a8572a4f1922dace05baaea3c29c9e` | `5dd4fbdddccc` | sí |
| 014 | 014-instalacion-y-reemplazo-de-techos | https://ilatekpr.com/instalacion-y-reemplazo-de-techos | REPUBLICAR | `22a3188a3c139e1b8b0d91be8ca9d6258b56d3b3ee40ad610c3ff76632f4553d` | `22a3188a3c13` | sí |
| 015 | 015-lavado-a-presion | https://ilatekpr.com/lavado-a-presion | REPUBLICAR | `5e6460bc30d7b7aa523871c93d19742d9524ee984f6ef35e9db25af6d5ee0437` | `5e6460bc30d7` | sí |
| 016 | 016-lavado-a-presion-techos | https://ilatekpr.com/lavado-a-presion-techos | REPUBLICAR | `4e6671fe536b4f968c8695275b034c155307d9011bc1883e591577a7710affb6` | `4e6671fe536b` | sí |
| 017 | 017-limpieza-comercial | https://ilatekpr.com/limpieza-comercial | REPUBLICAR | `8e0db9906cea42e8a95271c86011e9d0fc91cc609cd1f16814bceb91ff0a8f37` | `8e0db9906cea` | sí |
| 018 | 018-limpieza-de-mudanza | https://ilatekpr.com/limpieza-de-mudanza | REPUBLICAR | `9968128e3037e301799eef825e81f902e8991c2a2a1558d2efb1546917fb6af8` | `9968128e3037` | sí |
| 019 | 019-limpieza-de-techos-y-canaletas | https://ilatekpr.com/limpieza-de-techos-y-canaletas | REPUBLICAR | `fe9cbbb6ba4e381cce988cae6e2ec8f89203c4cf9b8383d6717e2c3c9873ccdd` | `fe9cbbb6ba4e` | sí |
| 020 | 020-limpieza-estandar | https://ilatekpr.com/limpieza-estandar | REPUBLICAR | `8f7a411d16fe8b70b755fd716c6bd09c167bd6a7ff948d59195cc08ff257d85a` | `8f7a411d16fe` | sí |
| 021 | 021-limpieza-industrial | https://ilatekpr.com/limpieza-industrial | REPUBLICAR | `ba4a9973ff26a16f6e2c0f14a8b0c4734c5e34e0982f46fbb38ed483c92560a8` | `ba4a9973ff26` | sí |
| 022 | 022-limpieza-profunda | https://ilatekpr.com/limpieza-profunda | REPUBLICAR | `14debd49745a2f66662d06ef8de0c2553ced2a911c22a727ed0030381b48354c` | `14debd49745a` | sí |
| 023 | 023-limpieza-residencial | https://ilatekpr.com/limpieza-residencial | REPUBLICAR | `a77fa2d41cbf24002ded143751257987eb9cfa3f3b464398135b7020674c4642` | `a77fa2d41cbf` | sí |
| 024 | 024-mantenimiento-de-techos | https://ilatekpr.com/mantenimiento-de-techos | REPUBLICAR | `a6925ea94d5c45bc3fa7d9d518d0cbc9238af7c2e93554c1cd208b494d10e780` | `a6925ea94d5c` | sí |
| 025 | 025-membrana-asfaltica | https://ilatekpr.com/membrana-asfaltica | REPUBLICAR | `b2187df441713dd4aba5087bd3300feaf3bd48e65e4c2134af9ea53d0f8d2ffa` | `b2187df44171` | sí |
| 026 | 026-organizacion | https://ilatekpr.com/organizacion | REPUBLICAR | `6728c43ad5ccd6ea55f75df7bcc3d5203f8cfe0e5369b5315d6b615fc64f8fc0` | `6728c43ad5cc` | sí |
| 027 | 027-politica | https://ilatekpr.com/politica | CREAR | `5d65d595e3af6ddc3d6959bf784b40499d5326415b0bff5a6268926a691d6dff` | `5d65d595e3af` | sí |
| 028 | 028-post-construccion | https://ilatekpr.com/post-construccion | REPUBLICAR | `2c5880b9943d27666cf334ad136e6517ac1c546fbdad405adbf6f70ae2cd9fbe` | `2c5880b9943d` | sí |
| 029 | 029-recubrimiento-elastomerico | https://ilatekpr.com/recubrimiento-elastomerico | REPUBLICAR | `0e3629b653d3e0b09114a53e4bde7c831361c4bef5f852ecab6333402e5c54a5` | `0e3629b653d3` | sí |
| 030 | 030-reparacion-de-filtraciones | https://ilatekpr.com/reparacion-de-filtraciones | REPUBLICAR | `fc54f80be6792431994dee63c9ccdc49502fe08fedeeaddcf45164f33131dee1` | `fc54f80be679` | sí |
| 031 | 031-reparacion-de-goteras | https://ilatekpr.com/reparacion-de-goteras | REPUBLICAR | `5cdcf4459fbb67c62d48436395263509e534620319423590525848f3979dbe06` | `5cdcf4459fbb` | sí |
| 032 | 032-reparacion-de-grietas-techos | https://ilatekpr.com/reparacion-de-grietas-techos | REPUBLICAR | `b069dccd378d3db19d8fe69f890cbe45c6f9717d3d4644f1341004ec0a146a0e` | `b069dccd378d` | sí |
| 033 | 033-reparacion-de-techos | https://ilatekpr.com/reparacion-de-techos | REPUBLICAR | `d3796b0a9ec9cff0870e08a9f9ed3f1b406ed10e2ede0705f4ab7a5fa03155fe` | `d3796b0a9ec9` | sí |
| 034 | 034-reparacion-post-huracan | https://ilatekpr.com/reparacion-post-huracan | REPUBLICAR | `deb06f706fffd6587079ef827da3631ef060ba5241549843086308a8e161f48c` | `deb06f706fff` | sí |
| 035 | 035-resenas | https://ilatekpr.com/resenas | REPUBLICAR | `ae9d21283fca5ea76c7e9e347fc8f10bf5b2fb56d82f1c8a23a525a61c72c469` | `ae9d21283fca` | sí |
| 036 | 036-sellado-acrilico | https://ilatekpr.com/sellado-acrilico | REPUBLICAR | `8656d421f1aed5aba37c4959b5b53d43f29620b5584933ab7bfa9bf95b54e6b1` | `8656d421f1ae` | sí |
| 037 | 037-sellado-de-poliuretano | https://ilatekpr.com/sellado-de-poliuretano | REPUBLICAR | `7fd6049606ee5e621470088c46216f06aa924ad749e43e0096bd4f9459d9d3a5` | `7fd6049606ee` | sí |
| 038 | 038-sellado-de-silicona | https://ilatekpr.com/sellado-de-silicona | REPUBLICAR | `f49ebe1ccf08d6978f987db2f9dc5400de824c9bef53e86578fa8bc0d0b21763` | `f49ebe1ccf08` | sí |
| 039 | 039-sellado-de-techos | https://ilatekpr.com/sellado-de-techos | REPUBLICAR | `ce895a193393e08576a860a12b8aefd051f1a2a319a55574ede138c439534911` | `ce895a193393` | sí |
| 040 | 040-sellado-de-techos-comercial | https://ilatekpr.com/sellado-de-techos-comercial | REPUBLICAR | `6b737bdc41a269d5ab4e391e2229bbef9073b5417c0ea1984464cb8f608911c8` | `6b737bdc41a2` | sí |
| 041 | 041-sellado-de-techos-industrial | https://ilatekpr.com/sellado-de-techos-industrial | REPUBLICAR | `c558062a5177b543dd5f1a1715373290a2edd41afaaace6aed30e31afedb6e71` | `c558062a5177` | sí |
| 042 | 042-sellado-de-techos-residencial | https://ilatekpr.com/sellado-de-techos-residencial | REPUBLICAR | `ffe83eb7a34a7f3820d451f94dd8f066d22feb62fe1d9ed67d4e848428f99308` | `ffe83eb7a34a` | sí |
| 043 | 043-servicios | https://ilatekpr.com/servicios | REPUBLICAR | `f5e5c0a247aa4d7c938fc8c3bd4c15e7ac7bc19c991b628ec22321cd4fe2a6ac` | `f5e5c0a247aa` | sí |
| 044 | 044-servicios-techos | https://ilatekpr.com/servicios-techos | REPUBLICAR | `db6a61ad0a1feb3ff6741c1ebd1a4f6d93d020db817d232023e574dcdefaa67a` | `db6a61ad0a1f` | sí |
| 045 | 045-techos | https://ilatekpr.com/techos | CREAR | `520687330c75d9cf8f295ccbd10856724b7c1b59abfdbc705cdbb2332506e4bd` | `520687330c75` | sí |
| 046 | 046-techos-de-asfalto | https://ilatekpr.com/techos-de-asfalto | REPUBLICAR | `ccff245be0d61bdecebfdccdfdd0d30e1068de5150e8597b25980ca43632e7b3` | `ccff245be0d6` | sí |
| 047 | 047-techos-de-concreto | https://ilatekpr.com/techos-de-concreto | REPUBLICAR | `12c3c030df1d38e4d5d2e61bee94570ee7f961b1ae4c151d669c1be312017361` | `12c3c030df1d` | sí |
| 048 | 048-techos-de-madera | https://ilatekpr.com/techos-de-madera | REPUBLICAR | `612b9a69faf3d9d6f725b174ca2258b67f26dd51959af48096b8a21f99c69b7b` | `612b9a69faf3` | sí |
| 049 | 049-techos-de-teja | https://ilatekpr.com/techos-de-teja | REPUBLICAR | `bcd0a62094feba32d106b8cf3b3a5d0ce280e9657effce9cf07d17c67634b0ac` | `bcd0a62094fe` | sí |
| 050 | 050-techos-de-zinc | https://ilatekpr.com/techos-de-zinc | REPUBLICAR | `ca5fa85f3d264221f03e4b2b48e2f33afa2ae953c68f296188d8e048af8e421d` | `ca5fa85f3d26` | sí |
| 051 | 051-techos-planos | https://ilatekpr.com/techos-planos | REPUBLICAR | `0f5055097fe2f2b8434c029b5a92e8dcb788fc97d802c5cb87d03393d019107f` | `0f5055097fe2` | sí |
| 052 | 052-techos-por-segmento | https://ilatekpr.com/techos-por-segmento | REPUBLICAR | `a18fb74ddc40ac5e2c65db3a298f6acbc4b1be2739b83516a49a3887cbf0ac52` | `a18fb74ddc40` | sí |
| 053 | 053-terminos | https://ilatekpr.com/terminos | CREAR | `3d567039fac826b8db7886e88cee85c02e648241c9e033ed4b0f4b4d4d9b5548` | `3d567039fac8` | sí |
| 054 | 054-tragaluces | https://ilatekpr.com/tragaluces | REPUBLICAR | `40a48b640e7453cd7bb29281e1708c2ad9abef84d892193eafbcfb83f8be8f2b` | `40a48b640e74` | sí |
| 055 | 055-ventanas | https://ilatekpr.com/ventanas | REPUBLICAR | `5834f57814902742a890e5551e24365bd56fbe0d12357d473eaa5d75a94fbd9b` | `5834f5781490` | sí |
| 056 | 056-en-airbnb-turnover | https://ilatekpr.com/en/airbnb-turnover | CREAR | `d30acffd12bd2d27cfc94a63a53e93e7d3ff595dd56340b4845f4cff131ec0c6` | `d30acffd12bd` | sí |
| 057 | 057-en-alfombras | https://ilatekpr.com/en/alfombras | CREAR | `f8c97e4b9ca636f7aedbd1c925b05297eda3b3a1f39e4b8ba236ae6aa8e46e97` | `f8c97e4b9ca6` | sí |
| 058 | 058-en-canaletas-y-bajantes | https://ilatekpr.com/en/canaletas-y-bajantes | CREAR | `1408bb4fd306956e2a10d133da363d7da280f536f4964d1384b2a5b8b71d2982` | `1408bb4fd306` | sí |
| 059 | 059-en-communities | https://ilatekpr.com/en/communities | CREAR | `d12c8c9cdaed239ef8a274f9ac63d45290b301274a6000155eb58021dce08f3a` | `d12c8c9cdaed` | sí |
| 060 | 060-en-electrodomesticos | https://ilatekpr.com/en/electrodomesticos | CREAR | `b7c62dfa61bd5b68dde4b3f6faedece512923592721287090e4149e02f06aab2` | `b7c62dfa61bd` | sí |
| 061 | 061-en-empozamiento-de-techos | https://ilatekpr.com/en/empozamiento-de-techos | CREAR | `3c03f598335d953e4cd967dead1cfdaf9e26e81ac02e7942e9762b1501e19f12` | `3c03f598335d` | sí |
| 062 | 062-en-garantia | https://ilatekpr.com/en/garantia | CREAR | `a9ce1e744579b524faeb03ae785e975d291c2b334b372e800a69d9adcc2e6af9` | `a9ce1e744579` | sí |
| 063 | 063-en-home | https://ilatekpr.com/en/home | CREAR | `d1d5e72aba8f60d9b7f6aa682b1e641f215f44463b6498ae86d39d3147a4c222` | `d1d5e72aba8f` | sí |
| 064 | 064-en-impermeabilizacion-de-techos | https://ilatekpr.com/en/impermeabilizacion-de-techos | CREAR | `c0f52f2eaa16302b62a867f220da5b2d5ca096d4a29f61a104faa372ef5b578e` | `c0f52f2eaa16` | sí |
| 065 | 065-en-inspeccion-de-techos | https://ilatekpr.com/en/inspeccion-de-techos | CREAR | `bac566f7e07de45313cc9b7f725d088885bb5e345b31e62778a0431147007a5e` | `bac566f7e07d` | sí |
| 066 | 066-en-inspeccion-y-mantenimiento-de-techos | https://ilatekpr.com/en/inspeccion-y-mantenimiento-de-techos | CREAR | `47e64c3958d1d92c18b9e9661882a90b6333871782dca620ac054129019808ab` | `47e64c3958d1` | sí |
| 067 | 067-en-instalacion-y-reemplazo-de-techos | https://ilatekpr.com/en/instalacion-y-reemplazo-de-techos | CREAR | `08c62107e9848cf75796841208e105a264b18dc13b1cf907035773ef8720fa31` | `08c62107e984` | sí |
| 068 | 068-en-lavado-a-presion | https://ilatekpr.com/en/lavado-a-presion | CREAR | `77fccb0074ef15cc2e7a0dbd2a33537c886ef86cb4984dda0ab62214318c181e` | `77fccb0074ef` | sí |
| 069 | 069-en-lavado-a-presion-techos | https://ilatekpr.com/en/lavado-a-presion-techos | CREAR | `570df0416506baba555eb85991233d070d7eff955bbc1a00982c15a80ecb1df8` | `570df0416506` | sí |
| 070 | 070-en-limpieza-comercial | https://ilatekpr.com/en/limpieza-comercial | CREAR | `08e63e4c8970115fa5af216ff035152127f29a6c640a5058cab3f0e88607dd08` | `08e63e4c8970` | sí |
| 071 | 071-en-limpieza-de-mudanza | https://ilatekpr.com/en/limpieza-de-mudanza | CREAR | `d6f4daadb041078fe18729994fee933d643c19e47e702980403c33a6511a91f2` | `d6f4daadb041` | sí |
| 072 | 072-en-limpieza-de-techos-y-canaletas | https://ilatekpr.com/en/limpieza-de-techos-y-canaletas | CREAR | `ec5f8c17847c0c669240fadceb62ab66793767c783808c2210fe48d0369875f0` | `ec5f8c17847c` | sí |
| 073 | 073-en-limpieza-estandar | https://ilatekpr.com/en/limpieza-estandar | CREAR | `1423d0610ad4b6632cbdd2764b744aefab00b9164203a959e4c2a19fed93bb66` | `1423d0610ad4` | sí |
| 074 | 074-en-limpieza-industrial | https://ilatekpr.com/en/limpieza-industrial | CREAR | `e7ab22f96803be52f5ce4638be92e3edab70b3301e1439d485e13887c79bfb50` | `e7ab22f96803` | sí |
| 075 | 075-en-limpieza-profunda | https://ilatekpr.com/en/limpieza-profunda | CREAR | `03434e4e168e3d775098fb1856b84ddef7de41fddff859598de7f64b48b8b9c7` | `03434e4e168e` | sí |
| 076 | 076-en-limpieza-residencial | https://ilatekpr.com/en/limpieza-residencial | CREAR | `2c7c04a6b78088913afe86d55e7281f29267a04f5f0f07a9d765fee8c83fd355` | `2c7c04a6b780` | sí |
| 077 | 077-en-mantenimiento-de-techos | https://ilatekpr.com/en/mantenimiento-de-techos | CREAR | `a93d85272c13e411f7e5912962056bc0059ef69d0d4b698f5ad04e496f940d98` | `a93d85272c13` | sí |
| 078 | 078-en-membrana-asfaltica | https://ilatekpr.com/en/membrana-asfaltica | CREAR | `d8d7c9af62f2a174c0de99fd869602abf99c4fe8f0df71604cc22efd93e639a9` | `d8d7c9af62f2` | sí |
| 079 | 079-en-organizacion | https://ilatekpr.com/en/organizacion | CREAR | `94e21f0e1639a3f92e02e5cc95b48da8182813164d2a42cea24c7f4c39d303ab` | `94e21f0e1639` | sí |
| 080 | 080-en-politica | https://ilatekpr.com/en/politica | CREAR | `57aa421cb91c622a678cdde5259e9eb318f46616d8b27af7fc0da9fef54ba33e` | `57aa421cb91c` | sí |
| 081 | 081-en-post-construccion | https://ilatekpr.com/en/post-construccion | CREAR | `bb84bc1af86757f297748adbdbb26edebd6b4e2f1fba72c5aa29426742097bbf` | `bb84bc1af867` | sí |
| 082 | 082-en-recubrimiento-elastomerico | https://ilatekpr.com/en/recubrimiento-elastomerico | CREAR | `1c69d350e726c0dc1ef160432a2299385502988d56403a83ff8493a6f89d13bd` | `1c69d350e726` | sí |
| 083 | 083-en-reparacion-de-filtraciones | https://ilatekpr.com/en/reparacion-de-filtraciones | CREAR | `f538e773aef9c411c6454327d7343d6d5781a9b4d2a30525ba9ace40a4c7ec0b` | `f538e773aef9` | sí |
| 084 | 084-en-reparacion-de-goteras | https://ilatekpr.com/en/reparacion-de-goteras | CREAR | `9335422f6d212dd7f352aacf1b087beccdd1a6c8829efd385f170606d1426d0b` | `9335422f6d21` | sí |
| 085 | 085-en-reparacion-de-grietas-techos | https://ilatekpr.com/en/reparacion-de-grietas-techos | CREAR | `1b105e05d7dd8d88a6188d6f7bf187d851fa170c0b4886c6b3ae4d79766cb928` | `1b105e05d7dd` | sí |
| 086 | 086-en-reparacion-de-techos | https://ilatekpr.com/en/reparacion-de-techos | CREAR | `180d7a5cbe61f7b07789280d1ee75fbf270441ca4e416d990ede22d7ebd43a27` | `180d7a5cbe61` | sí |
| 087 | 087-en-reparacion-post-huracan | https://ilatekpr.com/en/reparacion-post-huracan | CREAR | `ed83253ab329feba155a9c3a3755461b95879eeda095eaee0619217b6ab77201` | `ed83253ab329` | sí |
| 088 | 088-en-resenas | https://ilatekpr.com/en/resenas | CREAR | `825ccd3d1473f14763201c4f2c7b80315f2e16548d7158a8d41eadade64682c5` | `825ccd3d1473` | sí |
| 089 | 089-en-sellado-acrilico | https://ilatekpr.com/en/sellado-acrilico | CREAR | `78a157cb6c771496755a388238de2e30e50036bfca24962219c78ce62940cb7b` | `78a157cb6c77` | sí |
| 090 | 090-en-sellado-de-poliuretano | https://ilatekpr.com/en/sellado-de-poliuretano | CREAR | `264ea99dd969f3d7205feec32c36fdb219ae88cfade728d894152f49d8de0b03` | `264ea99dd969` | sí |
| 091 | 091-en-sellado-de-silicona | https://ilatekpr.com/en/sellado-de-silicona | CREAR | `588da4390e41960ecf153d469c27faa951d9d819d09ffedaaebdf6a00902d1c1` | `588da4390e41` | sí |
| 092 | 092-en-sellado-de-techos | https://ilatekpr.com/en/sellado-de-techos | CREAR | `b166540f380e1ef7e9a9d45c9c280f103f234157e55be36e77581f8b38b02c2d` | `b166540f380e` | sí |
| 093 | 093-en-sellado-de-techos-comercial | https://ilatekpr.com/en/sellado-de-techos-comercial | CREAR | `48d42a7e07920296b6ad19b4532cbec20312ba033af21317253686fcfe726ce7` | `48d42a7e0792` | sí |
| 094 | 094-en-sellado-de-techos-industrial | https://ilatekpr.com/en/sellado-de-techos-industrial | CREAR | `b6d4548326d67eafab7c76bafa13b49535d64ca43804b07f7284458ed4eecf6b` | `b6d4548326d6` | sí |
| 095 | 095-en-sellado-de-techos-residencial | https://ilatekpr.com/en/sellado-de-techos-residencial | CREAR | `aefaa64ba26c759703e2e4aacd4c03e6ee0f648685eb0a60d31348881696d1c5` | `aefaa64ba26c` | sí |
| 096 | 096-en-servicios | https://ilatekpr.com/en/servicios | CREAR | `1f2f90adb263456259a6cf58629494662b628cb384d1d5d8d8bcb54f991bfe2b` | `1f2f90adb263` | sí |
| 097 | 097-en-servicios-techos | https://ilatekpr.com/en/servicios-techos | CREAR | `a8161ab9d3de9d29780b5c1d0fe8170a2b4f27847f61dc864b75392cdb994a4b` | `a8161ab9d3de` | sí |
| 098 | 098-en-techos | https://ilatekpr.com/en/techos | CREAR | `cd3ac288c39c45bc46229d7c8b7b883938d4fa97f5306980a8654836aca1b458` | `cd3ac288c39c` | sí |
| 099 | 099-en-techos-de-asfalto | https://ilatekpr.com/en/techos-de-asfalto | CREAR | `8f92ccd9e28b339e46787aa437cbc6d14a9e0743ec4d135d6eacd4c4e476049d` | `8f92ccd9e28b` | sí |
| 100 | 100-en-techos-de-concreto | https://ilatekpr.com/en/techos-de-concreto | CREAR | `5eaadddd75a9957142eefcdb43e52dd27719837083f80c7e7633ade43b9fbc24` | `5eaadddd75a9` | sí |
| 101 | 101-en-techos-de-madera | https://ilatekpr.com/en/techos-de-madera | CREAR | `0995984711197f3328abe94e9c6839a74e4e703feeaf19adb1f831e367194f9b` | `099598471119` | sí |
| 102 | 102-en-techos-de-teja | https://ilatekpr.com/en/techos-de-teja | CREAR | `6d91f90ecbd0d729763b669e13637f6e29ebcc82d76816ac189cf76e78845b52` | `6d91f90ecbd0` | sí |
| 103 | 103-en-techos-de-zinc | https://ilatekpr.com/en/techos-de-zinc | CREAR | `41e6e8267ffa5127c1be16606b14c50040cc8493ded5f452a94fce3427bad288` | `41e6e8267ffa` | sí |
| 104 | 104-en-techos-planos | https://ilatekpr.com/en/techos-planos | CREAR | `7442579a7fd7cba8ae867909944972538a0ccc226b79238339c983e1f5b526cc` | `7442579a7fd7` | sí |
| 105 | 105-en-techos-por-segmento | https://ilatekpr.com/en/techos-por-segmento | CREAR | `d854cdeca04660283682e9a28281f71c91f86b025fa1637d614fd0222614afb1` | `d854cdeca046` | sí |
| 106 | 106-en-terminos | https://ilatekpr.com/en/terminos | CREAR | `b138734c6965d325da8a8ea84e12e75c65dc623adca0640a0944eeaec2f9f0e3` | `b138734c6965` | sí |
| 107 | 107-en-tragaluces | https://ilatekpr.com/en/tragaluces | CREAR | `0d6284cb0caf0ae3b0c3994e89bc1e1d6a472507d3f85bf9ac200217a85e2b79` | `0d6284cb0caf` | sí |
| 108 | 108-en-ventanas | https://ilatekpr.com/en/ventanas | CREAR | `d29c34818a28e251ff94124d5dc01462174b7317c12ecaed1674ae4262c389d9` | `d29c34818a28` | sí |

Filas: 106 · sha coincidente: 106/106 · KB coincidente: 106/106 · acciones: {"REPUBLICAR":49,"CREAR":57}.
## 4. Verificadores re-ejecutados hoy (31 ejecuciones)

Cada fila tiene su log en `.tmp-verify/2026-11-21-cierre/<n>-<nombre>.log`, con el comando, la salida completa y `EXIT: <código>` al final. «Alcance» es lo que el verificador recorre o la cifra que reporta; en los rojos, la lista de archivos afectados está en el log y se resume en §5.

| # | Verificador | Exit | Alcance / cifra real | Clasificación |
|---|---|---|---|---|
| 01 | `verify-structure` | 0 | 47 páginas · 995 copias de media · 608 bloques de script · `failures: []` | verde |
| 02 | `verify-structure --migration` | **1** | 47 HTML «changed» frente al baseline histórico | rojo por diseño (guard histórico) |
| 03 | `techos/verify-techos` | 0 | 32/32 páginas: alt, Open Graph, canonical, sitemap, llms | verde |
| 04 | `verify-internal-links` | 0 | 156 `aboutMenuPages` · normalización e idempotencia `passed` | verde |
| 05 | `verify-page-shell` (1.ª) | 0 | 109 delivery + 32 roof · sin componentes duplicados | verde |
| 05b | `verify-page-shell` (2.ª) | 0 | idéntico a la 1.ª · 0 cambios | verde / idempotente |
| 06 | `verify-location` | 0 | 97 decorativas · alt/title locales y HEAD/Markdown `passed` | verde |
| 07 | `verify-responsive` | 0 | 97 páginas con hero · 296 controles · 174 capas de tipografía | verde |
| 08 | `verify-seo-integrity` | 0 | canónicas self · silicona 20–25 · 59 anclas al money en 9 variantes (0 exactas) | verde |
| 09 | `verify-schema-prices` | 0 | money sin precio/rating · silicona con $250 verificado | verde |
| 10 | `verify-sitemap` | 0 | 98 URLs únicas · money/garantía/reseñas presentes | verde |
| 11 | `verify-faq-words` | 0 | 23 preguntas money · 40–60 palabras · enlace contextual | verde |
| 12 | `verify-anchor-ratio` | 0 | 780 páginas del cluster · 2/46.409 exactas (0,00 %) | verde |
| 13 | `verify-social-cards` | **1** | 20 páginas `blog-*` · 80 hallazgos (og:image/twitter:image/width/height) | rojo fuera del lote (blog) |
| 14 | `verify-cannibalization` | 0 | 1 hallazgo NO bloqueante («¿Cuánto dura el sellado…?» vs «…de techo?») | verde (modo normal) |
| 15 | `verify-cannibalization --strict` | **1** | 1 hallazgo, en blog/garantía | rojo fuera del lote (blog) |
| 16 | `verify-nav` | 0 | 109 páginas publicadas · 1 variante de menú y 1 de pie · 0 fallos | verde |
| 17 | `verify-nav-live` | **1** | 98 rutas del sitemap medidas en vivo · 98 con fallo de estructura · 0 no publicadas · 0 desactualizadas | rojo fuera del lote (sitio en vivo) |
| 18 | `verify-en` | **1** | 48 copias EN · **105 fallos = 103 preexistentes + 2 introducidos por este trabajo** (`home` 75 vs 87; `servicios` 0 vs 73) | rojo site-wide; regresión declarada en §5 |
| 19 | `verify-samples` | **1** | 6 problemas: destinos `en/home`, `comunidades`, `techos` | rojo fuera del lote (muestras) |
| 20 | `verify-ghl-publish` | **2** | uso: requiere `<url>` publicada | no ejecutable sin URL |
| 21 | `faq-parity GHL-PUBLICAR/lote-sitio/por-pagina` | 0 | 106 páginas · 1.011 H3 · 0 `h3_sin_schema` · 0 `schema_sin_h3` · 0 divergentes | verde (lote) |
| 21b | `faq-parity` (sitio completo) | **1** | 4.490 páginas · 3.301 `schema_sin_h3` · 2.571 `items_sin_pregunta` | rojo fuera del lote (§5) |
| 22 | `test-responsive-browser` | **1** | no arranca: `Cannot find module 'playwright'` | rojo de entorno |
| 23 | `blog/build/verify-longtail` | 0 | 194 preguntas únicas · 100/100 posts · 565 imágenes con alt | verde (blog) |
| 24 | `blog/build/verify-blog` | 0 | 138 páginas · 138 enlaces internos · 740 anclas | verde (blog) |
| 25 | `blog/build/verify-blog-en` | **1** | 138 copias EN · 256 fallos de pares ES/EN | rojo fuera del lote (blog) |
| 26 | `blog/build/verify-embeds` | 0 | 266/266 enlaces, canonical y HEAD únicos | verde (blog) |
| 27 | `verify-en-parity` | 0 | 51 pares · 51 en paridad · 0 infracciones | verde |
| 28 | `sync-artifacts --check` | 0 | 106 artefactos · 0 problemas | verde (lote) |
| 29 | `apply-page-shell` (2.ª pasada) | 0 | 0 actualizados · 109 delivery | verde / idempotente |

**Balance:** 21 ejecuciones verdes, 10 rojas. **Ninguna roja mide los 106 artefactos**, pero `verify-en` es la excepción site-wide: empeoró de 103 a 105 (+2) por esta labor (§5). `faq-parity` del lote y `sync-artifacts --check` son las dos comprobaciones que cubren los 106 y ambas están en 0.

### 4.1 Atribución frente al baseline prístino (`HEAD` c577d51)

**Método.** `git worktree add --detach /tmp/ilatek-head-c577d51 c577d51`; allí se ejecutaron los mismos 31 comandos con el mismo runner. Los 31 logs y el `exits.tsv` del baseline quedaron en `.tmp-verify/2026-11-21-cierre/baseline-head/`. El worktree se retiró después y **no se copió ni restauró nada** al árbol de trabajo: siguen **231 D**, 822 M y 1.108 ??.

**Qué contiene HEAD.** 47 páginas de estructura, **0 artefactos** en `GHL-PUBLICAR/`, **0 HTML** en `blog/`, **206 HTML** en `Comunidades/` (frente a 3.342) y **33 scripts `.mjs` bajo `tools/`** (frente a 121 en el árbol actual, incluidos los no rastreados). Por eso **18 de los 27 scripts distintos de estos 31 comandos no existen en HEAD** y **19 de las 31 ejecuciones** quedan sin alcance (08–20 y 23–28); `faq-parity` (21/21b) sí existe pero en HEAD corría sobre **0 páginas del lote**. Esas 19 ejecuciones salieron con exit 1 (`MODULE_NOT_FOUND`); 21, que sí existe, salió 0 sobre 0 páginas. Ninguno de esos códigos es un fallo de contenido. En la columna HEAD figuran como `N/A`; `N/A` **no es PASS**. Para esos casos se usa como baseline operativo el log del turno anterior (`†`), que sí contiene el mismo árbol de trabajo; no se inventa un verde. En particular, **`verify-en` no existe en HEAD**: su baseline operativo es **103** y su final **105**, con delta **+2**.

| # | Verificador | HEAD c577d51 (exit / fallos) | Final (exit / fallos) | Δ | Categoría |
|---|---|---|---|---|---|
| 01 | `verify-structure` | 0 / 0 | 0 / 0 | 0 | preexistente (verde) |
| 02 | `verify-structure --migration` | **1 / 47** | **1 / 47** | 0 | falla por diseño (guard histórico; ya rojo en HEAD) |
| 03 | `techos/verify-techos` | 0 / 0 | 0 / 0 | 0 | preexistente (verde) |
| 04 | `verify-internal-links` | **1 / 1 aserción** (idempotencia `ghl-home-multiservicios`) | 0 / 0 | −1 | preexistente corregido (mejora) |
| 05 | `verify-page-shell` (1.ª) | **1 / 1 aserción** (`ghl-home-multiservicios` desincronizado) | 0 / 0 | −1 | preexistente corregido (mejora) |
| 05b | `verify-page-shell` (2.ª) | **1 / 1 aserción** | 0 / 0 | −1 | preexistente corregido (idempotente) |
| 06 | `verify-location` | **1 / 1 aserción** (alt local en `archivo/home-limpieza`) | 0 / 0 | −1 | preexistente corregido (mejora) |
| 07 | `verify-responsive` | 0 / 0 | 0 / 0 | 0 | preexistente (verde) |
| 08 | `verify-seo-integrity` | N/A (módulo no resuelto en HEAD) | 0 / 0 | N/A | verde (herramienta ausente en HEAD) |
| 09 | `verify-schema-prices` | N/A (herramienta nueva) | 0 / 0 | N/A | verde |
| 10 | `verify-sitemap` | N/A (herramienta nueva) | 0 / 0 | N/A | verde |
| 11 | `verify-faq-words` | N/A (herramienta nueva) | 0 / 0 | N/A | verde |
| 12 | `verify-anchor-ratio` | N/A (herramienta nueva) | 0 / 0 | N/A | verde |
| 13 | `verify-social-cards` | N/A (herramienta y blog ausentes) | **1 / 80** | † 80 → 80 = 0 | preexistente† (blog ya rojo en el turno anterior) |
| 14 | `verify-cannibalization` | N/A (herramienta nueva) | 0 / 1 hallazgo no bloqueante | 0 | verde (modo normal) |
| 15 | `verify-cannibalization --strict` | N/A (herramienta nueva) | **1 / 1** | † 1 → 1 = 0 | preexistente† (blog; mismo hallazgo) |
| 16 | `verify-nav` | N/A (herramienta nueva) | 0 / 0 | 0 | verde |
| 17 | `verify-nav-live` | N/A (herramienta nueva) | **1 / 98** | † 98 → 98 = 0 | preexistente† (sitio en vivo; mismo conteo) |
| 18 | `verify-en` | N/A (herramienta nueva; †103) | **1 / 105** | **† 103 → 105 = +2** | **introducido por este trabajo** (declarado; `tools/verify-en.mjs:73/77`) |
| 19 | `verify-samples` | N/A (herramienta nueva) | **1 / 6** | † 6 → 6 = 0 | preexistente† (muestras; mismo conteo) |
| 20 | `verify-ghl-publish` | N/A (herramienta nueva) | **2 / N/A (uso)** | † uso → uso (sin cambio de estado) | falla por diseño (requiere URL publicada) |
| 21 | `faq-parity` del lote | 0 / 0 páginas (exit 0 sin alcance) | 0 / 106 páginas · 0 hallazgos | N/A | N/A en HEAD (0 páginas); verde en el final |
| 21b | `faq-parity` del sitio | **1 / 773 `schema_sin_h3` + 748 `items_sin_pregunta` + 25 `h3_sin_schema` + 105 divergentes en 519 págs** | **1 / 3.301 + 2.571 en 4.490 págs** (0 `h3_sin_schema`, 0 divergentes) | +2.528 / +1.823 absolutos; **tasa −50,6 % / −60,3 %** | preexistente (ya rojo en HEAD; el alcance creció 8,6×) |
| 22 | `test-responsive-browser` | **1 / N/A** (`playwright` no instalado) | **1 / N/A** | 0 | falla por diseño (entorno) |
| 23 | `blog/build/verify-longtail` | N/A (sin `blog/`) | 0 / 0 | N/A | verde |
| 24 | `blog/build/verify-blog` | N/A (sin `blog/`) | 0 / 0 | N/A | verde |
| 25 | `blog/build/verify-blog-en` | N/A (sin `blog/`) | **1 / 256** | † 256 → 256 = 0 | preexistente† (blog; mismo conteo) |
| 26 | `blog/build/verify-embeds` | N/A (sin `blog/`) | 0 / 0 | N/A | verde |
| 27 | `verify-en-parity` | N/A (herramienta nueva) | 0 / 0 | 0 | verde |
| 28 | `sync-artifacts --check` | N/A (herramienta y lote ausentes) | 0 / 106 artefactos · 0 problemas | † 0 problemas → 0 | verde |
| 29 | `apply-page-shell` (2.ª) | 0 / 0 fallos · **52 archivos actualizados** | 0 / 0 fallos · 0 actualizados | **−52 actualizados** | preexistente corregido (idempotencia; en HEAD reescribía 52) |

**Lectura de la tabla.**

- **Ningún verificador verde en HEAD está rojo en el final.** Los verdes de HEAD (01, 03, 07) siguen verdes; 29 también sale 0, pero en HEAD actualizaba 52 archivos y ahora 0; 21 pasa de 0 páginas a 106/0.
- **Cuatro rojos de HEAD se corrigieron** (04, 05, 05b, 06) y 08, que en HEAD no era ejecutable (herramienta ausente), pasa a verde. Son mejoras, no regresiones.
- **Tres rojos de HEAD siguen en rojo**: 02 (guard histórico, 47 páginas), 21b (misma condición; la tasa baja al crecer el alcance) y 22 (falta `playwright`). Los tres son preexistentes o de diseño.
- **Los rojos de familias nuevas ya estaban en el turno anterior con el mismo conteo**: 13 (80), 15 (1), 17 (98), 19 (6), 25 (256); 20 es uso (exit 2) y 21b ya era rojo en HEAD.
- **21b no empeora en las rutas comunes**: **315 de las 519** filas de HEAD siguen en el final y en ellas **`h3_sin_schema` baja 25 → 0 y `schema_sin_h3` baja 25 → 0**; las **204** restantes son las filas `Comunidades/…` de HEAD, sustituidas por la estructura nueva (`…/<com>/limpieza/`, `…/<com>/sellado-de-techo/`). El absoluto global sube porque el alcance pasa de 519 a 4.490 páginas, pero la tasa baja y `respuestas_divergentes` pasa de 105 a 0.
- **Único empeoramiento atribuible a este trabajo: `verify-en`, 103 → 105 (+2)**, con la regla y los dos casos de §5. No hay ningún otro delta positivo.


## 5. Bloques abiertos por diseño (con cifra real, fuera del lote)

1. **`verify-social-cards` — 20 páginas, 80 hallazgos.** Las 20 son `blog-*` de limpieza (ES/EN): `blog-en-cleaning-faq-puerto-rico`, `blog-en-commercial-office-cleaning`, `blog-en-deep-cleaning-for-homes`, `blog-en-house-cleaning-in-puerto-rico`, `blog-en-industrial-cleaning-warehouses`, `blog-en-move-in-move-out-cleaning`, `blog-en-pressure-washing-exteriors`, `blog-en-roof-and-gutter-cleaning`, `blog-en-roof-pressure-washing-before-sealing`, `blog-en-standard-house-cleaning`, `blog-lavado-a-presion-de-casas-en-puerto-rico`, `blog-lavado-a-presion-de-techos-antes-de-sellar`, `blog-limpieza-comercial-de-oficinas-en-puerto-rico`, `blog-limpieza-de-casas-en-puerto-rico`, `blog-limpieza-de-mudanza-en-puerto-rico`, `blog-limpieza-de-techos-y-canaletas`, `blog-limpieza-estandar-de-casas`, `blog-limpieza-industrial-de-almacenes-y-plantas`, `blog-limpieza-profunda-de-casas`, `blog-preguntas-frecuentes-de-limpieza-en-puerto-rico`. Ninguna es artefacto del lote.
2. **`test:cannibalization --strict` — 1 hallazgo.** «¿Cuánto dura el sellado de un techo?» (`cuanto-dura-el-sellado-de-un-techo`) vs «¿Cuánto dura el sellado de techo?» (`garantia-de-sellado-de-techo`). Es contenido de blog/garantía, no de los 106.
3. **`blog/build/verify-blog-en` — 138 copias EN, 256 fallos.** Pares ES/EN del blog (`/blog…`), no del lote. Lista completa por archivo en el log `25-blog-en.log`.
4. **`faq-parity` del blog — 485 páginas, 2.595 `schema_sin_h3`.** Preguntas del blog sin `<h3>` en el schema. Fuera del lote.
5. **`faq-parity` de otros lotes GHL — 232 páginas, 706 `schema_sin_h3`.** Son artefactos de otras familias ya publicadas en `GHL-PUBLICAR/`, no los 106 de `lote-sitio/por-pagina`. El lote de este informe aporta **0**.
6. **`test:migration` — 47 HTML «changed».** El guard histórico falla por diseño cuando cambian las fuentes; no es un defecto de los artefactos.
7. **Funnel propio de `Comunidades/` — 3.338 páginas** según el plan (3.342 HTML en el árbol, 1.112 de ellos bajo `Comunidades/landings`). Se publican con `preparar-funnel-ghl.mjs`, no desde los 106. En `faq-parity` del sitio aportan **0 `schema_sin_h3`**; el total de 3.301 se reparte en blog (2.595) y otros lotes GHL (706), no en Comunidades. Los 2.571 `items_sin_pregunta` son el agregado del sitio y no se imputan al lote.

**Otros rojos (site-wide / entorno) y regresión declarada:**

- **`verify-en` — 105 fallos: 103 preexistentes + 2 introducidos por este trabajo.** Regla: `tools/verify-en.mjs:73` exige que EN y ES tengan el mismo conjunto de nombres de Custom Value; `:77` exige `count(EN, n) >= count(ES, n)` para cada nombre de ES. Los dos casos concretos:
  - **`home`:** `home/es/landing-pages/ghl-home-multiservicios.html` tiene **87** `county_name_and_state` (81 fuera de `<script>`) y `home/en/landing-pages/home.en.html` **75** (72 fuera); EN tiene 85 `business__county_name` frente a 73 de ES. Los 12 que faltan son preguntas visibles que ya usan el token por municipio. Reponerlos exige devolver 12 títulos a «Puerto Rico» (copy) o duplicar el token viejo; la página ES está fuera del lote.
  - **`servicios`:** `categorias/servicios/es/landing-pages/servicios.html` tiene **73** (68 fuera de `<script>`) y `categorias/servicios/en/landing-pages/servicios.en.html` **0**. El único nombre viejo de EN era el de una pregunta del FAQPage que ahora usa `business__county_name` para coincidir con su `<h3>`; reponerlo rompe `src/faq/faq-core.mjs:90` (`H3 sin schema`) y `:92` (`schema sin H3`), que es la comprobación que mantiene el lote en 0/0/0/0. Añadir 73 tokens viejos sería reescribir la página.
  - **Resolución mínima:** se mantiene la alineación H3/JSON-LD y la paridad 0; no se toca copy ni la página ES fuera del lote. Bajo las restricciones de este encargo (sin copy y sin páginas ajenas al lote), la regla y la alineación son incompatibles: solo podrían coexistir añadiendo tokens viejos invisibles para inflar el conteo, que sería maquillar el verificador. Por eso se declara la regresión, no se oculta como rojo preexistente.
- **`verify-samples` (6):** `en/home`, `comunidades` y `techos` con destinos sin página. Son páginas de muestra, no artefactos.
- **`verify-ghl-publish` (2):** sin URL publicada no se puede ejecutar; el flujo exige `node tools/verify-ghl-publish.mjs <url>`.
- **`verify-nav-live` (98):** mide el sitio ya servido en `https://ilatekpr.com`; **98 rutas clasificadas `estructura`** (defectos de estructura del menú/pie en la medición en vivo; el log no desglosa cuáles), 0 no publicadas y 0 desactualizadas. No mide los artefactos.
- **`test-responsive-browser`:** el módulo `playwright` no está instalado en la raíz; el entorno de QA vive en `../scripts/.qaenv`. Es un fallo de entorno, no de contenido.

## 6. Cierre del plan sobre el árbol actual

| Comprobación de cierre | Resultado | Evidencia |
|---|---|---|
| `sync-artifacts --check` | **106 artefactos · 0 problemas** (exit 0) | `28-sync-check.log` |
| `verify-page-shell` verde | **109 delivery + 32 roof**, exit 0 | `05-page-shell.log` |
| `verify-page-shell` 2.ª pasada | exit 0, sin cambios | `05b-page-shell-2.log` |
| `apply-page-shell` 2.ª pasada | **0 actualizados**, exit 0 | `29-apply-shell-2.log` |
| sha256 real = manifiesto | **106/106** | §3 y `audit-106.json` |
| Copy retirado | **0** en los 106 | §2 |
| Footer / `FAQPage` / `dv-ghl-values` | **106 / 106 / 106** | §2 |
| Referencias CDN en `HEAD` | **1.062 refs · 95 únicas · 0 ausentes** | `audit-106.json` (`cdnMissing: []`) + recálculo con `git cat-file -e HEAD:` sobre las 95 |
| Paridad FAQ/JSON-LD del lote | **0/0/0/0** | `21-faq-parity-lote.log` |
| Eliminaciones locales | **231 D intactas**: 204 `comunidades/landings/**`, 26 `assets/` (24 `assets/optimized/` + `assets/hero-poster.png` + `assets/hero-poster.webp`), 1 `tools/_dbg-idem.mjs` | `git status --porcelain` |
| `assets/optimized/hero-poster-1280.webp` | **existe en `HEAD`, ausente en disco** (borrado no commiteado, no restaurado) | `git cat-file -e HEAD:…` |
| Commit / push / PR / merge | **ninguno** · HEAD sigue en `c577d51` · 0 staged | `git log -1` / `git status` |
| Fase 2 | **no ejecutada** | este informe |

Las 231 eliminaciones son una más que las 230 del plan porque el conteo real incluye los dos `assets/hero-poster.*` de la raíz además de los 24 de `assets/optimized/`; ninguna se incorporó, restauró ni commiteó. Publicar los 106 artefactos no las toca.

## 7. PASS/FAIL

- **Lote de 106: PASS.** 106/106 filas con URL, acción y sha coincidente; 0 problemas de sincronización; 0 copy retirado; footer, FAQPage y tokens completos; 0 CDN ausente; paridad FAQ 0.
- **Verificadores:** 21 PASS / 10 FAIL. La tabla **§4.1** compara los 31 contra `HEAD`: ningún verde de `HEAD` se volvió rojo; 04/05/05b/06 pasaron de rojo a verde y 08 de no ejecutable a verde; 02/21b/22 siguen en rojo (02 y 22 con el mismo conteo; 21b con absolutos mayores y tasa menor); 13/15/17/19/25 conservan el mismo conteo del turno anterior; **el único empeoramiento es `verify-en` 103→105 (+2)**. La regla (`tools/verify-en.mjs:73/77`), los dos casos y la resolución están en §5.
- **Regresión declarada (no ocultada):** `verify-en` 103→105 (+2) por `tools/verify-en.mjs:73/77`; los dos casos y la resolución están en §5. Se mantiene la alineación porque la alternativa era tocar copy o una página ES fuera del lote, o romper la paridad FAQ del lote.
- **Reparación de alineación:** **16 artefactos** regenerados (mtime `15:50:36–37`) desde 16 fuentes; hoy suman **36** nombres `FAQPage` alineados con su `<h3>` y **0 pendientes** (`fix-jsonld-parity.mjs`: `files: 0, tokens: 0`). El guard del script espera 34 reemplazos, pero ese conteo no está en un log guardado y no se cita como medido. Sin cambios de copy (el script solo sustituye el nombre del token dentro de `"name"`). `001-inicio` y `063-en-home`: `8228387eeddc` y `d1d5e72aba8f`.
- **Sin commit, push, PR ni merge.** Fase 2 sin ejecutar.

**Rutas:**
- Informe: `GHL-PUBLICAR/INFORME-PUBLICACION-106-2026-11-21-FINAL.md`
- Evidencia: `.tmp-verify/2026-11-21-cierre/` (`exits.tsv`, 31 logs finales, `audit-106.json`, `audit-106.tsv`) y `.tmp-verify/2026-11-21-cierre/baseline-head/` (31 logs de `HEAD` c577d51 + `exits.tsv`).
