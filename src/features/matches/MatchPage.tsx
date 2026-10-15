import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Field, FormError } from '../../components/Form'
import { api, fieldError } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { ModeratorPanel } from '../moderation/ModeratorPanel'
import { disputeCategoryLabel, matchStatusLabel, type DisputeCategory, type MatchDetail } from './types'

export function MatchPage() {
  const { matchId } = useParams()
  const detail = useQuery({ queryKey: ['match', matchId], queryFn: () => api<MatchDetail>(`/api/matches/${matchId}`) })

  if (detail.isPending) return <p>Loading…</p>
  if (detail.isError) return <FormError error={detail.error} />
  const d = detail.data
  const m = d.match
  const isPlayer = d.viewer === 'PlayerA' || d.viewer === 'PlayerB'
  const open = m.status === 'Scheduled' || m.status === 'AwaitingConfirmation'

  return (
    <section className="stack">
      <p>
        <Link to={`/seasons/${m.seasonId}`}>← {m.seasonName}</Link>
      </p>
      <span className={`badge status-${m.status}`}>{matchStatusLabel[m.status]}</span>
      <h1 className="match-title">
        <span>{m.playerA.clubName}</span>
        <span className="score">{m.status === 'Finalized' ? `${m.scoreA}–${m.scoreB}` : 'vs'}</span>
        <span>{m.playerB.clubName}</span>
      </h1>
      <p className="hint">
        Round {m.round} · play by {formatDateTime(m.deadlineAt)}
        {m.resultType && m.resultType !== 'Played' && ` · ${m.resultType}`}
        {m.replayOfMatchId && ' · replay'}
      </p>

      {isPlayer && open && <ArrangeMatch detail={d} />}
      {isPlayer && open && <ResultPanel detail={d} />}
      {isPlayer && m.status === 'Disputed' && <p className="notice">A moderator is reviewing this match. You will be notified of the decision.</p>}
      {d.viewer !== 'Public' && <History detail={d} />}
      {d.viewer === 'Moderator' && <ModeratorPanel detail={d} />}
      {isPlayer && open && <ReportProblem detail={d} />}
    </section>
  )
}

function useMatchMutation(matchId: string, send: () => Promise<MatchDetail>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: send,
    onSuccess: (updated) => {
      queryClient.setQueryData(['match', matchId], updated)
      void queryClient.invalidateQueries({ queryKey: ['my-matches'] })
      void queryClient.invalidateQueries({ queryKey: ['season-matches', updated.match.seasonId] })
    },
  })
}

function ArrangeMatch({ detail }: { detail: MatchDetail }) {
  const opponent = detail.viewer === 'PlayerA' ? detail.match.playerB : detail.match.playerA
  return (
    <div className="card">
      <h2>Arrange the match</h2>
      <p>
        Add <strong>{opponent.clubName}</strong> in eFootball with their user ID <strong className="mono">{opponent.efootballUserId ?? '—'}</strong> and play a
        Friend Match before the deadline.
      </p>
      <p className="hint">Keep screenshots of your messages: if your opponent never plays, they help a moderator decide.</p>
    </div>
  )
}

function ResultPanel({ detail }: { detail: MatchDetail }) {
  const m = detail.match
  const me = detail.viewer === 'PlayerA' ? m.playerA.userId : m.playerB.userId
  const pending = detail.submissions.find((s) => s.status === 'Pending')
  const theirs = pending && pending.submittedByUserId !== me ? pending : undefined
  const mine = pending && pending.submittedByUserId === me ? pending : undefined

  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const submit = useMatchMutation(m.id, () => {
    const form = new FormData()
    form.append('scoreA', scoreA)
    form.append('scoreB', scoreB)
    if (file) form.append('screenshot', file)
    return api<MatchDetail>(`/api/matches/${m.id}/results`, { method: 'POST', body: form })
  })
  const confirm = useMatchMutation(m.id, () => api<MatchDetail>(`/api/matches/${m.id}/results/${theirs!.id}/confirm`, { method: 'POST' }))

  return (
    <>
      {theirs && (
        <div className="card notice-success">
          <h2>Your opponent reported the score</h2>
          <p className="big-score">
            {m.playerA.clubName} {theirs.scoreA}–{theirs.scoreB} {m.playerB.clubName}
          </p>
          <EvidenceThumbs detail={detail} submissionId={theirs.id} />
          <p className="hint">If you do nothing it is confirmed automatically at {formatDateTime(theirs.confirmationDueAt)}.</p>
          <FormError error={confirm.error} />
          <button type="button" disabled={confirm.isPending} onClick={() => confirm.mutate()}>
            Confirm this score
          </button>
          <p className="hint">Wrong? Report your score below — a different score goes to a moderator — or report a problem.</p>
        </div>
      )}
      {mine && (
        <div className="card">
          <p>
            You reported{' '}
            <strong>
              {mine.scoreA}–{mine.scoreB}
            </strong>
            . Waiting for your opponent to confirm; it is confirmed automatically at {formatDateTime(mine.confirmationDueAt)}.
          </p>
        </div>
      )}
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault()
          submit.mutate()
        }}
      >
        <h2>{mine ? 'Correct your result' : 'Report the result'}</h2>
        <div className="grid-2">
          <Field label={`${m.playerA.clubName} goals`} type="number" min={0} max={99} required value={scoreA} onChange={(e) => setScoreA(e.target.value)} error={fieldError(submit.error, 'scoreA')} />
          <Field label={`${m.playerB.clubName} goals`} type="number" min={0} max={99} required value={scoreB} onChange={(e) => setScoreB(e.target.value)} error={fieldError(submit.error, 'scoreB')} />
        </div>
        <Field
          label="Screenshot of the final score"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          error={fieldError(submit.error, 'screenshot')}
          hint="JPEG, PNG or WebP, up to 5 MB. It must show both club names and the score."
        />
        {!fieldError(submit.error, 'screenshot') && <FormError error={submit.error} />}
        <button type="submit" disabled={submit.isPending}>
          {submit.isPending ? 'Sending…' : 'Submit result'}
        </button>
      </form>
    </>
  )
}

function ReportProblem({ detail }: { detail: MatchDetail }) {
  const m = detail.match
  const [show, setShow] = useState(false)
  const [category, setCategory] = useState<DisputeCategory>('Disconnect')
  const [reason, setReason] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const dispute = useMatchMutation(m.id, () => {
    const form = new FormData()
    form.append('category', category)
    form.append('reason', reason)
    if (file) form.append('screenshot', file)
    return api<MatchDetail>(`/api/matches/${m.id}/disputes`, { method: 'POST', body: form })
  })

  if (!show) {
    return (
      <button type="button" className="secondary" onClick={() => setShow(true)}>
        Report a problem with this match
      </button>
    )
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        dispute.mutate()
      }}
    >
      <h2>Report a problem</h2>
      <div className="field">
        <label htmlFor="category">What happened?</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value as DisputeCategory)}>
          {(Object.keys(disputeCategoryLabel) as DisputeCategory[]).map((c) => (
            <option key={c} value={c}>
              {disputeCategoryLabel[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="reason">Explain</label>
        <textarea id="reason" required maxLength={1000} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
        <p className="hint">For a disconnection, say the score at that moment and who disconnected.</p>
      </div>
      <Field label="Screenshot (optional)" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} error={fieldError(dispute.error, 'screenshot')} />
      <FormError error={dispute.error} />
      <button type="submit" disabled={dispute.isPending}>
        Send to a moderator
      </button>
    </form>
  )
}

export function EvidenceThumbs({ detail, submissionId, disputeId }: { detail: MatchDetail; submissionId?: string; disputeId?: string }) {
  const items = detail.evidence.filter((e) => (submissionId ? e.submissionId === submissionId : true) && (disputeId ? e.disputeId === disputeId : true))
  if (items.length === 0) return null
  return (
    <div className="thumbs">
      {items.map((e) => (
        <a key={e.id} href={`/api/evidence/${e.id}`} target="_blank" rel="noreferrer">
          <img src={`/api/evidence/${e.id}`} alt={`Evidence: ${e.kind}`} loading="lazy" />
        </a>
      ))}
    </div>
  )
}

function History({ detail }: { detail: MatchDetail }) {
  const m = detail.match
  const name = (id: string | null) => (id === m.playerA.userId ? m.playerA.clubName : id === m.playerB.userId ? m.playerB.clubName : id ? 'Staff' : 'System')
  if (detail.submissions.length === 0 && detail.disputes.length === 0) return null

  return (
    <div className="card">
      <h2>History</h2>
      <ul className="plain">
        {detail.submissions.map((s) => (
          <li key={s.id}>
            {formatDateTime(s.submittedAt)} — {name(s.submittedByUserId)} reported {s.scoreA}–{s.scoreB} <span className="hint">({s.status})</span>
            <EvidenceThumbs detail={detail} submissionId={s.id} />
          </li>
        ))}
        {detail.disputes.map((d) => (
          <li key={d.id}>
            {formatDateTime(d.openedAt)} — {name(d.openedByUserId)} opened a dispute: <strong>{disputeCategoryLabel[d.category]}</strong>. {d.reason}
            <EvidenceThumbs detail={detail} disputeId={d.id} />
            {d.decision && (
              <p>
                Decision: <strong>{d.decision}</strong> — {d.decisionNote}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
