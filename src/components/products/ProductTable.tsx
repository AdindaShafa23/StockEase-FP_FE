import { motion, useReducedMotion } from 'framer-motion'
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { withAdminOnly } from '@/components/shared/withAdminOnly'
import { formatRupiah } from '@/utils/formatters'
import type { Product } from '@/types'
import type { ProductFilters } from '@/features/products/productSlice'

/**
 * Presentational component (Container & Presentational Pattern, Week 12).
 * Murni menampilkan data — semua logika ada di ProductPage (container).
 * Dev 3: Tambahkan row highlight animation (Framer Motion, tugas 4.6).
 */
interface Props {
  products: Product[]
  sortBy: ProductFilters['sortBy']
  onSort: (key: ProductFilters['sortBy']) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  /** ID produk yang baru ditambahkan — untuk efek highlight kilasan */
  newestId?: Product['id'] | null
}

/** Aksi Edit/Hapus dibungkus HOC withAdminOnly — Staff tidak melihatnya. */
const AdminActions = withAdminOnly(
  ({ product, onEdit, onDelete }: { product: Product; onEdit: Props['onEdit']; onDelete: Props['onDelete'] }) => (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => onEdit(product)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        title="Edit"
        aria-label={`Edit produk ${product.name}`}
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
      <button
        onClick={() => onDelete(product)}
        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
        title="Hapus"
        aria-label={`Hapus produk ${product.name}`}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  ),
)

function SortHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 ${active ? 'text-brand-700' : ''}`}>
      {label}
      <ArrowUpDown size={13} />
    </button>
  )
}

export default function ProductTable({ products, sortBy, onSort, onEdit, onDelete, newestId }: Props) {
  const shouldReduce = useReducedMotion()

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <caption className="sr-only">Daftar produk inventaris beserta kategori, stok, harga, dan aksi</caption>
        <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              <SortHeader label="Nama" active={sortBy === 'name'} onClick={() => onSort('name')} />
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">Kategori</th>
            <th scope="col" className="px-4 py-3 font-semibold">
              <SortHeader label="Stok" active={sortBy === 'stock'} onClick={() => onSort('stock')} />
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              <SortHeader label="Harga" active={sortBy === 'price'} onClick={() => onSort('price')} />
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                Tidak ada produk yang cocok.
              </td>
            </tr>
          ) : (
            products.map((p) => {
              const low = p.stock <= p.lowStockThreshold
              const isNew = p.id === newestId

              return (
                /* 4.6 — Animasi row highlight kilasan saat produk baru ditambahkan */
                <motion.tr
                  key={p.id}
                  initial={isNew && !shouldReduce ? { backgroundColor: '#fef9c3' } : {}}
                  animate={{ backgroundColor: 'transparent' }}
                  transition={isNew && !shouldReduce ? { duration: 1.5 } : { duration: 0 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone="slate">{p.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {/* Conditional Rendering: badge merah saat stok menipis */}
                    <Badge tone={low ? 'red' : 'green'}>
                      {p.stock} {low && '• menipis'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{formatRupiah(p.price)}</td>
                  <td className="px-4 py-3">
                    <AdminActions product={p} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
