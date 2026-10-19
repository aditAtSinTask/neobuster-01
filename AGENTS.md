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
- Progress pemain ada di objek `save` (localStorage `neobuster-save-v1`) dan, kalau pemain masuk Cloud Save, ikut diunggah ke cloud (`js/core/cloud.js`). Setiap field baru di `save` harus diberi nilai bawaan di `normalizeSave()` (`js/core/main.js`), supaya save lama dan save dari cloud tetap bisa dimuat. Simpan perubahan lewat `writeSave()`, jangan menulis localStorage langsung: fungsi ini juga mencatat waktu perubahan dan memicu unggahan cloud. Request ke API cloud ditandatangani TOTP (`x-external-uid` + `x-external-totp`); jangan mengirim token API mentah di header.

## Aturan kerja

1. Setiap perubahan menaikkan `VERSION` di `js/core/engine.js` (patch untuk perbaikan, minor untuk fitur), menambah catatan di **paling atas** `CHANGELOG.md`, dan memperbarui baris "Versi saat ini" di `README.md`.
2. Jalankan `yarn format` (Prettier) sebelum commit. Cek dengan `yarn format:check`.
3. Repo memakai satu branch: `main`.
4. Jangan menambah dependensi, build step, atau file gambar/suara. Satu-satunya pengecualian adalah ikon aplikasi PWA di `icons/`, yang digambar oleh game sendiri: buat ulang dengan [tools/icons.js](tools/icons.js) kalau tampilan Nexo berubah.
5. Perbarui dokumentasi (`README.md`, `docs/`) di commit yang sama dengan perubahan yang dijelaskannya.
6. Game juga dimainkan di HP lewat tombol sentuh (`js/core/touch.js`). Petunjuk di layar game ditulis dengan nama tombol keyboard (`ENTER`, `ESC`, `X`, ...); tombol sentuh menampilkan padanannya, jadi aksi baru perlu tombol keyboard di `KEYMAP` dan, kalau dipakai di HP, tombol di `TOUCH_BUTTONS`. Layar menu memakai widget di `js/core/ui.js`: `drawHints()` untuk bar petunjuk tombol (keycap) dan `drawButtonRow()` untuk tombol menu. Keduanya otomatis tetap di bagian tengah yang tidak tertutup tombol sentuh saat HP dipegang miring (`touchClearWidth()`).
7. Game bisa dipasang sebagai aplikasi (PWA: `manifest.webmanifest`, `sw.js`, `js/core/pwa.js`). Service worker mengambil semua script yang dimuat `index.html` dengan sendirinya; file lain yang dibutuhkan saat offline (selain script) perlu ditambahkan ke daftar `FILES` di `sw.js`.

## Aturan konten baru (wajib)

Setiap benua (pulau), stage, dan boss baru harus memenuhi checklist di [docs/MENAMBAH-KONTEN.md, bagian "Aturan wajib"](docs/MENAMBAH-KONTEN.md#aturan-wajib-untuk-benua-stage-dan-boss-baru). Ringkasnya:

1. **Setiap stage unik dan menantang.** Area dan alurnya sendiri, rintangan dan mekanik khas temanya, platform dan rute yang berbeda dari semua stage lain (jangan menyalin geometri), dan musuh khasnya sendiri. Stage yang terasa seperti template tidak diterima. Panjangnya 450 kolom (pintu boss di kolom 426), dan 150 kolom terakhir sebelum pintu boss adalah bagian tersulitnya, dengan dua checkpoint sendiri.
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
5. Cheat (`P` + `O`) selalu terbuka saat game dibuka dari file atau dari `localhost` / `127.0.0.1` (mode development), jadi bisa dipakai untuk menguji. Di hosting asli, cheat baru terbuka setelah rekor Training Ground mencapai wave 50.
6. Kalau mengubah save atau Cloud Save: uji masuk akun baru (password diminta dua kali), masuk dari perangkat kosong (progress cloud termuat), perangkat dengan progress berbeda (diminta memilih), dan sinkron otomatis setelah ada perubahan. Pakai akun uji, bukan akun pemain.
