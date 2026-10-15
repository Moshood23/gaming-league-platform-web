import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Field, FormError } from '../../components/Form'
import { api, fieldError } from '../../lib/api'
import { useCurrentUser } from '../auth/useCurrentUser'
import { disputeCategoryLabel, type DisputeDecision, type MatchDetail } from '../matches/types'

const decisions: { value: DisputeDecision; label: string; help: string }[] = [
  { value: 'ConfirmSubmission', label: 'A reported score is right', help: 'That score becomes the result.' },
  { value: 'SetScore', label: 'Set the score', help: 'Use when neither report is right.' },
  { value: 'Replay', label: 'Replay', help: 'Disconnect at a level score or by the leading player. The match is voided and a replay scheduled.' },
  { value: 'Forfeit', label: '3–0 against one player', help: 'Losing player disconnected, did not try to arrange the match, or broke the rules.' },
  { value: 'DoubleForfeit', label: 'Both lose', help: 'Neither player tried to arrange the match. 0–0, no points.' },
  { value: 'Void', label: 'Void', help: 'The match does not count at all.' },
]

/** Shown on the match page to the season's moderators while a dispute is open. */
export function ModeratorPanel({ detail }: { detail: MatchDetail }) {
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()
  const m = detail.match
  const dispute = detail.disputes.find((d) => d.status !== 'Resolved')
  const [decision, setDecision] = useState<DisputeDecision>('ConfirmSubmission')
  const [submissionId, setSubmissionId] = useState('')
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [loserUserId, setLoserUserId] = useState('')
  const [note, setNote] = useState('')
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['match', m.id] })

  const assign = useMutation({ mutationFn: () => api(`/api/moderation/disputes/${dispute!.id}/assign`, { method: 'POST' }), onSuccess: refresh })
  const decide = useMutation({
    mutationFn: () =>
      api(`/api/moderation/disputes/${dispute!.id}/decide`, {
        method: 'POST',
        json: {
          decision,
          note,
          submissionId: decision === 'ConfirmSubmission' ? submissionId || null : null,
          scoreA: decision === 'SetScore' ? Number(scoreA) : null,
          scoreB: decision === 'SetScore' ? Number(scoreB) : null,
          loserUserId: decision === 'Forfeit' ? loserUserId || null : null,
        },
      }),
    onSuccess: () => {
      void refresh()
      void queryClient.invalidateQueries({ queryKey: ['disputes'] })
    },
  })

  if (!dispute) return null
  const reports = detail.submissions.filter((s) => s.status !== 'Superseded')
  const club = (id: string) => (id === m.playerA.userId ? m.playerA.clubName : m.playerB.clubName)

  return (
    <form
      className="card danger"
      onSubmit={(e) => {
        e.preventDefault()
        decide.mutate()
      }}
    >
      <h2>Decide the dispute</h2>
      <p>
        <strong>{disputeCategoryLabel[dispute.category]}:</strong> {dispute.reason}
      </p>
      {dispute.assignedModeratorUserId ? (
        <p className="hint">{dispute.assignedModeratorUserId === user?.id ? 'You are handling this dispute.' : 'Another moderator has taken this dispute.'}</p>
      ) : (
        <button type="button" className="secondary" disabled={assign.isPending} onClick={() => assign.mutate()}>
          Take this dispute
        </button>
      )}

      <fieldset>
        <legend>Decision</legend>
        {decisions.map((d) => (
          <label key={d.value} className="radio">
            <input type="radio" name="decision" value={d.value} checked={decision === d.value} onChange={() => setDecision(d.value)} />
            <span>
              <strong>{d.label}</strong> <span className="hint">{d.help}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {decision === 'ConfirmSubmission' && (
        <fieldset>
          <legend>Which report is right?</legend>
          {reports.map((s) => (
            <label key={s.id} className="radio">
              <input type="radio" name="submission" value={s.id} checked={submissionId === s.id} onChange={() => setSubmissionId(s.id)} />
              <span>
                {club(s.submittedByUserId)} reported {s.scoreA}–{s.scoreB}
              </span>
            </label>
          ))}
          {reports.length === 0 && <p className="hint">Nobody reported a score; choose another decision.</p>}
          {fieldError(decide.error, 'submissionId') && <p className="field-error">{fieldError(decide.error, 'submissionId')}</p>}
        </fieldset>
      )}
      {decision === 'SetScore' && (
        <div className="grid-2">
          <Field label={`${m.playerA.clubName} goals`} type="number" min={0} max={99} required value={scoreA} onChange={(e) => setScoreA(e.target.value)} />
          <Field label={`${m.playerB.clubName} goals`} type="number" min={0} max={99} required value={scoreB} onChange={(e) => setScoreB(e.target.value)} />
        </div>
      )}
      {decision === 'Forfeit' && (
        <fieldset>
          <legend>Who loses 3–0?</legend>
          {[m.playerA, m.playerB].map((p) => (
            <label key={p.userId} className="radio">
              <input type="radio" name="loser" value={p.userId} checked={loserUserId === p.userId} onChange={() => setLoserUserId(p.userId)} />
              <span>{p.clubName}</span>
            </label>
          ))}
          {fieldError(decide.error, 'loserUserId') && <p className="field-error">{fieldError(decide.error, 'loserUserId')}</p>}
        </fieldset>
      )}

      <div className="field">
        <label htmlFor="note">Reason (both players see this)</label>
        <textarea id="note" required maxLength={1500} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <FormError error={decide.error} />
      <button type="submit" disabled={decide.isPending}>
        Record decision
      </button>
    </form>
  )
}
