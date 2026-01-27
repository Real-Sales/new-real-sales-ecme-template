import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Dialog, Progress } from '@/components/ui'
import Container from '@/components/shared/Container'
import PerformanceChart from './PerformanceChart'
import AddTeamMemberContent from './components/AddTeamMemberContent'
import TeamMembersTable from './components/TeamMembersTable'
import MemberDetailDrawer from './components/MemberDetailDrawer'
import TeamScenariosSection from './components/TeamScenariosSection'
import { allSalesReps } from './mockTeamData'
import { HiArrowLeft } from 'react-icons/hi'
import { TbUserPlus, TbChartLine, TbUsers } from 'react-icons/tb'

type TeamMember = {
    id: string
    name: string
    email: string
    score: number
    sessions: number
    img?: string
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

    // Mock data - replace with actual data fetching based on team id
    const teamName = 
        id === 'healthcare-sales' ? 'HealthCare Sales' :
        id === 'full-sales-team' ? 'Full Sales Team' :
        id === 'bd-team' ? 'BD Team' : 'Team'
    
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { id: '1', name: 'Clara Ca', email: 'sarah1@gmail.com', score: 75.5, sessions: 18, img: '/img/avatars/thumb-1.jpg' },
        { id: '2', name: 'Christian Cn', email: 'mike1@gmail.com', score: 69.0, sessions: 15, img: '/img/avatars/thumb-2.jpg' },
        { id: '3', name: 'Ruben Rn', email: 'john1@gmail.com', score: 61.1, sessions: 15, img: '/img/avatars/thumb-3.jpg' },
        { id: '4', name: 'Mika Ma', email: 'linda1@gmail.com', score: 55.1, sessions: 15, img: '/img/avatars/thumb-4.jpg' },
        { id: '5', name: 'Ryan McFarlin', email: 'ryan.mcfarlin@gogomedia.com', score: 18.6, sessions: 8, img: '/img/avatars/thumb-5.jpg' },
    ])

    // Fixed team performance score for progress bar
    const teamAvgScore = 54.7

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
        // Update team members with the new list
        // For now, we'll just update the basic member info
        // In a real app, you'd fetch the full member details including score and sessions
        const updatedMembers = members.map((member) => {
            const existing = teamMembers.find((tm) => tm.id === member.id)
            if (existing) {
                return existing
            }
            // New member - add with default values
            return {
                id: member.id,
                name: member.name,
                email: member.email,
                score: 0,
                sessions: 0,
                img: member.img,
            }
        })
        setTeamMembers(updatedMembers)
    }

    const handleRemoveMember = (memberId: string) => {
        setTeamMembers((prev) => prev.filter((member) => member.id !== memberId))
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
                        size="md"
                        icon={<TbUserPlus />}
                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap"
                        onClick={openDialog}
                    >
                        Add Team Members
                    </Button>
                </div>

                {/* Team Performance Section */}
                <Card className="mb-6">
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
                    <PerformanceChart />
                </div>

                {/* Team Members Section */}
                <Card>
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
                </Card>

                {/* Scenarios Section */}
                <TeamScenariosSection teamMembers={teamMembers} />
            </Container>

            {/* Add Team Member Dialog */}
            <Dialog
                isOpen={dialogOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <AddTeamMemberContent
                    allMembers={allSalesReps}
                    teamMembers={teamMembers}
                    onUpdateTeamMembers={handleUpdateTeamMembers}
                    onClose={onDialogClose}
                />
            </Dialog>

            {/* Member Detail Drawer */}
            <MemberDetailDrawer
                isOpen={memberDrawerOpen}
                onClose={handleMemberDrawerClose}
                member={selectedMember}
            />
        </div>
    )
}

export default TeamDetail
