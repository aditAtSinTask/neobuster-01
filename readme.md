# NEOBUSTER

> Game action-platformer 2D bergaya **Mega Man** untuk browser — grafik pixel-art yang lebih kaya, tapi tetap ringan dan optimal untuk web.

**Versi saat ini: `0.2.0`** — versi juga tampil di pojok kanan bawah layar title & pause, dan di judul tab browser.

---

## Daftar Isi

- [Konsep](#konsep)
- [Cara Menjalankan](#cara-menjalankan)
- [Kontrol](#kontrol)
- [Boss & Senjata](#boss--senjata)
- [Progress & Save](#progress--save)
- [Cheat Code](#cheat-code)
- [Struktur Proyek](#struktur-proyek)
- [Versi & Changelog](#versi--changelog)

---

## Konsep

- Pilih salah satu dari **4 stage** boss, dalam urutan bebas.
- Setiap stage punya area halang rintang: duri, lava, lantai es, balok rapuh, tangga, jembatan bergerak, gergaji, semburan api, dan musuh.
- Di ujung stage ada **pintu boss**. Kalahkan boss untuk mendapatkan **senjatanya**.
- Semua senjata boss **unlimited** — tidak ada energi senjata yang bisa habis.
- Setiap boss **lemah** terhadap senjata boss lain. Gunakan untuk memberi damage besar.

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
| Charge shot | Tahan `X` lalu lepas | Tahan tombol tembak |
| Slide | `C` / `L` (atau `↓` + lompat) | RT / Y |
| Ganti senjata | `Q` / `E` | LB / RB |
| Pause & menu senjata | `Enter` / `Esc` | Start |
| Mute | `M` | — |
| Reset progress (di title) | `R` | — |
| Buka cheat box | Tekan `P` + `O` bersamaan | — |

## Boss & Senjata

| Stage | Boss | Senjata yang didapat | Efek senjata | Lemah terhadap |
| --- | --- | --- | --- | --- |
| Cut | **CUTMAN** — manusia gunting | Rolling Cutter | Boomerang gunting, menembus musuh | Rock Breaker |
| Fire | **FIREMAN** — manusia api | Fire Storm | Bola api + perisai api | Frost Shard |
| Snow | **SNOWWOMAN** — wanita es | Frost Shard | 3 kristal es, membekukan musuh | Fire Storm |
| Earth | **EARTHWOMAN** — wanita tanah & batu | Rock Breaker | Batu yang pecah jadi 4 serpihan | Rolling Cutter |

Setelah keempat boss dikalahkan, muncul layar ending.

## Progress & Save

Data disimpan di `localStorage` browser (key `neobuster-save-v1`).

- **Boss yang sudah dikalahkan** tersimpan otomatis.
- **Save point manual** dibuat dengan cheat `INGATANKUAT`. Yang disimpan: jumlah life, skor, senjata aktif, dan — jika sedang di dalam stage — stage tersebut beserta checkpoint-nya.
- Jika ada save point, layar title menampilkan pilihan **CONTINUE** / **NEW GAME** (pilih dengan tombol panah).
  - **CONTINUE** melanjutkan dari save point. Kalau disimpan di dalam stage, game langsung masuk ke stage itu (dari checkpoint jika sudah melewatinya).
  - **NEW GAME** mulai dengan 2 life dan skor 0. Boss yang sudah dikalahkan tetap tersimpan.
- Tekan `R` di title untuk menghapus semua progress.

## Cheat Code

Tekan **`P` + `O` bersamaan** untuk membuka cheat box. Ketik kode, tekan `Enter` untuk memakai, atau `Esc` untuk batal. Game berhenti sementara selama cheat box terbuka.

| Kode | Efek | Bisa dipakai |
| --- | --- | --- |
| `MAUKUAT` | HP penuh | Di dalam stage, saat karakter masih hidup |
| `AWETMUDA` | Life +1 (maks. 99) | Selama permainan berjalan |
| `INGATANKUAT` | Simpan progress saat ini (lihat [Progress & Save](#progress--save)) | Selama permainan berjalan |

Cheat tidak bisa dipakai di layar title, game over, atau ending.

## Struktur Proyek

```
neobuster/
├── index.html      # canvas + urutan pemuatan script
├── readme.md
└── js/
    ├── engine.js   # versi, canvas, input, audio & musik, font pixel, sprite & glow
    ├── art.js      # sprite robot (hero + 4 boss), background parallax, tileset, ikon senjata
    ├── levels.js   # data stage & layout level
    ├── actors.js   # fisika, player, senjata, musuh, hazard, platform, boss
    ├── cheats.js   # cheat box (P + O) dan daftar cheat code
    └── main.js     # alur game (title, select, stage, boss, ending), render, save, game loop
```

Detail teknis:

- Resolusi internal **384 × 224**, di-scale ke layar dengan kelipatan bulat agar pixel tetap tajam.
- Logika berjalan tetap **60 langkah/detik**. Render diinterpolasi agar mulus di layar 120/144 Hz.
- Semua grafik dan suara dibuat lewat kode (Canvas 2D + Web Audio), tanpa file aset.

## Versi & Changelog

Versi ditulis di konstanta `VERSION` di `js/engine.js`. Setiap ada perubahan, naikkan versinya dan tambahkan catatan di bawah.

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
