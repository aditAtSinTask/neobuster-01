# NEOBUSTER

> Game action-platformer 2D bergaya **Mega Man** untuk browser — grafik HD yang tajam, tapi tetap ringan dan optimal untuk web.

**Versi saat ini: `0.11.0`** — versi juga tampil di pojok kanan bawah layar title & pause, dan di judul tab browser.

---

## Daftar Isi

- [Konsep](#konsep)
- [Cara Menjalankan](#cara-menjalankan)
- [Kontrol](#kontrol)
- [Stage](#stage)
- [Boss & Senjata](#boss--senjata)
- [Shop & Part](#shop--part)
- [Progress & Save](#progress--save)
- [Cheat Code](#cheat-code)
- [Struktur Proyek](#struktur-proyek)
- [Versi & Changelog](#versi--changelog)

---

## Konsep

- Pilih salah satu dari **6 stage** boss, dalam urutan bebas.
- Setiap stage panjang dan bertingkat: ada bagian **naik** (menara, tebing, lift) dan bagian **bawah tanah** (gua, saluran, tambang), dengan rintangan seperti duri, jurang, lava, lantai es, balok rapuh, tangga, platform bergerak, gergaji, semburan api, sinar listrik, batu jatuh, dan musuh.
- Ada **2 checkpoint** di setiap stage. Kalau mati, kamu lanjut dari checkpoint terakhir yang sudah dilewati.
- Di ujung stage ada **pintu boss**. Kalahkan boss untuk mendapatkan **senjatanya**.
- Semua senjata boss **unlimited** — tidak ada energi senjata yang bisa habis.
- Setiap senjata punya **charge shot**: tahan tombol tembak sampai karakter berkedip, lalu lepas. Charge tidak batal walau terkena serangan.
- Setiap boss **lemah** terhadap senjata boss lain. Saat melawan boss, kelemahannya tampil di pojok kiri bawah layar.

## Cara Menjalankan

Tidak perlu build atau install apa pun — cukup HTML + JavaScript murni.

| Cara | Langkah |
| --- | --- |
| Langsung | Buka `index.html` di browser (Chrome, Edge, Firefox, Safari). |
| Lewat server lokal | `npx serve .` atau `python3 -m http.server`, lalu buka alamat yang ditampilkan. |

> Suara aktif setelah tombol pertama ditekan (aturan autoplay browser).

## Kontrol

| Aksi | Keyboard | Gamepad |
| --- | --- | --- |
| Gerak | `←` `→` / `A` `D` | D-pad / stik kiri |
| Naik / turun tangga | `↑` `↓` / `W` `S` | D-pad / stik kiri |
| Lompat | `Z` / `J` / `Space` | A |
| Tembak | `X` / `K` | X / B |
| Charge shot (semua senjata) | Tahan `X` lalu lepas | Tahan tombol tembak |
| Slide | `C` / `L` (atau `↓` + lompat) | RT / Y |
| Ganti senjata | `Q` / `E` | LB / RB |
| Pause: ganti senjata & ON/OFF tools | `Enter` / `Esc`, lalu panah kiri/kanan untuk pindah kolom | Start |
| Mute | `M` | — |
| Buka Shop (di Stage Select) | `X` | X / B |
| Layar Kelemahan Boss (di Stage Select) | `C` | RT / Y |
| Reset progress (di title) | `R` | — |
| Buka cheat box | Tekan `P` + `O` bersamaan | — |

## Stage

Setiap stage berukuran 300 × 44 tile. Jalur utama ada di permukaan, dengan bagian yang wajib dilewati di atas dan di bawahnya.

| Stage | Bagian naik | Bagian bawah tanah | Rintangan khas |
| --- | --- | --- | --- |
| Cut | Menara pabrik (tangga, gergaji di atap), lift ke atap gudang | Saluran air di bawah ladang duri | Gergaji di rel, koridor rendah untuk slide |
| Fire | Kerucut gunung berapi, pilar basal di atas lautan lava | Ruang magma lewat kawah | Kolam lava, semburan api, lautan lava |
| Elec | Menara trafo dengan sinar listrik di atap | Terowongan kabel di bawah kabel listrik terbuka, lubang generator dengan lift | Sinar listrik yang menyala-mati |
| Snow | Tangga es ke puncak gunung | Gua es lewat celah gunung | Lantai licin, es gantung, jurang beku dengan lift |
| Earth | Undakan batu di tebing, dua lift ke atas mesa | Tambang dengan lantai rapuh di atas jurang | Batu jatuh, jembatan rapuh |
| Wind | Pad angin ke atap benteng langit, jembatan langit | Sumur angin di dalam batu melayang, keluar lewat pad bertingkat | Pulau melayang di atas lautan awan, platform awan |

Setiap stage juga punya musuh, mekanik, dan ruang boss yang hanya ada di stage itu:

| Stage | Musuh khas | Mekanik khas | Ruang boss |
| --- | --- | --- | --- |
| Cut | **Blader**: kepala gunting terbang yang menukik ke arahmu | **Ban berjalan**: mendorong ke satu arah (di atap menara, saluran, dan depan pintu boss) | Gunting raksasa dan gerigi berputar di dinding, lantai tengah berupa ban berjalan |
| Fire | **Fire Totem**: patung batu yang memuntahkan 2 bola api melengkung | **Bola magma**: melompat keluar dari lava secara berkala | Air terjun lava dan retakan magma, semburan api dari lantai |
| Elec | **Watcher**: mata listrik yang menyesuaikan tinggi lalu menembak ke dua arah saat sejajar denganmu | **Blok energi**: menyala bergantian di atas jurang, berkedip sebelum hilang | Tesla coil dengan busur listrik, sinar listrik dari langit-langit |
| Snow | **Snowman**: melempar bola salju melengkung | **Badai angin**: setelah tenang dan peringatan, angin mendorong kamu (saat naik gunung, di jurang beku, dan di lantai es) | Kepingan salju raksasa dan kristal es, lantai es licin |
| Earth | **Mole**: menggali di bawah tanah mengikuti kamu, lalu menyembul tepat di bawahmu | **Pasir hisap**: kamu tenggelam pelan dan berjalan lambat; lompat keluar sebelum kepala tenggelam | Penyangga tambang dan permata di dinding batu |
| Wind | **Fanbot**: kipas melayang yang meniupmu mundur saat kamu di depannya | **Pad angin**: menginjaknya melontarkanmu sekitar 8 tile ke atas | Jendela langit, pilar marmer, dan awan melayang yang bisa dipijak |

## Boss & Senjata

| Stage | Boss | Senjata yang didapat | Lemah terhadap |
| --- | --- | --- | --- |
| Cut | **SNIPTOR** — manusia gunting | Rolling Cutter | Frost Shard |
| Fire | **MAGMARON** — manusia api | Fire Storm | Gale Shot |
| Elec | **VOLTRAX** — manusia listrik & petir | Thunder Beam | Rolling Cutter |
| Snow | **GLACIELLE** — wanita es | Frost Shard | Fire Storm |
| Earth | **TERRALYN** — wanita tanah & batu | Rock Breaker | Thunder Beam |
| Wind | **WINDERWOMEN** — wanita angin | Gale Shot | Rock Breaker |

Tekan `C` di **Stage Select** untuk membuka layar **Kelemahan Boss**. Layar ini berisi tabel senjata yang didapat dan kelemahan tiap boss, tanda **ADA** kalau senjata kelemahannya sudah kamu punya, dan **urutan saran** berupa rantai boss: senjata dari tiap boss adalah kelemahan boss berikutnya.

Setiap senjata adalah kelemahan tepat satu boss: es membuat gunting rapuh, angin memadamkan api, gunting memotong kabel, api mencairkan es, petir menghancurkan batu, dan batu terlalu berat untuk diterbangkan angin.

### Tembakan biasa & charge shot

Tekan `X` untuk tembakan biasa. Tahan `X` sampai karakter berkedip dengan warna senjatanya, lalu lepas untuk charge shot.

| Senjata | Tembakan biasa | Charge shot |
| --- | --- | --- |
| Neo Buster | Peluru kecil (maks. 3 di layar) | Tahan sebentar: peluru sedang. Tahan penuh: peluru besar yang menembus musuh **+ Buster Storm**, ratusan peluru kecil yang datang dari belakang dan menyapu seluruh layar ke depan, mengenai semua musuh termasuk yang berlindung |
| Rolling Cutter | Boomerang gunting yang menembus musuh dan kembali | **Giant Scissors** — gunting raksasa berdiri tegak (dari kaki sampai jauh di atas kepala) yang menggunting maju, menembus musuh, lalu kembali |
| Fire Storm | Bola api + perisai api yang berputar | **Fire Wave** — pilar api yang bergulir di tanah, menembus musuh dan membakar peluru musuh |
| Thunder Beam | Sinar petir cepat yang menembus musuh | **Giga Thunder** — petir menyambar dari langit ke setiap musuh di layar, termasuk boss |
| Frost Shard | 3 kristal es yang membekukan musuh | **Frost Nova** — cincin rapat 24 kristal es besar ke segala arah, menembus dan membekukan musuh |
| Gale Shot | 3 pusaran angin yang melayang naik dengan sudut berbeda | **Cyclone** — tornado besar yang bergulir di tanah, terus menggerus musuh yang dilewati dan menyedot peluru kecil |
| Rock Breaker | Batu yang pecah jadi 4 serpihan | **Rock Quake** — batu besar yang pecah jadi 8 serpihan, mengguncang layar dan melukai semua musuh yang menapak tanah |

### Melawan boss

- Kelemahan boss tampil di **pojok kiri bawah** selama pertarungan. Tulisannya abu-abu dengan keterangan "(BELUM ADA)" kalau senjatanya belum kamu punya, dan ada garis berwarna di atas panel kalau senjata itu sedang dipakai.
- Serangan ke kelemahan boss memunculkan tulisan **WEAK!** dan memberi 4 damage. Kalau pakai charge shot, damage-nya 6.
- Boss kebal terhadap senjatanya sendiri.

Setelah keenam boss dikalahkan, muncul layar ending.

## Shop & Part

Setiap poin skor yang kamu dapat (musuh, pickup, boss 10.000) juga masuk ke dompet **POIN**. Dompet ini tersimpan permanen dan tidak hilang walau game over. Saldonya terlihat di Stage Select, Shop, dan menu pause.

Tekan `X` di **Stage Select** untuk membuka Shop. Pilih part dengan tombol atas/bawah, tekan `Enter` untuk membeli, dan `X` untuk kembali. Part yang sudah dibeli bisa dinyalakan atau dimatikan dengan `Enter`. Part yang aktif tampil sebagai ikon di pojok kanan atas layar.

| Part | Harga | Efek |
| --- | --- | --- |
| Boots Anti Duri | 8.000 | Berjalan di atas duri tanpa mati |
| Armor Anti Api | 8.000 | Masuk dan berjalan di lava tanpa mati |
| Jetpack | 10.000 | Lompatan 1,6x lebih tinggi |
| Core | 6.000 | Kebal 5x lebih lama setelah terkena hit |
| Super Booster | 15.000 | Setiap tembakan biasa langsung keluar sebagai charge shot (Neo Buster: peluru besar; senjata spesial: charge shot-nya) |
| Ultra Booster | 25.000 | Harus punya Super Booster. Tahan tembak sekitar 2,5 detik sampai karakter berkilau emas, lalu lepas untuk **ultra attack** |
| Shield | 12.000 | 2 orb perisai mengorbit di sekitarmu. Orb yang terkena musuh atau peluru musuh menangkisnya (musuh kena damage, peluru kecil hancur), lalu hilang 10 detik sebelum muncul lagi |
| Omega Booster | 40.000 | Harus punya Ultra Booster. Setiap tembakan langsung jadi ultra attack tanpa menahan tombol (kalau ultra sebelumnya masih berjalan, keluar charge shot). Selama Omega ON, Super Booster dan Ultra Booster berstatus **DISABLED**: tidak bisa diubah, dan setelan ON/OFF-nya kembali seperti semula saat Omega dimatikan |

Ultra attack setiap senjata:

| Senjata | Ultra attack |
| --- | --- |
| Neo Buster | **Hyper Beam**: laser raksasa sepanjang layar selama 1 detik |
| Rolling Cutter | **Cutter Tempest**: 8 gunting besar berputar menyebar mengelilingi kamu |
| Fire Storm | **Inferno**: pilar api meletus di sepanjang lantai, menjalar ke dua arah |
| Thunder Beam | **Thunder God**: petir terus menyambar musuh dan boss hampir 2 detik |
| Frost Shard | **Absolute Zero**: semua musuh di layar membeku dan terluka, peluru musuh pecah, boss membeku, dan duri es muncul dari lantai |
| Gale Shot | **Hurricane**: 3 tornado setinggi layar menyapu dari belakangmu ke depan, terus menggerus musuh dan meniup peluru musuh |
| Rock Breaker | **Meteor**: meteor jatuh di depanmu lalu meledak menjadi gelombang kejut dan hujan batu |

Ultra attack ke senjata kelemahan boss memberi 8 damage.

## Progress & Save

Data disimpan di `localStorage` browser (key `neobuster-save-v1`).

- **Boss yang sudah dikalahkan** tersimpan otomatis.
- **Save point manual** dibuat dengan cheat `INGATANKUAT`. Yang disimpan: jumlah life, skor, senjata aktif, dan — jika sedang di dalam stage — stage tersebut beserta checkpoint-nya.
- Jika ada save point, layar title menampilkan pilihan **CONTINUE** / **NEW GAME** (pilih dengan tombol panah).
  - **CONTINUE** melanjutkan dari save point. Kalau disimpan di dalam stage, game langsung masuk ke stage itu (dari checkpoint jika sudah melewatinya).
  - **NEW GAME** mulai dengan 2 life dan skor 0. Boss yang sudah dikalahkan tetap tersimpan.
- Tekan `R` di title untuk menghapus semua progress, termasuk POIN dan part yang sudah dibeli.

## Cheat Code

Tekan **`P` + `O` bersamaan** untuk membuka cheat box. Ketik kode, tekan `Enter` untuk memakai, atau `Esc` untuk batal. Game berhenti sementara selama cheat box terbuka.

| Kode | Efek | Bisa dipakai |
| --- | --- | --- |
| `MAUKUAT` | HP penuh | Di dalam stage, saat karakter masih hidup |
| `AWETMUDA` | Life +1 (maks. 99) | Selama permainan berjalan |
| `ILMUKEBAL` | HP 10x lebih tebal (semua damage dibagi 10) + HP penuh. Bar HP berubah emas dan berkilau, badge **X10** muncul di atas bar, dan sisa HP tampil sebagai angka (mis. 276/280). Aktif sampai game over atau kembali ke title. Duri dan jurang tetap mematikan seketika | Selama permainan berjalan (HP penuh hanya di dalam stage) |
| `INGATANKUAT` | Simpan progress saat ini (lihat [Progress & Save](#progress--save)) | Selama permainan berjalan |

Cheat tidak bisa dipakai di layar title, game over, atau ending.

## Struktur Proyek

```
neobuster/
├── index.html      # canvas + urutan pemuatan script
├── readme.md
└── js/
    ├── engine.js   # versi, canvas, input, audio & musik, font pixel, sprite & glow
    ├── art.js      # sprite robot (hero + 6 boss), background parallax, tileset, ikon senjata
    ├── levels.js   # data stage & layout level
    ├── actors.js   # fisika, player, senjata, musuh, hazard, platform, boss
    ├── cheats.js   # cheat box (P + O) dan daftar cheat code
    └── main.js     # alur game (title, select, stage, boss, ending), render, save, game loop
```

Detail teknis:

- Tata letak memakai ruang logis **384 × 224**, tapi digambar di resolusi layar yang sebenarnya (2x–4x). Karakter digambar dengan sudut membulat, gradasi, dan outline tipis; teks memakai font asli; efek dan background halus. Tile level tetap bergaya pixel.
- Level berukuran **300 × 44 tile** (16 px). Kamera mengikuti player ke segala arah, kecuali di ruang boss.
- Logika berjalan tetap **60 langkah/detik**. Render diinterpolasi agar mulus di layar 120/144 Hz.
- Semua grafik dan suara dibuat lewat kode (Canvas 2D + Web Audio), tanpa file aset.

## Versi & Changelog

Versi ditulis di konstanta `VERSION` di `js/engine.js`. Setiap ada perubahan, naikkan versinya dan tambahkan catatan di bawah.

### 0.11.0
- Grafik HD: game digambar di resolusi layar (2x–4x), bukan lagi 384×224 yang diperbesar. Semua karakter, boss, musuh, pickup, dan ikon kini punya bentuk membulat dengan gradasi dan kilap; teks tajam; petir, glow, dan background halus.

### 0.10.0
- Layar **Kelemahan Boss** (tombol `C` di Stage Select) dengan tabel kelemahan dan urutan saran.
- Part baru **Shield** (2 orb perisai yang menangkis lalu hilang 10 detik) dan **Omega Booster** (ultra attack tanpa delay; Super/Ultra Booster jadi DISABLED selama aktif).
- Shop dan menu pause menampilkan status DISABLED.

### 0.9.0
- Boss baru **WINDERWOMEN** (wanita angin) dengan stage benteng langit: pulau melayang di atas lautan awan, pad angin, Fanbot, sumur angin, dan ruang boss dengan awan melayang. Serangan boss: Gust (angin kencang + tornado kecil), Cyclone, dan Dive.
- Senjata baru **Gale Shot**, charge **Cyclone**, ultra **Hurricane**.
- Nama boss baru: Sniptor, Magmaron, Voltrax, Glacielle, Terralyn.
- Rantai kelemahan disusun ulang untuk 6 boss (setiap senjata jadi kelemahan tepat satu boss).
- Menu pause dua kolom: SENJATA dan TOOLS. Tools (part dari Shop) bisa di-ON/OFF langsung di tengah stage.
- Stage select 3 × 2.

### 0.8.0
- Dompet **POIN** permanen dari skor yang didapat, dan **Shop** di Stage Select (tombol `X`).
- 6 part: Boots Anti Duri, Armor Anti Api, Jetpack, Core, Super Booster, Ultra Booster. Part bisa dinyalakan/dimatikan.
- Ultra attack untuk setiap senjata (Hyper Beam, Cutter Tempest, Inferno, Thunder God, Absolute Zero, Meteor), dengan tahap charge ketiga berwarna emas.

### 0.7.0
- Setiap stage sekarang unik untuk boss-nya: musuh khas (Blader, Fire Totem, Watcher, Snowman, Mole), mekanik khas (ban berjalan, bola magma, blok energi, badai angin, pasir hisap), dan ruang boss bertema dengan ornamen dinding serta gimmick (ban berjalan, semburan api, sinar listrik, lantai es).

### 0.6.1
- Frost Nova sekarang 24 kristal es (sebelumnya 11) supaya sebarannya lebih ramai dan rapat.

### 0.6.0
- Semua stage didesain ulang: lebih panjang (300 kolom, sebelumnya 200) dan bertingkat (44 baris, sebelumnya 26).
- Setiap stage punya bagian naik (menara, tebing, lift vertikal) dan bagian bawah tanah (gua, saluran, tambang) yang wajib dilewati, plus lebih banyak rintangan dan musuh.
- 2 checkpoint per stage.
- Tile baru: dinding gua (latar gelap) dan jurang maut.
- Musuh dan batu jatuh hanya aktif kalau area mereka terlihat di layar (tidak lagi muncul di gua saat player di permukaan, dan sebaliknya).
- Setiap stage sudah dicek otomatis bisa diselesaikan dari start sampai pintu boss.
- Frost Nova (charge Frost Shard) sekarang 11 kristal es (sebelumnya 8) supaya sebarannya lebih rapat.

### 0.5.0
- Cheat baru `ILMUKEBAL`: HP 10x lebih tebal + HP penuh. Selama aktif, bar HP berwarna emas berkilau dengan badge X10 dan angka sisa HP (dari 280).

### 0.4.0
- Boss baru **ELECMAN** (manusia listrik & petir) dengan stage power plant: badai, hujan, kilat di langit, dan sinar listrik yang menyala-mati. Serangan boss: Thunder Beam 3 arah, sambaran petir dari langit-langit, dan lompatan dengan bola listrik.
- Senjata baru **Thunder Beam**, dengan charge shot **Giga Thunder**.
- Kelemahan: Elecman lemah terhadap Rolling Cutter. Earthwoman sekarang lemah terhadap Thunder Beam (sebelumnya Rolling Cutter).
- Charge shot Neo Buster penuh sekarang juga memicu **Buster Storm**.
- Charge Rolling Cutter diganti menjadi **Giant Scissors** yang berdiri tegak.
- Terkena serangan tidak lagi membatalkan charge. Kalau tombol dilepas saat terkena hit atau saat slide, tembakan keluar begitu karakter bisa menembak lagi.
- Layar stage select, title, dan ending disusun ulang untuk 5 boss.

### 0.3.0
- Charge shot untuk semua special weapon: Giant Cutter, Fire Wave, Frost Nova, Rock Quake.
- Saat charge, karakter berkedip dan bersinar dengan warna senjata yang dipakai.
- Panel kelemahan boss di pojok kiri bawah selama pertarungan, dan tulisan "WEAK!" saat kena senjata kelemahannya.
- Jarak Rolling Cutter lebih jauh (sekitar 90 px menjadi sekitar 140 px).
- Layar "Weapon Get" menampilkan nama charge shot senjata baru.

### 0.2.0
- Nomor versi tampil di layar title, pause, cheat box, dan judul tab browser.
- Cheat box (`P` + `O`) dengan kode `MAUKUAT`, `AWETMUDA`, `INGATANKUAT`.
- Save point manual + menu **CONTINUE / NEW GAME** di layar title.
- Tombol `P` tidak lagi dipakai untuk pause (pakai `Enter` / `Esc`).
- README ditulis ulang.

### 0.1.2
- Fix: tangan & kaki karakter bergetar saat diam/lari. Deteksi tanah sekarang tepat, jadi karakter tidak lagi bergantian dianggap "melayang". Ini juga memperbaiki animasi lari, durasi slide, dan getaran pada boss.

### 0.1.1
- Fix: karakter bergeser ±1 px di layar 120/144 Hz. Kamera sekarang dihitung dari posisi player yang sama dengan yang digambar.

### 0.1.0
- Rilis awal: 4 stage boss, senjata boss unlimited, musik & efek suara.
