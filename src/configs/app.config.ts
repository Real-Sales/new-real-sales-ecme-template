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

const appConfig: AppConfig = {
    baseUrl: import.meta.env.VITE_BASE_URL,
    apiPrefix: `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_API_PREFIX}`,
    authenticatedEntryPath: '/overview',
    unAuthenticatedEntryPath: '/landing',
    locale: 'en',
    accessTokenPersistStrategy: 'cookies',
    enableMock: false,
    activeNavTranslation: false,
}

export default appConfig
