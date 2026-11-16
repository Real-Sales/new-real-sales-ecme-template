export type AppConfig = {
    apiPrefix: string
    baseUrl: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
    activeNavTranslation: boolean
}

// Avoid "undefined/api/..." if env is missing at build time.
const baseUrl = (import.meta.env.VITE_BASE_URL ?? '').toString().trim()
const apiPath = (import.meta.env.VITE_API_PREFIX ?? '/api/v1/').toString().trim()

const appConfig: AppConfig = {
    baseUrl,
    apiPrefix: `${baseUrl}${apiPath}`,
    authenticatedEntryPath: '/overview',
    unAuthenticatedEntryPath: '/',
    locale: 'en',
    accessTokenPersistStrategy: 'cookies',
    enableMock: false,
    activeNavTranslation: false,
}

export default appConfig
