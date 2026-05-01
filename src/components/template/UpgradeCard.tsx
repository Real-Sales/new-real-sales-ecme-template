import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { HiArrowRight } from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/store/hook'
import {
    apiGetUserSubscriptionsByUser,
    pickActiveUserSubscription,
    type UserSubscriptionRecord,
} from '@/services/SubscriptionService'

const CircleProgress = ({ percent }: { percent: number }) => {
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
                className="text-gray-200 dark:text-gray-700"
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

const UpgradeCard = () => {
    const userId = useAppSelector((state) => state.auth.user.userId?.trim() ?? '')

    const [activeSub, setActiveSub] = useState<UserSubscriptionRecord | null>(null)
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        if (!userId) {
            setActiveSub(null)
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            const rows = await apiGetUserSubscriptionsByUser(userId)
            setActiveSub(
                pickActiveUserSubscription(Array.isArray(rows) ? rows : []),
            )
        } catch {
            setActiveSub(null)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        void load()
    }, [load])

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

    return (
        <div className="p-2.5 mx-4 mb-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
                <CircleProgress percent={showDash ? 0 : usagePercent} />
                <h5 className="font-bold text-sm">Balance</h5>
            </div>
            <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        Total
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
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
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        Remaining
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
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
                <Button
                    block
                    size="sm"
                    className="bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 hover:text-primary border border-gray-600 dark:border-gray-600 flex justify-between items-center px-2.5 py-1.5 h-auto rounded-lg transition-all"
                >
                    <span className="text-xs font-semibold">upgrade your plan</span>
                    <HiArrowRight className="text-sm" />
                </Button>
            </Link>
        </div>
    )
}

export default UpgradeCard
