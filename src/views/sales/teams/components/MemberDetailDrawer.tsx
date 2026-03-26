import Drawer from '@/components/ui/Drawer'
import Avatar from '@/components/ui/Avatar'
import MemberPerformanceChart from './MemberPerformanceChart'
import PerformanceByMode from './PerformanceByMode'
import { useEffect, useMemo, useState } from 'react'
import { apiGetTeamMembersPerformance } from '@/services/TeamService'
import dayjs from 'dayjs'

type TeamMember = {
    id: string
    name: string
    email: string
    score: number
    sessions: number
    img?: string
    performance_by_mode?: {
        mode_name: string
        session_count: number
        average_overall_score: number | null
        [key: string]: any
    }[]
}

type MemberDetailDrawerProps = {
    isOpen: boolean
    onClose: () => void
    member: TeamMember | null
    teamId: string
}

const MODE_ID_MAP = {
    closing: '1d4a466b-fd19-4286-b70e-48f707629ef6',
    discovering: 'bd9e102b-f018-4d61-adc2-9948d95e8078',
    prospecting: 'cefc24a0-c580-4114-9fc9-99fbda469e17'
}

const MemberDetailDrawer = ({ isOpen, onClose, member, teamId }: MemberDetailDrawerProps) => {
    const [historicalData, setHistoricalData] = useState<Record<string, any>>({})
    const [isLoadingHist, setIsLoadingHist] = useState(false)

    // Fetch historical data for all 3 modes for this specific member
    useEffect(() => {
        const fetchHistory = async () => {
            if (!isOpen || !member || !teamId) return
            
            setIsLoadingHist(true)
            try {
                const results: Record<string, any> = {}
                
                // Fetch all 3 modes in parallel
                const promises = Object.entries(MODE_ID_MAP).map(async ([name, modeId]) => {
                    const data = await apiGetTeamMembersPerformance(teamId, modeId)
                    if (data) {
                        const memberPerf = data.members.find(m => m.user_id === member.id)
                        if (memberPerf) {
                            results[name] = memberPerf.monthly_performance
                        }
                    }
                })

                await Promise.all(promises)
                setHistoricalData(results)
            } catch (err) {
                console.error('Failed to fetch individual history:', err)
            } finally {
                setIsLoadingHist(false)
            }
        }

        fetchHistory()
    }, [isOpen, member?.id, teamId])

    // Generate initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const modePerformance = useMemo(() => {
        if (!member?.performance_by_mode) return null

        const data: any = {}
        member.performance_by_mode.forEach(mode => {
            const metrics: Record<string, number | null> = {}
            Object.entries(mode).forEach(([key, value]) => {
                if (key.startsWith('average_') && key !== 'average_overall_score') {
                    metrics[key] = value as number | null
                }
            })

            data[mode.mode_name] = {
                score: mode.average_overall_score || 0,
                sessions: mode.session_count || 0,
                metrics: metrics
            }
        })
        return data
    }, [member])

    const chartData = useMemo(() => {
        if (!member?.performance_by_mode) return null

        // Try to get month names from historical data
        let monthNames: string[] = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']
        const firstModeHistory = Object.values(historicalData)[0]
        if (firstModeHistory) {
            const sortedMonths = Object.keys(firstModeHistory).sort().slice(-6)
            monthNames = sortedMonths.map(m => dayjs(m).format('MMM'))
        }

        const modeColors = {
            prospecting: '#3B82F6',
            discovering: '#22C55E',
            closing: '#EF4444'
        }

        const modes = member.performance_by_mode.map(mode => {
            const name = mode.mode_name
            const hist = historicalData[name]
            
            let dataPoints: number[] = []
            if (hist) {
                const sortedMonths = Object.keys(hist).sort().slice(-6)
                dataPoints = sortedMonths.map(m => hist[m].average_overall_score || 0)
            } else {
                // Fallback / Loading state (all zeros)
                dataPoints = new Array(monthNames.length).fill(0)
            }

            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                color: modeColors[name as keyof typeof modeColors] || '#9CA3AF',
                data: dataPoints
            }
        })

        return {
            modes,
            months: monthNames,
            sufficiencyLevel: 65,
            proficiencyLevel: 85
        }
    }, [member, historicalData])

    const DrawerTitle = member ? (
        <div className="flex items-center gap-4">
            {member.img ? (
                <Avatar size={50} shape="circle" src={member.img} />
            ) : (
                <Avatar size={50} shape="circle">
                    {getInitials(member.name)}
                </Avatar>
            )}
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {member.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.email}
                </p>
            </div>
        </div>
    ) : null

    return (
        <Drawer
            isOpen={isOpen}
            width={600}
            title={DrawerTitle}
            headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
            bodyClass="!p-6 !bg-gray-100 dark:!bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClose={onClose}
            onRequestClose={onClose}
        >
            {member && (
                <>
                    {/* Performance Chart with Stats */}
                    {chartData && (
                        <MemberPerformanceChart
                            data={chartData}
                            memberName={member.name}
                            overallScore={member.score}
                            totalSessions={member.sessions}
                        />
                    )}

                    {/* Performance by Mode */}
                    {modePerformance && (
                        <PerformanceByMode modeData={modePerformance} />
                    )}
                </>
            )}
        </Drawer>
    )
}

export default MemberDetailDrawer
