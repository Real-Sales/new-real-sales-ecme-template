import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type ModeAverage = {
    mode_name: string
    total_sessions: number
    average_scores: {
        overall_score: number
        [key: string]: number
    }
}

export type PerformanceReportResponse = {
    manager_id: string
    total_sessions_analyzed: number
    overall_average_score: number
    mode_averages: ModeAverage[]
}

export type MonthlyTrendModeData = {
    average_score: number | null
    session_count: number
}

export type MonthlyTrend = {
    month: string
    modes: {
        closing: MonthlyTrendModeData
        discovering: MonthlyTrendModeData
        prospecting: MonthlyTrendModeData
    }
}

export type PerformanceMonthlyTrendResponse = {
    manager_id: string
    date_range: {
        start_date: string
        end_date: string
        months_back: number
    }
    total_sessions_analyzed: number
    include_all_sessions: boolean
    monthly_trends: MonthlyTrend[]
}

export async function apiGetPerformanceReports(userId: string) {
    return ApiService.fetchDataWithAxios<PerformanceReportResponse>({
        url: endpointConfig.performanceReports(userId),
        method: 'get',
    })
}

export async function apiGetPerformanceMonthlyTrend(userId: string) {
    return ApiService.fetchDataWithAxios<PerformanceMonthlyTrendResponse>({
        url: endpointConfig.performanceMonthlyTrend(userId),
        method: 'get',
    })
}
