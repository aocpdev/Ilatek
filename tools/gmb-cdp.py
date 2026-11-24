#!/usr/bin/env python3
"""Ilatek · puente CDP al Chrome del propietario para Google Business Profile.

Regla de AGENTS.md: nunca cerrar la ventana ni la pestaña del propietario. Este
script solo se CONECTA por CDP (Chrome con --remote-debugging-port=9222) y al
terminar corta el enlace con pw.stop(). No ejecuta page.close(), ni
browser.close(), ni mata procesos de Chrome; cualquier pestaña que abra queda
abierta al salir.

Comandos:
  python tools/gmb-cdp.py pages
  python tools/gmb-cdp.py dump [--contains TEXTO] [--chars 6000]
  python tools/gmb-cdp.py goto --url https://business.google.com/...
  python tools/gmb-cdp.py click --name "Editar perfil" [--role button]
  python tools/gmb-cdp.py fill --name "Nombre del servicio" --value "Limpieza regular"
  python tools/gmb-cdp.py press --key Enter
  python tools/gmb-cdp.py eval --js "document.title"
  python tools/gmb-cdp.py shot --out .tmp-gmb/gmb.png

Opcional en todos: --tab TEXTO_EN_URL para elegir la pestaña por URL.
"""

import argparse
import os
import re
import sys

from playwright.sync_api import sync_playwright

ENDPOINT = "http://127.0.0.1:9222"


def connect(pw):
    try:
        browser = pw.chromium.connect_over_cdp(ENDPOINT, timeout=15000)
    except Exception as exc:  # conexión rechazada o Chrome sin el puerto
        sys.exit(
            "No pude conectar a %s: %s\n"
            "Abre Chrome con: chrome.exe --remote-debugging-port=9222 --restore-last-session"
            % (ENDPOINT, exc)
        )
    if not browser.contexts:
        sys.exit("Chrome respondió pero no hay ningún contexto de navegador abierto.")
    return browser.contexts[0]


def pick_page(context, tab_hint=None):
    pages = [p for p in context.pages if p.url and not p.url.startswith("devtools://")]
    if not pages:
        sys.exit("No hay pestañas normales abiertas en Chrome.")
    if tab_hint:
        for page in pages:
            if tab_hint in page.url:
                return page
    for page in pages:
        if "business.google.com" in page.url:
            return page
    for page in pages:
        if "google.com" in page.url:
            return page
    return pages[0]


def page_snapshot(page, max_chars):
    try:
        text = page.locator("body").aria_snapshot()
    except Exception:
        text = page.inner_text("body")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text[:max_chars]


def find_locator(page, role, name):
    pattern = re.compile(re.escape(name), re.I)
    if role:
        return page.get_by_role(role, name=pattern).first
    for candidate in (
        page.get_by_role("button", name=pattern).first,
        page.get_by_role("link", name=pattern).first,
        page.get_by_role("tab", name=pattern).first,
        page.get_by_role("menuitem", name=pattern).first,
        page.get_by_role("option", name=pattern).first,
        page.get_by_label(pattern).first,
        page.get_by_text(pattern).first,
    ):
        try:
            if candidate.count():
                return candidate
        except Exception:
            continue
    sys.exit("No encontré ningún elemento que contenga: %r" % name)


def main():
    parser = argparse.ArgumentParser(description="CDP bridge para Google Business Profile")
    parser.add_argument("command", choices=["pages", "dump", "goto", "click", "fill", "press", "eval", "shot"])
    parser.add_argument("--tab", default=None, help="texto que debe contener la URL de la pestaña")
    parser.add_argument("--contains", default=None, help="filtrar líneas del volcado")
    parser.add_argument("--chars", type=int, default=6000)
    parser.add_argument("--url", default=None)
    parser.add_argument("--name", default=None, help="texto visible o etiqueta accesible del elemento")
    parser.add_argument("--role", default=None)
    parser.add_argument("--value", default=None)
    parser.add_argument("--key", default=None)
    parser.add_argument("--js", default=None)
    parser.add_argument("--out", default=None)
    parser.add_argument("--timeout", type=int, default=8000)
    args = parser.parse_args()

    with sync_playwright() as pw:
        context = connect(pw)
        try:
            if args.command == "pages":
                for page in context.pages:
                    if page.url.startswith("devtools://"):
                        continue
                    print("%s | %s" % (page.title()[:70], page.url[:140]))
                return

            page = pick_page(context, args.tab)
            page.bring_to_front()

            if args.command == "dump":
                text = page_snapshot(page, args.chars)
                if args.contains:
                    keep = [line for line in text.splitlines() if re.search(args.contains, line, re.I)]
                    print("\n".join(keep) or "(sin coincidencias)")
                else:
                    print(text)
                print("\n--- URL: %s" % page.url)

            elif args.command == "goto":
                if not args.url:
                    sys.exit("--url es obligatorio")
                page.goto(args.url, wait_until="domcontentloaded", timeout=45000)
                page.wait_for_timeout(1500)
                print("URL: %s" % page.url)

            elif args.command == "click":
                if not args.name:
                    sys.exit("--name es obligatorio")
                locator = find_locator(page, args.role, args.name)
                locator.click(timeout=args.timeout)
                page.wait_for_timeout(1200)
                print("Clic en: %s | URL: %s" % (args.name, page.url))

            elif args.command == "fill":
                if not args.name or args.value is None:
                    sys.exit("--name y --value son obligatorios")
                locator = find_locator(page, args.role, args.name)
                locator.fill(args.value, timeout=args.timeout)
                print("Escrito en: %s" % args.name)

            elif args.command == "press":
                if not args.key:
                    sys.exit("--key es obligatorio")
                page.keyboard.press(args.key)
                page.wait_for_timeout(800)
                print("Tecla: %s" % args.key)

            elif args.command == "eval":
                if not args.js:
                    sys.exit("--js es obligatorio")
                print(repr(page.evaluate(args.js)))

            elif args.command == "shot":
                out = args.out or os.path.join(".tmp-gmb", "gmb.png")
                os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
                page.screenshot(path=out)
                print("Captura: %s" % out)
        finally:
            # Solo corta el enlace CDP; no cierra ventanas ni pestañas.
            pw.stop()


if __name__ == "__main__":
    main()
