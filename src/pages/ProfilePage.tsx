import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, Shield, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch } from '@/app/hooks'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/features/auth/authSlice'
import Badge from '@/components/ui/Badge'

interface InfoCardProps {
  icon: React.ElementType
  label: string
  value?: string
  capitalize?: boolean
}

/** Kartu detail akun — bentuknya selaras dengan kartu ringkasan di Dashboard. */
function InfoCard({ icon: Icon, label, value, capitalize }: InfoCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p
          className={`truncate font-semibold text-slate-900 ${capitalize ? 'capitalize' : ''}`}
          title={value}
        >
          {value ?? '-'}
        </p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleLogout() {
    dispatch(logout())
    toast.success('Anda telah keluar.')
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-sm text-slate-500">Informasi akun Anda</p>
      </div>

      {/* Hero — lebar penuh */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="h-24 bg-gradient-to-br from-brand-500 to-brand-700" />
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {/* Hanya avatar yang menumpuk banner; nama tetap di area putih */}
              <div className="-mt-12 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-lg ring-4 ring-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 pb-1">
                <p className="truncate text-xl font-bold text-slate-900">{user?.name}</p>
                <Badge tone={user?.role === 'admin' ? 'green' : 'slate'} className="mt-1.5 capitalize">
                  <Shield size={12} aria-hidden="true" /> {user?.role}
                </Badge>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary text-red-600 hover:bg-red-50 hover:text-red-700 hover:ring-red-200"
            >
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Detail akun — grid kartu */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard icon={UserIcon} label="Nama" value={user?.name} />
        <InfoCard icon={Mail} label="Email" value={user?.email} />
        <InfoCard icon={Shield} label="Peran" value={user?.role} capitalize />
      </div>
    </div>
  )
}
