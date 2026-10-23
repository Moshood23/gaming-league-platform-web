/**
 * The password policy, checked as the user types. The API enforces the same rules (PasswordRules in the API repository)
 * and has the final say; letters and digits from any alphabet count, like on the server.
 */
const checks = [
  { label: 'At least 8 characters', test: (p: string) => [...p].length >= 8 },
  { label: 'An upper-case letter (A–Z)', test: (p: string) => /\p{Lu}/u.test(p) },
  { label: 'A lower-case letter (a–z)', test: (p: string) => /\p{Ll}/u.test(p) },
  { label: 'A number (0–9)', test: (p: string) => /\p{Nd}/u.test(p) },
  { label: 'A special character, such as ! @ # $ % or ?', test: (p: string) => /[^\p{L}\p{Nd}]/u.test(p) },
]

export function meetsPasswordPolicy(password: string): boolean {
  return checks.every((check) => check.test(password))
}

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="password-checks" aria-label="Requirements">
      {checks.map((check) => {
        const met = check.test(password)
        return (
          <li key={check.label} data-met={met}>
            <span aria-hidden="true">{met ? '✓' : '○'}</span> {check.label}
            <span className="visually-hidden">{met ? ' (done)' : ' (missing)'}</span>
          </li>
        )
      })}
    </ul>
  )
}
