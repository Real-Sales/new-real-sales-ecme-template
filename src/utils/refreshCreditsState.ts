import type { AppDispatch } from '@/store/storeSetup'
import type { RootState } from '@/store/rootReducer'
import { refreshMySubscription } from '@/views/profile/Subscription/store/subscriptionSlice'
import { fetchCompanyMembers } from '@/views/sales/members/store'

type RefreshCreditsOptions = {
    userId?: string
    companyId?: string
}

/**
 * Refresh sidebar subscription credits and company member roster credits
 * after a session completes. Safe to call when members are already cached —
 * refetch runs in the background without the page loading state.
 */
export function refreshCreditsState(
    dispatch: AppDispatch,
    getState: () => RootState,
    options?: RefreshCreditsOptions,
) {
    void dispatch(refreshMySubscription())

    const state = getState()
    const userId = options?.userId ?? state.auth.user.userId
    const companyId =
        options?.companyId ??
        (typeof state.auth.user.companyId === 'string'
            ? state.auth.user.companyId
            : undefined)

    if (!userId && !companyId) return

    // Only refetch roster when the slice is mounted (Company Members page visited).
    if (state.companyMembers?.data) {
        void dispatch(fetchCompanyMembers({ userId, companyId }))
    }
}
