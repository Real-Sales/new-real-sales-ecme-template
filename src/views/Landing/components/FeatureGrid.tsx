import type { MouseEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { IconType } from 'react-icons'
import {
    TbBrain,
    TbMicrophone,
    TbLayersLinked,
    TbChartBar,
    TbUsers,
} from 'react-icons/tb'
import { useLandingTheme } from '../LandingThemeProvider'
import type { LandingTheme } from '../landingTheme'
import { SectionBadge, SectionHeading, SectionDesc, ParallaxReveal } from './landingUi'

const waveHeights = [12, 22, 32, 22, 16, 28, 36, 26, 16, 22, 30, 18, 32, 22, 12]

const BentoCard = ({
    children,
    className = '',
    delay = 0,
    distance = 60,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
    distance?: number
}) => {
    const t = useLandingTheme()

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const el = e.currentTarget
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
        el.style.setProperty('--my', `${e.clientY - rect.top}px`)
    }

    return (
        <ParallaxReveal className={className} delay={delay} distance={distance}>
            <div
                onMouseMove={handleMouseMove}
                className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 h-full"
                style={{
                    border: `1px solid ${t.border}`,
                    backgroundColor: t.bgElevated,
                    boxShadow: t.isLight
                        ? '0 10px 24px rgba(15,23,42,0.05)'
                        : '0 14px 28px rgba(0,0,0,0.28)',
                }}
            >
                {/* Cursor-follow spotlight */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), ${t.accent}24, transparent 65%)`,
                    }}
                />
                {/* Accent ring on hover */}
                <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ boxShadow: `inset 0 0 0 1px ${t.accent}66` }}
                />
                {/* Top highlight line */}
                <div
                    className="pointer-events-none absolute inset-x-6 top-0 h-px"
                    style={{
                        background: `linear-gradient(to right, transparent, ${t.borderStrong}, transparent)`,
                    }}
                />
                <div className="relative h-full">{children}</div>
            </div>
        </ParallaxReveal>
    )
}

const IconBox = ({
    icon: Icon,
    t,
    className = 'mb-5',
}: {
    icon: IconType
    t: LandingTheme
    className?: string
}) => (
    <div
        className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 group-hover:scale-110 ${className}`}
        style={{
            background: `linear-gradient(135deg, ${t.accentSubtle} 0%, ${t.surface} 100%)`,
            border: `1px solid ${t.border}`,
            boxShadow: `inset 0 1px 0 ${t.isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.05)'}`,
        }}
    >
        <span
            className="absolute -inset-1 rounded-2xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: `radial-gradient(circle at center, ${t.accent}40, transparent 70%)` }}
        />
        <Icon size={22} style={{ color: t.accent }} className="relative" />
    </div>
)

const FeatureGrid = () => {
    const t = useLandingTheme()
    const shouldReduceMotion = useReducedMotion()

    return (
        <section id="features" className="py-24 md:py-32 relative overflow-hidden">
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
                style={{
                    background: `radial-gradient(ellipse 50% 100% at 50% 0%, ${t.accent}14 0%, transparent 70%)`,
                }}
            />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="mb-14 md:mb-16 max-w-2xl">
                    <SectionBadge t={t} label="Platform capabilities" />
                    <SectionHeading
                        t={t}
                        text="Everything your team needs to train at scale"
                        className="text-3xl md:text-4xl font-bold tracking-[-0.02em] leading-tight mb-4"
                    />
                    <SectionDesc
                        t={t}
                        text="From hyper-realistic AI buyers to team-wide analytics — one platform to ramp reps faster and close more deals."
                        className="text-base leading-relaxed max-w-xl"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-fr gap-4 grid-flow-dense">
                    <BentoCard className="md:col-span-2 min-h-[280px]" delay={0} distance={45}>
                        <div className="p-7 h-full flex flex-col justify-between">
                            <div>
                                <IconBox icon={TbBrain} t={t} />
                                <h3 className="text-lg font-semibold mb-2 tracking-tight" style={{ color: t.text }}>
                                    Hyper-realistic AI buyers
                                </h3>
                                <p className="text-sm leading-relaxed max-w-[300px]" style={{ color: t.textFaint }}>
                                    Trained on thousands of real sales objections, each AI buyer has a unique personality, industry context, and resistance threshold.
                                </p>
                            </div>

                            <div className="mt-6 space-y-2">
                                {[
                                    { role: 'AI', msg: '"Your pricing seems steep for what you offer."', align: 'left' },
                                    { role: 'You', msg: 'Let me show you exactly what that breaks down to...', align: 'right' },
                                ].map((line, i) => (
                                    <div key={i} className={`flex gap-2 ${line.align === 'right' ? 'flex-row-reverse' : ''}`}>
                                        <div className="text-[9px] font-bold mt-1 shrink-0 w-5 text-center" style={{ color: t.textDim }}>
                                            {line.role}
                                        </div>
                                        <div
                                            className="px-3 py-2 rounded-xl text-xs"
                                            style={{
                                                color: t.textSecondary,
                                                backgroundColor: line.align === 'right' ? t.surfaceStrong : t.bgCard,
                                                border: line.align === 'right' ? `1px solid ${t.border}` : undefined,
                                            }}
                                        >
                                            {line.msg}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-2 min-h-[280px]" delay={0.08} distance={80}>
                        <div className="p-7 h-full flex flex-col justify-between">
                            <div>
                                <IconBox icon={TbMicrophone} t={t} />
                                <h3 className="text-lg font-semibold mb-2 tracking-tight" style={{ color: t.text }}>
                                    Voice-first training
                                </h3>
                                <p className="text-sm leading-relaxed max-w-[300px]" style={{ color: t.textFaint }}>
                                    Real conversations happen over the phone. Practice out loud, improve your delivery, and get scored on tone, pacing, and clarity.
                                </p>
                            </div>

                            <div
                                className="mt-6 flex items-center gap-2 px-3 py-3 rounded-xl"
                                style={{
                                    border: `1px solid ${t.border}`,
                                    backgroundColor: t.surface,
                                }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: t.accentSubtle }}
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }} />
                                </div>
                                <div className="flex items-end gap-[3px] flex-1 h-8">
                                    {waveHeights.map((h, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex-1 rounded-full"
                                            style={{ minWidth: 2, backgroundColor: t.accent }}
                                            animate={
                                                shouldReduceMotion
                                                    ? { height: h, opacity: 0.65 }
                                                    : {
                                                          height: [h * 0.5, h, h * 0.6, h],
                                                          opacity: [0.35, 0.85, 0.45, 0.85],
                                                      }
                                            }
                                            transition={
                                                shouldReduceMotion
                                                    ? { duration: 0.01 }
                                                    : {
                                                          duration: 1.3 + i * 0.04,
                                                          repeat: Infinity,
                                                          ease: 'easeInOut',
                                                          delay: i * 0.06,
                                                      }
                                            }
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-mono shrink-0" style={{ color: t.accent }}>
                                    LIVE
                                </span>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-1 min-h-[220px]" delay={0.16} distance={55}>
                        <div className="p-6 h-full flex flex-col">
                            <IconBox icon={TbLayersLinked} t={t} className="mb-4" />
                            <h3 className="text-base font-semibold mb-2 tracking-tight leading-snug" style={{ color: t.text }}>
                                Scenario library
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: t.textFaint }}>
                                Cold calls, discovery, objection handling, negotiations - pick the exact moment you need to master.
                            </p>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-1 min-h-[220px]" delay={0.2} distance={95}>
                        <div className="p-6 h-full flex flex-col">
                            <IconBox icon={TbChartBar} t={t} className="mb-4" />
                            <h3 className="text-base font-semibold mb-2 tracking-tight leading-snug" style={{ color: t.text }}>
                                Performance analytics
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: t.textFaint }}>
                                Every session turns into scored, actionable coaching data. Know what to fix before the next real call.
                            </p>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-2 min-h-[220px]" delay={0.24} distance={60}>
                        <div className="p-6 h-full flex flex-col justify-between">
                            <div>
                                <IconBox icon={TbUsers} t={t} className="mb-4" />
                                <h3 className="text-base font-semibold mb-2 tracking-tight" style={{ color: t.text }}>
                                    Team-wide visibility
                                </h3>
                                <p className="text-xs leading-relaxed max-w-xs" style={{ color: t.textFaint }}>
                                    Managers see who is improving, who needs attention, and exactly where performance gaps live, in real time.
                                </p>
                            </div>

                            <div className="mt-5 space-y-2.5">
                                {[
                                    { name: 'Objection handling', pct: 82 },
                                    { name: 'Discovery quality', pct: 67 },
                                    { name: 'Closing confidence', pct: 74 },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] mb-1" style={{ color: t.textFaint }}>
                                            <span>{item.name}</span>
                                            <span className="font-medium" style={{ color: t.accent }}>
                                                {item.pct}%
                                            </span>
                                        </div>
                                        <div className="h-1 rounded-full" style={{ backgroundColor: t.surfaceStrong }}>
                                            <motion.div
                                                className="h-1 rounded-full"
                                                style={{ backgroundColor: t.accent }}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.pct}%` }}
                                                viewport={{ once: true }}
                                                transition={{
                                                    duration: shouldReduceMotion ? 0.01 : 1,
                                                    delay: shouldReduceMotion ? 0 : i * 0.15 + 0.3,
                                                    ease: [0.16, 1, 0.3, 1],
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>
                </div>
            </div>
        </section>
    )
}

export default FeatureGrid
