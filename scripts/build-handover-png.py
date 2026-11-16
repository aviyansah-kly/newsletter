#!/usr/bin/env python3
"""Build a self-contained IT handover bundle from the three newsletter HTML files.
All SVG-based <img> sources are rasterized at >=1.5x their largest HTML display width.
The rendered email versions use absolute public PNG URLs (required by email clients).
"""
from __future__ import annotations

import hashlib
import html as html_lib
import io
import math
import re
import shutil
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "handover" / "png-1.5x"
ASSETS = DEST / "assets"
FILES = {
    "daily-morning.html": "01 - Editorial Storytelling",
    "daily-business.html": "02 - Morning Digest",
    "daily-editorial-cards.html": "03 - Catatan Pemred",
}
PUBLIC = "https://aviyansah-kly.github.io/newsletter/handover/png-1.5x/assets/"
IMG_RE = re.compile(r"<img\b[^>]*>", re.I | re.S)
SRC_RE = re.compile(r"(\bsrc\s*=\s*)([\"'])(.*?)\2", re.I | re.S)
WIDTH_RE = re.compile(r"\bwidth\s*=\s*[\"']?(\d+)", re.I)
HEIGHT_RE = re.compile(r"\bheight\s*=\s*[\"']?(\d+)", re.I)


def attr_size(tag: str, pattern: re.Pattern, default: int) -> int:
    match = pattern.search(tag)
    return int(match.group(1)) if match else default


def external_svg(url: str) -> bool:
    return urllib.parse.urlsplit(html_lib.unescape(url)).path.lower().endswith(".svg")


def source_bytes(url: str) -> bytes:
    parsed = urllib.parse.urlsplit(url)
    if parsed.netloc == "aviyansah-kly.github.io" and parsed.path.startswith("/newsletter/"):
        relative = urllib.parse.unquote(parsed.path[len("/newsletter/"):])
        local = ROOT / relative
        if not local.resolve().is_relative_to(ROOT.resolve()) or not local.exists():
            raise RuntimeError("Missing source SVG in repository: " + relative)
        return local.read_bytes()
    request = urllib.request.Request(url, headers={"User-Agent": "NewsletterLiputan6IT/1.0"})
    with urllib.request.urlopen(request, timeout=25) as response:
        data = response.read(2 * 1024 * 1024)
        if response.status != 200 or not data:
            raise RuntimeError(f"Could not download {url}: HTTP {response.status}")
        return data


def build() -> None:
    if DEST.exists():
        shutil.rmtree(DEST)
    ASSETS.mkdir(parents=True, exist_ok=True)
    original = {name: (ROOT / name).read_text(encoding="utf-8") for name in FILES}
    specs = {}
    for file_text in original.values():
        for tag in IMG_RE.findall(file_text):
            source = SRC_RE.search(tag)
            if not source:
                continue
            url = html_lib.unescape(source.group(3))
            if not external_svg(url):
                continue
            display_width = attr_size(tag, WIDTH_RE, 24)
            display_height = attr_size(tag, HEIGHT_RE, 24)
            key = url
            if key not in specs:
                specs[key] = (display_width, display_height)
            else:
                prev = specs[key]
                specs[key] = (max(prev[0], display_width), max(prev[1], display_height))

    pngs = {}
    for url, (w, h) in sorted(specs.items()):
        basename = Path(urllib.parse.urlsplit(url).path).stem.lower()
        basename = re.sub(r"[^a-z0-9_-]", "-", basename)
        digest = hashlib.sha256(url.encode()).hexdigest()[:8]
        filename = f"{basename}-{digest}-1.5x.png"
        png = ASSETS / filename
        svg = source_bytes(url)
        if b"<svg" not in svg.lower():
            raise RuntimeError(f"Not valid SVG: {url}")
        # CairoSVG preserves the SVG aspect ratio when only output_width is specified.
        cairosvg.svg2png(bytestring=svg, write_to=str(png), output_width=int(math.ceil(w * 1.5)))
        with Image.open(png) as im:
            if im.width < math.ceil(w * 1.5):
                raise RuntimeError("PNG was smaller than requested 1.5x for " + url)
            im.verify()
        pngs[url] = filename
        print(f"Rasterized {url} -> {filename} (display max {w}px)")

    for name, text in original.items():
        changed = []

        def rewrite(match: re.Match) -> str:
            tag = match.group(0)
            src = SRC_RE.search(tag)
            if not src:
                return tag
            url = html_lib.unescape(src.group(3))
            if not external_svg(url):
                return tag
            name_png = pngs[url]
            changed.append(name_png)
            # Absolute HTTPS URLs work in ESP email HTML, unlike relative paths.
            return tag[:src.start(3)] + PUBLIC + name_png + tag[src.end(3):]

        text = IMG_RE.sub(rewrite, text)
        if re.search(r"<svg\b|<img[^>]+src=[\"'][^\"']+\.svg", text, re.I):
            raise RuntimeError("SVG remains in " + name)
        if not changed:
            raise RuntimeError("No SVG images found/replaced in " + name)
        (DEST / name).write_text(text, encoding="utf-8")
        print(f"Converted HTML: {name}, replaced {len(changed)} SVG image uses")

    readme = """# Liputan6 — IT Handover (PNG 1.5x)

Isi paket:
- daily-morning.html — Alternatif 01, Editorial Storytelling
- daily-business.html — Alternatif 02, Morning Digest
- daily-editorial-cards.html — Alternatif 03, Catatan Pemred
- assets/*.png — pengganti semua gambar SVG dalam ketiga HTML

Setiap SVG ditransformasikan menjadi PNG transparan dengan resolusi minimal 1,5x
dari lebar tampil terbesar di ketiga HTML. Ukuran atribut width/height HTML
dipertahankan agar layout tidak membesar.

IMPORTANT / IT:
1. HTML email menggunakan URL PNG absolut ke GitHub Pages, bukan URL lokal,
   agar dapat dimuat di aplikasi email. Aset disertakan agar IT bisa upload
   ke CDN produksi sendiri dan mengganti URL tersebut saat integrasi.
2. Beberapa thumbnail artikel dan foto editor masih memakai URL eksternal.
   Audit izin penggunaan, hosting, kestabilan URL, dan gambar fallback sebelum mengirim.
3. Ganti placeholder {{unsubscribe_url}} dan nama@email.com dengan variabel ESP,
   serta terapkan consent/opt-in dan mekanisme unsubscribe yang berfungsi.
4. Semua isi dan catatan atas nama Pemred merupakan materi contoh yang harus
   disetujui redaksi; jangan mengirim contoh tanpa validasi berita terbaru.
5. Uji rendering akhir di Gmail, Outlook, Apple Mail, dan ponsel; CSS gradient
   dan hover/animasi bisa ditampilkan berbeda pada setiap aplikasi email.
6. Tautan artikel, urutan tujuh berita, layout, dan desain asli tidak diubah
   dalam proses konversi aset ini.

Revision: 2026-11-16 / PNG 1.5x. Source: aviyansah-kly/newsletter.
"""
    (DEST / "README-IT.txt").write_text(readme, encoding="utf-8")
    archive = DEST / "Newsletter-Liputan6-3-Alternatif-PNG-1.5x.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for file in sorted(DEST.rglob("*")):
            if file.is_file() and file != archive:
                z.write(file, file.relative_to(DEST))
    with zipfile.ZipFile(archive) as z:
        if z.testzip() is not None:
            raise RuntimeError("ZIP CRC validation failed")
        names = set(z.namelist())
        if not set(FILES).issubset(names):
            raise RuntimeError("ZIP missing HTML templates")
    print(f"Ready: {archive} ({archive.stat().st_size:,} bytes), {len(pngs)} unique PNG assets")


if __name__ == "__main__":
    build()
