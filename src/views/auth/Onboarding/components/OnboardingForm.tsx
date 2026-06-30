import { useEffect, useMemo, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Alert from '@/components/ui/Alert'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { MultiValue, ActionMeta } from 'react-select'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchIndustries } from '@/store/slices/industriesCatalogSlice'
import { formatDisplayLabel } from '@/utils/formatDisplayLabel'

interface OnboardingFormProps extends CommonProps {
    onComplete: (data: OnboardingFormSchema) => void
    isSubmitting?: boolean
}

type IndustryOption = {
    value: string
    label: string
}

type ProductOption = {
    value: string
    label: string
}

export type OnboardingFormSchema = {
    companyName: string
    industry: string
    industryProducts: string[]
    location: string
    email: string
    phone_number: string
}

const validationSchema: ZodType<OnboardingFormSchema> = z.object({
    companyName: z
        .string({ required_error: 'Please enter your company name' })
        .min(1, { message: 'Please enter your company name' }),
    industry: z
        .string({ required_error: 'Please select your industry' })
        .min(1, { message: 'Please select your industry' }),
    industryProducts: z
        .array(z.string())
        .min(1, { message: 'Please add at least one product' }),
    location: z.string().min(1, { message: 'Please enter company location' }),
    email: z.string().email({ message: 'Invalid email' }).min(1, { message: 'Email is required' }),
    phone_number: z.string().min(1, { message: 'Phone number is required' }),
})

const inputClassName =
    'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md'

const selectClassName =
    '[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md'

const OnboardingForm = ({ className, onComplete, isSubmitting = false }: OnboardingFormProps) => {
    const dispatch = useAppDispatch()
    const industries = useAppSelector((state) => state.industriesCatalog.industries)
    const industriesLoading = useAppSelector((state) => state.industriesCatalog.loading)
    const industriesError = useAppSelector((state) => state.industriesCatalog.error)
    const industriesInitialized = useAppSelector(
        (state) => state.industriesCatalog.initialized,
    )
    const [selectedIndustryId, setSelectedIndustryId] = useState('')
    const user = useAppSelector((state) => state.auth.user)

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm<OnboardingFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            companyName: '',
            industry: '',
            industryProducts: [],
            location: '',
            email: user.email || '',
            phone_number: user.phoneNumber || '',
        },
    })

    useEffect(() => {
        if (!industriesInitialized && !industriesLoading) {
            dispatch(fetchIndustries())
        }
    }, [dispatch, industriesInitialized, industriesLoading])

    const industryOptions: IndustryOption[] = useMemo(
        () =>
            industries.map((industry) => ({
                value: industry.name,
                label: formatDisplayLabel(industry.name),
            })),
        [industries],
    )

    const productOptions: ProductOption[] = useMemo(() => {
        if (!selectedIndustryId) return []
        const industry = industries.find((item) => item.industry_id === selectedIndustryId)
        return (industry?.products ?? []).map((product) => ({
            value: product.product_id,
            label: formatDisplayLabel(product.name),
        }))
    }, [industries, selectedIndustryId])

    const onSubmit = (values: OnboardingFormSchema) => {
        onComplete(values)
    }

    return (
        <div className={className}>
            {industriesError && (
                <Alert showIcon type="danger" className="mb-4">
                    <span className="break-all">{industriesError}</span>
                </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    label="Company Name"
                    invalid={Boolean(errors.companyName)}
                    errorMessage={errors.companyName?.message}
                >
                    <Controller
                        name="companyName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder="Enter your company name"
                                autoComplete="organization"
                                className={inputClassName}
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        label="Location"
                        invalid={Boolean(errors.location)}
                        errorMessage={errors.location?.message}
                    >
                        <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="City, Country"
                                    className={inputClassName}
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
                                    placeholder="Phone number"
                                    className={inputClassName}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                <FormItem
                    label="Business Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="email@company.com"
                                className={inputClassName}
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Industry"
                    invalid={Boolean(errors.industry)}
                    errorMessage={errors.industry?.message}
                >
                    <Controller
                        name="industry"
                        control={control}
                        render={({ field }) => (
                            <Select<IndustryOption, false>
                                placeholder={
                                    industriesLoading
                                        ? 'Loading industries...'
                                        : 'Select your industry'
                                }
                                options={industryOptions}
                                isDisabled={industriesLoading || !!industriesError}
                                value={
                                    industryOptions.find(
                                        (opt) => opt.value === field.value,
                                    ) || null
                                }
                                onChange={(option) => {
                                    const industryName = option?.value || ''
                                    const industry = industries.find(
                                        (item) => item.name === industryName,
                                    )
                                    field.onChange(industryName)
                                    setSelectedIndustryId(industry?.industry_id || '')
                                    setValue('industryProducts', [])
                                }}
                                menuPlacement="top"
                                className={selectClassName}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Your Products / Services"
                    invalid={Boolean(errors.industryProducts)}
                    errorMessage={errors.industryProducts?.message}
                >
                    <Controller
                        name="industryProducts"
                        control={control}
                        render={({ field }) => (
                            <Select<ProductOption, true>
                                isMulti
                                placeholder={
                                    !selectedIndustryId
                                        ? 'Select an industry first'
                                        : productOptions.length === 0
                                          ? 'No products for this industry'
                                          : 'Select products'
                                }
                                options={productOptions}
                                isDisabled={
                                    industriesLoading ||
                                    !!industriesError ||
                                    !selectedIndustryId ||
                                    productOptions.length === 0
                                }
                                value={productOptions.filter((opt) =>
                                    field.value.includes(opt.value),
                                )}
                                onChange={(
                                    newValue: MultiValue<ProductOption>,
                                    _actionMeta: ActionMeta<ProductOption>,
                                ) => {
                                    field.onChange(newValue.map((opt) => opt.value))
                                }}
                                menuPlacement="top"
                                className={selectClassName}
                            />
                        )}
                    />
                </FormItem>

                <Button
                    block
                    loading={isSubmitting}
                    disabled={industriesLoading || !!industriesError}
                    variant="solid"
                    type="submit"
                    className="mt-2"
                >
                    {isSubmitting ? 'Setting up...' : 'Get Started'}
                </Button>
            </Form>
        </div>
    )
}

export default OnboardingForm
