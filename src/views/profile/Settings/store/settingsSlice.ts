import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import {
    apiGetUserProfile,
    apiPatchPersonalProfile,
    apiPatchCompanyProfile,
} from '@/services/AuthService'
import type {
    UserProfile,
    CompanyProfileUpdateRequest,
    PersonalProfileUpdateRequest,
} from '@/@types/auth'
import { setUser, type UserState } from '@/store/slices/auth/userSlice'
import type { RootState } from '@/store/rootReducer'
import type {
    View,
    GetSettingsProfileResponse,
    GetSettingsNotificationResponse,
    GetSettingsBillingResponse,
    GetSettingsIntegrationResponse,
} from '../types'
import { formatDisplayLabel } from '@/utils/formatDisplayLabel'
import {
    setActiveUserSubscription,
    subscriptionRowsFromProfile,
} from '@/views/profile/Subscription/store/subscriptionSlice'

export const SLICE_NAME = 'settings'

const normalizeIndustryKey = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, '_')

const formatIndustryLabel = formatDisplayLabel

const normalizePhone = (value: string | null | undefined) => {
    if (value == null) return ''
    const trimmed = String(value).trim()
    if (!trimmed || trimmed.toLowerCase() === 'null') return ''
    return trimmed
}

const emptyProfile: GetSettingsProfileResponse = {
    id: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    img: '',
    location: '',
    address: '',
    postcode: '',
    city: '',
    country: '',
    dialCode: '+1',
    birthday: '',
    phoneNumber: '',
    industry: '',
    industryLabel: '',
    products: [],
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyProducts: [],
    hasCompany: false,
    salesCompanyId: '',
    companyIndustry: '',
    companyIndustryId: '',
    selectedProductIds: [],
}

export function mapUserProfileToSettings(
    profile: UserProfile | null | undefined,
): GetSettingsProfileResponse {
    if (!profile?.user_id) {
        return emptyProfile
    }

    const company = profile.company
    const companyProducts = company?.products ?? []

    return {
        id: profile.user_id,
        name: `${profile.first_name} ${profile.last_name}`.trim(),
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        img: '',
        location: company?.address ?? '',
        address: company?.address ?? '',
        postcode: '',
        city: '',
        country: '',
        dialCode: '+1',
        birthday: '',
        phoneNumber: normalizePhone(profile.phone_number),
        industry: company?.industry ? normalizeIndustryKey(company.industry) : '',
        industryLabel: company?.industry ? formatIndustryLabel(company.industry) : '',
        products: companyProducts.map((p) => ({
            value: p.product_id || normalizeIndustryKey(p.name),
            label: formatIndustryLabel(p.name),
        })),
        companyName: company?.name ?? '',
        companyEmail: company?.email ?? '',
        companyPhone: normalizePhone(company?.phone_number),
        companyProducts,
        hasCompany: Boolean(company),
        salesCompanyId: company?.sales_company_id ?? '',
        companyIndustry: company?.industry ?? '',
        companyIndustryId: company?.industry_id ?? '',
        selectedProductIds: companyProducts.map((p) => p.product_id).filter(Boolean),
    }
}

export function mapUserProfileToAuthUser(
    profile: UserProfile,
    preserve?: Pick<UserState, 'avatar' | 'authority' | 'isNewUser'>,
): UserState {
    const company = profile.company

    return {
        userId: profile.user_id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phoneNumber: profile.phone_number ?? '',
        userName: `${profile.first_name} ${profile.last_name}`.trim(),
        role: profile.role?.name ?? '',
        companyId: profile.company_id ?? company?.sales_company_id ?? '',
        companyName: company?.name ?? '',
        industry: company?.industry ?? '',
        industryId: company?.industry_id ?? '',
        industryProducts: (company?.products ?? [])
            .map((p) => p.product_id)
            .filter(Boolean),
        avatar: preserve?.avatar,
        authority: preserve?.authority,
        isNewUser: preserve?.isNewUser,
    }
}

function syncAuthUserFromProfile(
    profile: UserProfile,
    getState: () => RootState,
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
) {
    const authUser = getState().auth.user
    dispatch(
        setUser(
            mapUserProfileToAuthUser(profile, {
                avatar: authUser.avatar,
                authority: authUser.authority,
                isNewUser: authUser.isNewUser,
            }),
        ),
    )
    dispatch(
        setActiveUserSubscription(subscriptionRowsFromProfile(profile.user_subscriptions)),
    )
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

export interface SettingsState {
    currentView: View
    profile: GetSettingsProfileResponse
    profileLoading: boolean
    profileInitialized: boolean
    profileError: string | null
    profileSaving: boolean
    profileSaveError: string | null
    notification: GetSettingsNotificationResponse
    billing: GetSettingsBillingResponse
    integration: GetSettingsIntegrationResponse
}

export type SaveProfileSettingsPayload = {
    personal: PersonalProfileUpdateRequest
    company?: CompanyProfileUpdateRequest
}

function getApiErrorPayload(error: unknown) {
    const err = error as { response?: { data?: { detail?: string } } }
    return err.response?.data ?? { detail: 'Request failed.' }
}

export const saveProfileSettings = createAsyncThunk(
    SLICE_NAME + '/saveProfileSettings',
    async (payload: SaveProfileSettingsPayload, { dispatch, getState, rejectWithValue }) => {
        try {
            let profile = await apiPatchPersonalProfile(payload.personal)

            if (payload.company) {
                profile = await apiPatchCompanyProfile(payload.company)
            }

            syncAuthUserFromProfile(profile, getState, dispatch)
            return profile
        } catch (error: unknown) {
            return rejectWithValue(getApiErrorPayload(error))
        }
    },
)

export const updateCompanyProfile = createAsyncThunk(
    SLICE_NAME + '/updateCompanyProfile',
    async (payload: CompanyProfileUpdateRequest, { dispatch, getState, rejectWithValue }) => {
        try {
            const profile = await apiPatchCompanyProfile(payload)
            syncAuthUserFromProfile(profile, getState, dispatch)
            return profile
        } catch (error: unknown) {
            return rejectWithValue(getApiErrorPayload(error))
        }
    },
)

export const fetchUserProfile = createAsyncThunk(
    SLICE_NAME + '/fetchUserProfile',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const profile = await apiGetUserProfile()
            syncAuthUserFromProfile(profile, getState, dispatch)
            return profile
        } catch (error: unknown) {
            return rejectWithValue(getApiErrorPayload(error))
        }
    },
)

const initialState: SettingsState = {
    currentView: 'profile',
    profile: emptyProfile,
    profileLoading: false,
    profileInitialized: false,
    profileError: null,
    profileSaving: false,
    profileSaveError: null,
    notification: mockNotification,
    billing: mockBilling,
    integration: mockIntegration,
}

const settingsSlice = createSlice({
    name: SLICE_NAME,
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
        resetProfileData(state) {
            state.profile = emptyProfile
            state.profileLoading = false
            state.profileInitialized = false
            state.profileError = null
            state.profileSaving = false
            state.profileSaveError = null
        },
        clearProfileSaveError(state) {
            state.profileSaveError = null
        },
        resetProfileSaving(state) {
            state.profileSaving = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.profileLoading = true
                state.profileError = null
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profileLoading = false
                state.profileInitialized = true
                const previousImg = state.profile.img
                state.profile = {
                    ...mapUserProfileToSettings(action.payload),
                    img: previousImg || state.profile.img,
                }
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.profileLoading = false
                state.profileInitialized = true
                state.profileError =
                    (action.payload as { detail?: string })?.detail ??
                    'Failed to load profile.'
            })
            .addCase(updateCompanyProfile.pending, (state) => {
                state.profileSaving = true
                state.profileSaveError = null
            })
            .addCase(updateCompanyProfile.fulfilled, (state, action) => {
                state.profileSaving = false
                const previousImg = state.profile.img
                state.profile = {
                    ...mapUserProfileToSettings(action.payload),
                    img: previousImg || state.profile.img,
                }
            })
            .addCase(updateCompanyProfile.rejected, (state, action) => {
                state.profileSaving = false
                state.profileSaveError =
                    (action.payload as { detail?: string })?.detail ??
                    'Failed to update company profile.'
            })
            .addCase(saveProfileSettings.pending, (state) => {
                state.profileSaving = true
                state.profileSaveError = null
            })
            .addCase(saveProfileSettings.fulfilled, (state, action) => {
                state.profileSaving = false
                const previousImg = state.profile.img
                state.profile = {
                    ...mapUserProfileToSettings(action.payload),
                    img: previousImg || state.profile.img,
                }
            })
            .addCase(saveProfileSettings.rejected, (state, action) => {
                state.profileSaving = false
                state.profileSaveError =
                    (action.payload as { detail?: string })?.detail ??
                    'Failed to save profile.'
            })
    },
})

export const {
    setCurrentView,
    setProfile,
    setNotification,
    setBilling,
    setIntegration,
    resetProfileData,
    clearProfileSaveError,
    resetProfileSaving,
} = settingsSlice.actions

export default settingsSlice.reducer
