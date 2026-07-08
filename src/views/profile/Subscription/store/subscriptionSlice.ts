import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import type { RootState } from '@/store/rootReducer'
import {
    apiGetMySubscription,
    apiGetSubscriptionPlans,
    pickActiveUserSubscription,
    type ApiSubscription,
    type UserSubscriptionRecord,
} from '@/services/SubscriptionService'
import type { PaymentCycle, SelectedPlan } from '../types'

export interface SubscriptionState {
    paymentCycle: PaymentCycle
    paymentDialog: boolean
    selectedPlan: Partial<SelectedPlan>
    subscriptionPlans: ApiSubscription[]
    plansLoading: boolean
    plansError: string | null
    activeUserSubscription: UserSubscriptionRecord | null
    userSubscriptionLoading: boolean
    userSubscriptionInitialized: boolean
    userSubscriptionError: string | null
}

const initialState: SubscriptionState = {
    paymentCycle: 'monthly',
    paymentDialog: false,
    selectedPlan: {},
    subscriptionPlans: [],
    plansLoading: false,
    plansError: null,
    activeUserSubscription: null,
    userSubscriptionLoading: false,
    userSubscriptionInitialized: false,
    userSubscriptionError: null,
}

export function subscriptionRowsFromProfile(
    rows: UserSubscriptionRecord[] | null | undefined,
): UserSubscriptionRecord | null {
    if (!Array.isArray(rows)) {
        return null
    }
    return pickActiveUserSubscription(rows)
}

export const billingCycleFromPaymentCycle = (
    cycle: PaymentCycle,
): 'monthly' | 'yearly' => (cycle === 'annually' ? 'yearly' : 'monthly')

export const fetchMySubscription = createAsyncThunk(
    'subscription/fetchMySubscription',
    async (_, { rejectWithValue }) => {
        try {
            return await apiGetMySubscription()
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null
            }
            const detail =
                (error as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Unable to load subscription.'
            return rejectWithValue(detail)
        }
    },
    {
        condition: (_, { getState }) => {
            const state = (getState() as RootState).subscription
            if (state.userSubscriptionLoading || state.userSubscriptionInitialized) {
                return false
            }
            return Boolean((getState() as RootState).auth.user.userId?.trim())
        },
    },
)

export const fetchSubscriptionPlans = createAsyncThunk(
    'subscription/fetchSubscriptionPlans',
    async (billingCycle: 'monthly' | 'yearly', { rejectWithValue }) => {
        try {
            const data = await apiGetSubscriptionPlans(billingCycle)
            return Array.isArray(data) ? data : []
        } catch (error: unknown) {
            const detail =
                (error as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Unable to load subscription plans.'
            return rejectWithValue(detail)
        }
    },
)

const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        setPaymentCycle(state, action: PayloadAction<PaymentCycle>) {
            state.paymentCycle = action.payload
        },
        setPaymentDialog(state, action: PayloadAction<boolean>) {
            state.paymentDialog = action.payload
        },
        setSelectedPlan(state, action: PayloadAction<Partial<SelectedPlan>>) {
            state.selectedPlan = action.payload
        },
        setActiveUserSubscription(state, action: PayloadAction<UserSubscriptionRecord | null>) {
            state.activeUserSubscription = action.payload
            state.userSubscriptionInitialized = true
            state.userSubscriptionLoading = false
            state.userSubscriptionError = null
        },
        resetSubscriptionData(state) {
            state.subscriptionPlans = []
            state.plansLoading = false
            state.plansError = null
            state.activeUserSubscription = null
            state.userSubscriptionLoading = false
            state.userSubscriptionInitialized = false
            state.userSubscriptionError = null
            state.paymentDialog = false
            state.selectedPlan = {}
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMySubscription.pending, (state) => {
                state.userSubscriptionLoading = true
                state.userSubscriptionError = null
            })
            .addCase(fetchMySubscription.fulfilled, (state, action) => {
                state.userSubscriptionLoading = false
                state.userSubscriptionInitialized = true
                state.activeUserSubscription = action.payload
            })
            .addCase(fetchMySubscription.rejected, (state, action) => {
                state.userSubscriptionLoading = false
                state.userSubscriptionInitialized = true
                state.activeUserSubscription = null
                state.userSubscriptionError =
                    (action.payload as string) ?? 'Unable to load subscription.'
            })
            .addCase(fetchSubscriptionPlans.pending, (state) => {
                state.plansLoading = true
                state.plansError = null
            })
            .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
                state.plansLoading = false
                state.subscriptionPlans = action.payload
            })
            .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
                state.plansLoading = false
                state.plansError =
                    (action.payload as string) ?? 'Unable to load subscription plans.'
                state.subscriptionPlans = []
            })
    },
})

export const {
    setPaymentCycle,
    setPaymentDialog,
    setSelectedPlan,
    setActiveUserSubscription,
    resetSubscriptionData,
} = subscriptionSlice.actions

export default subscriptionSlice.reducer
