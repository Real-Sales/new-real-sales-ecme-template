import { useRef, useImperativeHandle, useEffect } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { signInSuccess, signOutSuccess } from '@/store/slices/auth/sessionSlice'
import { setUser } from '@/store/slices/auth/userSlice'
import { setProfile } from '@/views/profile/Settings/store/settingsSlice'
import { apiSignIn, apiSignOut, apiSignUp, apiVerifyOtp } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'

const AUTH_TOKEN_COOKIE = 'auth_token'
const useCookies = appConfig.accessTokenPersistStrategy === 'cookies'

const setAuthCookie = (token: string) => {
    if (useCookies) {
        Cookies.set(AUTH_TOKEN_COOKIE, token, { expires: 7, sameSite: 'lax', path: '/' })
    }
}

const clearAuthCookie = () => {
    if (useCookies) {
        Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' })
    }
}
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router-dom'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
}

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)
    const user = useAppSelector((state) => state.auth.user)
    const token = useAppSelector((state) => state.auth.session.token)
    const dispatch = useAppDispatch()
    // To update user: dispatch(setUser(userData))
    // To sign in: dispatch(signInSuccess(token))
    // To sign out: dispatch(signOutSuccess())
    // When using cookies strategy, the cookie is the source of truth for authentication.
    // localStorage auth.user still persists profile data (name, email, avatar).
    const authenticated = useCookies
        ? Boolean(Cookies.get(AUTH_TOKEN_COOKIE))
        : Boolean(token && signedIn)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    // On app startup with cookies strategy, restore auth session from cookie
    useEffect(() => {
        if (useCookies && !signedIn) {
            const cookieToken = Cookies.get(AUTH_TOKEN_COOKIE)
            if (cookieToken) {
                dispatch(signInSuccess(cookieToken))
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const handleSignIn = (tokens: Token, user?: User) => {
        dispatch(signInSuccess(tokens.accessToken))
        setAuthCookie(tokens.accessToken)

        if (user) {
            const userData = {
                userId: user.userId ?? '',
                avatar: user.avatar ?? '',
                userName: user.userName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
                firstName: user.firstName ?? '',
                lastName: user.lastName ?? '',
                email: user.email ?? '',
                phoneNumber: user.phoneNumber ?? '',
                role: user.role ?? '',
                authority: user.authority ?? (user.role ? [user.role] : []),
                isNewUser: (user as User & { isNewUser?: boolean }).isNewUser ?? false,
            }
            
            dispatch(setUser(userData))
            
            // Sync auth.user data to settings.profile so the profile page shows correct data
            dispatch(setProfile({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                img: userData.avatar,
            }))
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(setUser({}))
        clearAuthCookie()
    }

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            const resp = await apiSignIn(values)
            if (resp) {
                handleSignIn({ accessToken: resp.token }, {
                    userId: resp.user.user_id,
                    firstName: resp.user.first_name,
                    lastName: resp.user.last_name,
                    email: resp.user.email,
                    phoneNumber: resp.user.phone_number,
                    role: resp.user.role,
                })
                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign in',
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            if (
                errors?.response?.status === 404 ||
                errors?.response?.status === 401 ||
                errors?.response?.status === 403
            ) {
                return {
                    status: 'failed',
                    message: 'Invalid credentials',
                }
            }
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors?.response?.data?.error || errors?.response?.data?.detail || errors.toString(),
            }
        }
    }

    const signUp = async (values: SignUpCredential): AuthResult => {
        try {
            const resp = await apiSignUp(values)
            if (resp) {
                navigatorRef.current?.navigate(`/verify-otp?email=${encodeURIComponent(resp.user.email)}`)
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign up',
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors?.response?.data?.error || errors?.response?.data?.detail || errors.toString(),
            }
        }
    }

    const verifyOtp = async (values: { email: string; otp_code: string }): AuthResult => {
        try {
            const resp = await apiVerifyOtp(values)
            if (resp?.token) {
                handleSignIn({ accessToken: resp.token }, {
                    userId: resp.user.user_id,
                    firstName: resp.user.first_name,
                    lastName: resp.user.last_name,
                    email: resp.user.email,
                    phoneNumber: resp.user.phone_number,
                    role: resp.user.role,
                    isNewUser: true,
                } as User)
                navigatorRef.current?.navigate('/onboarding')
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to verify OTP',
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            const msg = errors?.response?.data?.message || errors?.response?.data?.error || errors?.response?.data?.detail
            return {
                status: 'failed',
                message: msg || 'Invalid or expired OTP',
            }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }
    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                verifyOtp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
