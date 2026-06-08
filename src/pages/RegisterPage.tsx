import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAppDispatch } from '@/app/hooks'
import { useAuth } from '@/hooks/useAuth'
import { register as registerThunk, clearError } from '@/features/auth/authSlice'
import { registerSchema, type RegisterValues } from '@/lib/schemas'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading } = useAuth()

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'staff' },
  })

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  async function onSubmit(values: RegisterValues) {
    const result = await dispatch(
      registerThunk({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      }),
    )
    if (registerThunk.fulfilled.match(result)) {
      toast.success('Akun berhasil dibuat!')
      navigate('/dashboard', { replace: true })
    } else {
      toast.error((result.payload as string) ?? 'Gagal mendaftar.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
      <h2 className="text-center text-lg font-semibold">Buat Akun Baru</h2>

      <div>
        <label className="label" htmlFor="name">Nama Lengkap</label>
        <input id="name" className="input" {...field('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" className="input" {...field('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" {...field('password')} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">Konfirmasi</label>
          <input id="confirmPassword" type="password" className="input" {...field('confirmPassword')} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="role">Peran (Role)</label>
        <select id="role" className="input" {...field('role')}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Memproses…' : 'Daftar'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  )
}
