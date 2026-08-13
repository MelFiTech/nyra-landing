import { useState } from 'react'
import Button from '../ui/Button'
import SideSheetStack, { type SheetLayer } from '../treasury/SideSheetStack'
import { customersApi, ApiError } from '../../lib/api'
import { useBusiness } from '../../context/BusinessContext'
import styles from './CreateCustomerModal.module.css'

type Props = {
  onClose: () => void
  onCreated: () => void
}

const TITLES = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Chief']
const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export default function CreateCustomerModal({ onClose, onCreated }: Props) {
  const { businessId } = useBusiness()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    middlename: '',
    dob: '',
    gender: '',
    title: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    country: 'NG',
    phone_number: '',
    email: '',
    bvn: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const valid =
    form.first_name && form.last_name && form.dob && form.gender && form.title &&
    form.address_line_1 && form.city && form.state && form.country &&
    form.phone_number && form.email && /^\d{11}$/.test(form.bvn)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    setError('')
    try {
      await customersApi.create({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        middlename: form.middlename.trim() || undefined,
        dob: form.dob,
        gender: form.gender,
        title: form.title,
        address_line_1: form.address_line_1.trim(),
        address_line_2: form.address_line_2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country,
        phone_number: form.phone_number.trim(),
        email: form.email.trim(),
        bvn: form.bvn,
      }, businessId ?? undefined)
      onCreated()
    } catch (err) {
      setLoading(false)
      setError(err instanceof ApiError ? err.message : 'Could not create customer. Please try again.')
    }
  }

  const content = (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.hint}>Create a wallet for your customer. Details are used for KYC and account creation.</p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>First name</label>
          <input className={styles.input} placeholder="First name" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Last name</label>
          <input className={styles.input} placeholder="Last name" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Middle name (optional)</label>
          <input className={styles.input} placeholder="Middle name" value={form.middlename} onChange={e => set('middlename', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <select className={styles.input} value={form.title} onChange={e => set('title', e.target.value)} required>
            <option value="">Select</option>
            {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Date of birth</label>
          <input className={styles.input} type="date" value={form.dob} onChange={e => set('dob', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Gender</label>
          <select className={styles.input} value={form.gender} onChange={e => set('gender', e.target.value)} required>
            <option value="">Select</option>
            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" placeholder="customer@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Phone number</label>
        <input className={styles.input} placeholder="+2348012345678" value={form.phone_number} onChange={e => set('phone_number', e.target.value)} required />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>BVN</label>
        <input className={styles.input} inputMode="numeric" maxLength={11} placeholder="11-digit BVN" value={form.bvn} onChange={e => set('bvn', e.target.value.replace(/\D/g, ''))} required />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Address line 1</label>
        <input className={styles.input} placeholder="Street address" value={form.address_line_1} onChange={e => set('address_line_1', e.target.value)} required />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Address line 2 (optional)</label>
        <input className={styles.input} placeholder="Apartment, suite" value={form.address_line_2} onChange={e => set('address_line_2', e.target.value)} />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>City</label>
          <input className={styles.input} placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>State</label>
          <input className={styles.input} placeholder="Lagos" value={form.state} onChange={e => set('state', e.target.value)} required />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Country</label>
        <select className={styles.input} value={form.country} onChange={e => set('country', e.target.value)} required>
          <option value="NG">Nigeria</option>
        </select>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <Button type="submit" variant="inverted" fullWidth loading={loading} disabled={!valid}>
        Add Customer
      </Button>
    </form>
  )

  const layers: SheetLayer[] = [{ key: 'create-customer', title: 'Create a customer', children: content }]

  return <SideSheetStack open onClose={onClose} layers={layers} />
}
