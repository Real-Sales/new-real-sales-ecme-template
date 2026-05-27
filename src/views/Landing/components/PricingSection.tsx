import { motion } from 'framer-motion'
import { TbCheck, TbArrowRight } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { useLandingTheme } from '../LandingThemeProvider'
import { SectionBadge, SectionHeading, SectionDesc } from './landingUi'

const tiers = [
    {
        name: 'Starter',
        price: 'Free',
        period: '',
        description: 'For individual reps exploring AI-powered training.',
        highlight: false,
        cta: 'Get started free',
        ctaTo: '/sign-in',
        features: [
            '10 training sessions per month',
            '3 standard AI buyer personas',
            'Voice and text mode',
            'Basic performance scores',
            '1 seat',
        ],
    },
    {
        name: 'Professional',
        price: '$49',
        period: '/seat/mo',
        description: 'For growing teams that want measurable improvement, fast.',
        highlight: true,
        cta: 'Start free trial',
        ctaTo: '/sign-in',
        features: [
            'Unlimited training sessions',
            '15+ advanced AI buyer personas',
            'Custom industry scenarios',
            'Full analytics dashboard',
            'Manager coaching reports',
            'Up to 50 seats',
            'Priority support',
        ],
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For large organizations with specific compliance and workflow needs.',
        highlight: false,
        cta: 'Talk to sales',
        ctaTo: '/sign-in',
        features: [
            'Unlimited sessions and seats',
            'Custom AI buyer training on your products',
            'Branded scenario library',
            'Advanced team analytics',
            'CRM integrations (Salesforce, HubSpot)',
            'SSO and SOC 2 Type II',
            'Dedicated success manager',
        ],
    },
]

const PricingSection = () => {
    const t = useLandingTheme()

    return (
        <section id="pricing" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <SectionBadge t={t} label="Pricing" />
                    <SectionHeading
                        t={t}
                        text="Straightforward pricing, no surprises"
                        className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight mb-4"
                    />
                    <SectionDesc
                        t={t}
                        text="Start free. Upgrade when your team is ready to scale. No annual lock-in on monthly plans."
                        className="max-w-md mx-auto"
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-4 items-stretch">
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative rounded-2xl flex flex-col transition-all duration-300"
                            style={{
                                border: `1px solid ${tier.highlight ? t.accent : t.border}`,
                                backgroundColor: tier.highlight ? t.accentSubtle : t.surface,
                                boxShadow: tier.highlight
                                    ? `0 0 0 1px ${t.accent}22, 0 32px 64px ${t.isLight ? 'rgba(12,175,96,0.12)' : 'rgba(0,0,0,0.5)'}`
                                    : undefined,
                            }}
                        >
                            {tier.highlight && (
                                <div
                                    className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-full border border-t-0"
                                    style={{
                                        borderColor: t.accent,
                                        backgroundColor: t.accent,
                                    }}
                                >
                                    <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: t.onAccent }}>
                                        Most popular
                                    </span>
                                </div>
                            )}

                            <div className="p-7 flex flex-col flex-1">
                                <div className="mb-6">
                                    <p className="text-sm font-semibold mb-3" style={{ color: t.textMuted }}>
                                        {tier.name}
                                    </p>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-4xl font-bold tracking-tight" style={{ color: t.text }}>
                                            {tier.price}
                                        </span>
                                        {tier.period && (
                                            <span className="text-sm" style={{ color: t.textFaint }}>
                                                {tier.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: t.textFaint }}>
                                        {tier.description}
                                    </p>
                                </div>

                                <Link
                                    to={tier.ctaTo}
                                    className="group flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold mb-7 transition-all duration-200 active:scale-[0.97]"
                                    style={
                                        tier.highlight
                                            ? {
                                                  backgroundColor: t.primaryBtnBg,
                                                  color: t.primaryBtnText,
                                              }
                                            : {
                                                  border: `1px solid ${t.border}`,
                                                  color: t.textMuted,
                                              }
                                    }
                                >
                                    {tier.cta}
                                    <TbArrowRight
                                        size={15}
                                        className="group-hover:translate-x-0.5 transition-transform duration-200"
                                    />
                                </Link>

                                <div className="pt-6 flex-1" style={{ borderTop: `1px solid ${t.border}` }}>
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, j) => (
                                            <li key={j} className="flex items-start gap-3">
                                                <TbCheck size={14} className="mt-0.5 shrink-0" style={{ color: t.accent }} />
                                                <span className="text-sm leading-snug" style={{ color: t.textMuted }}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center text-xs mt-8" style={{ color: t.textDim }}>
                    All plans include a 14-day free trial on paid tiers. No credit card required for Starter.
                </p>
            </div>
        </section>
    )
}

export default PricingSection
