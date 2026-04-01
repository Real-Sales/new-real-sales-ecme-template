import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type EphemeralTokenResponse = {
    token: string
    expires_at: string
}

export async function apiGetGeminiEphemeralToken() {
    return ApiService.fetchDataWithAxios<EphemeralTokenResponse>({
        url: endpointConfig.geminiEphemeralToken,
        method: 'post',
    })
}
