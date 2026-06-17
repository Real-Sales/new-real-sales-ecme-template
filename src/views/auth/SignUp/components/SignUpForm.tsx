import { useMemo, useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ValidateInviteResponse } from '@/services/InviteService'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
    inviteToken?: string
    inviteInfo?: ValidateInviteResponse | null
}

type SignUpFormSchema = {
    email: string
    first_name: string
    last_name: string
    phone_number: string
    password: string
}

const SignUpForm = (props: SignUpFormProps) => {
    const {
        disableSubmit = false,
        className,
        setMessage,
        inviteToken = '',
        inviteInfo = null,
    } = props

    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { signUp, inviteSignUp } = useAuth()
    const isInviteFlow = Boolean(inviteToken)
    const validationSchema: ZodType<SignUpFormSchema> = useMemo(
        () =>
            z.object({
                email: z
                    .string()
                    .min(1, { message: 'Please enter your email' })
                    .email({ message: 'Invalid email' }),
                first_name: z
                    .string()
                    .min(1, { message: 'Please enter your first name' }),
                last_name: z
                    .string()
                    .min(1, { message: 'Please enter your last name' }),
                phone_number: isInviteFlow
                    ? z.string().optional().default('')
                    : z
                        .string()
                        .min(1, { message: 'Please enter your phone number' })
                        .regex(/^\d{10}$/, {
                            message: 'Phone number must be exactly 10 digits',
                        }),
                password: z.string().min(1, { message: 'Password Required' }),
            }),
        [isInviteFlow],
    )

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        setError,
    } = useForm<SignUpFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            email: inviteInfo?.email ?? '',
            first_name: '',
            last_name: '',
            phone_number: '',
            password: '',
        }
    })

    useEffect(() => {
        if (inviteInfo?.email) {
            setValue('email', inviteInfo.email)
        }
    }, [inviteInfo?.email, setValue])

    const onSignUp = async (values: SignUpFormSchema) => {
        const { email, first_name, last_name, phone_number, password } = values

        if (!disableSubmit) {
            setSubmitting(true)
            const result = isInviteFlow
                ? await inviteSignUp({
                    invite_token: inviteToken,
                    email: inviteInfo?.email || email,
                    first_name,
                    last_name,
                    password,
                })
                : await signUp({
                    email,
                    first_name,
                    last_name,
                    phone_number,
                    password,
                })

            if (result?.status === 'failed') {
                const message = result.message
                if (message === 'This phone number is already registered') {
                    setError('phone_number', { message })
                } else if (message === 'This email is already registered') {
                    setError('email', { message })
                } else {
                    setMessage?.(message)
                }
            }

            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignUp)}>
                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        label="First Name"
                        invalid={Boolean(errors.first_name)}
                        errorMessage={errors.first_name?.message}
                    >
                        <Controller
                            name="first_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="First Name"
                                    autoComplete="off"
                                    className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Last Name"
                        invalid={Boolean(errors.last_name)}
                        errorMessage={errors.last_name?.message}
                    >
                        <Controller
                            name="last_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="Last Name"
                                    autoComplete="off"
                                    className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>
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
                                readOnly={isInviteFlow}
                                disabled={isInviteFlow}
                                {...field}
                                value={isInviteFlow ? inviteInfo?.email || field.value : field.value}
                            />
                        )}
                    />
                </FormItem>
                {!isInviteFlow && (
                    <FormItem
                        label="Phone Number"
                        invalid={Boolean(errors.phone_number)}
                        errorMessage={errors.phone_number?.message}
                    >
                        <Controller
                            name="phone_number"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="Phone Number"
                                    autoComplete="off"
                                    className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                )}
                <FormItem
                    label="Password"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <div className="[&_.input]:!bg-gray-50 [&_.input]:dark:!bg-gray-800/50 [&_.input]:!border [&_.input]:!border-gray-200 [&_.input]:dark:!border-gray-700 [&_.input]:shadow-md [&_.input]:text-gray-900 [&_.input]:dark:text-gray-200">
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="Password"
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
                    {isSubmitting
                        ? 'Creating Account...'
                        : isInviteFlow
                            ? 'Accept Invite'
                            : 'Sign Up'}
                </Button>
            </Form>
        </div>
    )
}

export default SignUpForm
