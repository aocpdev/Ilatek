# Localización SEO e imágenes — Delta System ILATEK

Custom Value confirmado: `{{custom_values.county_name_and_state}}`.

El mismo valor se usa en las 47 fichas SEO-GHL.md, seo.json y HEAD-TEMPLATE.html; Title, Description, Open Graph/Twitter, sus descripciones de imagen y geo.placename quedan sincronizados. Los nombres/descripciones WebPage se localizan sin alterar direcciones, países ni otros datos reales de la empresa. No se crearon oficinas municipales, coordenadas, reseñas o nuevas páginas EN.

## Imágenes

Se preserva la descripción existente y se sustituye la referencia genérica de localidad o se añade contexto de servicio. Los atributos alt y title descriptivos incluyen el Custom Value, también en componentes compartidos y carruseles generados por JavaScript. Las URLs de imágenes y videos no cambian.

Las imágenes decorativas conservan alt vacío; no se rellenan con palabras clave. Las demás deben describir el contenido de la imagen, no repetir una lista de servicios. Referencias: [Google Search Central — SEO de imágenes](https://developers.google.com/search/docs/appearance/google-images) y [W3C — imágenes decorativas](https://www.w3.org/WAI/tutorials/images/decorative/).

## Instalación del snapshot

1. Configurar el Custom Value con la etiqueta completa del pueblo y estado. Ejemplo de configuración, no ubicación de oficina: `Bayamón, Puerto Rico`. No añadir otro “Puerto Rico” al final.
2. Pegar los metadatos de la ficha SEO en la configuración de la página y usar una sola configuración HEAD. No duplicar Title, Description, canonical ni Open Graph.
3. Para el contenido dinámico, crear antes del Custom Code un **Paragraph nativo de GHL** con el texto de [CUSTOM-VALUES-PARRAFO.txt](CUSTOM-VALUES-PARRAFO.txt), asignándole la clase `dv-ghl-values`. GHL debe resolver esos seis campos, manteniendo los separadores y las posiciones vacías. El runtime oculta solo ese párrafo.
4. Verificar en el HTML público inicial que los metadatos muestran el pueblo real, sin `{{...}}`. El respaldo JavaScript de la vista previa no demuestra que los rastreadores sociales reciban los metadatos resueltos. Si GHL no sustituye un campo, resolverlo en la configuración de publicación antes de lanzar ese snapshot.
5. Revisar la coherencia de H1, contenido, preguntas frecuentes, cobertura, contactos, schema y canonical para cada publicación. No afirmar presencia física ni trabajos locales sin respaldo; personalizar una etiqueta no sustituye contenido local útil ni garantiza posiciones en SEO/AEO/GEO.

## Mantenimiento y pruebas

- Regla de generación: `tools/location-contract.mjs`; se aplica junto al contrato de enlaces en `tools/internal-link-contract.mjs`.
- Resolución de imágenes/metadatos: `src/compartido/location-values.js`. Conserva plantillas codificadas para actualizaciones de localidad, carruseles e idioma; usa atributos/texto, no HTML generado a partir del valor del pueblo.
- Después de cambios: `npm run sync:layout` y `npm test`. No regenerar contenido de techos únicamente para aplicar esta regla.
- Auditoría estática: 47 fichas SEO y 1,292 imágenes/referencias entre entregables y salidas del generador; 40 referencias decorativas respetadas.
- Navegador: 58 casos sobre 52 archivos, móvil y muestras desktop, ES/EN, cambios de pueblo, metadatos, enlaces y caracteres especiales tratados como texto. Sin llamadas a calendarios/pagos. La traducción remota y el HTML publicado en GHL requieren verificación independiente.

Cambios locales. Sin push a GitHub ni instalación automática en GHL.
