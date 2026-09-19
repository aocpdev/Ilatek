# Ilatek

Cotizador de limpieza residencial en español para integrar en GoHighLevel (GHL).

Incluye cinco pasos: datos básicos, servicios, extras, resumen y calendario. Calcula el precio estimado y la duración, muestra el aviso de depósito de $50 y carga el calendario con un indicador de espera.

## Usar en GHL

1. Abre `ghl-custom-code-embedded.html` y copia todo su contenido.
2. Pégalo en un elemento **Custom Code** de tu página en GHL.
3. Guarda y revisa la página publicada. La imagen de la protagonista ya está incrustada en este archivo.

Para personalizar el calendario, pega el contenido completo de `ilatek-calendar-custom-code.html` en **Widget appearance → Insert custom code**, incluyendo las etiquetas `<style>` y `</style>`. No pegues CSS sin esas etiquetas en ese campo: se mostrará como texto.

## Home Page

`home-page/ghl-custom-code.html` es la landing de inicio para pegar tal cual en un elemento **Custom Code** de la página de inicio en GoHighLevel. Usa los tokens `{{custom_values.*}}` de GHL (ubicación, contacto, redes) e incluye JSON-LD y el widget de reseñas.

Todos los botones y enlaces de cotización (nav, hero, servicio, CTA y footer) apuntan fijos a `https://ilatekpr.com/cotizacion`.

## Archivos

- `home-page/ghl-custom-code.html`: landing de inicio para GHL Custom Code; botones de cotización hacia https://ilatekpr.com/cotizacion.
- `ghl-custom-code.html`: versión editable con imagen local.
- `ghl-custom-code-embedded.html`: versión autónoma lista para copiar en GHL.
- `ilatek-calendar-custom-code.html`: estilos del calendario con las etiquetas HTML necesarias.
- `ilatek-calendar-ghl.css`: estilos CSS de referencia; requiere etiquetas `<style>` para el campo Insert custom code.
- `assets/latina-cleaner.png`: imagen utilizada, sin tatuaje.
- `assets/latina-cleaner-tattoo.png`: variante anterior de la imagen, actualmente no utilizada.

## Calendario y depósito

El último paso integra el calendario de ILATEK alojado en GHL. La disponibilidad, la reserva y el cobro de $50 se gestionan en ese calendario. El cotizador no procesa pagos ni añade automáticamente el depósito al precio calculado.

Las respuestas del cotizador no se transfieren automáticamente al registro de la reserva. Cualquier conexión con campos de contacto o automatizaciones requiere una integración adicional.

## Editar

Los precios y el cálculo están en `ghl-custom-code.html`. Después de editarlo, actualiza también la versión incrustada para mantener ambas versiones sincronizadas. Los colores se definen como variables CSS en `.pcq`.

Guardar el proyecto en GitHub no actualiza automáticamente la página publicada en GHL; hay que reemplazar allí el código cuando haya cambios.
