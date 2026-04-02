import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiGetCompanyTeams, apiGetTeamPerformance } from '@/services/TeamsService'
import { apiGetTeamMembersPerformance, type TeamMembersPerformanceResponse } from '@/services/TeamService'

export const SLICE_NAME = 'teams'


export interface TeamMemberPerformance {
    mode_name: string
    session_count: number
    average_overall_score: number | null
}

export interface TeamMemberDetail {
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
    performance_by_mode: TeamMemberPerformance[]
    overall_average_score: number | null
}

export interface Team {
    name: string
    sales_company_id: string
    sales_division_id: string
    manager_id: string
    company_team_id: string
    members: TeamMemberDetail[]
    team_average_score: number | null
}

export interface TeamPerformance {
    name: string
    sales_company_id: string
    sales_division_id: string
    manager_id: string
    company_team_id: string
    members: TeamMemberDetail[]
    team_average_score: number | null
}

export interface TeamsState {
    teamsLoading: boolean
    initialized: boolean
    teamsData: Team[]
    teamPerformance: Record<string, TeamPerformance>
    teamMembersPerformance: Record<string, TeamMembersPerformanceResponse>
    performanceLoading: boolean
    error: string | null
    notification: { type: string; message: string } | null
}

export const fetchTeams = createAsyncThunk(
    SLICE_NAME + '/fetchTeams',
    async (companyId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetCompanyTeams(companyId)
            return response
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to fetch teams data.' })
        }
    }
)

export const fetchTeamPerformance = createAsyncThunk(
    SLICE_NAME + '/fetchTeamPerformance',
    async (teamId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetTeamPerformance(teamId)
            return { teamId, data: response }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to fetch team performance.' })
        }
    }
)

export const fetchTeamMembersPerformance = createAsyncThunk(
    SLICE_NAME + '/fetchTeamMembersPerformance',
    async ({ teamId, modeId }: { teamId: string; modeId: string }, { rejectWithValue }) => {
        try {
            const response = await apiGetTeamMembersPerformance(teamId, modeId)
            return { key: `${teamId}-${modeId}`, data: response }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to fetch team members performance.' })
        }
    }
)

const initialState: TeamsState = {
    teamsLoading: false,
    initialized: false,
    teamsData: [],
    teamPerformance: {},
    teamMembersPerformance: {},
    performanceLoading: false,
    error: null,
    notification: null,
}

const teamsSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        resetError: (state) => {
            state.error = null
        },
        resetNotification: (state) => {
            state.notification = null
        },
        resetTeamsData: (state) => {
            state.teamsData = []
            state.teamPerformance = {}
            state.teamMembersPerformance = {}
            state.error = null
            state.notification = null
            state.teamsLoading = false
            state.performanceLoading = false
            state.initialized = false
        },
        updateTeamInState: (state, action: PayloadAction<Team>) => {
            const index = state.teamsData.findIndex(t => t.company_team_id === action.payload.company_team_id)
            if (index > -1) {
                state.teamsData[index] = action.payload
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeams.pending, (state) => {
                state.teamsLoading = true
            })
            .addCase(fetchTeams.fulfilled, (state, action) => {
                state.teamsData = action.payload
                state.teamsLoading = false
                state.initialized = true
            })
            .addCase(fetchTeams.rejected, (state, action) => {
                state.teamsLoading = false
                state.error = (action.payload as { detail?: string })?.detail ?? null
                state.notification = { 
                    type: 'danger', 
                    message: 'Failed to load teams. Please try again.' 
                }
                state.initialized = true
            })
            .addCase(fetchTeamPerformance.pending, (state) => {
                state.performanceLoading = true
            })
            .addCase(fetchTeamPerformance.fulfilled, (state, action) => {
                state.teamPerformance[action.payload.teamId] = action.payload.data
                state.performanceLoading = false
            })
            .addCase(fetchTeamPerformance.rejected, (state) => {
                state.performanceLoading = false
            })
            .addCase(fetchTeamMembersPerformance.pending, (state) => {
                state.performanceLoading = true
            })
            .addCase(fetchTeamMembersPerformance.fulfilled, (state, action) => {
                state.teamMembersPerformance[action.payload.key] = action.payload.data
                state.performanceLoading = false
            })
            .addCase(fetchTeamMembersPerformance.rejected, (state) => {
                state.performanceLoading = false
            })
    },
})

export const { resetError, resetNotification, resetTeamsData, updateTeamInState } =
    teamsSlice.actions

export default teamsSlice.reducer
