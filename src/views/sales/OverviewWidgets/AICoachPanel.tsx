import { motion } from 'framer-motion'
import { TbBrain, TbArrowRight } from 'react-icons/tb'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import { Reveal, CountUp, EASE_OUT } from './common'
import type { OverviewData } from './useOverviewData'

const AICoachPanel = ({
    data,
    onSelectMode,
}: {
    data: OverviewData
    onSelectMode: (mode: ConversationMode) => void
}) => {
    const mode = data.recommendedPractice?.mode ?? 'objection handling'
    const improvement = data.recommendedPractice?.estimatedImprovement ?? 12
    const modeKey = (data.weakest?.key as ConversationMode) ?? 'closing'

    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal>
                    <div className="relative overflow-hidden rounded-[2rem] bg-gray-950 px-6 py-10 sm:px-10 sm:py-12">
                        <motion.div
                            className="pointer-events-none absolute -left-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <div className="relative grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
                                <TbBrain className="h-7 w-7" />
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                                    AI coach recommendation
                                </p>
                                <p className="mt-2 max-w-xl text-lg sm:text-xl font-semibold leading-snug text-white">
                                    Based on your recent sessions, practice {mode.toLowerCase()}.
                                </p>
                                <p className="mt-1 text-sm text-white/50">
                                    This is the single highest-leverage rep for you this week.
                                </p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-primary tabular-nums">
                                        +<CountUp value={improvement} suffix="%" />
                                    </p>
                                    <p className="text-xs text-white/50">Estimated improvement</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ duration: 0.25, ease: EASE_OUT }}
                                    onClick={() => onSelectMode(modeKey)}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-deep transition-colors"
                                >
                                    Launch session
                                    <TbArrowRight className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

export default AICoachPanel
