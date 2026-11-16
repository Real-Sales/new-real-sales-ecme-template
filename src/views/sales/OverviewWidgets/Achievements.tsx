import { motion } from 'framer-motion'
import { Progress } from '@/components/ui'
import {
    TbFlame,
    TbFlag3,
    TbCalendarStats,
    TbMedal,
    TbCrown,
    TbLock,
} from 'react-icons/tb'
import { Reveal, StaggerGroup, StaggerItem, SectionHeading, CountUp, EASE_OUT } from './common'
import type { OverviewData } from './useOverviewData'

const milestones = [
    { label: 'First rep', threshold: 1, icon: TbFlag3 },
    { label: 'Warming up', threshold: 10, icon: TbFlame },
    { label: 'Consistent', threshold: 25, icon: TbCalendarStats },
    { label: 'Dedicated', threshold: 50, icon: TbMedal },
    { label: 'Elite', threshold: 100, icon: TbCrown },
]

const Achievements = ({ data }: { data: OverviewData }) => {
    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-10">
                    <SectionHeading
                        heading="Progress and milestones"
                        description="Experience accrues from every completed session and score improvement."
                    />
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/60 p-6 sm:p-8 shadow-sm">
                        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
                            <div className="flex items-center gap-5">
                                <Progress
                                    variant="circle"
                                    percent={data.levelProgressPct}
                                    width={84}
                                    strokeWidth={6}
                                    customInfo={
                                        <div className="text-center leading-none">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {data.level}
                                            </p>
                                            <p className="text-[9px] uppercase tracking-wide text-gray-400">
                                                Level
                                            </p>
                                        </div>
                                    }
                                />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        <CountUp value={data.xp} /> XP
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {data.xpToNextLevel} XP to level {data.level + 1}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                                        <TbFlame className="h-4 w-4" />
                                        {data.streakDays > 0
                                            ? `${data.streakDays}-day streak`
                                            : 'Start a streak today'}
                                    </div>
                                </div>
                            </div>

                            <StaggerGroup
                                className="grid grid-cols-2 gap-3 sm:grid-cols-5"
                                gap={0.05}
                            >
                                {milestones.map((m) => {
                                    const unlocked = data.sessionsCompleted >= m.threshold
                                    const Icon = m.icon
                                    return (
                                        <StaggerItem key={m.label}>
                                            <motion.div
                                                whileHover={unlocked ? { y: -3 } : undefined}
                                                transition={{ duration: 0.25, ease: EASE_OUT }}
                                                className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition-colors ${
                                                    unlocked
                                                        ? 'border-primary/25 bg-primary/5'
                                                        : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]'
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                        unlocked
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600'
                                                    }`}
                                                >
                                                    {unlocked ? (
                                                        <Icon className="h-5 w-5" />
                                                    ) : (
                                                        <TbLock className="h-4 w-4" />
                                                    )}
                                                </span>
                                                <p
                                                    className={`text-xs font-semibold ${
                                                        unlocked
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-400 dark:text-gray-600'
                                                    }`}
                                                >
                                                    {m.label}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-600">
                                                    {m.threshold} sessions
                                                </p>
                                            </motion.div>
                                        </StaggerItem>
                                    )
                                })}
                            </StaggerGroup>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

export default Achievements
