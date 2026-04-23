import type { ApiSubscription } from '@/services/SubscriptionService'

type PlanKind = 'free' | 'starter' | 'manager' | 'enterprise'

const PLAN_ORDER: PlanKind[] = ['free', 'starter', 'manager', 'enterprise']

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
