import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
    apiGetPerformanceReports, 
    apiGetPerformanceMonthlyTrend,
    type PerformanceReportResponse,
    type PerformanceMonthlyTrendResponse,
} from '@/services/PerformanceService'

export const SLICE_NAME = 'performance'

export interface PerformanceByMode {
    mode: string
    modeName: string
    avgScore: number
    totalSessions: number
    avgDuration: number
}

export interface MonthlyTrendData {
    month: string
    score: number
    sessions: number
}

export interface PerformanceState {
    performanceLoading: boolean
    initialized: boolean
    performanceByMode: PerformanceByMode[]
    performanceReport: PerformanceReportResponse | null
    monthlyTrend: PerformanceMonthlyTrendResponse | null
    trendLoading: boolean
    error: string | null
    notification: { type: string; message: string } | null
}

const emptyPerformanceReport = (userId: string): PerformanceReportResponse => ({
    manager_id: userId,
    total_sessions_analyzed: 0,
    overall_average_score: 0,
    mode_averages: [],
})

const emptyMonthlyTrend = (userId: string): PerformanceMonthlyTrendResponse => ({
    manager_id: userId,
    date_range: { start_date: '', end_date: '', months_back: 0 },
    total_sessions_analyzed: 0,
    include_all_sessions: true,
    monthly_trends: [],
})

function isNoPerformanceDataError(error: unknown): boolean {
    const err = error as {
        response?: { status?: number; data?: { detail?: string } }
    }
    const status = err.response?.status
    const detail = String(err.response?.data?.detail ?? '').toLowerCase()
    return (
        status === 404 ||
        (status === 400 &&
            (detail.includes('no session') ||
                detail.includes('not found') ||
                detail.includes('no data') ||
                detail.includes('no performance')))
    )
}

export const fetchPerformanceByMode = createAsyncThunk(
    SLICE_NAME + '/fetchPerformanceByMode',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetPerformanceReports(userId)
            return response
        } catch (error: unknown) {
            if (isNoPerformanceDataError(error)) {
                return emptyPerformanceReport(userId)
            }
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to fetch performance data.' })
        }
    }
)

export const fetchMonthlyTrend = createAsyncThunk(
    SLICE_NAME + '/fetchMonthlyTrend',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetPerformanceMonthlyTrend(userId)
            return response
        } catch (error: unknown) {
            if (isNoPerformanceDataError(error)) {
                return emptyMonthlyTrend(userId)
            }
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to fetch trend data.' })
        }
    }
)

const initialState: PerformanceState = {
    performanceLoading: false,
    initialized: false,
    performanceByMode: [],
    performanceReport: null,
    monthlyTrend: null,
    trendLoading: false,
    error: null,
    notification: null,
}

const performanceSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        resetError: (state) => {
            state.error = null
        },
        resetNotification: (state) => {
            state.notification = null
        },
        resetPerformanceData: (state) => {
            state.performanceByMode = []
            state.performanceReport = null
            state.monthlyTrend = null
            state.error = null
            state.notification = null
            state.performanceLoading = false
            state.trendLoading = false
            state.initialized = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPerformanceByMode.pending, (state) => {
                state.performanceLoading = true
            })
            .addCase(fetchPerformanceByMode.fulfilled, (state, action) => {
                const payload = action.payload
                state.performanceReport = payload
                state.performanceByMode = (payload.mode_averages ?? []).map(m => ({
                    mode: m.mode_name.toLowerCase(),
                    modeName: m.mode_name,
                    avgScore: m.average_scores.overall_score,
                    totalSessions: m.total_sessions,
                    avgDuration: 0,
                }))
                state.performanceLoading = false
                state.initialized = true
                state.error = null
            })
            .addCase(fetchPerformanceByMode.rejected, (state, action) => {
                state.performanceLoading = false
                state.error = (action.payload as { detail?: string })?.detail ?? null
                state.initialized = true
            })
            .addCase(fetchMonthlyTrend.pending, (state) => {
                state.trendLoading = true
            })
            .addCase(fetchMonthlyTrend.fulfilled, (state, action) => {
                state.monthlyTrend = action.payload
                state.trendLoading = false
            })
            .addCase(fetchMonthlyTrend.rejected, (state) => {
                state.trendLoading = false
            })
    },
})

export const { resetError, resetNotification, resetPerformanceData } =
    performanceSlice.actions

export default performanceSlice.reducer
