# 02 · Comparativas de sistemas de sellado

Cien páginas comparativas, cada una con su CTA al final. Son el núcleo del SEO programático:
combinan familia de sistema, marca, sustrato e intención de búsqueda sin repetir ángulo.

## Composición del lote

| Grupo | Posts | Qué compara |
| --- | --- | --- |
| familia | 21 | sistema contra sistema (silicona, poliuretano, acrílico, membrana asfáltica, membrana líquida, multicapa, TPO/PVC, metal-zinc, losa) |
| marca | 25 | Conspro/Bull-Bond, Cintrón, Marín Membrana, Danosa, Soprema, Polyglass, Sika, WindMar, Lanco y sus productos |
| sustrato | 21 | el techo concreto: losa, zinc, teja, madera, comercial, con paneles solares, equipos de aire |
| intención | 33 | precio, duración, garantía, cuánto rinde una paila, licencias, errores, cuándo sellar |

Los datos están en `blog/data/sistemas.json` (9 familias, 12 marcas con precios publicados,
garantías y enlace a la ficha original) y `blog/data/posts.json` (catálogo con slug, título,
H1, meta, palabra clave y ángulo). El texto largo de los 20 posts principales está escrito a
mano en `blog/data/editoriales.json`; el resto se redacta con el mismo esqueleto y sus datos
verificados.

## Esqueleto de cada post

1. Hero con migas de pan y el veredicto en una línea.
2. Respuesta corta (el párrafo que se puede citar).
3. Índice con anclas a las secciones del propio post.
4. Qué es cada sistema, en lenguaje de dueño de casa.
5. Ventajas y desventajas, en dos columnas que se apilan en móvil.
6. Precio publicado: solo cifras de la web de cada empresa, con enlace y fecha de verificación.
7. Cómo se aplica y qué se revisa antes de aplicar.
8. Errores que arruinan el trabajo.
9. Preguntas frecuentes del tema, con `FAQPage`.
10. Bloque legal de comparación y aviso de marcas.
11. Fuentes citadas.
12. Relacionadas (misma familia, misma marca, mismo sustrato) y CTA a `/cotizacion-techos`.

## Precios y legalidad

- Solo se publica lo que la empresa publica en su propio dominio. Marín Membrana, por ejemplo,
  no tiene precios ni fichas en su sitio: sus páginas lo dicen y no se rellena el hueco.
- No se usan logos, fotos ni capturas de terceros.
- No se afirma afiliación, patrocinio ni recomendación oficial de ninguna marca. Se compara
  con hechos y se enlaza la fuente.
- Cada página repite el aviso: la decisión depende del techo, no de la marca.

Al agregar un post, el índice, el CSV de SEO, el sitemap y los enlaces entrantes se recalculan
al reconstruir. El verificador falla si un post queda huérfano o si un precio no trae fuente.
