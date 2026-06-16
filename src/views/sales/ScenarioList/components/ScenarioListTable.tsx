import { useCallback, useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import Progress from '@/components/ui/Progress'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import classNames from '@/utils/classNames'
import { TbTrash, TbPencil, TbPlayerPlay, TbUserPlus, TbRefresh } from 'react-icons/tb'
import Button from '@/components/ui/Button'
import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { Scenario } from '../types'

const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
}

const statusLabel: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
}

const getDerivedStatus = (row: Scenario) =>
    row.persona?.status_active && row.mode?.status_active ? 'active' : 'inactive'

function sessionStatusBadgeClass(status: string) {
    const s = status.toLowerCase()
    if (s === 'completed') {
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
    if (s === 'active') {
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    if (s === 'pending') {
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    }
    if (s === 'abandoned') {
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    }
    if (s === 'expired') {
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
}

const ActionColumn = ({ 
    row, 
    onDelete,
    onEdit,
    onShare
}: { 
    row: Scenario
    onDelete: () => void
    onEdit: () => void
    onShare: () => void
}) => {
    const isInactive = getDerivedStatus(row) === 'inactive'

    return (
        <div className={classNames(
            "flex justify-center items-center gap-2 w-[150px] mx-auto",
            isInactive && "text-gray-500 dark:text-gray-500"
        )}>
            <Button
                size="xs"
                variant="solid"
                className="bg-primary hover:bg-primary-deep text-white px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 border-none h-8"
                onClick={onShare}
            >
                <TbUserPlus className="text-sm" />
                <span>Assign</span>
            </Button>
            <div className="flex gap-1 ml-1 text-lg">
                <Tooltip wrapperClass="flex" title="Edit">
                    <span className="cursor-pointer p-2 hover:text-primary transition-colors" onClick={onEdit}>
                        <TbPencil />
                    </span>
                </Tooltip>
                <Tooltip wrapperClass="flex" title="Delete">
                    <span
                        className={classNames(
                            "cursor-pointer p-2 transition-colors",
                            !isInactive && "hover:text-red-500 text-gray-400"
                        )}
                        onClick={onDelete}
                    >
                        <TbTrash />
                    </span>
                </Tooltip>
            </div>
        </div>
    )
}

type ScenarioListTableProps = {
    data: Scenario[]
    loading?: boolean
    selectedScenarios: Scenario[]
    onRowSelect: (checked: boolean, row: Scenario) => void
    onAllRowSelect: (checked: boolean, rows: any[]) => void
    onRowClick: (scenario: Scenario) => void
    onEdit: (scenario: Scenario) => void
    onShare: (scenario: Scenario) => void
    onConfirmDeleteScenario?: (scenario: Scenario) => void | Promise<void>
    pagingData: {
        total: number
        pageIndex: number
        pageSize: number
    }
    onPaginationChange: (page: number) => void
    onSelectChange: (value: number) => void
    variant?: 'manager' | 'salesRep'
    /** Start / Resume — navigate to existing session (ephemeral token + chat_history). */
    onSalesRepOpenSession?: (scenario: Scenario) => void
    onSalesRepViewReport?: (scenario: Scenario) => void
    onSort?: (sort: { key: string | number; order: 'asc' | 'desc' | '' }) => void
}

const ScenarioListTable = ({
    data,
    loading = false,
    selectedScenarios,
    onRowSelect,
    onAllRowSelect,
    onRowClick,
    onEdit,
    onShare,
    onConfirmDeleteScenario,
    pagingData,
    onPaginationChange,
    onSelectChange,
    variant = 'manager',
    onSalesRepOpenSession,
    onSalesRepViewReport,
    onSort,
}: ScenarioListTableProps) => {
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [toDeleteScenario, setToDeleteScenario] = useState<Scenario | null>(null)

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
        setToDeleteScenario(null)
    }

    const handleDelete = useCallback((scenario: Scenario) => {
        setDeleteConfirmationOpen(true)
        setToDeleteScenario(scenario)
    }, [])

    const handleConfirmDelete = async () => {
        if (toDeleteScenario) {
            await onConfirmDeleteScenario?.(toDeleteScenario)
        }
        setDeleteConfirmationOpen(false)
        setToDeleteScenario(null)
    }

    const managerColumns: ColumnDef<Scenario>[] = useMemo(
        () => [
            {
                header: 'Title',
                accessorKey: 'title',
                enableSorting: true,
                cell: (props) => {
                    const row = props.row.original
                    const isInactive = getDerivedStatus(row) === 'inactive'
                    return (
                        <span 
                            className={classNames(
                                "font-bold heading-text cursor-pointer hover:text-primary",
                                isInactive && "text-gray-500 dark:text-gray-500"
                            )}
                            onClick={() => onRowClick(row)}
                        >
                            {row.title}
                        </span>
                    )
                },
            },
            {
                header: 'Type',
                accessorKey: 'creator_role',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    const isSystem = row.creator_role === 'super_admin'
                    return isSystem ? (
                        <Badge
                            innerClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 text-xs font-medium"
                            content="System"
                        />
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">—</span>
                    )
                },
            },
            {
                header: 'Completions',
                accessorKey: 'completions',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    const total = row.users_assigned_count ?? row.assigned_sessions_count ?? 0
                    const completed = row.users_completed_count ?? 0
                    const isInactive = getDerivedStatus(row) === 'inactive'
                    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0

                    return (
                        <div className="flex flex-col gap-1">
                            <span className={classNames(
                                "flex gap-1",
                                isInactive && "text-gray-500 dark:text-gray-500"
                            )}>
                                <span className="font-semibold">
                                    <NumericFormat displayType="text" value={completed} thousandSeparator={true} />
                                    /{total}
                                </span>
                                <span>Users</span>
                            </span>
                            <Progress
                                percent={completionPercent}
                                showInfo={false}
                                customColorClass={
                                    isInactive
                                        ? 'bg-gray-400 dark:bg-gray-600'
                                        : classNames(
                                            'bg-error',
                                            completionPercent > 40 && 'bg-warning',
                                            completionPercent > 70 && 'bg-success'
                                        )
                                }
                            />
                        </div>
                    )
                },
            },
            {
                header: 'Deadline',
                accessorKey: 'time_limit_days',
                enableSorting: true,
                cell: (props) => {
                    const { time_limit_days } = props.row.original
                    const isInactive = getDerivedStatus(props.row.original) === 'inactive'
                    return (
                        <span className={classNames(
                            "font-semibold",
                            isInactive && "text-gray-500 dark:text-gray-500"
                        )}>
                            {time_limit_days} days
                        </span>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                enableSorting: false,
                cell: (props) => {
                    const status = getDerivedStatus(props.row.original)
                    return (
                        <Badge
                            innerClass={`${statusColor[status]} px-2 py-0.5 text-xs font-medium`}
                            content={statusLabel[status]}
                        />
                    )
                },
            },
            {
                header: 'Created',
                accessorKey: 'created_at',
                enableSorting: true,
                cell: (props) => {
                    const row = props.row.original
                    const isInactive = getDerivedStatus(row) === 'inactive'
                    return (
                        <span className={classNames(
                            "font-semibold",
                            isInactive && "text-gray-500 dark:text-gray-500"
                        )}>
                            {dayjs(row.created_at).format('DD/MM/YYYY')}
                        </span>
                    )
                },
            },
            {
                header: 'Action',
                id: 'action',
                width: 150,
                cell: (props) => (
                    <ActionColumn 
                        row={props.row.original} 
                        onDelete={() => handleDelete(props.row.original)}
                        onEdit={() => onEdit(props.row.original)}
                        onShare={() => onShare(props.row.original)}
                    />
                ),
            },
        ],
        [handleDelete, onEdit, onShare, onRowClick],
    )

    const salesRepColumns: ColumnDef<Scenario>[] = useMemo(
        () => [
            {
                header: 'Title',
                accessorKey: 'title',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span
                            className={classNames(
                                'font-bold heading-text cursor-pointer hover:text-primary',
                                row.is_completed && 'text-gray-500 dark:text-gray-500',
                            )}
                            onClick={() => onRowClick(row)}
                        >
                            {row.title || '—'}
                        </span>
                    )
                },
            },
            {
                header: 'Session',
                accessorKey: 'session_status',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    if (!row.session_status) {
                        return <span className="text-gray-500">—</span>
                    }
                    const label = row.session_status.replace(/_/g, ' ')
                    return (
                        <Badge
                            innerClass={`${sessionStatusBadgeClass(row.session_status)} px-2 py-0.5 text-xs font-medium capitalize`}
                            content={label}
                        />
                    )
                },
            },
            {
                header: 'Days left',
                id: 'days_remaining',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    const d = row.days_remaining
                    if (d === null || d === undefined) {
                        return <span className="text-gray-500">—</span>
                    }
                    return (
                        <span className="font-semibold tabular-nums">
                            {d} {d === 1 ? 'day' : 'days'}
                        </span>
                    )
                },
            },
            {
                header: 'Mode',
                id: 'mode_name',
                enableSorting: false,
                cell: (props) => (
                    <span className="capitalize">
                        {props.row.original.mode?.name || '—'}
                    </span>
                ),
            },
            {
                header: 'Persona',
                id: 'persona_name',
                enableSorting: false,
                cell: (props) => <span>{props.row.original.persona?.name || '—'}</span>,
            },
            {
                header: 'Assigned by',
                id: 'creator_name',
                enableSorting: false,
                cell: (props) => (
                    <span className="text-gray-600 dark:text-gray-400">
                        {props.row.original.creator_name || '—'}
                    </span>
                ),
            },
            {
                header: 'Created',
                accessorKey: 'created_at',
                enableSorting: false,
                cell: (props) => (
                    <span className="font-semibold">
                        {dayjs(props.row.original.created_at).format('DD/MM/YYYY')}
                    </span>
                ),
            },
            {
                header: 'Action',
                id: 'action_rep',
                width: 148,
                cell: (props) => {
                    const row = props.row.original
                    const sid = row.session_id
                    const st = (row.session_status ?? '').toLowerCase()

                    if (st === 'expired') {
                        return (
                            <Button
                                size="xs"
                                variant="default"
                                disabled
                                className="h-8 min-w-[5.5rem] cursor-not-allowed opacity-70"
                            >
                                Expired
                            </Button>
                        )
                    }

                    if (st === 'completed') {
                        return (
                            <Button
                                size="xs"
                                variant="solid"
                                className="h-8 min-w-[5.5rem] bg-primary hover:bg-primary-deep text-white border-none"
                                disabled={!sid}
                                onClick={() => sid && onSalesRepViewReport?.(row)}
                            >
                                View Report
                            </Button>
                        )
                    }

                    if (st === 'pending') {
                        return (
                            <Button
                                size="xs"
                                variant="solid"
                                className="h-8 min-w-[5.5rem] bg-primary hover:bg-primary-deep text-white border-none gap-1"
                                disabled={!sid}
                                icon={<TbPlayerPlay className="text-sm" />}
                                onClick={() => sid && onSalesRepOpenSession?.(row)}
                            >
                                Start
                            </Button>
                        )
                    }

                    if (st === 'active' || st === 'abandoned') {
                        return (
                            <Button
                                size="xs"
                                variant="solid"
                                className="h-8 min-w-[5.5rem] bg-primary hover:bg-primary-deep text-white border-none gap-1"
                                disabled={!sid}
                                icon={<TbRefresh className="text-sm" />}
                                onClick={() => sid && onSalesRepOpenSession?.(row)}
                            >
                                Resume
                            </Button>
                        )
                    }

                    if (sid) {
                        return (
                            <Button
                                size="xs"
                                variant="solid"
                                className="h-8 min-w-[5.5rem] bg-primary hover:bg-primary-deep text-white border-none gap-1"
                                icon={<TbPlayerPlay className="text-sm" />}
                                onClick={() => onSalesRepOpenSession?.(row)}
                            >
                                Open
                            </Button>
                        )
                    }

                    return <span className="text-gray-500">—</span>
                },
            },
        ],
        [onRowClick, onSalesRepOpenSession, onSalesRepViewReport],
    )

    const columns = variant === 'salesRep' ? salesRepColumns : managerColumns
    const selectable = variant === 'manager'
    return (
        <>
            <DataTable
                selectable={selectable}
                columns={columns}
                data={data}
                noData={!loading && data.length === 0}
                loading={loading}
                checkboxChecked={(row) =>
                    selectedScenarios.some((selected) => selected.scenario_id === row.scenario_id)
                }
                onCheckBoxChange={onRowSelect}
                onIndeterminateCheckBoxChange={onAllRowSelect}
                pagingData={pagingData}
                onPaginationChange={onPaginationChange}
                onSelectChange={onSelectChange}
                onSort={onSort}
            />
            {variant === 'manager' && (
                <ConfirmDialog
                    isOpen={deleteConfirmationOpen}
                    type="danger"
                    title="Remove scenario"
                    onClose={handleCancel}
                    onRequestClose={handleCancel}
                    onCancel={handleCancel}
                    onConfirm={handleConfirmDelete}
                >
                    <p>
                        Are you sure you want to remove <strong>{toDeleteScenario?.title}</strong>?
                        This action can&apos;t be undone.
                    </p>
                </ConfirmDialog>
            )}
        </>
    )
}

export default ScenarioListTable
