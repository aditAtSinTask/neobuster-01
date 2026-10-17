# Panduan untuk Developer dan AI Agent

File ini untuk siapa pun yang melanjutkan NEOBUSTER, manusia maupun AI coding agent (Claude Code membacanya lewat `CLAUDE.md`; Codex, Cursor, Copilot, dan agent lain membaca `AGENTS.md`). Isinya aturan kerja dan aturan konten yang **wajib** diikuti. Detailnya ada di dokumen yang ditautkan.

## Proyek

- Game action platformer bergaya Mega Man X untuk browser: HTML + JavaScript murni dan Canvas 2D, tanpa build step dan tanpa file aset. Semua grafik dan suara dibuat lewat kode.
- Jalankan dengan membuka `index.html` di browser.
- Teks di layar dan dokumentasi memakai Bahasa Indonesia; komentar di kode memakai bahasa Inggris.
- Penjelasan lengkap fitur ada di [README.md](README.md); riwayat perubahan di [CHANGELOG.md](CHANGELOG.md).

## Struktur kode

`js/` dikelompokkan per fungsi: `core/` (mesin dan alur game), `art/` (gambar), `characters/` (karakter native, satu folder per benua), `stages/` (data stage dan layout Azura), `gameplay/` (pemain, senjata, musuh, boss, hazard, cheat), `continents/` (satu file per benua tambahan), dan `world/` (peta dunia dan Training Ground).

- Semua script berbagi satu scope global dan dimuat berurutan di `index.html`. Urutan itu penting, dan nama `const` / `function` di level atas setiap file harus unik.
- Konten disimpan di tabel yang dikunci dengan key yang sama: stage, boss, dan senjata satu boss memakai satu key.
- `validateContent()` di `js/core/main.js` mencetak peringatan `[neobuster] ...` di console untuk data yang belum lengkap.

## Aturan kerja

1. Setiap perubahan menaikkan `VERSION` di `js/core/engine.js` (patch untuk perbaikan, minor untuk fitur), menambah catatan di **paling atas** `CHANGELOG.md`, dan memperbarui baris "Versi saat ini" di `README.md`.
2. Jalankan `yarn format` (Prettier) sebelum commit. Cek dengan `yarn format:check`.
3. Repo memakai satu branch: `main`.
4. Jangan menambah dependensi, build step, atau file gambar/suara.
5. Perbarui dokumentasi (`README.md`, `docs/`) di commit yang sama dengan perubahan yang dijelaskannya.

## Aturan konten baru (wajib)

Setiap benua (pulau), stage, dan boss baru harus memenuhi checklist di [docs/MENAMBAH-KONTEN.md, bagian "Aturan wajib"](docs/MENAMBAH-KONTEN.md#aturan-wajib-untuk-benua-stage-dan-boss-baru). Ringkasnya:

1. **Setiap stage unik dan menantang.** Area dan alurnya sendiri, rintangan dan mekanik khas temanya, platform dan rute yang berbeda dari semua stage lain (jangan menyalin geometri), dan musuh khasnya sendiri. Stage yang terasa seperti template tidak diterima.
2. **Setiap stage punya satu ruang rahasia dengan armor (+1x HP)** (`B.secret`). Dinding segelnya hanya hancur oleh senjata boss lain, dan ruangannya tampak seperti batu sampai segelnya hancur.
3. **Boss digambar native**, bukan dipotong dari lembar karakter. Wajahnya memakai wajah bersama, ciri khasnya kuat, serangannya berbeda dari boss lain, dan kelemahannya berantai. Lihat [docs/ART-STYLE.md](docs/ART-STYLE.md).
4. **Teks tanpa gender.** Nama tempat (`place`) dan kalimat perkenalan (`intro`) saja; di layar tidak ada kata "Benua".
5. **HP boss naik setiap benua** (`bossHp`: Azura 3, Vespera 5, berikutnya lebih besar).
6. **Senjata lengkap** (ikon kotak-kotak, tembakan biasa, charge, ultra, `lit` kalau bercahaya), **pulau alami di peta dunia** dengan landmark tiap stage, dan **musuh baru masuk `TRAIN_POOL`** Training Ground.

## Pengujian sebelum selesai

1. Buka game: console tidak boleh menampilkan error atau peringatan `[neobuster]`.
2. **Tes jangkauan** dengan [tools/reach.js](tools/reach.js): buka game, tempel isi file itu di console browser, jalankan `reachAll()`, lalu muat ulang halaman. Semua kolom harus `OK`: pintu boss dan setiap checkpoint terjangkau dari awal, armor tidak terjangkau selama segelnya utuh, dan terjangkau setelah segelnya hancur.
3. Mainkan langsung bagian yang bergantung waktu (press, laser, blok energi, cairan naik), karena tes jangkauan tidak mensimulasikan waktu.
4. Pastikan ruang rahasia bisa dibuka dengan senjata segelnya, dan tembakan senjata lain memantul.
