import authRoute from '@/configs/routes.config/authRoute'
import { useLocation } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import type { CommonProps } from '@/@types/common'

const PreLoginLayout = ({ children }: CommonProps) => {
    const location = useLocation()

    const { pathname } = location

    const isAuthPath = authRoute.some((route) => route.path === pathname)
    const isMarketingPage =
        pathname === '/' ||
        pathname === '/landing' ||
        pathname === '/about' ||
        pathname === '/faqs' ||
        pathname === '/book-demo' ||
        pathname.startsWith('/industries/')

    return (
        <div
            className={
                isMarketingPage
                    ? 'flex flex-auto flex-col min-h-screen w-full bg-white dark:bg-gray-900'
                    : 'flex flex-auto flex-col h-[100vh]'
            }
        >
            {isAuthPath ? <AuthLayout>{children}</AuthLayout> : children}
        </div>
    )
}

export default PreLoginLayout
