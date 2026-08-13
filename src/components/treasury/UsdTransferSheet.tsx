import { useEffect, useMemo, useState } from 'react'
import Button from '../ui/Button'
import PinEntry from './PinEntry'
import SideSheetStack, { type SheetLayer } from './SideSheetStack'
import { ApiError, walletApi, type CryptoAsset } from '../../lib/api'
import { useBusiness } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import { useCryptoAssets } from '../../hooks/useAppData'
import styles from './TransferModal.module.css'

type Props = {
  open: boolean
  onClose: () => void
  availableUsd: number
  pinReady?: boolean
  canAct?: boolean
  onTransferred?: () => void
}

type DetailView = 'form' | 'review' | 'pin'

const MIN_AMOUNT = 1
const STABLECOIN_ASSETS = new Set(['USDT', 'USDC', 'PYUSD'])

function usd(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

export default function UsdTransferSheet({
  open,
  onClose,
  availableUsd,
  pinReady = true,
  canAct = true,
  onTransferred,
}: Props) {
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const { data: assets = [], isLoading: loadingAssets } = useCryptoAssets(open)
  const [detailView, setDetailView] = useState<DetailView>('form')
  const [asset, setAsset] = useState('')
  const [chain, setChain] = useState('')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  const transferAssets = useMemo(
    () => assets.filter(item => STABLECOIN_ASSETS.has(item.asset.toUpperCase())),
    [assets],
  )

  const selectedAsset = useMemo(
    () => transferAssets.find(item => item.asset === asset) ?? null,
    [transferAssets, asset],
  )
  const chains = useMemo(() => networkOptions(selectedAsset), [selectedAsset])
  const parsedAmount = Number(amount)
  const amountValid = amount !== '' && parsedAmount >= MIN_AMOUNT && parsedAmount <= availableUsd

  useEffect(() => {
    if (!open) {
      setDetailView('form')
      setAsset('')
      setChain('')
      setAddress('')
      setAmount('')
      setMemo('')
      setPinLoading(false)
      return
    }
    if (transferAssets.length === 1 && !asset) {
      setAsset(transferAssets[0].asset)
    }
  }, [open, transferAssets, asset])

  useEffect(() => {
    if (!selectedAsset) {
      setChain('')
      return
    }
    const options = networkOptions(selectedAsset)
    const defaultChain = selectedAsset.default_network ?? options[0] ?? ''
    setChain(defaultChain)
  }, [selectedAsset])

  function canContinue() {
    return (
      canAct &&
      pinReady &&
      Boolean(asset) &&
      Boolean(chain) &&
      address.trim().length >= 8 &&
      amountValid
    )
  }

  async function handleConfirm(pin: string) {
    if (!businessId || !canContinue()) return
    setPinLoading(true)
    try {
      const res = await walletApi.transferUsd(businessId, {
        address: address.trim(),
        asset,
        chain,
        amount: String(parsedAmount),
        wallet_pin: pin,
        memo: memo.trim() || undefined,
        reason: memo.trim() || undefined,
      })
      onClose()
      onTransferred?.()
      showToast(
        `${usd(parsedAmount)} ${asset} transfer initiated${res.data.reference ? ` (${res.data.reference})` : ''}`,
      )
    } catch (err) {
      setPinLoading(false)
      setDetailView('review')
      showToast(err instanceof ApiError ? err.message : 'Transfer failed. Please try again.', 'error')
    }
  }

  function handleDetailBack() {
    if (detailView === 'pin') setDetailView('review')
    else if (detailView === 'review') setDetailView('form')
    else onClose()
  }

  const detailTitles: Record<DetailView, string> = {
    form: 'Send from USD wallet',
    review: 'Review transfer',
    pin: 'Confirm transfer',
  }

  const form = loadingAssets ? (
    <p className={styles.formNotice}>Loading supported assets…</p>
  ) : transferAssets.length === 0 ? (
    <p className={styles.formNotice}>
      Crypto transfers are not enabled for your business yet. Contact Nyra support to enable crypto payouts.
    </p>
  ) : (
    <div className={styles.form}>
      {!canAct && (
        <p className={styles.formNotice}>Only the business owner can send transfers.</p>
      )}
      {canAct && !pinReady && (
        <p className={styles.formNotice}>Set your transaction PIN before sending a transfer.</p>
      )}
      <p className={styles.formNotice}>
        Available: {usd(availableUsd)} · Sends stablecoin to an external wallet address and debits your USD balance.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="usd-transfer-asset">Asset</label>
        <select
          id="usd-transfer-asset"
          className={styles.input}
          value={asset}
          onChange={event => setAsset(event.target.value)}
        >
          <option value="">Select asset</option>
          {transferAssets.map(item => (
            <option key={item.asset} value={item.asset}>
              {item.label || item.asset}
            </option>
          ))}
        </select>
      </div>

      {chains.length > 1 && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="usd-transfer-network">Network</label>
          <select
            id="usd-transfer-network"
            className={styles.input}
            value={chain}
            onChange={event => setChain(event.target.value)}
          >
            {chains.map(network => (
              <option key={network} value={network}>
                {formatNetworkLabel(network)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="usd-transfer-address">Destination address</label>
        <input
          id="usd-transfer-address"
          className={styles.input}
          placeholder="Wallet address"
          value={address}
          onChange={event => setAddress(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="usd-transfer-amount">Amount (USD)</label>
        <input
          id="usd-transfer-amount"
          className={styles.input}
          type="number"
          min={MIN_AMOUNT}
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
        {amount && parsedAmount < MIN_AMOUNT && (
          <span className={styles.verifying}>Minimum transfer is {usd(MIN_AMOUNT)}</span>
        )}
        {amount && parsedAmount > availableUsd && (
          <span className={styles.verifying}>Amount exceeds available balance ({usd(availableUsd)})</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="usd-transfer-memo">Note (optional)</label>
        <input
          id="usd-transfer-memo"
          className={styles.input}
          placeholder="What's this for?"
          value={memo}
          onChange={event => setMemo(event.target.value)}
        />
      </div>

      <Button variant="inverted" fullWidth disabled={!canContinue()} onClick={() => setDetailView('review')}>
        Continue
      </Button>
    </div>
  )

  const reviewContent = (
    <div className={styles.review}>
      <div className={styles.reviewAmount}>{usd(parsedAmount)}</div>
      <div className={styles.reviewRows}>
        <div className={styles.reviewRow}><span>Asset</span><span>{asset}</span></div>
        <div className={styles.reviewRow}><span>Network</span><span>{formatNetworkLabel(chain)}</span></div>
        <div className={styles.reviewRow}><span>To</span><span>{address.trim()}</span></div>
        {memo.trim() && <div className={styles.reviewRow}><span>Note</span><span>{memo.trim()}</span></div>}
        <div className={styles.reviewRow}><span>From</span><span>USD wallet</span></div>
      </div>
      <Button variant="inverted" fullWidth onClick={() => setDetailView('pin')}>Confirm & Send</Button>
    </div>
  )

  const pinContent = (
    <PinEntry
      key={detailView}
      onConfirm={handleConfirm}
      loading={pinLoading}
      length={4}
      subtitle={`Confirm transfer of ${usd(parsedAmount)} ${asset}`}
    />
  )

  function getDetailContent() {
    if (detailView === 'review') return reviewContent
    if (detailView === 'pin') return pinContent
    return form
  }

  const layers: SheetLayer[] = [
    {
      key: 'usd-transfer',
      title: detailTitles[detailView],
      showBack: detailView !== 'form',
      onBack: handleDetailBack,
      children: (
        <div key={detailView} className={styles.morphContent}>
          {getDetailContent()}
        </div>
      ),
    },
  ]

  return <SideSheetStack open={open} onClose={onClose} layers={layers} />
}
