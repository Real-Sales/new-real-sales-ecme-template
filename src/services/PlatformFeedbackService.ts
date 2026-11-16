import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type PlatformFeedbackRequest = {
    rating: number
    description: string
}

export type PlatformFeedbackResponse = {
    id?: string
    rating: number
    description: string
    created_at?: string
    [key: string]: unknown
}

export async function apiSubmitPlatformFeedback(data: PlatformFeedbackRequest) {
    return ApiService.fetchDataWithAxios<PlatformFeedbackResponse>({
        url: endpointConfig.platformFeedback,
        method: 'post',
        data,
    })
}
