import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type CreateSalesCompanyRequest = {
    name: string
    industry: string
    location: string
    phone_number: string
    email: string
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
}

export type CreateSalesDivisionRequest = {
    name: string
    division_category: string
    sales_company_id: string
    is_active: boolean
}

export async function apiCreateSalesCompany(data: CreateSalesCompanyRequest) {
    return ApiService.fetchDataWithAxios<SalesCompanyResponse>({
        url: endpointConfig.salesCompanies,
        method: 'post',
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
