import axios from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signOutSuccess } from '../store'
import Cookies from 'js-cookie'

const AUTH_TOKEN_COOKIE = 'auth_token'
const useCookies = appConfig.accessTokenPersistStrategy === 'cookies'

const unauthorizedCode = [401]

const BaseService = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
})

BaseService.interceptors.request.use(
    (config) => {
        let accessToken: string | undefined

        if (useCookies) {
            accessToken = Cookies.get(AUTH_TOKEN_COOKIE)
        } else {
            const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME)
            const persistData = deepParseJson(rawPersistData)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accessToken = (persistData as any)?.auth?.session?.token
        }

        if (!accessToken) {
            const { auth } = store.getState()
            accessToken = auth.session.token ?? undefined
        }

        if (accessToken) {
            config.headers[
                REQUEST_HEADER_AUTH_KEY
            ] = `${TOKEN_TYPE}${accessToken}`
        }

        // Free ngrok tunnels answer browser requests with a warning page unless this header is present
        if (appConfig.apiPrefix.includes('ngrok')) {
            config.headers['ngrok-skip-browser-warning'] = 'true'
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

BaseService.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error

        if (response && unauthorizedCode.includes(response.status)) {
            store.dispatch(signOutSuccess())
        }

        return Promise.reject(error)
    }
)

export default BaseService 