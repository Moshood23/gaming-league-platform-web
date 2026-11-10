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

export type Viewer = 'Public' | 'PlayerA' | 'PlayerB' | 'Moderator'
export type DisputeCategory = 'WrongScore' | 'Disconnect' | 'NoShow' | 'AccountSharing' | 'Other'
export type DisputeDecision = 'ConfirmSubmission' | 'SetScore' | 'Replay' | 'Forfeit' | 'DoubleForfeit' | 'Void'

export interface Submission {
  id: string
  submittedByUserId: string
  scoreA: number
  scoreB: number
  status: 'Pending' | 'Confirmed' | 'AutoConfirmed' | 'Disputed' | 'Superseded'
  submittedAt: string
  confirmationDueAt: string
}

/** What the automatic check read from an end-of-match screenshot (home = the team on the left). */
export interface ScreenshotCheck {
  status: 'NotChecked' | 'Pending' | 'Matches' | 'ScoreMismatch' | 'NotAScoreScreen' | 'Unreadable' | 'Failed'
  homeClub: string | null
  awayClub: string | null
  homeScore: number | null
  awayScore: number | null
}

export interface Evidence {
  id: string
  uploadedByUserId: string
  kind: 'FinalScore' | 'Disconnect' | 'ContactAttempt' | 'Other'
  createdAt: string
  submissionId: string | null
  disputeId: string | null
  check: ScreenshotCheck
}

export interface Dispute {
  id: string
  openedByUserId: string | null
  category: DisputeCategory
  reason: string
  status: 'Open' | 'UnderReview' | 'Resolved'
  assignedModeratorUserId: string | null
  decision: DisputeDecision | null
  decisionNote: string | null
  openedAt: string
  resolvedAt: string | null
}

export interface MatchDetail {
  match: MatchSummary
  viewer: Viewer
  confirmationWindowHours: number
  submissions: Submission[]
  evidence: Evidence[]
  disputes: Dispute[]
}

export const disputeCategoryLabel: Record<DisputeCategory, string> = {
  WrongScore: 'Wrong score',
  Disconnect: 'Disconnection',
  NoShow: 'Opponent did not play',
  AccountSharing: 'Someone else played',
  Other: 'Something else',
}
