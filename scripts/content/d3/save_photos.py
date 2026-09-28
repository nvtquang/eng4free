"""Downloads the chosen CC0 photos, resizes them and records their credits.

  python scripts/content/d3/save_photos.py

Reads the choices below (query folder + candidate index from find_photos.py), saves
1024-px JPEGs to apps/web/public/demo-media/images/toeic/ and merges an entry per image
into apps/web/public/demo-media/images/credits.json (title, creator, source page, licence).
"""
import json
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
CACHE = ROOT / ".cache/photos"
OUT = ROOT / "apps/web/public/demo-media/images/toeic"
CREDITS = ROOT / "apps/web/public/demo-media/images/credits.json"
HEADERS = {"User-Agent": "english4free-content-tools/1.0 (demo content preparation)"}

CHOICES = {
    "laptop-bench": ("woman-typing-laptop-office", 0),
    "stirring-pot": ("chef-cooking-kitchen", 0),
    "metro-platform": ("train-station-platform-people", 5),
    "fruit-display": ("market-stall-vegetables", 0),
    "bicycle-racks": ("bicycles-parked-street", 5),
    "road-workers": ("construction-workers-helmets", 3),
    "fishing-boats": ("boats-harbor-dock", 1),
    "storage-shelves": ("warehouse-boxes-shelves", 2),
    "newspaper-bench": ("man-reading-newspaper-bench", 0),
    "waiter-terrace": ("waiter-serving-restaurant", 0),
    "airport-walkway": ("airport-passengers-luggage", 5),
    "training-room": ("people-meeting-conference-table", 4),
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    credits = json.loads(CREDITS.read_text(encoding="utf8")) if CREDITS.exists() else {}
    for name, (folder, index) in CHOICES.items():
        candidates = {item["index"]: item for item in json.loads((CACHE / folder / "candidates.json").read_text(encoding="utf8"))}
        item = candidates[index]
        assert item["license"] == "cc0", f"{name} is not CC0"
        target = OUT / f"{name}.jpg"
        if not target.exists():
            request = urllib.request.Request(item["url"], headers=HEADERS)
            with urllib.request.urlopen(request, timeout=60) as response:
                image = Image.open(BytesIO(response.read())).convert("RGB")
            image.thumbnail((1024, 1024))
            image.save(target, "JPEG", quality=82, optimize=True, progressive=True)
        creator = (item.get("creator") or "unknown photographer").strip()
        credits[f"toeic/{name}.jpg"] = {
            "title": item.get("title"), "creator": creator, "source": item.get("source"), "sourcePage": item.get("landing"),
            "license": "CC0 1.0", "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/", "via": "Openverse",
            "credit": f"Photo: {creator} ({item.get('source')}), CC0 1.0 via Openverse",
        }
        print(f"{name}: {target.stat().st_size // 1024} KB · {credits[f'toeic/{name}.jpg']['credit']}", flush=True)
    CREDITS.write_text(json.dumps(dict(sorted(credits.items())), ensure_ascii=False, indent=1) + "\n", encoding="utf8")


if __name__ == "__main__":
    main()
