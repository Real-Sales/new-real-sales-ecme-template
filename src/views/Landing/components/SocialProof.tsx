import type { CSSProperties } from 'react'
import { glassFlat } from '../landingTheme'
import { motion, useReducedMotion } from 'framer-motion'
import classNames from '@/utils/classNames'
import { Marquee } from '@/components/magicui/Marquee'
import { useLandingTheme } from '../LandingThemeProvider'
import type { LandingTheme } from '../landingTheme'
import { SectionBadge, SectionHeading, SectionDesc } from './landingUi'

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

const firstRow = testimonials.slice(0, testimonials.length / 2)
const secondRow = testimonials.slice(testimonials.length / 2)

const MARQUEE_FADE =
    'linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)'

const MARQUEE_MASK: CSSProperties = {
    WebkitMaskImage: MARQUEE_FADE,
    maskImage: MARQUEE_FADE,
}

const integrationNames = [
    'Salesforce', 'HubSpot', 'Outreach', 'Salesloft', 'Gong', 'Chorus',
    'Zoom', 'Microsoft Teams', 'Slack', 'Pipedrive', 'Salesforce', 'HubSpot',
]

function TestimonialCard({
    t,
    quote,
    name,
    role,
    company,
    initials,
}: {
    t: LandingTheme
    quote: string
    name: string
    role: string
    company: string
    initials: string
}) {
    return (
        <div
            className={classNames(
                'relative shrink-0 rounded-2xl p-4 sm:p-6 flex flex-col my-1',
                'w-[min(14.5rem,calc(100vw-2rem))] sm:w-72 md:w-80',
            )}
            style={{
                border: '1px solid transparent',
                ...glassFlat(t),
            }}
        >
            <div
                className="text-3xl sm:text-4xl leading-none font-serif mb-2 sm:mb-3 select-none"
                style={{ color: t.accentSubtle }}
            >
                &ldquo;
            </div>
            <p className="text-xs sm:text-sm leading-relaxed flex-1 mb-4 sm:mb-6" style={{ color: t.textSecondary }}>
                {quote}
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
                    {initials}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: t.text }}>
                        {name}
                    </p>
                    <p className="text-[10px]" style={{ color: t.textFaint }}>
                        {role}, {company}
                    </p>
                </div>
            </div>
        </div>
    )
}

const SocialProof = () => {
    const t = useLandingTheme()
    const shouldReduceMotion = useReducedMotion()

    return (
        <section className="py-24 md:py-32 relative overflow-x-hidden">
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[340px]"
                style={{
                    background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${t.accent}12 0%, transparent 70%)`,
                }}
            />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <SectionBadge t={t} label="Testimonials" />
                    <SectionHeading
                        t={t}
                        text="What top sales teams say"
                        className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight mb-4"
                    />
                    <SectionDesc
                        t={t}
                        text="Revenue teams across industries use SalesWana to train faster and close more."
                        className="max-w-md mx-auto"
                    />
                </div>

                {shouldReduceMotion ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((item) => (
                            <TestimonialCard key={item.name} t={t} {...item} />
                        ))}
                    </div>
                ) : (
                    <div
                        className="relative -mx-4 sm:-mx-6 flex w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] flex-col justify-center overflow-y-visible py-2"
                        style={MARQUEE_MASK}
                    >
                        <div className="w-full py-1">
                            <Marquee className="[--duration:28s] [--gap:0.75rem] sm:[--gap:1rem] py-2">
                                {firstRow.map((item) => (
                                    <TestimonialCard key={item.name} t={t} {...item} />
                                ))}
                            </Marquee>
                        </div>
                        <div className="w-full -mt-1 py-1">
                            <Marquee
                                reverse
                                className="[--duration:28s] [--gap:0.75rem] sm:[--gap:1rem] py-2"
                            >
                                {secondRow.map((item) => (
                                    <TestimonialCard key={item.name} t={t} {...item} />
                                ))}
                            </Marquee>
                        </div>
                    </div>
                )}

                <div className="mt-20 pt-16" style={{ borderTop: `1px solid ${t.border}` }}>
                    <p className="text-xs text-center mb-8 uppercase tracking-[0.2em]" style={{ color: t.textDim }}>
                        Works with your existing stack
                    </p>
                    <div
                        className="overflow-hidden max-w-5xl mx-auto"
                        style={{ maskImage: 'linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)' }}
                    >
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
                                            border: '1px solid transparent',
                                            ...glassFlat(t),
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
