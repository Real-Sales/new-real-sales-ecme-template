import { Suspense } from 'react'
import Loading from '@/components/shared/Loading'
import type { CommonProps } from '@/@types/common'
import { useAuth } from '@/auth'
import { useAppSelector } from '@/store'
import { useLocation } from 'react-router-dom'
import PostLoginLayout from './PostLoginLayout'
import PreLoginLayout from './PreLoginLayout'

const Layout = ({ children }: CommonProps) => {
    const layoutType = useAppSelector((state) => state.theme.layout.type)
    const location = useLocation()
    const { authenticated } = useAuth()

    // Check if current route is landing, about, or faqs page - always use PreLoginLayout (no sidebar/header)
    const isLandingPage = location.pathname === '/landing' || location.pathname === '/about' || location.pathname === '/faqs'

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading={true} />
                </div>
            }
        >
            {isLandingPage ? (
                // Landing page always uses PreLoginLayout (no sidebar, no header)
                <PreLoginLayout>{children}</PreLoginLayout>
            ) : authenticated ? (
                <PostLoginLayout layoutType={layoutType}>
                    {children}
                </PostLoginLayout>
            ) : (
                <PreLoginLayout>{children}</PreLoginLayout>
            )}
        </Suspense>
    )
}

export default Layout
