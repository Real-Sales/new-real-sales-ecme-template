import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import Container from '@/components/shared/Container'
import Loading from '@/components/shared/Loading'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { TbArrowLeft, TbDownload, TbRefresh } from 'react-icons/tb'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiEnsurePerformanceReport,
    downloadPerformanceReportPdf,
    getPerformanceReportPdfErrorMessage,
    type CoachingSummary,
    type PerformanceReportPayload,
    type ReportCategory,
} from '@/services/SessionService'

type ReportState =
    | { status: 'loading' }
    | { status: 'ready'; report: PerformanceReportPayload }
    | { status: 'error'; message: string; canRetry?: boolean }

type CategoryRow = { key: string; name: string; score: number; comment: string }

const scoreColor = (value: number) => {
    if (value >= 75) return 'text-green-500'
    if (value >= 50) return 'text-blue-500'
    if (value >= 30) return 'text-amber-500'
    return 'text-red-500'
}

const scoreBarColor = (value: number) => {
    if (value >= 75) return 'bg-green-500'
    if (value >= 50) return 'bg-blue-500'
    if (value >= 30) return 'bg-amber-500'
    return 'bg-red-500'
}

function parseCategories(categories: ReportCategory[] | undefined): CategoryRow[] {
    if (!Array.isArray(categories)) return []
    return categories
        .map((c, idx) => {
            const name = (c?.name ?? '').toString().trim() || `Category ${idx + 1}`
            const score = typeof c?.score === 'number' ? c.score : Number.NaN
            const comment = typeof c?.comment === 'string' ? c.comment.trim() : ''
            return {
                key: `${name}-${idx}`,
                name,
                score,
                comment,
            }
        })
        .filter((row) => Number.isFinite(row.score))
}

function parseCoaching(cs: unknown): CoachingSummary | null {
    if (!cs || typeof cs !== 'object' || Array.isArray(cs)) return null
    const o = cs as Record<string, unknown>
    const summary = typeof o.summary === 'string' ? o.summary : undefined
    const strengths = Array.isArray(o.strengths)
        ? o.strengths.filter((s): s is string => typeof s === 'string' && !!s.trim())
        : []
    const areas_for_improvement = Array.isArray(o.areas_for_improvement)
        ? o.areas_for_improvement.filter(
              (s): s is string => typeof s === 'string' && !!s.trim(),
          )
        : []
    if (!summary?.trim() && !strengths.length && !areas_for_improvement.length) {
        return null
    }
    return {
        summary: summary?.trim(),
        strengths,
        areas_for_improvement,
    }
}

/** Inline `**bold**` segments. */
function renderInlineBold(text: string): ReactNode {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) =>
        i % 2 === 1 ? (
            <strong key={i} className="font-semibold text-gray-900 dark:text-white">
                {part}
            </strong>
        ) : (
            part
        ),
    )
}

function InsightStack({ items }: { items: string[] }) {
    return (
        <div className="flex flex-col gap-2">
            {items.map((text, i) => (
                <div
                    key={i}
                    className="rounded-lg border border-gray-200/90 dark:border-gray-600/60 bg-white/60 dark:bg-gray-900/50 px-4 py-3 shadow-sm"
                >
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {renderInlineBold(text)}
                    </p>
                </div>
            ))}
        </div>
    )
}

function mapReportError(err: unknown): { message: string; canRetry?: boolean } {
    const ax = err as {
        response?: { status?: number; data?: { detail?: string } }
    }
    const status = ax?.response?.status
    const detail: string = ax?.response?.data?.detail ?? ''
    if (status === 400 && /no chat history/i.test(detail)) {
        return {
            message:
                'No transcript was captured for this session, so a report cannot be generated.',
        }
    }
    return {
        message: detail || 'Failed to load performance report.',
        canRetry: true,
    }
}

const SessionReport = () => {
    const { sessionId } = useParams<{ sessionId: string }>()
    const navigate = useNavigate()
    const [state, setState] = useState<ReportState>({ status: 'loading' })
    const [downloading, setDownloading] = useState(false)

    const runLoad = useCallback(() => {
        if (!sessionId) {
            setState({ status: 'error', message: 'Missing session id.' })
            return
        }
        setState({ status: 'loading' })
        apiEnsurePerformanceReport(sessionId)
            .then((report) => setState({ status: 'ready', report }))
            .catch((err: unknown) =>
                setState({ status: 'error', ...mapReportError(err) }),
            )
    }, [sessionId])

    useEffect(() => {
        if (!sessionId) {
            setState({ status: 'error', message: 'Missing session id.' })
            return
        }
        let cancelled = false
        setState({ status: 'loading' })
        apiEnsurePerformanceReport(sessionId)
            .then((report) => {
                if (!cancelled) setState({ status: 'ready', report })
            })
            .catch((err: unknown) => {
                if (!cancelled) setState({ status: 'error', ...mapReportError(err) })
            })
        return () => {
            cancelled = true
        }
    }, [sessionId])

    const handleDownloadPdf = async () => {
        if (!sessionId || downloading) return
        try {
            setDownloading(true)
            await downloadPerformanceReportPdf(sessionId)
        } catch (err: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getPerformanceReportPdfErrorMessage(err)}
                </Notification>,
            )
        } finally {
            setDownloading(false)
        }
    }

    const report = state.status === 'ready' ? state.report : null
    const categoryRows = useMemo(
        () => (report ? parseCategories(report.categories) : []),
        [report],
    )
    const coaching = useMemo(
        () => (report ? parseCoaching(report.coaching_summary) : null),
        [report],
    )
    const overall = useMemo(() => {
        const v = report?.overall_score
        return typeof v === 'number' && Number.isFinite(v) ? v : undefined
    }, [report])
    const scenarioEval = useMemo(() => {
        const v = report?.scenario_evaluation
        return typeof v === 'string' && v.trim() ? v.trim() : undefined
    }, [report])

    const hasCoachingContent =
        !!coaching &&
        (!!coaching.summary?.trim() ||
            (coaching.strengths?.length ?? 0) > 0 ||
            (coaching.areas_for_improvement?.length ?? 0) > 0)

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Container className="px-4 py-8 md:px-8 md:py-10 max-w-5xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Performance Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Session feedback generated from your conversation transcript.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<TbArrowLeft />}
                            onClick={() => navigate('/overview')}
                        >
                            Back to Overview
                        </Button>
                        {state.status === 'ready' && (
                            <Button
                                size="sm"
                                variant="solid"
                                icon={<TbDownload />}
                                loading={downloading}
                                onClick={handleDownloadPdf}
                            >
                                Download PDF
                            </Button>
                        )}
                    </div>
                </div>

                {state.status === 'loading' && (
                    <Card>
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <Loading
                                loading
                                spinnerClass="text-blue-500"
                                className="!min-h-0"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Loading your report…
                            </p>
                        </div>
                    </Card>
                )}

                {state.status === 'error' && (
                    <Card>
                        <div className="py-12 px-6 flex flex-col items-center justify-center gap-3 text-center">
                            <p className="text-sm text-gray-700 dark:text-gray-200">
                                {state.message}
                            </p>
                            {state.canRetry && (
                                <Button
                                    size="sm"
                                    variant="solid"
                                    icon={<TbRefresh />}
                                    onClick={runLoad}
                                >
                                    Try again
                                </Button>
                            )}
                        </div>
                    </Card>
                )}

                {state.status === 'ready' && (
                    <div className="flex flex-col gap-6">
                        {typeof overall === 'number' && (
                            <Card bodyClass="!p-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Overall Score
                                        </p>
                                        <div
                                            className={`text-5xl font-bold leading-tight mt-1 ${scoreColor(
                                                overall,
                                            )}`}
                                        >
                                            {overall.toFixed(1)}
                                            <span className="text-2xl text-gray-400 dark:text-gray-500 font-medium">
                                                {' '}
                                                / 100
                                            </span>
                                        </div>
                                    </div>
                                    <div className="min-w-[240px] flex-1 max-w-md">
                                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <div
                                                className={`h-full ${scoreBarColor(
                                                    overall,
                                                )}`}
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, overall))}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {categoryRows.length > 0 && (
                            <Card bodyClass="!p-6">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                                    Skill Breakdown
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categoryRows.map((m) => (
                                        <div
                                            key={m.key}
                                            className="flex flex-col gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    {m.name}
                                                </span>
                                                <span
                                                    className={`text-sm font-semibold ${scoreColor(
                                                        m.score,
                                                    )}`}
                                                >
                                                    {m.score.toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <div
                                                    className={`h-full ${scoreBarColor(
                                                        m.score,
                                                    )}`}
                                                    style={{
                                                        width: `${Math.max(0, Math.min(100, m.score))}%`,
                                                    }}
                                                />
                                            </div>
                                            {m.comment ? (
                                                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-line">
                                                    {m.comment}
                                                </p>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {hasCoachingContent && coaching && (
                            <Card bodyClass="!p-6">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                                    Coaching Summary
                                </h2>
                                <div className="flex flex-col gap-6">
                                    {coaching.summary?.trim() ? (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                                Summary
                                            </h3>
                                            <div className="rounded-lg border border-gray-200/90 dark:border-gray-600/60 bg-white/60 dark:bg-gray-900/50 px-4 py-3 shadow-sm">
                                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                    {renderInlineBold(coaching.summary)}
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}
                                    {(coaching.strengths?.length ?? 0) > 0 ? (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                Strengths
                                            </h3>
                                            <InsightStack
                                                items={coaching.strengths ?? []}
                                            />
                                        </div>
                                    ) : null}
                                    {(coaching.areas_for_improvement?.length ?? 0) >
                                    0 ? (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                Areas for improvement
                                            </h3>
                                            <InsightStack
                                                items={
                                                    coaching.areas_for_improvement ??
                                                    []
                                                }
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </Card>
                        )}

                        {scenarioEval ? (
                            <Card bodyClass="!p-6">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                                    Scenario Evaluation
                                </h2>
                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {scenarioEval}
                                </p>
                            </Card>
                        ) : null}
                    </div>
                )}
            </Container>
        </div>
    )
}

export default SessionReport
