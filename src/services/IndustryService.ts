import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type IndustryCatalogProduct = {
    product_id: string
    industry_id: string
    name: string
    details: string
    created_at: string
    updated_at: string
}

export type IndustryCatalogItem = {
    industry_id: string
    name: string
    details: string
    created_at: string
    updated_at: string
    products: IndustryCatalogProduct[]
}

export async function apiGetIndustries() {
    return ApiService.fetchDataWithAxios<IndustryCatalogItem[]>({
        url: endpointConfig.industries,
        method: 'get',
    })
}
