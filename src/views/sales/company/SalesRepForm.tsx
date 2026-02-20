import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type SalesRepFormSchema = {
    firstName: string
    lastName: string
    phone: string
    email: string
    password: string
}

const validationSchema = z.object({
    firstName: z.string().min(1, { message: 'First name is required' }).max(50, 'Too Long!'),
    lastName: z.string().min(1, { message: 'Last name is required' }).max(50, 'Too Long!'),
    phone: z.string().min(1, { message: 'Phone is required' }).regex(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
    email: z.string().email({ message: 'Invalid email' }).min(1, { message: 'Email is required' }),
    password: z
        .string()
        .min(1, { message: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' }),
})

type SalesRepFormProps = {
    onSubmit: (values: SalesRepFormSchema) => void
    onCancel: () => void
}

const SalesRepForm = ({ onSubmit, onCancel }: SalesRepFormProps) => {
    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SalesRepFormSchema>({
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            password: '',
        },
        resolver: zodResolver(validationSchema),
    })

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <FormItem
                    label="First Name"
                    asterisk
                    invalid={Boolean(errors.firstName)}
                    errorMessage={errors.firstName?.message}
                >
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Enter First Name"
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Last Name"
                    asterisk
                    invalid={Boolean(errors.lastName)}
                    errorMessage={errors.lastName?.message}
                >
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Enter Last Name"
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Phone"
                    asterisk
                    invalid={Boolean(errors.phone)}
                    errorMessage={errors.phone?.message}
                >
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="+1 (555) 123-4567"
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Email"
                    asterisk
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                autoComplete="off"
                                placeholder="contact@company.com"
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Password"
                    asterisk
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="Password"
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
        </Form>
    )
}

export default SalesRepForm
export type { SalesRepFormSchema }
