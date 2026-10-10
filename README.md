# ILATEK — sitio y entregables GHL

Home principal: **[ghl-home-multiservicios.html](home/es/landing-pages/ghl-home-multiservicios.html)**.

La organización sigue el patrón de entrega GHL de Aires Inverters y la estructura local verificada de Guz Plumbing: página → idioma → landing-pages, assets y ficha SEO. Se conserva el contenido existente de ILATEK y sus URLs de producción.

## Accesos principales

- [Home Page](home/README.md) · [SEO del Home](home/es/SEO-GHL.md)
- [Categorías](categorias/README.md) · [Servicios](servicios/README.md)
- [Mapa completo de las 47 páginas](documentacion/MAPA-DE-PAGINAS.md)
- [Estructura, idiomas y mantenimiento](documentacion/ESTRUCTURA.md)
- [Incidencias previas y verificación](documentacion/VERIFICACION.md)
- [Formato obligatorio de enlaces internos](documentacion/ENLACES-INTERNOS.md): `https://{{custom_values.website_url}}/ruta`; configurar `website_url` sin protocolo.

## Estructura

```text
home/                         Home multiservicios, separado de limpieza
  es/
    landing-pages/            ghl-home-multiservicios.html
    assets/                   imágenes, video, imagen social y respaldos
    SEO-GHL.md                Meta Tag Title, Description y URL de Image
    seo.json                  los mismos datos en formato reutilizable
    ASSETS.json               origen, archivo local, tamaño y SHA-256
    HEAD-TEMPLATE.html        bloque HEAD de referencia
  en/README.md                estado real del inglés y fuente compartida
categorias/<categoria>/       mismo patrón de entrega
servicios/<servicio>/         mismo patrón de entrega
componentes/                  menú, secciones y CSS reutilizables
archivo/home-limpieza/        variantes anteriores; no son el Home actual
src/faq/                     motor y fuentes de preguntas frecuentes
techos/                      generador, datos y pruebas de techos
documentacion/               mapa, instrucciones e historial
assets/                      biblioteca original; se conserva por sus URLs CDN
```

Las carpetas `en/` documentan el selector o la ausencia de una landing independiente. **No contienen copias españolas presentadas como traducciones inglesas.** Crear rutas EN separadas requiere traducción y aprobación de sus URLs; la reorganización no cambia el selector actual.

## Copiar a GHL

1. Abrir la ficha de la página en el mapa y copiar su HTML de `es/landing-pages/`.
2. Pegar en Custom Code de GHL. El Home multiservicios ya incluye menú; no duplicarlo. El footer existente sigue en [ghl-footer-embed.html](ghl-footer-embed.html).
3. Configurar los tres campos descritos en `SEO-GHL.md` de esa página. Revisar los avisos de imágenes antiguas, si los hay, y evitar duplicados de meta tags.
4. Las carpetas locales no se suben automáticamente a GHL. Los embeds mantienen URLs públicas absolutas; los assets locales son respaldos verificables.

## Cotizador y calendario

El cotizador permanece en [ghl-custom-code-embedded.html](ghl-custom-code-embedded.html). Tiene resumen, calendario y aviso del depósito de $50. El pago se gestiona en el calendario de GHL, no en el cotizador.

Para el estilo del calendario, pegar [ilatek-calendar-custom-code.html](ilatek-calendar-custom-code.html) completo, incluidas las etiquetas `<style>`, en Widget appearance → Insert custom code.

## Mantenimiento

```bash
node tools/verify-structure.mjs
node techos/verify-techos.mjs
node tools/package-pages.mjs
```

`package-pages.mjs` actualiza documentación y respaldos desde los HTML actuales. `--download` permite descargar medios públicos ya referenciados; no cambia el HTML, GHL ni GitHub. Los scripts de generación de techos y FAQ conocen las nuevas rutas. No ejecutar un generador para reorganizar: puede reescribir contenido previamente editado a mano.

Esta reorganización no crea commits, no hace push y no publica cambios en GHL. El [historial anterior](documentacion/HISTORIAL-PROYECTO.md) se conserva como referencia histórica, no como guía de rutas vigente.
