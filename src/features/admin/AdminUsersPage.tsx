import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Field, FormError } from '../../components/Form'
import { api } from '../../lib/api'

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
    </section>
  )
}
