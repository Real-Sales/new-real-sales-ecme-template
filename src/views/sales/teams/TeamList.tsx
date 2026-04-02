import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Drawer, toast, Notification, Spinner } from '@/components/ui'
import Container from '@/components/shared/Container'
import { injectReducer } from '@/store'
import TeamForm, { type TeamFormSchema } from './TeamForm'
import { apiCreateTeam } from '@/services/TeamService'
import teamsReducer, {
    useAppSelector,
    useAppDispatch,
    fetchTeams,
    resetNotification,
} from '@/store/slices/teams'
import dayjs from 'dayjs'
import {
    HiUserGroup,
    HiChartBar,
    HiTrendingUp,
    HiClock,
    HiPencil,
    HiTrash,
    HiPlus,
} from 'react-icons/hi'

// Inject reducer when component mounts (lazy-loaded)
injectReducer('teams', teamsReducer)

type StatCardProps = {
    icon: React.ReactNode
    value: string | number
    label: string
}

const StatCard = ({ icon, value, label }: StatCardProps) => {
    return (
        <Card
            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300"
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

type TeamCardProps = {
    id: string
    name: string
    company: string
    members: number
    avgScore: number
    sessions: number
    performance: number
    status?: 'Focus' | 'Stable' | 'New'
    createdAt: string
}

const TeamCard = ({
    id,
    name,
    company,
    members,
    avgScore,
    sessions,
    performance,
    status,
    createdAt,
}: TeamCardProps) => {
    const navigate = useNavigate()

    // Determine performance color based on score
    const getPerformanceColor = (score: number) => {
        if (score >= 65) return 'bg-green-500'
        if (score >= 50) return 'bg-primary'
        return 'bg-blue-500'
    }

    const handleCardClick = () => {
        navigate(`/teams/${id}`)
    }

    return (
        <Card
            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl relative"
            bodyClass="!p-2"
            onClick={handleCardClick}
        >
            {/* Header image */}
            <div className="relative h-23 rounded-2xl bg-slate-100 dark:bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
                <svg
                    className="absolute bottom-0 left-0 w-full h-16"
                    viewBox="0 0 600 120"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path
                        d="M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z"
                        style={{ fill: 'var(--primary-mild)', opacity: 0.35 }}
                    >
                        <animate
                            attributeName="d"
                            dur="8s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keyTimes="0;0.33;0.66;1"
                            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95"
                            values="
                                M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z;
                                M0,48 C125,35 245,95 365,62 C455,40 540,110 600,82 L600,120 L0,120 Z;
                                M0,52 C140,18 255,115 375,58 C465,28 545,104 600,78 L600,120 L0,120 Z;
                                M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z
                            "
                        />
                    </path>
                    <path
                        d="M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z"
                        style={{ fill: 'var(--primary)', opacity: 1 }}
                    >
                        <animate
                            attributeName="d"
                            dur="8s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keyTimes="0;0.33;0.66;1"
                            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95"
                            values="
                                M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z;
                                M0,78 C150,45 260,105 380,78 C462,58 540,118 600,98 L600,120 L0,120 Z;
                                M0,84 C165,20 270,120 390,74 C470,55 545,120 600,100 L600,120 L0,120 Z;
                                M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z
                            "
                        />
                    </path>
                </svg>
                {status && (
                    <div className="absolute top-3 right-3">
                        <Badge
                            innerClass={`${status === 'Focus'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : status === 'Stable'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                } px-2 py-0.5 text-xs font-medium`}
                            content={status}
                        />
                    </div>
                )}
            </div>

            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 h-17 w-17 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-gray-900 text-primary flex items-center justify-center shadow-lg">
                <HiUserGroup className="text-4xl" />
            </div>

            <div className="px-5 pt-10 pb-4">
                {/* Title */}
                <div className="mb-4 flex flex-col items-center text-center">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {company}
                    </p>
                </div>

                {/* Metrics */}
                <div className="flex justify-between items-center mb-4 py-3 bg-transparent -mx-5 px-5">
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{members}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Members</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{avgScore}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Avg Score</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{sessions}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Sessions</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <HiClock className="text-sm" />
                        <span>{createdAt}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiPencil />}
                            className="bg-gray-800 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-800 text-gray-300 hover:text-primary transition-all"
                        />
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiTrash className="text-red-500" />}
                            className="bg-gray-800 dark:bg-gray-800 hover:bg-red-500 dark:hover:bg-gray-800 hover:text-white transition-all"
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}

const TeamList = () => {
    const dispatch = useAppDispatch()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const { userId, companyId } = useAppSelector((state) => state.auth.user)
    
    const {
        teamsData,
        teamsLoading,
        initialized,
        notification,
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

    useEffect(() => {
        if (companyId && !initialized && !teamsLoading) {
            dispatch(fetchTeams(companyId))
        }
    }, [dispatch, companyId, initialized, teamsLoading])

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

    const performanceData = teamsData

    const openDrawer = () => {
        setIsDrawerOpen(true)
    }

    const onDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const handleSubmitClick = () => {
        if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            )
        }
    }

    const onTeamSubmit = async (values: TeamFormSchema) => {
        if (!companyId || !userId) {
            toast.push(
                <Notification title="Error" type="danger">
                    Missing company or user information.
                </Notification>
            )
            return
        }

        try {
            const response = await apiCreateTeam({
                name: values.teamName,
                sales_company_id: companyId,
                sales_division_id: values.sales_division_id,
                manager_id: userId,
            })

            if (response) {
                toast.push(
                    <Notification title="Success" type="success">
                        Team created successfully!
                    </Notification>
                )
                onDrawerClose()
                if (companyId) {
                    dispatch(fetchTeams(companyId))
                }
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || 'Failed to create team'}
                </Notification>
            )
        }
    }

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button
                size="sm"
                className="flex-1 bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 border border-gray-600 dark:border-gray-600"
                onClick={onDrawerClose}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                onClick={handleSubmitClick}
            >
                Create
            </Button>
        </div>
    )

    const DrawerTitle = (
        <div>
            <h4 className="mb-2 text-lg font-bold">Create New Team</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to create a new team
            </p>
        </div>
    )

    const stats = useMemo(() => {
        const totalTeams = performanceData.length
        const totalMembers = performanceData.reduce((acc, team) => acc + team.members.length, 0)
        
        const teamsWithScores = performanceData.filter(team => team.team_average_score !== null)
        const avgPerformance = teamsWithScores.length > 0 
            ? (teamsWithScores.reduce((acc, team) => acc + (team.team_average_score || 0), 0) / teamsWithScores.length).toFixed(1)
            : 0

        const totalSessions = performanceData.reduce((acc, team) => {
            return acc + team.members.reduce((mAcc, member) => {
                return mAcc + member.performance_by_mode.reduce((pAcc, mode) => pAcc + mode.session_count, 0)
            }, 0)
        }, 0)

        return [
            {
                icon: <HiUserGroup />,
                value: totalTeams,
                label: 'Total Teams',
            },
            {
                icon: <HiUserGroup />,
                value: totalMembers,
                label: 'Team Members',
            },
            {
                icon: <HiTrendingUp />,
                value: avgPerformance,
                label: 'Avg Performance',
            },
            {
                icon: <HiChartBar />,
                value: totalSessions,
                label: 'Total Sessions',
            },
        ]
    }, [performanceData])

    const teams = useMemo(() => {
        return performanceData.map(team => {
            const teamSessions = team.members.reduce((acc, member) => {
                return acc + member.performance_by_mode.reduce((pAcc, mode) => pAcc + mode.session_count, 0)
            }, 0)

            return {
                id: team.company_team_id,
                name: team.name,
                company: `Division ID: ${team.sales_division_id.split('-')[0]}...`, // Shorten ID as fallback
                members: team.members.length,
                avgScore: team.team_average_score || 0,
                sessions: teamSessions,
                performance: team.team_average_score || 0,
                status: (team.team_average_score && team.team_average_score > 80 ? 'Stable' : 'Focus') as 'Stable' | 'Focus' | 'New',
                createdAt: 'Recently', // Assuming created_at is not in the team top-level response
            }
        })
    }, [performanceData])

    return (
        <div className="min-h-full">
            <Container className="pb-6 px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
                            Team Management
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Organize teams, assign members, and track outcomes
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        size="sm"
                        icon={<HiPlus />}
                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap rounded-md"
                        onClick={openDrawer}
                    >
                        Create Team
                    </Button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {teamsLoading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Spinner size={40} />
                        </div>
                    ) : (
                        teams.map((team, index) => (
                            <TeamCard key={index} {...team} />
                        ))
                    )}
                </div>
            </Container>

            <Drawer
                title={DrawerTitle}
                isOpen={isDrawerOpen}
                footer={DrawerFooter}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                footerClass="!bg-gray-100 dark:!bg-gray-900 !p-3"
                bodyClass="!p-4 !bg-gray-100 dark:!bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                <div className="px-2">
                    <TeamForm
                        companyId={companyId || ''}
                        formRef={formRef}
                        onSubmit={onTeamSubmit}
                        onCancel={onDrawerClose}
                    />
                </div>
            </Drawer>
        </div>
    )
}

export default TeamList
