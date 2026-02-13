import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import { useAppSelector } from '@/store'
import { TbChartLine } from 'react-icons/tb'
import { performanceData } from './performanceData'

const PerformanceLineChart = () => {
    const [showChart, setShowChart] = useState(true)
    
    const sideNavCollapse = useAppSelector(
        (state) => state.theme.layout.sideNavCollapse,
    )

    // Handle chart resize when sidebar collapses/expands
    useEffect(() => {
        setShowChart(false)
        const timer = setTimeout(() => {
            setShowChart(true)
        }, 400)
        return () => clearTimeout(timer)
    }, [sideNavCollapse])

    const data = performanceData

    // Prepare series data for ApexCharts
    const series = data.metrics.map((metric) => ({
        name: metric.name,
        data: metric.data,
    }))

    // Get colors from metrics
    const colors = data.metrics.map((metric) => metric.color)

    return (
        <Card>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <TbChartLine className="text-xl text-gray-700 dark:text-gray-300" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    Performance Growth
                </h4>
            </div>

            {/* Chart */}
            {showChart && series.length > 0 && data.months && data.months.length > 0 && (
                <div>
                    <Chart
                        key={`performance-${sideNavCollapse}`}
                        type="line"
                        series={series}
                        xAxis={data.months}
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
            )}

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-6">
                {data.metrics.map((metric) => (
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
        </Card>
    )
}

export default PerformanceLineChart
