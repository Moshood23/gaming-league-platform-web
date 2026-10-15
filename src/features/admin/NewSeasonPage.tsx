import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { api } from '../../lib/api'
import type { Season } from '../seasons/types'
import { SeasonForm, type SeasonSettingsInput } from './SeasonForm'

export function NewSeasonPage() {
  const { competitionId } = useParams()
  const navigate = useNavigate()
  const create = useMutation({
    mutationFn: (input: SeasonSettingsInput) => api<Season>(`/api/admin/competitions/${competitionId}/seasons`, { method: 'POST', json: input }),
    onSuccess: (season) => navigate(`/admin/seasons/${season.id}`),
  })

  return (
    <section className="stack">
      <h1>New season (draft)</h1>
      <p className="hint">Nothing is public until you open registration. After that the fee, prize and rules cannot be changed.</p>
      <SeasonForm submitLabel="Save draft" pending={create.isPending} error={create.error} onSubmit={(input) => create.mutate(input)} />
    </section>
  )
}
