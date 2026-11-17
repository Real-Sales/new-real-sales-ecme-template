import type { MouseEvent } from 'react'
import { GlassLayers } from '@/components/ui/liquid-glass'
import { glassCard, glassEdge } from '../landingTheme'
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

// Voice waveform: thin bars whose resting heights follow a speech-like envelope
const WAVE_BARS = Array.from({ length: 44 }, (_, i) => {
    const envelope = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11 + 0.6))
    return {
        height: Math.round(6 + envelope * 26),
        duration: 0.9 + ((i * 7) % 5) * 0.14,
        delay: -((i * 13) % 17) * 0.09,
    }
})

const SCENARIOS = ['Cold call', 'Discovery', 'Objection handling', 'Negotiation']
const SCORE_BARS = [38, 52, 46, 63, 58, 74, 88]

// Shared keyframes for the card infographics (transform/opacity only, so they stay cheap)
const INFOGRAPHIC_CSS = `
@keyframes fg-wave { 0%, 100% { transform: scaleY(0.28); } 50% { transform: scaleY(1); } }
@keyframes fg-pulse { 0%, 100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.9); opacity: 0; } }
@keyframes fg-pick { 0%, 20% { opacity: 1; } 25%, 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .fg-wave, .fg-pulse, .fg-pick { animation: none !important; }
  .fg-pick:first-child { opacity: 1; }
}
`

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
                className="group relative rounded-2xl overflow-hidden transition-all duration-300 h-full"
                style={{
                    ...glassCard(t),
                    boxShadow: t.isLight
                        ? glassEdge(t, '')
                        : '0 14px 28px rgba(0,0,0,0.28)',
                }}
            >
                <GlassLayers light={t.isLight} />
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
            <style>{INFOGRAPHIC_CSS}</style>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
                style={{
                    background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${t.accent}14 0%, transparent 70%)`,
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

                <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-fr gap-4 grid-flow-dense">
                    <BentoCard className="md:col-span-2 md:min-h-[280px]" delay={0} distance={45}>
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
                                                backgroundColor: line.align === 'right' ? `${t.accent}1f` : t.surface,
                                                border: `1px solid ${line.align === 'right' ? `${t.accent}40` : t.border}`,
                                            }}
                                        >
                                            {line.msg}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-2 md:min-h-[280px]" delay={0.08} distance={80}>
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
                                className="mt-6 flex items-center gap-3 px-3.5 py-3 rounded-xl"
                                style={{
                                    border: `1px solid ${t.border}`,
                                    backgroundColor: t.surface,
                                }}
                            >
                                {/* Recording dot with a soft pulse ring */}
                                <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                                    <span
                                        className="fg-pulse absolute inset-1 rounded-full"
                                        style={{ backgroundColor: t.accent, animation: 'fg-pulse 1.8s ease-out infinite' }}
                                    />
                                    <span className="relative w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accent }} />
                                </div>

                                {/* Waveform: thin centred bars, fading out at both ends */}
                                <div
                                    className="flex items-center justify-between flex-1 h-9"
                                    style={{
                                        maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
                                        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
                                    }}
                                >
                                    {WAVE_BARS.map((bar, i) => (
                                        <span
                                            key={i}
                                            className="fg-wave rounded-full"
                                            style={{
                                                width: 3,
                                                height: bar.height,
                                                background: `linear-gradient(180deg, ${t.accentMild}, ${t.accent})`,
                                                opacity: 0.55 + (bar.height / 32) * 0.45,
                                                transformOrigin: 'center',
                                                animation: shouldReduceMotion
                                                    ? undefined
                                                    : `fg-wave ${bar.duration}s ease-in-out ${bar.delay}s infinite`,
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="shrink-0 text-right leading-none">
                                    <span className="block text-[10px] font-mono font-semibold" style={{ color: t.accent }}>
                                        LIVE
                                    </span>
                                    <span className="block text-[9px] font-mono mt-1 tabular-nums" style={{ color: t.textDim }}>
                                        02:14
                                    </span>
                                </div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-1 md:min-h-[220px]" delay={0.16} distance={55}>
                        <div className="p-6 h-full flex flex-col">
                            <IconBox icon={TbLayersLinked} t={t} className="mb-4" />
                            <h3 className="text-base font-semibold mb-2 tracking-tight leading-snug" style={{ color: t.text }}>
                                Scenario library
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: t.textFaint }}>
                                Cold calls, discovery, objection handling, negotiations - pick the exact moment you need to master.
                            </p>

                            {/* Scenario picker: the highlight steps through the list */}
                            <div className="mt-auto pt-5 space-y-1.5">
                                {SCENARIOS.map((name, i) => (
                                    <div
                                        key={name}
                                        className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px]"
                                        style={{ border: `1px solid ${t.border}`, color: t.textMuted }}
                                    >
                                        <span
                                            className="fg-pick absolute inset-0 rounded-lg"
                                            style={{
                                                opacity: 0,
                                                backgroundColor: `${t.accent}1f`,
                                                boxShadow: `inset 0 0 0 1px ${t.accent}66`,
                                                animation: `fg-pick ${SCENARIOS.length * 1.6}s linear ${i * 1.6}s infinite`,
                                            }}
                                        />
                                        <span className="relative w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.accent }} />
                                        <span className="relative truncate">{name}</span>
                                        <span className="relative ml-auto text-[9px] font-mono" style={{ color: t.textDim }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-1 md:min-h-[220px]" delay={0.2} distance={95}>
                        <div className="p-6 h-full flex flex-col">
                            <IconBox icon={TbChartBar} t={t} className="mb-4" />
                            <h3 className="text-base font-semibold mb-2 tracking-tight leading-snug" style={{ color: t.text }}>
                                Performance analytics
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: t.textFaint }}>
                                Every session turns into scored, actionable coaching data. Know what to fix before the next real call.
                            </p>

                            {/* Session scores climbing over the last seven sessions */}
                            <div className="mt-auto pt-5">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <p className="text-xl font-bold tracking-tight leading-none tabular-nums" style={{ color: t.text }}>
                                            88
                                        </p>
                                        <p className="text-[9px] mt-1" style={{ color: t.textDim }}>
                                            Latest score
                                        </p>
                                    </div>
                                    <span
                                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                        style={{ color: t.accent, backgroundColor: `${t.accent}1f` }}
                                    >
                                        +23%
                                    </span>
                                </div>
                                <div className="flex items-end gap-1.5 h-14">
                                    {SCORE_BARS.map((score, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex-1 rounded-t-sm"
                                            style={{
                                                height: `${score}%`,
                                                transformOrigin: 'bottom',
                                                background:
                                                    i === SCORE_BARS.length - 1
                                                        ? `linear-gradient(180deg, ${t.accentMild}, ${t.accent})`
                                                        : `${t.accent}${i > 3 ? '73' : '40'}`,
                                            }}
                                            initial={{ scaleY: shouldReduceMotion ? 1 : 0 }}
                                            whileInView={{ scaleY: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: shouldReduceMotion ? 0.01 : 0.7,
                                                delay: shouldReduceMotion ? 0 : 0.25 + i * 0.07,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-2 md:min-h-[220px]" delay={0.24} distance={60}>
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
