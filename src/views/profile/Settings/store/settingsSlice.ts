import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { View, GetSettingsProfileResponse, GetSettingsNotificationResponse, GetSettingsBillingResponse, GetSettingsIntegrationResponse } from '../types'

// ---- Mock Data ----

const mockProfile: GetSettingsProfileResponse = {
    id: '1',
    name: 'Angelina Gotelli',
    firstName: 'Angelina',
    lastName: 'Gotelli',
    email: 'admin-01@ecme.com',
    img: '/img/avatars/thumb-1.jpg',
    location: 'New York, US',
    address: '123 Main Street',
    postcode: '10001',
    city: 'New York',
    country: 'US',
    dialCode: '+1',
    birthday: '1990-01-01',
    phoneNumber: '5551234567',
    industry: 'technology',
    products: [{ value: 'crm', label: 'CRM Software' }],
}

const mockNotification: GetSettingsNotificationResponse = {
    email: ['newsAndUpdate', 'tipsAndTutorial'],
    desktop: true,
    unreadMessageBadge: true,
    notifymeAbout: 'allNewMessage',
}

const mockBilling: GetSettingsBillingResponse = {
    paymentMethods: [
        {
            cardId: 'card-01',
            cardHolderName: 'Angelina Gotelli',
            cardType: 'VISA',
            expMonth: '12',
            expYear: '26',
            last4Number: '4242',
            primary: true,
        },
        {
            cardId: 'card-02',
            cardHolderName: 'Angelina Gotelli',
            cardType: 'MASTER',
            expMonth: '06',
            expYear: '27',
            last4Number: '8888',
            primary: false,
        },
    ],
    transactionHistory: [
        {
            id: '#TXN-001',
            item: 'Business Plan - Monthly',
            status: 'paid',
            amount: 59.0,
            date: 1700000000,
        },
        {
            id: '#TXN-002',
            item: 'Business Plan - Monthly',
            status: 'paid',
            amount: 59.0,
            date: 1697400000,
        },
        {
            id: '#TXN-003',
            item: 'Add-on: Extra Storage',
            status: 'pending',
            amount: 9.99,
            date: 1694800000,
        },
    ],
    currentPlan: {
        plan: 'Business Plan',
        status: 'active',
        billingCycle: 'monthly',
        nextPaymentDate: 1702600000,
        amount: 59.0,
    },
}

const mockIntegration: GetSettingsIntegrationResponse = [
    {
        id: 'int-01',
        name: 'Slack',
        desc: 'Post updates to your Slack channels automatically.',
        img: '/img/thumbs/slack.png',
        type: 'Communication',
        active: true,
        installed: true,
    },
    {
        id: 'int-02',
        name: 'Google Drive',
        desc: 'Access your Google Drive files within the app.',
        img: '/img/thumbs/google-drive.png',
        type: 'Storage',
        active: false,
        installed: true,
    },
    {
        id: 'int-03',
        name: 'Notion',
        desc: 'Sync your notes and knowledge base with Notion.',
        img: '/img/thumbs/notion.png',
        type: 'Productivity',
        active: true,
        installed: false,
    },
]

// ---- State type ----

export interface SettingsState {
    currentView: View
    profile: GetSettingsProfileResponse
    notification: GetSettingsNotificationResponse
    billing: GetSettingsBillingResponse
    integration: GetSettingsIntegrationResponse
}

const initialState: SettingsState = {
    currentView: 'profile',
    profile: mockProfile,
    notification: mockNotification,
    billing: mockBilling,
    integration: mockIntegration,
}

// ---- Slice ----

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setCurrentView(state, action: PayloadAction<View>) {
            state.currentView = action.payload
        },
        setProfile(state, action: PayloadAction<Partial<GetSettingsProfileResponse>>) {
            state.profile = { ...state.profile, ...action.payload }
        },
        setNotification(state, action: PayloadAction<GetSettingsNotificationResponse>) {
            state.notification = action.payload
        },
        setBilling(state, action: PayloadAction<GetSettingsBillingResponse>) {
            state.billing = action.payload
        },
        setIntegration(state, action: PayloadAction<GetSettingsIntegrationResponse>) {
            state.integration = action.payload
        },
    },
})

export const {
    setCurrentView,
    setProfile,
    setNotification,
    setBilling,
    setIntegration,
} = settingsSlice.actions

export default settingsSlice.reducer
