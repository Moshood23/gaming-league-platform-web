import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Field, FormError } from '../../components/Form'
import { api, ApiError, fieldError } from '../../lib/api'
import { currentUserKey } from '../auth/useCurrentUser'

interface Profile {
  clubName: string
  efootballUserId: string
  realName: string
  dateOfBirth: string
}

const empty: Profile = { clubName: '', efootballUserId: '', realName: '', dateOfBirth: '' }

export function ProfilePage() {
  const profile = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      try {
        return await api<Profile>('/api/profile')
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null
        }
        throw error
      }
    },
  })

  if (profile.isPending) {
    return <p>Loading…</p>
  }
  if (profile.isError) {
    return <FormError error={profile.error} />
  }
  return <ProfileForm initial={profile.data} />
}

function ProfileForm({ initial }: { initial: Profile | null }) {
  const [form, setForm] = useState<Profile>(initial ?? empty)
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: () => api<Profile>('/api/profile', { method: 'PUT', json: form }),
    onSuccess: (saved) => {
      setForm(saved)
      queryClient.setQueryData(['my-profile'], saved)
      void queryClient.invalidateQueries({ queryKey: currentUserKey })
    },
  })
  const set = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value })
  const hasFieldError = ['clubName', 'efootballUserId', 'realName', 'dateOfBirth'].some((f) => fieldError(save.error, f))

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate()
      }}
    >
      <h1>{initial ? 'Your player profile' : 'Create your player profile'}</h1>
      <p>Other players see your club name and eFootball ID only.</p>

      <Field label="Club (team) name" required maxLength={30} value={form.clubName} onChange={set('clubName')} error={fieldError(save.error, 'clubName')} hint="The name of your club in eFootball." />
      <Field
        label="eFootball user ID"
        required
        maxLength={30}
        value={form.efootballUserId}
        onChange={set('efootballUserId')}
        error={fieldError(save.error, 'efootballUserId')}
        hint="Opponents use this to add you as a friend."
      />

      <fieldset>
        <legend>Private — only you and staff see these</legend>
        <Field label="Real name" required autoComplete="name" maxLength={150} value={form.realName} onChange={set('realName')} error={fieldError(save.error, 'realName')} hint="Must match your bank account name to receive prizes." />
        <Field label="Date of birth" type="date" required value={form.dateOfBirth} onChange={set('dateOfBirth')} error={fieldError(save.error, 'dateOfBirth')} />
      </fieldset>

      {!hasFieldError && <FormError error={save.error} />}
      {save.isSuccess && <p className="success" role="status">Profile saved.</p>}
      <button type="submit" disabled={save.isPending}>
        {save.isPending ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  )
}
