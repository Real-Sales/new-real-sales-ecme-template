import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { apiForgotPasswordRequest, apiForgotPasswordConfirm } from '@/services/AuthService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

interface ForgotPasswordFormProps extends CommonProps {
    emailSent: boolean
    setEmailSent?: (complete: boolean) => void
    setMessage?: (message: string) => void
    setSuccess?: (message: string) => void
    setIsResetDone?: (done: boolean) => void
}

type ForgotPasswordFormSchema = {
    email: string
    otp_code?: string
    new_password?: string
}

const validationSchema: ZodType<ForgotPasswordFormSchema> = z.object({
    email: z.string().email().min(5),
    otp_code: z.string().optional(),
    new_password: z.string().optional(),
})

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')

    const { className, setMessage, setSuccess, setEmailSent, setIsResetDone, emailSent } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm<ForgotPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            email: '',
            otp_code: '',
            new_password: '',
        }
    })

    useEffect(() => {
        if (emailSent) {
            setValue('otp_code', '')
        }
    }, [emailSent, setValue])

    const onForgotPassword = async (values: ForgotPasswordFormSchema) => {
        setSubmitting(true)
        try {
            if (!emailSent) {
                // Step 1: Request OTP
                const resp = await apiForgotPasswordRequest<boolean>({ email: values.email })
                if (resp) {
                    setEmail(values.email)
                    setEmailSent?.(true)
                    setSuccess?.('OTP sent to your email')
                    setValue('otp_code', '')
                }
            } else {
                // Step 2: Confirm Reset
                if (!values.otp_code || !values.new_password) {
                    setMessage?.('Please enter OTP and new password')
                    setSubmitting(false)
                    return
                }
                const resp = await apiForgotPasswordConfirm<boolean>({
                    email: email,
                    otp_code: values.otp_code,
                    new_password: values.new_password
                })
                if (resp) {
                    setIsResetDone?.(true)
                }
            }
        } catch (errors: any) {
            setMessage?.(errors?.response?.data?.message || errors?.response?.data?.error || errors?.response?.data?.detail || errors.toString() || 'Some error occured!')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onForgotPassword)}>
                {!emailSent ? (
                    <>
                        <FormItem
                            label="Email"
                            invalid={Boolean(errors.email)}
                            errorMessage={errors.email?.message}
                        >
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        autoComplete="off"
                                        className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Hidden inputs to consume browser autofill */}
                        <input
                            type="text"
                            name="fake_username"
                            style={{ display: 'none' }}
                        />
                        <input
                            type="password"
                            name="fake_password"
                            style={{ display: 'none' }}
                        />
                        <FormItem
                            label="OTP Code"
                            invalid={Boolean(errors.otp_code)}
                            errorMessage={errors.otp_code?.message}
                        >
                            <Controller
                                name="otp_code"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        key="otp-code-input"
                                        type="text"
                                        placeholder="Enter OTP"
                                        autoComplete="one-time-code"
                                        className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="New Password"
                            invalid={Boolean(errors.new_password)}
                            errorMessage={errors.new_password?.message}
                        >
                            <Controller
                                name="new_password"
                                control={control}
                                render={({ field }) => (
                                    <div className="[&_.input]:!bg-gray-50 [&_.input]:dark:!bg-gray-800/50 [&_.input]:!border [&_.input]:!border-gray-200 [&_.input]:dark:!border-gray-700 [&_.input]:shadow-md [&_.input]:text-gray-900 [&_.input]:dark:text-gray-200">
                                        <PasswordInput
                                            placeholder="Enter New Password"
                                            autoComplete="off"
                                            {...field}
                                        />
                                    </div>
                                )}
                            />
                        </FormItem>
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                        </Button>
                    </>
                )}
            </Form>
        </div>
    )
}

export default ForgotPasswordForm
