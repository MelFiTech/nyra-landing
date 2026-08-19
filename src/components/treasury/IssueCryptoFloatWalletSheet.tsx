import { useEffect, useMemo, useState } from 'react'
import Button from '../ui/Button'
import SideSheetStack, { type SheetLayer } from '../treasury/SideSheetStack'
import { ApiError, cryptoApi, type CryptoMasterWallet } from '../../lib/api'
import { listAvailableFloatSlots } from '../../lib/cryptoFloat'
import { useBusiness } from '../../context/BusinessContext'
import { useCryptoAssets, useCryptoMasterWallets } from '../../hooks/useAppData'
import styles from '../customers/IssueCryptoWalletSheet.module.css'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (wallet: CryptoMasterWallet) => void
}

export default function IssueCryptoFloatWalletSheet({ open, onClose, onCreated }: Props) {
  const { businessId } = useBusiness()
  const { data: assets = [], isLoading: loadingAssets } = useCryptoAssets(open)
  const { data: existing = [], isLoading: loadingWallets } = useCryptoMasterWallets(open)
  const [slotKey, setSlotKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const availableSlots = useMemo(
    () => listAvailableFloatSlots(assets, existing),
    [assets, existing],
  )

  const selectedSlot = useMemo(
    () => availableSlots.find(slot => `${slot.asset}:${slot.chain}` === slotKey) ?? null,
    [availableSlots, slotKey],
  )

  useEffect(() => {
    if (!open) {
      setSlotKey('')
      setError('')
      setLoading(false)
      return
    }
    if (availableSlots.length === 1 && !slotKey) {
      const slot = availableSlots[0]
      setSlotKey(`${slot.asset}:${slot.chain}`)
    }
  }, [open, availableSlots, slotKey])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!businessId || !selectedSlot) return
    setLoading(true)
    setError('')
    try {
      const res = await cryptoApi.createMasterWallet(businessId, {
        asset: selectedSlot.asset,
        chain: selectedSlot.chain,
      })
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not create float wallet. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const content = loadingAssets || loadingWallets ? (
    <p className={styles.hint}>Loading supported assets…</p>
  ) : availableSlots.length === 0 ? (
    <p className={styles.hint}>
      You already have a float wallet for every supported asset Nyra offers your business.
    </p>
  ) : (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.hint}>
        Create one float wallet per asset. USDT and USDC use a single balance across every supported network — pick the asset to start. You can receive on more than one chain from that same wallet.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="float-wallet-slot">Asset</label>
        <select
          id="float-wallet-slot"
          className={styles.input}
          value={slotKey}
          onChange={event => setSlotKey(event.target.value)}
          required
        >
          <option value="">Select asset</option>
          {availableSlots.map(slot => (
            <option key={`${slot.asset}:${slot.chain}`} value={`${slot.asset}:${slot.chain}`}>
              {slot.networkLabel ? `${slot.label} · ${slot.networkLabel}` : slot.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit" variant="inverted" fullWidth disabled={!selectedSlot || loading}>
        {loading ? 'Creating…' : 'Create float wallet'}
      </Button>
    </form>
  )

  const layers: SheetLayer[] = [
    {
      key: 'issue-float-wallet',
      title: 'Add float wallet',
      children: content,
    },
  ]

  return <SideSheetStack open={open} onClose={onClose} layers={layers} />
}
