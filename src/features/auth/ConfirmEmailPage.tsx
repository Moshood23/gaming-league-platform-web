import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FormError, Notice } from '../../components/Form'
import { api } from '../../lib/api'

export function ConfirmEmailPage() {
  const [params] = useSearchParams()
  const userId = params.get('userId')
  const token = params.get('token')
  const confirm = useMutation({
    mutationFn: () => api('/api/auth/confirm-email', { method: 'POST', json: { userId, token } }),
  })
  const { mutate } = confirm
  const sent = useRef(false)

  useEffect(() => {
    // Send once, even though React runs effects twice in development.
    if (userId && token && !sent.current) {
      sent.current = true
      mutate()
    }
  }, [userId, token, mutate])

  if (!userId || !token) {
    return (
      <Notice>
        <h1>Link incomplete</h1>
        <p>Open the link from your email again, or <Link to="/resend-confirmation">get a new one</Link>.</p>
      </Notice>
    )
  }

  return (
    <Notice>
      {confirm.isSuccess ? (
        <>
          <h1>Email confirmed</h1>
          <p>
            You can now <Link to="/login">log in</Link>.
          </p>
        </>
      ) : confirm.isError ? (
        <>
          <h1>Could not confirm</h1>
          <FormError error={confirm.error} />
          <p>
            <Link to="/resend-confirmation">Send a new link</Link>
          </p>
        </>
      ) : (
        <h1>Confirming…</h1>
      )}
    </Notice>
  )
}
