import { useEffect, useMemo, useState } from 'react'
import { Card, Badge, Spinner, Input, Button, toast, Notification } from '@/components/ui'
import Container from '@/components/shared/Container'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import { TbSearch, TbUsers, TbUserCheck } from 'react-icons/tb'
import { HiPencil } from 'react-icons/hi'
import { injectReducer } from '@/store'
import { useAppSelector as useAuthSelector } from '@/store/hook'
import companyMembersReducer, {
    useAppSelector,
    useAppDispatch,
    fetchCompanyMembers,
    resetNotification,
    updateMemberRow,
} from './store'
import salesDivisionsReducer, { resetSalesDivisionsData } from '@/store/slices/salesDivisions'
import teamsReducer, { resetTeamsData } from '@/store/slices/teams'
import EditMemberDrawer from './components/EditMemberDrawer'
import type { CompanyMemberRow } from './types'
import type { ColumnDef } from '@/components/shared/DataTable'

injectReducer('companyMembers', companyMembersReducer)
injectReducer('salesDivisions', salesDivisionsReducer)
injectReducer('teams', teamsReducer)

const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

const formatRole = (role?: string) =>
    role ? role.replace(/_/g, ' ') : '—'

const MemberList = () => {
    const dispatch = useAppDispatch()
    const userId = useAuthSelector((state) => state.auth.user.userId)
    const userRole = useAuthSelector((state) => state.auth.user.role)
    const companyIdFromAuth = useAuthSelector((state) => state.auth.user.companyId)

    const {
        membersData,
        membersLoading,
        initialized,
        companyName,
        salesCompanyId,
        companyManagerId,
        totalMembers,
        activeMembers,
        error,
        notification,
    } = useAppSelector(
        (state) =>
            state.companyMembers?.data ?? {
                membersLoading: false,
                initialized: false,
                companyName: '',
                salesCompanyId: null,
                companyManagerId: null,
                totalMembers: 0,
                activeMembers: 0,
                membersData: [],
                error: null,
                notification: null,
            },
    )

    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [editDrawerOpen, setEditDrawerOpen] = useState(false)
    const [memberToEdit, setMemberToEdit] = useState<CompanyMemberRow | null>(null)

    const openEditDrawer = (member: CompanyMemberRow) => {
        setMemberToEdit(member)
        setEditDrawerOpen(true)
    }

    const closeEditDrawer = () => {
        setEditDrawerOpen(false)
        setMemberToEdit(null)
    }

    const handleMemberUpdated = (updated: CompanyMemberRow) => {
        dispatch(updateMemberRow(updated))
        dispatch(resetSalesDivisionsData())
        dispatch(resetTeamsData())
    }

    useEffect(() => {
        if ((userId || companyIdFromAuth) && !initialized && !membersLoading) {
            dispatch(
                fetchCompanyMembers({
                    userId,
                    companyId: companyIdFromAuth,
                }),
            )
        }
    }, [dispatch, userId, companyIdFromAuth, initialized, membersLoading])

    useEffect(() => {
        if (notification) {
            const type = (notification.type || 'info') as
                | 'success'
                | 'warning'
                | 'danger'
                | 'info'
            toast.push(
                <Notification
                    title={type.charAt(0).toUpperCase() + type.slice(1)}
                    type={type}
                >
                    {notification.message}
                </Notification>,
            )
            dispatch(resetNotification())
        }
    }, [notification, dispatch])

    const filteredMembers = useMemo(() => {
        const q = searchTerm.trim().toLowerCase()
        if (!q) return membersData
        return membersData.filter((m) => {
            const fullName = `${m.first_name} ${m.last_name}`.toLowerCase()
            return (
                fullName.includes(q) ||
                m.email.toLowerCase().includes(q) ||
                formatRole(m.role?.name).toLowerCase().includes(q) ||
                (m.team_name?.toLowerCase().includes(q) ?? false) ||
                (m.sales_division_name?.toLowerCase().includes(q) ?? false)
            )
        })
    }, [membersData, searchTerm])

    const columns: ColumnDef<CompanyMemberRow>[] = useMemo(
        () => [
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
                header: 'Role',
                accessorKey: 'role',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {formatRole(row.role?.name)}
                        </span>
                    )
                },
            },
            {
                header: 'Team',
                accessorKey: 'team_name',
                enableSorting: true,
                cell: (props) => {
                    const name = props.row.original.team_name
                    return name ? (
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {name}
                        </span>
                    ) : (
                        <span className="text-gray-400 text-sm">—</span>
                    )
                },
            },
            {
                header: 'Division',
                accessorKey: 'sales_division_name',
                enableSorting: true,
                cell: (props) => {
                    const name = props.row.original.sales_division_name
                    return name ? (
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {name}
                        </span>
                    ) : (
                        <span className="text-gray-400 text-sm">—</span>
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
                id: 'actions',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <Button
                            size="xs"
                            variant="plain"
                            icon={<HiPencil />}
                            className="h-8 w-8 p-0"
                            aria-label={`Edit ${row.first_name} ${row.last_name}`}
                            onClick={() => openEditDrawer(row)}
                        />
                    )
                },
            },
        ],
        [],
    )

    const loading = membersLoading
    const displayError = error

    return (
        <div className="min-h-full">
            <Container className="pb-6 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Company Members
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {companyName
                            ? `All members in ${companyName}`
                            : 'View everyone linked to your company'}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <Spinner size={40} />
                    </div>
                ) : displayError ? (
                    <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-red-500 dark:text-red-400">
                            {displayError}
                        </p>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <Card
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md"
                                bodyClass="!p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 rounded-xl p-2 text-primary text-3xl">
                                        <TbUsers />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {totalMembers}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Total Members
                                        </p>
                                    </div>
                                </div>
                            </Card>
                            <Card
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md"
                                bodyClass="!p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 rounded-xl p-2 text-primary text-3xl">
                                        <TbUserCheck />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {activeMembers}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Active Members
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md">
                            <div className="mb-4">
                                <Input
                                    prefix={<TbSearch className="text-lg" />}
                                    placeholder="Search by name, email, role, team, or division..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                />
                            </div>
                            <DataTable
                                columns={columns}
                                data={filteredMembers}
                                pagingData={{
                                    total: filteredMembers.length,
                                    pageIndex: currentPage,
                                    pageSize,
                                }}
                                onPaginationChange={(page) => setCurrentPage(page)}
                                onSelectChange={(size) => {
                                    setPageSize(size)
                                    setCurrentPage(1)
                                }}
                            />
                        </Card>
                    </>
                )}
            </Container>

            <EditMemberDrawer
                isOpen={editDrawerOpen}
                member={memberToEdit}
                salesCompanyId={salesCompanyId}
                companyManagerId={companyManagerId}
                currentUserId={userId}
                currentUserRole={userRole}
                onClose={closeEditDrawer}
                onUpdated={handleMemberUpdated}
            />
        </div>
    )
}

export default MemberList
