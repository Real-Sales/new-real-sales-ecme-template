import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetScenarioLibrary,
    apiGetAiPersonas,
    apiGetInteractionModes,
    apiCreateScenario,
    apiUpdateScenario,
    apiDeleteScenario,
} from '@/services/ScenarioLibraryService'
import type {
    ScenarioLibraryItem,
    AiPersonaListItem,
    InteractionModeListItem,
    CreateScenarioRequest,
    UpdateScenarioRequest,
} from '../types'

export const SLICE_NAME = 'scenarioLibrary'

export interface ScenarioLibraryState {
    scenarioLibraryLoading: boolean
    initialized: boolean
    scenariosData: ScenarioLibraryItem[]
    personasData: AiPersonaListItem[]
    modesData: InteractionModeListItem[]
    personasLoading: boolean
    modesLoading: boolean
    error: string | null
    notification: { type: string; message: string } | null
}

export const fetchScenarioLibrary = createAsyncThunk(
    SLICE_NAME + '/fetchScenarioLibrary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGetScenarioLibrary()
            return response.scenarios
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'An unknown error occurred.' })
        }
    }
)

export const fetchPersonas = createAsyncThunk(
    SLICE_NAME + '/fetchPersonas',
    async (_, { rejectWithValue }) => {
        try {
            const data = await apiGetAiPersonas()
            return Array.isArray(data) ? data : []
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'An unknown error occurred.' })
        }
    }
)

export const fetchModes = createAsyncThunk(
    SLICE_NAME + '/fetchModes',
    async (_, { rejectWithValue }) => {
        try {
            const data = await apiGetInteractionModes()
            return Array.isArray(data) ? data : []
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'An unknown error occurred.' })
        }
    }
)

export const createScenario = createAsyncThunk(
    SLICE_NAME + '/createScenario',
    async (payload: CreateScenarioRequest, { rejectWithValue }) => {
        try {
            const data = await apiCreateScenario(payload)
            return data
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'An unknown error occurred.' })
        }
    }
)

export const updateScenario = createAsyncThunk(
    SLICE_NAME + '/updateScenario',
    async (
        { scenarioId, payload }: { scenarioId: string; payload: UpdateScenarioRequest },
        { rejectWithValue }
    ) => {
        try {
            const data = await apiUpdateScenario(scenarioId, payload)
            return data
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'An unknown error occurred.' })
        }
    }
)

export const deleteScenario = createAsyncThunk(
    SLICE_NAME + '/deleteScenario',
    async (scenarioId: string, { rejectWithValue }) => {
        try {
            await apiDeleteScenario(scenarioId)
            return scenarioId
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'An unknown error occurred.' })
        }
    }
)

const initialState: ScenarioLibraryState = {
    scenarioLibraryLoading: false,
    initialized: false,
    scenariosData: [],
    personasData: [],
    modesData: [],
    personasLoading: false,
    modesLoading: false,
    error: null,
    notification: null,
}

const scenarioLibrarySlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        resetError: (state) => {
            state.error = null
        },
        resetNotification: (state) => {
            state.notification = null
        },
        resetScenarioLibraryData: (state) => {
            state.scenariosData = []
            state.personasData = []
            state.modesData = []
            state.error = null
            state.notification = null
            state.scenarioLibraryLoading = false
            state.personasLoading = false
            state.modesLoading = false
            state.initialized = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchScenarioLibrary.pending, (state) => {
                state.scenarioLibraryLoading = true
            })
            .addCase(fetchScenarioLibrary.fulfilled, (state, action) => {
                state.scenariosData = action.payload
                state.scenarioLibraryLoading = false
                state.initialized = true
            })
            .addCase(fetchScenarioLibrary.rejected, (state, action) => {
                state.scenarioLibraryLoading = false
                state.error = (action.payload as { detail?: string })?.detail ?? null
                state.notification = { type: 'danger', message: 'Oops! Please try after sometime.' }
                state.initialized = true
            })
            .addCase(fetchPersonas.pending, (state) => {
                state.personasLoading = true
            })
            .addCase(fetchPersonas.fulfilled, (state, action) => {
                state.personasData = action.payload
                state.personasLoading = false
            })
            .addCase(fetchPersonas.rejected, (state) => {
                state.personasLoading = false
            })
            .addCase(fetchModes.pending, (state) => {
                state.modesLoading = true
            })
            .addCase(fetchModes.fulfilled, (state, action) => {
                state.modesData = action.payload
                state.modesLoading = false
            })
            .addCase(fetchModes.rejected, (state) => {
                state.modesLoading = false
            })
            .addCase(createScenario.pending, (state) => {
                state.scenarioLibraryLoading = true
                state.notification = null
            })
            .addCase(createScenario.fulfilled, (state, action) => {
                state.scenariosData = [action.payload, ...state.scenariosData]
                state.scenarioLibraryLoading = false
                state.notification = { type: 'success', message: 'Scenario created successfully!' }
            })
            .addCase(createScenario.rejected, (state, action) => {
                state.scenarioLibraryLoading = false
                const msg = (action.payload as { detail?: string })?.detail ?? 'Oops! Please try after sometime.'
                state.notification = { type: 'danger', message: msg }
            })
            .addCase(updateScenario.pending, (state) => {
                state.scenarioLibraryLoading = true
                state.notification = null
            })
            .addCase(updateScenario.fulfilled, (state, action) => {
                const index = state.scenariosData.findIndex(
                    (s) => s.scenario_id === action.payload.scenario_id
                )
                if (index > -1) {
                    state.scenariosData[index] = action.payload
                }
                state.scenarioLibraryLoading = false
                state.notification = { type: 'success', message: 'Scenario updated successfully!' }
            })
            .addCase(updateScenario.rejected, (state, action) => {
                state.scenarioLibraryLoading = false
                const msg = (action.payload as { detail?: string })?.detail ?? 'Oops! Please try after sometime.'
                state.notification = { type: 'danger', message: msg }
            })
            .addCase(deleteScenario.pending, (state) => {
                state.scenarioLibraryLoading = true
                state.notification = null
            })
            .addCase(deleteScenario.fulfilled, (state, action) => {
                state.scenariosData = state.scenariosData.filter(
                    (s) => s.scenario_id !== action.payload
                )
                state.scenarioLibraryLoading = false
                state.notification = { type: 'success', message: 'Scenario removed successfully!' }
            })
            .addCase(deleteScenario.rejected, (state, action) => {
                state.scenarioLibraryLoading = false
                const msg = (action.payload as { detail?: string })?.detail ?? 'Oops! Please try after sometime.'
                state.notification = { type: 'danger', message: msg }
            })
    },
})

export const { resetError, resetNotification, resetScenarioLibraryData } =
    scenarioLibrarySlice.actions

export default scenarioLibrarySlice.reducer
