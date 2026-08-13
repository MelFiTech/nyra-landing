import type { CryptoAsset, CryptoMasterWallet } from './api'

const STABLECOIN_ASSETS = new Set(['USDT', 'USDC', 'PYUSD'])

export function isStablecoinAsset(asset: string) {
  return STABLECOIN_ASSETS.has(asset.trim().toUpperCase())
}

export function formatNetworkLabel(network?: string) {
  if (!network) return '—'
  const value = network.trim().toLowerCase()
  if (value === 'trc20' || value === 'tron' || value === 'trx') return 'TRC20'
  if (value === 'erc20' || value === 'eth' || value === 'ethereum') return 'ERC20'
  if (value === 'bep20' || value === 'bsc') return 'BEP20'
  if (value === 'sol' || value === 'solana') return 'Solana'
  if (value === 'polygon' || value === 'matic') return 'Polygon'
  if (value === 'base') return 'Base'
  return network.replace(/_/g, ' ').toUpperCase()
}

export function normalizeNetworkKey(network?: string) {
  return String(network ?? '').trim().toLowerCase()
}

export function networksMatch(a?: string, b?: string) {
  return normalizeNetworkKey(a) === normalizeNetworkKey(b)
}

export function floatWalletKey(wallet: Pick<CryptoMasterWallet, 'master_wallet_id' | 'asset' | 'network'>) {
  return wallet.master_wallet_id || `${wallet.asset}:${wallet.network}`
}

export function floatWalletLabel(wallet: Pick<CryptoMasterWallet, 'asset' | 'network'>) {
  return `${wallet.asset} · ${formatNetworkLabel(wallet.network)}`
}

export function formatCryptoAmount(
  value: number | string | undefined | null,
  asset: string,
  masked = false,
) {
  if (masked) return '••••'
  const n = Number(value ?? 0)
  const decimals = isStablecoinAsset(asset) ? 2 : 8
  return `${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })} ${asset.toUpperCase()}`
}

export function networkOptions(asset: CryptoAsset | null) {
  if (!asset) return []
  const networks = asset.networks?.length
    ? asset.networks
    : [asset.default_network ?? asset.network].filter(Boolean)
  return networks as string[]
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
    const chains = networkOptions(item)
    for (const chain of chains) {
      const taken = existing.some(
        wallet =>
          wallet.asset.toUpperCase() === item.asset.toUpperCase() &&
          networksMatch(wallet.network, chain),
      )
      if (taken) continue
      slots.push({
        asset: item.asset,
        chain,
        label: item.label || item.asset,
        networkLabel: formatNetworkLabel(chain),
      })
    }
  }

  return slots
}
