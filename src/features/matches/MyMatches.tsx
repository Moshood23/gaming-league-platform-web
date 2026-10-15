import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useCurrentUser } from '../auth/useCurrentUser'
import { MatchRow } from './FixtureList'
import type { MatchSummary } from './types'

/** The signed-in player's matches still to play or settle. */
export function MyMatches() {
  const { data: user } = useCurrentUser()
  const matches = useQuery({ queryKey: ['my-matches'], queryFn: () => api<MatchSummary[]>('/api/me/matches') })
  const open = matches.data?.filter((m) => m.status !== 'Finalized' && m.status !== 'Void') ?? []

  if (open.length === 0) {
    return null
  }

  return (
    <div className="card">
      <h2>Your matches</h2>
      {open.map((m) => (
        <MatchRow key={m.id} match={m} me={user?.id} />
      ))}
    </div>
  )
}
