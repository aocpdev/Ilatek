#!/usr/bin/env python3
"""Genera la version corregida del homepage de Ilatek con los custom values horneados.

Reemplaza todos los tokens {{custom_values.*}} (y sus variantes URL-encodeadas
%7B%7B...) por los valores reales, usando el telefono nuevo +19393357351.
"""
import re
import sys
from pathlib import Path

# Uso: python fix_homepage.py [origen] [destino]
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/homepage-actual-ghl.html")
DST = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("output/ilatek-home-fixed.html")

WEBSITE = "https://ilatekpr.com"
COUNTY = "Puerto Rico"
PHONE = "+19393357351"
EMAIL = "ilatek.pr@gmail.com"
INSTAGRAM = "https://www.instagram.com/ilatek.pr/"
FACEBOOK = "https://www.facebook.com/ilatek.pr/"

# caso-insensible: p.ej. Custom_Values.BUSINESS__PHONE existe en plantillas de GHL
def sub_token(html: str, name: str, value: str) -> tuple[str, int]:
    pat = re.compile(r"\{\{\s*custom_values\." + re.escape(name) + r"\s*\}\}", re.IGNORECASE)
    out, n = pat.subn(value, html)
    # variante URL-encodeada dentro de data-ilatek-local-* (%7B%7B...%7D%7D)
    enc_name = name.replace("_", "_")  # el encode no toca underscores
    pat_enc = re.compile(r"%7B%7B\s*custom_values\." + re.escape(enc_name) + r"\s*%7D%7D", re.IGNORECASE)
    out, n2 = pat_enc.subn(value, out)
    return out, n + n2

html = SRC.read_text(encoding="utf-8")
total = 0
for name, value in [
    ("website_url", WEBSITE),
    ("county_name_and_state", COUNTY),
    ("business__phone", PHONE),
    ("business__email", EMAIL),
    ("instagram_url", INSTAGRAM),
    ("facebook_url", FACEBOOK),
]:
    html, n = sub_token(html, name, value)
    total += n
    print(f"{name:28s} reemplazos: {n}")

DST.parent.mkdir(exist_ok=True)
DST.write_text(html, encoding="utf-8")
print(f"TOTAL reemplazos: {total} -> {DST}")

# verificacion
leftover = re.findall(r"\{\{\s*custom_values\.[a-zA-Z_]+\s*\}\}", html, re.IGNORECASE)
print(f"tokens restantes: {len(leftover)} {leftover[:5]}")
enc_left = html.count("%7B%7Bcustom_values") + html.count("%7B%7Bcustom_values", 0, len(html)) + html.lower().count("%7b%7bcustom_values")
print(f"tokens URL-encodeados restantes: {enc_left}")
print(f"numero viejo 7873209447 presente: {html.count('7873209447')}")
print(f"telefono nuevo presente: {html.count('19393357351')}")
