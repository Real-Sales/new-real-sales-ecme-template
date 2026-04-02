import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    SalesDivisionResponse,
    CreateSalesDivisionRequest,
    SalesDivisionInfoResponse,
} from './SalesCompanyService'

export type SalesDivision = SalesDivisionResponse
export type SalesDivisionInfo = SalesDivisionInfoResponse
export type CreateDivisionRequest = CreateSalesDivisionRequest
export type UpdateDivisionRequest = Partial<CreateSalesDivisionRequest>

export async function apiGetSalesDivisions(companyId: string) {
    return ApiService.fetchDataWithAxios<SalesDivision[]>({
        url: endpointConfig.salesDivisions(companyId),
        method: 'get',
    })
}

export async function apiGetSalesDivisionInfo(divisionId: string) {
    return ApiService.fetchDataWithAxios<SalesDivisionInfo>({
        url: endpointConfig.salesDivisionInfo(divisionId),
        method: 'get',
    })
}

export async function apiCreateSalesDivision(data: CreateDivisionRequest) {
    return ApiService.fetchDataWithAxios<SalesDivision>({
        url: endpointConfig.salesDivisionsCreate,
        method: 'post',
        data,
    })
}

export async function apiUpdateSalesDivision(divisionId: string, data: UpdateDivisionRequest) {
    return ApiService.fetchDataWithAxios<SalesDivision>({
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
