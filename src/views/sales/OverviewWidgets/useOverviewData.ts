import { useEffect, useMemo } from 'react'
import { injectReducer } from '@/store'
import performanceReducer, {
    useAppSelector,
    useAppDispatch,
    fetchPerformanceByMode,
    fetchMonthlyTrend,
    fetchSessionHistory,
} from '@/store/slices/performance'
import {
    fetchMySubscription,
} from '@/views/profile/Subscription/store/subscriptionSlice'
import type { SessionHistory } from '@/views/sales/Performance/performanceData'

injectReducer('performance', performanceReducer)

export type ModeKey = 'prospecting' | 'discovering' | 'closing'

export interface ModeSummary {
    key: string
    name: string
    score: number
    sessions: number
}

export interface OverviewData {
    firstName: string
    credits: {
        remaining: number
        allocated: number
        used: number
        poolType: 'user' | 'company' | undefined
    } | null
    sessionsCompleted: number
    overallScore: number
    modeAverages: ModeSummary[]
    strongest: ModeSummary | null
    weakest: ModeSummary | null
    monthlyTrend: {
        months: string[]
        overall: number[]
        byMode: Record<string, number[]>
    }
    improvementPct: number
    streakDays: number
    xp: number
    level: number
    levelProgressPct: number
    xpIntoLevel: number
    xpToNextLevel: number
    completionRatePct: number
    recentSessions: SessionHistory[]
    recommendedPractice: {
        mode: string
        estimatedImprovement: number
    } | null
    loading: boolean
}

const XP_PER_LEVEL = 500

/** Consecutive-day streak counted backward from the most recent session day. */
function computeStreak(sessions: SessionHistory[]): number {
    if (!sessions.length) return 0
    const days = Array.from(
        new Set(
            sessions
                .map((s) => {
                    const d = new Date(s.date)
                    if (Number.isNaN(d.getTime())) return null
                    return d.toISOString().slice(0, 10)
                })
                .filter((d): d is string => Boolean(d)),
        ),
    ).sort((a, b) => (a < b ? 1 : -1))

    if (!days.length) return 0

    const mostRecent = new Date(days[0])
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    mostRecent.setHours(0, 0, 0, 0)
    const gapFromToday = Math.round(
        (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24),
    )
    // Streak is only "alive" if the most recent session was today or yesterday.
    if (gapFromToday > 1) return 0

    let streak = 1
    for (let i = 1; i < days.length; i++) {
        const prev = new Date(days[i - 1])
        const curr = new Date(days[i])
        const gap = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
        if (gap === 1) {
            streak += 1
        } else {
            break
        }
    }
    return streak
}

export const useOverviewData = (): OverviewData => {
    const dispatch = useAppDispatch()
    const userId = useAppSelector((state) => state.auth.user.userId)
    const firstName = useAppSelector((state) => state.auth.user.firstName)
    const userName = useAppSelector((state) => state.auth.user.userName)

    const activeUserSubscription = useAppSelector(
        (state) => state.subscription.activeUserSubscription,
    )
    const subscriptionInitialized = useAppSelector(
        (state) => state.subscription.userSubscriptionInitialized,
    )
    const subscriptionLoading = useAppSelector(
        (state) => state.subscription.userSubscriptionLoading,
    )

    const {
        performanceReport,
        performanceLoading,
        initialized,
        monthlyTrend,
        trendLoading,
        trendInitialized,
        sessionHistory,
        sessionHistoryLoading,
        sessionHistoryInitialized,
    } = useAppSelector(
        (state) =>
            state.performance?.data ?? {
                performanceReport: null,
                performanceLoading: false,
                initialized: false,
                monthlyTrend: null,
                trendLoading: false,
                trendInitialized: false,
                sessionHistory: [],
                sessionHistoryLoading: false,
                sessionHistoryInitialized: false,
            },
    )

    useEffect(() => {
        if (!subscriptionInitialized && !subscriptionLoading) {
            dispatch(fetchMySubscription())
        }
    }, [dispatch, subscriptionInitialized, subscriptionLoading])

    useEffect(() => {
        if (userId && !initialized && !performanceLoading) {
            dispatch(fetchPerformanceByMode(userId))
        }
    }, [dispatch, userId, initialized, performanceLoading])

    useEffect(() => {
        if (userId && !trendInitialized && !trendLoading) {
            dispatch(fetchMonthlyTrend(userId))
        }
    }, [dispatch, userId, trendInitialized, trendLoading])

    useEffect(() => {
        if (userId && !sessionHistoryInitialized && !sessionHistoryLoading) {
            dispatch(fetchSessionHistory(userId))
        }
    }, [dispatch, userId, sessionHistoryInitialized, sessionHistoryLoading])

    return useMemo(() => {
        const modeAverages: ModeSummary[] = (performanceReport?.mode_averages ?? []).map(
            (m) => ({
                key: m.mode_name.toLowerCase(),
                name: m.mode_name,
                score: m.average_scores?.overall_score ?? 0,
                sessions: m.total_sessions ?? 0,
            }),
        )

        const ranked = [...modeAverages].filter((m) => m.sessions > 0)
        const strongest =
            ranked.length > 0
                ? ranked.reduce((a, b) => (b.score > a.score ? b : a))
                : null
        const weakest =
            ranked.length > 0
                ? ranked.reduce((a, b) => (b.score < a.score ? b : a))
                : null

        const months: string[] = []
        const overall: number[] = []
        const byMode: Record<string, number[]> = {
            prospecting: [],
            discovering: [],
            closing: [],
        }

        for (const entry of monthlyTrend?.monthly_trends ?? []) {
            months.push(entry.month)
            const modeScores = [
                entry.modes.prospecting?.average_score,
                entry.modes.discovering?.average_score,
                entry.modes.closing?.average_score,
            ].filter((v): v is number => typeof v === 'number')
            const avg =
                modeScores.length > 0
                    ? modeScores.reduce((sum, v) => sum + v, 0) / modeScores.length
                    : 0
            overall.push(Math.round(avg * 10) / 10)
            byMode.prospecting.push(entry.modes.prospecting?.average_score ?? 0)
            byMode.discovering.push(entry.modes.discovering?.average_score ?? 0)
            byMode.closing.push(entry.modes.closing?.average_score ?? 0)
        }

        let improvementPct = 0
        if (overall.length >= 2) {
            const prev = overall[overall.length - 2]
            const latest = overall[overall.length - 1]
            improvementPct = prev > 0 ? Math.round(((latest - prev) / prev) * 100) : 0
        }

        const sessionsCompleted =
            activeUserSubscription?.sessions_completed ??
            performanceReport?.total_sessions_analyzed ??
            sessionHistory.length

        const overallScore = performanceReport?.overall_average_score ?? 0

        const streakDays = computeStreak(sessionHistory)

        const xp = Math.round(sessionsCompleted * 60 + overallScore * 4)
        const xpIntoLevel = xp % XP_PER_LEVEL
        const level = Math.floor(xp / XP_PER_LEVEL) + 1
        const levelProgressPct = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100)
        const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel

        const completedCount = sessionHistory.filter(
            (s) => s.status?.toLowerCase() === 'completed',
        ).length
        const completionRatePct =
            sessionHistory.length > 0
                ? Math.round((completedCount / sessionHistory.length) * 100)
                : 0

        const recentSessions = [...sessionHistory]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4)

        const recommendedPractice = weakest
            ? {
                  mode: weakest.name,
                  estimatedImprovement: clampImprovement(
                      strongest ? (strongest.score - weakest.score) * 0.55 : 12,
                  ),
              }
            : null

        return {
            firstName: firstName || userName?.split(' ')[0] || 'there',
            credits: activeUserSubscription
                ? {
                      remaining: activeUserSubscription.credits_remaining ?? 0,
                      allocated: activeUserSubscription.credits_allocated ?? 0,
                      used: activeUserSubscription.credits_used ?? 0,
                      poolType: activeUserSubscription.pool_type,
                  }
                : null,
            sessionsCompleted,
            overallScore,
            modeAverages,
            strongest,
            weakest,
            monthlyTrend: { months, overall, byMode },
            improvementPct,
            streakDays,
            xp,
            level,
            levelProgressPct,
            xpIntoLevel,
            xpToNextLevel,
            completionRatePct,
            recentSessions,
            recommendedPractice,
            loading:
                performanceLoading ||
                trendLoading ||
                sessionHistoryLoading ||
                subscriptionLoading,
        }
    }, [
        firstName,
        userName,
        activeUserSubscription,
        performanceReport,
        monthlyTrend,
        sessionHistory,
        performanceLoading,
        trendLoading,
        sessionHistoryLoading,
        subscriptionLoading,
    ])
}

function clampImprovement(value: number): number {
    if (!Number.isFinite(value) || value <= 0) return 8
    return Math.max(6, Math.min(22, Math.round(value)))
}
