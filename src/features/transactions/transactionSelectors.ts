import { RootState } from '@/app/store'

// Transaksi 7 hari terakhir (dibutuhkan Dev 3 untuk grafik)
export const selectWeeklyTransactions = (state: RootState) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return state.transactions.transactions.filter(
    t => new Date(t.createdAt) >= sevenDaysAgo
  )
}

// Transaksi hari ini (dibutuhkan Dev 3 untuk kartu ringkasan)
export const selectTodayTransactionCount = (state: RootState) => {
  const today = new Date().toDateString()
  return state.transactions.transactions.filter(
    t => new Date(t.createdAt).toDateString() === today
  ).length
}