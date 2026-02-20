import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useAppSelector } from '@/store'

const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated } = useAuth()
    const isNewUser = useAppSelector((state) => state.auth.user.isNewUser)

    const { pathname } = useLocation()

    const getPathName =
        pathname === '/' ? '' : `?${REDIRECT_URL_KEY}=${location.pathname}`

    if (!authenticated) {
        return (
            <Navigate
                replace
                to={`${unAuthenticatedEntryPath}${getPathName}`}
            />
        )
    }

    if (isNewUser && pathname !== '/onboarding') {
        return <Navigate replace to="/onboarding" />
    }

    return <Outlet />
}

export default ProtectedRoute
