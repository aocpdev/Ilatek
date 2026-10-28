#!/usr/bin/env python3
"""Resolvers seccionales: data-* crudos se resuelven contra el puente dv-ghl-values.

Defecto (demostrado por tools/qa/qa_tokenized_headings.mjs, variante bridge-only):
los resolvers embebidos en los canónicos ghl-*-landing.html leen data-location-label,
data-primary-location, data-* de contacto desde los atributos de la sección; esos
atributos llevan el token crudo {{custom_values.*}} (GHL no los expande dentro del
Custom Code), el clean() local lo descarta y h1/h3 caen al literal 'Puerto Rico'.

Fix mínimo y uniforme, dentro de cada resolver:
  1. Un script-guía por archivo (uno solo, tras <body>) define window.ILATEK_BRIDGE
     con slot(i) (6 slots del puente: 0 county, 1 email, 2 phone, 3 website,
     4 facebook, 5 instagram) y attr(v) (literal → literal; token crudo → slot;
     sin puente → '').
  2. Cada statement que alimentaba el mapa de valores con clean(attr) pasa a
     ilBV.attr(attr) || ilBV.slot(N) || fallback. El literal data-* gana igual que
     antes; el fallback 'Puerto Rico' solo aplica cuando no hay puente ni attr útil.

Idempotente: un archivo con el marcador ILATEK_BRIDGE ya no se toca.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ILATEK = ROOT / "Ilatek"

MARKER = "ILATEK_BRIDGE"

HELPER = """\
<!-- ILATEK · resolver global del puente dv-ghl-values (párrafo nativo GHL).
     Reglas: literal data-* gana sin cambios; token crudo dentro de data-* se
     resuelve contra el slot correspondiente del puente; sin puente el slot da
     '' y el fallback real de cada resolver aplica. -->
<script>
(function(){
  if(window.ILATEK_BRIDGE)return;
  var SLOT={business__county_name:0,business__email:1,business__phone:2,website_url:3,facebook_url:4,instagram_url:5};
  function clean(v){v=String(v==null?'':v).replace(/\\u00a0/g,' ').trim();return /^\\s*\\{\\{[^}]+\\}\\}\\s*$/.test(v)?'':v}
  function slots(){
    var ps=document.querySelectorAll('.dv-ghl-values,#dv-ghl-values');
    for(var i=0;i<ps.length;i++){
      var parts=String(ps[i].textContent||'').split('|||DV|||');
      if(parts.length===6)return parts;
    }
    return null;
  }
  function slot(i){var s=slots();if(!s)return '';var v=clean(s[i]);return /^\\{\\{/.test(v)?'':v}
  function attr(v){
    return String(v==null?'':v).replace(/\\{\\{\\s*custom_values\\.([a-z_]+)\\s*\\}\\}/g,function(m,n){
      return SLOT.hasOwnProperty(n)?slot(SLOT[n]):m;
    });
  }
  window.ILATEK_BRIDGE={slot:slot,attr:attr};
})();
</script>"""

# Alias robusto para statements individuales (self-suficiente por IIFE):
# window.ILATEK_BRIDGE (siempre presente) o identidad/'' si el helper no cargó.
GUARD = "{slot:function(){return ''},attr:function(v){return String(v==null?'':v)}}"
ALIAS = "var ilBV=window.ILATEK_BRIDGE||" + GUARD + ";"

A_LONG_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.dataset.websiteUrl)||'https://ilatekpr.com', phone=clean(root.dataset.businessPhone), email=clean(root.dataset.businessEmail), fb=clean(root.dataset.facebookUrl)||'https://www.facebook.com/ilatek.pr/', ig=clean(root.dataset.instagramUrl)||'https://www.instagram.com/ilatek.pr/';"
A_LONG_NEW = (ALIAS + "\n    var county=ilBV.attr(root.getAttribute('data-location-label'))||ilBV.slot(0)||'Puerto Rico', "
              "website=ilBV.attr(root.dataset.websiteUrl)||ilBV.slot(3)||'https://ilatekpr.com', "
              "phone=ilBV.attr(root.dataset.businessPhone)||ilBV.slot(2), "
              "email=ilBV.attr(root.dataset.businessEmail)||ilBV.slot(1), "
              "fb=ilBV.attr(root.dataset.facebookUrl)||ilBV.slot(4)||'https://www.facebook.com/ilatek.pr/', "
              "ig=ilBV.attr(root.dataset.instagramUrl)||ilBV.slot(5)||'https://www.instagram.com/ilatek.pr/';")

A_SHORT_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.dataset.websiteUrl)||'https://ilatekpr.com', fb=clean(root.dataset.facebookUrl)||'https://www.facebook.com/ilatek.pr/', ig=clean(root.dataset.instagramUrl)||'https://www.instagram.com/ilatek.pr/';"
A_SHORT_NEW = (ALIAS + "\n    var county=ilBV.attr(root.getAttribute('data-location-label'))||ilBV.slot(0)||'Puerto Rico', "
              "website=ilBV.attr(root.dataset.websiteUrl)||ilBV.slot(3)||'https://ilatekpr.com', "
              "fb=ilBV.attr(root.dataset.facebookUrl)||ilBV.slot(4)||'https://www.facebook.com/ilatek.pr/', "
              "ig=ilBV.attr(root.dataset.instagramUrl)||ilBV.slot(5)||'https://www.instagram.com/ilatek.pr/';")

A_BARE_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico';"
A_BARE_NEW = (ALIAS + " var county=ilBV.attr(root.getAttribute('data-location-label'))||ilBV.slot(0)||'Puerto Rico';")

A_SWAP_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.dataset.websiteUrl)||'https://ilatekpr.com', fb=clean(root.dataset.facebookUrl)||'https://www.facebook.com/ilatek.pr/', ig=clean(root.dataset.instagramUrl)||'https://www.instagram.com/ilatek.pr/', email=clean(root.dataset.businessEmail), phone=clean(root.dataset.businessPhone);"
A_SWAP_NEW = (ALIAS + "\n    var county=ilBV.attr(root.getAttribute('data-location-label'))||ilBV.slot(0)||'Puerto Rico', "
              "website=ilBV.attr(root.dataset.websiteUrl)||ilBV.slot(3)||'https://ilatekpr.com', "
              "fb=ilBV.attr(root.dataset.facebookUrl)||ilBV.slot(4)||'https://www.facebook.com/ilatek.pr/', "
              "ig=ilBV.attr(root.dataset.instagramUrl)||ilBV.slot(5)||'https://www.instagram.com/ilatek.pr/', "
              "email=ilBV.attr(root.dataset.businessEmail)||ilBV.slot(1), "
              "phone=ilBV.attr(root.dataset.businessPhone)||ilBV.slot(2);")

B1_OLD = "var primaryLocation=clean(root.getAttribute('data-primary-location'))||'Puerto Rico';"
B1_NEW = (ALIAS + " var primaryLocation=ilBV.attr(root.getAttribute('data-primary-location'))||ilBV.slot(0)||'Puerto Rico';")

B2_OLD = "var locationLabel=hostTown?hostTown+', '+primaryLocation:(clean(root.getAttribute('data-location-label'))||primaryLocation);"
B2_NEW = "var locationLabel=hostTown?hostTown+', '+primaryLocation:(ilBV.attr(root.getAttribute('data-location-label'))||ilBV.slot(0)||primaryLocation);"

B3_OLD = "var website=clean(root.getAttribute('data-website-url'))||'https://ilatekpr.com';"
B3_NEW = (ALIAS + "\n    var website=ilBV.attr(root.getAttribute('data-website-url'))||ilBV.slot(3)||'https://ilatekpr.com';")

C_OLD = ("var cel=document.querySelector('[data-location-label]');\n"
         "      if(cel){var cv=clean(cel.getAttribute('data-location-label'));if(cv)county=cv}")
C_NEW = ("var cel=document.querySelector('[data-location-label]');\n"
         "      " + ALIAS + "\n"
         "      if(cel){var cv=ilBV.attr(cel.getAttribute('data-location-label'))||ilBV.slot(0);if(cv)county=cv}")

# Upgrade de la primera pasada (statements que asumían el alias de un IIFE vecino):
ALIAS_PLAIN_OLD = "var ilBV=window.ILATEK_BRIDGE;"
C_BAD_OLD = ("var cel=document.querySelector('[data-location-label]');\n"
             "      if(cel){var cv=(ilBV?ilBV.attr(cel.getAttribute('data-location-label')):clean(cel.getAttribute('data-location-label')))||(ilBV?ilBV.slot(0):'');if(cv)county=cv}")
C_BAD_NEW = C_NEW
B3_HASNOALIAS_OLD = "var website=ilBV.attr(root.getAttribute('data-website-url'))||ilBV.slot(3)||'https://ilatekpr.com';"
B3_HASNOALIAS_NEW = (ALIAS + "\n    var website=ilBV.attr(root.getAttribute('data-website-url'))||ilBV.slot(3)||'https://ilatekpr.com';")
B2_HASNOALIAS_OLD = "var locationLabel=hostTown?hostTown+', '+primaryLocation:(ilBV.attr(root.getAttribute('data-location-label'))||ilBV.slot(0)||primaryLocation);"
B2_HASNOALIAS_NEW = (ALIAS + " var locationLabel=hostTown?hostTown+', '+primaryLocation:(ilBV.attr(root.getAttribute('data-location-label'))||ilBV.slot(0)||primaryLocation);")
D_HASNOALIAS_OLD = "var website=ilBV.attr(root.getAttribute('data-website-url')||'')||ilBV.slot(3)||'https://ilatekpr.com';"
D_HASNOALIAS_NEW = (ALIAS + "\n    var website=ilBV.attr(root.getAttribute('data-website-url')||'')||ilBV.slot(3)||'https://ilatekpr.com';")

D_OLD = "var website=clean((root.getAttribute('data-website-url')||''))||'https://ilatekpr.com';"
D_NEW = (ALIAS + "\n    var website=ilBV.attr(root.getAttribute('data-website-url')||'')||ilBV.slot(3)||'https://ilatekpr.com';")


def publishable_landings() -> list[Path]:
    out = []
    for p in sorted(ILATEK.rglob("*.html")):
        rel = p.relative_to(ILATEK).as_posix()
        if re.search(r"/\.tmp|tmp-|_preview|\.pre-|\.log$", "/" + rel):
            continue
        if any(part in {".backups-uiux", "archivo", "docs", "documentacion", "tools",
                        "node_modules", ".git", "src", "Comunidades"}
               for part in Path(rel).parts[:-1]):
            continue
        if "/landing-pages/" not in rel:
            continue
        if not re.match(r"ghl-.*-landing\.html$", p.name, re.I):
            continue
        out.append(p)
    return out


def patch(text: str) -> tuple[str, dict[str, int], list[str]]:
    applied: dict[str, int] = {}
    problems: list[str] = []

    # Upgrade de la primera pasada: cada statement con ilBV debe tener alias
    # propio. Ocurrencia a ocurrencia y SALTANDO las que ya tienen `var ilBV=`
    # justo antes, para que el upgrade sea idempotente (old queda como substring
    # dentro de new por construcción).
    for name, old, new, prefix_check in (
        ("up-plain-alias", ALIAS_PLAIN_OLD, ALIAS, False),
        ("up-C-bad", C_BAD_OLD, C_BAD_NEW, True),
        ("up-B3-noalias", B3_HASNOALIAS_OLD, B3_HASNOALIAS_NEW, True),
        ("up-B2-noalias", B2_HASNOALIAS_OLD, B2_HASNOALIAS_NEW, True),
        ("up-D-noalias", D_HASNOALIAS_OLD, D_HASNOALIAS_NEW, True),
    ):
        pos = 0
        n = 0
        while True:
            i = text.find(old, pos)
            if i < 0:
                break
            pos = i + len(old)
            if prefix_check and "var ilBV=" in text[max(0, i - 300):i]:
                continue  # ya self-suficiente: no apilar otro alias
            text = text[:i] + new + text[i + len(old):]
            pos = i + len(new)
            n += 1
        if n:
            applied[name] = n

    if MARKER in text:
        return text, (applied or {"already": 1}), problems

    # Los canónicos son fragmentos de Custom Code (sin <body>): el helper va al
    # inicio del fragmento, antes de cualquier resolver embebido.
    bodies = re.findall(r"<body\b[^>]*>", text, flags=re.I)
    if len(bodies) == 1:
        text = re.sub(r"(<body\b[^>]*>)", lambda m: m.group(1) + "\n" + HELPER, text, count=1, flags=re.I)
    elif len(bodies) == 0:
        text = HELPER + "\n" + text
    else:
        problems.append(f"<body> tags: {len(bodies)}")
        return text, applied, problems

    for name, old, new, expect in (
        ("A-long", A_LONG_OLD, A_LONG_NEW, 1),
        ("A-short", A_SHORT_OLD, A_SHORT_NEW, 1),
        ("A-bare", A_BARE_OLD, A_BARE_NEW, None),
        ("A-swap", A_SWAP_OLD, A_SWAP_NEW, 1),
        ("B1", B1_OLD, B1_NEW, 1),
        ("B2", B2_OLD, B2_NEW, 1),
        ("B3", B3_OLD, B3_NEW, None),
        ("C", C_OLD, C_NEW, 1),
        ("D", D_OLD, D_NEW, 1),
    ):
        n = text.count(old)
        if n == 0:
            if name in ("A-long", "A-short") and applied.get("A-long", 0) + applied.get("A-short", 0) == 0:
                pass  # report after loop: one of the two must have applied
            continue
        text = text.replace(old, new)
        applied[name] = n
    if not (applied.get("A-long") or applied.get("A-short") or applied.get("A-bare") or applied.get("A-swap")):
        problems.append("ninguna variante A (iltro) aplicada")
    return text, applied, problems


def main() -> None:
    dry = "--check" in sys.argv
    files_ok, skipped, failed = 0, 0, 0
    totals: dict[str, int] = {}
    for p in publishable_landings():
        rel = p.relative_to(ROOT).as_posix()
        text = p.read_text(encoding="utf-8", errors="replace")
        new, applied, problems = patch(text)
        if applied.get("already"):
            skipped += 1
            continue
        if problems:
            failed += 1
            print(f"FAIL {rel}: {'; '.join(problems)}")
            continue
        if not dry:
            p.write_text(new, encoding="utf-8", newline="")
        files_ok += 1
        for k, v in applied.items():
            totals[k] = totals.get(k, 0) + v
        print(f"OK   {rel}: {applied}")
    print(f"resumen: parcheados={files_ok} ya-parcheados={skipped} fallidos={failed} por-forma={totals}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
