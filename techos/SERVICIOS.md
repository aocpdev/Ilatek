# Ilatek Techos — Servicios y enlaces de sus landing pages

**34 páginas:** 1 hub + 5 madres + 28 hijas. Cada enlace es el **canonical real** declarado por la página y la sitemap: `https://ilatekpr.com/<slug>`.

**Fuente del host:** `build-techos.mjs:46` genera `<link rel="canonical" href="https://ilatekpr.com/${p.slug}">`; `build-techos.mjs:53` genera `<loc>https://ilatekpr.com/${p.slug}</loc>`. Confirmado 1:1 contra `ghl-techos-head-seo.html` (34 canonicals) y `techos-sitemap-fragment.xml` (34 `<loc>`). Host = **https://ilatekpr.com** (sin prefijo de ruta).

**Verificación:** las 34 filas se contrastaron 1:1 contra las landings construidas (`ghl-<slug>-landing.html`), el canonical declarado en `ghl-techos-head-seo.html` (34 `<link rel="canonical">`) y las 34 entradas `<loc>` de `techos-sitemap-fragment.xml`. Resultado: 34/34 filas, 0 huecos, 0 extras, 0 URLs inventadas.

---

## Hub (0.9)

| Servicio (título SEO) | Enlace |
|---|---|
| Reparación y Sellado de Techos en Puerto Rico | https://ilatekpr.com/techos |

## Madre · Reparación de techos (0.8)

| Servicio (título SEO) | Enlace |
|---|---|
| Reparación de Techos en Puerto Rico | https://ilatekpr.com/reparacion-de-techos |

**Hijas:**

| Servicio (título SEO) | Enlace |
|---|---|
| Reparación de Goteras en Puerto Rico | https://ilatekpr.com/reparacion-de-goteras |
| Reparación de Filtraciones de Agua en Techos | https://ilatekpr.com/reparacion-de-filtraciones |
| Reparación de Grietas en Techos de Concreto | https://ilatekpr.com/reparacion-de-grietas-techos |
| Empozamiento de Agua en Techos | https://ilatekpr.com/empozamiento-de-techos |
| Oxidación y Varillas Expuestas en Techos | https://ilatekpr.com/oxidacion-de-techos |
| Reparación de Techos Post-Huracán | https://ilatekpr.com/reparacion-post-huracan |

## Madre · Sellado de techos (0.8)

| Servicio (título SEO) | Enlace |
|---|---|
| Sellado de Techos en Puerto Rico | https://ilatekpr.com/sellado-de-techos |

**Hijas:**

| Servicio (título SEO) | Enlace |
|---|---|
| Sellado de Silicona 100% para Techos | https://ilatekpr.com/sellado-de-silicona |
| Membrana Asfáltica para Techos | https://ilatekpr.com/membrana-asfaltica |
| Recubrimiento Elastomérico para Techos | https://ilatekpr.com/recubrimiento-elastomerico |
| Sellado de Poliuretano para Techos | https://ilatekpr.com/sellado-de-poliuretano |
| Sellado Acrílico para Techos | https://ilatekpr.com/sellado-acrilico |

## Madre · Impermeabilización (0.8)

| Servicio (título SEO) | Enlace |
|---|---|
| Impermeabilización de Techos en Puerto Rico | https://ilatekpr.com/impermeabilizacion-de-techos |

**Hijas:**

| Servicio (título SEO) | Enlace |
|---|---|
| Reparación de Techos de Concreto (Losas) | https://ilatekpr.com/techos-de-concreto |
| Impermeabilización de Techos Planos (EPDM, TPO) | https://ilatekpr.com/techos-planos |
| Reparación de Techos de Zinc y Metal | https://ilatekpr.com/techos-de-zinc |
| Reparación de Techos de Asfalto (Shingles) | https://ilatekpr.com/techos-de-asfalto |
| Reparación de Techos de Teja | https://ilatekpr.com/techos-de-teja |
| Sellado y Protección de Techos de Madera | https://ilatekpr.com/techos-de-madera |

## Madre · Por segmento (0.8)

| Servicio (título SEO) | Enlace |
|---|---|
| Sellado de Techos Residencial, Comercial e Industrial | https://ilatekpr.com/techos-por-segmento |

**Hijas:**

| Servicio (título SEO) | Enlace |
|---|---|
| Sellado de Techos Residencial en Puerto Rico | https://ilatekpr.com/sellado-de-techos-residencial |
| Sellado de Techos Comercial en Puerto Rico | https://ilatekpr.com/sellado-de-techos-comercial |
| Sellado de Techos Industrial en Puerto Rico | https://ilatekpr.com/sellado-de-techos-industrial |

## Madre · Inspección y mantenimiento (0.8)

| Servicio (título SEO) | Enlace |
|---|---|
| Inspección y Mantenimiento de Techos | https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos |

**Hijas:**

| Servicio (título SEO) | Enlace |
|---|---|
| Inspección de Techos Gratis en Puerto Rico | https://ilatekpr.com/inspeccion-de-techos |
| Mantenimiento Preventivo de Techos | https://ilatekpr.com/mantenimiento-de-techos |
| Limpieza de Techos y Canaletas | https://ilatekpr.com/limpieza-de-techos-y-canaletas |
| Canaletas y Bajantes para Techos | https://ilatekpr.com/canaletas-y-bajantes |
| Lavado a Presión de Techos | https://ilatekpr.com/lavado-a-presion-techos |
| Tragaluces y Skylights para Techos | https://ilatekpr.com/tragaluces |
| Instalación y Reemplazo de Techos | https://ilatekpr.com/instalacion-y-reemplazo-de-techos |

---

**Cobertura:** 34/34 (1 hub + 5 madres + 28 hijas). Sin huecos, sin extras, sin URLs inventadas — verificado 1:1 contra `buildTree()` y la sitemap.
