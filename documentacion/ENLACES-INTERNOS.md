# Contrato de enlaces internos

## Formato obligatorio

```html
<a href="https://{{custom_values.website_url}}/cotizacion">Solicitar cotización</a>
```

En GHL, el Custom Value `website_url` debe ser **`ilatekpr.com`**, sin `https://` y sin `/` final. En un snapshot de otro dominio, cambiar el valor, no cada enlace. No se modificó el valor de la cuenta GHL desde este proyecto.

El código de respaldo también tolera un valor anterior con protocolo o barra final al resolver navegación, pero eso no sustituye configurar correctamente el Custom Value: los campos SEO del HEAD deben resolverse en GHL antes de servir el HTML.

## Alcance aplicado

- 47 paquetes de páginas, componentes compartidos, menú, footer, reseñas, páginas legales y variantes históricas.
- Enlaces escritos directamente y creados en el carrusel, menú móvil y textos ES/EN.
- Canonical, `og:url` y URLs del schema usan el mismo dominio parametrizado. Title, Description e imágenes sociales se mantienen.
- Los generadores de techos y FAQ aplican el contrato; no se regeneró el contenido de las páginas existentes.

## Destinos preservados

Los enlaces a calendarios de GHL, portal del cliente, subdominios municipales, redes, reseñas, imágenes y otros recursos externos mantienen sus URLs. No se convirtieron los municipios en `/nombre-del-municipio`, ya que eso sería inventar rutas distintas.

Los enlaces de una sección tienen URL completa con el path de la página y el fragmento. `data-ilatek-anchor` conserva el scroll suave al elemento existente, incluido el calendario. Los `href="#..."` de SVG son referencias gráficas, no navegación. Los controles `href="#"` sin destino real, `tel:` y `mailto:` no se convierten en rutas de página.

Sitemap, robots y archivos llms públicos mantienen URLs reales: GHL no sustituye variables dentro de estos archivos publicados de forma estática.

## Resolución en GHL

Se reutilizan los resolutores existentes y se centraliza únicamente el tratamiento de URLs. El runtime compartido se incrusta en los HTML que lo necesitan; no requiere subir otro archivo JavaScript. Normaliza HTTPS, conserva el path y evita protocolos duplicados.

Si GHL no resuelve tokens dentro del bloque Custom Code, se admite el párrafo puente nativo existente de seis campos con clase `dv-ghl-values` o ID `dv-ghl-values`. `website_url` ocupa la cuarta posición, sin alterar los demás Custom Values. Sus valores se leen como texto. Un único observador compartido actualiza enlaces cuando el dato llega tarde o se insertan tarjetas nuevas; no realiza peticiones ni envía formularios.

Sin un dominio resuelto se conserva el fallback previo de ILATEK. No se aceptan protocolos ejecutables ni URLs con credenciales. No se cambian teléfonos, emails ni calendarios.

Los metadatos parametrizados requieren sustitución real en los campos nativos de SEO/HEAD de GHL. El runtime del cuerpo no garantiza cómo leerán el HEAD los bots sociales; verificar que la página publicada no tenga llaves literales.

## Verificación del cambio

Fecha: 2026-10-10.

- Auditoría estática: 127 HTML de entrega/referencia y 32 páginas generadas en memoria; 962 enlaces inspeccionados, sin formato interno anterior.
- Sintaxis: 793 bloques JS/JSON-LD analizados entre archivos y generación, sin errores.
- Aplicación idempotente: una segunda ejecución no modifica archivos.
- Navegador aislado: Home a 1280 y 390 px, servicio Alfombras, categoría Sellado de Techos y footer. Cero errores JS en los cinco casos.
- Home: 193 enlaces gestionados y 20 tarjetas del carrusel; ida/vuelta ES/EN y actualización tardía del Custom Value correctas.
- Datos probados: dominio sin protocolo, con HTTPS/barra final, cambio tardío de dominio, fragmentos, base con prefijo y valores inseguros.
- Las pruebas bloquearon solicitudes externas y no enviaron formularios ni crearon reservas.

## Mantenimiento

```bash
node tools/apply-internal-links.mjs
node tools/package-pages.mjs
npm test
```

`npm run test:links` ejecuta únicamente las comprobaciones de enlaces. La prueba de navegador está en `tools/test-internal-links-browser.mjs`; requiere Playwright y Chromium disponibles, con rutas opcionales `ILATEK_PLAYWRIGHT` y `ILATEK_CHROMIUM`.

El registro de la reorganización anterior conserva sus hashes originales. `test:migration` ya no debe pasar: este cambio de enlaces modifica el HTML intencionalmente. No se alteraron esos hashes para ocultar la diferencia.

Cambios locales solamente: no se hizo commit, push ni publicación en GHL.
