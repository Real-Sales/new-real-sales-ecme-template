import { motion } from 'framer-motion'
import { TbCheck, TbArrowRight } from 'react-icons/tb'
import { Link } from 'react-router-dom'

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
    return (
        <section id="pricing" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span className="text-xs font-medium text-[#9CA3AF] tracking-wide">Pricing</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F5] tracking-[-0.015em] leading-tight mb-4">
                        Straightforward pricing, no surprises
                    </h2>
                    <p className="text-[#6B7280] max-w-md mx-auto">
                        Start free. Upgrade when your team is ready to scale. No annual lock-in on monthly plans.
                    </p>
                </div>

                {/* Pricing cards */}
                <div className="grid md:grid-cols-3 gap-4 items-stretch">
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={[
                                'relative rounded-2xl flex flex-col transition-all duration-300',
                                tier.highlight
                                    ? 'border border-white/[0.2] bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_32px_64px_rgba(0,0,0,0.5)]'
                                    : 'border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]',
                            ].join(' ')}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-full border border-t-0 border-white/[0.15] bg-white/[0.08]">
                                    <span className="text-[10px] font-semibold text-[#F5F5F5] whitespace-nowrap">
                                        Most popular
                                    </span>
                                </div>
                            )}

                            <div className="p-7 flex flex-col flex-1">
                                {/* Tier header */}
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-[#9CA3AF] mb-3">{tier.name}</p>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-4xl font-bold text-[#F5F5F5] tracking-tight">
                                            {tier.price}
                                        </span>
                                        {tier.period && (
                                            <span className="text-sm text-[#6B7280]">{tier.period}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[#6B7280] leading-relaxed">{tier.description}</p>
                                </div>

                                {/* CTA */}
                                <Link
                                    to={tier.ctaTo}
                                    className={[
                                        'group flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold mb-7 transition-all duration-200 active:scale-[0.97]',
                                        tier.highlight
                                            ? 'bg-[#F5F5F5] text-[#050505] hover:bg-white'
                                            : 'border border-white/[0.1] text-[#9CA3AF] hover:text-[#F5F5F5] hover:border-white/[0.2] hover:bg-white/[0.04]',
                                    ].join(' ')}
                                >
                                    {tier.cta}
                                    <TbArrowRight
                                        size={15}
                                        className="group-hover:translate-x-0.5 transition-transform duration-200"
                                    />
                                </Link>

                                {/* Feature list */}
                                <div className="border-t border-white/[0.06] pt-6 flex-1">
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, j) => (
                                            <li key={j} className="flex items-start gap-3">
                                                <TbCheck
                                                    size={14}
                                                    className="text-[#9CA3AF] mt-0.5 shrink-0"
                                                />
                                                <span className="text-sm text-[#9CA3AF] leading-snug">
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

                <p className="text-center text-xs text-[#4B5563] mt-8">
                    All plans include a 14-day free trial on paid tiers. No credit card required for Starter.
                </p>
            </div>
        </section>
    )
}

export default PricingSection
