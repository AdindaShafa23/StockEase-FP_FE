import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useAuth } from '@/hooks/useAuth'
import { deleteProduct, setFilters, fetchProducts } from '@/features/products/productSlice'
import type { ProductFilters } from '@/features/products/productSlice'
import ProductTable from '@/components/products/ProductTable'
import ErrorBanner from '@/components/shared/ErrorBanner'
import type { Product } from '@/types'

const PAGE_SIZE = 10

/**
 * Container component (Container & Presentational Pattern, Week 12).
 * Memegang semua logika: ambil data Redux, search/filter/sort/pagination, CRUD.
 */
export default function ProductPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { products, filters, loading, error } = useAppSelector((s) => s.products)

  const [searchInput, setSearchInput] = useState(filters.search)
  const [page, setPage] = useState(1)

  // 4.6 — Highlight baris produk yang baru ditambahkan
  const [newestId, setNewestId] = useState<Product['id'] | null>(null)
  const prevLengthRef = useRef(products.length)
  useEffect(() => {
    if (products.length > prevLengthRef.current && products[0]) {
      setNewestId(products[0].id)
      const timer = setTimeout(() => setNewestId(null), 2000)
      prevLengthRef.current = products.length
      return () => clearTimeout(timer)
    }
    prevLengthRef.current = products.length
  }, [products])

  // Debounce 300ms sebelum menyimpan kata kunci ke Redux.
  useEffect(() => {
    const t = setTimeout(() => dispatch(setFilters({ search: searchInput })), 300)
    return () => clearTimeout(t)
  }, [searchInput, dispatch])

  // Reset ke halaman 1 setiap kali filter berubah.
  useEffect(() => setPage(1), [filters])

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  )

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase()
    let result = products.filter(
      (p) =>
        (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
        (filters.category ? p.category === filters.category : true),
    )
    result = [...result].sort((a, b) => {
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name)
      return (a[filters.sortBy] as number) - (b[filters.sortBy] as number)
    })
    return result
  }, [products, filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(key: ProductFilters['sortBy']) {
    dispatch(setFilters({ sortBy: key }))
  }

  function handleEdit(product: Product) {
    navigate(`/products/${product.id}/edit`)
  }

  function handleDelete(product: Product) {
    if (!confirm(`Hapus produk "${product.name}"?`)) return
    dispatch(deleteProduct(product.id))
    toast.success('Produk dihapus.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="text-sm text-slate-500">Kelola data barang inventaris</p>
        </div>
        {/* Conditional Rendering: tombol tambah hanya untuk Admin */}
        {isAdmin && (
          <button onClick={() => navigate('/products/new')} className="btn-primary">
            <Plus size={18} /> Tambah Produk
          </button>
        )}
      </div>

      {/* Search + filter kategori */}
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Cari nama atau kategori…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className="input max-w-[200px]"
          value={filters.category}
          onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && !loading ? (
        <ErrorBanner message={error} onRetry={() => dispatch(fetchProducts())} />
      ) : loading ? (
        <div role="status" aria-busy="true" className="card py-10 text-center text-slate-400">
          Memuat produk…
        </div>
      ) : (
        <ProductTable
          products={paged}
          sortBy={filters.sortBy}
          onSort={handleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
          newestId={newestId}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Menampilkan {paged.length} dari {filtered.length} produk
          </span>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary px-2 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              className="btn-secondary px-2 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
