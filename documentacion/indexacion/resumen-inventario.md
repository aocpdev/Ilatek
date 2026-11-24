# Resumen del inventario — Fase 0

Generado 2026-11-07T00:50:46.046Z desde **2 sitemaps en vivo** (sin copias locales).

**Alcance fijado por el propietario:** solo `ilatekpr.com/<servicio>` y
`comunidades.ilatekpr.com/<municipio>/<comunidad>/(limpieza|sellado-de-techo)`.

> **Fuente de comunidades:** el `sitemap.xml` live de `comunidades.ilatekpr.com` responde 200 con un
> `<urlset>` **vacío**. La lista se tomó del sitemap generado en el repo
> (`Ilatek/Comunidades/landings/sitemap.xml`) y **cada URL se verificó en vivo** igualmente.

## Totales

| Dato | Valor |
|---|---|
| URLs listadas en los sitemaps del alcance | **1172** |
| **URLs válidas a indexar** | **1055** |
| · servicios (`ilatekpr.com`) | 38 |
| · comunidades | 1017 |
| Descartes técnicos (404, canonical, noindex, duplicados) | **106** |
| Excluidas por alcance | **11** |

## Descartes técnicos por motivo

- **89** — HTTP 404
- **6** — sin canonical (página de relleno de GHL)
- **6** — duplicado de GHL (sufijo numérico)
- **3** — duplicado de GHL (home-NNNNNN)
- **1** — página 404
- **1** — página de agradecimiento

## Excluidas por alcance

- **11** — fuera de alcance (no es un servicio)

Fuera del inventario por instrucción expresa: **blog** (no publicado: `/blog`, `/blog/sitemap.xml`, `/sitemap-blog.xml` responden 404) y los **78 subdominios municipales** (canonical apunta a `ilatekpr.com/<ruta>`, así que Google no los trataría como páginas propias).

## Por host

| Host | Tipo | Listadas | Válidas | Descartadas | Motivos |
|---|---|---|---|---|---|
| `ilatekpr.com` | servicio | 60 | 38 | 11 | duplicado de GHL (sufijo numérico) (6) · duplicado de GHL (home-NNNNNN) (3) · página de agradecimiento (1) · página 404 (1) |
| `comunidades.ilatekpr.com` | comunidad | 1112 | 1017 | 95 | HTTP 404 (89) · sin canonical (página de relleno de GHL) (6) |

## Servicios incluidos (38)

- `/limpieza-residencial`
- `/limpieza-comercial`
- `/limpieza-industrial`
- `/limpieza-estandar`
- `/limpieza-profunda`
- `/limpieza-de-mudanza`
- `/airbnb-turnover`
- `/post-construccion`
- `/ventanas`
- `/lavado-a-presion`
- `/alfombras`
- `/electrodomesticos`
- `/organizacion`
- `/canaletas-y-bajantes`
- `/empozamiento-de-techos`
- `/impermeabilizacion-de-techos`
- `/inspeccion-de-techos`
- `/lavado-a-presion-techos`
- `/limpieza-de-techos-y-canaletas`
- `/mantenimiento-de-techos`
- `/membrana-asfaltica`
- `/recubrimiento-elastomerico`
- `/reparacion-de-filtraciones`
- `/reparacion-de-techos`
- `/reparacion-post-huracan`
- `/sellado-de-poliuretano`
- `/sellado-de-silicona`
- `/sellado-de-techos`
- `/sellado-de-techos-comercial`
- `/sellado-de-techos-industrial`
- `/sellado-de-techos-residencial`
- `/techos-de-asfalto`
- `/techos-de-concreto`
- `/techos-de-madera`
- `/techos-de-teja`
- `/techos-de-zinc`
- `/techos-planos`
- `/tragaluces`

## Salida

`inventario-urls.json`: 1055 entradas válidas con `url`, `host`, `tipo`, `http`,
`canonical`; 106 descartes técnicos y 11 exclusiones de alcance,
cada una con su motivo.
