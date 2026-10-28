"""Runtime harness for the 3 legal pages (headless-browser proof).

Builds two disposable variants per legal page in a temp dir, served over HTTP:
  sentinel-<name>.html — every custom_values token OUTSIDE <script> expanded to
      sentinel values (simulates a correctly-configured GHL location).
  original-<name>.html — byte-for-byte copy with RAW tokens (simulates GHL
      leaving tokens unexpanded; the fallback walkers must clean it up).

Reuses expand_tokens()/SENTINELS from build_runtime_harness.py (single source of
truth for the sentinel values, mirroring the home multisservicios matrix).

Variant B (bridge-only) intentionally does not exist here: the legal pages have
no data-* bridges; their fallback reads body text nodes and <title> directly.
"""
from __future__ import annotations

import shutil
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_runtime_harness import SENTINELS, expand_tokens  # noqa: E402

from repo_root import REPO
PAGES = {
    "garantias": REPO / "garantia" / "ILATEK-Garantias.html",
    "privacidad": REPO / "politica-de-privacidad" / "ILATEK-Politica-Privacidad.html",
    "terminos": REPO / "terminos-y-condiciones" / "ILATEK-Terminos-Condiciones.html",
}


def main() -> None:
    tmp = Path(tempfile.mkdtemp(prefix="ila-legal-qa-"))
    print("TMP=" + str(tmp))
    for name, src_path in PAGES.items():
        src = src_path.read_text(encoding="utf-8")
        html_a, count_a = expand_tokens(src, SENTINELS)
        (tmp / f"sentinel-{name}.html").write_text(html_a, encoding="utf-8")
        shutil.copyfile(src_path, tmp / f"original-{name}.html")
        print(f"{name}: sentinel-{name}.html ({count_a} tokens expanded outside scripts) + original-{name}.html (raw)")
    (tmp / "index.html").write_text(
        "<!doctype html><meta charset=utf-8><title>ila legal harness</title>"
        + " ".join(f'<a href="/{f.name}">{f.name}</a>' for f in sorted(tmp.glob("*.html"))),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
