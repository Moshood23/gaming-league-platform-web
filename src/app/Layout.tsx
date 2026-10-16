import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { useSession } from '../features/auth/useSession'
import { useNotifications } from '../features/notifications/useNotifications'

function NotificationBell() {
  const { data } = useNotifications()
  const unread = data?.unreadCount ?? 0
  return (
    <NavLink to="/notifications" className="bell" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
      🔔{unread > 0 && <span className="count">{unread > 99 ? '99+' : unread}</span>}
    </NavLink>
  )
}

export function Layout() {
  const { data: user } = useCurrentUser()
  const session = useSession()
  const navigate = useNavigate()

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">
          Gaming League
        </Link>
        <nav>
          <NavLink to="/seasons">Seasons</NavLink>
          {import.meta.env.DEV && <NavLink to="/dev">Dev tools</NavLink>}
          {user?.roles.some((r) => r === 'Moderator' || r === 'Administrator') && <NavLink to="/moderation">Disputes</NavLink>}
          {user?.roles.includes('Administrator') && <NavLink to="/admin/seasons">Admin</NavLink>}
          {user ? (
            <>
              <NotificationBell />
              <NavLink to="/profile" className="nav-club">
                {user.clubName ?? 'Profile'}
              </NavLink>
              <button
                type="button"
                className="link-button"
                onClick={async () => {
                  await session.logout()
                  navigate('/')
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Sign up</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
