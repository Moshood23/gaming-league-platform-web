import { useQuery } from '@tanstack/react-query'
import { FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { useCurrentUser } from '../auth/useCurrentUser'

interface StandingRow {
  userId: string
  clubName: string
  position: number
  isTied: boolean
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  forfeits: number
  disqualified: boolean
  form: string
}

interface Standings {
  isFinal: boolean
  championUserId: string | null
  rows: StandingRow[]
}

export function StandingsTable({ seasonId }: { seasonId: string }) {
  const { data: user } = useCurrentUser()
  const standings = useQuery({ queryKey: ['standings', seasonId], queryFn: () => api<Standings>(`/api/seasons/${seasonId}/standings`) })

  if (standings.isError) return <FormError error={standings.error} />
  if (!standings.data) return null
  const s = standings.data
  const champion = s.rows.find((r) => r.userId === s.championUserId)

  return (
    <>
      {s.isFinal && (
        <div className="card champion">
          {champion ? (
            <>
              <span className="trophy" aria-hidden>
                🏆
              </span>
              <strong>{champion.clubName} are the champions!</strong>
            </>
          ) : (
            <strong>The season ended with first place shared.</strong>
          )}
        </div>
      )}
      <h2>{s.isFinal ? 'Final table' : 'Table'}</h2>
      <div className="table-scroll">
        <table className="table standings">
          <thead>
            <tr>
              <th>#</th>
              <th>Club</th>
              <th title="Played">P</th>
              <th className="wide" title="Won">W</th>
              <th className="wide" title="Drawn">D</th>
              <th className="wide" title="Lost">L</th>
              <th title="Goal difference">GD</th>
              <th title="Points">Pts</th>
              <th className="wide">Form</th>
            </tr>
          </thead>
          <tbody>
            {s.rows.map((r) => (
              <tr key={r.userId} className={r.userId === user?.id ? 'mine' : undefined}>
                <td>
                  {r.position}
                  {r.isTied ? '=' : ''}
                </td>
                <td>
                  {r.clubName}
                  {r.disqualified && <span className="hint"> (disqualified)</span>}
                </td>
                <td>{r.played}</td>
                <td className="wide">{r.won}</td>
                <td className="wide">{r.drawn}</td>
                <td className="wide">{r.lost}</td>
                <td>{r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}</td>
                <td>
                  <strong>{r.points}</strong>
                </td>
                <td className="wide form">
                  {[...r.form].map((c, i) => (
                    <span key={i} className={`form-${c}`}>
                      {c}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">Order: points, goal difference, goals scored, head-to-head, fewest forfeits. "=" means a shared position.</p>
    </>
  )
}
