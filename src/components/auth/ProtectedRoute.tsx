import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../../features/auth/store/authStore"

interface ProtectedRouteProps {
  requiredRole?: string
  excludeRole?: string
}

export function ProtectedRoute({ requiredRole, excludeRole }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && role !== requiredRole) {
    // If authenticated but don't have the required role, redirect to root/default
    return <Navigate to="/" replace />
  }

  if (excludeRole && role === excludeRole) {
    // If current role is excluded from this route
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
