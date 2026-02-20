import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type { SignInResponse } from '@/@types/auth'

export async function apiGoogleOauthSignIn(data: { id_token: string }) {
    return ApiService.fetchDataWithAxios<SignInResponse>({
        url: endpointConfig.googleSignIn,
        method: 'post',
        data,
    })
}

export async function apiGithubOauthSignIn(): Promise<SignInResponse> {
    // Placeholder for now as Github was not requested to be fixed yet
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                token: 'placeholder_token',
                user: {
                    userId: 'placeholder_id',
                    userName: 'Placeholder User',
                    email: 'user@example.com',
                    authority: ['USER'],
                    avatar: '',
                },
            })
        }, 500)
    })
}
