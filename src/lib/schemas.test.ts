import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, productSchema } from './schemas'

/**
 * Acceptance Criteria yang dibuktikan:
 *  - AC#1 Validasi form login & register (React Hook Form + Zod).
 *  - AC#3 Validasi input produk (stok/harga tidak negatif).
 */
describe('loginSchema', () => {
  it('menerima email & password valid', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123456' }).success).toBe(true)
  })

  it('menolak email tidak valid', () => {
    const res = loginSchema.safeParse({ email: 'bukan-email', password: '123456' })
    expect(res.success).toBe(false)
  })

  it('menolak password < 6 karakter', () => {
    const res = loginSchema.safeParse({ email: 'a@b.com', password: '123' })
    expect(res.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    name: 'Budi',
    email: 'budi@toko.com',
    password: '123456',
    confirmPassword: '123456',
    role: 'staff' as const,
  }

  it('menerima data registrasi valid', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('menolak bila konfirmasi password tidak cocok', () => {
    const res = registerSchema.safeParse({ ...valid, confirmPassword: 'beda99' })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues[0].path).toContain('confirmPassword')
    }
  })

  it('menolak role di luar admin/staff', () => {
    const res = registerSchema.safeParse({ ...valid, role: 'superuser' })
    expect(res.success).toBe(false)
  })
})

describe('productSchema', () => {
  it('meng-coerce string angka menjadi number', () => {
    const res = productSchema.safeParse({
      name: 'Kopi',
      category: 'Minuman',
      stock: '15',
      price: '2000',
      lowStockThreshold: '5',
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.stock).toBe(15)
      expect(typeof res.data.price).toBe('number')
    }
  })

  it('menolak stok negatif', () => {
    const res = productSchema.safeParse({
      name: 'Kopi',
      category: 'Minuman',
      stock: '-1',
      price: '2000',
      lowStockThreshold: '5',
    })
    expect(res.success).toBe(false)
  })

  it('menolak nama produk kosong', () => {
    const res = productSchema.safeParse({
      name: '',
      category: 'Minuman',
      stock: '10',
      price: '2000',
      lowStockThreshold: '5',
    })
    expect(res.success).toBe(false)
  })
})
