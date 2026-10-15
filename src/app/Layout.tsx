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
          {user ? (
            <>
              <NavLink to="/profile">{user.clubName ?? 'Profile'}</NavLink>
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
