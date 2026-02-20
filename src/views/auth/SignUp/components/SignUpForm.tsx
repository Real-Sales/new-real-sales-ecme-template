import { useState } from 'react'
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

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

type SignUpFormSchema = {
    email: string
    first_name: string
    last_name: string
    phone_number: string
    password: string
    confirmPassword: string
}

const validationSchema: ZodType<SignUpFormSchema> = z
    .object({
        email: z.string().min(1, { message: 'Please enter your email' }).email({ message: 'Invalid email' }),
        first_name: z.string().min(1, { message: 'Please enter your first name' }),
        last_name: z.string().min(1, { message: 'Please enter your last name' }),
        phone_number: z.string().min(1, { message: 'Please enter your phone number' }).regex(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' }),
        password: z.string().min(1, { message: 'Password Required' }),
        confirmPassword: z.string().min(1, { message: 'Confirm Password Required' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, setMessage } = props

    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { signUp } = useAuth()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignUpFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            email: '',
            first_name: '',
            last_name: '',
            phone_number: '',
            password: '',
            confirmPassword: '',
        }
    })

    const onSignUp = async (values: SignUpFormSchema) => {
        const { email, first_name, last_name, phone_number, password } = values

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signUp({
                email,
                first_name,
                last_name,
                phone_number,
                password
            })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
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
                                {...field}
                            />
                        )}
                    />
                </FormItem>
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
                <FormItem
                    label="Confirm Password"
                    invalid={Boolean(errors.confirmPassword)}
                    errorMessage={errors.confirmPassword?.message}
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <div className="[&_.input]:!bg-gray-50 [&_.input]:dark:!bg-gray-800/50 [&_.input]:!border [&_.input]:!border-gray-200 [&_.input]:dark:!border-gray-700 [&_.input]:shadow-md [&_.input]:text-gray-900 [&_.input]:dark:text-gray-200">
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="Confirm Password"
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
                    {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </Form>
        </div>
    )
}

export default SignUpForm
