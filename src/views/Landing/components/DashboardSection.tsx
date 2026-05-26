import { motion } from 'framer-motion'
import { TbTargetArrow, TbPlayerPlay, TbReportAnalytics, TbBolt } from 'react-icons/tb'

const metrics = [
    { label: 'Confidence Score', value: '87%', bar: 87, trend: '+12%' },
    { label: 'Objection Quality', value: '72%', bar: 72, trend: '+8%' },
    { label: 'Talk/Listen Ratio', value: '58/42', bar: 58, trend: 'Ideal' },
    { label: 'Close Attempt Rate', value: '91%', bar: 91, trend: '+19%' },
]

const bullets = [
    {
        icon: <TbTargetArrow size={16} className="text-[#F5F5F5]" />,
        title: 'Pinpoint exact failure moments',
        description: 'Session replays highlight where momentum died, with timestamp-level coaching notes.',
    },
    {
        icon: <TbPlayerPlay size={16} className="text-[#F5F5F5]" />,
        title: 'Compare across your whole team',
        description: 'See who is improving week over week and who needs focused attention before the next pipeline review.',
    },
    {
        icon: <TbReportAnalytics size={16} className="text-[#F5F5F5]" />,
        title: 'Track ramp progress automatically',
        description: 'New reps get a structured training path. Managers get a dashboard that replaces 1:1 guesswork.',
    },
    {
        icon: <TbBolt size={16} className="text-[#F5F5F5]" />,
        title: 'Export reports to your CRM',
        description: 'Push coaching insights directly to Salesforce, HubSpot, or Outreach so nothing lives in a silo.',
    },
]

const DashboardSection = () => {
    return (
        <section className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
                    {/* Left - analytics card mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        {/* Ambient glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)] pointer-events-none rounded-3xl" />

                        {/* Dashboard card */}
                        <div className="relative rounded-2xl border border-white/[0.1] bg-[#0D0D0D] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.7)]">
                            {/* Card header */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                                    </div>
                                    <span className="text-xs text-[#6B7280] ml-1">Session Analytics</span>
                                </div>
                                <span className="text-[10px] text-[#4B5563] font-mono">Last 30 days</span>
                            </div>

                            {/* Top summary row */}
                            <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
                                {[
                                    { label: 'Sessions', value: '48' },
                                    { label: 'Avg Score', value: '81%' },
                                    { label: 'Improvement', value: '+23%' },
                                ].map((item, i) => (
                                    <div key={i} className="px-4 py-3 text-center">
                                        <p className="text-lg font-semibold text-[#F5F5F5] tracking-tight tabular-nums">{item.value}</p>
                                        <p className="text-[10px] text-[#6B7280] mt-0.5">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Metrics */}
                            <div className="px-5 py-5 space-y-4">
                                <p className="text-[10px] font-medium text-[#4B5563] uppercase tracking-widest mb-4">
                                    Performance breakdown
                                </p>
                                {metrics.map((m, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs text-[#9CA3AF]">{m.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[#4B5563]">{m.trend}</span>
                                                <span className="text-xs font-semibold text-[#F5F5F5] tabular-nums">{m.value}</span>
                                            </div>
                                        </div>
                                        <div className="h-1 rounded-full bg-white/[0.06]">
                                            <motion.div
                                                className="h-1 rounded-full bg-gradient-to-r from-white/50 to-white/30"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${m.bar}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1.1, delay: i * 0.12 + 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom chart sketch */}
                            <div className="px-5 pb-5">
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                    <p className="text-[10px] text-[#4B5563] mb-3">Weekly session trend</p>
                                    <div className="flex items-end gap-1.5 h-14">
                                        {[28, 44, 36, 52, 40, 60, 48, 64].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex-1 rounded-t-sm bg-white/10 hover:bg-white/20 transition-colors cursor-default"
                                                style={{ height: `${(h / 64) * 100}%` }}
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

                    {/* Right - feature bullets */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span className="text-xs font-medium text-[#9CA3AF] tracking-wide">Sales intelligence</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F5] tracking-[-0.015em] leading-tight mb-4">
                            Know exactly what to fix, not just how you felt
                        </h2>
                        <p className="text-[#6B7280] leading-relaxed mb-10">
                            Generic feedback is useless. RealSales gives managers and reps the specific data they need to improve - one session at a time.
                        </p>

                        <div className="space-y-6">
                            {bullets.map((b, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.08 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] shrink-0 mt-0.5">
                                        {b.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#F5F5F5] mb-1">{b.title}</h3>
                                        <p className="text-sm text-[#6B7280] leading-relaxed">{b.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default DashboardSection
