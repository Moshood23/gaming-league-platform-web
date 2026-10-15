export type SeasonStatus = 'Draft' | 'RegistrationOpen' | 'RegistrationClosed' | 'Active' | 'Completed' | 'Cancelled'
export type PrizeModel = 'Fixed' | 'PercentageOfPool'

export interface PrizeShare {
  tierMinPlayers: number
  position: number
  percent: number
  amountKobo?: number | null
}

export interface SeasonSummary {
  id: string
  competitionId: string
  competitionName: string
  seasonNumber: number
  name: string
  status: SeasonStatus
  entryFeeKobo: number
  prizeModel: PrizeModel
  fixedPrizeKobo: number | null
  prizePoolPercent: number | null
  prizeFundKobo: number | null
  minPlayers: number
  maxPlayers: number
  confirmedPlayers: number
  registrationClosesAt: string
  startsAt: string
}

export interface Season extends SeasonSummary {
  minAge: number
  pointsForWin: number
  pointsForDraw: number
  pointsForLoss: number
  tiebreakOrder: string
  roundLengthHours: number
  confirmationWindowHours: number
  registrationOpensAt: string | null
  endsAt: string | null
  appliedPrizeTier: number | null
  cancelledReason: string | null
  prizeTiers: PrizeShare[]
}

export const statusLabel: Record<SeasonStatus, string> = {
  Draft: 'Draft',
  RegistrationOpen: 'Registration open',
  RegistrationClosed: 'Registration closed',
  Active: 'In progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}
