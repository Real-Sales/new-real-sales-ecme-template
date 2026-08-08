import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TbCheck, TbSearch, TbSelector } from 'react-icons/tb'
import Spinner from '@/components/ui/Spinner'
import classNames from '@/utils/classNames'
import type { KeyboardEvent, ReactNode } from 'react'

export type EntityOption = {
    value: string
    label: string
    description?: string
    /** Extra text matched by the search box but not displayed. */
    keywords?: string[]
    /** Secondary content under the label — tag rows, counts, etc. */
    meta?: ReactNode
    /** Trailing affordance rendered inside the row (e.g. a details button). */
    trailing?: ReactNode
    disabled?: boolean
}

export type EntityPickerProps = {
    options: EntityOption[]
    selectedIds: string[]
    /** Called with the row's value. Parent decides toggle vs replace. */
    onSelect: (value: string) => void
    multiple?: boolean
    id?: string
    searchPlaceholder?: string
    /** Render the search box once the list is longer than this. */
    searchThreshold?: number
    loading?: boolean
    disabled?: boolean
    /** Shown in place of the list when `disabled` — say *why* it's disabled. */
    disabledMessage?: ReactNode
    emptyState?: ReactNode
    /** Max list height in px before it scrolls. */
    maxHeight?: number
    invalid?: boolean
    describedBy?: string
    /** Single-select only: collapse to a summary card once something is picked. */
    collapseOnSelect?: boolean
    changeLabel?: string
}

const normalize = (value: string) => value.trim().toLowerCase()

/**
 * Searchable, keyboard-driven selector for rich option rows.
 *
 * Replaces `react-select` menus stuffed with multi-line custom labels: the list
 * lives inline in the form (no portal/overflow issues), rows are real buttons,
 * and ↑/↓ move focus between them from the search box.
 */
const EntityPicker = ({
    options,
    selectedIds,
    onSelect,
    multiple = false,
    id,
    searchPlaceholder = 'Search…',
    searchThreshold = 6,
    loading = false,
    disabled = false,
    disabledMessage,
    emptyState,
    maxHeight = 288,
    invalid = false,
    describedBy,
    collapseOnSelect = true,
    changeLabel = 'Change',
}: EntityPickerProps) => {
    const [query, setQuery] = useState('')
    const [expanded, setExpanded] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const rowRefs = useRef<(HTMLButtonElement | null)[]>([])

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
    const singleSelected = useMemo(
        () =>
            multiple
                ? null
                : (options.find((option) => selectedSet.has(option.value)) ??
                  null),
        [multiple, options, selectedSet],
    )

    // Single-select collapses to a summary once a choice exists; re-opening is
    // explicit so an accidental keystroke can't silently swap the selection.
    const isCollapsed =
        !multiple && collapseOnSelect && Boolean(singleSelected) && !expanded

    useEffect(() => {
        if (singleSelected) return
        setExpanded(false)
    }, [singleSelected])

    const filtered = useMemo(() => {
        const q = normalize(query)
        if (!q) return options
        return options.filter((option) => {
            const haystack = [option.label, option.description, ...(option.keywords ?? [])]
                .filter(Boolean)
                .join(' ')
            return normalize(haystack).includes(q)
        })
    }, [options, query])

    const showSearch = options.length > searchThreshold && !disabled && !loading

    const focusRow = useCallback((index: number) => {
        const rows = rowRefs.current.filter(Boolean)
        if (!rows.length) return
        const next = Math.max(0, Math.min(index, rows.length - 1))
        rows[next]?.focus()
    }, [])

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            focusRow(0)
        }
        if (event.key === 'Escape' && query) {
            event.preventDefault()
            setQuery('')
        }
    }

    const handleRowKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
        index: number,
    ) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            focusRow(index + 1)
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault()
            if (index === 0) {
                inputRef.current?.focus()
                return
            }
            focusRow(index - 1)
        }
        if (event.key === 'Home') {
            event.preventDefault()
            focusRow(0)
        }
        if (event.key === 'End') {
            event.preventDefault()
            focusRow(rowRefs.current.length - 1)
        }
        if (event.key === 'Escape') {
            event.preventDefault()
            inputRef.current?.focus()
        }
    }

    const handleSelect = (option: EntityOption) => {
        if (option.disabled) return
        onSelect(option.value)
        if (!multiple) {
            setExpanded(false)
            setQuery('')
        }
    }

    const openPicker = () => {
        setExpanded(true)
        requestAnimationFrame(() => {
            if (inputRef.current) inputRef.current.focus()
            else focusRow(0)
        })
    }

    if (disabled) {
        return (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-500 dark:border-white/10 dark:bg-gray-800/40 dark:text-gray-400">
                {disabledMessage ?? 'Not available yet.'}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-8 text-xs text-gray-500 dark:border-white/10 dark:bg-gray-800/40 dark:text-gray-400">
                <Spinner size={16} />
                Loading options…
            </div>
        )
    }

    if (!options.length) {
        return (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-800/40">
                {emptyState ?? (
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                        Nothing to choose from yet.
                    </p>
                )}
            </div>
        )
    }

    if (isCollapsed && singleSelected) {
        return (
            <div
                className={classNames(
                    'flex items-start gap-3 rounded-xl border p-3',
                    'border-primary/40 bg-primary/5 dark:bg-primary/10',
                )}
            >
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {singleSelected.label}
                    </p>
                    {singleSelected.description ? (
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                            {singleSelected.description}
                        </p>
                    ) : null}
                    {singleSelected.meta ? (
                        <div className="mt-2">{singleSelected.meta}</div>
                    ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {singleSelected.trailing}
                    <button
                        type="button"
                        className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        onClick={openPicker}
                    >
                        {changeLabel}
                    </button>
                </div>
            </div>
        )
    }

    rowRefs.current = []

    return (
        <div
            className={classNames(
                'overflow-hidden rounded-xl border bg-white dark:bg-gray-800/40',
                invalid
                    ? 'border-red-400 dark:border-red-500/60'
                    : 'border-gray-200 dark:border-white/10',
            )}
        >
            {showSearch ? (
                <div className="relative border-b border-gray-200 dark:border-white/10">
                    <TbSearch
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-400"
                        aria-hidden
                    />
                    <input
                        ref={inputRef}
                        id={id}
                        type="text"
                        value={query}
                        role="searchbox"
                        autoComplete="off"
                        placeholder={searchPlaceholder}
                        aria-describedby={describedBy}
                        className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-100"
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                </div>
            ) : null}

            {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    No matches for &ldquo;{query}&rdquo;
                </p>
            ) : (
                <ul
                    className="divide-y divide-gray-100 overflow-y-auto dark:divide-white/5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/15 [scrollbar-width:thin]"
                    style={{ maxHeight }}
                >
                    {filtered.map((option, index) => {
                        const selected = selectedSet.has(option.value)
                        return (
                            // `trailing` sits beside the row button, never inside
                            // it — nested interactive elements break keyboard use.
                            <li
                                key={option.value}
                                className={classNames(
                                    'flex items-start',
                                    selected && 'bg-primary/5 dark:bg-primary/10',
                                    !option.disabled &&
                                        'hover:bg-gray-50 dark:hover:bg-white/5',
                                )}
                            >
                                <button
                                    ref={(node) => {
                                        rowRefs.current[index] = node
                                    }}
                                    type="button"
                                    aria-pressed={selected}
                                    disabled={option.disabled}
                                    className={classNames(
                                        'flex min-w-0 flex-1 items-start gap-3 px-3 py-2.5 text-left transition-colors',
                                        'focus:outline-none focus-visible:bg-primary/10 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary',
                                        option.disabled &&
                                            'cursor-not-allowed opacity-50',
                                    )}
                                    onClick={() => handleSelect(option)}
                                    onKeyDown={(event) =>
                                        handleRowKeyDown(event, index)
                                    }
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {option.label}
                                        </span>
                                        {option.description ? (
                                            <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                                                {option.description}
                                            </span>
                                        ) : null}
                                        {option.meta ? (
                                            <span className="mt-1.5 block">
                                                {option.meta}
                                            </span>
                                        ) : null}
                                    </span>

                                    <span
                                        className={classNames(
                                            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-all',
                                            multiple ? 'rounded' : 'rounded-full',
                                            selected
                                                ? 'border-primary bg-primary text-neutral'
                                                : 'border-gray-300 dark:border-white/20',
                                        )}
                                        aria-hidden
                                    >
                                        {selected ? (
                                            <TbCheck className="text-[11px]" />
                                        ) : null}
                                    </span>
                                </button>

                                {option.trailing ? (
                                    <span className="shrink-0 self-center pr-2">
                                        {option.trailing}
                                    </span>
                                ) : null}
                            </li>
                        )
                    })}
                </ul>
            )}

            {!multiple && singleSelected && expanded ? (
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1.5 border-t border-gray-200 py-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900 dark:border-white/10 dark:text-gray-400 dark:hover:text-white"
                    onClick={() => setExpanded(false)}
                >
                    <TbSelector className="text-sm" aria-hidden />
                    Keep {singleSelected.label}
                </button>
            ) : null}
        </div>
    )
}

export default EntityPicker
