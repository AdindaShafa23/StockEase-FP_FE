import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import ProductTable from './ProductTable'
import { renderWithProviders, makeProduct, makeUser } from '@/test/utils'
import type { RootState } from '@/app/store'

/**
 * Acceptance Criteria yang dibuktikan:
 *  - AC#3 Aksi Edit/Hapus (Admin-only) tidak muncul untuk Staff.
 *  - Pattern #2 (Conditional Rendering): badge "menipis" untuk stok rendah & empty state.
 *  - Pattern #5 (Container/Presentational): ProductTable murni presentational.
 */
const products = [
  makeProduct({ id: 1, name: 'Kopi', stock: 2, lowStockThreshold: 5 }), // stok rendah
  makeProduct({ id: 2, name: 'Teh', stock: 30, lowStockThreshold: 5 }),
]

const noop = () => {}

function adminState(): Partial<RootState> {
  return { auth: { user: makeUser({ role: 'admin' }), isAuthenticated: true, loading: false, error: null, users: [] } }
}
function staffState(): Partial<RootState> {
  return { auth: { user: makeUser({ role: 'staff' }), isAuthenticated: true, loading: false, error: null, users: [] } }
}

describe('ProductTable', () => {
  it('Admin melihat tombol Edit & Hapus', () => {
    renderWithProviders(
      <ProductTable products={products} sortBy="name" onSort={noop} onEdit={noop} onDelete={noop} />,
      { preloadedState: adminState() },
    )
    expect(screen.getByLabelText('Edit produk Kopi')).toBeInTheDocument()
    expect(screen.getByLabelText('Hapus produk Kopi')).toBeInTheDocument()
  })

  it('Staff TIDAK melihat tombol Edit & Hapus (AC#3)', () => {
    renderWithProviders(
      <ProductTable products={products} sortBy="name" onSort={noop} onEdit={noop} onDelete={noop} />,
      { preloadedState: staffState() },
    )
    expect(screen.queryByLabelText('Edit produk Kopi')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Hapus produk Kopi')).not.toBeInTheDocument()
  })

  it('menandai produk stok rendah dengan label "menipis"', () => {
    renderWithProviders(
      <ProductTable products={products} sortBy="name" onSort={noop} onEdit={noop} onDelete={noop} />,
      { preloadedState: adminState() },
    )
    expect(screen.getByText(/menipis/i)).toBeInTheDocument()
  })

  it('menampilkan empty state saat daftar produk kosong', () => {
    renderWithProviders(
      <ProductTable products={[]} sortBy="name" onSort={noop} onEdit={noop} onDelete={noop} />,
      { preloadedState: adminState() },
    )
    expect(screen.getByText(/Tidak ada produk/i)).toBeInTheDocument()
  })

  it('memanggil onSort saat header kolom diklik (presentational callback)', async () => {
    const onSort = vi.fn()
    const { getByRole } = renderWithProviders(
      <ProductTable products={products} sortBy="name" onSort={onSort} onEdit={noop} onDelete={noop} />,
      { preloadedState: adminState() },
    )
    getByRole('button', { name: /Stok/i }).click()
    expect(onSort).toHaveBeenCalledWith('stock')
  })
})
