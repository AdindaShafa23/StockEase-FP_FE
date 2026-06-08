import { useAppSelector } from '@/app/hooks'

/**
 * Hook ringkas untuk membaca state autentikasi dari Redux.
 * Dipakai di ProtectedRoute, MainLayout, withAdminOnly, dan halaman lain.
 */
export function useAuth() {
  return useAppSelector((state) => state.auth)
}
