import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type { ProfileProduct } from '@/@types/auth'

export type CreateTeamRequest = {
    name: string
    sales_company_id: string
    sales_division_id: string
    manager_id: string
}

export type TeamResponse = {
    team_id: string
    name: string
    sales_company_id: string
    sales_division_id: string
    manager_id: string
    created_at: string
}

export type TeamPerformanceResponse = {
    name: string
    sales_company_id: string
    sales_division_id: string
    sales_division_name?: string | null
    manager_id: string
    company_team_id: string
    members: {
        member_id: string
        user_id: string
        company_team_id: string
        created_at: string
        updated_at: string
        user: {
            first_name: string
            last_name: string
            email: string
        }
        products?: ProfileProduct[]
        product?: ProfileProduct
        performance_by_mode: {
            mode_name: string
            session_count: number
            average_overall_score: number | null
        }[]
        overall_average_score: number | null
    }[]
    team_average_score: number | null
}

export async function apiGetCompanyTeams(companyId: string) {
    return ApiService.fetchDataWithAxios<TeamPerformanceResponse[]>({
        url: endpointConfig.teamPerformance(companyId),
        method: 'get',
    })
}

export async function apiGetTeamPerformance(teamId: string) {
    return ApiService.fetchDataWithAxios<TeamPerformanceResponse>({
        url: endpointConfig.companyTeamPerformance(teamId),
        method: 'get',
    })
}

export type UpdateTeamRequest = {
    name?: string
    sales_division_id?: string | null
    manager_id?: string
    sales_company_id?: string
}

export async function apiCreateTeam(data: CreateTeamRequest) {
    return ApiService.fetchDataWithAxios<TeamResponse>({
        url: endpointConfig.companyTeams,
        method: 'post',
        data,
    })
}

export async function apiUpdateTeam(teamId: string, data: UpdateTeamRequest) {
    return ApiService.fetchDataWithAxios<TeamResponse>({
        url: endpointConfig.companyTeamById(teamId),
        method: 'put',
        data,
    })
}

export async function apiDeleteTeam(teamId: string) {
    return ApiService.fetchDataWithAxios<void>({
        url: endpointConfig.companyTeamById(teamId),
        method: 'delete',
    })
}
