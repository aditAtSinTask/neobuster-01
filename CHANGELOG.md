# Changelog

Semua perubahan NEOBUSTER, versi terbaru di atas. Versi ditulis di konstanta `VERSION` di `js/engine.js`.

## 1.0.0

- **Benua Vespera**: benua kedua dengan 6 boss baru, terbuka setelah Benua Azura ditaklukkan.

  | Boss    | Gender | Stage                                 | Senjata      | Lemah terhadap |
  | ------- | ------ | ------------------------------------- | ------------ | -------------- |
  | HYDROS  | Pria   | Menara air dan gorong-gorong banjir   | Hydro Blast  | Venom Drip     |
  | TOXARIS | Pria   | Pabrik limbah dan lautan lumpur racun | Venom Drip   | Shadow Clone   |
  | UMBRION | Pria   | Benteng gelap gulita                  | Shadow Clone | Prism Laser    |
  | SONIQUE | Wanita | Panggung melayang di atas awan        | Sonic Boom   | Time Stopper   |
  | LUMINA  | Wanita | Istana kristal                        | Prism Laser  | Sonic Boom     |
  | CHRONIA | Wanita | Menara jam                            | Time Stopper | Hydro Blast    |

- Setiap boss punya 3 serangan sendiri. Chronia bisa menghentikan waktu sehingga pemain tidak bisa bergerak sebentar.
- 6 senjata baru, masing-masing dengan charge shot dan ultra attack: Tidal Wave/Tsunami, Acid Rain/Plague, Shadow Army/Eclipse, Bass Drop/Supersonic, Spectrum/Supernova, Time Stop/Chrono Break. Charge Time Stopper membekukan musuh, peluru, hazard, dan boss selama 3 detik.
- Musuh baru: Jelly, Slime, Shade, Speakerbot, Prismo, Gearbot.
- Mekanik baru: air (jatuh pelan, lompat lebih tinggi), ventilasi gas racun, kegelapan dengan obor, speaker dan drum lontar, gerbang laser, bandul, platform yang berputar melingkar, dan tetesan air.
- Ruang boss unik untuk keenam boss.
- Konten benua sekarang ditulis dalam satu file per benua (`js/vespera.js`) lewat registry, tanpa mengubah `switch` di file inti. Panduan `docs/MENAMBAH-KONTEN.md` diperbarui.
- Label baris benua di menu pause muat sampai 7 huruf.

## 0.15.0

- **Peta Dunia**: boss dikelompokkan per benua (6 boss per benua). Keenam boss sekarang berada di **Benua Azura**; benua berikutnya tampil terkunci "SEGERA HADIR" dan akan terbuka setelah semua boss di benua sebelumnya kalah. Ending muncul setelah semua benua selesai.
- Menu pause: daftar senjata menjadi **grid** (satu baris per benua, slot "?" untuk yang belum didapat, detail charge di bawahnya); kolom tools bisa digulir.
- Shop dibagi menjadi **tab** GERAK, PERTAHANAN, SERANGAN, dan setiap tab bisa digulir.
- Tombol **Esc / Backspace** sekarang berarti "kembali" di semua menu (dan tetap membuka pause di dalam stage).
- Validator konten di console dan panduan `docs/MENAMBAH-KONTEN.md` untuk menambah benua, boss, part, dan musuh.

## 0.14.0

- Part baru **Anti Angin** (10.000 POIN): kebal terhadap badai, tiupan Fanbot, dan serangan Gust Winderwomen. Pad angin tetap berfungsi.
- Shop dan kolom TOOLS di menu pause dipadatkan supaya muat 9 part.

## 0.13.0

- Halaman depan baru: langit malam, bulan, siluet kota, dan pahlawan di atap dengan lingkaran energi dan buster yang menyala (potret boss dihapus).
- Charge Rolling Cutter diganti dari Giant Scissors menjadi **Giant Shuriken**.
- Ruang boss Sniptor: gunting raksasa di dinding diganti mata gergaji industri.
- Background semua stage digambar tajam di kepadatan pixel 2x (tidak lagi buram di layar besar/Retina), dan siluet lapisan depan bertepi tegas.
- Changelog dipindah dari README ke `CHANGELOG.md`.
- Prettier untuk format kode: `yarn format` dan `yarn format:check`.

## 0.12.0

- Gaya grafis kembali ke pixel art, tapi dengan kepadatan pixel 2x: sprite (outline tipis, sudut terpotong, shading berlapis), teks pixel yang lebih detail, lingkaran dan petir dari pixel kecil, serta tile level 2x dengan tekstur halus. Menggantikan tampilan halus (anti-aliased) di 0.11.0.

## 0.11.0

- Grafik HD: game digambar di resolusi layar (2x–4x), bukan lagi 384×224 yang diperbesar. Semua karakter, boss, musuh, pickup, dan ikon kini punya bentuk membulat dengan gradasi dan kilap; teks tajam; petir, glow, dan background halus.

## 0.10.0

- Layar **Kelemahan Boss** (tombol `C` di Stage Select) dengan tabel kelemahan dan urutan saran.
- Part baru **Shield** (2 orb perisai yang menangkis lalu hilang 10 detik) dan **Omega Booster** (ultra attack tanpa delay; Super/Ultra Booster jadi DISABLED selama aktif).
- Shop dan menu pause menampilkan status DISABLED.

## 0.9.0

- Boss baru **WINDERWOMEN** (wanita angin) dengan stage benteng langit: pulau melayang di atas lautan awan, pad angin, Fanbot, sumur angin, dan ruang boss dengan awan melayang. Serangan boss: Gust (angin kencang + tornado kecil), Cyclone, dan Dive.
- Senjata baru **Gale Shot**, charge **Cyclone**, ultra **Hurricane**.
- Nama boss baru: Sniptor, Magmaron, Voltrax, Glacielle, Terralyn.
- Rantai kelemahan disusun ulang untuk 6 boss (setiap senjata jadi kelemahan tepat satu boss).
- Menu pause dua kolom: SENJATA dan TOOLS. Tools (part dari Shop) bisa di-ON/OFF langsung di tengah stage.
- Stage select 3 × 2.

## 0.8.0

- Dompet **POIN** permanen dari skor yang didapat, dan **Shop** di Stage Select (tombol `X`).
- 6 part: Boots Anti Duri, Armor Anti Api, Jetpack, Core, Super Booster, Ultra Booster. Part bisa dinyalakan/dimatikan.
- Ultra attack untuk setiap senjata (Hyper Beam, Cutter Tempest, Inferno, Thunder God, Absolute Zero, Meteor), dengan tahap charge ketiga berwarna emas.

## 0.7.0

- Setiap stage sekarang unik untuk boss-nya: musuh khas (Blader, Fire Totem, Watcher, Snowman, Mole), mekanik khas (ban berjalan, bola magma, blok energi, badai angin, pasir hisap), dan ruang boss bertema dengan ornamen dinding serta gimmick (ban berjalan, semburan api, sinar listrik, lantai es).

## 0.6.1

- Frost Nova sekarang 24 kristal es (sebelumnya 11) supaya sebarannya lebih ramai dan rapat.

## 0.6.0

- Semua stage didesain ulang: lebih panjang (300 kolom, sebelumnya 200) dan bertingkat (44 baris, sebelumnya 26).
- Setiap stage punya bagian naik (menara, tebing, lift vertikal) dan bagian bawah tanah (gua, saluran, tambang) yang wajib dilewati, plus lebih banyak rintangan dan musuh.
- 2 checkpoint per stage.
- Tile baru: dinding gua (latar gelap) dan jurang maut.
- Musuh dan batu jatuh hanya aktif kalau area mereka terlihat di layar (tidak lagi muncul di gua saat player di permukaan, dan sebaliknya).
- Setiap stage sudah dicek otomatis bisa diselesaikan dari start sampai pintu boss.
- Frost Nova (charge Frost Shard) sekarang 11 kristal es (sebelumnya 8) supaya sebarannya lebih rapat.

## 0.5.0

- Cheat baru `ILMUKEBAL`: HP 10x lebih tebal + HP penuh. Selama aktif, bar HP berwarna emas berkilau dengan badge X10 dan angka sisa HP (dari 280).

## 0.4.0

- Boss baru **ELECMAN** (manusia listrik & petir) dengan stage power plant: badai, hujan, kilat di langit, dan sinar listrik yang menyala-mati. Serangan boss: Thunder Beam 3 arah, sambaran petir dari langit-langit, dan lompatan dengan bola listrik.
- Senjata baru **Thunder Beam**, dengan charge shot **Giga Thunder**.
- Kelemahan: Elecman lemah terhadap Rolling Cutter. Earthwoman sekarang lemah terhadap Thunder Beam (sebelumnya Rolling Cutter).
- Charge shot Neo Buster penuh sekarang juga memicu **Buster Storm**.
- Charge Rolling Cutter diganti menjadi **Giant Scissors** yang berdiri tegak.
- Terkena serangan tidak lagi membatalkan charge. Kalau tombol dilepas saat terkena hit atau saat slide, tembakan keluar begitu karakter bisa menembak lagi.
- Layar stage select, title, dan ending disusun ulang untuk 5 boss.

## 0.3.0

- Charge shot untuk semua special weapon: Giant Cutter, Fire Wave, Frost Nova, Rock Quake.
- Saat charge, karakter berkedip dan bersinar dengan warna senjata yang dipakai.
- Panel kelemahan boss di pojok kiri bawah selama pertarungan, dan tulisan "WEAK!" saat kena senjata kelemahannya.
- Jarak Rolling Cutter lebih jauh (sekitar 90 px menjadi sekitar 140 px).
- Layar "Weapon Get" menampilkan nama charge shot senjata baru.

## 0.2.0

- Nomor versi tampil di layar title, pause, cheat box, dan judul tab browser.
- Cheat box (`P` + `O`) dengan kode `MAUKUAT`, `AWETMUDA`, `INGATANKUAT`.
- Save point manual + menu **CONTINUE / NEW GAME** di layar title.
- Tombol `P` tidak lagi dipakai untuk pause (pakai `Enter` / `Esc`).
- README ditulis ulang.

## 0.1.2

- Fix: tangan & kaki karakter bergetar saat diam/lari. Deteksi tanah sekarang tepat, jadi karakter tidak lagi bergantian dianggap "melayang". Ini juga memperbaiki animasi lari, durasi slide, dan getaran pada boss.

## 0.1.1

- Fix: karakter bergeser ±1 px di layar 120/144 Hz. Kamera sekarang dihitung dari posisi player yang sama dengan yang digambar.

## 0.1.0

- Rilis awal: 4 stage boss, senjata boss unlimited, musik & efek suara.
