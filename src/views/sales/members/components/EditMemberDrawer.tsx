import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { Notification, Switcher, toast } from '@/components/ui'
import Avatar from '@/components/ui/Avatar'
import Skeleton from '@/components/ui/Skeleton'
import Tooltip from '@/components/ui/Tooltip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    EntityPicker,
    Field,
    FormDrawer,
    FormSection,
    InlineNotice,
    MetaTag,
    MetaTagList,
    OptionCard,
    OptionCardGroup,
} from '@/components/shared/form'
import type { EntityOption } from '@/components/shared/form'
import classNames from '@/utils/classNames'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { fetchSalesDivisions } from '@/store/slices/salesDivisions'
import { fetchTeams } from '@/store/slices/teams'
import {
    apiAssignCompanyMember,
    type CompanyMemberAssignmentUpdate,
    type SalesDivisionResponse,
} from '@/services/SalesCompanyService'
import type { CompanyTeamListItem } from '@/services/TeamService'
import { TbBriefcase, TbUser } from 'react-icons/tb'
import {
    ASSIGNABLE_MEMBER_ROLES,
    canChangeMemberRole,
    formatMemberRoleLabel,
    getMemberRoleName,
    isMemberRoleEditable,
    type AssignableMemberRole,
} from '../memberRoleAccess'
import {
    getMemberEditDivisionIds,
    getMemberEditTeamIds,
    mapCompanyMember,
    memberDivisionIdsChanged,
    memberTeamIdsChanged,
    type CompanyMemberRow,
} from '../types'

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

const ROLE_DESCRIPTIONS: Record<AssignableMemberRole, string> = {
    sales_person: 'Runs assigned scenarios.',
    sales_manager: 'Also creates scenarios and manages teams.',
}

const ROLE_ICONS: Record<AssignableMemberRole, ReactElement> = {
    sales_person: <TbUser />,
    sales_manager: <TbBriefcase />,
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

const getInitials = (first: string, last: string) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

/** Division panel with its own team checkboxes — teams only exist in a division. */
const DivisionTeamsCard = ({
    division,
    teams,
    selectedTeamIds,
    isPrimary,
    onToggleTeam,
}: {
    division: SalesDivisionResponse
    teams: CompanyTeamListItem[]
    selectedTeamIds: string[]
    isPrimary: boolean
    onToggleTeam: (teamId: string) => void
}) => {
    const segmentName = division.customer_segment?.name?.trim()
    const productNames = (division.products ?? [])
        .map((product) => product.name?.trim())
        .filter((name): name is string => Boolean(name))
    const selectedCount = teams.filter((team) =>
        selectedTeamIds.includes(team.company_team_id),
    ).length

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-800/40">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {division.name}
                        </p>
                        {isPrimary ? (
                            <Tooltip title="Practice sessions use this division's segment and products.">
                                <span>
                                    <MetaTag tone="primary">Primary</MetaTag>
                                </span>
                            </Tooltip>
                        ) : null}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {segmentName ? (
                            <MetaTag tone="segment">{segmentName}</MetaTag>
                        ) : null}
                        <MetaTagList
                            items={productNames}
                            tone="product"
                            max={3}
                            emptyLabel="No products"
                        />
                    </div>
                </div>
                {teams.length ? (
                    <span className="shrink-0 text-[11px] tabular-nums text-gray-500 dark:text-gray-400">
                        {selectedCount}/{teams.length} teams
                    </span>
                ) : null}
            </div>

            <div className="mt-3">
                {teams.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                        No teams yet — the member still gets division access.
                    </p>
                ) : (
                    <OptionCardGroup
                        label={`Teams in ${division.name}`}
                        columns={teams.length > 1 ? 2 : 1}
                    >
                        {teams.map((team) => (
                            <OptionCard
                                key={team.company_team_id}
                                type="checkbox"
                                value={team.company_team_id}
                                title={team.name}
                                selected={selectedTeamIds.includes(
                                    team.company_team_id,
                                )}
                                onSelect={onToggleTeam}
                            />
                        ))}
                    </OptionCardGroup>
                )}
            </div>
        </div>
    )
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
    const dispatch = useAppDispatch()
    const {
        divisionsData,
        divisionsInitialized,
        divisionsLoading,
        divisionsError,
    } = useAppSelector((state) => ({
        divisionsData: state.salesDivisions?.data?.divisionsData ?? [],
        divisionsInitialized: state.salesDivisions?.data?.initialized ?? false,
        divisionsLoading: state.salesDivisions?.data?.divisionsLoading ?? false,
        divisionsError: state.salesDivisions?.data?.error ?? null,
    }))
    const { teamsData, teamsInitialized, teamsLoading, teamsError } =
        useAppSelector((state) => ({
            teamsData: state.teams?.data?.teamsData ?? [],
            teamsInitialized: state.teams?.data?.initialized ?? false,
            teamsLoading: state.teams?.data?.teamsLoading ?? false,
            teamsError: state.teams?.data?.error ?? null,
        }))

    const divisions = divisionsData as SalesDivisionResponse[]
    const teams = useMemo<CompanyTeamListItem[]>(
        () =>
            teamsData.map((team) => ({
                company_team_id: team.company_team_id,
                name: team.name,
                sales_company_id: team.sales_company_id,
                sales_division_id: team.sales_division_id,
                sales_division_name: team.sales_division_name,
                manager_id: team.manager_id,
            })),
        [teamsData],
    )

    const [saving, setSaving] = useState(false)
    const prefilledMemberIdRef = useRef<string | null>(null)

    const [statusActive, setStatusActive] = useState(true)
    const [selectedDivisionIds, setSelectedDivisionIds] = useState<string[]>([])
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
    const [selectedRole, setSelectedRole] = useState<AssignableMemberRole | null>(
        null,
    )
    const [divisionChangeConfirmOpen, setDivisionChangeConfirmOpen] =
        useState(false)

    const referenceLoading =
        (!divisionsInitialized && divisionsLoading) ||
        (!teamsInitialized && teamsLoading)
    const referenceError = divisionsError || teamsError

    const canChangeRole = canChangeMemberRole(
        currentUserRole,
        currentUserId,
        companyManagerId,
    )
    const roleEditable = member
        ? isMemberRoleEditable(member, companyManagerId, currentUserId, canChangeRole)
        : false

    const applyMemberToForm = useCallback(
        (nextMember: CompanyMemberRow) => {
            setStatusActive(nextMember.status_active)
            setSelectedDivisionIds(getMemberEditDivisionIds(nextMember))
            setSelectedTeamIds(getMemberEditTeamIds(nextMember, teams))
            setDivisionChangeConfirmOpen(false)
            const roleName = getMemberRoleName(nextMember)
            setSelectedRole(
                roleName === 'sales_person' || roleName === 'sales_manager'
                    ? roleName
                    : null,
            )
        },
        [teams],
    )

    useEffect(() => {
        if (!isOpen || !salesCompanyId) return
        if (!divisionsInitialized && !divisionsLoading) {
            dispatch(fetchSalesDivisions(salesCompanyId))
        }
        if (!teamsInitialized && !teamsLoading) {
            dispatch(fetchTeams(salesCompanyId))
        }
    }, [
        dispatch,
        isOpen,
        salesCompanyId,
        divisionsInitialized,
        divisionsLoading,
        teamsInitialized,
        teamsLoading,
    ])

    useEffect(() => {
        if (!isOpen) {
            prefilledMemberIdRef.current = null
            return
        }
        if (!member || !divisionsInitialized || !teamsInitialized) return
        if (prefilledMemberIdRef.current === member.user_id) return

        applyMemberToForm(member)
        prefilledMemberIdRef.current = member.user_id
    }, [isOpen, member, divisionsInitialized, teamsInitialized, applyMemberToForm])

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

    const sortedDivisions = useMemo(
        () =>
            [...divisions].sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
            ),
        [divisions],
    )

    const divisionOptions: EntityOption[] = useMemo(
        () =>
            sortedDivisions.map((division) => {
                const divisionId = String(division.sales_division_id).trim()
                const teamCount = teamsByDivisionId.get(divisionId)?.length ?? 0
                const segmentName = division.customer_segment?.name?.trim()
                const productNames = (division.products ?? [])
                    .map((product) => product.name?.trim())
                    .filter((name): name is string => Boolean(name))

                return {
                    value: divisionId,
                    label: division.name,
                    description: `${teamCount} team${teamCount === 1 ? '' : 's'}`,
                    keywords: [segmentName, ...productNames].filter(
                        (value): value is string => Boolean(value),
                    ),
                    meta: (
                        <span className="flex flex-wrap items-center gap-1">
                            {segmentName ? (
                                <MetaTag tone="segment">{segmentName}</MetaTag>
                            ) : null}
                            <MetaTagList
                                items={productNames}
                                tone="product"
                                max={2}
                            />
                        </span>
                    ),
                }
            }),
        [sortedDivisions, teamsByDivisionId],
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
    }, [selectedDivisionIds, teamlessSelectedDivisionIds, member?.sales_division_id])

    const toggleDivision = (divisionId: string) => {
        const nextIds = selectedDivisionIds.includes(divisionId)
            ? selectedDivisionIds.filter((id) => id !== divisionId)
            : [...selectedDivisionIds, divisionId]
        const allowed = new Set(nextIds)

        setSelectedDivisionIds(nextIds)
        // Teams belong to a division — dropping the division drops its teams.
        setSelectedTeamIds((prev) =>
            prev.filter((teamId) => {
                const team = teams.find((t) => t.company_team_id === teamId)
                const teamDivisionId = String(team?.sales_division_id ?? '').trim()
                return Boolean(teamDivisionId) && allowed.has(teamDivisionId)
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

    const roleChanged = Boolean(
        member &&
            roleEditable &&
            selectedRole &&
            selectedRole !== getMemberRoleName(member),
    )
    const statusChanged = Boolean(member && statusActive !== member.status_active)
    const divisionsChanged = Boolean(
        member && memberDivisionIdsChanged(member, selectedDivisionIds),
    )
    const primaryChanged = Boolean(
        member && resolvedSessionDivisionId !== (member.sales_division_id ?? null),
    )
    const teamsChanged = Boolean(
        member && memberTeamIdsChanged(member, selectedTeamIds, teams),
    )

    /** Human-readable list of pending edits, shown in the footer. */
    const changeSummary = useMemo(() => {
        const changes: string[] = []
        if (roleChanged) changes.push('role')
        if (divisionsChanged || primaryChanged) changes.push('divisions')
        if (teamsChanged) changes.push('teams')
        if (statusChanged) changes.push('status')
        return changes
    }, [roleChanged, divisionsChanged, primaryChanged, teamsChanged, statusChanged])

    const isDirty = changeSummary.length > 0
    const canSave = isDirty && !saving && !referenceLoading

    const previousDivisionId = member?.sales_division_id ?? null
    // Warn only when the previous primary is removed from the member entirely.
    const isDivisionChanged =
        !!member &&
        !!previousDivisionId &&
        resolvedSessionDivisionId !== previousDivisionId &&
        !selectedDivisionIds.includes(previousDivisionId)

    const buildPayload = (): CompanyMemberAssignmentUpdate | null => {
        if (!member) return null

        const assignmentChanged = teamsChanged || divisionsChanged || primaryChanged
        if (!assignmentChanged && !statusChanged && !roleChanged) return null

        // Backend expects the full assignment snapshot on save — always send
        // sales_division_ids and company_team_ids together, not one without the other.
        const payload: CompanyMemberAssignmentUpdate = {
            sales_division_ids: selectedDivisionIds,
            company_team_ids: selectedTeamIds,
            sales_division_id: resolvedSessionDivisionId,
        }

        if (statusChanged) {
            payload.status_active = statusActive
        }
        if (roleChanged && selectedRole) {
            payload.role = selectedRole
        }

        return payload
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
        if (!member || !salesCompanyId || !canSave || !buildPayload()) return

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
    const noDivisions = !referenceLoading && divisions.length === 0
    const currentRoleLabel = formatMemberRoleLabel(getMemberRoleName(member))

    const identity = (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-gray-800/40">
            <Avatar
                shape="circle"
                size={40}
                className="shrink-0 bg-primary/15 font-semibold text-primary"
            >
                {getInitials(member.first_name, member.last_name)}
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {fullName}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {member.email}
                </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
                <MetaTag tone="neutral">{currentRoleLabel}</MetaTag>
                <span
                    className={classNames(
                        'text-[11px] font-medium',
                        member.status_active
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-400',
                    )}
                >
                    {member.status_active ? 'Active' : 'Inactive'}
                </span>
            </div>
        </div>
    )

    const footerSummary = referenceLoading ? (
        'Loading divisions and teams…'
    ) : isDirty ? (
        <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Unsaved: {changeSummary.join(', ')}
        </span>
    ) : (
        <span className="hidden sm:inline">
            Press <kbd className="rounded border border-gray-300 px-1 dark:border-white/20">⌘</kbd>
            <kbd className="rounded border border-gray-300 px-1 dark:border-white/20">↵</kbd> to save
        </span>
    )

    return (
        <>
            <FormDrawer
                isOpen={isOpen}
                width={520}
                title="Edit member"
                description="Access, teams and account status."
                headerSlot={identity}
                submitLabel="Save changes"
                submitDisabled={!canSave}
                submitting={saving}
                isDirty={isDirty}
                discardMessage={`Changes to ${fullName} will be lost.`}
                footerSlot={footerSummary}
                onSubmit={handleSaveClick}
                onClose={onClose}
            >
                {referenceLoading ? (
                    <div className="space-y-4">
                        <Skeleton height={18} width="30%" />
                        <Skeleton height={72} />
                        <Skeleton height={18} width="40%" />
                        <Skeleton height={140} />
                    </div>
                ) : referenceError ? (
                    <InlineNotice tone="danger" title="Couldn't load assignments">
                        {referenceError}
                    </InlineNotice>
                ) : (
                    <div className="space-y-6">
                        {canChangeRole ? (
                            <FormSection
                                title="Role"
                            >
                                {roleEditable ? (
                                    <OptionCardGroup label="Member role">
                                        {ASSIGNABLE_MEMBER_ROLES.map((role) => (
                                            <OptionCard
                                                key={role.value}
                                                name="member-role"
                                                value={role.value}
                                                icon={ROLE_ICONS[role.value]}
                                                title={role.label}
                                                description={
                                                    ROLE_DESCRIPTIONS[role.value]
                                                }
                                                selected={selectedRole === role.value}
                                                onSelect={(value) =>
                                                    setSelectedRole(
                                                        value as AssignableMemberRole,
                                                    )
                                                }
                                            />
                                        ))}
                                    </OptionCardGroup>
                                ) : (
                                    <InlineNotice tone="info">
                                        <span className="font-medium">
                                            {currentRoleLabel}
                                        </span>{' '}
                                        — this role can&apos;t be changed here.
                                        Owner and self-assigned roles are managed
                                        by your workspace administrator.
                                    </InlineNotice>
                                )}
                            </FormSection>
                        ) : null}

                        <FormSection
                            title="Divisions & teams"
                            description="What this member can train on."
                            divided={canChangeRole}
                        >
                            {noDivisions ? (
                                <InlineNotice
                                    tone="warning"
                                    title="No sales divisions yet"
                                >
                                    Create a division first.
                                </InlineNotice>
                            ) : (
                                <>
                                    <Field
                                        label="Divisions"
                                        hint={`${selectedDivisionIds.length} selected`}
                                    >
                                        <EntityPicker
                                            multiple
                                            options={divisionOptions}
                                            selectedIds={selectedDivisionIds}
                                            searchPlaceholder="Search divisions…"
                                            maxHeight={260}
                                            onSelect={toggleDivision}
                                        />
                                    </Field>

                                    {selectedDivisions.length === 0 ? (
                                        <InlineNotice tone="info">
                                            Without a division this member
                                            can&apos;t be assigned scenarios.
                                        </InlineNotice>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Team membership
                                                </p>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                                    {selectedTeamIds.length} team
                                                    {selectedTeamIds.length === 1
                                                        ? ''
                                                        : 's'}{' '}
                                                    selected
                                                </p>
                                            </div>
                                            {selectedDivisions.map((division) => {
                                                const divisionId = String(
                                                    division.sales_division_id,
                                                ).trim()
                                                return (
                                                    <DivisionTeamsCard
                                                        key={divisionId}
                                                        division={division}
                                                        teams={
                                                            teamsByDivisionId.get(
                                                                divisionId,
                                                            ) ?? []
                                                        }
                                                        selectedTeamIds={
                                                            selectedTeamIds
                                                        }
                                                        isPrimary={
                                                            divisionId ===
                                                            resolvedSessionDivisionId
                                                        }
                                                        onToggleTeam={toggleTeam}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </FormSection>

                        <FormSection
                            title="Account status"
                            divided
                        >
                            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-800/40">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {statusActive
                                            ? 'Active'
                                            : 'Inactive'}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                        {statusActive
                                            ? 'Can sign in and train.'
                                            : "Can't sign in."}
                                    </p>
                                </div>
                                <Switcher
                                    checked={statusActive}
                                    aria-label="Member is active"
                                    onChange={(checked) => setStatusActive(checked)}
                                />
                            </div>
                            {statusChanged && !statusActive ? (
                                <InlineNotice tone="warning">
                                    {fullName} will lose access as soon as you
                                    save.
                                </InlineNotice>
                            ) : null}
                        </FormSection>
                    </div>
                )}
            </FormDrawer>

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
