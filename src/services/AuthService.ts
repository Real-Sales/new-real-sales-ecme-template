import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ForgotPasswordConfirm,
    ResetPassword,
    SignInResponse,
    SignUpResponseNoToken,
    VerifyOtpCredential,
    VerifyOtpResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchDataWithAxios<SignInResponse>({
        url: endpointConfig.signIn,
        method: 'post',
        data,
    })
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchDataWithAxios<SignUpResponseNoToken>({
        url: endpointConfig.signUp,
        method: 'post',
        data,
    })
}

export async function apiVerifyOtp(data: VerifyOtpCredential) {
    return ApiService.fetchDataWithAxios<VerifyOtpResponse>({
        url: endpointConfig.verifyOtp,
        method: 'post',
        data,
    })
}

export async function apiSendOtp(data: { email: string }) {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: endpointConfig.sendOtp,
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signOut,
        method: 'post',
    })
}

export async function apiForgotPasswordRequest<T>(data: ForgotPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPasswordRequest,
        method: 'post',
        data,
    })
}

export async function apiForgotPasswordConfirm<T>(data: ForgotPasswordConfirm) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPasswordConfirm,
        method: 'post',
        data,
    })
}

export async function apiResetPassword<T>(data: ResetPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}
