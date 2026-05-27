import { motion } from 'framer-motion'
import { TbTargetArrow, TbPlayerPlay, TbReportAnalytics, TbBolt } from 'react-icons/tb'
import { useLandingTheme } from '../LandingThemeProvider'
import { SectionBadge, SectionHeading, SectionDesc } from './landingUi'

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

    return (
        <section className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        <div
                            className="absolute inset-0 pointer-events-none rounded-3xl"
                            style={{
                                background: `radial-gradient(ellipse at center, ${t.accentSubtle} 0%, transparent 70%)`,
                            }}
                        />

                        <div
                            className="relative rounded-2xl overflow-hidden"
                            style={{
                                border: `1px solid ${t.borderStrong}`,
                                backgroundColor: t.bgElevated,
                                boxShadow: t.isLight
                                    ? '0 32px 64px rgba(0,0,0,0.08)'
                                    : '0 32px 64px rgba(0,0,0,0.7)',
                            }}
                        >
                            <div
                                className="flex items-center justify-between px-5 py-3.5"
                                style={{ borderBottom: `1px solid ${t.border}` }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
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
                                                transition={{ duration: 1.1, delay: i * 0.12 + 0.4, ease: [0.16, 1, 0.3, 1] }}
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
                                                transition={{ duration: 0.5, delay: i * 0.06 + 0.6 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <SectionBadge t={t} label="Sales intelligence" />
                        <SectionHeading
                            t={t}
                            text="Know exactly what to fix, not just how you felt"
                            className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight mb-4"
                        />
                        <SectionDesc
                            t={t}
                            text="Generic feedback is useless. RealSales gives managers and reps the specific data they need to improve - one session at a time."
                            className="leading-relaxed mb-10"
                        />

                        <div className="space-y-6">
                            {bullets.map((b, i) => {
                                const Icon = b.icon
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: i * 0.08 + 0.2, ease: [0.16, 1, 0.3, 1] }}
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
