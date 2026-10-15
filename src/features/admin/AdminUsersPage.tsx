import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Field, FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

interface AdminUser {
  id: string
  email: string
  emailConfirmed: boolean
  status: string
  roles: string[]
}

const staffRoles = ['Organizer', 'Moderator', 'Administrator']

export function AdminUsersPage() {
  const [email, setEmail] = useState('')
  const find = useMutation({ mutationFn: () => api<AdminUser>(`/api/admin/users?email=${encodeURIComponent(email)}`) })
  const change = useMutation({
    mutationFn: ({ role, grant }: { role: string; grant: boolean }) =>
      api(`/api/admin/users/${find.data!.id}/roles/${role}`, { method: grant ? 'PUT' : 'DELETE', json: grant ? {} : undefined }),
    onSuccess: () => find.mutate(),
  })
  const user = find.data

  return (
    <section className="stack">
      <h1>Users and roles</h1>
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault()
          find.mutate()
        }}
      >
        <Field label="Find by email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormError error={find.error} />
        <button type="submit" disabled={find.isPending}>
          Find
        </button>
      </form>

      {user && (
        <div className="card">
          <strong>{user.email}</strong>
          <span className="hint">
            {user.emailConfirmed ? 'Email confirmed' : 'Email not confirmed'} · {user.status}
          </span>
          <ul className="plain">
            {staffRoles.map((role) => {
              const has = user.roles.includes(role)
              return (
                <li key={role}>
                  {role}: {has ? 'yes' : 'no'}{' '}
                  <button type="button" className="link-button" disabled={change.isPending} onClick={() => change.mutate({ role, grant: !has })}>
                    {has ? 'Remove' : 'Grant'}
                  </button>
                </li>
              )
            })}
          </ul>
          <FormError error={change.error} />
        </div>
      )}
      {user && <UserActionsPanel userId={user.id} onChange={() => find.mutate()} />}
    </section>
  )
}

interface UserAction {
  id: string
  actionType: 'Warning' | 'Suspension' | 'Ban'
  reason: string
  endsAt: string | null
  createdAt: string
  revokedAt: string | null
  revokeReason: string | null
  active: boolean
}

function UserActionsPanel({ userId, onChange }: { userId: string; onChange: () => void }) {
  const queryClient = useQueryClient()
  const key = ['user-actions', userId]
  const actions = useQuery({ queryKey: key, queryFn: () => api<UserAction[]>(`/api/moderation/users/${userId}/actions`) })
  const [type, setType] = useState<UserAction['actionType']>('Warning')
  const [reason, setReason] = useState('')
  const [days, setDays] = useState('7')
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key })
    onChange()
  }
  const take = useMutation({
    mutationFn: () =>
      api(`/api/moderation/users/${userId}/actions`, {
        method: 'POST',
        json: { actionType: type, reason, endsAt: type === 'Suspension' ? new Date(Date.now() + Number(days) * 864e5).toISOString() : null },
      }),
    onSuccess: () => {
      setReason('')
      refresh()
    },
  })
  const revoke = useMutation({
    mutationFn: (id: string) => api(`/api/moderation/actions/${id}/revoke`, { method: 'POST', json: { reason: prompt('Reason for lifting this?') ?? '' } }),
    onSuccess: refresh,
  })

  return (
    <div className="card">
      <h2>Warnings, suspensions and bans</h2>
      <ul className="plain">
        {actions.data?.map((a) => (
          <li key={a.id}>
            <strong>{a.actionType}</strong> {formatDateTime(a.createdAt)} — {a.reason}
            {a.endsAt && <span className="hint"> (until {formatDateTime(a.endsAt)})</span>}
            {a.revokedAt ? (
              <span className="hint"> — lifted: {a.revokeReason}</span>
            ) : (
              a.actionType !== 'Warning' && (
                <>
                  {' '}
                  <button type="button" className="link-button" onClick={() => revoke.mutate(a.id)}>
                    Lift
                  </button>
                </>
              )
            )}
          </li>
        ))}
        {actions.data?.length === 0 && <li className="hint">No actions on record.</li>}
      </ul>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          take.mutate()
        }}
      >
        <div className="field">
          <label htmlFor="actionType">Action</label>
          <select id="actionType" value={type} onChange={(e) => setType(e.target.value as UserAction['actionType'])}>
            <option value="Warning">Warning</option>
            <option value="Suspension">Suspension</option>
            <option value="Ban">Ban</option>
          </select>
        </div>
        {type === 'Suspension' && <Field label="Days" type="number" min={1} max={365} required value={days} onChange={(e) => setDays(e.target.value)} />}
        <Field label="Reason (kept on record)" required maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} />
        <FormError error={take.error ?? revoke.error} />
        <button type="submit" className={type === 'Ban' ? 'danger' : undefined} disabled={take.isPending}>
          Record {type.toLowerCase()}
        </button>
      </form>
    </div>
  )
}
