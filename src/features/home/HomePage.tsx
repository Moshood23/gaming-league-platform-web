import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { useCurrentUser } from '../auth/useCurrentUser'
import { MyMatches } from '../matches/MyMatches'

function useServerStatus() {
  return useQuery({
    queryKey: ['server-status'],
    queryFn: async () => {
      await fetch('/health/ready').then((r) => {
        if (!r.ok) throw new Error('unavailable')
      })
      return true
    },
  })
}

export function HomePage() {
  const status = useServerStatus()
  const { data: user } = useCurrentUser()

  return (
    <section>
      <h1>Online eFootball leagues</h1>
      <p>Join a season, play your fixtures on eFootball mobile, and compete for the prize.</p>

      {user && <MyMatches />}

      {user ? (
        user.clubName ? (
          <p>
            Welcome back, <strong>{user.clubName}</strong>. <Link to="/seasons">See the seasons</Link>.
          </p>
        ) : (
          <p>
            Welcome! <Link to="/profile">Create your player profile</Link> so you are ready when seasons open.
          </p>
        )
      ) : (
        <p className="row">
          <Link to="/register" className="button">
            Create an account
          </Link>
          <Link to="/seasons" className="button secondary">
            See the seasons
          </Link>
        </p>
      )}

      <p className="status" data-state={status.isPending ? 'checking' : status.isSuccess ? 'ok' : 'down'}>
        Server: {status.isPending ? 'checking…' : status.isSuccess ? 'online' : 'unavailable'}
      </p>
    </section>
  )
}
