#!/usr/bin/env python3
"""Download and optimize real archival photos for the newsletter preview.

Photographs are contextual archive imagery, NOT documentation of 4 Nov 2026.
Source and licenses: assets/photos/CREDITS.md
"""
import io
import json
from pathlib import Path
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

DEST = Path("assets/photos")
DEST.mkdir(parents=True, exist_ok=True)
IMAGES = {
    "hero-semeru.jpg": "Aerial view of lahar damage from Mount Semeru eruption.jpg",
    "news-kereta.jpg": "Kereta api.jpg",
    "news-badminton.jpg": "Shuttlecock on a badminton court.jpg",
    "news-factcheck.jpg": "Smartphone Use.jpg",
    "news-semeru.jpg": "Gunung Semeru erupsi 2025.jpg",
}
HEADERS = {"User-Agent": "Liputan6NewsletterPreview/1.0 (image-source-attribution; contact: https://github.com/aviyansah-kly/newsletter)"}

def get_bytes(title):
    query = urlencode({
        "action":"query", "format":"json", "prop":"imageinfo",
        "iiprop":"url", "iiurlwidth":"1000", "titles":"File:"+title
    })
    api = "https://commons.wikimedia.org/w/api.php?"+query
    try:
        with urlopen(Request(api, headers=HEADERS), timeout=30) as resp:
            data = json.load(resp)
        pages = data["query"]["pages"].values()
        info = next(iter(pages))["imageinfo"][0]
        src = info.get("thumburl") or info["url"]
    except Exception as e:
        print("API lookup fallback:", title, str(e))
        src = "https://commons.wikimedia.org/wiki/Special:FilePath/"+quote(title)+"?width=1000"
    with urlopen(Request(src, headers=HEADERS), timeout=50) as resp:
        raw = resp.read()
    if len(raw) < 3000:
        raise RuntimeError("Unexpected image data from "+src)
    return raw

for filename, title in IMAGES.items():
    data = get_bytes(title)
    with Image.open(io.BytesIO(data)) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((1100, 800))
        output = DEST / filename
        image.save(output, format="JPEG", quality=82, optimize=True, progressive=True)
        check = Image.open(output)
        check.verify()
        print(f"{filename}: {output.stat().st_size} bytes, source={title}")
