"""Finds CC0 photo candidates for TOEIC Part 1 on Openverse and builds contact sheets.

  python scripts/content/d3/find_photos.py "office worker typing" "man on ladder" ...

For each query it keeps up to 6 landscape CC0 results (≥ 900 px wide) and saves their
thumbnails plus a contact sheet in .cache/photos/<query>/ so a person can pick one.
Only licence "cc0" is accepted; the full record (creator, source page) is kept in
candidates.json for the credit line.
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / ".cache/photos"
HEADERS = {"User-Agent": "english4free-content-tools/1.0 (demo content preparation)"}


def get(url: str) -> bytes:
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=40) as response:
        return response.read()


def search(query: str) -> list[dict]:
    params = urllib.parse.urlencode({"q": query, "license": "cc0", "page_size": 20, "aspect_ratio": "wide"})
    data = json.loads(get(f"https://api.openverse.org/v1/images/?{params}"))
    results = [r for r in data.get("results", []) if r.get("license") == "cc0" and (r.get("width") or 0) >= 900]
    return results[:6]


def main() -> None:
    for query in sys.argv[1:]:
        folder = OUT / query.replace(" ", "-")
        folder.mkdir(parents=True, exist_ok=True)
        results = search(query)
        sheet = Image.new("RGB", (3 * 400, 2 * 300), "white")
        kept = []
        for index, result in enumerate(results):
            try:
                thumb = Image.open(BytesIO(get(result.get("thumbnail") or result["url"]))).convert("RGB")
            except Exception:  # noqa: BLE001 - skip unreachable thumbnails
                continue
            thumb.thumbnail((396, 270))
            x, y = (index % 3) * 400, (index // 3) * 300
            sheet.paste(thumb, (x + 2, y + 2))
            ImageDraw.Draw(sheet).text((x + 6, y + 276), f"#{index} {result.get('source')} {result.get('width')}x{result.get('height')}", fill="black")
            kept.append({"index": index, "id": result["id"], "title": result.get("title"), "creator": result.get("creator"), "source": result.get("source"), "url": result["url"], "landing": result.get("foreign_landing_url"), "license": result["license"], "license_version": result.get("license_version"), "width": result.get("width"), "height": result.get("height")})
            time.sleep(0.2)
        sheet.save(folder / "sheet.jpg", quality=85)
        (folder / "candidates.json").write_text(json.dumps(kept, indent=1), encoding="utf8")
        print(f"{query}: {len(kept)} candidates → {folder.relative_to(ROOT)}/sheet.jpg", flush=True)


if __name__ == "__main__":
    main()
