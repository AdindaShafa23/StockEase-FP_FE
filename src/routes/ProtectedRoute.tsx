import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  /** Bila true, hanya Admin yang boleh masuk; Staff diarahkan ke /dashboard. */
  requireAdmin?: boolean
}

/**
 * Route guard berbasis Redux (PRD F1.4 & Week 10).
 * Membaca isAuthenticated dari authSlice via useSelector (useAuth).
 */
export default function ProtectedRoute({ requireAdmin = false }: Props) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
