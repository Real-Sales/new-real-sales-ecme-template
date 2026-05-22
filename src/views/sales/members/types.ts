import type { CompanyMemberResponse } from '@/services/SalesCompanyService'

export type CompanyMemberRow = {
    user_id: string
    first_name: string
    last_name: string
    email: string
    status_active: boolean
    role?: { name?: string }
    team_name?: string | null
    sales_division_name?: string | null
}

export function mapCompanyMember(member: CompanyMemberResponse): CompanyMemberRow {
    return {
        user_id: member.user_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        status_active: member.status_active,
        role: member.role,
        team_name: member.team_name,
        sales_division_name: member.sales_division_name,
    }
}
