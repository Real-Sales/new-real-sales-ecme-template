import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGetIndustries } from '@/services/IndustryService'
import type { IndustryCatalogItem } from '@/services/IndustryService'
import type { RootState } from '@/store/rootReducer'

export const SLICE_NAME = 'industriesCatalog'

export type IndustriesCatalogState = {
    industries: IndustryCatalogItem[]
    loading: boolean
    initialized: boolean
    error: string | null
}

export const fetchIndustries = createAsyncThunk(
    SLICE_NAME + '/fetchIndustries',
    async (_, { rejectWithValue }) => {
        try {
            const data = await apiGetIndustries()
            return Array.isArray(data) ? data : []
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to load industries.' })
        }
    },
    {
        condition: (_, { getState }) => {
            const { loading, initialized } = (getState() as RootState).industriesCatalog
            return !loading && !initialized
        },
    },
)

const initialState: IndustriesCatalogState = {
    industries: [],
    loading: false,
    initialized: false,
    error: null,
}

const industriesCatalogSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        resetIndustriesCatalog(state) {
            state.industries = []
            state.loading = false
            state.initialized = false
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchIndustries.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchIndustries.fulfilled, (state, action) => {
                state.loading = false
                state.initialized = true
                state.industries = action.payload
            })
            .addCase(fetchIndustries.rejected, (state, action) => {
                state.loading = false
                state.initialized = true
                state.error =
                    (action.payload as { detail?: string })?.detail ??
                    'Failed to load industries.'
            })
    },
})

export const { resetIndustriesCatalog } = industriesCatalogSlice.actions
export default industriesCatalogSlice.reducer
