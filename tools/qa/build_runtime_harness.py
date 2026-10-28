"""Runtime harness for ghl-home-multiservicios.html (headless-browser proof).

Builds three disposable copies in a temp directory, served over plain HTTP:
  a. sentinel.html — every custom_values token OUTSIDE <script> expanded to
     sentinel values (simulates what GHL does to page markup; script contents
     stay raw exactly like GHL, whose runtime shims/resolvers clean them).
  b. resolver.html — ONLY the data-* bridge attributes expanded to sentinels,
     every other token left raw: this genuinely exercises the four values{}
     resolvers and the two resolve() functions at runtime.
  c. original.html — byte-for-byte copy: verifies the clean()-discard
     fallback (nothing user-visible keeps {{...}} or phone/email).

Values:
  business__county_name -> TestCounty
  county_name_and_state -> TestCounty, Puerto Rico
  website_url -> https://ilatekpr.com
  business__phone -> +19393357351
  business__email -> ilatek.pr@gmail.com
  facebook_url / instagram_url -> the real Ilatek profiles
  website_favicon -> real GHL favicon URL
"""
from __future__ import annotations

import re
import shutil
import tempfile
from pathlib import Path

REPO = next(p for p in Path(__file__).resolve().parents if (p / ".git").exists())
SRC = REPO / "home" / "es" / "landing-pages" / "ghl-home-multiservicios.html"

SENTINELS = {
    "business__county_name": "TestCounty",
    "county_name_and_state": "TestCounty, Puerto Rico",
    "website_url": "https://ilatekpr.com",
    "business__phone": "+19393357351",
    "business__email": "ilatek.pr@gmail.com",
    "facebook_url": "https://www.facebook.com/ilatek.pr/",
    "instagram_url": "https://www.instagram.com/ilatek.pr/",
    "website_favicon": "https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6b081d8e4237be10b9a0a2da.png",
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

    # Variant A: full markup expansion (scripts untouched).
    html_a, count_a = expand_tokens(src, SENTINELS)
    (tmp / "sentinel.html").write_text(html_a, encoding="utf-8")
    print(f"sentinel.html: {count_a} tokens expanded outside scripts/styles")

    # Variant B: only data-* bridge attributes expanded, everything else raw.
    html_b, count_b = expand_tokens(src, SENTINELS, only_inside_attrs=list(BRIDGE_ATTRS))
    (tmp / "resolver.html").write_text(html_b, encoding="utf-8")
    print(f"resolver.html: {count_b} bridge attributes expanded (rest left raw)")

    # Variant C: untouched original.
    shutil.copyfile(SRC, tmp / "original.html")
    (tmp / "index.html").write_text(
        "<!doctype html><meta charset=utf-8><title>ila runtime harness</title>"
        "<a href=/sentinel.html>sentinel A</a> <a href=/resolver.html>resolver B</a> "
        "<a href=/original.html>original C</a>",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
