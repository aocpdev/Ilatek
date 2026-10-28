# SEO unificado y publicado — ILATEK

Fecha: 28 de octubre de 2026. Subcuenta Ilatek - PR (`8OxUENFVM60EKzqsTcoD`), website `XG0ggFh3pBPpA5s0Pe37`.

## Resultado verificado

Los 15 casos de etiquetas title duplicadas quedaron corregidos, guardados y publicados en GHL. La comprobación final de las 60 URLs existentes devuelve HTTP 200, exactamente un título y un canonical por página, sin Custom Values pendientes en texto ni atributos. Los H1 y JSON-LD de las 60 páginas coinciden con el respaldo público anterior.

En las 15 páginas modificadas también hay una sola descripción y una sola copia de los metadatos sociales principales. El idioma nativo se ajustó a español. Sus títulos y descripciones conservan `{{custom_values.county_name_and_state}}` en GHL; el HTML inicial público entrega Puerto Rico, sin depender de JavaScript para resolver esos metadatos.

## Conservación y snapshot

El cambio de Custom Code elimina exclusivamente el bloque marcado HEAD SEO. Todo el código restante es idéntico byte por byte al leído de GHL: contenido, estilos, imágenes, enlaces, menú, footer, funciones y datos estructurados. Se conservaron las rutas y canonical existentes, incluso los paths con sufijos numéricos. No se reemplazaron páginas por versiones locales antiguas.

Para replicar estas 15 páginas, usar la versión actual guardada en GHL o los bloques de `preparados/` junto con la configuración de `SEO-GHL.md`. No volver a pegar el HEAD SEO de las versiones autónomas de vista previa: produciría otra vez dos fuentes de metadatos. Conservar los seis Custom Values y el Paragraph nativo del Home. `website_url` debe contener solo el dominio, sin protocolo ni barra final.

Esta corrección SEO queda lista para incorporarse al snapshot. No se creó ni exportó un snapshot en esta tarea. La comprobación cubre los 15 duplicados y la integridad de las 60 páginas; no certifica otros aspectos preexistentes como todos los destinos internos o el idioma nativo de las otras 45 páginas.

## Evidencia

- `publicacion.json`: 15 publicaciones verificadas, IDs y hashes del código antes/después.
- `respaldos/`: Custom Code anterior y metadatos retirados, para recuperación.
- `preparados/`: los 15 bloques exactos guardados en GHL.
- `SEO-GHL.md`: configuración nativa conservada por página.
- `verificacion-final.json`: auditoría de las 15 corregidas.
- `verificacion-60-paginas.json`: revisión pública final de todo el inventario.
- `verificados/`: HTML público comprobado.
- `ghl-seo-publicado.png`: evidencia del editor después de publicar.
- `residencial-mobile.png` y `residencial-desktop.png`: revisión visual de una página publicada. Sin desbordamiento horizontal en 390, 820 y 1512 px; un header, un footer y un title.

No se realizó commit ni push. Los cambios locales anteriores fueron preservados.
