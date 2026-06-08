import { AlertCircle, RotateCcw } from 'lucide-react'

interface Props {
  message: string
  /** Opsional: tombol coba lagi (mis. dispatch ulang thunk fetch). */
  onRetry?: () => void
}

/**
 * Banner error reusable untuk menampilkan kegagalan API ke pengguna.
 * Sebelumnya error hanya tersimpan di Redux tanpa pernah ditampilkan.
 */
export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm shadow-card"
    >
      <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold text-red-800">Terjadi kesalahan</p>
        <p className="mt-0.5 text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          <RotateCcw size={14} aria-hidden="true" /> Coba lagi
        </button>
      )}
    </div>
  )
}
