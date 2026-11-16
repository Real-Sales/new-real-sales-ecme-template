import { TbCheck, TbArrowRight } from 'react-icons/tb'
import { GlassLayers } from '@/components/ui/liquid-glass'
import { glassCard, glassEdge } from '../landingTheme'
import { Link } from 'react-router-dom'
import { useLandingTheme } from '../LandingThemeProvider'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import GradientText from '@/components/reactbits/GradientText'
import { SectionBadge, SectionHeading, SectionDesc, ParallaxReveal } from './landingUi'

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
        <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
                style={{
                    background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${t.accent}14 0%, transparent 70%)`,
                }}
            />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
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
                        <ParallaxReveal
                            key={tier.name}
                            className="h-full"
                            delay={i * 0.1}
                            distance={i % 2 === 0 ? 55 : 90}
                        >
                        <SpotlightCard
                            theme={t.isLight ? 'light' : 'dark'}
                            spotlightColor={t.accent}
                            spotlightSize={320}
                            intensity={t.isLight ? 0.12 : 0.2}
                            className="!rounded-2xl !p-0 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1"
                            style={{
                                ['--spotlight-card-border' as string]: 'transparent',
                                ...glassCard(t),
                                ...(tier.highlight ? { border: `1px solid ${t.accent}` } : {}),
                                boxShadow: tier.highlight
                                    ? t.isLight
                                      ? `${glassEdge(t, '')}, 0 24px 56px rgba(12,175,96,0.14)`
                                      : `0 0 0 1px ${t.accent}22, 0 32px 64px rgba(0,0,0,0.5)`
                                    : t.isLight
                                      ? glassEdge(t, '')
                                      : '0 12px 26px rgba(0,0,0,0.24)',
                            }}
                        >
                            <GlassLayers light={t.isLight} tint={!t.isLight && tier.highlight ? 'rgba(12,175,96,0.10)' : undefined} />
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
                                            {tier.highlight ? (
                                                <GradientText colors={[t.accentMild, '#38D6E8', t.accent, '#A7F3D0', t.accentMild]} animationSpeed={6}>
                                                    {tier.price}
                                                </GradientText>
                                            ) : (
                                                tier.price
                                            )}
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
                                    className="group flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold mb-7 transition-all duration-200 hover:-translate-y-0.5 hover:!border-[#0CAF60]/60 hover:!shadow-[0_12px_30px_rgba(12,175,96,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2"
                                    style={
                                        tier.highlight
                                            ? {
                                                  backgroundColor: t.primaryBtnBg,
                                                  color: t.primaryBtnText,
                                                  boxShadow: t.isLight
                                                      ? '0 10px 24px rgba(16,185,129,0.22)'
                                                      : '0 10px 24px rgba(0,0,0,0.38)',
                                              }
                                            : {
                                                  border: `1px solid ${t.border}`,
                                                  color: t.textMuted,
                                                  backgroundColor: t.surface,
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
                        </SpotlightCard>
                        </ParallaxReveal>
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
