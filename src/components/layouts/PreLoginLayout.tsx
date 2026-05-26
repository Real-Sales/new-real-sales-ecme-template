import authRoute from '@/configs/routes.config/authRoute'
import { useLocation } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import type { CommonProps } from '@/@types/common'

const PreLoginLayout = ({ children }: CommonProps) => {
    const location = useLocation()

    const { pathname } = location

    const isAuthPath = authRoute.some((route) => route.path === pathname)
    const isMarketingPage =
        pathname === '/landing' || pathname === '/about' || pathname === '/faqs'

    return (
        <div
            className={
                isMarketingPage
                    ? 'flex flex-auto flex-col min-h-screen'
                    : 'flex flex-auto flex-col h-[100vh]'
            }
        >
            {isAuthPath ? <AuthLayout>{children}</AuthLayout> : children}
        </div>
    )
}

export default PreLoginLayout
