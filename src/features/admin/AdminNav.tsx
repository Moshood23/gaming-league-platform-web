import { NavLink } from 'react-router'

export function AdminNav() {
  return (
    <nav className="tabs">
      <NavLink to="/admin/seasons">Seasons</NavLink>
      <NavLink to="/admin/payouts">Payouts</NavLink>
      <NavLink to="/admin/users">Users</NavLink>
    </nav>
  )
}
