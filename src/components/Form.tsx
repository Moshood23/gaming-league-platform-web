import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { ApiError } from '../lib/api'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: ReactNode
}

export function Field({ label, error, hint, ...input }: FieldProps) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...input} />
      {hint && !error && <p className="hint">{hint}</p>}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

/** Shows the server's message for errors that are not about one field. */
export function FormError({ error }: { error: unknown }) {
  if (!error) {
    return null
  }
  const message =
    error instanceof ApiError
      ? error.status === 429
        ? 'Too many attempts. Please wait a minute and try again.'
        : (error.problem.detail ?? error.problem.title ?? error.message)
      : 'Something went wrong. Check your connection and try again.'
  return (
    <p className="form-error" role="alert">
      {message}
    </p>
  )
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="notice">{children}</div>
}
