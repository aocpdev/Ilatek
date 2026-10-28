"""Runtime QA for the 3 legal pages (Python playwright, mirrors runtime_qa.mjs).

Drives the variants built by legal_harness.py over http://127.0.0.1:8932 and
asserts, per page:
  Variant original (RAW tokens, no GHL):
    - <title> rewritten by the fallback: no '{{' left, shows 'Puerto Rico'.
    - AFTER opening every <details> (real user action on the accordion),
      zero script/style text nodes keep a raw {{custom_values...}} token.
    - zero href/src attributes keep a raw token (mailto:/tel: fallbacks are '').
    - contact rows with '' fallbacks (empty mailto:/tel: links) carry hidden.
  Variant sentinel (GHL expanded):
    - title keeps the real 'TestCounty, Puerto Rico' value (fallback is a no-op).
    - with the accordion open, sentinel email/website/county are visible text.
    - no pageerror events.
Writes results to shots/legal-qa.json.
"""
from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8932"
PAGES = ["garantias", "privacidad", "terminos"]

SCAN = """() => {
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNodesRaw = 0; let n;
  while ((n = walker.nextNode())) {
    if (n.parentElement && n.parentElement.tagName !== 'SCRIPT' && n.parentElement.tagName !== 'STYLE'
        && /\\{\\{custom_values/.test(n.nodeValue)) textNodesRaw++;
  }
  const attrRaw = Array.from(document.body.querySelectorAll('[href],[src],[data-src]'))
    .filter(el => /\\{\\{custom_values/.test(el.getAttribute('href') || el.getAttribute('src') || el.getAttribute('data-src') || '')).length;
  const raw = document.body.innerText.match(/\\{\\{custom_values[^}]*\\}\\}/g) || [];
  const emptyLinks = Array.from(document.querySelectorAll('a[href="mailto:"],a[href="tel:"]')).map(a => {
    const t = (a.textContent || '').replace(/\\u00a0/g, '').trim();
    const line = a.closest('[data-net-ilatek-hide-target]') || a.closest('p') || a;
    return { empty: !t, lineHidden: line.hidden || a.hidden };
  });
  return {
    title: document.title,
    rawInTitle: document.title.match(/\\{\\{custom_values[^}]*\\}\\}/g) || [],
    textNodesRaw,
    attrRaw,
    rawVisible: raw,
    sentinelVisible: {
      email: document.body.innerText.includes('ilatek.pr@gmail.com'),
      website: document.body.innerText.includes('https://ilatekpr.com'),
      county: document.body.innerText.includes('TestCounty'),
    },
    emptyLinks,
  };
}"""


def run() -> dict:
    out: dict = {"pages": {}}
    page_errors_total: dict[str, list[str]] = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="msedge")
        page = browser.new_page()
        errors: dict[str, list[str]] = {}
        page.on("pageerror", lambda e: errors.setdefault(page.url.split("/")[-1].replace(".html", ""), []).append(str(e)[:200]))

        for name in PAGES:
            for variant in ("original", "sentinel"):
                url = f"{BASE}/{variant}-{name}.html"
                page.goto(url, wait_until="load", timeout=45000)
                page.wait_for_timeout(1500)
                scan = page.evaluate(SCAN)
                out["pages"][f"{variant}-{name}"] = scan
                if variant == "original":
                    page.screenshot(path=f"./shots/legal-{name}-original.png")
                    page.evaluate("() => document.querySelectorAll('details').forEach(d => { d.open = true; })")
        browser.close()
    page_errors_total = errors
    out["pageErrors"] = page_errors_total
    return out


def main() -> None:
    res = run()
    Path("shots").mkdir(exist_ok=True)
    Path("shots/legal-qa.json").write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")
    # ---------- assertions ----------
    failures: list[str] = []
    for name in PAGES:
        orig = res["pages"][f"original-{name}"]
        sent = res["pages"][f"sentinel-{name}"]
        if orig["rawInTitle"]:
            failures.append(f"{name} original: <title> still has raw token -> {orig['title'][:70]}")
        if "Puerto Rico" not in orig["title"]:
            failures.append(f"{name} original: <title> missing 'Puerto Rico' fallback -> {orig['title'][:70]}")
        if orig["textNodesRaw"]:
            failures.append(f"{name} original: {orig['textNodesRaw']} text node(s) still raw after fallback")
        if orig["attrRaw"]:
            failures.append(f"{name} original: {orig['attrRaw']} href/src attr(s) still raw after fallback")
        for link in orig["emptyLinks"]:
            if link["empty"] and not link["lineHidden"]:
                failures.append(f"{name} original: empty mailto/tel link row is NOT hidden: {link}")
        if sent["rawInTitle"]:
            failures.append(f"{name} sentinel: <title> corrupted -> {sent['title'][:70]}")
        if "TestCounty, Puerto Rico" not in sent["title"]:
            failures.append(f"{name} sentinel: <title> missing real value -> {sent['title'][:70]}")
        if sent["textNodesRaw"] or sent["attrRaw"]:
            failures.append(f"{name} sentinel: raw tokens in text({sent['textNodesRaw']})/attrs({sent['attrRaw']})")
        if not (sent["sentinelVisible"]["email"] and sent["sentinelVisible"]["website"]):
            # county/email/website solo aplica a páginas cuyo body usa esos tokens
            # (términos solo los usa en <title>: se verifica con rawTitle arriba)
            if name != "terminos":
                failures.append(f"{name} sentinel: GHL values not visible with accordion open: {sent['sentinelVisible']}")
    for seg, errs in res["pageErrors"].items():
        if errs:
            failures.append(f"{seg}: pageerror(s): {errs}")
    print("== LEGAL RUNTIME QA ==")
    for seg, d in res["pages"].items():
        print(f"  {seg}: title={d['title'][:58]!r} rawTitle={d['rawInTitle']} textRaw={d['textNodesRaw']} attrRaw={d['attrRaw']} emptyLinks={d['emptyLinks']} sentinel={d['sentinelVisible']}")
    if failures:
        print("FAILURES:")
        for f in failures:
            print("  --", f)
        raise SystemExit(1)
    print("ALL ASSERTIONS PASS (6 page loads)")


if __name__ == "__main__":
    main()
