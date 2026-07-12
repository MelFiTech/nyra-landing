import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import SideSheetStack, { type SheetLayer } from '../treasury/SideSheetStack'
import { teamApi, ApiError } from '../../lib/api'
import {
  ASSIGNABLE_TEAM_ROLES,
  type BusinessTeamRole,
} from '../../lib/teamPermissions'
import styles from './AddTeamMemberSheet.module.css'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: () => void
  businessId: string
}

export default function AddTeamMemberSheet({ open, onClose, onCreated, businessId }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Exclude<BusinessTeamRole, 'OWNER'>>('CUSTOMER_REP')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setEmail('')
      setRole('CUSTOMER_REP')
      setSaving(false)
      setError('')
    }
  }, [open])

  const selectedRole = ASSIGNABLE_TEAM_ROLES.find(r => r.value === role)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setSaving(true)
    setError('')
    try {
      await teamApi.invite(businessId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add team member. Please try again.')
      setSaving(false)
    }
  }

  const formContent = (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.hint}>
        Invite someone to this business. They will set a password the first time they sign in with this email.
      </p>

      <div className={styles.field}>
        <label className={styles.label}>Full name</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          placeholder="teammate@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Role</label>
        <select
          className={styles.input}
          value={role}
          onChange={e => setRole(e.target.value as Exclude<BusinessTeamRole, 'OWNER'>)}
        >
          {ASSIGNABLE_TEAM_ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        {selectedRole && <p className={styles.roleHint}>{selectedRole.description}</p>}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Button
        type="submit"
        variant="inverted"
        fullWidth
        loading={saving}
        disabled={!name.trim() || !email.trim()}
      >
        Add team member
      </Button>
    </form>
  )

  const layers: SheetLayer[] = [
    { key: 'form', title: 'Add team member', children: formContent },
  ]

  return <SideSheetStack open={open} onClose={onClose} layers={layers} />
}
