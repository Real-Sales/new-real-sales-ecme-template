import {
    apiGetSalesCompanyByManager,
    apiGetSalesCompanyDetail,
} from '@/services/SalesCompanyService'

export type ResolvedSalesCompany = {
    salesCompanyId: string
    companyName: string
    managerId?: string
}

/** Resolve sales_company_id for owner/manager flows (matches invite settings pattern). */
export async function resolveSalesCompanyContext(
    userId: string | undefined,
    companyIdFromAuth: string | undefined,
): Promise<ResolvedSalesCompany | null> {
    if (userId) {
        try {
            const company = await apiGetSalesCompanyByManager(userId)
            if (company?.sales_company_id) {
                return {
                    salesCompanyId: company.sales_company_id,
                    companyName: company.name ?? '',
                    managerId: company.manager_id,
                }
            }
        } catch {
            /* fall through to auth company_id */
        }
    }
    if (companyIdFromAuth) {
        try {
            const company = await apiGetSalesCompanyDetail(companyIdFromAuth)
            return {
                salesCompanyId: company.sales_company_id ?? companyIdFromAuth,
                companyName: company.name ?? '',
                managerId: company.manager_id,
            }
        } catch {
            return { salesCompanyId: companyIdFromAuth, companyName: '' }
        }
    }
    return null
}

export async function resolveSalesCompanyId(
    userId: string | undefined,
    companyIdFromAuth: string | undefined,
): Promise<string | null> {
    const ctx = await resolveSalesCompanyContext(userId, companyIdFromAuth)
    return ctx?.salesCompanyId ?? null
}