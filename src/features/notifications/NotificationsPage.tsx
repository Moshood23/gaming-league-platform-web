import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { notificationsKey, useNotifications, type Notification } from './useNotifications'

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const notifications = useNotifications()
  const refresh = () => queryClient.invalidateQueries({ queryKey: notificationsKey })
  const readAll = useMutation({ mutationFn: () => api('/api/notifications/read-all', { method: 'POST' }), onSuccess: refresh })
  const open = useMutation({
    mutationFn: (n: Notification) => (n.isRead ? Promise.resolve() : api(`/api/notifications/${n.id}/read`, { method: 'POST' })),
    onSuccess: (_, n) => {
      void refresh()
      if (n.link) navigate(n.link)
    },
  })

  return (
    <section className="stack">
      <div className="round-header">
        <h1>Notifications</h1>
        {!!notifications.data?.unreadCount && (
          <button type="button" className="link-button" onClick={() => readAll.mutate()}>
            Mark all as read
          </button>
        )}
      </div>
      <FormError error={notifications.error ?? readAll.error} />
      {notifications.data?.items.length === 0 && <p className="hint">Nothing yet.</p>}
      {notifications.data?.items.map((n) => (
        <button key={n.id} type="button" className={`card notification${n.isRead ? '' : ' unread'}`} onClick={() => open.mutate(n)}>
          <strong>{n.title}</strong>
          <span>{n.message}</span>
          <span className="hint">{formatDateTime(n.createdAt)}</span>
        </button>
      ))}
    </section>
  )
}
