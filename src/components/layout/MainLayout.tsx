import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  LogOut,
  Boxes,
  User,
  Menu,
  X,
  Home,
  ChevronRight,
} from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/features/auth/authSlice'
import { fetchProducts } from '@/features/products/productSlice'
import { fetchTransactions } from '@/features/transactions/transactionSlice'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Produk', icon: Package },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/profile', label: 'Profil', icon: User },
]

/**
 * Peta segmen URL → label terbaca untuk breadcrumb.
 * Segmen yang berupa ID (mis. angka) atau tidak dikenal akan dilewati.
 */
const crumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Produk',
  transactions: 'Transaksi',
  profile: 'Profil',
  new: 'Tambah',
  edit: 'Edit',
}

/** Bangun daftar breadcrumb dari pathname, lengkap dengan tautan kumulatif. */
function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; to: string }[] = []
  let acc = ''
  for (const seg of segments) {
    acc += `/${seg}`
    const label = crumbLabels[seg]
    if (!label) continue // lewati ID atau segmen tak dikenal
    crumbs.push({ label, to: acc })
  }
  return crumbs
}

/** Layout Components Pattern (Week 12) — kerangka aplikasi terproteksi. */
export default function MainLayout() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const breadcrumbs = buildBreadcrumbs(location.pathname)

  // Muat data awal sekali setelah masuk area terproteksi.
  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchTransactions())
  }, [dispatch])

  function handleLogout() {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1">
      <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Menu
      </p>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Indikator aktif berupa garis aksen di sisi kiri */}
              <span
                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600 transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <Icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )

  const Brand = () => (
    <div className="flex items-center gap-2 px-2">
      <div className="rounded-lg bg-brand-600 p-2 text-white">
        <Boxes size={22} />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight">StockEase</p>
        <p className="text-xs text-slate-500">Inventaris UMKM</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Skip-to-content link — muncul saat difokuskan via keyboard (Tab) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Lewati ke konten utama
      </a>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-8">
          <Brand />
        </div>
        <NavList />
        <button onClick={handleLogout} className="btn-secondary mt-4 w-full justify-start">
          <LogOut size={18} />
          Keluar
        </button>
      </aside>

      {/* Sidebar mobile — Framer Motion slide (Materi 8) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white p-4 shadow-xl md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <Brand />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1 hover:bg-slate-100"
                  aria-label="Tutup menu"
                >
                  <X size={20} />
                </button>
              </div>
              <NavList onNavigate={() => setMobileOpen(false)} />
              <button onClick={handleLogout} className="btn-secondary mt-4 w-full justify-start">
                <LogOut size={18} />
                Keluar
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Konten utama */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/70 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>

          {/* Brand ringkas hanya di mobile (sidebar tersembunyi) */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="rounded-lg bg-brand-600 p-1.5 text-white">
              <Boxes size={18} />
            </div>
            <span className="font-bold">StockEase</span>
          </div>

          {/* Breadcrumb (desktop) — orientasi lokasi pengguna */}
          <nav aria-label="Breadcrumb" className="hidden md:block">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  to="/dashboard"
                  className="flex items-center text-slate-400 transition-colors hover:text-slate-600"
                  aria-label="Beranda"
                >
                  <Home size={15} />
                </Link>
              </li>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1
                return (
                  <li key={crumb.to} className="flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-slate-300" aria-hidden="true" />
                    {isLast ? (
                      <span className="font-semibold text-slate-700" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.to}
                        className="text-slate-500 transition-colors hover:text-slate-700"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight text-slate-900">{user?.name}</p>
              <p className="text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-sm ring-2 ring-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
