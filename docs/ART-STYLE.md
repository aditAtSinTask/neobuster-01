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

Lembar karakter (PNG, misalnya dari Gemini) dipakai sebagai **referensi desain**, bukan sumber pixel: karakter digambar ulang native di kode, jadi geraknya bisa dianimasikan bebas (lari, lompat, serangan) tanpa frame yang meloncat atau kaki yang meluncur. Yang diambil dari lembar karakter: siluet, proporsi, warna, bentuk helm dan rambut, ciri khas (jambul, tanduk, kristal, sayap), senjata, dan pose aksi.

Langkah menambah karakter:

1. Buat file `js/<nama>.js` (contoh `js/sniptor.js`) dan muat di `index.html` setelah `js/chars.js`.
2. Tulis warnanya per huruf (`*_TONES`), pose-posenya (sudut sendi), fungsi `frame()` yang memilih pose per state, dan fungsi `draw()` yang memberi bentuk pada kerangka. Daftarkan sebagai `NATIVE_CHARS[style]`.
3. Cocokkan dengan lembar karakter: gambar karakter di samping frame lembar karakter dengan grid satuan kotak, lalu tumpang-tindihkan setengah transparan, dan sesuaikan ukuran tubuh (`body`) serta bentuknya sampai siluetnya sama.
4. Uji di ketiga kerapatan (layar 2x, 4x, 6x) dan di tampilan 3x (layar intro), menghadap kanan dan kiri, dengan warna senjata, kedip putih, dan grayscale.

## Di kode

- **Sistem karakter native:** `js/chars.js`. Kotak 24 × 24 pixel game dari `drawRobot` adalah 48 × 48 satuan (1 satuan = 1 pixel kecil pada kerapatan 1), menghadap kanan, kaki di y = 48. Setiap frame dirasterisasi tanpa anti-alias pada kerapatan layar sendiri (`k` = 1 di layar 2x, 2 di 4x, 3 di 6x dan di tampilan 3x), jadi selalu satu pixel layar per pixel kecil. Setiap bagian mendapat outline 1 pixel (warna gelap bagiannya sendiri di dalam badan, hitam di siluet) dan cel shading dari kiri atas (terang di tepi atas, lebih lembut di kiri, bayangan di bawah dan kanan); rambut dan kulit diberi shading lebih lembut. Frame di-cache per pose dan per palet.
- **Kerangka:** `ncPose()` dan `ncSolve()`. Sudut sendi dalam derajat, absolut: 0 ke bawah, positif ke depan (arah hadap), 180 ke atas. `legs: { b, f }` = [paha, betis, kemiringan kaki], `arms: { b, f }` = [lengan atas, lengan bawah]. `lean` menggeser badan atas ke depan, `bend` memutar badan atas dari pinggul (untuk pose rendah seperti Volt Rush dan sliding Glacielle), `breath` menurunkan dada dan kepala (napas saat diam), `dx`/`dy` menggeser badan, `air` membiarkan kaki tidak menapak. Pose yang tidak `air` otomatis diturunkan sampai kaki terendah menyentuh lantai.
- **Lari dan jalan:** `ncGait()`, 10 frame per dua langkah. Kaki yang menapak bergerak mundur persis sejauh badan maju (diletakkan dengan inverse kinematics, `ncLegIK()`), lalu terangkat lurus dan berayun ke depan dengan tumit menendang ke belakang, dan pinggul turun-naik. Siklus maju sesuai jarak tempuh (`fr` dalam satuan 1,4 pixel), bukan per tick. Karena kaki menapak tidak pernah bergeser di dunia, tidak ada moonwalk; uji dengan `ncSolve` per frame (posisi dunia kaki yang menapak harus sama dari frame ke frame).
- **Bagian bersama:** `ncLeg()` (paha, sepatu bot, telapak, gelang, lutut), `ncArm()` (lengan atas, sarung tangan, manset, kepalan), `ncLongHair()` (rambut panjang yang menjuntai atau berkibar sesuai `flow`), `ncWomanFace()` dan `NC_FEMALE_FACES` (wajah boss wanita), `ncFace()` (peta pixel mata per kerapatan; kerapatan tanpa peta sendiri memakai peta kerapatan 2 yang diperbesar).
- **Bentuk:** `NC_SHAPES`: `disc`, `ell`, `cap`, `poly`, `rect`, `taper`, `strand` (helai melengkung yang meruncing: rambut, jambul, tanduk, sirip), `spike`, `bar` (pita berujung persegi: gelang, manset, sabuk), `xf`, `all` (beberapa bentuk satu outline), `annulus`. `G.shape(huruf, bentuk)` menggambar bagian dengan outline; `G.paint(huruf, bentuk, huruf_dasar)` mewarnai detail di atas bagian yang sudah ada (garis lava, panel, kilau); `G.map(baris, x, y)` menempel peta pixel.
- **Prop dan efek:** `drawNativeProp()` menggambar benda kecil dengan sistem yang sama (R. Cutter yang berputar, api di bahu Magmaron, batu yang melayang dan duri batu Terralyn, pusaran angin Winderwomen), di-cache per langkah animasi. `before()` menggambar di belakang karakter, `after()` di depannya (cahaya, kilatan, bola energi).
- **Warna senjata Nexo:** `nexoColors()` di `js/nexo.js`: hanya rambut (`Z`/`z`), sarung tangan dan buster (`G`), dan sepatu (`F`) yang diwarnai ulang dengan warna senjata; dengan buster semuanya kembali ke warna aslinya.
- **Huruf warna:** setiap file karakter menuliskan arti hurufnya di komentar paling atas. `K` selalu outline.
- **Portrait boss:** pose `action` dipakai di pilih stage, tabel kelemahan, dan ending, dan di layar intro (tampilan 3x).
- **Wajah bersama:** semua karakter memakai peta mata yang sama supaya wajahnya seragam: pria memakai `ncManFace()` (`NC_MALE_FACES`, mata Nexo, dengan ekspresi `normal`, `angry` untuk boss, dan `hurt`), wanita memakai `ncWomanFace()` (`NC_FEMALE_FACES`, dengan `normal`, `shout` untuk berteriak, dan `hurt`). Jangan menggambar mata sendiri per boss. Helm, tanduk, headphone, dan tiara hanya membingkai wajah; masker boleh menutup mulut dan hidung, tapi mata harus tetap terlihat. Urutan menggambar kepala: rambut atau helm bagian belakang, lalu wajah, lalu poni dan bagian helm yang menutupi dahi.
- **Ciri khas boss:** setiap boss punya ciri khas yang langsung terlihat, juga di portrait kecil: bentuk tubuh (jambul, tanduk, tangki, jubah, headphone, tiara, jam), efek yang selalu bergerak (api, tetesan air, asap racun, aura bayangan, not musik, kilau cahaya, roda gigi), dan efek tiap serangan. Efek yang bergerak digambar di `before()`/`after()` atau sebagai prop.

## Sumber

- [Pixelblog 29 – Anime Faces and Hair (SLYNYRD)](https://slynyrd.com/blog/2020/7/28/pixelblog-29-anime-faces-and-hair)
- [Anti-Aliasing Fundamentals for Pixel Artists (Pixel Parmesan)](https://pixelparmesan.com/anti-aliasing-fundamentals-for-pixel-artists)
- [Pixel tutorial: selective outlines (imonk)](https://itch.io/t/2422252/pixel-tutorial-selective-outlines)
- [Pixel Art Practices Explained Simply (Clip Studio Tips)](https://tips.clip-studio.com/de-de/articles/5360?org=1)
- [How to draw anime hair (Wacom)](https://community.wacom.com/en-us/how-to-draw-anime-hair-a-step-by-step-tutorial/)
