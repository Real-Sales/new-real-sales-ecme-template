import { useState } from 'react'
import { Card, Button, Progress } from '@/components/ui'
import DataTable from '@/components/shared/DataTable'
import Avatar from '@/components/ui/Avatar'
import UserScenariosDrawer from './UserScenariosDrawer'
import ScenarioUsersDrawer from './ScenarioUsersDrawer'
import classNames from '@/utils/classNames'
import { TbUsers, TbListDetails, TbChecks, TbClock, TbPercentage } from 'react-icons/tb'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { Scenario } from '@/views/sales/ScenarioList/types'
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
    status: 'completed' | 'in-progress' | 'overdue'
    totalUsers: number
    completedUsers: number
    pendingUsers: number
}

type TeamScenariosSectionProps = {
    teamMembers: {
        id: string
        name: string
        email: string
        img?: string
    }[]
}

const TeamScenariosSection = ({ teamMembers }: TeamScenariosSectionProps) => {
    const [viewMode, setViewMode] = useState<'users' | 'scenarios'>('users')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [scenarioCurrentPage, setScenarioCurrentPage] = useState(1)
    const [scenarioPageSize, setScenarioPageSize] = useState(10)
    const [userDrawerOpen, setUserDrawerOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<{
        userId: string
        userName: string
        userEmail: string
        userImg?: string
    } | null>(null)
    const [selectedUserScenarios, setSelectedUserScenarios] = useState<Scenario[]>([])
    const [scenarioDrawerOpen, setScenarioDrawerOpen] = useState(false)
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
    const [selectedScenarioUsers, setSelectedScenarioUsers] = useState<any[]>([])

    // Mock scenario templates
    const scenarioTemplates = [
        {
            title: 'Enterprise Software Sales Challenge',
            mode: 'Role Play',
            persona: 'Enterprise CTO',
            scenario_text: 'You are meeting with a CTO of a Fortune 500 company to discuss our enterprise software solution. They are concerned about security and integration with existing systems.',
            message: 'Focus on demonstrating ROI and addressing security concerns',
            document_name: 'Product_Specs.pdf',
            document_url: '/documents/product-specs.pdf',
        },
        {
            title: 'Cold Call to SMB Owner',
            mode: 'Practice',
            persona: 'SMB Owner',
            scenario_text: 'Make a cold call to a small business owner who has shown interest in productivity tools. Build rapport and identify their key pain points.',
            message: 'Practice building rapport quickly and identifying pain points',
        },
        {
            title: 'Handling Price Objections',
            mode: 'Coaching',
            persona: 'Budget-Conscious Manager',
            scenario_text: 'Practice handling price objections from a budget-conscious buyer who is comparing your solution with competitors.',
            message: 'Address common pricing objections with confidence',
            document_name: 'Pricing_Objections_Guide.docx',
            document_url: '/documents/pricing-guide.docx',
        },
    ]

    // Mock scenario data for each user with full scenario details
    const userScenariosMap = new Map<string, Scenario[]>()
    teamMembers.forEach((member) => {
        const numScenarios = Math.floor(Math.random() * 3) + 1
        const scenarios: Scenario[] = []
        
        for (let i = 0; i < numScenarios; i++) {
            const template = scenarioTemplates[i % scenarioTemplates.length]
            const timeLimitDays = [5, 7, 10][Math.floor(Math.random() * 3)]
            const daysRemaining = Math.floor(Math.random() * (timeLimitDays + 3)) - 2
            const isCompleted = Math.random() > 0.6
            const createdDaysAgo = Math.floor(Math.random() * 20) + 1
            
            scenarios.push({
                scenario_id: `sc-${member.id}-${i}`,
                session_id: `sess-${member.id}-${i}`,
                manager_id: 'mgr-001',
                title: template.title,
                time_limit_days: timeLimitDays,
                message: template.message,
                created_at: dayjs().subtract(createdDaysAgo, 'day').toISOString(),
                updated_at: dayjs().subtract(createdDaysAgo, 'day').toISOString(),
                is_completed: isCompleted,
                session_status: 'active' as const,
                user_name: member.name,
                user_email: member.email,
                days_remaining: daysRemaining,
                mode: template.mode,
                persona: template.persona,
                scenario_text: template.scenario_text,
                document_name: template.document_name,
                document_url: template.document_url,
                total_users: 1,
                completed_users: isCompleted ? 1 : 0,
                completion_percentage: isCompleted ? 100 : 0,
            })
        }
        
        userScenariosMap.set(member.id, scenarios)
    })

    // Mock scenario data for each user (summary)
    const scenarioData: ScenarioStats[] = teamMembers.map((member) => {
        const scenarios = userScenariosMap.get(member.id) || []
        const completed = scenarios.filter(s => s.is_completed).length
        const pending = scenarios.filter(s => !s.is_completed).length
        const total = scenarios.length

        return {
            userId: member.id,
            userName: member.name,
            userEmail: member.email,
            userImg: member.img,
            completed,
            pending,
            total,
        }
    })

    // Mock scenario titles pool
    const scenarioTitles = [
        'Enterprise Software Sales Challenge',
        'Cold Call to SMB Owner',
        'Handling Price Objections',
        'Product Demo for Tech Startup',
        'Negotiation Skills Workshop',
        'Customer Retention Strategy',
        'Upselling Premium Features',
        'Discovery Call Best Practices',
    ]

    // Create full scenario objects for drawer
    const fullScenariosMap = new Map<string, Scenario>()
    const scenarioUsersMap = new Map<string, any[]>()

    scenarioTitles.forEach((title, index) => {
        const scenarioId = `scenario-${index}`
        const template = scenarioTemplates[index % scenarioTemplates.length]
        const totalDays = [5, 7, 10, 14][Math.floor(Math.random() * 4)]
        const createdDaysAgo = Math.floor(Math.random() * 20) + 1

        // Create full scenario object
        fullScenariosMap.set(scenarioId, {
            scenario_id: scenarioId,
            session_id: `sess-${scenarioId}`,
            manager_id: 'mgr-001',
            title: title,
            time_limit_days: totalDays,
            message: template.message,
            created_at: dayjs().subtract(createdDaysAgo, 'day').toISOString(),
            updated_at: dayjs().subtract(createdDaysAgo, 'day').toISOString(),
            is_completed: false,
            session_status: 'active' as const,
            user_name: '',
            user_email: '',
            days_remaining: Math.floor(Math.random() * totalDays),
            mode: template.mode,
            persona: template.persona,
            scenario_text: template.scenario_text,
            document_name: template.document_name,
            document_url: template.document_url,
            total_users: 0,
            completed_users: 0,
            completion_percentage: 0,
        })

        // Assign random users to this scenario
        const numUsers = Math.floor(Math.random() * Math.min(teamMembers.length, 5)) + 1
        const assignedUsers = teamMembers
            .sort(() => 0.5 - Math.random())
            .slice(0, numUsers)
            .map(member => {
                const isCompleted = Math.random() > 0.5
                const daysRemaining = isCompleted ? undefined : Math.floor(Math.random() * (totalDays + 3)) - 2
                const assignedDaysAgo = Math.floor(Math.random() * 15) + 1
                return {
                    userId: member.id,
                    userName: member.name,
                    userEmail: member.email,
                    userImg: member.img,
                    isCompleted,
                    score: Math.floor(Math.random() * 40) + 60,
                    completedAt: isCompleted ? dayjs().subtract(Math.floor(Math.random() * 10), 'day').toISOString() : undefined,
                    daysRemaining,
                    assignedAt: dayjs().subtract(assignedDaysAgo, 'day').toISOString()
                }
            })

        scenarioUsersMap.set(scenarioId, assignedUsers)
    })

    // Mock scenario assignments (By Scenarios view) - Group by scenario
    const scenarioAssignments: ScenarioAssignment[] = scenarioTitles.map((title, index) => {
        const scenarioId = `scenario-${index}`
        const totalDays = [5, 7, 10, 14][Math.floor(Math.random() * 4)]
        const daysRemaining = Math.floor(Math.random() * (totalDays + 3)) - 2
        const createdDaysAgo = Math.floor(Math.random() * 20) + 1
        
        let status: ScenarioAssignment['status'] = 'in-progress'
        if (daysRemaining < 0) status = 'overdue'
        else if (Math.random() > 0.7) status = 'completed'

        // Get user count from map
        const users = scenarioUsersMap.get(scenarioId) || []
        const totalUsers = users.length
        const completedUsers = users.filter(u => u.isCompleted).length
        const pendingUsers = totalUsers - completedUsers

        return {
            id: `scenario-assignment-${index}`,
            scenarioId,
            scenarioTitle: title,
            daysRemaining,
            totalDays,
            createdAt: dayjs().subtract(createdDaysAgo, 'day').toISOString(),
            status,
            totalUsers,
            completedUsers,
            pendingUsers,
        }
    })

    // Calculate totals
    const totalAssigned = scenarioData.reduce((sum, item) => sum + item.total, 0)
    const totalCompleted = scenarioData.reduce((sum, item) => sum + item.completed, 0)
    const totalPending = scenarioData.reduce((sum, item) => sum + item.pending, 0)
    const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0

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
        </Card>

        {/* User Scenarios Drawer */}
        <UserScenariosDrawer
            isOpen={userDrawerOpen}
            onClose={handleUserDrawerClose}
            user={selectedUser}
            scenarios={selectedUserScenarios}
        />

        {/* Scenario Users Drawer */}
        <ScenarioUsersDrawer
            isOpen={scenarioDrawerOpen}
            onClose={handleScenarioDrawerClose}
            scenario={selectedScenario}
            users={selectedScenarioUsers}
        />
    </>
    )
}

export default TeamScenariosSection
