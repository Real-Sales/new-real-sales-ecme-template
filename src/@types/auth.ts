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
    }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    email: string
    first_name: string
    last_name: string
    phone_number: string
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
    onSignIn: (tokens: Token, user?: User) => void | Promise<void>
    redirect: () => void
}
