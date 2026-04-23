import { useMemo } from 'react'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setPaymentDialog, setSelectedPlan } from '../store/subscriptionSlice'
import classNames from '@/utils/classNames'
import { NumericFormat } from 'react-number-format'
import { TbArrowRight, TbCheck, TbX } from 'react-icons/tb'
import type { ApiSubscription, UserSubscriptionRecord } from '@/services/SubscriptionService'
import {
    planDisplayTitle,
    planRowsForSubscription,
    sortSubscriptionsForDisplay,
} from '../planFeatures'
import type { PaymentCycle } from '../types'

type PlansProps = {
    subscriptions: ApiSubscription[]
    loading?: boolean
    currentUserSubscription?: UserSubscriptionRecord | null
}

const billingCycleFromPaymentCycle = (cycle: PaymentCycle) =>
    cycle === 'annually' ? 'yearly' : 'monthly'

const Plans = ({
    subscriptions,
    loading,
    currentUserSubscription = null,
}: PlansProps) => {
    const dispatch = useAppDispatch()
    const paymentCycle = useAppSelector((state) => state.subscription.paymentCycle)

    const apiCycle = billingCycleFromPaymentCycle(paymentCycle)

    const visiblePlans = useMemo(() => {
        const active = subscriptions.filter((s) => s.status_active)
        const forCycle = active.filter((s) => s.billing_cycle === apiCycle)
        return sortSubscriptionsForDisplay(forCycle)
    }, [subscriptions, apiCycle])

    const parsePrice = (v: string) => {
        const n = parseFloat(v)
        return Number.isFinite(n) ? n : 0
    }

    const handleChoosePlan = (plan: ApiSubscription) => {
        const title = planDisplayTitle(plan)
        if (plan.is_custom || plan.plan_type.toLowerCase() === 'enterprise') {
            window.location.href =
                'mailto:sales@realsales.com?subject=RealSales%20Enterprise%20plan'
            return
        }
        dispatch(
            setSelectedPlan({
                planName: title,
                planType: plan.plan_type.toLowerCase(),
                paymentCycle,
                price: {
                    monthly: parsePrice(plan.monthly_price),
                    annually: parsePrice(plan.yearly_price),
                },
                subscriptionId: plan.subscription_id,
                isCustomPlan: plan.is_custom,
            }),
        )
        dispatch(setPaymentDialog(true))
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16 text-gray-500 dark:text-gray-400">
                Loading plans…
            </div>
        )
    }

    if (!visiblePlans.length) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No subscription options for this billing period.
            </div>
        )
    }

    return (
        <div
            className={classNames(
                'grid gap-6',
                visiblePlans.length >= 4
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
                    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
            )}
        >
            {visiblePlans.map((plan) => {
                const title = planDisplayTitle(plan)
                const rows = planRowsForSubscription(plan)
                const isEnterprise =
                    plan.plan_type.toLowerCase() === 'enterprise' || plan.is_custom
                const monthlyAmount = parsePrice(plan.monthly_price)
                const yearlyAmount = parsePrice(plan.yearly_price)
                const isFree = monthlyAmount === 0 && yearlyAmount === 0 && !isEnterprise

                const subtitle = isEnterprise
                    ? 'Best for large organizations'
                    : paymentCycle === 'monthly'
                      ? 'Billed monthly. All credits granted upfront.'
                      : 'Billed yearly. All credits granted upfront.'

                const userSub = currentUserSubscription
                const isCurrentPlan = Boolean(
                    userSub &&
                        plan.subscription_id === userSub.subscription_id &&
                        plan.billing_cycle === userSub.subscription.billing_cycle,
                )

                const ctaLabel = isCurrentPlan
                    ? 'Current plan'
                    : isEnterprise
                      ? 'Contact sales'
                      : isFree
                        ? 'Choose plan'
                        : 'Choose plan'

                return (
                    <div
                        key={plan.subscription_id}
                        className={classNames(
                            'flex flex-col rounded-2xl border border-gray-200 bg-gray-100/80 p-6 dark:border-gray-700 dark:bg-gray-800/50',
                            plan.plan_type.toLowerCase() === 'manager' &&
                                'ring-2 ring-primary/30',
                        )}
                    >
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="text-lg font-bold tracking-tight">
                                RealSales
                            </span>
                            <Tag className="rounded-full border-0 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
                                Punctuate
                            </Tag>
                        </div>
                        <h4 className="mb-1 text-xl font-bold heading-text">{title}</h4>
                        <p className="mb-6 min-h-[2.75rem] text-sm text-gray-600 dark:text-gray-400">
                            {subtitle}
                        </p>

                        <div className="mb-6">
                            {isEnterprise ? (
                                <>
                                    <div className="text-3xl font-bold heading-text">
                                        Custom
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Custom credits
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <NumericFormat
                                            thousandSeparator
                                            fixedDecimalScale
                                            className="text-3xl font-bold heading-text"
                                            decimalScale={2}
                                            displayType="text"
                                            prefix="$"
                                            value={
                                                paymentCycle === 'monthly'
                                                    ? monthlyAmount
                                                    : yearlyAmount
                                            }
                                        />
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            (
                                            <NumericFormat
                                                thousandSeparator
                                                displayType="text"
                                                value={plan.credits_per_month}
                                            />{' '}
                                            Credits)
                                        </span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                        Up to {plan.max_session_duration} min sessions
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 dark:border-gray-600">
                            {rows.map((row) => (
                                <div
                                    key={row.label}
                                    className="flex items-start gap-3 text-sm font-semibold heading-text"
                                >
                                    {row.included ? (
                                        <TbCheck className="mt-0.5 shrink-0 text-xl text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <TbX className="mt-0.5 shrink-0 text-xl text-red-500 dark:text-red-400" />
                                    )}
                                    <span
                                        className={classNames(
                                            !row.included && 'text-gray-600 dark:text-gray-400',
                                        )}
                                    >
                                        {row.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-8">
                            <Button
                                block
                                disabled={isCurrentPlan}
                                className="h-11 border-0 bg-gray-900 font-semibold uppercase tracking-wide text-amber-400 hover:bg-gray-800 dark:bg-gray-950 dark:hover:bg-black"
                                onClick={() => handleChoosePlan(plan)}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {ctaLabel}
                                    <TbArrowRight className="text-lg" />
                                </span>
                            </Button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Plans
