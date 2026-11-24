# Canonical de los 78 subdominios municipales

Medido 2026-11-06T15:07:28.543Z · 312 páginas muestreadas (4/host).

| Estado | Páginas | Significado |
|---|---|---|
| self | 0 | canónica propia: se indexan por separado |
| cruzado | 234 | canónica = misma ruta en ilatekpr.com: se consolidan |
| home | 78 | canónica = https://ilatekpr.com: apuntan al home sin serlo |
| otra | 0 | otro destino |
| sin | 0 | no declara canonical |

Hosts con al menos una página mal: **78/78**

## Qué hay que escribir

`canonical-municipios-fix.json` trae, por página, la `canonicalEsperada`: exactamente la URL
de esa página en su subdominio. Es el valor que debe quedar en el campo Canonical del panel SEO
de cada página en GHL (el mismo que se usó en las comunidades con `marcar-canonical.py`).

## Cómo verificar después

Volver a correr este script: el criterio de aceptación es `self` en el 100 % de la muestra.
