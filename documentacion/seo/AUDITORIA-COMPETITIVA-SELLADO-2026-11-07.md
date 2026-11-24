# Auditoría SEO competitiva — “sellado de techos en Puerto Rico”

**Cliente:** Ilatek Property Solution / Ilatek Techos
**Fecha de medición:** 7 de noviembre de 2026
**Alcance:** código del sitio (2954 archivos HTML), landings de techos, blog, landings de comunidades, sitemap/robots/llms, y SERP real de Google para las dos consultas objetivo.
**Modo:** auditoría y arquitectura. **No se modificó contenido publicado ni se hizo push.**

---

## 0. Actualización de medición (misma fecha, posterior al borrador)

La página money y el registro de hechos cambiaron después de la primera pasada. Estas son las cifras vigentes y sustituyen a las de §1, §4.2 y §4.3 cuando difieran:

| Elemento | Borrador inicial | Medición vigente |
|---|---|---|
| `/sellado-de-techos` · palabras | 2,009 | **2,436** |
| `/sellado-de-techos` · H2 | 19 | **20** |
| `/sellado-de-techos` · tablas | 0 | **1** (5 sistemas × precio, duración y mejor uso) |
| `/sellado-de-techos` · FAQ visibles | 7 | **8** |
| `/sellado-de-techos` · enlaces internos | 128 | **122** con token de Custom Value |
| Cifras de precio en texto visible | 0 | **19** |
| `sitemap.xml` | 60 URLs con duplicados | **48 URLs, 0 duplicados legacy** |
| `/garantia` y `/resenas` canonical | apuntaban a la home | **autocanonicalizan** |
| Registro de hechos | 34 entradas con `horario` duplicado | **33 hechos únicos: 23 verificados, 9 pendientes, 1 conflicto** |

**Hallazgos de §4.2 que quedan cerrados:** #2 (duplicados del sitemap), #3 (canónicas de confianza), #4 (sin precio visible) y #7 (sin tabla comparativa de sistemas).

**Hallazgos que siguen abiertos:** blog 404 (#1), sin facts de confianza (#5), `llms.txt` sin blog (#8), sitemap sin blog ni comunidades (#9), landings de comunidad delgadas (#10), anchors sobre-optimizados (#11) y home sin enlace al blog (#12).

---

## 1. Resumen ejecutivo

1. Ilatek **no aparece en la primera página** de Google para `sellado de techos en Puerto Rico` ni para `sellado de techo en Puerto Rico` (SERP medido desde Puerto Rico, `hl=es`, `gl=pr`).
2. Los tres dominios más fuertes hoy son **WindMar Home**, **Sellado de Techo La Familia** y, alternando el primer lugar, **Star Roofing Corporation** (plural) y **Tu Techo Sellado** (singular).
3. La ventaja de ellos no es “más keywords”: es que **contestan la pregunta comercial completa** (precio por pie², duración por sistema, tabla comparativa, garantía, permisos, seguros, cómo escoger contratista) y lo hacen con **facts verificables**.
4. El **AI Overview de Google cita a WindMar** y muestra precios de $1.80–$6.50/pie². La página de Ilatek **no publica ni un precio visible** en `/sellado-de-techos`; su FAQ de precio responde “depende” sin cifra. Esa sola brecha excluye a Ilatek de la capa de respuestas.
5. Ilatek tiene **mejor base técnica de la que aparenta**: 2,009 palabras, 19 H2, FAQPage con 7 preguntas, 128 enlaces internos y schema `RoofingContractor` + `Offer` + `OfferCatalog`. El problema es de **contenido publicable, hechos y jerarquía**, no de falta de HTML.
6. **El blog completo está caído en producción:** `https://ilatekpr.com/blog` devuelve **404**, igual que `sitemap-blog.xml`. Son **118 páginas** de contenido AEO ya escritas que Google no puede ver.
7. El **sitemap vivo tiene 60 URLs y duplicados heredados** (`/home-118878`, `/sellado-de-poliuretano-950943`, `/reparacion-de-filtraciones-160509`, etc.). No incluye el blog ni el subdominio de comunidades.
8. Las páginas de confianza **`/garantia` y `/resenas` canonicalizan a la home**, no a sí mismas. Eso desperdicia las dos páginas que más peso E-E-A-T podrían aportar.
9. En **2,954 archivos HTML no hay una sola mención de DACO**, licencia, póliza de responsabilidad ni años de operación. Star Roofing y La Familia usan exactamente esos datos como palanca de confianza.
10. El layer programático existe (78 municipios, 564 comunidades, 1,112 archivos HTML), pero la muestra auditada tiene **406 palabras y 1 solo enlace** al servicio principal. Publicarlo masivamente así sería un riesgo de “doorway pages”.

---

## 2. Metodología y evidencia

### Consultas medidas

| Consulta | Ubicación | Fecha | Resultado |
|---|---|---|---|
| `sellado de techos en puerto rico` | Puerto Rico | 2026-11-07 | Top 3 orgánico: Star Roofing, WindMar, La Familia |
| `sellado de techo en puerto rico` | Puerto Rico | 2026-11-07 | Top 3 orgánico: Tu Techo Sellado, WindMar, La Familia |

### Orden orgánico observado (sin anuncios, sin pack local)

**“sellado de techos en puerto rico”**

1. `starroofingcorp.com` — Star Roofing Corporation
2. `windmar.com/products/roofing` — WindMar Home
3. `selladodetecholafamilia.com` — Sellado de Techo La Familia
4. `tutechosellado.com`
5. `forroofingpr.com`
6. Reddit r/PuertoRico
7. `caribecoatings.com`

**“sellado de techo en puerto rico”**

1. `tutechosellado.com`
2. `windmar.com/products/roofing` — WindMar Home
3. `selladodetecholafamilia.com`
4. `starroofingcorp.com`
5. `forroofingpr.com`
6. `danosapr.com` (blog)
7. Reddit r/PuertoRico

**Conclusión de ranking:** los dos puestos estables son **WindMar (#2)** y **La Familia (#3)**. El #1 rota entre **Star Roofing** y **Tu Techo Sellado** según plural/singular. Esas son las tres marcas a superar; Tu Techo Sellado es la cuarta y el competidor directo del singular.

### Anuncios y pack local (contexto)

- Anuncios: `remodelacionesperezllc.com` y `superiorroofingpr.com`. No son ranking orgánico, pero capturan clics y refuerzan la sensación de “todos menos Ilatek”.
- Pack local: IS Pro Services, L&M Roofing, Sellado De Techo En Puerto Rico. Ilatek no aparece en el pack para estas consultas.

### Caveats

- El SERP está personalizado por la cuenta y la ubicación del navegador. Los puestos pueden variar ±1–2 y por dispositivo.
- No se usó Search Console (no hay acceso en este entorno). Las conclusiones de indexación se basan en `site:`, sitemap vivo y HTML servido.
- Los datos de competidores son los que sus páginas publican; no se verificaron licencias ni certificaciones con el fabricante o DACO.

---

## 3. Las tres páginas más poderosas: teardown con facts

### 3.1 WindMar Home — el benchmark real

**URL:** `https://windmar.com/sellado-techos` (y `windmar.com/products/roofing`)
**Title:** “Sellado de Techos en Puerto Rico — WindMar Roofing | +8,000 Techos Sellados, 24 Años, Silicona Gardner-Gibson” (109 caracteres)
**H1:** “Sellado de techos en Puerto Rico: la guía por municipio que aguanta huracán.”

| Métrica | Dato |
|---|---|
| Palabras | 3,895 |
| H2 | 15 |
| FAQs visibles | 10 |
| Enlaces internos | 127 |
| Tablas comparativas | 3 |
| Schema | `Organization`, `Article`, `FAQPage`, `HowTo`, `ItemList`, `MonetaryAmount`, `BreadcrumbList`, `NewsArticle` |
| Precio en página | $3.50–$6.50/pie²; 1,200 pie² = $4,200–$7,800 |
| Cobertura | 78 municipios con página propia |

**Facts que usa como palanca:**

- 24 años operando en PR desde 2002; sobrevivió María (2017), Fiona (2022) y Ernesto (2024).
- +8,000 techos sellados; brigadas propias (no subcontratistas); certificación Gardner-Gibson.
- Garantía limitada de por vida en material + 1 a 10 años de mano de obra según plan.
- Planes Silver / Gold / Platinum; financiamiento Oriental Bank o WindMar Financial.
- 4.9★ con 127 reseñas; prensa en WAPA TV, El Nuevo Día y Primera Hora.
- “Nielsen #1” en awareness de categoría (claim de marca, no verificable desde la página).

**Tipos de contenido que le ganan el SERP:**

1. **Guía por municipio** con población, comunidades servidas y clima local (18 + 10 + 8 + 1 + 14 + 13 + 14 municipios).
2. **Tabla silicona vs acrílico vs pintura** con vida útil, UV, agua estancada, reflectancia ASTM E903 y costo total a 20 años.
3. **Tabla de sistemas** (silicona vs acrílico vs membrana asfáltica) con duración, resistencia, reflectividad, garantía y costo relativo.
4. **Guía del comprador** con 6 criterios verificables para escoger techero.
5. **Glosario técnico** de 12 términos (silicona 100%, Gardner-Gibson, Cool Roof, brigada propia, planes, etc.).
6. **FAQ de 10 preguntas** que cubren precio, mejor sellador, duración, cuándo sellar, permisos, cobertura, garantía, cómo escoger, FEMA/seguro y tiempo de obra.
7. **Prueba social**: prensa, reseñas, cifras de operación y marca del fabricante.

**Por qué esto funciona (hipótesis sustentada en evidencia):** cubre la intención completa del embudo —informarse, comparar, cotizar— y da a Google respuestas extraíbles en formato tabla/FAQ. El AI Overview toma sus precios porque es la página que mejor los estructura, no porque tenga más enlaces.

---

### 3.2 Star Roofing Corporation — #1 en plural

**URL:** `https://starroofingcorp.com`
**Title:** “Star Roofing Corporation | Limpieza y sellado de techos Puerto Rico”
**H1:** “Bienvenido A Star Roofing Corporation”

| Métrica | Dato |
|---|---|
| Palabras | 921 |
| H2 | 7 |
| FAQs visibles | 7 |
| FAQ schema | **No** |
| Enlaces internos | 7 |
| Schema | `Organization`, `WebPage`, `BreadcrumbList`, `SearchAction` |

**Facts que usa:**

- +30 años de experiencia.
- Dirección física en San Juan (1651 Ave. Américo Miranda, Urb. Las Lomas).
- Tres teléfonos, incluido uno de emergencia; WhatsApp; horario lunes–sábado 7:00–4:00.
- DACO y CFSE; póliza de responsabilidad pública de **$1 millón**.
- Garantía de hasta **10 años**; estimados gratis; “igualamos o mejoramos cualquier oferta”.
- Clientes comerciales con logo: CEM College, ESCO, Museo de Arte de Puerto Rico.
- Sistemas: membrana asfáltica 4 mm polyester, Built-Up Roofing, Danosa con lámina de aluminio, uretano con pintura elastomérica.

**Lectura:** es una página **delgada** (921 palabras) que rankea por **entidad local + confianza + intención exacta**, no por profundidad. Su ventaja es el ecosistema: dominio con marca, dirección, licencia, seguro, reseñas y pack local. Ilatek puede superarla en contenido, pero **no puede ignorar los facts de confianza**.

---

### 3.3 Sellado de Techo La Familia — #3 estable

**URL:** `https://selladodetecholafamilia.com`
**Title:** “Sellado de techo la familia - Puerto Rico”
**H1:** “La mejor alternativa para el sellado de tu techo.”

| Métrica | Dato |
|---|---|
| Palabras | 486 |
| H2 | 10 (varios repetidos: visión y misión dos veces) |
| FAQs | 0 |
| Schema | `Organization`, `WebPage`, `BreadcrumbList`, sin `FAQPage` |
| Enlaces internos | 19 |

**Facts que usa:**

- 24 años de experiencia.
- Certificados por **Danosa** y **DACO #144779**.
- Dos áreas de servicio: Oeste (Mayagüez, 787-237-7454) y Metro (939-219-5605).
- Cuatro testimonios con nombre.
- Servicios: comercial, industrial, residencial; madera, zinc, cemento; filtraciones, humedad, grietas.

**Lectura:** contenido muy delgado, pero **marca + licencia + certificación + reseñas + cobertura**. Es el competidor más fácil de superar en profundidad y el más difícil de superar en señales de confianza si Ilatek no publica sus propias credenciales.

---

### 3.4 Tu Techo Sellado — #1 en singular

**URL:** `https://tutechosellado.com/servicios/sellado-de-techos`
**Title/H1:** coincidencia exacta con “Sellado de techos en Puerto Rico”.

| Métrica | Dato |
|---|---|
| Palabras | 567 |
| H2 | 2 |
| FAQs | 0 |
| Enlaces internos | 40 |
| Schema | `Article`, `Person`, `Organization` |

**Facts:** Danosa, acrílico y silicón; teléfono visible; cotización. Página delgada con **title/H1 exactos y buena arquitectura de enlaces internos** (40). Es la prueba de que en esta categoría el **match de intención** pesa más que la extensión.

---

## 4. Diagnóstico de Ilatek

### 4.1 Lo que ya está bien

| Activo | Evidencia |
|---|---|
| Página money con profundidad | `/sellado-de-techos`: 2,009 palabras, 19 H2 |
| FAQ con schema | 7 preguntas + `FAQPage` |
| Schema de negocio | `RoofingContractor`, `Service`, `Offer`, `OfferCatalog`, `PriceSpecification`, `OpeningHoursSpecification` |
| Enlaces internos | 128 en la página; 1,081 anchors a `/sellado-de-techos` en el repo |
| Arquitectura de servicios | 37 páginas de servicios, 10 de techos |
| Precios ya definidos en el sitio | $2.50/pie² sellado, $3.00 impermeabilización, $3.50 silicona; rango publicado $2.00–$6.00/pie² |
| Cotizador y depósito | Cotizador online; $50 descontable |
| Cobertura | 78 municipios |
| Blog escrito | 118 páginas con clusters de precio, materiales, proceso, garantía, clima y sustratos |
| Comunidades | 564 registros, 78 municipios, 1,112 archivos HTML |

### 4.2 Errores críticos (corregir antes de escribir una sola landing nueva)

| # | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| 1 | **Blog 404 en producción** | `curl https://ilatekpr.com/blog` → 404; `sitemap-blog.xml` → 404 | 118 páginas AEO invisibles; se pierde todo el cluster informativo |
| 2 | **Sitemap con duplicados heredados** | 60 URLs; `/home-118878`, `/home-698854`, `/home-639221`, `/sellado-de-poliuretano-950943`, `/reparacion-de-filtraciones-160509`, `/inspeccion-de-techos-915832-237684` | Crawl desperdiciado y señales duplicadas; las URLs viejas devuelven 200 |
| 3 | **`/garantia` y `/resenas` canonicalizan a la home** | HTML servido: `canonical=https://ilatekpr.com` | Las páginas de confianza no compiten como entidades propias |
| 4 | **Sin precios visibles en la página money** | FAQ: “El precio depende…”; no hay cifra en `/sellado-de-techos` | Google no puede citar a Ilatek en el AI Overview de precio |
| 5 | **Sin facts de confianza** | 0 menciones de DACO en 2,954 HTML; sin años, licencia, seguro, certificaciones ni conteo de reseñas | Pierde contra Star Roofing y La Familia en E-E-A-T |
| 6 | **Contradicción de duración** | H1 de `/sellado-de-silicona`: “dura 5 años o más”; cuerpo y schema: “20 a 25 años” | Debilita la credibilidad y la extracción de facts |
| 7 | **Sin tabla comparativa** | 5 sistemas en tarjetas, sin criterios ni duración/costo lado a lado | No compite por la respuesta comparativa |
| 8 | **`llms.txt` desactualizado** | Solo lista limpieza con precios; techos en 4 bullets; sin blog, FAQ ni comunidades | Los asistentes reciben una versión incompleta de Ilatek |
| 9 | **Sitemap sin blog ni comunidades** | 0 URLs de `/blog` o `comunidades.` | El layer programático no se descubre desde el sitemap |
| 10 | **Landings de comunidad delgadas** | Muestra: 406 palabras, 1 enlace a `/sellado-de-techos` | Riesgo de páginas de puerta si se publican en masa |
| 11 | **Anchors sobre-optimizados** | 166 + 120 + 119 anchors exactos “Sellado de techos en Puerto Rico” | Perfil poco natural; dilución y riesgo de sobreoptimización |
| 12 | **La home no enlaza al blog** | 0 enlaces a `/blog` desde home, `/servicios` y `/techos` | El cluster informativo queda huérfano aunque se publique |

### 4.3 Comparativa de páginas (medición directa)

| Página | Palabras | H2 | FAQ schema | Enlaces internos | Precio visible | Tablas | Schema principal |
|---|---:|---:|---:|---:|---|---:|---|
| **Ilatek** `/sellado-de-techos` | 2,009 | 19 | 7 | 128 | **No** | 0 | RoofingContractor + Offer + FAQPage |
| **WindMar** | 3,895 | 15 | 10 | 127 | **Sí** | 3 | Article + FAQPage + HowTo + ItemList |
| **Star Roofing** | 921 | 7 | 0 | 7 | No | 0 | Organization + WebPage |
| **La Familia** | 486 | 10 | 0 | 19 | No | 0 | Organization + WebPage |
| **Tu Techo Sellado** | 567 | 2 | 0 | 40 | No | 0 | Article + Person |

**Lectura:** Ilatek ya tiene más profundidad y mejor schema que dos de los tres que le ganan. Lo que no tiene es **la respuesta comercial en el primer scroll** ni **los facts de confianza**.

---

## 5. Matriz de preguntas: qué contestan ellos y qué contesta Ilatek

Ilatek contesta **7** preguntas en la página money. El cluster competitivo cubre **25+**. Estas son las que hay que cerrar:

| # | Pregunta | WindMar | Star | La Familia | Ilatek hoy | Módulo propuesto |
|---|---|---|---|---|---|---|
| 1 | ¿Cuánto cuesta sellar un techo por pie²? | ✅ | ❌ | ❌ | ⚠️ sin cifra | M2 |
| 2 | ¿Cuánto cuesta un techo de 1,200 pie²? | ✅ | ❌ | ❌ | ❌ | M4 |
| 3 | ¿Cuánto es solo mano de obra? | ✅ (blog) | ❌ | ❌ | ⚠️ blog 404 | M4 |
| 4 | ¿Por qué varía el precio? | ✅ | ⚠️ | ❌ | ✅ | M4 |
| 5 | ¿Cuál es el mejor sellador para PR? | ✅ | ⚠️ | ❌ | ⚠️ | M3 |
| 6 | Silicona vs acrílico vs membrana | ✅ | ❌ | ❌ | ⚠️ tarjetas | M3 |
| 7 | ¿Cuánto dura cada sistema? | ✅ | ❌ | ❌ | ⚠️ contradictorio | M3 |
| 8 | ¿Se puede sellar sobre sellado viejo? | ✅ (blog) | ❌ | ❌ | ❌ | M11 |
| 9 | ¿Se puede sellar con filtración activa? | ✅ (blog) | ❌ | ❌ | ✅ | M11 |
| 10 | ¿Se puede sellar mojado o en lluvia? | ✅ (blog) | ❌ | ❌ | ❌ | M11 |
| 11 | ¿Cuánto tarda la obra? | ✅ | ✅ | ⚠️ | ❌ | M8 |
| 12 | ¿Qué garantía dan y qué cubre? | ✅ | ✅ | ❌ | ⚠️ sin años | M5 |
| 13 | ¿Necesito permiso del municipio/OGPe? | ✅ | ❌ | ❌ | ❌ | M6 |
| 14 | ¿FEMA o el seguro cubre el sellado? | ✅ | ❌ | ❌ | ❌ | M6 |
| 15 | ¿Cómo escojo un techero confiable? | ✅ | ⚠️ | ❌ | ❌ | M7 |
| 16 | ¿Qué licencia y seguro deben tener? | ⚠️ | ✅ | ✅ | ❌ | M7 |
| 17 | ¿Atienden mi municipio? | ✅ | ✅ | ✅ | ✅ | M10 |
| 18 | ¿Qué sistema va con mi tipo de techo? | ✅ | ⚠️ | ⚠️ | ✅ parcial | M9 |
| 19 | ¿Qué es agua estancada/empozamiento? | ✅ | ❌ | ❌ | ⚠️ | M11 |
| 20 | ¿Qué es Cool Roof y ahorra energía? | ✅ | ❌ | ❌ | ❌ | M11 |
| 21 | ¿Quién paga el sellado en un condominio? | ✅ (blog) | ❌ | ❌ | ⚠️ blog 404 | M11 |
| 22 | ¿Cuándo es la temporada de huracanes? | ✅ | ❌ | ❌ | ⚠️ | M11 |
| 23 | ¿Cada cuánto se da mantenimiento? | ✅ | ❌ | ❌ | ✅ | M5 |
| 24 | ¿Qué pasa si el sellado no dura un año? | ✅ (blog) | ❌ | ❌ | ⚠️ blog 404 | M5 |
| 25 | ¿Trabajan comercial/industrial? | ✅ | ✅ | ✅ | ✅ | M1 |

**Resultado:** Ilatek responde con cifras o criterios verificables **4 de 25**; el resto es vago, está en el blog caído o no existe.

---

## 6. Arquitectura propuesta: Landings / Embeds que responden y enlazan a Ilatek

### 6.1 Principio rector

Cada embed debe ser **una respuesta autosuficiente** que Google o un asistente pueda extraer sin contexto, con **un fact duro**, **una fuente** y **un enlace contextual** a la página de Ilatek que profundiza. No es “contenido para rellenar”: es la misma pregunta que el cliente le hace a Google, contestada mejor y con datos propios.

**Regla de oro:** si Ilatek no puede probar el dato, no se publica. Se marca como “por confirmar” en la ficha de hechos y no se usa en el embed.

### 6.2 Anatomía de un módulo (patrón repetible)

```html
<section class="ilt-answer" id="ilt-precio-2026">
  <p class="ilt-answer__eyebrow">Precio 2026 · Actualizado 7 nov 2026</p>
  <h2>¿Cuánto cuesta sellar un techo en Puerto Rico?</h2>

  <!-- Respuesta directa: 40–60 palabras, con cifra y unidad -->
  <p class="ilt-answer__lead">
    El sellado de techos en Puerto Rico cuesta entre <strong>$2.50 y $6.00 por pie²</strong>
    instalado, según el sistema. Un techo residencial de 1,200 pie² queda entre
    <strong>$3,000 y $7,200</strong>. La inspección es gratis y la cotización se entrega por escrito.
  </p>

  <!-- Tabla de apoyo: 3–6 filas, sin párrafos -->
  <table>…sistema · $/pie² · duración · mejor sustrato…</table>

  <!-- Fuente / criterio -->
  <p class="ilt-answer__source">
    Base: precios publicados por Ilatek Techos (nov 2026) para los 78 municipios.
    El estimado final depende de acceso, condición del techo y preparación.
  </p>

  <!-- Un solo enlace contextual, anchor descriptivo -->
  <p class="ilt-answer__cta">
    <a href="https://{{custom_values.website_url}}/cotizacion">
      Calcula el precio de tu techo en el cotizador
    </a>
  </p>
</section>
```

**Reglas técnicas del embed:**

- Un `<h2>` por módulo; el `<h1>` sigue siendo único en la página.
- La respuesta directa va **antes** de cualquier tabla o bullet.
- Máximo **60 palabras** en la respuesta; el resto es soporte.
- Un **solo** enlace contextual por módulo (no 10). El enlace va al final de la respuesta, como pide el brief.
- URL siempre `https://{{custom_values.website_url}}/ruta` (contrato de `AGENTS.md`).
- Sin `{{custom_values.*}}` en el subdominio de comunidades; ahí se usa `https://ilatekpr.com`.
- Nada de texto copiado de competidores. Los facts de terceros se citan (NOAA, ASTM, DACO, fabricante) y se enlazan.
- `dateModified` visible y real.

### 6.3 Los 12 módulos (orden de implementación)

| Módulo | Pregunta que responde | Formato | Enlace de salida | Prioridad |
|---|---|---|---|---|
| **M1 · Respuesta raíz** | ¿Qué es sellado de techos en PR y qué incluye? | 50 palabras + 3 bullets + cifras | `/sellado-de-techos` | P0 |
| **M2 · Precio por pie²** | ¿Cuánto cuesta por pie²? | Tabla 5 sistemas + rango | `/cotizacion` | P0 |
| **M3 · Comparativa de sistemas** | ¿Silicona, acrílico, membrana, elastomérico o poliuretano? | Tabla 5×8 criterios | `/sellado-de-techos` | P0 |
| **M4 · Costo por tamaño** | ¿Cuánto cuesta mi techo de 1,000–2,000 pie²? | Tabla por tamaño + supuestos | `/cotizacion` | P0 |
| **M5 · Garantía y mantenimiento** | ¿Qué cubre, cuántos años, cómo se reclama? | Definición + plazos + exclusiones | `/garantia` | P0 |
| **M6 · Permisos, seguro y FEMA** | ¿Necesito permiso? ¿Lo cubre el seguro? | 4 respuestas con fuente | `/contactanos` | P1 |
| **M7 · Cómo escoger techero** | ¿Qué debe tener un contratista serio? | Checklist 6 criterios verificables | `/organizacion` | P1 |
| **M8 · Proceso y tiempos** | ¿Cuánto tarda y qué pasa si llueve? | 5 pasos + días + curado | `/cotizacion` | P1 |
| **M9 · Matriz de sustratos** | ¿Qué sistema va con concreto, zinc, teja, madera, asfalto? | Tabla 6×3 | páginas de techo | P1 |
| **M10 · Cobertura y clima** | ¿Atienden mi municipio y qué reto tiene? | Lista por región + 3 perfiles climáticos | `/sellado-de-techos` | P2 |
| **M11 · FAQ hub (25 preguntas)** | Dudas de precio, materiales, proceso, ley, clima | 25 Q&A de 40–60 palabras | página profunda de cada respuesta | P1 |
| **M12 · Glosario + fuentes** | ¿Qué significa cada término? | 12 términos + fuente | `/blog` (cuando esté vivo) | P2 |

### 6.4 Copys listos para los 6 módulos P0

> **M1 — ¿Qué es el sellado de techos en Puerto Rico?**
> Es la restauración integral del techo: limpieza a presión, corrección de grietas y juntas, y aplicación de una membrana que lo protege del sol, la lluvia y la humedad. En Ilatek cubrimos los 78 municipios con cinco sistemas y cotización por escrito.
> **Enlace:** “Ver el proceso completo de sellado” → `/sellado-de-techos`

> **M2 — ¿Cuánto cuesta sellar un techo por pie²?**
> Entre **$2.50 y $6.00 por pie²** instalado en 2026, según el sistema: acrílico desde $2.50, impermeabilización desde $3.00, silicona 100% desde $3.50 y sistemas multicapa hasta $6.00. La inspección es gratis y el depósito de $50 se descuenta del total.
> **Enlace:** “Cotiza tu techo con medidas reales” → `/cotizacion`

> **M3 — ¿Cuál es el mejor sistema para mi techo?**
> No hay uno solo: la silicona 100% rinde 20–25 años y sella juntas y remates; la membrana asfáltica y el elastomérico rinden en losas y techos planos; el poliuretano es para techos con equipos y tránsito; el acrílico es para concreto poroso y presupuesto ajustado. La elección depende del sustrato, no de la marca.
> **Enlace:** “Compara los cinco sistemas” → `/sellado-de-techos`

> **M4 — ¿Cuánto cuesta un techo de 1,200 pie²?**
> A $2.50–$6.00 por pie², un techo de 1,200 pie² cuesta entre **$3,000 y $7,200** instalado. El rango se cierra tras la inspección: acceso, número de juntas, condición de la losa y preparación mueven el precio final.
> **Enlace:** “Calcula tu precio en 3 pasos” → `/cotizacion`

> **M5 — ¿Qué garantía tiene el sellado de Ilatek?**
> Ilatek entrega **garantía escrita de mano de obra** con materiales certificados. El plazo y las exclusiones se documentan antes de comenzar; no se promete “de por vida” sin respaldo del fabricante. [CONFIRMAR AÑOS Y COBERTURA ANTES DE PUBLICAR]
> **Enlace:** “Lee las condiciones de garantía” → `/garantia`

> **M6 — ¿Necesito permiso para sellar mi techo?**
> El mantenimiento y el sellado elastomérico no requieren permiso de construcción; el reemplazo estructural o el cambio de losa sí. Para seguro, FEMA no cubre mantenimiento preventivo, pero una póliza de propiedad puede cubrir daño documentado por evento climático. [VALIDAR CON OGPe/DACO ANTES DE PUBLICAR]
> **Enlace:** “Habla con un asesor” → `/contactanos`

> **Nota de compliance:** los corchetes son deliberados. No se publica un dato legal o de garantía sin validación del propietario y, si aplica, de un profesional legal.

### 6.5 Schema por módulo (sin duplicar)

| Módulo | Schema | Regla |
|---|---|---|
| M2, M4 | `Service` + `Offer` + `PriceSpecification` | Un `Offer` por rango; `priceCurrency: USD`, `unitText: "pie²"` |
| M3, M9 | `ItemList` de `Service` | Un `ListItem` por sistema/sustrato |
| M5, M6, M11 | `FAQPage` + `Question` + `Answer` | Solo si la Q&A es visible en la página; una sola `FAQPage` por URL |
| M8 | `HowTo` + `HowToStep` | Pasos reales, sin tiempos inventados |
| M10 | `Service` + `areaServed` | `AdministrativeArea` por municipio; no crear 78 `LocalBusiness` falsos |
| Todas | `BreadcrumbList` | Coherente con la URL canónica |

**Advertencia:** desde 2023 Google limita los rich results de `FAQPage` a sitios de gobierno y salud. El schema sigue siendo útil para comprensión y asistentes, pero **no prometas estrellas ni acordeones en Google**. El valor es AEO/GEO, no un snippet garantizado.

### 6.6 Dónde vive cada embed

- **Página money** `/sellado-de-techos`: M1, M2, M3, M4, M5, M8, M10, M11.
- **Páginas de sistema** (`/sellado-de-silicona`, `/membrana-asfaltica`, `/recubrimiento-elastomerico`, `/sellado-de-poliuretano`, `/sellado-acrilico`): M3 acotado a su sistema + M2 + M9.
- **Páginas de segmento** (`/sellado-de-techos-residencial`, `-comercial`, `-industrial`): M4 con supuestos del segmento + M5 + M8.
- **Páginas de sustrato** (`/techos-de-concreto`, `-zinc`, `-teja`, `-madera`, `-asfalto`, `/techos-planos`): M9 + M3.
- **Blog** (cuando esté publicado): M11 completo; cada respuesta enlaza a su página profunda.
- **Comunidades**: M10 con datos locales verificados; no replicar el mismo texto en 564 páginas.

---

## 7. Plan de enlaces internos

### 7.1 Estado actual

- **1,081** anchors a `/sellado-de-techos` en el repo.
- Home → money: **17** enlaces. `/servicios` → money: **8**. `/techos` → money: **13**.
- Blog index → money: **2**; el blog además está **404**.
- Comunidad (muestra) → money: **1**.
- Anchors exactos dominantes: “Sellado de Techos en Puerto Rico” (166), “Sellado de techos” (120), “Sellado de techos en Puerto Rico” (119).

### 7.2 Reglas propuestas

1. **Un solo hub:** `/sellado-de-techos`. Todo lo demás es satélite.
2. **Cada satélite enlaza al hub en el primer tercio** con anchor descriptivo y **al final** con CTA. Dos enlaces, no diez.
3. **El hub enlaza a los 10 satélites de techos** en la sección “Cinco maneras de sellar” y “Sellado para cada propiedad” (ya existe; ordenar por intención).
4. **Blog → hub:** enlace contextual en la introducción y en la respuesta de FAQ. El blog debe estar publicado y enlazado desde la home.
5. **Comunidad → hub:** mínimo 2 enlaces (texto + CTA) y datos locales únicos (perfil climático, tipo de vivienda, año de huracán). Sin datos únicos, `noindex`.
6. **Diversificar anchors:** alternar “sistema de sellado para losa”, “impermeabilizar el techo”, “sellador elastomérico”, “sellado con silicona”, “cotizar sellado”. Mantener el exacto solo en navegación y en 1–2 enlaces de contexto.
7. **Corregir canónicas:** `/garantia` y `/resenas` deben autoncanonicalizar; las URLs legacy deben salir del sitemap o redirigir 301.
8. **Sitemap único:** páginas principales + blog + índice de comunidades. Sin duplicados con sufijo numérico.
9. **`llms.txt`:** reescribir con el cluster de techos, precios, FAQ, blog y cobertura. Hoy describe a Ilatek como empresa de limpieza.

---

## 8. Fuente única de verdad (facts, no ideas)

Se creó `documentacion/seo/hechos-sellado-2026-11-07.json` con tres estados:

- **verificado:** dato con fuente en el repo o en el HTML público.
- **pendiente:** dato que Ilatek debe confirmar antes de publicarse.
- **conflicto:** dos páginas dicen cosas distintas.

**Regla de gobierno:** ningún embed, schema o meta description usa un dato `pendiente` o `conflicto`. El generador debe leer la ficha y fallar si falta un campo obligatorio. Esto es lo que evita que el SEO se convierta en una colección de afirmaciones inventadas.

### Datos que Ilatek debe confirmar esta semana

1. Año de fundación y años operando.
2. Número de licencia DACO y vigencia.
3. Póliza de responsabilidad pública (monto).
4. Certificaciones de fabricante (Danosa, Gardner-Gibson, Sika, Lanco, etc.).
5. Años exactos de garantía de mano de obra y qué cubre.
6. Número real de techos sellados y de reseñas (Google/otras).
7. Rango de precios oficial 2026 por sistema y por pie².
8. Si el sellado requiere permiso municipal/OGPe (validar con profesional).
9. Cobertura real por municipio y tiempo de respuesta.
10. Nombre y credenciales del responsable técnico (para el byline E-E-A-T).

---

## 9. Qué sí y qué no (límites claros)

### Permitido y recomendado

- Responder las mismas preguntas con **contenido original** y datos propios.
- Usar tablas de precios reales, comparativas de sistemas, FAQ, glosario y guías de compra.
- Citar fuentes públicas (NOAA, ASTM E903, DACO, OGPe, fabricantes) con enlace.
- Comparar **sistemas y criterios**, no difamar marcas.
- Mostrar licencia, seguro, certificaciones, reseñas verificables y casos reales.
- Publicar fechas de actualización y autoría.

### Prohibido o de alto riesgo

- Copiar párrafos, tablas o FAQ de WindMar, Star Roofing o La Familia.
- Inventar precios, años, licencias, certificaciones, reseñas o “+8,000 techos”.
- Crear 564 landings con el mismo texto y solo cambiar el pueblo (doorway pages).
- Usar `AggregateRating` o `Review` autoinfligido sin reseñas reales verificables.
- Ocultar texto, hacer cloaking o meter keywords en alt/title sin relación.
- Poner marcas de competidores en title tags, dominios o anuncios.
- Comprar enlaces o participar en esquemas de enlaces.
- Prometer posiciones o resultados (“#1 en Google”).

---

## 10. Roadmap 90 días y KPIs

### Semana 1 — desbloquear lo que ya existe

- [ ] Publicar el blog en `/blog` (o decidir su dominio) y verificar 200 en las 118 URLs.
- [ ] Añadir `/blog` al menú, al footer y a la home.
- [ ] Corregir el sitemap: quitar duplicados con sufijo, añadir blog e índice de comunidades.
- [ ] Autocanonicalizar `/garantia` y `/resenas`.
- [ ] Reescribir `llms.txt` con techos, precios, FAQ y cobertura.

### Semana 2 — cerrar la brecha de precio y confianza

- [ ] Confirmar los 10 facts pendientes.
- [ ] Publicar M2 + M4 (tabla de precio y costo por tamaño) en `/sellado-de-techos`.
- [ ] Publicar M5 (garantía) con años y exclusiones reales.
- [ ] Añadir bloque de confianza: DACO, seguro, certificaciones, años, reseñas.
- [ ] Corregir la contradicción “5 años” vs “20–25 años” en `/sellado-de-silicona`.

### Semana 3 — comparativa y proceso

- [ ] Publicar M3 (tabla 5×8) y M8 (proceso/tiempos).
- [ ] Publicar M6 y M7 con validación legal.
- [ ] Añadir `ItemList` y `HowTo` donde corresponda.
- [ ] Enlazar cada sistema y sustrato al hub con anchors naturales.

### Semana 4 — cobertura y AEO

- [ ] Publicar M9 y M10.
- [ ] Reescribir las landings de comunidad con datos locales únicos; `noindex` en las que no los tengan.
- [ ] Publicar M11 (25 FAQ) y enlazar cada respuesta a su página profunda.
- [ ] Auditar anchors: bajar el exacto a <40% del total.

### Mes 2 — escala controlada

- [ ] Replicar los módulos en las 37 páginas de servicios.
- [ ] Crear 8–10 páginas de municipio en el dominio principal (San Juan, Bayamón, Carolina, Caguas, Ponce, Mayagüez, Arecibo, Guaynabo) con clima, vivienda y casos.
- [ ] Actualizar Google Business Profile, reseñas y citaciones locales.
- [ ] Publicar 2 casos de estudio con fotos propias y datos verificables.

### Mes 3 — autoridad

- [ ] Digital PR local (prensa, colegios, administradores de condominios).
- [ ] Video “paso a paso” propio y schema `VideoObject`.
- [ ] Monitorizar citas en AI Overviews y asistentes.
- [ ] Revisión mensual de la ficha de hechos.

### KPIs (medir en Search Console, no en opiniones)

| KPI | Línea base 2026-11-07 | Meta 90 días |
|---|---|---|
| Posición media `sellado de techos puerto rico` | Fuera del top 10 | Top 10 |
| Posición media `sellado de techo puerto rico` | Fuera del top 10 | Top 10 |
| Impresiones del cluster techos | Por medir en GSC | +100% |
| URLs indexadas del cluster | Blog 0; sitemap 60 con duplicados | Blog + 47 principales + comunidades válidas |
| Citas en AI Overview | 0 | ≥1 consulta de precio |
| CTR orgánico del cluster | Por medir | ≥4% |
| Leads orgánicos de techos | Por medir | +30% |

---

## 11. Anexos

### Archivos y rutas auditadas

- `categorias/sellado-de-techos/es/landing-pages/ghl-sellado-de-techos-landing.html`
- `servicios/sellado-de-silicona/es/landing-pages/ghl-sellado-de-silicona-landing.html`
- `categorias/impermeabilizacion-de-techos/es/landing-pages/ghl-impermeabilizacion-de-techos-landing.html`
- `home/es/landing-pages/ghl-home-multiservicios.html`
- `blog/` (118 HTML) y `blog/sitemap-blog.xml`
- `Comunidades/landings/` (1,112 HTML), `master-database.json`, `cobertura-report.md`
- `sitemap.xml`, `robots.txt`, `llms.txt`
- `documentacion/ENLACES-INTERNOS.md`, `AGENTS.md`

### URLs de competidores citadas

- https://windmar.com/sellado-techos
- https://windmar.com/products/roofing
- https://starroofingcorp.com
- https://selladodetecholafamilia.com
- https://tutechosellado.com/servicios/sellado-de-techos
- https://forroofingpr.com
- https://www.danosapr.com

### Nota final

Este documento es un diagnóstico, no una promesa de posiciones. El SEO competitivo depende de autoridad de dominio, reseñas, comportamiento de usuario y cambios de algoritmo que no se controlan desde el HTML. Lo que sí se controla —y es lo que aquí se propone— es **publicar los facts correctos, en el formato que Google y los asistentes extraen, con enlaces claros a la página que convierte**.
