import RollingCount from '@/components/reactbits/CountUp'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import classNames from '@/utils/classNames'

/** Standard easing curves used across the Overview page (Emil Kowalski: never use built-in ease-in for UI). */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
export const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1]

/**
 * Fade + rise entrance, once per element, respects prefers-reduced-motion.
 * This is the single reveal primitive every section below composes with.
 */
export const Reveal = ({
    children,
    delay = 0,
    y = 22,
    className,
    as: Tag = 'div',
}: {
    children: ReactNode
    delay?: number
    y?: number
    className?: string
    as?: 'div' | 'section'
}) => {
    const reduce = useReducedMotion()
    const MotionTag = Tag === 'section' ? motion.section : motion.div
    return (
        <MotionTag
            className={className}
            initial={reduce ? false : { opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay, ease: EASE_OUT }}
        >
            {children}
        </MotionTag>
    )
}

/** Parent/child stagger pair for grids of cards. Use with <StaggerItem> children. */
export const StaggerGroup = ({
    children,
    className,
    gap = 0.08,
}: {
    children: ReactNode
    className?: string
    gap?: number
}) => {
    const reduce = useReducedMotion()
    return (
        <motion.div
            className={className}
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
                hidden: {},
                show: { transition: { staggerChildren: gap } },
            }}
        >
            {children}
        </motion.div>
    )
}

export const StaggerItem = ({
    children,
    className,
    y = 18,
}: {
    children: ReactNode
    className?: string
    y?: number
}) => (
    <motion.div
        className={className}
        variants={{
            hidden: { opacity: 0, y },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
        }}
    >
        {children}
    </motion.div>
)

/**
 * Double-bezel glass surface: outer tinted shell + inner core.
 * Used for every elevated panel so cards read as one consistent material.
 */
export const GlassPanel = ({
    children,
    className,
    innerClassName,
    padding = 'p-1.5',
}: {
    children: ReactNode
    className?: string
    innerClassName?: string
    padding?: string
}) => (
    <div
        className={classNames(
            'relative rounded-[1.75rem] bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/5 dark:ring-white/10',
            padding,
            className,
        )}
    >
        <div
            className={classNames(
                'relative rounded-[1.4rem] bg-white dark:bg-gray-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden',
                innerClassName,
            )}
        >
            {children}
        </div>
    </div>
)

/** Section eyebrow + heading. Pass showEyebrow sparingly (at most every other section). */
export const SectionHeading = ({
    eyebrow,
    heading,
    description,
    align = 'left',
    className,
}: {
    eyebrow?: string
    heading: string
    description?: string
    align?: 'left' | 'center'
    className?: string
}) => (
    <div className={classNames(align === 'center' ? 'text-center mx-auto' : '', className)}>
        {eyebrow && (
            <span className="inline-flex items-center rounded-full px-3 py-1 mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary bg-primary/10 ring-1 ring-primary/20">
                {eyebrow}
            </span>
        )}
        <h2 className="text-2xl md:text-[2rem] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
            {heading}
        </h2>
        {description && (
            <p
                className={classNames(
                    'mt-3 text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed',
                    align === 'center' ? 'max-w-xl mx-auto' : 'max-w-xl',
                )}
            >
                {description}
            </p>
        )}
    </div>
)

/** Animated count-up. Starts when scrolled into view, never on keyboard/rapid re-renders. */
export const CountUp = ({
    value,
    decimals = 0,
    suffix = '',
    prefix = '',
    duration = 1.1,
    className,
}: {
    value: number
    decimals?: number
    suffix?: string
    prefix?: string
    duration?: number
    className?: string
}) => {
    return (
        <RollingCount
            to={value}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
            duration={duration}
            mode="roll"
            className={classNames('tabular-nums', className)}
        />
    )
}

/** Small live-pulse indicator, e.g. "Live" badge. Motion is decorative and subtle. */
export const LivePulse = ({ label = 'Live' }: { label?: string }) => (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary">
        <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        {label}
    </span>
)

export const formatRelativeDate = (iso?: string | null): string => {
    if (!iso) return 'Recently'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return 'Recently'
    const diffMs = Date.now() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    const weeks = Math.floor(diffDays / 7)
    if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value))
