import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAppDispatch } from '@/app/hooks'
import { useAuth } from '@/hooks/useAuth'
import { login, clearError } from '@/features/auth/authSlice'
import { loginSchema, type LoginValues } from '@/lib/schemas'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  async function onSubmit(values: LoginValues) {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      toast.success(`Selamat datang, ${result.payload.name}!`)
      navigate('/dashboard', { replace: true })
    } else {
      toast.error((result.payload as string) ?? 'Gagal masuk.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
      <h2 className="text-center text-lg font-semibold">Masuk ke Akun Anda</h2>

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" className="input" placeholder="nama@email.com" {...field('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" className="input" placeholder="••••••" {...field('password')} />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Memproses…' : 'Masuk'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Belum punya akun?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Daftar di sini
        </Link>
      </p>
    </form>
  )
}
