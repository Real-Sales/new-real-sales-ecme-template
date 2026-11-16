import { useRef, type ReactNode, type CSSProperties } from 'react'
import {
    motion,
    useInView,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion'
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

/** Scroll-linked, spring-smoothed parallax `y`. Attach the returned `ref` to the
 * element you want to track, then spread `style={{ y }}` onto the moving node.
 * Returns `undefined` for `y` when the user prefers reduced motion. */
export function useSmoothParallax(distance = 60) {
    const ref = useRef<HTMLDivElement>(null)
    const shouldReduceMotion = useReducedMotion()
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    })
    const yRaw = useTransform(scrollYProgress, [0, 1], [distance, -distance])
    const y = useSpring(yRaw, PARALLAX_SPRING)

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
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    })
    const yRaw = useTransform(scrollYProgress, [0, 1], [distance, -distance])
    const y = useSpring(yRaw, PARALLAX_SPRING)

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
            style={shouldReduceMotion ? style : { ...style, y }}
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
