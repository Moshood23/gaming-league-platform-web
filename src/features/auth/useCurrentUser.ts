import { useQuery } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'

export interface CurrentUser {
  id: string
  email: string
  roles: string[]
  clubName: string | null
}

export const currentUserKey = ['current-user']

/** The signed-in user, or null when signed out. */
export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: async () => {
      try {
        return await api<CurrentUser>('/api/auth/me')
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null
        }
        throw error
      }
    },
    staleTime: 60_000,
  })
}
