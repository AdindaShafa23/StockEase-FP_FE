import { useAppSelector } from '@/app/hooks'
import { selectLowStockProducts } from '@/features/products/productSelectors'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'

export default function LowStockAlert() {
  // Mengambil daftar produk yang stoknya <= lowStockThreshold dari Redux
  const lowStockProducts = useAppSelector(selectLowStockProducts)

  return (
    // AnimatePresence wajib digunakan agar animasi 'exit' (saat komponen hilang) bisa berjalan
    <AnimatePresence>
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {/* Banner Alert UI */}
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 text-red-600" size={20} aria-hidden="true" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">
                  Peringatan: Stok Menipis ({lowStockProducts.length} Produk)
                </h3>
                
                <div className="mt-3 flex flex-col gap-2">
                  {lowStockProducts.map((p) => (
                    <div 
                      key={p.id} 
                      className="flex items-center justify-between rounded bg-white/60 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-slate-700">{p.name}</span>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-red-600">
                          Sisa: {p.stock}
                        </span>
                        
                        {/* Link langsung menuju form pencatatan transaksi */}
                        <Link 
                          to="/transactions/new"
                          className="flex items-center gap-1 font-medium text-red-700 hover:text-red-800 hover:underline transition-colors"
                        >
                          Restock <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}