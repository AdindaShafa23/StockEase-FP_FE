import { describe, it, expect, vi, afterEach } from 'vitest'
import { selectLowStockProducts, selectTotalStock } from '@/features/products/productSelectors'
import {
  selectWeeklyTransactions,
  selectTodayTransactionCount,
} from '@/features/transactions/transactionSelectors'
import { setupStore, makeProduct, makeTransaction } from '@/test/utils'
import { setProducts } from '@/features/products/productSlice'
import { setTransactions } from '@/features/transactions/transactionSlice'

/**
 * Acceptance Criteria yang dibuktikan:
 *  - AC#7  Produk stok rendah terdeteksi (dasar alert).
 *  - AC#6  Data turunan untuk kartu & grafik dashboard (total stok, transaksi mingguan/hari ini).
 */
describe('product selectors', () => {
  it('selectLowStockProducts hanya mengembalikan produk stok <= threshold', () => {
    const store = setupStore()
    store.dispatch(
      setProducts([
        makeProduct({ id: 1, stock: 3, lowStockThreshold: 5 }), // rendah
        makeProduct({ id: 2, stock: 5, lowStockThreshold: 5 }), // tepat di ambang -> rendah
        makeProduct({ id: 3, stock: 20, lowStockThreshold: 5 }), // aman
      ]),
    )
    const low = selectLowStockProducts(store.getState())
    expect(low.map((p) => p.id)).toEqual([1, 2])
  })

  it('selectTotalStock menjumlahkan seluruh stok', () => {
    const store = setupStore()
    store.dispatch(setProducts([makeProduct({ id: 1, stock: 10 }), makeProduct({ id: 2, stock: 15 })]))
    expect(selectTotalStock(store.getState())).toBe(25)
  })
})

describe('transaction selectors (berbasis tanggal)', () => {
  // Bekukan waktu agar perhitungan "hari ini" & "7 hari" deterministik.
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-08T10:00:00.000Z'))

  afterEach(() => {
    vi.setSystemTime(new Date('2026-06-08T10:00:00.000Z'))
  })

  it('selectTodayTransactionCount menghitung transaksi hari ini saja', () => {
    const store = setupStore()
    store.dispatch(
      setTransactions([
        makeTransaction({ id: 1, createdAt: '2026-06-08T08:00:00.000Z' }), // hari ini
        makeTransaction({ id: 2, createdAt: '2026-06-08T01:00:00.000Z' }), // hari ini
        makeTransaction({ id: 3, createdAt: '2026-06-01T08:00:00.000Z' }), // minggu lalu
      ]),
    )
    expect(selectTodayTransactionCount(store.getState())).toBe(2)
  })

  it('selectWeeklyTransactions hanya mengembalikan 7 hari terakhir', () => {
    const store = setupStore()
    store.dispatch(
      setTransactions([
        makeTransaction({ id: 1, createdAt: '2026-06-07T08:00:00.000Z' }), // dalam 7 hari
        makeTransaction({ id: 2, createdAt: '2026-05-20T08:00:00.000Z' }), // > 7 hari
      ]),
    )
    const weekly = selectWeeklyTransactions(store.getState())
    expect(weekly).toHaveLength(1)
    expect(weekly[0].id).toBe(1)
  })
})
