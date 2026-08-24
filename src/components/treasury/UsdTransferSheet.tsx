import { useEffect, useMemo, useState } from 'react'
import Button from '../ui/Button'
import PinEntry from './PinEntry'
import SideSheetStack, { type SheetLayer } from './SideSheetStack'
import { ApiError, cryptoApi, walletApi, type CryptoMasterWallet } from '../../lib/api'
import {
  floatWalletLabel,
  formatCryptoAmount,
  formatNetworkLabel,
  isFloatTransferAsset,
  isStablecoinAsset,
  isUnifiedCryptoNetwork,
  networkOptions,
  transferNetworksForWallet,
} from '../../lib/cryptoFloat'
import { useBusiness } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import { useCryptoAssets } from '../../hooks/useAppData'
import styles from './TransferModal.module.css'

type Props = {
  open: boolean
  onClose: () => void
  availableUsd: number
  availableCrypto?: number
  floatWallet?: CryptoMasterWallet | null
  pinReady?: boolean
  canAct?: boolean
  onTransferred?: () => void
}

type DetailView = 'form' | 'review' | 'pin'

const MIN_USD_AMOUNT = 1
const MIN_BTC_AMOUNT = 0.00001
const STABLECOIN_ASSETS = new Set(['USDT', 'USDC', 'PYUSD'])

function usd(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function UsdTransferSheet({
  open,
  onClose,
  availableUsd,
  availableCrypto,
  floatWallet = null,
  pinReady = true,
  canAct = true,
  onTransferred,
}: Props) {
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const lockedWallet = floatWallet ?? null
  const usesCryptoFloat = Boolean(lockedWallet && isFloatTransferAsset(lockedWallet.asset))
  const usesUsdProgram = !usesCryptoFloat
  const lockToSingleNetwork = Boolean(
    lockedWallet &&
    !isStablecoinAsset(lockedWallet.asset) &&
    !isUnifiedCryptoNetwork(lockedWallet.network),
  )
  const { data: assetsData, isLoading: loadingAssets } = useCryptoAssets(
    open && usesUsdProgram && !lockToSingleNetwork,
  )
  const assets = Array.isArray(assetsData) ? assetsData : []
  const [detailView, setDetailView] = useState<DetailView>('form')
  const [asset, setAsset] = useState('')
  const [chain, setChain] = useState('')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  const transferAssets = useMemo(
    () => assets.filter(item => STABLECOIN_ASSETS.has(String(item?.asset ?? '').toUpperCase())),
    [assets],
  )

  const selectedAsset = useMemo(
    () => transferAssets.find(item => item.asset === asset) ?? null,
    [transferAssets, asset],
  )
  const chains = useMemo(() => {
    if (lockedWallet) return transferNetworksForWallet(lockedWallet, assets)
    return networkOptions(selectedAsset)
  }, [lockedWallet, assets, selectedAsset])
  const parsedAmount = Number(amount)
  const resolvedAsset = lockedWallet?.asset ?? asset
  const resolvedChain = chain
  const availableBalance = usesCryptoFloat
    ? (availableCrypto ?? Number(lockedWallet?.balance ?? 0))
    : availableUsd
  const minAmount = usesCryptoFloat ? MIN_BTC_AMOUNT : MIN_USD_AMOUNT
  const amountValid =
    amount !== '' &&
    parsedAmount >= minAmount &&
    parsedAmount <= availableBalance
  const amountStep = usesCryptoFloat ? '0.00000001' : '0.01'

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
    if (lockedWallet) {
      setAsset(lockedWallet.asset)
      if (lockToSingleNetwork) {
        setChain(lockedWallet.network)
      }
      return
    }
    if (transferAssets.length === 1 && !asset) {
      setAsset(transferAssets[0].asset)
    }
  }, [open, transferAssets, asset, lockedWallet, lockToSingleNetwork])

  useEffect(() => {
    if (lockToSingleNetwork) return
    if (!chains.length) {
      setChain('')
      return
    }
    const defaultChain = lockedWallet
      ? (chains[0] ?? '')
      : (selectedAsset?.default_network ?? chains[0] ?? '')
    if (!chain || !chains.some(network => network === chain)) {
      setChain(defaultChain)
    }
  }, [selectedAsset, lockedWallet, lockToSingleNetwork, chains, chain])

  function canContinue() {
    return (
      canAct &&
      pinReady &&
      Boolean(resolvedAsset) &&
      Boolean(resolvedChain) &&
      address.trim().length >= 8 &&
      amountValid
    )
  }

  async function handleConfirm(pin: string) {
    if (!businessId || !canContinue()) return
    setPinLoading(true)
    try {
      const body = {
        address: address.trim(),
        asset: resolvedAsset,
        chain: resolvedChain,
        amount: String(parsedAmount),
        wallet_pin: pin,
        memo: memo.trim() || undefined,
        reason: memo.trim() || undefined,
      }
      const res = usesCryptoFloat
        ? await cryptoApi.transferFloat(businessId, body)
        : await walletApi.transferUsd(businessId, body)
      onClose()
      onTransferred?.()
      const amountLabel = usesCryptoFloat
        ? formatCryptoAmount(parsedAmount, resolvedAsset)
        : usd(parsedAmount)
      showToast(
        `${amountLabel} transfer initiated${res.data.reference ? ` (${res.data.reference})` : ''}`,
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
    form: usesCryptoFloat ? 'Send BTC' : 'Send from USD wallet',
    review: 'Review transfer',
    pin: 'Confirm transfer',
  }

  const availableLabel = usesCryptoFloat
    ? formatCryptoAmount(availableBalance, resolvedAsset)
    : usd(availableBalance)

  const form = lockedWallet ? (
    <div className={styles.form}>
      {!canAct && (
        <p className={styles.formNotice}>Only the business owner can send transfers.</p>
      )}
      {canAct && !pinReady && (
        <p className={styles.formNotice}>Set your transaction PIN before sending a transfer.</p>
      )}
      <p className={styles.formNotice}>
        Sending from {floatWalletLabel(lockedWallet)} float wallet.
        Available: {availableLabel}
      </p>

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
        <label className={styles.label} htmlFor="usd-transfer-amount">
          {usesCryptoFloat ? `Amount (${resolvedAsset})` : 'Amount (USD)'}
        </label>
        <input
          id="usd-transfer-amount"
          className={styles.input}
          type="number"
          min={minAmount}
          step={amountStep}
          placeholder={usesCryptoFloat ? '0.00000000' : '0.00'}
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
        {amount && parsedAmount < minAmount && (
          <span className={styles.verifying}>
            Minimum transfer is {usesCryptoFloat ? formatCryptoAmount(minAmount, resolvedAsset) : usd(minAmount)}
          </span>
        )}
        {amount && parsedAmount > availableBalance && (
          <span className={styles.verifying}>Amount exceeds available balance ({availableLabel})</span>
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
  ) : loadingAssets ? (
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
        <label className={styles.label} htmlFor="usd-transfer-amount">
          {usesCryptoFloat ? `Amount (${resolvedAsset})` : 'Amount (USD)'}
        </label>
        <input
          id="usd-transfer-amount"
          className={styles.input}
          type="number"
          min={minAmount}
          step={amountStep}
          placeholder={usesCryptoFloat ? '0.00000000' : '0.00'}
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
        {amount && parsedAmount < minAmount && (
          <span className={styles.verifying}>
            Minimum transfer is {usesCryptoFloat ? formatCryptoAmount(minAmount, resolvedAsset) : usd(minAmount)}
          </span>
        )}
        {amount && parsedAmount > availableBalance && (
          <span className={styles.verifying}>Amount exceeds available balance ({availableLabel})</span>
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
      <div className={styles.reviewAmount}>
        {usesCryptoFloat ? formatCryptoAmount(parsedAmount, resolvedAsset) : usd(parsedAmount)}
      </div>
      <div className={styles.reviewRows}>
        <div className={styles.reviewRow}><span>Asset</span><span>{resolvedAsset}</span></div>
        <div className={styles.reviewRow}><span>Network</span><span>{formatNetworkLabel(resolvedChain)}</span></div>
        <div className={styles.reviewRow}><span>To</span><span>{address.trim()}</span></div>
        {memo.trim() && <div className={styles.reviewRow}><span>Note</span><span>{memo.trim()}</span></div>}
        <div className={styles.reviewRow}><span>From</span><span>{lockedWallet ? floatWalletLabel(lockedWallet) : 'USD wallet'}</span></div>
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
      subtitle={`Confirm transfer of ${usesCryptoFloat ? formatCryptoAmount(parsedAmount, resolvedAsset) : `${usd(parsedAmount)} ${resolvedAsset}`}`}
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
