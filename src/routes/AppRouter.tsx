import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AuthLayout from '@/components/layout/AuthLayout'
import MainLayout from '@/components/layout/MainLayout'

/**
 * Code-splitting (React.lazy) — setiap halaman dimuat sebagai chunk terpisah,
 * sehingga bundle awal lebih kecil. Halaman berat seperti Dashboard (Recharts)
 * baru diunduh saat pertama kali diakses.
 */
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const ProductFormPage = lazy(() => import('@/pages/ProductFormPage'))
const TransactionPage = lazy(() => import('@/pages/TransactionPage'))
const TransactionFormPage = lazy(() => import('@/pages/TransactionFormPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/** Framer Motion — Page Transition variants (Materi 8, tugas 4.5) */
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
}

/**
 * Komponen dalam agar bisa memakai useLocation (harus di dalam BrowserRouter).
 * AnimatePresence mode="wait" memastikan satu halaman selesai exit sebelum halaman berikutnya masuk.
 */
function AnimatedRoutes() {
  const location = useLocation()
  const shouldReduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={shouldReduce ? false : 'initial'}
        animate="in"
        exit={shouldReduce ? {} : 'out'}
        variants={pageVariants}
        transition={{ duration: 0.25 }}
        style={{ display: 'contents' }}
      >
        <Suspense
          fallback={
            <div role="status" aria-busy="true" className="flex min-h-screen items-center justify-center text-slate-400">
              Memuat…
            </div>
          }
        >
          <Routes location={location}>
          {/* Publik */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Terproteksi (semua role) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/transactions" element={<TransactionPage />} />
              <Route path="/transactions/new" element={<TransactionFormPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Terproteksi (khusus Admin) */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route element={<MainLayout />}>
              <Route path="/products/new" element={<ProductFormPage />} />
              <Route path="/products/:id/edit" element={<ProductFormPage />} />
            </Route>
          </Route>

          {/* Default & fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Konfigurasi routing (React Router v6 — Declarative Mode, Week 10).
 * Page transition dibungkus AnimatePresence (Materi 8, tugas 4.5).
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
