import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { businessApi, session, teamApi, type Business } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import {
  permissionsForRole,
  type BusinessTeamRole,
  type TeamPermissions,
} from '../lib/teamPermissions'

type BusinessContextValue = {
  businessId: string | null
  business: Business | null
  businesses: Business[]
  businessesLoading: boolean
  role: BusinessTeamRole
  permissions: TeamPermissions
  roleLoading: boolean
  selectBusiness: (id: string) => void
  refreshBusinesses: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [businessId, setBusinessId] = useState<string | null>(() => session.selectedBusinessId)

  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: queryKeys.businesses,
    queryFn: () => businessApi.getAll(),
    initialData: session.businesses.length > 0 ? session.businesses : undefined,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (businesses.length > 0) session.setBusinesses(businesses)
  }, [businesses])

  const resolvedBusinessId = useMemo(() => {
    if (businessId && businesses.some(b => b.id === businessId)) return businessId
    return businesses[0]?.id ?? null
  }, [businessId, businesses])

  // Keep session in sync with the resolved business so APIs that still read
  // session.selectedBusinessId (headers, legacy helpers) hit the same id.
  useEffect(() => {
    if (!resolvedBusinessId) return
    if (session.selectedBusinessId !== resolvedBusinessId) {
      session.setSelectedBusiness(resolvedBusinessId)
    }
    if (businessId !== resolvedBusinessId) {
      setBusinessId(resolvedBusinessId)
    }
  }, [resolvedBusinessId, businessId])

  const business = useMemo(
    () => businesses.find(b => b.id === resolvedBusinessId) ?? null,
    [businesses, resolvedBusinessId]
  )

  const { data: membership, isLoading: roleLoading } = useQuery({
    queryKey: queryKeys.teamRole(resolvedBusinessId ?? ''),
    queryFn: () => teamApi.myRole(resolvedBusinessId!),
    enabled: !!resolvedBusinessId,
    staleTime: 60_000,
  })

  const role: BusinessTeamRole = membership?.role ?? 'OWNER'
  const permissions = useMemo(() => permissionsForRole(role), [role])

  const selectBusiness = useCallback((id: string) => {
    if (id === resolvedBusinessId) return
    session.setSelectedBusiness(id)
    setBusinessId(id)
    queryClient.invalidateQueries()
  }, [queryClient, resolvedBusinessId])

  const refreshBusinesses = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.businesses })
  }, [queryClient])

  const value = useMemo(
    () => ({
      businessId: resolvedBusinessId,
      business,
      businesses,
      businessesLoading,
      role,
      permissions,
      roleLoading,
      selectBusiness,
      refreshBusinesses,
    }),
    [
      resolvedBusinessId,
      business,
      businesses,
      businessesLoading,
      role,
      permissions,
      roleLoading,
      selectBusiness,
      refreshBusinesses,
    ]
  )

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}

export function usePermissions() {
  return useBusiness().permissions
}
