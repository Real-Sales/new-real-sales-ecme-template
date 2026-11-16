import type { AppDispatch } from '@/store/storeSetup'
import type { RootState } from '@/store/rootReducer'
import { fetchCompanyMembers } from '@/views/sales/members/store'
import { fetchTeamPerformance, fetchTeams } from '@/store/slices/teams'
import { fetchDivisionInfo } from '@/store/slices/salesDivisions'

type SyncOptions = {
    userId?: string
    companyId?: string
    salesCompanyId?: string | null
    teamId?: string
    divisionId?: string
}

/** Keep company members + teams slices in sync after team membership changes. */
export async function syncAfterTeamMemberChange(
    dispatch: AppDispatch,
    getState: () => RootState,
    options: SyncOptions = {},
): Promise<void> {
    const state = getState()
    const userId = options.userId ?? state.auth.user.userId
    const companyId =
        options.companyId ??
        (typeof state.auth.user.companyId === 'string'
            ? state.auth.user.companyId
            : undefined)
    const salesCompanyId =
        options.salesCompanyId ?? state.companyMembers?.data?.salesCompanyId ?? null

    if (options.teamId) {
        await dispatch(fetchTeamPerformance(options.teamId)).unwrap()
    }

    if (state.companyMembers?.data && (userId || companyId)) {
        void dispatch(fetchCompanyMembers({ userId, companyId }))
    }

    if (salesCompanyId && state.teams?.data) {
        void dispatch(fetchTeams(salesCompanyId))
    }
}

/** Keep company members + teams + division info in sync after division assignment changes. */
export async function syncAfterDivisionMemberChange(
    dispatch: AppDispatch,
    getState: () => RootState,
    options: SyncOptions = {},
): Promise<void> {
    const state = getState()
    const userId = options.userId ?? state.auth.user.userId
    const companyId =
        options.companyId ??
        (typeof state.auth.user.companyId === 'string'
            ? state.auth.user.companyId
            : undefined)
    const salesCompanyId =
        options.salesCompanyId ?? state.companyMembers?.data?.salesCompanyId ?? null

    if (options.divisionId) {
        await dispatch(fetchDivisionInfo(options.divisionId)).unwrap()
    }

    if (state.companyMembers?.data && (userId || companyId)) {
        void dispatch(fetchCompanyMembers({ userId, companyId }))
    }

    if (salesCompanyId && state.teams?.data) {
        void dispatch(fetchTeams(salesCompanyId))
    }
}
