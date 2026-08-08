import { TbCheck } from 'react-icons/tb'
import classNames from '@/utils/classNames'
import type { ReactNode } from 'react'

export type OptionCardProps = {
    /** `radio` for one-of-many, `checkbox` for many-of-many. */
    type?: 'radio' | 'checkbox'
    /** Radio group name — required so arrow keys move within the group. */
    name?: string
    value: string
    title: ReactNode
    description?: ReactNode
    icon?: ReactNode
    /** Trailing badge — mode order, counts, "Recommended", etc. */
    badge?: ReactNode
    selected: boolean
    disabled?: boolean
    className?: string
    onSelect: (value: string) => void
}

/**
 * A selectable card backed by a real radio/checkbox input, so keyboard and
 * screen-reader behaviour comes for free — unlike styled `<button>` chips.
 */
const OptionCard = ({
    type = 'radio',
    name,
    value,
    title,
    description,
    icon,
    badge,
    selected,
    disabled = false,
    className,
    onSelect,
}: OptionCardProps) => (
    <label
        className={classNames(
            'group relative block',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            className,
        )}
    >
        <input
            type={type}
            name={name}
            value={value}
            checked={selected}
            disabled={disabled}
            className="peer sr-only"
            onChange={() => onSelect(value)}
        />
        <div
            className={classNames(
                'flex h-full items-start gap-3 rounded-xl border p-3 transition-all duration-150',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-gray-50 dark:peer-focus-visible:ring-offset-gray-900',
                selected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800/40',
                !selected && !disabled && 'hover:border-gray-300 dark:hover:border-white/20',
            )}
        >
            {icon ? (
                <span
                    className={classNames(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition-colors',
                        selected
                            ? 'bg-primary/15 text-primary'
                            : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
                    )}
                    aria-hidden
                >
                    {icon}
                </span>
            ) : null}

            <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {title}
                    </span>
                    {badge}
                </span>
                {description ? (
                    <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {description}
                    </span>
                ) : null}
            </span>

            <span
                className={classNames(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-all',
                    type === 'radio' ? 'rounded-full' : 'rounded',
                    selected
                        ? 'border-primary bg-primary text-neutral'
                        : 'border-gray-300 dark:border-white/20',
                )}
                aria-hidden
            >
                {selected ? <TbCheck className="text-[11px]" /> : null}
            </span>
        </div>
    </label>
)

export type OptionCardGroupProps = {
    label?: string
    columns?: 1 | 2
    className?: string
    children: ReactNode
}

/** Grid wrapper that gives a set of `OptionCard`s a shared radiogroup role. */
export const OptionCardGroup = ({
    label,
    columns = 1,
    className,
    children,
}: OptionCardGroupProps) => (
    <div
        role="group"
        aria-label={label}
        className={classNames(
            'grid gap-2',
            columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
            className,
        )}
    >
        {children}
    </div>
)

export default OptionCard
