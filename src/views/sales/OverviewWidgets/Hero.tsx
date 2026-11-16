import { useMemo } from 'react'
import GradientText from '@/components/reactbits/GradientText'
import { motion, useReducedMotion } from 'framer-motion'
import {
    TbBolt,
    TbFlame,
    TbTrendingUp,
    TbCoins,
    TbChecklist,
} from 'react-icons/tb'
import { CountUp, GlassPanel, LivePulse, EASE_OUT } from './common'
import type { OverviewData } from './useOverviewData'

const greetingFor = (hour: number) => {
    if (hour < 5) return 'Working late'
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    if (hour < 21) return 'Good evening'
    return 'Good evening'
}

const FloatCard = ({
    icon,
    label,
    children,
    delay = 0,
    floatOffset = 0,
}: {
    icon: React.ReactNode
    label: string
    children: React.ReactNode
    delay?: number
    floatOffset?: number
}) => {
    const reduce = useReducedMotion()
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{
                opacity: 1,
                y: reduce ? 0 : [0, -floatOffset, 0],
            }}
            transition={{
                opacity: { duration: 0.7, delay, ease: EASE_OUT },
                y: reduce
                    ? { duration: 0 }
                    : {
                          duration: 5 + delay,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay,
                      },
            }}
        >
            <GlassPanel padding="p-1" className="shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                            {children}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">
                            {label}
                        </p>
                    </div>
                </div>
            </GlassPanel>
        </motion.div>
    )
}

const Hero = ({ data }: { data: OverviewData }) => {
    const greeting = useMemo(() => greetingFor(new Date().getHours()), [])
    const improvementLabel =
        data.improvementPct === 0
            ? 'steady'
            : `${data.improvementPct > 0 ? '+' : ''}${data.improvementPct}%`

    return (
        <section className="relative overflow-hidden rounded-[2rem] mx-4 mt-4">
            {/* Ambient gradient field - single green accent, GPU-safe transform/opacity only */}
            <div className="absolute inset-0 bg-gray-950" aria-hidden="true">
                <motion.div
                    className="absolute -left-24 -top-32 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-3xl"
                    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.08, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute right-[-10rem] top-1/3 h-[22rem] w-[22rem] rounded-full bg-primary-mild/20 blur-3xl"
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1.05, 1, 1.05] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),_transparent_60%)]" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay [background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2764%27 height=%2764%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%2764%27 height=%2764%27 filter=%27url(%23n)%27/%3E%3C/svg%3E&quot;)]" />
            </div>

            <div className="relative px-6 py-14 sm:px-10 md:py-20">
                <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <div className="mb-5 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 ring-1 ring-white/10">
                                <TbBolt className="h-3.5 w-3.5 text-primary" />
                                AI Sales Workspace
                            </span>
                            <LivePulse label="Session engine live" />
                        </div>

                        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
                            {greeting},{' '}
                            <GradientText colors={['#34C779', '#38D6E8', '#0CAF60', '#A7F3D0', '#34C779']} animationSpeed={6}>
                                {data.firstName}
                            </GradientText>
                            .
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
                            You are {improvementLabel} on last month and{' '}
                            {data.streakDays > 0
                                ? `on a ${data.streakDays}-day training streak`
                                : 'ready to start a new streak today'}
                            . Here is where the AI coach thinks you should focus next.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <FloatCard
                            icon={<TbCoins className="h-4 w-4" />}
                            label="Credits remaining"
                            delay={0}
                            floatOffset={6}
                        >
                            {data.credits ? (
                                <CountUp value={data.credits.remaining} />
                            ) : (
                                '—'
                            )}
                        </FloatCard>
                        <FloatCard
                            icon={<TbChecklist className="h-4 w-4" />}
                            label="Sessions completed"
                            delay={0.15}
                            floatOffset={8}
                        >
                            <CountUp value={data.sessionsCompleted} />
                        </FloatCard>
                        <FloatCard
                            icon={<TbTrendingUp className="h-4 w-4" />}
                            label="Improvement vs last month"
                            delay={0.3}
                            floatOffset={7}
                        >
                            {improvementLabel}
                        </FloatCard>
                        <FloatCard
                            icon={<TbFlame className="h-4 w-4" />}
                            label="Weekly streak"
                            delay={0.45}
                            floatOffset={9}
                        >
                            <CountUp value={data.streakDays} suffix=" d" />
                        </FloatCard>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
