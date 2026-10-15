import { useState } from 'react'
import { Field, FormError } from '../../components/Form'
import { fieldError } from '../../lib/api'
import { toLocalInput } from '../../lib/format'
import type { PrizeModel, PrizeShare, Season } from '../seasons/types'

export interface SeasonSettingsInput {
  name: string
  entryFeeKobo: number
  minPlayers: number
  maxPlayers: number
  minAge: number
  prizeModel: PrizeModel
  fixedPrizeKobo: number | null
  prizePoolPercent: number | null
  pointsForWin: number
  pointsForDraw: number
  pointsForLoss: number
  roundLengthHours: number
  confirmationWindowHours: number
  registrationClosesAt: string
  startsAt: string
  prizeTiers: PrizeShare[]
}

const defaultTiers: PrizeShare[] = [
  { tierMinPlayers: 2, position: 1, percent: 100 },
  { tierMinPlayers: 10, position: 1, percent: 70 },
  { tierMinPlayers: 10, position: 2, percent: 30 },
  { tierMinPlayers: 16, position: 1, percent: 60 },
  { tierMinPlayers: 16, position: 2, percent: 25 },
  { tierMinPlayers: 16, position: 3, percent: 15 },
]

interface FormState {
  name: string
  entryFeeNaira: string
  minPlayers: string
  maxPlayers: string
  minAge: string
  prizeModel: PrizeModel
  fixedPrizeNaira: string
  prizePoolPercent: string
  pointsForWin: string
  pointsForDraw: string
  pointsForLoss: string
  roundLengthHours: string
  confirmationWindowHours: string
  registrationClosesAt: string
  startsAt: string
  prizeTiers: PrizeShare[]
}

function initialState(season?: Season): FormState {
  const inAWeek = new Date(Date.now() + 7 * 864e5).toISOString()
  const inEightDays = new Date(Date.now() + 8 * 864e5).toISOString()
  return {
    name: season?.name ?? '',
    entryFeeNaira: season ? String(season.entryFeeKobo / 100) : '2000',
    minPlayers: String(season?.minPlayers ?? 8),
    maxPlayers: String(season?.maxPlayers ?? 20),
    minAge: String(season?.minAge ?? 18),
    prizeModel: season?.prizeModel ?? 'PercentageOfPool',
    fixedPrizeNaira: season?.fixedPrizeKobo != null ? String(season.fixedPrizeKobo / 100) : '0',
    prizePoolPercent: String(season?.prizePoolPercent ?? 70),
    pointsForWin: String(season?.pointsForWin ?? 3),
    pointsForDraw: String(season?.pointsForDraw ?? 1),
    pointsForLoss: String(season?.pointsForLoss ?? 0),
    roundLengthHours: String(season?.roundLengthHours ?? 48),
    confirmationWindowHours: String(season?.confirmationWindowHours ?? 24),
    registrationClosesAt: toLocalInput(season?.registrationClosesAt ?? inAWeek),
    startsAt: toLocalInput(season?.startsAt ?? inEightDays),
    prizeTiers: season?.prizeTiers.map(({ tierMinPlayers, position, percent }) => ({ tierMinPlayers, position, percent })) ?? defaultTiers,
  }
}

function toInput(f: FormState): SeasonSettingsInput {
  const kobo = (naira: string) => Math.round(Number(naira) * 100)
  return {
    name: f.name,
    entryFeeKobo: kobo(f.entryFeeNaira),
    minPlayers: Number(f.minPlayers),
    maxPlayers: Number(f.maxPlayers),
    minAge: Number(f.minAge),
    prizeModel: f.prizeModel,
    fixedPrizeKobo: f.prizeModel === 'Fixed' ? kobo(f.fixedPrizeNaira) : null,
    prizePoolPercent: f.prizeModel === 'PercentageOfPool' ? Number(f.prizePoolPercent) : null,
    pointsForWin: Number(f.pointsForWin),
    pointsForDraw: Number(f.pointsForDraw),
    pointsForLoss: Number(f.pointsForLoss),
    roundLengthHours: Number(f.roundLengthHours),
    confirmationWindowHours: Number(f.confirmationWindowHours),
    registrationClosesAt: new Date(f.registrationClosesAt).toISOString(),
    startsAt: new Date(f.startsAt).toISOString(),
    prizeTiers: f.prizeTiers,
  }
}

interface Props {
  season?: Season
  submitLabel: string
  pending: boolean
  error: unknown
  onSubmit: (input: SeasonSettingsInput) => void
}

export function SeasonForm({ season, submitLabel, pending, error, onSubmit }: Props) {
  const [f, setF] = useState<FormState>(() => initialState(season))
  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [key]: e.target.value })
  const setTier = (i: number, key: keyof PrizeShare, value: string) =>
    setF({ ...f, prizeTiers: f.prizeTiers.map((t, j) => (j === i ? { ...t, [key]: Number(value) } : t)) })

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(toInput(f))
      }}
    >
      <Field label="Season name" required maxLength={150} value={f.name} onChange={set('name')} error={fieldError(error, 'name')} />
      <div className="grid-2">
        <Field label="Entry fee (₦)" type="number" min={0} step="0.01" required value={f.entryFeeNaira} onChange={set('entryFeeNaira')} hint="0 for a free season." />
        <Field label="Minimum age" type="number" min={13} max={100} required value={f.minAge} onChange={set('minAge')} hint="18+ for paid seasons." />
        <Field label="Minimum players" type="number" min={2} max={20} required value={f.minPlayers} onChange={set('minPlayers')} />
        <Field label="Maximum players" type="number" min={2} max={20} required value={f.maxPlayers} onChange={set('maxPlayers')} />
      </div>

      <div className="field">
        <label htmlFor="prizeModel">Prize</label>
        <select id="prizeModel" value={f.prizeModel} onChange={set('prizeModel')}>
          <option value="PercentageOfPool">A share of all entry fees</option>
          <option value="Fixed">A fixed amount</option>
        </select>
      </div>
      {f.prizeModel === 'Fixed' ? (
        <Field label="Prize amount (₦)" type="number" min={0} step="0.01" required value={f.fixedPrizeNaira} onChange={set('fixedPrizeNaira')} />
      ) : (
        <Field
          label="Prize share of entry fees (%)"
          type="number"
          min={1}
          max={100}
          step="0.01"
          required
          value={f.prizePoolPercent}
          onChange={set('prizePoolPercent')}
          hint={`The platform keeps ${Math.max(0, 100 - Number(f.prizePoolPercent || 0))}%, which must cover payment fees.`}
        />
      )}

      <fieldset>
        <legend>Prize tiers — the split used depends on how many players pay</legend>
        <table className="table">
          <thead>
            <tr>
              <th>From players</th>
              <th>Position</th>
              <th>%</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {f.prizeTiers.map((t, i) => (
              <tr key={i}>
                <td>
                  <input aria-label="From players" type="number" min={2} value={t.tierMinPlayers} onChange={(e) => setTier(i, 'tierMinPlayers', e.target.value)} />
                </td>
                <td>
                  <input aria-label="Position" type="number" min={1} value={t.position} onChange={(e) => setTier(i, 'position', e.target.value)} />
                </td>
                <td>
                  <input aria-label="Percent" type="number" min={0.01} max={100} step="0.01" value={t.percent} onChange={(e) => setTier(i, 'percent', e.target.value)} />
                </td>
                <td>
                  <button type="button" className="link-button" onClick={() => setF({ ...f, prizeTiers: f.prizeTiers.filter((_, j) => j !== i) })}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="secondary" onClick={() => setF({ ...f, prizeTiers: [...f.prizeTiers, { tierMinPlayers: 2, position: 1, percent: 100 }] })}>
          Add row
        </button>
      </fieldset>

      <div className="grid-3">
        <Field label="Points for a win" type="number" min={1} max={10} required value={f.pointsForWin} onChange={set('pointsForWin')} />
        <Field label="Draw" type="number" min={0} required value={f.pointsForDraw} onChange={set('pointsForDraw')} />
        <Field label="Loss" type="number" min={0} required value={f.pointsForLoss} onChange={set('pointsForLoss')} />
      </div>
      <div className="grid-2">
        <Field label="Hours per round" type="number" min={12} max={336} required value={f.roundLengthHours} onChange={set('roundLengthHours')} />
        <Field label="Hours to confirm a result" type="number" min={1} max={72} required value={f.confirmationWindowHours} onChange={set('confirmationWindowHours')} />
        <Field label="Registration closes" type="datetime-local" required value={f.registrationClosesAt} onChange={set('registrationClosesAt')} />
        <Field label="First round starts" type="datetime-local" required value={f.startsAt} onChange={set('startsAt')} />
      </div>

      <FormError error={error} />
      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
