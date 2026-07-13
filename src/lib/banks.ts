import { bankApi, type Bank } from './api'

const CACHE_KEY = 'nyra.banks.v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

type CachedBanks = {
  savedAt: number
  banks: Bank[]
}

let memoryCache: Bank[] | null = null

function readLocalCache(): Bank[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedBanks
    if (!parsed?.banks?.length || !parsed.savedAt) return null
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null
    return parsed.banks
  } catch {
    return null
  }
}

function writeLocalCache(banks: Bank[]) {
  try {
    const payload: CachedBanks = { savedAt: Date.now(), banks }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Prefer SVG for web; fall back to PNG. */
export function bankLogoSrc(
  bank?: Pick<Bank, 'logo_url' | 'logo_url_svg'> | null,
): string | null {
  if (!bank) return null
  return bank.logo_url_svg || bank.logo_url || null
}

export function bankInitials(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'B'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function banksByCode(banks: Bank[]): Record<string, Bank> {
  const map: Record<string, Bank> = {}
  for (const bank of banks) {
    if (bank.bank_code) map[bank.bank_code] = bank
    if (bank.bank_long_code) map[bank.bank_long_code] = bank
  }
  return map
}

/**
 * Load banks once (memory → localStorage → API).
 * Logos come on the same list endpoint — no extra request.
 */
export async function loadBanks(options?: { force?: boolean }): Promise<Bank[]> {
  if (!options?.force) {
    if (memoryCache?.length) return memoryCache
    const local = readLocalCache()
    if (local?.length) {
      memoryCache = local
      return local
    }
  }

  const banks = await bankApi.listBanks()
  memoryCache = banks
  writeLocalCache(banks)
  return banks
}

export function getCachedBanks(): Bank[] {
  if (memoryCache?.length) return memoryCache
  return readLocalCache() ?? []
}
