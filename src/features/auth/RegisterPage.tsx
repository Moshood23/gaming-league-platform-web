import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { Field, FormError, Notice } from '../../components/Form'
import { api, fieldError } from '../../lib/api'
import { meetsPasswordPolicy, PasswordChecklist } from './PasswordChecklist'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const register = useMutation({
    mutationFn: () => api('/api/auth/register', { method: 'POST', json: { email, password } }),
  })

  if (register.isSuccess) {
    return (
      <Notice>
        <h1>Check your email</h1>
        <p>
          We sent a confirmation link to <strong>{email}</strong>. Open it to finish signing up.
        </p>
        <p>
          No email after a few minutes? Check spam, or <Link to="/resend-confirmation">send it again</Link>.
        </p>
      </Notice>
    )
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        register.mutate()
      }}
    >
      <h1>Create your account</h1>
      <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} error={fieldError(register.error, 'email')} />
      <Field
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldError(register.error, 'password')}
      />
      <PasswordChecklist password={password} />
      {!fieldError(register.error, 'email') && !fieldError(register.error, 'password') && <FormError error={register.error} />}
      <button type="submit" disabled={register.isPending || !meetsPasswordPolicy(password)}>
        {register.isPending ? 'Creating account…' : 'Sign up'}
      </button>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  )
}
