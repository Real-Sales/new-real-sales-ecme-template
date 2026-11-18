import SideNav from '@/components/template/SideNav'
import Header from '@/components/template/Header'
import FrameLessGap from '@/components/template/FrameLessGap'
import SideNavToggle from '@/components/template/SideNavToggle'
import MobileNav from '@/components/template/MobileNav'
import ThemeToggleButton from '@/components/shared/ThemeToggleButton'
import UserProfileDropdown from '@/components//template/UserProfileDropdown'
import LayoutBase from '@/components//template/LayoutBase'
import classNames from '@/utils/classNames'
import useScrollTop from '@/utils/hooks/useScrollTop'
import useResponsive from '@/utils/hooks/useResponsive'
import { LAYOUT_FRAMELESS_SIDE } from '@/constants/theme.constant'
import AppPremium from './AppPremium'
import { useAppSelector } from '@/store'
import type { CommonProps } from '@/@types/common'
import type { FooterPageContainerType } from '@/components/template/Footer'

const FrameLessSide = ({ children }: CommonProps) => {
    const { isSticky } = useScrollTop()

    const { larger, smaller } = useResponsive()
    const isDark = useAppSelector((state) => state.theme.mode) === 'dark'

    return (
        <LayoutBase
            adaptiveCardActive
            type={LAYOUT_FRAMELESS_SIDE}
            className="app-layout-frameless-side app-premium relative isolate flex flex-auto flex-col bg-white dark:bg-[#050505]"
            pageContainerReassemble={({
                pageContainerType,
                pageBackgroundType,
                pageContainerGutterClass,
                children,
                footer,
                header,
                defaultClass,
                pageContainerDefaultClass,
                PageContainerBody,
                PageContainerFooter,
                PageContainerHeader,
            }) => (
                <div
                    className={classNames(
                        defaultClass,
                        'rounded-2xl',
                        // 'plain' pages sit straight on the glass panel
                        pageBackgroundType === 'plain' && 'bg-transparent',
                    )}
                >
                    <main className="h-full">
                        <div
                            className={classNames(
                                pageContainerDefaultClass,
                                pageContainerType !== 'gutterless' &&
                                    pageContainerGutterClass,
                                pageContainerType === 'contained' &&
                                    'container mx-auto',
                                !footer && 'pb-0 sm:pb-0 md:pb-0',
                            )}
                        >
                            <PageContainerHeader
                                {...header}
                                gutterLess={pageContainerType === 'gutterless'}
                            />
                            <PageContainerBody
                                pageContainerType={pageContainerType}
                            >
                                {children}
                            </PageContainerBody>
                        </div>
                    </main>
                    <PageContainerFooter
                        footer={footer}
                        pageContainerType={
                            pageContainerType as FooterPageContainerType
                        }
                    />
                </div>
            )}
        >
            <AppPremium />
            <div className="flex flex-auto min-w-0">
                {larger.lg && (
                    <SideNav
                        background={false}
                        className={classNames(isDark && 'contrast-dark', 'pt-6')}
                        contentClass="h-[calc(100vh-8rem)]"
                        mode={isDark ? 'dark' : 'light'}
                    />
                )}
                <FrameLessGap className="min-h-screen min-w-0 relative w-full">
                    <div className="app-panel app-glass-scope flex flex-col flex-1 h-full rounded-2xl">
                        <Header
                            className={classNames(
                                'rounded-t-2xl',
                                isSticky && 'shadow-sm rounded-none!',
                            )}
                            headerStart={
                                <>
                                    {smaller.lg && <MobileNav />}
                                    {larger.lg && <SideNavToggle />}
                                </>
                            }
                            headerEnd={
                                <>
                                    <ThemeToggleButton />
                                    <UserProfileDropdown hoverable={false} />
                                </>
                            }
                        />
                        <div className="h-full flex flex-auto flex-col">
                            {children}
                        </div>
                    </div>
                </FrameLessGap>
            </div>
        </LayoutBase>
    )
}

export default FrameLessSide
