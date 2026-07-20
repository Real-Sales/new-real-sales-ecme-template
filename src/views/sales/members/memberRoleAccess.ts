import type { CompanyMemberRow } from './types'

export const ASSIGNABLE_MEMBER_ROLES = [
    { value: 'sales_person', label: 'Sales Person' },
    { value: 'sales_manager', label: 'Sales Manager' },
] as const

export type AssignableMemberRole = (typeof ASSIGNABLE_MEMBER_ROLES)[number]['value']

export function normalizeRoleName(role?: string | null): string {
    if (!role) return ''
    return role.trim().toLowerCase().replace(/\s+/g, '_')
}

export function getMemberRoleName(member: CompanyMemberRow): string {
    return normalizeRoleName(member.role?.name)
}

export function canChangeMemberRole(
    currentUserRole?: string,
    currentUserId?: string,
    companyManagerId?: string | null,
): boolean {
    if (normalizeRoleName(currentUserRole) !== 'company_owner' || !currentUserId?.trim()) {
        return false
    }
    if (!companyManagerId?.trim()) {
        return true
    }
    return currentUserId.trim() === companyManagerId.trim()
}

export function isMemberRoleEditable(
    member: CompanyMemberRow,
    companyManagerId?: string | null,
    currentUserId?: string,
    canChangeRole?: boolean,
): boolean {
    if (!canChangeRole || !currentUserId?.trim()) return false
    if (member.user_id === currentUserId.trim()) return false
    if (companyManagerId?.trim() && member.user_id === companyManagerId.trim()) {
        return false
    }
    const roleName = getMemberRoleName(member)
    return roleName === 'sales_person' || roleName === 'sales_manager'
}

export function formatMemberRoleLabel(role?: string) {
    const normalized = normalizeRoleName(role)
    if (!normalized) return '—'
    return (
        ASSIGNABLE_MEMBER_ROLES.find((r) => r.value === normalized)?.label ??
        normalized.replace(/_/g, ' ')
    )
}

/** Edit member assignments (division, team, role). Sales reps are view-only. */
export function canManageCompanyMembers(role?: string | null): boolean {
    const normalized = normalizeRoleName(role)
    return normalized === 'company_owner' || normalized === 'sales_manager'
}
