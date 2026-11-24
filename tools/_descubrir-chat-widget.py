#!/usr/bin/env python3
"""Descubrimiento (SOLO LECTURA) del chat widget de GHL — v2, compacto.

1) token de agencia por CDP + companyId + lista de subcuentas.
2) abre Settings de un funnel existente y captura el XHR que llena el selector
   de chat widgets (#chat-widgets), que es de donde salen los widgets del
   subcuenta.

Solo GET / navegación. No escribe nada.
"""

import json
import pathlib
import sys
import urllib.request

from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = pathlib.Path(__file__).resolve().parents[2]
ENV = json.loads((ROOT / "Ilatek/.mcp.json").read_text(encoding="utf-8"))["mcpServers"]["ghl"]["env"]
LOC = ENV["ZJ_GHL_LOCATION"]
PIT = ENV["ZJ_GHL_PIT"]
CDP = "http://127.0.0.1:9222"
API = "https://backend.leadconnectorhq.com"
API_HOSTS = ("leadconnectorhq.com",)
RUIDO = ("static.", "appcdn.", "app-manifest", "images.", "assets.cdn", "cdn.")

JS_FETCH = """
async ([url, headers]) => {
  try {
    const r = await fetch(url, { headers, credentials: 'include' });
    const t = await r.text();
    return { status: r.status, body: t.slice(0, 900) };
  } catch (e) { return { status: -1, body: String(e) }; }
}
"""


def log(msg=""):
    print(msg, flush=True)


def funnels():
    out, offset = [], 0
    while True:
        url = (f"https://services.leadconnectorhq.com/funnels/funnel/list"
               f"?locationId={LOC}&limit=100&offset={offset}")
        req = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {PIT}", "Version": "2021-07-28",
            "Accept": "application/json", "User-Agent": "ilatek-audit"})
        with urllib.request.urlopen(req, timeout=60) as res:
            page = json.loads(res.read()).get("funnels", [])
        out.extend(page)
        if len(page) < 100:
            return out
        offset += 100


def main():
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        ctx = browser.contexts[0]
        page = next((pg for pg in ctx.pages if "app.gohighlevel.com" in pg.url), None)
        if page is None:
            page = ctx.new_page()
            page.goto(f"https://app.gohighlevel.com/v2/location/{LOC}/dashboard",
                      wait_until="domcontentloaded", timeout=90000)
            page.wait_for_timeout(6000)

        token = next((c["value"] for c in ctx.cookies("https://app.gohighlevel.com")
                      if c["name"] == "access-token-v1"), "")
        log(f"== token de agencia: {'OK (len %d)' % len(token) if token else 'NO ENCONTRADO'}")

        cid = page.evaluate("""() => {
            const out = [];
            try { for (const k of Object.keys(localStorage)) {
                const v = (localStorage.getItem(k) || '').trim();
                if (/company|agency/i.test(k) && /^[A-Za-z0-9]{15,}$/.test(v)) out.push([k, v]);
            } } catch (e) {}
            const m = (document.documentElement.innerHTML || '').match(/"companyId"\\s*:\\s*"([A-Za-z0-9]{15,})"/);
            if (m) out.push(['inline', m[1]]);
            return out;
        }""")
        for k, v in cid[:6]:
            log(f"   {k} = {v}")
        company = next((v for _, v in cid), "")
        log()

        if token:
            headers = {"Authorization": f"Bearer {token}", "channel": "APP",
                       "source": "WEB_USER", "Version": "2021-07-28"}
            log("== lista de subcuentas (GET interno) ==")
            probes = [f"{API}/locations/search?limit=100"]
            if company:
                probes.insert(0, f"{API}/locations/search?companyId={company}&limit=100")
            for url in probes:
                res = page.evaluate(JS_FETCH, [url, headers])
                log(f"   {res['status']:>4} {url}")
                if res["status"] == 200:
                    try:
                        data = json.loads(res["body"])
                        rows = data.get("locations") or data.get("data") or []
                        log(f"        {len(rows)} subcuentas devueltas")
                        for r in rows[:6]:
                            log(f"        - {r.get('name')} · {r.get('id') or r.get('_id')}")
                    except Exception:                    # noqa: BLE001
                        log(f"        {res['body'][:300]}")
                    break

        # --- capturar el XHR del selector de chat widgets --------------------
        log("\n== Settings de un funnel: XHR que llena el selector de chat widgets ==")
        fs = funnels()
        f = next((x for x in fs if x.get("name") == "PLANTILLA · Techos"), fs[0] if fs else None)
        if not f:
            log("   no hay funnels en la subcuenta activa")
            return
        log(f"   funnel: {f['name']} · {f['_id']}")

        vistos = []

        def on_req(r):
            u = r.url
            if any(h in u for h in API_HOSTS) and not u.startswith(tuple(
                    "https://" + x for x in RUIDO)) and not any(x in u for x in RUIDO):
                if (r.method, u) not in vistos:
                    vistos.append((r.method, u))

        page.on("request", on_req)
        url = (f"https://app.gohighlevel.com/v2/location/{LOC}/funnels-websites/"
               f"funnels/{f['_id']}/settings")
        page.goto(url, wait_until="domcontentloaded", timeout=90000)
        page.wait_for_timeout(12000)
        log(f"   título: {page.title()[:60]}")
        for m, u in vistos:
            log(f"   {m:6} {u[:170]}")

        # --- leer el widget tal como lo ve la UI -----------------------------
        log("\n== JSON de chat widgets (lectura) ==")
        cands = [u for m, u in vistos if m == "GET" and ("widget" in u.lower())]
        if token:
            headers = {"Authorization": f"Bearer {token}", "channel": "APP",
                       "source": "WEB_USER", "Version": "2021-07-28"}
            if not cands:
                cands = [f"{API}/funnels/chat-widget?locationId={LOC}",
                         f"{API}/chat-widgets?locationId={LOC}",
                         f"{API}/chat-widget/list?locationId={LOC}"]
            for url in cands[:4]:
                res = page.evaluate(JS_FETCH, [url, headers])
                log(f"   {res['status']:>4} {url[:130]}")
                if res["status"] == 200:
                    log(f"        {res['body'][:700]}")

        page.remove_listener("request", on_req)


if __name__ == "__main__":
    main()
