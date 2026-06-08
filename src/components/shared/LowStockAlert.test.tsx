import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LowStockAlert from './LowStockAlert'
import { renderWithProviders, setupStore, makeProduct } from '@/test/utils'
import { setProducts } from '@/features/products/productSlice'

/**
 * Acceptance Criteria yang dibuktikan:
 *  - AC#7 Alert stok rendah muncul otomatis saat ada produk di bawah ambang.
 *  - Pattern #2 (Conditional Rendering): banner hanya tampil bila perlu.
 */
function renderAlert(preload: ReturnType<typeof makeProduct>[]) {
  // Isi store SEBELUM render agar selector langsung melihat data (tanpa update async).
  const store = setupStore()
  store.dispatch(setProducts(preload))
  return renderWithProviders(
    <MemoryRouter>
      <LowStockAlert />
    </MemoryRouter>,
    { store },
  )
}

describe('LowStockAlert', () => {
  it('TIDAK menampilkan banner saat semua stok aman', () => {
    renderAlert([makeProduct({ id: 1, stock: 50, lowStockThreshold: 5 })])
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('menampilkan banner + daftar produk saat ada stok rendah', () => {
    renderAlert([
      makeProduct({ id: 1, name: 'Gula Pasir', stock: 2, lowStockThreshold: 5 }),
      makeProduct({ id: 2, name: 'Beras', stock: 100, lowStockThreshold: 10 }),
    ])

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByText(/Stok Menipis \(1 Produk\)/i)).toBeInTheDocument()
    expect(screen.getByText('Gula Pasir')).toBeInTheDocument()
    expect(screen.queryByText('Beras')).not.toBeInTheDocument()
  })
})
