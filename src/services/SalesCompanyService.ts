import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type { ProfileProduct } from '@/@types/auth'
import type { CustomerSegmentSlim } from './CustomerSegmentService'

export type CreateSalesCompanyRequest = {
    name: string
    industry: string
    location: string
    phone_number: string
    email: string
    product_ids?: string[]
}

export type SalesCompanyResponse = {
    sales_company_id: string
    name: string
    industry: string
    location: string
    phone_number: string
    email: string
    manager_id: string
    manager: {
        user_id: string
        first_name: string
        last_name: string
        email: string
        phone_number: string
        status_active: boolean
        is_verified: boolean
    }
    is_active: boolean
}

export type SalesDivisionResponse = {
    name: string
    division_category: string
    sales_company_id: string
    is_active: boolean
    sales_division_id: string
    created_at: string
    products?: ProfileProduct[]
    customer_segment_id?: string
    customer_segment?: CustomerSegmentSlim
}

export type CreateSalesDivisionRequest = {
    name: string
    division_category: string
    sales_company_id: string
    is_active: boolean
    product_ids?: string[]
    /** Required on create — who this division's team sells to. */
    customer_segment_id: string
}

export async function apiCreateSalesCompany(data: CreateSalesCompanyRequest) {
    return ApiService.fetchDataWithAxios<SalesCompanyResponse>({
        url: endpointConfig.salesCompanies,
        method: 'post',
        data,
    })
}

export type UpdateSalesCompanyRequest = {
    name?: string
    industry?: string
    location?: string
    phone_number?: string
    email?: string
    product_ids?: string[]
    is_active?: boolean
}

export async function apiGetSalesCompanyDetail(salesCompanyId: string) {
    return ApiService.fetchDataWithAxios<SalesCompanyResponse>({
        url: endpointConfig.salesCompanyDetail(salesCompanyId),
        method: 'get',
    })
}

export async function apiGetSalesCompanyProducts(salesCompanyId: string) {
    return ApiService.fetchDataWithAxios<ProfileProduct[]>({
        url: endpointConfig.salesCompanyProducts(salesCompanyId),
        method: 'get',
    })
}

export async function apiUpdateSalesCompany(
    salesCompanyId: string,
    data: UpdateSalesCompanyRequest,
) {
    return ApiService.fetchDataWithAxios<SalesCompanyResponse>({
        url: endpointConfig.salesCompanyDetail(salesCompanyId),
        method: 'put',
        data,
    })
}

export async function apiGetSalesCompanies() {
    return ApiService.fetchDataWithAxios<SalesCompanyResponse[]>({
        url: endpointConfig.salesCompanies,
        method: 'get',
    })
}

export async function apiGetSalesDivisions(companyId: string) {
    console.log('API Call: apiGetSalesDivisions with companyId:', companyId)
    return ApiService.fetchDataWithAxios<SalesDivisionResponse[]>({
        url: endpointConfig.salesDivisions(companyId),
        method: 'get',
    })
}

export async function apiCreateSalesDivision(data: CreateSalesDivisionRequest) {
    return ApiService.fetchDataWithAxios<SalesDivisionResponse>({
        url: endpointConfig.salesDivisionsCreate,
        method: 'post',
        data,
    })
}

export async function apiGetSalesCompanyByManager(managerId: string) {
    console.log('API Call: apiGetSalesCompanyByManager with managerId:', managerId)
    return ApiService.fetchDataWithAxios<SalesCompanyResponse>({
        url: endpointConfig.salesCompanyByManager(managerId),
        method: 'get',
    })
}

export async function apiUpdateSalesDivision(divisionId: string, data: Partial<CreateSalesDivisionRequest>) {
    return ApiService.fetchDataWithAxios<SalesDivisionResponse>({
        url: endpointConfig.salesDivisionsUpdate(divisionId),
        method: 'put',
        data,
    })
}

export async function apiDeleteSalesDivision(divisionId: string) {
    return ApiService.fetchDataWithAxios<void>({
        url: endpointConfig.salesDivisionsDelete(divisionId),
        method: 'delete',
    })
}

/** One team membership on a company member (multi-team roster). */
export type CompanyMemberTeam = {
    team_id: string
    team_name: string
    /** Some API responses use company_team_id instead of team_id */
    company_team_id?: string
    sales_division_id?: string | null
    sales_division_name?: string | null
}

export type DivisionUser = {
    user_id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string | null
    company_id: string
    status_active: boolean
    is_verified: boolean
    team_id: string
    team_name: string
    /** Present when division info returns multi-team memberships */
    teams?: CompanyMemberTeam[]
    role: {
        name: string
        role_id: string
    }
    manager_info: {
        manager_id: string
        manager_name: string
        manager_email: string
        company_name: string
    }
}

export type SalesDivisionInfoResponse = {
    name: string
    division_category: string
    sales_company_id: string
    is_active: boolean
    sales_division_id: string
    created_at: string
    users: DivisionUser[]
    products?: ProfileProduct[]
    customer_segment_id?: string
    customer_segment?: CustomerSegmentSlim
}

export async function apiGetSalesDivisionInfo(divisionId: string) {
    return ApiService.fetchDataWithAxios<SalesDivisionInfoResponse>({
        url: endpointConfig.salesDivisionInfo(divisionId),
        method: 'get',
    })
}

export type CompanyMemberResponse = {
    user_id: string
    email: string
    first_name: string
    last_name: string
    phone_number?: string | null
    company_id?: string
    status_active: boolean
    is_verified?: boolean
    role?: { role_id?: string; name?: string; description?: string; status_active?: boolean }
    /** First team (compat); prefer `teams` for multi UI */
    team_id?: string | null
    team_name?: string | null
    /** Primary division used for sessions / product context */
    sales_division_id?: string | null
    sales_division_name?: string | null
    /** Direct division assignments (teams optional) */
    sales_division_ids?: string[]
    divisions?: Array<{
        sales_division_id: string
        sales_division_name: string
    }>
    /** All team memberships */
    teams?: CompanyMemberTeam[]
    /** Credits this member consumed from the shared company pot */
    credits_used?: number
    products?: ProfileProduct[]
    product?: ProfileProduct
}

export type CompanyMembersListResponse = {
    total_members: number
    active_members: number
    /** Shared company credit pot (root-level) */
    credits_allocated?: number
    credits_used?: number
    credits_remaining?: number
    members: CompanyMemberResponse[]
}

export async function apiGetCompanyMembers(salesCompanyId: string) {
    return ApiService.fetchDataWithAxios<CompanyMembersListResponse>({
        url: endpointConfig.salesCompanyMembers(salesCompanyId),
        method: 'get',
    })
}

export type CompanyMemberAssignmentUpdate = {
    role?: 'sales_person' | 'sales_manager'
    /** Full direct division list (replace). Empty array clears direct assignments. */
    sales_division_ids?: string[]
    /** Primary division for sessions / product context */
    sales_division_id?: string | null
    /** Set exact teams (replace). Send together with `sales_division_ids`. */
    company_team_ids?: string[]
    /** Legacy single-team assign (still accepted by API) */
    company_team_id?: string | null
    status_active?: boolean
}

export async function apiAssignCompanyMember(
    salesCompanyId: string,
    userId: string,
    data: CompanyMemberAssignmentUpdate,
) {
    return ApiService.fetchDataWithAxios<CompanyMemberResponse>({
        url: endpointConfig.salesCompanyMemberAssignment(salesCompanyId, userId),
        method: 'patch',
        data,
    })
}
