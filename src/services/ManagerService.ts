import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type UpdateManagerRequest = {
    company_id?: string
    first_name?: string
    last_name?: string
    phone_number?: string
    email?: string
}

export type ManagerResponse = {
    user_id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    company_id: string | null
    status_active: boolean
    is_verified: boolean
}

export async function apiGetManagerMe() {
    return ApiService.fetchDataWithAxios<ManagerResponse>({
        url: endpointConfig.authMe,
        method: 'get',
    })
}
