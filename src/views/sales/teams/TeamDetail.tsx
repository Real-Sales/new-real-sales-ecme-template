import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Dialog, Progress, Spinner, toast, Notification } from '@/components/ui'
import Container from '@/components/shared/Container'
import PerformanceChart from './PerformanceChart'
import AddTeamMemberContent from './components/AddTeamMemberContent'
import TeamMembersTable from './components/TeamMembersTable'
import MemberDetailDrawer from './components/MemberDetailDrawer'
import TeamScenariosSection from './components/TeamScenariosSection'
import { allSalesReps } from './mockTeamData'
import { HiArrowLeft } from 'react-icons/hi'
import { TbUserPlus, TbUsers } from 'react-icons/tb'
import { apiGetCompanyTeamPerformance, type TeamPerformanceResponse, apiDeleteTeamMember } from '@/services/TeamService'
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
        average_relationship_building?: number | null
        average_communication_excellence?: number | null
        average_objection_handling_and_value_selling?: number | null
        average_negotiation?: number | null
        average_qualifying_lead?: number | null
        average_needs_discovery?: number | null
        average_solution_matching?: number | null
        average_cross_selling?: number | null
        average_sales_closing?: number | null
    }[]
}

type Member = {
    id: string
    name: string
    email: string
    img?: string
}

const TeamDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [memberDrawerOpen, setMemberDrawerOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<TeamPerformanceResponse | null>(null)

    const fetchTeamData = async () => {
        if (!id) return
        setIsLoading(true)
        try {
            const response = await apiGetCompanyTeamPerformance(id)
            if (response) {
                setData(response)
            }
        } catch (error) {
            console.error('Failed to fetch team data:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to fetch team details
                </Notification>
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTeamData()
    }, [id])

    const teamMembers = useMemo(() => {
        if (!data) return []
        return data.members.map(member => {
            const teamSessions = member.performance_by_mode.reduce((acc, mode) => acc + mode.session_count, 0)
            return {
                id: member.user_id,
                name: `${member.user.first_name} ${member.user.last_name}`,
                email: member.user.email,
                score: member.overall_average_score || 0,
                sessions: teamSessions,
                img: `/img/avatars/thumb-${Math.floor(Math.random() * 5) + 1}.jpg`, // Random placeholder avatar
                performance_by_mode: member.performance_by_mode
            }
        })
    }, [data])

    const teamAvgScore = data?.team_average_score || 0
    const teamName = data?.name || 'Team'

    // Pagination handlers
    const handlePaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setCurrentPage(1)
    }

    // Calculate paginated data
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedMembers = teamMembers.slice(startIndex, endIndex)

    const handleBack = () => {
        navigate('/teams')
    }

    const openDialog = () => {
        setDialogOpen(true)
    }

    const onDialogClose = () => {
        setDialogOpen(false)
    }

    const handleUpdateTeamMembers = (members: Member[]) => {
        // This would typically involve an API call to add members to the team
        // After successful API call, we should refresh the team data
        fetchTeamData()
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!id) return
        try {
            await apiDeleteTeamMember(memberId, id)
            toast.push(
                <Notification title="Success" type="success">
                    Member removed from team successfully
                </Notification>
            )
            fetchTeamData()
        } catch (error) {
            console.error('Failed to remove member:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to remove member from team
                </Notification>
            )
        }
    }

    const handleRowClick = (member: TeamMember) => {
        setSelectedMember(member)
        setMemberDrawerOpen(true)
    }

    const handleMemberDrawerClose = () => {
        setMemberDrawerOpen(false)
        setSelectedMember(null)
    }

    return (
        <div className="min-h-full">
            <Container className="pb-6">
                {/* Header Section */}
                <div className="mb-6">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiArrowLeft />}
                        onClick={handleBack}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        Back to Teams
                    </Button>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {teamName}
                    </h1>
                    <Button
                        variant="solid"
                        size="sm"
                        icon={<TbUserPlus />}
                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap rounded-md"
                        onClick={openDialog}
                    >
                        Add Team Members
                    </Button>
                </div>

                {/* Team Performance Section */}
                <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 mb-6">
                    <div className="p-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            Team Performance
                        </h2>
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Team Average Score
                                </span>
                                <span className="text-base font-bold text-gray-900 dark:text-white">
                                    {teamAvgScore}/100
                                </span>
                            </div>
                            <Progress
                                customColorClass="bg-primary"
                                percent={teamAvgScore}
                                showInfo={false}
                            />
                        </div>
                    </div>
                </Card>

                {/* Performance Analytics Chart */}
                <div className="mb-6">
                    <PerformanceChart teamId={id || ''} />
                </div>

                {/* Team Members Section */}
                <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <TbUsers className="text-xl text-gray-700 dark:text-gray-300" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Team Members ({teamMembers.length})
                            </h2>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Spinner size={30} />
                        </div>
                    ) : (
                        <TeamMembersTable 
                            members={paginatedMembers}
                            onRemoveMember={handleRemoveMember}
                            onRowClick={handleRowClick}
                            pagingData={{
                                total: teamMembers.length,
                                pageIndex: currentPage,
                                pageSize: pageSize,
                            }}
                            onPaginationChange={handlePaginationChange}
                            onSelectChange={handleSelectChange}
                        />
                    )}
                </Card>

                {/* Scenarios Section */}
                <TeamScenariosSection teamId={id || ''} teamMembers={teamMembers} />
            </Container>

            {/* Add Team Member Dialog */}
            <Dialog
                isOpen={dialogOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <AddTeamMemberContent
                    salesCompanyId={data?.sales_company_id || ''}
                    companyTeamId={id || ''}
                    onUpdate={fetchTeamData}
                    onClose={onDialogClose}
                />
            </Dialog>

            {/* Member Detail Drawer */}
            <MemberDetailDrawer
                isOpen={memberDrawerOpen}
                onClose={handleMemberDrawerClose}
                member={selectedMember}
                teamId={id || ''}
            />
        </div>
    )
}

export default TeamDetail
