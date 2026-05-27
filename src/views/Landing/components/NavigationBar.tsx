import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TbMenu2, TbX } from 'react-icons/tb'
import classNames from '@/utils/classNames'
import { MODE_DARK } from '@/constants/theme.constant'
import { useLandingTheme } from '../LandingThemeProvider'
import { getLenis } from '../smoothScroll'
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
    const lastScrollY = useRef(0)
    const t = useLandingTheme()
    const isDark = mode === MODE_DARK
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

    const handleNavClick = (href: string) => {
        setMenuOpen(false)
        const el = document.querySelector(href) as HTMLElement | null
        if (!el) return

        const lenis = getLenis()
        if (lenis) {
            lenis.scrollTo(el, { offset: -80, duration: 1.4 })
        } else {
            el.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <>
            <motion.div
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
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                    pointerEvents: isHidden && !menuOpen ? 'none' : 'auto',
                }}
            >
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={classNames(
                        'flex items-center justify-between gap-8 px-4 py-2.5 rounded-full',
                        'border transition-all duration-500 mx-4 w-full max-w-4xl',
                    )}
                    style={{
                        backgroundColor: isSticky ? t.navStickyBg : 'transparent',
                        borderColor: isSticky ? t.border : 'transparent',
                        backdropFilter: isSticky ? 'blur(16px)' : undefined,
                        boxShadow: isSticky
                            ? t.isLight
                                ? '0 8px 32px rgba(0,0,0,0.08)'
                                : '0 8px 32px rgba(0,0,0,0.6)'
                            : undefined,
                    }}
                >
                    <a href="/" className="flex items-center shrink-0">
                        <img
                            src={t.logoSrc}
                            width={110}
                            height={36}
                            alt="RealSales"
                            className="h-8 w-auto"
                        />
                    </a>

                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => handleNavClick(link.href)}
                                className={classNames(
                                    'px-4 py-2 text-sm rounded-full transition-all duration-200',
                                    t.isLight ? 'font-bold' : 'font-medium',
                                )}
                                style={{ color: t.isLight ? t.text : t.textMuted }}
                                onMouseEnter={(e) => {
                                    if (!t.isLight) e.currentTarget.style.color = t.text
                                    e.currentTarget.style.backgroundColor = t.surfaceHover
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = t.isLight ? t.text : t.textMuted
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        {toggleMode && (
                            <AnimatedThemeToggler
                                isDark={isDark}
                                onModeChange={handleModeChange}
                                variant="circle"
                                duration={500}
                                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                                style={{
                                    border: `1px solid ${t.border}`,
                                    color: t.textMuted,
                                }}
                            />
                        )}
                        <Link
                            to="/sign-in"
                            className={classNames(
                                'px-4 py-2 text-sm transition-colors duration-200',
                                t.isLight ? 'font-bold' : 'font-medium',
                            )}
                            style={{ color: t.isLight ? t.text : t.textMuted }}
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/sign-in"
                            className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 active:scale-[0.97]"
                            style={{
                                backgroundColor: t.primaryBtnBg,
                                color: t.primaryBtnText,
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
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                        style={{
                            border: `1px solid ${t.border}`,
                            color: t.textMuted,
                        }}
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <TbMenu2 size={18} />
                    </button>
                </motion.nav>
            </motion.div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] flex flex-col backdrop-blur-2xl"
                        style={{
                            backgroundColor: t.isLight
                                ? 'rgba(250,250,250,0.97)'
                                : 'rgba(5,5,5,0.95)',
                        }}
                    >
                        <div className="flex items-center justify-between px-6 pt-6 pb-4">
                            <a href="/">
                                <img
                                    src={t.logoSrc}
                                    width={110}
                                    height={36}
                                    alt="RealSales"
                                    className="h-8 w-auto"
                                />
                            </a>
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
                                    className="flex items-center justify-center w-9 h-9 rounded-full"
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
                            {navLinks.map((link, i) => (
                                <motion.button
                                    key={link.label}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 12 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: i * 0.05,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    onClick={() => handleNavClick(link.href)}
                                    className={classNames(
                                        'text-left text-2xl py-3 transition-colors duration-200',
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
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, delay: 0.25 }}
                            className="px-6 pb-12 flex flex-col gap-3"
                        >
                            <Link
                                to="/sign-in"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center py-3.5 text-sm font-semibold rounded-full transition-all duration-200"
                                style={{
                                    color: t.textMuted,
                                    border: `1px solid ${t.border}`,
                                }}
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/sign-in"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center py-3.5 text-sm font-semibold rounded-full transition-all duration-200 active:scale-[0.98]"
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
