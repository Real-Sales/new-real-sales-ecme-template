import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { MultiValue, ActionMeta } from 'react-select'

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
})

const industryOptions: IndustryOption[] = [
    { value: 'technology', label: 'Technology & Software' },
    { value: 'healthcare', label: 'Healthcare & Life Sciences' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'retail', label: 'Retail & E-Commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'education', label: 'Education & EdTech' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'telecom', label: 'Telecommunications' },
    { value: 'energy', label: 'Energy & Utilities' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'logistics', label: 'Logistics & Supply Chain' },
    { value: 'consulting', label: 'Consulting & Professional Services' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'travel', label: 'Travel & Hospitality' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'construction', label: 'Construction' },
    { value: 'other', label: 'Other' },
]

const productSuggestions: Record<string, ProductOption[]> = {
    technology: [
        { value: 'saas', label: 'SaaS Platform' },
        { value: 'cloud', label: 'Cloud Services' },
        { value: 'ai_ml', label: 'AI / ML Solutions' },
        { value: 'cybersecurity', label: 'Cybersecurity' },
        { value: 'devtools', label: 'Developer Tools' },
        { value: 'data_analytics', label: 'Data Analytics' },
    ],
    healthcare: [
        { value: 'ehr', label: 'EHR Systems' },
        { value: 'telehealth', label: 'Telehealth' },
        { value: 'medical_devices', label: 'Medical Devices' },
        { value: 'pharma', label: 'Pharmaceuticals' },
        { value: 'health_analytics', label: 'Health Analytics' },
    ],
    finance: [
        { value: 'fintech', label: 'FinTech Solutions' },
        { value: 'payments', label: 'Payment Processing' },
        { value: 'lending', label: 'Lending Platform' },
        { value: 'wealth_mgmt', label: 'Wealth Management' },
        { value: 'regtech', label: 'RegTech' },
    ],
    retail: [
        { value: 'ecommerce', label: 'E-Commerce Platform' },
        { value: 'pos', label: 'POS Systems' },
        { value: 'inventory', label: 'Inventory Management' },
        { value: 'crm', label: 'Retail CRM' },
        { value: 'loyalty', label: 'Loyalty Programs' },
    ],
    manufacturing: [
        { value: 'erp', label: 'ERP Systems' },
        { value: 'supply_chain', label: 'Supply Chain Software' },
        { value: 'quality', label: 'Quality Management' },
        { value: 'iot', label: 'IoT Solutions' },
    ],
    real_estate: [
        { value: 'proptech', label: 'PropTech' },
        { value: 'property_mgmt', label: 'Property Management' },
        { value: 'crm_re', label: 'Real Estate CRM' },
        { value: 'listings', label: 'Listing Platform' },
    ],
    education: [
        { value: 'lms', label: 'Learning Management System' },
        { value: 'edtech', label: 'EdTech Platform' },
        { value: 'assessment', label: 'Assessment Tools' },
        { value: 'tutoring', label: 'Tutoring Services' },
    ],
}

const defaultProducts: ProductOption[] = [
    { value: 'crm_general', label: 'CRM Software' },
    { value: 'marketing', label: 'Marketing Tools' },
    { value: 'project_mgmt', label: 'Project Management' },
    { value: 'communication', label: 'Communication Platform' },
    { value: 'hr_tools', label: 'HR & Recruitment' },
    { value: 'accounting', label: 'Accounting Software' },
]

const inputClassName =
    'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md'

const selectClassName =
    '[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md'

const OnboardingForm = ({ className, onComplete, isSubmitting = false }: OnboardingFormProps) => {
    const [selectedIndustry, setSelectedIndustry] = useState<string>('')

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
        },
    })

    const getProductOptions = (): ProductOption[] => {
        if (selectedIndustry && productSuggestions[selectedIndustry]) {
            return productSuggestions[selectedIndustry]
        }
        return defaultProducts
    }

    const onSubmit = (values: OnboardingFormSchema) => {
        onComplete(values)
    }

    return (
        <div className={className}>
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
                                placeholder="Select your industry"
                                options={industryOptions}
                                value={
                                    industryOptions.find(
                                        (opt) => opt.value === field.value,
                                    ) || null
                                }
                                onChange={(option) => {
                                    const val = option?.value || ''
                                    field.onChange(val)
                                    setSelectedIndustry(val)
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
                                placeholder="Select or type to add products"
                                options={getProductOptions()}
                                value={getProductOptions().filter((opt) =>
                                    field.value.includes(opt.value),
                                )}
                                onChange={(
                                    newValue: MultiValue<ProductOption>,
                                    _actionMeta: ActionMeta<ProductOption>,
                                ) => {
                                    field.onChange(
                                        newValue.map((opt) => opt.value),
                                    )
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
