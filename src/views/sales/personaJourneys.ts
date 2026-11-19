import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiGetSessionsByUser, type SessionResponse } from '@/services/SessionService'
import { MODE_PIPELINE_NAMES, MODE_PIPELINE_ORDER } from '@/utils/modePipeline'

/** One mode of a journey: the latest completed session in that mode, if there is one. */
export type JourneyStep = {
    mode: string
    session: SessionResponse | null
    score: number | null
}

/** A rep's run through prospecting -> discovering -> closing with one persona. */
export type PersonaJourney = {
    journeyId: string
    personaId: string
    /** Always three entries, in pipeline order. */
    steps: JourneyStep[]
    /** Mode to practise next, or null once closing is done. */
    nextMode: string | null
    /** Session the next mode continues from (the backend carries its memory forward). */
    continueFrom: SessionResponse | null
    completed: boolean
    startedAt: number
    lastActivity: number
}

const timeOf = (s: SessionResponse) => new Date(s.end_time || s.created_at || 0).getTime() || 0

/**
 * Groups completed self-serve sessions into journeys and works out the next mode for each.
 * A persona can have several journeys: every fresh conversation starts its own. Manager-assigned
 * scenario sessions are left out: they advance on their own and live under Assigned scenarios.
 */
export function buildPersonaJourneys(
    sessions: SessionResponse[],
    modeNameById: Record<string, string>,
): PersonaJourney[] {
    const groups = new Map<string, SessionResponse[]>()
    for (const s of sessions) {
        if (s.status !== 'completed' || s.scenario_id) continue
        if (MODE_PIPELINE_ORDER[modeNameById[s.mode_id]] === undefined) continue
        const key = s.journey_id || s.session_id
        const list = groups.get(key)
        if (list) list.push(s)
        else groups.set(key, [s])
    }

    const journeys: PersonaJourney[] = []
    for (const [journeyId, list] of groups) {
        const steps: JourneyStep[] = MODE_PIPELINE_NAMES.map((mode) => {
            const latest = list
                .filter((s) => modeNameById[s.mode_id] === mode)
                .sort((a, b) => timeOf(b) - timeOf(a))[0]
            const raw = latest?.performance_report?.overall_score
            return {
                mode,
                session: latest ?? null,
                score: typeof raw === 'number' ? Math.round(raw) : null,
            }
        })
        // A journey runs in order from prospecting. A session that began in a later mode is one-off
        // practice, not a journey, and a later mode only counts once the ones before it are done.
        let furthest = -1
        while (furthest + 1 < steps.length && steps[furthest + 1].session) furthest += 1
        if (furthest < 0) continue
        for (let i = furthest + 1; i < steps.length; i++) steps[i] = { ...steps[i], session: null, score: null }
        const completed = furthest >= steps.length - 1
        const times = list.map(timeOf)
        journeys.push({
            journeyId,
            personaId: list[0].persona_id,
            steps,
            nextMode: completed ? null : steps[furthest + 1].mode,
            continueFrom: completed ? null : steps[furthest].session,
            completed,
            startedAt: Math.min(...times),
            lastActivity: Math.max(...times),
        })
    }

    // In progress first, then most recent
    return journeys.sort(
        (a, b) => Number(a.completed) - Number(b.completed) || b.lastActivity - a.lastActivity,
    )
}

const dismissedKey = (userId: string) => `saleswana:discarded-journeys:${userId}`

function readDismissed(userId: string | undefined): string[] {
    if (!userId) return []
    try {
        const parsed = JSON.parse(localStorage.getItem(dismissedKey(userId)) || '[]')
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
    } catch {
        return []
    }
}

/**
 * The signed-in rep's journeys, loaded once when the page opens. Discarding a journey only hides
 * it from this list (remembered in this browser): the sessions, scores and reports are untouched.
 */
export function usePersonaJourneys(
    userId: string | undefined,
    modes: { mode_id: string; name: string }[] | undefined,
) {
    const [sessions, setSessions] = useState<SessionResponse[]>([])
    const [loading, setLoading] = useState(Boolean(userId))
    const [dismissed, setDismissed] = useState<string[]>(() => readDismissed(userId))

    useEffect(() => {
        setDismissed(readDismissed(userId))
        if (!userId) return
        let cancelled = false
        setLoading(true)
        apiGetSessionsByUser(userId)
            .then((data) => {
                if (!cancelled) setSessions(Array.isArray(data) ? data : [])
            })
            .catch(() => {
                if (!cancelled) setSessions([])
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [userId])

    const save = useCallback(
        (next: string[]) => {
            setDismissed(next)
            if (!userId) return
            try {
                localStorage.setItem(dismissedKey(userId), JSON.stringify(next))
            } catch {
                /* private mode: the discard lasts for this visit only */
            }
        },
        [userId],
    )
    const discard = useCallback(
        (journeyId: string) => save([...new Set([...dismissed, journeyId])]),
        [dismissed, save],
    )
    const restore = useCallback(
        (journeyId: string) => save(dismissed.filter((id) => id !== journeyId)),
        [dismissed, save],
    )

    const journeys = useMemo(() => {
        const modeNameById: Record<string, string> = {}
        for (const m of modes ?? []) modeNameById[m.mode_id] = (m.name || '').toLowerCase()
        const hidden = new Set(dismissed)
        return buildPersonaJourneys(sessions, modeNameById).filter((j) => !hidden.has(j.journeyId))
    }, [sessions, modes, dismissed])

    return { journeys, loading, discard, restore }
}
