import { combineReducers, AnyAction, Reducer } from 'redux'
import auth, { AuthState } from './slices/auth'
import base, { BaseState } from './slices/base'
import locale, { LocaleState } from './slices/locale/localeSlice'
import theme from './slices/theme/themeSlice'
import type { Theme } from '@/@types/theme'
import routeKey, { RouteKeyState } from './slices/routeKeySlice'
import settings, { SettingsState } from '@/views/profile/Settings/store/settingsSlice'
import subscription, { SubscriptionState } from '@/views/profile/Subscription/store/subscriptionSlice'
import RtkQueryService from '@/services/RtkQueryService'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import appConfig from '@/configs/app.config'

// When using cookies, only persist user profile data — NOT the session (token/signedIn)
// The JWT token lives exclusively in the auth_token cookie
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: appConfig.accessTokenPersistStrategy === 'cookies' ? ['user'] : ['user', 'session'],
}

const persistedAuth = persistReducer(authPersistConfig, auth as Reducer)

export type RootState = {
    auth: AuthState
    base: BaseState
    locale: LocaleState
    theme: Theme
    routeKey: RouteKeyState
    settings: SettingsState
    subscription: SubscriptionState
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

export interface AsyncReducers {
    [key: string]: Reducer<any, AnyAction>
}

const staticReducers = {
    auth: persistedAuth,
    base,
    locale,
    theme,
    routeKey,
    settings,
    subscription,
    [RtkQueryService.reducerPath]: RtkQueryService.reducer,
}

const rootReducer =
    (asyncReducers?: AsyncReducers) =>
    (state: RootState, action: AnyAction) => {
        const combinedReducer = combineReducers({
            ...staticReducers,
            ...asyncReducers,
        })
        return combinedReducer(state, action)
    }

export default rootReducer 