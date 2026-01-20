import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Drawer, Progress } from '@/components/ui'
import Container from '@/components/shared/Container'
import SalesRepForm, { type SalesRepFormSchema } from '../company/SalesRepForm'
import PerformanceChart from './PerformanceChart'
import { HiArrowLeft, HiPlus, HiUser, HiTrash } from 'react-icons/hi'

type TeamMember = {
    id: string
    name: string
    email: string
    score: number
    sessions: number
}

const TeamDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const handleBack = () => {
        navigate('/teams')
    }

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

    const onMemberSubmit = (values: SalesRepFormSchema) => {
        console.log('Team member form submitted:', values)
        // Add your API call here
        window.alert(JSON.stringify(values, null, 2))
        onDrawerClose()
    }

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button size="sm" className="flex-1" onClick={onDrawerClose}>
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
            <h4 className="mb-2 text-lg font-bold">Add Team Member</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to add a new team member
            </p>
        </div>
    )

    // Mock data - replace with actual data fetching based on team id
    const teamName = 
        id === 'healthcare-sales' ? 'HealthCare Sales' :
        id === 'full-sales-team' ? 'Full Sales Team' :
        id === 'bd-team' ? 'BD Team' : 'Team'
    
    const teamMembers: TeamMember[] = [
        { id: '1', name: 'Clara Ca', email: 'sarah1@gmail.com', score: 75.5, sessions: 18 },
        { id: '2', name: 'Christian Cn', email: 'mike1@gmail.com', score: 69.0, sessions: 15 },
        { id: '3', name: 'Ruben Rn', email: 'john1@gmail.com', score: 61.1, sessions: 15 },
        { id: '4', name: 'Mika Ma', email: 'linda1@gmail.com', score: 55.1, sessions: 15 },
        { id: '5', name: 'Ryan McFarlin', email: 'ryan.mcfarlin@gogomedia.com', score: 18.6, sessions: 8 },
    ]

    // Fixed team performance score for progress bar
    const teamAvgScore = 54.7

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
                        icon={<HiPlus />}
                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap"
                        onClick={openDrawer}
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
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       
                        Team Members ({teamMembers.length})
                    </h2>

                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <Card
                                key={member.id}
                                className="hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700/50"
                            >
                                <div className="flex items-center gap-6">
                                    {/* User Icon */}
                                    <div className="bg-primary/10 rounded-full p-3 text-primary flex-shrink-0">
                                        <HiUser className="text-xl" />
                                    </div>
                                    
                                    {/* Name and Email */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                            {member.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {member.email}
                                        </p>
                                    </div>

                                    {/* Score Metrics */}
                                    <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex text-right flex-col items-center">
                                            <div className="text-xl font-bold text-primary leading-none mb-1.5">
                                                {member.score}
                                            </div>
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Overall Score
                                            </div>
                                        </div>
                                        <div className="h-12 w-px bg-gray-200 dark:bg-gray-700" />
                                        <div className="flex text-right flex-col items-center">
                                            <div className="text-xl font-bold text-primary leading-none mb-1.5">
                                                {member.sessions}
                                            </div>
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Sessions
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            icon={<HiPlus />}
                                            className="hover:text-primary"
                                        />
                                        <Button
                                            size="sm"
                                            variant="default"
                                            icon={<HiTrash className="text-red-500" />}
                                            className="hover:bg-red-50 dark:hover:bg-red-900/20"
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Container>

            {/* Add Team Member Drawer */}
            <Drawer
                title={DrawerTitle}
                isOpen={isDrawerOpen}
                footer={DrawerFooter}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                footerClass="!bg-gray-100 dark:!bg-gray-800 !p-3"
                bodyClass="!p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                <div className="px-2">
                    <form ref={formRef}>
                        <SalesRepForm
                            onSubmit={onMemberSubmit}
                            onCancel={onDrawerClose}
                        />
                    </form>
                </div>
            </Drawer>
        </div>
    )
}

export default TeamDetail
