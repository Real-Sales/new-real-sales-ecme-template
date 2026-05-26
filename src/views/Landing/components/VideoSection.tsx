import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TbSettings2, TbMessageChatbot, TbTrendingUp } from 'react-icons/tb'
import type { Mode } from '@/@types/theme'

gsap.registerPlugin(ScrollTrigger)

const steps = [
    {
        number: '01',
        icon: <TbSettings2 size={22} className="text-[#F5F5F5]" />,
        title: 'Configure your scenario',
        description:
            'Choose from cold calls, discovery, negotiation, or closing. Upload your own product docs so the AI buyer knows your actual offering, not a generic placeholder.',
        detail: 'Cold call - Discovery - Objection handling - Negotiation - Closing',
    },
    {
        number: '02',
        icon: <TbMessageChatbot size={22} className="text-[#F5F5F5]" />,
        title: 'Train with your AI buyer',
        description:
            'Speak naturally. Your AI buyer responds in real time, challenges your claims, goes off-script, and behaves the way real decision-makers behave when they are skeptical.',
        detail: 'Voice-first - Real-time feedback - Interruptible - Objection patterns',
    },
    {
        number: '03',
        icon: <TbTrendingUp size={22} className="text-[#F5F5F5]" />,
        title: 'Review what actually needs fixing',
        description:
            'Each session generates a detailed performance breakdown: confidence score, response time, objection quality, and specific moments where you lost momentum.',
        detail: 'Confidence score - Pacing - Objection quality - Coaching notes',
    },
]

const WorkflowSection = ({ mode }: { mode: Mode }) => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
        <section id="workflow" ref={sectionRef} className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">
                    {/* Left - sticky header */}
                    <div className="lg:sticky lg:top-28">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span className="text-xs font-medium text-[#9CA3AF] tracking-wide">How it works</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F5] tracking-[-0.015em] leading-tight mb-6">
                            From setup to insight in under 5 minutes
                        </h2>
                        <p className="text-[#6B7280] leading-relaxed text-base max-w-md">
                            No lengthy onboarding. No setup calls. Start a realistic training session immediately and get scored feedback the moment it ends.
                        </p>

                        {/* Connector line decoration */}
                        <div className="hidden lg:flex items-center gap-3 mt-12">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-white/20"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-[#4B5563]">3 steps to your first session</span>
                        </div>
                    </div>

                    {/* Right - scrolling steps */}
                    <div className="space-y-6">
                        {steps.map((step, i) => (
                            <div
                                key={i}
                                className="workflow-step relative rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300 p-7"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="shrink-0">
                                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] font-mono text-[#4B5563] tracking-widest">
                                                {step.number}
                                            </span>
                                            <div className="h-px flex-1 bg-white/[0.06]" />
                                        </div>
                                        <h3 className="text-base font-semibold text-[#F5F5F5] mb-2 tracking-tight">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                                            {step.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {step.detail.split(' - ').map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2.5 py-1 text-[10px] font-medium text-[#6B7280] border border-white/[0.06] rounded-full bg-white/[0.02]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default WorkflowSection
