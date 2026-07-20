import { useRef, useEffect, useMemo, useState } from 'react'
import { Button, Drawer, toast, Notification, Spinner } from '@/components/ui'
import Container from '@/components/shared/Container'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { injectReducer } from '@/store'
import TeamForm, { type TeamFormSchema } from './TeamForm'
import { TeamCard, TeamStatCard } from './components/TeamCard'
import { apiCreateTeam, apiDeleteTeam } from '@/services/TeamService'
import teamsReducer, {
    useAppSelector,
    useAppDispatch,
    fetchTeams,
    resetNotification,
} from '@/store/slices/teams'
import { HiUserGroup, HiChartBar, HiTrendingUp, HiPlus } from 'react-icons/hi'

// Inject reducer when component mounts (lazy-loaded)
injectReducer('teams', teamsReducer)

const TeamList = () => {
    const dispatch = useAppDispatch()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string } | null>(
        null,
    )
    const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
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
        if (submitting) return
        setIsDrawerOpen(false)
    }

    const closeDrawerAfterSubmit = () => {
        setIsDrawerOpen(false)
    }

    const handleSubmitClick = () => {
        if (submitting) return
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
            setSubmitting(true)
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
                closeDrawerAfterSubmit()
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
        } finally {
            setSubmitting(false)
        }
    }

    const openDeleteDialog = (team: { id: string; name: string }) => {
        setTeamToDelete(team)
        setDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false)
        setTeamToDelete(null)
    }

    const handleDeleteTeam = async () => {
        if (!teamToDelete || !companyId) return

        setDeletingTeamId(teamToDelete.id)
        try {
            await apiDeleteTeam(teamToDelete.id)
            toast.push(
                <Notification title="Success" type="success">
                    {teamToDelete.name} deleted successfully.
                </Notification>,
            )
            closeDeleteDialog()
            dispatch(fetchTeams(companyId))
        } catch (error: unknown) {
            const err = error as {
                response?: { data?: { detail?: string } }
            }
            toast.push(
                <Notification title="Error" type="danger">
                    {err.response?.data?.detail || 'Failed to delete team.'}
                </Notification>,
            )
        } finally {
            setDeletingTeamId(null)
        }
    }

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button
                size="sm"
                variant="default"
                className="flex-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200 dark:hover:!bg-gray-700 dark:hover:!border-gray-500"
                disabled={submitting}
                onClick={onDrawerClose}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                loading={submitting}
                disabled={submitting}
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
                company:
                    team.sales_division_name?.trim() ||
                    `Division: ${team.sales_division_id.slice(0, 8)}…`,
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
                        <TeamStatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {teamsLoading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Spinner size={40} />
                        </div>
                    ) : (
                        teams.map((team) => (
                            <TeamCard
                                key={team.id}
                                {...team}
                                deleting={deletingTeamId === team.id}
                                onDelete={() =>
                                    openDeleteDialog({
                                        id: team.id,
                                        name: team.name,
                                    })
                                }
                            />
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

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="Delete team"
                confirmText="Delete"
                cancelText="Cancel"
                onClose={closeDeleteDialog}
                onRequestClose={closeDeleteDialog}
                onCancel={closeDeleteDialog}
                onConfirm={handleDeleteTeam}
                confirmButtonProps={{ loading: !!deletingTeamId }}
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {teamToDelete?.name}
                    </span>
                    ? Members will be removed from this team but stay in the
                    company.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default TeamList
