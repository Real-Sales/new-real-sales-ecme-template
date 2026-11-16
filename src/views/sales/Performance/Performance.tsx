import { useEffect } from 'react'
import AnimatedContent from '@/components/reactbits/AnimatedContent'
import { CountUp } from '../OverviewWidgets/common'
import { Card, toast, Notification } from '@/components/ui'
import Container from '@/components/shared/Container'
import PerformanceLineChart from './PerformanceLineChart'
import SkillBreakdown from './SkillBreakdown'
import SessionHistorySection from './SessionHistory'
import { TbChartBar, TbTrendingUp } from 'react-icons/tb'
import { injectReducer } from '@/store'
import performanceReducer, {
    useAppSelector,
    useAppDispatch,
    fetchPerformanceByMode,
    resetNotification,
} from '@/store/slices/performance'
import type { PerformanceReportResponse } from '@/services/PerformanceService'
import { SURFACE_CARD_CLASSNAME } from '@/constants/surfaceCard.constant'

// Inject reducer when component mounts (lazy-loaded)
injectReducer('performance', performanceReducer)

// Analytics card component
type AnalyticsCardProps = {
    icon: React.ReactNode
    value: React.ReactNode
    label: string
    iconBg: string
}

const AnalyticsCard = ({ icon, value, label, iconBg }: AnalyticsCardProps) => {
    return (
        <Card
            className={`${SURFACE_CARD_CLASSNAME} hover:shadow-md transition-shadow duration-300`}
            bodyClass="!p-4"
        >
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
    const dispatch = useAppDispatch()
    const userId = useAppSelector((state) => state.auth.user.userId)

    const {
        performanceReport,
        performanceLoading,
        initialized,
        notification,
    } = useAppSelector(
        (state) =>
            state.performance?.data ?? {
                performanceByMode: [],
                performanceReport: null,
                monthlyTrend: null,
                performanceLoading: false,
                trendLoading: false,
                initialized: false,
                error: null,
                notification: null,
            }
    )

    useEffect(() => {
        if (userId && !initialized && !performanceLoading) {
            dispatch(fetchPerformanceByMode(userId))
        }
    }, [dispatch, userId, initialized, performanceLoading])

    useEffect(() => {
        if (notification) {
            const type = (notification.type || 'info') as 'success' | 'warning' | 'danger' | 'info'
            toast.push(
                <Notification title={type.charAt(0).toUpperCase() + type.slice(1)} type={type}>
                    {notification.message}
                </Notification>
            )
            dispatch(resetNotification())
        }
    }, [notification, dispatch])

    const reportData = performanceReport
    const totalSessions = reportData?.total_sessions_analyzed || 0
    const averageScore = reportData?.overall_average_score || 0
    const loading = performanceLoading
    const showEmptyState = initialized && !loading && totalSessions === 0

    return (
        <div className="min-h-full">
            <Container className="pb-6">
                {/* Header */}
                <div className="mb-6" data-tour-id="performance-page">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Performance
                    </h1>
                    {showEmptyState && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            No session data yet. Complete a practice session to see your
                            performance here.
                        </p>
                    )}
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <AnalyticsCard
                        icon={<TbChartBar />}
                        value={loading ? '...' : <CountUp value={totalSessions} />}
                        label="Total Sessions"
                        iconBg="bg-gray-100 dark:bg-gray-700/50"
                    />
                    <AnalyticsCard
                        icon={<TbTrendingUp />}
                        value={loading ? '...' : <CountUp value={averageScore} decimals={1} />}
                        label="Average Score"
                        iconBg="bg-gray-100 dark:bg-gray-700/50"
                    />
                </div>

                {/* Performance Line Chart */}
                <AnimatedContent trigger="mount" distance={28} duration={0.7} delay={0.1}>
                    <PerformanceLineChart />
                </AnimatedContent>

                {/* Skill Breakdown Section */}
                <AnimatedContent trigger="mount" distance={28} duration={0.7} delay={0.22} className="mt-6">
                    <SkillBreakdown 
                        data={reportData} 
                        loading={loading}
                    />
                </AnimatedContent>

                {/* Session History Section */}
                <AnimatedContent trigger="mount" distance={28} duration={0.7} delay={0.34} className="mt-6">
                    <SessionHistorySection />
                </AnimatedContent>
            </Container>
        </div>
    )
}

export default Performance
