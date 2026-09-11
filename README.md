# Jejak Kopi

Arsip telusur kopi — dari origin sampai cangkir. Situs statis, mobile-first,
tanpa server, dengan GitHub sebagai tempat penyimpanan datanya.

- Kopi dikelompokkan menurut **negara** → **daerah** → satu halaman per kopi.
- Setiap kopi menyimpan: Origin, Farm, Producer, Variety, Process, Altitude,
  Roaster, Roast date, Tasting notes, catatan bebas, dan riwayat seduhan.
- Data tinggal di `data.json` di repo ini. Setiap perubahan dari aplikasi
  menjadi satu commit, jadi seluruh riwayat arsipmu terversi di git.
- Bisa dipasang di layar depan HP (PWA) dan tetap terbuka saat luring.
- Setiap kopi tampil sebagai **kartu tiket**: kepala berwarna menurut negara asal,
  badan berisi spesifikasi dan catatan rasa, sobekan bawah berisi roastery dan
  tanggal sangrai.

---

## Isi repo

```
index.html            Beranda — daftar negara
negara.html           Daftar kopi satu negara, dikelompokkan per daerah
kopi.html             Halaman detail satu kopi
catat.html            Formulir tambah / ubah kopi
telusur.html          Telusur per varietas, proses, roaster, daerah, rasa
pengaturan.html       Koneksi GitHub, cadangan, tema
data.json             ARSIPMU — satu-satunya berkas yang berubah saat mencatat
assets/app.css        Semua gaya — palet negara ada di blok :root paling atas
assets/app.js         Data, sinkronisasi GitHub, kartu tiket, kerangka halaman
assets/seed.js        Salinan data.json untuk pratinjau lokal (lihat catatan di bawah)
assets/konfigurasi.js Owner/repo kalau situsnya BUKAN di GitHub Pages
_headers              Aturan singgahan untuk Cloudflare Pages / Netlify
assets/icon-*.png     Ikon aplikasi
manifest.webmanifest  Supaya bisa dipasang di layar depan HP
sw.js                 Service worker — mode luring
.nojekyll             Matikan pemrosesan Jekyll di GitHub Pages
```

---

## 0. Melihatnya dulu tanpa GitHub

Buka `index.html` dengan klik dua kali. Semua halaman bisa dijelajahi dan arsip terisi
dari `assets/seed.js`. Catatan yang kamu tambah tersimpan di browser saja.

Kalau ada yang tidak jalan (beberapa browser membatasi berkas lokal), jalankan server
kecil dari dalam folder ini lalu buka <http://localhost:8000>:

```bash
python3 -m http.server 8000
```

## 1. Buat repo dan unggah

Lewat web, tanpa perlu git:

1. Buka <https://github.com/new>. Nama repo: `jejak-kopi`.
   Pilih **Public** — GitHub Pages untuk repo private butuh akun berbayar
   (lihat *Kalau mau data privat* di bawah).
2. Jangan centang "Add a README" — repo ini sudah punya.
3. Setelah repo jadi, klik **uploading an existing file**, lalu seret **seluruh
   isi** folder ini (termasuk folder `assets/`). Commit.

Lewat git, kalau lebih suka terminal:

```bash
cd jejak-kopi
git init
git add .
git commit -m "Jejak Kopi: unggahan pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/jejak-kopi.git
git push -u origin main
```

> Berkas `.nojekyll` harus ikut terunggah. Kalau di komputermu berkas berawalan
> titik tersembunyi, aktifkan dulu tampilan berkas tersembunyi
> (macOS: `Cmd + Shift + .`).

## 2. Nyalakan GitHub Pages

1. Di repo: **Settings → Pages**.
2. *Source*: **Deploy from a branch**.
3. *Branch*: `main`, folder `/ (root)`. **Save**.
4. Tunggu kira-kira satu menit, muat ulang halaman itu — alamat situsmu muncul
   di atas: `https://USERNAME.github.io/jejak-kopi/`

Buka alamat itu. Situsnya sudah jalan dalam **mode baca**: kamu bisa melihat
isi `data.json`, tapi belum bisa mencatat.

## 3. Buat token supaya bisa mencatat

Aplikasi menulis ke `data.json` lewat GitHub API, dan itu butuh token.

1. Buka <https://github.com/settings/personal-access-tokens/new>
   (**Settings → Developer settings → Personal access tokens → Fine-grained tokens**).
2. *Token name*: `jejak-kopi`
3. *Expiration*: pilih sesukamu — 1 tahun praktis; makin pendek makin aman.
4. *Repository access*: **Only select repositories** → pilih `jejak-kopi` saja.
5. *Permissions → Repository permissions → Contents*: ubah ke
   **Read and write**. Biarkan sisanya *No access*.
6. **Generate token**, lalu salin. Token hanya ditampilkan satu kali.

## 4. Pasang token di aplikasi

1. Buka situsmu, masuk ke tab **Atur**.
2. Kolom Owner/Repo/Branch biasanya sudah terisi otomatis dari alamat situs.
   Periksa saja: Owner = username GitHub-mu, Repo = `jejak-kopi`, Branch = `main`,
   Berkas data = `data.json`.
3. Tempel token di kolom **Personal access token**.
4. Tekan **Simpan & tes koneksi**. Kalau berhasil, pil di pojok kanan atas
   berubah jadi hijau **tersinkron**.

Ulangi langkah ini di setiap perangkat yang kamu pakai untuk mencatat.
Token disimpan di penyimpanan browser perangkat itu saja dan **tidak pernah
ikut ter-commit**.

## 5. Pasang di layar depan HP

- **Android / Chrome**: menu ⋮ → *Add to Home screen* (atau *Install app*).
- **iPhone / Safari**: tombol Bagikan → *Add to Home Screen*.

Setelah terpasang, ikonnya muncul seperti aplikasi biasa, buka tanpa bilah
alamat, dan tetap bisa dibuka waktu tidak ada sinyal.

---

## Cara kerja penyimpanannya

Aplikasi selalu bekerja dari salinan di browser, lalu menyinkronkan ke GitHub:

1. Halaman dibuka → tampilkan salinan lokal seketika, lalu tarik `data.json`
   dari GitHub di belakang layar.
2. Kamu simpan sebuah kopi → tersimpan lokal, lalu dikirim jadi satu commit.
3. Sebelum mengirim, aplikasi **membaca ulang** `data.json` dan menggabungkannya
   dengan perubahanmu. Jadi catatan dari HP tidak akan menimpa catatan dari
   laptop; yang menang adalah catatan dengan `updatedAt` paling baru.
4. Menghapus kopi tidak membuang barisnya, tapi menandainya `dihapus: true`.
   Ini yang membuat penghapusan ikut tersinkron dan tidak "hidup lagi" dari
   perangkat lain.

Kalau kamu mencatat saat luring, perubahan mengantre dan otomatis terkirim
saat halaman dibuka lagi dalam keadaan daring.

### Arti pil status di pojok kanan atas

| Warna | Arti |
|---|---|
| Hijau — *tersinkron* | Semua sudah tersimpan di GitHub |
| Kuning — *belum terkirim* | Ada perubahan lokal yang menunggu dikirim |
| Merah — *bermasalah* | Token/repo salah, atau tidak ada koneksi |
| Abu — *mode baca* | Belum ada token di perangkat ini |

Tekan pil itu untuk langsung membuka Pengaturan.

---

## Yang perlu kamu sadari

**Repo public berarti `data.json` bisa dibaca siapa saja.** Isinya catatan
kopi, jadi biasanya tidak apa-apa — tapi jangan menulis hal pribadi di kolom
catatan.

**Token tersimpan di localStorage.** Siapa pun yang memegang perangkatmu dalam
keadaan tidak terkunci bisa mengambilnya. Karena itu batasi token ke satu repo
ini saja dan hanya izin *Contents*. Kalau HP hilang: cabut tokennya di
**Settings → Developer settings → Personal access tokens**, lalu buat yang baru.

**Jangan pernah menaruh token di dalam berkas repo.** `.gitignore` sudah
menghadang pola berkas rahasia yang umum, tapi tetap periksa sebelum commit.

**GitHub Pages menyimpan singgahan (cache) sekitar sepuluh menit.** Perangkat
yang tidak memakai token membaca `data.json` lewat Pages, jadi bisa telat
melihat catatan terbaru. Perangkat yang punya token membaca lewat API, dan itu
selalu terbaru.

**Batas ukuran.** GitHub API membaca berkas sampai 1 MB dengan mulus — kira-kira
beberapa ribu catatan kopi. Jauh di atas itu, arsip sebaiknya dipecah per tahun.

---

## Menaruhnya di Cloudflare Pages

Cloudflare Pages gratis, melayani **repo private**, dan menghormati berkas
`_headers` — jadi masalah singgahan sepuluh menit di GitHub Pages hilang.
Repo GitHub tetap dipakai: sebagai sumber berkas situs sekaligus tempat
`data.json`. Cloudflare hanya menyajikan, tidak menyimpan datamu.

### 1. Isi konfigurasi repo lebih dulu

Ini langkah yang gampang terlewat. Di GitHub Pages, aplikasi menebak owner dan
repo dari alamat `USERNAME.github.io/jejak-kopi`. Alamat Cloudflare
(`jejak-kopi.pages.dev`) tidak menyebut repo apa pun, jadi tebakan itu gagal.

Buka `assets/konfigurasi.js`, isi, lalu commit:

```js
window.JEJAK_REPO = {
  owner:  "USERNAME",
  repo:   "jejak-kopi",
  branch: "main",
  path:   "data.json"
};
```

Berkas ini aman di-commit — tidak ada token di dalamnya. Kalau dilewat, situsnya
tetap jalan, tapi kamu harus mengetik Owner dan Repo manual di halaman **Atur**
pada setiap perangkat.

### 2. Hubungkan repo

1. Masuk ke <https://dash.cloudflare.com> → **Workers & Pages**.
2. **Create application** → tab **Pages** → **Connect to Git**.
3. Izinkan Cloudflare mengakses akun GitHub-mu, lalu pilih repo `jejak-kopi`.
   Boleh private.
4. Di **Set up builds and deployments**, isi seperti ini:

   | Kolom | Isi |
   |---|---|
   | Project name | `jejak-kopi` (jadi alamat `jejak-kopi.pages.dev`) |
   | Production branch | `main` |
   | Framework preset | **None** |
   | Build command | **kosongkan** |
   | Build output directory | `/` |

5. **Save and Deploy**. Sekitar satu menit, alamatnya hidup.

Setiap commit ke `main` setelah itu otomatis ter-deploy — termasuk commit yang
dibuat aplikasi sendiri waktu kamu mencatat kopi. Itu wajar; deploy-nya cepat
dan tidak mengganggu.

### 3. Domain sendiri (opsional)

Di proyek Pages → **Custom domains** → **Set up a domain**. Kalau domainnya
sudah di Cloudflare, DNS-nya diatur otomatis. Sertifikat HTTPS ikut terbit
sendiri.

### 4. Kalau mau arsipnya benar-benar tertutup

**Repo private saja tidak cukup.** Cloudflare Pages menyajikan isi repo ke
publik, jadi `data.json` tetap bisa dibuka siapa pun di
`jejak-kopi.pages.dev/data.json`. Yang menutupnya adalah **Cloudflare Access**:

1. Dashboard → **Zero Trust** → **Access** → **Applications** → **Add an
   application** → **Self-hosted**.
2. Application domain: isi alamat Pages atau domainmu.
3. Buat satu policy: *Action* **Allow**, *Include* → **Emails** → alamat
   emailmu (tambahkan email perangkat lain kalau perlu).
4. Identity provider: **One-time PIN** sudah cukup — kamu masukkan email,
   Cloudflare mengirim kode, selesai. Tidak perlu akun apa pun.

Setelah aktif, membuka situs meminta kode sekali, lalu sesinya bertahan
berhari-hari. Paket gratis Zero Trust memuat sampai 50 pengguna.

Satu efeknya: aplikasi terpasang di layar depan HP tetap jalan, tapi sesekali
akan minta login ulang saat sesinya habis.

### Membandingkan dengan GitHub Pages

| | GitHub Pages | Cloudflare Pages |
|---|---|---|
| Repo private | perlu akun berbayar | gratis |
| Singgahan `data.json` | ±10 menit, tak bisa diatur | diatur `_headers`, selalu segar |
| Bisa ditutup dengan login | tidak | ya, lewat Access |
| Konfigurasi repo | ditebak otomatis | isi `assets/konfigurasi.js` |

Keduanya boleh hidup bersamaan dari repo yang sama — tidak ada yang bentrok.

### Kalau tetap mau di GitHub Pages saja

Bisa. Repo harus **Public**, dan `assets/konfigurasi.js` boleh dibiarkan
kosong.

---

## Cadangan dan pemulihan

- **Atur → Unduh arsip (JSON)** menyimpan seluruh arsip sebagai satu berkas.
- **Atur → Impor dari berkas JSON** menggabungkan berkas itu kembali
  (tidak menimpa — digabung berdasarkan `updatedAt`).
- Cara paling ampuh: repo ini sendiri. Setiap penyimpanan adalah satu commit,
  jadi versi lama selalu bisa dipulihkan lewat riwayat `data.json` di GitHub.

## Menghapus data contoh

`data.json` berisi satu catatan asli (Gayo – Aceh) dan tiga entri contoh.
Buka masing-masing lewat aplikasi lalu tekan **Hapus**, atau sunting
`data.json` langsung di GitHub dan sisakan yang kamu mau.

## Soal seed.js

`assets/seed.js` adalah salinan `data.json` dalam bentuk JavaScript. Gunanya cuma dua:
membuat pratinjau lokal bisa jalan tanpa server, dan mengisi layar pada kunjungan
pertama sebelum `data.json` sempat terbaca. Begitu aplikasi terhubung, isinya digabung
dengan versi asli di GitHub — yang paling baru menang, jadi tidak akan menimpa apa pun.

Kamu tidak wajib memperbaruinya. Kalau mau menyegarkan, jalankan dari folder repo:

```bash
python3 -c "import json;d=open('data.json',encoding='utf-8').read();open('assets/seed.js','w',encoding='utf-8').write('window.JEJAK_SEED = '+d+';')"
```

## Menyetel tampilan

- Warna, jenis huruf, dan jarak semuanya ada di `assets/app.css`, di blok
  `:root` paling atas. Palet per negara ada tepat di bawahnya sebagai `[data-w="id"]`
  dan seterusnya — tiap negara punya empat nilai: `--c` (aksen), `--block` (kepala
  kartu), `--tint` (sobekan), `--deep` (tulisan).
- Negara mana memakai palet mana diatur di `WARNA` dalam `assets/app.js`. Negara yang
  tidak terdaftar dapat salah satu palet secara tetap, dihitung dari namanya.
- Aplikasi ini sengaja hanya punya mode terang. Kalau nanti mau mode gelap,
  palet negaranya perlu disusun ulang supaya tetap kontras di latar gelap.
- Emoji untuk catatan rasa diatur di `RASA_EMOJI` dalam `assets/app.js`.
- Daftar saran (varietas, proses, negara, metode seduh) ada tepat di bawahnya.
- Setelah mengubah berkas, naikkan `VERSI` di `sw.js` supaya perangkat yang
  sudah memasang aplikasinya mengambil versi baru.

---

## Kalau ada yang tidak beres

**Situs 404 setelah dinyalakan.** Tunggu satu-dua menit lagi; pemasangan
pertama memang lambat. Pastikan `index.html` ada di root repo, bukan di dalam
subfolder.

**Halaman tampil tanpa gaya.** Berkas `assets/` belum ikut terunggah. Periksa
di repo, harus ada folder `assets` berisi `app.css` dan `app.js`.

**Pil merah, "Token ditolak (401)".** Token salah tempel atau sudah kedaluwarsa.
Buat baru, tempel lagi.

**Pil merah, "Akses ditolak (403)".** Izin *Contents* belum *Read and write*,
atau token tidak mencakup repo ini.

**Pil merah, "Repo atau berkas tidak ditemukan (404)".** Periksa Owner, Repo,
dan Branch di Pengaturan. Branch default GitHub sekarang `main`, bukan `master`.

**Di Cloudflare, kolom Owner dan Repo kosong.** `assets/konfigurasi.js` belum
diisi, atau kamu pernah menyimpan pengaturan kosong lewat halaman Atur — yang
tersimpan di browser selalu menang. Isi langsung di halaman Atur saja.

**Sudah simpan tapi tidak muncul di perangkat lain.** Buka Pengaturan di
perangkat itu lalu tekan **Tarik dari GitHub**. Kalau perangkat itu tanpa token,
ia membaca lewat Pages yang bisa telat sekitar sepuluh menit.

**Perubahan pada berkas situs tidak kelihatan.** Service worker menyimpan versi
lama. Naikkan `VERSI` di `sw.js`, commit, lalu muat ulang dua kali.
