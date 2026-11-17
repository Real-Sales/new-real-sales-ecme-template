import { useRef, useState } from 'react'
import { GlassLayers } from '@/components/ui/liquid-glass'
import { glassCard, glassHairline } from '../landingTheme'
import { motion, useReducedMotion } from 'framer-motion'
import { TbTargetArrow, TbPlayerPlay, TbReportAnalytics, TbBolt } from 'react-icons/tb'
import { useLandingTheme } from '../LandingThemeProvider'
import { SectionBadge, SectionHeading, SectionDesc, ParallaxBlock, useIsNarrow, useParallaxY } from './landingUi'

const metrics = [
    { label: 'Confidence Score', value: '87%', bar: 87, trend: '+12%' },
    { label: 'Objection Quality', value: '72%', bar: 72, trend: '+8%' },
    { label: 'Talk/Listen Ratio', value: '58/42', bar: 58, trend: 'Ideal' },
    { label: 'Close Attempt Rate', value: '91%', bar: 91, trend: '+19%' },
]

const bullets = [
    {
        icon: TbTargetArrow,
        title: 'Pinpoint exact failure moments',
        description: 'Session replays highlight where momentum died, with timestamp-level coaching notes.',
    },
    {
        icon: TbPlayerPlay,
        title: 'Compare across your whole team',
        description: 'See who is improving week over week and who needs focused attention before the next pipeline review.',
    },
    {
        icon: TbReportAnalytics,
        title: 'Track ramp progress automatically',
        description: 'New reps get a structured training path. Managers get a dashboard that replaces 1:1 guesswork.',
    },
    {
        icon: TbBolt,
        title: 'Export reports to your CRM',
        description: 'Push coaching insights directly to Salesforce, HubSpot, or Outreach so nothing lives in a silo.',
    },
]

const DashboardSection = () => {
    const t = useLandingTheme()
    const prefersReducedMotion = useReducedMotion()
    const shouldReduceMotion = prefersReducedMotion
    const isNarrow = useIsNarrow()

    // Same hover treatment as the industry preview card: green border, glow and brighter top shimmer.
    const [hovered, setHovered] = useState(false)
    const cardBorder = hovered ? 'rgba(12,175,96,0.32)' : glassHairline(t)
    const cardShadow = hovered
        ? `0 0 60px rgba(12,175,96,0.1), 0 40px 80px ${t.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.7)'}`
        : `0 20px 60px ${t.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.6)'}`

    const sectionRef = useRef<HTMLElement>(null)
    // Desktop: mockup drifts up, supporting copy drifts down → layered parallax depth.
    // Phones: the column stays put and the mockup (placed inside it) drifts on its own.
    const mockupParallax = useParallaxY(sectionRef, 70)
    const copyParallax = useParallaxY(sectionRef, -40)

    // The analytics mockup. Rendered beside the copy on desktop and directly under the intro text on smaller screens.
    const renderMockup = (placement: string) => (
            <motion.div
                initial={shouldReduceMotion ? false : isNarrow ? { opacity: 0 } : { opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={shouldReduceMotion || isNarrow ? undefined : { y: mockupParallax }}
                className={`relative will-change-transform ${placement}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Ambient outer glow */}
                <motion.div
                    className="absolute rounded-3xl pointer-events-none"
                    animate={{ opacity: hovered ? 1 : 0.5 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(12,175,96,0.14) 0%, transparent 65%)',
                        filter: 'blur(20px)',
                        inset: '-20px',
                    }}
                />

                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        ...glassCard(t),
                        border: `1px solid ${cardBorder}`,
                        boxShadow: cardShadow,
                        transition: 'border 0.4s, box-shadow 0.4s',
                    }}
                >
                    <GlassLayers light={t.isLight} />
                    {/* Top shimmer line */}
                    <motion.div
                        className="absolute top-0 left-0 right-0 h-px"
                        animate={{ opacity: hovered ? 1 : 0.4 }}
                        transition={{ duration: 0.4 }}
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(12,175,96,0.7) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.7) 70%, transparent)' }}
                    />
                    <div
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{ borderBottom: `1px solid ${t.border}` }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.textDim }} />
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.textFaint }} />
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accent }} />
                            </div>
                            <span className="text-xs ml-1" style={{ color: t.textFaint }}>
                                Session Analytics
                            </span>
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: t.textDim }}>
                            Last 30 days
                        </span>
                    </div>

                    <div
                        className="grid grid-cols-3 border-b"
                        style={{ borderColor: t.border }}
                    >
                        {[
                            { label: 'Sessions', value: '48' },
                            { label: 'Avg Score', value: '81%' },
                            { label: 'Improvement', value: '+23%' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="px-4 py-3 text-center"
                                style={{
                                    borderRight: i < 2 ? `1px solid ${t.border}` : undefined,
                                }}
                            >
                                <p className="text-lg font-semibold tracking-tight tabular-nums" style={{ color: t.text }}>
                                    {item.value}
                                </p>
                                <p className="text-[10px] mt-0.5" style={{ color: t.textFaint }}>
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="px-5 py-5 space-y-4">
                        <p className="text-[10px] font-medium uppercase tracking-widest mb-4" style={{ color: t.textDim }}>
                            Performance breakdown
                        </p>
                        {metrics.map((m, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs" style={{ color: t.textMuted }}>
                                        {m.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px]" style={{ color: t.textDim }}>
                                            {m.trend}
                                        </span>
                                        <span className="text-xs font-semibold tabular-nums" style={{ color: t.text }}>
                                            {m.value}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1 rounded-full" style={{ backgroundColor: t.surfaceStrong }}>
                                    <motion.div
                                        className="h-1 rounded-full"
                                        style={{
                                            background: `linear-gradient(to right, ${t.accent}, ${t.accentMild})`,
                                        }}
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${m.bar}%` }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0.01 : 1.1,
                                            delay: shouldReduceMotion ? 0 : i * 0.12 + 0.4,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-5 pb-5">
                        <div
                            className="rounded-xl p-4"
                            style={{
                                border: `1px solid ${t.border}`,
                                backgroundColor: t.surface,
                            }}
                        >
                            <p className="text-[10px] mb-3" style={{ color: t.textDim }}>
                                Weekly session trend
                            </p>
                            <div className="flex items-end gap-1.5 h-14">
                                {[28, 44, 36, 52, 40, 60, 48, 64].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 rounded-t-sm cursor-default"
                                        style={{
                                            height: `${(h / 64) * 100}%`,
                                            backgroundColor: t.accent,
                                            opacity: 0.35 + (h / 64) * 0.5,
                                        }}
                                        initial={{ scaleY: 0, originY: 1 }}
                                        whileInView={{ scaleY: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0.01 : 0.5,
                                            delay: shouldReduceMotion ? 0 : i * 0.06 + 0.6,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
    )

    return (
        <section ref={sectionRef} className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
                    {renderMockup('hidden lg:block')}

                    <motion.div
                        initial={shouldReduceMotion ? false : isNarrow ? { opacity: 0 } : { opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{
                            duration: shouldReduceMotion ? 0.01 : 0.7,
                            delay: shouldReduceMotion ? 0 : 0.15,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        style={shouldReduceMotion || isNarrow ? undefined : { y: copyParallax }}
                        className="will-change-transform"
                    >
                        <SectionBadge t={t} label="Sales intelligence" />
                        <SectionHeading
                            t={t}
                            text="Know exactly what to fix, not just how you felt"
                            className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight mb-4"
                        />
                        <SectionDesc
                            t={t}
                            text="Generic feedback is useless. SalesWana gives managers and reps the specific data they need to improve - one session at a time."
                            className="leading-relaxed mb-10"
                        />

                        <ParallaxBlock enabled={isNarrow} className="lg:hidden mb-10">
                            {renderMockup('')}
                        </ParallaxBlock>

                        <div className="space-y-6">
                            {bullets.map((b, i) => {
                                const Icon = b.icon
                                return (
                                    <motion.div
                                        key={i}
                                        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: shouldReduceMotion ? 0.01 : 0.5,
                                            delay: shouldReduceMotion ? 0 : i * 0.08 + 0.2,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                        className="flex items-start gap-4"
                                    >
                                        <div
                                            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
                                            style={{
                                                backgroundColor: t.accentSubtle,
                                                border: `1px solid ${t.border}`,
                                            }}
                                        >
                                            <Icon size={16} style={{ color: t.accent }} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold mb-1" style={{ color: t.text }}>
                                                {b.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed" style={{ color: t.textFaint }}>
                                                {b.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default DashboardSection
