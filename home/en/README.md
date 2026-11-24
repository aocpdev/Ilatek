# English — home

**Status: standalone English page exists at `/en/home`.**

- Source: `landing-pages/home.en.html`.
- HEAD: `HEAD-TEMPLATE.html` (title, description, canonical, hreflang es/en/x-default, OG/Twitter).
- The page must be served with `lang="en"`. The shared nav/footer still use `data-es`/`data-en`; the EN copy is applied at runtime, so the static nav/footer fallback remains Spanish until the parity contract is changed. This is documented as PENDIENTE in `GHL-PUBLICAR/REVISION-2026-11-21/`.
- Do not publish the English page with the Spanish title or with `lang="es"`. Verify the served HTML, not only the browser tab.
