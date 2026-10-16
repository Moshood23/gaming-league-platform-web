import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

interface DevEmail {
  id: string
  to: string
  subject: string
  htmlBody: string
  sentAt: string
}

const inboxKey = ['dev-emails']

/** The links in an email, with their text, so they can be opened with one click. */
function linksIn(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return [...doc.querySelectorAll('a[href]')].map((a) => ({
    href: a.getAttribute('href') ?? '',
    text: a.textContent?.trim() || (a.getAttribute('href') ?? ''),
  }))
}

function Email({ email }: { email: DevEmail }) {
  const [open, setOpen] = useState(false)
  const links = linksIn(email.htmlBody)

  return (
    <article className="card stack">
      <div>
        <strong>{email.subject}</strong>
        <p className="hint">
          To {email.to} · {formatDateTime(email.sentAt)}
        </p>
      </div>
      {links.length > 0 && (
        <p className="row">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="button">
              {link.text}
            </a>
          ))}
        </p>
      )}
      <button type="button" className="secondary" onClick={() => setOpen(!open)}>
        {open ? 'Hide email' : 'Show email'}
      </button>
      {/* Sandboxed: the email's HTML is shown, never run. */}
      {open && <iframe title={email.subject} className="email-preview" sandbox="" srcDoc={email.htmlBody} />}
    </article>
  )
}

/** Development only: the emails the API would have sent. Not included in production builds. */
export function DevInboxPage() {
  const [filter, setFilter] = useState('')
  const queryClient = useQueryClient()
  const inbox = useQuery({ queryKey: inboxKey, queryFn: () => api<DevEmail[]>('/api/dev/emails'), refetchInterval: 3000 })
  const clear = useMutation({
    mutationFn: () => api('/api/dev/emails', { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inboxKey }),
  })

  const emails = (inbox.data ?? []).filter((e) => e.to.toLowerCase().includes(filter.trim().toLowerCase()))

  return (
    <section className="stack">
      <p>
        <Link to="/dev">← Development tools</Link>
      </p>
      <h1>Development inbox</h1>
      <p className="hint">
        Emails aren't really sent in development. They appear here as the API "sends" them (newest first, updated every few
        seconds) and disappear when the API restarts.
      </p>
      <div className="row">
        <input
          aria-label="Filter by email address"
          placeholder="Filter by email address"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button type="button" className="secondary" disabled={clear.isPending || !inbox.data?.length} onClick={() => clear.mutate()}>
          Empty the inbox
        </button>
      </div>
      <FormError error={inbox.error ?? clear.error} />
      {inbox.isSuccess && emails.length === 0 && <p>No emails{filter ? ' for that address' : ' yet'}.</p>}
      {emails.map((email) => (
        <Email key={email.id} email={email} />
      ))}
    </section>
  )
}
