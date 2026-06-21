export type ComplianceStatus = 'unverified' | 'pending' | 'verified'

const STORAGE_KEY = 'nyra-compliance-status'

export function getComplianceStatus(): ComplianceStatus {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value === 'pending' || value === 'verified') return value
  return 'unverified'
}

export function setComplianceStatus(status: ComplianceStatus) {
  localStorage.setItem(STORAGE_KEY, status)
}
