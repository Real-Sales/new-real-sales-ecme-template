import { useState } from 'react'
import NavList from './NavList'
import Drawer from '@/components/ui/Drawer'
import { Button } from '@/components/ui'
import classNames from '@/utils/classNames'
import useScrollTop from '@/utils/hooks/useScrollTop'
import ThemeToggleButton from '@/components/shared/ThemeToggleButton'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { TbMenu2 } from "react-icons/tb"
import { HiChevronDown } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import type { Mode } from '@/@types/theme'

type NavigationProps = {
    mode: Mode
}

const navMenu = [
    {
        title: 'Home',
        value: 'home',
        to: 'home'
    },
    {
        title: 'About',
        value: 'about',
        href: '/about'
    },
    {
        title: 'FAQs',
        value: 'faqs',
        href: '/faqs'
    }
]

const caseStudyItems = [
    {
        title: 'Food & Beverage Equipment',
        href: '/case-study/food-beverage'
    },
    {
        title: 'Healthcare (coming soon)',
        href: '#',
        disabled: true
    }
]

const Navigation = ({ mode }: NavigationProps) => {

    const { isSticky } = useScrollTop()

    const [isOpen, setIsOpen] = useState(false)
    const [showCaseStudyDropdown, setShowCaseStudyDropdown] = useState(false)

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    return (
        <div style={{ transition: 'all 0.2s ease-in-out' }} className={classNames('w-full fixed inset-x-0 z-[50]', isSticky ? 'top-4' : 'top-0')}>
            <div className={
                classNames('flex flex-row self-start items-center justify-between py-3 max-w-7xl mx-auto px-4 rounded-xl relative z-[60] w-full transition duration-200', isSticky ? 'bg-white dark:bg-gray-800 shadow-lg' : 'bg-transparent dark:bg-transparent')
            }>
                <button className="flex lg:hidden items-center gap-4" onClick={openDrawer}>
                    <TbMenu2 size={24} />
                </button>
                <Drawer
                    title="Navigation"
                    isOpen={isOpen}
                    width={250}
                    placement="left"
                    onClose={onDrawerClose}
                    onRequestClose={onDrawerClose}
                >
                    <div className="flex flex-col gap-4">
                        <NavList tabs={navMenu} onTabClick={onDrawerClose} />
                        {/* Case Study & Industries in Mobile */}
                        <div className="flex flex-col gap-2">
                            <div className="px-5 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                                Case Study & Industries
                            </div>
                            {caseStudyItems.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.disabled ? '#' : item.href}
                                    onClick={(e) => {
                                        item.disabled && e.preventDefault()
                                        onDrawerClose()
                                    }}
                                    className={classNames(
                                        'px-5 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors',
                                        item.disabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    {item.title}
                                </a>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                asElement={Link}
                                to="/sign-in"
                                variant="default"
                                block
                                className="mx-5 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                                onClick={onDrawerClose}
                            >
                                Sign In/Up
                            </Button>
                            <Button
                                size="sm"
                                variant="solid"
                                className="bg-primary hover:bg-primary-deep text-white mx-5"
                                onClick={onDrawerClose}
                            >
                                Book a Demo
                            </Button>
                        </div>
                    </div>
                </Drawer>
                <a href="/">
                    {
                        mode === MODE_LIGHT && (
                            <img
                                src="/img/logo/logo-light-full.png"
                                width={120}
                                height={40}
                                alt="logo"
                            />
                        )
                    }
                    {
                        mode === MODE_DARK && (
                            <img
                                src="/img/logo/logo-dark-full.png"
                                width={120}
                                height={40}
                                alt="logo"
                            />
                        )
                    }
                </a>
                <div className="lg:flex flex-row flex-1 absolute inset-0 hidden items-center justify-center text-sm font-medium transition duration-200 [perspective:1000px] overflow-auto sm:overflow-visible no-visible-scrollbar pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <NavList tabs={navMenu} />
                        {/* Case Study & Industries Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowCaseStudyDropdown(true)}
                            onMouseLeave={() => setShowCaseStudyDropdown(false)}
                        >
                            <button className="relative px-5 py-2 rounded-xl flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                                <span className="heading-text group-hover:text-primary transition-colors">Case Study & Industries</span>
                                <HiChevronDown className="text-sm text-zinc-400 group-hover:text-primary transition-colors" />
                            </button>
                            {showCaseStudyDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {caseStudyItems.map((item, index) => (
                                        <a
                                            key={index}
                                            href={item.disabled ? '#' : item.href}
                                            onClick={(e) => item.disabled && e.preventDefault()}
                                            className={classNames(
                                                'block px-4 py-3 text-sm transition-colors',
                                                item.disabled
                                                    ? 'text-zinc-400 cursor-not-allowed opacity-60'
                                                    : 'text-gray-900 dark:text-gray-100 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
                                            )}
                                        >
                                            <div className="font-semibold">{item.title}</div>
                                            {item.disabled && <div className="text-xs mt-0.5 opacity-70 italic">Coming soon</div>}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        asElement={Link}
                        to="/sign-in"
                        size="sm"
                        variant="default"
                        className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:text-primary-deep"
                    >
                        Sign In/Up
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        className="bg-primary hover:bg-primary-deep text-white"
                    >
                        Book a Demo
                    </Button>
                    <ThemeToggleButton />
                </div>
            </div>
        </div>
    )
}

export default Navigation
