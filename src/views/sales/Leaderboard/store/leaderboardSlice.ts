import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGetLeaderboard } from '@/services/LeaderboardService'
import type { LeaderboardResponse, FetchLeaderboardParams } from '../types'

export const SLICE_NAME = 'leaderboard'

export interface LeaderboardState {
    loading: boolean
    initialized: boolean
    cacheKey: string | null
    selectedMonth: string
    data: LeaderboardResponse | null
    error: string | null
    notification: { type: string; message: string } | null
}

function leaderboardCacheKey(params: FetchLeaderboardParams): string {
    return `${params.month ?? getCurrentMonth()}-${params.limit ?? 10}`
}

function getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7)
}

export const fetchLeaderboard = createAsyncThunk(
    SLICE_NAME + '/fetchLeaderboard',
    async (params: FetchLeaderboardParams, { rejectWithValue }) => {
        try {
            return await apiGetLeaderboard(params)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to load leaderboard.' })
        }
    },
    {
        condition: (params, { getState }) => {
            const state = (getState() as { leaderboard?: { data?: LeaderboardState } })
                .leaderboard?.data
            if (!state) return true
            const key = leaderboardCacheKey(params)
            return !(state.initialized && state.cacheKey === key && !state.loading)
        },
    },
)

const initialState: LeaderboardState = {
    loading: false,
    initialized: false,
    cacheKey: null,
    selectedMonth: getCurrentMonth(),
    data: null,
    error: null,
    notification: null,
}

const leaderboardSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setSelectedMonth: (state, action: { payload: string }) => {
            state.selectedMonth = action.payload
        },
        resetNotification: (state) => {
            state.notification = null
        },
        invalidateLeaderboard: (state) => {
            state.initialized = false
            state.cacheKey = null
        },
        resetLeaderboardData: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaderboard.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => {
                state.loading = false
                state.initialized = true
                state.cacheKey = leaderboardCacheKey(action.meta.arg)
                state.data = action.payload
            })
            .addCase(fetchLeaderboard.rejected, (state, action) => {
                state.loading = false
                state.initialized = true
                state.data = null
                state.error =
                    (action.payload as { detail?: string })?.detail ?? null
                state.notification = {
                    type: 'danger',
                    message:
                        (action.payload as { detail?: string })?.detail ??
                        'Failed to load leaderboard. Please try again.',
                }
            })
    },
})

export const {
    setSelectedMonth,
    resetNotification,
    resetLeaderboardData,
    invalidateLeaderboard,
} = leaderboardSlice.actions

export default leaderboardSlice.reducer
