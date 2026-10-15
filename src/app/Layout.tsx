import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { useSession } from '../features/auth/useSession'

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
          {user?.roles.includes('Administrator') && <NavLink to="/admin/seasons">Admin</NavLink>}
          {user ? (
            <>
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
