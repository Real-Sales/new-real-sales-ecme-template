import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type CompanyFormSchema = {
    companyName: string
    industry: string
    location: string
    phone: string
    email: string
}

const validationSchema = z.object({
    companyName: z.string().min(1, { message: 'Company name is required' }).max(100, 'Too Long!'),
    industry: z.string().min(1, { message: 'Industry is required' }),
    location: z.string().min(1, { message: 'Location is required' }),
    phone: z.string().min(1, { message: 'Phone is required' }).regex(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
    email: z.string().email({ message: 'Invalid email' }).min(1, { message: 'Email is required' }),
})

type CompanyFormProps = {
    onSubmit: (values: CompanyFormSchema) => void
    onCancel: () => void
}

const CompanyForm = ({ onSubmit, onCancel }: CompanyFormProps) => {
    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<CompanyFormSchema>({
        defaultValues: {
            companyName: '',
            industry: '',
            location: '',
            phone: '',
            email: '',
        },
        resolver: zodResolver(validationSchema),
    })

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <FormItem
                    label="Company Name"
                    asterisk
                    invalid={Boolean(errors.companyName)}
                    errorMessage={errors.companyName?.message}
                >
                    <Controller
                        name="companyName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Enter company name"
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Industry"
                    asterisk
                    invalid={Boolean(errors.industry)}
                    errorMessage={errors.industry?.message}
                >
                    <Controller
                        name="industry"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="e.g., Technology, Healthcare"
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
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
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
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
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Location"
                    asterisk
                    invalid={Boolean(errors.location)}
                    errorMessage={errors.location?.message}
                >
                    <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="City, State"
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
        </Form>
    )
}

export default CompanyForm
export type { CompanyFormSchema }
