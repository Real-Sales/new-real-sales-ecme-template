import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Drawer } from '@/components/ui'
import Container from '@/components/shared/Container'
import TeamForm, { type TeamFormSchema } from './TeamForm'
import {
    HiUserGroup,
    HiChartBar,
    HiTrendingUp,
    HiClock,
    HiPencil,
    HiTrash,
    HiPlus,
} from 'react-icons/hi'

type StatCardProps = {
    icon: React.ReactNode
    value: string | number
    label: string
}

const StatCard = ({ icon, value, label }: StatCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-2 text-primary">
                    <div className="text-xl">{icon}</div>
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
        return 'bg-amber-500'
    }

    const handleCardClick = () => {
        navigate(`/teams/${id}`)
    }

    return (
        <Card 
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" 
            onClick={handleCardClick}
        >
            <div className="p-2">
                {/* Header */}
                <div className="flex items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-xl p-2.5 text-primary">
                            <HiUserGroup className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {company}
                            </p>
                            {status && (
                                <Badge
                                    innerClass={`${
                                        status === 'Focus'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            : status === 'Stable'
                                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    } px-2 py-0.5 text-xs font-medium`}
                                    content={status}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex justify-between items-center mb-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{members}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Members</div>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{avgScore}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Avg Score</div>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{sessions}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Sessions</div>
                    </div>
                </div>

                {/* Performance */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Performance</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{performance}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getPerformanceColor(performance)} rounded-full`}
                            style={{ width: `${performance}%` }}
                        />
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
            </div>
        </Card>
    )
}

const TeamList = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

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

    const onTeamSubmit = (values: TeamFormSchema) => {
        console.log('Team form submitted:', values)
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
            <h4 className="mb-2 text-lg font-bold">Create New Team</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to create a new team
            </p>
        </div>
    )

    const stats = [
        {
            icon: <HiUserGroup />,
            value: 3,
            label: 'Total Teams',
        },
        {
            icon: <HiUserGroup />,
            value: 11,
            label: 'Team Members',
        },
        {
            icon: <HiTrendingUp />,
            value: 61.4,
            label: 'Avg Performance',
        },
        {
            icon: <HiChartBar />,
            value: 161,
            label: 'Total Sessions',
        },
    ]

    const teams = [
        {
            id: 'healthcare-sales',
            name: 'Healthcare Sales',
            company: 'Company "B"',
            members: 5,
            avgScore: 54.7,
            sessions: 71,
            performance: 55,
            status: 'Focus' as const,
            createdAt: 'Jan 15, 2024',
        },
        {
            id: 'full-sales-team',
            name: 'Full Sales Team',
            company: 'Company "A"',
            members: 4,
            avgScore: 61.7,
            sessions: 60,
            performance: 62,
            status: 'Stable' as const,
            createdAt: 'Jan 28, 2024',
        },
        {
            id: 'bd-team',
            name: 'BD Team',
            company: 'Company "A"',
            members: 2,
            avgScore: 67.8,
            sessions: 30,
            performance: 68,
            status: 'New' as const,
            createdAt: 'Feb 20, 2024',
        },
    ]

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
                        size="md"
                        icon={<HiPlus />}
                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap"
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
                    {teams.map((team, index) => (
                        <TeamCard key={index} {...team} />
                    ))}
                </div>
            </Container>

            {/* Create Team Drawer */}
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
                        <TeamForm
                            onSubmit={onTeamSubmit}
                            onCancel={onDrawerClose}
                        />
                    </form>
                </div>
            </Drawer>
        </div>
    )
}

export default TeamList
