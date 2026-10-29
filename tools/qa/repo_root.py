"""Raíz del repositorio y navegador: lo único que usan las herramientas Python.

La raíz se descubre con el marcador `.git` (se sube desde este archivo hasta el
primer padre que lo contenga), así el clon puede llamarse y ubicarse donde sea.

Playwright: un solo lugar decide cómo arrancar Chromium. Si el build propio de
Playwright no está descargado, reutiliza el que ya viva en `ms-playwright`
(Windows/Linux) en vez de exigir otra instalación.

Uso (los scripts se ejecutan como `python tools/qa/<script>.py`, así que su
propio directorio ya está en sys.path):

    from repo_root import REPO, launch_chromium
"""
from __future__ import annotations

import os
from pathlib import Path


def _discover(start: Path) -> Path:
    for parent in start.parents:
        if (parent / ".git").exists():
            return parent
    raise RuntimeError(f"no encuentro la raíz del repo (.git) por encima de {start}")


def launch_chromium(pw):  # pw: playwright.sync_api.sync_playwright()
    """Chromium de Playwright: el build propio o el ya instalado en ms-playwright."""
    try:
        return pw.chromium.launch()
    except Exception as exc:  # noqa: BLE001
        base = Path(os.environ.get("LOCALAPPDATA") or "~/.cache").expanduser() / "ms-playwright"
        for pat in ("chromium-*/chrome-win64/chrome.exe", "chromium-*/chrome-linux/chrome"):
            for exe in sorted(base.glob(pat), reverse=True):
                try:
                    return pw.chromium.launch(executable_path=str(exe))
                except Exception:  # noqa: BLE001
                    continue
        raise RuntimeError(f"sin Chromium para Playwright: {type(exc).__name__}") from exc


REPO = _discover(Path(__file__).resolve())
