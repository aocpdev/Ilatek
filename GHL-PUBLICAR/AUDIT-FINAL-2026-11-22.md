# Auditoría final del sitio — criterios de aceptación

**Fecha:** 2026-11-22 - **Alcance:** 111 artefactos del lote (53 ES + 58 EN), las 8 cabeceras, `robots.txt`, `llms.txt`, schema, FAQ y el estado real de cada URL.

**Método:** lectura byte a byte de cada artefacto y petición HTTP real a cada una de las 111 URLs. No se publico nada durante la auditoria.

## Veredicto por criterio

| Criterio | Estado | Medición |
|---|---|---|
| Enlaces en el idioma de cada página y su copia EN | Cumple con dependencia de JS | En EN el HTML estático enlaza rutas ES; el runtime las reescribe a `/en/...`. Verificado en `/en/home`: 117/117 enlaces a `/en/`, 0 a ES. Sin JS, un rastreador vería ES. |
| SEO en el idioma de su página | **No cumple** | 37 vivas con `<html lang>` contrario a su contenido; 1 con título en otro idioma; 3 con descripción en otro idioma; 3 sin descripción. |
| Canonical / hreflang | Parcial | 6 vivas sin canonical; 2 con canonical a la raíz; 36 de 57 sin `x-default`. |
| SEO programático listo para el subdominio | Parcial | 111/111 usan `{{custom_values.*}}`; 69 con token en el H1 y 32 con Puerto Rico literal en el H1. |
| robots.txt | Pendiente de publicar | Local 1.034 bytes; en vivo 450 bytes (versión anterior). |
| llms.txt | Pendiente y desactualizado en vivo | Local 12.564 bytes; en vivo 2631 bytes y aún afirma precios por pie cuadrado ($0.07/pie2). |
| Schema markup | Cumple con salvedades | 111/111 con JSON-LD válido; 11 con FAQPage distinto de lo visible; 9 con dominio fijo dentro del schema. |
| FAQ con custom values | Cumple | 111/111 con tokens de localidad y 111/111 con tokens dentro del JSON-LD. |

## Fallos, en orden de prioridad

### 1. `<html lang>` contrario al contenido (37 páginas vivas)

ES servidas como `lang="en"`: `004-canaletas-y-bajantes`, `009-empozamiento-de-techos`, `010-garantia`, `011-impermeabilizacion-de-techos`, `012-inspeccion-de-techos`, `013-inspeccion-y-mantenimiento-de-techos`, `014-instalacion-y-reemplazo-de-techos`, `016-lavado-a-presion-techos`, `019-limpieza-de-techos-y-canaletas`, `024-mantenimiento-de-techos`, `025-membrana-asfaltica`, `029-recubrimiento-elastomerico`, `030-reparacion-de-filtraciones`, `031-reparacion-de-goteras`, `032-reparacion-de-grietas-techos`, `033-reparacion-de-techos`, `034-reparacion-post-huracan`, `035-resenas`, `036-sellado-acrilico`, `037-sellado-de-poliuretano`, `038-sellado-de-silicona`, `039-sellado-de-techos`, `040-sellado-de-techos-comercial`, `041-sellado-de-techos-industrial`, `042-sellado-de-techos-residencial`, `044-servicios-techos`, `045-techos`, `046-techos-de-asfalto`, `047-techos-de-concreto`, `048-techos-de-madera`, `049-techos-de-teja`, `050-techos-de-zinc`, `051-techos-planos`, `052-techos-por-segmento`, `053-términos`, `054-tragaluces`.

EN servidas como `lang="es"`: `063-en-home`.

Se corrige en GHL, en los ajustes de idioma de cada página, no en el Custom HTML.

### 2. Titulo o descripción en el idioma equivocado (3 páginas)

- `063-en-home` - título (es): Sistema de Sellado de Techo en Puerto Rico | Ilatek Property Solution
- `057-en-alfombras` - título (en): Carpet Cleaning in {{custom_values.business__county_name}} | Ilatek
- `059-en-communities` - título (en): Communities in {{custom_values.business__county_name}} | Ilatek

### 3. Sin `meta description` (3)

- `045-techos` - https://ilatekpr.com/techos
- `053-términos` - https://ilatekpr.com/términos
- `091-en-sellado-de-silicona` - https://ilatekpr.com/en/sellado-de-silicona

### 4. Canonical (6 sin canonical, 2 a la raíz)

- sin canonical: `045-techos` - https://ilatekpr.com/techos
- sin canonical: `053-términos` - https://ilatekpr.com/términos
- sin canonical: `057-en-alfombras` - https://ilatekpr.com/en/alfombras
- sin canonical: `059-en-communities` - https://ilatekpr.com/en/communities
- sin canonical: `063-en-home` - https://ilatekpr.com/en/home
- sin canonical: `091-en-sellado-de-silicona` - https://ilatekpr.com/en/sellado-de-silicona
- canonical incorrecto: `010-garantia` -> `https://ilatekpr.com` (debería ser https://ilatekpr.com/garantia)
- canonical incorrecto: `035-resenas` -> `https://ilatekpr.com` (debería ser https://ilatekpr.com/resenas)

### 5. H1 con Puerto Rico literal (32 páginas)

No se adaptarán si el sitio se publica en un subdominio con otro valor de localidad:

- `004-canaletas-y-bajantes` - Canales, Canaletas y Bajantes para Techos en Puerto Rico desde $250.
- `009-empozamiento-de-techos` - Corrección de Empozamientos de Agua en Techos de Puerto Rico que evita filtraciones.
- `011-impermeabilizacion-de-techos` - Impermeabilización de Techos en Puerto Rico para cada tipo de techo.
- `012-inspeccion-de-techos` - Inspección de Techos en Puerto Rico: diagnóstico con fotos.
- `013-inspeccion-y-mantenimiento-de-techos` - Inspección y Mantenimiento de Techos en Puerto Rico.
- `014-instalacion-y-reemplazo-de-techos` - Instalación y Reemplazo de Techos en Puerto Rico desde $250.
- `016-lavado-a-presion-techos` - Lavado a Presión de Techos en Puerto Rico desde $250.
- `019-limpieza-de-techos-y-canaletas` - Limpieza de Techos y Canaletas en Puerto Rico desde $250.
- `024-mantenimiento-de-techos` - Mantenimiento Preventivo de Techos en Puerto Rico desde $250.
- `025-membrana-asfaltica` - Membrana Asfáltica para Techos en Puerto Rico: sellado de alta resistencia.
- `029-recubrimiento-elastomerico` - Recubrimiento Elastomérico para Techos en Puerto Rico: sella y refresca.
- `030-reparacion-de-filtraciones` - Reparación de Filtraciones de Agua en Techos de Puerto Rico que protege tu hogar.
- `031-reparacion-de-goteras` - Reparación de Goteras en Puerto Rico que detiene el agua hoy mismo.
- `032-reparacion-de-grietas-techos` - Reparación de Grietas en Techos de Concreto y Losas en Puerto Rico.
- `033-reparacion-de-techos` - Reparación de Techos en Puerto Rico que detiene filtraciones de raíz.
- `034-reparacion-post-huracan` - Reparación de Techos Post-Huracán en Puerto Rico: estabilizamos y reparamos.
- `036-sellado-acrilico` - Sellado Acrílico para Techos en Puerto Rico: la opción reflectiva económica.
- `037-sellado-de-poliuretano` - Sellado de Poliuretano para Techos en Puerto Rico: alta resistencia.
- `038-sellado-de-silicona` - Sellado de Techos con Silicona 100% en Puerto Rico que dura 20 a 25 años.
- `039-sellado-de-techos` - Sellado de Techos en Puerto Rico que impermeabiliza de verdad tu propiedad.
- `040-sellado-de-techos-comercial` - Sellado de Techos Comercial en Puerto Rico sin cerrar tu negocio.
- `041-sellado-de-techos-industrial` - Sellado de Techos Industrial en Puerto Rico para grandes superficies.
- `042-sellado-de-techos-residencial` - Sellado de Techos Residencial en Puerto Rico para tu hogar.
- `045-techos` - Reparación y Sellado de Techos en Puerto Rico.
- `046-techos-de-asfalto` - Reparación de Techos de Asfalto (Shingles) en Puerto Rico.
- `047-techos-de-concreto` - Reparación de Techos de Concreto (Losas) en Puerto Rico desde $250.
- `048-techos-de-madera` - Sellado y Protección de Techos de Madera en Puerto Rico desde $250.
- `049-techos-de-teja` - Reparación y Sellado de Techos de Teja en Puerto Rico desde $250.
- `050-techos-de-zinc` - Reparación y Sellado de Techos de Zinc y Metal en Puerto Rico desde $250.
- `051-techos-planos` - Impermeabilización de Techos Planos y Membranas en Puerto Rico (EPDM, TPO y asfáltica).
- `052-techos-por-segmento` - Sellado de Techos Residencial, Comercial e Industrial en Puerto Rico.
- `054-tragaluces` - Tragaluces y Skylights para Techos en Puerto Rico: sellado e instalación.

### 6. Dominio fijo dentro del JSON-LD (9 páginas)

- `001-inicio` - 1 referencia(s) a `ilatekpr.com`
- `005-comunidades` - 8 referencia(s) a `ilatekpr.com`
- `023-limpieza-residencial` - 1 referencia(s) a `ilatekpr.com`
- `043-servicios` - 18 referencia(s) a `ilatekpr.com`
- `044-servicios-techos` - 60 referencia(s) a `ilatekpr.com`
- `059-en-communities` - 8 referencia(s) a `ilatekpr.com`
- `076-en-limpieza-residencial` - 1 referencia(s) a `ilatekpr.com`
- `096-en-servicios` - 18 referencia(s) a `ilatekpr.com`
- `097-en-servicios-techos` - 60 referencia(s) a `ilatekpr.com`

### 7. FAQPage distinto de lo visible (11 páginas)

- `010-garantia` - schema 20, visibles 22
- `027-politica` - schema 21, visibles 22
- `053-términos` - schema 29, visibles 35
- `062-en-garantia` - schema 20, visibles 22
- `080-en-politica` - schema 21, visibles 22
- `106-en-términos` - schema 29, visibles 35
- `109-en-cotizacion` - schema 8, visibles 4
- `110-en-cotizacion-techos` - schema 8, visibles 4
- `111-en-blog` - schema 8, visibles 3
- `112-en-reclutamiento-empleo` - schema 8, visibles 4
- `113-en-reclutamiento-empleo-techos` - schema 8, visibles 3

### 8. URLs todavia en 404 (54 de 111)

Son las marcadas CREAR PAGINA: trabajo de publicación pendiente, no defecto del artefacto.

### 9. Home candidato (vista previa)

| Comprobación | Resultado |
|---|---|
| H1 | Una linea de 500 a 1920 px, con `{{custom_values.business__county_name}}` |
| Párrafo nuevo | Marca + descripción, 3 usos del token (texto, data-es, data-en) |
| Tokens | 381 en total, 181 de localidad |
| Enlaces | 60 rutas `data-ilatek-path`, todas con `{{custom_values.website_url}}` |
| FAQ | 23 visibles = 23 en `FAQPage` |
| Schema | Valido; 1 `@id` fijo a `https://ilatekpr.com/#faq` (punto 6) |

### 10. Cabeceras nuevas (8)

Correctas: descripción efectiva de 134-155 caracteres al expandir el municipio, 10 etiquetas Open Graph, 5 de Twitter, sin `<title>` real ni canonical.

## Tabla una a una

| # | Carpeta | URL | Idioma | Acción | HTTP | Tokens | H1 token | `<html lang>` | Titulo | Enlaces |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `001-inicio` | https://ilatekpr.com/ | es | republicar | 200 | 377 | si | ok | ok | ES fijo |
| 2 | `002-airbnb-turnover` | https://ilatekpr.com/airbnb-turnover | es | republicar | 200 | 168 | si | ok | ok | ES fijo |
| 3 | `003-alfombras` | https://ilatekpr.com/alfombras | es | republicar | 200 | 167 | si | ok | ok | ES fijo |
| 4 | `004-canaletas-y-bajantes` | https://ilatekpr.com/canaletas-y-bajantes | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 5 | `005-comunidades` | https://ilatekpr.com/comunidades | es | crear página | 200 | 125 | **no** | ok | ok | ES fijo |
| 6 | `008-electrodomesticos` | https://ilatekpr.com/electrodomesticos | es | republicar | 200 | 167 | si | ok | ok | ES fijo |
| 7 | `009-empozamiento-de-techos` | https://ilatekpr.com/empozamiento-de-techos | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 8 | `010-garantia` | https://ilatekpr.com/garantia | es | republicar | 200 | 130 | **no** | **en** | ok | ES fijo |
| 9 | `011-impermeabilizacion-de-techos` | https://ilatekpr.com/impermeabilizacion-de-techos | es | republicar | 200 | 171 | **no** | **en** | ok | ES fijo |
| 10 | `012-inspeccion-de-techos` | https://ilatekpr.com/inspeccion-de-techos | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 11 | `013-inspeccion-y-mantenimiento-de-techos` | https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos | es | republicar | 200 | 172 | **no** | **en** | ok | ES fijo |
| 12 | `014-instalacion-y-reemplazo-de-techos` | https://ilatekpr.com/instalacion-y-reemplazo-de-techos | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 13 | `015-lavado-a-presion` | https://ilatekpr.com/lavado-a-presion | es | republicar | 200 | 167 | si | ok | ok | ES fijo |
| 14 | `016-lavado-a-presion-techos` | https://ilatekpr.com/lavado-a-presion-techos | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 15 | `017-limpieza-comercial` | https://ilatekpr.com/limpieza-comercial | es | republicar | 200 | 171 | si | ok | ok | ES fijo |
| 16 | `018-limpieza-de-mudanza` | https://ilatekpr.com/limpieza-de-mudanza | es | republicar | 200 | 171 | si | ok | ok | ES fijo |
| 17 | `019-limpieza-de-techos-y-canaletas` | https://ilatekpr.com/limpieza-de-techos-y-canaletas | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 18 | `020-limpieza-estandar` | https://ilatekpr.com/limpieza-estandar | es | republicar | 200 | 171 | si | ok | ok | ES fijo |
| 19 | `021-limpieza-industrial` | https://ilatekpr.com/limpieza-industrial | es | republicar | 200 | 171 | si | ok | ok | ES fijo |
| 20 | `022-limpieza-profunda` | https://ilatekpr.com/limpieza-profunda | es | republicar | 200 | 171 | si | ok | ok | ES fijo |
| 21 | `023-limpieza-residencial` | https://ilatekpr.com/limpieza-residencial | es | republicar | 200 | 170 | si | ok | ok | ES fijo |
| 22 | `024-mantenimiento-de-techos` | https://ilatekpr.com/mantenimiento-de-techos | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 23 | `025-membrana-asfaltica` | https://ilatekpr.com/membrana-asfaltica | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 24 | `026-organizacion` | https://ilatekpr.com/organizacion | es | republicar | 200 | 167 | si | ok | ok | ES fijo |
| 25 | `027-politica` | https://ilatekpr.com/politica | es | crear página | 200 | 145 | **no** | ok | ok | ES fijo |
| 26 | `028-post-construccion` | https://ilatekpr.com/post-construccion | es | republicar | 200 | 168 | si | ok | ok | ES fijo |
| 27 | `029-recubrimiento-elastomerico` | https://ilatekpr.com/recubrimiento-elastomerico | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 28 | `030-reparacion-de-filtraciones` | https://ilatekpr.com/reparacion-de-filtraciones | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 29 | `031-reparacion-de-goteras` | https://ilatekpr.com/reparacion-de-goteras | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 30 | `032-reparacion-de-grietas-techos` | https://ilatekpr.com/reparacion-de-grietas-techos | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 31 | `033-reparacion-de-techos` | https://ilatekpr.com/reparacion-de-techos | es | republicar | 200 | 172 | **no** | **en** | ok | ES fijo |
| 32 | `034-reparacion-post-huracan` | https://ilatekpr.com/reparacion-post-huracan | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 33 | `035-resenas` | https://ilatekpr.com/resenas | es | republicar | 200 | 142 | **no** | **en** | ok | ES fijo |
| 34 | `036-sellado-acrilico` | https://ilatekpr.com/sellado-acrilico | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 35 | `037-sellado-de-poliuretano` | https://ilatekpr.com/sellado-de-poliuretano | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 36 | `038-sellado-de-silicona` | https://ilatekpr.com/sellado-de-silicona | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 37 | `039-sellado-de-techos` | https://ilatekpr.com/sellado-de-techos | es | republicar | 200 | 226 | **no** | **en** | ok | ES fijo |
| 38 | `040-sellado-de-techos-comercial` | https://ilatekpr.com/sellado-de-techos-comercial | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 39 | `041-sellado-de-techos-industrial` | https://ilatekpr.com/sellado-de-techos-industrial | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 40 | `042-sellado-de-techos-residencial` | https://ilatekpr.com/sellado-de-techos-residencial | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 41 | `043-servicios` | https://ilatekpr.com/servicios | es | republicar | 200 | 212 | si | ok | ok | ES fijo |
| 42 | `044-servicios-techos` | https://ilatekpr.com/servicios-techos | es | republicar | 200 | 275 | si | **en** | ok | ES fijo |
| 43 | `045-techos` | https://ilatekpr.com/techos | es | crear página | 200 | 291 | **no** | **en** | ok | ES fijo |
| 44 | `046-techos-de-asfalto` | https://ilatekpr.com/techos-de-asfalto | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 45 | `047-techos-de-concreto` | https://ilatekpr.com/techos-de-concreto | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 46 | `048-techos-de-madera` | https://ilatekpr.com/techos-de-madera | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 47 | `049-techos-de-teja` | https://ilatekpr.com/techos-de-teja | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 48 | `050-techos-de-zinc` | https://ilatekpr.com/techos-de-zinc | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 49 | `051-techos-planos` | https://ilatekpr.com/techos-planos | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 50 | `052-techos-por-segmento` | https://ilatekpr.com/techos-por-segmento | es | republicar | 200 | 168 | **no** | **en** | ok | ES fijo |
| 51 | `053-términos` | https://ilatekpr.com/términos | es | crear página | 200 | 139 | **no** | **en** | ok | ES fijo |
| 52 | `054-tragaluces` | https://ilatekpr.com/tragaluces | es | republicar | 200 | 165 | **no** | **en** | ok | ES fijo |
| 53 | `055-ventanas` | https://ilatekpr.com/ventanas | es | republicar | 200 | 167 | si | ok | ok | ES fijo |
| 54 | `056-en-airbnb-turnover` | https://ilatekpr.com/en/airbnb-turnover | en | crear página | 404 | 168 | si | - | - | EN via JS |
| 55 | `057-en-alfombras` | https://ilatekpr.com/en/alfombras | en | crear página | 200 | 167 | si | ok | ok | EN via JS |
| 56 | `058-en-canaletas-y-bajantes` | https://ilatekpr.com/en/canaletas-y-bajantes | en | crear página | 404 | 168 | si | - | - | EN via JS |
| 57 | `059-en-communities` | https://ilatekpr.com/en/communities | en | crear página | 200 | 125 | **no** | ok | ok | EN via JS |
| 58 | `060-en-electrodomesticos` | https://ilatekpr.com/en/electrodomesticos | en | crear página | 404 | 167 | si | - | - | EN via JS |
| 59 | `061-en-empozamiento-de-techos` | https://ilatekpr.com/en/empozamiento-de-techos | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 60 | `062-en-garantia` | https://ilatekpr.com/en/garantia | en | crear página | 404 | 130 | **no** | - | - | EN via JS |
| 61 | `063-en-home` | https://ilatekpr.com/en/home | en | crear página | 200 | 340 | si | **es** | **es** | EN via JS |
| 62 | `064-en-impermeabilizacion-de-techos` | https://ilatekpr.com/en/impermeabilizacion-de-techos | en | crear página | 404 | 175 | si | - | - | EN via JS |
| 63 | `065-en-inspeccion-de-techos` | https://ilatekpr.com/en/inspeccion-de-techos | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 64 | `066-en-inspeccion-y-mantenimiento-de-techos` | https://ilatekpr.com/en/inspeccion-y-mantenimiento-de-techos | en | crear página | 404 | 173 | si | - | - | EN via JS |
| 65 | `067-en-instalacion-y-reemplazo-de-techos` | https://ilatekpr.com/en/instalacion-y-reemplazo-de-techos | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 66 | `068-en-lavado-a-presion` | https://ilatekpr.com/en/lavado-a-presion | en | crear página | 404 | 167 | si | - | - | EN via JS |
| 67 | `069-en-lavado-a-presion-techos` | https://ilatekpr.com/en/lavado-a-presion-techos | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 68 | `070-en-limpieza-comercial` | https://ilatekpr.com/en/limpieza-comercial | en | crear página | 404 | 171 | si | - | - | EN via JS |
| 69 | `071-en-limpieza-de-mudanza` | https://ilatekpr.com/en/limpieza-de-mudanza | en | crear página | 404 | 171 | si | - | - | EN via JS |
| 70 | `072-en-limpieza-de-techos-y-canaletas` | https://ilatekpr.com/en/limpieza-de-techos-y-canaletas | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 71 | `073-en-limpieza-estandar` | https://ilatekpr.com/en/limpieza-estandar | en | crear página | 404 | 171 | si | - | - | EN via JS |
| 72 | `074-en-limpieza-industrial` | https://ilatekpr.com/en/limpieza-industrial | en | crear página | 404 | 171 | si | - | - | EN via JS |
| 73 | `075-en-limpieza-profunda` | https://ilatekpr.com/en/limpieza-profunda | en | crear página | 404 | 171 | si | - | - | EN via JS |
| 74 | `076-en-limpieza-residencial` | https://ilatekpr.com/en/limpieza-residencial | en | crear página | 404 | 170 | si | - | - | EN via JS |
| 75 | `077-en-mantenimiento-de-techos` | https://ilatekpr.com/en/mantenimiento-de-techos | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 76 | `078-en-membrana-asfaltica` | https://ilatekpr.com/en/membrana-asfaltica | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 77 | `079-en-organizacion` | https://ilatekpr.com/en/organizacion | en | crear página | 404 | 167 | si | - | - | EN via JS |
| 78 | `080-en-politica` | https://ilatekpr.com/en/politica | en | crear página | 404 | 145 | **no** | - | - | EN via JS |
| 79 | `081-en-post-construccion` | https://ilatekpr.com/en/post-construccion | en | crear página | 404 | 168 | si | - | - | EN via JS |
| 80 | `082-en-recubrimiento-elastomerico` | https://ilatekpr.com/en/recubrimiento-elastomerico | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 81 | `083-en-reparacion-de-filtraciones` | https://ilatekpr.com/en/reparacion-de-filtraciones | en | crear página | 404 | 168 | si | - | - | EN via JS |
| 82 | `084-en-reparacion-de-goteras` | https://ilatekpr.com/en/reparacion-de-goteras | en | crear página | 404 | 168 | si | - | - | EN via JS |
| 83 | `085-en-reparacion-de-grietas-techos` | https://ilatekpr.com/en/reparacion-de-grietas-techos | en | crear página | 404 | 170 | si | - | - | EN via JS |
| 84 | `086-en-reparacion-de-techos` | https://ilatekpr.com/en/reparacion-de-techos | en | crear página | 404 | 175 | si | - | - | EN via JS |
| 85 | `087-en-reparacion-post-huracan` | https://ilatekpr.com/en/reparacion-post-huracan | en | crear página | 404 | 167 | si | - | - | EN via JS |
| 86 | `088-en-resenas` | https://ilatekpr.com/en/resenas | en | crear página | 404 | 142 | **no** | - | - | EN via JS |
| 87 | `089-en-sellado-acrilico` | https://ilatekpr.com/en/sellado-acrilico | en | crear página | 404 | 168 | si | - | - | EN via JS |
| 88 | `090-en-sellado-de-poliuretano` | https://ilatekpr.com/en/sellado-de-poliuretano | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 89 | `091-en-sellado-de-silicona` | https://ilatekpr.com/en/sellado-de-silicona | en | crear página | 200 | 166 | si | ok | ok | EN via JS |
| 90 | `092-en-sellado-de-techos` | https://ilatekpr.com/en/sellado-de-techos | en | crear página | 404 | 233 | si | - | - | EN via JS |
| 91 | `093-en-sellado-de-techos-comercial` | https://ilatekpr.com/en/sellado-de-techos-comercial | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 92 | `094-en-sellado-de-techos-industrial` | https://ilatekpr.com/en/sellado-de-techos-industrial | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 93 | `095-en-sellado-de-techos-residencial` | https://ilatekpr.com/en/sellado-de-techos-residencial | en | crear página | 404 | 168 | si | - | - | EN via JS |
| 94 | `096-en-servicios` | https://ilatekpr.com/en/servicios | en | crear página | 404 | 212 | si | - | - | EN via JS |
| 95 | `097-en-servicios-techos` | https://ilatekpr.com/en/servicios-techos | en | crear página | 404 | 275 | si | - | - | EN via JS |
| 96 | `098-en-techos` | https://ilatekpr.com/en/techos | en | crear página | 404 | 296 | si | - | - | EN via JS |
| 97 | `099-en-techos-de-asfalto` | https://ilatekpr.com/en/techos-de-asfalto | en | crear página | 404 | 168 | si | - | - | EN via JS |
| 98 | `100-en-techos-de-concreto` | https://ilatekpr.com/en/techos-de-concreto | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 99 | `101-en-techos-de-madera` | https://ilatekpr.com/en/techos-de-madera | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 100 | `102-en-techos-de-teja` | https://ilatekpr.com/en/techos-de-teja | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 101 | `103-en-techos-de-zinc` | https://ilatekpr.com/en/techos-de-zinc | en | crear página | 404 | 169 | si | - | - | EN via JS |
| 102 | `104-en-techos-planos` | https://ilatekpr.com/en/techos-planos | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 103 | `105-en-techos-por-segmento` | https://ilatekpr.com/en/techos-por-segmento | en | crear página | 404 | 169 | si | - | - | EN via JS |
| 104 | `106-en-términos` | https://ilatekpr.com/en/términos | en | crear página | 404 | 139 | **no** | - | - | EN via JS |
| 105 | `107-en-tragaluces` | https://ilatekpr.com/en/tragaluces | en | crear página | 404 | 166 | si | - | - | EN via JS |
| 106 | `108-en-ventanas` | https://ilatekpr.com/en/ventanas | en | crear página | 404 | 167 | si | - | - | EN via JS |
| 107 | `109-en-cotizacion` | https://ilatekpr.com/en/cotizacion | en | crear | 404 | 150 | si | - | - | EN via JS |
| 108 | `110-en-cotizacion-techos` | https://ilatekpr.com/en/cotizacion-techos | en | crear | 404 | 149 | si | - | - | EN via JS |
| 109 | `111-en-blog` | https://ilatekpr.com/en/blog | en | crear | 404 | 151 | si | - | - | EN via JS |
| 110 | `112-en-reclutamiento-empleo` | https://ilatekpr.com/en/reclutamiento-empleo | en | crear | 404 | 149 | si | - | - | EN via JS |
| 111 | `113-en-reclutamiento-empleo-techos` | https://ilatekpr.com/en/reclutamiento-empleo-techos | en | crear | 404 | 149 | si | - | - | EN via JS |

## Límites de esta auditoria

- El idioma declarado y el canonical viven en el panel de GHL, no en el Custom HTML: aquí se mide lo que el sitio sirve hoy.
- Las 54 URLs en 404 no tienen SEO que auditar hasta que se creen.
- Los enlaces EN se comprueban con JS; sin JavaScript el HTML estático enlaza a ES.
