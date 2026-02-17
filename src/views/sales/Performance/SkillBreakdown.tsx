import { useState } from 'react'
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import { COLORS } from '@/constants/chart.constant'
import { TbTargetArrow } from 'react-icons/tb'
import { NumericFormat } from 'react-number-format'
import classNames from '@/utils/classNames'
import { skillBreakdownData, type SkillBreakdownKey } from './performanceData'

const skills: { key: SkillBreakdownKey; label: string }[] = [
    { key: 'prospecting', label: 'Prospecting' },
    { key: 'discovering', label: 'Discovering' },
    { key: 'closing', label: 'Closing' },
]

const donutColors = [COLORS[0], COLORS[6], COLORS[8]]

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

const SkillBreakdown = () => {
    const [activeSkill, setActiveSkill] = useState<SkillBreakdownKey>('discovering')

    const data = skillBreakdownData[activeSkill]
    
    const getGraphColor = (score: number) => {
        if (score >= 80) return '#22C55E' // green
        if (score < 40) return '#EF4444' // red
        return '#3B82F6' // primary blue
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
                    const skillData = skillBreakdownData[skill.key]
                    const accent = getAccentColor(skill.key)
                    const circumference = 2 * Math.PI * 18
                    const offset = circumference - (skillData.score / 100) * circumference
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
                                        {skillData.score}%
                                    </span>
                                </div>
                                {/* Label & meta */}
                                <div className="min-w-0">
                                    <h5 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                        {skill.label}
                                    </h5>
                                    <p className="text-[11px] text-gray-400 mt-0.5">5 sessions</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Graph section - chart left, labels right */}
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
                                data: data.series,
                            },
                        ]}
                        customOptions={{
                            colors: [getGraphColor(data.score)],
                            xaxis: {
                                categories: data.labels,
                                labels: {
                                    formatter: (val: string) => {
                                        return `${data.labels.indexOf(val) + 1}`
                                    },
                                },
                            },
                            yaxis: { show: false, max: 100, min: 0 },
                            tooltip: {
                                custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
                                    return `
                                        <div class="py-2 px-4 rounded-xl">
                                            <div class="flex items-center gap-2">
                                                <div class="h-[10px] w-[10px] rounded-full" style="background-color: ${getGraphColor(data.score)}"></div>
                                                <div class="flex gap-2">${data.labels[dataPointIndex]}: <span class="font-bold">${data.series[dataPointIndex]}</span></div>
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
                    {data.labels.map((label, index) => (
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
                                    data.series[index] >= 75 && 'bg-success',
                                    data.series[index] <= 30 && 'bg-error',
                                    data.series[index] > 30 &&
                                        data.series[index] < 75 &&
                                        'bg-warning',
                                )}
                            >
                                {data.series[index]}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

export default SkillBreakdown
