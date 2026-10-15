import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { FormError, Notice } from '../../components/Form'
import { api } from '../../lib/api'
import type { PaymentStatus } from './types'

/** Where the player lands after checkout. Asks the server to check with the provider until the payment settles. */
export function PaymentReturnPage() {
  const { reference } = useParams()
  const status = useQuery({
    queryKey: ['payment', reference],
    queryFn: () => api<PaymentStatus>(`/api/payments/${reference}/verify`, { method: 'POST' }),
    refetchInterval: (query) => (query.state.data?.paymentStatus === 'Initialized' && query.state.dataUpdateCount < 20 ? 3000 : false),
  })

  if (status.isError) {
    return <FormError error={status.error} />
  }

  const s = status.data
  const seasonLink = s && <Link to={`/seasons/${s.seasonId}`}>Back to the season</Link>

  return (
    <Notice>
      {!s || s.paymentStatus === 'Initialized' ? (
        <>
          <h1>Checking your payment…</h1>
          <p>This usually takes a few seconds. You can leave this page — your place is confirmed as soon as the payment is.</p>
          {seasonLink}
        </>
      ) : s.registrationStatus === 'Confirmed' ? (
        <>
          <h1>You're in!</h1>
          <p>Payment received and your place is confirmed. Fixtures are published when registration closes.</p>
          {seasonLink}
        </>
      ) : s.paymentStatus === 'Failed' ? (
        <>
          <h1>Payment did not go through</h1>
          <p>No money was taken. You can try again from the season page.</p>
          {seasonLink}
        </>
      ) : (
        <>
          <h1>Payment received — being refunded</h1>
          <p>The season filled up, closed, or you had already paid, so this payment is being refunded in full.</p>
          {seasonLink}
        </>
      )}
    </Notice>
  )
}
