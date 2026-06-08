import { Outlet } from 'react-router-dom'
import { Boxes } from 'lucide-react'

/**
 * Layout Components Pattern (Week 12) — kerangka halaman publik (Login/Register).
 * Tidak peduli isi kontennya; hanya mengatur tata letak terpusat.
 */
export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 p-4">
      {/* Ornamen blur dekoratif di latar belakang */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-3.5 text-white shadow-lg shadow-brand-600/25">
            <Boxes size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">StockEase</h1>
          <p className="text-sm text-slate-500">Sistem Manajemen Inventaris UMKM</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
