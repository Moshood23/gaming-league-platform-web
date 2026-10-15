import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationList {
  unreadCount: number
  items: Notification[]
}

export const notificationsKey = ['notifications']

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: () => api<NotificationList>('/api/notifications'),
    enabled,
    refetchInterval: 60_000,
  })
}
