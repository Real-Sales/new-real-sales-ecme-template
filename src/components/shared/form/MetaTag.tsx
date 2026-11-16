import classNames from '@/utils/classNames'
import type { ReactNode } from 'react'

export type MetaTagTone = 'segment' | 'product' | 'neutral' | 'primary'

/**
 * `solid` — the original filled pills.
 * `quiet` — monochrome, so colour is reserved for state (selected, primary)
 * instead of being spent on every piece of metadata.
 */
export type MetaTagVariant = 'solid' | 'quiet'

const SOLID_TONE: Record<MetaTagTone, string> = {
    segment:
        'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    product: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-mild',
    primary: 'bg-primary text-neutral',
    neutral: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
}

const QUIET_TONE: Record<MetaTagTone, string> = {
    // The segment is the one piece of metadata worth a weight step.
    segment: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200',
    product:
        'border border-gray-200 text-gray-500 dark:border-white/15 dark:text-gray-400',
    primary: 'border border-primary/50 text-primary',
    neutral:
        'border border-gray-200 text-gray-500 dark:border-white/15 dark:text-gray-400',
}

export type MetaTagProps = {
    tone?: MetaTagTone
    variant?: MetaTagVariant
    className?: string
    children: ReactNode
}

/**
 * Small labelled chip for entity metadata (segment, products, roles).
 * Centralised because the same markup was previously duplicated across every
 * drawer, card and select option — at three different font sizes.
 */
export const MetaTag = ({
    tone = 'neutral',
    variant = 'solid',
    className,
    children,
}: MetaTagProps) => (
    <span
        className={classNames(
            'inline-flex max-w-full items-center truncate px-2 py-0.5 text-[11px] font-medium leading-4',
            variant === 'quiet' ? 'rounded-md' : 'rounded-full',
            variant === 'quiet' ? QUIET_TONE[tone] : SOLID_TONE[tone],
            className,
        )}
    >
        {children}
    </span>
)

export type MetaTagListProps = {
    items: string[]
    tone?: MetaTagTone
    variant?: MetaTagVariant
    /** Renders when `items` is empty — say what "nothing" means. */
    emptyLabel?: string
    /** Collapse the overflow into a "+n" chip. */
    max?: number
    className?: string
}

export const MetaTagList = ({
    items,
    tone = 'product',
    variant = 'solid',
    emptyLabel,
    max,
    className,
}: MetaTagListProps) => {
    if (!items.length) {
        return emptyLabel ? (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {emptyLabel}
            </span>
        ) : null
    }

    const visible = max ? items.slice(0, max) : items
    const overflow = items.length - visible.length

    return (
        <span className={classNames('flex flex-wrap items-center gap-1', className)}>
            {visible.map((item) => (
                <MetaTag key={item} tone={tone} variant={variant}>
                    {item}
                </MetaTag>
            ))}
            {overflow > 0 ? (
                <MetaTag tone="neutral" variant={variant}>
                    +{overflow}
                </MetaTag>
            ) : null}
        </span>
    )
}

export default MetaTag
