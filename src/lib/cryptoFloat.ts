import type {
  CryptoAsset,
  CryptoDepositAddressEntry,
  CryptoMasterWallet,
  CustomerCryptoWallet,
  UsdCryptoDeposit,
} from './api'

const STABLECOIN_ASSETS = new Set(['USDT', 'USDC', 'PYUSD'])
const UNIFIED_NETWORK = 'unified'

/** Canonical Nyra network keys, matching backend alias maps (Bitnob / Maplerad / Quidax). */
const NETWORK_ALIASES: Record<string, string> = {
  trc20: 'trc20',
  trx: 'trc20',
  tron: 'trc20',
  erc20: 'erc20',
  eth: 'erc20',
  ethereum: 'erc20',
  bep20: 'bep20',
  bsc: 'bep20',
  bnb: 'bep20',
  sol: 'solana',
  solana: 'solana',
  polygon: 'polygon',
  matic: 'polygon',
  base: 'base',
  stellar: 'stellar',
  bitcoin: 'bitcoin',
  btc: 'bitcoin',
  unified: UNIFIED_NETWORK,
}

export type CryptoDepositOption = {
  network: string
  address: string
}

export function isStablecoinAsset(asset?: string | null) {
  return STABLECOIN_ASSETS.has(String(asset ?? '').trim().toUpperCase())
}

/** On-chain send from master float (not USD card-program balance). */
export function isFloatTransferAsset(asset?: string | null) {
  return String(asset ?? '').trim().toUpperCase() === 'BTC'
}

/** Default withdrawal network for BTC float sends (Bitnob unified wallets use network=unified). */
export function defaultTransferChainForAsset(asset?: string | null) {
  if (String(asset ?? '').trim().toUpperCase() === 'BTC') return 'bitcoin'
  return ''
}

export function canTransferFromFloatWallet(asset?: string | null) {
  return isStablecoinAsset(asset) || isFloatTransferAsset(asset)
}

export function isUnifiedCryptoNetwork(network?: string) {
  return normalizeNetworkKey(network) === UNIFIED_NETWORK
}

export function normalizeNetworkKey(network?: string) {
  const value = String(network ?? '').trim().toLowerCase()
  if (!value) return ''
  return NETWORK_ALIASES[value] || value.replace(/_/g, '')
}

export function networksMatch(a?: string, b?: string) {
  const left = normalizeNetworkKey(a)
  const right = normalizeNetworkKey(b)
  return Boolean(left) && left === right
}

export function formatNetworkLabel(network?: string) {
  if (!network) return '—'
  if (isUnifiedCryptoNetwork(network)) return 'All networks'
  const key = normalizeNetworkKey(network)
  if (key === 'trc20') return 'TRC20'
  if (key === 'erc20') return 'ERC20'
  if (key === 'bep20') return 'BEP20'
  if (key === 'solana') return 'Solana'
  if (key === 'polygon') return 'Polygon'
  if (key === 'base') return 'Base'
  if (key === 'stellar') return 'Stellar'
  if (key === 'bitcoin') return 'Bitcoin'
  return network.replace(/_/g, ' ').toUpperCase()
}

export function floatWalletKey(wallet: Pick<CryptoMasterWallet, 'master_wallet_id' | 'asset' | 'network'>) {
  return wallet.master_wallet_id || `${wallet.asset}:${wallet.network}`
}

export function floatWalletLabel(wallet: Pick<CryptoMasterWallet, 'asset' | 'network' | 'networks' | 'deposit_addresses'>) {
  if (isStablecoinAsset(wallet.asset) || isUnifiedCryptoNetwork(wallet.network)) {
    return wallet.asset
  }
  return `${wallet.asset} · ${formatWalletNetworks(wallet)}`
}

export function formatCryptoAmount(
  value: number | string | undefined | null,
  asset?: string | null,
  masked = false,
) {
  if (masked) return '••••'
  const n = Number(value ?? 0)
  const decimals = isStablecoinAsset(asset) ? 2 : 8
  const symbol = String(asset ?? '').toUpperCase()
  return `${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })}${symbol ? ` ${symbol}` : ''}`
}

export function formatUsdAmount(
  value: number | string | undefined | null,
  masked = false,
) {
  if (masked) return '$••••'
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '—'
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Crypto amount with USD equivalent for BTC whenever a rate/value is available. */
export function formatCryptoAmountWithUsd(
  value: number | string | undefined | null,
  asset?: string | null,
  opts?: {
    masked?: boolean
    usdRate?: number | null
    usdValue?: number | string | null
  },
) {
  const masked = opts?.masked === true
  const base = formatCryptoAmount(value, asset, masked)
  if (masked || !isFloatTransferAsset(asset)) return base

  let usd: number | null = null
  if (opts?.usdValue != null && String(opts.usdValue).trim() !== '') {
    const fromValue = Number(opts.usdValue)
    if (Number.isFinite(fromValue)) usd = fromValue
  } else {
    const amount = Number(value ?? 0)
    const rate = Number(opts?.usdRate ?? 0)
    if (Number.isFinite(amount) && Number.isFinite(rate) && rate > 0) {
      usd = amount * rate
    }
  }

  if (usd == null) return base
  return `${base} (≈ ${formatUsdAmount(usd)})`
}

export function networkOptions(asset: CryptoAsset | null) {
  if (!asset) return []
  const networks = asset.networks?.length
    ? asset.networks
    : [asset.default_network ?? asset.network].filter(Boolean)
  return uniqueNetworks(networks as string[])
}

export function uniqueNetworks(networks: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const network of networks) {
    const key = normalizeNetworkKey(network) || network
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(network)
  }
  return out
}

export function listWalletDepositOptions(
  wallet: Pick<CryptoMasterWallet | CustomerCryptoWallet, 'network' | 'deposit_addresses' | 'networks'> & {
    deposit_address?: string
  },
): CryptoDepositOption[] {
  const fromMap = Object.values(wallet.deposit_addresses ?? {})
    .filter((entry): entry is CryptoDepositAddressEntry => Boolean(entry?.address))
    .map(entry => ({
      network: entry.network || wallet.network,
      address: entry.address,
    }))

  if (fromMap.length > 0) return uniqueDepositOptions(fromMap)

  if (wallet.deposit_address && !isUnifiedCryptoNetwork(wallet.network)) {
    return [{ network: wallet.network, address: wallet.deposit_address }]
  }

  if (wallet.deposit_address) {
    return [{ network: wallet.networks?.[0] || wallet.network, address: wallet.deposit_address }]
  }

  return []
}

function uniqueDepositOptions(options: CryptoDepositOption[]) {
  const seen = new Set<string>()
  const out: CryptoDepositOption[] = []
  for (const option of options) {
    const key = `${normalizeNetworkKey(option.network)}:${option.address}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(option)
  }
  return out
}

export function formatWalletNetworks(
  wallet: Pick<CryptoMasterWallet | CustomerCryptoWallet, 'asset' | 'network' | 'networks' | 'deposit_addresses'>,
) {
  if (isStablecoinAsset(wallet.asset) || isUnifiedCryptoNetwork(wallet.network)) {
    return ''
  }

  const labels = uniqueNetworks([
    ...Object.values(wallet.deposit_addresses ?? {}).map(entry => entry.network),
    ...(wallet.networks ?? []),
    wallet.network,
  ]).map(formatNetworkLabel)

  if (labels.length === 0) return ''
  if (labels.length <= 2) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
}

export function walletCoversNetwork(
  wallet: Pick<CryptoMasterWallet | CustomerCryptoWallet, 'asset' | 'network' | 'networks' | 'deposit_addresses'>,
  asset: string,
  chain: string,
) {
  if (wallet.asset.toUpperCase() !== asset.toUpperCase()) return false
  if (isStablecoinAsset(wallet.asset) || isUnifiedCryptoNetwork(wallet.network)) {
    return true
  }
  if ((wallet.networks ?? []).some(network => networksMatch(network, chain))) return true
  return networksMatch(wallet.network, chain)
}

export function transferNetworksForWallet(
  wallet: Pick<CryptoMasterWallet, 'asset' | 'network' | 'networks' | 'deposit_addresses'>,
  assets: CryptoAsset[],
) {
  const asset = String(wallet.asset ?? '').trim().toUpperCase()
  if (asset === 'BTC') {
    const fromWallet = uniqueNetworks([
      ...(wallet.networks ?? []),
      ...listWalletDepositOptions(wallet).map(option => option.network),
      wallet.network,
    ]).filter(network => !isUnifiedCryptoNetwork(network))
    return fromWallet.length > 0 ? fromWallet : [defaultTransferChainForAsset('BTC')]
  }

  if (isStablecoinAsset(wallet.asset) || isUnifiedCryptoNetwork(wallet.network)) {
    const catalog = assets.find(item => item.asset.toUpperCase() === wallet.asset.toUpperCase())
    const fromCatalog = networkOptions(catalog ?? null)
    const fromWallet = uniqueNetworks([
      ...(wallet.networks ?? []),
      ...listWalletDepositOptions(wallet).map(option => option.network),
    ])
    return fromCatalog.length > 0 ? fromCatalog : fromWallet
  }
  return uniqueNetworks([wallet.network].filter(Boolean))
}

export function walletToCryptoDeposit(
  wallet?: CryptoMasterWallet | null,
  minDeposit = '1',
): UsdCryptoDeposit | null {
  if (!wallet || typeof wallet !== 'object') return null
  const options = listWalletDepositOptions(wallet)
  const primary = options[0]
  const unified = isStablecoinAsset(wallet.asset) || isUnifiedCryptoNetwork(wallet.network)
  return {
    asset: wallet.asset,
    network: unified ? 'unified' : (primary?.network || wallet.network),
    deposit_address: primary?.address || wallet.deposit_address,
    min_deposit: minDeposit,
    deposit_addresses: wallet.deposit_addresses,
    networks: uniqueNetworks([
      ...(Array.isArray(wallet.networks) ? wallet.networks : []),
      ...options.map(option => option.network),
    ]),
  }
}

export type FloatWalletSlot = {
  asset: string
  chain: string
  label: string
  networkLabel: string
}

export function listAvailableFloatSlots(
  assets: CryptoAsset[],
  existing: CryptoMasterWallet[],
): FloatWalletSlot[] {
  const slots: FloatWalletSlot[] = []

  for (const item of assets) {
    const alreadyIssued = existing.some(
      wallet => wallet.asset.toUpperCase() === item.asset.toUpperCase(),
    )
    if (alreadyIssued) continue

    const defaultChain = item.default_network ?? networkOptions(item)[0]
    if (!defaultChain) continue

    slots.push({
      asset: item.asset,
      chain: defaultChain,
      label: item.label || item.asset,
      networkLabel: isStablecoinAsset(item.asset) ? '' : formatNetworkLabel(defaultChain),
    })
  }

  return slots
}
