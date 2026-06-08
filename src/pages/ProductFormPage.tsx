import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addProduct, updateProduct } from '@/features/products/productSlice'
import { productSchema, type ProductInput, type ProductValues } from '@/lib/schemas'
import Modal from '@/components/ui/Modal'
import type { Product } from '@/types'

export default function ProductFormPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const existing = useAppSelector((s) => s.products.products.find((p) => String(p.id) === id))

  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput, unknown, ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', category: '', stock: 0, price: 0, lowStockThreshold: 5 },
  })

  // Prefill saat data produk (edit) tersedia.
  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        category: existing.category,
        stock: existing.stock,
        price: existing.price,
        lowStockThreshold: existing.lowStockThreshold,
      })
    }
  }, [existing, reset])

  function close() {
    navigate('/products')
  }

  function onSubmit(values: ProductValues) {
    try {
      if (isEdit && existing) {
        const updated: Product = {
          ...existing,
          ...values,
          updatedAt: new Date().toISOString(),
        }
        dispatch(updateProduct(updated))
        toast.success('Produk diperbarui.')
      } else {
        const now = new Date().toISOString()
        const created: Product = {
          ...values,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        }
        dispatch(addProduct(created))
        toast.success('Produk ditambahkan.')
      }
      close()
    } catch {
      toast.error('Gagal menyimpan produk.')
    }
  }

  return (
    <Modal open onClose={close}>
      <Modal.Header onClose={close}>{isEdit ? 'Edit Produk' : 'Tambah Produk'}</Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div>
            <label className="label">Nama Produk</label>
            <input className="input" {...field('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Kategori</label>
            <input className="input" placeholder="mis. Sembako" {...field('category')} />
            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stok</label>
              <input type="number" min={0} className="input" {...field('stock')} />
              {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
            </div>
            <div>
              <label className="label">Harga (Rp)</label>
              <input type="number" min={0} className="input" {...field('price')} />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Ambang Stok Rendah</label>
            <input type="number" min={0} className="input" {...field('lowStockThreshold')} />
            {errors.lowStockThreshold && (
              <p className="mt-1 text-xs text-red-600">{errors.lowStockThreshold.message}</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" onClick={close} className="btn-secondary">
            Batal
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : 'Simpan'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
