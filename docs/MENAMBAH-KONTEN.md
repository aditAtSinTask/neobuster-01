# Menambah Konten

Panduan untuk menambah benua, boss, part shop, atau musuh tanpa merusak yang sudah ada.

Semua konten disimpan di tabel yang dikunci dengan **key** yang sama. Satu stage, boss-nya, dan senjata yang didapat dari boss itu memakai satu key (misalnya `hydro`). Karena itu save (`save.cleared`), daftar senjata, menu pause, layar kelemahan, peta dunia, dan ending otomatis ikut bertambah begitu tabelnya diisi.

Ringkasan aturan kerja dan aturan konten untuk developer lain dan AI coding agent ada di [AGENTS.md](../AGENTS.md).

Setelah menambah apa pun, buka game lalu lihat **console browser**. `validateContent()` (di `js/core/main.js`) mencetak peringatan `[neobuster] ...` untuk setiap bagian yang belum lengkap. Kalau console bersih, datanya sudah lengkap.

## Aturan wajib untuk benua, stage, dan boss baru

Setiap benua, stage, dan boss baru harus memenuhi semua aturan ini:

1. **Setiap stage unik dan menantang.**
   - Area dan alurnya sendiri, yang tidak dipakai stage lain (menara, gua, sumur, rute langit, kendaraan, bawah air, dan sebagainya).
   - Rintangan dan mekanik khas temanya.
   - Platform dan rute yang berbeda dari semua stage yang sudah ada; jangan menyalin geometri stage lain.
   - Musuh khasnya sendiri di samping musuh umum.
   - Ukuran 450 × 44 tile (pintu boss di kolom 426), dengan bagian naik dan bagian bawah tanah, dan checkpoint di antaranya.
   - 150 kolom terakhir sebelum pintu boss (kolom 276–425) adalah bagian tersulit stage itu, dengan dua checkpoint sendiri.
2. **Setiap stage punya satu ruang rahasia dengan armor** (`B.secret`, lihat [Mekanik bawaan](#mekanik-bawaan-yang-bisa-dipakai)).
   - Dinding segelnya hanya hancur oleh senjata boss lain, tidak pernah oleh senjata stage itu sendiri.
   - Ruangannya tampak seperti batu sampai segelnya hancur, dan letaknya di samping jalur utama.
   - Armor di dalamnya membuat HP pemain 1x lebih tebal.
   - Senjata baru perlu tampilan dinding segel di `SEAL_LOOKS`.
3. **Boss digambar native**, bukan potongan lembar karakter (lihat [ART-STYLE.md](ART-STYLE.md)).
   - Wajahnya memakai wajah bersama (`ncManFace` / `ncWomanFace`).
   - Ciri khasnya kuat: bentuk tubuh, efek yang selalu bergerak, dan efek di setiap serangan.
   - Serangannya berbeda dari boss lain.
   - Kelemahannya berantai: setiap senjata benua itu menjadi kelemahan tepat satu boss di benua yang sama.
4. **Teks tanpa gender.**
   - `STAGES[k].place` (nama tempat, paling banyak 18 huruf) dan `STAGES[k].intro` (kalimat perkenalan) tidak menyebut pria, wanita, manusia, dan sejenisnya.
   - Di layar, benua cukup ditulis dengan namanya, tanpa kata "Benua".
5. **HP boss naik setiap benua**: `bossHp` benua baru harus lebih besar dari benua sebelumnya (Azura 3, Vespera 5, berikutnya misalnya 7).
6. **Senjata lengkap.**
   - Ikon bergaya kotak-kotak seperti ikon senjata lain.
   - Tembakan biasa, charge shot, dan ultra attack.
   - `lit: true` kalau senjatanya bercahaya, supaya menerangi stage gelap.
7. **Pulau alami di peta dunia** (`MAP_ISLANDS`), dengan landmark untuk setiap stage.
8. **Musuh baru masuk Training Ground** (`TRAIN_POOL`), kecuali musuh yang butuh medan khusus (air, langit-langit).
9. **Diuji sebelum selesai.**
   - Tes jangkauan dengan [tools/reach.js](../tools/reach.js) (tempel isinya di console browser saat game terbuka, jalankan `reachAll()`, lalu muat ulang halaman): setiap checkpoint dan pintu boss bisa dicapai dari awal; armor tidak terjangkau sebelum segel dibuka, dan terjangkau setelah segel dibuka.
   - Bagian yang bergantung waktu (press, laser, blok energi, cairan naik) dimainkan langsung.
   - Console bebas peringatan `[neobuster]`.
   - `VERSION` dinaikkan dan `CHANGELOG.md` diisi.

Validator (`validateContent()`) memeriksa yang bisa diperiksa otomatis: ruang rahasia di setiap stage, senjata segelnya, kelemahan berantai, `bossHp` yang naik, dan tabel yang belum lengkap. Keunikan stage dan boss harus dipastikan saat merancang.

## Menambah benua baru

Satu benua = **6 boss** dalam **satu file** sendiri, misalnya `js/continents/borea.js`. Contoh lengkapnya adalah `js/continents/vespera.js` (Benua Vespera). Benua baru terbuka setelah semua boss di benua sebelumnya dikalahkan.

1. Tambahkan entri di `CONTINENTS` (`js/stages/levels.js`):

   ```js
   { key: 'borea', name: 'BOREA', color: '#78a8f8', bossHp: 7, stages: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
   ```

   - `name` paling banyak 7 huruf (dipakai juga sebagai label baris di menu pause).
   - `color` dipakai untuk teks benua di peta.
   - `bossHp`: kelipatan HP boss di benua ini dari 28 (Azura 3, Vespera 5), harus lebih besar dari benua sebelumnya. Bar HP boss tetap 28 kotak dan menampilkan HP secara proporsional.
   - Pulaunya di peta dunia: tambahkan entri di `MAP_ISLANDS` (`js/world/worldmap.js`) dengan `seed`, `biome` (`meadow`, `twilight`, atau biome baru di `MAP_BIOMES`), `lobes` (elips yang membentuk pulau), `bays` (teluk, opsional), `ranges` dan `peaks` (pegunungan), `rivers` (mata air sungai), dan `landmarks` (landmark tiap stage dan posisi boss-nya). Tanpa entri, pulaunya dibuat otomatis dan boss-nya berdiri melingkar.

2. Buat file benua di `js/continents/`, lalu muat di `index.html` di bagian continents, **tepat setelah `js/continents/vespera.js`** (sebelum `js/world/` dan `js/core/main.js`):

   ```html
   <script src="js/continents/vespera.js"></script>
   <script src="js/continents/borea.js"></script>
   ```

   Gambar boss-bossnya (karakter native) masuk ke folder sendiri, misalnya `js/characters/borea/`, dan dimuat di bagian characters setelah boss Vespera.

3. Isi keenam boss di file itu (lihat bagian berikut).
4. Susun kelemahan supaya **setiap senjata benua itu menjadi kelemahan tepat satu boss di benua yang sama**. Validator memperingatkan kalau aturan ini dilanggar. Layar kelemahan dan urutan saran dihitung otomatis dari aturan ini.

File di `js/` dikelompokkan per fungsi: `core/` (mesin dan alur game), `art/` (gambar), `characters/` (karakter native, satu folder per benua), `stages/` (data stage dan layout Azura), `gameplay/` (pemain, senjata, musuh, boss, hazard, cheat), `continents/` (satu file per benua tambahan), dan `world/` (peta dunia dan Training Ground). Urutan pemuatannya ada di `index.html`.

Semua script berbagi satu scope global, jadi nama `const` / `function` di level atas file benua tidak boleh sama dengan nama di file lain (helper lokal sebaiknya diberi nama yang khas).

## Menambah boss / stage

File benua cukup mengisi tabel dan **registry** yang sudah ada dengan `Object.assign(TABEL, { k: ... })`. Tidak ada `switch` di file inti yang perlu diubah. Ganti `k` dengan key boss baru; `theme` boleh sama dengan key-nya.

### Data stage (`js/stages/levels.js`)

| Tabel             | Isi                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STAGES[k]`       | `name` (nama boss), `place` (tempat stage, paling banyak 18 huruf, tampil di Stage Select), `intro` (kalimat perkenalan boss tanpa menyebut gender, tampil di layar intro dan saat boss muncul), `theme`, `music`, `ambient`, `color` |
| `LAYOUTS[k](B)`   | layout level 450 × 44 tile dengan satu ruang rahasia (`B.secret`, lihat Mekanik bawaan), diakhiri `bossRoom(B, DOOR_COL, theme)`                                                                                                      |
| `ENEMY_COLORS[k]` | warna musuh umum (met, flyer, hopper, turret) di stage ini                                                                                                                                                                            |
| `BOSS_ROOMS[k]`   | opsional: gimmick ruang boss, `(B, dc) => { ... }` (`dc` = kolom pintu boss)                                                                                                                                                          |

### Gambar (`js/art/art.js`, karakter di `js/characters/chars.js`)

| Tabel / registry      | Isi                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TILESETS[k]`         | `ground`, `block`, `spike`, `ladder`, opsional `ice`                                                                                                                                                                                                                                                                                                                                                          |
| `BG_PAINTERS[k]`      | 2 lapis background parallax                                                                                                                                                                                                                                                                                                                                                                                   |
| `ROOM_ART[k]`         | opsional: hiasan dinding ruang boss                                                                                                                                                                                                                                                                                                                                                                           |
| `NATIVE_CHARS[style]` | tampilan boss: karakter native di file sendiri (contoh `js/characters/vespera/hydros.js`, `js/characters/vespera/sonique.js`), dimuat di `index.html` setelah `js/characters/chars.js`. Kerangka diberi pose lewat sudut sendi, lalu diberi bentuk; wajah memakai wajah bersama (`ncManFace` untuk pria, `ncWomanFace` untuk wanita). Lihat `js/characters/chars.js` dan panduan [ART-STYLE.md](ART-STYLE.md) |
| `WEAPON_ICONS[k]`     | ikon senjata                                                                                                                                                                                                                                                                                                                                                                                                  |
| `PLAT_COL[k]`         | warna platform bergerak                                                                                                                                                                                                                                                                                                                                                                                       |
| `AMBIENTS[name]`      | opsional: efek ambient baru `{ n, update(q), draw(q, x, y) }` (nama dipakai di `STAGES[k].ambient`)                                                                                                                                                                                                                                                                                                           |
| `ROOM_FX[k]`          | opsional: animasi di ruang boss `(rx, ry) => { ... }`                                                                                                                                                                                                                                                                                                                                                         |
| `POST_FX[k]`          | opsional: efek layar penuh setelah semua digambar (contoh: kegelapan stage `shadow`)                                                                                                                                                                                                                                                                                                                          |
| `PAD_DRAW[k]`         | opsional: gambar pad lontar `U` `(sx, sy) => { ... }`                                                                                                                                                                                                                                                                                                                                                         |
| `LIQUID[k]`           | opsional: warna cairan `~` `[dasar, puncak, buih]` (contoh: lumpur racun stage `toxic`)                                                                                                                                                                                                                                                                                                                       |

### Senjata, boss, musuh (`js/gameplay/actors.js`)

| Tabel / registry     | Isi                                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `WEAPONS[k]`         | `name`, `short`, `pal`, `glow`, `desc`, `charged`, `demo`, opsional `lit: true` (senjata bercahaya: tembakannya menerangi stage gelap dengan warna `glow`), plus `fire(p)`, `charge(p)` (kembalikan `false` kalau tidak bisa menembak), dan `ultra(p)` |
| `SHOT_KINDS[kind]`   | proyektil pemain: `update(s)`, `draw(s, x, y)`, opsional `offscreen: true` (tidak dihapus saat keluar layar)                                                                                                                                           |
| `BOSSES[k]`          | `name`, `style`, `pal`, `weapon: k`, `weak`, `update(b, enraged)`, opsional `tick(b)`, `pose(b, pose)`, `draw(b, sx, sy)`, `drawBehind(b, sx, sy)`                                                                                                     |
| `ESHOT_KINDS[kind]`  | proyektil musuh/boss: opsional `update(s)` (tanpa ini bergerak lurus dengan `vx`/`vy`), `draw(s, x, y)`, opsional `pierce: true` (tidak hilang saat mengenai pemain)                                                                                   |
| `HAZARD_KINDS[type]` | hazard: `make(d)`, `update(h, p)`, `draw(h)`; pasang di layout dengan `B.add(type, x, y, {...})`                                                                                                                                                       |
| `EN[name]`           | musuh (lihat [Menambah musuh](#menambah-musuh))                                                                                                                                                                                                        |

### Lagu (`js/core/engine.js`)

`SONGS[music]`, bisa juga diisi dari file benua dengan `Object.assign(SONGS, {...})`.

### Mekanik bawaan yang bisa dipakai

- Tile `W` (air): pemain jatuh pelan dan lompat lebih tinggi. Isi rongga dengan air setelah `cave`/`shaft`, supaya tangga tidak tertimpa.
- `game.timeStop = n`: membekukan musuh, peluru musuh, hazard, dan boss selama `n` frame.
- `player.stun = n`: pemain tidak bisa bergerak selama `n` frame.
- HP boss: `bossMaxHp(k)` (`js/gameplay/actors.js`) = 28 × `bossHp` benuanya. Bar HP boss selalu 28 kotak dan menampilkan HP secara proporsional; boss mengamuk (`enraged`) di setengah HP.
- Atap (wajib untuk setiap atap yang dilalui jalur dari bawah): `B.roof(x0, x1, top, reach = 8)` menandai atap aula, menara, atau balok tempat slide, yang permukaan atasnya di baris `top` di kolom `x0..x1`. Step Jump tidak bisa mengangkat pemain melewati permukaan itu selama pemain berada dalam `reach` kolom darinya, jadi bagian stage tidak bisa dilewati lewat atas. Untuk medan duri, lava, atau air yang menutupi jalur di bawahnya (terowongan, saluran, kanal), pakai `reach` 1: tidak bisa diseberangi dengan Step Jump. Atap juga tidak boleh bisa dicapai dengan gerakan biasa; kalau bisa, tinggikan sampai batas atas peta (baris 0).
- Ruang rahasia (wajib, satu per stage): `B.secret(x0, y0, x1, y1, sx, weapon, ax)` menggali ruangan `x0..x1`, `y0..y1` (lantainya baris di bawah `y1`), memasang dinding segel setinggi 3 tile di kolom `sx` yang berdiri di lantai yang sama, dan armor di kolom `ax`. Dinding segel hanya hancur oleh `weapon` (senjata boss lain, bukan senjata stage itu sendiri), dan ruangannya tampak seperti batu sampai segelnya hancur. Letakkan segel di samping jalur utama, di lantai tempat pemain bisa berdiri menghadapnya, dan pastikan ruangan tertutup (tidak terbuka ke jurang atau ruang lain). Tampilan dinding segel per senjata ada di `SEAL_LOOKS` (`js/gameplay/actors.js`); senjata baru yang dipakai untuk segel perlu tampilan di sana. Uji dengan tes jangkauan: tanpa membuka segel armor tidak boleh terjangkau, dengan segel terbuka armor harus terjangkau.
- Platform melingkar: `B.add('plat', x, y, { r: 3, speed: 0.02, phase: 0 })` (pusat di tile `x`, `y`, jari-jari `r` tile). Beberapa platform dengan pusat yang sama dan `phase` berbeda menjadi roda (contoh: muka jam di stage Time).
- Mesin press: `B.add('crusher', x, y, { y1, w: 2, phase })`: kepala press di langit-langit baris `y` menghantam sampai lantai di baris `y1`, berguncang dulu sebagai peringatan. Warnanya per stage di `CRUSHER_COLS` (`js/gameplay/actors.js`).
- Cairan naik: `B.add('rising', x, y, { x1, y1, speed, delay })`: lava (atau asam, mengikuti `LIQUID[theme]`) naik dari kolamnya di baris `y` sampai baris `y1` di kolom `x`..`x1`, mulai `delay` frame setelah pemain memanjat keluar dari kolam. Kecepatan memanjat rata-rata (tangga dan berjalan antar-tangga) harus lebih cepat dari `speed`.
- Laser setinggi kepala: `hlaser` dengan `oy: 6` di baris kedua di atas lantai (slide di bawahnya); laser di baris tepat di atas lantai dilompati.
- Kapak: `pendulum` dengan `axe: true`.

### Tips layout

- Lompatan normal melewati 3 tile kosong dan naik paling tinggi 2 tile.
- Duri paling lebar 2 tile, karena duri langsung mematikan begitu tersentuh.
- Pad lontar (`U`) naik sekitar 8 tile.
- Buat alur yang khas untuk setiap stage (menara, gua, sumur, rute langit, kendaraan) dengan mekanik stage itu sendiri, jangan menyalin geometri stage lain.
- Semua aturan tile dan helper builder (`ground`, `pillar`, `solid`, `cave`, `shaft`, `pit`, `pool`, `ledge`, `belt`, `flood`, dan lainnya) dijelaskan di `js/stages/levels.js`.
- Uji setiap stage dengan tes jangkauan ([tools/reach.js](../tools/reach.js): setiap checkpoint dan pintu boss bisa dicapai dari awal), lalu cek bagian yang bergantung pada waktu (press, laser, blok energi, cairan naik) dengan memainkannya.

## Training Ground

Training Ground ada di `js/world/training.js` (dimuat setelah `worldmap.js`): stage `train` dengan arenanya (`LAYOUTS.train`), tampilannya (`TILESETS.train`, `BG_PAINTERS.train`), lagunya, gelombang musuh (`TRAIN_POOL`: musuh yang ikut muncul mulai wave tertentu; `TRAIN_AIR`: musuh yang muncul di udara), dan pulaunya di peta (`MAP_TRAINING`, biome `tropic`, landmark `arena`). Musuh baru dari benua baru bisa ditambahkan ke `TRAIN_POOL` kalau tidak bergantung pada medan khusus (air, langit-langit).

## Menambah part shop

1. Tambahkan entri di `SHOP` (`js/core/main.js`): `key`, `cat` (salah satu key di `SHOP_TABS`), `name`, `price`, `desc`, dan opsional `needs` (key part yang harus dibeli dulu).
2. Gambar ikonnya di `drawPartIcon()` (`js/core/main.js`, ukuran 14 × 14).
3. Pasang efeknya di `js/gameplay/actors.js` dengan `hasPart('key')`.

Tab bisa digulir, jadi jumlah part per tab tidak dibatasi. Untuk kategori baru, cukup tambahkan entri di `SHOP_TABS`.

## Menambah musuh

1. Tambahkan definisi di `EN` (di `js/gameplay/actors.js`, atau dengan `Object.assign(EN, {...})` di file benua): `w`, `h`, `hp`, `dmg`, `score`, opsional `grav` (jatuh saat dibekukan), serta `init`, `update`, dan `draw`.
2. Pasang musuhnya di layout dengan `B.add('namamusuh', x, y)`.

Warna musuh umum diambil dari `ENEMY_COLORS[theme]` lewat `EC()`.

## Sebelum commit

- Naikkan `VERSION` di `js/core/engine.js`, lalu tambahkan catatan di `CHANGELOG.md`.
- Jalankan `yarn format`.
- Buka game, pastikan console tidak menampilkan peringatan `[neobuster]`, lalu mainkan stage barunya sampai ke boss.
