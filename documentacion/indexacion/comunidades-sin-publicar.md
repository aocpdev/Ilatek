# Comunidades sin publicar — diagnóstico con HTTP real

Comprobado el **7 nov 2026** contra el sitio en vivo (última pasada 2026-11-07T00:50:46.046Z), no contra notas.

## Qué se midió

Para cada URL del sitemap local de comunidades se pidió la página y se comparó el `<title>` servido
con el `<title>` del `index.html` local de esa misma comunidad:

- **1017** responden 200 y sirven su propia página → válidas (inventario y ambas colas).
- **89** responden **HTTP 404** (`404 - Page Not Found`, 2.852 bytes) → no existe.
- **6** responden **200 pero sirven otra comunidad** (*"Sellado de techo en Isla
  Verde, Carolina"*, sin canonical): el relleno de GHL cuando la landing no está publicada. El
  inventario las descarta ahora con el motivo `sin canonical (página de relleno de GHL)`.

Causa raíz: **(c) página no publicada en GHL**, no un fallo de construcción de URL. Las publicadas
responden 200 en `/<municipio>/<comunidad>/limpieza` **y** en `/<municipio>/<comunidad>-limpieza`;
las pendientes fallan en ambas formas, y su `index.html` existe en disco (el sitemap solo lista
rutas con archivo). Prueba: `/penuelas/comunidad-caracoles/limpieza` (hoy 200 tras publicarse) frente
a `/juncos/villa-graciela/sellado-de-techo` (404 en las dos formas).

## HTTP 404 (89)

| Ruta | Estado | ¿Funnel en GHL? |
|---|---|---|
| `juncos/villa-graciela/sellado-de-techo` | HTTP 404 | **no** |
| `mayaguez/manuel-hernandez-rosa-candelaria/limpieza` | HTTP 404 | **no** |
| `ponce/perla-del-sur/limpieza` | HTTP 404 | **no** |
| `quebradillas/la-ceiba-quebradillas/limpieza` | HTTP 404 | **no** |
| `quebradillas/la-ceiba-quebradillas/sellado-de-techo` | HTTP 404 | **no** |
| `quebradillas/santa-marina/limpieza` | HTTP 404 | **no** |
| `quebradillas/sombras-de-la-ceiba/limpieza` | HTTP 404 | **no** |
| `rincon/santa-rosa-elderly/limpieza` | HTTP 404 | **no** |
| `rincon/santa-rosa-elderly/sellado-de-techo` | HTTP 404 | **no** |
| `sabana-grande/colinas-de-villa-rosa/limpieza` | HTTP 404 | **no** |
| `sabana-grande/colinas-de-villa-rosa/sellado-de-techo` | HTTP 404 | **no** |
| `sabana-grande/el-hucar/limpieza` | HTTP 404 | **no** |
| `sabana-grande/jose-castillo-mercado/limpieza` | HTTP 404 | **no** |
| `sabana-grande/jose-castillo-mercado/sellado-de-techo` | HTTP 404 | **no** |
| `sabana-grande/mansiones-de-sabana-grande/limpieza` | HTTP 404 | **no** |
| `sabana-grande/mansiones-de-sabana-grande/sellado-de-techo` | HTTP 404 | **no** |
| `salinas/bella-vista/limpieza` | HTTP 404 | **no** |
| `salinas/bella-vista/sellado-de-techo` | HTTP 404 | **no** |
| `salinas/brisas-del-mar/limpieza` | HTTP 404 | **no** |
| `salinas/brisas-del-mar/sellado-de-techo` | HTTP 404 | **no** |
| `salinas/el-coco/limpieza` | HTTP 404 | **no** |
| `salinas/el-coco/sellado-de-techo` | HTTP 404 | **no** |
| `salinas/la-arboleda/limpieza` | HTTP 404 | **no** |
| `salinas/la-arboleda/sellado-de-techo` | HTTP 404 | **no** |
| `salinas/las-margaritas-ii/limpieza` | HTTP 404 | **no** |
| `salinas/marbella/limpieza` | HTTP 404 | **no** |
| `salinas/marbella/sellado-de-techo` | HTTP 404 | **no** |
| `salinas/parque-gabriela/limpieza` | HTTP 404 | **no** |
| `salinas/parque-gabriela/sellado-de-techo` | HTTP 404 | **no** |
| `salinas/paseo-costa-del-sur/limpieza` | HTTP 404 | **no** |
| `salinas/paseo-costa-del-sur/sellado-de-techo` | HTTP 404 | **no** |
| `san-german/colinas-del-rio/limpieza` | HTTP 404 | **no** |
| `san-juan/caimito/limpieza` | HTTP 404 | **no** |
| `san-juan/caimito/sellado-de-techo` | HTTP 404 | **no** |
| `san-juan/puerto-nuevo/limpieza` | HTTP 404 | **no** |
| `san-juan/puerto-nuevo/sellado-de-techo` | HTTP 404 | **no** |
| `san-juan/rio-piedras-pueblo/limpieza` | HTTP 404 | **no** |
| `san-juan/rio-piedras-pueblo/sellado-de-techo` | HTTP 404 | **no** |
| `san-juan/san-juan-antiguo/limpieza` | HTTP 404 | **no** |
| `san-juan/san-juan-antiguo/sellado-de-techo` | HTTP 404 | **no** |
| `san-juan/university-gardens/limpieza` | HTTP 404 | **no** |
| `san-juan/university-gardens/sellado-de-techo` | HTTP 404 | **no** |
| `san-juan/villas-del-senorial/limpieza` | HTTP 404 | **no** |
| `san-juan/villas-del-senorial/sellado-de-techo` | HTTP 404 | **no** |
| `san-lorenzo/ciudad-masso/limpieza` | HTTP 404 | **no** |
| `san-lorenzo/ciudad-masso/sellado-de-techo` | HTTP 404 | **no** |
| `san-lorenzo/jardines-de-san-lorenzo/limpieza` | HTTP 404 | **no** |
| `san-lorenzo/jardines-de-san-lorenzo/sellado-de-techo` | HTTP 404 | **no** |
| `san-lorenzo/portal-del-sol/limpieza` | HTTP 404 | **no** |
| `san-lorenzo/portal-del-sol/sellado-de-techo` | HTTP 404 | **no** |
| `san-lorenzo/savannah-real/limpieza` | HTTP 404 | **no** |
| `san-lorenzo/savannah-real/sellado-de-techo` | HTTP 404 | **no** |
| `san-sebastian/hacienda-san-andres/limpieza` | HTTP 404 | **no** |
| `san-sebastian/san-sebastian-court/limpieza` | HTTP 404 | **no** |
| `san-sebastian/villa-rita/limpieza` | HTTP 404 | **no** |
| `san-sebastian/villa-rita/sellado-de-techo` | HTTP 404 | **no** |
| `santa-isabel/brisas-del-prado/limpieza` | HTTP 404 | **no** |
| `santa-isabel/brisas-del-prado/sellado-de-techo` | HTTP 404 | **no** |
| `santa-isabel/playita-cortada/limpieza` | HTTP 404 | **no** |
| `santa-isabel/portal-de-la-reina/limpieza` | HTTP 404 | **no** |
| `santa-isabel/portal-de-la-reina/sellado-de-techo` | HTTP 404 | **no** |
| `santa-isabel/prados-del-sonador/limpieza` | HTTP 404 | **no** |
| `santa-isabel/prados-del-sonador/sellado-de-techo` | HTTP 404 | **no** |
| `santa-isabel/san-miguel/limpieza` | HTTP 404 | **no** |
| `santa-isabel/san-miguel/sellado-de-techo` | HTTP 404 | **no** |
| `santa-isabel/villa-mar/limpieza` | HTTP 404 | **no** |
| `santa-isabel/villa-mar/sellado-de-techo` | HTTP 404 | **no** |
| `santa-isabel/villa-serena/limpieza` | HTTP 404 | **no** |
| `santa-isabel/villa-serena/sellado-de-techo` | HTTP 404 | **no** |
| `toa-alta/haciendas-del-caribe/limpieza` | HTTP 404 | **no** |
| `toa-alta/haciendas-del-caribe/sellado-de-techo` | HTTP 404 | **no** |
| `toa-alta/mansiones-de-montecasino-ii/limpieza` | HTTP 404 | **no** |
| `toa-alta/mansiones-de-montecasino-ii/sellado-de-techo` | HTTP 404 | **no** |
| `toa-alta/monte-verde/limpieza` | HTTP 404 | **no** |
| `toa-alta/monte-verde/sellado-de-techo` | HTTP 404 | **no** |
| `toa-alta/palacios-de-versalles/limpieza` | HTTP 404 | **no** |
| `toa-alta/palacios-de-versalles/sellado-de-techo` | HTTP 404 | **no** |
| `toa-alta/vistas-de-montecasino/limpieza` | HTTP 404 | **no** |
| `toa-alta/vistas-de-montecasino/sellado-de-techo` | HTTP 404 | **no** |
| `toa-baja/camino-del-mar/limpieza` | HTTP 404 | **no** |
| `toa-baja/candelaria-arenas/limpieza` | HTTP 404 | **no** |
| `toa-baja/candelaria-arenas/sellado-de-techo` | HTTP 404 | **no** |
| `toa-baja/el-atlantico/limpieza` | HTTP 404 | **no** |
| `toa-baja/el-atlantico/sellado-de-techo` | HTTP 404 | **no** |
| `toa-baja/lago-vista/limpieza` | HTTP 404 | **no** |
| `toa-baja/lago-vista/sellado-de-techo` | HTTP 404 | **no** |
| `utuado/comunidad-rural-el-guano/limpieza` | HTTP 404 | **no** |
| `vega-baja/brisas-tortuguero/limpieza` | HTTP 404 | **no** |
| `yabucoa/urbanizacion-mendez/limpieza` | HTTP 404 | **no** |

## HTTP 200 con página de relleno (6)

| Ruta | Estado | ¿Funnel en GHL? |
|---|---|---|
| `quebradillas/santa-marina/sellado-de-techo` | 200 · sirve otra comunidad | **no** |
| `san-juan/monte-verde-real/limpieza` | 200 · sirve otra comunidad | **no** |
| `santa-isabel/playita-cortada/sellado-de-techo` | 200 · sirve otra comunidad | **no** |
| `utuado/comunidad-rural-el-guano/sellado-de-techo` | 200 · sirve otra comunidad | **no** |
| `vieques/jardines-de-vieques/limpieza` | 200 · sirve otra comunidad | **no** |
| `yauco/santa-catalina/limpieza` | 200 · sirve otra comunidad | **no** |

## Qué falta en GHL para publicarlas

- **Sin funnel (95)**: crear el
  funnel `Comunidad · <Comunidad> (<Municipio>) · Limpieza|Techos` con la ruta
  `/<municipio>/<comunidad>(-limpieza|-techos)` y publicar la página.
- **Con funnel (0)**: el funnel
  existe pero su página no está publicada o no resuelve en esa ruta; hay que republicarla.

El PIT actual de GHL funciona (7 nov: `funnels/funnel/list` → HTTP 200, 1.027+ funnels), así que
publicarlas por API es viable sin renovar credenciales. No se hizo aquí porque este pase no incluía
escrituras en GHL.
