import { useEffect, useState, useCallback } from 'react'

export interface TargetRect {
    top: number
    left: number
    width: number
    height: number
}

const MIN_VISIBLE_SIZE = 8

/**
 * Returns null for elements that are effectively not on screen (collapsed nav
 * variant, display:none, not yet laid out). Spotlighting a near-zero-size
 * rect would dim the *entire* viewport around an invisible cutout - worse
 * than not spotlighting at all.
 */
const measure = (el: Element): TargetRect | null => {
    const r = el.getBoundingClientRect()
    if (r.width < MIN_VISIBLE_SIZE || r.height < MIN_VISIBLE_SIZE) return null
    return { top: r.top, left: r.left, width: r.width, height: r.height }
}

/**
 * Tracks the viewport-relative bounding box of a `[data-tour-id="…"]` element so
 * the spotlight overlay can follow it through layout shifts, scroll, and resize.
 * Also performs the "camera pan" - a smooth scroll bringing the target into view
 * the moment a step becomes active.
 *
 * On selector change the previous rect is cleared immediately so the coachmark
 * never paints at a stale (or centered-fallback) position while the next page
 * is still mounting.
 */
export const useSpotlightTarget = (selector: string | null) => {
    const [rect, setRect] = useState<TargetRect | null>(null)
    const [element, setElement] = useState<Element | null>(null)

    const recalc = useCallback(() => {
        if (!selector) {
            setRect(null)
            setElement(null)
            return false
        }
        const el = document.querySelector(selector)
        if (el) {
            const next = measure(el)
            setRect(next)
            setElement(el)
            return next !== null
        }
        setRect(null)
        setElement(null)
        return false
    }, [selector])

    useEffect(() => {
        // Drop the previous step's rect on the same tick the selector changes.
        setRect(null)
        setElement(null)

        if (!selector) return

        let settled = false
        let ticking = false
        let ro: ResizeObserver | null = null

        const observe = (el: Element) => {
            ro?.disconnect()
            ro = new ResizeObserver(onScrollOrResize)
            ro.observe(el)
        }

        const tryFind = () => {
            const found = recalc()
            if (found) {
                const el = document.querySelector(selector)
                if (el) observe(el)
                settled = true
            }
            return found
        }

        const onScrollOrResize = () => {
            if (ticking) return
            ticking = true
            requestAnimationFrame(() => {
                recalc()
                ticking = false
            })
        }

        tryFind()

        window.addEventListener('resize', onScrollOrResize, { passive: true })
        window.addEventListener('scroll', onScrollOrResize, {
            passive: true,
            capture: true,
        })

        // Catch lazy route mounts as soon as the node appears in the DOM.
        const mo = new MutationObserver(() => {
            if (settled) return
            tryFind()
        })
        mo.observe(document.body, { childList: true, subtree: true })

        // Fast poll as a backup for layout that mounts without a mutation burst.
        let attempts = 0
        const settleInterval = window.setInterval(() => {
            attempts += 1
            if (tryFind() || attempts > 40) {
                window.clearInterval(settleInterval)
            }
        }, 50)

        return () => {
            window.removeEventListener('resize', onScrollOrResize)
            window.removeEventListener('scroll', onScrollOrResize, true)
            mo.disconnect()
            ro?.disconnect()
            window.clearInterval(settleInterval)
        }
    }, [selector, recalc])

    const panToTarget = useCallback(() => {
        if (!selector) return
        const el = document.querySelector(selector)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }, [selector])

    return { rect, element, panToTarget, recalc }
}
