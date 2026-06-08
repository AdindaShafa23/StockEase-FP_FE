import { describe, it, expect } from 'vitest'
import { submitTransaction } from './transactionSlice'
import { addProduct } from '@/features/products/productSlice'
import { setupStore, makeProduct } from '@/test/utils'

/**
 * Acceptance Criteria yang dibuktikan (alur integrasi thunk + 2 slice):
 *  - AC#4  Transaksi masuk/keluar mengubah stok otomatis via Redux.
 *  - AC#5  Transaksi keluar > stok DITOLAK dengan pesan error.
 *
 * Sejak migrasi ke Redux + localStorage, thunk tidak lagi memanggil JSON Server,
 * sehingga test cukup memverifikasi logika lokal tanpa mock HTTP.
 */
describe('submitTransaction (thunk)', () => {
  function storeWithProduct(stock: number) {
    const store = setupStore()
    store.dispatch(addProduct(makeProduct({ id: 1, name: 'Kopi', stock })))
    return store
  }

  it('AC#5 — menolak transaksi keluar saat stok tidak mencukupi', async () => {
    const store = storeWithProduct(3)

    const result = await store.dispatch(
      submitTransaction({
        productId: 1,
        productName: 'Kopi',
        type: 'out',
        quantity: 10, // > stok (3)
        createdBy: 'Staff',
      }),
    )

    // Thunk ditolak dengan pesan error yang tepat
    expect(submitTransaction.rejected.match(result)).toBe(true)
    expect(result.payload).toBe('Stok tidak mencukupi.')

    // Stok tidak berubah & tidak ada transaksi tercatat
    expect(store.getState().products.products[0].stock).toBe(3)
    expect(store.getState().transactions.transactions).toHaveLength(0)
  })

  it('AC#4 — transaksi keluar yang valid mengurangi stok produk', async () => {
    const store = storeWithProduct(20)

    const result = await store.dispatch(
      submitTransaction({ productId: 1, productName: 'Kopi', type: 'out', quantity: 5, createdBy: 'Staff' }),
    )

    expect(submitTransaction.fulfilled.match(result)).toBe(true)
    expect(store.getState().products.products[0].stock).toBe(15) // 20 - 5
    expect(store.getState().transactions.transactions).toHaveLength(1)
  })

  it('AC#4 — transaksi masuk (restock) menambah stok produk', async () => {
    const store = storeWithProduct(20)

    await store.dispatch(
      submitTransaction({ productId: 1, productName: 'Kopi', type: 'in', quantity: 30, createdBy: 'Staff' }),
    )

    expect(store.getState().products.products[0].stock).toBe(50) // 20 + 30
  })

  it('menolak transaksi untuk produk yang tidak ada', async () => {
    const store = storeWithProduct(20)
    const result = await store.dispatch(
      submitTransaction({ productId: 999, productName: 'Hantu', type: 'out', quantity: 1, createdBy: 'Staff' }),
    )
    expect(submitTransaction.rejected.match(result)).toBe(true)
    expect(result.payload).toBe('Produk tidak ditemukan.')
  })
})
