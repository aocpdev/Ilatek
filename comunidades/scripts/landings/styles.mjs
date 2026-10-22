// Hoja de estilo de las landings de comunidad. Colores y tipografía de la marca Ilatek.
export const STYLES = `:root{--ink:#11164b;--blue:#213d8e;--green:#00b94f;--mist:#f4f7fc;--line:#dbe2f1;--muted:#5b6380}
*{box-sizing:border-box}
body{margin:0;font-family:Manrope,Arial,sans-serif;color:var(--ink);background:#fff;line-height:1.6}
main{max-width:920px;margin:0 auto;padding:24px 20px 56px}
main,main *{min-width:0;overflow-wrap:anywhere}
.hero{position:relative;width:100vw;margin-left:calc(50% - 50vw);min-height:560px;overflow:hidden;display:flex;align-items:flex-end;color:#fff;background:var(--ink)}
.hero-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(17,22,75,.15),rgba(17,22,75,.85))}
.hero-copy{position:relative;z-index:1;padding:32px;max-width:680px}
h1{font-family:Outfit,Arial,sans-serif;font-size:clamp(30px,5vw,46px);line-height:1.1;margin:8px 0 12px}
h2{font-family:Outfit,Arial,sans-serif;font-size:24px;margin:40px 0 12px}
.card{background:var(--mist);border:1px solid var(--line);border-radius:16px;padding:22px}
.svc{list-style:none;padding:0;display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.svc a{display:block;text-decoration:none;color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:16px;height:100%}
.svc span{display:block;color:var(--muted);font-size:14px;margin-top:4px}
.svc a:hover{border-color:var(--green)}
.cta{display:inline-block;margin-top:24px;background:var(--green);color:var(--ink);font-weight:700;text-decoration:none;padding:14px 24px;border-radius:999px}
.final-cta{text-align:center;margin-top:40px}
.final-cta .cta{margin-top:0}
.hero-copy .lead{margin:0 0 4px;font-size:16px;line-height:1.6;color:rgba(255,255,255,.88)}
.crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 18px;font-size:14px;color:var(--muted)}
.crumbs a{color:var(--blue);font-weight:600;text-decoration:none}
.crumbs a:hover,.crumbs a:focus-visible{text-decoration:underline}
.crumbs [aria-current]{color:var(--ink);font-weight:700}
.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
.cta-row .cta{margin-top:0}
.cta--alt{background:#fff;color:var(--ink)!important;border:2px solid var(--green)}
.cta--alt:hover,.cta--alt:focus-visible{background:var(--mist)}
section>p.lead{max-width:760px;color:var(--muted);font-size:16px;line-height:1.7}
details{border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:10px}
summary{font-weight:700;cursor:pointer}
details p{color:var(--muted);margin:8px 0 0}
.note{color:var(--muted);font-size:13px;margin-top:32px}`;
