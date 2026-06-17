import type { UserSubscriptionRecord } from '@/services/SubscriptionService'

export type SignInCredential = {
    email: string
    password: string
    remember_me: boolean
}

export type SignInResponse = {
    message: string
    token: string
    user: {
        email: string
        user_id: string
        first_name: string
        last_name: string
        phone_number: string
        role: string
        company_id?: string
        sales_company_id?: string
    }
}

export type SignUpResponse = SignInResponse

/** Sign-up returns no token; user must verify OTP first */
export type SignUpResponseNoToken = {
    message: string
    user: { email: string; user_id?: string; first_name?: string; last_name?: string }
    subscription?: unknown
}

export type VerifyOtpCredential = {
    email: string
    otp_code: string
}

export type VerifyOtpResponse = SignInResponse

export type SignUpCredential = {
    email: string
    first_name: string
    last_name: string
    phone_number: string
    password: string
}

export type InviteSignUpCredential = {
    invite_token: string
    email: string
    first_name: string
    last_name: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ForgotPasswordConfirm = {
    email: string
    otp_code: string
    new_password: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type ProfileProduct = {
    product_id: string
    name: string
    details: string
}

/** @deprecated Use ProfileProduct */
export type ProfileProductSummary = ProfileProduct

export type CompanyProfile = {
    sales_company_id: string
    name: string
    industry: string | null
    address: string | null
    phone_number: string | null
    email: string | null
    products: ProfileProduct[]
}

/** @deprecated Use CompanyProfile */
export type UserCompanyProfile = CompanyProfile

export type UserRoleName =
    | 'sales_person'
    | 'sales_manager'
    | 'company_owner'
    | 'admin'
    | 'super_admin'

export type UserProfileRole = {
    role_id: string
    name: UserRoleName
    description: string | null
    status_active: boolean
    created_at: string
    updated_at: string
}

export type UserProfile = {
    user_id: string
    email: string
    first_name: string
    last_name: string
    phone_number: string | null
    company_id: string | null
    created_at: string
    updated_at: string
    status_active: boolean
    is_verified: boolean
    role: UserProfileRole | null
    user_subscriptions: UserSubscriptionRecord[] | null
    manager_info: unknown | null
    company: CompanyProfile | null
}

/** @deprecated Use UserProfile */
export type UserProfileResponse = UserProfile

export type PersonalProfileUpdateRequest = {
    first_name?: string
    last_name?: string
    phone_number?: string
}

export type CompanyProfileUpdateRequest = {
    sales_company_id: string
    name?: string
    industry?: string
    location?: string
    address?: string
    phone_number?: string
    email?: string
}

export type User = {
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    email?: string | null
    authority?: string[]
    firstName?: string | null
    lastName?: string | null
    phoneNumber?: string | null
    role?: string | null
    companyId?: string | null
}

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => Promise<boolean> | boolean
    redirect: () => void
    navigateToOnboarding: () => void
}
