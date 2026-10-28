# Client Portal · tema Ilatek

Capa de estilos para el **Client Portal nativo de GoHighLevel** (`portal.ilatekpr.com`), hecha
para que el portal se acerque al panel que aparece en el video: navy, verde, tarjetas blancas,
lienzo mist y bordes redondeados.

## Archivos

| Archivo | Uso |
| --- | --- |
| [ilatek-client-portal.css](ilatek-client-portal.css) | CSS para pegar en el campo Custom CSS |
| [ilatek-client-portal-head.html](ilatek-client-portal-head.html) | El mismo tema envuelto en `<style>`, para el campo Header Code |
| [preview-dashboard.html](preview-dashboard.html) | Vista de referencia del panel con tarjetas y botones |
| [logo.png](logo.png) | Logo usado por la vista de referencia |

## Dónde se instala

1. Sub-cuenta → **Memberships → Client Portal → Settings**.
2. Abre **Branding** y baja a **Advanced settings**.
3. Pega todo el contenido de `ilatek-client-portal.css` en el campo **Custom CSS**.
   Si tu cuenta no tiene ese campo, pega `ilatek-client-portal-head.html` completo en
   **Header Code** (misma sección Advanced settings).
4. Guarda y limpia la caché del portal (o abre una ventana privada).

El campo **Custom JavaScript** existe al lado; este tema no lo necesita. Si en tu cuenta no
aparece “Advanced settings”, revisa que el portal esté migrado al Client Portal nuevo: en el
HTML servido deben existir `--cp-brand-primary`, `customCss` y los componentes `.cp-*` / `.hr-*`.

## Qué cambia y qué no

Cambia solo presentación:

- Tokens `--cp-brand-*`, `--cp-secondary-*`, `--cp-surface-*`, `--cp-border-*`, `--cp-font-*`.
- Radios: 14 px en botones, campos y selects; 22 px en tarjetas; 24 px en modales; pills en tags.
- Tipografía: Outfit en títulos y Manrope en texto, con Inter/system como respaldo.
- Lienzo mist (`#f4f7fc`), tarjetas blancas con borde `#dbe2f1` y sombra suave.
- Anillo de foco verde y sombra discreta en botones primarios.

No cambia nada funcional:

- No usa `display:none`, ni reordena, ni mueve elementos.
- No toca formularios, pagos, permisos, rutas ni el DOM.
- No modifica tamaños de fuente ni el layout; si GHL cambia sus clases, el tema simplemente deja
  de aplicar y el portal sigue funcionando.

## Ajustes rápidos

- **Radios**: `--il-radius-control` y `--il-radius-card` al inicio del archivo.
- **Verde**: `--cp-brand-primary` y la escala `--cp-primary-*`.
- **Navy**: `--cp-brand-secondary` y `--cp-secondary-500`.
- **Lienzo**: `--cp-surface-500`.
- **Fuentes**: si se prefiere no cargar Google Fonts, elimina el `@import` de la primera línea;
  el tema cae a Inter/system sin romperse.

## Verificación hecha

- El CSS se cargó sobre el HTML real del login servido por `portal.ilatekpr.com` y se
  comprobaron los valores computados: botón y campos a 14 px, lienzo `#f4f7fc`, tipografía
  Manrope, token primario `#00b94f`.
- No se pudo iniciar sesión en el portal (requiere credenciales del cliente), así que las
  pantallas internas —dashboard, pagos, cursos— no se validaron en vivo. El theme builder de GHL
  puede cambiar clases entre versiones; si algo deja de verse redondeado, revisa primero si la
  clase `.hr-card` / `.cp-card-v2` sigue presente en el HTML servido.
