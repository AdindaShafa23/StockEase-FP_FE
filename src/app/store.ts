import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authReducer, { setUsers } from '@/features/auth/authSlice'
import productReducer, { setProducts } from '@/features/products/productSlice'
import transactionReducer, { setTransactions } from '@/features/transactions/transactionSlice'
import { seedProducts, seedTransactions, seedUsers } from '@/data/seed'
import { loadState, saveState } from './persist'

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  transactions: transactionReducer,
})

// RootState diturunkan dari rootReducer (bukan dari store) agar tidak
// melingkar dengan tipe preloadedState.
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

const persistedState = loadState()

export const store = configureStore({
  reducer: rootReducer,
  // Muat snapshot terakhir dari localStorage bila ada.
  preloadedState: persistedState,
})

// Simpan state ke localStorage setiap kali ada perubahan (pengganti penyimpanan server).
store.subscribe(() => {
  saveState(store.getState())
})

// Bila belum ada data tersimpan (kunjungan pertama), isi dengan data seed.
if (!persistedState) {
  store.dispatch(setUsers(seedUsers))
  store.dispatch(setProducts(seedProducts))
  store.dispatch(setTransactions(seedTransactions))
}
