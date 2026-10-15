import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Field, FormError, Notice } from '../../components/Form'
import { api, fieldError } from '../../lib/api'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const [newPassword, setNewPassword] = useState('')
  const reset = useMutation({
    mutationFn: () =>
      api('/api/auth/reset-password', {
        method: 'POST',
        json: { userId: params.get('userId'), token: params.get('token'), newPassword },
      }),
  })

  if (reset.isSuccess) {
    return (
      <Notice>
        <h1>Password changed</h1>
        <p>
          You can now <Link to="/login">log in</Link> with your new password.
        </p>
      </Notice>
    )
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        reset.mutate()
      }}
    >
      <h1>Choose a new password</h1>
      <Field
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={fieldError(reset.error, 'newPassword')}
        hint="At least 8 characters, with an upper-case letter, a lower-case letter and a number."
      />
      {!fieldError(reset.error, 'newPassword') && <FormError error={reset.error} />}
      <button type="submit" disabled={reset.isPending}>
        Change password
      </button>
    </form>
  )
}
