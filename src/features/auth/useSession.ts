import { useQueryClient } from '@tanstack/react-query'
import { api, refreshAntiforgery } from '../../lib/api'

export function useSession() {
  const queryClient = useQueryClient()

  const afterChange = async () => {
    await refreshAntiforgery()
    // Drop everything cached for the previous user and refetch what is on screen.
    await queryClient.resetQueries()
  }

  return {
    async login(email: string, password: string) {
      await api('/api/auth/login', { method: 'POST', json: { email, password } })
      await afterChange()
    },
    async logout() {
      await api('/api/auth/logout', { method: 'POST' })
      await afterChange()
    },
  }
}
