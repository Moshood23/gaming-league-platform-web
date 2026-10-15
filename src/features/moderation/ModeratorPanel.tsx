import type { MatchDetail } from '../matches/types'

/** Moderator decisions are added in the disputes step. */
export function ModeratorPanel({ detail }: { detail: MatchDetail }) {
  return detail.disputes.some((d) => d.status !== 'Resolved') ? <p className="hint">Open dispute — decide it from the moderation queue.</p> : null
}
