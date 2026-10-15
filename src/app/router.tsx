import { createBrowserRouter } from 'react-router'
import { ConfirmEmailPage } from '../features/auth/ConfirmEmailPage'
import { ForgotPasswordPage, ResendConfirmationPage } from '../features/auth/EmailOnlyForm'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage'
import { HomePage } from '../features/home/HomePage'
import { ProfilePage } from '../features/profile/ProfilePage'
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
      {
        element: <RequireAuth />,
        children: [{ path: '/profile', element: <ProfilePage /> }],
      },
    ],
  },
])
