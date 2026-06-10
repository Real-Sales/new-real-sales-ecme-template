import { useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TbSettings2, TbMessageChatbot, TbTrendingUp } from 'react-icons/tb'
import { useLandingTheme } from '../LandingThemeProvider'
import { SectionBadge, SectionHeading, SectionDesc, PARALLAX_SPRING } from './landingUi'

gsap.registerPlugin(ScrollTrigger)

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
    const sectionRef = useRef<HTMLDivElement>(null)
    const t = useLandingTheme()
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Steps column drifts against the sticky intro for layered depth.
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    })
    const stepsYRaw = useTransform(scrollYProgress, [0, 1], [70, -70])
    const stepsY = useSpring(stepsYRaw, PARALLAX_SPRING)

    useEffect(() => {
        if (prefersReducedMotion || !sectionRef.current) return

        const ctx = gsap.context(() => {
            gsap.utils.toArray<HTMLElement>('.workflow-step').forEach((step, i) => {
                gsap.fromTo(
                    step,
                    { opacity: 0, y: 48 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: step,
                            start: 'top 82%',
                            once: true,
                        },
                        delay: i * 0.08,
                    },
                )
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [prefersReducedMotion])

    return (
        <section ref={sectionRef} className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">
                    <div id="workflow" className="lg:sticky lg:top-[20vh]">
                        <SectionBadge t={t} label="How it works" />
                        <SectionHeading
                            t={t}
                            text="From setup to insight in under 5 minutes"
                            className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight mb-6"
                        />
                        <SectionDesc
                            t={t}
                            text="No lengthy onboarding. No setup calls. Start a realistic training session immediately and get scored feedback the moment it ends."
                            className="leading-relaxed text-base max-w-md"
                        />

                        <div className="hidden lg:flex items-center gap-3 mt-12">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: t.accent }}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs" style={{ color: t.textDim }}>
                                3 steps to your first session
                            </span>
                        </div>
                    </div>

                    <motion.div
                        className="space-y-6 will-change-transform"
                        style={prefersReducedMotion ? undefined : { y: stepsY }}
                    >
                        {steps.map((step, i) => {
                            const Icon = step.icon
                            return (
                                <div
                                    key={i}
                                    className="workflow-step relative rounded-2xl transition-all duration-300 p-7"
                                    style={{
                                        border: `1px solid ${t.border}`,
                                        backgroundColor: t.surface,
                                    }}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="shrink-0">
                                            <div
                                                className="flex items-center justify-center w-11 h-11 rounded-xl"
                                                style={{
                                                    backgroundColor: t.accentSubtle,
                                                    border: `1px solid ${t.border}`,
                                                }}
                                            >
                                                <Icon size={22} style={{ color: t.accent }} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-[10px] font-mono tracking-widest" style={{ color: t.textDim }}>
                                                    {step.number}
                                                </span>
                                                <div className="h-px flex-1" style={{ backgroundColor: t.border }} />
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
                                    </div>
                                </div>
                            )
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default WorkflowSection
