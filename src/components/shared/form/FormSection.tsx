import { useId } from 'react'
import classNames from '@/utils/classNames'
import type { ReactNode } from 'react'

export type FormSectionProps = {
    title: string
    description?: ReactNode
    /** Right-aligned control in the section header (links, counters, toggles). */
    action?: ReactNode
    /** Adds a top divider — use on every section after the first. */
    divided?: boolean
    className?: string
    children: ReactNode
}

/** A labelled group of fields. Grouping is what keeps long forms scannable. */
const FormSection = ({
    title,
    description,
    action,
    divided = false,
    className,
    children,
}: FormSectionProps) => {
    const headingId = useId()

    return (
        <section
            aria-labelledby={headingId}
            className={classNames(
                divided &&
                    'border-t border-gray-200 pt-6 dark:border-white/10',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3
                        id={headingId}
                        className="text-[13px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                        {title}
                    </h3>
                    {description ? (
                        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    ) : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </div>
            <div className="mt-4 space-y-5">{children}</div>
        </section>
    )
}

export default FormSection
