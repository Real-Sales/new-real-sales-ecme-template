import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '@/auth/useAuth'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    startTour,
    restartTour,
    skipTour,
    pauseTour,
    completeTour,
    markStepComplete,
    goBackStep,
    ensureOwner,
    toggleChecklistItem,
    setCelebrated,
} from '@/store/slices/concierge/conciergeSlice'
import { fetchMySubscription } from '@/views/profile/Subscription/store/subscriptionSlice'
import { companyOwnerNeedsOnboarding } from '@/utils/onboarding'
import { useSpotlightTarget } from './useSpotlightTarget'
import { useTourEvent } from './conciergeBus'
import { buildTourSteps, buildChecklistItems, type TourStep } from './steps'
import Spotlight from './Spotlight'
import StepCoachmark from './StepCoachmark'
import WelcomeModal from './WelcomeModal'
import Celebration from './Celebration'
import FloatingCoach from './FloatingCoach'

const isDivisionList = (path: string) => path === '/sales-division'
const isDivisionDetail = (path: string) => /^\/sales-division\/[^/]+$/.test(path)
const isTeamDetail = (path: string) => /^\/teams\/[^/]+$/.test(path)

/** True when the browser is already on a page where this step's target can exist. */
const pathMatchesStep = (step: TourStep, path: string): boolean => {
    if (step.openFirstTeamDetail) return isTeamDetail(path)
    if (step.openFirstDivisionDetail) return isDivisionDetail(path)
    if (!step.route) return true
    // List-only landmarks (create button, page header) must not stay on /:id.
    if (step.route === '/sales-division') return isDivisionList(path)
    return path === step.route || path.startsWith(`${step.route}/`)
}

const ConciergeProvider = () => {
    const dispatch = useAppDispatch()
    const location = useLocation()
    const navigate = useNavigate()
    const { authenticated, isSessionReady } = useAuth()

    const user = useAppSelector((state) => state.auth.user)
    const concierge = useAppSelector((state) => state.concierge)
    const subscription = useAppSelector((state) => state.subscription.activeUserSubscription)

    const [welcomeDismissed, setWelcomeDismissed] = useState(false)
    const [celebrationOpen, setCelebrationOpen] = useState(false)

    const mustCompleteCompanySetup = companyOwnerNeedsOnboarding(user.role, user.companyId)
    const ready = authenticated && isSessionReady && !mustCompleteCompanySetup

    const steps = useMemo(() => buildTourSteps(user.role), [user.role])
    const checklistItems = useMemo(() => buildChecklistItems(user.role), [user.role])

    useEffect(() => {
        if (!ready || !user.userId) return
        dispatch(ensureOwner(user.userId))
    }, [ready, user.userId, dispatch])

    useEffect(() => {
        if (ready) dispatch(fetchMySubscription())
    }, [ready, dispatch])

    const activeStep =
        concierge.tourStatus === 'in_progress'
            ? steps[concierge.currentStepIndex] ?? null
            : null

    const { rect, element, panToTarget } = useSpotlightTarget(
        activeStep ? activeStep.target : null,
    )

    /**
     * Always put the browser on the page the active step needs — Next and Back.
     * Missing this for steps without navigateOnEnter was the black-screen bug:
     * spotlight looked for a target that isn't on the current route.
     */
    useEffect(() => {
        if (!activeStep) return

        const path = location.pathname

        const openFirstDivision = () => {
            const el = document.querySelector(
                '[data-tour-id="division-card"]',
            ) as HTMLElement | null
            const id = el?.dataset.divisionId
            if (!id) return false
            navigate(`/sales-division/${id}`)
            return true
        }

        const openFirstTeam = () => {
            const el = document.querySelector(
                '[data-tour-id="team-card"]',
            ) as HTMLElement | null
            const id = el?.dataset.teamId
            if (!id) return false
            navigate(`/teams/${id}`)
            return true
        }

        const pollUntil = (tryOpen: () => boolean) => {
            if (tryOpen()) return () => {}
            const interval = window.setInterval(() => {
                if (tryOpen()) window.clearInterval(interval)
            }, 300)
            const timeout = window.setTimeout(() => window.clearInterval(interval), 10000)
            return () => {
                window.clearInterval(interval)
                window.clearTimeout(timeout)
            }
        }

        if (pathMatchesStep(activeStep, path)) return

        // Team detail
        if (activeStep.openFirstTeamDetail) {
            return pollUntil(() => {
                if (openFirstTeam()) return true
                if (isDivisionDetail(path)) return false
                if (!isDivisionList(path)) {
                    navigate('/sales-division')
                    return true
                }
                return openFirstDivision()
            })
        }

        // Division detail
        if (activeStep.openFirstDivisionDetail) {
            if (isTeamDetail(path)) {
                navigate('/sales-division')
                return
            }
            return pollUntil(openFirstDivision)
        }

        // Any other step with a route — navigate there (covers Back into overview,
        // scenario library, leaderboard, etc. even when navigateOnEnter was omitted).
        if (activeStep.route) {
            navigate(activeStep.route)
        }
    }, [activeStep, location.pathname, navigate])

    useEffect(() => {
        if (activeStep && rect) {
            const t = window.setTimeout(panToTarget, 50)
            return () => window.clearTimeout(t)
        }
    }, [activeStep, rect, panToTarget])

    const advanceStep = useCallback(
        (stepId: string) => {
            const idx = steps.findIndex((s) => s.id === stepId)
            if (idx === -1) return
            const nextIndex = idx + 1
            dispatch(markStepComplete({ stepId, nextIndex }))
            if (nextIndex >= steps.length) {
                dispatch(completeTour())
            }
        },
        [dispatch, steps],
    )

    const handleBack = useCallback(() => {
        if (concierge.currentStepIndex <= 0) return
        dispatch(goBackStep())
    }, [dispatch, concierge.currentStepIndex])

    useTourEvent('start-training-opened', () => {
        if (activeStep?.id === 'start-training-cta') advanceStep('start-training-cta')
    })

    useEffect(() => {
        if (!activeStep?.advanceOnClick || !element) return
        const handler = () => {
            advanceStep(activeStep.id)
            dispatch(pauseTour())
        }
        element.addEventListener('click', handler)
        return () => element.removeEventListener('click', handler)
    }, [element, activeStep, advanceStep, dispatch])

    useEffect(() => {
        const routeToChecklistId: Record<string, string> = {
            '/performance': 'visit-performance',
            '/leaderboard': 'visit-leaderboard',
            '/assigned-scenarios': 'visit-assigned-scenarios',
            '/scenario-library': 'visit-scenario-library',
            '/sales-division': 'visit-sales-division',
            '/company-members': 'visit-company-members',
        }
        for (const [route, id] of Object.entries(routeToChecklistId)) {
            if (location.pathname.startsWith(route)) {
                dispatch(toggleChecklistItem({ id, done: true }))
            }
        }
    }, [location.pathname, dispatch])

    useEffect(() => {
        if (!ready) return
        const sessionsCompleted = subscription?.sessions_completed ?? 0
        if (sessionsCompleted > 0 && !concierge.hasCelebratedFirstSession) {
            dispatch(toggleChecklistItem({ id: 'run-first-session', done: true }))
            setCelebrationOpen(true)
            dispatch(setCelebrated())
        }
    }, [ready, subscription, concierge.hasCelebratedFirstSession, dispatch])

    const showWelcome =
        ready && concierge.tourStatus === 'not_started' && !welcomeDismissed

    const handleStartTour = () => {
        setWelcomeDismissed(true)
        dispatch(startTour())
    }

    const handleSkipWelcome = () => {
        setWelcomeDismissed(true)
        dispatch(skipTour())
    }

    const handleSkipDuringStep = () => {
        dispatch(pauseTour())
    }

    const handleResumeTour = () => {
        if (
            concierge.tourStatus === 'paused' ||
            concierge.tourStatus === 'in_progress'
        ) {
            dispatch(startTour())
            return
        }
        dispatch(restartTour())
    }

    const hasPendingNudge = useMemo(
        () => ready && concierge.tourStatus !== 'completed',
        [ready, concierge.tourStatus],
    )

    const routeReady = Boolean(activeStep && pathMatchesStep(activeStep, location.pathname))
    const targetReady = !activeStep?.target || rect !== null
    const showCoachmark = Boolean(activeStep && routeReady && targetReady)

    if (!ready) return null

    return (
        <>
            <WelcomeModal
                open={showWelcome}
                firstName={user.firstName || user.userName?.split(' ')[0] || 'there'}
                onStart={handleStartTour}
                onSkip={handleSkipWelcome}
            />

            {activeStep && (
                <>
                    {/* Only dim once we have a real cutout — never trap on full-black. */}
                    {rect && <Spotlight rect={rect} />}
                    {showCoachmark && (
                        <StepCoachmark
                            step={activeStep}
                            rect={rect}
                            stepIndex={concierge.currentStepIndex}
                            totalSteps={steps.length}
                            onNext={() => advanceStep(activeStep.id)}
                            onBack={handleBack}
                            onSkip={handleSkipDuringStep}
                        />
                    )}
                </>
            )}

            <Celebration open={celebrationOpen} onClose={() => setCelebrationOpen(false)} />

            <FloatingCoach
                checklistItems={checklistItems}
                checklistDone={concierge.checklist}
                tourStatus={concierge.tourStatus}
                onResumeTour={handleResumeTour}
                hasPendingNudge={hasPendingNudge}
            />
        </>
    )
}

export default ConciergeProvider
