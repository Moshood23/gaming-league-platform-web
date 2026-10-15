import { useQuery } from '@tanstack/react-query'
import { FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { useCurrentUser } from '../auth/useCurrentUser'
import { FixtureList } from '../matches/FixtureList'
import { StandingsTable } from '../standings/StandingsTable'
import type { MatchSummary } from '../matches/types'
import type { SeasonStatus } from './types'

export function SeasonFixtures({ seasonId, status }: { seasonId: string; status: SeasonStatus }) {
  const { data: user } = useCurrentUser()
  const hasFixtures = status === 'Active' || status === 'Completed'
  const matches = useQuery({
    queryKey: ['season-matches', seasonId],
    queryFn: () => api<MatchSummary[]>(`/api/seasons/${seasonId}/matches`),
    enabled: hasFixtures,
  })

  if (!hasFixtures) {
    return null
  }

  return (
    <>
      <StandingsTable seasonId={seasonId} />
      <h2>Fixtures</h2>
      <FormError error={matches.error} />
      {matches.data && <FixtureList matches={matches.data} me={user?.id} />}
    </>
  )
}
