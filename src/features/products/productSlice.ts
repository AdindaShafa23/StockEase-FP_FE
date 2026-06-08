import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Product, TransactionType } from '@/types'
import type { RootState } from '@/app/store'

export interface ProductFilters {
  search: string
  category: string
  sortBy: 'name' | 'stock' | 'price'
}

interface ProductState {
  products: Product[]
  loading: boolean
  error: string | null
  filters: ProductFilters
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  filters: { search: '', category: '', sortBy: 'name' },
}

/**
 * Kembalikan produk dari state lokal (data sudah ada di Redux/localStorage).
 * Dipertahankan agar pemanggil lama (MainLayout, tombol retry) tetap berfungsi.
 */
export const fetchProducts = createAsyncThunk<Product[], void, { state: RootState; rejectValue: string }>(
  'products/fetchAll',
  async (_, { getState }) => {
    return getState().products.products
  },
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.products.unshift(action.payload)
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.products.findIndex((p) => p.id === action.payload.id)
      if (idx !== -1) state.products[idx] = action.payload
    },
    deleteProduct(state, action: PayloadAction<Product['id']>) {
      state.products = state.products.filter((p) => p.id !== action.payload)
    },
    setFilters(state, action: PayloadAction<Partial<ProductFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    /** Dipakai modul Transaksi (Dev 2) untuk menyesuaikan stok setelah transaksi. */
    updateProductStock(
      state,
      action: PayloadAction<{ productId: Product['id']; type: TransactionType; quantity: number }>,
    ) {
      const product = state.products.find((p) => p.id === action.payload.productId)
      if (product) {
        const delta = action.payload.type === 'in' ? action.payload.quantity : -action.payload.quantity
        product.stock += delta
        product.updatedAt = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Gagal memuat produk.'
      })
  },
})

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setFilters,
  updateProductStock,
} = productSlice.actions
export default productSlice.reducer
