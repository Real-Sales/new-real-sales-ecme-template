import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { useAppSelector } from '@/store/hook'
import { NumericFormat } from 'react-number-format'
import {
    TbBolt,
    TbCalendarEvent,
    TbCreditCard,
    TbMessageCircle,
} from 'react-icons/tb'

const CurrentPlanUsage = () => {
    const currentPlan = useAppSelector(
        (state) => state.subscription.currentPlan,
    )

    const usagePercent = Math.round(
        (currentPlan.sessionsUsed / currentPlan.sessionsTotal) * 100,
    )

    return (
        <Card className="mb-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                        <TbBolt className="text-2xl text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold">
                                {currentPlan.plan} Plan
                            </h4>
                            <Tag className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md border-0 font-semibold">
                                <span className="capitalize">
                                    {currentPlan.status}
                                </span>
                            </Tag>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Billed {currentPlan.billingCycle} •{' '}
                            <NumericFormat
                                displayType="text"
                                value={currentPlan.amount}
                                prefix={'$'}
                                thousandSeparator={true}
                            />
                            /{currentPlan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sessions Usage */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                            <TbMessageCircle className="text-lg text-blue-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Sessions Used
                        </span>
                    </div>
                    <div className="flex items-end gap-1 mb-3">
                        <span className="text-2xl font-bold heading-text">
                            <NumericFormat
                                displayType="text"
                                value={currentPlan.sessionsUsed}
                                thousandSeparator=","
                            />
                        </span>
                        <span className="text-sm text-gray-400 mb-0.5">
                            /{' '}
                            <NumericFormat
                                displayType="text"
                                value={currentPlan.sessionsTotal}
                                thousandSeparator=","
                            />
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {usagePercent}% used
                    </p>
                </div>

                {/* Next Billing */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                            <TbCalendarEvent className="text-lg text-amber-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Next Billing
                        </span>
                    </div>
                    <div className="text-2xl font-bold heading-text mb-1">
                        {currentPlan.renewalDate}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentPlan.daysRemaining} days remaining
                    </p>
                </div>

                {/* Amount Due */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                            <TbCreditCard className="text-lg text-emerald-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Amount Due
                        </span>
                    </div>
                    <div className="text-2xl font-bold heading-text mb-1">
                        <NumericFormat
                            displayType="text"
                            value={currentPlan.amount}
                            prefix={'$'}
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale
                        />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due on {currentPlan.renewalDate}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default CurrentPlanUsage
