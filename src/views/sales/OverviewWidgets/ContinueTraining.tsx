import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TbTrendingUp, TbTrendingDown, TbArrowRight, TbUserCircle } from 'react-icons/tb'
import { Reveal, StaggerGroup, StaggerItem, SectionHeading, formatRelativeDate, EASE_OUT } from './common'
import type { OverviewData } from './useOverviewData'

const ContinueTraining = ({ data }: { data: OverviewData }) => {
    const navigate = useNavigate()

    if (data.recentSessions.length === 0) {
        return (
            <section className="px-4 py-16 md:py-20">
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Continue training"
                            heading="No sessions yet"
                            description="Once you complete a training session, it will show up here so you can jump back into your history."
                        />
                    </Reveal>
                </div>
            </section>
        )
    }

    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-10">
                    <SectionHeading
                        eyebrow="Continue training"
                        heading="Pick up where you left off"
                        description="Your most recent sessions, with the score change since the one before it."
                    />
                </Reveal>

                <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
                    {data.recentSessions.map((session, i) => {
                        const previous = data.recentSessions[i + 1]
                        const delta = previous ? session.overallScore - previous.overallScore : 0
                        const hasDelta = Boolean(previous)

                        return (
                            <StaggerItem key={session.id}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.3, ease: EASE_OUT }}
                                    className="group flex h-full flex-col rounded-[1.5rem] border app-liquid-dark p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-shadow duration-300"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <TbUserCircle className="h-5 w-5" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                    {session.persona}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {session.mode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                                                {session.overallScore.toFixed(1)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatRelativeDate(session.date)}
                                            </p>
                                        </div>
                                        {hasDelta && (
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                                                    delta >= 0
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                                                }`}
                                            >
                                                {delta >= 0 ? (
                                                    <TbTrendingUp className="h-3 w-3" />
                                                ) : (
                                                    <TbTrendingDown className="h-3 w-3" />
                                                )}
                                                {delta >= 0 ? '+' : ''}
                                                {delta.toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => navigate(`/sessions/${session.id}/report`)}
                                        className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 dark:bg-white/5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:bg-primary group-hover:text-white transition-colors duration-300"
                                    >
                                        View report
                                        <TbArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </motion.div>
                            </StaggerItem>
                        )
                    })}
                </StaggerGroup>
            </div>
        </section>
    )
}

export default ContinueTraining
