import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

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
        performance_by_mode: {
            mode_name: string
            session_count: number
            average_overall_score: number | null
        }[]
        overall_average_score: number | null
    }[]
    team_average_score: number | null
}

export async function apiCreateTeam(data: CreateTeamRequest) {
    return ApiService.fetchDataWithAxios<TeamResponse>({
        url: endpointConfig.companyTeams,
        method: 'post',
        data,
    })
}

export type MonthlyPerformance = {
    session_count: number
    average_overall_score: number | null
    [key: string]: any
}

export type TeamMembersPerformanceResponse = {
    company_team_id: string
    mode_id: string
    mode_name: string
    date_range: {
        start_date: string
        end_date: string
        months_back: number
    }
    members: {
        user_id: string
        first_name: string
        last_name: string
        email: string
        monthly_performance: Record<string, MonthlyPerformance>
    }[]
}

export type CompanyUser = {
    email: string
    first_name: string
    last_name: string
    user_id: string
    [key: string]: any
}

export type CompanyResponse = {
    sales_company_id: string
    name: string
    users: CompanyUser[]
    [key: string]: any
}

export async function apiGetTeamPerformance(companyId: string) {
    return ApiService.fetchDataWithAxios<TeamPerformanceResponse[]>({
        url: endpointConfig.teamPerformance(companyId),
        method: 'get',
    })
}

export async function apiGetCompanyTeamPerformance(teamId: string) {
    return ApiService.fetchDataWithAxios<TeamPerformanceResponse>({
        url: endpointConfig.companyTeamPerformance(teamId),
        method: 'get',
    })
}

export async function apiGetTeamMembersPerformance(teamId: string, modeId: string) {
    return ApiService.fetchDataWithAxios<TeamMembersPerformanceResponse>({
        url: endpointConfig.teamMembersPerformance(teamId, modeId),
        method: 'get',
    })
}

export async function apiDeleteTeamMember(userId: string, teamId: string) {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.deleteTeamMember(userId, teamId),
        method: 'delete',
    })
}

export async function apiGetCompanyUsers(companyId: string) {
    return ApiService.fetchDataWithAxios<CompanyResponse>({
        url: endpointConfig.companyUsers(companyId),
        method: 'get',
    })
}

export type TeamScenariosDashboardResponse = {
    assigned_scenarios: Array<{
        scenario_id: string
        session_id: string
        user_id: string
        user_name: string
        user_email: string
        title: string
        session_status: string
        is_completed: boolean
        days_remaining?: number
        time_limit_days: number
        created_at: string
        mode: {
            name: string
            [key: string]: any
        }
        persona: {
            name: string
            [key: string]: any
        }
        scenario_text: string
        message: string
        [key: string]: any
    }>
    total_assigned: number
    completed_count: number
    pending_count: number
    completion_rate: number
}

export async function apiAddTeamMember(data: { user_id: string; company_team_id: string }) {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.addTeamMember,
        method: 'post',
        data,
    })
}

export async function apiGetTeamScenariosDashboard(teamId: string) {
    return ApiService.fetchDataWithAxios<TeamScenariosDashboardResponse>({
        url: endpointConfig.teamScenariosDashboard,
        method: 'get',
        params: { team_id: teamId },
    })
}

export async function apiUnassignScenario(sessionId: string) {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.unassignScenario(sessionId),
        method: 'post',
    })
}
