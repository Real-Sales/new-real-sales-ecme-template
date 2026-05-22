/** Sidebar section title for the primary sales nav group. */
export function getNavSectionTitle(role?: string): string {
    const r = role?.toLowerCase() ?? ''
    if (r === 'company_owner') return 'Company Owner'
    if (r === 'sales_manager' || r === 'manager') return 'Sales Manager'
    if (r === 'sales_person') return 'Sales Rep'
    if (r === 'admin' || r === 'super_admin') return 'Admin'
    return 'Workspace'
}
