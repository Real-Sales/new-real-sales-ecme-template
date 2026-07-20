import { useEffect } from 'react'
import { Button } from '@/components/ui'
import { HiArrowRight } from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { isCompanyCreditPool } from '@/services/SubscriptionService'
import { fetchMySubscription } from '@/views/profile/Subscription/store/subscriptionSlice'

type UpgradeCardProps = {
    /** When true, ignore theme and render with the dark palette (used by the always-dark desktop side nav). */
    forceDark?: boolean
}

const CircleProgress = ({
    percent,
    forceDark,
}: {
    percent: number
    forceDark?: boolean
}) => {
    const size = 20
    const strokeWidth = 2.5
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percent / 100) * circumference

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className={
                    forceDark
                        ? 'text-gray-700'
                        : 'text-gray-200 dark:text-gray-700'
                }
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="text-primary"
            />
        </svg>
    )
}

const UpgradeCard = ({ forceDark = false }: UpgradeCardProps) => {
    const dispatch = useAppDispatch()
    const userId = useAppSelector((state) => state.auth.user.userId?.trim() ?? '')
    const activeSub = useAppSelector((state) => state.subscription.activeUserSubscription)
    const loading = useAppSelector((state) => state.subscription.userSubscriptionLoading)
    const initialized = useAppSelector(
        (state) => state.subscription.userSubscriptionInitialized,
    )

    useEffect(() => {
        if (userId && !initialized) {
            dispatch(fetchMySubscription())
        }
    }, [dispatch, userId, initialized])

    const totalCredits = Number(activeSub?.credits_allocated ?? 0)
    const usedCredits = Number(activeSub?.credits_used ?? 0)
    /** Prefer server `credits_remaining`; local math breaks when used > allocated or semantics differ. */
    const remainingCredits =
        activeSub?.credits_remaining != null
            ? Number(activeSub.credits_remaining)
            : Math.max(0, totalCredits - usedCredits)
    const usagePercent = (() => {
        if (activeSub?.credits_remaining != null) {
            const rem = Number(activeSub.credits_remaining)
            const denom = rem + usedCredits
            if (denom > 0) {
                return Math.min(100, Math.round((usedCredits / denom) * 100))
            }
            return 0
        }
        return totalCredits > 0
            ? Math.min(100, Math.round((usedCredits / totalCredits) * 100))
            : 0
    })()

    const showDash = loading || !userId

    const containerCls = forceDark
        ? 'p-2.5 mx-4 mt-4 mb-2 rounded-lg border border-gray-700/80 bg-gray-900/75 shadow-md backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:shadow-lg'
        : 'p-2.5 mx-4 mt-4 mb-2 rounded-lg bg-gray-100 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-gray-900/90 dark:border-gray-700'
    const titleCls = forceDark
        ? 'font-bold text-sm text-white'
        : 'font-bold text-sm text-gray-900 dark:text-white'
    const labelCls = forceDark
        ? 'text-[10px] text-gray-400'
        : 'text-[10px] text-gray-500 dark:text-gray-400'
    const valueCls = forceDark
        ? 'text-xs font-bold text-white'
        : 'text-xs font-bold text-gray-900 dark:text-white'
    const buttonCls = forceDark
        ? 'border border-gray-600 bg-gray-800/90 px-2.5 py-1.5 h-auto rounded-lg text-gray-100 transition-all hover:border-gray-500 hover:bg-gray-700 flex items-center justify-between'
        : 'bg-gray-200/90 hover:bg-gray-300 text-gray-800 hover:text-gray-900 border border-gray-300 flex justify-between items-center px-2.5 py-1.5 h-auto rounded-lg transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-white dark:border-gray-600'

    return (
        <div className={containerCls}>
            <div className="flex items-center gap-2 mb-2">
                <CircleProgress
                    percent={showDash ? 0 : usagePercent}
                    forceDark={forceDark}
                />
                <h5 className={titleCls}>
                    {isCompanyCreditPool(activeSub) ? 'Company credits' : 'Balance'}
                </h5>
            </div>
            <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between">
                    <span className={labelCls}>Total</span>
                    <span className={valueCls}>
                        {showDash ? (
                            <span className="tabular-nums">—</span>
                        ) : (
                            <NumericFormat
                                thousandSeparator
                                displayType="text"
                                suffix=" Sessions"
                                value={totalCredits}
                            />
                        )}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className={labelCls}>Remaining</span>
                    <span className={valueCls}>
                        {showDash ? (
                            <span className="tabular-nums">—</span>
                        ) : (
                            <NumericFormat
                                thousandSeparator
                                displayType="text"
                                value={remainingCredits}
                            />
                        )}
                    </span>
                </div>
            </div>
            <Link to="/subscription">
                <Button block size="sm" className={buttonCls}>
                    <span className="text-xs font-semibold">upgrade your plan</span>
                    <HiArrowRight className="text-sm" />
                </Button>
            </Link>
        </div>
    )
}

export default UpgradeCard
