// Tipe data inti StockEase — sesuai model data pada PRD bagian 11.

export type Role = 'admin' | 'staff'

export interface User {
  id: number | string
  name: string
  email: string
  /** Catatan: disimpan plain di JSON Server untuk keperluan demo Final Project. */
  password: string
  role: Role
  createdAt?: string
}

/** User tanpa password — bentuk yang aman disimpan di sesi. */
export type SafeUser = Omit<User, 'password'>

export interface Product {
  id: number | string
  name: string
  category: string
  stock: number
  price: number
  /** Ambang batas alert stok rendah (default 5). */
  lowStockThreshold: number
  createdAt?: string
  updatedAt?: string
}

export type TransactionType = 'in' | 'out'

export interface Transaction {
  id: number | string
  productId: number | string
  /** Denormalisasi nama produk agar riwayat tetap terbaca walau produk dihapus. */
  productName: string
  type: TransactionType
  quantity: number
  note?: string
  userId?: number | string
  /** Nama user pencatat (untuk tampilan). */
  createdBy: string
  createdAt: string
}
