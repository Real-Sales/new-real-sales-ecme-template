import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Badge, Spinner, Input, Dialog } from '@/components/ui'
import Container from '@/components/shared/Container'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import AddDivisionMemberContent from './components/AddDivisionMemberContent'
import { HiArrowLeft, HiUser } from 'react-icons/hi'
import { TbSearch, TbUsers, TbUsersGroup, TbBuildingCommunity, TbUserPlus } from 'react-icons/tb'
import {
    useAppSelector,
    useAppDispatch,
    fetchDivisionInfo,
} from '@/store/slices/salesDivisions'
import type { DivisionUser, SalesDivisionInfoResponse } from '@/services/SalesCompanyService'
import type { ColumnDef } from '@/components/shared/DataTable'

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

    const {
        divisionInfo,
        infoLoading,
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

    const division = id ? divisionInfo[id] : null
    const isLoading = infoLoading

    useEffect(() => {
        if (id && !divisionInfo[id]) {
            dispatch(fetchDivisionInfo(id))
        }
    }, [id, dispatch, divisionInfo])

    const members = division ? deduplicateUsers(division.users) : []

    const filteredMembers = members.filter((m) => {
        const fullName = `${m.first_name} ${m.last_name}`.toLowerCase()
        const q = searchTerm.toLowerCase()
        return (
            fullName.includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.team_name?.toLowerCase().includes(q)
        )
    })

    const teamCount = new Set(members.map((m) => m.team_id).filter(Boolean)).size
    const divisionMemberIds = members.map((m) => m.user_id)

    const refreshDivision = () => {
        if (id) {
            dispatch(fetchDivisionInfo(id))
        }
    }

    const openDialog = () => setDialogOpen(true)
    const onDialogClose = () => setDialogOpen(false)

    // Pagination
    const startIndex = (currentPage - 1) * pageSize
    const paginatedData = filteredMembers.slice(startIndex, startIndex + pageSize)

    const columns: ColumnDef<DivisionUser>[] = [
        {
            header: 'Member',
            accessorKey: 'first_name',
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
            header: 'Team',
            accessorKey: 'team_name',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original
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
                        {/* Division Header */}
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <TbBuildingCommunity className="text-xl" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {division?.division_category}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<TbUserPlus />}
                                className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap rounded-md shrink-0"
                                onClick={openDialog}
                            >
                                Add Members
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
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
                                            {members.length}
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
                                    <div className="bg-blue-500/10 rounded-xl p-2 text-blue-500 text-3xl">
                                        <TbUsersGroup />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {teamCount}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Teams
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Members Table */}
                        <Card
                            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md"
                            bodyClass="!p-5"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                                <div className="flex items-center gap-2">
                                    <HiUser className="text-xl text-gray-500 dark:text-gray-400" />
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Members ({members.length})
                                    </h2>
                                </div>
                                <div className="w-full sm:w-64">
                                    <Input
                                        prefix={<TbSearch className="text-gray-400" />}
                                        placeholder="Search by name, email or team..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        size="sm"
                                    />
                                </div>
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
                            />
                        </Card>
                    </>
                )}
            </Container>

            <Dialog
                isOpen={dialogOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
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
