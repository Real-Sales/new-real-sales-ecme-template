import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    ScenarioLibraryResponse,
    DocumentUploadResponse,
    CreateScenarioRequest,
    UpdateScenarioRequest,
    ScenarioLibraryItem,
    InteractionModeListItem,
    AiPersonaListItem,
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

export async function apiGetAiPersonas() {
    return ApiService.fetchDataWithAxios<AiPersonaListItem[]>({
        url: endpointConfig.aiPersonas,
        method: 'get',
    })
}

export async function apiAssignScenario(scenarioId: string, sessionId: string) {
    return ApiService.fetchDataWithAxios<unknown>({
        url: endpointConfig.assignScenario(scenarioId, sessionId),
        method: 'post',
    })
}

export type AssignmentStatusResponse = {
    scenario_id: string
    team_id: string
    members: Array<{
        user_id: string
        first_name: string
        last_name: string
        email: string
        is_assigned: boolean
        session_id: string | null
        session_status: string | null
    }>
}

export async function apiGetScenarioAssignmentStatus(scenarioId: string, teamId: string) {
    return ApiService.fetchDataWithAxios<AssignmentStatusResponse>({
        url: endpointConfig.scenarioAssignmentStatus(scenarioId, teamId),
        method: 'get',
    })
}
