import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import PerformanceLineChart from './PerformanceLineChart'
import SkillBreakdown from './SkillBreakdown'
import SessionHistorySection from './SessionHistory'
import { TbChartBar, TbTrendingUp } from 'react-icons/tb'

// Analytics card component
type AnalyticsCardProps = {
    icon: React.ReactNode
    value: string
    label: string
    iconBg: string
}

const AnalyticsCard = ({ icon, value, label, iconBg }: AnalyticsCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-300" bodyClass="!p-4">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-2 text-primary">
                    <div className="text-3xl">{icon}</div>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {label}
                    </p>
                </div>
            </div>
        </Card>
    )
}

const Performance = () => {
    // Mock data - replace with actual data
    const totalSessions = 125
    const averageScore = 75.8

    return (
        <div className="min-h-full">
            <Container className="pb-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Performance
                    </h1>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <AnalyticsCard
                        icon={<TbChartBar />}
                        value={totalSessions.toString()}
                        label="Total Sessions"
                        iconBg="bg-gray-100 dark:bg-gray-700/50"
                    />
                    <AnalyticsCard
                        icon={<TbTrendingUp />}
                        value={averageScore.toFixed(1)}
                        label="Average Score"
                        iconBg="bg-gray-100 dark:bg-gray-700/50"
                    />
                </div>

                {/* Performance Line Chart */}
                <PerformanceLineChart />

                {/* Skill Breakdown Section */}
                <div className="mt-6">
                    <SkillBreakdown />
                </div>

                {/* Session History Section */}
                <div className="mt-6">
                    <SessionHistorySection />
                </div>
            </Container>
        </div>
    )
}

export default Performance
