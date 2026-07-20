import type {
    CompanyMemberResponse,
    CompanyMemberTeam,
} from '@/services/SalesCompanyService'

export type { CompanyMemberTeam }

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
    teams: CompanyMemberTeam[]
    credits_used: number
}

/** Prefer `teams[]`; fall back to legacy single team_id / team_name. */
export function getMemberTeamIds(member: {
    teams?: CompanyMemberTeam[]
    team_id?: string | null
}): string[] {
    if (member.teams?.length) {
        return member.teams.map((t) => t.team_id).filter(Boolean)
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

/** Unique divisions from team memberships + primary (sessions) division. */
export function getMemberDivisions(
    member: Pick<
        CompanyMemberRow,
        'teams' | 'sales_division_id' | 'sales_division_name'
    >,
): MemberDivisionChip[] {
    const byId = new Map<string, MemberDivisionChip>()

    for (const team of member.teams ?? []) {
        const id = team.sales_division_id?.trim()
        const name = team.sales_division_name?.trim()
        if (!id || !name) continue
        if (!byId.has(id)) {
            byId.set(id, { id, name, isPrimary: false })
        }
    }

    const primaryId = member.sales_division_id?.trim()
    const primaryName = member.sales_division_name?.trim()
    if (primaryId && primaryName) {
        const existing = byId.get(primaryId)
        if (existing) {
            existing.isPrimary = true
        } else {
            byId.set(primaryId, {
                id: primaryId,
                name: primaryName,
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
        'teams' | 'sales_division_id' | 'sales_division_name'
    >,
): string {
    return getMemberDivisions(member)
        .map((d) => d.name)
        .join(', ')
}

export function getMemberDivisionIds(
    member: Pick<
        CompanyMemberRow,
        'teams' | 'sales_division_id'
    >,
): string[] {
    const ids = new Set<string>()
    for (const team of member.teams ?? []) {
        if (team.sales_division_id) ids.add(team.sales_division_id)
    }
    if (member.sales_division_id) ids.add(member.sales_division_id)
    return [...ids]
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
): boolean {
    return !sameIds(getMemberTeamIds(member), selectedTeamIds)
}

export function memberDivisionIdsChanged(
    member: Parameters<typeof getMemberDivisionIds>[0],
    selectedDivisionIds: string[],
): boolean {
    return !sameIds(getMemberDivisionIds(member), selectedDivisionIds)
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
        teams,
        credits_used: Number(member.credits_used ?? 0),
    }
}
