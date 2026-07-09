import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import {
    apiGetScenarioLibrary,
    apiGetAiPersonas,
    apiGetInteractionModes,
    apiCreateScenario,
    apiUpdateScenario,
    apiDeleteScenario,
    apiGetSalesRepScenarioDashboard,
    apiGetScenarioAssignmentStatus,
    type AssignmentStatusMember,
} from '@/services/ScenarioLibraryService'
import type {
    ScenarioLibraryItem,
    AiPersonaListItem,
    InteractionModeListItem,
    CreateScenarioRequest,
    UpdateScenarioRequest,
    Scenario,
} from '../types'
import { mapSalesRepDashboardRowToScenario } from '../types'
import { formatDisplayLabel } from '@/utils/formatDisplayLabel'
import type { ProfileProduct } from '@/@types/auth'
import type { RootState } from '@/store'

export const SLICE_NAME = 'scenarioLibrary'

export type FetchPersonasParams = {
    industryId?: string
    customerSegmentId?: string
    includePersonaId?: string
}

export type AssignScenarioMemberRow = {
    userId: string
    name: string
    email: string
    salesDivision: string
    products: { id: string; name: string }[]
    canAssign: boolean
    sessionId: string | null
    sessionStatus: string | null
}

export type AssignScenarioCacheEntry = {
    salesDivisionId?: string | null
    salesDivisionName?: string | null
    members: AssignScenarioMemberRow[]
    fetchedAt: number
}

/** Cache TTL — refetch after this age. */
export const ASSIGN_SCENARIO_CACHE_TTL_MS = 5 * 60 * 1000
/** Max scenario keys kept in memory (oldest evicted first). */
export const ASSIGN_SCENARIO_CACHE_MAX_KEYS = 50

export function isAssignScenarioCacheFresh(
    entry: AssignScenarioCacheEntry | undefined,
): boolean {
    if (!entry) return false
    return Date.now() - entry.fetchedAt < ASSIGN_SCENARIO_CACHE_TTL_MS
}

function pruneAssignScenarioCache(
    cache: Record<string, AssignScenarioCacheEntry>,
) {
    const ids = Object.keys(cache)
    if (ids.length <= ASSIGN_SCENARIO_CACHE_MAX_KEYS) return

    ids.sort(
        (a, b) => (cache[a]?.fetchedAt ?? 0) - (cache[b]?.fetchedAt ?? 0),
    )
    for (let i = 0; i < ids.length - ASSIGN_SCENARIO_CACHE_MAX_KEYS; i++) {
        delete cache[ids[i]]
    }
}

function mapMemberProducts(products?: ProfileProduct[]) {
    const seen = new Set<string>()
    return (products ?? [])
        .filter((product) => {
            if (!product.product_id || seen.has(product.product_id)) {
                return false
            }
            seen.add(product.product_id)
            return true
        })
        .map((product) => ({
            id: product.product_id,
            name: formatDisplayLabel(product.name),
        }))
}

function mapAssignmentStatusMember(member: AssignmentStatusMember): AssignScenarioMemberRow {
    const name = `${member.first_name} ${member.last_name}`.trim()
    return {
        userId: member.user_id,
        name: name || member.email,
        email: member.email,
        salesDivision: member.sales_division_name?.trim() || '—',
        products: mapMemberProducts(member.products),
        canAssign: member.can_assign,
        sessionId: member.session_id,
        sessionStatus: member.session_status,
    }
}

export interface ScenarioLibraryState {
    scenarioLibraryLoading: boolean
    initialized: boolean
    scenariosData: ScenarioLibraryItem[]
    personasData: AiPersonaListItem[]
    modesData: InteractionModeListItem[]
    personasLoading: boolean
    modesLoading: boolean
    modesInitialized: boolean
    salesRepScenarios: Scenario[]
    salesRepTotalPending: number
    salesRepLoading: boolean
    salesRepInitialized: boolean
    /** Cached assign-dialog members keyed by scenario_id. */
    assignScenarioById: Record<string, AssignScenarioCacheEntry>
    assignScenarioLoadingScenarioId: string | null
    assignScenarioError: string | null
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
    async (params: FetchPersonasParams | undefined, { rejectWithValue }) => {
        try {
            const data = await apiGetAiPersonas(params)
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

export const fetchSalesRepDashboard = createAsyncThunk(
    SLICE_NAME + '/fetchSalesRepDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const data = await apiGetSalesRepScenarioDashboard()
            const allRows = [
                ...(data?.pending_scenarios ?? []),
                ...(data?.active_scenarios ?? []),
                ...(data?.completed_scenarios ?? []),
                ...(data?.expired_scenarios ?? []),
            ]
            return {
                scenarios: allRows.map(mapSalesRepDashboardRowToScenario),
                totalPending:
                    typeof data?.total_pending === 'number' ? data.total_pending : 0,
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to load assigned scenarios.' })
        }
    },
)

export const fetchScenarioAssignmentStatus = createAsyncThunk(
    SLICE_NAME + '/fetchScenarioAssignmentStatus',
    async (scenarioId: string, { rejectWithValue }) => {
        try {
            const data = await apiGetScenarioAssignmentStatus(scenarioId)
            return {
                scenarioId: data.scenario_id,
                salesDivisionId: data.sales_division_id,
                salesDivisionName: data.sales_division_name,
                members: (data.members ?? []).map(mapAssignmentStatusMember),
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to load assignable members.' })
        }
    },
    {
        condition: (scenarioId, { getState }) => {
            const data = (getState() as RootState).scenarioLibrary?.data
            if (!data) return true
            if (data.assignScenarioLoadingScenarioId === scenarioId) return false
            return !isAssignScenarioCacheFresh(data.assignScenarioById[scenarioId])
        },
    },
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
    modesInitialized: false,
    salesRepScenarios: [],
    salesRepTotalPending: 0,
    salesRepLoading: false,
    salesRepInitialized: false,
    assignScenarioById: {},
    assignScenarioLoadingScenarioId: null,
    assignScenarioError: null,
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
            state.salesRepScenarios = []
            state.salesRepTotalPending = 0
            state.salesRepInitialized = false
            state.assignScenarioById = {}
            state.assignScenarioLoadingScenarioId = null
            state.assignScenarioError = null
            state.error = null
            state.notification = null
            state.scenarioLibraryLoading = false
            state.salesRepLoading = false
            state.personasLoading = false
            state.modesLoading = false
            state.modesInitialized = false
            state.initialized = false
        },
        invalidateAssignScenarioCache: (
            state,
            action: PayloadAction<string | undefined>,
        ) => {
            if (action.payload) {
                delete state.assignScenarioById[action.payload]
                return
            }
            state.assignScenarioById = {}
        },
        markScenarioMemberAssigned: (
            state,
            action: PayloadAction<{
                scenarioId: string
                userId: string
                sessionId: string
            }>,
        ) => {
            const entry = state.assignScenarioById[action.payload.scenarioId]
            const member = entry?.members.find(
                (row) => row.userId === action.payload.userId,
            )
            if (member) {
                member.canAssign = false
                member.sessionId = action.payload.sessionId
                member.sessionStatus = 'pending'
            }
        },
        markScenarioMemberUnassigned: (
            state,
            action: PayloadAction<{
                scenarioId: string
                sessionId: string
            }>,
        ) => {
            const entry = state.assignScenarioById[action.payload.scenarioId]
            const member = entry?.members.find(
                (row) => row.sessionId === action.payload.sessionId,
            )
            if (member) {
                member.canAssign = true
                member.sessionId = null
                member.sessionStatus = null
            }
        },
        invalidateSalesRepDashboard: (state) => {
            state.salesRepInitialized = false
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
                state.modesInitialized = true
            })
            .addCase(fetchModes.rejected, (state, action) => {
                state.modesLoading = false
                state.modesInitialized = true
                state.notification = {
                    type: 'danger',
                    message:
                        (action.payload as { detail?: string })?.detail ??
                        'Failed to load interaction modes.',
                }
            })
            .addCase(fetchSalesRepDashboard.pending, (state) => {
                state.salesRepLoading = true
            })
            .addCase(fetchSalesRepDashboard.fulfilled, (state, action) => {
                state.salesRepScenarios = action.payload.scenarios
                state.salesRepTotalPending = action.payload.totalPending
                state.salesRepLoading = false
                state.salesRepInitialized = true
            })
            .addCase(fetchSalesRepDashboard.rejected, (state, action) => {
                state.salesRepLoading = false
                state.salesRepScenarios = []
                state.salesRepTotalPending = 0
                state.salesRepInitialized = true
                state.notification = {
                    type: 'danger',
                    message:
                        (action.payload as { detail?: string })?.detail ??
                        'Failed to load assigned scenarios',
                }
            })
            .addCase(fetchScenarioAssignmentStatus.pending, (state, action) => {
                state.assignScenarioLoadingScenarioId = action.meta.arg
                state.assignScenarioError = null
            })
            .addCase(fetchScenarioAssignmentStatus.fulfilled, (state, action) => {
                state.assignScenarioLoadingScenarioId = null
                state.assignScenarioById[action.payload.scenarioId] = {
                    salesDivisionId: action.payload.salesDivisionId,
                    salesDivisionName: action.payload.salesDivisionName,
                    members: action.payload.members,
                    fetchedAt: Date.now(),
                }
                pruneAssignScenarioCache(state.assignScenarioById)
            })
            .addCase(fetchScenarioAssignmentStatus.rejected, (state, action) => {
                state.assignScenarioLoadingScenarioId = null
                state.assignScenarioError =
                    (action.payload as { detail?: string })?.detail ??
                    'Failed to load team members.'
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
                delete state.assignScenarioById[action.payload]
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

export const {
    resetError,
    resetNotification,
    resetScenarioLibraryData,
    invalidateAssignScenarioCache,
    markScenarioMemberAssigned,
    markScenarioMemberUnassigned,
    invalidateSalesRepDashboard,
} = scenarioLibrarySlice.actions

export default scenarioLibrarySlice.reducer
