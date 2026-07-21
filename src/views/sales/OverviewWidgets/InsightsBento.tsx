import { Progress } from '@/components/ui'
import {
    TbTarget,
    TbBrain,
    TbTrophy,
    TbFocus2,
    TbTrendingUp,
    TbTrendingDown,
    TbFlame,
    TbCircleCheck,
} from 'react-icons/tb'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import { Reveal, StaggerGroup, StaggerItem, SectionHeading, CountUp } from './common'
import type { OverviewData } from './useOverviewData'

const Sparkline = ({ values }: { values: number[] }) => {
    if (values.length < 2) {
        return (
            <div className="flex h-12 items-center text-xs text-gray-400 dark:text-gray-500">
                Not enough sessions yet
            </div>
        )
    }
    const w = 200
    const h = 48
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const points = values
        .map((v, i) => {
            const x = (i / (values.length - 1)) * w
            const y = h - ((v - min) / range) * (h - 8) - 4
            return `${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx={w}
                cy={h - ((values[values.length - 1] - min) / range) * (h - 8) - 4}
                r={3.5}
                fill="var(--primary)"
            />
        </svg>
    )
}

const Tile = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => (
    <StaggerItem className={className}>
        <div className="h-full rounded-[1.5rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/60 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            {children}
        </div>
    </StaggerItem>
)

const TileLabel = ({
    icon,
    label,
}: {
    icon: React.ReactNode
    label: string
}) => (
    <div className="mb-3 flex items-center gap-2 text-gray-400 dark:text-gray-500">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
)

const InsightsBento = ({
    data,
    onSelectMode,
}: {
    data: OverviewData
    onSelectMode: (mode: ConversationMode) => void
}) => {
    const improvementUp = data.improvementPct >= 0
    const goalMode = data.recommendedPractice?.mode ?? 'a training'

    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-10">
                    <SectionHeading
                        heading="Your AI insights"
                        description="A live snapshot of where you stand, pulled straight from your session history."
                    />
                </Reveal>

                <StaggerGroup className="grid gap-4 md:grid-cols-4 md:auto-rows-[minmax(0,auto)]" gap={0.06}>
                    {/* Today's Goal - 2x1 */}
                    <Tile className="md:col-span-2">
                        <TileLabel icon={<TbTarget className="h-3.5 w-3.5" />} label="Today's goal" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                            Complete one {goalMode.toLowerCase()} session
                        </p>
                        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                            Small, consistent reps move the needle faster than long ones.
                        </p>
                    </Tile>

                    {/* AI Coach Summary - 2x2 */}
                    <Tile className="md:col-span-2 md:row-span-2">
                        <TileLabel icon={<TbBrain className="h-3.5 w-3.5" />} label="AI coach summary" />
                        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                            {data.weakest && data.strongest
                                ? `Your ${data.weakest.name.toLowerCase()} sessions trail your ${data.strongest.name.toLowerCase()} average by ${Math.max(
                                      1,
                                      Math.round(data.strongest.score - data.weakest.score),
                                  )} points. A focused block this week should close most of that gap.`
                                : 'Complete a few sessions and tailored coaching notes will start showing up here.'}
                        </p>
                        <div className="mt-5 flex items-center gap-4 text-sm">
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    <CountUp value={data.overallScore} decimals={1} />
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Overall score</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    <CountUp value={data.sessionsCompleted} />
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sessions logged</p>
                            </div>
                        </div>
                    </Tile>

                    {/* Strongest skill - 1x1 */}
                    <Tile className="md:col-span-1">
                        <TileLabel icon={<TbTrophy className="h-3.5 w-3.5" />} label="Strongest skill" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {data.strongest?.name ?? 'TBD'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {data.strongest ? `${data.strongest.score.toFixed(1)} avg score` : 'Log a session to unlock'}
                        </p>
                    </Tile>

                    {/* Weakest skill - 1x1 */}
                    <Tile className="md:col-span-1">
                        <TileLabel icon={<TbFocus2 className="h-3.5 w-3.5" />} label="Focus area" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {data.weakest?.name ?? 'TBD'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {data.weakest ? `${data.weakest.score.toFixed(1)} avg score` : 'Log a session to unlock'}
                        </p>
                    </Tile>

                    {/* Weekly progress sparkline - 2x1 */}
                    <Tile className="md:col-span-2">
                        <TileLabel icon={<TbTrendingUp className="h-3.5 w-3.5" />} label="Weekly progress" />
                        <Sparkline values={data.monthlyTrend.overall.slice(-6)} />
                    </Tile>

                    {/* Completion rate - 2x1 */}
                    <Tile className="md:col-span-2">
                        <div className="flex items-center gap-4">
                            <Progress
                                variant="circle"
                                percent={data.completionRatePct}
                                width={56}
                                strokeWidth={7}
                                customInfo={
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {data.completionRatePct}%
                                    </span>
                                }
                            />
                            <div>
                                <div className="mb-1 flex items-center gap-2 text-gray-400 dark:text-gray-500">
                                    <TbCircleCheck className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                                        Completion rate
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Sessions finished end to end
                                </p>
                            </div>
                        </div>
                    </Tile>

                    {/* Recommended practice - 2x1 */}
                    <Tile className="md:col-span-2">
                        <TileLabel icon={<TbFlame className="h-3.5 w-3.5" />} label="Recommended practice" />
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {data.recommendedPractice?.mode ?? 'Prospecting'}
                                </p>
                                <p className="mt-1 text-sm text-primary font-medium">
                                    +{data.recommendedPractice?.estimatedImprovement ?? 10}% estimated improvement
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    onSelectMode(
                                        (data.recommendedPractice?.mode.toLowerCase() as ConversationMode) ??
                                            'prospecting',
                                    )
                                }
                                className="shrink-0 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                            >
                                Start
                            </button>
                        </div>
                    </Tile>

                    {/* Recent improvement - 2x1 */}
                    <Tile className="md:col-span-2">
                        <TileLabel
                            icon={
                                improvementUp ? (
                                    <TbTrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                    <TbTrendingDown className="h-3.5 w-3.5" />
                                )
                            }
                            label="Recent improvement"
                        />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {data.improvementPct > 0 ? '+' : ''}
                            <CountUp value={data.improvementPct} suffix="%" />
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Versus last month</p>
                    </Tile>
                </StaggerGroup>
            </div>
        </section>
    )
}

export default InsightsBento
