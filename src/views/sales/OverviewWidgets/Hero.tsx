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
import { GlassLayers } from '@/components/ui/liquid-glass'
import Particles from '@/views/Landing/components/Particles'
import { useAppSelector } from '@/store'
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

const PARTICLE_COLORS = ['#0CAF60', '#34C779', '#099250']

const Hero = ({ data }: { data: OverviewData }) => {
    const greeting = useMemo(() => greetingFor(new Date().getHours()), [])
    const reduceMotion = useReducedMotion()
    const isLight = useAppSelector((state) => state.theme.mode) !== 'dark'
    const improvementLabel =
        data.improvementPct === 0
            ? 'steady'
            : `${data.improvementPct > 0 ? '+' : ''}${data.improvementPct}%`

    return (
        <section
            className="relative isolate overflow-hidden rounded-[2rem] mx-4 mt-4 border border-slate-900/[0.07] dark:border-white/[0.08] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow] duration-500 hover:border-primary/30 dark:hover:shadow-[0_0_60px_rgba(12,175,96,0.1),0_30px_70px_rgba(0,0,0,0.55)]"
        >
            {/* Same glass card as the landing page's closing card. Dark: near-clear tint (the default read as
                milky on a card this large). Light: the landing's white glass tint. */}
            <GlassLayers light={isLight} tint={isLight ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.006)'} />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 right-0 z-10 h-px opacity-50"
                style={{
                    background:
                        'linear-gradient(90deg, transparent, rgba(12,175,96,0.7) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.7) 70%, transparent)',
                }}
            />
            {/* Ambient gradient field - single green accent, GPU-safe transform/opacity only */}
            <div className="absolute inset-0" aria-hidden="true">
                <motion.div
                    className="absolute -left-24 -top-32 h-[26rem] w-[26rem] rounded-full bg-primary/15 blur-3xl"
                    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.08, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute right-[-10rem] top-1/3 h-[22rem] w-[22rem] rounded-full bg-primary-mild/10 blur-3xl"
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1.05, 1, 1.05] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                {/* Dot grid, fading out from the centre */}
                <div
                    className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,_white_20%,_transparent_70%)]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='40' height='40' fill='none'%3e%3ccircle cx='20' cy='20' r='1' fill='rgba(128%2C128%2C128%2C0.12)'/%3e%3c/svg%3e")`,
                    }}
                />
                {/* Glowing particles, as on the landing card */}
                {!reduceMotion && (
                    <div className="absolute inset-0">
                        <Particles
                            alphaParticles
                            disableRotation
                            particleColors={PARTICLE_COLORS}
                            particleCount={isLight ? 50 : 70}
                            particleSpread={11}
                            speed={0.3}
                            particleBaseSize={isLight ? 90 : 160}
                            sizeRandomness={isLight ? 0.7 : 1.2}
                            moveParticlesOnHover={false}
                            lightMode={isLight}
                            pixelRatio={1}
                        />
                    </div>
                )}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay [background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2764%27 height=%2764%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%2764%27 height=%2764%27 filter=%27url(%23n)%27/%3E%3C/svg%3E&quot;)]" />
            </div>

            <div className="relative px-6 py-14 sm:px-10 md:py-20">
                <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <div className="mb-5 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] dark:bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-700 dark:text-white/80 ring-1 ring-black/[0.06] dark:ring-white/10">
                                <TbBolt className="h-3.5 w-3.5 text-primary" />
                                AI Sales Workspace
                            </span>
                            <LivePulse label="Session engine live" />
                        </div>

                        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                            {greeting},{' '}
                            {/* Name and full stop stay together, so the stop never wraps onto its own line */}
                            <span className="inline-flex items-baseline whitespace-nowrap">
                                <GradientText colors={['#34C779', '#38D6E8', '#0CAF60', '#A7F3D0', '#34C779']} animationSpeed={6}>
                                    {data.firstName}
                                </GradientText>
                                .
                            </span>
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-600 dark:text-white/60">
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
