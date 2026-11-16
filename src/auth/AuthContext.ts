import { createContext } from 'react'
import type {
    SignInCredential,
    SignUpCredential,
    InviteSignUpCredential,
    AuthResult,
    User,
    OauthSignInCallbackPayload,
    VerifyOtpCredential,
} from '@/@types/auth'

type Auth = {
    authenticated: boolean
    /** False while profile/company are restored after reload — avoid onboarding flash. */
    isSessionReady: boolean
    user: User
    signIn: (values: SignInCredential) => AuthResult
    signUp: (values: SignUpCredential) => AuthResult
    inviteSignUp: (values: InviteSignUpCredential) => AuthResult
    verifyOtp: (values: VerifyOtpCredential) => AuthResult
    signOut: () => void
    oAuthSignIn: (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => void
}

const defaultFunctionPlaceHolder = async (): AuthResult => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    return {
        status: '',
        message: '',
    }
}

const defaultOAuthSignInPlaceHolder = (
    callback: (payload: OauthSignInCallbackPayload) => void,
): void => {
    callback({
        onSignIn: async () => false,
        redirect: () => {},
        navigateToOnboarding: () => {},
    })
}

const AuthContext = createContext<Auth>({
    authenticated: false,
    isSessionReady: true,
    user: {},
    signIn: async () => defaultFunctionPlaceHolder(),
    signUp: async () => defaultFunctionPlaceHolder(),
    inviteSignUp: async () => defaultFunctionPlaceHolder(),
    verifyOtp: async () => defaultFunctionPlaceHolder(),
    signOut: () => {},
    oAuthSignIn: defaultOAuthSignInPlaceHolder,
})

export default AuthContext
