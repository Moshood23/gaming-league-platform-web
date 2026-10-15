import { Link } from 'react-router'
import { formatDateTime } from '../../lib/format'
import { matchStatusLabel, type MatchSummary } from './types'

function Score({ match }: { match: MatchSummary }) {
  if (match.status !== 'Finalized') {
    return <span className="vs">vs</span>
  }
  return (
    <span className="score">
      {match.scoreA}–{match.scoreB}
    </span>
  )
}

export function MatchRow({ match, me }: { match: MatchSummary; me?: string }) {
  const mine = me && (match.playerA.userId === me || match.playerB.userId === me)
  return (
    <Link to={`/matches/${match.id}`} className={`match-row${mine ? ' mine' : ''}`}>
      <span className="team">{match.playerA.clubName}</span>
      <Score match={match} />
      <span className="team right">{match.playerB.clubName}</span>
      <span className={`match-status status-${match.status}`}>
        {matchStatusLabel[match.status]}
        {match.resultType && match.resultType !== 'Played' && match.status === 'Finalized' ? ` (${match.resultType})` : ''}
      </span>
    </Link>
  )
}

/** Fixtures grouped by round, each round with its deadline. */
export function FixtureList({ matches, me }: { matches: MatchSummary[]; me?: string }) {
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b)

  return (
    <div className="stack">
      {rounds.map((round) => {
        const inRound = matches.filter((m) => m.round === round)
        return (
          <div key={round} className="card">
            <div className="round-header">
              <strong>Round {round}</strong>
              <span className="hint">Play by {formatDateTime(inRound[0].deadlineAt)}</span>
            </div>
            {inRound.map((m) => (
              <MatchRow key={m.id} match={m} me={me} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
