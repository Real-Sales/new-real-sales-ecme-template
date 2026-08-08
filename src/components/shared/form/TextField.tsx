import Input from '@/components/ui/Input'
import Field from './Field'
import classNames from '@/utils/classNames'
import type { InputProps } from '@/components/ui/Input'
import type { ReactNode } from 'react'

/** One place for control chrome, instead of a long class string per field. */
export const CONTROL_CLASSNAME =
    'bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 !rounded-xl'

type SharedFieldProps = {
    label: string
    description?: ReactNode
    hint?: ReactNode
    required?: boolean
    optional?: boolean
    error?: string
    /** Applied to the field wrapper. Use `inputClassName` for the control. */
    className?: string
    inputClassName?: string
}

export type TextFieldProps = SharedFieldProps &
    Omit<InputProps, 'size' | 'prefix' | 'form'>

/** Labelled single-line input with description + error wiring. */
export const TextField = ({
    label,
    description,
    hint,
    required,
    optional,
    error,
    className,
    inputClassName,
    ...inputProps
}: TextFieldProps) => (
    <Field
        label={label}
        description={description}
        hint={hint}
        required={required}
        optional={optional}
        error={error}
        className={className}
    >
        {({ id, ...aria }) => (
            <Input
                id={id}
                invalid={Boolean(error)}
                className={classNames(CONTROL_CLASSNAME, inputClassName)}
                {...aria}
                {...inputProps}
            />
        )}
    </Field>
)

export type TextAreaFieldProps = SharedFieldProps &
    Omit<InputProps, 'size' | 'prefix' | 'form' | 'textArea'> & {
        /** Renders a live `n / max` counter that turns red past the limit. */
        maxLength?: number
        rows?: number
    }

/** Labelled textarea with an optional character budget in the hint slot. */
export const TextAreaField = ({
    label,
    description,
    hint,
    required,
    optional,
    error,
    className,
    inputClassName,
    maxLength,
    rows = 4,
    value,
    ...inputProps
}: TextAreaFieldProps) => {
    const length = typeof value === 'string' ? value.length : 0
    const overBudget = Boolean(maxLength && length > maxLength)

    const counter = maxLength ? (
        <span className={overBudget ? 'text-red-500' : undefined}>
            {length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
    ) : (
        hint
    )

    return (
        <Field
            label={label}
            description={description}
            hint={counter}
            required={required}
            optional={optional}
            error={error}
            className={className}
        >
            {({ id, ...aria }) => (
                <Input
                    textArea
                    id={id}
                    rows={rows}
                    value={value}
                    invalid={Boolean(error) || overBudget}
                    className={classNames(
                        CONTROL_CLASSNAME,
                        'resize-y leading-relaxed',
                        inputClassName,
                    )}
                    {...aria}
                    {...inputProps}
                />
            )}
        </Field>
    )
}

export default TextField
