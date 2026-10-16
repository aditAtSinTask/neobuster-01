# Menambah Konten

Panduan untuk menambah benua, boss, part shop, atau musuh tanpa merusak yang sudah ada.

Semua konten disimpan di tabel yang dikunci dengan **key** yang sama. Satu stage, boss-nya, dan senjata yang didapat dari boss itu memakai satu key (misalnya `cut`). Karena itu save (`save.cleared`), daftar senjata, menu pause, dan layar kelemahan otomatis ikut bertambah begitu tabelnya diisi.

Setelah menambah apa pun, buka game lalu lihat **console browser**. `validateContent()` (di `js/main.js`) mencetak peringatan `[neobuster] ...` untuk setiap bagian yang belum lengkap. Kalau console bersih, datanya sudah lengkap.

## Menambah benua baru

Satu benua = **6 boss**. Benua baru terbuka setelah semua boss di benua sebelumnya dikalahkan, dan muncul otomatis di Peta Dunia, Stage Select, grid senjata di menu pause, dan layar kelemahan.

1. Tambahkan entri di `CONTINENTS` (`js/levels.js`):

   ```js
   { key: 'borea', name: 'BOREA', color: '#78a8f8', stages: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] },
   ```

   - `name` paling pas 5 huruf atau kurang (dipakai juga sebagai label baris di menu pause).
   - `color` dipakai untuk warna daratan di peta.

2. Tambahkan keenam boss-nya (lihat bagian berikut).
3. Susun kelemahan supaya **setiap senjata benua itu menjadi kelemahan tepat satu boss di benua yang sama**. Validator memperingatkan kalau aturan ini dilanggar. Layar kelemahan dan urutan saran dihitung otomatis dari aturan ini.

## Menambah boss / stage

Ganti `k` dengan key boss baru. `theme` boleh sama dengan key-nya.

| File           | Yang ditambahkan                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `js/levels.js` | `STAGES[k]` (`name`, `title`, `theme`, `music`, `ambient`, `color`), `LAYOUTS[k](B)` berisi layout level 300 × 44 tile, `ENEMY_COLORS[theme]`, dan opsional gimmick ruang boss di `bossRoom()`                                   |
| `js/art.js`    | `TILESETS[theme]` (`ground`, `block`, `spike`, `ladder`, opsional `ice`), `BG_PAINTERS[theme]` (2 lapis parallax), opsional `ROOM_ART[theme]`, tampilan boss di `drawRobot()` (`style`), dan ikon senjata di `drawWeaponIcon()`  |
| `js/actors.js` | `WEAPONS[k]` (`name`, `short`, `pal`, `glow`, `desc`, `charged`, `demo`), `BOSSES[k]` (`name`, `style`, `pal`, `weapon: k`, `weak`, `update`), serta tembakan senjata di `fireSpecial`, `fireCharged`, `fireUltra`, `updateShot` |
| `js/main.js`   | `PLAT_COL[theme]`, gambar proyektil di `drawPlayerShot`, opsional animasi ruang boss di `drawRoomFx`, dan efek ambient baru di `makeAmbient`, `updateAmbient`, `drawAmbient`                                                     |
| `js/engine.js` | Lagu `SONGS[music]`                                                                                                                                                                                                              |

Tips layout:

- Lompatan normal melewati 3 tile kosong dan naik paling tinggi 2 tile.
- Duri paling lebar 2 tile, karena duri langsung mematikan begitu tersentuh.
- Pad angin (`U`) naik sekitar 8 tile.
- Semua aturan tile dan helper builder (`ground`, `pillar`, `cave`, `shaft`, `pit`, `pool`, dan lainnya) dijelaskan di komentar atas `js/levels.js`.

## Menambah part shop

1. Tambahkan entri di `SHOP` (`js/main.js`): `key`, `cat` (salah satu key di `SHOP_TABS`), `name`, `price`, `desc`, dan opsional `needs` (key part yang harus dibeli dulu).
2. Gambar ikonnya di `drawPartIcon()` (`js/main.js`, ukuran 14 × 14).
3. Pasang efeknya di `js/actors.js` dengan `hasPart('key')`.

Tab bisa digulir, jadi jumlah part per tab tidak dibatasi. Untuk kategori baru, cukup tambahkan entri di `SHOP_TABS`.

## Menambah musuh

1. Tambahkan definisi di `EN` (`js/actors.js`): `w`, `h`, `hp`, `dmg`, `score`, opsional `grav`, serta `init`, `update`, dan `draw`.
2. Pasang musuhnya di layout dengan `B.add('namamusuh', x, y)`.

Warna musuh umum diambil dari `ENEMY_COLORS[theme]` lewat `EC()`.

## Sebelum commit

- Naikkan `VERSION` di `js/engine.js`, lalu tambahkan catatan di `CHANGELOG.md`.
- Jalankan `yarn format`.
- Buka game, pastikan console tidak menampilkan peringatan `[neobuster]`, lalu mainkan stage barunya sampai ke boss.
