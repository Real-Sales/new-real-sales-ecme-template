import { useMemo } from 'react'
import Drawer from '@/components/ui/Drawer'
import Badge from '@/components/ui/Badge'
import Chart from '@/components/shared/Chart'
import classNames from '@/utils/classNames'
import { NumericFormat } from 'react-number-format'
import { TbChartRadar } from 'react-icons/tb'
import type { SessionHistory } from './performanceData'

type SessionDetailDrawerProps = {
    isOpen: boolean
    onClose: () => void
    session: SessionHistory | null
}

const getScoreColor = (score: number) => {
    if (score >= 65) return 'text-green-500'
    if (score >= 50) return 'text-blue-500'
    return 'text-amber-500'
}

const getScoreBgClass = (score: number) => {
    if (score >= 65) return 'bg-green-500/10'
    if (score >= 50) return 'bg-blue-500/10'
    return 'bg-amber-500/10'
}

const getModeColor = (mode: string) => {
    const m = mode?.toLowerCase() || ''
    if (m.includes('discovering')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (m.includes('prospecting')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    if (m.includes('closing')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
}

const formatLabel = (key: string) => {
    return key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const SessionDetailDrawer = ({ isOpen, onClose, session }: SessionDetailDrawerProps) => {
    if (!session) return null

    const handleClose = () => {
        onClose()
        const bodyClassList = document.body.classList
        if (bodyClassList.contains('drawer-lock-scroll')) {
            bodyClassList.remove('drawer-lock-scroll', 'drawer-open')
        }
    }

    const minutes = Math.floor(session.duration / 60)
    const seconds = session.duration % 60

    const getGraphColor = (score: number) => {
        if (score >= 80) return '#22C55E'
        if (score < 40) return '#EF4444'
        return '#3B82F6'
    }

    const detailedMetrics = useMemo(() => {
        if (!session.metrics) return []

        const metrics = { ...session.metrics }
        delete (metrics as any).overall_score
        delete (metrics as any).coaching_summary

        return Object.entries(metrics).map(([key, value]) => ({
            label: formatLabel(key),
            short: formatLabel(key).split(' ')[0],
            value: Number(value),
        }))
    }, [session.metrics])

    const formattedDate = session.date
        ? new Date(session.date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : '—'

    return (
        <Drawer
            isOpen={isOpen}
            width={480}
            title="Session Detail"
            headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
            bodyClass="!p-5 !bg-gray-100 dark:!bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            {/* Session Info Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {session.persona}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                            innerClass={classNames(
                                'px-2 py-0.5 text-[10px] font-medium rounded',
                                getModeColor(session.mode),
                            )}
                            content={session.mode}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formattedDate}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {session.duration > 0 ? `${minutes}m ${seconds}s` : '—'}
                        </span>
                    </div>
                </div>
                <div className={classNames(
                    'rounded-xl px-4 py-2 text-center',
                    getScoreBgClass(session.overallScore),
                )}>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Score</p>
                    <div className={classNames('text-2xl font-bold leading-tight', getScoreColor(session.overallScore))}>
                        <NumericFormat
                            displayType="text"
                            value={session.overallScore}
                            decimalScale={1}
                            fixedDecimalScale
                        />
                    </div>
                </div>
            </div>

            {/* Radar Chart + Score List — only when category scores exist */}
            {detailedMetrics.length > 0 ? (
                <>
                    <div className="mb-2">
                        <Chart
                            key={session.id}
                            type="radar"
                            height={280}
                            series={[
                                {
                                    name: 'Score',
                                    data: detailedMetrics.map((m) => m.value),
                                },
                            ]}
                            customOptions={{
                                colors: [getGraphColor(session.overallScore)],
                                xaxis: {
                                    categories: detailedMetrics.map((m) => m.short),
                                    labels: {
                                        formatter: (val: string) => {
                                            const index = detailedMetrics.findIndex((m) => m.short === val)
                                            return index !== -1 ? `${index + 1}` : val
                                        },
                                    },
                                },
                                yaxis: { show: false, max: 100, min: 0 },
                                tooltip: {
                                    custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
                                        return `
                                            <div class="py-2 px-4 rounded-xl">
                                                <div class="flex items-center gap-2">
                                                    <div class="h-[10px] w-[10px] rounded-full" style="background-color: ${getGraphColor(session.overallScore)}"></div>
                                                    <div class="flex gap-2">${detailedMetrics[dataPointIndex].label}: <span class="font-bold">${detailedMetrics[dataPointIndex].value.toFixed(1)}</span></div>
                                                </div>
                                            </div>
                                        `
                                    },
                                },
                            }}
                        />
                    </div>

                    {/* Numbered Score List */}
                    <div className="flex flex-col gap-3 mb-8">
                        {detailedMetrics.map((metric, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full h-7 w-7 border-2 border-gray-200 dark:border-gray-600 font-bold text-xs heading-text flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                    <div className="heading-text text-sm whitespace-nowrap">{metric.label}</div>
                                </div>
                                <div className="border-dashed border-[1.5px] border-gray-300 dark:border-gray-500 flex-1" />
                                <span
                                    className={classNames(
                                        'rounded-full px-2 py-0.5 text-xs font-semibold text-white',
                                        metric.value >= 75 && 'bg-success',
                                        metric.value <= 30 && 'bg-error',
                                        metric.value > 30 && metric.value < 75 && 'bg-warning',
                                    )}
                                >
                                    {metric.value.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-12 mb-8 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700">
                    <TbChartRadar className="text-3xl text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        No category breakdown available for this session
                    </p>
                </div>
            )}

            {/* Coaching Summary */}
            {session.coachingSummary && (
                <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                        Coaching Summary
                    </h4>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {session.coachingSummary}
                        </p>
                    </div>
                </div>
            )}
        </Drawer>
    )
}

export default SessionDetailDrawer
