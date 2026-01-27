import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Chart from '@/components/shared/Chart'
import { useAppSelector } from '@/store'
import { TbChartLine } from 'react-icons/tb'
import { teamPerformanceData, type SkillType } from './teamPerformanceData'

const PerformanceChart = () => {
    const [showChart, setShowChart] = useState(true)
    const [selectedSkill, setSelectedSkill] = useState<SkillType>('closing')
    
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
    }, [sideNavCollapse, selectedSkill])

    // Get chart data based on selected skill
    const data = teamPerformanceData[selectedSkill]

    // Skill options for dropdown
    const skillOptions = [
        { value: 'closing', label: 'Closing' },
        { value: 'discovery', label: 'Discovery' },
        { value: 'objection', label: 'Objection Handling' },
        { value: 'presentation', label: 'Presentation' },
    ]

    const handleSkillChange = (option: { value: string; label: string } | null) => {
        if (option) {
            setSelectedSkill(option.value as SkillType)
        }
    }

    // Safety check
    if (!data || !data.members || !data.months || !Array.isArray(data.members) || data.members.length === 0) {
        return null
    }

    // Prepare series data for ApexCharts with additional validation
    const series = data.members
        .filter((member) => member && member.name && Array.isArray(member.data))
        .map((member) => ({
            name: member.name,
            data: member.data,
        }))

    // Get colors from members
    const colors = data.members
        .filter((member) => member && member.color)
        .map((member) => member.color)

    // Additional safety check for series
    if (!series || series.length === 0) {
        return null
    }

    return (
        <Card>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <TbChartLine className="text-xl text-gray-700 dark:text-gray-300" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        Team Performance Growth
                    </h4>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Show by:
                    </span>
                    <Select
                        size="sm"
                        value={skillOptions.find(
                            (option) => option.value === selectedSkill
                        )}
                        options={skillOptions}
                        onChange={handleSkillChange}
                        className="min-w-[150px]"
                    />
                </div>
            </div>

            {/* Chart */}
            {showChart && series.length > 0 && data.months && data.months.length > 0 && (
                <div>
                    <Chart
                        key={`${selectedSkill}-${sideNavCollapse}`}
                        type="line"
                        series={series}
                        xAxis={data.months}
                        height="350px"
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
                </div>
            )}

            {/* Threshold Legend */}
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

            {/* Team Members Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-4">
                {data.members.map((member) => (
                    <div
                        key={member.name}
                        className="flex items-center gap-2"
                    >
                        <div
                            className="w-3.5 h-3.5 rounded-sm"
                            style={{ backgroundColor: member.color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {member.name}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default PerformanceChart
