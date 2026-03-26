import { useState, useEffect, useMemo } from 'react'
import { Card, Button, Progress, Spinner, toast, Notification } from '@/components/ui'
import DataTable from '@/components/shared/DataTable'
import Avatar from '@/components/ui/Avatar'
import UserScenariosDrawer from './UserScenariosDrawer'
import ScenarioUsersDrawer from './ScenarioUsersDrawer'
import classNames from '@/utils/classNames'
import { TbUsers, TbListDetails, TbChecks, TbClock, TbPercentage } from 'react-icons/tb'
import { apiGetTeamScenariosDashboard, apiUnassignScenario, type TeamScenariosDashboardResponse } from '@/services/TeamService'
import type { ColumnDef } from '@/components/shared/DataTable'
import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'

type ScenarioStats = {
    userId: string
    userName: string
    userEmail: string
    userImg?: string
    completed: number
    pending: number
    total: number
}

type ScenarioAssignment = {
    id: string
    scenarioId: string
    scenarioTitle: string
    daysRemaining: number
    totalDays: number
    createdAt: string
    status: 'completed' | 'active' | 'overdue'
    totalUsers: number
    completedUsers: number
    pendingUsers: number
}

type TeamScenariosSectionProps = {
    teamId: string
    teamMembers: {
        id: string
        name: string
        email: string
        img?: string
    }[]
}

const TeamScenariosSection = ({ teamId, teamMembers }: TeamScenariosSectionProps) => {
    const [viewMode, setViewMode] = useState<'users' | 'scenarios'>('users')
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<TeamScenariosDashboardResponse | null>(null)
    
    // UI Local state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [scenarioCurrentPage, setScenarioCurrentPage] = useState(1)
    const [scenarioPageSize, setScenarioPageSize] = useState(10)
    
    // Drawers state
    const [userDrawerOpen, setUserDrawerOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<{
        userId: string
        userName: string
        userEmail: string
        userImg?: string
    } | null>(null)
    const [selectedUserScenarios, setSelectedUserScenarios] = useState<any[]>([])
    
    const [scenarioDrawerOpen, setScenarioDrawerOpen] = useState(false)
    const [selectedScenario, setSelectedScenario] = useState<any | null>(null)
    const [selectedScenarioUsers, setSelectedScenarioUsers] = useState<any[]>([])

    const fetchData = async () => {
        if (!teamId) return
        setIsLoading(true)
        try {
            const response = await apiGetTeamScenariosDashboard(teamId)
            setData(response)
        } catch (error) {
            console.error('Failed to fetch team scenarios dashboard:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [teamId])

    // Derived: Group scenarios by user
    const scenarioData: ScenarioStats[] = useMemo(() => {
        if (!data) return []
        
        // Use teamMembers as base to show members even if they have no scenarios
        return teamMembers.map(member => {
            const userScenarios = data.assigned_scenarios.filter(s => s.user_id === member.id)
            const completed = userScenarios.filter(s => s.is_completed).length
            const total = userScenarios.length
            
            return {
                userId: member.id,
                userName: member.name,
                userEmail: member.email,
                userImg: member.img,
                completed,
                pending: total - completed,
                total
            }
        })
    }, [data, teamMembers])

    // Derived: Group users by scenario
    const scenarioAssignments: ScenarioAssignment[] = useMemo(() => {
        if (!data) return []
        
        const scenarioGroups = new Map<string, any[]>()
        data.assigned_scenarios.forEach(item => {
            if (!scenarioGroups.has(item.scenario_id)) {
                scenarioGroups.set(item.scenario_id, [])
            }
            scenarioGroups.get(item.scenario_id)?.push(item)
        })

        return Array.from(scenarioGroups.entries()).map(([scenarioId, items]) => {
            const first = items[0]
            const totalUsers = items.length
            const completedUsers = items.filter(i => i.is_completed).length
            
            let status: ScenarioAssignment['status'] = 'active'
            if (first.days_remaining !== undefined && first.days_remaining < 0) status = 'overdue'
            else if (items.every(i => i.is_completed)) status = 'completed'

            return {
                id: scenarioId,
                scenarioId: scenarioId,
                scenarioTitle: first.title,
                daysRemaining: first.days_remaining || 0,
                totalDays: first.time_limit_days || 0,
                createdAt: first.created_at,
                status,
                totalUsers,
                completedUsers,
                pendingUsers: totalUsers - completedUsers
            }
        })
    }, [data])

    // Derived: Map user_id to their scenarios (for drawer)
    const userScenariosMap = useMemo(() => {
        const map = new Map<string, any[]>()
        if (!data) return map
        
        data.assigned_scenarios.forEach(s => {
            if (!map.has(s.user_id)) map.set(s.user_id, [])
            map.get(s.user_id)?.push({
                ...s,
                mode: s.mode.name,
                persona: s.persona.name,
                sessionId: s.session_id
            })
        })
        return map
    }, [data])

    // Derived: Map scenario_id to their users (for drawer)
    const scenarioUsersMap = useMemo(() => {
        const map = new Map<string, any[]>()
        if (!data) return map
        
        data.assigned_scenarios.forEach(s => {
            if (!map.has(s.scenario_id)) map.set(s.scenario_id, [])
            map.get(s.scenario_id)?.push({
                userId: s.user_id,
                userName: s.user_name,
                userEmail: s.user_email,
                isCompleted: s.is_completed,
                completedAt: s.end_time,
                daysRemaining: s.days_remaining,
                assignedAt: s.created_at,
                sessionId: s.session_id
            })
        })
        return map
    }, [data])

    // Derived: Map scenario_id to scenario data (for drawer)
    const fullScenariosMap = useMemo(() => {
        const map = new Map<string, any>()
        if (!data) return map
        
        data.assigned_scenarios.forEach(s => {
            if (!map.has(s.scenario_id)) {
                map.set(s.scenario_id, {
                    ...s,
                    mode: s.mode.name,
                    persona: s.persona.name
                })
            }
        })
        return map
    }, [data])

    const handleUnassign = async (sessionId: string) => {
        try {
            await apiUnassignScenario(sessionId)
            toast.push(
                <Notification title="Success" type="success">
                    Scenario unassigned successfully
                </Notification>
            )
            fetchData()
        } catch (error) {
            console.error('Failed to unassign scenario:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to unassign scenario
                </Notification>
            )
        }
    }

    const totalAssigned = data?.total_assigned || 0
    const totalCompleted = data?.completed_count || 0
    const totalPending = data?.pending_count || 0
    const completionRate = data?.completion_rate || 0

    // Pagination handlers for users view
    const handlePaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setCurrentPage(1)
    }

    // Paginate data for users view
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = scenarioData.slice(startIndex, endIndex)

    // Pagination handlers for scenarios view
    const handleScenarioPaginationChange = (page: number) => {
        setScenarioCurrentPage(page)
    }

    const handleScenarioSelectChange = (value: number) => {
        setScenarioPageSize(value)
        setScenarioCurrentPage(1)
    }

    // Paginate scenario assignments
    const scenarioStartIndex = (scenarioCurrentPage - 1) * scenarioPageSize
    const scenarioEndIndex = scenarioStartIndex + scenarioPageSize
    const paginatedScenarios = scenarioAssignments.slice(scenarioStartIndex, scenarioEndIndex)

    // Handler for clicking on a user row
    const handleUserClick = (user: ScenarioStats) => {
        setSelectedUser({
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
            userImg: user.userImg,
        })
        setSelectedUserScenarios(userScenariosMap.get(user.userId) || [])
        setUserDrawerOpen(true)
    }

    const handleUserDrawerClose = () => {
        setUserDrawerOpen(false)
        setSelectedUser(null)
        setSelectedUserScenarios([])
    }

    // Handler for clicking on a scenario row
    const handleScenarioClick = (assignment: ScenarioAssignment) => {
        const scenario = fullScenariosMap.get(assignment.scenarioId)
        if (scenario) {
            setSelectedScenario(scenario)
            setSelectedScenarioUsers(scenarioUsersMap.get(assignment.scenarioId) || [])
            setScenarioDrawerOpen(true)
        }
    }

    const handleScenarioDrawerClose = () => {
        setScenarioDrawerOpen(false)
        setSelectedScenario(null)
        setSelectedScenarioUsers([])
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // Columns for "By Users" view
    const columns: ColumnDef<ScenarioStats>[] = [
        {
            header: 'User',
            accessorKey: 'userName',
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original
                return (
                    <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handleUserClick(row)}
                    >
                        {row.userImg ? (
                            <Avatar size={40} shape="circle" src={row.userImg} />
                        ) : (
                            <Avatar size={40} shape="circle" className="bg-blue-100 dark:bg-blue-500/20">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {getInitials(row.userName)}
                                </span>
                            </Avatar>
                        )}
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white hover:text-primary">
                                {row.userName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {row.userEmail}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            header: 'Scenario Progress',
            accessorKey: 'completionRate',
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original
                const rate = row.total > 0 ? (row.completed / row.total) * 100 : 0
                
                return (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total:</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{row.total}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed:</span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{row.completed}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pending:</span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{row.pending}</span>
                                </div>
                            </div>
                        </div>
                        <Progress
                            percent={rate}
                            showInfo={false}
                            customColorClass={classNames(
                                'bg-red-500',
                                rate >= 30 && 'bg-blue-500',
                                rate >= 60 && 'bg-blue-600',
                                rate >= 80 && 'bg-green-500',
                            )}
                        />
                    </div>
                )
            },
        },
    ]

    // Columns for "By Scenarios" view
    const scenarioColumns: ColumnDef<ScenarioAssignment>[] = [
        {
            header: 'Scenario Title',
            accessorKey: 'scenarioTitle',
            enableSorting: false,
            size: 300,
            cell: (props) => {
                const row = props.row.original
                return (
                    <div 
                        className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleScenarioClick(row)}
                    >
                        {row.scenarioTitle}
                    </div>
                )
            },
        },
        {
            header: 'User Progress',
            accessorKey: 'totalUsers',
            enableSorting: false,
            size: 250,
            cell: (props) => {
                const row = props.row.original
                const rate = row.totalUsers > 0 ? (row.completedUsers / row.totalUsers) * 100 : 0
                
                return (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total:</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{row.totalUsers}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed:</span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{row.completedUsers}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pending:</span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{row.pendingUsers}</span>
                                </div>
                            </div>
                        </div>
                        <Progress
                            percent={rate}
                            showInfo={false}
                            customColorClass={classNames(
                                'bg-red-500',
                                rate >= 30 && 'bg-blue-500',
                                rate >= 60 && 'bg-blue-600',
                                rate >= 80 && 'bg-green-500',
                            )}
                        />
                    </div>
                )
            },
        },
    ]

    return (
        <>
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 mt-6">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <TbListDetails className="text-xl text-gray-700 dark:text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Scenarios ({totalAssigned})
                    </h2>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={viewMode === 'users' ? 'solid' : 'plain'}
                        className={viewMode === 'users' ? 'bg-blue-500 hover:bg-blue-600 text-white border-0' : ''}
                        icon={<TbUsers />}
                        onClick={() => setViewMode('users')}
                    >
                        By Users
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'scenarios' ? 'solid' : 'plain'}
                        className={viewMode === 'scenarios' ? 'bg-blue-500 hover:bg-blue-600 text-white border-0' : ''}
                        icon={<TbListDetails />}
                        onClick={() => setViewMode('scenarios')}
                    >
                        By Scenarios
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300" bodyClass="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-xl p-2 text-primary">
                            <div className="text-3xl">
                                <TbListDetails />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {totalAssigned}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Total Assigned
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300" bodyClass="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 rounded-xl p-2 text-green-600 dark:text-green-400">
                            <div className="text-3xl">
                                <TbChecks />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {totalCompleted}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Completed
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300" bodyClass="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 rounded-xl p-2 text-blue-600 dark:text-blue-400">
                            <div className="text-3xl">
                                <TbClock />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {totalPending}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Pending/Overdue
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300" bodyClass="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 rounded-xl p-2 text-blue-600 dark:text-blue-400">
                            <div className="text-3xl">
                                <TbPercentage />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                <NumericFormat
                                    displayType="text"
                                    value={completionRate}
                                    suffix="%"
                                    decimalScale={0}
                                />
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Completion Rate
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={40} />
                </div>
            ) : (
                <>
                    {viewMode === 'users' && (
                        <DataTable
                            columns={columns}
                            data={paginatedData}
                            noData={scenarioData.length === 0}
                            hoverable
                            pagingData={{
                                total: scenarioData.length,
                                pageIndex: currentPage,
                                pageSize: pageSize,
                            }}
                            onPaginationChange={handlePaginationChange}
                            onSelectChange={handleSelectChange}
                        />
                    )}

                    {viewMode === 'scenarios' && (
                        <DataTable
                            columns={scenarioColumns}
                            data={paginatedScenarios}
                            noData={scenarioAssignments.length === 0}
                            hoverable
                            pagingData={{
                                total: scenarioAssignments.length,
                                pageIndex: scenarioCurrentPage,
                                pageSize: scenarioPageSize,
                            }}
                            onPaginationChange={handleScenarioPaginationChange}
                            onSelectChange={handleScenarioSelectChange}
                        />
                    )}
                </>
            )}
        </Card>

        {/* User Scenarios Drawer */}
        <UserScenariosDrawer
            isOpen={userDrawerOpen}
            onClose={handleUserDrawerClose}
            user={selectedUser}
            scenarios={selectedUserScenarios}
            onUnassignScenario={handleUnassign}
        />

        {/* Scenario Users Drawer */}
        <ScenarioUsersDrawer
            isOpen={scenarioDrawerOpen}
            onClose={handleScenarioDrawerClose}
            scenario={selectedScenario}
            users={selectedScenarioUsers}
            onUnassignScenario={handleUnassign}
        />
    </>
    )
}

export default TeamScenariosSection
