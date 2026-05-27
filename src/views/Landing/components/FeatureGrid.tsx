import { motion } from 'framer-motion'
import {
    TbBrain,
    TbMicrophone,
    TbLayersLinked,
    TbChartBar,
    TbUsers,
} from 'react-icons/tb'
import { useLandingTheme } from '../LandingThemeProvider'
import { SectionBadge, SectionHeading } from './landingUi'

const waveHeights = [12, 22, 32, 22, 16, 28, 36, 26, 16, 22, 30, 18, 32, 22, 12]

const BentoCard = ({
    children,
    className = '',
    delay = 0,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
}) => {
    const t = useLandingTheme()

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={['relative rounded-2xl overflow-hidden transition-all duration-300', className].join(
                ' ',
            )}
            style={{
                border: `1px solid ${t.border}`,
                backgroundColor: t.surface,
            }}
        >
            {children}
        </motion.div>
    )
}

const FeatureGrid = () => {
    const t = useLandingTheme()

    return (
        <section id="features" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-16">
                    <SectionBadge t={t} label="Platform capabilities" />
                    <SectionHeading
                        t={t}
                        text="Everything your team needs to train at scale"
                        className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight max-w-[500px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-fr gap-4 grid-flow-dense">
                    <BentoCard className="md:col-span-2 min-h-[280px]" delay={0}>
                        <div className="p-7 h-full flex flex-col justify-between">
                            <div>
                                <div
                                    className="flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                                    style={{
                                        backgroundColor: t.accentSubtle,
                                        border: `1px solid ${t.border}`,
                                    }}
                                >
                                    <TbBrain size={22} style={{ color: t.accent }} />
                                </div>
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

                    <BentoCard className="md:col-span-2 min-h-[280px]" delay={0.08}>
                        <div className="p-7 h-full flex flex-col justify-between">
                            <div>
                                <div
                                    className="flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                                    style={{
                                        backgroundColor: t.accentSubtle,
                                        border: `1px solid ${t.border}`,
                                    }}
                                >
                                    <TbMicrophone size={22} style={{ color: t.accent }} />
                                </div>
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
                                            animate={{ height: [h * 0.5, h, h * 0.6, h], opacity: [0.35, 0.85, 0.45, 0.85] }}
                                            transition={{ duration: 1.3 + i * 0.04, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-mono shrink-0" style={{ color: t.accent }}>
                                    LIVE
                                </span>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-1 min-h-[220px]" delay={0.16}>
                        <div className="p-6 h-full flex flex-col">
                            <div
                                className="flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                                style={{ backgroundColor: t.accentSubtle, border: `1px solid ${t.border}` }}
                            >
                                <TbLayersLinked size={22} style={{ color: t.accent }} />
                            </div>
                            <h3 className="text-base font-semibold mb-2 tracking-tight leading-snug" style={{ color: t.text }}>
                                Scenario library
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: t.textFaint }}>
                                Cold calls, discovery, objection handling, negotiations - pick the exact moment you need to master.
                            </p>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-1 min-h-[220px]" delay={0.2}>
                        <div className="p-6 h-full flex flex-col">
                            <div
                                className="flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                                style={{ backgroundColor: t.accentSubtle, border: `1px solid ${t.border}` }}
                            >
                                <TbChartBar size={22} style={{ color: t.accent }} />
                            </div>
                            <h3 className="text-base font-semibold mb-2 tracking-tight leading-snug" style={{ color: t.text }}>
                                Performance analytics
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: t.textFaint }}>
                                Every session turns into scored, actionable coaching data. Know what to fix before the next real call.
                            </p>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-2 min-h-[220px]" delay={0.24}>
                        <div className="p-6 h-full flex flex-col justify-between">
                            <div>
                                <div
                                    className="flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                                    style={{ backgroundColor: t.accentSubtle, border: `1px solid ${t.border}` }}
                                >
                                    <TbUsers size={22} style={{ color: t.accent }} />
                                </div>
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
                                                transition={{ duration: 1, delay: i * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
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
