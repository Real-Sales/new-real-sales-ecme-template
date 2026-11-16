import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type ChatHistoryItem = {
    role: 'human' | 'assistant'
    content: string
}

export type EphemeralTokenResponse = {
    token: string
    /** Live model the token is locked to; the client must connect with this exact model. */
    model: string
    /** Prebuilt voice chosen per persona by the backend. */
    voice_name?: string
    expires_at: string
    chat_history?: ChatHistoryItem[]
    has_history?: boolean
}

/**
 * Single-flight map: AudioVisualizer prefetches the token for chat_history while
 * `gdm-live-audio` fetches again on connect; React Strict Mode also double-invokes
 * effects in dev. Sharing one in-flight POST per sessionId avoids duplicate calls.
 */
const ephemeralTokenInflight = new Map<string, Promise<EphemeralTokenResponse>>()

export async function apiGetGeminiEphemeralToken(sessionId: string) {
    const key = sessionId.trim()
    if (!key) {
        return ApiService.fetchDataWithAxios<EphemeralTokenResponse>({
            url: endpointConfig.geminiEphemeralToken,
            method: 'post',
            data: { session_id: sessionId },
        })
    }
    const existing = ephemeralTokenInflight.get(key)
    if (existing) return existing
    const p = ApiService.fetchDataWithAxios<EphemeralTokenResponse>({
        url: endpointConfig.geminiEphemeralToken,
        method: 'post',
        data: { session_id: sessionId },
    }).finally(() => {
        setTimeout(() => ephemeralTokenInflight.delete(key), 1000)
    })
    ephemeralTokenInflight.set(key, p)
    return p
    // The setTimeout keeps the entry alive for 1 second after resolution so that
    // React Strict Mode's cleanup→remount cycle (which fires within milliseconds)
    // shares the same promise instead of issuing a second network request.
}
