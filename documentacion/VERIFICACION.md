# Verificación de la reorganización

> Este documento registra la entrega de reorganización. Posteriormente se aplicó
> el [contrato de enlaces internos](ENLACES-INTERNOS.md) solicitado por el propietario.
> Los HTML ahora son distintos deliberadamente; la igualdad con los hashes de la
> reorganización ya no es el criterio de aprobación. Usar `npm test` para el estado actual.

Fecha: 2026-10-10. Base local anterior: commit `ea4afb8`. No se creó commit ni se hizo push.

## Resultado

| Comprobación | Resultado |
|---|---|
| Páginas inventariadas | 47: 1 Home, 10 categorías y 36 servicios |
| HTML original conservado | 47/47, comparación SHA-256 antes/después |
| Traslados registrados | 70, con destinos y fuentes en `docs/estructura.json` |
| SEO por página | 47 fichas Markdown, JSON, HEAD de referencia e inventario de assets |
| Copias de medios | 282, con tamaño y SHA-256 comprobados |
| Referencias con WebP de respaldo | 58 referencias a 47 URLs antiguas de CDN |
| Recursos sin copia ni respaldo local | 0 |
| Bloques JS / JSON-LD analizados | 369, sin errores de sintaxis |
| Fuentes del motor FAQ | 17 rutas existentes |
| Verificador original de techos | 32/32 páginas, 0 problemas |

El inventario incluye medios usados por CSS/JavaScript, schema y fallbacks, no solo imágenes visibles al abrir la página. Las 33 referencias de medios del Home tienen copia original o respaldo WebP local.

## Incidencias anteriores preservadas

### URLs antiguas de GHL

La descarga de medios detectó HTTP 404 en 47 URLs antiguas, usadas 58 veces entre los paquetes. Todas tienen una variante WebP del mismo identificador en la biblioteca original. Las variantes se copiaron a `assets/respaldo/` de la página y se documentaron con su procedencia.

Lista completa: [assets-pendientes.json](assets-pendientes.json). «Pendiente» significa corregir o comprobar la URL pública original, **no falta de respaldo local**. Algunos fallos son fallbacks de imágenes cuyo WebP primario existe; otros afectan imágenes o metadatos usados directamente. No se consideran todos fallos visuales equivalentes.

El Home conserva tres referencias antiguas en el carrusel «Techos por Segmento». Sus respaldos están en `home/es/assets/respaldo/`. Se requiere una decisión aparte para sustituir esos enlaces dentro del código publicado. La imagen social del Home usa la URL jsDelivr original; no es uno de esos tres JPG.

Comprobación HTTP adicional: la URL pública de la imagen social del Home y las tres URLs jsDelivr de sus respaldos devolvieron **200** el 2026-10-10. No se cambiaron las referencias del HTML.

### Paridad de FAQ

El verificador general ya detectaba antes de mover archivos: 54 páginas con FAQ, 442 preguntas, 10 preguntas visibles sin equivalente de schema, 10 entradas de schema sin equivalente visible y 31 respuestas divergentes. Después de la reorganización devuelve exactamente los mismos conteos.

Son diferencias previas; no fueron introducidas por el cambio de carpetas. No se regeneraron FAQs ni landings para ocultarlas, ya que eso alteraría contenido fuera de esta tarea. El verificador específico de techos sí pasa sus 32 páginas.

### Inglés

Solo el Home principal tiene traducciones propias detectadas en los embeds inventariados. El resto puede usar el motor del menú, pero no dispone de entregables independientes EN. Cada carpeta EN documenta su estado; no se crearon traducciones ficticias ni rutas nuevas.

## Límites

No se modificaron GHL, los calendarios, los precios, los Custom Values, los slugs ni los datos SEO de los embeds. No se comprobó una publicación nueva porque no se autorizó publicar. Las comprobaciones son de integridad de archivos, rutas, sintaxis y datos; no sustituyen una prueba visual de producción ni prometen resultados SEO.

## Repetir comprobaciones

```bash
node tools/verify-structure.mjs --migration
node techos/verify-techos.mjs
node src/faq/faq-parity.mjs
git diff --check
```

El tercer comando conserva su estado de fallo por las discrepancias previas descritas arriba. `--migration` sirve para verificar esta entrega: después de editar contenido intencionalmente, usar el verificador sin esa opción.
