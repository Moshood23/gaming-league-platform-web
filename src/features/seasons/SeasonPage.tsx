import { useParams } from 'react-router'
import { FormError } from '../../components/Form'
import { JoinPanel } from '../registrations/JoinPanel'
import { formatDateTime, formatNaira } from '../../lib/format'
import { PrizeTable } from './PrizeSummary'
import { prizeHeadline, useSeason } from './seasonUtils'
import { statusLabel } from './types'

export function SeasonPage() {
  const { seasonId } = useParams()
  const season = useSeason(seasonId)

  if (season.isPending) return <p>Loading…</p>
  if (season.isError) return <FormError error={season.error} />
  const s = season.data

  return (
    <section className="stack">
      <span className={`badge badge-${s.status}`}>{statusLabel[s.status]}</span>
      <h1>
        {s.competitionName} — {s.name}
      </h1>
      {s.cancelledReason && <p className="form-error">Cancelled: {s.cancelledReason}. Everyone who paid is refunded.</p>}
      <JoinPanel season={s} />

      <dl className="facts">
        <dt>Entry fee</dt>
        <dd>{s.entryFeeKobo === 0 ? 'Free' : formatNaira(s.entryFeeKobo)}</dd>
        <dt>Prize</dt>
        <dd>{prizeHeadline(s)}</dd>
        <dt>Players</dt>
        <dd>
          {s.confirmedPlayers} joined · {s.minPlayers}–{s.maxPlayers} needed
        </dd>
        <dt>Age</dt>
        <dd>{s.minAge}+</dd>
        <dt>Registration closes</dt>
        <dd>{formatDateTime(s.registrationClosesAt)}</dd>
        <dt>First round starts</dt>
        <dd>{formatDateTime(s.startsAt)}</dd>
        <dt>Each round</dt>
        <dd>{s.roundLengthHours} hours to play</dd>
        <dt>Points</dt>
        <dd>
          Win {s.pointsForWin} · Draw {s.pointsForDraw} · Loss {s.pointsForLoss}
        </dd>
      </dl>

      <h2>Prize split</h2>
      <p className="hint">The split depends on how many players pay. The exact amounts are published when registration closes.</p>
      <PrizeTable season={s} />

      <h2>Key rules</h2>
      <ul>
        <li>Everyone plays everyone once. Arrange each match with your opponent before the round deadline.</li>
        <li>Upload a screenshot of the final score. Your opponent confirms; results not answered within {s.confirmationWindowHours} hours are confirmed automatically.</li>
        <li>Disconnect at a level score, or by the player who is winning: replay. The losing player disconnects: the other player wins 3–0.</li>
        <li>Did not try to arrange your match: 3–0 loss. Neither player tried: both lose.</li>
        <li>Full refund if you withdraw before registration closes or the season is cancelled.</li>
      </ul>
    </section>
  )
}
