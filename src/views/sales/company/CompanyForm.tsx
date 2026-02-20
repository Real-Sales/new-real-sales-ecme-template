import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type CompanyFormSchema = {
    companyName: string
    industry: string
}

const validationSchema = z.object({
    companyName: z.string().min(1, { message: 'Sales division name is required' }).max(100, 'Too Long!'),
    industry: z.string().min(1, { message: 'Industry is required' }),
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
        },
        resolver: zodResolver(validationSchema),
    })

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <FormItem
                    label="Sales Division Name"
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
            </div>
        </Form>
    )
}

export default CompanyForm
export type { CompanyFormSchema }
