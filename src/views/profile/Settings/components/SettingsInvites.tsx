import { useEffect, useMemo, useState } from 'react'
import { SURFACE_CARD_CLASSNAME } from '@/constants/surfaceCard.constant'
import { Alert, Button, Card, Input, Notification, Select, toast } from '@/components/ui'
import { useAppSelector } from '@/store/hook'
import Table from '@/components/ui/Table'
import {
    apiCreateInvite,
    apiGetInvites,
    apiRevokeInvite,
    type InviteRecord,
    type InviteRole,
} from '@/services/InviteService'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import {
    canRevokeTeamInvite,
    canSelectInviteTargetRole,
    canSendTeamInvite,
} from '@/utils/inviteAccess'

type RoleOption = { value: InviteRole; label: string }

const roleOptions: RoleOption[] = [
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'sales_person', label: 'Sales Person' },
]
const { Tr, Th, Td, THead, TBody } = Table
const columnHelper = createColumnHelper<InviteRecord>()

const SettingsInvites = () => {
    const userRole = useAppSelector((state) => state.auth.user.role)
    const companyId = useAppSelector((state) => state.auth.user.companyId)

    const [email, setEmail] = useState('')
    const [role, setRole] = useState<InviteRole>('sales_person')
    const [invites, setInvites] = useState<InviteRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const canSendInvite = canSendTeamInvite(userRole)
    const canSelectRole = canSelectInviteTargetRole(userRole)
    const canRevokeInvite = canRevokeTeamInvite(userRole)

    const fetchInvites = async () => {
        if (!companyId) {
            setInvites([])
            return
        }
        try {
            setLoading(true)
            setError('')
            const resp = await apiGetInvites(companyId)
            const next = Array.isArray(resp) ? resp : []
            setInvites(
                next.filter(
                    (i) => (i.status || 'pending').toLowerCase() !== 'revoked',
                ),
            )
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    'Failed to load invites',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvites()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId])

    const handleSendInvite = async () => {
        try {
            setSending(true)
            setError('')
            await apiCreateInvite({
                email,
                role: canSelectRole ? role : 'sales_person',
            })
            setEmail('')
            toast.push(
                <Notification title="Success" type="success">
                    Invite created and email sent.
                </Notification>,
            )
            toast.push(
                <Notification title="Note" type="info">
                    Delivery depends on recipient mailbox. If they don’t receive
                    it, confirm the email address and try again.
                </Notification>,
            )
            fetchInvites()
        } catch (err: any) {
            const status = err?.response?.status

            if (status === 400) {
                setError(
                    'This email address does not exist / cannot receive email. Please correct it.',
                )
                fetchInvites()
                return
            }

            if (status === 500 || status === 502) {
                setError(
                    'Email service temporarily unavailable. Please try again later.',
                )
                return
            }

            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    'Failed to send invite',
            )
        } finally {
            setSending(false)
        }
    }

    const handleRevoke = async (inviteId: string) => {
        try {
            setError('')
            await apiRevokeInvite(inviteId)
            toast.push(
                <Notification title="Success" type="success">
                    Invite revoked
                </Notification>,
            )
            fetchInvites()
        } catch (err: any) {
            const status = err?.response?.status

            if (status === 409) {
                setError('Invite already accepted/expired, cannot revoke.')
                fetchInvites()
                return
            }

            if (status === 403) {
                setError("You don’t have permission to revoke this invite.")
                return
            }

            if (status === 404) {
                setError('Invite not found (maybe already deleted).')
                fetchInvites()
                return
            }

            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    'Failed to revoke invite',
            )
        }
    }

    const columns = useMemo(
        () => [
            columnHelper.accessor('email', {
                header: 'Email',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.email}
                    </span>
                ),
            }),
            columnHelper.accessor('role', {
                header: 'Role',
                cell: (props) => (
                    <span className="capitalize">
                        {props.row.original.role}
                    </span>
                ),
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (props) => (
                    <span className="capitalize">
                        {props.row.original.status || 'pending'}
                    </span>
                ),
            }),
            columnHelper.display({
                header: 'Action',
                id: 'action',
                cell: (props) => {
                    const status = props.row.original.status || 'pending'
                    const canRevoke = status === 'pending'
                    return (
                        <Button
                            size="sm"
                            disabled={!canRevokeInvite || !canRevoke}
                            onClick={() =>
                                handleRevoke(props.row.original.invite_id)
                            }
                        >
                            Revoke
                        </Button>
                    )
                },
            }),
        ],
        [canRevokeInvite],
    )
    const table = useReactTable({
        data: invites,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (!canSendInvite) {
        return (
            <Card className={SURFACE_CARD_CLASSNAME} bodyClass="!p-4">
                <Alert type="info" showIcon>
                    Only company owners and sales managers can send invites.
                </Alert>
            </Card>
        )
    }

    return (
        <>
            <h4 className="mb-8">Team invites</h4>

            {error && (
                <Alert type="danger" showIcon className="mb-4">
                    <span className="break-all">{error}</span>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                    type="email"
                    value={email}
                    placeholder="user@company.com"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                    onChange={(e) => setEmail(e.target.value)}
                />
                {canSelectRole ? (
                    <Select<RoleOption, false>
                        options={roleOptions}
                        value={roleOptions.find((r) => r.value === role) || null}
                        onChange={(option) =>
                            setRole(
                                (option?.value as InviteRole) || 'sales_person',
                            )
                        }
                        className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                    />
                ) : (
                    <Input
                        type="text"
                        value="Sales Person"
                        disabled
                        className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                    />
                )}
                <Button
                    variant="solid"
                    loading={sending}
                    disabled={!email || !companyId}
                    className="bg-primary hover:bg-primary-deep text-white border-none rounded-md"
                    onClick={handleSendInvite}
                >
                    Send invite
                </Button>
            </div>

            <Card
                className={SURFACE_CARD_CLASSNAME}
                bodyClass="!p-0"
            >
                <Table>
                    <THead className="bg-transparent!">
                        {table.getHeaderGroups().map((hg) => (
                            <Tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <Th key={header.id} colSpan={header.colSpan}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </THead>
                    <TBody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={4} className="hover:bg-transparent">
                                    Loading invites...
                                </Td>
                            </Tr>
                        ) : invites.length === 0 ? (
                            <Tr>
                                <Td colSpan={4} className="hover:bg-transparent">
                                    No invites found
                                </Td>
                            </Tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Td>
                                    ))}
                                </Tr>
                            ))
                        )}
                    </TBody>
                </Table>
            </Card>
        </>
    )
}

export default SettingsInvites

