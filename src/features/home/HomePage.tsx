import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'

function useServerStatus() {
  return useQuery({
    queryKey: ['server-status'],
    queryFn: async () => {
      await apiFetch('/health/ready')
      return true
    },
    retry: false,
  })
}

export function HomePage() {
  const status = useServerStatus()

  return (
    <main className="page">
      <h1>Gaming League</h1>
      <p>Online eFootball leagues. Coming soon.</p>
      <p className="status" data-state={status.isPending ? 'checking' : status.isSuccess ? 'ok' : 'down'}>
        Server: {status.isPending ? 'checking…' : status.isSuccess ? 'online' : 'unavailable'}
      </p>
    </main>
  )
}
