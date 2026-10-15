import { Navigate, Outlet, useLocation } from 'react-router'
import { useCurrentUser } from '../features/auth/useCurrentUser'

/** Sends signed-out visitors to the login page (then back here), and hides pages from people without the role. */
export function RequireAuth({ role }: { role?: string }) {
  const { data: user, isPending } = useCurrentUser()
  const location = useLocation()

  if (isPending) {
    return <p>Loading…</p>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (role && !user.roles.includes(role)) {
    return <p>You do not have access to this page.</p>
  }
  return <Outlet />
}
