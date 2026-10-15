import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { formatDateTime, formatNaira, ordinal } from '../../lib/format'
import { AdminNav } from './AdminNav'

interface AdminPayout {
  id: string
  seasonId: string
  seasonName: string
  clubName: string
  realName: string | null
  position: number
  amountKobo: number
  status: string
  bankName: string | null
  accountLast4: string | null
  accountName: string | null
  nameMatchesProfile: boolean | null
  attempts: number
  failureReason: string | null
  createdAt: string
}

export function AdminPayoutsPage() {
  const [status, setStatus] = useState('PendingApproval')
  const payouts = useQuery({
    queryKey: ['admin-payouts', status],
    queryFn: () => api<AdminPayout[]>(`/api/admin/payouts${status ? `?status=${status}` : ''}`),
  })

  return (
    <section className="stack">
      <AdminNav />
      <h1>Prize payouts</h1>
      <div className="field">
        <label htmlFor="status">Show</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PendingApproval">Waiting for approval</option>
          <option value="AwaitingAccount">Waiting for the winner's bank account</option>
          <option value="Failed">Failed</option>
          <option value="Sent">Sent, not yet confirmed</option>
          <option value="Succeeded">Paid</option>
          <option value="">All</option>
        </select>
      </div>
      <FormError error={payouts.error} />
      {payouts.data?.length === 0 && <p className="hint">Nothing here.</p>}
      {payouts.data?.map((p) => (
        <PayoutCard key={p.id} payout={p} />
      ))}
    </section>
  )
}

function PayoutCard({ payout: p }: { payout: AdminPayout }) {
  const queryClient = useQueryClient()
  const [confirmMismatch, setConfirmMismatch] = useState(false)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-payouts'] })
  const approve = useMutation({
    mutationFn: () => api(`/api/admin/payouts/${p.id}/approve`, { method: 'POST', json: { confirmNameMismatch: confirmMismatch } }),
    onSuccess: refresh,
  })
  const retry = useMutation({ mutationFn: () => api(`/api/admin/payouts/${p.id}/retry`, { method: 'POST' }), onSuccess: refresh })

  return (
    <div className="card">
      <strong>
        {formatNaira(p.amountKobo)} to {p.clubName} ({ordinal(p.position)})
      </strong>
      <span className="hint">
        <Link to={`/admin/seasons/${p.seasonId}`}>{p.seasonName}</Link> · created {formatDateTime(p.createdAt)} · {p.status}
      </span>
      <dl className="facts">
        <dt>Real name</dt>
        <dd>{p.realName ?? '—'}</dd>
        <dt>Bank account</dt>
        <dd>{p.bankName ? `${p.bankName} ••••${p.accountLast4} — ${p.accountName}` : 'Not added yet'}</dd>
      </dl>
      {p.nameMatchesProfile === false && <p className="form-error">The bank name does not clearly match the real name. Check before approving.</p>}
      {p.failureReason && <p className="hint">Last error: {p.failureReason}</p>}
      <FormError error={approve.error ?? retry.error} />
      {p.status === 'PendingApproval' && (
        <>
          {p.nameMatchesProfile === false && (
            <label className="radio">
              <input type="checkbox" checked={confirmMismatch} onChange={(e) => setConfirmMismatch(e.target.checked)} />
              <span>I have checked: this account belongs to the winner</span>
            </label>
          )}
          <button
            type="button"
            disabled={approve.isPending}
            onClick={() => {
              if (confirm(`Send ${formatNaira(p.amountKobo)} to ${p.accountName}?`)) approve.mutate()
            }}
          >
            Approve and pay
          </button>
        </>
      )}
      {p.status === 'Failed' && (
        <button type="button" className="secondary" disabled={retry.isPending} onClick={() => retry.mutate()}>
          Retry payment
        </button>
      )}
    </div>
  )
}
