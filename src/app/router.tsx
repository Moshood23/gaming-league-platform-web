import { createBrowserRouter } from 'react-router'
import { AdminPayoutsPage } from '../features/admin/AdminPayoutsPage'
import { AdminSeasonPage } from '../features/admin/AdminSeasonPage'
import { AdminSeasonsPage } from '../features/admin/AdminSeasonsPage'
import { AdminUsersPage } from '../features/admin/AdminUsersPage'
import { NewSeasonPage } from '../features/admin/NewSeasonPage'
import { ConfirmEmailPage } from '../features/auth/ConfirmEmailPage'
import { ForgotPasswordPage, ResendConfirmationPage } from '../features/auth/EmailOnlyForm'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage'
import { HomePage } from '../features/home/HomePage'
import { MatchPage } from '../features/matches/MatchPage'
import { ModerationQueuePage } from '../features/moderation/ModerationQueuePage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { DevCheckoutPage } from '../features/registrations/DevCheckoutPage'
import { PaymentReturnPage } from '../features/registrations/PaymentReturnPage'
import { SeasonPage } from '../features/seasons/SeasonPage'
import { SeasonsPage } from '../features/seasons/SeasonsPage'
import { Layout } from './Layout'
import { RequireAuth } from './RequireAuth'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/confirm-email', element: <ConfirmEmailPage /> },
      { path: '/resend-confirmation', element: <ResendConfirmationPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/seasons', element: <SeasonsPage /> },
      { path: '/seasons/:seasonId', element: <SeasonPage /> },
      { path: '/matches/:matchId', element: <MatchPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/profile', element: <ProfilePage /> },
          { path: '/payments/:reference', element: <PaymentReturnPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          // The fake checkout only exists in development builds.
          ...(import.meta.env.DEV ? [{ path: '/dev/checkout', element: <DevCheckoutPage /> }] : []),
        ],
      },
      {
        element: <RequireAuth role={['Moderator', 'Administrator']} />,
        children: [{ path: '/moderation', element: <ModerationQueuePage /> }],
      },
      {
        element: <RequireAuth role="Administrator" />,
        children: [
          { path: '/admin/seasons', element: <AdminSeasonsPage /> },
          { path: '/admin/competitions/:competitionId/new-season', element: <NewSeasonPage /> },
          { path: '/admin/seasons/:seasonId', element: <AdminSeasonPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/payouts', element: <AdminPayoutsPage /> },
        ],
      },
    ],
  },
])
