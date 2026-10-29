"""Runtime harness for ghl-home-multiservicios.html (headless-browser proof).

Builds disposable copies in a temp directory, served over plain HTTP:

  sentinel.html — párrafo nativo + markup con todos los tokens expandidos a
                  sentinelas (lo que GHL hace con el markup de página; los
                  <script> quedan crudos, igual que GHL).
  resolver.html — párrafo crudo pero data-* expandidos: ejercita el canal
                  data-* del puente y los resolvers de página.
  original.html — copia byte a byte: sin párrafo expandido, el gate vence y la
                  página cae al fallback (nunca queda en blanco ni con tokens).
  late.html     — sin párrafo al cargar; el test lo inyecta después (GHL
                  poblando tarde): el bridge debe resolver al llegar.
  missing.html  — sin párrafo nunca: 'missing', fallback visible, sin píxel.
  double.html   — párrafo viejo de 6 slots + el de 7: gana el de 7 y el píxel
                  se enciende una sola vez.
  badpixel.html — slot pixel_id no numérico: no se carga ningún script de Meta.

Valores (sentinelas):
  business__county_name -> TestCounty
  business__email -> ilatek.pr@gmail.com
  business__phone -> +19393357351
  website_url -> https://ilatekpr.com
  facebook_url / instagram_url -> perfiles reales de Ilatek
  pixel_id -> 17841400000000000
"""
from __future__ import annotations

import json
import re
import shutil
import tempfile
from pathlib import Path

from repo_root import REPO

HERE = Path(__file__).resolve().parent
CONTRACT = json.loads((HERE / "custom-values.json").read_text(encoding="utf-8"))
SLOTS: list[str] = CONTRACT["bridge"]["slots"]
SEP: str = CONTRACT["bridge"]["separator"]
SRC = REPO / "home" / "es" / "landing-pages" / "ghl-home-multiservicios.html"

PIXEL = "17841400000000000"
SENTINELS = {
    "business__county_name": "TestCounty",
    "county_name_and_state": "TestCounty, Puerto Rico",
    "website_url": "https://ilatekpr.com",
    "business__phone": "+19393357351",
    "business__email": "ilatek.pr@gmail.com",
    "facebook_url": "https://www.facebook.com/ilatek.pr/",
    "instagram_url": "https://www.instagram.com/ilatek.pr/",
    "website_favicon": "https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6b081d8e4237be10b9a0a2da.png",
    "pixel_id": PIXEL,
}

BRIDGE_ATTRS = (
    "data-location-label",
    "data-website-url",
    "data-primary-location",
    "data-business-email",
    "data-business-phone",
    "data-facebook-url",
    "data-instagram-url",
)

OLD_SIX = {
    "business__county_name": "PuebloViejo",
    "business__email": SENTINELS["business__email"],
    "business__phone": SENTINELS["business__phone"],
    "website_url": "https://viejo.example",
    "facebook_url": SENTINELS["facebook_url"],
    "instagram_url": SENTINELS["instagram_url"],
}


def paragraph(values: dict[str, str], slots: list[str] | None = None) -> str:
    """Párrafo nativo dv-ghl-values con esos slots (token si falta el valor)."""
    slots = slots or SLOTS
    cells = [values.get(s) or "{{custom_values." + s + "}}" for s in slots]
    return '<p class="dv-ghl-values" id="dv-ghl-values">' + SEP.join(cells) + "</p>"


def after_body(html: str, block: str) -> str:
    """Párrafo nativo antes del Custom Code. El canónico es un fragmento GHL (sin
    <body>): ahí el orden de pegado es párrafo y después el Custom Code, así que
    el bloque va al inicio del fragmento."""
    if re.search(r"<body\b", html, flags=re.I):
        return re.sub(r"(<body\b[^>]*>)", lambda m: m.group(1) + "\n" + block, html, count=1, flags=re.I)
    return block + "\n" + html


def before_body_end(html: str, block: str) -> str:
    if re.search(r"</body\s*>", html, flags=re.I):
        return re.sub(r"(</body\s*>)", lambda m: block + "\n" + m.group(1), html, count=1, flags=re.I)
    return html + "\n" + block


def expand_tokens(text: str, mapping: dict[str, str], only_inside_attrs: list[str] | None = None) -> tuple[str, int]:
    """Replace {{custom_values.X}} with mapping[X].

    With only_inside_attrs given, restrict to attribute values carried by the
    listed attribute names; otherwise replace everywhere except inside script
    blocks (script contents must stay raw, mirroring GHL).
    """
    count = 0
    script_re = re.compile(r"(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>)", re.S | re.I)

    def walk(part: str) -> str:
        nonlocal count
        if only_inside_attrs is not None:
            attr_re = re.compile(
                r"(\b(?:" + "|".join(only_inside_attrs) + r")=\"[^\"]*\")"
            )

            def attr_sub(m: re.Match) -> str:
                nonlocal count
                val = m.group(1)
                new = val
                for name, value in mapping.items():
                    new = new.replace("{{custom_values." + name + "}}", value)
                if new != val:
                    count += val.count("{{")
                return new

            return attr_re.sub(attr_sub, part)

        def token_sub(m: re.Match) -> str:
            nonlocal count
            count += 1
            return mapping.get(m.group(1), m.group(0))

        return re.sub(r"\{\{custom_values\.([a-z_]+)\}\}", token_sub, part)

    def segment_sub(m: re.Match) -> str:
        seg = m.group(0)
        if re.match(r"<script", seg, re.I):
            return seg  # scripts stay raw, mirroring GHL
        return walk(seg)

    parts: list[str] = []
    pos = 0
    for m in script_re.finditer(text):
        parts.append(walk(text[pos:m.start()]))
        pos = m.end()
        parts.append(m.group(0))  # script/style blocks untouched by expansion
    parts.append(walk(text[pos:]))
    return "".join(parts), count


def main() -> None:
    tmp = Path(tempfile.mkdtemp(prefix="ila-runtime-qa-"))
    src = SRC.read_text(encoding="utf-8")
    print("TMP=" + str(tmp))

    # Base: párrafo nativo tokenizado + el HTML canónico (como lo sirve GHL).
    base = after_body(src, paragraph(SENTINELS))

    # Variant A: full markup expansion (scripts untouched) -> párrafo poblado.
    html_a, count_a = expand_tokens(base, SENTINELS)
    (tmp / "sentinel.html").write_text(html_a, encoding="utf-8")
    print(f"sentinel.html: {count_a} tokens expanded outside scripts/styles")

    # Variant B: only data-* bridge attributes expanded; the paragraph stays raw,
    # so the bridge must use its data-* channel.
    html_b, count_b = expand_tokens(base, SENTINELS, only_inside_attrs=list(BRIDGE_ATTRS))
    (tmp / "resolver.html").write_text(html_b, encoding="utf-8")
    print(f"resolver.html: {count_b} bridge attributes expanded (paragraph left raw)")

    # Variant C: untouched original (no paragraph): gate vence -> fallback.
    shutil.copyfile(SRC, tmp / "original.html")

    # Variant D/E: fixture liviana (mismo helper del canónico, sin el payload de
    # 890 KB) para medir el gate sin que el parseo se coma la ventana.
    helper = re.search(r"<!-- ILATEK · resolver global del puente.*?</script>", src, re.S).group(0)
    values = SEP.join(SENTINELS[s] for s in SLOTS)

    def slim(meta: str = "") -> str:
        return (
            '<!doctype html><html lang="es"><head><meta charset="utf-8">'
            + helper + meta +
            '</head><body>'
            '<h1>Servicios en {{custom_values.business__county_name}}</h1>'
            '<a id="cta" href="https://{{custom_values.website_url}}/cotizacion">Cotizar</a>'
            '<img alt="{{custom_values.business__county_name}}" src="x.png">'
            '</body></html>'
        )

    # Late: el párrafo lo inyecta el test (simula a GHL poblando después).
    (tmp / "late.html").write_text(
        slim('<meta name="ilatek-qa-bridge" content="' + values + '">'), encoding="utf-8"
    )

    # Sin párrafo nunca: 'missing' al vencer el gate.
    (tmp / "missing.html").write_text(slim(), encoding="utf-8")

    # Variant F: párrafo viejo de 6 slots + el de 7: gana el de 7, un solo píxel.
    six = paragraph(OLD_SIX, SLOTS[:6])
    seven = paragraph(SENTINELS)
    (tmp / "double.html").write_text(after_body(src, six + "\n" + seven), encoding="utf-8")

    # Variant G: pixel_id no numérico -> no se carga fbevents.js.
    bad = dict(SENTINELS)
    bad["pixel_id"] = "abc123"
    (tmp / "badpixel.html").write_text(after_body(src, paragraph(bad)), encoding="utf-8")

    names = ["sentinel", "resolver", "original", "late", "missing", "double", "badpixel"]
    (tmp / "index.html").write_text(
        "<!doctype html><meta charset=utf-8><title>ila runtime harness</title>"
        + " ".join(f"<a href=/{n}.html>{n}</a>" for n in names),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
