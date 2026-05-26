import { motion } from 'framer-motion'
import {
    TbBrain,
    TbMicrophone,
    TbLayersLinked,
    TbChartBar,
    TbUsers,
} from 'react-icons/tb'
import type { Mode } from '@/@types/theme'

// Bento layout: 4-col grid, 2 rows, 5 cells
// Row 1: Cell A (col-span-2) + Cell B (col-span-2)  => 2+2=4 cols
// Row 2: Cell C (col-span-1) + Cell D (col-span-1) + Cell E (col-span-2) => 1+1+2=4 cols
// Total column-units: 8 in a 4x2 grid. Zero empty cells.

const waveHeights = [12, 22, 32, 22, 16, 28, 36, 26, 16, 22, 30, 18, 32, 22, 12]

const BentoCard = ({
    children,
    className = '',
    delay = 0,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        className={[
            'relative rounded-2xl border border-white/[0.08] bg-white/[0.02]',
            'hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden',
            className,
        ].join(' ')}
    >
        {children}
    </motion.div>
)

const FeatureGrid = ({ mode }: { mode: Mode }) => {
    return (
        <section id="features" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span className="text-xs font-medium text-[#9CA3AF] tracking-wide">Platform capabilities</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F5] tracking-[-0.015em] leading-tight max-w-[500px]">
                        Everything your team needs to train at scale
                    </h2>
                </div>

                {/* Bento grid - 4 cols, mathematically verified */}
                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-fr gap-4 grid-flow-dense">
                    {/* Cell A: col-span-2 - Real AI Buyer */}
                    <BentoCard className="md:col-span-2 min-h-[280px]" delay={0}>
                        <div className="p-7 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] mb-5">
                                    <TbBrain size={22} className="text-[#F5F5F5]" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2 tracking-tight">
                                    Hyper-realistic AI buyers
                                </h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed max-w-[300px]">
                                    Trained on thousands of real sales objections, each AI buyer has a unique personality, industry context, and resistance threshold.
                                </p>
                            </div>

                            {/* Conversation preview */}
                            <div className="mt-6 space-y-2">
                                {[
                                    { role: 'AI', msg: '"Your pricing seems steep for what you offer."', align: 'left' },
                                    { role: 'You', msg: 'Let me show you exactly what that breaks down to...', align: 'right' },
                                ].map((line, i) => (
                                    <div key={i} className={`flex gap-2 ${line.align === 'right' ? 'flex-row-reverse' : ''}`}>
                                        <div className="text-[9px] font-bold text-[#4B5563] mt-1 shrink-0 w-5 text-center">
                                            {line.role}
                                        </div>
                                        <div className={`px-3 py-2 rounded-xl text-xs text-[#D1D5DB] ${line.align === 'right' ? 'bg-white/[0.06] border border-white/[0.08]' : 'bg-[#1A1A1A]'}`}>
                                            {line.msg}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    {/* Cell B: col-span-2 - Voice-first */}
                    <BentoCard className="md:col-span-2 min-h-[280px]" delay={0.08}>
                        <div className="p-7 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] mb-5">
                                    <TbMicrophone size={22} className="text-[#F5F5F5]" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2 tracking-tight">
                                    Voice-first training
                                </h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed max-w-[300px]">
                                    Real conversations happen over the phone. Practice out loud, improve your delivery, and get scored on tone, pacing, and clarity.
                                </p>
                            </div>

                            {/* Waveform visual */}
                            <div className="mt-6 flex items-center gap-2 px-3 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-white/60" />
                                </div>
                                <div className="flex items-end gap-[3px] flex-1 h-8">
                                    {waveHeights.map((h, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex-1 rounded-full bg-white/25"
                                            animate={{ height: [h * 0.5, h, h * 0.6, h] }}
                                            transition={{ duration: 1.3 + i * 0.04, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
                                            style={{ minWidth: 2 }}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-mono text-[#6B7280] shrink-0">LIVE</span>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Cell C: col-span-1 - Scenario Library */}
                    <BentoCard className="md:col-span-1 min-h-[220px]" delay={0.16}>
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] mb-4">
                                <TbLayersLinked size={22} className="text-[#F5F5F5]" />
                            </div>
                            <h3 className="text-base font-semibold text-[#F5F5F5] mb-2 tracking-tight leading-snug">
                                Scenario library
                            </h3>
                            <p className="text-xs text-[#6B7280] leading-relaxed">
                                Cold calls, discovery, objection handling, negotiations - pick the exact moment you need to master.
                            </p>
                        </div>
                    </BentoCard>

                    {/* Cell D: col-span-1 - Performance Intel */}
                    <BentoCard className="md:col-span-1 min-h-[220px]" delay={0.2}>
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] mb-4">
                                <TbChartBar size={22} className="text-[#F5F5F5]" />
                            </div>
                            <h3 className="text-base font-semibold text-[#F5F5F5] mb-2 tracking-tight leading-snug">
                                Performance analytics
                            </h3>
                            <p className="text-xs text-[#6B7280] leading-relaxed">
                                Every session turns into scored, actionable coaching data. Know what to fix before the next real call.
                            </p>
                        </div>
                    </BentoCard>

                    {/* Cell E: col-span-2 - Team Analytics */}
                    <BentoCard className="md:col-span-2 min-h-[220px]" delay={0.24}>
                        <div className="p-6 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] mb-4">
                                    <TbUsers size={22} className="text-[#F5F5F5]" />
                                </div>
                                <h3 className="text-base font-semibold text-[#F5F5F5] mb-2 tracking-tight">
                                    Team-wide visibility
                                </h3>
                                <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs">
                                    Managers see who is improving, who needs attention, and exactly where performance gaps live, in real time.
                                </p>
                            </div>

                            {/* Progress bars visual */}
                            <div className="mt-5 space-y-2.5">
                                {[
                                    { name: 'Objection handling', pct: 82 },
                                    { name: 'Discovery quality', pct: 67 },
                                    { name: 'Closing confidence', pct: 74 },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] text-[#6B7280] mb-1">
                                            <span>{item.name}</span>
                                            <span className="text-[#9CA3AF] font-medium">{item.pct}%</span>
                                        </div>
                                        <div className="h-1 rounded-full bg-white/[0.06]">
                                            <motion.div
                                                className="h-1 rounded-full bg-white/30"
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
