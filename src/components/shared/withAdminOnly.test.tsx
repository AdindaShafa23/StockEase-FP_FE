import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { withAdminOnly } from './withAdminOnly'
import { renderWithProviders, makeUser } from '@/test/utils'

/**
 * Acceptance Criteria yang dibuktikan:
 *  - AC#3 Tombol/aksi Admin TIDAK muncul untuk Staff (HOC withAdminOnly).
 *  - Pattern #3 (HOC) terimplementasi.
 */
const SecretButton = withAdminOnly(() => <button>Hapus Produk</button>)

describe('withAdminOnly (HOC)', () => {
  it('menampilkan komponen untuk role admin', () => {
    renderWithProviders(<SecretButton />, {
      preloadedState: { auth: { user: makeUser({ role: 'admin' }), isAuthenticated: true, loading: false, error: null, users: [] } },
    })
    expect(screen.getByRole('button', { name: 'Hapus Produk' })).toBeInTheDocument()
  })

  it('menyembunyikan komponen untuk role staff', () => {
    renderWithProviders(<SecretButton />, {
      preloadedState: { auth: { user: makeUser({ role: 'staff' }), isAuthenticated: true, loading: false, error: null, users: [] } },
    })
    expect(screen.queryByRole('button', { name: 'Hapus Produk' })).not.toBeInTheDocument()
  })

  it('menyembunyikan komponen saat belum login', () => {
    renderWithProviders(<SecretButton />, {
      preloadedState: { auth: { user: null, isAuthenticated: false, loading: false, error: null, users: [] } },
    })
    expect(screen.queryByRole('button', { name: 'Hapus Produk' })).not.toBeInTheDocument()
  })
})
