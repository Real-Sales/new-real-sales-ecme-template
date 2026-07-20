import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useAppSelector } from '@/store'
import { companyOwnerNeedsOnboarding } from '@/utils/onboarding'
import Loading from '@/components/shared/Loading'

const { unAuthenticatedEntryPath, authenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated, isSessionReady } = useAuth()
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

    // companyId is not persisted — wait for profile/company restore before
    // deciding onboarding, otherwise the form flashes on every reload.
    if (!isSessionReady) {
        return (
            <div className="flex flex-auto flex-col h-[100vh]">
                <Loading loading={true} />
            </div>
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
