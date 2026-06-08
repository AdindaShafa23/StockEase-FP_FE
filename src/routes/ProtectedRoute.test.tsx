import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { renderWithProviders, makeUser } from '@/test/utils'
import type { RootState } from '@/app/store'

/**
 * Acceptance Criteria yang dibuktikan:
 *  - AC#2 Halaman protected tidak bisa diakses tanpa login (redirect ke /login).
 *  - AC#3 Route khusus Admin menolak Staff (redirect ke /dashboard).
 */
function renderAt(path: string, auth: RootState['auth'], requireAdmin = false) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        {/* Guard sesuai parameter (bisa admin-only) */}
        <Route element={<ProtectedRoute requireAdmin={requireAdmin} />}>
          <Route path="/products/new" element={<div>Form Produk (Admin)</div>} />
        </Route>
        {/* /dashboard di-guard non-admin agar bisa jadi target redirect Staff & login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Halaman Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Halaman Login</div>} />
      </Routes>
    </MemoryRouter>,
    { preloadedState: { auth } },
  )
}

const noAuth: RootState['auth'] = { user: null, isAuthenticated: false, loading: false, error: null, users: [] }
const staffAuth: RootState['auth'] = { user: makeUser({ role: 'staff' }), isAuthenticated: true, loading: false, error: null, users: [] }
const adminAuth: RootState['auth'] = { user: makeUser({ role: 'admin' }), isAuthenticated: true, loading: false, error: null, users: [] }

describe('ProtectedRoute', () => {
  it('mengalihkan ke /login bila belum terautentikasi', () => {
    renderAt('/dashboard', noAuth)
    expect(screen.getByText('Halaman Login')).toBeInTheDocument()
    expect(screen.queryByText('Halaman Dashboard')).not.toBeInTheDocument()
  })

  it('mengizinkan akses bila sudah terautentikasi', () => {
    renderAt('/dashboard', staffAuth)
    expect(screen.getByText('Halaman Dashboard')).toBeInTheDocument()
  })

  it('mengalihkan Staff dari route Admin-only ke /dashboard', () => {
    renderAt('/products/new', staffAuth, true)
    expect(screen.getByText('Halaman Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Form Produk (Admin)')).not.toBeInTheDocument()
  })

  it('mengizinkan Admin mengakses route Admin-only', () => {
    renderAt('/products/new', adminAuth, true)
    expect(screen.getByText('Form Produk (Admin)')).toBeInTheDocument()
  })
})
