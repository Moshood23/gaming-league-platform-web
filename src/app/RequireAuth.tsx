import { Navigate, Outlet, useLocation } from 'react-router'
import { useCurrentUser } from '../features/auth/useCurrentUser'

/** Sends signed-out visitors to the login page, then back here afterwards. */
export function RequireAuth() {
  const { data: user, isPending } = useCurrentUser()
  const location = useLocation()

  if (isPending) {
    return <p>Loading…</p>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
