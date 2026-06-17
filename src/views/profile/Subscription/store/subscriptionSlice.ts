import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import type { RootState } from '@/store/rootReducer'
import {
    apiGetMySubscription,
    pickActiveUserSubscription,
    type UserSubscriptionRecord,
} from '@/services/SubscriptionService'
import type { PaymentCycle, SelectedPlan, SubscriptionPlansData } from '../types'

// ---- Mock Plans Data ----

const mockPlansData: SubscriptionPlansData = {
    featuresModel: [
        { id: 'taskManagement', description: 'Task management' },
        { id: 'managementTools', description: 'Management tools' },
        { id: 'reporting', description: 'Report generator' },
        { id: 'support', description: 'Customer support' },
        { id: 'fileSharing', description: 'Files sharing' },
        { id: 'advancedSecurity', description: 'Advanced security protocols' },
        { id: 'customIntegrations', description: 'Third party service integration' },
    ],
    plans: [
        {
            id: 'basic',
            name: 'Basic',
            description: 'Essential features for individuals getting started with sales training.',
            price: { monthly: 19, annually: 190 },
            features: ['taskManagement', 'managementTools', 'reporting', 'support', 'fileSharing'],
            recommended: false,
        },
        {
            id: 'standard',
            name: 'Standard',
            description: 'Advanced tools for growing teams to boost performance and collaboration.',
            price: { monthly: 49, annually: 490 },
            features: ['taskManagement', 'managementTools', 'reporting', 'support', 'fileSharing', 'advancedSecurity'],
            recommended: true,
        },
        {
            id: 'pro',
            name: 'Professional',
            description: 'Full suite of features for enterprises with premium support and insights.',
            price: { monthly: 99, annually: 990 },
            features: ['taskManagement', 'managementTools', 'reporting', 'support', 'fileSharing', 'advancedSecurity', 'customIntegrations'],
            recommended: false,
        },
    ],
}

// ---- Mock Current Plan Data ----

const mockCurrentPlan = {
    plan: 'Standard',
    planId: 'standard',
    status: 'active' as const,
    billingCycle: 'monthly' as PaymentCycle,
    nextPaymentDate: 1740700000,
    amount: 49,
    sessionsUsed: 3595,
    sessionsTotal: 87711,
    daysRemaining: 18,
    renewalDate: '2026-03-01',
}

// ---- State ----

export interface SubscriptionState {
    paymentCycle: PaymentCycle
    paymentDialog: boolean
    selectedPlan: Partial<SelectedPlan>
    plansData: SubscriptionPlansData
    currentPlan: typeof mockCurrentPlan
    activeUserSubscription: UserSubscriptionRecord | null
    userSubscriptionLoading: boolean
    userSubscriptionInitialized: boolean
    userSubscriptionError: string | null
}

const initialState: SubscriptionState = {
    paymentCycle: 'monthly',
    paymentDialog: false,
    selectedPlan: {},
    plansData: mockPlansData,
    currentPlan: mockCurrentPlan,
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

// ---- Slice ----

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
            state.activeUserSubscription = null
            state.userSubscriptionLoading = false
            state.userSubscriptionInitialized = false
            state.userSubscriptionError = null
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
