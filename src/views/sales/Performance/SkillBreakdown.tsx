import { useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import { COLORS } from '@/constants/chart.constant'
import { TbTargetArrow } from 'react-icons/tb'
import classNames from '@/utils/classNames'
import type { PerformanceReportResponse } from '@/services/PerformanceService'

type SkillBreakdownKey = 'prospecting' | 'discovering' | 'closing'

const skills: { key: SkillBreakdownKey; label: string }[] = [
    { key: 'prospecting', label: 'Prospecting' },
    { key: 'discovering', label: 'Discovering' },
    { key: 'closing', label: 'Closing' },
]

const getAccentColor = (key: SkillBreakdownKey) => {
    switch (key) {
        case 'prospecting':
            return { stroke: '#3B82F6', bg: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500', ring: 'ring-blue-500/40' }
        case 'discovering':
            return { stroke: '#10B981', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-500', ring: 'ring-emerald-500/40' }
        case 'closing':
            return { stroke: '#EF4444', bg: 'bg-red-500', bgLight: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-500', ring: 'ring-red-500/40' }
    }
}

const formatLabel = (key: string) => {
    return key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

type SkillBreakdownProps = {
    data: PerformanceReportResponse | null
    loading?: boolean
}

const SkillBreakdown = ({ data, loading }: SkillBreakdownProps) => {
    const [activeSkill, setActiveSkill] = useState<SkillBreakdownKey>('discovering')

    const skillDataMap = useMemo(() => {
        if (!data?.mode_averages) return {}

        const map: Record<string, any> = {}
        data.mode_averages.forEach((mode) => {
            const scores = { ...mode.average_scores }
            const overallScore = scores.overall_score
            delete (scores as any).overall_score

            const labels = Object.keys(scores).map(formatLabel)
            const series = Object.values(scores) as number[]

            map[mode.mode_name.toLowerCase()] = {
                labels,
                series,
                score: Math.round(overallScore),
                totalSessions: mode.total_sessions
            }
        })
        return map
    }, [data])

    const activeData = skillDataMap[activeSkill]
    
    const getGraphColor = (score: number) => {
        if (score >= 80) return '#22C55E' // green
        if (score < 40) return '#EF4444' // red
        return '#3B82F6' // primary blue
    }

    if (loading) {
        return (
            <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="h-[400px] flex items-center justify-center">
                    <span className="text-gray-500">Loading skill breakdown...</span>
                </div>
            </Card>
        )
    }

    if (!data?.mode_averages?.length) {
        return (
            <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                        <TbTargetArrow className="text-xl text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            Skill Breakdown
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select a skill to view detailed breakdown
                        </p>
                    </div>
                </div>
                <div className="h-[300px] flex flex-col items-center justify-center gap-2">
                    <TbTargetArrow className="text-3xl text-gray-300 dark:text-gray-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        No performance data yet
                    </span>
                </div>
            </Card>
        )
    }

    return (
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md">
            {/* Section Heading */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                    <TbTargetArrow className="text-xl text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        Skill Breakdown
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a skill to view detailed breakdown
                    </p>
                </div>
            </div>

            {/* Skill selector buttons - single horizontal row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {skills.map((skill) => {
                    const isActive = activeSkill === skill.key
                    const skillData = skillDataMap[skill.key]
                    const score = skillData?.score || 0
                    const accent = getAccentColor(skill.key)
                    const circumference = 2 * Math.PI * 18
                    const offset = circumference - (score / 100) * circumference
                    return (
                        <div
                            key={skill.key}
                            onClick={() => setActiveSkill(skill.key)}
                            className={classNames(
                                'rounded-xl cursor-pointer transition-all duration-300 p-4 shadow-md',
                                isActive
                                    ? `ring-2 ${accent.ring} shadow-lg ${accent.bgLight}`
                                    : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:shadow-lg',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {/* Circular score ring */}
                                <div className="relative flex-shrink-0">
                                    <svg width="48" height="48" viewBox="0 0 44 44">
                                        <circle
                                            cx="22" cy="22" r="18"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            className="text-gray-200 dark:text-gray-700"
                                        />
                                        <circle
                                            cx="22" cy="22" r="18"
                                            fill="none"
                                            stroke={accent.stroke}
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={offset}
                                            transform="rotate(-90 22 22)"
                                            className="transition-all duration-500"
                                        />
                                    </svg>
                                    <span className={classNames(
                                        'absolute inset-0 flex items-center justify-center text-[10px] font-bold',
                                        accent.text,
                                    )}>
                                        {score}%
                                    </span>
                                </div>
                                {/* Label & meta */}
                                <div className="min-w-0">
                                    <h5 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                        {skill.label}
                                    </h5>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{skillData?.totalSessions || 0} sessions</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Graph section - chart left, labels right */}
            {activeData && activeData.series.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    {/* Left - Radar chart */}
                    <div>
                        <Chart
                            key={activeSkill}
                            type="radar"
                            height={300}
                            series={[
                                {
                                    name: 'Score',
                                    data: activeData.series,
                                },
                            ]}
                            customOptions={{
                                colors: [getGraphColor(activeData.score)],
                                xaxis: {
                                    categories: activeData.labels,
                                    labels: {
                                        formatter: (val: string) => {
                                            const index = activeData.labels.indexOf(val)
                                            return index !== -1 ? `${index + 1}` : val
                                        },
                                    },
                                },
                                yaxis: { show: false, max: 100, min: 0 },
                                tooltip: {
                                    custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
                                        return `
                                            <div class="py-2 px-4 rounded-xl">
                                                <div class="flex items-center gap-2">
                                                    <div class="h-[10px] w-[10px] rounded-full" style="background-color: ${getGraphColor(activeData.score)}"></div>
                                                    <div class="flex gap-2">${activeData.labels[dataPointIndex]}: <span class="font-bold">${activeData.series[dataPointIndex]}</span></div>
                                                </div>
                                            </div>
                                        `
                                    },
                                },
                            }}
                        />
                    </div>

                    {/* Right - Numbered legend list */}
                    <div className="flex flex-col gap-4">
                        {activeData.labels.map((label: string, index: number) => (
                            <div
                                key={label + index}
                                className="flex items-center gap-4"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full h-8 w-8 border-2 border-gray-200 dark:border-gray-600 font-bold text-xs heading-text flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                    <div className="heading-text text-sm whitespace-nowrap">{label}</div>
                                </div>
                                <div className="border-dashed border-[1.5px] border-gray-300 dark:border-gray-500 flex-1" />
                                <span
                                    className={classNames(
                                        'rounded-full px-2 py-1 text-xs font-semibold text-white',
                                        activeData.series[index] >= 75 && 'bg-success',
                                        activeData.series[index] <= 30 && 'bg-error',
                                        activeData.series[index] > 30 &&
                                            activeData.series[index] < 75 &&
                                            'bg-warning',
                                    )}
                                >
                                    {Math.round(activeData.series[index])}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-[300px] flex flex-col items-center justify-center gap-2">
                    <TbTargetArrow className="text-3xl text-gray-300 dark:text-gray-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {activeData
                            ? 'No category breakdown available for this mode yet'
                            : 'No data available for this skill mode'}
                    </span>
                </div>
            )}
        </Card>
    )
}

export default SkillBreakdown
