"""Shared page discovery for the reorganized GHL delivery folders."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STRUCTURE = json.loads((ROOT / "docs" / "estructura.json").read_text(encoding="utf-8"))


def page_files(group=None):
    return [ROOT / p["file"] for p in STRUCTURE["pages"] if group is None or p["group"] == group]


def page_group(file):
    return next(p["group"] for p in STRUCTURE["pages"] if ROOT / p["file"] == file)
