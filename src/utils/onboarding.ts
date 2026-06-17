/** Company owners must complete onboarding when no sales company is linked. */
export function companyOwnerNeedsOnboarding(
    role?: string | null,
    companyId?: string | null,
): boolean {
    return role === 'company_owner' && !String(companyId ?? '').trim()
}
