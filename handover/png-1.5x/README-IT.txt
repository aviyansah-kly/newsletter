# Liputan6 — IT Handover (PNG 1.5x)

Isi paket:
- daily-morning.html — Alternatif 01, Editorial Storytelling
- daily-business.html — Alternatif 02, Morning Digest
- daily-editorial-cards.html — Alternatif 03, Catatan Pemred
- assets/*.png — pengganti semua gambar SVG dalam ketiga HTML
- assets/lucide-arrow-*.png dan assets/editors/*.jpg — aset raster asli
- assets/LUCIDE-LICENSE.txt — atribusi ikon Lucide

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
