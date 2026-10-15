import { formatNaira, ordinal } from '../../lib/format'
import type { Season } from './types'

/** The published prize tiers: which split applies for how many players. */
export function PrizeTable({ season }: { season: Season }) {
  const tiers = [...new Set(season.prizeTiers.map((t) => t.tierMinPlayers))].sort((a, b) => a - b)

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Players</th>
          <th>Prize split</th>
        </tr>
      </thead>
      <tbody>
        {tiers.map((min, i) => {
          const next = tiers[i + 1]
          const shares = season.prizeTiers.filter((t) => t.tierMinPlayers === min).sort((a, b) => a.position - b.position)
          const applied = season.appliedPrizeTier === min
          return (
            <tr key={min} className={applied ? 'highlight' : undefined}>
              <td>
                {next ? `${min}–${next - 1}` : `${min}+`}
                {applied && ' (applies)'}
              </td>
              <td>
                {shares
                  .map((s) => `${ordinal(s.position)} ${s.percent}%${s.amountKobo != null ? ` (${formatNaira(s.amountKobo)})` : ''}`)
                  .join(', ')}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
