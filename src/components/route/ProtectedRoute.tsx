import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useAppSelector } from '@/store'
import { companyOwnerNeedsOnboarding } from '@/utils/onboarding'

const { unAuthenticatedEntryPath, authenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated } = useAuth()
    const user = useAppSelector((state) => state.auth.user)

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

    const mustCompleteOnboarding = companyOwnerNeedsOnboarding(
        user.role,
        user.companyId,
    )

    if (mustCompleteOnboarding && pathname !== '/onboarding') {
        return <Navigate replace to="/onboarding" />
    }

    if (!mustCompleteOnboarding && pathname === '/onboarding') {
        return <Navigate replace to={authenticatedEntryPath} />
    }

    return <Outlet />
}

export default ProtectedRoute
