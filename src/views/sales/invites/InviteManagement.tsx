import { useEffect, useState } from 'react'
import Container from '@/components/shared/Container'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import { SURFACE_CARD_CLASSNAME } from '@/constants/surfaceCard.constant'
import Alert from '@/components/ui/Alert'
import { toast, Notification } from '@/components/ui'
import { useAppSelector } from '@/store/hook'
import {
    apiCreateInvite,
    apiGetInvites,
    apiRevokeInvite,
    type InviteRecord,
    type InviteRole,
} from '@/services/InviteService'

type RoleOption = { value: InviteRole; label: string }

const roleOptions: RoleOption[] = [
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'sales_person', label: 'Sales Person' },
]

const InviteManagement = () => {
    const companyId = useAppSelector((state) => state.auth.user.companyId)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<InviteRole>('sales_person')
    const [invites, setInvites] = useState<InviteRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    const fetchInvites = async () => {
        if (!companyId) {
            setInvites([])
            return
        }
        try {
            setLoading(true)
            setError('')
            const data = await apiGetInvites(companyId)
            setInvites(Array.isArray(data) ? data : [])
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
    }, [companyId])

    const handleSendInvite = async () => {
        try {
            setSending(true)
            setError('')
            await apiCreateInvite({ email, role })
            toast.push(
                <Notification title="Success" type="success">
                    Invite sent successfully
                </Notification>,
            )
            setEmail('')
            fetchInvites()
        } catch (err: any) {
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
            await apiRevokeInvite(inviteId)
            toast.push(
                <Notification title="Success" type="success">
                    Invite revoked
                </Notification>,
            )
            fetchInvites()
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    'Failed to revoke invite',
            )
        }
    }

    return (
        <Container className="pb-6 px-4">
            <div className="mb-6">
                <h3 className="mb-1">Team Invites</h3>
                <p className="heading-text">
                    Send invites to sales managers and sales people.
                </p>
            </div>

            {error && (
                <Alert type="danger" showIcon className="mb-4">
                    <span className="break-all">{error}</span>
                </Alert>
            )}

            <Card className={`mb-6 ${SURFACE_CARD_CLASSNAME}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@company.com"
                        type="email"
                    />
                    <Select<RoleOption, false>
                        options={roleOptions}
                        value={roleOptions.find((r) => r.value === role) || null}
                        onChange={(option) =>
                            setRole((option?.value as InviteRole) || 'sales_person')
                        }
                    />
                    <Button
                        variant="solid"
                        loading={sending}
                        disabled={!email}
                        onClick={handleSendInvite}
                    >
                        Send Invite
                    </Button>
                </div>
            </Card>

            <Card className={SURFACE_CARD_CLASSNAME}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-2">Email</th>
                                <th className="text-left py-2">Role</th>
                                <th className="text-left py-2">Status</th>
                                <th className="text-left py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td className="py-3" colSpan={4}>
                                        Loading invites...
                                    </td>
                                </tr>
                            ) : invites.length === 0 ? (
                                <tr>
                                    <td className="py-3" colSpan={4}>
                                        No pending invites
                                    </td>
                                </tr>
                            ) : (
                                invites.map((invite) => (
                                    <tr
                                        key={invite.invite_id}
                                        className="border-b border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="py-3">{invite.email}</td>
                                        <td className="py-3">{invite.role}</td>
                                        <td className="py-3">
                                            {invite.status || 'pending'}
                                        </td>
                                        <td className="py-3">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleRevoke(invite.invite_id)
                                                }
                                            >
                                                Revoke
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </Container>
    )
}

export default InviteManagement
