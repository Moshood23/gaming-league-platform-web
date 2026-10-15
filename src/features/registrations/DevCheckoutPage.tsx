import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import { FormError, Notice } from '../../components/Form'
import { api } from '../../lib/api'
import { formatNaira } from '../../lib/format'
import type { PaymentStatus } from './types'

/** Development only: stands in for the Paystack checkout page. Not included in production builds. */
export function DevCheckoutPage() {
  const [params] = useSearchParams()
  const reference = params.get('reference') ?? ''
  const navigate = useNavigate()
  const payment = useQuery({ queryKey: ['payment-info', reference], queryFn: () => api<PaymentStatus>(`/api/payments/${reference}`) })
  const pay = useMutation({
    mutationFn: () => api(`/api/dev/payments/${reference}/pay`, { method: 'POST' }),
    onSuccess: () => navigate(`/payments/${reference}`),
  })

  return (
    <Notice>
      <span className="badge">Test checkout — no real money</span>
      <h1>Pay {formatNaira(payment.data?.amountKobo)}</h1>
      <p className="hint">In production this is Paystack's secure checkout page.</p>
      <FormError error={payment.error ?? pay.error} />
      <button type="button" disabled={!payment.data || pay.isPending} onClick={() => pay.mutate()}>
        Pay (test)
      </button>
      <button type="button" className="secondary" onClick={() => navigate(`/payments/${reference}`)}>
        Cancel payment
      </button>
    </Notice>
  )
}
