import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { formatNaira } from '../../lib/format'
import type { Season, SeasonSummary } from './types'

export function prizeHeadline(season: SeasonSummary): string {
  if (season.prizeFundKobo != null) {
    return `${formatNaira(season.prizeFundKobo)} prize fund`
  }
  if (season.prizeModel === 'Fixed') {
    return season.fixedPrizeKobo ? `${formatNaira(season.fixedPrizeKobo)} prize` : 'No cash prize'
  }
  return `${season.prizePoolPercent}% of entry fees`
}

export function useSeason(seasonId: string | undefined) {
  return useQuery({ queryKey: ['season', seasonId], queryFn: () => api<Season>(`/api/seasons/${seasonId}`), enabled: !!seasonId })
}
