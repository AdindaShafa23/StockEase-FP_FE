import { RootState } from '@/app/store'

// Produk stok rendah (dibutuhkan Dev 3 untuk dashboard & alert)
export const selectLowStockProducts = (state: RootState) => {
  return state.products.products.filter(p => p.stock <= p.lowStockThreshold)
}

// Total stok keseluruhan (dibutuhkan Dev 3 untuk kartu ringkasan)
export const selectTotalStock = (state: RootState) => {
  return state.products.products.reduce((sum, p) => sum + p.stock, 0)
}