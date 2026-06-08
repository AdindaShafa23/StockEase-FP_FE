import { describe, it, expect } from 'vitest'
import productReducer, {
  addProduct,
  updateProduct,
  deleteProduct,
  setFilters,
  updateProductStock,
} from './productSlice'
import { makeProduct } from '@/test/utils'

/**
 * Acceptance Criteria yang dibuktikan:
 *  - AC#3  CRUD produk berfungsi penuh (add / update / delete di Redux).
 *  - AC#4  Stok produk berubah otomatis lewat reducer updateProductStock.
 */
describe('productSlice', () => {
  const base = productReducer(undefined, { type: '@@INIT' })

  it('addProduct menambah produk ke awal list', () => {
    const p = makeProduct({ id: 1, name: 'Teh Kotak' })
    const next = productReducer(base, addProduct(p))

    expect(next.products).toHaveLength(1)
    expect(next.products[0].name).toBe('Teh Kotak')
  })

  it('updateProduct mengganti produk dengan id sama', () => {
    const start = productReducer(base, addProduct(makeProduct({ id: 1, name: 'Lama' })))
    const next = productReducer(start, updateProduct(makeProduct({ id: 1, name: 'Baru', price: 9000 })))

    expect(next.products[0].name).toBe('Baru')
    expect(next.products[0].price).toBe(9000)
  })

  it('deleteProduct menghapus produk berdasarkan id', () => {
    let state = productReducer(base, addProduct(makeProduct({ id: 1 })))
    state = productReducer(state, addProduct(makeProduct({ id: 2 })))
    const next = productReducer(state, deleteProduct(1))

    expect(next.products).toHaveLength(1)
    expect(next.products.find((p) => p.id === 1)).toBeUndefined()
  })

  it('setFilters menggabung filter sebagian tanpa menimpa lainnya', () => {
    const next = productReducer(base, setFilters({ search: 'kopi' }))
    expect(next.filters.search).toBe('kopi')
    expect(next.filters.sortBy).toBe('name') // tetap default
  })

  describe('updateProductStock (AC#4 — stok otomatis berubah)', () => {
    const seeded = productReducer(base, addProduct(makeProduct({ id: 1, stock: 20 })))

    it('transaksi masuk (in) menambah stok', () => {
      const next = productReducer(seeded, updateProductStock({ productId: 1, type: 'in', quantity: 5 }))
      expect(next.products[0].stock).toBe(25)
    })

    it('transaksi keluar (out) mengurangi stok', () => {
      const next = productReducer(seeded, updateProductStock({ productId: 1, type: 'out', quantity: 8 }))
      expect(next.products[0].stock).toBe(12)
    })

    it('produk tak dikenal tidak mengubah state', () => {
      const next = productReducer(seeded, updateProductStock({ productId: 999, type: 'in', quantity: 5 }))
      expect(next.products[0].stock).toBe(20)
    })
  })
})
