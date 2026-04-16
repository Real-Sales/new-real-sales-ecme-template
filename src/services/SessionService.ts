import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

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
