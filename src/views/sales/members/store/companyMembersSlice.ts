import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { apiGetCompanyMembers } from '@/services/SalesCompanyService'
import { resolveSalesCompanyContext } from '@/utils/companyScope'
import { mapCompanyMember, type CompanyMemberRow } from '../types'

export const SLICE_NAME = 'companyMembers'

export interface CompanyMembersState {
    membersLoading: boolean
    initialized: boolean
    companyName: string
    salesCompanyId: string | null
    companyManagerId: string | null
    totalMembers: number
    activeMembers: number
    membersData: CompanyMemberRow[]
    error: string | null
    notification: { type: string; message: string } | null
}

export const fetchCompanyMembers = createAsyncThunk(
    SLICE_NAME + '/fetchCompanyMembers',
    async (
        {
            userId,
            companyId,
        }: { userId?: string; companyId?: string },
        { rejectWithValue },
    ) => {
        try {
            const companyCtx = await resolveSalesCompanyContext(userId, companyId)
            if (!companyCtx?.salesCompanyId) {
                return rejectWithValue({
                    detail: 'No company found for this account.',
                })
            }

            const data = await apiGetCompanyMembers(companyCtx.salesCompanyId)
            return {
                salesCompanyId: companyCtx.salesCompanyId,
                companyName: companyCtx.companyName,
                companyManagerId: companyCtx.managerId ?? null,
                totalMembers: data.total_members,
                activeMembers: data.active_members,
                members: (data.members ?? []).map(mapCompanyMember),
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            if (err.response?.data) {
                return rejectWithValue(err.response.data)
            }
            return rejectWithValue({ detail: 'Failed to load company members.' })
        }
    },
)

const initialState: CompanyMembersState = {
    membersLoading: false,
    initialized: false,
    companyName: '',
    salesCompanyId: null,
    companyManagerId: null,
    totalMembers: 0,
    activeMembers: 0,
    membersData: [],
    error: null,
    notification: null,
}

const companyMembersSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        resetError: (state) => {
            state.error = null
        },
        resetNotification: (state) => {
            state.notification = null
        },
        resetCompanyMembersData: (state) => {
            state.membersLoading = false
            state.initialized = false
            state.companyName = ''
            state.salesCompanyId = null
            state.companyManagerId = null
            state.totalMembers = 0
            state.activeMembers = 0
            state.membersData = []
            state.error = null
            state.notification = null
        },
        updateMemberRow: (state, action: PayloadAction<CompanyMemberRow>) => {
            const index = state.membersData.findIndex(
                (m) => m.user_id === action.payload.user_id,
            )
            if (index >= 0) {
                state.membersData[index] = action.payload
            }
            state.activeMembers = state.membersData.filter((m) => m.status_active).length
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompanyMembers.pending, (state) => {
                state.membersLoading = true
                state.error = null
            })
            .addCase(fetchCompanyMembers.fulfilled, (state, action) => {
                state.membersLoading = false
                state.initialized = true
                state.salesCompanyId = action.payload.salesCompanyId
                state.companyName = action.payload.companyName
                state.companyManagerId = action.payload.companyManagerId
                state.totalMembers = action.payload.totalMembers
                state.activeMembers = action.payload.activeMembers
                state.membersData = action.payload.members
            })
            .addCase(fetchCompanyMembers.rejected, (state, action) => {
                state.membersLoading = false
                state.initialized = true
                state.membersData = []
                state.companyName = ''
                state.salesCompanyId = null
                state.companyManagerId = null
                state.totalMembers = 0
                state.activeMembers = 0
                state.error =
                    (action.payload as { detail?: string })?.detail ?? null
                state.notification = {
                    type: 'danger',
                    message:
                        (action.payload as { detail?: string })?.detail ??
                        'Failed to load company members. Please try again.',
                }
            })
    },
})

export const { resetError, resetNotification, resetCompanyMembersData, updateMemberRow } =
    companyMembersSlice.actions

export default companyMembersSlice.reducer
