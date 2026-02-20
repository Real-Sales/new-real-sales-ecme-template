import { Button } from '@/components/ui'
import { HiArrowRight } from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'
import { Link } from 'react-router-dom'

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
    // Mock balance data - replace with actual data
    const totalCredits = 87711
    const remainingCredits = 84116
    const usagePercent = 50

    return (
        <div className="p-2.5 mx-4 mb-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
            {/* Balance Section */}
            <div className="flex items-center gap-2 mb-2">
                <CircleProgress percent={usagePercent} />
                <h5 className="font-bold text-sm">Balance</h5>
            </div>
            <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Total</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                        <NumericFormat
                            displayType="text"
                            value={totalCredits}
                            thousandSeparator=","
                            suffix=" Sessions"
                        />
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Remaining</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                        <NumericFormat
                            displayType="text"
                            value={remainingCredits}
                            thousandSeparator=","
                        />
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
