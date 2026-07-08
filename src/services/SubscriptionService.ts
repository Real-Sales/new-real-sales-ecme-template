import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type SubscriptionFeatureFlags = {
    unlimited_buyers_persona?: boolean
    unlimited_industries?: boolean
    coaching_reporting?: boolean
    document_uploading?: boolean
    team_dashboard?: boolean
    custom_scenario_development?: boolean
    custom_persona_development?: boolean
}

/** Legacy shape from older API responses */
export type SubscriptionFeatureEntry = {
    enabled: boolean
    limit?: string | number | null
}

export type ApiSubscription = {
    plan_type: string
    billing_cycle: 'monthly' | 'yearly'
    credits_per_month: number
    monthly_price: string
    yearly_price: string | null
    max_users: number
    max_session_duration: number
    is_custom?: boolean
    features: SubscriptionFeatureFlags | Record<string, SubscriptionFeatureEntry>
    subscription_id: string
    status_active: boolean
    created_at: string
    updated_at: string
}

export type UserSubscriptionRecord = {
    user_subscription_id: string
    subscription: ApiSubscription
    user_id: string
    subscription_id: string
    status_active: boolean
    start_date: string
    end_date: string
    credits_allocated: number
    credits_used: number
    credits_remaining: number
    sessions_completed: number
    time_used: number
    created_at: string
    updated_at: string
}

export type CreditsRemainingResponse = {
    credits_remaining: number
    credits_used: number
    credits_allocated: number
}

export async function apiGetSubscriptionPlans(
    billingCycle: 'monthly' | 'yearly' = 'monthly',
) {
    return ApiService.fetchDataWithAxios<ApiSubscription[]>({
        url: endpointConfig.subscriptionPlans(billingCycle),
        method: 'get',
    })
}

/** @deprecated Use apiGetSubscriptionPlans */
export async function apiGetSubscriptions() {
    return ApiService.fetchDataWithAxios<ApiSubscription[]>({
        url: endpointConfig.subscriptions,
        method: 'get',
    })
}

export async function apiGetUserSubscriptionsByUser(userId: string) {
    return ApiService.fetchDataWithAxios<UserSubscriptionRecord[]>({
        url: endpointConfig.userSubscriptionsByUser(userId),
        method: 'get',
    })
}

export async function apiGetMySubscription() {
    return ApiService.fetchDataWithAxios<UserSubscriptionRecord>({
        url: endpointConfig.userSubscriptionsMy,
        method: 'get',
    })
}

export async function apiGetCreditsRemaining() {
    return ApiService.fetchDataWithAxios<CreditsRemainingResponse>({
        url: endpointConfig.userSubscriptionsCreditsRemaining,
        method: 'get',
    })
}

export type UserSubscriptionCreateBody = {
    user_id: string
    subscription_id: string
}

export async function apiCreateUserSubscription(body: UserSubscriptionCreateBody) {
    return ApiService.fetchDataWithAxios<UserSubscriptionRecord>({
        url: endpointConfig.userSubscriptions,
        method: 'post',
        data: body,
    })
}

export function pickActiveUserSubscription(
    rows: UserSubscriptionRecord[] | null | undefined,
): UserSubscriptionRecord | null {
    if (!rows?.length) {
        return null
    }
    const active = rows.filter(
        (r) => r.status_active && r.subscription?.status_active !== false,
    )
    const pool = active.length ? active : rows
    return [...pool].sort(
        (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime(),
    )[0]
}
