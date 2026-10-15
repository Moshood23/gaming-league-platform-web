import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { FormError } from '../../components/Form'
import { api, ApiError } from '../../lib/api'
import { formatNaira } from '../../lib/format'
import { useCurrentUser } from '../auth/useCurrentUser'
import type { Season } from '../seasons/types'
import type { MyRegistration } from './types'

interface JoinResult {
  status: string
  checkoutUrl: string | null
  paymentReference: string | null
}

export function JoinPanel({ season }: { season: Season }) {
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()
  const key = ['my-registration', season.id]
  const registration = useQuery({
    queryKey: key,
    queryFn: () => api<MyRegistration | undefined>(`/api/seasons/${season.id}/my-registration`),
    enabled: !!user,
  })
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key })
    void queryClient.invalidateQueries({ queryKey: ['season', season.id] })
  }

  const join = useMutation({
    mutationFn: () => api<JoinResult>(`/api/seasons/${season.id}/join`, { method: 'POST' }),
    onSuccess: (result) => {
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl)
      } else {
        refresh()
      }
    },
  })
  const withdraw = useMutation({
    mutationFn: () => api(`/api/seasons/${season.id}/withdraw`, { method: 'POST' }),
    onSuccess: refresh,
  })

  // The server enforces the closing time; a late click just gets a clear error.
  const open = season.status === 'RegistrationOpen'
  const mine = registration.data
  const needsProfile = join.error instanceof ApiError && join.error.fieldError('profile')
  const fee = season.entryFeeKobo === 0 ? 'free' : formatNaira(season.entryFeeKobo)

  if (!user) {
    return open ? (
      <div className="card">
        <p>
          <Link to="/login" state={{ from: `/seasons/${season.id}` }}>
            Log in
          </Link>{' '}
          or <Link to="/register">create an account</Link> to join this season.
        </p>
      </div>
    ) : null
  }

  if (mine?.status === 'Confirmed') {
    return (
      <div className="card notice-success">
        <strong>You're in as {mine.clubName}.</strong>
        {mine.canWithdraw && (
          <>
            <p className="hint">You can withdraw for a full refund until registration closes.</p>
            <FormError error={withdraw.error} />
            <button
              type="button"
              className="secondary"
              disabled={withdraw.isPending}
              onClick={() => {
                if (confirm('Withdraw from this season? Your entry fee will be refunded.')) withdraw.mutate()
              }}
            >
              Withdraw
            </button>
          </>
        )}
      </div>
    )
  }

  if (!open) {
    return null
  }

  const full = season.confirmedPlayers >= season.maxPlayers
  return (
    <div className="card">
      {mine?.status === 'AwaitingPayment' && <p>Your payment has not come through yet.</p>}
      {mine?.status === 'Refunded' && <p className="hint">You withdrew earlier and were refunded. You can join again.</p>}
      {needsProfile ? (
        <p className="form-error">
          {needsProfile} <Link to="/profile">Create your profile</Link>
        </p>
      ) : (
        <FormError error={join.error} />
      )}
      <button type="button" disabled={join.isPending || full} onClick={() => join.mutate()}>
        {full ? 'Season full' : join.isPending ? 'Starting…' : mine?.status === 'AwaitingPayment' ? `Pay ${fee}` : `Join — ${fee}`}
      </button>
      {season.entryFeeKobo > 0 && <p className="hint">You will pay securely with Paystack. Full refund if you withdraw before registration closes.</p>}
    </div>
  )
}
