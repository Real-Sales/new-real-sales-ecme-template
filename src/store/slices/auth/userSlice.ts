import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    userId?: string
    avatar?: string
    userName?: string
    firstName?: string
    lastName?: string
    email?: string
    phoneNumber?: string
    role?: string
    authority?: string[]
    isNewUser?: boolean
    companyId?: string
    companyName?: string
    industry?: string
    industryProducts?: string[]
}

const initialState: UserState = {
    userId: '',
    avatar: '',
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    authority: [],
    isNewUser: false,
    companyId: '',
    companyName: '',
    industry: '',
    industryProducts: [],
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.userId = action.payload?.userId
            state.avatar = action.payload?.avatar
            state.userName = action.payload?.userName
            state.firstName = action.payload?.firstName
            state.lastName = action.payload?.lastName
            state.email = action.payload?.email
            state.phoneNumber = action.payload?.phoneNumber
            state.role = action.payload?.role
            state.authority = action.payload?.authority
            state.isNewUser = action.payload?.isNewUser
            state.companyId = action.payload?.companyId
            state.companyName = action.payload?.companyName
            state.industry = action.payload?.industry
            state.industryProducts = action.payload?.industryProducts
        },
        setOnboardingComplete(
            state,
            action: PayloadAction<{
                companyId: string
                companyName: string
                industry: string
                industryProducts: string[]
            }>,
        ) {
            state.isNewUser = false
            state.companyId = action.payload.companyId
            state.companyName = action.payload.companyName
            state.industry = action.payload.industry
            state.industryProducts = action.payload.industryProducts
        },
    },
})

export const { setUser, setOnboardingComplete } = userSlice.actions
export default userSlice.reducer 