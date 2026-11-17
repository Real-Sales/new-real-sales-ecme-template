import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
    type CSSProperties,
    type RefObject,
} from 'react'
import { motion, useInView, useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion'
import type { LandingTheme } from '../landingTheme'
import DiaTextReveal from './DiaTextReveal'
import ShinyText from '@/components/reactbits/ShinyText'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Shared spring tuning for scroll-linked parallax. Soft + slightly heavy so
 * the drift trails the scroll position smoothly instead of tracking it 1:1
 * (which reads as mechanical, especially over Lenis smooth-scroll). */
export const PARALLAX_SPRING = {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
} as const

/** Default drift for phone-only parallax blocks. */
export const MOBILE_PARALLAX = 90
/** Phones: drift distances are kept within this range. Cards stack in one column there, and neighbours whose
 * distances differ by more than about a third would slide over each other; within this range they still
 * move at visibly different speeds (like the desktop layout) but the gaps never close. */
const MOBILE_MIN_DRIFT = 70
const MOBILE_MAX_DRIFT = 100

/** True below the `md` breakpoint. */
export function useIsNarrow() {
    const [narrow, setNarrow] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
    )
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)')
        const onChange = () => setNarrow(mq.matches)
        onChange()
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])
    return narrow
}

/* ---------------------------------------------------------------------------------------------------------
 * Shared parallax loop.
 * Every parallax element registers here. Positions come from offsetTop/offsetHeight (layout values that
 * ignore transforms), measured once and again only when the page is resized or changes height. On each
 * frame the loop reads the scroll position once and sets every element's offset, so scrolling never forces
 * a layout. Works the same scrolling down or up: the offset is a pure function of the scroll position.
 * ------------------------------------------------------------------------------------------------------- */
type ParallaxEntry = {
    el: HTMLElement
    y: MotionValue<number>
    cfg: { current: { distance: number; narrow: boolean } }
    top: number
    height: number
    current: number
}

const parallaxEntries = new Set<ParallaxEntry>()
let parallaxFrame = 0
let parallaxBound = false

function measureEntry(entry: ParallaxEntry) {
    let top = 0
    let node: HTMLElement | null = entry.el
    while (node) {
        top += node.offsetTop
        node = node.offsetParent as HTMLElement | null
    }
    entry.top = top
    entry.height = entry.el.offsetHeight
}

function measureAllEntries() {
    parallaxEntries.forEach(measureEntry)
    scheduleParallax()
}

function parallaxTick() {
    parallaxFrame = 0
    const scrollY = window.scrollY
    const viewport = window.innerHeight
    const now = performance.now()
    // Time-based glide so it feels the same at any frame rate (~0.15 per frame at 60fps)
    const glide = 1 - Math.exp(-Math.min(0.1, (now - lastTickTime) / 1000) * 10)
    lastTickTime = now
    let settling = false
    parallaxEntries.forEach((entry) => {
        const { distance, narrow } = entry.cfg.current
        const drift = narrow
            ? Math.sign(distance || 1) * Math.min(MOBILE_MAX_DRIFT, Math.max(MOBILE_MIN_DRIFT, Math.abs(distance)))
            : distance
        // 0 when the element's top reaches the bottom of the screen, 1 when its bottom leaves the top
        const progress = Math.min(1, Math.max(0, (scrollY + viewport - entry.top) / (viewport + entry.height)))
        const target = drift * (1 - 2 * progress)
        // Glide toward the target for a soft, trailing feel (desktop and phones)
        entry.current += (target - entry.current) * glide
        if (Math.abs(target - entry.current) > 0.1) settling = true
        else entry.current = target
        if (entry.y.get() !== entry.current) entry.y.set(entry.current)
    })
    if (settling) scheduleParallax()
}

let lastTickTime = 0

function scheduleParallax() {
    if (parallaxFrame) return
    if (!lastTickTime || performance.now() - lastTickTime > 100) lastTickTime = performance.now() - 16
    parallaxFrame = requestAnimationFrame(parallaxTick)
}

function bindParallax() {
    if (parallaxBound) return
    parallaxBound = true
    window.addEventListener('scroll', scheduleParallax, { passive: true })
    window.addEventListener('resize', measureAllEntries)
    new ResizeObserver(() => measureAllEntries()).observe(document.body)
}

/** Scroll-linked parallax offset for `ref`: `distance` px below its place as it enters at the bottom of the
 * screen, `-distance` px above as it leaves at the top. Phones use MOBILE_PARALLAX for every element. */
export function useParallaxY(ref: RefObject<HTMLElement | null>, distance: number) {
    const y = useMotionValue(0)
    const narrow = useIsNarrow()
    const cfg = useRef({ distance, narrow })
    cfg.current = { distance, narrow }

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        const entry: ParallaxEntry = { el, y, cfg, top: 0, height: 0, current: 0 }
        bindParallax()
        measureEntry(entry)
        parallaxEntries.add(entry)
        scheduleParallax()
        return () => {
            parallaxEntries.delete(entry)
        }
    }, [ref, y])

    useEffect(() => {
        scheduleParallax()
    }, [narrow, distance])

    return y
}

/** Wrapper that drifts with the shared parallax loop. */
export function ParallaxBlock({
    children,
    className,
    distance = MOBILE_PARALLAX,
    enabled = true,
}: {
    children: ReactNode
    className?: string
    distance?: number
    enabled?: boolean
}) {
    const ref = useRef<HTMLDivElement>(null)
    const shouldReduceMotion = useReducedMotion()
    const y = useParallaxY(ref, distance)
    return (
        <motion.div
            ref={ref}
            className={className}
            style={enabled && !shouldReduceMotion ? { y, willChange: 'transform' } : undefined}
        >
            {children}
        </motion.div>
    )
}

/** Scroll-linked parallax `y`. Attach the returned `ref` to the element you want to track, then spread
 * `style={{ y }}` onto the moving node. Returns `undefined` for `y` when the user prefers reduced motion. */
export function useSmoothParallax(distance = 60) {
    const ref = useRef<HTMLDivElement>(null)
    const shouldReduceMotion = useReducedMotion()
    const y = useParallaxY(ref, distance)
    return { ref, y: shouldReduceMotion ? undefined : y, shouldReduceMotion }
}

/** Shared reveal timing — badge → heading → description cascade.
 * `DiaTextReveal` finishes visually revealing the text at ~87% of its duration
 * (the gradient band trails off-screen for the remaining 13%), so the description
 * starts right when the heading is *visually* complete — not when its animation
 * timeline technically ends. */
const HEADING_VISIBLE_FRACTION = 0.87

export const SECTION_REVEAL = {
    badgeDelay: 0.25,
    badgeDuration: 1.0,
    headingDelay: 0.65,
    headingDuration: 1.6,
    descDuration: 1.4,
} as const

/** Compute the description's start delay so it begins the moment the heading
 * is *visually* complete (regardless of the heading's exact duration). */
export const getDescDelay = (
    headingDuration: number = SECTION_REVEAL.headingDuration,
    headingDelay: number = SECTION_REVEAL.headingDelay,
) => headingDelay + headingDuration * HEADING_VISIBLE_FRACTION

export function getRevealColors(t: LandingTheme) {
    return [t.accent, '#FFFFFF', t.accentMild, t.text, t.accentDeep] as const
}

/** Scroll-linked parallax + fade reveal for cards.
 * Applies a continuous `y` drift tied to scroll position (parallax) plus a
 * one-time opacity fade-in. Keep hover transforms on a child element so they
 * don't fight the parallax transform on this wrapper. */
export function ParallaxReveal({
    children,
    className,
    style,
    distance = 60,
    delay = 0,
}: {
    children: ReactNode
    className?: string
    style?: CSSProperties
    distance?: number
    delay?: number
}) {
    const ref = useRef<HTMLDivElement>(null)
    const shouldReduceMotion = useReducedMotion()
    const isInView = useInView(ref, { once: true, margin: '-60px' })
    const y = useParallaxY(ref, distance)
    const motionStyle = { y, willChange: 'transform' }

    return (
        <motion.div
            ref={ref}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{
                duration: shouldReduceMotion ? 0.01 : 0.6,
                delay: shouldReduceMotion ? 0 : delay,
                ease: EASE_OUT,
            }}
            style={shouldReduceMotion ? style : { ...style, ...motionStyle }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function SectionBadge({ t, label }: { t: LandingTheme; label: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.6 })
    const shouldReduceMotion = useReducedMotion()

    return (
        <motion.div
            ref={ref}
            initial={{ x: -24, opacity: 0, scale: 0.9 }}
            animate={isInView ? { x: 0, opacity: 1, scale: 1 } : {}}
            transition={{
                duration: SECTION_REVEAL.badgeDuration,
                delay: SECTION_REVEAL.badgeDelay,
                ease: EASE_OUT,
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{
                border: `1px solid ${t.border}`,
                backgroundColor: t.surface,
            }}
        >
            <span className="relative flex h-1.5 w-1.5">
                {!shouldReduceMotion && (
                    <span
                        className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
                        style={{ backgroundColor: t.accent }}
                    />
                )}
                <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: t.accent }}
                />
            </span>
            <ShinyText
                text={label}
                color={t.textMuted}
                shineColor={t.text}
                speed={3}
                delay={1.5}
                className="text-xs font-medium tracking-wide"
            />
        </motion.div>
    )
}

export function SectionHeading({
    t,
    text,
    className,
    duration = SECTION_REVEAL.headingDuration,
    delay = SECTION_REVEAL.headingDelay,
}: {
    t: LandingTheme
    text: string
    className?: string
    duration?: number
    delay?: number
}) {
    return (
        <h2 className={className}>
            <DiaTextReveal
                text={text}
                textColor={t.text}
                colors={[...getRevealColors(t)]}
                duration={duration}
                delay={delay}
            />
        </h2>
    )
}

export function SectionDesc({
    t,
    text,
    children,
    className,
    style,
    duration = SECTION_REVEAL.descDuration,
    delay = getDescDelay(),
}: {
    t: LandingTheme
    text: string
    children?: ReactNode
    className?: string
    style?: CSSProperties
    duration?: number
    delay?: number
}) {
    return (
        <p className={className} style={{ color: t.textFaint, ...style }}>
            <DiaTextReveal
                text={text}
                textColor={t.textFaint}
                colors={[...getRevealColors(t)]}
                duration={duration}
                delay={delay}
            />
            {children}
        </p>
    )
}

/** @deprecated use <SectionBadge t={t} label="..." /> */
export function sectionBadge(t: LandingTheme, label: string) {
    return <SectionBadge t={t} label={label} />
}
