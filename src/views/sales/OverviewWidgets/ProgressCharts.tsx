import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import Chart from '@/components/shared/Chart'
import { TbChartAreaLine, TbClipboardCheck } from 'react-icons/tb'
import { Reveal, SectionHeading } from './common'
import type { OverviewData } from './useOverviewData'

const modeColors: Record<string, string> = {
    Overall: '#0CAF60',
    Prospecting: '#34c779',
    Discovering: '#0CAF60',
    Closing: '#088d50',
}

const ProgressCharts = ({ data }: { data: OverviewData }) => {
    const [view, setView] = useState<'overall' | 'byMode'>('overall')

    const { months, series, colors } = useMemo(() => {
        const months = data.monthlyTrend.months.map((m) => dayjs(m).format('MMM'))

        if (view === 'overall') {
            return {
                months,
                series: [{ name: 'Overall score', data: data.monthlyTrend.overall }],
                colors: [modeColors.Overall],
            }
        }

        const series = [
            { name: 'Prospecting', data: data.monthlyTrend.byMode.prospecting ?? [] },
            { name: 'Discovering', data: data.monthlyTrend.byMode.discovering ?? [] },
            { name: 'Closing', data: data.monthlyTrend.byMode.closing ?? [] },
        ]
        return {
            months,
            series,
            colors: [modeColors.Prospecting, modeColors.Discovering, modeColors.Closing],
        }
    }, [data, view])

    const hasData = months.length > 1

    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <SectionHeading
                            heading="Learning progress"
                            description="How your scores have moved over time, across all modes or broken out individually."
                        />
                        <div className="flex shrink-0 gap-1 rounded-full bg-gray-100 dark:bg-white/5 p-1">
                            {(['overall', 'byMode'] as const).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setView(key)}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                                        view === key
                                            ? 'bg-white dark:bg-gray-900 text-primary shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {key === 'overall' ? 'Overall' : 'By mode'}
                                </button>
                            ))}
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/60 p-5 sm:p-7 shadow-sm">
                        <div className="mb-6 flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <TbChartAreaLine className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {data.overallScore.toFixed(1)} avg score
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Across {data.sessionsCompleted} sessions
                                    </p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <TbClipboardCheck className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {data.completionRatePct}% completion
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Sessions finished end to end
                                    </p>
                                </div>
                            </div>
                        </div>

                        {hasData ? (
                            <Chart
                                type="area"
                                series={series}
                                xAxis={months}
                                height={320}
                                customOptions={{
                                    colors,
                                    stroke: { curve: 'smooth', width: 2.5 },
                                    fill: {
                                        type: 'gradient',
                                        gradient: { opacityFrom: 0.28, opacityTo: 0.02 },
                                    },
                                    yaxis: { min: 0, max: 100, tickAmount: 4 },
                                    legend: { show: view === 'byMode' },
                                    dataLabels: { enabled: false },
                                }}
                            />
                        ) : (
                            <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
                                <TbChartAreaLine className="h-8 w-8" />
                                <p className="text-sm">Complete a few sessions to see your trend here</p>
                            </div>
                        )}
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

export default ProgressCharts
