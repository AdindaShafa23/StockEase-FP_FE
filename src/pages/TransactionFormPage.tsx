import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useAuth } from '@/hooks/useAuth'
import { submitTransaction } from '@/features/transactions/transactionSlice'
import { fetchProducts } from '@/features/products/productSlice'

const transactionSchema = z.object({
  productId: z.string().min(1, 'Pilih produk terlebih dahulu'),
  type: z.enum(['in', 'out']),
  quantity: z.number().min(1, 'Jumlah harus lebih dari 0').max(9999),
  note: z.string().optional(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

export default function TransactionFormPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { products } = useAppSelector((s) => s.products)
  const { loading: submitting } = useAppSelector((s) => s.transactions)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'in',
      quantity: 1,
      note: '',
      date: new Date().toISOString().split('T')[0], 
    },
  })

  // Pantau nilai produk untuk menampilkan stok
  const selectedProductId = watch('productId')
  const selectedProduct = products.find((p) => String(p.id) === selectedProductId)

  // Fetch produk jika belum ada di state global
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts())
    }
  }, [dispatch, products.length])

  // Handler Submit Form
  const onSubmit = async (data: TransactionFormValues) => {
    if (!selectedProduct) return

    // Validasi stok keluar sebelum di-dispatch ke Thunk
    if (data.type === 'out' && data.quantity > selectedProduct.stock) {
      setError('quantity', { 
        type: 'manual', 
        message: `Stok tidak cukup. Tersedia ${selectedProduct.stock}.` 
      })
      return
    }

    try {
      await dispatch(
        submitTransaction({
          productId: data.productId,
          productName: selectedProduct.name,
          type: data.type,
          quantity: data.quantity,
          note: data.note?.trim(),
          userId: user?.id ?? 'unknown-user',
          createdBy: user?.name ?? 'Tidak diketahui',
        })
      ).unwrap()

      toast.success('Transaksi tersimpan.')
      navigate('/transactions')
    } catch (err: any) {
      toast.error(err || 'Gagal menyimpan transaksi.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catat Transaksi</h1>
        <p className="text-sm text-slate-500">Tambah barang masuk atau keluar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card max-w-lg space-y-4">
        
        {/* Produk */}
        <div>
          <label className="label">Produk</label>
          <select 
            className="input" 
            {...register('productId')}
          >
            <option value="">-- Pilih produk --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (stok: {p.stock})
              </option>
            ))}
          </select>
          {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId.message}</p>}
          
          {selectedProduct && (
            <p className="mt-1 text-xs text-slate-500">Stok saat ini: {selectedProduct.stock}</p>
          )}
        </div>

        {/* Tanggal */}
        <div>
          <label className="label">Tanggal</label>
          <input 
            type="date" 
            className="input" 
            {...register('date')} 
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
        </div>

        {/* Jenis Transaksi */}
        <div>
          <label className="label">Jenis</label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
               <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => field.onChange('in')}
                  className={`btn flex items-center justify-center gap-2 ${field.value === 'in' ? 'bg-emerald-600 text-white' : 'btn-secondary'}`}
                >
                  <ArrowDownToLine size={16} /> Masuk
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('out')}
                  className={`btn flex items-center justify-center gap-2 ${field.value === 'out' ? 'bg-red-600 text-white' : 'btn-secondary'}`}
                >
                  <ArrowUpFromLine size={16} /> Keluar
                </button>
              </div>
            )}
          />
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
        </div>

        {/* Jumlah (Diperbaiki dengan valueAsNumber) */}
        <div>
          <label className="label">Jumlah</label>
          <input 
            type="number" 
            min={1} 
            className="input" 
            {...register('quantity', { valueAsNumber: true })} 
          />
          {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
        </div>

        {/* Catatan */}
        <div>
          <label className="label">Catatan (opsional)</label>
          <input 
            className="input" 
            {...register('note')} 
            placeholder="mis. Restock mingguan" 
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => navigate('/transactions')} className="btn-secondary">
            Batal
          </button>
          <button type="submit" className="btn-primary" disabled={submitting || products.length === 0}>
            {submitting ? 'Menyimpan…' : 'Simpan Transaksi'}
          </button>
        </div>
        
        {products.length === 0 && (
          <p className="text-xs text-slate-400">Tambahkan produk dulu di menu Produk.</p>
        )}
      </form>
    </div>
  )
}