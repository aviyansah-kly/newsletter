# Liputan6 Daily Newsletter

Prototype **Selamat Pagi dari Liputan6**, edisi 4 November 2026, untuk presentasi internal editorial & product.

## File
- `index.html` — preview browser dengan pilihan desktop dan mobile.
- `daily-email.html` — HTML tabel responsif untuk uji email.
- `assets/logo-email.png` — aset logo asli dari Figma New Homepage L6 (node `996:5609`, ukuran asli 172×32 px).

## Catatan
- Konten berita dan tautan mengarah ke artikel Liputan6 yang relevan pada edisi tersebut.
- Gambar utama masih diambil dari sumber ANTARA melalui URL HTTPS eksternal dan merupakan **foto arsip 2025**, bukan foto kejadian pada 2026.
- Branding mengikuti [Figma New Homepage L6](https://www.figma.com/design/Qz2ldnGXTD1lg25Qk5UCof/New-Homepage-L6?node-id=996-4715): logo asli, Inter, brand `#FF3300`, footer `#F9F9F9`, dan teks sekunder `#696F77`.
- `daily-email.html` menggunakan URL absolut `raw.githubusercontent.com` untuk gambar logo agar bisa dites di email. Sebelum kampanye publik, pindahkan semua aset ke domain HTTPS milik KLY/Liputan6, ganti URL img dan tambahkan unsubscribe resmi dari ESP.
- Inter dipakai untuk typography; klien email yang tidak mendukung font web otomatis memakai Arial/Helvetica.
- Jangan mengirimkan email produksi tanpa QA Gmail, Outlook, Apple Mail dan persetujuan editorial.

## Preview
Setelah GitHub Pages / Cloudflare Pages diaktifkan, gunakan `index.html` sebagai halaman utama. Repository saja tidak otomatis menerbitkan URL preview web.
