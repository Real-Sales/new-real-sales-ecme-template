import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import Progress from '@/components/ui/Progress'
import DataTable from '@/components/shared/DataTable'
import classNames from '@/utils/classNames'
import { TbTrash } from 'react-icons/tb'
import { NumericFormat } from 'react-number-format'
import type { ColumnDef } from '@/components/shared/DataTable'

type TeamMember = {
    id: string
    name: string
    email: string
    score: number
    sessions: number
    img?: string
}

type TeamMembersTableProps = {
    members: TeamMember[]
    onRemoveMember: (memberId: string) => void
    onRowClick: (member: TeamMember) => void
    pagingData?: {
        total: number
        pageIndex: number
        pageSize: number
    }
    onPaginationChange?: (page: number) => void
    onSelectChange?: (value: number) => void
}

const TeamMembersTable = ({ 
    members, 
    onRemoveMember,
    onRowClick,
    pagingData,
    onPaginationChange,
    onSelectChange,
}: TeamMembersTableProps) => {
    // Generate initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const columns: ColumnDef<TeamMember>[] = useMemo(
        () => [
            {
                header: 'Member',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div 
                            className="flex items-center gap-3 cursor-pointer" 
                            onClick={() => onRowClick(row)}
                        >
                            {row.img ? (
                                <Avatar size={40} shape="circle" src={row.img} />
                            ) : (
                                <Avatar size={40} shape="circle">
                                    {getInitials(row.name)}
                                </Avatar>
                            )}
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white hover:text-primary">
                                    {row.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {row.email}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Overall Score',
                accessorKey: 'score',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                                <NumericFormat
                                    displayType="text"
                                    value={row.score}
                                    suffix="/100"
                                    decimalScale={1}
                                    fixedDecimalScale
                                />
                            </span>
                            <Progress
                                percent={row.score}
                                showInfo={false}
                                customColorClass={classNames(
                                    'bg-red-500',
                                    row.score >= 50 && 'bg-yellow-500',
                                    row.score >= 65 && 'bg-green-500',
                                )}
                            />
                        </div>
                    )
                },
            },
            {
                header: 'Sessions',
                accessorKey: 'sessions',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {row.sessions}
                        </div>
                    )
                },
            },
            {
                header: 'Action',
                id: 'action',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <Tooltip title="Remove from team">
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<TbTrash className="text-lg" />}
                                    className="hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemoveMember(row.id)
                                    }}
                                />
                            </Tooltip>
                        </div>
                    )
                },
            },
        ],
        [onRemoveMember, onRowClick],
    )

    return (
        <DataTable
            columns={columns}
            data={members}
            noData={members.length === 0}
            hoverable
            pagingData={pagingData}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
        />
    )
}

export default TeamMembersTable
