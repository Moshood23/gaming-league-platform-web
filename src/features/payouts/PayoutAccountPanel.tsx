import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Field, FormError } from '../../components/Form'
import { api, fieldError } from '../../lib/api'

interface Bank {
  code: string
  name: string
}

interface PayoutAccount {
  bankName: string
  accountNumberLast4: string
  accountName: string
  nameMatchesProfile: boolean
}

/** Where prizes are paid. The bank confirms the account name, which must match the real name on the profile. */
export function PayoutAccountPanel() {
  const queryClient = useQueryClient()
  const account = useQuery({ queryKey: ['payout-account'], queryFn: () => api<PayoutAccount | undefined>('/api/profile/payout-account') })
  const [editing, setEditing] = useState(false)
  const banks = useQuery({ queryKey: ['banks'], queryFn: () => api<Bank[]>('/api/banks'), enabled: editing || account.data === undefined, staleTime: 3600_000 })
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const save = useMutation({
    mutationFn: () => api<PayoutAccount>('/api/profile/payout-account', { method: 'PUT', json: { bankCode, accountNumber } }),
    onSuccess: (saved) => {
      queryClient.setQueryData(['payout-account'], saved)
      void queryClient.invalidateQueries({ queryKey: ['my-payouts'] })
      setEditing(false)
      setAccountNumber('')
    },
  })

  if (account.isPending) return null
  const current = account.data
  const showForm = editing || !current

  return (
    <div className="card">
      <h2>Prize bank account</h2>
      {current && (
        <>
          <p>
            {current.bankName} ••••{current.accountNumberLast4}
            <br />
            <strong>{current.accountName}</strong>
          </p>
          {current.nameMatchesProfile ? (
            <p className="success">Name matches your profile.</p>
          ) : (
            <p className="form-error">This name does not clearly match the real name on your profile. An administrator will check it before paying.</p>
          )}
        </>
      )}
      {showForm ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <div className="field">
            <label htmlFor="bank">Bank</label>
            <select id="bank" required value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
              <option value="">Choose your bank…</option>
              {banks.data?.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Account number"
            inputMode="numeric"
            pattern="\d{10}"
            maxLength={10}
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            error={fieldError(save.error, 'accountNumber')}
            hint="10 digits. The account must be in your own name. We only keep the last 4 digits."
          />
          <FormError error={fieldError(save.error, 'accountNumber') ? null : save.error} />
          <button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Checking with your bank…' : 'Save bank account'}
          </button>
        </form>
      ) : (
        <button type="button" className="secondary" onClick={() => setEditing(true)}>
          Change bank account
        </button>
      )}
    </div>
  )
}
