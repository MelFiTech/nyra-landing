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

function normalizeBankKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Resolve a bank from cached list by code or name. */
export function findBank(
  banks: Bank[],
  query?: { bankCode?: string | null; bankName?: string | null },
): Bank | undefined {
  if (!banks.length || !query) return undefined
  const code = query.bankCode?.trim()
  if (code) {
    const byCode = banksByCode(banks)
    if (byCode[code]) return byCode[code]
    // NIP / provider codes sometimes drop or add leading zeros
    const padded = code.padStart(3, '0')
    if (byCode[padded]) return byCode[padded]
    const unpadded = code.replace(/^0+/, '') || code
    if (byCode[unpadded]) return byCode[unpadded]
    const match = banks.find(b => {
      const codes = [b.bank_code, b.bank_long_code].filter(Boolean) as string[]
      return codes.some(c => c === code || c.replace(/^0+/, '') === unpadded)
    })
    if (match) return match
  }
  const name = query.bankName?.trim()
  if (!name) return undefined
  const exact = banks.find(b => b.bank_name.toLowerCase() === name.toLowerCase())
  if (exact) return exact
  const key = normalizeBankKey(name)
  return banks.find(b => {
    const bankKey = normalizeBankKey(b.bank_name)
    return bankKey === key || bankKey.includes(key) || key.includes(bankKey)
  })
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
