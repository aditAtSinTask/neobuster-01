# Panduan Art: Karakter Anime

Patokan gaya karakter NEOBUSTER. Dirangkum dari panduan pixel art anime Raymond Schlitter (SLYNYRD) dan prinsip pixel art umum (outline selektif, cluster, anti-alias manual). Semua karakter baru harus mengikuti aturan ini.

## 1. Cara menggambar

- **Wajah dan rambut digambar pixel demi pixel** (peta pixel di kode), bukan dari bentuk geometris yang dirasterisasi otomatis. Bentuk otomatis menghasilkan gerigi (jaggies) dan cluster acak yang membuat wajah terlihat aneh.
- **Siluet dulu.** Isi seluruh kepala dengan satu warna dan pastikan bentuknya terbaca (jambul, poni, dagu), baru tambahkan detail.
- **Uji di ukuran asli.** Detail yang tidak terbaca di ukuran game dibuang, bukan dipaksakan.

## 2. Kepala (tampilan 3/4 menghadap kanan)

- **Tengkorak besar dan bulat**, wajah kecil di bagian bawah depan.
- **Garis mata di bawah tengah kepala** (sekitar 55–60% dari atas tengkorak). Wajah di bawah mata pendek.
- **Rahang** turun dari bawah tulang pipi, miring ke dalam, ke **dagu yang sempit dan lancip**. Dagu tidak menonjol ke depan.
- **Telinga** setinggi mata. **Leher** ramping.
- Tampak 3/4: garis depan wajah turun lurus dari dahi, **hidung hanya 1 pixel** yang menonjol di tepi depan, lalu masuk lagi ke mulut dan dagu.

## 3. Mata (bagian terpenting)

- **Besar dan berjarak lebar**: jarak antarmata sekitar satu lebar mata (di tampak depan).
- **Garis bulu mata atas tebal** (2 pixel di potret, 1 pixel di sprite), memanjang melewati sudut luar mata.
- **Iris gelap** menempel ke garis bulu mata atas, dengan **satu pixel kilau** di sudut yang sama di kedua mata (kilau yang berbeda posisi terlihat seperti juling).
- **Sklera** (putih mata) terlihat di sisi iris; garis bawah tipis atau hanya titik, berwarna bayangan kulit, bukan hitam.
- **Alis tipis 1 pixel**, berjarak 1–2 pixel di atas mata. Pada karakter berponi, alis boleh tertutup poni.
- Tampak 3/4: **mata jauh lebih sempit** dan lebih dekat ke garis hidung.

## 4. Hidung dan mulut

- **Hidung hampir tidak ada**: 1–2 pixel bayangan. Di tampak samping dan 3/4, cukup satu titik kecil di tepi wajah.
- **Mulut kecil**: garis 2–3 pixel, warna gelap kemerahan, bukan hitam. Bibir bawah cukup satu pixel bayangan.

## 5. Rambut

- **Volume dulu, helai belakangan.** Rambut dibangun dari gumpalan besar (clump) yang mengalir dari pusaran di belakang atas kepala.
- **Jambul** berupa segitiga dengan **panjang dan arah yang bervariasi**, bukan seragam.
- **Poni** 3–5 gumpalan runcing yang jatuh ke dahi sampai menyentuh garis mata.
- **Shading per gumpalan**, bukan per helai: 4 tingkat (gelap di bawah gumpalan, dasar, terang, kilau) dengan cahaya dari kiri atas.

## 6. Garis dan warna

- **Outline berwarna gelap**, bukan hitam murni: cokelat tua untuk kulit dan rambut cokelat. Bagian dalam memakai versi gelap warna bagiannya sendiri (outline selektif).
- **Palet terbatas** per bagian:
  - Kulit 3 tingkat: terang, dasar, bayangan, ditambah outline.
  - Rambut 4 tingkat ditambah outline.
  - Mata: iris 2 tingkat, kilau putih, sklera, dan bulu mata.
- **Tanpa anti-alias otomatis.** Kalau perlu menghaluskan lengkungan, pakai pixel warna tengah yang ditempatkan manual.
- **Garis bersih**: anak tangga lengkungan konsisten (1-1-2-2-3…), tanpa pixel tunggal yang menonjol.

## Memasukkan art baru

Cara terbaik adalah **PNG pixel art**, bukan SVG atau gambar dari bentuk geometris: SVG harus dirasterisasi lagi menjadi pixel, sehingga hasilnya kembali bergerigi.

- **Sprite di dalam game:** 48 × 48 pixel per frame, latar polos atau transparan, menghadap kanan, kaki di baris paling bawah, tanpa anti-alias.
- **Tampilan besar (layar judul, ending):** sekitar 140 pixel tinggi.
- **Warna:** pakai warna armor, rambut, sarung tangan, dan sepatu yang konsisten di semua frame. Rambut, sarung tangan, dan sepatu hero diwarnai ulang sesuai senjata, jadi bagian itu harus mudah dipisahkan dari armor (dibatasi outline).
- Gambar AI (misalnya Gemini) boleh dipakai: frame dipotong, latarnya dihapus, setiap pixel dipetakan ke palet tetap, lalu diperkecil dengan voting (warna palet terbanyak per pixel kecil, dengan bobot lebih untuk mata dan emas) dan dibersihkan. Jangan memperkecil dengan rata-rata area: mata hilang ke kulit dan garis emas tercampur armor menjadi cokelat. Sprite besar yang bersih menghasilkan frame kecil yang lebih tajam daripada frame kecil yang buram.

## Di kode

- **Sprite hero (Nexo):** `HERO_SPRITES` (di dalam game) dan `HERO_SPRITES_BIG` (layar judul, ending) di `js/hero-sprites.js`, plus `HERO_SPRITES_HD` di `js/hero-sprites-hd.js`: frame yang sama dengan kerapatan 1,5x (3 pixel sprite per pixel game), dipakai otomatis saat `SCALE` 6 supaya setiap pixel sprite tepat 2 × 2 pixel layar. Kalau menambah frame, tambahkan di kedua set dengan nama yang sama. Huruf peta: `o` outline, `1`/`2`/`3`/`c` armor dari gelap ke terang (selalu biru Nexo), `y`/`Y` emas, `s`/`S` kulit, `b` mata, `w` putih, `r` cahaya oranye, `C` efek cyan, `q`/`Q`/`l` detail cokelat di luar rambut (kerah, bayangan lambang). Bagian yang diwarnai ulang sesuai senjata: `h`/`H`/`L` rambut, `5`/`6`/`7`/`8` armor sarung tangan dan sepatu (empat tingkat seperti `1`/`2`/`3`/`c`), dan `9`/`0` terang dan bayangan tangan. Dengan buster, rambut tetap cokelat dan sarung tangan serta sepatu sama dengan armor. Warnanya di `heroColors()` di `js/art.js`.
- **Pemilihan frame per pose:** `heroFrame()` di `js/art.js`; `drawPlayer()` (`js/main.js`) meneruskan hitungan tick saat berlari, frame panjat (0–3), dan naik atau jatuh saat melompat.
- **Siklus lari:** `HERO_RUN` di `js/art.js` (urutan frame, durasi tiap frame dalam tick, geseran per frame). Urutan frame dari AI sering bukan siklus yang konsisten, jadi urutan dan timing-nya harus dipilih supaya kaki yang menapak bergeser ke belakang secepat badan maju (hero berlari 1,4 pixel per tick), dan kaki baru selalu mendarat di depan badan. Kalau tidak, kaki terlihat meluncur seperti moonwalk.
- **Boss:** masih memakai rig bentuk di `js/art.js` dan `js/vespera.js`.

## Sumber

- [Pixelblog 29 – Anime Faces and Hair (SLYNYRD)](https://slynyrd.com/blog/2020/7/28/pixelblog-29-anime-faces-and-hair)
- [Anti-Aliasing Fundamentals for Pixel Artists (Pixel Parmesan)](https://pixelparmesan.com/anti-aliasing-fundamentals-for-pixel-artists)
- [Pixel tutorial: selective outlines (imonk)](https://itch.io/t/2422252/pixel-tutorial-selective-outlines)
- [Pixel Art Practices Explained Simply (Clip Studio Tips)](https://tips.clip-studio.com/de-de/articles/5360?org=1)
- [How to draw anime hair (Wacom)](https://community.wacom.com/en-us/how-to-draw-anime-hair-a-step-by-step-tutorial/)
