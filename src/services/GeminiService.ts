import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type ChatHistoryItem = {
    role: 'human' | 'assistant'
    content: string
}

export type EphemeralTokenResponse = {
    token: string
    expires_at: string
    chat_history?: ChatHistoryItem[]
    has_history?: boolean
}

export async function apiGetGeminiEphemeralToken(sessionId: string) {
    return ApiService.fetchDataWithAxios<EphemeralTokenResponse>({
        url: endpointConfig.geminiEphemeralToken,
        method: 'post',
        data: { session_id: sessionId },
    })
}
