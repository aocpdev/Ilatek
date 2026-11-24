# 01 · Preguntas frecuentes

Deep research de las dudas que la gente escribe en Google sobre sellado de techos en Puerto
Rico, agrupadas en seis clústeres. Cada clúster es una página que se puede posicionar sola y
que empuja tráfico hacia las 100 comparativas.

## Contenido

| Ruta | Tema |
| --- | --- |
| `/blog/preguntas-frecuentes` | hub con los seis clústeres |
| `/blog/preguntas-frecuentes-sellado-de-techos-precio` | precio y presupuesto |
| `/blog/preguntas-frecuentes-sellado-de-techos-materiales` | silicona, acrílico, poliuretano, membranas |
| `/blog/preguntas-frecuentes-sellado-de-techos-proceso` | cómo se aplica y cuánto tarda |
| `/blog/preguntas-frecuentes-sellado-de-techos-garantia-y-leyes` | garantía, licencia, permisos |
| `/blog/preguntas-frecuentes-sellado-de-techos-clima-y-huracanes` | lluvia, sol, salitre, huracanes |
| `/blog/preguntas-frecuentes-sellado-de-techos-tipos-de-techo` | losa, zinc, teja, madera, comercial |

Las 40 preguntas viven en `blog/data/preguntas.json`. Cada una guarda la respuesta corta
(la que se puede citar desde un featured snippet), la fuente con enlace, el post destino y
las familias de sistema a las que aplica.

## Cómo se arma cada página

1. Respuesta corta arriba, visible sin scroll.
2. Una sección por pregunta, con la respuesta corta, el detalle y el enlace a la guía.
3. `FAQPage` en JSON-LD con las mismas preguntas que se ven en pantalla.
4. Relacionadas dentro del clúster y salto al clúster vecino.
5. CTA único a `/cotizacion-techos`.

## Reglas

- Ninguna respuesta sin fuente. Si el dato no está publicado por una empresa del sector o por
  una fuente oficial, la pregunta no entra.
- No se responde con precio inventado: se cita la cifra publicada, con enlace y fecha.
- Las respuestas cortas se mantienen por debajo de 60 palabras para que sirvan de snippet.

Para añadir una pregunta: agrégala a `preguntas.json` con su `cluster`, vuelve a ejecutar
`node blog/build/build-blog.mjs` y `node blog/build/verify-blog.mjs`.
