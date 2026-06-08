import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Transaction } from '@/types'
import type { RootState } from '@/app/store'
// Import action dari productSlice untuk menyesuaikan stok setelah transaksi.
import { updateProductStock } from '@/features/products/productSlice'

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
}

/**
 * Kembalikan transaksi dari state lokal (terbaru di atas).
 * Dipertahankan agar pemanggil lama (TransactionPage, tombol retry) tetap berfungsi.
 */
export const fetchTransactions = createAsyncThunk<Transaction[], void, { state: RootState; rejectValue: string }>(
  'transactions/fetchAll',
  async (_, { getState }) => {
    return [...getState().transactions.transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },
)

/**
 * Catat transaksi baru: validasi stok -> buat transaksi lokal -> sesuaikan stok produk.
 */
export const submitTransaction = createAsyncThunk<
  Transaction,
  Omit<Transaction, 'id' | 'createdAt'>, // Payload dari form tanpa id & createdAt
  { state: RootState; rejectValue: string }
>(
  'transactions/submit',
  async (transactionData, { getState, dispatch, rejectWithValue }) => {
    const state = getState()

    // Ambil data produk terkait dari state global untuk mengecek stok saat ini
    const product = state.products.products.find((p) => p.id === transactionData.productId)

    if (!product) {
      return rejectWithValue('Produk tidak ditemukan.')
    }

    // Validasi: Tolak transaksi jika barang keluar dan stok kurang
    if (transactionData.type === 'out' && product.stock < transactionData.quantity) {
      return rejectWithValue('Stok tidak mencukupi.')
    }

    // 1. Buat transaksi baru secara lokal
    const savedTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    // 2. Sesuaikan stok produk di productSlice agar UI produk sinkron
    dispatch(
      updateProductStock({
        productId: product.id,
        type: transactionData.type,
        quantity: transactionData.quantity,
      }),
    )

    return savedTransaction
  },
)

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchTransactions ---
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Gagal memuat transaksi.'
      })
      
      // --- submitTransaction ---
      .addCase(submitTransaction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitTransaction.fulfilled, (state, action) => {
        state.loading = false
        // Menambahkan transaksi baru ke urutan paling atas di state [cite: 198]
        state.transactions.unshift(action.payload)
      })
      .addCase(submitTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Gagal memproses transaksi.'
      })
  },
})

export const { setTransactions, addTransaction } = transactionSlice.actions
export default transactionSlice.reducer