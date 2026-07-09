import { forwardRef, useMemo } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { MultiValue, ActionMeta } from 'react-select'
import { useAppSelector } from '@/store'
import {
    MAX_DIVISION_PRODUCTS,
    capDivisionProductIds,
    profileProductsToOptions,
} from '@/utils/companyProducts'
import { CUSTOMER_SEGMENT_SEED_OPTIONS } from '@/services/CustomerSegmentService'

type ProductOption = { value: string; label: string }

type CompanyFormSchema = {
    companyName: string
    category: string
    customerSegmentId: string
    productIds: string[]
}

const validationSchema = z.object({
    companyName: z.string().min(1, { message: 'Sales division name is required' }).max(100, 'Too Long!'),
    category: z.string().min(1, { message: 'Category is required' }),
    customerSegmentId: z.string().min(1, { message: 'Customer segment is required' }),
    productIds: z
        .array(z.string())
        .min(1, { message: 'Select at least one product' })
        .max(MAX_DIVISION_PRODUCTS, {
            message: `You can select up to ${MAX_DIVISION_PRODUCTS} products`,
        }),
})

const EMPTY_FORM: CompanyFormSchema = {
    companyName: '',
    category: '',
    customerSegmentId: '',
    productIds: [],
}

const customerSegmentOptions = CUSTOMER_SEGMENT_SEED_OPTIONS.map((segment) => ({
    value: segment.customer_segment_id,
    label: segment.name,
}))

const inputClassName =
    'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md'

const selectClassName =
    '[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md'

type CompanyFormProps = {
    salesCompanyId: string
    onSubmit: (values: CompanyFormSchema) => void
    onCancel: () => void
    defaultValues?: Partial<CompanyFormSchema>
}

const CompanyForm = forwardRef<HTMLFormElement, CompanyFormProps>(
    ({ onSubmit, defaultValues }, ref) => {
        const profileCompanyProducts = useAppSelector(
            (state) => state.settings.profile.companyProducts,
        )

        const resolvedDefaults = useMemo(() => {
            if (!defaultValues) {
                return EMPTY_FORM
            }
            return {
                companyName: defaultValues.companyName ?? '',
                category: defaultValues.category ?? '',
                customerSegmentId: defaultValues.customerSegmentId ?? '',
                productIds: capDivisionProductIds(defaultValues.productIds ?? []),
            }
        }, [
            defaultValues?.companyName,
            defaultValues?.category,
            defaultValues?.customerSegmentId,
            defaultValues?.productIds?.join(','),
        ])

        const productOptions = useMemo(
            () => profileProductsToOptions(profileCompanyProducts),
            [profileCompanyProducts],
        )

        const {
            handleSubmit,
            formState: { errors },
            control,
        } = useForm<CompanyFormSchema>({
            defaultValues: resolvedDefaults,
            resolver: zodResolver(validationSchema),
        })

        const productsPlaceholder =
            productOptions.length === 0
                ? 'No company products yet — add products in Settings first'
                : `Select up to ${MAX_DIVISION_PRODUCTS} products for this division`

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
                                    className={inputClassName}
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
                                    className={inputClassName}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Customer Segment"
                        asterisk
                        invalid={Boolean(errors.customerSegmentId)}
                        errorMessage={errors.customerSegmentId?.message}
                        extra="Who this division's team sells to"
                    >
                        <Controller
                            name="customerSegmentId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Select a customer segment"
                                    options={customerSegmentOptions}
                                    value={customerSegmentOptions.find(
                                        (opt) => opt.value === field.value,
                                    )}
                                    onChange={(option) =>
                                        field.onChange((option?.value as string) || '')
                                    }
                                    className={selectClassName}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Products"
                        asterisk
                        invalid={Boolean(errors.productIds)}
                        errorMessage={errors.productIds?.message}
                        extra={`Choose from your company products (max ${MAX_DIVISION_PRODUCTS})`}
                    >
                        <Controller
                            name="productIds"
                            control={control}
                            render={({ field }) => (
                                <Select<ProductOption, true>
                                    isMulti
                                    placeholder={productsPlaceholder}
                                    options={productOptions}
                                    isDisabled={productOptions.length === 0}
                                    value={productOptions.filter((opt) =>
                                        field.value.includes(opt.value),
                                    )}
                                    onChange={(
                                        newValue: MultiValue<ProductOption>,
                                        _actionMeta: ActionMeta<ProductOption>,
                                    ) => {
                                        field.onChange(
                                            capDivisionProductIds(
                                                newValue.map((opt) => opt.value),
                                            ),
                                        )
                                    }}
                                    className={selectClassName}
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
