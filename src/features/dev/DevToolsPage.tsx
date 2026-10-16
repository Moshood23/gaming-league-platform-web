import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { currentUserKey, useCurrentUser } from '../auth/useCurrentUser'
import { useSession } from '../auth/useSession'

interface DemoDataResult {
  accounts: { email: string; password: string; role: string; clubName: string | null }[]
  seasons: { id: string; name: string; state: string }[]
}

/** The accounts the demo data creates (see DemoDataSeeder in the API). */
const demoPassword = 'DemoPass1'
const demoAccounts = [
  { email: 'admin@demo.local', label: 'Administrator' },
  { email: 'ikeja.strikers@demo.local', label: 'Ikeja Strikers' },
  { email: 'wuse.warriors@demo.local', label: 'Wuse Warriors' },
  { email: 'lekki.lions@demo.local', label: 'Lekki Lions' },
  { email: 'garki.gunners@demo.local', label: 'Garki Gunners' },
  { email: 'yaba.royals@demo.local', label: 'Yaba Royals' },
  { email: 'ajah.rangers@demo.local', label: 'Ajah Rangers' },
]

/** Development only: shortcuts for trying the app. Not included in production builds. */
export function DevToolsPage() {
  const { data: user } = useCurrentUser()
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const seed = useMutation({ mutationFn: () => api<DemoDataResult>('/api/dev/demo-data', { method: 'POST' }) })
  const loginAs = useMutation({
    mutationFn: (email: string) => session.login(email, demoPassword),
    onSuccess: () => navigate('/'),
  })
  const makeAdmin = useMutation({
    mutationFn: () => api('/api/dev/make-me-admin', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: currentUserKey }),
  })

  return (
    <section className="stack">
      <h1>Development tools</h1>
      <p className="hint">These shortcuts only exist when you run the app locally. The live site has none of them.</p>

      <div className="card stack">
        <h2>Inbox</h2>
        <p>Confirmation, password reset and notification emails, with their links ready to click.</p>
        <p>
          <Link to="/dev/emails" className="button">
            Open the inbox
          </Link>
        </p>
      </div>

      <div className="card stack">
        <h2>Demo data</h2>
        <p>
          Creates a demo league: an administrator and six players, <strong>Demo Season 1</strong> in progress (two rounds
          played, one result waiting for confirmation, one dispute) and <strong>Demo Season 2</strong> open for registration.
          It can only be created once per database.
        </p>
        <p>
          <button type="button" disabled={seed.isPending || seed.isSuccess} onClick={() => seed.mutate()}>
            {seed.isPending ? 'Creating…' : 'Create demo data'}
          </button>
        </p>
        <FormError error={seed.error} />
        {seed.data && (
          <ul className="plain">
            {seed.data.seasons.map((season) => (
              <li key={season.id}>
                <p className="success">
                  <Link to={`/seasons/${season.id}`}>{season.name}</Link>: {season.state}
                </p>
              </li>
            ))}
          </ul>
        )}

        <h3>Log in as a demo account</h3>
        <p className="hint">
          Every demo account uses the password <code>{demoPassword}</code>. Use a private window to be two players at once.
        </p>
        <div className="row">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              className="secondary"
              title={account.email}
              disabled={loginAs.isPending}
              onClick={() => loginAs.mutate(account.email)}
            >
              {account.label}
            </button>
          ))}
        </div>
        <FormError error={loginAs.error} />
      </div>

      <div className="card stack">
        <h2>Administrator</h2>
        {!user ? (
          <p>
            <Link to="/login">Log in</Link> first, then come back here to make your own account an administrator.
          </p>
        ) : user.roles.includes('Administrator') ? (
          <p className="success">
            {user.email} is an administrator. <Link to="/admin/seasons">Go to Admin</Link>.
          </p>
        ) : (
          <>
            <p>Gives {user.email} the Administrator role, so you can create seasons and decide disputes.</p>
            <p>
              <button type="button" disabled={makeAdmin.isPending} onClick={() => makeAdmin.mutate()}>
                Make me administrator
              </button>
            </p>
          </>
        )}
        <FormError error={makeAdmin.error} />
      </div>
    </section>
  )
}
