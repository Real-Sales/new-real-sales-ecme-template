import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import appConfig from '@/configs/app.config'
import Cookies from 'js-cookie'
import {
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
    TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'

const AUTH_TOKEN_COOKIE = 'auth_token'

function getAccessTokenForFetch(): string {
    const storage = appConfig.accessTokenPersistStrategy
    if (storage === 'cookies') {
        return Cookies.get(AUTH_TOKEN_COOKIE) || ''
    }
    if (storage === 'localStorage') {
        return localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    }
    if (storage === 'sessionStorage') {
        return sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    }
    return ''
}

export type SessionPerformanceReport = {
    overall_score: number
    coaching_summary: string
    [key: string]: any
}

export type SessionResponse = {
    session_id: string
    persona_id: string
    mode_id: string
    user_id: string
    start_time: string
    end_time: string
    duration: number
    status: string
    performance_report: SessionPerformanceReport
    created_at: string
}

export type CreateSessionManagerRequest = {
    user_id: string
    persona_id: string
    mode_id: string
    scenario_id?: string
    scenario_text?: string
    document_content?: string
}

export type PersonaDetails = {
    id: string
    name: string
    [key: string]: any
}

export type ModeDetails = {
    id: string
    name: string
    [key: string]: any
}

export async function apiGetSessionsByUser(userId: string) {
    return ApiService.fetchDataWithAxios<SessionResponse[]>({
        url: endpointConfig.sessionsByUser(userId),
        method: 'get',
    })
}

export type CreateSessionPayload = {
    persona_id: string
    mode_id: string
    scenario_id?: string
}

export async function apiCreateSession(payload: CreateSessionPayload) {
    return ApiService.fetchDataWithAxios<SessionResponse>({
        url: endpointConfig.createSession,
        method: 'post',
        data: payload,
    })
}

export async function apiStoreSessionMessage(
    sessionId: string,
    message: { role: 'human' | 'assistant'; content: string },
) {
    return ApiService.fetchDataWithAxios<{ status: string }>({
        url: endpointConfig.storeSessionMessage(sessionId),
        method: 'post',
        data: message,
    })
}

export type BatchSessionMessage = { role: 'human' | 'assistant'; content: string }

export async function apiStoreSessionMessagesBatch(
    sessionId: string,
    body: { messages: BatchSessionMessage[] },
) {
    return ApiService.fetchDataWithAxios<{ status?: string }>({
        url: endpointConfig.storeSessionMessagesBatch(sessionId),
        method: 'post',
        data: body,
    })
}

/**
 * Best-effort POST during page unload/reload so partial in-flight assistant text is persisted.
 * Uses fetch keepalive (same auth rules as Axios).
 */
export function flushSessionMessagesBatchKeepalive(
    sessionId: string,
    messages: BatchSessionMessage[],
): void {
    if (!messages.length) return
    const path = endpointConfig.storeSessionMessagesBatch(sessionId)
    const base = appConfig.apiPrefix.endsWith('/')
        ? appConfig.apiPrefix
        : `${appConfig.apiPrefix}/`
    const url = `${base}${path.replace(/^\//, '')}`

    const token = getAccessTokenForFetch()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }
    if (token) {
        headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
    }

    try {
        void fetch(url, {
            method: 'POST',
            keepalive: true,
            headers,
            body: JSON.stringify({ messages }),
        })
    } catch {
        /* ignore */
    }
}

export async function apiGetInteractionMode(modeId: string) {
    return ApiService.fetchDataWithAxios<ModeDetails>({
        url: endpointConfig.interactionModeById(modeId),
        method: 'get',
    })
}

export async function apiGetAiPersona(personaId: string) {
    return ApiService.fetchDataWithAxios<PersonaDetails>({
        url: endpointConfig.aiPersonaById(personaId),
        method: 'get',
    })
}

export async function apiManagerCreateSession(data: CreateSessionManagerRequest) {
    return ApiService.fetchDataWithAxios<SessionResponse>({
        url: endpointConfig.sessionsManagerCreate,
        method: 'post',
        data,
    })
}
