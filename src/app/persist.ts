// Persistensi state Redux ke localStorage (pengganti JSON Server).
// loadState dipakai sebagai preloadedState; saveState dipanggil tiap store berubah.
import type { RootState } from './store'

const STORAGE_KEY = 'stockease:state'

/** Baca snapshot state dari localStorage. Mengembalikan undefined bila kosong/rusak. */
export function loadState(): RootState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as RootState
  } catch {
    return undefined
  }
}

/** Simpan snapshot state ke localStorage. Field transien (loading/error) direset. */
export function saveState(state: RootState): void {
  try {
    const snapshot: RootState = {
      auth: { ...state.auth, loading: false, error: null },
      products: { ...state.products, loading: false, error: null },
      transactions: { ...state.transactions, loading: false, error: null },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Abaikan kegagalan tulis (mis. storage penuh / mode privat).
  }
}
