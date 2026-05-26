import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TbMenu2, TbX } from 'react-icons/tb'
import useScrollTop from '@/utils/hooks/useScrollTop'
import classNames from '@/utils/classNames'
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

const Navigation = ({ mode, toggleMode }: NavigationProps) => {
    const { isSticky } = useScrollTop()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleNavClick = (href: string) => {
        setMenuOpen(false)
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <>
            <div
                className={classNames(
                    'fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-500',
                    isSticky ? 'pt-4' : 'pt-6',
                )}
            >
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={classNames(
                        'flex items-center justify-between gap-8 px-4 py-2.5 rounded-full',
                        'border transition-all duration-500 mx-4 w-full max-w-4xl',
                        isSticky
                            ? 'bg-[#0D0D0D]/90 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
                            : 'bg-transparent border-white/0',
                    )}
                >
                    {/* Logo */}
                    <a href="/" className="flex items-center shrink-0">
                        <img
                            src="/img/logo/logo-dark-full.png"
                            width={110}
                            height={36}
                            alt="RealSales"
                            className="h-8 w-auto"
                        />
                    </a>

                    {/* Desktop nav links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => handleNavClick(link.href)}
                                className="px-4 py-2 text-sm font-medium text-[#9CA3AF] hover:text-[#F5F5F5] rounded-full hover:bg-white/[0.06] transition-all duration-200"
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            to="/sign-in"
                            className="px-4 py-2 text-sm font-medium text-[#9CA3AF] hover:text-[#F5F5F5] transition-colors duration-200"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/sign-in"
                            className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#050505] bg-[#F5F5F5] hover:bg-white rounded-full transition-all duration-200 active:scale-[0.97]"
                        >
                            Book a Demo
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-all duration-200"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <TbMenu2 size={18} />
                    </button>
                </motion.nav>
            </div>

            {/* Mobile full-screen overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] bg-[#050505]/95 backdrop-blur-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 pt-6 pb-4">
                            <a href="/">
                                <img
                                    src="/img/logo/logo-dark-full.png"
                                    width={110}
                                    height={36}
                                    alt="RealSales"
                                    className="h-8 w-auto"
                                />
                            </a>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-all duration-200"
                                aria-label="Close menu"
                            >
                                <TbX size={18} />
                            </button>
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
                                    className="text-left text-2xl font-semibold text-[#F5F5F5]/70 hover:text-[#F5F5F5] py-3 border-b border-white/[0.06] transition-colors duration-200"
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
                                className="flex items-center justify-center py-3.5 text-sm font-semibold text-[#9CA3AF] border border-white/10 rounded-full hover:bg-white/[0.06] transition-all duration-200"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/sign-in"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center py-3.5 text-sm font-semibold text-[#050505] bg-[#F5F5F5] rounded-full hover:bg-white transition-all duration-200 active:scale-[0.98]"
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
