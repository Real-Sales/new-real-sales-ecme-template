import { useEffect, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import { TbChartLine } from 'react-icons/tb'
import {
    useAppSelector,
    useAppDispatch,
    fetchMonthlyTrend,
} from '@/store/slices/performance'
import type { MonthlyTrend } from '@/services/PerformanceService'
import dayjs from 'dayjs'

const PerformanceLineChart = () => {
    const dispatch = useAppDispatch()
    const userId = useAppSelector((state) => state.auth.user.userId)
    const sideNavCollapse = useAppSelector(
        (state) => state.theme.layout.sideNavCollapse,
    )

    const {
        monthlyTrend,
        trendLoading,
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
        if (userId) {
            dispatch(fetchMonthlyTrend(userId))
        }
    }, [dispatch, userId])

    const trendData = monthlyTrend
    const loading = trendLoading
    const showChart = true

    const chartData = useMemo(() => {
        if (!trendData) return { series: [], months: [], metrics: [] }

        const months = trendData.monthly_trends.map((t: MonthlyTrend) => dayjs(t.month).format('MMM'))
        
        const metrics = [
            { name: 'Discovering', key: 'discovering', color: '#3B82F6' },
            { name: 'Prospecting', key: 'prospecting', color: '#22C55E' },
            { name: 'Closing', key: 'closing', color: '#EF4444' },
        ]

        const series = metrics.map((m) => ({
            name: m.name,
            data: trendData.monthly_trends.map((t: MonthlyTrend) => (t.modes as any)[m.key]?.average_score || 0),
        }))

        return { series, months, metrics }
    }, [trendData])

    const colors = chartData.metrics.map((m) => m.color)

    return (
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                        <TbChartLine className="text-xl text-gray-700 dark:text-gray-300" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        Performance Growth
                    </h4>
                </div>
            </div>

            {/* Chart */}
            {loading ? (
                <div className="h-[350px] flex items-center justify-center">
                    <span className="text-gray-500">Loading chart data...</span>
                </div>
            ) : (
                showChart && chartData.series.length > 0 && chartData.months.length > 0 && (
                    <div>
                        <Chart
                            key={`performance-${sideNavCollapse}`}
                            type="line"
                            series={chartData.series}
                            xAxis={chartData.months}
                            height="350px"
                            customOptions={{
                                colors: colors,
                                yaxis: {
                                    min: 0,
                                    max: 100,
                                    tickAmount: 4,
                                },
                                legend: {
                                    show: false,
                                },
                                tooltip: {
                                    marker: {
                                        show: true,
                                    },
                                },
                            }}
                        />
                    </div>
                )
            )}

            {/* Legend */}
            {!loading && (
                <div className="flex flex-wrap justify-center gap-6 mt-6">
                    {chartData.metrics.map((metric) => (
                        <div
                            key={metric.name}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="w-3.5 h-3.5 rounded-sm"
                                style={{ backgroundColor: metric.color }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {metric.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}

export default PerformanceLineChart
