import FormContainer from './FormContainer'
import type { ComponentPropsWithoutRef, Ref } from 'react'
import type { FormContainerProps } from './FormContainer'

export type FormProps = ComponentPropsWithoutRef<'form'> &
    FormContainerProps & {
        containerClassName?: string
        ref?: Ref<HTMLFormElement>
    }

import { forwardRef } from 'react'

export const Form = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
    const {
        children,
        containerClassName,
        labelWidth,
        layout,
        size,
        ...rest
    } = props

    return (
        <form ref={ref} {...rest}>
            <FormContainer
                className={containerClassName}
                labelWidth={labelWidth}
                layout={layout}
                size={size}
            >
                {children}
            </FormContainer>
        </form>
    )
})

Form.displayName = 'Form'

export default Form
