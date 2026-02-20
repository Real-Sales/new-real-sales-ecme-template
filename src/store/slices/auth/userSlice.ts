import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    avatar?: string
    userName?: string
    email?: string
    authority?: string[]
    isNewUser?: boolean
    companyName?: string
    industry?: string
    industryProducts?: string[]
}

const initialState: UserState = {
    avatar: '',
    userName: '',
    email: '',
    authority: [],
    isNewUser: false,
    companyName: '',
    industry: '',
    industryProducts: [],
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.avatar = action.payload?.avatar
            state.email = action.payload?.email
            state.userName = action.payload?.userName
            state.authority = action.payload?.authority
            state.isNewUser = action.payload?.isNewUser
            state.companyName = action.payload?.companyName
            state.industry = action.payload?.industry
            state.industryProducts = action.payload?.industryProducts
        },
        setOnboardingComplete(
            state,
            action: PayloadAction<{
                companyName: string
                industry: string
                industryProducts: string[]
            }>,
        ) {
            state.isNewUser = false
            state.companyName = action.payload.companyName
            state.industry = action.payload.industry
            state.industryProducts = action.payload.industryProducts
        },
    },
})

export const { setUser, setOnboardingComplete } = userSlice.actions
export default userSlice.reducer 