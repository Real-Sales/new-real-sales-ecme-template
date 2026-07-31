import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Badge, Spinner, Input, Dialog, Tabs, Tooltip, toast, Notification } from '@/components/ui'
import Container from '@/components/shared/Container'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import AddDivisionMemberContent from './components/AddDivisionMemberContent'
import DivisionTeamsPanel from '../teams/components/DivisionTeamsPanel'
import { useDivisionTeams } from '../teams/components/useDivisionTeams'
import { HiArrowLeft, HiPlus } from 'react-icons/hi'
import {
    TbSearch,
    TbUsers,
    TbUsersGroup,
    TbBuildingCommunity,
    TbUserPlus,
    TbTrash,
    TbCategory,
    TbTarget,
    TbPackage,
} from 'react-icons/tb'
import {
    useAppSelector,
    useAppDispatch,
    fetchDivisionInfo,
    fetchSalesDivisions,
    removeDivisionMemberLocally,
} from '@/store/slices/salesDivisions'
import salesDivisionsReducer from '@/store/slices/salesDivisions'
import teamsReducer from '@/store/slices/teams'
import { useAppSelector as useAuthSelector } from '@/store/hook'
import { injectReducer } from '@/store'
import store from '@/store'
import companyMembersReducer from '@/views/sales/members/store'
import {
    apiAssignCompanyMember,
    apiGetCompanyMembers,
} from '@/services/SalesCompanyService'
import {
    getMemberDirectDivisionIds,
    getMemberEditTeamIds,
    mapCompanyMember,
} from '@/views/sales/members/types'
import { syncAfterDivisionMemberChange } from '@/utils/syncMemberAssignmentStores'
import { formatDisplayLabel } from '@/utils/formatDisplayLabel'
import { SEARCH_INPUT_CLASSNAME } from '@/constants/searchInput.constant'
import Tag from '@/components/ui/Tag'
import type { DivisionUser } from '@/services/SalesCompanyService'
import type { ColumnDef } from '@/components/shared/DataTable'
import {
    SURFACE_CARD_CLASSNAME,
    SURFACE_INNER_TILE_CLASSNAME,
} from '@/constants/surfaceCard.constant'

injectReducer('salesDivisions', salesDivisionsReducer)
injectReducer('teams', teamsReducer)
injectReducer('companyMembers', companyMembersReducer)

const deduplicateUsers = (users: DivisionUser[]): DivisionUser[] => {
    const seen = new Set<string>()
    return users.filter((u) => {
        if (seen.has(u.user_id)) return false
        seen.add(u.user_id)
        return true
    })
}

const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

const CompanyDetail = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' | '' }>({ key: '', order: '' })
    const [activeTab, setActiveTab] = useState<'members' | 'teams'>('teams')
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

    const companyId = useAuthSelector((state) => state.auth.user.companyId)
    const userId = useAuthSelector((state) => state.auth.user.userId)
    const companyMembers = useAuthSelector(
        (state) => state.companyMembers?.data?.membersData ?? [],
    )
    const teamsData = useAuthSelector(
        (state) => state.teams?.data?.teamsData ?? [],
    )

    const {
        divisionsData,
        divisionInfo,
        infoLoading,
        initialized,
    } = useAppSelector(
        (state) =>
            state.salesDivisions?.data ?? {
                divisionsData: [],
                divisionsLoading: false,
                initialized: false,
                divisionInfo: {},
                infoLoading: false,
                error: null,
                notification: null,
            }
    )

    useEffect(() => {
        if (!companyId || initialized) return
        dispatch(fetchSalesDivisions(companyId))
    }, [dispatch, companyId, initialized])

    useEffect(() => {
        if (id) {
            dispatch(fetchDivisionInfo(id))
        }
    }, [id, dispatch])

    const division = id ? divisionInfo[id] : null
    const divisionFromList = useMemo(
        () => divisionsData.find((d) => d.sales_division_id === id),
        [divisionsData, id],
    )
    const divisionProducts = useMemo(() => {
        const products = division?.products ?? divisionFromList?.products ?? []
        return products.map((p) => ({
            id: p.product_id,
            name: formatDisplayLabel(p.name),
        }))
    }, [division, divisionFromList])

    const categoryLabel = useMemo(
        () =>
            division?.division_category
                ? formatDisplayLabel(division.division_category)
                : '',
        [division?.division_category],
    )

    const segmentLabel = useMemo(() => {
        const raw =
            division?.customer_segment?.name ||
            divisionFromList?.customer_segment?.name ||
            ''
        return raw ? formatDisplayLabel(raw) : ''
    }, [division?.customer_segment?.name, divisionFromList?.customer_segment?.name])

    const members = division ? deduplicateUsers(division.users) : []
    const isLoading = infoLoading && !division

    // Teams slice: fetch + division-scoped selectors via the shared teams Redux pattern
    const divisionTeams = useDivisionTeams({
        companyId,
        divisionId: id,
        divisionName: division?.name,
        userId,
    })
    const teamCount = divisionTeams.teams.length

    const filteredMembers = useMemo(() => members.filter((m) => {
        const fullName = `${m.first_name} ${m.last_name}`.toLowerCase()
        const q = searchTerm.toLowerCase()
        return (
            fullName.includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.team_name?.toLowerCase().includes(q) ||
            (m.teams?.some((t) => t.team_name?.toLowerCase().includes(q)) ?? false)
        )
    }), [members, searchTerm])

    const sortedMembers = useMemo(() => {
        if (!sortConfig.key || !sortConfig.order) return filteredMembers
        return [...filteredMembers].sort((a, b) => {
            let aVal: unknown
            let bVal: unknown
            if (sortConfig.key === 'member_name') {
                aVal = `${a.first_name} ${a.last_name}`
                bVal = `${b.first_name} ${b.last_name}`
            } else {
                aVal = (a as Record<string, unknown>)[sortConfig.key]
                bVal = (b as Record<string, unknown>)[sortConfig.key]
            }
            const aStr = String(aVal ?? '')
            const bStr = String(bVal ?? '')
            return sortConfig.order === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr)
        })
    }, [filteredMembers, sortConfig])

    const divisionMemberIds = members.map((m) => m.user_id)

    const refreshDivision = async () => {
        if (!id) return
        await syncAfterDivisionMemberChange(dispatch, () => store.getState(), {
            divisionId: id,
            salesCompanyId: division?.sales_company_id,
            userId,
            companyId: typeof companyId === 'string' ? companyId : undefined,
        })
    }

    const resolveMemberForAssignment = async (memberUserId: string) => {
        const cached = companyMembers.find((m) => m.user_id === memberUserId)
        if (cached) return cached

        if (!division?.sales_company_id) return null

        const data = await apiGetCompanyMembers(division.sales_company_id)
        const raw = data.members?.find((m) => m.user_id === memberUserId)
        return raw ? mapCompanyMember(raw) : null
    }

    const handleRemoveMember = async (memberUserId: string) => {
        if (!id || !division?.sales_company_id || removingMemberId) return

        setRemovingMemberId(memberUserId)
        try {
            const member = await resolveMemberForAssignment(memberUserId)
            if (!member) {
                throw new Error('Member not found')
            }

            const divisionTeamIds = new Set(
                teamsData
                    .filter((t) => t.sales_division_id === id)
                    .map((t) => t.company_team_id),
            )
            const nextDivisionIds = getMemberDirectDivisionIds(member).filter(
                (divisionId) => divisionId !== id,
            )
            const nextTeamIds = getMemberEditTeamIds(member, teamsData).filter(
                (teamId) => !divisionTeamIds.has(teamId),
            )
            const primaryWasRemoved = (member.sales_division_id ?? null) === id
            const nextPrimary = primaryWasRemoved
                ? nextDivisionIds[0] ?? null
                : member.sales_division_id ?? nextDivisionIds[0] ?? null

            await apiAssignCompanyMember(
                division.sales_company_id,
                memberUserId,
                {
                    sales_division_ids: nextDivisionIds,
                    company_team_ids: nextTeamIds,
                    sales_division_id: nextPrimary,
                },
            )

            // Drop the row immediately; sync other slices in the background.
            dispatch(
                removeDivisionMemberLocally({
                    divisionId: id,
                    userId: memberUserId,
                }),
            )
            setRemovingMemberId(null)
            toast.push(
                <Notification title="Success" type="success">
                    Member removed from division successfully
                </Notification>,
            )
            // Don't refetch this division list — optimistic update is source of truth.
            void syncAfterDivisionMemberChange(dispatch, () => store.getState(), {
                salesCompanyId: division.sales_company_id,
                userId,
                companyId: typeof companyId === 'string' ? companyId : undefined,
            })
        } catch (error) {
            console.error('Failed to remove member from division:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to remove member from division
                </Notification>,
            )
            setRemovingMemberId(null)
        }
    }

    const openDialog = () => setDialogOpen(true)
    const onDialogClose = () => setDialogOpen(false)

    // Pagination
    const startIndex = (currentPage - 1) * pageSize
    const paginatedData = sortedMembers.slice(startIndex, startIndex + pageSize)

    const columns: ColumnDef<DivisionUser>[] = [
        {
            header: 'Member',
            id: 'member_name',
            accessorFn: (row) => `${row.first_name} ${row.last_name}`,
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            size={40}
                            shape="circle"
                            className="bg-primary/10 text-primary font-semibold text-sm"
                        >
                            {getInitials(row.first_name, row.last_name)}
                        </Avatar>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {row.first_name} {row.last_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {row.email}
                            </p>
                        </div>
                    </div>
                )
            },
        },
        {
            header: 'Teams',
            id: 'teams',
            accessorFn: (row) =>
                row.teams?.length
                    ? row.teams.map((t) => t.team_name).join(', ')
                    : row.team_name || '',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
                if (row.teams?.length) {
                    return (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {row.teams.map((t) => (
                                <span
                                    key={t.team_id}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                >
                                    {t.team_name}
                                </span>
                            ))}
                        </div>
                    )
                }
                return row.team_name ? (
                    <span className="font-bold text-gray-900 dark:text-white">
                        {row.team_name}
                    </span>
                ) : (
                    <span className="text-gray-400 text-sm">—</span>
                )
            },
        },
        {
            header: 'Role',
            accessorKey: 'role',
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original
                const roleName = row.role?.name?.replace(/_/g, ' ')
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {roleName || '—'}
                    </span>
                )
            },
        },
        {
            header: 'Status',
            accessorKey: 'status_active',
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original
                return (
                    <Badge
                        innerClass={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            row.status_active
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                        content={row.status_active ? 'Active' : 'Inactive'}
                    />
                )
            },
        },
        {
            header: 'Action',
            id: 'action',
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original
                const isRemoving = removingMemberId === row.user_id
                return (
                    <Tooltip title="Remove from division">
                        <Button
                            size="sm"
                            variant="plain"
                            loading={isRemoving}
                            disabled={Boolean(removingMemberId)}
                            icon={<TbTrash className="text-lg" />}
                            className="hover:text-red-500"
                            onClick={() => handleRemoveMember(row.user_id)}
                        />
                    </Tooltip>
                )
            },
        },
    ]

    return (
        <div className="min-h-full">
            <Container className="pb-6 px-4">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiArrowLeft />}
                        onClick={() => navigate('/sales-division')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        Back to Sales Divisions
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-40">
                        <Spinner size={40} />
                    </div>
                ) : (
                    <>
                        {/* Division Header — identity only */}
                        <Card
                            className={`mb-6 ${SURFACE_CARD_CLASSNAME}`}
                            bodyClass="!p-5"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <TbBuildingCommunity className="text-2xl" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                                            {division?.name}
                                        </h1>
                                        <Badge
                                            innerClass={`px-2.5 py-0.5 text-xs font-medium ${
                                                division?.is_active
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                            }`}
                                            content={division?.is_active ? 'Active' : 'Inactive'}
                                        />
                                    </div>
                                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="inline-flex items-center gap-1">
                                            <TbUsersGroup className="text-base" />
                                            {teamCount} {teamCount === 1 ? 'team' : 'teams'}
                                        </span>
                                        <span className="text-gray-300 dark:text-gray-600">·</span>
                                        <span className="inline-flex items-center gap-1">
                                            <TbUsers className="text-base" />
                                            {members.length}{' '}
                                            {members.length === 1 ? 'member' : 'members'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className={`${SURFACE_INNER_TILE_CLASSNAME} p-3.5`}>
                                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <TbCategory className="text-sm" />
                                        </span>
                                        Category
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                                        {categoryLabel || '—'}
                                    </p>
                                </div>

                                <div className={`${SURFACE_INNER_TILE_CLASSNAME} p-3.5`}>
                                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <TbTarget className="text-sm" />
                                        </span>
                                        Customer segment
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                                        {segmentLabel || '—'}
                                    </p>
                                </div>

                                <div className={`${SURFACE_INNER_TILE_CLASSNAME} p-3.5`}>
                                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <TbPackage className="text-sm" />
                                        </span>
                                        Products
                                    </div>
                                    {divisionProducts.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {divisionProducts.map((product) => (
                                                <Tag
                                                    key={product.id || product.name}
                                                    className="rounded-full border-0 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary-mild"
                                                >
                                                    {product.name}
                                                </Tag>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            —
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Tabs + contextual action, then tab-scoped stats, then content */}
                        <Tabs
                            value={activeTab}
                            onChange={(val) =>
                                setActiveTab(val === 'teams' ? 'teams' : 'members')
                            }
                        >
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Tabs.TabList className="mb-0">
                                    <Tabs.TabNav value="teams">
                                        <span className="flex items-center gap-1.5">
                                            <TbUsersGroup className="text-sm" />
                                            Teams
                                            <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                                {teamCount}
                                            </span>
                                        </span>
                                    </Tabs.TabNav>
                                    <Tabs.TabNav value="members">
                                        <span className="flex items-center gap-1.5">
                                            <TbUsers className="text-sm" />
                                            Members
                                            <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                                {members.length}
                                            </span>
                                        </span>
                                    </Tabs.TabNav>
                                </Tabs.TabList>

                                {activeTab === 'members' ? (
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        icon={<TbUserPlus />}
                                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap rounded-md shrink-0 self-start sm:self-center"
                                        onClick={openDialog}
                                    >
                                        Add Members
                                    </Button>
                                ) : (
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        icon={<HiPlus />}
                                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap rounded-md shrink-0 self-start sm:self-center"
                                        onClick={divisionTeams.openDrawer}
                                    >
                                        Create Team
                                    </Button>
                                )}
                            </div>

                            {/* ── Teams tab (default) ── */}
                            <Tabs.TabContent value="teams">
                                <div data-tour-id="division-teams-panel">
                                    {companyId && id && (
                                        <DivisionTeamsPanel
                                            companyId={companyId}
                                            divisionId={id}
                                            divisionName={division?.name}
                                            teams={divisionTeams.teams}
                                            teamsLoading={divisionTeams.teamsLoading}
                                            initialized={divisionTeams.initialized}
                                            isDrawerOpen={divisionTeams.isDrawerOpen}
                                            editingTeam={divisionTeams.editingTeam}
                                            onDrawerClose={divisionTeams.onDrawerClose}
                                            formRef={divisionTeams.formRef}
                                            handleSubmitClick={divisionTeams.handleSubmitClick}
                                            onTeamSubmit={divisionTeams.onTeamSubmit}
                                            submitting={divisionTeams.submitting}
                                            deleteDialogOpen={divisionTeams.deleteDialogOpen}
                                            teamToDelete={divisionTeams.teamToDelete}
                                            deletingTeamId={divisionTeams.deletingTeamId}
                                            openEditDrawer={divisionTeams.openEditDrawer}
                                            openDeleteDialog={divisionTeams.openDeleteDialog}
                                            closeDeleteDialog={divisionTeams.closeDeleteDialog}
                                            handleDeleteTeam={divisionTeams.handleDeleteTeam}
                                        />
                                    )}
                                </div>
                            </Tabs.TabContent>

                            {/* ── Members tab ── */}
                            <Tabs.TabContent value="members">
                                <Card
                                    className={SURFACE_CARD_CLASSNAME}
                                    bodyClass="!p-5"
                                >
                                    <div className="mb-5">
                                        <Input
                                            className={SEARCH_INPUT_CLASSNAME}
                                            prefix={<TbSearch className="text-lg" />}
                                            placeholder="Search by name, email or team..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value)
                                                setCurrentPage(1)
                                            }}
                                            size="sm"
                                        />
                                    </div>

                                    <DataTable
                                        columns={columns}
                                        data={paginatedData}
                                        noData={filteredMembers.length === 0}
                                        hoverable
                                        pagingData={{
                                            total: filteredMembers.length,
                                            pageIndex: currentPage,
                                            pageSize,
                                        }}
                                        onPaginationChange={(page) => setCurrentPage(page)}
                                        onSelectChange={(val) => {
                                            setPageSize(val)
                                            setCurrentPage(1)
                                        }}
                                        onSort={({ key, order }) => {
                                            setSortConfig({ key: String(key), order })
                                            setCurrentPage(1)
                                        }}
                                    />
                                </Card>
                            </Tabs.TabContent>
                        </Tabs>
                    </>
                )}
            </Container>

            <Dialog
                isOpen={dialogOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                contentClassName="!bg-white dark:!bg-gray-900/60 !border-gray-200 dark:!border-white/10"
            >
                {division && (
                    <AddDivisionMemberContent
                        salesCompanyId={division.sales_company_id}
                        salesDivisionId={division.sales_division_id}
                        divisionMemberIds={divisionMemberIds}
                        onUpdate={refreshDivision}
                        onClose={onDialogClose}
                    />
                )}
            </Dialog>
        </div>
    )
}

export default CompanyDetail
