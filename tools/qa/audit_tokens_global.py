#!/usr/bin/env python3
"""Audit global de tokens GHL custom_values en el set de Ilatek.

Mide, por archivo publicable:
- inventario de tokens {{custom_values.NAME}} (y desviaciones del set canonico)
- cobertura de puentes data-location-label / data-website-url / data-facebook/instagram-url
- presencia de resolvers runtime (clean(/data-location-label en scripts)
- fugas hardcodeadas: telefonos, hrefs literales a ilatekpr.com con slug, merge fields no-custom_values
Salida: shots/audit-tokens-global.json + resumen a stdout.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = next(p for p in Path(__file__).resolve().parents if (p / ".git").exists())  # raíz del repo (marcador .git)
CANON = {
    # Lista exacta del owner (Oct 2026): los 14 custom_values permitidos globalmente.
    "access_token",
    "business__county_domain",
    "business__county_name",
    "business__email",
    "business__phone",
    "business_id",
    "county_name_and_state",
    "facebook_url",
    "instagram_url",
    "pixel_id",
    "precio_total",
    "website_favicon",
    "website_url",
}
EXCLUDE_DIRS = {
    ".backups-uiux", "archivo", "docs", "documentacion", "tools",
    "node_modules", ".git", "src", "Comunidades",
}
INCLUDE_RE = re.compile(r"(ghl-|head-template|ilat)", re.I)
LEAK_EXCLUDE = re.compile(r"/\.tmp|tmp-|_preview|\.pre-|\bpre-[a-z]|\.log$")

TOKEN_RE = re.compile(r"\{\{\s*custom_values\.([a-zA-Z0-9_.]+?)\s*\}\}")
OTHER_MERGE_RE = re.compile(r"\{\{\s*(?!custom_values)(contact|user|location|account|payment|url_param)\.")
PHONE_RE = re.compile(r"\+\s?1?\s?\(?787\)?|\+\s?1?\s?\(?939\)?")
HARDCODED_HREF_RE = re.compile(r"https?://(?:www\.)?(?:juncos|adjuntas|aguada|bayamon|caguas|carolina|ponce|sanjuan|san-juan|sanjuanpr)?[a-z-]*\.?ilatekpr\.com/home|[a-z-]+\.ilatekpr\.com/(?!\"|</|\s|$)?.*?/[a-z0-9-]{2,}")
BRIDGE_ATTRS = ["data-location-label", "data-website-url", "data-facebook-url", "data-instagram-url"]


def classify_rel(rel: str) -> str:
    parts = Path(rel).parts
    if len(parts) == 1:
        return "root-html"
    first = parts[0]
    if "landing-pages" in rel:
        return "categoria-landing" if parts[0] == "categorias" else ("servicio-landing" if parts[0] == "servicios" else "home-landing")
    if first == "componentes":
        return "componente-embed"
    if first == "resenas":
        return "resenas"
    if first in ("politica-de-privacidad", "terminos-y-condiciones", "garantia"):
        return "legal-garantia"
    if first == "portal":
        return "portal"
    if first == "home":
        return "home-head"
    if first == "techos":
        return "techos-embeds"
    return f"otros-{first}"


def included(rel: Path) -> bool:
    pos = rel.as_posix()
    if LEAK_EXCLUDE.search(pos):
        return False
    parts = rel.parts
    if any(p in EXCLUDE_DIRS for p in parts[:-1]):
        return False
    name = rel.name
    if not INCLUDE_RE.search(name):
        return False
    if name.startswith("_"):
        return False
    return True


def audit_file(path: Path) -> dict:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        return {"file": str(path), "error": str(exc)}

    tokens_raw = TOKEN_RE.findall(text)
    token_counts = Counter(tokens_raw)
    noncanon = {k: v for k, v in token_counts.items() if k not in CANON}

    bridge_counts = {attr: len(re.findall(re.escape(attr) + '="', text)) for attr in BRIDGE_ATTRS}
    resolver_markers = {
        "clean(": len(re.findall(r"\bclean\(", text)),
        "currentScript": text.count("document.currentScript"),
        "ILATEK_LINKS": text.count("ILATEK_LINKS"),
    }
    other_merge = Counter(OTHER_MERGE_RE.findall(text))
    phone_hits = len(PHONE_RE.findall(text))
    hardcoded_hrefs = HARDCODED_HREF_RE.findall(text)
    hardcoded_juncos = len(re.findall(r"\bJuncos\b", text))

    return {
        "file": str(path),
        "category": classify_rel(str(path.relative_to(ROOT))),
        "bytes": len(text),
        "tokens": dict(token_counts),
        "tokensTotal": sum(token_counts.values()),
        "tokensNonCanon": noncanon,
        "bridges": bridge_counts,
        "resolvers": resolver_markers,
        "otherMerge": dict(other_merge),
        "phones": phone_hits,
        "hardcodedHrefs": len(hardcoded_hrefs),
        "hardcodedJuncos": hardcoded_juncos,
    }


def main() -> None:
    files = []
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT)
        if included(rel):
            files.append(p)
    files = list(dict.fromkeys(files))

    results = [audit_file(p) for p in files]
    ok = [r for r in results if "error" not in r]

    by_category = Counter(r["category"] for r in ok)
    no_token = [r["file"].replace(str(ROOT) + "\\", "") for r in ok if r["tokensTotal"] == 0]
    with_noncanon = [r for r in ok if r["tokensNonCanon"]]
    with_leaks = [
        r for r in ok
        if r["phones"] or r["hardcodedHrefs"] or r["otherMerge"] or (
            r["tokensTotal"] > 0 and sum(r["bridges"][a] for a in BRIDGE_ATTRS) == 0
        )
    ]

    summary = {
        "filesAudited": len(ok),
        "errors": [r for r in results if "error" in r],
        "byCategory": dict(by_category),
        "filesWithoutTokens": no_token,
        "filesWithNonCanonicalTokens": [
            {"file": r["file"].replace(str(ROOT) + "\\", ""), "tokens": r["tokensNonCanon"]} for r in with_noncanon
        ],
        "filesWithLeaksOrNoBridge": [
            {
                "file": r["file"].replace(str(ROOT) + "\\", ""),
                "phones": r["phones"],
                "hardcodedHrefs": r["hardcodedHrefs"],
                "otherMerge": r["otherMerge"],
                "bridges": r["bridges"],
                "tokensTotal": r["tokensTotal"],
            }
            for r in with_leaks
        ],
    }

    out = ROOT / "shots"
    out.mkdir(exist_ok=True)
    (out / "audit-tokens-global.json").write_text(
        json.dumps({"summary": summary, "files": results}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(f"files audited: {len(ok)}")
    for cat, n in sorted(by_category.items()):
        print(f"  {cat}: {n}")
    print(f"\nfiles WITHOUT any custom_values token ({len(no_token)}):")
    for f in no_token:
        print(f"  - {f}")
    print(f"\nfiles with NON-CANONICAL token names ({len(with_noncanon)}):")
    for r in with_noncanon:
        print(f"  - {r['file'].replace(str(ROOT) + chr(92), '')}: {r['tokensNonCanon']}")
    print(f"\nfiles with leaks (phone / hardcoded href / other merge / bridge-less tokens) ({len(with_leaks)}):")
    for item in summary["filesWithLeaksOrNoBridge"]:
        print(f"  - {item['file']}: phones={item['phones']} hrefs={item['hardcodedHrefs']} otherMerge={item['otherMerge'] or '-'} bridges={item['bridges'] if item['tokensTotal'] else '-'}")
    print(f"\njson -> shots/audit-tokens-global.json")


if __name__ == "__main__":
    main()
