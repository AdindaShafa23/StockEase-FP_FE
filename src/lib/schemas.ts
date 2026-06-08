import { z } from 'zod'

/** Skema validasi form — dipakai bersama React Hook Form via zodResolver. */

export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
    role: z.enum(['admin', 'staff']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
export type RegisterValues = z.infer<typeof registerSchema>

export const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  stock: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  lowStockThreshold: z.coerce.number().min(0, 'Ambang batas tidak boleh negatif'),
})
/** Tipe input form (sebelum coerce) & output (setelah coerce ke number). */
export type ProductInput = z.input<typeof productSchema>
export type ProductValues = z.output<typeof productSchema>
