import type { Mode } from '@/@types/theme'

const footerLinks = {
    Product: [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#workflow' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Integrations', href: '#' },
        { label: 'Changelog', href: '#' },
    ],
    Resources: [
        { label: 'FAQ', href: '#faq' },
        { label: 'Documentation', href: '#' },
        { label: 'Case Studies', href: '/case-study/food-beverage' },
        { label: 'Blog', href: '#' },
        { label: 'Status', href: '#' },
    ],
    Company: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: 'mailto:hello@realsales.ai' },
        { label: 'Partners', href: '#' },
    ],
    Legal: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'Security', href: '#' },
    ],
}

const LandingFooter = ({ mode }: { mode: Mode }) => {
    const year = new Date().getFullYear()

    const handleNavClick = (href: string) => {
        if (href.startsWith('#')) {
            const el = document.querySelector(href)
            if (el) el.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <footer className="border-t border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-4">
                {/* Main footer grid */}
                <div className="py-14 grid grid-cols-2 md:grid-cols-[200px_1fr_1fr_1fr_1fr] gap-x-8 gap-y-10">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                        <a href="/" className="inline-block mb-4">
                            <img
                                src="/img/logo/logo-dark-full.png"
                                width={110}
                                height={36}
                                alt="RealSales"
                                className="h-8 w-auto"
                            />
                        </a>
                        <p className="text-xs text-[#4B5563] leading-relaxed max-w-[180px]">
                            AI-powered sales training for revenue teams that want to close more deals.
                        </p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-[0.15em] mb-4">
                                {category}
                            </p>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        {link.href.startsWith('#') ? (
                                            <button
                                                onClick={() => handleNavClick(link.href)}
                                                className="text-xs text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-200"
                                            >
                                                {link.label}
                                            </button>
                                        ) : link.href.startsWith('mailto') ? (
                                            <a
                                                href={link.href}
                                                className="text-xs text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-200"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <a
                                                href={link.href}
                                                className="text-xs text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-200"
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

                {/* Bottom bar */}
                <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-[#4B5563]">
                        &copy; {year} RealSales. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="#"
                            className="text-[11px] text-[#4B5563] hover:text-[#6B7280] transition-colors duration-200"
                        >
                            Privacy
                        </a>
                        <a
                            href="#"
                            className="text-[11px] text-[#4B5563] hover:text-[#6B7280] transition-colors duration-200"
                        >
                            Terms
                        </a>
                        <a
                            href="mailto:hello@realsales.ai"
                            className="text-[11px] text-[#4B5563] hover:text-[#6B7280] transition-colors duration-200"
                        >
                            hello@realsales.ai
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default LandingFooter
