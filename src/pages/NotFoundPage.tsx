import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'

/**
 * Halaman 404 — ditampilkan saat pengguna membuka rute yang tidak dikenal.
 * Memberi jalan keluar yang jelas alih-alih diam-diam mengarahkan ke dashboard.
 */
export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25">
        <Compass size={32} />
      </div>
      <p className="mt-6 text-6xl font-bold tracking-tight text-slate-900">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-700">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Maaf, halaman yang Anda cari tidak tersedia atau mungkin telah dipindahkan.
      </p>
      <Link to="/dashboard" className="btn-primary mt-6">
        <ArrowLeft size={18} /> Kembali ke Dashboard
      </Link>
    </main>
  )
}
