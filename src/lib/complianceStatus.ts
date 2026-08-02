import type { Business } from './api'

/** @deprecated Verification state comes from the API (`business.verification_status`). */
export type ComplianceStatus = 'unverified' | 'pending' | 'verified'

const STORAGE_KEY = 'nyra-compliance-status'

/** @deprecated Use `business.verification_status` from the API instead. */
export function getComplianceStatus(): ComplianceStatus {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value === 'pending' || value === 'verified') return value
  return 'unverified'
}

/** @deprecated Use `business.verification_status` from the API instead. */
export function setComplianceStatus(status: ComplianceStatus) {
  localStorage.setItem(STORAGE_KEY, status)
}

export function complianceStatusFromBusiness(
  status: Business['verification_status'] | undefined,
): ComplianceStatus {
  if (status === 'VERIFIED') return 'verified'
  if (status === 'PENDING') return 'pending'
  return 'unverified'
}
