import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Package,
  Boxes,
  AlertTriangle,
  ArrowLeftRight,
  ShoppingCart,
} from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectLowStockProducts, selectTotalStock } from '@/features/products/productSelectors'
import {
  selectTodayTransactionCount,
  selectWeeklyTransactions,
} from '@/features/transactions/transactionSelectors'
import LowStockAlert from '@/components/shared/LowStockAlert'
import { getLast7Days, sameDay, formatDayLabel } from '@/utils/dateHelpers'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899']

function SkeletonCard() {
  return (
    <div className="card flex animate-pulse items-center gap-4">
      <div className="h-12 w-12 rounded-lg bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-1/2 rounded bg-slate-200" />
        <div className="h-3 w-3/4 rounded bg-slate-200" />
      </div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ElementType
  colorClass: string
}
function SummaryCard({ title, value, icon: Icon, colorClass }: SummaryCardProps) {
  return (
    <div className="card flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className={`rounded-xl p-3 ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{title}</p>
      </div>
    </div>
  )
}

// ─── Stagger variants — Framer Motion (tugas 4.1) ─────────────────────────────
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const shouldReduce = useReducedMotion()

  // Selector dari Redux (sesuai arahan PDF Dev 3 section 4.1)
  const products = useAppSelector((s) => s.products.products)
  const productsLoading = useAppSelector((s) => s.products.loading)
  const totalStock = useAppSelector(selectTotalStock)
  const lowStockProducts = useAppSelector(selectLowStockProducts)
  const todayCount = useAppSelector(selectTodayTransactionCount)
  const weeklyTx = useAppSelector(selectWeeklyTransactions)

  // ─── Kartu Ringkasan ────────────────────────────────────────────────────────
  const cards = [
    { title: 'Total Produk', value: products.length, icon: Package, colorClass: 'bg-blue-100 text-blue-600' },
    { title: 'Total Stok', value: totalStock, icon: Boxes, colorClass: 'bg-emerald-100 text-emerald-600' },
    { title: 'Transaksi Hari Ini', value: todayCount, icon: ArrowLeftRight, colorClass: 'bg-violet-100 text-violet-600' },
    { title: 'Produk Stok Rendah', value: lowStockProducts.length, icon: AlertTriangle, colorClass: 'bg-amber-100 text-amber-600' },
  ]

  // ─── Grafik 1: Stok per Kategori (Pie Chart) ────────────────────────────────
  const categoryChartData = useMemo(() => {
    const stockByCategory = products.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + p.stock
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(stockByCategory).map(([category, stock]) => ({ category, stock }))
  }, [products])

  // ─── Grafik 2: Transaksi Mingguan (Line Chart, tugas 4.2) ───────────────────
  const dailyData = useMemo(() => {
    return getLast7Days().map((date) => ({
      date: formatDayLabel(date),
      masuk: weeklyTx.filter((t) => sameDay(t.createdAt, date) && t.type === 'in').length,
      keluar: weeklyTx.filter((t) => sameDay(t.createdAt, date) && t.type === 'out').length,
    }))
  }, [weeklyTx])

  const top5LowStock = useMemo(
    () => [...lowStockProducts].sort((a, b) => a.stock - b.stock).slice(0, 5),
    [lowStockProducts],
  )

  const hasNoProducts = !productsLoading && products.length === 0
  const hasNoTransactions = !productsLoading && weeklyTx.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan inventaris &amp; pergerakan stok</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {productsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                initial={shouldReduce ? false : 'hidden'}
                animate="visible"
                variants={cardVariants}
              >
                <SummaryCard {...card} />
              </motion.div>
            ))}
      </div>

      <AnimatePresence>
        {lowStockProducts.length > 0 && <LowStockAlert />}
      </AnimatePresence>

      {hasNoProducts && (
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col items-center justify-center gap-4 py-16 text-center"
        >
          <Package size={48} className="text-slate-300" />
          <div>
            <p className="font-semibold text-slate-600">Belum ada produk</p>
            <p className="mt-1 text-sm text-slate-400">
              Mulai dengan menambahkan produk pertama ke inventaris.
            </p>
          </div>
          <Link to="/products/new" className="btn-primary">
            Tambah Produk Pertama
          </Link>
        </motion.div>
      )}

      {!hasNoProducts && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 font-semibold">Stok per Kategori</h2>
            {categoryChartData.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">Belum ada data kategori.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="stock"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {categoryChartData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} unit`, 'Stok']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 font-semibold">Transaksi Mingguan</h2>
            {hasNoTransactions ? (
              <p className="py-12 text-center text-sm text-slate-400">
                Belum ada transaksi dalam 7 hari terakhir.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dailyData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="masuk"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Masuk"
                  />
                  <Line
                    type="monotone"
                    dataKey="keluar"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Keluar"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {top5LowStock.length > 0 && (
        <div className="card">
          <h2 className="mb-4 font-semibold">Top 5 Produk Stok Terendah</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Produk</th>
                  <th className="px-4 py-3 font-semibold">Stok</th>
                  <th className="px-4 py-3 font-semibold">Threshold</th>
                  <th className="px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {top5LowStock.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-red-600">{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.lowStockThreshold}</td>
                    <td className="px-4 py-3">
                      <Link
                        to="/transactions/new"
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition"
                      >
                        <ShoppingCart size={13} />
                        Restock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
