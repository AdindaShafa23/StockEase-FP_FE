import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RotateCcw } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchTransactions } from '@/features/transactions/transactionSlice'
import { fetchProducts } from '@/features/products/productSlice'
import type { TransactionType } from '@/types'

import TransactionTable from '@/components/transactions/TransactionTable'
import ErrorBanner from '@/components/shared/ErrorBanner'

export default function TransactionPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { transactions, loading, error } = useAppSelector((s) => s.transactions)
  const { products } = useAppSelector((s) => s.products)

  const [newestId, setNewestId] = useState<string | number | null>(null)
  const prevLengthRef = useRef(transactions.length)
  useEffect(() => {
    if (transactions.length > prevLengthRef.current && transactions[0]) {
      setNewestId(transactions[0].id)
      const timer = setTimeout(() => setNewestId(null), 2000)
      prevLengthRef.current = transactions.length
      return () => clearTimeout(timer)
    }
    prevLengthRef.current = transactions.length
  }, [transactions])

  const [filterType, setFilterType] = useState<'all' | TransactionType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    dispatch(fetchTransactions())
    if (products.length === 0) {
      dispatch(fetchProducts())
    }
  }, [dispatch, products.length])

  const filteredTransactions = useMemo(() => {
    return transactions
      .map((t) => {
        const product = products.find((p) => String(p.id) === String(t.productId))
        return { ...t, productName: product?.name ?? t.productName ?? 'Produk Dihapus' }
      })
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false

        if (searchQuery && t.productName) {
          if (!t.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false
        }

        if (startDate) {
          if (new Date(t.createdAt) < new Date(startDate)) return false
        }
        if (endDate) {
          const end = new Date(endDate)
          end.setDate(end.getDate() + 1)
          if (new Date(t.createdAt) >= end) return false
        }

        return true
      })
  }, [transactions, products, filterType, searchQuery, startDate, endDate])

  const handleResetFilter = () => {
    setFilterType('all')
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-sm text-slate-500">Riwayat pergerakan stok barang masuk &amp; keluar</p>
        </div>
        <button onClick={() => navigate('/transactions/new')} className="btn-primary">
          <Plus size={18} /> Catat Transaksi
        </button>
      </div>

      {/* Main Card */}
      <div className="card overflow-hidden p-0">

        {/* Toolbar Filter */}
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/50 p-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Search Box */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama produk…"
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="input w-auto"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | TransactionType)}
            >
              <option value="all">Semua Jenis</option>
              <option value="in">Barang Masuk</option>
              <option value="out">Barang Keluar</option>
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input w-auto"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                className="input w-auto"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button
              onClick={handleResetFilter}
              className="btn-secondary"
              title="Reset Filter"
            >
              <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {error && !loading ? (
          <div className="p-4">
            <ErrorBanner message={error} onRetry={() => dispatch(fetchTransactions())} />
          </div>
        ) : (
          <TransactionTable transactions={filteredTransactions} loading={loading} newestId={newestId} />
        )}
      </div>
    </div>
  )
}