import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { api } from '../../lib/api'
import { formatNaira, ordinal } from '../../lib/format'

interface MyPayout {
  id: string
  seasonId: string
  seasonName: string
  position: number
  amountKobo: number
  status: 'AwaitingAccount' | 'PendingApproval' | 'Approved' | 'Sent' | 'Succeeded' | 'Failed'
}

const statusText: Record<MyPayout['status'], string> = {
  AwaitingAccount: 'Add your bank account to receive it',
  PendingApproval: 'Being checked by an administrator',
  Approved: 'On its way',
  Sent: 'On its way',
  Succeeded: 'Paid',
  Failed: 'Transfer failed — an administrator will retry',
}

export function MyPrizes() {
  const payouts = useQuery({ queryKey: ['my-payouts'], queryFn: () => api<MyPayout[]>('/api/me/payouts') })
  if (!payouts.data?.length) return null

  return (
    <div className="card champion-list">
      <h2>Your prizes</h2>
      <ul className="plain">
        {payouts.data.map((p) => (
          <li key={p.id}>
            🏆 <strong>{formatNaira(p.amountKobo)}</strong> — {ordinal(p.position)} in <Link to={`/seasons/${p.seasonId}`}>{p.seasonName}</Link>
            <br />
            {p.status === 'AwaitingAccount' ? (
              <Link to="/profile">{statusText[p.status]}</Link>
            ) : (
              <span className={p.status === 'Succeeded' ? 'success' : 'hint'}>{statusText[p.status]}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
