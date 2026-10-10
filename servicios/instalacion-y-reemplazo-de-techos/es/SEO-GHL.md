# SEO — Instalación y Reemplazo de Techos en {{custom_values.county_name_and_state}} | Ilatek Techos

Plantilla local Delta System para {{custom_values.county_name_and_state}}. Título, descripción y textos de imágenes sincronizados con los entregables.

## Meta Tag Title

```text
Instalación y Reemplazo de Techos en {{custom_values.county_name_and_state}} | Ilatek Techos
```

## Meta Tag Description

```text
Instalación y reemplazo de techos en {{custom_values.county_name_and_state}} desde $6.00 por pie². Techos nuevos de zinc, concreto y membrana con garantía escrita. Inspección gratis.
```

## Meta Tag Image

[Imagen social — URL pública](https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ac046f00edabbe5a4a763a0.jpg)

```text
https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ac046f00edabbe5a4a763a0.jpg
```

Copia local: [assets/respaldo/6ac046f00edabbe5a4a763a0.webp](assets/respaldo/6ac046f00edabbe5a4a763a0.webp). No usar una ruta local en GHL.

## Canonical existente

https://{{custom_values.website_url}}/instalacion-y-reemplazo-de-techos

## Instalación y comprobación

1. En SEO Meta Data de GHL, usar Title, Description y Social Image de esta ficha.
2. Este embed no incluye el bloque HEAD: los metadatos localizados están separados en HEAD-TEMPLATE.html. Si se utiliza [HEAD-TEMPLATE.html](HEAD-TEMPLATE.html), revisar que el HEAD servido no termine con títulos, descriptions o canonicals duplicados. No pegar el conjunto de metadatos de otras páginas.
3. Las URLs de medios se mantienen: mover carpetas locales no publica ni modifica archivos en GHL.
4. Validar el HTML público final, la imagen social y los Custom Values resueltos. No depender del selector de idioma para metadatos de una ruta EN independiente.
5. No existe una landing inglesa independiente. El menú compartido puede ofrecer su traducción automática existente. No se creó ni se anunció una URL /en/ ni hreflang hacia páginas inexistentes.

Inventario: [ASSETS.json](ASSETS.json). Datos reutilizables: [seo.json](seo.json).

## Localización del snapshot — SEO, AEO y GEO

Custom Value obligatorio: `{{custom_values.county_name_and_state}}`. Usar la etiqueta completa del pueblo y estado; no añadir Puerto Rico nuevamente si ya forma parte del valor. No sustituirlo por `business__county_name`.

### Meta Tag Image Alt

```text
Instalación y Reemplazo de Techos en {{custom_values.county_name_and_state}} | Ilatek Techos
```

El HEAD incluye `og:image:alt` y `twitter:image:alt`. Los atributos `alt` y `title` descriptivos de las imágenes usan la misma localidad, conservando lo que representa cada imagen. Las imágenes decorativas mantienen `alt=""` por accesibilidad. Las URLs de medios no son texto SEO y se conservan.

Antes de publicar cada snapshot, comprobar el HTML servido por GHL: Title, Description, Open Graph y Twitter deben contener el pueblo real, no el token. El fallback del navegador no reemplaza esta comprobación. Validar también H1, contenido, contactos y schema; no declarar una oficina, trabajo realizado o dirección local que no exista. La personalización no garantiza posiciones ni menciones en buscadores o asistentes.

## Dominio y enlaces internos

Configurar `website_url` como dominio sin protocolo ni barra final, por ejemplo `ilatekpr.com`. Los enlaces y canonical usan `https://{{custom_values.website_url}}/ruta`. Validar que GHL entregue estos valores resueltos en el HEAD público; no confiar en JavaScript para los metadatos sociales.

## Aviso sobre la imagen social original

La URL original del CDN no está disponible. La copia local es la variante WebP del mismo ID, no el JPG original.

Alternativa existente en el repositorio: [imagen WebP](https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/techos/6ac046f00edabbe5a4a763a0.webp). Antes de instalar el SEO, comprobar esta URL pública y usarla como Social Image si continúa disponible. El embed y el HEAD de referencia no se modificaron automáticamente.
