import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Dialog,
    Notification,
    Select,
    Spinner,
    toast,
} from '@/components/ui'
import {
    apiAssignCompanyMember,
    apiGetSalesDivisions,
} from '@/services/SalesCompanyService'
import type { SalesDivisionResponse } from '@/services/SalesCompanyService'
import {
    apiGetCompanyTeamsBySalesCompany,
    type CompanyTeamListItem,
} from '@/services/TeamService'
import type { CompanyMemberRow } from '../types'

type SelectOption = { value: string; label: string }

type AssignTeamDialogProps = {
    isOpen: boolean
    member: CompanyMemberRow | null
    salesCompanyId: string | null
    onClose: () => void
    onSuccess: () => void
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
    return rawDetail || e?.message || 'Failed to assign member.'
}

const AssignTeamDialog = ({
    isOpen,
    member,
    salesCompanyId,
    onClose,
    onSuccess,
}: AssignTeamDialogProps) => {
    const [divisions, setDivisions] = useState<SalesDivisionResponse[]>([])
    const [teams, setTeams] = useState<CompanyTeamListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(
        null,
    )
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

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
        if (!isOpen) return
        setSelectedDivisionId(member?.sales_division_id ?? null)
        setSelectedTeamId(member?.team_id ?? null)
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

    const noDivisions = !loading && divisions.length === 0

    const isUnchanged = useMemo(() => {
        if (!member) return false
        if (selectedTeamId) {
            return member.team_id === selectedTeamId
        }
        if (selectedDivisionId) {
            return (
                !member.team_id &&
                member.sales_division_id === selectedDivisionId
            )
        }
        return false
    }, [member, selectedDivisionId, selectedTeamId])

    const canSave =
        !!(selectedDivisionId || selectedTeamId) &&
        !isUnchanged &&
        !saving &&
        !loading

    const handleSave = async () => {
        if (!member || !salesCompanyId) return
        if (!selectedTeamId && !selectedDivisionId) return

        setSaving(true)
        try {
            const payload = selectedTeamId
                ? { company_team_id: selectedTeamId }
                : { sales_division_id: selectedDivisionId }

            await apiAssignCompanyMember(
                salesCompanyId,
                member.user_id,
                payload,
            )

            const divisionName =
                divisions.find((d) => d.sales_division_id === selectedDivisionId)
                    ?.name ?? 'division'
            const teamName = selectedTeamId
                ? teams.find((t) => t.company_team_id === selectedTeamId)?.name
                : null

            toast.push(
                <Notification title="Success" type="success">
                    {teamName
                        ? `${member.first_name} ${member.last_name} assigned to ${teamName}.`
                        : `${member.first_name} ${member.last_name} assigned to ${divisionName}.`}
                </Notification>,
            )
            onSuccess()
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
    const hasDivision = !!(member.sales_division_id || member.sales_division_name)
    const heading = member.team_id
        ? 'Change team / division'
        : hasDivision
          ? 'Assign to team'
          : 'Assign to division'

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <div>
                <h4 className="mb-1 text-2xl font-bold">{heading}</h4>
                <p className="text-gray-500 mb-4">
                    {fullName} ({member.email})
                </p>

                {(member.team_name || member.sales_division_name) && (
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Currently assigned to{' '}
                        {member.team_name ? (
                            <>
                                team{' '}
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {member.team_name}
                                </span>
                                {member.sales_division_name
                                    ? ` (${member.sales_division_name})`
                                    : ''}
                            </>
                        ) : (
                            <>
                                division{' '}
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {member.sales_division_name}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spinner size={36} />
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-500 py-4">{error}</p>
                ) : noDivisions ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm text-amber-700 dark:text-amber-300 my-2">
                        No sales divisions exist yet. Create a sales division
                        before assigning members.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
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
                                        No teams in this division. You can assign
                                        the member to the division only.
                                    </p>
                                )}
                            {isUnchanged && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Member is already assigned to this
                                    {selectedTeamId ? ' team' : ' division'}.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="plain"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        loading={saving}
                        disabled={!canSave}
                        onClick={handleSave}
                    >
                        {member.team_id
                            ? 'Move member'
                            : hasDivision
                              ? 'Assign'
                              : 'Assign division'}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default AssignTeamDialog
