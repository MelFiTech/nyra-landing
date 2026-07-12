export type BusinessTeamRole = 'OWNER' | 'CUSTOMER_REP' | 'DEVELOPER' | 'OPERATIONS'

export type BusinessMemberStatus = 'ACTIVE' | 'PENDING' | 'REVOKED'

export type TeamMember = {
  id: string
  email: string
  role: BusinessTeamRole
  status: BusinessMemberStatus
  user_id: string | null
  name: string | null
  is_owner?: boolean
  created_at?: string
  invite_expires_at?: string | null
  invite_expired?: boolean
}

export const TEAM_ROLE_LABELS: Record<BusinessTeamRole, string> = {
  OWNER: 'Owner',
  CUSTOMER_REP: 'Customer rep',
  DEVELOPER: 'Developer',
  OPERATIONS: 'Operations',
}

export const ASSIGNABLE_TEAM_ROLES: { value: Exclude<BusinessTeamRole, 'OWNER'>; label: string; description: string }[] = [
  {
    value: 'CUSTOMER_REP',
    label: 'Customer rep',
    description: 'View and monitor the dashboard. Cannot make changes.',
  },
  {
    value: 'DEVELOPER',
    label: 'Developer',
    description: 'Manage API keys and webhooks only.',
  },
  {
    value: 'OPERATIONS',
    label: 'Operations',
    description: 'View and monitor operations. Cannot make changes.',
  },
]

export type TeamPermissions = {
  role: BusinessTeamRole
  isOwner: boolean
  /** Money moves, PIN, create customers, compliance edits, etc. */
  canAct: boolean
  canManageTeam: boolean
  canManageApiKeys: boolean
  canManageWebhooks: boolean
  canManageNotifications: boolean
  canManageSecurity: boolean
}

export function permissionsForRole(role: BusinessTeamRole | null | undefined): TeamPermissions {
  const resolved: BusinessTeamRole = role ?? 'OWNER'
  const isOwner = resolved === 'OWNER'
  const isDeveloper = resolved === 'DEVELOPER'

  return {
    role: resolved,
    isOwner,
    canAct: isOwner,
    canManageTeam: isOwner,
    canManageApiKeys: isOwner || isDeveloper,
    canManageWebhooks: isOwner || isDeveloper,
    canManageNotifications: isOwner,
    canManageSecurity: isOwner,
  }
}
