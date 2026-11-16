import type {
    CompanyMemberResponse,
    CompanyMemberTeam,
} from '@/services/SalesCompanyService'

export type { CompanyMemberTeam }

export type MemberDivisionRef = {
    sales_division_id: string
    sales_division_name: string
}

export type CompanyMemberRow = {
    user_id: string
    first_name: string
    last_name: string
    email: string
    status_active: boolean
    role?: { name?: string }
    team_id?: string | null
    team_name?: string | null
    sales_division_id?: string | null
    sales_division_name?: string | null
    sales_division_ids?: string[]
    divisions?: MemberDivisionRef[]
    teams: CompanyMemberTeam[]
    credits_used: number
}

/** Prefer `teams[]`; fall back to legacy single team_id / team_name. */
export function getMemberTeamIds(member: {
    teams?: CompanyMemberTeam[]
    team_id?: string | null
}): string[] {
    if (member.teams?.length) {
        return member.teams
            .map((t) => t.team_id || t.company_team_id)
            .filter(Boolean) as string[]
    }
    return member.team_id ? [member.team_id] : []
}

export function formatMemberTeams(
    member: Pick<CompanyMemberRow, 'teams' | 'team_name'>,
): string {
    if (member.teams?.length) {
        return member.teams.map((t) => t.team_name).filter(Boolean).join(', ')
    }
    return member.team_name?.trim() || ''
}

export type MemberDivisionChip = {
    id: string
    name: string
    isPrimary: boolean
}

/** Direct division assignments for API payloads / roster direct list. */
export function getMemberDirectDivisionIds(
    member: Pick<
        CompanyMemberRow,
        'sales_division_ids' | 'divisions' | 'sales_division_id'
    >,
): string[] {
    if (member.sales_division_ids?.length) {
        return member.sales_division_ids
            .map((id) => id.trim())
            .filter(Boolean)
    }
    if (member.divisions?.length) {
        return member.divisions
            .map((d) => d.sales_division_id.trim())
            .filter(Boolean)
    }
    const primaryId = member.sales_division_id?.trim()
    return primaryId ? [primaryId] : []
}

/** Division ids to pre-fill the edit form (direct, else inferred from teams). */
export function getMemberEditDivisionIds(
    member: Pick<
        CompanyMemberRow,
        | 'sales_division_ids'
        | 'divisions'
        | 'sales_division_id'
        | 'teams'
    >,
): string[] {
    const direct = getMemberDirectDivisionIds(member)
    if (direct.length) return direct

    const fromTeams = (member.teams ?? [])
        .map((t) => t.sales_division_id?.trim())
        .filter(Boolean) as string[]
    return [...new Set(fromTeams)]
}

/** Map member team ids to company_team_id values used by the teams picker. */
export function getMemberEditTeamIds(
    member: Parameters<typeof getMemberTeamIds>[0],
    companyTeams: Array<{ company_team_id: string; team_id?: string }>,
): string[] {
    const memberTeamIds = getMemberTeamIds(member)
    if (!memberTeamIds.length) return []

    return memberTeamIds.map((id) => {
        const match = companyTeams.find(
            (t) => t.company_team_id === id || t.team_id === id,
        )
        return match?.company_team_id ?? id
    })
}

/** All division ids the member can access (direct + via teams). */
export function getMemberDivisionIds(
    member: Pick<
        CompanyMemberRow,
        | 'sales_division_ids'
        | 'divisions'
        | 'sales_division_id'
        | 'teams'
    >,
): string[] {
    const ids = new Set(getMemberDirectDivisionIds(member))
    for (const team of member.teams ?? []) {
        const id = team.sales_division_id?.trim()
        if (id) ids.add(id)
    }
    return [...ids]
}

/** Unique divisions for roster display (direct + teams), with primary flagged. */
export function getMemberDivisions(
    member: Pick<
        CompanyMemberRow,
        | 'teams'
        | 'sales_division_id'
        | 'sales_division_name'
        | 'sales_division_ids'
        | 'divisions'
    >,
): MemberDivisionChip[] {
    const byId = new Map<string, MemberDivisionChip>()
    const primaryId = member.sales_division_id?.trim()

    for (const division of member.divisions ?? []) {
        const id = division.sales_division_id?.trim()
        const name = division.sales_division_name?.trim()
        if (!id || !name) continue
        byId.set(id, { id, name, isPrimary: id === primaryId })
    }

    if (!byId.size) {
        for (const id of getMemberDirectDivisionIds(member)) {
            const name =
                id === primaryId
                    ? member.sales_division_name?.trim() || id
                    : id
            byId.set(id, { id, name, isPrimary: id === primaryId })
        }
    }

    for (const team of member.teams ?? []) {
        const id = team.sales_division_id?.trim()
        const name = team.sales_division_name?.trim()
        if (!id || !name) continue
        const existing = byId.get(id)
        if (existing) {
            if (id === primaryId) existing.isPrimary = true
        } else {
            byId.set(id, { id, name, isPrimary: id === primaryId })
        }
    }

    if (primaryId && member.sales_division_name?.trim()) {
        const existing = byId.get(primaryId)
        if (existing) {
            existing.isPrimary = true
        } else {
            byId.set(primaryId, {
                id: primaryId,
                name: member.sales_division_name.trim(),
                isPrimary: true,
            })
        }
    }

    return [...byId.values()].sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
        return a.name.localeCompare(b.name)
    })
}

export function formatMemberDivisions(
    member: Pick<
        CompanyMemberRow,
        | 'teams'
        | 'sales_division_id'
        | 'sales_division_name'
        | 'sales_division_ids'
        | 'divisions'
    >,
): string {
    return getMemberDivisions(member)
        .map((d) => d.name)
        .join(', ')
}

function sameIds(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((id, i) => id === sortedB[i])
}

export function memberTeamIdsChanged(
    member: Parameters<typeof getMemberTeamIds>[0],
    selectedTeamIds: string[],
    companyTeams?: Array<{ company_team_id: string; team_id?: string }>,
): boolean {
    const baseline = companyTeams?.length
        ? getMemberEditTeamIds(member, companyTeams)
        : getMemberTeamIds(member)
    return !sameIds(baseline, selectedTeamIds)
}

export function memberDivisionIdsChanged(
    member: Parameters<typeof getMemberEditDivisionIds>[0],
    selectedDivisionIds: string[],
): boolean {
    return !sameIds(getMemberEditDivisionIds(member), selectedDivisionIds)
}

export function mapCompanyMember(member: CompanyMemberResponse): CompanyMemberRow {
    // Prefer API `teams[]`. If omitted (older/partial responses), synthesize from
    // legacy first-team fields so Redux roster state stays consistent.
    let teams = Array.isArray(member.teams) ? member.teams : []
    if (!teams.length && member.team_id) {
        teams = [
            {
                team_id: member.team_id,
                team_name: member.team_name ?? '',
                sales_division_id: member.sales_division_id ?? null,
                sales_division_name: member.sales_division_name ?? null,
            },
        ]
    }

    return {
        user_id: member.user_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        status_active: member.status_active,
        role: member.role,
        team_id: member.team_id ?? teams[0]?.team_id ?? null,
        team_name: member.team_name ?? teams[0]?.team_name ?? null,
        sales_division_id: member.sales_division_id,
        sales_division_name: member.sales_division_name,
        sales_division_ids: member.sales_division_ids,
        divisions: member.divisions,
        teams,
        credits_used: Number(member.credits_used ?? 0),
    }
}
