# Liputan6 Daily Newsletter

Prototype **Selamat Pagi dari Liputan6**, edisi 4 November 2026, untuk presentasi internal editorial & product.

## File
- `index.html` — preview browser dengan pilihan desktop dan mobile.
- `daily-email.html` — HTML tabel responsif untuk uji email.
- `assets/logo-email.png` — wordmark PNG lokal agar preview tidak bergantung pada URL logo Wikimedia.

## Catatan
- Konten berita dan tautan mengarah ke artikel Liputan6 yang relevan pada edisi tersebut.
- Gambar utama masih diambil dari sumber ANTARA melalui URL HTTPS eksternal dan merupakan **foto arsip 2025**, bukan foto kejadian pada 2026.
- **Logo PNG adalah rekonstruksi visual lokal dari prototype**, belum ekstrak original komponen Figma Liputan6. Tim brand perlu mengganti dengan export logo final resmi sebelum publikasi.
- `daily-email.html` menggunakan URL absolut `raw.githubusercontent.com` untuk gambar logo agar bisa dites di email. Sebelum kampanye publik, pindahkan semua aset ke domain HTTPS milik KLY/Liputan6, ganti URL img dan tambahkan unsubscribe resmi dari ESP.
- Inter dipakai untuk typography; klien email yang tidak mendukung font web otomatis memakai Arial/Helvetica.
- Jangan mengirimkan email produksi tanpa QA Gmail, Outlook, Apple Mail dan persetujuan editorial.

## Preview
Setelah GitHub Pages / Cloudflare Pages diaktifkan, gunakan `index.html` sebagai halaman utama. Repository saja tidak otomatis menerbitkan URL preview web.
