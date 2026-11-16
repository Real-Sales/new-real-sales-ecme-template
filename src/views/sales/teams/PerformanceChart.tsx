import { useEffect, useState, useMemo } from 'react'
import { SURFACE_CARD_CLASSNAME } from '@/constants/surfaceCard.constant'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Chart from '@/components/shared/Chart'
import Spinner from '@/components/ui/Spinner'
import { TbChartLine, TbChartBarOff } from 'react-icons/tb'
import {
    useAppSelector,
    useAppDispatch,
    fetchTeamMembersPerformance,
} from '@/store/slices/teams'
import dayjs from 'dayjs'

type PerformanceChartProps = {
    teamId: string
}

type SkillType = 'prospecting' | 'discovering' | 'closing'

const MODE_ID_MAP: Record<SkillType, string> = {
    closing: '1d4a466b-fd19-4286-b70e-48f707629ef6',
    discovering: 'bd9e102b-f018-4d61-adc2-9948d95e8078',
    prospecting: 'cefc24a0-c580-4114-9fc9-99fbda469e17'
}

const PerformanceChart = ({ teamId }: PerformanceChartProps) => {
    const dispatch = useAppDispatch()
    const [selectedSkill, setSelectedSkill] = useState<SkillType>('closing')
    const showChart = true
    
    const sideNavCollapse = useAppSelector(
        (state) => state.theme.layout.sideNavCollapse,
    )

    const {
        teamMembersPerformance,
        performanceLoading,
    } = useAppSelector(
        (state) =>
            state.teams?.data ?? {
                teamsData: [],
                teamsLoading: false,
                initialized: false,
                teamPerformance: {},
                teamMembersPerformance: {},
                performanceLoading: false,
                error: null,
                notification: null,
            }
    )

    const cacheKey = `${teamId}-${MODE_ID_MAP[selectedSkill]}`
    const performanceData = teamMembersPerformance[cacheKey]
    const isLoading = performanceLoading && !performanceData

    useEffect(() => {
        if (!performanceData) {
            dispatch(fetchTeamMembersPerformance({ teamId, modeId: MODE_ID_MAP[selectedSkill] }))
        }
    }, [dispatch, teamId, selectedSkill, performanceData])

    const skillOptions = [
        { value: 'prospecting', label: 'Prospecting' },
        { value: 'discovering', label: 'Discovering' },
        { value: 'closing', label: 'Closing' },
    ]

    const handleSkillChange = (option: { value: string; label: string } | null) => {
        if (option) {
            setSelectedSkill(option.value as SkillType)
        }
    }

    const chartData = useMemo(() => {
        if (!performanceData || performanceData.members.length === 0) return null

        // Get sorted months from the first member's performance (latest 6)
        const firstMember = performanceData.members[0]
        const sortedMonths = Object.keys(firstMember.monthly_performance).sort().slice(-6)
        
        // Format months for x-axis (e.g., '2025-09' -> 'Sep')
        const monthNames = sortedMonths.map(m => dayjs(m).format('MMM'))

        const colors = ['#3B82F6', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

        const members = performanceData.members.map((member, index) => {
            const dataPoints = sortedMonths.map(month => {
                const perf = member.monthly_performance[month]
                return perf?.average_overall_score || 0
            })

            return {
                name: `${member.first_name} ${member.last_name}`,
                data: dataPoints,
                color: colors[index % colors.length]
            }
        })

        return {
            members,
            months: monthNames,
            sufficiencyLevel: 70,
            proficiencyLevel: 85
        }
    }, [performanceData])

    const hasChartData = chartData && chartData.members.length > 0

    const series = hasChartData
        ? chartData.members.map(member => ({
            name: member.name,
            data: member.data
        }))
        : []

    const colors = hasChartData
        ? chartData.members.map(member => member.color)
        : []

    return (
        <Card className={`${SURFACE_CARD_CLASSNAME} hover:shadow-md transition-shadow duration-300`}>
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

            {isLoading ? (
                <div className="flex items-center justify-center p-20">
                    <Spinner size={40} />
                </div>
            ) : hasChartData && showChart && series.length > 0 && chartData.months && chartData.months.length > 0 ? (
                <div>
                    <Chart
                        key={`${selectedSkill}-${sideNavCollapse}`}
                        type="line"
                        series={series}
                        xAxis={chartData.months}
                        height="350px"
                        customOptions={{
                            colors: colors,
                            yaxis: {
                                min: 0,
                                max: 100,
                                tickAmount: 4,
                            },
                            annotations: {
                                yaxis: [
                                    {
                                        y: chartData.sufficiencyLevel,
                                        borderColor: '#F59E0B',
                                        borderWidth: 2,
                                        strokeDashArray: 5,
                                        label: {
                                            text: 'Sufficiency',
                                            position: 'left',
                                            offsetX: -10,
                                            offsetY: 6,
                                            borderColor: 'transparent',
                                            style: {
                                                color: '#9CA3AF',
                                                background: 'transparent',
                                                fontSize: '11px',
                                                fontWeight: 500,
                                            },
                                        },
                                    },
                                    {
                                        y: chartData.proficiencyLevel,
                                        borderColor: '#22C55E',
                                        borderWidth: 2,
                                        strokeDashArray: 5,
                                        label: {
                                            text: 'Proficiency',
                                            position: 'left',
                                            offsetX: -10,
                                            offsetY: 6,
                                            borderColor: 'transparent',
                                            style: {
                                                color: '#9CA3AF',
                                                background: 'transparent',
                                                fontSize: '11px',
                                                fontWeight: 500,
                                            },
                                        },
                                    },
                                ],
                            },
                            legend: {
                                show: false,
                            },
                        }}
                    />
                </div>
            ) : (
                <div className="h-[350px] flex flex-col items-center justify-center gap-2 text-center px-4">
                    <TbChartBarOff className="text-4xl text-gray-300 dark:text-gray-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        No performance data available for this mode.
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        Try selecting a different mode above.
                    </span>
                </div>
            )}

            {/* Threshold Legend */}
            {hasChartData && (
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
            )}

            {/* Team Members Legend */}
            {hasChartData && (
            <div className="flex flex-wrap justify-center gap-6 mt-4">
                {chartData.members.map((member) => (
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
            )}
        </Card>
    )
}

export default PerformanceChart
