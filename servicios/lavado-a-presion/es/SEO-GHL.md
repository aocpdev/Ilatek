# SEO — Lavado a Presión en Puerto Rico | Ilatek

Valores extraídos del HTML y del bloque HEAD existentes, sin cambiar la estrategia ni el contenido SEO.

## Meta Tag Title

```text
Lavado a Presión en Puerto Rico | Ilatek
```

## Meta Tag Description

```text
Lavado a presión en Puerto Rico: terrazas, verjas, paredes exteriores y pisos. Equipo profesional y cobertura en los 78 municipios. Cotiza online en minutos.
```

## Meta Tag Image

[Imagen social — URL pública](https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/social/lavado-a-presion.jpg)

```text
https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/social/lavado-a-presion.jpg
```

Copia local: [assets/meta-image.jpg](assets/meta-image.jpg). No usar una ruta local en GHL.

## Canonical existente

https://{{custom_values.website_url}}/lavado-a-presion

## Instalación y comprobación

1. En SEO Meta Data de GHL, usar Title, Description y Social Image de esta ficha.
2. El embed conserva sus metadatos originales. Si se utiliza [HEAD-TEMPLATE.html](HEAD-TEMPLATE.html), revisar que el HEAD servido no termine con títulos, descriptions o canonicals duplicados. No pegar el conjunto de metadatos de otras páginas.
3. Las URLs de medios se mantienen: mover carpetas locales no publica ni modifica archivos en GHL.
4. Validar el HTML público final, la imagen social y los Custom Values resueltos. No depender del selector de idioma para metadatos de una ruta EN independiente.
5. No existe una landing inglesa independiente. El menú compartido puede ofrecer su traducción automática existente. No se creó ni se anunció una URL /en/ ni hreflang hacia páginas inexistentes.

Inventario: [ASSETS.json](ASSETS.json). Datos reutilizables: [seo.json](seo.json).

## Dominio y enlaces internos

Configurar `website_url` como dominio sin protocolo ni barra final, por ejemplo `ilatekpr.com`. Los enlaces y canonical usan `https://{{custom_values.website_url}}/ruta`. Validar que GHL entregue estos valores resueltos en el HEAD público; no confiar en JavaScript para los metadatos sociales.
