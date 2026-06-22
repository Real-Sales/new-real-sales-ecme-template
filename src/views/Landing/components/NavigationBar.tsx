import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TbMenu2, TbX, TbChevronDown, TbToolsKitchen2 } from 'react-icons/tb'
import classNames from '@/utils/classNames'
import { MODE_DARK } from '@/constants/theme.constant'
import { useLandingTheme } from '../LandingThemeProvider'
import { getLenis, scrollToLandingSection } from '../smoothScroll'
import AnimatedThemeToggler from './AnimatedThemeToggler'
import type { Mode } from '@/@types/theme'

type NavigationProps = {
    mode: Mode
    toggleMode?: () => void
}

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#workflow' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
]

const navItemClass =
    'inline-flex items-center justify-center h-9 whitespace-nowrap rounded-full px-3.5 text-sm leading-none transition-all duration-200'

const industriesMenu = [
    {
        label: 'Food & Beverages',
        href: '/industries/food-and-beverages',
        icon: TbToolsKitchen2,
        desc: 'Restaurant chains, distributors & beverage brands',
    },
]

function getScrollTop() {
    return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
    )
}

const Navigation = ({ mode, toggleMode }: NavigationProps) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const [isSticky, setIsSticky] = useState(false)
    const [isHidden, setIsHidden] = useState(false)
    const [industriesOpen, setIndustriesOpen] = useState(false)
    const industriesRef = useRef<HTMLDivElement>(null)
    const lastScrollY = useRef(0)
    const shouldReduceMotion = useReducedMotion()
    const t = useLandingTheme()
    const isDark = mode === MODE_DARK
    const navigate = useNavigate()
    const location = useLocation()
    const isOnLanding = location.pathname === '/landing'
    const handleModeChange = () => toggleMode?.()

    useEffect(() => {
        lastScrollY.current = getScrollTop()

        const updateFromScroll = () => {
            if (menuOpen) return

            const scrollY = getScrollTop()
            const pastTop = scrollY > 48
            const delta = scrollY - lastScrollY.current

            setIsSticky(pastTop)

            if (scrollY <= 48) {
                setIsHidden(false)
            } else if (delta > 4) {
                setIsHidden(true)
            } else if (delta < -4) {
                setIsHidden(false)
            }

            lastScrollY.current = scrollY
        }

        updateFromScroll()
        window.addEventListener('scroll', updateFromScroll, { passive: true })
        document.addEventListener('scroll', updateFromScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', updateFromScroll)
            document.removeEventListener('scroll', updateFromScroll)
        }
    }, [menuOpen])

    useEffect(() => {
        if (menuOpen) {
            setIsHidden(false)
        }
    }, [menuOpen])

    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (industriesRef.current && !industriesRef.current.contains(e.target as Node)) {
                setIndustriesOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutside)
        return () => document.removeEventListener('mousedown', handleOutside)
    }, [])

    useEffect(() => {
        if (!menuOpen) return
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [menuOpen])

    const handleNavClick = (href: string) => {
        setMenuOpen(false)
        if (!isOnLanding) {
            navigate(`/landing${href}`)
            return
        }
        const el = document.querySelector(href) as HTMLElement | null
        if (!el) return
        scrollToLandingSection(el)
    }

    const handleHomeClick = () => {
        setMenuOpen(false)
        if (isOnLanding) {
            const lenis = getLenis()
            if (lenis) {
                lenis.scrollTo(0, { duration: 1.2 })
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            return
        }
        navigate('/landing')
    }

    const navItemHoverHandlers = {
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
            if (!t.isLight) e.currentTarget.style.color = t.text
            e.currentTarget.style.backgroundColor = t.surfaceHover
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.color = t.isLight ? t.text : t.textMuted
            e.currentTarget.style.backgroundColor = 'transparent'
        },
    }

    return (
        <>
            <motion.div
                data-landing-nav
                className={classNames(
                    'fixed inset-x-0 top-0 z-50 flex justify-center',
                    isSticky ? 'pt-4' : 'pt-6',
                )}
                initial={false}
                animate={{
                    y: isHidden && !menuOpen ? '-120%' : 0,
                    opacity: isHidden && !menuOpen ? 0 : 1,
                }}
                transition={{
                    duration: shouldReduceMotion ? 0.01 : 0.45,
                    ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                    pointerEvents: isHidden && !menuOpen ? 'none' : 'auto',
                }}
            >
                <motion.nav
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={classNames(
                        'flex flex-nowrap items-center justify-between gap-4 px-4 xl:px-5 py-2 rounded-full',
                        'border transition-all duration-500 mx-4 w-full max-w-6xl min-h-[52px]',
                    )}
                    style={{
                        backgroundColor: isSticky ? t.navStickyBg : 'transparent',
                        borderColor: isSticky ? t.border : 'transparent',
                        backdropFilter: isSticky ? 'blur(16px)' : undefined,
                        boxShadow: isSticky
                            ? t.isLight
                                ? '0 10px 28px rgba(17,24,39,0.08)'
                                : '0 14px 40px rgba(0,0,0,0.48)'
                            : 'none',
                    }}
                >
                    <Link
                        to="/landing"
                        className="flex shrink-0 items-center justify-start min-w-[100px] xl:min-w-[110px]"
                    >
                        <img
                            src={t.logoSrc}
                            width={110}
                            height={36}
                            alt="SalesWana"
                            className="h-8 w-auto"
                        />
                    </Link>

                    <div className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0 px-2">
                        <button
                            type="button"
                            onClick={handleHomeClick}
                            className={classNames(
                                navItemClass,
                                'shrink-0 focus-visible:outline-none focus-visible:ring-2',
                                t.isLight ? 'font-bold' : 'font-medium',
                            )}
                            style={{ color: t.isLight ? t.text : t.textMuted }}
                            {...navItemHoverHandlers}
                        >
                            Home
                        </button>
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => handleNavClick(link.href)}
                                className={classNames(
                                    navItemClass,
                                    'shrink-0 focus-visible:outline-none focus-visible:ring-2',
                                    t.isLight ? 'font-bold' : 'font-medium',
                                )}
                                style={{
                                    color: t.isLight ? t.text : t.textMuted,
                                }}
                                {...navItemHoverHandlers}
                            >
                                {link.label}
                            </button>
                        ))}

                        {/* Industries dropdown */}
                        <div ref={industriesRef} className="relative shrink-0">
                            <button
                                onClick={() => setIndustriesOpen((v) => !v)}
                                className={classNames(
                                    navItemClass,
                                    'shrink-0 gap-1 focus-visible:outline-none focus-visible:ring-2',
                                    t.isLight ? 'font-bold' : 'font-medium',
                                )}
                                style={{ color: industriesOpen ? t.accent : (t.isLight ? t.text : t.textMuted) }}
                                onMouseEnter={(e) => {
                                    if (!t.isLight) e.currentTarget.style.color = t.text
                                    e.currentTarget.style.backgroundColor = t.surfaceHover
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = industriesOpen ? t.accent : (t.isLight ? t.text : t.textMuted)
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                            >
                                Industries
                                <motion.span
                                    animate={{ rotate: industriesOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center"
                                >
                                    <TbChevronDown size={14} className="shrink-0" />
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {industriesOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl overflow-hidden z-50"
                                        style={{
                                            background: t.isLight
                                                ? 'rgba(255,255,255,0.97)'
                                                : 'rgba(13,13,13,0.97)',
                                            border: t.isLight
                                                ? '1px solid rgba(0,0,0,0.08)'
                                                : '1px solid rgba(255,255,255,0.08)',
                                            backdropFilter: 'blur(20px)',
                                            boxShadow: t.isLight
                                                ? '0 16px 48px rgba(0,0,0,0.12)'
                                                : '0 16px 48px rgba(0,0,0,0.7)',
                                        }}
                                    >
                                        <div className="p-2">
                                            <p
                                                className="text-[10px] font-semibold uppercase tracking-widest px-3 py-2"
                                                style={{ color: t.textFaint }}
                                            >
                                                Industries
                                            </p>
                                            {industriesMenu.map((item) => {
                                                const Icon = item.icon
                                                return (
                                                    <button
                                                        key={item.label}
                                                        onClick={() => {
                                                            setIndustriesOpen(false)
                                                            navigate(item.href)
                                                        }}
                                                        className="w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left group"
                                                        style={{ color: t.text }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = t.surfaceHover
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent'
                                                        }}
                                                    >
                                                        <div
                                                            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg mt-0.5"
                                                            style={{
                                                                background: 'rgba(12,175,96,0.12)',
                                                                border: '1px solid rgba(12,175,96,0.2)',
                                                                color: '#0CAF60',
                                                            }}
                                                        >
                                                            <Icon size={14} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium leading-snug">{item.label}</p>
                                                            <p
                                                                className="text-xs mt-0.5 leading-snug line-clamp-2"
                                                                style={{ color: t.textMuted }}
                                                            >
                                                                {item.desc}
                                                            </p>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-3 min-w-[100px] xl:min-w-[110px]">
                        <div className="hidden lg:flex items-center gap-3">
                            {toggleMode && (
                                <AnimatedThemeToggler
                                    isDark={isDark}
                                    onModeChange={handleModeChange}
                                    variant="circle"
                                    duration={500}
                                    className="flex shrink-0 items-center justify-center w-9 h-9 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
                                    style={{
                                        border: `1px solid ${t.border}`,
                                        color: t.textMuted,
                                    }}
                                />
                            )}
                            <Link
                                to="/sign-in"
                                className={classNames(
                                    navItemClass,
                                    'shrink-0 focus-visible:outline-none focus-visible:ring-2',
                                    t.isLight ? 'font-bold' : 'font-medium',
                                )}
                                style={{ color: t.isLight ? t.text : t.textMuted }}
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/book-demo"
                                className={classNames(
                                    navItemClass,
                                    'shrink-0 px-5 font-semibold active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2',
                                )}
                                style={{
                                    backgroundColor: t.primaryBtnBg,
                                    color: t.primaryBtnText,
                                    boxShadow: t.isLight
                                        ? '0 10px 22px rgba(16,185,129,0.22)'
                                        : '0 10px 26px rgba(0,0,0,0.42)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = t.primaryBtnHover
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = t.primaryBtnBg
                                }}
                            >
                                Book a Demo
                            </Link>
                        </div>

                        <button
                            type="button"
                            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
                            style={{
                                border: `1px solid ${t.border}`,
                                color: t.textMuted,
                            }}
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <TbMenu2 size={18} />
                        </button>
                    </div>
                </motion.nav>
            </motion.div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
                        className="fixed inset-0 z-[60] flex flex-col backdrop-blur-2xl"
                        style={{
                            backgroundColor: t.isLight
                                ? 'rgba(250,250,250,0.97)'
                                : 'rgba(5,5,5,0.95)',
                        }}
                    >
                        <div className="flex items-center justify-between px-6 pt-6 pb-4">
                            <Link to="/landing" onClick={() => setMenuOpen(false)}>
                                <img
                                    src={t.logoSrc}
                                    width={110}
                                    height={36}
                                    alt="SalesWana"
                                    className="h-8 w-auto"
                                />
                            </Link>
                            <div className="flex items-center gap-2">
                                {toggleMode && (
                                    <AnimatedThemeToggler
                                        isDark={isDark}
                                        onModeChange={handleModeChange}
                                        variant="circle"
                                        duration={500}
                                        className="flex items-center justify-center w-9 h-9 rounded-full"
                                        style={{
                                            border: `1px solid ${t.border}`,
                                            color: t.textMuted,
                                        }}
                                    />
                                )}
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full focus-visible:outline-none focus-visible:ring-2"
                                    style={{
                                        border: `1px solid ${t.border}`,
                                        color: t.textMuted,
                                    }}
                                    aria-label="Close menu"
                                >
                                    <TbX size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 px-6 pt-8 gap-2">
                            <motion.button
                                type="button"
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                                transition={{
                                    duration: shouldReduceMotion ? 0.01 : 0.4,
                                    delay: 0,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                onClick={handleHomeClick}
                                className={classNames(
                                    'text-left text-2xl py-3 transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2',
                                    t.isLight ? 'font-bold' : 'font-semibold',
                                )}
                                style={{
                                    color: t.isLight ? t.text : t.textMuted,
                                    borderBottom: `1px solid ${t.border}`,
                                }}
                            >
                                Home
                            </motion.button>
                            {navLinks.map((link, i) => (
                                <motion.button
                                    key={link.label}
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                                    transition={{
                                        duration: shouldReduceMotion ? 0.01 : 0.4,
                                        delay: shouldReduceMotion ? 0 : (i + 1) * 0.05,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    onClick={() => handleNavClick(link.href)}
                                    className={classNames(
                                        'text-left text-2xl py-3 transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2',
                                        t.isLight ? 'font-bold' : 'font-semibold',
                                    )}
                                    style={{
                                        color: t.isLight ? t.text : t.textMuted,
                                        borderBottom: `1px solid ${t.border}`,
                                    }}
                                >
                                    {link.label}
                                </motion.button>
                            ))}
                            {/* Industries mobile section */}
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                transition={{ duration: 0.4, delay: (navLinks.length + 1) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                style={{ borderBottom: `1px solid ${t.border}` }}
                            >
                                <p
                                    className="text-[10px] font-semibold uppercase tracking-widest pt-3 pb-2"
                                    style={{ color: t.textFaint }}
                                >
                                    Industries
                                </p>
                                {industriesMenu.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => {
                                                setMenuOpen(false)
                                                navigate(item.href)
                                            }}
                                            className="flex items-center gap-3 py-3 w-full text-left transition-colors duration-200"
                                            style={{ color: t.isLight ? t.text : t.textMuted }}
                                        >
                                            <div
                                                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                                                style={{
                                                    background: 'rgba(12,175,96,0.12)',
                                                    border: '1px solid rgba(12,175,96,0.2)',
                                                    color: '#0CAF60',
                                                }}
                                            >
                                                <Icon size={14} />
                                            </div>
                                            <span className="text-xl font-semibold">{item.label}</span>
                                        </button>
                                    )
                                })}
                            </motion.div>
                        </div>

                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0.01 : 0.4, delay: shouldReduceMotion ? 0 : 0.25 }}
                            className="px-6 pb-12 flex flex-col gap-3"
                        >
                            <Link
                                to="/sign-in"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center py-3.5 text-sm font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
                                style={{
                                    color: t.textMuted,
                                    border: `1px solid ${t.border}`,
                                }}
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/book-demo"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center py-3.5 text-sm font-semibold rounded-full transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2"
                                style={{
                                    backgroundColor: t.primaryBtnBg,
                                    color: t.primaryBtnText,
                                }}
                            >
                                Book a Demo
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navigation
