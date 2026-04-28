import { forwardRef, useMemo } from 'react'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type CompanyFormSchema = {
    companyName: string
    category: string
}

const validationSchema = z.object({
    companyName: z.string().min(1, { message: 'Sales division name is required' }).max(100, 'Too Long!'),
    category: z.string().min(1, { message: 'Category is required' }),
})

/** Stable reference — inline `{ companyName: '', category: '' }` in defaults changes every render and breaks `reset` deps. */
const EMPTY_FORM: CompanyFormSchema = { companyName: '', category: '' }

type CompanyFormProps = {
    onSubmit: (values: CompanyFormSchema) => void
    onCancel: () => void
    defaultValues?: CompanyFormSchema
}

const CompanyForm = forwardRef<HTMLFormElement, CompanyFormProps>(
    ({ onSubmit, onCancel, defaultValues }, ref) => {
        // Stable object for useForm initial state only; parent remounts via `key` when defaults change.
        const resolvedDefaults = useMemo(() => {
            if (!defaultValues) {
                return EMPTY_FORM
            }
            return {
                companyName: defaultValues.companyName,
                category: defaultValues.category,
            }
        }, [defaultValues?.companyName, defaultValues?.category])

        const {
            handleSubmit,
            formState: { errors },
            control,
        } = useForm<CompanyFormSchema>({
            defaultValues: resolvedDefaults,
            resolver: zodResolver(validationSchema),
        })

        return (
            <Form ref={ref} onSubmit={handleSubmit(onSubmit)}>
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
                                    autoFocus
                                    autoComplete="off"
                                    placeholder="Enter company name"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Category"
                        asterisk
                        invalid={Boolean(errors.category)}
                        errorMessage={errors.category?.message}
                    >
                        <Controller
                            name="category"
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
    },
)

CompanyForm.displayName = 'CompanyForm'

export default CompanyForm
export type { CompanyFormSchema }
