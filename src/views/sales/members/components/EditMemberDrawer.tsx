import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Drawer,
    Input,
    Notification,
    Select,
    Spinner,
    Switcher,
    toast,
} from '@/components/ui'
import {
    apiAssignCompanyMember,
    apiGetSalesDivisions,
    type CompanyMemberAssignmentUpdate,
} from '@/services/SalesCompanyService'
import type { SalesDivisionResponse } from '@/services/SalesCompanyService'
import {
    apiGetCompanyTeamsBySalesCompany,
    type CompanyTeamListItem,
} from '@/services/TeamService'
import {
    ASSIGNABLE_MEMBER_ROLES,
    canChangeMemberRole,
    formatMemberRoleLabel,
    getMemberRoleName,
    isMemberRoleEditable,
    type AssignableMemberRole,
} from '../memberRoleAccess'
import { mapCompanyMember, type CompanyMemberRow } from '../types'

type SelectOption = { value: string; label: string }

type EditMemberDrawerProps = {
    isOpen: boolean
    member: CompanyMemberRow | null
    salesCompanyId: string | null
    companyManagerId: string | null
    currentUserId?: string
    currentUserRole?: string
    onClose: () => void
    onUpdated: (member: CompanyMemberRow) => void
}

const formatApiError = (err: unknown) => {
    const e = err as {
        response?: { data?: { detail?: string | { msg?: string }[] } }
        message?: string
    }
    const rawDetail = e?.response?.data?.detail
    if (Array.isArray(rawDetail)) {
        return rawDetail.map((item) => item.msg).filter(Boolean).join(', ')
    }
    return rawDetail || e?.message || 'Failed to update member.'
}

const EditMemberDrawer = ({
    isOpen,
    member,
    salesCompanyId,
    companyManagerId,
    currentUserId,
    currentUserRole,
    onClose,
    onUpdated,
}: EditMemberDrawerProps) => {
    const [divisions, setDivisions] = useState<SalesDivisionResponse[]>([])
    const [teams, setTeams] = useState<CompanyTeamListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [statusActive, setStatusActive] = useState(true)
    const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null)
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState<AssignableMemberRole | null>(null)

    const canChangeRole = canChangeMemberRole(
        currentUserRole,
        currentUserId,
        companyManagerId,
    )
    const roleEditable = member
        ? isMemberRoleEditable(member, companyManagerId, currentUserId, canChangeRole)
        : false

    useEffect(() => {
        if (!isOpen || !salesCompanyId) return

        let cancelled = false
        const loadData = async () => {
            setLoading(true)
            setError(null)
            try {
                const [divisionsData, teamsData] = await Promise.all([
                    apiGetSalesDivisions(salesCompanyId),
                    apiGetCompanyTeamsBySalesCompany(salesCompanyId),
                ])
                if (cancelled) return
                setDivisions(divisionsData ?? [])
                setTeams(teamsData ?? [])
            } catch (err) {
                if (cancelled) return
                console.error('Failed to load divisions/teams', err)
                setError('Failed to load divisions and teams.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadData()
        return () => {
            cancelled = true
        }
    }, [isOpen, salesCompanyId])

    useEffect(() => {
        if (!isOpen || !member) return
        setStatusActive(member.status_active)
        setSelectedDivisionId(member.sales_division_id ?? null)
        setSelectedTeamId(member.team_id ?? null)
        const roleName = getMemberRoleName(member)
        setSelectedRole(
            roleName === 'sales_person' || roleName === 'sales_manager'
                ? roleName
                : null,
        )
    }, [isOpen, member])

    const divisionOptions: SelectOption[] = useMemo(
        () =>
            divisions.map((d) => ({
                value: d.sales_division_id,
                label: d.name,
            })),
        [divisions],
    )

    const teamsInDivision = useMemo(
        () =>
            teams.filter(
                (t) => selectedDivisionId && t.sales_division_id === selectedDivisionId,
            ),
        [teams, selectedDivisionId],
    )

    const teamOptions: SelectOption[] = useMemo(
        () =>
            teamsInDivision.map((t) => ({
                value: t.company_team_id,
                label: t.name,
            })),
        [teamsInDivision],
    )

    const roleOptions: SelectOption[] = useMemo(
        () =>
            ASSIGNABLE_MEMBER_ROLES.map((r) => ({
                value: r.value,
                label: r.label,
            })),
        [],
    )

    const isDirty = useMemo(() => {
        if (!member) return false
        const roleChanged =
            roleEditable &&
            selectedRole &&
            selectedRole !== getMemberRoleName(member)
        return (
            statusActive !== member.status_active ||
            selectedDivisionId !== (member.sales_division_id ?? null) ||
            selectedTeamId !== (member.team_id ?? null) ||
            roleChanged
        )
    }, [
        member,
        statusActive,
        selectedDivisionId,
        selectedTeamId,
        selectedRole,
        roleEditable,
    ])

    const canSave = isDirty && !saving && !loading

    const handleSave = async () => {
        if (!member || !salesCompanyId) return

        const payload: CompanyMemberAssignmentUpdate = {}

        if (statusActive !== member.status_active) {
            payload.status_active = statusActive
        }
        if (selectedDivisionId !== (member.sales_division_id ?? null)) {
            payload.sales_division_id = selectedDivisionId
        }
        if (selectedTeamId !== (member.team_id ?? null)) {
            payload.company_team_id = selectedTeamId
        }
        if (
            roleEditable &&
            selectedRole &&
            selectedRole !== getMemberRoleName(member)
        ) {
            payload.role = selectedRole
        }

        if (Object.keys(payload).length === 0) return

        setSaving(true)
        try {
            const response = await apiAssignCompanyMember(
                salesCompanyId,
                member.user_id,
                payload,
            )
            const updated = mapCompanyMember(response)
            toast.push(
                <Notification title="Success" type="success">
                    {member.first_name} {member.last_name} updated successfully.
                </Notification>,
            )
            onUpdated(updated)
            onClose()
        } catch (err: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {formatApiError(err)}
                </Notification>,
            )
        } finally {
            setSaving(false)
        }
    }

    if (!member) return null

    const fullName = `${member.first_name} ${member.last_name}`.trim()
    const noDivisions = !loading && divisions.length === 0

    const drawerTitle = (
        <div>
            <h4 className="mb-1 text-lg font-bold">Edit member</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {fullName} · {member.email}
            </p>
        </div>
    )

    const drawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button
                size="sm"
                variant="default"
                className="flex-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200 dark:hover:!bg-gray-700"
                disabled={saving}
                onClick={onClose}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                loading={saving}
                disabled={!canSave}
                onClick={handleSave}
            >
                Save changes
            </Button>
        </div>
    )

    return (
        <Drawer
            title={drawerTitle}
            isOpen={isOpen}
            footer={drawerFooter}
            headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
            footerClass="!bg-gray-100 dark:!bg-gray-900 !p-3"
            bodyClass="!p-4 !bg-gray-100 dark:!bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClose={onClose}
            onRequestClose={onClose}
        >
            <div className="px-2 flex flex-col gap-5">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={36} />
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-500 py-4">{error}</p>
                ) : (
                    <>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Status
                            </label>
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {statusActive ? 'Active' : 'Inactive'}
                                </span>
                                <Switcher
                                    checked={statusActive}
                                    onChange={(checked) => setStatusActive(checked)}
                                />
                            </div>
                        </div>

                        {noDivisions ? (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm text-amber-700 dark:text-amber-300">
                                No sales divisions exist yet. Create a division
                                before assigning members.
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                        Sales division
                                    </label>
                                    <Select<SelectOption, false>
                                        options={divisionOptions}
                                        value={
                                            divisionOptions.find(
                                                (o) => o.value === selectedDivisionId,
                                            ) || null
                                        }
                                        placeholder="Select a division"
                                        onChange={(option) => {
                                            setSelectedDivisionId(option?.value ?? null)
                                            setSelectedTeamId(null)
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                        Team{' '}
                                        <span className="font-normal text-gray-500">
                                            (optional)
                                        </span>
                                    </label>
                                    <Select<SelectOption, false>
                                        isDisabled={!selectedDivisionId}
                                        isClearable
                                        options={teamOptions}
                                        value={
                                            teamOptions.find(
                                                (o) => o.value === selectedTeamId,
                                            ) || null
                                        }
                                        placeholder={
                                            selectedDivisionId
                                                ? 'Select a team (optional)'
                                                : 'Pick a division first'
                                        }
                                        onChange={(option) =>
                                            setSelectedTeamId(option?.value ?? null)
                                        }
                                    />
                                    {selectedDivisionId &&
                                        teamsInDivision.length === 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                No teams in this division.
                                            </p>
                                        )}
                                </div>
                            </>
                        )}

                        {canChangeRole && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Role
                                </label>
                                {roleEditable ? (
                                    <Select<SelectOption, false>
                                        options={roleOptions}
                                        value={
                                            roleOptions.find(
                                                (o) => o.value === selectedRole,
                                            ) || null
                                        }
                                        placeholder="Select role"
                                        onChange={(option) =>
                                            setSelectedRole(
                                                (option?.value as AssignableMemberRole) ??
                                                    null,
                                            )
                                        }
                                    />
                                ) : (
                                    <>
                                        <Input
                                            type="text"
                                            readOnly
                                            value={formatMemberRoleLabel(
                                                getMemberRoleName(member),
                                            )}
                                            className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 opacity-60 cursor-default"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Role cannot be changed for this member.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Drawer>
    )
}

export default EditMemberDrawer
