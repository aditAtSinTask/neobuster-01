# Changelog

Semua perubahan NEOBUSTER, versi terbaru di atas. Versi ditulis di konstanta `VERSION` di `js/engine.js`.

## 1.9.1

- **Cloud Save memakai TOTP**: token API tidak lagi dikirim di header. Setiap request membawa `x-external-uid` dan `x-external-totp`, yaitu 32 digit pertama HMAC-SHA512 dari token dengan langkah waktu 30 detik. Server menerima langkah waktu saat ini dan sebelumnya.
- HMAC-SHA512 dihitung dengan JavaScript biasa, jadi Cloud Save tetap berjalan tanpa HTTPS (dibuka dari file, atau lewat HTTP di jaringan lokal).
- **Koreksi jam otomatis**: kalau jam perangkat meleset dan server menolak TOTP-nya, game mengambil waktu dari header `Date` di jawaban server (server mengizinkannya lewat `Access-Control-Expose-Headers: Date`), mengulang request sekali, dan memakai selisihnya untuk request berikutnya. Kalau tetap gagal, Cloud Save menampilkan "JAM PERANGKAT TIDAK TEPAT".

## 1.9.0

- **Cloud Save**: progress bisa disimpan di cloud dan dilanjutkan di perangkat mana pun. Pilih **CLOUD SAVE** di menu title.
  - Masuk tanpa daftar: ID save adalah hash SHA-256 dari username dan password, jadi username dan password yang sama selalu membuka save yang sama. Password tidak disimpan dan tidak dikirim.
  - Untuk akun baru, password diminta sekali lagi sebelum save dibuat, supaya salah ketik tidak membuat akun kosong.
  - Setelah masuk, progress diunggah otomatis beberapa detik setelah setiap perubahan, dan statusnya tampil di pojok layar title dan peta.
  - Saat masuk atau saat game dibuka, save di cloud dan di perangkat ini dibandingkan. Cloud yang lebih baru dimuat otomatis kalau perangkat ini tidak berubah; kalau keduanya berubah, pemain memilih mana yang dipakai.
  - Layar Cloud Save juga punya SIMPAN SEKARANG, MUAT DARI CLOUD, dan KELUAR AKUN.
- Menu title sekarang **START** (atau **CONTINUE** / **NEW GAME**) dan **CLOUD SAVE**.
- **Reset progress di title** sekarang perlu menekan `R` dua kali, karena saat masuk Cloud Save reset juga menghapus progress di cloud.

## 1.8.3

- **Aturan wajib konten baru dicatat** di [docs/MENAMBAH-KONTEN.md](docs/MENAMBAH-KONTEN.md), dalam satu daftar: stage yang unik dan menantang, ruang rahasia dengan armor di setiap stage, boss native dengan wajah bersama dan ciri khas, teks tanpa gender, HP boss yang naik setiap benua, senjata lengkap, pulau di peta, musuh baru di Training Ground, dan pengujian.
- Validator sekarang juga memperingatkan kalau `bossHp` sebuah benua tidak lebih besar dari benua sebelumnya.
- **`AGENTS.md`** (dan `CLAUDE.md` yang memuatnya) di root proyek: aturan kerja, aturan konten baru, dan cara menguji untuk developer lain dan AI coding agent mereka. File ini dibaca otomatis oleh Claude Code, Codex, Cursor, Copilot, dan agent lain.
- **`tools/reach.js`**: tes jangkauan stage yang bisa dijalankan siapa saja. Tempel isinya di console browser saat game terbuka, lalu jalankan `reachAll()`. Hasilnya tabel per stage: pintu boss dan checkpoint terjangkau, armor tidak terjangkau selama segelnya utuh, dan terjangkau setelah segelnya hancur. Save (boss yang sudah kalah, armor) tidak ikut berubah.

## 1.8.2

- **Perbaikan: musuh kadang tidak bisa mati walau terkena tembakan.** Ultra attack yang bekerja di seluruh layar (Thunder God, Plague, Eclipse, Supersonic, Supernova, Chrono Break, termasuk lewat Omega Booster) punya titik pengendali tak terlihat di tengah badan pemain. Musuh yang sedang menempel di pemain ikut "terkena" titik itu tanpa nilai damage, sehingga HP-nya rusak dan musuh itu tidak bisa mati lagi. Sekarang titik pengendali itu tidak pernah mengenai musuh atau boss secara langsung (serangannya tetap bekerja seperti biasa), setiap tembakan tanpa nilai damage dihitung 1, dan HP yang rusak langsung dianggap habis.

## 1.8.1

- **File JavaScript dikelompokkan ke folder per fungsi**, supaya jelas isi setiap file:
  - `js/core/`: `engine.js` (canvas, input, suara, musik, teks) dan `main.js` (alur game, layar, shop, save, game loop).
  - `js/art/`: `art.js` (palet, tileset, background, ikon senjata).
  - `js/characters/`: sistem karakter native (`chars.js`), Nexo (`nexo.js`), dan boss per benua di `azura/` dan `vespera/`.
  - `js/stages/`: `levels.js` (data benua dan stage, builder layout, layout stage Azura).
  - `js/gameplay/`: `actors.js` (pemain, senjata, musuh, boss Azura, hazard, ruang rahasia) dan `cheats.js`.
  - `js/continents/`: `vespera.js` (seluruh isi Benua Vespera).
  - `js/world/`: `worldmap.js` (pulau di peta dunia) dan `training.js` (Training Ground).
- `index.html` memuat file dari folder barunya dengan urutan yang sama, diberi komentar per bagian. Readme dan panduan di `docs/` ikut diperbarui. Tidak ada perubahan pada gameplay.

## 1.8.0

- **Ruang rahasia di setiap stage**: setiap stage menyembunyikan satu ruangan di balik dinding bersegel yang hanya hancur oleh satu senjata spesial milik boss lain. Ruangannya tampak seperti batu biasa sampai segelnya hancur, dan dinding segelnya dibuat dari bahan yang cocok dengan senjatanya (dengan ikon senjatanya): gerbang roda gigi (Time Stopper) di Cut, batu magma (Frost Shard) di Fire, batu retak (Rock Breaker) di Elec, dinding es (Fire Storm) di Snow, papan kayu tambang (Rolling Cutter) di Earth, jendela kaca (Sonic Boom) di Wind, jeruji berkarat (Venom Drip) di Hydro, barikade drum terbakar (Hydro Blast) di Toxic, dinding kegelapan (Prism Laser) di Shadow, gumpalan awan (Gale Shot) di Sonic, dinding cahaya (Shadow Clone) di Light, dan pintu berkunci listrik (Thunder Beam) di Time. Tembakan senjata lain memantul dan memunculkan nama senjata yang dibutuhkan; ultra attack yang mengenai seluruh layar juga menghancurkan segel senjatanya.
- **Armor**: di setiap ruang rahasia ada armor yang membuat HP 1x lebih tebal untuk seterusnya (1 armor = 2x, 12 armor = 13x). Kelipatannya tampil sebagai badge X di atas bar HP beserta sisa HP sebagai angka. Dengan cheat `ILMUKEBAL` kelipatannya menjadi 10x + 1x per armor (11x, 12x, dan seterusnya).
- **HP boss per pulau**: boss Azura sekarang 3x (84 HP) dan boss Vespera 5x (140 HP) dari HP dasar 28 (sebelumnya semua 2x). Bar HP boss tetap 28 kotak.
- **Pulau Training Ground** di ujung kanan peta dunia: arena luas bertingkat dengan gelombang musuh tanpa akhir. Setiap wave membawa lebih banyak musuh dengan HP yang makin tebal (+0,5x per wave), musuh baru ikut muncul dari wave 3 dan 5, musuh sering menjatuhkan health, dan setiap wave yang dibereskan memberi bonus poin. Latihan berakhir saat jatuh (tanpa kehilangan life) atau keluar lewat menu pause; layar hasil menampilkan wave, musuh, waktu, poin, dan rekor wave (tersimpan dan tampil di peta).

## 1.7.0

- **Part baru STEP JUMP** (tab GERAK, 100.000 POIN): tekan lompat saat di udara untuk melompat lagi dari pijakan cahaya yang muncul di bawah kaki, berkali-kali tanpa batas. Setiap Step Jump juga mengembalikan Air Dash, dan bisa dipakai untuk melompat keluar dari Air Dash. Ikonnya tiga pijakan cahaya yang naik seperti tangga.
- **Harga UNLIMITED DASH naik menjadi 100.000 POIN**, sama dengan Step Jump (sebelumnya 20.000).

## 1.6.0

- **HP boss 2x lebih tebal**: setiap boss sekarang punya 56 HP (sebelumnya 28). Bar HP boss tetap 28 kotak, jadi satu kotak = 2 HP. Butuh 14 tembakan kelemahan biasa (sebelumnya 7) atau 56 tembakan Neo Buster biasa. Boss tetap mengamuk di setengah HP.
- **Tanpa kata "Benua" di layar**: peta dunia, Stage Select, pesan saat semua boss satu pulau dikalahkan, dan ending cukup menulis AZURA, VESPERA, dan seterusnya. Pulau yang belum ada bernama "???" dan petunjuk peta menjadi "KIRI/KANAN PILIH". Judul ending menjadi "SEMUA BOSS TELAH DITAKLUKKAN".
- **Part baru UNLIMITED DASH** (tab GERAK, 20.000 POIN, harus punya Turbo): Air Dash bisa dipakai berulang kali dalam satu lompatan, dan slide maupun Air Dash terus berjalan selama tombol slide ditahan (paling tidak sepanjang durasi normalnya). Ikonnya lambang ∞.

## 1.5.0

- **Perkenalan boss tanpa gender**: label seperti "Manusia Air" atau "Wanita Bayangan" diganti. Stage Select menampilkan nama tempat stage (mis. BENDUNGAN, BENTENG GELAP), dan layar intro stage serta saat boss muncul menampilkan kalimat perkenalan boss (mis. HYDROS: "MENGENDALIKAN ARUS DAN GELOMBANG").
- **Ikon R. Cutter digambar ulang** dengan gaya kotak-kotak yang sama dengan ikon senjata lain: empat bilah merah berputar di poros perak dengan ujung emas.
- **Cheat `AKUABADI`**: life tak terbatas. Mati tidak mengurangi life (kembali ke checkpoint), dan HUD serta menu pause menampilkan **LIFE ∞**. Aktif sampai kembali ke title.
- **Senjata bercahaya menerangi benteng gelap Umbrion**: memegang Fire Storm, Thunder Beam, atau Prism Laser memperluas cahaya di sekitarmu (makin terang saat charge dan sesaat setelah menembak). Tembakannya menerangi sekitarnya dengan warnanya sendiri (bola dan pilar api oranye, petir kuning, laser pelangi), dan Supernova menerangi seluruh benteng selama cincinnya meluas.
- **Part baru di Shop (tab GERAK)**:
  - **Air Dash** (12.000 POIN): tekan slide saat di udara untuk dash mendatar, sekali per lompatan. Nexo condong ke depan dengan semburan jet dari sepatunya dan dua bayangan yang mengikuti. Bisa sambil menembak; dash berhenti di dinding atau saat kamu menekan arah sebaliknya.
  - **Turbo** (9.000 POIN): slide dan Air Dash 3x lebih lama.

## 1.4.0

- **Peta dunia dengan pulau yang alami**: setiap benua sekarang pulau sungguhan dengan garis pantai yang berlekuk (teluk dan tanjung), air dangkal dan ombak yang bergerak di sepanjang pantai, pasir, padang rumput dengan rumput dan bunga, hutan, sungai yang mengalir dari pegunungan, gunung bersalju, dan landmark tiap stage di tempat boss-nya berdiri.
  - **Azura**: pulau hijau dengan hutan, sungai, pabrik penggergajian Sniptor, gunung berapi Magmaron yang berasap, menara petir Voltrax di bawah awan badai, istana es Glacielle di puncak gunung salju, lengkung batu Terralyn di ngarai merah, dan istana langit Winderwomen yang melayang.
  - **Vespera**: pulau berbentuk bulan sabit dengan teluk dalam, hutan musim gugur, ladang lavender, danau, menara air Hydros, pabrik kimia Toxaris di rawa beracun, benteng gelap Umbrion di hutan hitam, panggung konser Sonique dengan sorot lampu, istana kristal Lumina, dan menara jam Chronia.
  - **Benua baru**: pulau gelap yang tertutup awan berarak.
- **Kedua belas stage dirombak total, masing-masing dengan alur dan rintangan yang khas** (lihat tabel Stage di readme). Contohnya: aula pengepres dan sumur penggergajian (Cut), saluran kawah dengan lava yang naik mengejar (Fire), aula sinar beruntun dan kereta gantung (Elec), tebing dalam badai dan luncuran es (Snow), kereta tambang di atas jurang (Earth), turun lewat tiga aula benteng langit (Wind), berenang dari batu ke batu di waduk (Hydro), tangki banjir dengan asam yang naik (Toxic), aula kapak berayun (Shadow), lantai dansa yang menyala mengikuti ketukan (Sonic), laser setinggi kepala yang harus dilewati dengan slide (Light), dan muka jam raksasa yang jarumnya dinaiki (Time).
- Rintangan baru: **mesin press** yang menghantam dari langit-langit (berguncang dulu sebagai peringatan), **lava dan asam yang naik** di saluran saat kamu memanjat, **kapak berayun** di benteng gelap, **laser setinggi kepala**, dan blok energi Sonique yang tampil sebagai **ubin lantai dansa** magenta dan cyan.
- Setiap stage diuji dengan tes jangkauan: pintu boss dan setiap checkpoint bisa dicapai dari awal.

## 1.3.0

- **Nexo dan keenam boss Benua Azura digambar ulang secara native**, bukan lagi potongan gambar dari lembar karakter. Lembar karakter dipakai sebagai referensi desain (siluet, proporsi, warna, helm, rambut, senjata), lalu setiap karakter dibangun di kode dari kerangka yang digerakkan lewat sudut sendi dan diberi bentuk, dan dirasterisasi menjadi pixel art dengan outline 1 pixel dan cel shading. Semua frame memakai badan yang sama, jadi gerakannya natural dan tidak ada bagian yang meloncat saat frame berganti.
- **Lari tanpa moonwalk**: kaki yang menapak diletakkan dengan inverse kinematics dan bergerak mundur persis secepat karakter berlari, jadi kaki benar-benar diam di tanah sampai terangkat. Siklusnya 10 frame per dua langkah, dengan pinggul naik-turun, tumit menendang ke belakang, dan lengan mengayun.
- **Tajam di semua layar**: karakter digambar pada kerapatan layar sendiri (layar 2x, 4x, dan 6x, serta tampilan 3x di layar judul, intro, dan ending), selalu satu pixel layar per pixel kecil.
- **Nexo**: rambut jabrik cokelat, mata biru, armor biru dengan kerah dan lambang sayap emas, bantalan bahu bersirip, sarung tangan dan sepatu bot besar, dan Neo Buster. Bernapas saat diam; pose diam, tembak, lari (juga sambil menembak), lompat naik dan turun, sliding, terpental, dan memanjat tangga dilihat dari belakang. Warna senjata tetap hanya mengubah rambut, sarung tangan, buster, dan sepatu.
- **Sniptor**: jambul seperti bilah, sirip perak di sisi helm, dan visor emas. R. Cutter berputar di peluncurnya (ikut grayscale dan kedip putih), dan peluncurnya berkilat saat melempar.
- **Magmaron**: golem lava dengan urat lava menyala, tanduk banteng, dan meriam emas. Api di knalpot bahunya selalu menyala dan berkobar saat gelombang api dan pilar api; berjalan dengan langkah berat.
- **Voltrax**: jambul petir emas, visor biru, dan inti energi cyan. Energi terkumpul di meriam sebelum Thunder Beam, tangannya berpercik saat memanggil petir, jongkok saat mendarat, dan Volt Rush menerjang rendah.
- **Glacielle**: tiara kristal, kristal es di bahu, lengan, dan sepatu, dan rambut panjang yang berkibar. Bola es terkumpul di tangannya sebelum pecahan es, sliding rendah, dan meraih ke atas saat memanggil es.
- **Terralyn**: armor batu bersudut, permata hijau, dan kuncir panjang. Energi hijau terkumpul di kepalan batunya sebelum melempar batu besar (sekarang dari kepalannya), batu melayang saat memanggil hujan batu, dan duri batu saat mendarat dari lompatan gempa.
- **Winderwomen**: helm bersayap dan rambut mint panjang yang berkibar tertiup angin. Pusaran angin di telapak tangannya saat angin kencang dan siklon; naik, melayang, lalu menukik saat menyerang dari udara, dan semburan angin saat mendarat.
- **Keenam boss Benua Vespera juga digambar ulang secara native**, menggantikan rig lama, masing-masing dengan ciri khas yang selalu terlihat:
  - **Hydros**: jambul sirip hiu, pelindung telinga berbentuk sirip, insang di dada, sirip di lengan dan betis, tangki kaca berisi air yang bergoyang di punggung, dan meriam Hydro Blast yang selalu meneteskan air. Semprotan air di setiap tembakan, gelembung besar yang membesar sebelum gelembung dilepas, dan percikan air saat mendarat dari lompatan ombak.
  - **Toxaris**: masker gas dengan tabung filter, kacamata bulat yang menyala hijau di helmnya, tangki kimia berisi cairan hijau yang menggelegak, selang ke nosel di lengannya, garis bahaya kuning-hitam, asap racun yang terus mengepul, dan lendir yang menetes dari jarinya. Gumpalan racun membesar di nosel sebelum diludahkan, tangkinya menyembur saat awan racun, dan lendir memercik saat mendarat.
  - **Umbrion**: ninja kegelapan dengan tanduk panjang, masker ninja, mata ungu menyala, cakar, dan jubah compang-camping yang berkibar mengikuti geraknya. Aura gelap dengan asap bayangan, ledakan bayangan saat melepas klon, bola gelap yang membesar di atas tangannya, dan jejak bayangan saat menerjang keluar dari warp. Klon bayangannya (dan klon bayangan Nexo) sekarang berupa siluet gelap yang berlari.
  - **Sonique**: idola pop dengan headphone, mikrofon headset, rambut kuncir dua, bantalan bahu dan sepatu ber-speaker yang berdenyut mengikuti ketukan, dan not musik yang melayang. Cincin suara di setiap Sonic Boom, gelombang suara saat berteriak, dan garis kecepatan saat menerjang.
  - **Lumina**: pendeta cahaya dengan tiara prisma, lingkaran cahaya di belakang kepala, prisma kristal di bahu, rambut emas panjang, dan kilau cahaya yang mengitarinya. Prisma di tangannya mengisi cahaya lalu memecahnya menjadi pelangi saat laser, dan kedua tangannya bersinar saat memanggil pilar dan kilatan cahaya.
  - **Chronia**: wanita jam dengan jam di dada yang jarumnya benar-benar berputar, jambul jarum jam di sanggulnya, bantalan bahu roda gigi, roda gigi berputar di roknya, bandul yang berayun, dan jarum jam besar yang ia pegang dan lempar. Dial jam besar menyala di belakangnya saat menghentikan waktu, dan roda gigi berhamburan saat ia muncul dari warp.
- **Wajah seragam**: semua karakter memakai wajah bersama. Boss pria memakai mata Nexo dengan ekspresi marah (dan ekspresi kesakitan saat terhuyung), boss wanita memakai wajah yang sama dengan Glacielle, Terralyn, dan Winderwomen (ditambah ekspresi berteriak untuk Sonique). Masker hanya menutup mulut dan hidung, jadi matanya tetap terlihat.
- Rig robot lama (`ROBOT_STYLES`) dihapus; semua karakter sekarang native.
- Sprite hasil konversi dari versi 1.2.0 (`js/*-sprites.js`) dihapus. Sistemnya ada di `js/chars.js`, satu file per karakter (`js/nexo.js`, `js/sniptor.js`, `js/magmaron.js`, `js/voltrax.js`, `js/glacielle.js`, `js/terralyn.js`, `js/winderwomen.js`); cara menambah karakter ada di [docs/ART-STYLE.md](docs/ART-STYLE.md).

## 1.2.0

- **Lari Nexo tidak moonwalk lagi**. Siklus lari hanya memakai frame yang kaki menapaknya benar-benar bergerak ke belakang di bawah badan (kaki depan mendarat, menapak, lalu kaki di bawah badan), disusul dua frame melayang dengan badan sedikit terangkat; frame lembar karakter yang kakinya bergerak maju lagi tidak dipakai sebagai frame menapak. Tiap frame tampil 2 tick, dan kaki yang menapak kembali ke posisi yang sama di setiap pergantian frame (diukur dari piksel yang digambar game, selisih kurang dari 1 pixel tanpa geser maju). Siklus lari sekarang maju sesuai jarak tempuh, bukan jumlah tick, jadi kaki tetap menapak saat berjalan masuk ruang boss, di pasir hisap, dan saat berakselerasi di es. Lari sambil menembak memakai 6 frame lari dengan lengan buster terarah ke depan (bukan pose tembak berdiri yang terseret), jadi kakinya tetap melangkah. Siklus lari Sniptor dan Magmaron juga disusun ulang mengikuti urutan langkahnya.
- **Potongan sprite lebih teliti**. Tangan dan meriam Magmaron serta Voltrax tidak terpotong lagi: semua frame Nexo, Sniptor, dan Magmaron yang dipakai dipotong ulang dengan ruang lebih lebar, dan konverter sekarang melaporkan frame yang menyentuh tepi potongan. Voltrax dipotong dengan cara baru: latar dihapus sampai ke outline hitamnya, termasuk petir yang menempel di badan (warnanya sama dengan armor birunya), tanpa sisa kotak persegi; moncong meriamnya dilindungi. Rongga latar di antara lengan dan badan juga dihapus. Pose terhuyung Magmaron diganti frame terdorong mundur yang lebih tajam.
- **Voltrax didesain ulang** dari lembar karakternya (PNG berlatar transparan): robot petir berarmor emas, perak, dan biru dengan jambul kilat, inti energi cyan yang menyala di dada, dan meriam di lengan. Karena latarnya transparan, kanal alpha dipakai langsung sebagai masker, jadi potongannya mengikuti outline aslinya tanpa sisa latar, petir, atau pantulan lantai. Sprite-nya dikonversi seperti boss lain (set biasa, HD 4x, dan tampilan besar): sikap dasar tampak depan, pose aksi dengan tangan terbuka saat memanggil sambaran dari langit-langit, bola energi yang terkumpul di ujung meriam sebagai ancang-ancang sebelum Thunder Beam (juga sebelum tembakan keduanya saat marah), kilatan moncong saat menembak lalu meriam yang tetap terbidik, lompat naik, melempar bola listrik di puncak lompatan, turun, ledakan petir saat mendarat, dan berlutut saat terhuyung kena kelemahannya. Cahaya listrik biru menyelimuti badannya saat bertarung, menggantikan sirip petir di rig lama.
- **Serangan baru Voltrax: Volt Rush**. Ia berjongkok mengisi listrik (percikan di badannya sebagai tanda), lalu menerjang rendah menyusur lantai sampai menabrak dinding, meninggalkan jejak listrik di lantai. Hindari dengan melompatinya. Saat marah (HP rendah) terjangannya lebih cepat, jejaknya menyetrum sebentar, dan benturan di dinding memantulkan percikan listrik di lantai ke arah sebaliknya. Pose-nya memakai frame sliding dari lembar karakter, dan setelah lompat tinggi ia sekarang mendarat dengan pose mendarat berpercik petir.
- **Nexo dari lembar karakter terbaru** (PNG berlatar transparan): armor biru royal yang lebih cerah dengan bantalan bahu besar, inner suit biru-abu, lambang sayap emas, dan rambut jabrik cokelat. Kanal alpha dipakai langsung sebagai masker; frame yang saling menempel di lembar karakter dipisahkan dulu (setiap pixel ikut frame yang tersambung dengannya), dan tangga di frame memanjat dihapus termasuk sisa outline dan anak tangganya. Baris frame lari di lembar karakter digambar sekitar 13% lebih besar daripada baris lain, jadi diperkecil lebih banyak supaya ukuran kepala sama di semua pose. Frame memanjat disejajarkan menurut kepala, jadi kepala tidak naik-turun saat memanjat. Pose terkena hit sekarang jongkok dari frame lompat pertama, dan sliding memakai frame sliding asli. Palet ditambah satu tingkat sorotan biru armor (`a`), yang ikut warna senjata di sarung tangan, buster, dan sepatu.
- **Sniptor dari lembar karakter terbaru** (PNG berlatar transparan): kanal alpha dipakai langsung sebagai masker, dan frame yang saling menempel di lembar karakter dipisahkan dulu (setiap pixel ikut frame yang tersambung dengannya). Semua frame dikonversi ulang untuk set biasa, HD 4x, dan tampilan besar. Baru: kilatan peluncur saat melempar R. Cutter, dan jongkok terdorong mundur saat terhuyung. Siklus lari disusun dari frame yang kaki menapaknya bergerak mundur di bawah badan secara berurutan, karena 9 frame lari di lembar karakter bukan satu siklus yang konsisten (diukur dari piksel yang digambar game: kaki tetap di tempatnya sampai terangkat, dan kaki baru mendarat selangkah di depan).
- **Sprite HD 4x untuk Nexo, Sniptor, dan Magmaron**: set HD sekarang 4 pixel sprite per pixel game (tinggi karakter sekitar 92 pixel, sebelumnya 69), dikonversi hampir 1:1 dari frame lembar karakternya tanpa diperkecil, sehingga wajah, mata, lambang, dan aksen emas memakai detail asli lembar karakter. Dipakai otomatis di layar dengan 4 atau 6 pixel layar per pixel game (monitor 1080p dan layar Retina dalam mode penuh); di monitor 1080p setiap pixel sprite tepat 1 pixel layar. Jendela kecil tetap memakai set biasa. Ukuran karakter di layar dan gameplay tidak berubah. Sisa garis panel dan anak tangga di frame melompat dan memanjat dibersihkan, dan siklus lari dicari ulang untuk frame 4x supaya kaki tetap tidak meluncur.
- **Sniptor didesain ulang** dari lembar karakternya: robot ninja merah marun dan perak dengan helm bertanduk, visor emas, dan aksen emas. Seperti Nexo, sprite-nya dikonversi langsung dari lembar karakter (set biasa dan set HD), dengan sikap dasar tampak depan, pose aksi memegang R. Cutter, lengan terulur setelah melempar, siklus lari 6 frame (dicari supaya kaki tidak meluncur), lompat naik dan jatuh, dan pose terkena hit saat terhuyung kena kelemahannya. Di layar intro stage tampil pose aksi setinggi 138 pixel.
- **Senjatanya bukan gunting lagi**: Sniptor melempar **R. Cutter**, pisau putar 8 bilah merah marun bermata emas dengan poros perak, dari tangannya, dan pisau itu kembali ke tangannya. Rolling Cutter milik pemain, Cutter Tempest (ultra), dan ikon senjatanya ikut memakai pisau putar yang sama. Julukan Sniptor menjadi _Manusia Pisau Putar_.
- **Magmaron didesain ulang** dari lembar karakter terbarunya: golem lava bertanduk dengan armor merah, retakan lava yang menyala, aksen emas, dan meriam emas di lengan. Pose besar memakai latar transparan; frame kecil berlatar sel navy, jadi latarnya adalah semua piksel biru yang tersambung ke tepi potongan (garis sel dan nomor frame ikut terhapus), dan frame yang melewati garis sel dipisahkan dulu. Sprite-nya (set biasa, HD 4x, tampilan besar): sikap dasar tampak depan, pose aksi dengan api di bahu saat melepas gelombang api, meriam terbidik untuk bola api dengan semburan api di moncong saat bola api keluar, 8 frame berjalan, jongkok saat terhuyung, dan 4 frame api berkobar dari bahunya saat memanggil pilar api (dari _mini-boss sprites_). Urutan frame berjalan di lembar karakter bukan urutan langkah, jadi frame-nya disusun ulang dari kontak kaki depan sampai menolak untuk tiap kaki. Di layar intro stage tampil pose aksi setinggi 138 pixel, dan cahaya panas lava menyelimuti badannya saat bertarung.
- **Glacielle didesain ulang** dari lembar karakternya (PNG berlatar transparan): boss wanita es berarmor putih-perak dengan bodysuit hitam, kristal es biru di bahu, lengan, dan kaki, mahkota kristal, dan rambut panjang biru pucat. Sprite-nya (set biasa, HD 4x, tampilan besar): sikap dasar tampak depan, bola es yang terkumpul di tangannya sebagai ancang-ancang sebelum melepas pecahan es (juga sebelum tembakan keduanya saat marah), lengan terulur setelah menembak, jongkok sebelum meluncur, dua frame meluncur rendah yang bergantian, lompat naik, mengulurkan tangan di puncak lompatan saat memanggil es dari langit-langit, turun, dan terdorong rendah saat terhuyung. Di layar intro stage tampil pose aksi dengan cakar kristalnya, dan hawa dingin menyelimuti badannya saat bertarung, menggantikan rig lama.
- **Terralyn didesain ulang** dari lembar karakternya (PNG berlatar transparan): boss wanita tanah berarmor batu cokelat zaitun berlumut dengan permata hijau yang menyala, bodysuit gelap, dan kuncir kuda panjang cokelat kastanye. Frame yang saling menempel dipisahkan dulu, dan nomor frame serta papan nama yang menempel di kakinya dihapus. Sprite-nya (set biasa, HD 4x, tampilan besar): sikap dasar tampak depan; energi hijau yang terkumpul di kepalan batunya sebelum melempar batu besar, ledakan hijau saat batu lepas, lalu lengan yang masih terulur (batu besar sekarang dilempar dari kepalannya, bukan dari atas kepala); pose aksi dengan batu melayang di sekelilingnya saat memanggil hujan batu; lompatan gempa yang naik, meninju di puncak, turun, dan mendarat dengan tanah meledak menjadi duri batu; dan jongkok saat terhuyung. Di layar intro stage tampil pose aksinya, dan cahaya hijau permatanya menyelimuti badannya saat bertarung.
- **Winderwomen didesain ulang** dari lembar karakternya (PNG berlatar transparan): boss wanita angin berarmor putih dengan bodysuit navy, permata biru dan hijau, helm bersayap, dan rambut panjang hijau mint yang berkibar. Frame yang saling menempel dipisahkan dulu, dan nomor frame, papan nama, serta garis sel tipis dihapus. Sprite-nya (set biasa, HD 4x, tampilan besar): sikap dasar tampak depan; pusaran angin yang berputar di telapak tangannya selama ia meniupkan angin kencang; pusaran yang membesar di telapak tangannya sebelum melepas siklon (juga sebelum siklon keduanya saat marah), lalu lengan yang masih terulur; serangan menukik yang naik terbawa angin, melayang sebentar, menukik dengan kepalan di depan, dan mendarat dengan semburan angin; dan jongkok saat terhuyung. Di layar intro stage tampil pose aksinya dengan angin yang mengalir di sekelilingnya.
- Keenam boss Benua Azura sekarang memakai sprite dari lembar karakternya; gaya rig lama untuk mereka dihapus. Rambut panjang yang berkibar di belakang kepala (kuncir Terralyn, rambut Winderwomen) tidak ikut dihitung saat menempatkan frame, jadi badannya tidak bergeser saat frame berganti.
- Daftar boss di pilih stage, tabel kelemahan, dan ending sekarang memakai **pose aksi** dari lembar karakternya (bukan sikap dasar tampak depan), diletakkan di tengah kotaknya supaya senjata yang terulur tidak menabrak teks. Boss yang belum punya lembar karakter (masih memakai rig) tetap memakai sikap dasarnya.
- Boss yang sudah dikalahkan (di pilih stage, tabel kelemahan, dan ending) sekarang tampil dengan warnanya sendiri dalam grayscale, bukan putih polos, jadi detailnya tetap terlihat. Kedip putih saat boss terkena serangan tidak berubah.
- Sistem sprite karakter (`SPRITE_CHARS` di `js/art.js`) sekarang dipakai bersama oleh hero dan boss: boss yang punya lembar karakter cukup mendaftarkan sprite, warna, pilihan frame, dan siklus larinya di file sprite-nya sendiri (contoh: `js/sniptor-sprites.js`, `js/magmaron-sprites.js`, `js/voltrax-sprites.js`, `js/glacielle-sprites.js`, `js/terralyn-sprites.js`, `js/winderwomen-sprites.js`).

## 1.1.0

- **Logo baru**: NEO dari krom biru-perak dan BUSTER dari logam cair oranye dengan retakan lava yang menyala, huruf miring bergaya techno dengan outline tebal, tepi bercahaya, ekstrusi 3D, kilau yang menyapu berkala, dan emblem orb energi serta bintang sirkuit di kedua sisi.
- **Hero baru: Nexo**. Remaja berambut jabrik cokelat dengan armor biru beraksen emas, lambang sayap emas di dada, dan cincin emas di sepatu, sprite-nya dikonversi langsung dari lembar karakter Nexo terbaru. Setiap frame dipotong, latarnya dihapus (termasuk tangga di frame memanjat), setiap pixel dipetakan ke palet tetap (outline, empat tingkat armor, emas, kulit, tiga tingkat rambut, mata biru, efek), diperkecil dengan voting (setiap pixel kecil mengambil warna palet terbanyak di areanya, dengan bobot lebih untuk mata dan emas, supaya detail kecil tidak luntur menjadi cokelat), lalu dibersihkan (pixel nyasar digabung ke cluster-nya, sisa garis dan bintik dihapus, outline 1 pixel di siluet). Animasi lengkap di dalam game: sikap dasar berdiri tampak samping, siklus lari 6 frame (badan condong, langkah lebar) yang urutan, durasi tiap frame, dan geseran per framenya dicari supaya kaki yang menapak bergeser ke belakang tepat sejauh badan maju (tidak seperti moonwalk), menembak sambil berdiri (pose aksi) dan 2 frame menembak sambil berlari, lompat naik dan jatuh, sliding dengan debu, terkena hit, dan 4 frame memanjat tangga dari belakang dengan lengan meraih anak tangga. Di layar beresolusi tinggi (6 pixel layar per pixel game, misalnya layar Retina dalam mode penuh) Nexo memakai set HD: 3 pixel sprite per pixel game, tinggi sekitar 69 pixel dengan ukuran di layar tetap sama, sehingga mata, mulut, dan lambang emas lebih jelas. Layar lain memakai set biasa. Di layar judul, layar senjata baru, dan ending: pose aksi dan sikap dasar setinggi 138 pixel. Warna khas senjata spesial hanya mengubah **rambut, sarung tangan, dan sepatu**; armor tetap biru. Ikon kepala di HUD juga ikut warna rambut.
- **Boss bergaya Mega Man X**: semua boss digambar ulang di grid pixel 2x lebih rapat (48 × 48) dengan rig: helm dengan jambul putih dan pelindung telinga merah, dada armor dengan inti emas, pinggang ramping, pelindung bahu putih, sarung tangan besar dengan gelang emas, sepatu bot besar dengan cincin emas. Wajah anime 3/4 dengan mata besar berkilau; di layar intro stage boss digambar 3x dengan wajah yang lebih rinci.
- **Lebih halus**: garis dalam memakai warna gelap dari bagiannya sendiri (hanya siluet luar yang hitam), cel shading ala anime, dan bayangan kulit yang lembut.
- Panduan art baru [docs/ART-STYLE.md](docs/ART-STYLE.md): patokan gaya karakter anime (dirangkum dari panduan wajah anime SLYNYRD dan prinsip pixel art) dan cara memasukkan art baru dari sprite sheet.
- Setiap boss punya siluet sendiri: boss pria beralis galak, boss wanita dengan rambut, bulu mata, bibir, dan rok; plus ciri khas seperti gunting yang membuka-menutup (Sniptor), api yang berkobar (Magmaron), sirip petir (Voltrax), mahkota kristal (Glacielle, Lumina), bantalan bahu batu (Terralyn), rambut tertiup angin (Winderwomen), sirip (Hydros), tangki dan masker gas (Toxaris), tanduk, jubah, dan mata ungu (Umbrion), headphone (Sonique), serta sanggul, jarum jam, dan jam di dada (Chronia).

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
