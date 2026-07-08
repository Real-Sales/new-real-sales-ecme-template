import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import PasswordInput from '@/components/shared/PasswordInput'
import OtpInput from '@/components/shared/OtpInput'
import { Form, FormItem } from '@/components/ui/Form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import {
    apiForgotPasswordRequest,
    apiForgotPasswordConfirm,
} from '@/services/AuthService'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { useAppSelector } from '@/store/hook'

type PasswordFormSchema = {
    newPassword: string
    confirmNewPassword: string
    otp_code?: string
}

const OTP_LENGTH = 6

const passwordValidationSchema: ZodType<PasswordFormSchema> = z
    .object({
        newPassword: z
            .string()
            .min(1, { message: 'Please enter your new password!' }),
        confirmNewPassword: z
            .string()
            .min(1, { message: 'Please confirm your new password!' }),
        otp_code: z.string().optional(),
    })
    .refine((data) => data.confirmNewPassword === data.newPassword, {
        message: 'Password not match',
        path: ['confirmNewPassword'],
    })

const passwordInputWrapperClass =
    '[&_.input]:!bg-gray-50 [&_.input]:dark:!bg-gray-800/50 [&_.input]:!border [&_.input]:!border-gray-200 [&_.input]:dark:!border-gray-700 [&_.input]:shadow-md [&_.input]:text-gray-900 [&_.input]:dark:text-gray-200'

const SettingsSecurity = () => {
    const userEmail = useAppSelector((state) => state.auth.user.email)
    const [otpSent, setOtpSent] = useState(false)
    const [pendingPassword, setPendingPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'danger'>('danger')

    const {
        handleSubmit,
        getValues,
        formState: { errors },
        control,
        setValue,
        reset,
        setError,
        clearErrors,
    } = useForm<PasswordFormSchema>({
        resolver: zodResolver(passwordValidationSchema),
        defaultValues: {
            newPassword: '',
            confirmNewPassword: '',
            otp_code: '',
        },
    })

    useEffect(() => {
        if (otpSent) {
            setValue('otp_code', '')
        }
    }, [otpSent, setValue])

    const resetFlow = () => {
        setOtpSent(false)
        setPendingPassword('')
        setMessage('')
        reset({
            newPassword: '',
            confirmNewPassword: '',
            otp_code: '',
        })
    }

    const onRequestOtp = async (values: PasswordFormSchema) => {
        if (!userEmail?.trim()) {
            setMessageType('danger')
            setMessage('Unable to verify your account email. Please sign in again.')
            return
        }

        setIsSubmitting(true)
        setMessage('')

        try {
            const resp = await apiForgotPasswordRequest<boolean>({
                email: userEmail.trim(),
            })
            if (resp) {
                setPendingPassword(values.newPassword)
                setOtpSent(true)
                setMessageType('success')
                setMessage('OTP sent to your email')
            }
        } catch (error) {
            setMessageType('danger')
            setMessage(getApiErrorMessage(error, 'Failed to send OTP'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const onConfirmOtp = async () => {
        if (!userEmail?.trim()) {
            setMessageType('danger')
            setMessage('Unable to verify your account email. Please sign in again.')
            return
        }

        clearErrors('otp_code')
        const otpCode = getValues('otp_code')?.trim()
        if (!otpCode || otpCode.length < OTP_LENGTH) {
            setError('otp_code', {
                type: 'manual',
                message: 'Please enter a valid OTP',
            })
            return
        }

        setIsSubmitting(true)
        setMessage('')

        try {
            const resp = await apiForgotPasswordConfirm<boolean>({
                email: userEmail.trim(),
                otp_code: otpCode,
                new_password: pendingPassword,
            })
            if (resp) {
                toast.push(
                    <Notification title="Success" type="success">
                        Your password has been updated successfully.
                    </Notification>,
                )
                resetFlow()
            }
        } catch (error) {
            setMessageType('danger')
            setMessage(getApiErrorMessage(error, 'Failed to update password'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h4>Password</h4>
                <p>
                    Remember, your password is your digital key to your account.
                    Keep it safe, keep it secure!
                </p>
            </div>

            {message && (
                <Alert showIcon className="mb-4" type={messageType}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}

            <Form
                className="mb-8"
                onSubmit={
                    otpSent
                        ? (e) => {
                              e.preventDefault()
                              onConfirmOtp()
                          }
                        : handleSubmit(onRequestOtp)
                }
            >
                {!otpSent ? (
                    <>
                        <FormItem
                            label="New password"
                            invalid={Boolean(errors.newPassword)}
                            errorMessage={errors.newPassword?.message}
                        >
                            <Controller
                                name="newPassword"
                                control={control}
                                render={({ field }) => (
                                    <div className={passwordInputWrapperClass}>
                                        <PasswordInput
                                            autoComplete="off"
                                            placeholder="Enter new password"
                                            {...field}
                                        />
                                    </div>
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="Confirm new password"
                            invalid={Boolean(errors.confirmNewPassword)}
                            errorMessage={errors.confirmNewPassword?.message}
                        >
                            <Controller
                                name="confirmNewPassword"
                                control={control}
                                render={({ field }) => (
                                    <div className={passwordInputWrapperClass}>
                                        <PasswordInput
                                            autoComplete="off"
                                            placeholder="Confirm new password"
                                            {...field}
                                        />
                                    </div>
                                )}
                            />
                        </FormItem>
                        <div className="flex justify-end">
                            <Button
                                variant="solid"
                                type="submit"
                                className="rounded-md"
                                loading={isSubmitting}
                            >
                                {isSubmitting ? 'Sending OTP...' : 'Update'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Enter the OTP sent to{' '}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {userEmail}
                            </span>{' '}
                            to confirm your new password.
                        </p>
                        <FormItem
                            invalid={Boolean(errors.otp_code)}
                            errorMessage={errors.otp_code?.message}
                        >
                            <Controller
                                name="otp_code"
                                control={control}
                                render={({ field }) => (
                                    <OtpInput
                                        placeholder=""
                                        inputClass="h-[58px]"
                                        length={OTP_LENGTH}
                                        invalid={Boolean(errors.otp_code)}
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="default"
                                type="button"
                                className="rounded-md"
                                disabled={isSubmitting}
                                onClick={resetFlow}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                className="rounded-md"
                                loading={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Confirm'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    )
}

export default SettingsSecurity
