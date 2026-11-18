import Cookies from 'js-cookie'
import appConfig from '@/configs/app.config'
import {
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
    TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import type { InternalAxiosRequestConfig } from 'axios'

const AUTH_TOKEN_COOKIE = 'auth_token'

const AxiosRequestIntrceptorConfigCallback = (
    config: InternalAxiosRequestConfig,
) => {
    const storage = appConfig.accessTokenPersistStrategy
    let accessToken = ''

    if (storage === 'cookies') {
        accessToken = Cookies.get(AUTH_TOKEN_COOKIE) || ''
    } else if (storage === 'localStorage') {
        accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else if (storage === 'sessionStorage') {
        accessToken = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    }

    if (accessToken) {
        config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`
    }

    // Free ngrok tunnels answer browser requests with a warning page unless this header is present
    if (appConfig.apiPrefix.includes('ngrok')) {
        config.headers['ngrok-skip-browser-warning'] = 'true'
    }

    return config
}

export default AxiosRequestIntrceptorConfigCallback
