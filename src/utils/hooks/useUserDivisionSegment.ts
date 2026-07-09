import { useEffect, useMemo } from 'react'
import { injectReducer, useAppDispatch, useAppSelector } from '@/store'
import companyMembersReducer, {
    fetchCompanyMembers,
    useAppSelector as useCompanyMembersSelector,
} from '@/views/sales/members/store'
import salesDivisionsReducer, {
    fetchDivisionInfo,
    useAppSelector as useSalesDivisionsSelector,
} from '@/store/slices/salesDivisions'

injectReducer('companyMembers', companyMembersReducer)
injectReducer('salesDivisions', salesDivisionsReducer)

/**
 * Resolves the logged-in user's sales division and its customer segment, so
 * the persona picker can be scoped to "who this rep's division sells to."
 * There's no sales_division_id on the auth/profile payload, so this mirrors
 * the flow the guide describes: look up the user's row in the company
 * members list (already keyed by sales_division_id), then fetch that
 * division's info for its customer_segment_id.
 */
export function useUserDivisionSegment() {
    const dispatch = useAppDispatch()
    const authUser = useAppSelector((state) => state.auth.user)
    const userId = authUser?.userId
    const companyId =
        typeof authUser?.companyId === 'string'
            ? authUser.companyId.trim()
            : authUser?.companyId

    const { membersData, membersLoading, membersInitialized } =
        useCompanyMembersSelector((state) => ({
            membersData: state.companyMembers?.data?.membersData ?? [],
            membersLoading: state.companyMembers?.data?.membersLoading ?? false,
            membersInitialized: state.companyMembers?.data?.initialized ?? false,
        }))

    useEffect(() => {
        if (!userId || membersInitialized || membersLoading) return
        dispatch(fetchCompanyMembers({ userId, companyId: companyId || undefined }))
    }, [dispatch, userId, companyId, membersInitialized, membersLoading])

    const salesDivisionId = useMemo(() => {
        return membersData.find((m) => m.user_id === userId)?.sales_division_id ?? null
    }, [membersData, userId])

    const { divisionInfo, infoLoading } = useSalesDivisionsSelector((state) => ({
        divisionInfo: state.salesDivisions?.data?.divisionInfo ?? {},
        infoLoading: state.salesDivisions?.data?.infoLoading ?? false,
    }))

    useEffect(() => {
        if (!salesDivisionId || divisionInfo[salesDivisionId]) return
        dispatch(fetchDivisionInfo(salesDivisionId))
    }, [dispatch, salesDivisionId, divisionInfo])

    const division = salesDivisionId ? divisionInfo[salesDivisionId] : undefined

    return {
        loading: membersLoading || (Boolean(salesDivisionId) && infoLoading && !division),
        salesDivisionId,
        customerSegmentId: division?.customer_segment_id ?? null,
        customerSegmentName: division?.customer_segment?.name ?? null,
    }
}
