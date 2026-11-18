import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
    TbAdjustmentsHorizontal,
    TbUserCircle,
    TbMicrophone2,
    TbMessageChatbot,
    TbChartArrowsVertical,
} from 'react-icons/tb'
import { Reveal, SectionHeading, EASE_OUT } from './common'

gsap.registerPlugin(ScrollTrigger)

const steps = [
    {
        title: 'Select persona',
        description: 'Pick the AI buyer that fits your scenario.',
        icon: TbUserCircle,
    },
    {
        title: 'Choose mode',
        description: 'Prospecting, discovery, or closing.',
        icon: TbAdjustmentsHorizontal,
    },
    {
        title: 'Talk naturally',
        description: 'Speak or type through a live conversation.',
        icon: TbMicrophone2,
    },
    {
        title: 'Receive AI feedback',
        description: 'Get a scored breakdown right after the call.',
        icon: TbMessageChatbot,
    },
    {
        title: 'Improve performance',
        description: 'Track the gap close session over session.',
        icon: TbChartArrowsVertical,
    },
]

const STEP_COUNT = steps.length
const GAP_REM = 1 // md:gap-4

/**
 * Single connector: animates left → right as you scroll (same as before),
 * but only from the first circle center to the last circle center.
 */
const JourneyConnector = ({
    containerRef,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>
}) => {
    const lineRef = useRef<HTMLDivElement>(null)
    const reduce = useReducedMotion()

    useEffect(() => {
        if (reduce || !lineRef.current || !containerRef.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo(
                lineRef.current,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 75%',
                        end: 'bottom 60%',
                        scrub: 0.6,
                    },
                },
            )
        }, containerRef)
        return () => ctx.revert()
    }, [reduce, containerRef])

    // 5 equal columns + gap-4: distance between first & last circle centers
    // = (n-1)/n of content width + (n-1)/n of total gap
    const lineWidth = `calc(${((STEP_COUNT - 1) / STEP_COUNT) * 100}% + ${((STEP_COUNT - 1) / STEP_COUNT) * GAP_REM}rem)`

    return (
        <div
            className="pointer-events-none absolute top-[19px] z-0 hidden h-px md:block"
            style={{ left: 19, width: lineWidth }}
        >
            <div className="h-px w-full bg-gray-200 dark:bg-white/10" />
            <div
                ref={lineRef}
                className="absolute inset-0 h-px w-full origin-left bg-gradient-to-r from-primary via-primary-mild to-primary"
                style={{ transform: 'scaleX(0)' }}
            />
        </div>
    )
}

const InteractiveJourney = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [activeStep, setActiveStep] = useState<number | null>(null)

    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-12">
                    <SectionHeading
                        eyebrow="The training loop"
                        heading="One conversation, five moves"
                        description="Every session follows the same rhythm, so the feedback you get always maps back to something you can practice again."
                    />
                </Reveal>

                <div ref={containerRef} className="relative">
                    <JourneyConnector containerRef={containerRef} />

                    <div className="grid gap-8 md:grid-cols-5 md:gap-4">
                        {steps.map((step, i) => {
                            const Icon = step.icon
                            const isActive = activeStep === i
                            return (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{
                                        duration: 0.55,
                                        delay: i * 0.09,
                                        ease: EASE_OUT,
                                    }}
                                    onHoverStart={() => setActiveStep(i)}
                                    onHoverEnd={() => setActiveStep(null)}
                                    className="relative z-10 flex flex-col items-start"
                                >
                                    {/* Frosted disc: blurs the connecting line away behind each step icon */}
                                    <div className="relative z-10 rounded-full bg-white dark:bg-black/45 dark:backdrop-blur-md p-[3px]">
                                        <motion.div
                                            animate={{ scale: isActive ? 1.08 : 1 }}
                                            transition={{
                                                duration: 0.25,
                                                ease: EASE_OUT,
                                            }}
                                            className={`flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 ${
                                                isActive
                                                    ? 'border-primary bg-primary'
                                                    : 'border-primary/40 bg-white dark:bg-gray-900'
                                            }`}
                                        >
                                            <Icon
                                                className={`h-[18px] w-[18px] ${
                                                    isActive
                                                        ? 'text-white'
                                                        : 'text-primary'
                                                }`}
                                            />
                                        </motion.div>
                                    </div>

                                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        Step {i + 1}
                                    </span>
                                    <h3 className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                                        {step.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                        {step.description}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default InteractiveJourney
