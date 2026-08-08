import { useId } from 'react'
import { TbAlertCircle } from 'react-icons/tb'
import classNames from '@/utils/classNames'
import type { ReactNode } from 'react'

export type FieldRenderProps = {
    /** Wire onto the control so the label and error stay associated. */
    id: string
    'aria-describedby'?: string
    'aria-invalid'?: boolean
}

export type FieldProps = {
    label: string
    /** Guidance under the label. Never render this inside the label element. */
    description?: ReactNode
    /** Right-aligned counter or status ("2 of 3 selected"). */
    hint?: ReactNode
    required?: boolean
    optional?: boolean
    error?: string
    className?: string
    children: ReactNode | ((props: FieldRenderProps) => ReactNode)
}

/**
 * Label / description / control / error, in that order.
 *
 * The shared `FormItem` renders its `extra` text *inside* the `<label>`, which
 * makes long guidance collide with the label. This keeps them on separate rows
 * and wires the aria plumbing for the control.
 */
const Field = ({
    label,
    description,
    hint,
    required,
    optional,
    error,
    className,
    children,
}: FieldProps) => {
    const controlId = useId()
    const descriptionId = `${controlId}-description`
    const errorId = `${controlId}-error`

    const describedBy =
        [description ? descriptionId : null, error ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined

    // Only point the label at a control when we actually hand out the id.
    const isRenderProp = typeof children === 'function'

    return (
        <div className={classNames('min-w-0', className)}>
            <div className="flex items-baseline justify-between gap-3">
                <label
                    htmlFor={isRenderProp ? controlId : undefined}
                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                    {label}
                    {required ? (
                        <span aria-hidden className="ml-0.5 text-red-500">
                            *
                        </span>
                    ) : null}
                    {optional ? (
                        <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                            Optional
                        </span>
                    ) : null}
                </label>
                {hint ? (
                    <span className="shrink-0 text-xs tabular-nums text-gray-500 dark:text-gray-400">
                        {hint}
                    </span>
                ) : null}
            </div>

            {description ? (
                <p
                    id={descriptionId}
                    className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400"
                >
                    {description}
                </p>
            ) : null}

            <div className="mt-2">
                {isRenderProp
                    ? (children as (props: FieldRenderProps) => ReactNode)({
                          id: controlId,
                          'aria-describedby': describedBy,
                          'aria-invalid': error ? true : undefined,
                      })
                    : children}
            </div>

            {error ? (
                <p
                    id={errorId}
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500"
                >
                    <TbAlertCircle className="shrink-0 text-sm" aria-hidden />
                    {error}
                </p>
            ) : null}
        </div>
    )
}

export default Field
