import { forwardRef, useEffect, useMemo, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Form } from '@/components/ui/Form'
import {
    EntityPicker,
    Field,
    FormSection,
    InlineNotice,
    MetaTag,
    MetaTagList,
    OptionCard,
    OptionCardGroup,
    TextField,
    scrollToFirstError,
} from '@/components/shared/form'
import type { EntityOption } from '@/components/shared/form'
import { useAppSelector } from '@/store'
import {
    MAX_DIVISION_PRODUCTS,
    capDivisionProductIds,
    profileProductsToOptions,
} from '@/utils/companyProducts'
import {
    CUSTOMER_SEGMENT_IDS,
    CUSTOMER_SEGMENT_SEED_OPTIONS,
} from '@/services/CustomerSegmentService'

type CompanyFormSchema = {
    companyName: string
    category: string
    customerSegmentId: string
    productIds: string[]
}

const validationSchema = z.object({
    companyName: z
        .string()
        .min(1, { message: 'Sales division name is required' })
        .max(100, 'Too Long!'),
    category: z.string().min(1, { message: 'Category is required' }),
    customerSegmentId: z
        .string()
        .min(1, { message: 'Customer segment is required' }),
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

/** Plain-language description of who each segment sells to. */
const SEGMENT_DESCRIPTIONS: Record<string, string> = {
    [CUSTOMER_SEGMENT_IDS.B2B_MANUFACTURER]:
        'Plants, production and industrial buyers.',
    [CUSTOMER_SEGMENT_IDS.B2B_RETAIL_CHANNEL]:
        'Retail chains, modern trade and store buyers.',
    [CUSTOMER_SEGMENT_IDS.INSTITUTIONAL]:
        'Hotels, restaurants, catering and institutions.',
    [CUSTOMER_SEGMENT_IDS.CHANNEL_PARTNERS]:
        'Distributors, resellers and franchise partners.',
    [CUSTOMER_SEGMENT_IDS.PUBLIC_GOVERNMENT]:
        'Tenders, public bodies and government buyers.',
    [CUSTOMER_SEGMENT_IDS.ENTERPRISE_B2B]:
        'Large accounts with committee-based buying.',
}

const FALLBACK_CATEGORIES = [
    'Modern Trade',
    'HoReCa',
    'D2C',
    'Distribution',
    'Enterprise',
]

type CompanyFormProps = {
    salesCompanyId: string
    onSubmit: (values: CompanyFormSchema) => void
    onCancel: () => void
    defaultValues?: Partial<CompanyFormSchema>
    /** Existing category names — offered as one-tap suggestions. */
    categorySuggestions?: string[]
    /** Lets the drawer guard against discarding unsaved edits. */
    onDirtyChange?: (dirty: boolean) => void
}

/**
 * Sales division create/edit form.
 *
 * Segment is a card grid rather than a dropdown: it decides which AI personas
 * reps can train against, so it deserves visible options and explanations.
 */
const DivisionForm = forwardRef<HTMLFormElement, CompanyFormProps>(
    (
        {
            onSubmit,
            defaultValues,
            categorySuggestions = [],
            onDirtyChange,
        },
        ref,
    ) => {
        const profileCompanyProducts = useAppSelector(
            (state) => state.settings.profile.companyProducts,
        )
        const containerRef = useRef<HTMLDivElement>(null)

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
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
            formState: { errors, isDirty },
            control,
            watch,
        } = useForm<CompanyFormSchema>({
            defaultValues: resolvedDefaults,
            resolver: zodResolver(validationSchema),
        })

        useEffect(() => {
            onDirtyChange?.(isDirty)
        }, [isDirty, onDirtyChange])

        const values = watch()
        const selectedSegment = CUSTOMER_SEGMENT_SEED_OPTIONS.find(
            (segment) => segment.customer_segment_id === values.customerSegmentId,
        )
        const selectedProductNames = productOptions
            .filter((option) => values.productIds?.includes(option.value))
            .map((option) => option.label)

        const suggestions = useMemo(() => {
            const unique = [
                ...new Set(
                    [...categorySuggestions, ...FALLBACK_CATEGORIES]
                        .map((value) => value?.trim())
                        .filter(Boolean),
                ),
            ]
            return unique.slice(0, 6)
        }, [categorySuggestions])

        const productPickerOptions: EntityOption[] = useMemo(() => {
            const atCap =
                (values.productIds?.length ?? 0) >= MAX_DIVISION_PRODUCTS
            return productOptions.map((option) => ({
                value: option.value,
                label: option.label,
                disabled: atCap && !values.productIds?.includes(option.value),
            }))
        }, [productOptions, values.productIds])

        const onInvalid = (formErrors: typeof errors) => {
            scrollToFirstError(containerRef.current, Object.keys(formErrors))
        }

        return (
            <Form ref={ref} onSubmit={handleSubmit(onSubmit, onInvalid)}>
                <div ref={containerRef} className="space-y-6">
                    <FormSection title="Basics">
                        <div data-error-anchor="companyName">
                            <Controller
                                name="companyName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        label="Division name"
                                        required
                                        description="Shown to reps."
                                        placeholder="e.g. HoReCa West"
                                        autoComplete="off"
                                        data-autofocus
                                        error={errors.companyName?.message}
                                        {...field}
                                    />
                                )}
                            />
                        </div>

                        <div data-error-anchor="category">
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <TextField
                                            label="Category"
                                            required
                                            description="Groups divisions that sell the same way."
                                            placeholder="e.g. Modern Trade"
                                            autoComplete="off"
                                            error={errors.category?.message}
                                            {...field}
                                        />
                                        {suggestions.length ? (
                                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                                    Quick pick
                                                </span>
                                                {suggestions.map((suggestion) => {
                                                    const active =
                                                        field.value?.trim().toLowerCase() ===
                                                        suggestion.toLowerCase()
                                                    return (
                                                        <button
                                                            key={suggestion}
                                                            type="button"
                                                            aria-pressed={active}
                                                            className={
                                                                active
                                                                    ? 'rounded-full border border-primary bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary'
                                                                    : 'rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:text-gray-400 dark:hover:text-white'
                                                            }
                                                            onClick={() =>
                                                                field.onChange(
                                                                    suggestion,
                                                                )
                                                            }
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : null}
                                    </>
                                )}
                            />
                        </div>
                    </FormSection>

                    <FormSection
                        title="Customer segment"
                        description="Sets which AI personas reps train against."
                        divided
                    >
                        <div data-error-anchor="customerSegmentId">
                            <Controller
                                name="customerSegmentId"
                                control={control}
                                render={({ field }) => (
                                    <Field
                                        label="Segment"
                                        required
                                        error={errors.customerSegmentId?.message}
                                    >
                                        <OptionCardGroup
                                            label="Customer segment"
                                            columns={2}
                                        >
                                            {CUSTOMER_SEGMENT_SEED_OPTIONS.map(
                                                (segment) => (
                                                    <OptionCard
                                                        key={
                                                            segment.customer_segment_id
                                                        }
                                                        name="customer-segment"
                                                        value={
                                                            segment.customer_segment_id
                                                        }
                                                        title={segment.name}
                                                        description={
                                                            SEGMENT_DESCRIPTIONS[
                                                                segment
                                                                    .customer_segment_id
                                                            ]
                                                        }
                                                        selected={
                                                            field.value ===
                                                            segment.customer_segment_id
                                                        }
                                                        onSelect={field.onChange}
                                                    />
                                                ),
                                            )}
                                        </OptionCardGroup>
                                    </Field>
                                )}
                            />
                        </div>
                    </FormSection>

                    <FormSection
                        title="Products"
                        divided
                    >
                        <div data-error-anchor="productIds">
                            <Controller
                                name="productIds"
                                control={control}
                                render={({ field }) => (
                                    <Field
                                        label="Sold by this division"
                                        required
                                        hint={`${field.value?.length ?? 0} of ${MAX_DIVISION_PRODUCTS}`}
                                        error={errors.productIds?.message}
                                    >
                                        {productOptions.length === 0 ? (
                                            <InlineNotice
                                                tone="warning"
                                                title="No company products yet"
                                                action={
                                                    <Link
                                                        to="/profile/settings"
                                                        className="font-semibold underline underline-offset-2"
                                                    >
                                                        Add products in Settings
                                                    </Link>
                                                }
                                            >
                                                Add at least one product first.
                                            </InlineNotice>
                                        ) : (
                                            <EntityPicker
                                                multiple
                                                options={productPickerOptions}
                                                selectedIds={field.value ?? []}
                                                searchPlaceholder="Search products…"
                                                maxHeight={220}
                                                invalid={Boolean(errors.productIds)}
                                                onSelect={(value) => {
                                                    const current =
                                                        field.value ?? []
                                                    field.onChange(
                                                        current.includes(value)
                                                            ? current.filter(
                                                                  (id) =>
                                                                      id !== value,
                                                              )
                                                            : capDivisionProductIds(
                                                                  [
                                                                      ...current,
                                                                      value,
                                                                  ],
                                                              ),
                                                    )
                                                }}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>
                    </FormSection>

                    <FormSection
                        title="Preview"
                        divided
                    >
                        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-800/40">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {values.companyName?.trim() || 'Division name'}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {values.category?.trim() || 'Category'}
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-1">
                                {selectedSegment ? (
                                    <MetaTag tone="segment">
                                        {selectedSegment.name}
                                    </MetaTag>
                                ) : (
                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                        No segment selected
                                    </span>
                                )}
                                <MetaTagList
                                    items={selectedProductNames}
                                    tone="product"
                                    emptyLabel="No products selected"
                                />
                            </div>
                        </div>
                    </FormSection>
                </div>
            </Form>
        )
    },
)

DivisionForm.displayName = 'DivisionForm'

export default DivisionForm
export type { CompanyFormSchema }
