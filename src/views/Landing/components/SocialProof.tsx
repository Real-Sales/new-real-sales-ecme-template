import { motion, useReducedMotion } from 'framer-motion'
import { useLandingTheme } from '../LandingThemeProvider'
import { SectionBadge, SectionHeading, SectionDesc, ParallaxReveal } from './landingUi'

const testimonials = [
    {
        quote:
            'We cut our ramp time by 40 percent. New reps reach quota in 6 weeks instead of 12. The AI buyer is legitimately harder to handle than most real prospects.',
        name: 'James Kowalski',
        role: 'VP of Sales',
        company: 'Meridian Software',
        initials: 'JK',
    },
    {
        quote:
            'My team used to dread cold calls. Now they compete over who can handle the toughest objection scenarios. Confidence went through the roof inside 3 weeks.',
        name: 'Priya Nair',
        role: 'Director of Revenue',
        company: 'Patchwork Labs',
        initials: 'PN',
    },
    {
        quote:
            'We stopped guessing who needed coaching. The conversation analytics made it completely obvious. This replaced two manual review processes overnight.',
        name: 'Sarah Chen',
        role: 'Sales Manager',
        company: 'Covey Systems',
        initials: 'SC',
    },
    {
        quote:
            'The AI buyer feels genuinely hostile at times. That is exactly what my reps need before they face real executives. Nothing else on the market does this.',
        name: 'Marcus Wheeler',
        role: 'Chief Revenue Officer',
        company: 'Forefront AI',
        initials: 'MW',
    },
    {
        quote:
            'Best ROI we have seen from any sales enablement tool. 4.8x return in the first 90 days, tracked directly through pipeline data.',
        name: 'Alex Okonkwo',
        role: 'Revenue Operations',
        company: 'TrueNorth Capital',
        initials: 'AO',
    },
    {
        quote:
            'I use it before every big deal. Having a hard conversation with an AI buyer resets my confidence completely. It is the closest thing to real pressure I have found.',
        name: 'Lauren Park',
        role: 'Enterprise Account Executive',
        company: 'Stratus Cloud',
        initials: 'LP',
    },
]

const integrationNames = [
    'Salesforce', 'HubSpot', 'Outreach', 'Salesloft', 'Gong', 'Chorus',
    'Zoom', 'Microsoft Teams', 'Slack', 'Pipedrive', 'Salesforce', 'HubSpot',
]

const SocialProof = () => {
    const t = useLandingTheme()
    const shouldReduceMotion = useReducedMotion()

    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[340px]"
                style={{
                    background: `radial-gradient(ellipse 50% 100% at 50% 0%, ${t.accent}12 0%, transparent 70%)`,
                }}
            />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <SectionBadge t={t} label="Testimonials" />
                    <SectionHeading
                        t={t}
                        text="What top sales teams say"
                        className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight mb-4"
                    />
                    <SectionDesc
                        t={t}
                        text="Revenue teams across industries use RealSales to train faster and close more."
                        className="max-w-md mx-auto"
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.map((item, i) => (
                        <ParallaxReveal
                            key={i}
                            className="h-full"
                            delay={(i % 3) * 0.08}
                            distance={i % 2 === 0 ? 50 : 85}
                        >
                        <div
                            className="relative rounded-2xl p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1"
                            style={{
                                border: `1px solid ${t.border}`,
                                backgroundColor: t.bgElevated,
                                boxShadow: t.isLight
                                    ? '0 12px 28px rgba(15,23,42,0.05)'
                                    : '0 12px 28px rgba(0,0,0,0.24)',
                            }}
                        >
                            <div
                                className="text-4xl leading-none font-serif mb-3 select-none"
                                style={{ color: t.accentSubtle }}
                            >
                                &ldquo;
                            </div>
                            <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: t.textSecondary }}>
                                {item.quote}
                            </p>
                            <div
                                className="flex items-center gap-3 pt-4"
                                style={{ borderTop: `1px solid ${t.border}` }}
                            >
                                <div
                                    className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-semibold shrink-0"
                                    style={{
                                        backgroundColor: t.accentSubtle,
                                        border: `1px solid ${t.border}`,
                                        color: t.accent,
                                    }}
                                >
                                    {item.initials}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold" style={{ color: t.text }}>
                                        {item.name}
                                    </p>
                                    <p className="text-[10px]" style={{ color: t.textFaint }}>
                                        {item.role}, {item.company}
                                    </p>
                                </div>
                            </div>
                        </div>
                        </ParallaxReveal>
                    ))}
                </div>

                <div className="mt-20 pt-16" style={{ borderTop: `1px solid ${t.border}` }}>
                    <p className="text-xs text-center mb-8 uppercase tracking-[0.2em]" style={{ color: t.textDim }}>
                        Works with your existing stack
                    </p>
                    <div className="overflow-hidden">
                        <div className="flex gap-8 items-center">
                            <motion.div
                                className="flex gap-8 items-center shrink-0"
                                animate={shouldReduceMotion ? { x: 0 } : { x: ['0%', '-50%'] }}
                                transition={
                                    shouldReduceMotion
                                        ? { duration: 0.01 }
                                        : { duration: 22, repeat: Infinity, ease: 'linear' }
                                }
                            >
                                {[...integrationNames, ...integrationNames].map((name, i) => (
                                    <div
                                        key={i}
                                        className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 hover:-translate-y-0.5 opacity-75 hover:opacity-100"
                                        style={{
                                            border: `1px solid ${t.border}`,
                                            backgroundColor: t.bgElevated,
                                            color: t.textMuted,
                                        }}
                                    >
                                        {name}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SocialProof
