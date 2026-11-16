import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TbSparkles, TbArrowRight, TbArrowLeft, TbX } from 'react-icons/tb'
import type { TargetRect } from './useSpotlightTarget'
import type { TourStep } from './steps'

const GAP = 16
const PANEL_WIDTH = 320
/** Fallback until the panel has been measured — long copy needs ~280–320px. */
const PANEL_EST_HEIGHT = 300
const EDGE = 16

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

/**
 * Prefer the requested placement, but flip or park the panel so the full card
 * (including Skip / Next) stays inside the viewport.
 */
const computePosition = (
    rect: TargetRect,
    placement: TourStep['placement'],
    panelHeight: number,
) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const h = Math.max(panelHeight, PANEL_EST_HEIGHT)
    const maxTop = Math.max(EDGE, vh - h - EDGE)
    const maxLeft = Math.max(EDGE, vw - PANEL_WIDTH - EDGE)

    const visTop = Math.max(rect.top, EDGE)
    const visBottom = Math.min(rect.top + rect.height, vh - EDGE)
    const visLeft = Math.max(rect.left, EDGE)
    const visHeight = Math.max(visBottom - visTop, 0)
    const midTop = clamp(rect.top + rect.height / 2 - h / 2, EDGE, maxTop)

    const placeBottom = () => {
        const below = visBottom + GAP
        if (below <= maxTop) {
            return { top: below, left: clamp(visLeft, EDGE, maxLeft) }
        }
        // Not enough room below — try above the target.
        const above = visTop - GAP - h
        if (above >= EDGE) {
            return { top: above, left: clamp(visLeft, EDGE, maxLeft) }
        }
        // Target fills the viewport — park fully on-screen near the bottom.
        return { top: maxTop, left: clamp(visLeft, EDGE, maxLeft) }
    }

    const placeTop = () => {
        const above = visTop - GAP - h
        if (above >= EDGE) {
            return { top: above, left: clamp(visLeft, EDGE, maxLeft) }
        }
        return placeBottom()
    }

    switch (placement) {
        case 'right': {
            const left = rect.left + rect.width + GAP
            if (left <= maxLeft) {
                return { top: midTop, left }
            }
            const leftSide = rect.left - PANEL_WIDTH - GAP
            if (leftSide >= EDGE) {
                return { top: midTop, left: leftSide }
            }
            return { top: midTop, left: maxLeft }
        }
        case 'left': {
            const left = rect.left - PANEL_WIDTH - GAP
            if (left >= EDGE) {
                return { top: midTop, left }
            }
            const rightSide = rect.left + rect.width + GAP
            if (rightSide <= maxLeft) {
                return { top: midTop, left: rightSide }
            }
            return { top: midTop, left: EDGE }
        }
        case 'top':
            return placeTop()
        case 'bottom':
        default: {
            // Tall targets: don't sit under the whole block — prefer under the
            // visible top, then clamp / flip so buttons stay on screen.
            if (visHeight > vh * 0.45) {
                const nearTop = visTop + GAP + 48
                if (nearTop <= maxTop) {
                    return { top: nearTop, left: clamp(visLeft, EDGE, maxLeft) }
                }
                return placeTop()
            }
            return placeBottom()
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
    const panelRef = useRef<HTMLDivElement>(null)
    const [panelHeight, setPanelHeight] = useState(PANEL_EST_HEIGHT)

    // Anchored steps must wait for a real rect. Rendering a centered fallback
    // while the next page mounts is what caused the "flash to center" jump.
    const ready = !step.target || rect !== null
    const canGoBack = stepIndex > 0

    useLayoutEffect(() => {
        const el = panelRef.current
        if (!el) return
        const measure = () => {
            const next = el.getBoundingClientRect().height
            if (next > 0) setPanelHeight(next)
        }
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [step.id, ready, rect])

    const position = useMemo(() => {
        if (!rect) return null
        return computePosition(rect, step.placement, panelHeight)
    }, [rect, step.placement, panelHeight])

    // Re-clamp after layout if the measured height changed mid-animation.
    useEffect(() => {
        if (!rect || !panelRef.current) return
        const measured = panelRef.current.getBoundingClientRect().height
        if (measured > 0 && Math.abs(measured - panelHeight) > 2) {
            setPanelHeight(measured)
        }
    }, [rect, panelHeight, step.id])

    return (
        <AnimatePresence>
            {ready && position && (
                <motion.div
                    key={step.id}
                    ref={panelRef}
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
