# Publicación de Custom Values — ILATEK

Fecha: 28 de octubre de 2026. Subcuenta: Ilatek - PR (`8OxUENFVM60EKzqsTcoD`). Website: `XG0ggFh3pBPpA5s0Pe37`.

## Resultado

Se revisaron y publicaron las 60 páginas existentes. La comprobación pública final devuelve HTTP 200 en las 60, sin Custom Values pendientes en textos, atributos, metadatos o JSON-LD, y sin enlaces con protocolo duplicado. Esto verifica la entrega del HTML público, no un cambio de posiciones en buscadores.

## Cambios realizados

- `website_url` ahora contiene `ilatekpr.com`, sin protocolo ni barra final. Antes contenía `https://ilatekpr.com` y las plantillas añadían otro `https://`.
- Home conserva un Paragraph nativo oculto `.dv-ghl-values` antes del Custom Code, con los seis valores exactos y el separador `|||DV|||`. Se eliminaron contactos alternativos incorrectos y la inferencia de localidad.
- En Home se conservaron los tokens de HTML y JSON-LD; las copias dentro de JavaScript se representan como cadenas equivalentes escapadas. El bloque pasó de 509 a 459 tokens literales, incluyendo la eliminación de un ejemplo comodín que no era un Custom Value. Después de publicar, GHL resolvió el HTML inicial. No se afirma un límite universal de GHL: es el resultado verificado en este bloque.
- El footer compartido y las copias inline usan `facebook_url` e `instagram_url`. Los perfiles personales de los fundadores y otros destinos externos se conservaron.
- El botón nativo de la página 404 usa `https://{{custom_values.website_url}}/`. Thank You conserva el enlace nativo Go to Page → Home.
- El panel SEO nativo de GHL es la fuente de los metadatos de Home; se eliminó su bloque HEAD duplicado anterior.

## Valores y bridge

```text
{{custom_values.county_name_and_state}}|||DV|||{{custom_values.business__email}}|||DV|||{{custom_values.business__phone}}|||DV|||{{custom_values.website_url}}|||DV|||{{custom_values.facebook_url}}|||DV|||{{custom_values.instagram_url}}
```

La subcuenta entrega Puerto Rico, ilatek.pr@gmail.com, +19393357351, ilatekpr.com y los perfiles de Facebook/Instagram de Ilatek. Para otro snapshot, cambiar los valores en GHL manteniendo los nombres y el orden. El valor `website_url` debe seguir siendo únicamente el dominio.

## Fuente y recuperación

- `respaldos/`: código leído del editor antes de las modificaciones y capturas HTML públicas anteriores.
- `preparados/`: bloques corregidos a partir del contenido real de GHL. El Home final es `preparados/home-custom-code.html`; el Paragraph nativo se conserva como elemento separado en GHL.
- `publicacion.json`: IDs, rutas y estado por página.
- `verificacion-publica-final.json` y `verificados/`: evidencia del HTML público final.
- `paginas-ghl.json`: inventario de las 60 páginas leído de la UI de GHL.

El código actual de GHL tiene contenido más reciente que algunas landings del repositorio. Se aplicaron cambios puntuales sobre esa versión actual; no se sustituyeron por versiones locales antiguas. En las fuentes locales se sincronizaron los enlaces sociales del footer. No se hizo commit ni push. Se preservaron archivos y cambios locales preexistentes.

## Verificación

- Home público: desktop 1512 px, móvil 390 px y tablet 820 px, sin desbordamiento horizontal. Un header y un footer. Bridge listo con portador oculto.
- Menú móvil abre/cierra. ES/EN conserva enlaces e imágenes sin tokens pendientes.
- Prueba local del bridge: seis slots, valores vacíos, URL normalizada, valores no expandidos y llegada tardía.
- Pruebas del proyecto y responsive se ejecutaron; ver salida de la tarea y `home-*-final.png`.
- No se enviaron formularios ni se hicieron reservas o cobros de prueba.

## Observaciones SEO preexistentes conservadas

**Actualización posterior del 28 de octubre:** los 15 casos descritos abajo ya fueron corregidos y publicados. Ver [SEO unificado](../seo-unificado-2026-10-28/RESULTADO.md). La observación original se conserva como historial.

Las rutas siguientes siguen exactamente como estaban configuradas en GHL. Algunas tienen sufijos numéricos; no se cambiaron rutas ni redirecciones. La verificación HTTP 200 de esas URLs no sustituye una auditoría de todos los destinos enlazados del sitio.

Hay 15 páginas que ya incluían dos etiquetas title en el HTML (una nativa y otra dentro del bloque): no se cambiaron sus metadatos como efecto lateral del ajuste de enlaces sociales. Conviene unificar esa fuente SEO en una revisión específica antes de replicar masivamente.

Páginas con title duplicado: Servicios, Servicio - Limpieza Residencial, Servicio - Limpieza Comercial, Servicio - Limpieza Industrial, Servicio - Limpieza Estandar, Servicio - Limpieza Profunda, Servicio - Limpieza de Airbnb & rentals, Servicio - Limpieza de Post Construcción, Servicio - Limpieza de Ventanas, Servicio - Lavado a presion, Servicio - Lavado de alfombras, Servicio - Limpieza de electrodomésticos, Servicio - Organización de espacios, Limpieza, Servicio - Limpieza de Mudanza.

## Inventario publicado y verificado

| Página | URL pública | Estado |
|---|---|---|
| 404 | [https://ilatekpr.com/error-ilatek-404](https://ilatekpr.com/error-ilatek-404) | Publicada y verificada |
| Canaletas y Bajantes | [https://ilatekpr.com/canaletas-y-bajantes](https://ilatekpr.com/canaletas-y-bajantes) | Publicada y verificada |
| Contactanos | [https://ilatekpr.com/contactanos](https://ilatekpr.com/contactanos) | Publicada y verificada |
| Cotización de Techos | [https://ilatekpr.com/cotizacion-techos](https://ilatekpr.com/cotizacion-techos) | Publicada y verificada |
| Empleo de Limpieza en Puerto Rico | [https://ilatekpr.com/reclutamiento-empleo](https://ilatekpr.com/reclutamiento-empleo) | Publicada y verificada |
| Empleo de Mantenimiento de Techos | [https://ilatekpr.com/reclutamiento-empleo-techos](https://ilatekpr.com/reclutamiento-empleo-techos) | Publicada y verificada |
| Empozamiento de Techos | [https://ilatekpr.com/empozamiento-de-techos](https://ilatekpr.com/empozamiento-de-techos) | Publicada y verificada |
| Garantia | [https://ilatekpr.com/politica-de-privacidad-476177](https://ilatekpr.com/politica-de-privacidad-476177) | Publicada y verificada |
| Gracias por Aplicar | [https://ilatekpr.com/reclutamiento-empleo-gracias-por-aplicar](https://ilatekpr.com/reclutamiento-empleo-gracias-por-aplicar) | Publicada y verificada |
| Home | [https://ilatekpr.com/home](https://ilatekpr.com/home) | Publicada y verificada |
| Impermeabilización de Techos | [https://ilatekpr.com/impermeabilizacion-de-techos](https://ilatekpr.com/impermeabilizacion-de-techos) | Publicada y verificada |
| Inspección de Techos | [https://ilatekpr.com/inspeccion-de-techos](https://ilatekpr.com/inspeccion-de-techos) | Publicada y verificada |
| Inspección y mantenimiento de Techos | [https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos-162462](https://ilatekpr.com/inspeccion-y-mantenimiento-de-techos-162462) | Publicada y verificada |
| Instalación y reemplazo de techos | [https://ilatekpr.com/inspeccion-de-techos-915832-237684](https://ilatekpr.com/inspeccion-de-techos-915832-237684) | Publicada y verificada |
| Lavado a presión de techos | [https://ilatekpr.com/lavado-a-presion-techos](https://ilatekpr.com/lavado-a-presion-techos) | Publicada y verificada |
| Limpieza | [https://ilatekpr.com/home-698854](https://ilatekpr.com/home-698854) | Publicada y verificada |
| Limpieza - Cotización Gratis | [https://ilatekpr.com/cotizacion](https://ilatekpr.com/cotizacion) | Publicada y verificada |
| Limpieza de techos y canaletas | [https://ilatekpr.com/limpieza-de-techos-y-canaletas](https://ilatekpr.com/limpieza-de-techos-y-canaletas) | Publicada y verificada |
| Mantenimiento de Techos | [https://ilatekpr.com/mantenimiento-de-techos](https://ilatekpr.com/mantenimiento-de-techos) | Publicada y verificada |
| Membrana Asfáltica | [https://ilatekpr.com/membrana-asfaltica](https://ilatekpr.com/membrana-asfaltica) | Publicada y verificada |
| Política de Privacidad | [https://ilatekpr.com/politica-de-privacidad](https://ilatekpr.com/politica-de-privacidad) | Publicada y verificada |
| Recubrimiento Elastometrico | [https://ilatekpr.com/recubrimiento-elastomerico](https://ilatekpr.com/recubrimiento-elastomerico) | Publicada y verificada |
| Reparación Post-Huracán | [https://ilatekpr.com/reparacion-post-huracan](https://ilatekpr.com/reparacion-post-huracan) | Publicada y verificada |
| Reparación de Filtraciones | [https://ilatekpr.com/reparacion-de-filtraciones](https://ilatekpr.com/reparacion-de-filtraciones) | Publicada y verificada |
| Reparación de Goteras | [https://ilatekpr.com/reparacion-de-filtraciones-160509](https://ilatekpr.com/reparacion-de-filtraciones-160509) | Publicada y verificada |
| Reparación de Grietas | [https://ilatekpr.com/reparacion-de-filtraciones-160509-875582](https://ilatekpr.com/reparacion-de-filtraciones-160509-875582) | Publicada y verificada |
| Reparación de Techos | [https://ilatekpr.com/reparacion-de-techos](https://ilatekpr.com/reparacion-de-techos) | Publicada y verificada |
| Reseñas | [https://ilatekpr.com/home-118878](https://ilatekpr.com/home-118878) | Publicada y verificada |
| Sellado Acrilico | [https://ilatekpr.com/sellado-de-poliuretano-950943](https://ilatekpr.com/sellado-de-poliuretano-950943) | Publicada y verificada |
| Sellado de Poliuretano | [https://ilatekpr.com/sellado-de-poliuretano](https://ilatekpr.com/sellado-de-poliuretano) | Publicada y verificada |
| Sellado de Techos | [https://ilatekpr.com/sellado-de-techos](https://ilatekpr.com/sellado-de-techos) | Publicada y verificada |
| Sellado de Techos Comercial | [https://ilatekpr.com/sellado-de-techos-comercial](https://ilatekpr.com/sellado-de-techos-comercial) | Publicada y verificada |
| Sellado de Techos Industrial | [https://ilatekpr.com/sellado-de-techos-industrial](https://ilatekpr.com/sellado-de-techos-industrial) | Publicada y verificada |
| Sellado de Techos Residencial | [https://ilatekpr.com/sellado-de-techos-residencial](https://ilatekpr.com/sellado-de-techos-residencial) | Publicada y verificada |
| Selladode de Silicona | [https://ilatekpr.com/sellado-de-silicona](https://ilatekpr.com/sellado-de-silicona) | Publicada y verificada |
| Servicio - Lavado a presion | [https://ilatekpr.com/lavado-a-presion](https://ilatekpr.com/lavado-a-presion) | Publicada y verificada |
| Servicio - Lavado de alfombras | [https://ilatekpr.com/alfombras](https://ilatekpr.com/alfombras) | Publicada y verificada |
| Servicio - Limpieza Comercial | [https://ilatekpr.com/limpieza-comercial](https://ilatekpr.com/limpieza-comercial) | Publicada y verificada |
| Servicio - Limpieza Estandar | [https://ilatekpr.com/limpieza-estandar](https://ilatekpr.com/limpieza-estandar) | Publicada y verificada |
| Servicio - Limpieza Industrial | [https://ilatekpr.com/limpieza-industrial](https://ilatekpr.com/limpieza-industrial) | Publicada y verificada |
| Servicio - Limpieza Profunda | [https://ilatekpr.com/limpieza-profunda](https://ilatekpr.com/limpieza-profunda) | Publicada y verificada |
| Servicio - Limpieza Residencial | [https://ilatekpr.com/limpieza-residencial](https://ilatekpr.com/limpieza-residencial) | Publicada y verificada |
| Servicio - Limpieza de Airbnb & rentals | [https://ilatekpr.com/airbnb-turnover](https://ilatekpr.com/airbnb-turnover) | Publicada y verificada |
| Servicio - Limpieza de Mudanza | [https://ilatekpr.com/limpieza-de-mudanza](https://ilatekpr.com/limpieza-de-mudanza) | Publicada y verificada |
| Servicio - Limpieza de Post Construcción | [https://ilatekpr.com/post-construccion](https://ilatekpr.com/post-construccion) | Publicada y verificada |
| Servicio - Limpieza de Ventanas | [https://ilatekpr.com/ventanas](https://ilatekpr.com/ventanas) | Publicada y verificada |
| Servicio - Limpieza de electrodomésticos | [https://ilatekpr.com/electrodomesticos](https://ilatekpr.com/electrodomesticos) | Publicada y verificada |
| Servicio - Organización de espacios | [https://ilatekpr.com/organizacion](https://ilatekpr.com/organizacion) | Publicada y verificada |
| Servicios | [https://ilatekpr.com/servicios](https://ilatekpr.com/servicios) | Publicada y verificada |
| Servicios - Sellado y Mantenimiento de T... | [https://ilatekpr.com/servicios-techos](https://ilatekpr.com/servicios-techos) | Publicada y verificada |
| Techos Planos | [https://ilatekpr.com/techos-planos](https://ilatekpr.com/techos-planos) | Publicada y verificada |
| Techos con Tragaluces | [https://ilatekpr.com/tragaluces](https://ilatekpr.com/tragaluces) | Publicada y verificada |
| Techos de Asfalto | [https://ilatekpr.com/techos-de-asfalto](https://ilatekpr.com/techos-de-asfalto) | Publicada y verificada |
| Techos de Concreto | [https://ilatekpr.com/techos-de-concreto](https://ilatekpr.com/techos-de-concreto) | Publicada y verificada |
| Techos de Madera | [https://ilatekpr.com/techos-de-madera](https://ilatekpr.com/techos-de-madera) | Publicada y verificada |
| Techos de Teja | [https://ilatekpr.com/techos-de-teja](https://ilatekpr.com/techos-de-teja) | Publicada y verificada |
| Techos de zinc | [https://ilatekpr.com/techos-de-zinc](https://ilatekpr.com/techos-de-zinc) | Publicada y verificada |
| Techos por Segmento | [https://ilatekpr.com/techos-por-segmento](https://ilatekpr.com/techos-por-segmento) | Publicada y verificada |
| Terminos y Condiciones | [https://ilatekpr.com/terminos-y-condiciones](https://ilatekpr.com/terminos-y-condiciones) | Publicada y verificada |
| Thank You | [https://ilatekpr.com/home-639221](https://ilatekpr.com/home-639221) | Publicada y verificada |
