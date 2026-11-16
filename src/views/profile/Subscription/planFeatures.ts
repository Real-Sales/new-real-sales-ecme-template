import type {
    ApiSubscription,
    SubscriptionFeatureFlags,
} from '@/services/SubscriptionService'

type PlanKind = 'free' | 'starter' | 'manager' | 'enterprise'

const PLAN_ORDER: PlanKind[] = ['free', 'starter', 'manager', 'enterprise']

const FEATURE_ROWS: { key: keyof SubscriptionFeatureFlags; label: string }[] = [
    { key: 'unlimited_buyers_persona', label: 'Unlimited Buyers Persona' },
    { key: 'unlimited_industries', label: 'Unlimited Industries' },
    { key: 'coaching_reporting', label: 'Coaching & Session Reporting' },
    { key: 'document_uploading', label: 'Document Uploading' },
    { key: 'team_dashboard', label: 'Team Dashboard' },
    { key: 'custom_scenario_development', label: 'Custom Scenario Development' },
    { key: 'custom_persona_development', label: 'Custom Persona Development' },
]

const STATIC_ROWS: {
    label: string
    included: Record<PlanKind, boolean>
}[] = [
    {
        label: 'Unlimited Buyers Persona',
        included: {
            free: false,
            starter: true,
            manager: true,
            enterprise: true,
        },
    },
    {
        label: 'Unlimited Industries',
        included: {
            free: false,
            starter: true,
            manager: true,
            enterprise: true,
        },
    },
    {
        label: 'Coaching & Session Reporting',
        included: {
            free: true,
            starter: true,
            manager: true,
            enterprise: true,
        },
    },
    {
        label: 'Document Uploading',
        included: {
            free: true,
            starter: true,
            manager: true,
            enterprise: true,
        },
    },
    {
        label: 'Team Dashboard',
        included: {
            free: false,
            starter: false,
            manager: true,
            enterprise: true,
        },
    },
    {
        label: 'Custom Scenario Development',
        included: {
            free: false,
            starter: false,
            manager: false,
            enterprise: true,
        },
    },
    {
        label: 'Custom Persona Development',
        included: {
            free: false,
            starter: false,
            manager: false,
            enterprise: true,
        },
    },
]

function hasBooleanFeatureFlags(
    features: ApiSubscription['features'],
): features is SubscriptionFeatureFlags {
    if (!features || typeof features !== 'object') {
        return false
    }
    const first = Object.values(features)[0]
    return typeof first === 'boolean'
}

function normalizePlanKind(plan: ApiSubscription): PlanKind {
    const t = plan.plan_type.toLowerCase()
    if (t === 'free' || t === 'starter' || t === 'manager' || t === 'enterprise') {
        return t
    }
    if (plan.is_custom) {
        return 'enterprise'
    }
    return 'starter'
}

export function usersFeatureLabel(plan: ApiSubscription): string {
    const kind = normalizePlanKind(plan)
    if (kind === 'enterprise') {
        return 'Unlimited Users'
    }
    const n = plan.max_users ?? 1
    return `${n} User${n === 1 ? '' : 's'}`
}

export function planDisplayTitle(plan: ApiSubscription): string {
    const kind = normalizePlanKind(plan)
    const labels: Record<PlanKind, string> = {
        free: 'Free',
        starter: 'Starter',
        manager: 'Manager',
        enterprise: 'Enterprise',
    }
    return labels[kind] ?? plan.plan_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function planRowsForSubscription(plan: ApiSubscription) {
    const kind = normalizePlanKind(plan)
    const rows: { label: string; included: boolean }[] = [
        { label: usersFeatureLabel(plan), included: true },
    ]

    if (hasBooleanFeatureFlags(plan.features)) {
        for (const row of FEATURE_ROWS) {
            rows.push({
                label: row.label,
                included: Boolean(plan.features[row.key]),
            })
        }
        return rows
    }

    for (const row of STATIC_ROWS) {
        rows.push({ label: row.label, included: row.included[kind] })
    }
    return rows
}

export function sortSubscriptionsForDisplay(plans: ApiSubscription[]) {
    return [...plans].sort(
        (a, b) =>
            PLAN_ORDER.indexOf(normalizePlanKind(a)) -
            PLAN_ORDER.indexOf(normalizePlanKind(b)),
    )
}
