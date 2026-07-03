import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type { ProfileProduct } from '@/@types/auth'
import type { SessionResponse } from './SessionService'
import type {
    ScenarioLibraryResponse,
    DocumentUploadResponse,
    CreateScenarioRequest,
    UpdateScenarioRequest,
    ScenarioLibraryItem,
    InteractionModeListItem,
    AiPersonaListItem,
    SalesRepDashboardResponse,
} from '@/views/sales/ScenarioList/types'
import AxiosBase from './axios/AxiosBase'

export async function apiGetScenarioLibrary() {
    return ApiService.fetchDataWithAxios<ScenarioLibraryResponse>({
        url: endpointConfig.scenariosLibrary,
        method: 'get',
    })
}

export async function apiUploadDocument(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await AxiosBase.request<DocumentUploadResponse>({
        url: endpointConfig.documentsUpload,
        method: 'post',
        data: formData,
    })
    return data
}

export async function apiCreateScenario(payload: CreateScenarioRequest) {
    return ApiService.fetchDataWithAxios<ScenarioLibraryItem>({
        url: endpointConfig.scenariosCreate,
        method: 'post',
        data: payload,
    })
}

export async function apiUpdateScenario(
    scenarioId: string,
    payload: UpdateScenarioRequest
) {
    return ApiService.fetchDataWithAxios<ScenarioLibraryItem>({
        url: endpointConfig.scenariosUpdate(scenarioId),
        method: 'put',
        data: payload,
    })
}

export async function apiDeleteScenario(scenarioId: string) {
    return ApiService.fetchDataWithAxios<unknown>({
        url: endpointConfig.scenariosDelete(scenarioId),
        method: 'delete',
    })
}

export async function apiGetInteractionModes() {
    return ApiService.fetchDataWithAxios<InteractionModeListItem[]>({
        url: endpointConfig.interactionModes,
        method: 'get',
    })
}

export type FetchAiPersonasParams = {
    industryId?: string
    includePersonaId?: string
}

export async function apiGetAiPersonas(params?: FetchAiPersonasParams) {
    const searchParams = new URLSearchParams()
    if (params?.industryId) {
        searchParams.set('industry_id', params.industryId)
    }
    if (params?.includePersonaId) {
        searchParams.set('include_persona_id', params.includePersonaId)
    }
    const query = searchParams.toString()
    return ApiService.fetchDataWithAxios<AiPersonaListItem[]>({
        url: query ? `${endpointConfig.aiPersonas}?${query}` : endpointConfig.aiPersonas,
        method: 'get',
    })
}

export async function apiAssignScenario(scenarioId: string, sessionId: string) {
    return ApiService.fetchDataWithAxios<unknown>({
        url: endpointConfig.assignScenario(scenarioId, sessionId),
        method: 'post',
    })
}

/**
 * Advance a rep's completed session to the next mode configured for this
 * scenario (e.g. prospecting -> discovering, when the manager selected
 * both). `sessionId` is the just-completed session for that rep. Returns
 * the newly created session, continuing the same journey with memory
 * carried forward.
 */
export async function apiAdvanceScenario(scenarioId: string, sessionId: string) {
    return ApiService.fetchDataWithAxios<SessionResponse>({
        url: endpointConfig.scenarioAdvance(scenarioId, sessionId),
        method: 'post',
    })
}

export type AssignmentStatusMember = {
    user_id: string
    first_name: string
    last_name: string
    email: string
    sales_division_id?: string | null
    sales_division_name?: string | null
    products?: ProfileProduct[]
    can_assign: boolean
    session_id: string | null
    session_status: string | null
}

export type AssignmentStatusResponse = {
    scenario_id: string
    members: AssignmentStatusMember[]
}

export async function apiGetScenarioAssignmentStatus(scenarioId: string) {
    return ApiService.fetchDataWithAxios<AssignmentStatusResponse>({
        url: endpointConfig.scenarioAssignmentStatus(scenarioId),
        method: 'get',
    })
}

/**
 * Single-flight + short-TTL cache for the sales-rep dashboard.
 * React Strict Mode unmounts and remounts within milliseconds; the 1-second
 * window is enough to deduplicate those rapid duplicate calls without holding
 * stale data for normal refreshes.
 */
let salesRepDashboardInflight: Promise<SalesRepDashboardResponse> | null = null

export async function apiGetSalesRepScenarioDashboard() {
    if (salesRepDashboardInflight) return salesRepDashboardInflight
    salesRepDashboardInflight = ApiService.fetchDataWithAxios<SalesRepDashboardResponse>({
        url: endpointConfig.salesRepScenariosDashboard,
        method: 'get',
    }).finally(() => {
        setTimeout(() => { salesRepDashboardInflight = null }, 1000)
    })
    return salesRepDashboardInflight
}
