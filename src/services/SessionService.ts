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
    /** Set when the session belongs to a manager-assigned scenario. */
    scenario_id?: string | null
    /** Groups sessions across prospecting -> discovering -> closing. */
    journey_id?: string | null
    /** Persona-continuity summary; only set once the session has completed. */
    session_memory?: Record<string, unknown> | null
    /** Mode names whose memory was injected into this session's prompt. */
    prior_modes_injected?: string[] | null
}

export type CreateSessionManagerRequest = {
    user_id: string
    persona_id: string
    mode_id: string
    scenario_id?: string
    scenario_text?: string
    document_content?: string
    /** Prior mode's session_id, to continue the same journey with inherited memory. */
    continue_from_session_id?: string
}

/** One entry in a cross-mode journey (GET /sessions/{session_id}/journey). */
export type SessionJourneyEntry = {
    session_id: string
    mode_name: string
    mode_order: number | null
    status: string
    has_session_memory: boolean
    start_time: string | null
    end_time: string | null
    created_at: string
}

export type SessionJourneyResponse = {
    journey_id: string
    sessions: SessionJourneyEntry[]
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
    /** Prior mode's session_id, to continue the same journey with inherited memory. */
    continue_from_session_id?: string
}

export async function apiCreateSession(payload: CreateSessionPayload) {
    return ApiService.fetchDataWithAxios<SessionResponse>({
        url: endpointConfig.createSession,
        method: 'post',
        data: payload,
    })
}

export async function apiGetSessionById(sessionId: string) {
    return ApiService.fetchDataWithAxios<SessionResponse>({
        url: endpointConfig.sessionById(sessionId),
        method: 'get',
    })
}

/** GET /sessions/{session_id}/journey — all sessions sharing this session's journey_id. */
export async function apiGetSessionJourney(sessionId: string) {
    return ApiService.fetchDataWithAxios<SessionJourneyResponse>({
        url: endpointConfig.sessionJourney(sessionId),
        method: 'get',
    })
}

/**
 * Retry session_memory generation for a completed session whose memory
 * generation failed at completion time (performance_report exists, but
 * session_memory is null) — required before it can be used as
 * continue_from_session_id.
 */
export async function apiRegenerateSessionMemory(sessionId: string) {
    return ApiService.fetchDataWithAxios<Record<string, unknown>>({
        url: endpointConfig.regenerateSessionMemory(sessionId),
        method: 'post',
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

/** Canonical performance report shape from GET/POST /performance-reports. */
export type ReportCategory = {
    name?: string
    score?: number
    comment?: string
}

export type CoachingSummary = {
    summary?: string
    strengths?: string[]
    areas_for_improvement?: string[]
}

export type PerformanceReportPayload = {
    overall_score?: number
    categories?: ReportCategory[]
    coaching_summary?: CoachingSummary
    scenario_evaluation?: string | null
}

export async function apiCreatePerformanceReport(sessionId: string) {
    return ApiService.fetchDataWithAxios<PerformanceReportPayload>({
        url: endpointConfig.performanceReportCreate,
        method: 'post',
        data: { session_id: sessionId },
    })
}

export async function apiGetPerformanceReport(sessionId: string) {
    return ApiService.fetchDataWithAxios<PerformanceReportPayload>({
        url: endpointConfig.performanceReportBySession(sessionId),
        method: 'get',
    })
}

export async function apiDownloadPerformanceReportPdf(sessionId: string) {
    return ApiService.fetchDataWithAxios<Blob>({
        url: endpointConfig.performanceReportPdf(sessionId),
        method: 'get',
        responseType: 'blob',
    })
}

export function getPerformanceReportPdfErrorMessage(err: unknown): string {
    const ax = err as { response?: { status?: number; data?: { detail?: string } } }
    const status = ax?.response?.status
    const detail = ax?.response?.data?.detail ?? ''
    if (status === 404) {
        return detail || 'Report not found. Generate the report before downloading the PDF.'
    }
    if (status === 500) {
        return detail || 'PDF generation failed. Please try again later.'
    }
    return detail || 'Failed to download PDF.'
}

/** GET /performance-reports/{session_id}/pdf — trigger browser download. */
export async function downloadPerformanceReportPdf(sessionId: string): Promise<void> {
    const blob = await apiDownloadPerformanceReportPdf(sessionId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance_report_${sessionId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

/** In-flight ensure per session — dedupes React Strict Mode dev double-mount and parallel navigations. */
const ensurePerformanceReportPromises = new Map<
    string,
    Promise<PerformanceReportPayload>
>()

/** Cached reports for the current browser tab — avoids refetch when revisiting a report. */
const performanceReportCache = new Map<string, PerformanceReportPayload>()

/**
 * Fetch the saved report for `sessionId`, generating it only if the DB doesn't have one yet.
 *  1. GET /performance-reports/{sessionId}             -> 200, return the saved blob.
 *  2. If GET returned 404, POST /performance-reports/  -> generate and return the new blob.
 *  3. If the POST race-loses with another writer (`400 already exists`), GET once more.
 *
 * Concurrent callers (Strict Mode double-mount, etc.) share a single in-flight promise.
 */
export function apiEnsurePerformanceReport(
    sessionId: string,
): Promise<PerformanceReportPayload> {
    const cached = performanceReportCache.get(sessionId)
    if (cached) {
        return Promise.resolve(cached)
    }

    let pending = ensurePerformanceReportPromises.get(sessionId)
    if (!pending) {
        pending = (async () => {
            try {
                return await apiGetPerformanceReport(sessionId)
            } catch (err: unknown) {
                const status = (err as { response?: { status?: number } })?.response
                    ?.status
                if (status !== 404) throw err
            }

            try {
                return await apiCreatePerformanceReport(sessionId)
            } catch (err: unknown) {
                const ax = err as {
                    response?: { status?: number; data?: { detail?: string } }
                }
                const status = ax?.response?.status
                const detail: string = ax?.response?.data?.detail ?? ''
                if (status === 400 && /already exists/i.test(detail)) {
                    return await apiGetPerformanceReport(sessionId)
                }
                throw err
            }
        })()
            .then((report) => {
                performanceReportCache.set(sessionId, report)
                return report
            })
            .finally(() => {
                ensurePerformanceReportPromises.delete(sessionId)
            })
        ensurePerformanceReportPromises.set(sessionId, pending)
    }
    return pending
}
