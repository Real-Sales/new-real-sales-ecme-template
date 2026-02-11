import { createSlice, PayloadAction } from '@reduxjs/toolkit'
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
}

const initialState: SubscriptionState = {
    paymentCycle: 'monthly',
    paymentDialog: false,
    selectedPlan: {},
    plansData: mockPlansData,
    currentPlan: mockCurrentPlan,
}

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
    },
})

export const {
    setPaymentCycle,
    setPaymentDialog,
    setSelectedPlan,
} = subscriptionSlice.actions

export default subscriptionSlice.reducer
