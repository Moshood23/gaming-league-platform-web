import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Field, FormError, Notice } from '../../components/Form'
import { api } from '../../lib/api'

interface Props {
  title: string
  intro: string
  endpoint: string
  button: string
  done: string
}

/** A one-field form whose result is always "check your email", so it never reveals who has an account. */
function EmailOnlyForm({ title, intro, endpoint, button, done }: Props) {
  const [email, setEmail] = useState('')
  const send = useMutation({ mutationFn: () => api(endpoint, { method: 'POST', json: { email } }) })

  if (send.isSuccess) {
    return (
      <Notice>
        <h1>Check your email</h1>
        <p>{done}</p>
      </Notice>
    )
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        send.mutate()
      }}
    >
      <h1>{title}</h1>
      <p>{intro}</p>
      <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <FormError error={send.error} />
      <button type="submit" disabled={send.isPending}>
        {button}
      </button>
    </form>
  )
}

export function ForgotPasswordPage() {
  return (
    <EmailOnlyForm
      title="Reset your password"
      intro="Enter your account email and we will send you a link to choose a new password."
      endpoint="/api/auth/forgot-password"
      button="Send reset link"
      done="If an account uses that email, a reset link is on its way."
    />
  )
}

export function ResendConfirmationPage() {
  return (
    <EmailOnlyForm
      title="Resend confirmation"
      intro="Enter the email you signed up with and we will send a new confirmation link."
      endpoint="/api/auth/resend-confirmation"
      button="Send link"
      done="If that account still needs confirming, a new link is on its way."
    />
  )
}
