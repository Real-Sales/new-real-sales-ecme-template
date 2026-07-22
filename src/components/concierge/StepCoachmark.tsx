import { useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TbSparkles, TbArrowRight, TbArrowLeft, TbX } from 'react-icons/tb'
import type { TargetRect } from './useSpotlightTarget'
import type { TourStep } from './steps'

const GAP = 20
const PANEL_WIDTH = 320
const PANEL_EST_HEIGHT = 220

const computePosition = (rect: TargetRect, placement: TourStep['placement']) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    // Prefer the on-screen portion of tall targets so we don't park the panel
    // below a section that already fills the viewport.
    const visTop = Math.max(rect.top, 16)
    const visBottom = Math.min(rect.top + rect.height, vh - 16)
    const visLeft = Math.max(rect.left, 16)
    const visHeight = Math.max(visBottom - visTop, 0)

    switch (placement) {
        case 'right':
            return {
                top: Math.min(Math.max(rect.top, 16), vh - PANEL_EST_HEIGHT),
                left: Math.min(rect.left + rect.width + GAP, vw - PANEL_WIDTH - 16),
            }
        case 'top':
            return {
                top: Math.max(rect.top - GAP - PANEL_EST_HEIGHT, 16),
                left: Math.min(Math.max(rect.left, 16), vw - PANEL_WIDTH - 16),
            }
        case 'left':
            return {
                top: Math.min(Math.max(rect.top, 16), vh - PANEL_EST_HEIGHT),
                left: Math.max(rect.left - PANEL_WIDTH - GAP, 16),
            }
        case 'bottom':
        default: {
            // Tall targets (e.g. whole training section): sit just under the top of
            // what's visible, not under the entire element.
            const top =
                visHeight > vh * 0.45
                    ? Math.min(visTop + GAP + 48, vh - PANEL_EST_HEIGHT)
                    : Math.min(visBottom + GAP, vh - PANEL_EST_HEIGHT)
            return {
                top: Math.max(top, 16),
                left: Math.min(Math.max(visLeft, 16), vw - PANEL_WIDTH - 16),
            }
        }
    }
}

const StepCoachmark = ({
    step,
    rect,
    stepIndex,
    totalSteps,
    onNext,
    onBack,
    onSkip,
}: {
    step: TourStep
    rect: TargetRect | null
    stepIndex: number
    totalSteps: number
    onNext: () => void
    onBack: () => void
    onSkip: () => void
}) => {
    const reduce = useReducedMotion()

    // Anchored steps must wait for a real rect. Rendering a centered fallback
    // while the next page mounts is what caused the "flash to center" jump.
    const ready = !step.target || rect !== null
    const canGoBack = stepIndex > 0

    const position = useMemo(() => {
        if (!rect) return null
        return computePosition(rect, step.placement)
    }, [rect, step.placement])

    return (
        <AnimatePresence>
            {ready && position && (
                <motion.div
                    key={step.id}
                    className="fixed z-[80]"
                    style={{ width: PANEL_WIDTH }}
                    initial={reduce ? false : { opacity: 0, scale: 0.96, top: position.top, left: position.left }}
                    animate={{ opacity: 1, scale: 1, top: position.top, left: position.left }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                >
                    <div className="relative rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] p-1 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl">
                        <div className="relative rounded-[0.9rem] bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl p-5 overflow-hidden">
                            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />

                            <div className="relative flex items-start justify-between gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <TbSparkles className="h-4 w-4" />
                                </span>
                                <button
                                    onClick={onSkip}
                                    aria-label="Skip tour"
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <TbX className="h-4 w-4" />
                                </button>
                            </div>

                            <h3 className="relative mt-3 text-base font-bold text-gray-900 dark:text-white">
                                {step.title}
                            </h3>
                            <p className="relative mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                {step.body}
                            </p>

                            <div className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                                <motion.div
                                    className="h-full rounded-full bg-primary"
                                    initial={false}
                                    animate={{
                                        width: `${((stepIndex + 1) / Math.max(totalSteps, 1)) * 100}%`,
                                    }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 28 }}
                                />
                            </div>

                            <div className="relative mt-3 flex items-center justify-between gap-3">
                                <span className="shrink-0 text-[11px] font-medium tabular-nums text-gray-400 dark:text-gray-500">
                                    {stepIndex + 1} / {totalSteps}
                                </span>
                                <div className="flex shrink-0 items-center gap-2">
                                    {canGoBack && (
                                        <button
                                            onClick={onBack}
                                            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                        >
                                            <TbArrowLeft className="h-3 w-3" />
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={onSkip}
                                        className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={onNext}
                                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-deep transition-colors"
                                    >
                                        Next
                                        <TbArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default StepCoachmark
