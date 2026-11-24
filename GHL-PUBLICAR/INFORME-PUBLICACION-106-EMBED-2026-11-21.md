# Informe de publicación — 106 embeds autocontenidos

Fecha: 2026-11-21 · Re-verificado al cierre del 2026-11-21 (Fase 1 y 3) · Árbol en `HEAD c577d51` (sin commit, sin push, sin PR).

## 1. Regla aplicada: una página = un solo embed

Cada uno de los 106 artefactos se publica pegando **un único archivo**:
`GHL-PUBLICAR/lote-sitio/por-pagina/<carpeta>/2-CODIGO-CUSTOM-HTML.html`.

- Se auditó que cada carpeta contiene **exactamente 2 archivos**: `1-PAGINA.txt` (manifiesto con URL y acción) y `2-CODIGO-CUSTOM-HTML.html` (embed). **106/106**.
- No existe material de trozos dentro del lote: 0 archivos que casen `*trozo*`, `part-*`, `*-parte*`, `*-00N.txt`. El único juego de trozos que existía (copia de trabajo del home en la raíz del proyecto, `home-embed-001-inicio-partes/`) **se eliminó** tras comprobar que ningún artefacto, manifiesto, script ni documento lo referenciaba.
- Cada embed contiene por sí solo: menú (`id="ilatek-nav"`, 1 por archivo), hero (un `<h1>` en 104 de 106; las 2 excepciones son las páginas legales de privacidad `027-politica` y `080-en-politica`, que estructuran su contenido en `<h3>` y no llevan `<h1>` — comportamiento preexistente, no se tocó), **1.013 secciones balanceadas** (`<section>` = `</section>` en los 106), **1.510 scripts balanceados** (`<script>` = `</script>`), 1 `FAQPage` por página, los tokens `{{custom_values.*}}` (18.557 en total) y `dv-ghl-values`, y el pie (`id="ilatek-footer"`, 1 por archivo).

### 1.1 El home son **dos** embeds: uno para la página ES y otro para la EN

| Página | Embed (archivo único) | URL | Acción |
|---|---|---|---|
| Home ES | `001-inicio/2-CODIGO-CUSTOM-HTML.html` (447 KB, `96131aa4e21c`) | `https://ilatekpr.com/` | **REPUBLICAR** |
| Home EN | `063-en-home/2-CODIGO-CUSTOM-HTML.html` (435 KB, `99d409954426`) | `https://ilatekpr.com/en/home` | **CREAR PÁGINA** (hoy 404) |

- Son **dos páginas distintas de GHL**, cada una con su propio elemento Custom HTML/JavaScript. No se pega el mismo archivo en las dos ni se pega una dentro de la otra.
- El español vive en la **raíz** (`https://ilatekpr.com/`); no hay una URL `/es` en el manifiesto aprobado.
- Cada embed trae **su propio conmutador de idioma** (`data-es`/`data-en`: 190 pares en el ES, 180 en el EN), así que el botón ES/EN funciona dentro de cada página; la URL `/en/home` es además la entrada directa en inglés.

### 1.2 Regla de rutas: ES en el slug por defecto, EN con `/en/<slug>`

Verificado en los 106 artefactos: **ninguna** URL canónica ni `hreflang` usa el prefijo `/es/`; las páginas españolas quedan en su slug por defecto (el home en `/`) y solo las inglesas llevan `/en/` (el home en `/en/home`).

Corregido en fuente y regenerado/sincronizado en este turno:

| Artefacto | Antes | Ahora |
|---|---|---|
| `027-politica` | `hreflang` es/x → `/politica-de-privacidad` | `/politica` · en `/en/politica` |
| `080-en-politica` | canonical `/politica`; hreflang a `/politica-de-privacidad` | canonical `/en/politica`; es `/politica` |
| `053-terminos` | hreflang es/x → `/terminos-y-condiciones` | `/terminos` · en `/en/terminos` |
| `106-en-terminos` | canonical `/terminos`; hreflang a `/terminos-y-condiciones` | canonical `/en/terminos`; es `/terminos` |
| `063-en-home` | hreflang es/x → `/home` | `/` (raíz) · en `/en/home` |
| `059-en-communities` | canonical `/comunidades` | `/en/communities` |

Resultado de la auditoría de rutas: **0 desvíos** — cada `canonical` presente coincide con la URL de su manifiesto, cada `hreflang` apunta a una URL real del lote y `x-default` coincide con `es`.

### 1.3 Defecto real corregido en el home ES: `<div>` sin cerrar

- El embed `001-inicio` (y su fuente `home/es/landing-pages/home.html`) dejaba abierto `<div class="ilfaq-shell">` en la sección FAQ: **130 `<div>` frente a 129 `</div>`**, así que el resto de la página quedaba anidada dentro de ese contenedor.
- Se añadió el `</div>` que faltaba al final de la sección, en la misma posición que ya usaba la copia EN (`home/en/landing-pages/home.en.html`), que estaba balanceada (140/140).
- Resultado: **106/106 artefactos con `<div>` balanceados**; `<section>` y `<script>` siguen en 0 desbalances; el artefacto 001 se regeneró y su manifiesto quedó en `1d7bce7e3160` (447 KB).

### 1.4 Menú sobre el hero y hero a 100vh en todos los dispositivos

- Se quitó el espaciador de 92 px que el shell inyectaba antes de la sección del home (`data-ilatek-header-space`): era lo que dejaba la barra blanca **encima** del video. Ahora `.mshero` arranca en `y=0` y la barra flota sobre el video.
- `hasServiceHero()` (`tools/responsive-contract.mjs`) reconoce `.mshero`, así que `apply-page-shell` ya no reinyecta el espaciador al recomponer el header.
- `.mshero` escala `min-height:100vh → 100svh → 100dvh`: el video cubre la ventana completa también cuando el navegador móvil oculta su barra de URL.
- Medido en la vista local del artefacto 001: **1440×900 → hero 900 px**, **768×1024 → 1024 px**, **390×844 → 844 px**; nav fijo sobre el video en los tres, 0 scroll horizontal y titular/CTAs por debajo de la barra.
- Artefactos regenerados: `001-inicio` `96131aa4e21c` (447 KB) y `063-en-home` `99d409954426`.

**Material obsoleto declarado:** `GHL-PUBLICAR/lote-sitio/por-pagina.zip` está **desactualizado** y no debe usarse (001 dentro del zip: `8ec2c633f925`; 001 actual: `1d7bce7e3160`). La fuente de verdad son las carpetas de `por-pagina/`. Si se necesita el zip, regenerarlo con `npm run package:pages` antes de entregarlo.

## 2. Inventario de los 106 (URL y acción)

Acción: **REPUBLICAR** = la página ya existe en GHL, se sustituye el Custom Code; **CREAR PÁGINA** = la página aún no existe en GHL, se crea y se pega el embed.

| # | Carpeta en `por-pagina/` | Nombre en GHL | URL | Acción | KB | sha256 |
|---|---|---|---|---|---|---|
| 1 | `001-inicio` | Sitio - Inicio | https://ilatekpr.com/ | **REPUBLICAR** | 447 | `09896a5ee40b` |
| 2 | `002-airbnb-turnover` | Sitio - Airbnb Turnover | https://ilatekpr.com/airbnb-turnover | **REPUBLICAR** | 229 | `e3435ead2f90` |
| 3 | `003-alfombras` | Sitio - Alfombras | https://ilatekpr.com/alfombras | **REPUBLICAR** | 229 | `c1a561d8ba98` |
| 4 | `004-canaletas-y-bajantes` | Sitio - Canaletas y Bajantes | https://ilatekpr.com/canaletas-y-bajantes | **REPUBLICAR** | 235 | `61e2ca39ecf2` |
| 5 | `005-comunidades` | Sitio - Comunidades | https://ilatekpr.com/comunidades | **CREAR PÁGINA** | 618 | `ac11c234e461` |
| 6 | `008-electrodomesticos` | Sitio - Electrodomesticos | https://ilatekpr.com/electrodomesticos | **REPUBLICAR** | 229 | `2dd332821eab` |
| 7 | `009-empozamiento-de-techos` | Sitio - Empozamiento De Techos | https://ilatekpr.com/empozamiento-de-techos | **REPUBLICAR** | 236 | `b7a60de45f85` |
| 8 | `010-garantia` | Sitio - Garantia | https://ilatekpr.com/garantia | **REPUBLICAR** | 201 | `7d7c83313d0e` |
| 9 | `011-impermeabilizacion-de-techos` | Sitio - Impermeabilizacion De Techos | https://ilatekpr.com/impermeabilizacion-de-techos | **REPUBLICAR** | 238 | `16c66b6edbb8` |
| 10 | `012-inspeccion-de-techos` | Sitio - Inspeccion De Techos | https://ilatekpr.com/inspeccion-de-techos | **REPUBLICAR** | 235 | `15f89d46236e` |
| 11 | `013-inspeccion-y-mantenimiento-de-techos` | Sitio - Inspeccion y Mantenimiento De Techos | https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos | **REPUBLICAR** | 241 | `5dd4fbdddccc` |
| 12 | `014-instalacion-y-reemplazo-de-techos` | Sitio - Instalacion y Reemplazo De Techos | https://ilatekpr.com/instalacion-y-reemplazo-de-techos | **REPUBLICAR** | 238 | `22a3188a3c13` |
| 13 | `015-lavado-a-presion` | Sitio - Lavado A Presion | https://ilatekpr.com/lavado-a-presion | **REPUBLICAR** | 229 | `5e6460bc30d7` |
| 14 | `016-lavado-a-presion-techos` | Sitio - Lavado A Presion Techos | https://ilatekpr.com/lavado-a-presion-techos | **REPUBLICAR** | 235 | `4e6671fe536b` |
| 15 | `017-limpieza-comercial` | Sitio - Limpieza Comercial | https://ilatekpr.com/limpieza-comercial | **REPUBLICAR** | 229 | `8e0db9906cea` |
| 16 | `018-limpieza-de-mudanza` | Sitio - Limpieza De Mudanza | https://ilatekpr.com/limpieza-de-mudanza | **REPUBLICAR** | 229 | `9968128e3037` |
| 17 | `019-limpieza-de-techos-y-canaletas` | Sitio - Limpieza De Techos y Canaletas | https://ilatekpr.com/limpieza-de-techos-y-canaletas | **REPUBLICAR** | 238 | `fe9cbbb6ba4e` |
| 18 | `020-limpieza-estandar` | Sitio - Limpieza Estandar | https://ilatekpr.com/limpieza-estandar | **REPUBLICAR** | 229 | `8f7a411d16fe` |
| 19 | `021-limpieza-industrial` | Sitio - Limpieza Industrial | https://ilatekpr.com/limpieza-industrial | **REPUBLICAR** | 229 | `ba4a9973ff26` |
| 20 | `022-limpieza-profunda` | Sitio - Limpieza Profunda | https://ilatekpr.com/limpieza-profunda | **REPUBLICAR** | 229 | `14debd49745a` |
| 21 | `023-limpieza-residencial` | Sitio - Limpieza Residencial | https://ilatekpr.com/limpieza-residencial | **REPUBLICAR** | 230 | `a77fa2d41cbf` |
| 22 | `024-mantenimiento-de-techos` | Sitio - Mantenimiento De Techos | https://ilatekpr.com/mantenimiento-de-techos | **REPUBLICAR** | 235 | `a6925ea94d5c` |
| 23 | `025-membrana-asfaltica` | Sitio - Membrana Asfaltica | https://ilatekpr.com/membrana-asfaltica | **REPUBLICAR** | 234 | `b2187df44171` |
| 24 | `026-organizacion` | Sitio - Organizacion | https://ilatekpr.com/organizacion | **REPUBLICAR** | 228 | `6728c43ad5cc` |
| 25 | `027-politica` | Sitio - Politica | https://ilatekpr.com/politica | **CREAR PÁGINA** | 216 | `5d65d595e3af` |
| 26 | `028-post-construccion` | Sitio - Post Construccion | https://ilatekpr.com/post-construccion | **REPUBLICAR** | 229 | `2c5880b9943d` |
| 27 | `029-recubrimiento-elastomerico` | Sitio - Recubrimiento Elastomerico | https://ilatekpr.com/recubrimiento-elastomerico | **REPUBLICAR** | 237 | `0e3629b653d3` |
| 28 | `030-reparacion-de-filtraciones` | Sitio - Reparacion De Filtraciones | https://ilatekpr.com/reparacion-de-filtraciones | **REPUBLICAR** | 237 | `fc54f80be679` |
| 29 | `031-reparacion-de-goteras` | Sitio - Reparacion De Goteras | https://ilatekpr.com/reparacion-de-goteras | **REPUBLICAR** | 237 | `42bb977b213e` |
| 30 | `032-reparacion-de-grietas-techos` | Sitio - Reparacion De Grietas Techos | https://ilatekpr.com/reparacion-de-grietas-techos | **REPUBLICAR** | 239 | `b069dccd378d` |
| 31 | `033-reparacion-de-techos` | Sitio - Reparacion De Techos | https://ilatekpr.com/reparacion-de-techos | **REPUBLICAR** | 238 | `4be8dfd201e4` |
| 32 | `034-reparacion-post-huracan` | Sitio - Reparacion Post Huracan | https://ilatekpr.com/reparacion-post-huracan | **REPUBLICAR** | 236 | `deb06f706fff` |
| 33 | `035-resenas` | Sitio - Resenas | https://ilatekpr.com/resenas | **REPUBLICAR** | 216 | `1e49833e6b0d` |
| 34 | `036-sellado-acrilico` | Sitio - Sellado Acrilico | https://ilatekpr.com/sellado-acrilico | **REPUBLICAR** | 235 | `8656d421f1ae` |
| 35 | `037-sellado-de-poliuretano` | Sitio - Sellado De Poliuretano | https://ilatekpr.com/sellado-de-poliuretano | **REPUBLICAR** | 235 | `7fd6049606ee` |
| 36 | `038-sellado-de-silicona` | Sitio - Sellado De Silicona | https://ilatekpr.com/sellado-de-silicona | **REPUBLICAR** | 235 | `f49ebe1ccf08` |
| 37 | `039-sellado-de-techos` | Sitio - Sellado De Techos | https://ilatekpr.com/sellado-de-techos | **REPUBLICAR** | 275 | `ce895a193393` |
| 38 | `040-sellado-de-techos-comercial` | Sitio - Sellado De Techos Comercial | https://ilatekpr.com/sellado-de-techos-comercial | **REPUBLICAR** | 236 | `6b737bdc41a2` |
| 39 | `041-sellado-de-techos-industrial` | Sitio - Sellado De Techos Industrial | https://ilatekpr.com/sellado-de-techos-industrial | **REPUBLICAR** | 237 | `c558062a5177` |
| 40 | `042-sellado-de-techos-residencial` | Sitio - Sellado De Techos Residencial | https://ilatekpr.com/sellado-de-techos-residencial | **REPUBLICAR** | 237 | `ffe83eb7a34a` |
| 41 | `043-servicios` | Sitio - Servicios | https://ilatekpr.com/servicios | **REPUBLICAR** | 285 | `21274fff7c4c` |
| 42 | `044-servicios-techos` | Sitio - Servicios Techos | https://ilatekpr.com/servicios-techos | **REPUBLICAR** | 382 | `8747e9ddae3d` |
| 43 | `045-techos` | Sitio - Techos | https://ilatekpr.com/techos | **CREAR PÁGINA** | 289 | `7dada8f81ad6` |
| 44 | `046-techos-de-asfalto` | Sitio - Techos De Asfalto | https://ilatekpr.com/techos-de-asfalto | **REPUBLICAR** | 234 | `ccff245be0d6` |
| 45 | `047-techos-de-concreto` | Sitio - Techos De Concreto | https://ilatekpr.com/techos-de-concreto | **REPUBLICAR** | 235 | `12c3c030df1d` |
| 46 | `048-techos-de-madera` | Sitio - Techos De Madera | https://ilatekpr.com/techos-de-madera | **REPUBLICAR** | 234 | `612b9a69faf3` |
| 47 | `049-techos-de-teja` | Sitio - Techos De Teja | https://ilatekpr.com/techos-de-teja | **REPUBLICAR** | 234 | `bcd0a62094fe` |
| 48 | `050-techos-de-zinc` | Sitio - Techos De Zinc | https://ilatekpr.com/techos-de-zinc | **REPUBLICAR** | 234 | `1a47902adc24` |
| 49 | `051-techos-planos` | Sitio - Techos Planos | https://ilatekpr.com/techos-planos | **REPUBLICAR** | 234 | `0f5055097fe2` |
| 50 | `052-techos-por-segmento` | Sitio - Techos Por Segmento | https://ilatekpr.com/techos-por-segmento | **REPUBLICAR** | 235 | `a18fb74ddc40` |
| 51 | `053-terminos` | Sitio - Terminos | https://ilatekpr.com/terminos | **CREAR PÁGINA** | 210 | `3d567039fac8` |
| 52 | `054-tragaluces` | Sitio - Tragaluces | https://ilatekpr.com/tragaluces | **REPUBLICAR** | 232 | `40a48b640e74` |
| 53 | `055-ventanas` | Sitio - Ventanas | https://ilatekpr.com/ventanas | **REPUBLICAR** | 229 | `5834f5781490` |
| 54 | `056-en-airbnb-turnover` | Sitio - Airbnb Turnover (EN) | https://ilatekpr.com/en/airbnb-turnover | **CREAR PÁGINA** | 229 | `d30acffd12bd` |
| 55 | `057-en-alfombras` | Sitio - Alfombras (EN) | https://ilatekpr.com/en/alfombras | **CREAR PÁGINA** | 228 | `f8c97e4b9ca6` |
| 56 | `058-en-canaletas-y-bajantes` | Sitio - Canaletas y Bajantes (EN) | https://ilatekpr.com/en/canaletas-y-bajantes | **CREAR PÁGINA** | 233 | `1408bb4fd306` |
| 57 | `059-en-communities` | Sitio - Communities (EN) | https://ilatekpr.com/en/communities | **CREAR PÁGINA** | 617 | `d12c8c9cdaed` |
| 58 | `060-en-electrodomesticos` | Sitio - Electrodomesticos (EN) | https://ilatekpr.com/en/electrodomesticos | **CREAR PÁGINA** | 229 | `b7c62dfa61bd` |
| 59 | `061-en-empozamiento-de-techos` | Sitio - Empozamiento De Techos (EN) | https://ilatekpr.com/en/empozamiento-de-techos | **CREAR PÁGINA** | 234 | `3c03f598335d` |
| 60 | `062-en-garantia` | Sitio - Garantia (EN) | https://ilatekpr.com/en/garantia | **CREAR PÁGINA** | 199 | `a9ce1e744579` |
| 61 | `063-en-home` | Sitio - Home (EN) | https://ilatekpr.com/en/home | **CREAR PÁGINA** | 435 | `e26e1fab2642` |
| 62 | `064-en-impermeabilizacion-de-techos` | Sitio - Impermeabilizacion De Techos (EN) | https://ilatekpr.com/en/impermeabilizacion-de-techos | **CREAR PÁGINA** | 237 | `c0f52f2eaa16` |
| 63 | `065-en-inspeccion-de-techos` | Sitio - Inspeccion De Techos (EN) | https://ilatekpr.com/en/inspeccion-de-techos | **CREAR PÁGINA** | 233 | `bac566f7e07d` |
| 64 | `066-en-inspeccion-y-mantenimiento-de-techos` | Sitio - Inspeccion y Mantenimiento De Techos (EN) | https://ilatekpr.com/en/inspeccion-y-mantenimiento-de-techos | **CREAR PÁGINA** | 240 | `47e64c3958d1` |
| 65 | `067-en-instalacion-y-reemplazo-de-techos` | Sitio - Instalacion y Reemplazo De Techos (EN) | https://ilatekpr.com/en/instalacion-y-reemplazo-de-techos | **CREAR PÁGINA** | 237 | `08c62107e984` |
| 66 | `068-en-lavado-a-presion` | Sitio - Lavado A Presion (EN) | https://ilatekpr.com/en/lavado-a-presion | **CREAR PÁGINA** | 229 | `77fccb0074ef` |
| 67 | `069-en-lavado-a-presion-techos` | Sitio - Lavado A Presion Techos (EN) | https://ilatekpr.com/en/lavado-a-presion-techos | **CREAR PÁGINA** | 234 | `570df0416506` |
| 68 | `070-en-limpieza-comercial` | Sitio - Limpieza Comercial (EN) | https://ilatekpr.com/en/limpieza-comercial | **CREAR PÁGINA** | 229 | `08e63e4c8970` |
| 69 | `071-en-limpieza-de-mudanza` | Sitio - Limpieza De Mudanza (EN) | https://ilatekpr.com/en/limpieza-de-mudanza | **CREAR PÁGINA** | 229 | `d6f4daadb041` |
| 70 | `072-en-limpieza-de-techos-y-canaletas` | Sitio - Limpieza De Techos y Canaletas (EN) | https://ilatekpr.com/en/limpieza-de-techos-y-canaletas | **CREAR PÁGINA** | 236 | `ec5f8c17847c` |
| 71 | `073-en-limpieza-estandar` | Sitio - Limpieza Estandar (EN) | https://ilatekpr.com/en/limpieza-estandar | **CREAR PÁGINA** | 229 | `1423d0610ad4` |
| 72 | `074-en-limpieza-industrial` | Sitio - Limpieza Industrial (EN) | https://ilatekpr.com/en/limpieza-industrial | **CREAR PÁGINA** | 229 | `e7ab22f96803` |
| 73 | `075-en-limpieza-profunda` | Sitio - Limpieza Profunda (EN) | https://ilatekpr.com/en/limpieza-profunda | **CREAR PÁGINA** | 229 | `03434e4e168e` |
| 74 | `076-en-limpieza-residencial` | Sitio - Limpieza Residencial (EN) | https://ilatekpr.com/en/limpieza-residencial | **CREAR PÁGINA** | 230 | `2c7c04a6b780` |
| 75 | `077-en-mantenimiento-de-techos` | Sitio - Mantenimiento De Techos (EN) | https://ilatekpr.com/en/mantenimiento-de-techos | **CREAR PÁGINA** | 234 | `a93d85272c13` |
| 76 | `078-en-membrana-asfaltica` | Sitio - Membrana Asfaltica (EN) | https://ilatekpr.com/en/membrana-asfaltica | **CREAR PÁGINA** | 233 | `d8d7c9af62f2` |
| 77 | `079-en-organizacion` | Sitio - Organizacion (EN) | https://ilatekpr.com/en/organizacion | **CREAR PÁGINA** | 228 | `94e21f0e1639` |
| 78 | `080-en-politica` | Sitio - Politica (EN) | https://ilatekpr.com/en/politica | **CREAR PÁGINA** | 215 | `57aa421cb91c` |
| 79 | `081-en-post-construccion` | Sitio - Post Construccion (EN) | https://ilatekpr.com/en/post-construccion | **CREAR PÁGINA** | 229 | `bb84bc1af867` |
| 80 | `082-en-recubrimiento-elastomerico` | Sitio - Recubrimiento Elastomerico (EN) | https://ilatekpr.com/en/recubrimiento-elastomerico | **CREAR PÁGINA** | 235 | `1c69d350e726` |
| 81 | `083-en-reparacion-de-filtraciones` | Sitio - Reparacion De Filtraciones (EN) | https://ilatekpr.com/en/reparacion-de-filtraciones | **CREAR PÁGINA** | 235 | `f538e773aef9` |
| 82 | `084-en-reparacion-de-goteras` | Sitio - Reparacion De Goteras (EN) | https://ilatekpr.com/en/reparacion-de-goteras | **CREAR PÁGINA** | 235 | `2d5ba5f82a47` |
| 83 | `085-en-reparacion-de-grietas-techos` | Sitio - Reparacion De Grietas Techos (EN) | https://ilatekpr.com/en/reparacion-de-grietas-techos | **CREAR PÁGINA** | 237 | `1b105e05d7dd` |
| 84 | `086-en-reparacion-de-techos` | Sitio - Reparacion De Techos (EN) | https://ilatekpr.com/en/reparacion-de-techos | **CREAR PÁGINA** | 236 | `f4d242bcd720` |
| 85 | `087-en-reparacion-post-huracan` | Sitio - Reparacion Post Huracan (EN) | https://ilatekpr.com/en/reparacion-post-huracan | **CREAR PÁGINA** | 235 | `ed83253ab329` |
| 86 | `088-en-resenas` | Sitio - Resenas (EN) | https://ilatekpr.com/en/resenas | **CREAR PÁGINA** | 216 | `86369e488e7c` |
| 87 | `089-en-sellado-acrilico` | Sitio - Sellado Acrilico (EN) | https://ilatekpr.com/en/sellado-acrilico | **CREAR PÁGINA** | 233 | `78a157cb6c77` |
| 88 | `090-en-sellado-de-poliuretano` | Sitio - Sellado De Poliuretano (EN) | https://ilatekpr.com/en/sellado-de-poliuretano | **CREAR PÁGINA** | 234 | `264ea99dd969` |
| 89 | `091-en-sellado-de-silicona` | Sitio - Sellado De Silicona (EN) | https://ilatekpr.com/en/sellado-de-silicona | **CREAR PÁGINA** | 233 | `588da4390e41` |
| 90 | `092-en-sellado-de-techos` | Sitio - Sellado De Techos (EN) | https://ilatekpr.com/en/sellado-de-techos | **CREAR PÁGINA** | 272 | `b166540f380e` |
| 91 | `093-en-sellado-de-techos-comercial` | Sitio - Sellado De Techos Comercial (EN) | https://ilatekpr.com/en/sellado-de-techos-comercial | **CREAR PÁGINA** | 235 | `48d42a7e0792` |
| 92 | `094-en-sellado-de-techos-industrial` | Sitio - Sellado De Techos Industrial (EN) | https://ilatekpr.com/en/sellado-de-techos-industrial | **CREAR PÁGINA** | 235 | `b6d4548326d6` |
| 93 | `095-en-sellado-de-techos-residencial` | Sitio - Sellado De Techos Residencial (EN) | https://ilatekpr.com/en/sellado-de-techos-residencial | **CREAR PÁGINA** | 236 | `aefaa64ba26c` |
| 94 | `096-en-servicios` | Sitio - Servicios (EN) | https://ilatekpr.com/en/servicios | **CREAR PÁGINA** | 284 | `bf3465793ca8` |
| 95 | `097-en-servicios-techos` | Sitio - Servicios Techos (EN) | https://ilatekpr.com/en/servicios-techos | **CREAR PÁGINA** | 376 | `bd969bb4c5ef` |
| 96 | `098-en-techos` | Sitio - Techos (EN) | https://ilatekpr.com/en/techos | **CREAR PÁGINA** | 286 | `c552c9dabf93` |
| 97 | `099-en-techos-de-asfalto` | Sitio - Techos De Asfalto (EN) | https://ilatekpr.com/en/techos-de-asfalto | **CREAR PÁGINA** | 232 | `8f92ccd9e28b` |
| 98 | `100-en-techos-de-concreto` | Sitio - Techos De Concreto (EN) | https://ilatekpr.com/en/techos-de-concreto | **CREAR PÁGINA** | 233 | `5eaadddd75a9` |
| 99 | `101-en-techos-de-madera` | Sitio - Techos De Madera (EN) | https://ilatekpr.com/en/techos-de-madera | **CREAR PÁGINA** | 233 | `099598471119` |
| 100 | `102-en-techos-de-teja` | Sitio - Techos De Teja (EN) | https://ilatekpr.com/en/techos-de-teja | **CREAR PÁGINA** | 232 | `6d91f90ecbd0` |
| 101 | `103-en-techos-de-zinc` | Sitio - Techos De Zinc (EN) | https://ilatekpr.com/en/techos-de-zinc | **CREAR PÁGINA** | 232 | `14e20345dbd4` |
| 102 | `104-en-techos-planos` | Sitio - Techos Planos (EN) | https://ilatekpr.com/en/techos-planos | **CREAR PÁGINA** | 232 | `7442579a7fd7` |
| 103 | `105-en-techos-por-segmento` | Sitio - Techos Por Segmento (EN) | https://ilatekpr.com/en/techos-por-segmento | **CREAR PÁGINA** | 234 | `d854cdeca046` |
| 104 | `106-en-terminos` | Sitio - Terminos (EN) | https://ilatekpr.com/en/terminos | **CREAR PÁGINA** | 207 | `b138734c6965` |
| 105 | `107-en-tragaluces` | Sitio - Tragaluces (EN) | https://ilatekpr.com/en/tragaluces | **CREAR PÁGINA** | 231 | `0d6284cb0caf` |
| 106 | `108-en-ventanas` | Sitio - Ventanas (EN) | https://ilatekpr.com/en/ventanas | **CREAR PÁGINA** | 228 | `d29c34818a28` |
Resumen: **49 REPUBLICAR · 57 CREAR PÁGINA**.

## 3. Qué se pega en cada página

1. GHL → la página del nombre indicado (columna «Nombre en GHL»).
2. Elemento **Custom HTML/JavaScript** → **Custom Code** → **Open Code Editor**.
3. Borrar todo el contenido anterior del editor y pegar **el archivo completo** `2-CODIGO-CUSTOM-HTML.html` de esa carpeta. No hace falta pegar nada más: menú, hero, secciones, JSON-LD y pie viajan dentro.
4. **Save** → **Publish**.

No se pega ningún trozo suelto ni se reparte el embed entre varios elementos.

## 4. Comprobaciones de este turno (resultado real)

### 4.1 Auditoría de los 106 (script propio, solo lectura)

| Comprobación | Resultado |
|---|---|
| Carpetas con exactamente manifiesto + embed | **106/106** |
| sha256 y KB del embed vs `1-PAGINA.txt` | **106/106 coinciden**, 0 desajustes |
| `1-PAGINA.txt` con URL válida y Acción | **106/106** (49 REPUBLICAR + 57 CREAR PÁGINA) |
| Copy retirado (`ilcl-form`, «Recibe tu precio», «inspección gratis», `pie²`, `ilf-brand`, «Oportunidades», tarjetas `services-images/social/`) | **0** en los 106 |
| `FAQPage` por página | **106/106** (exactamente 1) |
| Tokens `{{custom_values.*}}` / `dv-ghl-values` | 18.557 tokens · **106/106** con `dv-ghl-values` |
| Footer nuevo: «Explora» + `/servicios` + `/techos` con `data-ilatek-path` | **106/106** |
| Menú / pie únicos por embed | **106/106** (1 y 1) |
| `<section>`/`</section>` y `<script>`/`</script>` balanceados | **106/106** (1.013 y 1.510) |
| Referencias de imágenes al CDN presentes en `HEAD` | **390 referencias · 28 URLs · 28/28 en `HEAD`** |
| FAQ del lote (`faq-parity` sobre `por-pagina`) | 106 páginas · 1.011 preguntas · 0 sin schema, 0 divergentes, 0 sin pregunta |

### 4.2 Verificadores ejecutados por separado

| Comprobación | Exit | Resultado / archivos afecta |
|---|---|---|
| `node tools/sync-artifacts.mjs --check` | **0** | 106 artefactos · 0 problemas |
| `node tools/verify-page-shell.mjs` (2 pasadas) | **0** | 109 delivery + 32 roof pages; sin componentes duplicados |
| `node tools/apply-page-shell.mjs` (2 pasadas) | **0** | «Header/footer: 0 updated» en ambas → idempotente |
| `node tools/verify-structure.mjs` | **0** | estructura canónica |
| `node tools/verify-internal-links.mjs` | **0** | enlaces internos |
| `node tools/verify-nav.mjs` | **0** | fallos: 0 |
| `node tools/verify-location.mjs` | **0** | contrato de ubicación |
| `node tools/verify-seo-integrity.mjs` | **0** | canónicas, llms, anchors |
| `node tools/verify-faq-words.mjs` | **0** | 23 preguntas money, 40–60 palabras |
| `node tools/verify-en-parity.mjs` | **0** | paridad ES/EN del lote |
| `node tools/verify-anchor-ratio.mjs` | **0** | 2/46.409 exactos (0,00 %) |
| `node tools/verify-schema-prices.mjs` | **0** | precios solo verificados |
| `node tools/verify-sitemap.mjs` | **0** | 98 URLs |
| `node src/faq/faq-parity.mjs GHL-PUBLICAR/lote-sitio/por-pagina` | **0** | 106 páginas · 0 hallazgos |
| `node tools/verify-samples.mjs` | **1** | 6 problemas en páginas muestra (`en/home`, `comunidades`, `techos`: destinos que crea el propio lote) — fuera del lote |
| `node tools/verify-ghl-publish.mjs` | **2** | requiere una URL publicada; no ejecutable en este entorno |
| `node tools/verify-en.mjs` | **1** | 48 copias EN · **103 fallos preexistentes** (token `county_name`, `/comunidades`, `/en/resenas`, hreflang) — fuera del lote |
| `node tools/verify-social-cards.mjs` | **1** | 20 páginas `blog-*`/`blog-en-*` (185 WebP existen) — fuera del lote |
| `node blog/build/verify-blog-en.mjs` | **1** | pares ES/EN del blog — fuera del lote |
| `npm run test:faq` | **1** | 4.490 páginas · 3.301 `schema_sin_h3` · 2.571 `items_sin_pregunta` (blog + landings municipales) — fuera del lote |
| `npm run test:cannibalization:strict` | **1** | 1 hallazgo (blog: «¿Cuánto dura el sellado…?») — fuera del lote |
| `npm run test:migration` | **1** | guard histórico, fallo por diseño |

Los verificadores rojos son los mismos que el plan ya identificó como **fuera del alcance del lote**; ninguno toca los 106 artefactos. Fase 2 (FAQ `<h3>` de Comunidades, acordeones legales, detector del home) **no se ejecutó**: sigue pendiente de aprobación.

### 4.3 Re-ejecución fresca del cierre (Fase 1 y Fase 3)

Los 22 verificadores se volvieron a ejecutar **uno a uno**, con su salida completa en `.tmp-verify/2026-11-21-fase1/*.log` y la auditoría estructurada en `.tmp-verify/2026-11-21-fase1/audit-106.json`.

| Grupo | Exit | Confirmación de esta pasada |
|---|---|---|
| `sync-artifacts --check` | **0** | 106 artefactos · 0 problemas · media 248 KB |
| `verify-page-shell` (2 pasadas) y `apply-page-shell` (2 pasadas) | **0** | 109 delivery + 32 roof; «Header/footer: 0 updated» en ambas → idempotente |
| `verify-structure`, `verify-internal-links`, `verify-nav`, `verify-location`, `verify-seo-integrity`, `verify-faq-words`, `verify-en-parity`, `verify-anchor-ratio`, `verify-schema-prices`, `verify-sitemap`, `verify-responsive` | **0** | 97 hero pages, 296 arrow controls, idempotence passed |
| `faq-parity` sobre el lote | **0** | 106 páginas · 1.011 preguntas · 0 sin schema · 0 divergentes · 0 sin pregunta |
| `verify-samples` | **1** | 6 problemas, solo destinos que crea el propio lote (`en/home`, `comunidades`, `techos`) |
| `verify-ghl-publish` | **2** | uso: requiere URL publicada; no ejecutable aquí |
| `verify-en` | **1** | 48 copias EN · 103 fallos preexistentes |
| `verify-social-cards` | **1** | 185 páginas · 80 fallos en **20** páginas `blog-*` |
| `verify-blog-en` | **1** | pares ES/EN del blog |
| `test:faq` | **1** | 4.490 páginas · 3.301 `schema_sin_h3` · 2.571 `items_sin_pregunta` |
| `test:cannibalization --strict` | **1** | 1 hallazgo (blog) |
| `test:migration` | **1** | guard histórico, fallo por diseño |

Auditoría fresca de los 106 (`audit-106.json`, 0 problemas): **106/106** sha y KB coinciden con su manifiesto; **49 REPUBLICAR + 57 CREAR PÁGINA**; `FAQPage`=1 y `dv-ghl-values` en **106/106**; **18.557** tokens `{{custom_values.*}}`; footer nuevo en **106/106**; 1 nav y 1 footer por embed; **1.013** secciones, **1.510** scripts y **106/106** `<div>`/`<section>`/`<script>` balanceados; copy retirado **0** en los 106; **390** referencias CDN / **28** URLs / **0** faltantes en `HEAD` (incluidos `assets/optimized/hero-poster-1280.webp` y `hero-loop-720.mp4`).

Cierre: `blog/llms.txt` = `48cd16fda144` (sin cambios) y **0** archivos versionados de `blog/` modificados (`blog/` sigue como directorio no rastreado, igual que al inicio). Ningún artefacto se modificó en este turno: solo se auditó y se verificó.

### 4.4 Titulares con custom value en el vertical de techos

Norma: todo titular (H1 y H2) que nombra el municipio escribe `{{custom_values.business__county_name}}`. El resolver del puente lo sustituye por el pueblo de la página y cae a «Puerto Rico» cuando no hay párrafo nativo, así que nunca se publica un token crudo. Antes de este arreglo quedaban **78 titulares** (64 H1 + 14 H2) en **64 páginas** (32 ES + 32 EN) con «Puerto Rico» escrito en duro.

Estado medido en este turno sobre los 106 artefactos:

| Comprobación | Resultado |
|---|---|
| Páginas del vertical en el lote | **64** (32 ES + 32 EN) |
| Titulares H1/H2 con el token | **80** = 78 corregidos (39 ES + 39 EN) + 2 preexistentes: el H2 «Todos los servicios de techos en {{…}}» de `045-techos` y `098-en-techos` |
| H1 / H2 / H3 con «Puerto Rico» en duro en el vertical | **0 · 0 · 0** |
| Tokens `{{custom_values.*}}` en los 106 | **18.557** |

Prueba de render independiente (resultado en `.tmp-verify/2026-11-21-titulares/headline-proof.json` + `headline-proof.log`): servidor propio y Chromium, sin reutilizar ninguna aserción del probe. Cada artefacto se sirve tal como se pega en GHL —con el párrafo nativo expandido delante— y se compara el texto renderizado de **cada** titular tokenizado con el esperado.

| Configuración | Titulares | Fallos |
|---|---|---|
| `Juncos` · puente de 7 slots (con pixel) | 80 | **0** |
| `Mayagüez` · puente de 7 slots (con pixel) | 80 | **0** |
| `Juncos` · puente de 6 slots (sin pixel) | 80 | **0** |
| Controles | 6 | **0** |

**246 comprobaciones · 0 fallos.** Cada titular se exige con: texto idéntico al esperado con el municipio inyectado, municipio presente, sin «Puerto Rico» y sin token crudo en el nodo.

Controles que demuestran que la prueba discrimina:

- **Sin puente ni título** → H1 «Sellado de Techos en *Puerto Rico* que…» (fallback de marca). Si el sitio no resolviera, esto es lo que se vería y la prueba lo marcaría.
- **Solo `<title>`** «… en Juncos, Puerto Rico» → H1 Juncos (`source=meta`).
- **Puente después del Custom Code** → H1 Juncos (`source=parrafo`).
- **Pixel con id inválido** → H1 Juncos.
- **Página ajena al arreglo** (`003-alfombras`, limpieza) con 7 y 6 slots → H1 Mayagüez.

### 4.5 Auditoría de la prueba y de los dos canales ajenos

**El probe no se había editado antes de este turno.** El `git diff` de `tools/qa/qa_tokenized_headings.mjs` contra `HEAD` (`c577d51`) contiene **un solo hunk**: el de la expectativa que se corrige abajo. Ninguna otra aserción del archivo cambió desde el commit (sha en `HEAD`: `54b3f73e2202…`), así que la sospecha de que se había relajado «titular al literal» no se sostiene contra el repo.

El único cambio en `tools/qa` es del poblador (`populate_headings.py`, +2 líneas): añade el patrón «Sellado de techos en Puerto Rico:» al barrido de H2. **No es una aserción**: amplía la cobertura (sin él, 2 H2 quedaban literales). No hay ninguna comprobación relajada.

**Una expectativa sí era errónea y se corrigió en este turno**, con la justificación escrita en el propio archivo (líneas 253-266):

- antes: `[borde] párrafo después del Custom Code: titular al literal` exigía `/Puerto Rico/` en el H1.
- por qué era errónea: en ese caso el H1 era texto estático, así que la comprobación pasaba **sin ejercitar el resolver**; el helper reintenta cuando el párrafo aparece después («Diario del barrido con fallback») y ahora el titular resuelve el pueblo.
- ahora: exige `TestCounty`, prohíbe «Puerto Rico» y prohíbe el token crudo. El caso que sí debe caer al literal sigue comprobado aparte (`[title] sin pueblo en título ni subdominio`) y el control `sin-puente` del harness lo confirma.
- resultado: **PASS**.

**Los dos canales ajenos no participan en los titulares.** Medido en la misma carga (`.tmp-verify/2026-11-21-titulares/side-channels.json`):

| Caso | `ILATEK_LINKS.base` | H1 | H2 AEO | H2 precio | H3 `county_name_and_state` |
|---|---|---|---|---|---|
| `039-sellado-de-techos` · 7 slots | `https://ilatekpr.com` (el gate `!== 6` rechaza el párrafo) | Juncos | «Sellado de techos en Juncos: …» | «¿Cuánto cuesta sellar un techo en Juncos?» | — |
| `039-sellado-de-techos` · 6 slots | `https://qa.example.com` | Juncos | igual | igual | — |
| `050-techos-de-zinc` · 7 slots | `https://ilatekpr.com` | Juncos | — | — | «…en Puerto Rico?» (literal, sin token) |
| `050-techos-de-zinc` · sin párrafo, con título | `https://ilatekpr.com` | Juncos (`source=meta`) | — | — | sigue en «Puerto Rico» |
| `003-alfombras` (ajena al arreglo) · 7 slots | `https://ilatekpr.com` | Mayagüez | — | — | — |

El gate de 6 slots cambia la base de los enlaces, **no** los titulares: el mismo resultado con 6 y con 7. El H3 con `county_name_and_state` se queda en el literal de marca —nunca en token crudo— mientras el H1 de esa misma página resuelve. Por eso el probe conserva **8 FAIL** de esas dos familias (6 de `linksBase`, 2 de H3), fuera del contrato de titulares y sin efecto en los 80.

**Hallazgo abierto, no tocado:** `county_name_and_state` no se resuelve ni por el puente ni por el `<title>` en el runtime actual; 7 H3 de 6 páginas muestran «Puerto Rico». No forma parte de los 78 titulares y no se modificó; queda para aprobación aparte.

### 4.6 Fase 2 · FAQ de Comunidades y acordeones legales (puntos 4 y 5)

El `<h3>` y la regla CSS **ya estaban aplicados** en las fuentes. Este turno lo comprobó, propagó los derivados y corrigió un defecto real de alcance.

| Comprobación | Resultado |
|---|---|
| `Comunidades/scripts/landings/template.mjs` (faqBlock) | `<details><summary><h3>…` presente |
| `styles.mjs` y `styles.css` | `.faq summary h3{margin:0;font:inherit;font-weight:inherit}` presente |
| Landings de Comunidades | **1.112/1.112** con `<summary><h3>` |
| Copias de pueblo (`Comunidades/pueblos`) | **1.112/1.112** |
| Funnel GHL (`Comunidades/data/ghl`) | **1.112/1.112** páginas con `<h3>` y la regla CSS inline, sin `src` relativos, con `<main>`/`<footer>` y 0 merge tokens |
| Legales ES+EN | garantía 21 · privacidad 21 · términos 34 `<summary><h3>` por archivo |

Propagación ejecutada, con huellas antes/después:

| Script | Resultado |
|---|---|
| `scripts/genera-pueblos.mjs` | 78 pueblos · **1.112 sin cambios** · 0 copias reescritas · **0** diferencias de hash |
| `Comunidades/scripts/preparar-funnel-ghl.mjs --all` | 556 comunidades · 1.112 páginas · 0 assets nuevos · exit 0. La 1.ª pasada propaga el HTML actual (1.112) y reescribe 557 JSON; la 2.ª solo cambia `generatedAt` (ese script no es idempotente por diseño) |

Paridad FAQ (comprobación del propio repo, `faq-parity`):

| Ámbito | Páginas | Preguntas | Hallazgos |
|---|---|---|---|
| `Comunidades/landings` | 1.112 | 5.004 | **0** |
| `Comunidades/data/ghl` (funnel) | 1.112 | 5.004 | **0** |
| 6 artefactos legales | 6 | 140 | **0** |

**Defecto encontrado y corregido.** Al añadir la regla en los legales se perdió el prefijo del selector y quedó `…font-weight:inherit}summary{list-style:none;…}`: el bloque `summary` dejaba de estar acotado a `#ilatek-garantia` / `#ilatek-priv` / `#ilatek-tyc`. Restaurado en los 6 archivos (ES+EN) y artefactos regenerados: **0** ocurrencias de `}summary{` y la regla acotada presente en los 6; la paridad sigue en 0. La edición preservó los finales CRLF y `apply-page-shell` re-sincronizó nav/pie (6 actualizados, segunda pasada **0**).

### 4.7 H3 de localidad resueltos por el puente

Los 34 H3 de 16 páginas que llevaban `{{custom_values.county_name_and_state}}` en el título del acordeón pasaron al token del puente, `{{custom_values.business__county_name}}`, dentro del propio `<h3>` (texto y plantillas `data-es`/`data-en`). Cero copia nueva: solo cambia quién resuelve el municipio.

- Artefactos afectados: 16 (001, 031, 033, 035, 043, 044, 045, 050, 063, 084, 086, 088, 096, 097, 098, 103); tabla del §2 actualizada.
- Re-verificado: `sync-artifacts --check` **106/0**, `verify-page-shell` verde e idempotente, **0** H3 con `county_name_and_state`, sha/KB **106/106**, `FAQPage`/`dv-ghl-values` 106/106, 0 problemas de balance.
- Probe `qa_tokenized_headings`: las 2 aserciones que fallaban (`techos`, `techos-de-zinc` → «all 1 tokenized FAQ h3 resolve TestCounty») pasan a **PASS**; quedan los 6 fallos preexistentes de pixel/borde.

## 5. Estado del árbol y límites

- **Sin commit, sin push, sin PR.** `HEAD c577d51`.
- `git status` al cierre de este turno: 231 `D`, 822 `M`, 1.108 `??`, 0 en staging. Las 231 eliminaciones locales (204 rutas de `comunidades/landings/**`, 26 de `assets/`, 1 de `tools/`) **no se tocaron**: siguen sin commitear.
- Archivos tocados en esta sesión de cierre: `tools/qa/qa_tokenized_headings.mjs` (una expectativa obsoleta, endurecida y justificada), los 6 legales (regla CSS re-acotada), los derivados de Comunidades regenerados (1.112 HTML + 557 JSON en `Comunidades/data/ghl`) y este informe. Los 6 artefactos legales cambiaron de sha: la tabla del §2 ya trae los valores de este turno y `sync-artifacts --check` quedó en **106/0**.
- `blog/llms.txt` = `48cd16fda144` (sin cambios).
- En la Fase 1 los 106 artefactos no se modificaron: solo se auditaron y se verificaron contra su manifiesto. En el turno del arreglo (§4.4) se tokenizaron los 78 titulares del vertical de techos y se regeneraron **64** artefactos (32 ES + 32 EN); los otros **42** conservan su sha. Este turno no regeneró ninguno: solo verificó.
- No quedan trozos en el árbol: se borró `home-embed-001-inicio-partes/` en la raíz del proyecto (material derivado, sin referencias). Se conserva `home-embed-001-inicio.txt` como copia plana del embed del home (`sha256 1d7bce7e3160…`, 447 KB, idéntica byte a byte al artefacto `001-inicio`).

## 6. Evidencia

Salidas completas de cada verificador en `.tmp-verify/2026-11-22-106/*.log`; auditoría estructurada en `.tmp-verify/2026-11-22-106/audit-embed.json` (incluye una fila por artefacto con sus conteos).

Evidencia de este turno en `.tmp-verify/2026-11-21-titulares/`: `headline-proof.json` + `headline-proof.log` (246 comprobaciones de render, 0 fallos), `side-channels.json` (canales ajenos frente a los titulares), `audit-106-this-turn.json` (sha/KB/FAQPage/puente/balance/tokens del lote) y `probe-tras-arreglo.log` (detallados del probe con la aserción corregida). Los dos scripts de prueba usados para generar esa evidencia se retiraron del árbol al terminar.

Fase 2: `faq-parity-comunidades.log` (1.112 páginas · 5.004 preguntas · 0 hallazgos), `faq-parity-funnel.log` (1.112 · 5.004 · 0), `pueblos-before.sha`/`pueblos-after.sha` (0 diferencias) y `ghl-before.sha`/`ghl-after.sha`/`ghl-after2.sha` (1.ª pasada propaga el HTML; 2.ª solo `generatedAt`).
