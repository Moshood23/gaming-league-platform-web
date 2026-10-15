import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Field, FormError } from '../../components/Form'
import { ApiError } from '../../lib/api'
import { useSession } from './useSession'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const session = useSession()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const login = useMutation({
    mutationFn: () => session.login(email, password),
    onSuccess: () => navigate(from, { replace: true }),
  })
  const notConfirmed = login.error instanceof ApiError && login.error.problem.code === 'email_not_confirmed'

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        login.mutate()
      }}
    >
      <h1>Log in</h1>
      <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <FormError error={login.error} />
      {notConfirmed && (
        <p>
          <Link to="/resend-confirmation">Send the confirmation link again</Link>
        </p>
      )}
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Logging in…' : 'Log in'}
      </button>
      <p>
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </form>
  )
}
