import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import {
    apiGetSalesDivisions,
    apiGetSalesDivisionInfo,
    apiCreateSalesDivision,
    apiUpdateSalesDivision,
    apiDeleteSalesDivision,
    type SalesDivision,
    type SalesDivisionInfo,
    type CreateDivisionRequest,
    type UpdateDivisionRequest,
} from '@/services/SalesDivisionsService'

export const SLICE_NAME = 'salesDivisions'

export interface SalesDivisionsState {
    divisionsLoading: boolean
    initialized: boolean
    divisionsData: SalesDivision[]
    divisionInfo: Record<string, SalesDivisionInfo>
    infoLoading: boolean
    error: string | null
    notification: { type: string; message: string } | null
}

export const fetchSalesDivisions = createAsyncThunk(
    SLICE_NAME + '/fetchSalesDivisions',
    async (companyId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetSalesDivisions(companyId)
            return response
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to fetch divisions data.' })
        }
    }
)

export const fetchDivisionInfo = createAsyncThunk(
    SLICE_NAME + '/fetchDivisionInfo',
    async (divisionId: string, { rejectWithValue }) => {
        try {
            const response = await apiGetSalesDivisionInfo(divisionId)
            return { divisionId, data: response }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to fetch division info.' })
        }
    }
)

export const createDivision = createAsyncThunk(
    SLICE_NAME + '/createDivision',
    async (payload: CreateDivisionRequest, { rejectWithValue }) => {
        try {
            const data = await apiCreateSalesDivision(payload)
            return data
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to create division.' })
        }
    }
)

export const updateDivision = createAsyncThunk(
    SLICE_NAME + '/updateDivision',
    async (
        { divisionId, payload }: { divisionId: string; payload: UpdateDivisionRequest },
        { rejectWithValue }
    ) => {
        try {
            const data = await apiUpdateSalesDivision(divisionId, payload)
            return data
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to update division.' })
        }
    }
)

export const deleteDivision = createAsyncThunk(
    SLICE_NAME + '/deleteDivision',
    async (divisionId: string, { rejectWithValue }) => {
        try {
            await apiDeleteSalesDivision(divisionId)
            return divisionId
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to delete division.' })
        }
    }
)

const initialState: SalesDivisionsState = {
    divisionsLoading: false,
    initialized: false,
    divisionsData: [],
    divisionInfo: {},
    infoLoading: false,
    error: null,
    notification: null,
}

const salesDivisionsSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        resetError: (state) => {
            state.error = null
        },
        resetNotification: (state) => {
            state.notification = null
        },
        resetSalesDivisionsData: (state) => {
            state.divisionsData = []
            state.divisionInfo = {}
            state.error = null
            state.notification = null
            state.divisionsLoading = false
            state.infoLoading = false
            state.initialized = false
        },
        removeDivisionMemberLocally: (
            state,
            action: PayloadAction<{ divisionId: string; userId: string }>,
        ) => {
            const info = state.divisionInfo[action.payload.divisionId]
            if (!info?.users) return
            info.users = info.users.filter(
                (u) => u.user_id !== action.payload.userId,
            )
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesDivisions.pending, (state) => {
                state.divisionsLoading = true
            })
            .addCase(fetchSalesDivisions.fulfilled, (state, action) => {
                state.divisionsData = action.payload
                state.divisionsLoading = false
                state.initialized = true
            })
            .addCase(fetchSalesDivisions.rejected, (state, action) => {
                state.divisionsLoading = false
                state.error = (action.payload as { detail?: string })?.detail ?? null
                state.notification = { 
                    type: 'danger', 
                    message: 'Failed to load divisions. Please try again.' 
                }
                state.initialized = true
            })
            .addCase(fetchDivisionInfo.pending, (state) => {
                state.infoLoading = true
            })
            .addCase(fetchDivisionInfo.fulfilled, (state, action) => {
                state.divisionInfo[action.payload.divisionId] = action.payload.data
                state.infoLoading = false
            })
            .addCase(fetchDivisionInfo.rejected, (state) => {
                state.infoLoading = false
            })
            .addCase(createDivision.pending, (state) => {
                state.divisionsLoading = true
                state.notification = null
            })
            .addCase(createDivision.fulfilled, (state, action) => {
                state.divisionsData = [action.payload, ...state.divisionsData]
                state.divisionsLoading = false
                state.notification = { 
                    type: 'success', 
                    message: 'Division created successfully!' 
                }
            })
            .addCase(createDivision.rejected, (state, action) => {
                state.divisionsLoading = false
                const msg = (action.payload as { detail?: string })?.detail ?? 'Failed to create division.'
                state.notification = { type: 'danger', message: msg }
            })
            .addCase(updateDivision.pending, (state) => {
                state.divisionsLoading = true
                state.notification = null
            })
            .addCase(updateDivision.fulfilled, (state, action) => {
                const index = state.divisionsData.findIndex(
                    (d) => d.sales_division_id === action.payload.sales_division_id
                )
                if (index > -1) {
                    state.divisionsData[index] = action.payload
                }
                // Invalidate cached division info so persona picker / segment
                // consumers refetch and don't keep a stale customer_segment.
                delete state.divisionInfo[action.payload.sales_division_id]
                state.divisionsLoading = false
                state.notification = { 
                    type: 'success', 
                    message: 'Division updated successfully!' 
                }
            })
            .addCase(updateDivision.rejected, (state, action) => {
                state.divisionsLoading = false
                const msg = (action.payload as { detail?: string })?.detail ?? 'Failed to update division.'
                state.notification = { type: 'danger', message: msg }
            })
            .addCase(deleteDivision.pending, (state) => {
                state.divisionsLoading = true
                state.notification = null
            })
            .addCase(deleteDivision.fulfilled, (state, action) => {
                state.divisionsData = state.divisionsData.filter(
                    (d) => d.sales_division_id !== action.payload
                )
                delete state.divisionInfo[action.payload]
                state.divisionsLoading = false
                state.notification = { 
                    type: 'success', 
                    message: 'Division removed successfully!' 
                }
            })
            .addCase(deleteDivision.rejected, (state, action) => {
                state.divisionsLoading = false
                const msg = (action.payload as { detail?: string })?.detail ?? 'Failed to delete division.'
                state.notification = { type: 'danger', message: msg }
            })
    },
})

export const {
    resetError,
    resetNotification,
    resetSalesDivisionsData,
    removeDivisionMemberLocally,
} =
    salesDivisionsSlice.actions

export default salesDivisionsSlice.reducer
