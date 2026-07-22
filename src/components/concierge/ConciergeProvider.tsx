import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '@/auth/useAuth'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    startTour,
    skipTour,
    pauseTour,
    completeTour,
    markStepComplete,
    goBackStep,
    ensureOwner,
    toggleChecklistItem,
    setCelebrated,
} from '@/store/slices/concierge/conciergeSlice'
import type { TourStatus } from '@/store/slices/concierge/conciergeSlice'
import { fetchMySubscription } from '@/views/profile/Subscription/store/subscriptionSlice'
import { companyOwnerNeedsOnboarding } from '@/utils/onboarding'
import { useSpotlightTarget } from './useSpotlightTarget'
import { useTourEvent } from './conciergeBus'
import { buildTourSteps, buildChecklistItems } from './steps'
import Spotlight from './Spotlight'
import StepCoachmark from './StepCoachmark'
import WelcomeModal from './WelcomeModal'
import Celebration from './Celebration'
import FloatingCoach from './FloatingCoach'

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

    // Keep tour/celebration progress across logins for the same account; reset only
    // when a different user signs in on this browser.
    useEffect(() => {
        if (!ready || !user.userId) return
        dispatch(ensureOwner(user.userId))
    }, [ready, user.userId, dispatch])

    // Subscription (credits/sessions_completed) is needed app-wide for the celebration signal.
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

    // Auto-pilot: the moment a step becomes active, drive the browser there for the user
    // instead of waiting for them to find the link themselves.
    useEffect(() => {
        if (!activeStep) return

        const onDivisionDetail = /^\/sales-division\/[^/]+$/.test(location.pathname)

        if (activeStep.openFirstDivisionDetail) {
            if (onDivisionDetail) return

            const tryOpen = () => {
                const firstDivision = document.querySelector(
                    '[data-tour-id="division-card"]',
                ) as HTMLElement | null
                const divisionId = firstDivision?.dataset.divisionId
                if (!divisionId) return false
                navigate(`/sales-division/${divisionId}`)
                return true
            }

            if (tryOpen()) return

            // Division cards may still be loading after create — retry briefly.
            const interval = window.setInterval(() => {
                if (tryOpen()) window.clearInterval(interval)
            }, 300)
            const timeout = window.setTimeout(() => window.clearInterval(interval), 10000)
            return () => {
                window.clearInterval(interval)
                window.clearTimeout(timeout)
            }
        }

        if (
            activeStep.navigateOnEnter &&
            activeStep.route &&
            location.pathname !== activeStep.route
        ) {
            // Stay on a division detail page when the step's route is the list prefix.
            if (
                activeStep.route === '/sales-division' &&
                onDivisionDetail
            ) {
                return
            }
            navigate(activeStep.route)
        }
    }, [activeStep, location.pathname, navigate])

    // Pan the camera to the target as soon as it actually resolves (page may still be loading).
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

    // Real-action advancement (guide by doing, not by describing).
    useTourEvent('start-training-opened', () => {
        if (activeStep?.id === 'start-training-cta') advanceStep('start-training-cta')
    })

    // Clicking the real, spotlighted element (e.g. "Add Scenario") marks this step done and
    // steps out of the way - the user is about to use a real drawer/dialog, the tour should
    // not yank them to the next page mid-task. They resume via the floating coach when ready.
    useEffect(() => {
        if (!activeStep?.advanceOnClick || !element) return
        const handler = () => {
            advanceStep(activeStep.id)
            dispatch(pauseTour())
        }
        element.addEventListener('click', handler)
        return () => element.removeEventListener('click', handler)
    }, [element, activeStep, advanceStep, dispatch])

    // Checklist signals that don't depend on the tour being active.
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

    // Celebration: first completed session, detected from real subscription usage data.
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
        if (concierge.tourStatus === 'completed') return
        dispatch(startTour())
    }

    const hasPendingNudge = useMemo(
        () => ready && concierge.tourStatus !== 'completed',
        [ready, concierge.tourStatus],
    )

    // Hold the coachmark until the route has settled and the spotlight target
    // exists. Showing it early falls back to the viewport center for one frame
    // while the next page mounts — the flash the user was seeing.
    const routeReady =
        !activeStep?.route ||
        location.pathname === activeStep.route ||
        location.pathname.startsWith(`${activeStep.route}/`)
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
                    <Spotlight rect={rect} />
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
