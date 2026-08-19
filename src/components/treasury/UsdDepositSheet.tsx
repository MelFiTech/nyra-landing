import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { ArrowLeftRight, Check, ChevronRight, Coins, Copy, Landmark } from 'lucide-react'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import SideSheetStack, { type SheetLayer } from './SideSheetStack'
import { ApiError, cryptoApi, walletApi, type UsdConvertQuote, type UsdCryptoDeposit } from '../../lib/api'
import { formatNetworkLabel, isUnifiedCryptoNetwork, listWalletDepositOptions, networkOptions, networksMatch, uniqueNetworks, walletToCryptoDeposit } from '../../lib/cryptoFloat'
import { useBusiness } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import { useBusinessWallet, useCryptoAssets } from '../../hooks/useAppData'
import fundStyles from '../cards/FundCardSheet.module.css'
import styles from './UsdDepositSheet.module.css'

type Props = {
  open: boolean
  onClose: () => void
  cryptoDeposit: UsdCryptoDeposit | null
  loading?: boolean
  cryptoFloatEnabled?: boolean
  mode?: 'default' | 'crypto-only'
  onFunded?: () => void
}

type FundMethod = 'ngn' | 'crypto' | 'bank'
type Step = 'form' | 'success'

const MIN_USD = 1

function usd(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function naira(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function UsdDepositSheet({
  open,
  onClose,
  cryptoDeposit,
  loading,
  cryptoFloatEnabled = false,
  mode = 'default',
  onFunded,
}: Props) {
  const cryptoOnly = mode === 'crypto-only'
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const { data: wallet } = useBusinessWallet()
  const [selectedMethod, setSelectedMethod] = useState<FundMethod | null>(null)
  const [step, setStep] = useState<Step>('form')
  const [addressCopied, setAddressCopied] = useState(false)
  const [amountUsd, setAmountUsd] = useState('')
  const [quote, setQuote] = useState<UsdConvertQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [converting, setConverting] = useState(false)
  const [convertedUsd, setConvertedUsd] = useState<number | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [liveDeposit, setLiveDeposit] = useState<UsdCryptoDeposit | null>(null)
  const [generatingAddress, setGeneratingAddress] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const { data: cryptoAssetsData } = useCryptoAssets(open)
  const cryptoAssets = Array.isArray(cryptoAssetsData) ? cryptoAssetsData : []

  const resolvedDeposit = liveDeposit ?? cryptoDeposit
  const catalogAsset = useMemo(
    () => cryptoAssets.find(item => String(item?.asset ?? '').toUpperCase() === (resolvedDeposit?.asset ?? '').toUpperCase()) ?? null,
    [cryptoAssets, resolvedDeposit?.asset],
  )
  const networkPills = useMemo(() => {
    const fromCatalog = networkOptions(catalogAsset)
    if (fromCatalog.length > 0) return fromCatalog
    return uniqueNetworks([
      ...(Array.isArray(resolvedDeposit?.networks) ? resolvedDeposit.networks : []),
      ...Object.values(resolvedDeposit?.deposit_addresses ?? {}).map(entry => entry.network),
      ...(!isUnifiedCryptoNetwork(resolvedDeposit?.network) ? [resolvedDeposit?.network ?? ''] : []),
    ].filter(Boolean))
  }, [catalogAsset, resolvedDeposit])

  const depositOptions = useMemo(
    () =>
      listWalletDepositOptions({
        network: resolvedDeposit?.network ?? '',
        deposit_address: resolvedDeposit?.deposit_address ?? '',
        deposit_addresses: resolvedDeposit?.deposit_addresses,
        networks: resolvedDeposit?.networks,
      }),
    [
      resolvedDeposit?.network,
      resolvedDeposit?.deposit_address,
      resolvedDeposit?.deposit_addresses,
      resolvedDeposit?.networks,
    ],
  )
  const activeDeposit =
    depositOptions.find(option => networksMatch(option.network, selectedNetwork)) ??
    null
  const activeAddress = activeDeposit?.address ?? ''
  const activeNetwork = selectedNetwork || catalogAsset?.default_network || networkPills[0] || ''

  const parsedAmount = Number(amountUsd)
  const amountValid = amountUsd !== '' && parsedAmount >= MIN_USD
  const ngnAvailable = Number(wallet?.balance ?? 0)
  const canConvert =
    amountValid &&
    !!quote &&
    !quoteLoading &&
    !converting &&
    quote.amount_ngn <= ngnAvailable

  useEffect(() => {
    if (!open) {
      setSelectedMethod(null)
      setStep('form')
      setAddressCopied(false)
      setAmountUsd('')
      setQuote(null)
      setQuoteError('')
      setConvertedUsd(null)
      setConverting(false)
      setQrDataUrl('')
      setSelectedNetwork('')
      setLiveDeposit(null)
      setGeneratingAddress(false)
      setGenerateError('')
      return
    }
    if (cryptoOnly) {
      setSelectedMethod('crypto')
    }
  }, [open, cryptoOnly])

  useEffect(() => {
    if (!open || networkPills.length === 0) return
    if (!selectedNetwork || !networkPills.some(network => networksMatch(network, selectedNetwork))) {
      setSelectedNetwork(catalogAsset?.default_network ?? networkPills[0])
    }
  }, [open, networkPills, selectedNetwork, catalogAsset?.default_network])

  useEffect(() => {
    const cryptoActive = open && (cryptoOnly || selectedMethod === 'crypto')
    const asset = resolvedDeposit?.asset
    if (!cryptoActive || !businessId || !asset || !selectedNetwork) return
    if (depositOptions.some(option => networksMatch(option.network, selectedNetwork) && option.address)) {
      setGeneratingAddress(false)
      setGenerateError('')
      return
    }

    let cancelled = false
    setGeneratingAddress(true)
    setGenerateError('')
    void cryptoApi.createMasterWallet(businessId, { asset, chain: selectedNetwork })
      .then(res => {
        if (cancelled) return
        setLiveDeposit(walletToCryptoDeposit(res.data ?? res))
      })
      .catch(error => {
        if (cancelled) return
        setGenerateError(
          error instanceof ApiError
            ? error.message
            : 'Could not generate a deposit address for this network.',
        )
      })
      .finally(() => {
        if (!cancelled) setGeneratingAddress(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    open,
    cryptoOnly,
    selectedMethod,
    businessId,
    resolvedDeposit?.asset,
    selectedNetwork,
    depositOptions,
  ])

  useEffect(() => {
    const address = activeAddress.trim()
    if (!open || !address) {
      setQrDataUrl('')
      return
    }

    let cancelled = false
    void QRCode.toDataURL(address, {
      width: 168,
      margin: 1,
      color: { dark: '#111111', light: '#ffffff' },
    })
      .then(url => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('')
      })

    return () => {
      cancelled = true
    }
  }, [open, activeAddress])

  useEffect(() => {
    if (!open || selectedMethod !== 'ngn' || !businessId || !amountValid) {
      setQuote(null)
      setQuoteError('')
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setQuoteLoading(true)
      setQuoteError('')
      try {
        const nextQuote = await walletApi.getUsdConvertQuote(businessId, {
          amount_usd: parsedAmount,
        })
        if (!cancelled) setQuote(nextQuote)
      } catch (error) {
        if (!cancelled) {
          setQuote(null)
          setQuoteError(
            error instanceof ApiError
              ? error.message
              : 'We could not fetch the exchange rate right now. Please try again shortly.',
          )
        }
      } finally {
        if (!cancelled) setQuoteLoading(false)
      }
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, selectedMethod, businessId, amountValid, parsedAmount])

  function handleBack() {
    if (selectedMethod === 'ngn' && step === 'success') {
      onClose()
      return
    }
    setSelectedMethod(null)
    setStep('form')
    setAddressCopied(false)
    setAmountUsd('')
    setQuote(null)
    setQuoteError('')
    setConvertedUsd(null)
  }

  function sheetTitle() {
    if (selectedMethod === 'ngn') {
      return step === 'success' ? 'Funds added' : 'Convert from NGN'
    }
    if (selectedMethod === 'crypto') {
      return cryptoOnly && resolvedDeposit
        ? `Deposit ${resolvedDeposit.asset}`
        : 'Crypto deposit'
    }
    if (selectedMethod === 'bank') return 'Bank transfer'
    return 'Add funds to virtual cards'
  }

  function sheetContent() {
    if (selectedMethod === 'ngn') {
      return (
        <div key={step} className={fundStyles.morphContent}>
          {ngnContent}
        </div>
      )
    }
    if (selectedMethod === 'crypto') return cryptoContent
    if (selectedMethod === 'bank') return bankContent
    return methodOptions
  }

  async function copyAddress(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setAddressCopied(true)
      window.setTimeout(() => setAddressCopied(false), 2000)
    } catch {
      showToast('Could not copy address', 'error')
    }
  }

  async function handleConvert() {
    if (!businessId || !quote || !canConvert) return
    setConverting(true)
    try {
      const res = await walletApi.convertNgnToUsd(businessId, {
        amount_usd: quote.amount_usd,
      })
      setConvertedUsd(res.data.amount_usd)
      setStep('success')
      onFunded?.()
    } catch (error) {
      showToast(
        error instanceof ApiError
          ? error.message
          : 'Conversion failed. Please try again shortly.',
        'error',
      )
    } finally {
      setConverting(false)
    }
  }

  const methodOptions = (
    <>
      <p className={styles.hint}>
        Choose how you want to fund your USD balance
        {cryptoFloatEnabled ? ' and crypto float wallets' : ''}.
      </p>
      <div className={styles.optionList}>
        <button
          type="button"
          className={styles.optionItem}
          onClick={() => setSelectedMethod('ngn')}
        >
          <span className={styles.optionIcon} aria-hidden>
            <ArrowLeftRight size={18} />
          </span>
          <span className={styles.optionText}>
            <span className={styles.optionLabel}>Convert from NGN balance</span>
            <span className={styles.optionSub}>Move NGN from your business float instantly</span>
          </span>
          <ChevronRight size={16} className={styles.optionChevron} aria-hidden />
        </button>

        <button
          type="button"
          className={styles.optionItem}
          onClick={() => setSelectedMethod('crypto')}
        >
          <span className={styles.optionIcon} aria-hidden>
            <Coins size={18} />
          </span>
          <span className={styles.optionText}>
            <span className={styles.optionLabel}>Crypto deposit</span>
            <span className={styles.optionSub}>
              {resolvedDeposit?.asset
                ? `Send ${resolvedDeposit.asset} on any supported network`
                : 'Stablecoin deposit to your program wallet'}
            </span>
          </span>
          <ChevronRight size={16} className={styles.optionChevron} aria-hidden />
        </button>

        <button
          type="button"
          className={styles.optionItem}
          onClick={() => setSelectedMethod('bank')}
        >
          <span className={styles.optionIcon} aria-hidden>
            <Landmark size={18} />
          </span>
          <span className={styles.optionText}>
            <span className={styles.optionLabel}>Bank transfer</span>
            <span className={styles.optionSub}>USD ACH and wire — coming soon</span>
          </span>
          <ChevronRight size={16} className={styles.optionChevron} aria-hidden />
        </button>
      </div>
    </>
  )

  const ngnContent =
    step === 'success' ? (
      <div className={`${fundStyles.morphContent} ${fundStyles.success}`}>
        <div className={fundStyles.successIcon}>
          <CheckIcon />
        </div>
        <h3 className={fundStyles.successTitle}>Conversion complete</h3>
        <p className={fundStyles.successAmount}>{usd(convertedUsd)}</p>
        <p className={fundStyles.successSub}>
          Your USD virtual card balance has been updated. You can issue or fund cards right away.
        </p>
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    ) : (
      <div className={fundStyles.form}>
        <p className={styles.hint}>
          Move NGN from your business float into your USD virtual card balance. Rate includes a{' '}
          {quote?.exchange_rate.markup_percentage ?? 5}% markup on Nyra&apos;s live USD/NGN rate.
        </p>

        <div className={fundStyles.field}>
          <span className={fundStyles.label}>Amount to convert</span>
          <div className={fundStyles.amountInputWrap}>
            <span className={fundStyles.amountPrefix}>$</span>
            <input
              className={fundStyles.amountInput}
              type="number"
              min={MIN_USD}
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amountUsd}
              onChange={event => setAmountUsd(event.target.value)}
            />
          </div>
          <span className={fundStyles.amountHint}>
            NGN available: {naira(ngnAvailable)} · Minimum {usd(MIN_USD)}
          </span>
        </div>

        {quoteLoading && amountValid && <p className={styles.hint}>Fetching live rate…</p>}
        {quoteError && <p className={styles.error}>{quoteError}</p>}

        {quote && amountValid && !quoteLoading && (
          <div className={styles.quoteBox}>
            <div className={styles.quoteRow}>
              <span className={styles.quoteLabel}>You pay</span>
              <span className={styles.quoteValue}>{naira(quote.amount_ngn)}</span>
            </div>
            <div className={styles.quoteRow}>
              <span className={styles.quoteLabel}>You receive</span>
              <span className={styles.quoteValue}>{usd(quote.amount_usd)}</span>
            </div>
            <div className={styles.quoteRow}>
              <span className={styles.quoteLabel}>Rate</span>
              <span className={styles.quoteValueMuted}>
                {naira(quote.exchange_rate.naira_per_usd)} / $1
              </span>
            </div>
          </div>
        )}

        {quote && quote.amount_ngn > ngnAvailable && amountValid && (
          <p className={styles.error}>Insufficient NGN balance for this conversion.</p>
        )}

        <Button
          variant="primary"
          disabled={!canConvert}
          loading={converting}
          onClick={() => void handleConvert()}
        >
          Convert
        </Button>
      </div>
    )

  const cryptoContent = loading ? (
    <div className={styles.loadingState}>
      <div className={styles.skeletonQr} />
      <div className={styles.skeleton} />
      <div className={styles.skeleton} />
    </div>
  ) : !resolvedDeposit?.asset ? (
    <div className={styles.sheetStage}>
      <EmptyState
        variant="sheet"
        icon={<Coins size={26} strokeWidth={1.75} />}
        title="Crypto deposit unavailable"
        description="Stablecoin funding isn't enabled for your account yet. Use NGN conversion or contact support."
      />
    </div>
  ) : (
    <div className={styles.cryptoDetail}>
      <p className={styles.hint}>
        {cryptoOnly
          ? 'Choose a network, then scan the QR code or copy the address. Deposits are credited after on-chain confirmation.'
          : 'Choose a network, then scan the QR code or copy the address. Deposits are credited to your virtual card balance after on-chain confirmation.'}
      </p>

      {networkPills.length > 1 && (
        <div className={styles.addressBlock}>
          <span className={styles.fieldLabel}>Network</span>
          <div className={styles.networkPills} role="tablist" aria-label="Deposit network">
            {networkPills.map(network => {
              const active = networksMatch(network, selectedNetwork)
              return (
                <button
                  key={network}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`${styles.networkPill} ${active ? styles.networkPillActive : ''}`}
                  onClick={() => {
                    setSelectedNetwork(network)
                    setAddressCopied(false)
                  }}
                >
                  {formatNetworkLabel(network)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {generateError && <p className={styles.error}>{generateError}</p>}

      {generatingAddress || !activeAddress ? (
        <div className={styles.loadingState}>
          <div className={styles.skeletonQr} />
          <div className={styles.skeleton} />
          <p className={styles.hint}>
            {generatingAddress
              ? `Generating ${formatNetworkLabel(activeNetwork)} address…`
              : generateError
                ? 'Address unavailable for this network.'
                : 'Select a network to generate a deposit address.'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.qrWrap}>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Deposit address QR code"
                className={styles.qrImage}
                width={168}
                height={168}
              />
            ) : (
              <div className={styles.skeletonQrInline} aria-hidden />
            )}
          </div>

          <div className={styles.addressBlock}>
            <span className={styles.fieldLabel}>Deposit address</span>
            <div className={styles.addressRow}>
              <code className={styles.addressValue}>{activeAddress}</code>
              <button
                type="button"
                className={styles.copyIconBtn}
                aria-label={addressCopied ? 'Address copied' : 'Copy deposit address'}
                onClick={() => void copyAddress(activeAddress)}
              >
                {addressCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </>
      )}

      <ul className={styles.metaList}>
        <li className={styles.metaItem}>
          <span className={styles.metaLabel}>Asset</span>
          <span className={styles.metaValue}>{resolvedDeposit.asset}</span>
        </li>
        <li className={styles.metaItem}>
          <span className={styles.metaLabel}>Network</span>
          <span className={styles.metaValue}>{formatNetworkLabel(activeNetwork) || '—'}</span>
        </li>
        {resolvedDeposit.min_deposit && (
          <li className={styles.metaItem}>
            <span className={styles.metaLabel}>Minimum deposit</span>
            <span className={styles.metaValue}>{resolvedDeposit.min_deposit} {resolvedDeposit.asset}</span>
          </li>
        )}
      </ul>

      {activeAddress && (
        <p className={styles.warning}>
          Only send {resolvedDeposit.asset} on {formatNetworkLabel(activeNetwork)}. Sending other
          assets or using the wrong network may result in permanent loss.
        </p>
      )}
    </div>
  )

  const bankContent = (
    <div className={styles.sheetStage}>
      <EmptyState
        variant="sheet"
        icon={<Landmark size={26} strokeWidth={1.75} />}
        title="Bank transfer"
        description="USD ACH and wire account numbers are on the way. Use NGN conversion or crypto deposit in the meantime."
      />
    </div>
  )

  const layers: SheetLayer[] = [
    {
      key: `${selectedMethod ?? 'methods'}-${step}`,
      title: sheetTitle(),
      showBack: Boolean(
        selectedMethod &&
          !cryptoOnly &&
          !(selectedMethod === 'ngn' && step === 'success'),
      ),
      onBack: handleBack,
      children: sheetContent(),
    },
  ]

  return <SideSheetStack open={open} onClose={onClose} layers={layers} />
}
