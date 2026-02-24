import { useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import Progress from '@/components/ui/Progress'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import classNames from '@/utils/classNames'
import { TbTrash, TbPencil } from 'react-icons/tb'
import { FiShare2 } from 'react-icons/fi'
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

const ActionColumn = ({ 
    row, 
    onDelete,
    onEdit 
}: { 
    row: Scenario
    onDelete: () => void
    onEdit: () => void
}) => {
    const isInactive = getDerivedStatus(row) === 'inactive'

    const onShare = () => {
        console.log('Share scenario:', row.scenario_id)
    }

    return (
        <div className={classNames(
            "flex justify-end text-lg gap-1",
            isInactive && "text-gray-500 dark:text-gray-500"
        )}>
            <Tooltip wrapperClass="flex" title="Share">
                <span className="cursor-pointer p-2" onClick={onShare}>
                    <FiShare2 />
                </span>
            </Tooltip>
            <Tooltip wrapperClass="flex" title="Edit">
                <span className="cursor-pointer p-2" onClick={onEdit}>
                    <TbPencil />
                </span>
            </Tooltip>
            <Tooltip wrapperClass="flex" title="Delete">
                <span
                    className={classNames(
                        "cursor-pointer p-2",
                        !isInactive && "hover:text-red-500"
                    )}
                    onClick={onDelete}
                >
                    <TbTrash />
                </span>
            </Tooltip>
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
    onConfirmDeleteScenario?: (scenario: Scenario) => void | Promise<void>
    pagingData: {
        total: number
        pageIndex: number
        pageSize: number
    }
    onPaginationChange: (page: number) => void
    onSelectChange: (value: number) => void
}

const ScenarioListTable = ({ 
    data, 
    loading = false,
    selectedScenarios,
    onRowSelect,
    onAllRowSelect,
    onRowClick,
    onEdit,
    onConfirmDeleteScenario,
    pagingData,
    onPaginationChange,
    onSelectChange,
}: ScenarioListTableProps) => {
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [toDeleteScenario, setToDeleteScenario] = useState<Scenario | null>(null)

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
        setToDeleteScenario(null)
    }

    const handleDelete = (scenario: Scenario) => {
        setDeleteConfirmationOpen(true)
        setToDeleteScenario(scenario)
    }

    const handleConfirmDelete = async () => {
        if (toDeleteScenario) {
            await onConfirmDeleteScenario?.(toDeleteScenario)
        }
        setDeleteConfirmationOpen(false)
        setToDeleteScenario(null)
    }

    const columns: ColumnDef<Scenario>[] = useMemo(
        () => [
            {
                header: 'Title',
                accessorKey: 'title',
                enableSorting: false,
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
                enableSorting: false,
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
                enableSorting: false,
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
                cell: (props) => (
                    <ActionColumn 
                        row={props.row.original} 
                        onDelete={() => handleDelete(props.row.original)}
                        onEdit={() => onEdit(props.row.original)}
                    />
                ),
            },
        ],
        [handleDelete, onEdit],
    )

    return (
        <>
            <DataTable
                selectable
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
            />
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
                    Are you sure you want to remove <strong>{toDeleteScenario?.title}</strong>? This action can&apos;t be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default ScenarioListTable
