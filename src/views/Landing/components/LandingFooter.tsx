import { useLandingTheme } from '../LandingThemeProvider'
import { glassPlain } from '../landingTheme'
import { scrollToLandingSection } from '../smoothScroll'
import SalesWanaLogo from '@/components/template/SalesWanaLogo'

const footerLinks = {
    Product: [
        { label: 'Features', href: '/#features' },
        { label: 'How It Works', href: '/#workflow' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'Book a Demo', href: '/book-demo' },
        { label: 'Start Free', href: '/sign-up' },
    ],
    Resources: [
        { label: 'FAQ', href: '/faqs' },
        { label: 'About', href: '/about' },
        { label: 'Food & Beverage', href: '/industries/food-and-beverages' },
        { label: 'Product Home', href: '/' },
    ],
    Company: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: 'mailto:hello@saleswana.com' },
        { label: 'Book a Demo', href: '/book-demo' },
    ],
    Legal: [
        { label: 'Privacy', href: 'mailto:hello@saleswana.com?subject=Privacy%20Policy' },
        { label: 'Terms', href: 'mailto:hello@saleswana.com?subject=Terms%20of%20Service' },
    ],
}

const LandingFooter = () => {
    const t = useLandingTheme()
    const year = new Date().getFullYear()

    const handleNavClick = (href: string) => {
        const hash = href.includes('#') ? `#${href.split('#')[1]}` : ''
        if (!hash || hash === '#') return
        const el = document.querySelector(hash) as HTMLElement | null
        if (!el) return
        scrollToLandingSection(el)
    }

    return (
        <footer style={{ borderTop: `1px solid ${t.border}`, ...glassPlain(t) }}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="py-14 md:py-16 grid grid-cols-2 md:grid-cols-[240px_1fr_1fr_1fr_1fr] gap-x-8 gap-y-10">
                    <div className="col-span-2 md:col-span-1">
                        <a href="/" className="inline-block mb-4">
                            <SalesWanaLogo
                                mode={t.isLight ? 'light' : 'dark'}
                                type="full"
                                iconSize={38}
                                textSize="1.4rem"
                            />
                        </a>
                        <p className="text-xs leading-relaxed max-w-[180px]" style={{ color: t.textMuted }}>
                            AI-powered sales training for revenue teams that want to close more deals.
                        </p>
                        <p className="text-xs mt-5" style={{ color: t.textMuted }}>
                            <a
                                href="mailto:hello@saleswana.com"
                                className="relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                                style={{ color: t.textSecondary }}
                            >
                                hello@saleswana.com
                            </a>
                        </p>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <p
                                className="text-xs font-semibold uppercase tracking-[0.15em] mb-4"
                                style={{ color: t.textSecondary }}
                            >
                                {category}
                            </p>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        {link.href.startsWith('#') ? (
                                            <button
                                                onClick={() => handleNavClick(link.href)}
                                                className="text-xs transition-colors duration-200 relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                                                style={{ color: t.textMuted }}
                                            >
                                                {link.label}
                                            </button>
                                        ) : link.href.startsWith('mailto') ? (
                                            <a
                                                href={link.href}
                                                className="text-xs transition-colors duration-200 relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                                                style={{ color: t.textMuted }}
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <a
                                                href={link.href}
                                                className="text-xs transition-colors duration-200 relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                                                style={{ color: t.textMuted }}
                                            >
                                                {link.label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div
                    className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                    style={{ borderTop: `1px solid ${t.border}` }}
                >
                    <p className="text-[11px]" style={{ color: t.textMuted }}>
                        &copy; {year} SalesWana. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="/faqs"
                            className="text-[11px] transition-colors duration-200 relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                            style={{ color: t.textMuted }}
                        >
                            FAQs
                        </a>
                        <a
                            href="/about"
                            className="text-[11px] transition-colors duration-200 relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                            style={{ color: t.textMuted }}
                        >
                            About
                        </a>
                        <a
                            href="mailto:hello@saleswana.com"
                            className="text-[11px] transition-colors duration-200 relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                            style={{ color: t.textMuted }}
                        >
                            hello@saleswana.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default LandingFooter
