import { useEffect, useMemo, useState, type ComponentProps } from 'react'
import {
    Button,
    Drawer,
    Input,
    Notification,
    Select,
    Spinner,
    Switcher,
    Tag,
    toast,
} from '@/components/ui'
import { Option as SelectOptionComponent } from '@/components/ui/Select'
import classNames from '@/utils/classNames'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
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
import {
    getMemberDivisionIds,
    getMemberTeamIds,
    mapCompanyMember,
    memberDivisionIdsChanged,
    memberTeamIdsChanged,
    type CompanyMemberRow,
} from '../types'

type SelectOption = { value: string; label: string }
type DivisionOption = SelectOption & {
    segmentName?: string
    productNames?: string[]
}

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
    const [selectedDivisionIds, setSelectedDivisionIds] = useState<string[]>([])
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
    const [selectedRole, setSelectedRole] = useState<AssignableMemberRole | null>(null)
    const [divisionChangeConfirmOpen, setDivisionChangeConfirmOpen] = useState(false)

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
        setSelectedDivisionIds(getMemberDivisionIds(member))
        setSelectedTeamIds(getMemberTeamIds(member))
        setDivisionChangeConfirmOpen(false)
        const roleName = getMemberRoleName(member)
        setSelectedRole(
            roleName === 'sales_person' || roleName === 'sales_manager'
                ? roleName
                : null,
        )
    }, [isOpen, member])

    const teamsByDivisionId = useMemo(() => {
        const map = new Map<string, CompanyTeamListItem[]>()
        for (const team of teams) {
            const divisionId = String(team.sales_division_id ?? '').trim()
            if (!divisionId) continue
            const list = map.get(divisionId) ?? []
            list.push(team)
            map.set(divisionId, list)
        }
        return map
    }, [teams])

    const divisionOptions: DivisionOption[] = useMemo(
        () =>
            [...divisions]
                .sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                        sensitivity: 'base',
                    }),
                )
                .map((d) => ({
                    value: String(d.sales_division_id).trim(),
                label: d.name,
                    segmentName: d.customer_segment?.name?.trim() || undefined,
                    productNames: (d.products ?? [])
                        .map((p) => p.name?.trim())
                        .filter((name): name is string => Boolean(name)),
            })),
        [divisions],
    )

    const selectedDivisions = useMemo(() => {
        const byId = new Map(
            divisions.map((d) => [String(d.sales_division_id).trim(), d]),
        )
        return selectedDivisionIds
            .map((id) => byId.get(id))
            .filter((d): d is SalesDivisionResponse => Boolean(d))
            .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
            )
    }, [divisions, selectedDivisionIds])

    const roleOptions: SelectOption[] = useMemo(
        () =>
            ASSIGNABLE_MEMBER_ROLES.map((r) => ({
                value: r.value,
                label: r.label,
            })),
        [],
    )

    /** Selected divisions that currently have no team chips selected. */
    const teamlessSelectedDivisionIds = useMemo(() => {
        return selectedDivisionIds.filter((divisionId) => {
            const divisionTeams = teams.filter(
                (t) => String(t.sales_division_id ?? '').trim() === divisionId,
            )
            if (divisionTeams.length === 0) return true
            return !divisionTeams.some((t) =>
                selectedTeamIds.includes(t.company_team_id),
            )
        })
    }, [selectedDivisionIds, selectedTeamIds, teams])

    /**
     * Session / primary division for the API. Divisions without team memberships
     * only persist when they are set as sales_division_id — so prefer a teamless
     * selected division when present, otherwise keep the previous primary.
     */
    const resolvedSessionDivisionId = useMemo(() => {
        if (!selectedDivisionIds.length) return null
        const previous = member?.sales_division_id?.trim() || null

        if (teamlessSelectedDivisionIds.length > 0) {
            if (previous && teamlessSelectedDivisionIds.includes(previous)) {
                return previous
            }
            return teamlessSelectedDivisionIds[0]
        }

        if (previous && selectedDivisionIds.includes(previous)) return previous
        return selectedDivisionIds[0]
    }, [
        selectedDivisionIds,
        teamlessSelectedDivisionIds,
        member?.sales_division_id,
    ])

    const handleDivisionChange = (options: readonly DivisionOption[] | null) => {
        const nextIds = (options ?? []).map((o) => String(o.value).trim())
        const allowed = new Set(nextIds)
        setSelectedDivisionIds(nextIds)
        setSelectedTeamIds((prev) =>
            prev.filter((teamId) => {
                const team = teams.find((t) => t.company_team_id === teamId)
                const divisionId = String(team?.sales_division_id ?? '').trim()
                return Boolean(divisionId) && allowed.has(divisionId)
            }),
        )
    }

    const toggleTeam = (teamId: string) => {
        setSelectedTeamIds((prev) =>
            prev.includes(teamId)
                ? prev.filter((id) => id !== teamId)
                : [...prev, teamId],
        )
    }

    const isDirty = useMemo(() => {
        if (!member) return false
        const roleChanged =
            roleEditable &&
            selectedRole &&
            selectedRole !== getMemberRoleName(member)
        return (
            statusActive !== member.status_active ||
            memberDivisionIdsChanged(member, selectedDivisionIds) ||
            resolvedSessionDivisionId !== (member.sales_division_id ?? null) ||
            memberTeamIdsChanged(member, selectedTeamIds) ||
            roleChanged
        )
    }, [
        member,
        statusActive,
        selectedDivisionIds,
        resolvedSessionDivisionId,
        selectedTeamIds,
        selectedRole,
        roleEditable,
    ])

    const canSave = isDirty && !saving && !loading

    const previousDivisionId = member?.sales_division_id ?? null
    // Warn only when the previous primary is removed from the member entirely.
    const isDivisionChanged =
        !!member &&
        !!previousDivisionId &&
        resolvedSessionDivisionId !== previousDivisionId &&
        !selectedDivisionIds.includes(previousDivisionId)

    const buildPayload = (): CompanyMemberAssignmentUpdate | null => {
        if (!member) return null

        const payload: CompanyMemberAssignmentUpdate = {}
        const teamsChanged = memberTeamIdsChanged(member, selectedTeamIds)
        const divisionsChanged = memberDivisionIdsChanged(
            member,
            selectedDivisionIds,
        )
        const primaryChanged =
            resolvedSessionDivisionId !== (member.sales_division_id ?? null)

        if (statusActive !== member.status_active) {
            payload.status_active = statusActive
        }
        // Sync primary whenever teams/divisions change so a selected division
        // with no teams is kept via sales_division_id instead of being dropped.
        if (teamsChanged || divisionsChanged || primaryChanged) {
            payload.sales_division_id = resolvedSessionDivisionId
        }
        if (teamsChanged) {
            payload.company_team_ids = selectedTeamIds
        }
        if (
            roleEditable &&
            selectedRole &&
            selectedRole !== getMemberRoleName(member)
        ) {
            payload.role = selectedRole
        }

        return Object.keys(payload).length > 0 ? payload : null
    }

    const persistChanges = async () => {
        if (!member || !salesCompanyId) return

        const payload = buildPayload()
        if (!payload) return

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
            setDivisionChangeConfirmOpen(false)
        }
    }

    const handleSaveClick = () => {
        if (!member || !salesCompanyId || !buildPayload()) return

        if (isDivisionChanged) {
            setDivisionChangeConfirmOpen(true)
            return
        }

        void persistChanges()
    }

    const closeDivisionChangeConfirm = () => {
        if (saving) return
        setDivisionChangeConfirmOpen(false)
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
                onClick={handleSaveClick}
            >
                Save changes
            </Button>
        </div>
    )

    return (
        <>
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
            <div className="px-2 flex flex-col gap-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={36} />
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-500 py-4">{error}</p>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                        <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Status
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {statusActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                                <Switcher
                                    checked={statusActive}
                                    onChange={(checked) => setStatusActive(checked)}
                                />
                        </div>

                        {noDivisions ? (
                            <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
                                No sales divisions yet. Create one before assigning
                                members.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                                        Divisions
                                    </label>
                                    <Select<DivisionOption, true>
                                        isMulti
                                        isClearable
                                        closeMenuOnSelect={false}
                                        options={divisionOptions}
                                        value={divisionOptions.filter((o) =>
                                            selectedDivisionIds.includes(o.value),
                                        )}
                                        placeholder="Add divisions…"
                                        onChange={(options) =>
                                            handleDivisionChange(options)
                                        }
                                        components={{
                                            Option: (props) => (
                                                <SelectOptionComponent<DivisionOption>
                                                    {...(props as ComponentProps<
                                                        typeof SelectOptionComponent<DivisionOption>
                                                    >)}
                                                    customLabel={(data, label) => (
                                                        <div className="flex flex-col gap-1.5 py-1 min-w-0">
                                                            <span className="font-medium leading-tight">
                                                                {label}
                                                            </span>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                    Customer segment
                                                                </span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {data.segmentName ? (
                                                                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                                                            {data.segmentName}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                            Not set
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                    Products
                                                                </span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {(data.productNames
                                                                        ?.length
                                                                        ? data.productNames
                                                                        : []
                                                                    ).map((name) => (
                                                                        <span
                                                                            key={name}
                                                                            className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary dark:bg-primary/20 dark:text-primary-mild"
                                                                        >
                                                                            {name}
                                                                        </span>
                                                                    ))}
                                                                    {!data.productNames
                                                                        ?.length ? (
                                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                            None assigned
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            ),
                                        }}
                                    />
                                </div>

                                {selectedDivisions.length > 0 && (
                                <div>
                                        <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                                            Teams
                                        </label>
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
                                            {selectedDivisions.map((division) => {
                                                const divisionId = String(
                                                    division.sales_division_id,
                                                ).trim()
                                                const divisionTeams =
                                                    teamsByDivisionId.get(
                                                        divisionId,
                                                    ) ?? []
                                                const segmentName =
                                                    division.customer_segment?.name?.trim()
                                                const products =
                                                    division.products ?? []

                                                return (
                                                    <div
                                                        key={divisionId}
                                                        className="px-3 py-2.5 bg-white dark:bg-gray-800/50"
                                                    >
                                                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                            {division.name}
                                                        </p>
                                                        <div className="space-y-2 mb-2.5">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                                                    Customer segment
                                                                </span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {segmentName ? (
                                                                        <Tag className="rounded-full border-0 bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                                            {segmentName}
                                                                        </Tag>
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                            Not set
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                                                    Products
                                                                </span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {products.length >
                                                                    0 ? (
                                                                        products.map(
                                                                            (product) => (
                                                                                <Tag
                                                                                    key={
                                                                                        product.product_id ||
                                                                                        product.name
                                                                                    }
                                                                                    className="rounded-full border-0 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary dark:bg-primary/20 dark:text-primary-mild"
                                                                                >
                                                                                    {
                                                                                        product.name
                                                                                    }
                                                                                </Tag>
                                                                            ),
                                                                        )
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                            None assigned
                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                                                Teams
                                                            </p>
                                                            {divisionTeams.length ===
                                                            0 ? (
                                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                    No teams
                                                                </p>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {divisionTeams.map(
                                                                        (team) => {
                                                                            const active =
                                                                                selectedTeamIds.includes(
                                                                                    team.company_team_id,
                                                                                )
                                                                            return (
                                                                                <button
                                                                                    key={
                                                                                        team.company_team_id
                                                                                    }
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        toggleTeam(
                                                                                            team.company_team_id,
                                                                                        )
                                                                                    }
                                                                                    className={classNames(
                                                                                        'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                                                                                        active
                                                                                            ? 'border-primary bg-primary text-neutral'
                                                                                            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary/40',
                                                                                    )}
                                                                                >
                                                                                    {
                                                                                        team.name
                                                                                    }
                                                                                </button>
                                                                            )
                                                                        },
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                        )}
                                </div>
                        )}

                        {canChangeRole && (
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
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
                                        <Input
                                            type="text"
                                            readOnly
                                            value={formatMemberRoleLabel(
                                                getMemberRoleName(member),
                                            )}
                                        className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-default"
                                        />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Drawer>

        <ConfirmDialog
            isOpen={divisionChangeConfirmOpen}
            type="warning"
            title="Update division assignment?"
            confirmText="Continue"
            cancelText="Cancel"
            onClose={closeDivisionChangeConfirm}
            onRequestClose={closeDivisionChangeConfirm}
            onCancel={closeDivisionChangeConfirm}
            onConfirm={() => void persistChanges()}
            confirmButtonProps={{ loading: saving }}
        >
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Updating{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {fullName}
                </span>
                &apos;s division assignment may remove active and pending
                scenarios for this user. This cannot be undone.
            </p>
        </ConfirmDialog>
        </>
    )
}

export default EditMemberDrawer
