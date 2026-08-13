import type { DocEndpoint, DocParam } from './types'

/** Public Business API base URL shown in developer docs (never local dev). */
export const DOCS_API_BASE_URL = 'https://api.nyrawallet.com/api/v1'

export function getDocsApiBaseUrl(): string {
  return DOCS_API_BASE_URL
}

/** @alias getDocsApiBaseUrl. Docs samples always use production base URL. */
export function getApiBaseUrl(): string {
  return getDocsApiBaseUrl()
}

function buildBodyObject(endpoint: DocEndpoint, values: Record<string, string>): Record<string, unknown> | null {
  const bodyParams = endpoint.params?.filter(p => p.location === 'body') ?? []
  if (bodyParams.length === 0) return null

  const root: Record<string, unknown> = {}

  for (const param of bodyParams) {
    const raw = values[param.name] ?? param.defaultValue ?? param.example ?? ''
    if (!raw && !param.required) continue

    if (param.name.includes('.')) {
      const [parent, child] = param.name.split('.')
      const bucket = (root[parent] as Record<string, unknown>) ?? {}
      bucket[child] = coerceValue(param, raw)
      root[parent] = bucket
    } else {
      root[param.name] = coerceValue(param, raw)
    }
  }

  return Object.keys(root).length > 0 ? root : null
}

function coerceValue(param: DocParam, raw: string): unknown {
  if (param.type === 'number') {
    const n = Number(raw)
    return Number.isFinite(n) ? n : raw
  }
  if (param.type === 'boolean') {
    return raw === 'true' || raw === '1'
  }
  return raw
}

function buildQueryString(endpoint: DocEndpoint, values: Record<string, string>): string {
  const queryParams = endpoint.params?.filter(p => p.location === 'query') ?? []
  const parts: string[] = []
  for (const p of queryParams) {
    const raw = values[p.name] ?? p.defaultValue ?? p.example ?? ''
    if (!raw && !p.required) continue
    parts.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(raw)}`)
  }
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

export function buildCurl(
  endpoint: DocEndpoint,
  values: Record<string, string>,
  clientId: string,
  clientSecret: string,
): string {
  const base = getApiBaseUrl()
  const path = resolvePath(endpoint.path, values)
  const qs = buildQueryString(endpoint, values)
  const url = endpoint.path === '/' ? base : `${base}${path}${qs}`
  const body = buildBodyObject(endpoint, values)
  const lines = [`curl --request ${endpoint.method} \\`, `  --url '${url}' \\`]

  if (clientId) {
    lines.push(`  --header 'x-client-id: ${clientId}' \\`)
  }
  if (clientSecret) {
    lines.push(`  --header 'Authorization: Bearer ${clientSecret}' \\`)
  }
  if (body && endpoint.method !== 'GET') {
    lines.push(`  --header 'Content-Type: application/json' \\`)
    lines.push(`  --data '${JSON.stringify(body, null, 2).replace(/'/g, "'\\''")}'`)
  } else {
    const last = lines.length - 1
    lines[last] = lines[last].replace(/ \\$/, '')
  }

  return lines.join('\n')
}

export function resolvePath(path: string, values: Record<string, string>): string {
  return path.replace(/\{([^}]+)\}/g, (_, key: string) => encodeURIComponent(values[key] ?? `{${key}}`))
}

export function buildSampleCurl(endpoint: DocEndpoint): string {
  const values = initialParamValues(endpoint)
  return buildCurl(endpoint, values, 'your_client_id', 'live_sk_your_client_secret')
}

export async function tryApiRequest(
  endpoint: DocEndpoint,
  values: Record<string, string>,
  clientId: string,
  clientSecret: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  if (endpoint.id === 'authentication') {
    return {
      ok: false,
      status: 0,
      body: 'Pick an API endpoint from the sidebar to send a request.',
    }
  }

  const base = getApiBaseUrl()
  const path = resolvePath(endpoint.path, values)
  const qs = buildQueryString(endpoint, values)
  const url = `${base}${path}${qs}`
  const body = buildBodyObject(endpoint, values)

  const headers: Record<string, string> = {}
  if (clientId) headers['x-client-id'] = clientId
  if (clientSecret) headers['Authorization'] = `Bearer ${clientSecret}`
  if (body && endpoint.method !== 'GET') {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, {
    method: endpoint.method,
    headers,
    body: body && endpoint.method !== 'GET' ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let formatted = text
  try {
    formatted = JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    /* keep raw */
  }

  return { ok: res.ok, status: res.status, body: formatted }
}

export function initialParamValues(endpoint: DocEndpoint): Record<string, string> {
  const values: Record<string, string> = {}
  for (const p of endpoint.params ?? []) {
    values[p.name] = p.defaultValue ?? p.example ?? ''
  }
  return values
}
