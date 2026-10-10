# Estructura de entrega — ILATEK

Actualización: las landings de entrega ahora incluyen header y footer. La integración sigue el proceso de componentes compartidos adaptado a esta estructura; ver [header y footer](HEADER-FOOTER.md). Las notas de reorganización originales que siguen describen esa etapa previa.

## Criterios

- `home/`: únicamente el Home multiservicios identificado por el usuario y confirmado en la documentación del proyecto.
- `categorias/`: catálogo de limpieza, tres categorías de limpieza, cinco categorías madre de techos y el hub legado de techos.
- `servicios/`: las 36 landings específicas existentes. Los servicios de limpieza pueden pertenecer a más de una categoría; se conserva una sola fuente, sin duplicar el HTML por audiencia.
- `componentes/`: fragmentos reutilizables que no son páginas completas. No confundir un carrusel de categorías con la landing de una categoría.
- `archivo/home-limpieza/`: las tres variantes anteriores del Home de limpieza, preservadas sin pérdida.
- `techos/`: conserva fuentes, generador, SEO agregado y pruebas; los HTML de entrega se encuentran ahora en categorías y servicios.

Se revisó la estructura local de Guz Plumbing (`home/es`, `home/en`, `categorias/<id>/es|en`, `servicios/<servicio>/es|en`, `landing-pages`, `assets`, `SEO-GHL.md`, `ASSETS.json`, `seo.json`, `HEAD-TEMPLATE.html`). Para Aires Inverters se usó el contrato de referencia de la guía GHL; no se encontró una carpeta local con ese nombre en las ubicaciones revisadas. No se copió contenido, datos de contacto, calendarios ni Custom Values de otra marca.

## Idiomas

ILATEK no entrega actualmente landings independientes EN. El Home y algunos componentes contienen traducciones propias; el menú también contempla traducción automática. Las carpetas `en/README.md` registran esta diferencia. No se crearon rutas públicas, canonical ni hreflang ficticios.

Los assets compartidos están en `es/assets/` junto al único embed real. Cuando se produzca una landing inglesa independiente, su carpeta EN deberá tener sus entregables y SEO propios. No se modificó el contrato de Custom Values existente de ILATEK.

## Assets y SEO

Cada paquete contiene copias de las imágenes y videos referenciados de forma literal en su HTML/CSS/JS y bloque HEAD, incluidos fallbacks y referencias de schema. Los elementos SVG inline siguen en el HTML. Los scripts, Google Fonts, widgets de reseñas y calendarios son dependencias externas enumeradas, no recursos que deban copiarse o reemplazarse.

La biblioteca original `assets/` se mantiene porque los embeds públicos usan enlaces de jsDelivr a esas rutas. Moverla rompería páginas aunque GHL no se editara. Las copias por página permiten entregar cada paquete con sus medios y trazabilidad.

Si un JPG antiguo devuelve 404, se conserva la variante WebP del mismo identificador encontrada en `assets/optimized/techos/`, y se registra como respaldo, no como descarga del JPG. La URL original no se sustituye silenciosamente. Ver avisos en cada ficha SEO y `assets-pendientes.json`.

Los metadatos se extraen de los bloques existentes: en limpieza/Home están en el HTML; en techos proceden del agregado `techos/ghl-techos-head-seo.html`. El HEAD separado es una referencia para instalación, no un segundo bloque para pegar indiscriminadamente.

## Rutas y mantenimiento

`docs/estructura.json` registra las 70 rutas trasladadas, las 47 páginas, clasificación, estado EN y hashes iniciales. Es la fuente de resolución de rutas para los scripts; no modifica las URLs públicas del sitio.

- `tools/verify-structure.mjs`: valida paquetes, hashes de assets, SEO y preservación del HTML; usar `--migration` para exigir igualdad con la versión anterior a la reorganización.
- `tools/package-pages.mjs`: refresca documentación generada y copias de medios después de editar un embed. No modifica los embeds ni instala nada en GHL.
- `techos/build-techos.mjs`: escribe las nuevas ubicaciones. Puede sobrescribir HTML editado a mano; ejecutarlo solo cuando se desee regenerar contenido, no para organizar carpetas. Después refrescar los paquetes.
- `src/faq/faq-engine.mjs`: usa las nuevas rutas; un proyecto dental externo solo participa si se proporciona explícitamente `DENTAL_FILE`.
- `techos/serve-techos.mjs`: mantiene las antiguas URLs de QA mediante resolución interna hacia la nueva ubicación, sin crear copias duplicadas de las landings.

La reorganización no altera el sitemap, los slugs públicos, pagos, precios, calendarios ni diseño. No se publicó ni se hizo push.
