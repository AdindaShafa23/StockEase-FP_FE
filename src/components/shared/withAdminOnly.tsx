import type { ComponentType } from 'react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Higher Order Component (Week 12).
 * Membungkus komponen agar hanya tampil untuk user dengan role 'admin'.
 *
 * Contoh: const AdminButton = withAdminOnly(DeleteButton)
 */
export function withAdminOnly<P extends object>(Component: ComponentType<P>) {
  return function AdminOnly(props: P) {
    const { user } = useAuth()
    if (user?.role !== 'admin') return null
    return <Component {...props} />
  }
}
