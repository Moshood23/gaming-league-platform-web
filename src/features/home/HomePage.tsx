import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { useCurrentUser } from '../auth/useCurrentUser'

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

      {user ? (
        user.clubName ? (
          <p>
            Welcome back, <strong>{user.clubName}</strong>. Seasons are coming soon.
          </p>
        ) : (
          <p>
            Welcome! <Link to="/profile">Create your player profile</Link> so you are ready when seasons open.
          </p>
        )
      ) : (
        <p>
          <Link to="/register" className="button">
            Create an account
          </Link>
        </p>
      )}

      <p className="status" data-state={status.isPending ? 'checking' : status.isSuccess ? 'ok' : 'down'}>
        Server: {status.isPending ? 'checking…' : status.isSuccess ? 'online' : 'unavailable'}
      </p>
    </section>
  )
}
