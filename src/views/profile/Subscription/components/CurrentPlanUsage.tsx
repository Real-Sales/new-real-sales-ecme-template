import Card from '@/components/ui/Card'
import {
    SURFACE_CARD_CLASSNAME,
    SURFACE_INNER_TILE_CLASSNAME,
} from '@/constants/surfaceCard.constant'
import Tag from '@/components/ui/Tag'
import Alert from '@/components/ui/Alert'
import { NumericFormat } from 'react-number-format'
import {
    TbBolt,
    TbCalendarEvent,
    TbCreditCard,
    TbMessageCircle,
} from 'react-icons/tb'
import {
    isCompanyCreditPool,
    type UserSubscriptionRecord,
} from '@/services/SubscriptionService'

type CurrentPlanUsageProps = {
    activeUserSubscription: UserSubscriptionRecord | null
    loading: boolean
    error: string | null
    hasUserId: boolean
}

function formatPlanTitle(planType: string) {
    const t = planType.replace(/_/g, ' ')
    return `${t.charAt(0).toUpperCase()}${t.slice(1).toLowerCase()} Plan`
}

function formatDateLabel(iso: string) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) {
        return '—'
    }
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

function daysUntil(iso: string) {
    const end = new Date(iso).getTime()
    if (Number.isNaN(end)) {
        return 0
    }
    const start = Date.now()
    return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
}

function parseAmount(s: string) {
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : 0
}

const CurrentPlanUsage = ({
    activeUserSubscription,
    loading,
    error,
    hasUserId,
}: CurrentPlanUsageProps) => {
    if (!hasUserId) {
        return (
            <Card className={`mb-6 ${SURFACE_CARD_CLASSNAME}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sign in to view your subscription and usage.
                </p>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card className={`mb-6 ${SURFACE_CARD_CLASSNAME}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading your subscription…
                </p>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className={`mb-6 ${SURFACE_CARD_CLASSNAME}`}>
                <Alert showIcon type="danger">
                    {error}
                </Alert>
            </Card>
        )
    }

    if (!activeUserSubscription) {
        return (
            <Card className={`mb-6 ${SURFACE_CARD_CLASSNAME}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No subscription is linked to your account yet.
                </p>
            </Card>
        )
    }

    const sub = activeUserSubscription.subscription
    if (!sub) {
        return (
            <Card className={`mb-6 ${SURFACE_CARD_CLASSNAME}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Credit pool loaded, but plan details are unavailable.
                </p>
            </Card>
        )
    }

    const billingLabel =
        sub.billing_cycle === 'yearly' ? 'yearly' : 'monthly'
    const periodSuffix = sub.billing_cycle === 'yearly' ? 'yr' : 'mo'
    const amount =
        sub.billing_cycle === 'yearly'
            ? parseAmount(sub.yearly_price ?? '0')
            : parseAmount(sub.monthly_price)

    const creditsUsed = Number(activeUserSubscription.credits_used ?? 0)
    const creditsAllocated = Number(activeUserSubscription.credits_allocated ?? 0)
    const creditsRemaining = Number(
        activeUserSubscription.credits_remaining ??
            Math.max(0, creditsAllocated - creditsUsed),
    )
    const usageNumerator = creditsUsed
    const usageDenominator = creditsAllocated
    const usagePercentRaw =
        usageDenominator > 0
            ? Math.round((usageNumerator / usageDenominator) * 100)
            : 0
    const usagePercent = Math.min(100, usagePercentRaw)

    const endDate = activeUserSubscription.end_date
    const renewalLabel = endDate ? formatDateLabel(endDate) : '—'
    const daysRemaining = endDate ? daysUntil(endDate) : 0
    const statusLabel = activeUserSubscription.status_active ? 'active' : 'inactive'
    const poolLabel = isCompanyCreditPool(activeUserSubscription)
        ? 'Company credits'
        : 'Your credits'

    return (
        <Card className={`mb-6 ${SURFACE_CARD_CLASSNAME}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                        <TbBolt className="text-2xl text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold">
                                {formatPlanTitle(sub.plan_type)}
                            </h4>
                            <Tag className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md border-0 font-semibold">
                                <span className="capitalize">{statusLabel}</span>
                            </Tag>
                            <Tag className="bg-primary/10 text-primary rounded-md border-0 font-semibold">
                                {poolLabel}
                            </Tag>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Billed {billingLabel} •{' '}
                            <NumericFormat
                                thousandSeparator
                                fixedDecimalScale
                                decimalScale={2}
                                displayType="text"
                                prefix="₹"
                                value={amount}
                            />
                            /{periodSuffix}
                            {' · '}
                            {creditsRemaining} remaining
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${SURFACE_INNER_TILE_CLASSNAME} p-4`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                            <TbMessageCircle className="text-lg text-blue-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Sessions used
                        </span>
                    </div>
                    <div className="flex items-end gap-1 mb-3">
                        <span className="text-2xl font-bold heading-text">
                            <NumericFormat
                                thousandSeparator
                                displayType="text"
                                value={usageNumerator}
                            />
                        </span>
                        <span className="text-sm text-gray-400 mb-0.5">
                            /{' '}
                            <NumericFormat
                                thousandSeparator
                                displayType="text"
                                value={usageDenominator}
                            />
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {usagePercentRaw}% used
                    </p>
                </div>

                <div className={`${SURFACE_INNER_TILE_CLASSNAME} p-4`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                            <TbCalendarEvent className="text-lg text-amber-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Next billing
                        </span>
                    </div>
                    <div className="text-2xl font-bold heading-text mb-1">
                        {renewalLabel}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {daysRemaining} days remaining
                    </p>
                </div>

                <div className={`${SURFACE_INNER_TILE_CLASSNAME} p-4`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                            <TbCreditCard className="text-lg text-emerald-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Amount due
                        </span>
                    </div>
                    <div className="text-2xl font-bold heading-text mb-1">
                        <NumericFormat
                            thousandSeparator
                            fixedDecimalScale
                            decimalScale={2}
                            displayType="text"
                            prefix="₹"
                            value={amount}
                        />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due on {renewalLabel}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default CurrentPlanUsage
