import { useEffect, useMemo } from 'react'
import { injectReducer, useAppDispatch, useAppSelector } from '@/store'
import companyMembersReducer, {
    fetchCompanyMembers,
    useAppSelector as useCompanyMembersSelector,
} from '@/views/sales/members/store'
import { getMemberDivisionIds } from '@/views/sales/members/types'
import salesDivisionsReducer, {
    fetchDivisionInfo,
    fetchSalesDivisions,
    useAppSelector as useSalesDivisionsSelector,
} from '@/store/slices/salesDivisions'

injectReducer('companyMembers', companyMembersReducer)
injectReducer('salesDivisions', salesDivisionsReducer)

export type UserCustomerSegment = {
    id: string
    name: string
}

function segmentFromDivision(division: {
    customer_segment_id?: string | null
    customer_segment?: { customer_segment_id?: string; name?: string } | null
} | null | undefined): UserCustomerSegment | null {
    const id =
        division?.customer_segment_id?.trim() ||
        division?.customer_segment?.customer_segment_id?.trim() ||
        ''
    if (!id) return null
    const name = division?.customer_segment?.name?.trim() || id
    return { id, name }
}

/**
 * Resolves the logged-in user's sales division(s) and customer segment(s)
 * for persona scoping. Supports multi-division assignments.
 */
export function useUserDivisionSegment() {
    const dispatch = useAppDispatch()
    const authUser = useAppSelector((state) => state.auth.user)
    const userId = authUser?.userId
    const companyId =
        typeof authUser?.companyId === 'string'
            ? authUser.companyId.trim()
            : authUser?.companyId

    const { membersData, membersLoading, membersInitialized, salesCompanyId } =
        useCompanyMembersSelector((state) => ({
            membersData: state.companyMembers?.data?.membersData ?? [],
            membersLoading: state.companyMembers?.data?.membersLoading ?? false,
            membersInitialized: state.companyMembers?.data?.initialized ?? false,
            salesCompanyId: state.companyMembers?.data?.salesCompanyId ?? null,
        }))

    useEffect(() => {
        if (!userId || membersInitialized || membersLoading) return
        dispatch(fetchCompanyMembers({ userId, companyId: companyId || undefined }))
    }, [dispatch, userId, companyId, membersInitialized, membersLoading])

    const member = useMemo(
        () => membersData.find((m) => m.user_id === userId) ?? null,
        [membersData, userId],
    )

    const salesDivisionIds = useMemo(
        () => (member ? getMemberDivisionIds(member) : []),
        [member],
    )

    /** Primary session division, else first team division. */
    const salesDivisionId =
        member?.sales_division_id?.trim() || salesDivisionIds[0] || null

    const {
        divisionInfo,
        infoLoading,
        divisionsData,
        divisionsLoading,
        divisionsInitialized,
    } = useSalesDivisionsSelector((state) => ({
        divisionInfo: state.salesDivisions?.data?.divisionInfo ?? {},
        infoLoading: state.salesDivisions?.data?.infoLoading ?? false,
        divisionsData: state.salesDivisions?.data?.divisionsData ?? [],
        divisionsLoading: state.salesDivisions?.data?.divisionsLoading ?? false,
        divisionsInitialized: state.salesDivisions?.data?.initialized ?? false,
    }))

    const companyIdForDivisions = salesCompanyId || companyId || null

    useEffect(() => {
        if (!companyIdForDivisions || divisionsInitialized || divisionsLoading) {
            return
        }
        dispatch(fetchSalesDivisions(companyIdForDivisions))
    }, [
        dispatch,
        companyIdForDivisions,
        divisionsInitialized,
        divisionsLoading,
    ])

    // Fill gaps via /info when a division isn't in the company list yet.
    useEffect(() => {
        for (const divisionId of salesDivisionIds) {
            const inList = divisionsData.some(
                (d) => d.sales_division_id === divisionId,
            )
            if (inList || divisionInfo[divisionId]) continue
            dispatch(fetchDivisionInfo(divisionId))
        }
    }, [dispatch, salesDivisionIds, divisionsData, divisionInfo])

    const customerSegments = useMemo(() => {
        const byId = new Map<string, UserCustomerSegment>()

        // Prefer primary division's segment first for stable ordering.
        const orderedIds = [
            ...(salesDivisionId && salesDivisionIds.includes(salesDivisionId)
                ? [salesDivisionId]
                : []),
            ...salesDivisionIds.filter((id) => id !== salesDivisionId),
        ]

        for (const divisionId of orderedIds) {
            const fromList = divisionsData.find(
                (d) => d.sales_division_id === divisionId,
            )
            const fromInfo = divisionInfo[divisionId]
            const segment =
                segmentFromDivision(fromList) ?? segmentFromDivision(fromInfo)
            if (segment && !byId.has(segment.id)) {
                byId.set(segment.id, segment)
            }
        }

        return [...byId.values()]
    }, [salesDivisionIds, salesDivisionId, divisionsData, divisionInfo])

    const waitingForMembers = Boolean(userId) && !membersInitialized
    const waitingForDivisionsList =
        salesDivisionIds.length > 0 &&
        Boolean(companyIdForDivisions) &&
        !divisionsInitialized &&
        divisionsLoading
    const waitingForInfo =
        salesDivisionIds.length > 0 &&
        customerSegments.length === 0 &&
        infoLoading

    return {
        loading:
            membersLoading ||
            waitingForMembers ||
            waitingForDivisionsList ||
            waitingForInfo,
        salesDivisionId,
        salesDivisionIds,
        customerSegmentId: customerSegments[0]?.id ?? null,
        customerSegmentName: customerSegments[0]?.name ?? null,
        customerSegments,
    }
}
