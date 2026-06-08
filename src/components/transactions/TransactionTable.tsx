import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Inbox, Plus } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/utils/formatters'
import type { Transaction } from '@/types'

interface TransactionTableProps {
  transactions: (Transaction & { productName: string })[]
  loading: boolean
  /** ID transaksi yang baru ditambahkan — untuk efek highlight kilasan */
  newestId?: Transaction['id'] | null
}

export default function TransactionTable({ transactions, loading, newestId }: TransactionTableProps) {
  const shouldReduce = useReducedMotion()

  if (loading) {
    return (
      <div role="status" aria-busy="true" className="p-10 text-center text-slate-500">
        Memuat riwayat transaksi...
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Riwayat transaksi barang masuk dan keluar</caption>
        <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
            <th scope="col" className="px-4 py-3 font-semibold">Produk</th>
            <th scope="col" className="px-4 py-3 font-semibold">Jenis</th>
            <th scope="col" className="px-4 py-3 font-semibold">Jumlah</th>
            <th scope="col" className="px-4 py-3 font-semibold">Catatan</th>
            <th scope="col" className="px-4 py-3 font-semibold">Pencatat</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-16">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Inbox size={28} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Belum ada transaksi</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Tidak ada data yang cocok. Coba ubah filter atau catat transaksi baru.
                    </p>
                  </div>
                  <Link to="/transactions/new" className="btn-primary mt-1">
                    <Plus size={16} aria-hidden="true" /> Catat Transaksi
                  </Link>
                </div>
              </td>
            </tr>
          ) : (
            transactions.map((t) => {
              const isNew = t.id === newestId

              return (
                /* 4.6 — Animasi row highlight kilasan saat transaksi baru ditambahkan */
                <motion.tr
                  key={t.id}
                  initial={isNew && !shouldReduce ? { backgroundColor: '#fef9c3' } : {}}
                  animate={{ backgroundColor: 'transparent' }}
                  transition={isNew && !shouldReduce ? { duration: 1.5 } : { duration: 0 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-500">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{t.productName || 'Produk Dihapus'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={t.type === 'in' ? 'green' : 'red'}>
                      {t.type === 'in' ? 'Masuk' : 'Keluar'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <span className={t.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                      {t.type === 'in' ? '+' : '−'}{t.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{t.note || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{t.createdBy}</td>
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
