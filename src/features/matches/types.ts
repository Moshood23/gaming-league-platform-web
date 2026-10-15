export type MatchStatus = 'AwaitingPlayers' | 'Scheduled' | 'AwaitingConfirmation' | 'Disputed' | 'Finalized' | 'Void'
export type ResultType = 'Played' | 'Forfeit' | 'DoubleForfeit' | 'DisconnectAward' | 'ModeratorDecision' | 'Bye'

export interface MatchPlayer {
  userId: string
  clubName: string
  efootballUserId: string | null
}

export interface MatchSummary {
  id: string
  seasonId: string
  seasonName: string
  round: number
  number: number
  playerA: MatchPlayer
  playerB: MatchPlayer
  deadlineAt: string
  status: MatchStatus
  resultType: ResultType | null
  scoreA: number | null
  scoreB: number | null
  winnerUserId: string | null
  replayOfMatchId: string | null
}

export const matchStatusLabel: Record<MatchStatus, string> = {
  AwaitingPlayers: 'Waiting for players',
  Scheduled: 'To play',
  AwaitingConfirmation: 'Awaiting confirmation',
  Disputed: 'Disputed',
  Finalized: 'Final',
  Void: 'Void',
}
