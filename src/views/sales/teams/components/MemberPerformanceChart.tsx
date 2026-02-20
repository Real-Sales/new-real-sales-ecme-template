import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import { useAppSelector } from '@/store'
import { NumericFormat } from 'react-number-format'

type Mode = {
    name: string
    color: string
    data: number[]
}

type PerformanceData = {
    modes: Mode[]
    months: string[]
    sufficiencyLevel: number
    proficiencyLevel: number
}

type MemberPerformanceChartProps = {
    data: PerformanceData
    memberName: string
    overallScore: number
    totalSessions: number
}

const MemberPerformanceChart = ({ data, memberName, overallScore, totalSessions }: MemberPerformanceChartProps) => {
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

    // Safety check
    if (!data || !data.modes || !data.months || !Array.isArray(data.modes) || data.modes.length === 0) {
        return null
    }

    // Prepare series data for ApexCharts
    const series = data.modes
        .filter((mode) => mode && mode.name && Array.isArray(mode.data))
        .map((mode) => ({
            name: mode.name,
            data: mode.data,
        }))

    // Get colors from modes
    const colors = data.modes
        .filter((mode) => mode && mode.color)
        .map((mode) => mode.color)

    if (!series || series.length === 0) {
        return null
    }

    return (
        <>
            {/* Header Section - Outside Card */}
            <div className="mb-4">
                <h4 className="text-lg font-bold mb-1">Performance Overview</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track {memberName}'s progress across different modes and sessions.</p>
            </div>

            {/* Chart Card */}
            <Card className="mb-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md">
                {/* Stats Row */}
                <div className="mb-6">
                    <div className="flex items-center gap-10">
                        <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Overall Score</div>
                            <div className="flex items-end gap-2">
                                <h3 className="text-3xl font-bold">
                                    <NumericFormat
                                        displayType="text"
                                        value={overallScore}
                                        decimalScale={1}
                                        fixedDecimalScale
                                    />
                                </h3>
                                <span className="text-base text-gray-600 dark:text-gray-400 mb-1">
                                    /100
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Total Sessions</div>
                            <h3 className="text-3xl font-bold">{totalSessions}</h3>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div>
                    {showChart && series.length > 0 && data.months && data.months.length > 0 && (
                        <Chart
                            key={`member-${sideNavCollapse}`}
                            type="line"
                            series={series}
                            xAxis={data.months}
                            height="330px"
                            customOptions={{
                                colors: colors.length > 0 ? colors : undefined,
                                yaxis: {
                                    min: 0,
                                    max: 100,
                                    tickAmount: 4,
                                },
                                annotations: {
                                    yaxis: [
                                        {
                                            y: data.sufficiencyLevel,
                                            borderColor: '#F59E0B',
                                            borderWidth: 2,
                                            strokeDashArray: 5,
                                            label: {
                                                text: String(data.sufficiencyLevel),
                                                position: 'left',
                                                offsetX: -10,
                                                offsetY: 6,
                                                borderColor: 'transparent',
                                                style: {
                                                    color: '#9CA3AF',
                                                    background: 'transparent',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                    padding: {
                                                        left: 0,
                                                        right: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            y: data.proficiencyLevel,
                                            borderColor: '#22C55E',
                                            borderWidth: 2,
                                            strokeDashArray: 5,
                                            label: {
                                                text: String(data.proficiencyLevel),
                                                position: 'left',
                                                offsetX: -10,
                                                offsetY: 6,
                                                borderColor: 'transparent',
                                                style: {
                                                    color: '#9CA3AF',
                                                    background: 'transparent',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                    padding: {
                                                        left: 0,
                                                        right: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                    },
                                                },
                                            },
                                        },
                                    ],
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
                    )}
                </div>

                {/* Threshold Lines Legend */}
                <div className="flex justify-center gap-8 mt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <svg width="32" height="2" className="overflow-visible">
                            <line
                                x1="0"
                                y1="1"
                                x2="32"
                                y2="1"
                                stroke="#F59E0B"
                                strokeWidth="2"
                                strokeDasharray="5 4"
                            />
                        </svg>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Sufficiency</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg width="32" height="2" className="overflow-visible">
                            <line
                                x1="0"
                                y1="1"
                                x2="32"
                                y2="1"
                                stroke="#22C55E"
                                strokeWidth="2"
                                strokeDasharray="5 4"
                            />
                        </svg>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Proficiency</span>
                    </div>
                </div>

                {/* Mode Legends */}
                <div className="flex justify-center gap-6 mt-4">
                    {data.modes.map((mode) => (
                        <div
                            key={mode.name}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="w-3.5 h-3.5 rounded-sm"
                                style={{ backgroundColor: mode.color }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {mode.name}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    )
}

export default MemberPerformanceChart
