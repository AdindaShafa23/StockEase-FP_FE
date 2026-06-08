import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary (React class component — satu-satunya cara menangkap error render).
 * Mencegah seluruh aplikasi blank/crash saat sebuah komponen melempar error,
 * dan menampilkan fallback UI yang ramah pengguna.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Di produksi, ganti dengan layanan logging (mis. Sentry).
    console.error('ErrorBoundary menangkap error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertOctagon size={32} />
          </div>
          <h1 className="mt-6 text-xl font-semibold text-slate-800">Terjadi kesalahan</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Maaf, terjadi kesalahan tak terduga pada aplikasi. Silakan muat ulang halaman.
          </p>
          <button onClick={this.handleReload} className="btn-primary mt-6">
            <RotateCcw size={18} /> Muat Ulang Halaman
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
