import { type ReactElement, type ReactNode } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render, type RenderOptions } from '@testing-library/react'
import authReducer from '@/features/auth/authSlice'
import productReducer from '@/features/products/productSlice'
import transactionReducer from '@/features/transactions/transactionSlice'
import type { RootState } from '@/app/store'
import type { Product, SafeUser, Transaction } from '@/types'

/**
 * Membuat store baru per-test (terisolasi) dengan reducer yang sama seperti aplikasi.
 * preloadedState memungkinkan kita menyetel kondisi awal (mis. user admin, produk stok rendah).
 */
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      products: productReducer,
      transactions: transactionReducer,
    },
    preloadedState: preloadedState as RootState | undefined,
  })
}

export type AppStore = ReturnType<typeof setupStore>

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
  store?: AppStore
}

/** Render komponen yang dibungkus Redux <Provider>. Mengembalikan store untuk assertion state. */
export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, store = setupStore(preloadedState), ...renderOptions }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// ---- Factory data uji (mengurangi boilerplate di tiap test) ----

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Kopi Sachet',
    category: 'Minuman',
    stock: 20,
    price: 2000,
    lowStockThreshold: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    productId: 1,
    productName: 'Kopi Sachet',
    type: 'in',
    quantity: 10,
    note: '',
    createdBy: 'Admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeUser(overrides: Partial<SafeUser> = {}): SafeUser {
  return {
    id: 1,
    name: 'Admin Toko',
    email: 'admin@stockease.test',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
