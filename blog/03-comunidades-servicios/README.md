# 03 · Comunidades y servicios

Aquí el blog deja de comparar productos y pasa a explicar cómo entra Ilatek a la propiedad:
el subdominio de comunidades, las landings de servicio y el criterio con el que se elige el
sistema. Es la sección que convierte una guía en una visita.

## Contenido

| Ruta | Función |
| --- | --- |
| `/blog/comunidades-y-servicios` | hub de la sección |
| `/blog/comunidades-ilatekpr-como-funciona` | qué es `comunidades.ilatekpr.com` y cómo se navega |
| `/blog/guia-de-servicios-de-techos-de-ilatek` | mapa de todas las landings de servicio |
| `/blog/ilatek-y-el-sellado-de-silicona` | puente entre la familia y el servicio real |
| `/blog/ilatek-y-el-sellado-de-poliuretano` | idem |
| `/blog/ilatek-y-el-recubrimiento-elastomerico` | idem |
| `/blog/ilatek-y-el-sellado-acrilico` | idem |
| `/blog/ilatek-y-la-membrana-asfaltica` | idem |

Los cinco puentes de sistema usan la misma línea editorial: Ilatek no es afiliado de ninguna
marca; reconoce la necesidad del cliente antes que la marca, protege la propiedad y cuida la
tranquilidad de quien vive debajo del techo. Nunca se presenta como distribuidor ni como
representante oficial.

## Datos de comunidades

La fuente es `Comunidades/data/mapa-comunidades.json`
(`regions[].municipalities[].communities[]` con `url`, `published` y `priority`).
Cifras actuales: 78 municipios, 564 comunidades conocidas y 68 con página publicada.

Al sumar comunidades publicadas, actualiza esas cifras en las páginas de la sección y vuelve
a construir. El verificador no inventa el dato: si cambia el mapa, hay que reflejarlo.

## Landings de servicio

La guía enlaza las landings reales de `ilatekpr.com` (sellado, membrana, recubrimientos,
reparación de goteras y filtraciones, inspección, mantenimiento, canaletas, techos por
sustrato y comercial/industrial). Cada enlace pasa por el contrato de Custom Values, así que
sirve igual en local y en GHL.

Todas las páginas de esta carpeta cierran con el CTA a `/cotizacion-techos`, el bloque legal
de comparación y el footer compartido con el crédito a Devasks.
