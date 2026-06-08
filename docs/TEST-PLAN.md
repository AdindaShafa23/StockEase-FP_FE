# Test Plan — StockEase

Dokumen ini membuktikan bahwa **Acceptance Criteria (Definition of Done)** pada [PRD.md §16](../PRD.md) telah terimplementasi. Pengujian dibagi dua lapis:

1. **Automated test** (Vitest + React Testing Library) — untuk logika deterministik (Redux, validasi, guard route, conditional rendering).
2. **Manual test** — untuk hal visual/non-deterministik (animasi, responsivitas, DevTools, deploy) dan alur end-to-end.

---

## 1. Cara Menjalankan Automated Test

```bash
npm install          # sekali saja
npm run test:run     # jalankan seluruh test sekali
npm run test         # mode watch (interaktif)
npm run coverage     # laporan cakupan kode (folder coverage/)
```

> Automated test **tidak** memerlukan JSON Server berjalan — semua panggilan HTTP di-mock.

### Ringkasan suite saat ini

| File test | Fokus | Jumlah test |
|---|---|---|
| `src/features/auth/authSlice.test.ts` | login/register/logout state | 6 |
| `src/features/products/productSlice.test.ts` | CRUD produk & update stok | 7 |
| `src/features/transactions/transactionSlice.test.ts` | thunk transaksi (validasi stok) | 4 |
| `src/features/selectors.test.ts` | selector dashboard & alert | 4 |
| `src/lib/schemas.test.ts` | validasi Zod (login/register/produk) | 9 |
| `src/utils/formatters.test.ts` | format Rupiah | 3 |
| `src/components/shared/withAdminOnly.test.tsx` | HOC admin-only | 3 |
| `src/routes/ProtectedRoute.test.tsx` | guard route & redirect | 4 |
| `src/components/shared/LowStockAlert.test.tsx` | banner alert stok | 2 |
| `src/components/products/ProductTable.test.tsx` | tombol admin-only, badge, empty state | 5 |
| **Total** | | **47** |

---

## 2. Pemetaan Acceptance Criteria → Bukti Test

Legenda: ✅ Automated · 🖐️ Manual · 🔀 Keduanya

| # | Acceptance Criteria (PRD §16) | Jenis | Bukti |
|---|---|---|---|
| 1 | Register, login, logout berfungsi dengan validasi | 🔀 | `authSlice.test.ts`, `schemas.test.ts` + Manual **M-01..M-03** |
| 2 | Halaman protected tidak bisa diakses tanpa login | ✅ | `ProtectedRoute.test.tsx` |
| 3 | CRUD produk penuh; tombol admin tak muncul untuk staff | 🔀 | `productSlice.test.ts`, `withAdminOnly.test.tsx`, `ProductTable.test.tsx` + Manual **M-04..M-06** |
| 4 | Transaksi masuk/keluar mengubah stok via Redux | ✅ | `productSlice.test.ts`, `transactionSlice.test.ts` |
| 5 | Transaksi keluar > stok ditolak dengan pesan error | ✅ | `transactionSlice.test.ts` |
| 6 | Dashboard menampilkan 2 grafik | 🔀 | `selectors.test.ts` (data) + Manual **M-09** (render grafik) |
| 7 | Alert stok rendah muncul otomatis dengan animasi | 🔀 | `LowStockAlert.test.tsx` (muncul) + Manual **M-10** (animasi) |
| 8 | Semua 7 React Design Pattern terimplementasi | 🖐️ | Checklist **§4** |
| 9 | Animasi Framer Motion (page transition, kartu, modal) | 🖐️ | Manual **M-11** |
| 10 | Redux DevTools menunjukkan state ter-update | 🔀 | Slice tests + Manual **M-12** |
| 11 | Aplikasi responsif di mobile & desktop | 🖐️ | Manual **M-13** |
| 12 | Build production berhasil & ter-deploy | 🖐️ | Manual **M-14** |

---

## 3. Manual Test Cases

**Prasyarat**

- Jalankan `npm run start` (menyalakan Vite dev server).
- Siapkan **1 akun admin** dan **1 akun staff** (data awal di-seed dari `src/data/seed.ts`, mis. `admin@stockease.com` / `admin123` dan `staff@stockease.com` / `staff123`).
- Setiap kasus diberi **ID unik**, dipetakan ke **Acceptance Criteria (AC)**, dan punya kolom **Status** untuk dicentang saat demo (☐ → ✅ lulus / ❌ gagal).
- Lampirkan **screenshot/video** sebagai bukti pada kasus yang relevan.

---

### M-01 · Register valid &nbsp;`AC#1`

**Langkah**
1. Buka `/register`.
2. Isi nama, email **baru**, password (≥ 6 karakter), pilih role.
3. Klik **Submit**.

**Hasil diharapkan** — Akun dibuat, otomatis login, dan diarahkan ke `/dashboard`.

**Status:** ☐

---

### M-02 · Validasi form register &nbsp;`AC#1`

**Langkah**
1. Buka `/register`.
2. Coba submit dengan salah satu kondisi: email salah format, password < 6 karakter, atau konfirmasi password tidak cocok.

**Hasil diharapkan** — Muncul pesan error inline di field terkait; submit tertahan (tidak mengirim data).

**Status:** ☐

---

### M-03 · Login & Logout &nbsp;`AC#1`

**Langkah**
1. Login dengan kredensial yang benar.
2. Klik tombol **Logout**.

**Hasil diharapkan** — Login mengarah ke `/dashboard`; Logout kembali ke `/login` dan sesi di `localStorage` terhapus.

**Status:** ☐

---

### M-04 · Akses halaman tanpa login &nbsp;`AC#2`

**Langkah**
1. Pastikan sudah logout.
2. Akses URL `/products` langsung dari address bar.

**Hasil diharapkan** — Dialihkan otomatis ke `/login`.

**Status:** ☐

---

### M-05 · CRUD produk (Admin) &nbsp;`AC#3`

**Langkah**
1. Login sebagai **admin**.
2. **Tambah** produk baru → **Edit** produk tersebut → **Hapus** produk.
3. Refresh halaman.

**Hasil diharapkan** — Produk bertambah/berubah/hilang di tabel, dan perubahan **tetap tersimpan** (persist) setelah refresh.

**Status:** ☐

---

### M-06 · Staff tanpa hak edit &nbsp;`AC#3`

**Langkah**
1. Login sebagai **staff**.
2. Buka `/products`.

**Hasil diharapkan** — Tombol **Tambah / Edit / Hapus tidak tampil**; staff hanya bisa melihat dan mencari produk.

**Status:** ☐

---

### M-07 · Transaksi keluar melebihi stok &nbsp;`AC#5`

**Langkah**
1. Buka halaman Transaksi.
2. Catat transaksi **keluar** dengan qty **lebih besar** dari stok yang tersedia.

**Hasil diharapkan** — Transaksi ditolak; muncul toast/pesan **"Stok tidak mencukupi"**.

**Status:** ☐

---

### M-08 · Transaksi mengubah stok &nbsp;`AC#4`

**Langkah**
1. Catat transaksi barang **masuk** sebanyak 10.
2. Cek stok produk terkait (tanpa refresh).

**Hasil diharapkan** — Stok bertambah 10 secara otomatis tanpa perlu refresh.

**Status:** ☐

---

### M-09 · Dashboard menampilkan 2 grafik &nbsp;`AC#6`

**Langkah**
1. Buka `/dashboard`.

**Hasil diharapkan** — Tampil **grafik stok per kategori** dan **grafik transaksi mingguan**.

**Status:** ☐

---

### M-10 · Alert stok rendah &nbsp;`AC#7`

**Langkah**
1. Pastikan ada produk dengan stok ≤ threshold.
2. Buka `/dashboard`.

**Hasil diharapkan** — Banner merah muncul dengan animasi **expand dari atas**.

**Status:** ☐

---

### M-11 · Animasi Framer Motion &nbsp;`AC#9`

**Langkah**
1. Pindah antar halaman.
2. Buka dan tutup modal.
3. Muat ulang dashboard.

**Hasil diharapkan** — Page transition fade + slide; modal scale + fade; kartu muncul dengan efek **stagger**.

**Status:** ☐

---

### M-12 · Redux DevTools menunjukkan state ter-update &nbsp;`AC#10`

**Langkah**
1. Buka **Redux DevTools**.
2. Lakukan login lalu catat sebuah transaksi.

**Hasil diharapkan** — Action `auth/login/fulfilled`, `transactions/submit/fulfilled`, dan `products/updateProductStock` muncul; state berubah sesuai.

**Status:** ☐

---

### M-13 · Responsif (mobile & desktop) &nbsp;`AC#11`

**Langkah**
1. Buka DevTools **device toolbar**.
2. Uji pada lebar 360px, tablet, dan desktop.

**Hasil diharapkan** — Layout rapi tanpa overflow; sidebar berubah menjadi **drawer** di mobile.

**Status:** ☐

---

### M-14 · Build & deploy &nbsp;`AC#12`

**Langkah**
1. Jalankan `npm run build`.
2. Buka URL Vercel hasil deploy.

**Hasil diharapkan** — Build sukses tanpa error; aplikasi live dan berfungsi.

**Status:** ☐

---

### M-15 · `prefers-reduced-motion` &nbsp;`NFR aksesibilitas`

**Langkah**
1. Aktifkan **"reduce motion"** di pengaturan OS.
2. Muat ulang aplikasi.

**Hasil diharapkan** — Animasi diminimalkan / dinonaktifkan.

**Status:** ☐

---

## 4. Checklist 7 React Design Pattern (AC#8)

| # | Pattern | Lokasi di Kode | ✔ |
|---|---|---|---|
| 1 | Layout Components | `src/components/layout/MainLayout.tsx`, `AuthLayout.tsx` | ☐ |
| 2 | Conditional Rendering | Badge stok & empty state di `ProductTable.tsx`; banner `LowStockAlert.tsx` | ☐ |
| 3 | HOC | `src/components/shared/withAdminOnly.tsx` | ☐ |
| 4 | Provider Pattern | Redux `<Provider>` di `main.tsx` | ☐ |
| 5 | Container & Presentational | `ProductPage.tsx` (container) + `ProductTable.tsx` (presentational); idem Transaksi | ☐ |
| 6 | Render Props | `src/components/shared/DataFetcher.tsx` | ☐ |
| 7 | Compound Pattern | `src/components/ui/Modal.tsx` (`Modal.Header/Body/Footer`) | ☐ |

---

## 5. Catatan & Batasan

- Animasi (AC#9) dan keberadaan 7 pattern (AC#8) **sengaja tidak di-assert otomatis** — lebih tepat dibuktikan lewat demo visual + code review (di atas), karena assertion DOM atas animasi rapuh dan tidak bermakna.
- Selector berbasis tanggal (`selectTodayTransactionCount`, `selectWeeklyTransactions`) diuji dengan **fake timer** agar deterministik.
- Test transaksi menguji **logika validasi & sinkronisasi stok** langsung pada store Redux (tanpa backend), sejak data dipindah ke Redux + localStorage.
