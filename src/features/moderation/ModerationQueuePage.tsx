import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { disputeCategoryLabel, type DisputeCategory } from '../matches/types'

interface QueueItem {
  disputeId: string
  matchId: string
  seasonName: string
  round: number
  clubA: string
  clubB: string
  category: DisputeCategory
  reason: string
  status: 'Open' | 'UnderReview' | 'Resolved'
  openedAt: string
  openedBySystem: boolean
}

export function ModerationQueuePage() {
  const [includeResolved, setIncludeResolved] = useState(false)
  const queue = useQuery({
    queryKey: ['disputes', includeResolved],
    queryFn: () => api<QueueItem[]>(`/api/moderation/disputes?includeResolved=${includeResolved}`),
  })

  return (
    <section className="stack">
      <h1>Disputes</h1>
      <label className="radio">
        <input type="checkbox" checked={includeResolved} onChange={(e) => setIncludeResolved(e.target.checked)} />
        <span>Show decided disputes too</span>
      </label>
      <FormError error={queue.error} />
      {queue.data?.length === 0 && <p>Nothing to review. 🎉</p>}
      {queue.data?.map((d) => (
        <Link key={d.disputeId} to={`/matches/${d.matchId}`} className="card card-link">
          <span className={`badge status-${d.status === 'Resolved' ? 'Finalized' : 'Disputed'}`}>{d.status}</span>
          <strong>
            {d.clubA} vs {d.clubB}
          </strong>
          <span>
            {disputeCategoryLabel[d.category]}
            {d.openedBySystem ? ' (automatic)' : ''}: {d.reason}
          </span>
          <span className="hint">
            {d.seasonName} · round {d.round} · opened {formatDateTime(d.openedAt)}
          </span>
        </Link>
      ))}
    </section>
  )
}
