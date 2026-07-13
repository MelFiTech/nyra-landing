// Thin client for the Nyra Wallet backend (NestJS, global prefix /api/v1).

import type { BusinessTeamRole, TeamMember } from './teamPermissions'

export type { BusinessTeamRole, TeamMember }

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:2900/api/v1'

// ── Session ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'nyra-auth-token'
const USER_KEY = 'nyra-auth-user'
const BUSINESS_KEY = 'nyra-business' // legacy single-business key (fallback)
const BUSINESSES_KEY = 'nyra-businesses'
const SELECTED_BUSINESS_KEY = 'nyra-selected-business'

export type SessionUser = {
  user_id: string
  email: string
  firstname: string
  lastname: string
  [key: string]: unknown
}

export type Business = {
  id: string
  name: string
  alias: string
  address: string
  business_type: string
  verification_status: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  [key: string]: unknown
}

export const session = {
  get token() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  get user(): SessionUser | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },
  setUser(user: SessionUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  /** All businesses the user owns. Falls back to the legacy single-business key. */
  get businesses(): Business[] {
    const raw = localStorage.getItem(BUSINESSES_KEY)
    if (raw) {
      try { return JSON.parse(raw) } catch { /* ignore */ }
    }
    const legacy = localStorage.getItem(BUSINESS_KEY)
    return legacy ? [JSON.parse(legacy)] : []
  },
  setBusinesses(list: Business[]) {
    localStorage.setItem(BUSINESSES_KEY, JSON.stringify(list))
    // keep the selected id valid (default to first)
    const selected = localStorage.getItem(SELECTED_BUSINESS_KEY)
    if (!selected || !list.some(b => b.id === selected)) {
      if (list[0]) localStorage.setItem(SELECTED_BUSINESS_KEY, list[0].id)
      else localStorage.removeItem(SELECTED_BUSINESS_KEY)
    }
  },
  get selectedBusinessId(): string | null {
    const id = localStorage.getItem(SELECTED_BUSINESS_KEY)
    const list = this.businesses
    if (id && (list.length === 0 || list.some(b => b.id === id))) return id
    return list[0]?.id ?? null
  },
  setSelectedBusiness(id: string) {
    localStorage.setItem(SELECTED_BUSINESS_KEY, id)
  },
  /** The currently active business (selected one, else first). */
  get business(): Business | null {
    const list = this.businesses
    if (list.length === 0) return null
    const id = this.selectedBusinessId
    return list.find(b => b.id === id) ?? list[0]
  },
  /** Registers/sets a single business (e.g. right after signup). */
  setBusiness(business: Business) {
    const existing = this.businesses.filter(b => b.id !== business.id)
    const list = [...existing, business]
    localStorage.setItem(BUSINESSES_KEY, JSON.stringify(list))
    localStorage.setItem(SELECTED_BUSINESS_KEY, business.id)
    localStorage.removeItem(BUSINESS_KEY)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(BUSINESS_KEY)
    localStorage.removeItem(BUSINESSES_KEY)
    localStorage.removeItem(SELECTED_BUSINESS_KEY)
  },
}

// ── Fetch wrapper ───────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** multipart FormData — sent as-is, no JSON headers */
  formData?: FormData
  auth?: boolean
  /** Abort the request after this many ms (default 25s). */
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 25_000

async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, auth = true, timeoutMs = DEFAULT_TIMEOUT_MS } = opts

  const headers: Record<string, string> = {}
  if (!formData) headers['Content-Type'] = 'application/json'
  if (auth && session.token) {
    headers['Authorization'] = `Bearer ${session.token}`
    // scope guard-based dashboard endpoints to the active business
    const selected = session.selectedBusinessId
    if (selected) headers['x-business-id'] = selected
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out. Check your connection and try again.', 0)
    }
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0)
  } finally {
    window.clearTimeout(timeoutId)
  }

  let json: any = null
  try {
    json = await res.json()
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    // expired/invalid token: clear the session and send the user to login
    if (res.status === 401 && auth && session.token) {
      session.clear()
      window.location.href = '/app/login'
    }
    const message =
      (Array.isArray(json?.message) ? json.message[0] : json?.message) ||
      json?.error ||
      `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  return json as T
}

// ── Auth ────────────────────────────────────────────────────────────────

type RawAuthResponse = {
  data?: {
    user?: Record<string, unknown>
    token?: string
    tokens?: {
      accessToken?: string
      refreshToken?: string
      expiresIn?: number
    }
  }
  token?: string
  user?: Record<string, unknown>
}

function normalizeSessionUser(raw: Record<string, unknown>): SessionUser {
  const fullName = String(raw.fullName ?? raw.full_name ?? '').trim()
  let firstname = String(raw.firstname ?? raw.firstName ?? '').trim()
  let lastname = String(raw.lastname ?? raw.lastName ?? '').trim()

  if (!firstname && fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean)
    firstname = parts[0] ?? ''
    lastname = parts.slice(1).join(' ')
  }

  return {
    user_id: String(raw.user_id ?? raw.id ?? raw.userId ?? ''),
    email: String(raw.email ?? ''),
    firstname,
    lastname,
    ...raw,
  }
}

/** Backend signin returns data.tokens.accessToken; signup returns data.token. */
function applyAuthSession(res: RawAuthResponse, businesses?: Business[]) {
  const nested = res.data
  const token =
    nested?.tokens?.accessToken ??
    nested?.token ??
    res.token
  const rawUser = nested?.user ?? res.user

  if (!token || !rawUser || typeof rawUser !== 'object') {
    throw new ApiError('Invalid auth response from server', 500)
  }

  const user = normalizeSessionUser(rawUser)
  session.setToken(token)
  session.setUser(user)
  if (businesses?.length) session.setBusinesses(businesses)
  return { token, user }
}

export type BusinessSigninChallenge = {
  requiresOtp: true
  otpToken: string
  expiresIn: number
  email: string
  businesses: Business[]
}

type BusinessSigninStep1Response = {
  data: BusinessSigninChallenge
  message?: string
}

type BusinessSigninOtpResponse = RawAuthResponse & {
  data?: RawAuthResponse['data'] & {
    businesses?: Business[]
  }
}

type BusinessResendOtpResponse = {
  data: {
    requiresOtp: true
    otpToken: string
    expiresIn: number
    email: string
  }
  message?: string
}

export const authApi = {
  /** Step 1: send a registration OTP to the email. Returns the OTP token. */
  async signupVerify(email: string): Promise<string> {
    const res = await request<{ token: string }>('/auth/signup-verify', {
      method: 'POST',
      body: { field: email },
      auth: false,
    })
    return res.token
  },

  /** Step 2: verify the emailed OTP. */
  verifyEmail(email: string, otp: string, token: string) {
    return request('/auth/verify/email', {
      method: 'POST',
      body: { email, otp, token },
      auth: false,
    })
  },

  /** Step 3: create the user. Returns JWT + user. */
  async signup(data: { email: string; password: string; firstname: string; lastname: string }) {
    const res = await request<RawAuthResponse>('/auth/signup', {
      method: 'POST',
      body: data,
      auth: false,
    })
    return applyAuthSession(res)
  },

  /** Email-first lookup: password login vs invited set-password. */
  async businessSigninLookup(field: string): Promise<{
    next: 'password' | 'set_password' | 'invite_expired'
    email: string
    name?: string | null
    businessName?: string | null
  }> {
    const res = await request<{
      data: {
        next: 'password' | 'set_password' | 'invite_expired'
        email: string
        name?: string | null
        businessName?: string | null
      }
    }>('/auth/business/signin/lookup', {
      method: 'POST',
      body: { field: field.trim().toLowerCase() },
      auth: false,
    })
    if (!res.data?.next) {
      throw new ApiError('Unexpected login lookup response from server', 500)
    }
    return res.data
  },

  /** Invited team member: set password, then receive login OTP. */
  async businessSetPassword(field: string, password: string): Promise<BusinessSigninChallenge> {
    const res = await request<BusinessSigninStep1Response>('/auth/business/signin/set-password', {
      method: 'POST',
      body: { field: field.trim().toLowerCase(), password },
      auth: false,
      timeoutMs: 60_000,
    })
    const payload = res.data
    const otpToken = payload?.otpToken ?? (payload as { token?: string } | undefined)?.token
    if (!otpToken) {
      throw new ApiError('Unexpected set-password response from server', 500)
    }
    return {
      requiresOtp: true,
      otpToken,
      expiresIn: payload?.expiresIn ?? 600,
      email: payload?.email ?? field.trim().toLowerCase(),
      businesses: payload?.businesses ?? [],
    }
  },

  /** Business dashboard login step 1: password check, email OTP issued (no JWT). */
  async businessSignin(field: string, password: string): Promise<BusinessSigninChallenge> {
    const res = await request<BusinessSigninStep1Response>('/auth/business/signin', {
      method: 'POST',
      body: { field: field.trim().toLowerCase(), password },
      auth: false,
      timeoutMs: 60_000,
    })
    const payload = res.data
    const otpToken = payload?.otpToken ?? (payload as { token?: string } | undefined)?.token
    if (!otpToken) {
      throw new ApiError('Unexpected login response from server', 500)
    }
    return {
      requiresOtp: true,
      otpToken,
      expiresIn: payload?.expiresIn ?? 600,
      email: payload?.email ?? field.trim().toLowerCase(),
      businesses: payload?.businesses ?? [],
    }
  },

  /** Business dashboard login step 2: verify OTP and issue JWT. */
  async businessSigninOtp(field: string, otpToken: string, otp: string) {
    const res = await request<BusinessSigninOtpResponse>('/auth/business/signin/otp', {
      method: 'POST',
      body: {
        field: field.trim().toLowerCase(),
        otpToken,
        otp,
      },
      auth: false,
    })
    return applyAuthSession(res, res.data?.businesses)
  },

  /** Resend business login OTP; returns a new otpToken. */
  async businessResendOtp(field: string) {
    const res = await request<BusinessResendOtpResponse>('/auth/business/signin/resend-otp', {
      method: 'POST',
      body: { field: field.trim().toLowerCase() },
      auth: false,
    })
    if (!res.data?.otpToken) {
      throw new ApiError('Could not resend verification code', 500)
    }
    return res.data
  },

  /** @deprecated Use businessSignin + businessSigninOtp for the business dashboard. */
  async signin(email: string, password: string) {
    const res = await request<RawAuthResponse>('/auth/signin', {
      method: 'POST',
      body: { field: email, password },
      auth: false,
    })
    return applyAuthSession(res)
  },
}

// ── Business ────────────────────────────────────────────────────────────

export type BusinessNotificationPreferences = {
  email_float_topups: boolean
  email_customer_collection_credits: boolean
}

export const businessApi = {
  async register(data: { business_name: string; business_type: string; address: string }) {
    const res = await request<{ data: Business }>('/business/register', {
      method: 'POST',
      body: data,
    })
    session.setBusiness(res.data)
    return res.data
  },

  async getAll(): Promise<Business[]> {
    const res = await request<{ data: Business[] }>('/business/all')
    if (res.data) session.setBusinesses(res.data)
    return res.data
  },

  async getNotificationPreferences(businessId: string): Promise<BusinessNotificationPreferences> {
    const res = await request<{ data: BusinessNotificationPreferences }>(
      `/business/${businessId}/notification-preferences`,
    )
    return {
      email_float_topups: res.data?.email_float_topups !== false,
      email_customer_collection_credits: res.data?.email_customer_collection_credits === true,
    }
  },

  async updateNotificationPreferences(
    businessId: string,
    prefs: Partial<BusinessNotificationPreferences>,
  ): Promise<BusinessNotificationPreferences> {
    const res = await request<{ data: BusinessNotificationPreferences }>(
      `/business/${businessId}/notification-preferences`,
      {
        method: 'PUT',
        body: prefs,
      },
    )
    return {
      email_float_topups: res.data?.email_float_topups !== false,
      email_customer_collection_credits: res.data?.email_customer_collection_credits === true,
    }
  },
}

// ── In-app notifications ────────────────────────────────────────────────

export type DashboardNotification = {
  id: string
  title: string
  body: string
  read: boolean
  created_at: string
  type: 'credit' | 'debit' | 'info'
}

export const notificationsApi = {
  /** In-app alerts for the active business (empty until notifications API ships). */
  async list(_businessId: string): Promise<DashboardNotification[]> {
    return []
  },
}

// ── Team ────────────────────────────────────────────────────────────────

export const teamApi = {
  async list(businessId: string): Promise<TeamMember[]> {
    const res = await request<{ data: TeamMember[] }>(`/business/${businessId}/team`)
    return res.data ?? []
  },

  async myRole(businessId: string): Promise<{ role: BusinessTeamRole; status: string } | null> {
    const res = await request<{ data: { role: BusinessTeamRole; status: string } | null }>(
      `/business/${businessId}/team/me`,
    )
    return res.data ?? null
  },

  async invite(
    businessId: string,
    data: { name: string; email: string; role: Exclude<BusinessTeamRole, 'OWNER'> },
  ) {
    const res = await request<{ data: TeamMember }>(`/business/${businessId}/team/invite`, {
      method: 'POST',
      body: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
      },
    })
    return res.data
  },

  async updateRole(businessId: string, memberId: string, role: Exclude<BusinessTeamRole, 'OWNER'>) {
    const res = await request<{ data: TeamMember }>(`/business/${businessId}/team/${memberId}`, {
      method: 'PATCH',
      body: { role },
    })
    return res.data
  },

  async resendInvite(businessId: string, memberId: string) {
    const res = await request<{ data: TeamMember }>(
      `/business/${businessId}/team/${memberId}/resend`,
      { method: 'POST' },
    )
    return res.data
  },

  async remove(businessId: string, memberId: string) {
    return request(`/business/${businessId}/team/${memberId}`, { method: 'DELETE' })
  },
}

// ── Identity / KYB ──────────────────────────────────────────────────────

export const identityApi = {
  verifyBvn(bvn: string, dob: string) {
    return request('/business/identities/bvn/verify', {
      method: 'POST',
      body: { bvn, dob },
    })
  },

  verifyNin(nin: string) {
    return request('/business/identities/nin/verify', {
      method: 'POST',
      body: { nin },
    })
  },

  verifyCac(registrationNumber: string, businessId: string) {
    return request('/business/identities/cac/verify', {
      method: 'POST',
      body: { registration_number: registrationNumber, business_id: businessId },
    })
  },

  /**
   * Multipart upload. Accepted file fields: certificate_of_incorporation,
   * application_for_registration, memorandum_of_association, proof_of_address.
   */
  uploadDocs(businessId: string, files: Partial<Record<string, File>>) {
    const formData = new FormData()
    formData.append('business_id', businessId)
    for (const [field, file] of Object.entries(files)) {
      if (file) formData.append(field, file)
    }
    return request('/business/identities/docs/upload', { method: 'POST', formData })
  },
}

// ── Wallet ──────────────────────────────────────────────────────────────

/** A managed (virtual) account attached to the business wallet. */
export type ManagedAccount = {
  wallet_id: string
  account_number: string
  owners_fullname: string
  bank: string
  staged_balance: number | string
  is_business_float: boolean
  [key: string]: unknown
}

export type BusinessWallet = {
  wallet_id: string
  balance: number | string
  total_credit: number | string
  total_debit: number | string
  wallet_pin_changed: boolean
  frozen: boolean
  sub_wallets?: ManagedAccount[]
  [key: string]: unknown
}

export const walletApi = {
  async getBusinessWallet(businessId: string): Promise<BusinessWallet | null> {
    const res = await request<{ data: BusinessWallet | null }>(`/business/${businessId}/wallet`)
    return res.data ?? null
  },

  createPin(businessId: string, newPin: string) {
    return request(`/business/${businessId}/wallet/create-pin`, {
      method: 'POST',
      body: { new_pin: newPin },
    })
  },

  updatePin(businessId: string, oldPin: string, newPin: string) {
    return request(`/business/${businessId}/wallet/update-pin`, {
      method: 'POST',
      body: { old_pin: oldPin, new_pin: newPin },
    })
  },
}

// ── Transactions ────────────────────────────────────────────────────────

export type Transaction = {
  transaction_id: string
  transaction_type: 'CREDIT' | 'DEBIT'
  transaction_status: string
  transaction_reference: string
  amount: number | string
  currency?: string
  description: string
  created_at: string
  charge?: number | string
  balance_before?: number | string
  balance_after?: number | string
  channel?: string
  transaction_category?: string
  meta?: { data?: Record<string, unknown> }
  [key: string]: unknown
}

export type TransactionListParams = {
  page_size?: number
  cursor?: string
  status?: 'successful' | 'pending' | 'failed'
  from?: string
  to?: string
  type?: 'INFLOW' | 'OUTFLOW' | 'INTERNAL'
  method?: 'API' | 'DASHBOARD'
}

export const transactionsApi = {
  async list(params: TransactionListParams = {}, businessId?: string): Promise<Transaction[]> {
    const id = businessId ?? activeBusinessId()
    const qs = new URLSearchParams()
    if (params.page_size !== undefined) qs.set('page_size', String(params.page_size))
    if (params.cursor) qs.set('cursor', params.cursor)
    if (params.status) qs.set('status', params.status)
    if (params.from) qs.set('from', params.from)
    if (params.to) qs.set('to', params.to)
    if (params.type) qs.set('type', params.type)
    if (params.method) qs.set('method', params.method)
    const query = qs.toString()
    const res = await request<{ data: Transaction[] }>(
      `/business/${id}/transactions${query ? `?${query}` : ''}`
    )
    return res.data ?? []
  },

  async get(transactionId: string, businessId?: string): Promise<Transaction> {
    const id = businessId ?? activeBusinessId()
    const res = await request<{ data: Transaction }>(
      `/business/${id}/transactions/${transactionId}`
    )
    return res.data
  },
}

// ── Banks ───────────────────────────────────────────────────────────────

export type Bank = {
  bank_code: string
  bank_name: string
  bank_long_code?: string
  /** PNG logo (400×400) — broad compatibility */
  logo_url?: string | null
  /** SVG logo — prefer on web */
  logo_url_svg?: string | null
}

export type AccountEnquiry = {
  account_name: string
  account_number: string
  bank_code: string
  enquiry_session_id?: string
}

type RawAccountEnquiry = {
  account_name?: string
  account_number?: string
  bank_code?: string
  enquiry_session_id?: string
  sessionId?: string
  account?: {
    number?: string
    name?: string
  }
}

function normalizeAccountEnquiry(
  raw: RawAccountEnquiry,
  bankCode: string,
  accountNumber: string,
): AccountEnquiry {
  const account_name = (raw.account_name ?? raw.account?.name ?? '').trim()
  const account_number = (raw.account_number ?? raw.account?.number ?? accountNumber).trim()
  if (!account_name) {
    throw new ApiError('Could not verify this account. Try again.', 400)
  }
  return {
    account_name,
    account_number,
    bank_code: raw.bank_code ?? bankCode,
    enquiry_session_id: raw.enquiry_session_id ?? raw.sessionId,
  }
}

export const bankApi = {
  async listBanks(): Promise<Bank[]> {
    const res = await request<{ data: Bank[] }>('/common/banks/list')
    return res.data ?? []
  },

  async enquireAccount(bankCode: string, accountNumber: string): Promise<AccountEnquiry> {
    const res = await request<{ data: RawAccountEnquiry }>(
      `/common/banks/account/enquire?bank_code=${encodeURIComponent(bankCode)}&account_number=${encodeURIComponent(accountNumber)}`
    )
    return normalizeAccountEnquiry(res.data, bankCode, accountNumber)
  },
}

// ── Transfers ───────────────────────────────────────────────────────────

export const transferApi = {
  /** Dashboard transfer — authorised with the business wallet PIN. */
  send(payload: {
    beneficiary: {
      bank_code: string
      account_number: string
      account_name: string
      bank_name?: string
      enquiry_session_id?: string
    }
    source_account_number: string
    amount: number
    description?: string
    wallet_pin: string
  }) {
    return request<{ data: Transaction }>('/business/transfers/dashboard', {
      method: 'POST',
      body: payload,
    })
  },
}

// ── Customers (managed wallets) ─────────────────────────────────────────

export type CustomerWallet = {
  wallet_id: string
  account_number: string
  owners_fullname: string
  bank_name: string
  frozen: boolean
  business_id?: string
  isFloat?: boolean
  is_dva_polaris?: boolean
  /** Snapshot of details the business submitted at creation (only on single fetch). */
  customer_details?: CustomerDetails | null
  created_at?: string
  updated_at?: string
}

export type CustomerDetails = {
  first_name?: string
  last_name?: string
  middlename?: string | null
  title?: string
  gender?: string
  dob?: string
  email?: string
  phone_number?: string
  address_line_1?: string
  address_line_2?: string | null
  city?: string
  country?: string
  /** Stored masked (e.g. *******1234). */
  bvn?: string | null
}

export type CreateCustomerPayload = {
  first_name: string
  last_name: string
  middlename?: string
  dob: string
  gender: string
  title: string
  address_line_1: string
  address_line_2?: string
  city: string
  country: string
  phone_number: string
  email: string
  bvn: string
}

function activeBusinessId(): string {
  const id = session.selectedBusinessId
  if (!id) throw new ApiError('No active business selected.', 400)
  return id
}

export const customersApi = {
  async list(businessId?: string): Promise<CustomerWallet[]> {
    const id = businessId ?? activeBusinessId()
    const res = await request<{ data: CustomerWallet[] }>(`/business/${id}/customers`)
    return res.data ?? []
  },

  async get(walletId: string, businessId?: string): Promise<CustomerWallet | null> {
    const id = businessId ?? activeBusinessId()
    const res = await request<{ data: CustomerWallet | null }>(
      `/business/${id}/customers/${walletId}`
    )
    return res.data ?? null
  },

  create(payload: CreateCustomerPayload, businessId?: string) {
    const id = businessId ?? activeBusinessId()
    return request<{ data: CustomerWallet }>(`/business/${id}/customers`, {
      method: 'POST',
      body: payload,
    })
  },

  async transactions(
    walletId: string,
    params: { limit?: number; status?: string } = {},
    businessId?: string,
  ): Promise<Transaction[]> {
    const id = businessId ?? activeBusinessId()
    const qs = new URLSearchParams()
    if (params.limit !== undefined) qs.set('page_size', String(params.limit))
    if (params.status) qs.set('status', params.status)
    const query = qs.toString()
    const res = await request<{ data: Transaction[] }>(
      `/business/${id}/customers/${walletId}/transactions${query ? `?${query}` : ''}`
    )
    return res.data ?? []
  },
}

// ── API clients (developer keys) ────────────────────────────────────────

export type ApiClient = {
  client_id: string
  app_name: string
  is_active: boolean
  environment: 'LIVE' | 'TEST'
  last_used_at: string | null
  created_at?: string
}

type RawApiClient = {
  clientId: string
  appName: string
  isActive: boolean
  environment: 'LIVE' | 'TEST'
  lastUsedAt: string | null
  createdAt?: string
}

export const apiClientApi = {
  /** Returns the business's API client, or null if none has been created yet. */
  async get(businessId: string): Promise<ApiClient | null> {
    try {
      const res = await request<{ data: RawApiClient }>(`/business/${businessId}/api-clients`)
      const c = res.data
      if (!c) return null
      return {
        client_id: c.clientId,
        app_name: c.appName,
        is_active: c.isActive,
        environment: c.environment,
        last_used_at: c.lastUsedAt,
        created_at: c.createdAt,
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  },

  async create(
    businessId: string,
    appName: string,
  ): Promise<{ client_id: string; client_secret: string; message?: string }> {
    const res = await request<{
      message?: string
      data: { client_id: string; client_secret: string }
    }>(
      `/business/${businessId}/api-clients`,
      { method: 'POST', body: { app_name: appName } }
    )
    return { ...res.data, message: res.message }
  },
}

// ── Webhooks ────────────────────────────────────────────────────────────

export type WebhookConfig = {
  id: string
  name: string | null
  url: string
  subscribed_events: string[]
  created_at: string
  [key: string]: unknown
}

export type WebhookDelivery = {
  id: string
  business_id: string | null
  webhook_config_id: string | null
  target_url: string
  event: string
  http_status: number | null
  outcome: 'delivered' | 'failed_retrying' | 'failed_final'
  attempt_number: number
  error_message: string | null
  response_preview: string | null
  /** Full webhook body that was POSTed to the endpoint. */
  payload?: Record<string, unknown> | null
  created_at: string
}

export const webhooksApi = {
  async listConfigs(businessId: string): Promise<WebhookConfig[]> {
    const res = await request<{ data: WebhookConfig[] }>(`/business/${businessId}/webhooks`)
    return res.data ?? []
  },

  async createConfig(
    businessId: string,
    payload: { name?: string; url: string; subscribed_events: string[] }
  ): Promise<WebhookConfig & { signing_secret?: string; secret?: string }> {
    const res = await request<{ data: WebhookConfig & { signing_secret?: string; secret?: string } }>(
      `/business/${businessId}/webhooks`,
      { method: 'POST', body: payload }
    )
    return res.data
  },

  updateConfig(
    businessId: string,
    configId: string,
    payload: { name?: string; url?: string; subscribed_events?: string[] }
  ) {
    return request(`/business/${businessId}/webhooks/${configId}`, {
      method: 'PUT',
      body: payload,
    })
  },

  deleteConfig(businessId: string, configId: string) {
    return request(`/business/${businessId}/webhooks/${configId}`, { method: 'DELETE' })
  },

  async regenerateSecret(businessId: string, configId: string): Promise<{ new_secret: string }> {
    const res = await request<{ data: { new_secret: string } }>(
      `/business/${businessId}/webhooks/${configId}/regenerate-secret`,
      { method: 'POST' }
    )
    return res.data
  },

  testWebhook(businessId: string) {
    return request(`/business/${businessId}/webhooks/test`, { method: 'POST' })
  },

  async listDeliveries(
    businessId: string,
    params: { outcome?: string; search?: string; limit?: number; offset?: number } = {}
  ): Promise<{ items: WebhookDelivery[]; total: number }> {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v))
    }
    const query = qs.toString()
    const res = await request<{ data: WebhookDelivery[]; meta?: { total: number } }>(
      `/business/${businessId}/webhooks/deliveries${query ? `?${query}` : ''}`
    )
    return { items: res.data ?? [], total: res.meta?.total ?? (res.data?.length ?? 0) }
  },

  replayDelivery(businessId: string, deliveryId: string) {
    return request(`/business/${businessId}/webhooks/deliveries/${deliveryId}/replay`, {
      method: 'POST',
    })
  },
}

// ── Nyra AI assistant ───────────────────────────────────────────────────

export type AssistantChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantListAction =
  | { type: 'open_transaction'; transactionId: string }
  | { type: 'open_customer'; customerId: string }
  | { type: 'navigate'; path: string }
  | { type: 'retry_webhook'; deliveryId: string }
  | { type: 'open_transfer' }

export type AssistantActionButton = {
  label: string
  action: AssistantListAction
}

export type AssistantListItem = {
  label: string
  description?: string
  action?: AssistantListAction
}

export type AssistantList = {
  intro?: string
  outro?: string
  items: AssistantListItem[]
}

export type AssistantChatResponse = {
  message: string
  list?: AssistantList
  actions?: AssistantActionButton[]
}

export type AssistantBreakdownPeriod =
  | '1h'
  | '3h'
  | '5h'
  | '24h'
  | '3d'
  | '1w'
  | '1m'
  | '3m'
  | '1y'

export const ASSISTANT_BREAKDOWN_OPTIONS: { value: AssistantBreakdownPeriod; label: string }[] = [
  { value: '1h', label: '1 hour' },
  { value: '3h', label: '3 hours' },
  { value: '5h', label: '5 hours' },
  { value: '24h', label: '24 hours' },
  { value: '3d', label: '3 days' },
  { value: '1w', label: '1 week' },
  { value: '1m', label: '1 month' },
  { value: '3m', label: '3 months' },
  { value: '1y', label: '1 year' },
]

export const assistantApi = {
  async chat(businessId: string, messages: AssistantChatMessage[]): Promise<AssistantChatResponse> {
    const res = await request<{ data: AssistantChatResponse }>(
      `/business/${businessId}/assistant/chat`,
      {
        method: 'POST',
        body: { messages },
      },
    )
    return res.data
  },

  async breakdown(businessId: string, period: AssistantBreakdownPeriod): Promise<AssistantChatResponse> {
    const res = await request<{ data: AssistantChatResponse }>(
      `/business/${businessId}/assistant/breakdown`,
      {
        method: 'POST',
        body: { period },
      },
    )
    return res.data
  },
}

// ── User & password ─────────────────────────────────────────────────────

export const userApi = {
  async current(): Promise<SessionUser | null> {
    const res = await request<{ data: SessionUser | null }>('/user/current')
    return res.data ?? null
  },
}

export const passwordApi = {
  update(oldPassword: string, newPassword: string) {
    return request('/auth/passwords/update', {
      method: 'POST',
      body: { oldPassword, newPassword },
    })
  },
}
