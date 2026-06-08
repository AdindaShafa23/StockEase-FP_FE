# StockEase — Sistem Manajemen Inventaris UMKM

##  Hasil deploy

🔗 **[Aplikasi StockEase](https://stockease-fp-fe.netlify.app)**


Final Project Kelompok 3 · Pengembangan Frontend Dasar

StockEase adalah aplikasi web untuk membantu pemilik UMKM mengelola inventaris
(produk, stok, dan transaksi barang masuk/keluar) secara digital dan terorganisir.

> 📄 Dokumen kebutuhan lengkap ada di [PRD.md](./PRD.md).


## 🚀 Tech Stack

- **React 18 + TypeScript** (Vite) — UI & build tool
- **Redux Toolkit + React Redux** — state management global
- **React Router v6** — routing, route guard, & code-splitting (`React.lazy`)
- **Tailwind CSS** — styling
- **React Hook Form + Zod** — form & validasi skema
- **Recharts** — grafik dashboard
- **Framer Motion** — animasi transisi & micro-interaction
- **react-hot-toast** — notifikasi
- **lucide-react** — ikon
- **localStorage** — penyimpanan data persisten di sisi klien (tanpa backend)

## 📦 Cara Menjalankan

Aplikasi sepenuhnya berjalan di sisi klien — **tanpa backend**. Data tersimpan di
Redux dan dipertahankan melalui `localStorage` browser.

```bash
npm install      # install dependencies (sekali saja)
npm run dev      # Vite dev server di http://localhost:5173
```

Skrip lain:

```bash
npm run build    # build untuk production (tsc -b && vite build)
npm run preview  # preview hasil build
npm run lint     # cek ESLint
```

### Penyimpanan data

Data awal (produk, user, transaksi) di-seed dari [src/data/seed.ts](./src/data/seed.ts)
saat pertama kali dibuka, lalu seluruh perubahan otomatis tersimpan ke `localStorage`
(lihat [src/app/persist.ts](./src/app/persist.ts)). Karena itu data bersifat **per-browser**.

## 🗂️ Struktur Folder

```
src/
├── app/                   # Konfigurasi Redux
│   ├── store.ts               # Root store + seeding awal
│   ├── persist.ts             # Load/save state ke localStorage
│   └── hooks.ts               # useAppDispatch / useAppSelector terketik
├── components/
│   ├── layout/                # AuthLayout, MainLayout (sidebar + header)
│   ├── products/              # ProductTable (presentational)
│   ├── transactions/          # TransactionTable (presentational)
│   ├── shared/                # ErrorBoundary, ErrorBanner, LowStockAlert,
│   │                          #   DataFetcher (render props), withAdminOnly (HOC)
│   └── ui/                    # Button, Badge, Modal (compound component)
├── data/                      # seed.ts (data awal: user, produk, transaksi)
├── features/                  # Redux slices + selectors per domain
│   ├── auth/                  # authSlice
│   ├── products/              # productSlice + productSelectors
│   └── transactions/          # transactionSlice + transactionSelectors
├── hooks/                     # useAuth
├── lib/                       # schemas.ts (skema validasi Zod)
├── pages/                     # Halaman: Login, Register, Dashboard, Product(+Form),
│                              #   Transaction(+Form), Profile, NotFound (404)
├── routes/                    # AppRouter (lazy + AnimatePresence), ProtectedRoute
├── types/                     # Definisi tipe (User, Product, Transaction)
├── utils/                     # formatters.ts, dateHelpers.ts
├── App.tsx                    # Root + ErrorBoundary
├── main.tsx                   # Entry point (Provider Redux + Toaster)
└── index.css                  # Tailwind + komponen styling
```

## ✅ Fitur (status)

- [x] Login & Register (role Admin & Staff)
- [x] Route guard halaman terproteksi + akses khusus Admin (HOC `withAdminOnly`)
- [x] CRUD Produk (nama, kategori, stok, harga) + pencarian, filter, sort, pagination
- [x] Transaksi barang masuk & keluar (stok terupdate otomatis)
- [x] Validasi stok keluar tidak melebihi stok tersedia
- [x] Validasi form dengan React Hook Form + Zod
- [x] Tabel produk & riwayat transaksi (dengan filter tanggal/jenis)
- [x] Grafik stok per kategori & transaksi mingguan (Recharts)
- [x] Alert otomatis stok hampir habis
- [x] Halaman 404 (Not Found) untuk rute tak dikenal
- [x] Error Boundary global + tampilan error API yang ramah pengguna
- [x] Aksesibilitas: skip-to-content, focus trap modal, ARIA pada tabel & alert
- [x] SEO: meta description, Open Graph, Twitter Card, JSON-LD
- [x] Performa: code-splitting per halaman (`React.lazy` + `Suspense`)
- [x] Animasi transisi halaman & responsif (mobile-first)

## 👤 Cara Pakai Pertama Kali

1. Jalankan `npm run start` lalu buka aplikasi → halaman **Login**.
2. Klik **Daftar di sini** → buat akun (pilih role Admin agar bisa tambah/hapus produk).
3. Masuk → tambahkan produk di menu **Produk**.
4. Catat transaksi masuk/keluar di menu **Transaksi**.
5. Lihat ringkasan & grafik di **Dashboard**.

> Data aplikasi (users, products, transactions) tersimpan di `localStorage` browser,
> dengan data awal di-seed dari `src/data/seed.ts` saat penyimpanan masih kosong.
> Sesi login juga disimpan di `localStorage`.

## 🔒 Catatan Keamanan & Keterbatasan

Aplikasi ini dibuat untuk tujuan **edukasi** menggunakan JSON Server sebagai backend
tiruan, sehingga beberapa aspek keamanan **sengaja disederhanakan** dan **tidak cocok
untuk produksi** tanpa perubahan pada sisi backend:

- **Sesi disimpan di `localStorage`** — rentan terhadap serangan XSS. Untuk produksi,
  sebaiknya gunakan **httpOnly cookies** agar token tidak bisa diakses JavaScript.
- **Password disimpan & dibandingkan sebagai teks biasa** di JSON Server. Pada sistem
  nyata, password wajib di-*hash* (mis. bcrypt) di sisi server.
- **Tidak ada perlindungan CSRF** untuk operasi yang mengubah data. API produksi
  sebaiknya menerapkan token CSRF.
- **Tidak ada rate limiting** pada percobaan login atau permintaan API.

Memperbaiki poin-poin di atas memerlukan backend yang sesungguhnya (autentikasi
berbasis JWT/session, hashing password, dsb.), bukan hanya perubahan di sisi frontend.
