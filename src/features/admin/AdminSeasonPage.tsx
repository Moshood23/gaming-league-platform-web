import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Field, FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { formatDateTime, formatNaira } from '../../lib/format'
import { PrizeTable } from '../seasons/PrizeSummary'
import { prizeHeadline } from '../seasons/seasonUtils'
import { statusLabel, type Season } from '../seasons/types'
import { SeasonForm, type SeasonSettingsInput } from './SeasonForm'

interface Staff {
  userId: string
  email: string
  role: 'Organizer' | 'Moderator'
}

export function AdminSeasonPage() {
  const { seasonId } = useParams()
  const queryClient = useQueryClient()
  const key = ['admin-season', seasonId]
  const season = useQuery({ queryKey: key, queryFn: () => api<Season>(`/api/admin/seasons/${seasonId}`) })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-season', seasonId] })

  const update = useMutation({
    mutationFn: (input: SeasonSettingsInput) => api<Season>(`/api/admin/seasons/${seasonId}`, { method: 'PUT', json: input }),
    onSuccess: (s) => queryClient.setQueryData(key, s),
  })
  const open = useMutation({
    mutationFn: () => api<Season>(`/api/admin/seasons/${seasonId}/open-registration`, { method: 'POST' }),
    onSuccess: (s) => queryClient.setQueryData(key, s),
  })
  const [reason, setReason] = useState('')
  const cancel = useMutation({
    mutationFn: () => api(`/api/admin/seasons/${seasonId}/cancel`, { method: 'POST', json: { reason } }),
    onSuccess: refresh,
  })

  if (season.isPending) return <p>Loading…</p>
  if (season.isError) return <FormError error={season.error} />
  const s = season.data

  return (
    <section className="stack">
      <p>
        <Link to="/admin/seasons">← All seasons</Link>
      </p>
      <span className={`badge badge-${s.status}`}>{statusLabel[s.status]}</span>
      <h1>
        {s.competitionName} — Season {s.seasonNumber}: {s.name}
      </h1>

      {s.status === 'Draft' ? (
        <>
          <SeasonForm key={JSON.stringify(s)} season={s} submitLabel="Save changes" pending={update.isPending} error={update.error} onSubmit={(input) => update.mutate(input)} />
          <div className="card">
            <h2>Open registration</h2>
            <p>Players can then see the season and join. The fee, prize, split and rules are locked for good.</p>
            <FormError error={open.error} />
            <button
              type="button"
              disabled={open.isPending}
              onClick={() => {
                if (confirm('Open registration? The settings cannot be changed afterwards.')) open.mutate()
              }}
            >
              Open registration
            </button>
          </div>
        </>
      ) : (
        <div className="card">
          <dl className="facts">
            <dt>Entry fee</dt>
            <dd>{formatNaira(s.entryFeeKobo)}</dd>
            <dt>Prize</dt>
            <dd>{prizeHeadline(s)}</dd>
            <dt>Players</dt>
            <dd>
              {s.confirmedPlayers} / {s.minPlayers}–{s.maxPlayers}
            </dd>
            <dt>Registration</dt>
            <dd>
              {formatDateTime(s.registrationOpensAt)} → {formatDateTime(s.registrationClosesAt)}
            </dd>
            <dt>Starts</dt>
            <dd>{formatDateTime(s.startsAt)}</dd>
          </dl>
          <PrizeTable season={s} />
          {s.cancelledReason && <p className="form-error">Cancelled: {s.cancelledReason}</p>}
        </div>
      )}

      {s.status !== 'Draft' && s.status !== 'Cancelled' && s.status !== 'Completed' && <StaffPanel seasonId={s.id} />}

      {s.status !== 'Cancelled' && s.status !== 'Completed' && (
        <form
          className="card danger"
          onSubmit={(e) => {
            e.preventDefault()
            if (confirm('Cancel this season? Every player who paid is refunded.')) cancel.mutate()
          }}
        >
          <h2>Cancel season</h2>
          <Field label="Reason (shown to players)" required maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          <FormError error={cancel.error} />
          <button type="submit" className="danger" disabled={cancel.isPending}>
            Cancel season
          </button>
        </form>
      )}
    </section>
  )
}

function StaffPanel({ seasonId }: { seasonId: string }) {
  const queryClient = useQueryClient()
  const staff = useQuery({ queryKey: ['season-staff', seasonId], queryFn: () => api<Staff[]>(`/api/admin/seasons/${seasonId}/staff`) })
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Staff['role']>('Moderator')
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['season-staff', seasonId] })
  const assign = useMutation({
    mutationFn: async () => {
      const user = await api<{ id: string }>(`/api/admin/users?email=${encodeURIComponent(email)}`)
      await api(`/api/admin/seasons/${seasonId}/staff`, { method: 'POST', json: { userId: user.id, role } })
    },
    onSuccess: () => {
      setEmail('')
      void refresh()
    },
  })
  const remove = useMutation({
    mutationFn: (m: Staff) => api(`/api/admin/seasons/${seasonId}/staff/${m.userId}/${m.role}`, { method: 'DELETE' }),
    onSuccess: refresh,
  })

  return (
    <div className="card">
      <h2>Season staff</h2>
      <ul className="plain">
        {staff.data?.map((m) => (
          <li key={`${m.userId}-${m.role}`}>
            {m.email} — {m.role}{' '}
            <button type="button" className="link-button" onClick={() => remove.mutate(m)}>
              Remove
            </button>
          </li>
        ))}
        {staff.data?.length === 0 && <li className="hint">No staff assigned yet.</li>}
      </ul>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          assign.mutate()
        }}
      >
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} hint="They need the matching role first (Users page)." />
        <div className="field">
          <label htmlFor="staffRole">Role</label>
          <select id="staffRole" value={role} onChange={(e) => setRole(e.target.value as Staff['role'])}>
            <option value="Moderator">Moderator</option>
            <option value="Organizer">Organizer</option>
          </select>
        </div>
        <FormError error={assign.error ?? remove.error} />
        <button type="submit" disabled={assign.isPending}>
          Assign
        </button>
      </form>
    </div>
  )
}
