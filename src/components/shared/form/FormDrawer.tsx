import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import classNames from '@/utils/classNames'
import type { ReactNode } from 'react'

/**
 * Viewport-aware drawer width. `Drawer` writes the width into an inline style
 * and builds its slide-in offset from a number, so a responsive value has to be
 * resolved here rather than with a CSS class.
 */
const useDrawerWidth = (preferred: number) => {
    const getWidth = useCallback(() => {
        if (typeof window === 'undefined') return preferred
        return Math.min(preferred, window.innerWidth)
    }, [preferred])

    const [width, setWidth] = useState(getWidth)

    useEffect(() => {
        const onResize = () => setWidth(getWidth())
        window.addEventListener('resize', onResize)
        onResize()
        return () => window.removeEventListener('resize', onResize)
    }, [getWidth])

    return width
}

export type FormDrawerProps = {
    isOpen: boolean
    title: string
    /** One line under the title. Keep it about *what happens*, not decoration. */
    description?: ReactNode
    /** Rich block rendered under the title — identity rows, step rails, etc. */
    headerSlot?: ReactNode
    /** Left side of the footer: change counts, validation summary, hints. */
    footerSlot?: ReactNode
    /** Required unless `hideFooter` is set. */
    submitLabel?: string
    cancelLabel?: string
    submitDisabled?: boolean
    submitting?: boolean
    /** Optional middle action — e.g. "Continue" next to "Save changes". */
    secondaryAction?: { label: string; onClick: () => void; disabled?: boolean }
    /** Enables the discard-changes guard on Esc / backdrop / Cancel / close. */
    isDirty?: boolean
    discardTitle?: string
    discardMessage?: ReactNode
    width?: number
    /** Hides the footer entirely (read-only drawers). */
    hideFooter?: boolean
    onSubmit?: () => void
    onClose: () => void
    children: ReactNode
}

/**
 * Shared shell for every editing drawer: sticky header + footer, a scrollable
 * body, an unsaved-changes guard, and ⌘/Ctrl+Enter to submit.
 */
const FormDrawer = ({
    isOpen,
    title,
    description,
    headerSlot,
    footerSlot,
    submitLabel,
    cancelLabel = 'Cancel',
    submitDisabled = false,
    submitting = false,
    secondaryAction,
    isDirty = false,
    discardTitle = 'Discard changes?',
    discardMessage = 'Your edits will be lost. This cannot be undone.',
    width = 520,
    hideFooter = false,
    onSubmit,
    onClose,
    children,
}: FormDrawerProps) => {
    const titleId = useId()
    const descriptionId = useId()
    const drawerWidth = useDrawerWidth(width)
    const [discardOpen, setDiscardOpen] = useState(false)
    const restoreFocusRef = useRef<HTMLElement | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    const requestClose = useCallback(() => {
        if (submitting) return
        if (isDirty) {
            setDiscardOpen(true)
            return
        }
        onClose()
    }, [isDirty, submitting, onClose])

    const confirmDiscard = useCallback(() => {
        setDiscardOpen(false)
        onClose()
    }, [onClose])

    // Remember the trigger so focus returns to it when the drawer unmounts.
    useEffect(() => {
        if (isOpen) {
            restoreFocusRef.current = document.activeElement as HTMLElement
            return
        }
        const target = restoreFocusRef.current
        restoreFocusRef.current = null
        if (target && document.contains(target)) {
            target.focus({ preventScroll: true })
        }
    }, [isOpen])

    // Focus the field the form marks as its entry point. Opt-in only — blanket
    // autofocus inside a drawer steals focus from nested popovers.
    useEffect(() => {
        if (!isOpen) return
        const frame = requestAnimationFrame(() => {
            const target = bodyRef.current?.querySelector<HTMLElement>(
                '[data-autofocus]',
            )
            target?.focus({ preventScroll: true })
        })
        return () => cancelAnimationFrame(frame)
    }, [isOpen])

    // ⌘/Ctrl + Enter submits from anywhere in the drawer, including textareas.
    useEffect(() => {
        if (!isOpen || hideFooter) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return
            if (submitDisabled || submitting || !onSubmit) return
            event.preventDefault()
            onSubmit()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, hideFooter, submitDisabled, submitting, onSubmit])

    const header = (
        <div className="min-w-0 flex-1">
            <h2
                id={titleId}
                className="text-base font-semibold text-gray-900 dark:text-white"
            >
                {title}
            </h2>
            {description ? (
                <p
                    id={descriptionId}
                    className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                >
                    {description}
                </p>
            ) : null}
            {headerSlot ? <div className="mt-4">{headerSlot}</div> : null}
        </div>
    )

    const footer = hideFooter ? undefined : (
        <div className="flex w-full items-center justify-between gap-4">
            <div className="min-w-0 flex-1 text-xs text-gray-500 dark:text-gray-400">
                {footerSlot}
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Button
                    size="sm"
                    variant="plain"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    disabled={submitting}
                    onClick={requestClose}
                >
                    {cancelLabel}
                </Button>
                {secondaryAction ? (
                    <Button
                        size="sm"
                        variant="default"
                        disabled={secondaryAction.disabled || submitting}
                        onClick={secondaryAction.onClick}
                    >
                        {secondaryAction.label}
                    </Button>
                ) : null}
                <Button
                    size="sm"
                    variant="solid"
                    className="border-none bg-primary text-neutral hover:bg-primary-deep"
                    loading={submitting}
                    disabled={submitDisabled || submitting}
                    onClick={onSubmit}
                >
                    {submitLabel}
                </Button>
            </div>
        </div>
    )

    return (
        <>
            <Drawer
                isOpen={isOpen}
                title={header}
                footer={footer}
                width={drawerWidth}
                aria={{
                    labelledby: titleId,
                    describedby: description ? descriptionId : undefined,
                }}
                headerClass="!items-start !gap-4 !px-6 !py-5 !bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-white/10"
                footerClass="!px-6 !py-4 !bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-white/10"
                bodyClass={classNames(
                    '!px-6 !py-6 !bg-gray-50 dark:!bg-gray-900',
                    // A visible (but quiet) scrollbar — hiding it hides the fact
                    // that these forms continue below the fold.
                    '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/15 [scrollbar-width:thin]',
                )}
                onClose={requestClose}
                onRequestClose={requestClose}
            >
                <div ref={bodyRef}>{children}</div>
            </Drawer>

            <ConfirmDialog
                isOpen={discardOpen}
                type="warning"
                title={discardTitle}
                confirmText="Discard"
                cancelText="Keep editing"
                onClose={() => setDiscardOpen(false)}
                onRequestClose={() => setDiscardOpen(false)}
                onCancel={() => setDiscardOpen(false)}
                onConfirm={confirmDiscard}
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {discardMessage}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default FormDrawer
