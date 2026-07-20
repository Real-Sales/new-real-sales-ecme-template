import { useEffect, useMemo, useRef, useState } from 'react'
import { toast, Notification } from '@/components/ui'
import { HiUserGroup, HiChartBar, HiTrendingUp } from 'react-icons/hi'
import { injectReducer } from '@/store'
import type { TeamFormSchema } from '../TeamForm'
import {
    apiCreateTeam,
    apiDeleteTeam,
    apiUpdateTeam,
} from '@/services/TeamService'
import teamsReducer, {
    useAppSelector,
    useAppDispatch,
    fetchTeams,
    resetNotification,
} from '@/store/slices/teams'

// Idempotent — safe even if already injected elsewhere.
injectReducer('teams', teamsReducer)

export type EditableTeam = {
    id: string
    name: string
    sales_division_id: string
    manager_id: string
}

type UseDivisionTeamsParams = {
    companyId?: string | null
    divisionId?: string | null
    divisionName?: string
    userId?: string | null
}

/**
 * Owns all data/state for a division's "Teams" tab (fetch, stats, cards, create/edit/delete),
 * so the stat boxes and the "Create Team" action can live in the division page's header —
 * above the Members/Teams tabs — while the card grid stays in its own tab.
 */
export const useDivisionTeams = ({
    companyId,
    divisionId,
    divisionName,
    userId,
}: UseDivisionTeamsParams) => {
    const dispatch = useAppDispatch()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingTeam, setEditingTeam] = useState<EditableTeam | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string } | null>(
        null,
    )
    const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const { teamsData, teamsLoading, initialized, notification } = useAppSelector(
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
            },
    )

    useEffect(() => {
        if (companyId && !initialized && !teamsLoading) {
            dispatch(fetchTeams(companyId))
        }
    }, [dispatch, companyId, initialized, teamsLoading])

    useEffect(() => {
        if (notification) {
            const type = (notification.type || 'info') as
                | 'success'
                | 'warning'
                | 'danger'
                | 'info'
            toast.push(
                <Notification title={type.charAt(0).toUpperCase() + type.slice(1)} type={type}>
                    {notification.message}
                </Notification>,
            )
            dispatch(resetNotification())
        }
    }, [notification, dispatch])

    const divisionTeams = useMemo(
        () => teamsData.filter((team) => team.sales_division_id === divisionId),
        [teamsData, divisionId],
    )

    const stats = useMemo(() => {
        const totalTeams = divisionTeams.length
        const totalMembers = divisionTeams.reduce(
            (acc, team) => acc + team.members.length,
            0,
        )

        const teamsWithScores = divisionTeams.filter(
            (team) => team.team_average_score !== null,
        )
        const avgPerformance =
            teamsWithScores.length > 0
                ? (
                      teamsWithScores.reduce(
                          (acc, team) => acc + (team.team_average_score || 0),
                          0,
                      ) / teamsWithScores.length
                  ).toFixed(1)
                : 0

        const totalSessions = divisionTeams.reduce((acc, team) => {
            return (
                acc +
                team.members.reduce((mAcc, member) => {
                    return (
                        mAcc +
                        member.performance_by_mode.reduce(
                            (pAcc, mode) => pAcc + mode.session_count,
                            0,
                        )
                    )
                }, 0)
            )
        }, 0)

        return [
            { icon: <HiUserGroup />, value: totalTeams, label: 'Total Teams' },
            { icon: <HiUserGroup />, value: totalMembers, label: 'Team Members' },
            { icon: <HiTrendingUp />, value: avgPerformance, label: 'Avg Performance' },
            { icon: <HiChartBar />, value: totalSessions, label: 'Total Sessions' },
        ]
    }, [divisionTeams])

    const teams = useMemo(() => {
        return divisionTeams.map((team) => {
            const teamSessions = team.members.reduce((acc, member) => {
                return (
                    acc +
                    member.performance_by_mode.reduce(
                        (pAcc, mode) => pAcc + mode.session_count,
                        0,
                    )
                )
            }, 0)

            return {
                id: team.company_team_id,
                name: team.name,
                company:
                    team.sales_division_name?.trim() || divisionName || 'Division',
                members: team.members.length,
                avgScore: team.team_average_score || 0,
                sessions: teamSessions,
                performance: team.team_average_score || 0,
                status: (team.team_average_score && team.team_average_score > 80
                    ? 'Stable'
                    : 'Focus') as 'Stable' | 'Focus' | 'New',
                createdAt: 'Recently',
                sales_division_id: team.sales_division_id,
                manager_id: team.manager_id,
            }
        })
    }, [divisionTeams, divisionName])

    const openDrawer = () => {
        setEditingTeam(null)
        setIsDrawerOpen(true)
    }

    const openEditDrawer = (team: EditableTeam) => {
        setEditingTeam(team)
        setIsDrawerOpen(true)
    }

    const onDrawerClose = () => {
        if (submitting) return
        setIsDrawerOpen(false)
        setEditingTeam(null)
    }

    const closeDrawerAfterSubmit = () => {
        setIsDrawerOpen(false)
        setEditingTeam(null)
    }

    const handleSubmitClick = () => {
        if (submitting) return
        if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true }),
            )
        }
    }

    const onTeamSubmit = async (values: TeamFormSchema) => {
        if (!companyId || !userId) {
            toast.push(
                <Notification title="Error" type="danger">
                    Missing company or user information.
                </Notification>,
            )
            return
        }

        try {
            setSubmitting(true)

            if (editingTeam) {
                await apiUpdateTeam(editingTeam.id, {
                    name: values.teamName,
                    sales_division_id: values.sales_division_id,
                    manager_id: editingTeam.manager_id || userId,
                    sales_company_id: companyId,
                })
                toast.push(
                    <Notification title="Success" type="success">
                        Team updated successfully!
                    </Notification>,
                )
            } else {
                await apiCreateTeam({
                    name: values.teamName,
                    sales_company_id: companyId,
                    sales_division_id: values.sales_division_id,
                    manager_id: userId,
                })
                toast.push(
                    <Notification title="Success" type="success">
                        Team created successfully!
                    </Notification>,
                )
            }

            closeDrawerAfterSubmit()
            dispatch(fetchTeams(companyId))
        } catch (error: unknown) {
            const err = error as {
                response?: { data?: { message?: string; detail?: string } }
            }
            toast.push(
                <Notification title="Error" type="danger">
                    {err.response?.data?.detail ||
                        err.response?.data?.message ||
                        (editingTeam ? 'Failed to update team' : 'Failed to create team')}
                </Notification>,
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
            const err = error as { response?: { data?: { detail?: string } } }
            toast.push(
                <Notification title="Error" type="danger">
                    {err.response?.data?.detail || 'Failed to delete team.'}
                </Notification>,
            )
        } finally {
            setDeletingTeamId(null)
        }
    }

    return {
        teamsLoading,
        initialized,
        stats,
        teams,
        isDrawerOpen,
        editingTeam,
        openDrawer,
        openEditDrawer,
        onDrawerClose,
        formRef,
        handleSubmitClick,
        onTeamSubmit,
        submitting,
        deleteDialogOpen,
        teamToDelete,
        deletingTeamId,
        openDeleteDialog,
        closeDeleteDialog,
        handleDeleteTeam,
    }
}
