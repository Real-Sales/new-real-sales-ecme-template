import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { TbSettings2, TbMessageChatbot, TbTrendingUp, TbPlayerPlay } from 'react-icons/tb'
import { useLandingTheme } from '../LandingThemeProvider'
import { SectionBadge, SectionHeading, SectionDesc, ParallaxReveal } from './landingUi'

const steps = [
    {
        number: '01',
        icon: TbSettings2,
        title: 'Configure your scenario',
        description:
            'Choose from cold calls, discovery, negotiation, or closing. Upload your own product docs so the AI buyer knows your actual offering, not a generic placeholder.',
        detail: 'Cold call - Discovery - Objection handling - Negotiation - Closing',
    },
    {
        number: '02',
        icon: TbMessageChatbot,
        title: 'Train with your AI buyer',
        description:
            'Speak naturally. Your AI buyer responds in real time, challenges your claims, goes off-script, and behaves the way real decision-makers behave when they are skeptical.',
        detail: 'Voice-first - Real-time feedback - Interruptible - Objection patterns',
    },
    {
        number: '03',
        icon: TbTrendingUp,
        title: 'Review what actually needs fixing',
        description:
            'Each session generates a detailed performance breakdown: confidence score, response time, objection quality, and specific moments where you lost momentum.',
        detail: 'Confidence score - Pacing - Objection quality - Coaching notes',
    },
]

const WorkflowSection = () => {
    const t = useLandingTheme()
    const shouldReduceMotion = useReducedMotion()

    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    })
    const frameParallax = useTransform(scrollYProgress, [0, 1], [60, -60])

    return (
        <section ref={sectionRef} id="workflow" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
                    <SectionBadge t={t} label="How it works" />
                    <SectionHeading
                        t={t}
                        text="From setup to insight in under 5 minutes"
                        className="text-3xl md:text-4xl font-bold tracking-[-0.02em] leading-tight mb-4"
                    />
                    <SectionDesc
                        t={t}
                        text="No lengthy onboarding. No setup calls. Start a realistic training session immediately and get scored feedback the moment it ends."
                        className="leading-relaxed text-base max-w-xl mx-auto"
                    />
                </div>

                <motion.div
                    style={shouldReduceMotion ? undefined : { y: frameParallax }}
                    className="will-change-transform"
                >
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-3xl overflow-hidden p-3 md:p-4 mb-8 md:mb-10"
                    style={{
                        border: `1px solid ${t.borderStrong}`,
                        backgroundColor: t.bgElevated,
                        boxShadow: t.isLight
                            ? '0 24px 60px rgba(15,23,42,0.1)'
                            : '0 24px 60px rgba(0,0,0,0.45)',
                    }}
                >
                    <div
                        className="aspect-video rounded-2xl relative overflow-hidden"
                        style={{
                            border: `1px solid ${t.border}`,
                            background: `linear-gradient(150deg, ${t.surface} 0%, ${t.bgCard} 42%, ${t.surfaceStrong} 100%)`,
                        }}
                    >
                        <div className="absolute inset-x-0 top-0 px-4 md:px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.border}` }}>
                            <p className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: t.textFaint }}>
                                Product Walkthrough
                            </p>
                            <p className="text-xs" style={{ color: t.textDim }}>
                                4:12 min
                            </p>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.button
                                type="button"
                                whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
                                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                                className="h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center border focus-visible:outline-none focus-visible:ring-2"
                                style={{
                                    borderColor: t.borderStrong,
                                    backgroundColor: t.bgElevated,
                                    color: t.accent,
                                    boxShadow: t.isLight
                                        ? '0 12px 30px rgba(0,0,0,0.14)'
                                        : '0 12px 30px rgba(0,0,0,0.45)',
                                }}
                                aria-label="Play product walkthrough"
                            >
                                <TbPlayerPlay size={22} />
                            </motion.button>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                            <div
                                className="rounded-xl px-3.5 py-2.5"
                                style={{
                                    backgroundColor: t.bgElevated,
                                    border: `1px solid ${t.border}`,
                                }}
                            >
                                <p className="text-xs md:text-sm" style={{ color: t.textSecondary }}>
                                    Watch how a rep handles live objection pressure and gets instant coaching after each response.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-4">
                    {steps.map((step, i) => {
                        const Icon = step.icon
                        return (
                            <ParallaxReveal
                                key={step.number}
                                className="h-full"
                                delay={i * 0.08}
                                distance={i % 2 === 0 ? 50 : 85}
                            >
                            <div
                                className="relative rounded-2xl p-6 md:p-7 h-full transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    border: `1px solid ${t.border}`,
                                    backgroundColor: t.bgElevated,
                                    boxShadow: t.isLight
                                        ? '0 12px 28px rgba(15,23,42,0.05)'
                                        : '0 12px 28px rgba(0,0,0,0.24)',
                                }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                                        style={{
                                            backgroundColor: t.accentSubtle,
                                            border: `1px solid ${t.border}`,
                                        }}
                                    >
                                        <Icon size={20} style={{ color: t.accent }} />
                                    </div>
                                    <span className="text-[10px] font-mono tracking-[0.24em]" style={{ color: t.textDim }}>
                                        {step.number}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold mb-2 tracking-tight" style={{ color: t.text }}>
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed mb-4" style={{ color: t.textFaint }}>
                                    {step.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {step.detail.split(' - ').map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 text-[10px] font-medium rounded-full"
                                            style={{
                                                color: t.textFaint,
                                                border: `1px solid ${t.border}`,
                                                backgroundColor: t.surface,
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            </ParallaxReveal>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default WorkflowSection
