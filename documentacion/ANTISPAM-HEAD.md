# Guard anti-spam en el head de los funnels

Estado: **16 de noviembre de 2026**. Se anexa al head tracking de cada funnel de la subcuenta
**Ilatek - PR** (`8OxUENFVM60EKzqsTcoD`).

## 1. Qué hace

Bloquea envíos automatizados a los formularios personalizados (no nativos de GHL) sin estorbar
a una persona:

| Capa | Comportamiento |
|---|---|
| Trampa (honeypot) | Inyecta `website_url_confirm` fuera de pantalla en `#ilatek-clima form` y en el cotizador. Si un bot la rellena, el envío muere con "éxito simulado": no hay `fetch`, no hay nota, no hay contacto. |
| Interacción humana | Un envío sin `pointerdown`/`keydown`/`input` previos y en los primeros 5 s se trata como bot. |
| Doble envío | El segundo `submit` de la misma forma mientras hay uno en vuelo se descarta. |
| reCAPTCHA v3 (opcional) | Inerte por defecto. Al pegar la site key en `siteKey:''`, ejecuta `execute('ilatek_lead')` y adjunta `recaptcha_token` a los POST JSON a `…/hooks/…`. |

Nunca toca formularios nativos de GHL, el chat, el calendario ni el buscador de comunidades:
el alcance es `#ilatek-clima form`, `form[data-il-guard]` (opt-in para futuras formas) y el botón
`#ilag-enviar` del cotizador.

Todo va en un `try/catch` con **fail-open**: si el guard falla, el lead se envía como siempre.

## 2. Archivos

| Archivo | Papel |
|---|---|
| `activacion-municipios/antispam-head.html` | Bloque fuente (un `<script>`, **6 580 B**). Es lo que se publica. |
| `activacion-municipios/tracking-head.html` | Head canónico = gtag + GTM + Clarity + Pixel + (desde hoy) el guard: **22 537 B**. Lo lee `Comunidades/scripts/alta-funnel-ghl.py` al crear funnels nuevos, así que **los clones lo heredan**. |
| `activacion-municipios/backups/tracking-head-live-20261116.html` | Head live antes del cambio (15 955 B). |
| `activacion-municipios/backups/tracking-head-local-20261030.html` | Copia local anterior. |
| `activacion-municipios/backups/heads-antes-2026-11-16.json` | Respaldo completo (`_data`) de cada funnel antes de escribir. |
| `tools/ghl-antispam-head.mjs` | Publica, verifica y revierte. |

## 3. Dónde vive el head

El head **no** es global por cuenta: es un campo por funnel (`tracking_code_head`). Los 200 funnels
de la subcuenta compartían el mismo texto, de modo que "global" se consigue aplicando el mismo
bloque a todos. GHL inyecta ese código al servir la página (no literalmente dentro de `<head>`,
sino al final del documento); el guard funciona igual porque registra su escucha en `document` y
se arma con `DOMContentLoaded`, temporizadores y un `MutationObserver`, ya que el contenido de las
páginas se hidrata después.

## 4. Cómo publicar

Requisitos: Chrome con CDP en `9222` y sesión iniciada en la subcuenta
(`start-chrome-debug.bat`, perfil `C:\ghl-profile`). El script toma el `token-id` de esa sesión:
el API público no permite escribir ajustes de funnels (responde 401) y el interno exige ese token.

```bash
node tools/ghl-antispam-head.mjs                          # dry-run: cobertura y hash resultante
node tools/ghl-antispam-head.mjs --inspect --only <id>    # ajustes actuales del funnel
node tools/ghl-antispam-head.mjs --url     --only <id>    # URL pública del funnel
node tools/ghl-antispam-head.mjs --apply   --only <id>    # canario
node tools/ghl-antispam-head.mjs --apply   --all          # lote completo
node tools/ghl-antispam-head.mjs --verify                 # cobertura con guard
node tools/ghl-antispam-head.mjs --restore documentacion/activacion-municipios/backups/heads-antes-2026-11-16.json
```

La herramienta es **idempotente**: si el bloque ya está, lo reemplaza en su sitio (no lo duplica) y
solo escribe los funnels cuyo head cambiaría. Antes de escribir guarda el respaldo y, tras cada
funnel, relee los ajustes y compara: nombre, ruta, dominio, favicon, chat, body y pasos deben quedar
idénticos. Si algo cambia, el funnel se reporta como fallido.

## 5. Verificación

Local, con `playwright-core` y una página de prueba que monta el bloque real:

- trampa inyectada, fuera de pantalla, `type="text"`, `tabindex=-1`, `autocomplete="off"`;
- bot sin interacción → **0** peticiones al webhook;
- bot con la trampa rellena → **0** peticiones y contador de bloqueos del guard;
- persona → **1** petición, con el payload intacto y sin la clave de la trampa;
- cotizador: click de bot bloqueado antes de llegar al manejador de la página; click humano sí llega.

En vivo: `http=200`, guard presente en la página, `GTM-PQMR2TDB`, `G-BTVFHT1X8G` y el Pixel
`2092249571384387` intactos.

## 6. Cobertura

| Ámbito | Estado |
|---|---|
| Ilatek - PR: 200 funnels (1 principal + 199 de comunidad) | **aplicado y verificado: 200/200 con guard (22 537 B)**, GTM/GA4/Pixel intactos en los 200 |
| 78 subcuentas municipales | **pendiente**: el PIT del proyecto solo ve Ilatek - PR. Se pega el mismo bloque en su head tracking (Website/Settings) o se ejecuta con un token de agencia. |

## 7. Efectos colaterales conocidos

Al guardar los ajustes, GHL deja `is_chat_widget_live` en `false` en ese funnel. **No afecta a la
página**: el chat público se sirve por la etiqueta de GTM (`gtm-chat-widget-tag.html`, contenedor
`GTM-PQMR2TDB`), comprobado en vivo. Ningún otro ajuste cambia (nombre, ruta, dominio, favicon,
chat id, body y pasos se comparan tras cada escritura).

## 8. Límites

- Protege el navegador: **no** frena un ataque directo contra la URL del webhook. Para eso hace
  falta la segunda capa (If/Else en el workflow `399e8778-41f8-4d43-a057-c470d5ea67d7` justo después
  del Inbound Webhook: `website_url_confirm` *Is Empty* y, si se usa reCAPTCHA, `recaptcha_token`
  presente; la rama falsa termina sin acciones). Esa capa **no** está construida: requiere el builder.
- reCAPTCHA v3 queda inerte hasta pegar una site key pública de Google. El score **no** se puede
  validar en el navegador sin exponer el secreto: la verificación real necesita servidor, y GHL no
  la hace. El token se adjunta para una comprobación externa futura.
- La trampa no entra en el payload (las formas construyen su JSON campo a campo), así que el
  filtro de "honeypot vacío" del workflow solo tiene sentido si antes se mapea el campo.
