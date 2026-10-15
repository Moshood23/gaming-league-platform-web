import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { Field, FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { AdminNav } from './AdminNav'
import { formatNaira } from '../../lib/format'
import { statusLabel, type SeasonSummary } from '../seasons/types'

interface Competition {
  id: string
  name: string
  description: string | null
  seasons: number
}

export function AdminSeasonsPage() {
  const queryClient = useQueryClient()
  const competitions = useQuery({ queryKey: ['admin-competitions'], queryFn: () => api<Competition[]>('/api/admin/competitions') })
  const seasons = useQuery({ queryKey: ['admin-seasons'], queryFn: () => api<SeasonSummary[]>('/api/admin/seasons') })
  const [name, setName] = useState('')
  const create = useMutation({
    mutationFn: () => api('/api/admin/competitions', { method: 'POST', json: { name } }),
    onSuccess: () => {
      setName('')
      void queryClient.invalidateQueries({ queryKey: ['admin-competitions'] })
    },
  })

  return (
    <section className="stack">
      <AdminNav />
      <h1>Competitions and seasons</h1>

      {competitions.data?.map((c) => (
        <div key={c.id} className="card">
          <strong>{c.name}</strong>
          <ul className="plain">
            {seasons.data
              ?.filter((s) => s.competitionId === c.id)
              .map((s) => (
                <li key={s.id}>
                  <Link to={`/admin/seasons/${s.id}`}>
                    Season {s.seasonNumber}: {s.name}
                  </Link>{' '}
                  <span className={`badge badge-${s.status}`}>{statusLabel[s.status]}</span>{' '}
                  <span className="hint">
                    {formatNaira(s.entryFeeKobo)} · {s.confirmedPlayers}/{s.maxPlayers}
                  </span>
                </li>
              ))}
          </ul>
          <Link to={`/admin/competitions/${c.id}/new-season`} className="button secondary">
            New season
          </Link>
        </div>
      ))}
      <FormError error={competitions.error ?? seasons.error} />

      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault()
          create.mutate()
        }}
      >
        <h2>New competition</h2>
        <Field label="Name" required maxLength={150} value={name} onChange={(e) => setName(e.target.value)} hint='For example "Lagos eFootball League". Seasons are added to it.' />
        <FormError error={create.error} />
        <button type="submit" disabled={create.isPending}>
          Create competition
        </button>
      </form>
    </section>
  )
}
