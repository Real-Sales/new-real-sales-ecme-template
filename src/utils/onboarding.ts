/** Company owners must complete onboarding when no sales company is linked. */
export function companyOwnerNeedsOnboarding(
    role?: string | null,
    companyId?: string | null,
): boolean {
    return role === 'company_owner' && !String(companyId ?? '').trim()
}

/** Roles that may resolve company via the manager endpoint after session restore. */
export function roleMayResolveCompanyViaManager(role?: string | null): boolean {
    return ['sales_manager', 'company_owner', 'admin', 'super_admin'].includes(
        role ?? '',
    )
}
