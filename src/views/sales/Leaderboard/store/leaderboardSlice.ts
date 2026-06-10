import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGetLeaderboard } from '@/services/LeaderboardService'
import type { LeaderboardResponse, FetchLeaderboardParams } from '../types'

export const SLICE_NAME = 'leaderboard'

export interface LeaderboardState {
    loading: boolean
    initialized: boolean
    selectedMonth: string
    data: LeaderboardResponse | null
    error: string | null
    notification: { type: string; message: string } | null
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
)

const initialState: LeaderboardState = {
    loading: false,
    initialized: false,
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

export const { setSelectedMonth, resetNotification, resetLeaderboardData } =
    leaderboardSlice.actions

export default leaderboardSlice.reducer
