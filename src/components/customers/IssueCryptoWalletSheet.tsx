import { useEffect, useMemo, useState } from 'react'
import Button from '../ui/Button'
import SideSheetStack, { type SheetLayer } from '../treasury/SideSheetStack'
import { customersApi, ApiError, type CryptoAsset } from '../../lib/api'
import { useBusiness } from '../../context/BusinessContext'
import { useCryptoAssets } from '../../hooks/useAppData'
import styles from './IssueCryptoWalletSheet.module.css'

type Props = {
  open: boolean
  walletId: string
  onClose: () => void
  onCreated: () => void
}

function formatNetworkLabel(network: string) {
  const value = network.trim().toLowerCase()
  if (value === 'trc20') return 'TRC20'
  if (value === 'erc20') return 'ERC20'
  if (value === 'bep20') return 'BEP20'
  if (value === 'tron') return 'Tron'
  if (value === 'solana') return 'Solana'
  return network
}

function networkOptions(asset: CryptoAsset | null) {
  if (!asset) return []
  const networks = asset.networks?.length
    ? asset.networks
    : [asset.default_network ?? asset.network].filter(Boolean)
  return networks as string[]
}

export default function IssueCryptoWalletSheet({ open, walletId, onClose, onCreated }: Props) {
  const { businessId } = useBusiness()
  const { data: assets = [], isLoading: loadingAssets } = useCryptoAssets(open)
  const [asset, setAsset] = useState('')
  const [chain, setChain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedAsset = useMemo(
    () => assets.find(item => item.asset === asset) ?? null,
    [assets, asset],
  )
  const chains = useMemo(() => networkOptions(selectedAsset), [selectedAsset])

  useEffect(() => {
    if (!open) {
      setAsset('')
      setChain('')
      setError('')
      setLoading(false)
      return
    }
    if (assets.length === 1 && !asset) {
      setAsset(assets[0].asset)
    }
  }, [open, assets, asset])

  useEffect(() => {
    if (!selectedAsset) {
      setChain('')
      return
    }
    const options = networkOptions(selectedAsset)
    const defaultChain = selectedAsset.default_network ?? options[0] ?? ''
    setChain(defaultChain)
  }, [selectedAsset])

  const valid = Boolean(asset && (chains.length <= 1 || chain))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || !walletId) return
    setLoading(true)
    setError('')
    try {
      await customersApi.createCryptoWallet(
        walletId,
        {
          asset,
          chain: chains.length > 1 ? chain : chain || undefined,
        },
        businessId ?? undefined,
      )
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not issue crypto wallet. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const content = loadingAssets ? (
    <p className={styles.hint}>Loading supported assets…</p>
  ) : assets.length === 0 ? (
    <p className={styles.hint}>
      Crypto wallets are not enabled for your business yet. Contact Nyra support to enable crypto collections.
    </p>
  ) : (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.hint}>
        Generate an on-chain deposit address for this customer. They can send the selected asset on the chosen network.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="crypto-asset">Asset</label>
        <select
          id="crypto-asset"
          className={styles.input}
          value={asset}
          onChange={e => setAsset(e.target.value)}
          required
        >
          <option value="">Select asset</option>
          {assets.map(item => (
            <option key={item.asset} value={item.asset}>
              {item.label || item.asset}
            </option>
          ))}
        </select>
      </div>

      {chains.length > 1 && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="crypto-network">Network</label>
          <select
            id="crypto-network"
            className={styles.input}
            value={chain}
            onChange={e => setChain(e.target.value)}
            required
          >
            {chains.map(network => (
              <option key={network} value={network}>
                {formatNetworkLabel(network)}
              </option>
            ))}
          </select>
        </div>
      )}

      {chains.length === 1 && chain && (
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Network</span>
          <span className={styles.metaValue}>{formatNetworkLabel(chain)}</span>
        </div>
      )}

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!valid || loading}>
          {loading ? 'Issuing…' : 'Issue wallet'}
        </Button>
      </div>
    </form>
  )

  const layers: SheetLayer[] = [{
    key: 'issue-crypto-wallet',
    title: 'Issue crypto wallet',
    children: content,
  }]

  return (
    <SideSheetStack open={open} onClose={onClose} layers={layers} />
  )
}
