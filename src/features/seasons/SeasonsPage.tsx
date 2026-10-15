import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { formatDateTime, formatNaira } from '../../lib/format'
import { prizeHeadline } from './seasonUtils'
import { statusLabel, type SeasonSummary } from './types'

export function SeasonsPage() {
  const seasons = useQuery({ queryKey: ['seasons'], queryFn: () => api<SeasonSummary[]>('/api/seasons') })

  return (
    <section className="stack">
      <h1>Seasons</h1>
      {seasons.isPending && <p>Loading…</p>}
      <FormError error={seasons.error} />
      {seasons.data?.length === 0 && <p>No seasons yet. Check back soon.</p>}
      {seasons.data?.map((s) => (
        <Link key={s.id} to={`/seasons/${s.id}`} className="card card-link">
          <span className={`badge badge-${s.status}`}>{statusLabel[s.status]}</span>
          <strong>
            {s.competitionName} — {s.name}
          </strong>
          <span>
            Entry {s.entryFeeKobo === 0 ? 'free' : formatNaira(s.entryFeeKobo)} · {prizeHeadline(s)}
          </span>
          <span className="hint">
            {s.confirmedPlayers}/{s.maxPlayers} players ·{' '}
            {s.status === 'RegistrationOpen' ? `closes ${formatDateTime(s.registrationClosesAt)}` : `starts ${formatDateTime(s.startsAt)}`}
          </span>
        </Link>
      ))}
    </section>
  )
}
