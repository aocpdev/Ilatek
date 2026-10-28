"""Raíz del repositorio: el único descubrimiento que usan las herramientas.

El marcador es el directorio `.git`: se sube desde este archivo hasta el primer
padre que lo contenga, así el clon puede llamarse y ubicarse donde sea (sin
profundidad fija ni carpeta `Ilatek/` grabada).

Uso (los scripts se ejecutan como `python tools/qa/<script>.py`, así que su
propio directorio ya está en sys.path):

    from repo_root import REPO
"""
from __future__ import annotations

from pathlib import Path


def _discover(start: Path) -> Path:
    for parent in start.parents:
        if (parent / ".git").exists():
            return parent
    raise RuntimeError(f"no encuentro la raíz del repo (.git) por encima de {start}")


REPO = _discover(Path(__file__).resolve())
