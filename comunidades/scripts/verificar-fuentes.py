#!/usr/bin/env python3
"""Comprueba que las URLs de evidencia de un lote de research responden de verdad.

Uso: python scripts/verificar-fuentes.py research/central [research/sur ...]
Salida: tabla de estado HTTP por URL + resumen. Códigos 4xx/5xx o timeouts se
marcan como MUERTA; 403 de portales que bloquean bots se marcan como BLOQUEO
(no se puede distinguir de página caída, pero no es evidencia rota).
"""
import concurrent.futures as cf
import pathlib
import sys
import urllib.error
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")
TIMEOUT = 15


def check(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": UA,
                                               "Accept": "text/html,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return url, r.status, "OK"
    except urllib.error.HTTPError as e:
        code = e.code
        if code in (401, 403, 429):
            return url, code, "BLOQUEO"
        return url, code, "MUERTA"
    except Exception as e:  # timeout, DNS, SSL, etc.
        return url, 0, f"ERROR:{type(e).__name__}"


def main():
    dirs = sys.argv[1:] or ["research"]
    urls = {}
    for d in dirs:
        for f in sorted(pathlib.Path(d).glob("*.json")):
            if f.name.startswith("_raw"):
                continue
            import json
            data = json.loads(f.read_text(encoding="utf-8"))
            for c in data.get("communities", []):
                for u in c.get("sources", []):
                    urls.setdefault(u, []).append(f"{data['municipality']}/{c['name']}")

    print(f"URLs únicas a verificar: {len(urls)}\n")
    rows = []
    with cf.ThreadPoolExecutor(max_workers=12) as ex:
        for url, status, verdict in ex.map(check, urls):
            rows.append((status, verdict, url, urls[url]))

    rows.sort(key=lambda r: (r[1] == "OK", r[0]))
    for status, verdict, url, refs in rows:
        if verdict != "OK":
            print(f"  [{status or '-'}] {verdict:14} {url}\n        <- {', '.join(refs)}")

    ok = sum(1 for r in rows if r[1] == "OK")
    bloq = sum(1 for r in rows if r[1] == "BLOQUEO")
    dead = len(rows) - ok - bloq
    print(f"\nResumen: {ok} OK · {bloq} bloqueo anti-bot · {dead} sin acceso ({len(rows)} total)")
    if dead:
        print("Revisar manualmente las URLs 'MUERTA'/'ERROR' antes de publicar landings.")


if __name__ == "__main__":
    main()
