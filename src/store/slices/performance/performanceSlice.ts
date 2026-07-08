import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
    apiGetPerformanceReports, 
    apiGetPerformanceMonthlyTrend,
    type PerformanceReportResponse,
    type PerformanceMonthlyTrendResponse,
} from '@/services/PerformanceService'
import {
    apiGetSessionsByUser,
    apiGetInteractionMode,
    apiGetAiPersona,
} from '@/services/SessionService'
import type { SessionHistory } from '@/views/sales/Performance/performanceData'
import { formatDisplayLabel } from '@/utils/formatDisplayLabel'

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
    trendInitialized: boolean
    sessionHistory: SessionHistory[]
    sessionHistoryLoading: boolean
    sessionHistoryInitialized: boolean
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

export const fetchSessionHistory = createAsyncThunk(
    SLICE_NAME + '/fetchSessionHistory',
    async (userId: string, { rejectWithValue }) => {
        try {
            const sessionData = await apiGetSessionsByUser(userId)
            const uniquePersonaIds = Array.from(new Set(sessionData.map((s) => s.persona_id)))
            const uniqueModeIds = Array.from(new Set(sessionData.map((s) => s.mode_id)))

            const personaMap: Record<string, string> = {}
            const modeMap: Record<string, string> = {}

            await Promise.all([
                ...uniquePersonaIds.map(async (id) => {
                    try {
                        const details = await apiGetAiPersona(id)
                        personaMap[id] = details.name
                    } catch {
                        personaMap[id] = 'Unknown Persona'
                    }
                }),
                ...uniqueModeIds.map(async (id) => {
                    try {
                        const details = await apiGetInteractionMode(id)
                        modeMap[id] = formatDisplayLabel(details.name)
                    } catch {
                        modeMap[id] = 'Unknown Mode'
                    }
                }),
            ])

            const sessions: SessionHistory[] = sessionData.map((s) => {
                const report = s.performance_report
                const flatMetrics: Record<string, number> = {}
                if (typeof report?.overall_score === 'number') {
                    flatMetrics.overall_score = report.overall_score
                }
                if (Array.isArray(report?.categories)) {
                    ;(report.categories as { name: string; score: number }[]).forEach((cat) => {
                        if (cat.name && typeof cat.score === 'number') {
                            const key = cat.name
                                .toLowerCase()
                                .replace(/\s+/g, '_')
                                .replace(/[^a-z0-9_]/g, '')
                            flatMetrics[key] = cat.score
                        }
                    })
                }
                const cs = report?.coaching_summary as string | { summary?: string } | undefined
                const coachingSummaryText: string | undefined =
                    typeof cs === 'string'
                        ? cs
                        : typeof cs?.summary === 'string'
                          ? cs.summary
                          : undefined

                return {
                    id: s.session_id,
                    persona: personaMap[s.persona_id],
                    mode: modeMap[s.mode_id],
                    date: s.start_time,
                    duration: s.duration ?? 0,
                    overallScore: report?.overall_score ?? 0,
                    status: s.status,
                    coachingSummary: coachingSummaryText,
                    metrics: Object.keys(flatMetrics).length > 0 ? flatMetrics : undefined,
                }
            })

            return sessions
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to fetch session history.' })
        }
    },
)

const initialState: PerformanceState = {
    performanceLoading: false,
    initialized: false,
    performanceByMode: [],
    performanceReport: null,
    monthlyTrend: null,
    trendLoading: false,
    trendInitialized: false,
    sessionHistory: [],
    sessionHistoryLoading: false,
    sessionHistoryInitialized: false,
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
            state.sessionHistory = []
            state.error = null
            state.notification = null
            state.performanceLoading = false
            state.trendLoading = false
            state.sessionHistoryLoading = false
            state.initialized = false
            state.trendInitialized = false
            state.sessionHistoryInitialized = false
        },
        invalidatePerformanceData: (state) => {
            state.initialized = false
            state.trendInitialized = false
            state.sessionHistoryInitialized = false
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
                state.trendInitialized = true
            })
            .addCase(fetchMonthlyTrend.rejected, (state) => {
                state.trendLoading = false
                state.trendInitialized = true
            })
            .addCase(fetchSessionHistory.pending, (state) => {
                state.sessionHistoryLoading = true
            })
            .addCase(fetchSessionHistory.fulfilled, (state, action) => {
                state.sessionHistory = action.payload
                state.sessionHistoryLoading = false
                state.sessionHistoryInitialized = true
            })
            .addCase(fetchSessionHistory.rejected, (state) => {
                state.sessionHistory = []
                state.sessionHistoryLoading = false
                state.sessionHistoryInitialized = true
            })
    },
})

export const { resetError, resetNotification, resetPerformanceData, invalidatePerformanceData } =
    performanceSlice.actions

export default performanceSlice.reducer
