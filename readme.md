# NEOBUSTER

> Game action-platformer 2D bergaya **Mega Man** untuk browser — pixel art dengan kepadatan pixel 2x yang detail, tapi tetap ringan dan optimal untuk web.

**Versi saat ini: `1.13.2`** — versi juga tampil di pojok kanan bawah layar title & pause, dan di judul tab browser.

---

## Daftar Isi

- [Konsep](#konsep)
- [Cara Menjalankan](#cara-menjalankan)
- [Kontrol](#kontrol)
- [Main di HP & Tablet](#main-di-hp--tablet)
- [Pasang sebagai Aplikasi (PWA)](#pasang-sebagai-aplikasi-pwa)
- [Stage](#stage)
- [Boss & Senjata](#boss--senjata)
- [Ruang Rahasia & Armor](#ruang-rahasia--armor)
- [Training Ground](#training-ground)
- [Peta Dunia & Menu Pause](#peta-dunia--menu-pause)
- [Shop & Part](#shop--part)
- [Progress & Save](#progress--save)
- [Cloud Save](#cloud-save)
- [Cheat Code](#cheat-code)
- [Format Kode](#format-kode)
- [Struktur Proyek](#struktur-proyek)
- [Menambah Konten](#menambah-konten)
- [Versi](#versi)

---

## Konsep

- Kamu bermain sebagai **Nexo**, remaja berambut jabrik dengan armor biru beraksen emas dan arm cannon (buster).
- Dunia terbagi menjadi **benua**, masing-masing berisi **6 boss**. Pilih benua di **Peta Dunia**, lalu pilih boss di benua itu dalam urutan bebas. Benua berikutnya terbuka setelah semua boss di benua sebelumnya dikalahkan. Saat ini tersedia **Benua Azura** dan **Benua Vespera** (12 boss); benua baru akan menyusul.
- Setiap stage panjang dan bertingkat: ada bagian **naik** (menara, tebing, lift) dan bagian **bawah tanah** (gua, saluran, tambang), dengan rintangan seperti duri, jurang, lava, lantai es, balok rapuh, tangga, platform bergerak, gergaji, semburan api, sinar listrik, batu jatuh, air, gas racun, kegelapan, laser, bandul, dan musuh.
- Ada **2 checkpoint** di setiap stage. Kalau mati, kamu lanjut dari checkpoint terakhir yang sudah dilewati.
- Di ujung stage ada **pintu boss**. Kalahkan boss untuk mendapatkan **senjatanya**.
- Semua senjata boss **unlimited** — tidak ada energi senjata yang bisa habis.
- Setiap senjata punya **charge shot**: tahan tombol tembak sampai karakter berkedip, lalu lepas. Charge tidak batal walau terkena serangan.
- Setiap boss **lemah** terhadap senjata boss lain. Saat melawan boss, kelemahannya tampil di pojok kiri bawah layar.

## Cara Menjalankan

Tidak perlu build atau install apa pun — cukup HTML + JavaScript murni.

| Cara               | Langkah                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| Langsung           | Buka `index.html` di browser (Chrome, Edge, Firefox, Safari).                   |
| Lewat server lokal | `npx serve .` atau `python3 -m http.server`, lalu buka alamat yang ditampilkan. |

> Suara aktif setelah tombol pertama ditekan (aturan autoplay browser).

## Kontrol

| Aksi                                             | Keyboard                                                                        | Gamepad             | Layar sentuh           |
| ------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------- | ---------------------- |
| Gerak                                            | `←` `→` / `A` `D`                                                               | D-pad / stik kiri   | D-pad                  |
| Naik / turun tangga                              | `↑` `↓` / `W` `S`                                                               | D-pad / stik kiri   | D-pad atas / bawah     |
| Lompat (di udara: Step Jump, part Shop)          | `Z` / `J` / `Space`                                                             | A                   | JUMP                   |
| Tembak                                           | `X` / `K`                                                                       | X / B               | SHOOT                  |
| Charge shot (semua senjata)                      | Tahan `X` lalu lepas                                                            | Tahan tombol tembak | Tahan SHOOT lalu lepas |
| Slide (di udara: Air Dash, part Shop)            | `C` / `L` (atau `↓` + lompat)                                                   | RT / Y              | SLIDE                  |
| Ganti senjata                                    | `Q` / `E`                                                                       | LB / RB             | ◀ W / W ▶            |
| Pause: ganti senjata & ON/OFF tools              | `Enter` / `Esc`; panah untuk bergerak di grid senjata dan pindah ke kolom tools | Start               | START / BACK, D-pad    |
| Mute                                             | `M`                                                                             | —                   | MUTE                   |
| Kembali ke layar sebelumnya (menu, peta, select) | `Esc` / `Backspace`                                                             | Select              | BACK                   |
| Buka Shop (di Stage Select)                      | `X`                                                                             | X / B               | SHOOT                  |
| Layar Kelemahan Boss (di Stage Select)           | `C`                                                                             | RT / Y              | SLIDE                  |
| Reset progress (di title)                        | `R` dua kali                                                                    | —                   | —                      |
| Buka cheat box                                   | Tekan `P` + `O` bersamaan                                                       | —                   | —                      |

Di layar sentuh, setiap tombol juga menampilkan tombol keyboard padanannya (misalnya SHOOT bertuliskan `X`), jadi petunjuk di layar game tetap bisa diikuti.

## Main di HP & Tablet

Game mendeteksi layar sentuh dengan sendirinya: di HP dan tablet muncul tombol semi-transparan di atas dan di sekitar layar game.

- **Landscape**: game memenuhi tinggi layar; D-pad di kiri bawah, JUMP / SHOOT / SLIDE di kanan bawah, ganti senjata, BACK, START, MUTE, dan FULL (layar penuh, kalau browser mendukung) di sisi kiri dan kanan.
- **Portrait**: game di atas dan tombol di bawahnya, seperti konsol genggam.
- Beberapa jari bisa dipakai bersamaan, D-pad membaca 8 arah, dan ibu jari bisa digeser dari satu tombol ke tombol lain (misalnya dari SHOOT ke JUMP).
  - Arah kiri dan kanan di D-pad lebih lebar (70°) daripada atas dan bawah, jadi ibu jari yang sedikit turun atau naik saat berlari tetap terbaca kiri atau kanan saja.
  - Di layar sentuh, slide hanya lewat tombol SLIDE: menekan JUMP selalu melompat, walaupun D-pad sedang tertekan ke bawah. Kombinasi `↓` + lompat untuk slide hanya berlaku di keyboard dan gamepad.
  - Tombol bulat (JUMP, SHOOT, SLIDE) dibaca sesuai lingkarannya, dan ibu jari yang sedikit bergeser saat menekan tetap dihitung di tombol yang sama.
- **Cloud Save** di HP: ketuk kolom USERNAME atau PASSWORD untuk memunculkan keyboard HP, lalu START untuk masuk dan BACK untuk kembali.
- Menekan tombol di keyboard fisik menyembunyikan tombol sentuh; sentuhan berikutnya memunculkannya lagi.
- Cheat box (`P` + `O`) hanya bisa dibuka dengan keyboard.

## Pasang sebagai Aplikasi (PWA)

Game bisa dipasang sebagai aplikasi (Progressive Web App). Setelah dipasang, game terbuka **layar penuh** tanpa bilah browser, **landscape** (layar lebar), dengan ikon Nexo di layar utama, dan bisa dimainkan **offline**.

- **Chrome / Edge (komputer & Android)**: pilih **INSTALL APP** di menu title (muncul kalau browser siap memasang), atau ikon pasang di bilah alamat / menu browser → _Install app_.
- **iPhone / iPad (Safari)**: tombol _Share_ → _Add to Home Screen_.
- Saat berjalan layar penuh atau sebagai aplikasi, game memenuhi layar, termasuk layar lebar (tidak lagi dibatasi kelipatan bulat dari ukurannya).
- **Offline**: setelah dibuka sekali, semua file game tersimpan, jadi game tetap bisa dimainkan tanpa internet (Cloud Save tetap butuh internet; perubahan disinkronkan lagi saat online). Saat online, file terbaru selalu diambil dulu, jadi pembaruan langsung terpakai.
- PWA hanya aktif kalau game disajikan lewat **https** (misalnya GitHub Pages) atau `localhost`, bukan dibuka langsung sebagai file.

## Stage

Setiap stage berukuran 450 × 44 tile dan punya alur, platform, dan rintangannya sendiri. Bagian akhirnya (150 kolom terakhir sebelum pintu boss) adalah bagian tersulit, dengan dua checkpoint sendiri; di tabel alur di bawah, bagian itu ditulis setelah **Bagian akhir**.

### Benua Azura

| Stage | Alur                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cut   | Aula pengepres (4 mesin press menghantam bergantian di atas ban berjalan) → menara gergaji 4 lantai → jalan di atas lantai duri, gergaji naik-turun di celahnya → sumur penggergajian (turun dari pijakan ke pijakan, gergaji menyapu) → terowongan ban berjalan (lubang duri, press, lorong rendah untuk slide) → lorong gergaji dan press terakhir → **Bagian akhir:** tumpukan kayu (gergaji menyapu puncak setiap tumpukan, palung duri di antaranya) → pabrik: naik lift melewati gergaji yang menyapu → deretan press menghantam pijakan di atas lantai duri → halaman ban berjalan melawan dengan gergaji di atasnya |
| Fire  | Tiang basal naik dari lautan lava → bibir kawah → turun ke ruang magma (rakit, pulau batu, bola magma) → **saluran kawah: lava naik mengejar saat kamu memanjat** → lereng luar: undakan basal turun di atas aliran lava → sungai lava dengan dua rakit → **Bagian akhir:** lereng bom (naik undakan basal di atas lava sementara bom vulkanik berjatuhan) → tiang geyser: turun dari tiang ke tiang, semburan api di puncak setiap tiang → terowongan lava di bawah danau lava (kolam lava, bola magma, totem) → punggung bukit dengan semburan api kembar                                                                 |
| Elec  | Aula sinar (5 sinar listrik menyala berurutan seperti gelombang) → dua rangkaian blok energi di atas jurang → menara trafo 3 lantai → kereta gantung melintasi jurang → gardu induk: blok energi di atas lantai bertegangan → ban berjalan di antara dua sinar → **Bagian akhir:** tumpukan kapasitor (naik di atas blok energi yang menyala bergantian, lantai bertegangan di bawahnya) → celah busur: kereta gantung, sinar listrik menembak di setiap pemberhentian → saluran kabel di bawah lantai bertegangan (sinar bergelombang, lorong slide) → halaman trafo dengan turret                                         |
| Snow  | Padang salju dengan es gantung → bongkahan es licin di atas jurang beku → tebing dalam badai (angin mendorong ke arah jurang) → punggung puncak: jembatan es rapuh di bawah es gantung → luncuran es menurun → gua es di bawah gletser dengan lantai rapuh di atas jurang → **Bagian akhir:** danau beku (es licin berlubang, badai mendorong ke arah lubang) → galeri es gantung: langkan es sempit di atas duri → menara es licin dalam badai → tebing salju yang runtuh di bawah snowman                                                                                                                                 |
| Earth | Dasar ngarai (batu jatuh, pasir hisap) → gua dalam: turun dari pijakan ke pijakan di atas jurang → terowongan dalam: jembatan rapuh, pasir hisap, duri di langit-langit → **kereta tambang: lompati batu di rel, jangan lompat di bawah duri** → naik lewat pasir hisap bertingkat → jembatan ngarai rapuh di antara pilar → **Bagian akhir:** cekungan pasir hisap (batu pijakan rapuh, batu berjatuhan) → jalan tebing di atas jurang → tambang terbuka: menyeberang dengan ember crane → gerbang tambang (slide di bawah batu)                                                                                           |
| Wind  | Naik dengan pad angin → platform awan melawan angin di atas kehampaan → benteng langit: masuk dari atas lalu turun tiga aula (duri, fanbot yang meniupmu ke arah duri, platform di atas duri) → jembatan badai rapuh → lompatan pad angin terakhir → **Bagian akhir:** tangga pad angin ke langit → batu melayang naik-turun di atas kehampaan → tangga awan rapuh dengan angin dari belakang → gerbang langit                                                                                                                                                                                                              |

Setiap stage juga punya musuh, mekanik, dan ruang boss yang hanya ada di stage itu:

| Stage | Musuh khas                                                                                         | Mekanik khas                                                                                                              | Ruang boss                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Cut   | **Blader**: kepala gunting terbang yang menukik ke arahmu                                          | **Mesin press** yang menghantam dari langit-langit (berguncang dulu sebagai peringatan) dan **ban berjalan**              | Mata gergaji industri raksasa dan gerigi berputar di dinding, lantai tengah berupa ban berjalan |
| Fire  | **Fire Totem**: patung batu yang memuntahkan 2 bola api melengkung                                 | **Lava naik** di saluran kawah, dan **bola magma** yang melompat keluar dari lava                                         | Air terjun lava dan retakan magma, semburan api dari lantai                                     |
| Elec  | **Watcher**: mata listrik yang menyesuaikan tinggi lalu menembak ke dua arah saat sejajar denganmu | **Blok energi**: menyala bergantian di atas jurang, berkedip sebelum hilang                                               | Tesla coil dengan busur listrik, sinar listrik dari langit-langit                               |
| Snow  | **Snowman**: melempar bola salju melengkung                                                        | **Badai angin**: setelah tenang dan peringatan, angin mendorong kamu (saat naik gunung, di jurang beku, dan di lantai es) | Kepingan salju raksasa dan kristal es, lantai es licin                                          |
| Earth | **Mole**: menggali di bawah tanah mengikuti kamu, lalu menyembul tepat di bawahmu                  | **Kereta tambang**, dan **pasir hisap**: kamu tenggelam pelan; lompat keluar sebelum kepala tenggelam                     | Penyangga tambang dan permata di dinding batu                                                   |
| Wind  | **Fanbot**: kipas melayang yang meniupmu mundur saat kamu di depannya                              | **Pad angin**: menginjaknya melontarkanmu sekitar 8 tile ke atas                                                          | Jendela langit, pilar marmer, dan awan melayang yang bisa dipijak                               |

### Benua Vespera

| Stage  | Alur                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hydro  | Kanal banjir (di bawah air lompatan jauh lebih tinggi; batu terapung di atas dasar penuh bulu babi) → gorong-gorong di bawah dam (arus melawan, bulu babi di lantai dan langit-langit) → naik 5 lantai di dalam dam, tetesan dari pipa → **waduk di atas dam: berenang dari batu ke batu** → pelimpah dengan arus air → ruang pompa → **Bagian akhir:** menara banjir (berenang naik, bulu babi di dasar) → kanal pintu air: pintu air menghantam dasar kanal → jembatan pipa di atas lubang bulu babi, tetesan dari pipa induk → dermaga                                                                     |
| Toxic  | Pemadat (4 press di atas ban berjalan dan selokan asam) → sungai asam: naik drum yang hanyut → catwalk rapuh di atas tong asam dengan ventilasi di sela → **tangki banjir: asam naik saat kamu memanjat** → atap pabrik: ventilasi berderet, slime jatuh dari pipa → **Bagian akhir:** drum naik-turun di kolam asam → pipa besar: berjalan di atasnya, ventilasi menyembur dari sambungannya → tangki luapan: asam membanjiri tangki begitu kamu memanjat peti, panjat cepat dan keluar lewat atas → halaman pembuangan                                                                                      |
| Shadow | **Aula besar: kapak berayun di atas lantai rapuh (tunggu di batu, atau slide di bawahnya)** → penjara bawah tanah: perangkap duri dan langit-langit yang jatuh dalam gelap → menara: lift dan pijakan, hantu tembus dinding → benteng yang runtuh: jembatan rapuh, menara jaga, lift di celah terlebar → lorong kapak menuju singgasana → **Bagian akhir:** katakombe (peti mati di atas lantai duri, dua tutupnya rapuh) → parit: rakit hanyut di bawah kapak berayun → tangga gelap di atas jurang (tanpa obor, dua anak tangga rapuh) → halaman patung dengan turret                                       |
| Sonic  | Menara drum (memantul ke panggung berikutnya, speaker menembakkan cincin saat kamu mendarat) → **lantai dansa: ubin menyala bergelombang mengikuti ketukan; menari bersamanya** (datar, zig-zag, tangga turun) → lorong speaker → panggung melayang, lift, dan turntable → rantai drum di atas duri → **Bagian akhir:** lorong bass (drum di lantai, duri di atap di atas sebagian drum: pantul hanya di drum yang atapnya bersih) → tiang mikrofon: drum di puncak tiang melontarkanmu ke tiang berikutnya → tangga encore: turun sementara speaker di puncak mengirim cincin mengejarmu → panggung terakhir |
| Light  | Aula laser (**laser di kaki: lompat; laser setinggi kepala: slide**) → menara prisma: tiap lantai disapu laser bergantian, tunggu di atas kristal → jembatan kristal rapuh dan lift yang melewati laser → gua kristal: lantai licin, lubang duri, laser → galeri laser di atas lantai kristal licin → **Bagian akhir:** menara kristal licin di atas duri, laser menyapu puncaknya bergelombang → rel cahaya: naik kereta kristal melewati gerbang laser → lembah prisma: turun di bawah laser setinggi kepala (slide), naik melewati laser di kaki (lompat) → jalan ke singgasana                            |
| Time   | Roda gigi berputar di atas jurang (lompat dari roda ke roda) → **muka jam raksasa: naiki keempat jarumnya yang berputar ke puncak menara** → sabuk roda gigi berjalan bolak-balik di antara celah paku → sumur bandul: turun melewati tiga bandul raksasa → roda terakhir di atas paku → **Bagian akhir:** escapement (balok sempit di atas jurang, bandul raksasa berayun di atasnya) → menara roda gigi: naik dari roda ke roda yang bertumpuk → tangga sabuk roda gigi turun di atas jurang → aula lonceng                                                                                                 |

| Stage  | Musuh khas                                                                         | Mekanik khas                                                                                                                                                                                                                 | Ruang boss                                                              |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Hydro  | **Jelly**: ubur-ubur yang naik turun sambil mendekat                               | **Air**: di dalam air kamu jatuh pelan dan lompat jauh lebih tinggi; **arus** yang mendorong ke arah bulu babi                                                                                                               | Lantai tergenang air                                                    |
| Toxic  | **Slime**: menempel di langit-langit, jatuh saat kamu lewat, lalu merayap mengejar | **Asam naik** di tangki banjir, **mesin press**, dan **ventilasi gas** yang berkedip lalu menyemburkan awan racun                                                                                                            | Dua ventilasi gas yang bergantian                                       |
| Shadow | **Shade**: hantu tembus dinding yang samar-samar terlihat                          | **Kegelapan** (hanya sekitar dirimu, obor, tembakanmu, dan mata boss yang terang; senjata bercahaya seperti Fire Storm, Thunder Beam, dan Prism Laser menerangi sekitarnya), **kapak berayun**, dan langit-langit yang jatuh | Tiga obor di dinding yang menerangi ruangan gelap                       |
| Sonic  | **Speakerbot**: speaker berjalan yang mengirim cincin suara ke dua arah            | **Lantai dansa** yang menyala mengikuti ketukan, **drum** yang melontarkanmu, dan **speaker** yang mengirim cincin suara                                                                                                     | Equalizer raksasa dan dua speaker yang bergantian                       |
| Light  | **Prismo**: kristal yang mengisi daya lalu menembak 4 laser miring                 | **Gerbang laser** di kaki (lompati) dan setinggi kepala (slide di bawahnya), dan lantai kristal yang licin                                                                                                                   | Laser horizontal melintang di tengah ruangan                            |
| Time   | **Gearbot**: roda gigi yang berbalik arah di dinding dan tepi jurang               | **Muka jam** (roda empat platform) dan **roda gigi** yang berputar, **bandul** raksasa, sabuk roda gigi                                                                                                                      | Jam raksasa dengan jarum berputar, dua platform yang berputar melingkar |

## Boss & Senjata

### Benua Azura

| Stage | Tempat             | Boss                                             | Senjata yang didapat | Lemah terhadap |
| ----- | ------------------ | ------------------------------------------------ | -------------------- | -------------- |
| Cut   | Pabrik Gergaji     | **SNIPTOR** — pisau putarnya memotong apa saja   | Rolling Cutter       | Frost Shard    |
| Fire  | Gunung Berapi      | **MAGMARON** — penjaga kawah yang membara        | Fire Storm           | Gale Shot      |
| Elec  | Pembangkit Listrik | **VOLTRAX** — memanggil petir dari badai         | Thunder Beam         | Rolling Cutter |
| Snow  | Gunung Es          | **GLACIELLE** — membekukan segala yang mendekat  | Frost Shard          | Fire Storm     |
| Earth | Tambang Batu       | **TERRALYN** — mengguncang bumi dengan tinjunya  | Rock Breaker         | Thunder Beam   |
| Wind  | Benteng Langit     | **WINDERWOMEN** — menunggangi angin di atas awan | Gale Shot            | Rock Breaker   |

### Benua Vespera

| Stage  | Tempat         | Boss                                           | Senjata yang didapat | Lemah terhadap |
| ------ | -------------- | ---------------------------------------------- | -------------------- | -------------- |
| Hydro  | Bendungan      | **HYDROS** — mengendalikan arus dan gelombang  | Hydro Blast          | Venom Drip     |
| Toxic  | Pabrik Limbah  | **TOXARIS** — menyebarkan racun dari pabriknya | Venom Drip           | Shadow Clone   |
| Shadow | Benteng Gelap  | **UMBRION** — bersembunyi di balik kegelapan   | Shadow Clone         | Prism Laser    |
| Sonic  | Panggung Awan  | **SONIQUE** — suaranya menggetarkan panggung   | Sonic Boom           | Time Stopper   |
| Light  | Istana Kristal | **LUMINA** — memecah cahaya menjadi laser      | Prism Laser          | Sonic Boom     |
| Time   | Menara Jam     | **CHRONIA** — menghentikan waktu sesukanya     | Time Stopper         | Hydro Blast    |

Nama tempat tampil di Stage Select, dan kalimat perkenalan boss tampil di layar intro stage dan saat boss muncul.

HP boss bergantung pada pulaunya: boss **Azura** punya **84 HP** (3x), boss **Vespera** punya **140 HP** (5x). Bar HP boss tetap 28 kotak dan turun sebanding dengan HP-nya. Senjata kelemahan memberi 4 damage (charge shot 6, ultra attack 8), jadi boss Azura kalah setelah 21 tembakan kelemahan biasa (84 tembakan Neo Buster biasa), dan boss Vespera setelah 35 (140 tembakan Neo Buster biasa). Boss mengamuk (serangan lebih cepat) setelah HP-nya tinggal setengah.

Serangan boss Vespera:

| Boss    | Serangan                                                                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| HYDROS  | Meriam air yang mendorongmu mundur, gelembung yang melayang ke arahmu, dan lompatan yang memecah ombak ke dua arah                                 |
| TOXARIS | Ludah racun melengkung yang meninggalkan genangan, awan gas di sekeliling tubuhnya (menjauhlah), dan lompatan yang meninggalkan genangan racun     |
| UMBRION | Bayangan kembar yang berlari menerjang, menghilang lalu muncul di belakangmu, dan orb gelap yang mengejar                                          |
| SONIQUE | Cincin suara di dua ketinggian, teriakan yang mendorongmu menjauh sambil menggulirkan cincin, dan lari kencang dengan bayangan                     |
| LUMINA  | Laser yang memantul di dinding, pilar cahaya dari langit-langit (lantai ditandai dulu), dan kilatan yang menyebarkan gelombang cahaya              |
| CHRONIA | Jarum jam yang terbang seperti bumerang, **menghentikan waktu** (kamu tidak bisa bergerak sebentar setelah denting jam), dan teleport dengan jarum |

Tekan `C` di **Stage Select** untuk membuka layar **Kelemahan Boss**. Layar ini berisi tabel senjata yang didapat dan kelemahan tiap boss, tanda **ADA** kalau senjata kelemahannya sudah kamu punya, dan **urutan saran** berupa rantai boss: senjata dari tiap boss adalah kelemahan boss berikutnya.

Setiap senjata adalah kelemahan tepat satu boss di benuanya sendiri:

- **Azura**: es membuat pisau putar rapuh, angin memadamkan api, pisau putar memotong kabel, api mencairkan es, petir menghancurkan batu, dan batu terlalu berat untuk diterbangkan angin.
- **Vespera**: racun mencemari air, bayangan menyelinap menembus kabut racun, cahaya mengusir bayangan, waktu yang berhenti membungkam suara, getaran suara memecahkan kristal cahaya, dan air membuat mesin jam berkarat.

### Tembakan biasa & charge shot

Tekan `X` untuk tembakan biasa. Tahan `X` sampai karakter berkedip dengan warna senjatanya, lalu lepas untuk charge shot.

| Senjata        | Tembakan biasa                                          | Charge shot                                                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neo Buster     | Peluru kecil (maks. 3 di layar)                         | Tahan sebentar: peluru sedang. Tahan penuh: peluru besar yang menembus musuh **+ Buster Storm**, ratusan peluru kecil yang datang dari belakang dan menyapu seluruh layar ke depan, mengenai semua musuh termasuk yang berlindung |
| Rolling Cutter | Pisau putar boomerang yang menembus musuh dan kembali   | **Giant Shuriken** — shuriken baja raksasa 4 mata yang berputar, terbang jauh menembus musuh, lalu kembali                                                                                                                        |
| Fire Storm     | Bola api + perisai api yang berputar                    | **Fire Wave** — pilar api yang bergulir di tanah, menembus musuh dan membakar peluru musuh                                                                                                                                        |
| Thunder Beam   | Sinar petir cepat yang menembus musuh                   | **Giga Thunder** — petir menyambar dari langit ke setiap musuh di layar, termasuk boss                                                                                                                                            |
| Frost Shard    | 3 kristal es yang membekukan musuh                      | **Frost Nova** — cincin rapat 24 kristal es besar ke segala arah, menembus dan membekukan musuh                                                                                                                                   |
| Gale Shot      | 3 pusaran angin yang melayang naik dengan sudut berbeda | **Cyclone** — tornado besar yang bergulir di tanah, terus menggerus musuh yang dilewati dan menyedot peluru kecil                                                                                                                 |
| Rock Breaker   | Batu yang pecah jadi 4 serpihan                         | **Rock Quake** — batu besar yang pecah jadi 8 serpihan, mengguncang layar dan melukai semua musuh yang menapak tanah                                                                                                              |
| Hydro Blast    | 2 semburan air cepat                                    | **Tidal Wave** — ombak yang bergulir di tanah dan menembus musuh                                                                                                                                                                  |
| Venom Drip     | Bola racun melengkung yang menjadi genangan beracun     | **Acid Rain** — 10 tetes hujan asam jatuh dari langit di depanmu                                                                                                                                                                  |
| Shadow Clone   | Bayanganmu menerjang ke depan                           | **Shadow Army** — 3 bayangan sekaligus, salah satunya melompat                                                                                                                                                                    |
| Sonic Boom     | Cincin suara yang membesar dan menembus musuh           | **Bass Drop** — 2 gelombang bass ke dua arah dan melukai semua musuh yang menapak tanah                                                                                                                                           |
| Prism Laser    | Laser yang memantul di dinding                          | **Spectrum** — 7 laser pelangi yang menyebar dan memantul                                                                                                                                                                         |
| Time Stopper   | Jarum jam yang cepat                                    | **Time Stop** — waktu berhenti 3 detik: musuh, peluru musuh, hazard, dan boss membeku                                                                                                                                             |

### Melawan boss

- Kelemahan boss tampil di **pojok kiri bawah** selama pertarungan. Tulisannya abu-abu dengan keterangan "(BELUM ADA)" kalau senjatanya belum kamu punya, dan ada garis berwarna di atas panel kalau senjata itu sedang dipakai.
- Serangan ke kelemahan boss memunculkan tulisan **WEAK!** dan memberi 4 damage. Kalau pakai charge shot, damage-nya 6.
- Boss kebal terhadap senjatanya sendiri.

Setelah semua boss di semua benua dikalahkan, muncul layar ending.

## Ruang Rahasia & Armor

Setiap stage menyembunyikan satu **ruang rahasia** di balik dinding bersegel. Dari luar ruangannya tampak seperti batu biasa; hanya dinding segelnya yang terlihat berbeda, dengan ikon senjata yang bisa menghancurkannya. Tembakan senjata lain memantul, dan nama senjata yang dibutuhkan muncul di atas dinding. Senjatanya selalu milik boss lain, jadi sebagian ruang rahasia baru bisa dibuka setelah kamu kembali dengan senjata dari pulau lain. Ultra attack yang mengenai seluruh layar juga menghancurkan segel senjatanya.

Di dalam setiap ruang rahasia ada **armor**. Setiap armor membuat HP **1x lebih tebal** untuk seterusnya (semua damage dibagi kelipatannya): 1 armor = 2x, 12 armor = 13x. Kelipatannya tampil sebagai badge (mis. **X4**) di atas bar HP, dan sisa HP sebagai angka di bawah ikon senjata. Dengan cheat `ILMUKEBAL` kelipatannya bertambah: 10x + 1x per armor (11x dengan satu armor, dan seterusnya). Setelah armor diambil, dinding segelnya tetap terbuka.

Di **Stage Select**, pojok kiri atas setiap panel boss menunjukkan armor stage itu: ikon armor menyala kalau sudah diambil, dan siluet gelap kalau belum. Jumlah armor yang ditemukan di benua itu tampil di pojok kiri atas layar (mis. ARMOR 3/6), dan di peta dunia di bawah jumlah boss setiap pulau.

| Stage  | Letak ruang rahasia                           | Dinding segel          | Senjata yang dibutuhkan |
| ------ | --------------------------------------------- | ---------------------- | ----------------------- |
| Cut    | Ujung terowongan sabuk, di kaki tangga naik   | Gerbang roda gigi      | Time Stopper            |
| Fire   | Dinding kawah, tempat mendarat di ruang magma | Batu magma             | Frost Shard             |
| Elec   | Pilar tempat kereta gantung berakhir          | Batu retak             | Rock Breaker            |
| Snow   | Gletser di samping sumur turun ke gua es      | Dinding es             | Fire Storm              |
| Earth  | Kaki undakan pasir hisap                      | Papan kayu tambang     | Rolling Cutter          |
| Wind   | Ujung barat aula bawah benteng                | Jendela kaca           | Sonic Boom              |
| Hydro  | Lantai dasar di dalam bendungan               | Jeruji berkarat        | Venom Drip              |
| Toxic  | Kaki cerobong asap                            | Barikade drum terbakar | Hydro Blast             |
| Shadow | Dasar sumur turun ke penjara bawah tanah      | Dinding kegelapan      | Prism Laser             |
| Sonic  | Menara di bawah lantai dansa terakhir         | Gumpalan awan          | Gale Shot               |
| Light  | Ujung gua kristal                             | Dinding cahaya         | Shadow Clone            |
| Time   | Lantai dasar ruang muka jam                   | Pintu berkunci listrik | Thunder Beam            |

## Training Ground

Pulau **TRAINING GROUND** ada di ujung kanan peta dunia (sesudah pulau "???") dan selalu terbuka. Di dalamnya ada arena luas bertingkat (langkan, tangga, dan pad lontar ke jembatan di tengah) dengan musuh yang datang bergelombang **tanpa akhir**:

- Setiap wave membawa lebih banyak musuh, dan HP mereka makin tebal (+0,5x per wave: wave 5 = 3x, wave 10 = 5,5x). Musuh baru ikut muncul dari wave 3 dan wave 5, termasuk musuh khas setiap stage.
- Musuh sering menjatuhkan **health** (kapsul kecil dan besar).
- Setiap wave yang dibereskan memberi bonus wave x 500 poin. Semua poin masuk ke dompet POIN, jadi Training Ground juga tempat mengumpulkan poin untuk Shop.
- Rekor **wave 50** membuka cheat box (lihat [Cheat Code](#cheat-code)).
- Latihan berakhir saat kamu jatuh (tidak mengurangi life) atau memilih **EXIT STAGE** di menu pause. Layar hasil menampilkan wave, jumlah musuh, waktu, poin yang didapat, dan rekor wave (tersimpan dan tampil di peta).

## Peta Dunia & Menu Pause

- **Peta Dunia** muncul setelah layar title. Setiap benua tampil sebagai pulau alami (pantai, hutan, sungai, gunung) dengan landmark tiap stage; boss berdiri di landmark-nya, dan yang sudah dikalahkan berganti bendera. Benua yang belum terbuka tampil gelap di bawah awan, bertanda "?". Di ujung kanan ada pulau Training Ground dengan arenanya.
- **Menu pause** (`Enter` / `Esc` di dalam stage) punya dua kolom:
  - **SENJATA**: grid ikon dengan satu baris untuk Neo Buster dan satu baris per benua. Slot yang belum didapat bertanda "?". Nama senjata dan charge shot-nya tampil di bawah grid.
  - **TOOLS**: part dari Shop yang bisa di-ON/OFF. Daftarnya bisa digulir.

## Shop & Part

Setiap poin skor yang kamu dapat (musuh, pickup, boss 10.000) juga masuk ke dompet **POIN**. Dompet ini tersimpan permanen dan tidak hilang walau game over. Saldonya terlihat di Stage Select, Shop, dan menu pause.

Tekan `X` di **Stage Select** untuk membuka Shop. Part dikelompokkan dalam tab **GERAK**, **PERTAHANAN**, dan **SERANGAN**, dan tab **LEVEL** menjual level ATTACK dan DEFENSE (pindah tab dengan kiri/kanan). Pilih part dengan atas/bawah, tekan `Enter` untuk membeli, dan `X` atau `Esc` untuk kembali. Part yang sudah dibeli bisa dinyalakan atau dimatikan dengan `Enter`. Part yang aktif tampil sebagai ikon di pojok kanan atas layar.

Harga part paling sedikit tiga kali lipat dari harga awalnya. Part yang paling memudahkan permainan jauh lebih mahal, supaya menjadi tujuan jangka panjang: kebal lama setelah kena hit (Core), perisai (Shield, Aura Shield), dash dan lompatan tanpa batas (Unlimited Dash, Step Jump), dan booster sampai ultra attack tanpa menahan tombol (Omega Booster, part termahal).

| Part            | Harga   | Efek                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boots Anti Duri | 40.000  | Berjalan di atas duri tanpa mati                                                                                                                                                                                                                                                                                                                                                                                                   |
| Armor Anti Api  | 40.000  | Masuk dan berjalan di lava tanpa mati                                                                                                                                                                                                                                                                                                                                                                                              |
| Jetpack         | 40.000  | Lompatan 1,6x lebih tinggi                                                                                                                                                                                                                                                                                                                                                                                                         |
| Core            | 420.000 | Kebal 5x lebih lama setelah terkena hit                                                                                                                                                                                                                                                                                                                                                                                            |
| Super Booster   | 63.000  | Setiap tembakan biasa langsung keluar sebagai charge shot (Neo Buster: peluru besar; senjata spesial: charge shot-nya)                                                                                                                                                                                                                                                                                                             |
| Ultra Booster   | 250.000 | Harus punya Super Booster. Tahan tembak sekitar 2,5 detik sampai karakter berkilau emas, lalu lepas untuk **ultra attack**                                                                                                                                                                                                                                                                                                         |
| Shield          | 250.000 | 2 orb perisai mengorbit di sekitarmu. Orb yang terkena musuh atau peluru musuh menangkisnya (musuh kena damage, peluru kecil hancur), lalu hilang 10 detik sebelum muncul lagi                                                                                                                                                                                                                                                     |
| Aura Shield     | 400.000 | Gelembung emas di sekelilingmu yang menahan **3 hit** (peluru, musuh, boss, hazard yang melukai): HP tidak berkurang dan kamu tidak terpental. Busur emasnya hilang satu per hit, dan hit ketiga memecahkan gelembung. Gelembung hilang **15 detik**, lalu terbentuk lagi utuh; selama hilang, ikonnya di pojok kanan atas meredup dengan bar waktu di bawahnya. Duri, jurang, lava, dan cairan yang naik tetap mematikan seketika |
| Anti Angin      | 30.000  | Kebal terhadap semua dorongan angin: badai di stage Glacielle, tiupan Fanbot, dan serangan Gust Winderwomen. Pad angin tetap berfungsi karena dibutuhkan untuk menyelesaikan stage Winderwomen                                                                                                                                                                                                                                     |
| Omega Booster   | 750.000 | Harus punya Ultra Booster. Setiap tembakan langsung jadi ultra attack tanpa menahan tombol (kalau ultra sebelumnya masih berjalan, keluar charge shot). Selama Omega ON, Super Booster dan Ultra Booster berstatus **DISABLED**: tidak bisa diubah, dan setelan ON/OFF-nya kembali seperti semula saat Omega dimatikan                                                                                                             |
| Air Dash        | 36.000  | Tekan slide saat di udara untuk dash mendatar, sekali per lompatan (kembali setelah mendarat atau memanjat tangga). Bisa sambil menembak. Dash berhenti di dinding atau saat kamu menekan arah sebaliknya                                                                                                                                                                                                                          |
| Turbo           | 78.000  | Slide dan Air Dash 3x lebih lama                                                                                                                                                                                                                                                                                                                                                                                                   |
| Unlimited Dash  | 600.000 | Harus punya Turbo. Air Dash bisa dipakai berulang kali dalam satu lompatan, dan slide maupun Air Dash terus berjalan selama tombol slide ditahan (paling tidak sepanjang durasi normalnya). Lepas tombol untuk berhenti                                                                                                                                                                                                            |
| Step Jump       | 450.000 | Tekan lompat saat di udara untuk melompat lagi dari pijakan cahaya, berkali-kali tanpa batas. Setiap Step Jump juga mengembalikan Air Dash, dan bisa dipakai untuk melompat keluar dari Air Dash                                                                                                                                                                                                                                   |

### Level ATTACK & DEFENSE

Tab **LEVEL** di Shop menjual level **ATTACK** dan **DEFENSE**, dari level 1 sampai **150**, dibayar dengan POIN:

- **ATTACK**: setiap level menambah **1%** semua damage yang kamu berikan ke musuh dan boss (level 150 = +149%, hampir 2,5x).
- **DEFENSE**: setiap level membuat HP **1%** lebih tebal: damage yang kamu terima dibagi 1 + 1% per level (level 150 = HP 2,49x lebih tebal, damage berkurang 60%). Bertumpuk dengan armor dan `ILMUKEBAL`.
- Harga level berikutnya **500 POIN** di level 1, lalu naik **3,5% setiap level** (dibulatkan ke puluhan): level 10 = 680, level 50 = 2.700, level 100 = 15.070, level 149 = 81.310. Jadi level awal cepat terasa, sedangkan level tinggi menjadi tujuan jangka panjang. Total POIN untuk mencapai level 26 sekitar 19.480, level 51 sekitar 65.510, level 101 sekitar 431.330, dan level 150 sekitar 2,39 juta per stat.
- Tahan `Enter` untuk membeli level berulang (setelah setengah detik) sampai POIN tidak cukup.
- Baris tiap stat menunjukkan levelnya, efeknya sekarang dan di level berikutnya, dan harga level berikutnya (atau MAKS).

Ultra attack setiap senjata:

| Senjata        | Ultra attack                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Neo Buster     | **Hyper Beam**: laser raksasa sepanjang layar selama 1 detik                                                                     |
| Rolling Cutter | **Cutter Tempest**: 8 pisau putar besar berputar menyebar mengelilingi kamu                                                      |
| Fire Storm     | **Inferno**: pilar api meletus di sepanjang lantai, menjalar ke dua arah                                                         |
| Thunder Beam   | **Thunder God**: petir terus menyambar musuh dan boss hampir 2 detik                                                             |
| Frost Shard    | **Absolute Zero**: semua musuh di layar membeku dan terluka, peluru musuh pecah, boss membeku, dan duri es muncul dari lantai    |
| Gale Shot      | **Hurricane**: 3 tornado setinggi layar muncul dari posisimu dan menyapu ke depan, terus menggerus musuh dan meniup peluru musuh |
| Rock Breaker   | **Meteor**: meteor jatuh di depanmu lalu meledak menjadi gelombang kejut dan hujan batu                                          |
| Hydro Blast    | **Tsunami**: ombak setinggi layar muncul dari posisimu dan menyapu ke depan, menyapu peluru musuh                                |
| Venom Drip     | **Plague**: kabut racun memenuhi layar selama 3 detik, terus melukai semua musuh dan boss                                        |
| Shadow Clone   | **Eclipse**: layar menggelap dan tebasan bayangan menyambar musuh dan boss satu per satu                                         |
| Sonic Boom     | **Supersonic**: dentuman suara beruntun yang melukai semua musuh di layar dan menghancurkan peluru kecil                         |
| Prism Laser    | **Supernova**: cincin cahaya yang meluas dari dirimu, melukai semua yang dilewati dan menghapus peluru musuh                     |
| Time Stopper   | **Chrono Break**: waktu berhenti 4 detik sementara jam raksasa terus melukai semua musuh dan boss                                |

Ultra attack ke senjata kelemahan boss memberi 8 damage.

## Progress & Save

Data disimpan di `localStorage` browser (key `neobuster-save-v1`).

- **Boss yang sudah dikalahkan** tersimpan otomatis.
- **Save point manual** dibuat dengan cheat `INGATANKUAT`. Yang disimpan: jumlah life, skor, senjata aktif, dan — jika sedang di dalam stage — stage tersebut beserta checkpoint-nya.
- Layar title punya menu **START** (atau **CONTINUE** / **NEW GAME** jika ada save point) dan **CLOUD SAVE**; pilih dengan tombol panah.
  - **CONTINUE** melanjutkan dari save point. Kalau disimpan di dalam stage, game langsung masuk ke stage itu (dari checkpoint jika sudah melewatinya).
  - **NEW GAME** mulai dengan 2 life dan skor 0. Boss yang sudah dikalahkan tetap tersimpan.
- **Armor** dari ruang rahasia, **level ATTACK / DEFENSE**, dan **rekor wave** Training Ground tersimpan otomatis.
- Tekan `R` **dua kali** di title (dalam 3 detik) untuk menghapus semua progress, termasuk POIN, part yang sudah dibeli, level ATTACK / DEFENSE, armor, dan rekor Training Ground. Saat masuk Cloud Save, progress di cloud ikut terhapus.

## Cloud Save

Progress bisa disimpan di cloud supaya bisa dilanjutkan di perangkat mana pun. Pilih **CLOUD SAVE** di layar title.

- **Masuk tanpa daftar**: ketik username dan password. Username dan password yang sama selalu membuka save yang sama (huruf besar/kecil pada username tidak berpengaruh). Password tidak disimpan dan tidak dikirim; yang dipakai hanya hash SHA-256 dari username dan password sebagai ID save.
- **Akun baru**: kalau belum ada save untuk username dan password itu, password diminta sekali lagi sebelum save baru dibuat, supaya salah ketik tidak membuat akun kosong. Progress perangkat itu menjadi save pertamanya.
- **Masuk di perangkat lain**: kalau perangkat itu belum punya progress, progress dari cloud langsung dimuat. Kalau keduanya berbeda, kamu memilih mana yang dipakai (ringkasan boss, POIN, armor, part, rekor training, dan waktu simpan tampil berdampingan); yang lain akan ditimpa.
- **Simpan otomatis**: setelah masuk, setiap perubahan progress diunggah beberapa detik kemudian. Kalau gagal, dicoba lagi otomatis.
- **Badge akun** di pojok kanan atas title dan pojok kiri atas peta: avatar berisi huruf pertama nama (warnanya khas untuk setiap nama), nama, dan ikon awan yang menunjukkan status: centang hijau (TERSIMPAN), panah naik yang bergerak (MENYIMPAN), tanda seru merah (OFFLINE, JAM SALAH, atau GAGAL), atau tanda tanya kuning (PILIH SAVE). Layar Cloud Save menampilkan kartu akun yang sama dalam ukuran besar, lengkap dengan waktu simpan terakhir dan penjelasan kalau gagal.
- **Saat game dibuka lagi**, save di cloud dicek dulu. Kalau cloud lebih baru (misalnya kamu bermain di perangkat lain) dan perangkat ini tidak berubah, progress langsung diperbarui. Kalau keduanya berubah, kamu diminta memilih.
- Di layar Cloud Save juga ada **SIMPAN SEKARANG**, **MUAT DARI CLOUD** (ditanya sekali lagi karena menimpa progress perangkat ini), dan **KELUAR AKUN** (progress perangkat ini tetap ada, hanya tidak disinkronkan lagi).
- Data disimpan lewat API save-json Skuling (`https://openapi.skuling.id/external/save-json/`). Setiap request ditandatangani dengan **TOTP**: header `x-external-uid` dan `x-external-totp` (32 digit pertama HMAC-SHA512 dari token dengan langkah waktu 30 detik), jadi token API sendiri tidak pernah dikirim. Detailnya ada di `js/core/cloud.js`.
- TOTP berbasis waktu, jadi jam perangkat perlu tepat (server menerima selisih sekitar 30 detik). Kalau jam perangkat meleset, game mengoreksinya sendiri: waktu diambil dari header `Date` di jawaban server, lalu request diulang sekali, dan request berikutnya memakai waktu yang sudah dikoreksi. Kalau tetap gagal, Cloud Save menampilkan "JAM PERANGKAT TIDAK TEPAT".
- Hash dan tanda tangan dihitung dengan JavaScript biasa (tanpa `crypto.subtle`), jadi Cloud Save juga berjalan saat game dibuka langsung dari file atau lewat HTTP biasa.

## Cheat Code

Tekan **`P` + `O` bersamaan** untuk membuka cheat box. Ketik kode, tekan `Enter` untuk memakai, atau `Esc` untuk batal. Game berhenti sementara selama cheat box terbuka.

Cheat box **terkunci sampai rekor Training Ground mencapai wave 50** (rekornya tampil di Training Ground pada peta dunia). Selama masih terkunci, `P` + `O` hanya menampilkan pesan beserta rekor wave saat ini. Pengecualian untuk **mode development**: kalau game dibuka langsung dari file (`file://`) atau dari `localhost` / `127.0.0.1`, cheat selalu terbuka.

| Kode          | Efek                                                                                                                                                                                                                                                                                                                                                                                 | Bisa dipakai                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `MAUKUAT`     | HP penuh                                                                                                                                                                                                                                                                                                                                                                             | Di dalam stage, saat karakter masih hidup                 |
| `AWETMUDA`    | Life +1 (maks. 99)                                                                                                                                                                                                                                                                                                                                                                   | Selama permainan berjalan                                 |
| `ILMUKEBAL`   | HP 10x lebih tebal (semua damage dibagi 10), ditambah 1x untuk setiap armor dari ruang rahasia (mis. 11x dengan satu armor), + HP penuh. Bar HP berubah emas dan berkilau, badge **X10** (atau X11, X12, dan seterusnya) muncul di atas bar, dan sisa HP tampil sebagai angka (mis. 276/280). Aktif sampai game over atau kembali ke title. Duri dan jurang tetap mematikan seketika | Selama permainan berjalan (HP penuh hanya di dalam stage) |
| `AKUABADI`    | Life tak terbatas: mati tidak mengurangi life, kamu kembali ke checkpoint. HUD dan menu pause menampilkan **LIFE ∞**. Aktif sampai kembali ke title                                                                                                                                                                                                                                  | Selama permainan berjalan                                 |
| `INGATANKUAT` | Simpan progress saat ini (lihat [Progress & Save](#progress--save))                                                                                                                                                                                                                                                                                                                  | Selama permainan berjalan                                 |

Cheat tidak bisa dipakai di layar title, game over, atau ending.

## Format Kode

Format kode dirapikan dengan [Prettier](https://prettier.io) (pengaturannya di `.prettierrc.json`), dijalankan lewat Yarn:

```bash
yarn install        # sekali saja, memasang Prettier
yarn format         # merapikan format semua file di proyek
yarn format:check   # hanya mengecek, tanpa mengubah file
```

## Struktur Proyek

```
neobuster/
├── index.html      # canvas + urutan pemuatan script
├── readme.md
├── CHANGELOG.md
├── AGENTS.md       # aturan kerja & aturan konten untuk developer dan AI agent
├── CLAUDE.md       # memuat AGENTS.md untuk Claude Code
├── docs/
│   ├── MENAMBAH-KONTEN.md  # aturan wajib dan panduan menambah benua, boss, part, musuh
│   └── ART-STYLE.md        # panduan gaya karakter anime
├── manifest.webmanifest  # PWA: nama, ikon, layar penuh, landscape
├── sw.js           # service worker: game bisa dipasang dan dimainkan offline
├── icons/          # ikon aplikasi (digambar oleh game sendiri lewat tools/icons.js)
├── tools/
│   ├── reach.js    # tes jangkauan stage (dijalankan di console browser)
│   └── icons.js    # membuat ulang ikon aplikasi dari gambar game (dijalankan di console browser)
├── package.json    # script yarn format / format:check (Prettier)
├── .prettierrc.json
└── js/                 # dikelompokkan per fungsi; urutan pemuatannya ada di index.html
    ├── core/
    │   ├── engine.js       # versi, canvas, input, audio & musik, font pixel, sprite & glow
    │   ├── cloud.js        # cloud save: login tanpa daftar (hash), sinkron otomatis, pilihan saat cloud dan perangkat berbeda
    │   ├── pwa.js          # PWA: mendaftarkan service worker, pilihan INSTALL APP di menu title
    │   ├── touch.js        # tombol sentuh di HP & tablet (D-pad, aksi, menu), keyboard HP untuk form Cloud Save
    │   └── main.js         # alur game (title, peta, select, stage, boss, ending), shop, render, save, validator konten, game loop
    ├── art/
    │   └── art.js          # palet, drawRobot, background parallax, tileset, ikon senjata (+ registry untuk file benua)
    ├── characters/         # karakter yang digambar native
    │   ├── chars.js        # sistem karakter: kerangka, rasterisasi pixel art, outline, shading, lari, wajah bersama
    │   ├── nexo.js         # Nexo (hero)
    │   ├── azura/          # boss Azura: sniptor, magmaron, voltrax, glacielle, terralyn, winderwomen
    │   └── vespera/        # boss Vespera: hydros, toxaris, umbrion, sonique, lumina, chronia
    ├── stages/
    │   └── levels.js       # data benua & stage, builder layout, layout stage Azura
    ├── gameplay/
    │   ├── actors.js       # fisika (termasuk air), player, senjata, musuh, hazard, ruang rahasia, platform, boss Azura
    │   └── cheats.js       # cheat box (P + O) dan daftar cheat code
    ├── continents/
    │   └── vespera.js      # Benua Vespera: 6 stage, boss, senjata, musuh, hazard, dan gambarnya dalam satu file
    └── world/
        ├── worldmap.js     # pulau-pulau di peta dunia: medan alami, hutan, sungai, gunung, dan landmark tiap stage
        └── training.js     # Training Ground: arena, gelombang musuh tanpa akhir, layar hasil, dan pulaunya di peta
```

Detail teknis:

- Semua karakter (Nexo dan keduabelas boss) digambar native di kode (`js/characters/chars.js`, satu file per karakter), dengan lembar karakter sebagai referensi desain: kerangka yang digerakkan lewat sudut sendi, diberi bentuk (rambut, helm, armor, sarung tangan, sepatu, senjata), lalu dirasterisasi tanpa anti-alias pada kerapatan layar (1, 2, atau 3 pixel kecil per satuan; tampilan 3x di layar judul, intro, dan ending memakai kerapatan 3), dengan outline 1 pixel per bagian dan cel shading dari kiri atas. Mata digambar pixel demi pixel, dan semua karakter memakai wajah bersama (satu untuk pria, satu untuk wanita) supaya wajahnya seragam. Kaki saat berlari diletakkan dengan inverse kinematics pada lintasan yang bergerak mundur persis secepat karakter berlari, jadi kaki yang menapak tidak meluncur. Rambut, sarung tangan, buster, dan sepatu Nexo diwarnai ulang sesuai senjata. Logo dibuat dari huruf poligon yang dirasterisasi ke pixel kecil dengan efek krom, api, outline, dan ekstrusi.
- Tata letak memakai ruang logis **384 × 224**, tapi pixel art-nya 2x lebih rapat: satu pixel lama dipecah jadi 2×2 pixel kecil yang tetap tajam. Karakter punya outline 1 pixel kecil, sudut terpotong, dan shading berlapis; teks dan tile juga 2x lebih detail. Kanvas digambar di resolusi layar (kelipatan genap) agar setiap pixel kecil tetap pas di pixel layar.
- Peta level digambar per potongan 32 kolom saat terlihat, supaya hemat memori.
- Level berukuran **450 × 44 tile** (16 px), pintu boss di kolom 426. Kamera mengikuti player ke segala arah, kecuali di ruang boss.
- Logika berjalan tetap **60 langkah/detik**. Render diinterpolasi agar mulus di layar 120/144 Hz.
- Semua grafik dan suara dibuat lewat kode (Canvas 2D + Web Audio), tanpa file aset. Satu-satunya file gambar adalah ikon aplikasi PWA di `icons/`, dan ikon itu pun digambar oleh game sendiri (`tools/icons.js`).

## Menambah Konten

Panduan menambah benua, boss, part shop, dan musuh ada di [docs/MENAMBAH-KONTEN.md](docs/MENAMBAH-KONTEN.md), diawali **aturan wajib** untuk benua, stage, dan boss baru: setiap stage unik dan menantang, satu ruang rahasia dengan armor di setiap stage, boss native dengan ciri khas, teks tanpa gender, dan HP boss yang naik setiap benua. Patokan gaya karakter anime (proporsi wajah, mata, rambut, outline, palet) ada di [docs/ART-STYLE.md](docs/ART-STYLE.md). Saat game dimuat, validator konten memberi peringatan di console browser kalau ada data yang belum lengkap.

**Untuk developer lain dan AI coding agent:** aturan kerja, aturan konten, dan cara menguji dirangkum di [AGENTS.md](AGENTS.md). `CLAUDE.md` memuat file yang sama untuk Claude Code. Tes jangkauan stage ada di [tools/reach.js](tools/reach.js): tempel isinya di console browser saat game terbuka, lalu jalankan `reachAll()`.

## Versi

Versi ditulis di konstanta `VERSION` di `js/core/engine.js` dan tampil di pojok kanan bawah layar title & pause. Setiap ada perubahan, versinya dinaikkan dan catatannya ditambahkan di [CHANGELOG.md](CHANGELOG.md).
