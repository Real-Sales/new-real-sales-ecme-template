import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactElement,
    type RefObject,
} from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'
import {
    TbFileUpload,
    TbInfoCircle,
    TbRoute,
    TbSearch,
    TbTarget,
    TbTrophy,
    TbX,
} from 'react-icons/tb'
import Dialog from '@/components/ui/Dialog'
import Upload from '@/components/ui/Upload'
import Spinner from '@/components/ui/Spinner'
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
    StepRail,
    TextAreaField,
    TextField,
} from '@/components/shared/form'
import type { EntityOption, StepStatus } from '@/components/shared/form'
import classNames from '@/utils/classNames'
import { apiUploadDocument } from '@/services/ScenarioLibraryService'
import { PersonaCard } from './ScenarioDetail'
import type { AiPersonaListItem, ScenarioLibraryPersona } from '../types'
import type { SalesDivision } from '@/services/SalesDivisionsService'
import { MODE_PIPELINE_ORDER, formatModeName } from '@/utils/modePipeline'

export type ScenarioFormOption = {
    label: string
    value: string
    description?: string
}
export type PersonaFormOption = ScenarioFormOption & { role?: string }
export type DivisionFormOption = ScenarioFormOption & {
    segmentName?: string
    productNames?: string[]
}

export type ScenarioFormSchema = {
    title: string
    salesDivisionId: string
    modeIds: string[]
    persona: string
    deadline: number
    scenario: string
    message?: string
    document_content?: string
    document_filename?: string
}

export const SCENARIO_STEPS = [
    { id: 'context', label: 'Context' },
    { id: 'training', label: 'Training' },
    { id: 'brief', label: 'Brief' },
] as const

export type ScenarioStepId = (typeof SCENARIO_STEPS)[number]['id']

/** Which step owns each field — drives the rail state and error routing. */
const FIELDS_BY_STEP: Record<ScenarioStepId, (keyof ScenarioFormSchema)[]> = {
    context: ['salesDivisionId', 'persona'],
    training: ['modeIds', 'deadline'],
    brief: ['title', 'scenario', 'message'],
}

const SCENARIO_MAX_LENGTH = 1000
const MESSAGE_MAX_LENGTH = 1000
const DEADLINE_PRESETS = [7, 14, 30]

const MODE_ICONS: Record<string, ReactElement> = {
    prospecting: <TbTarget />,
    discovering: <TbSearch />,
    closing: <TbTrophy />,
}

/**
 * Short, scannable mode copy. The API descriptions are long boilerplate and
 * currently arrive with mis-encoded apostrophes ("repГÇÖs"), so they're only
 * used as a fallback for modes we don't recognise.
 */
const MODE_DESCRIPTIONS: Record<string, string> = {
    prospecting: 'Early-stage outreach and rapport.',
    discovering: 'Mid-stage needs and trust building.',
    closing: 'Final-stage objections and agreement.',
}

const emptyScenarioFormValues: ScenarioFormSchema = {
    title: '',
    salesDivisionId: '',
    modeIds: [],
    persona: '',
    deadline: 0,
    scenario: '',
    message: '',
    document_content: '',
    document_filename: '',
}

const validationSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }).max(255, 'Title too long!'),
    salesDivisionId: z.string().min(1, { message: 'Division is required' }),
    modeIds: z.array(z.string()).min(1, { message: 'Select at least one mode' }),
    persona: z.string().min(1, { message: 'Persona is required' }),
    deadline: z.union([z.string(), z.number()]).pipe(
        z.coerce
            .number()
            .min(1, { message: 'Deadline must be at least 1 day' })
            .max(365, 'Deadline too long!'),
    ),
    scenario: z
        .string()
        .min(1, { message: 'Scenario description is required' })
        .max(SCENARIO_MAX_LENGTH, 'Scenario too long!'),
    message: z.string().max(MESSAGE_MAX_LENGTH, 'Message too long!').optional(),
    document_content: z.string().optional(),
    document_filename: z.string().optional(),
})

const defaultModeOptions: ScenarioFormOption[] = [
    { label: 'Role Play', value: 'Role Play' },
    { label: 'Practice', value: 'Practice' },
    { label: 'Coaching', value: 'Coaching' },
]

const defaultPersonaOptions: PersonaFormOption[] = [
    { label: 'Enterprise CTO', value: 'Enterprise CTO' },
    { label: 'SMB Owner', value: 'SMB Owner' },
    { label: 'Budget-Conscious Manager', value: 'Budget-Conscious Manager' },
    { label: 'Technical Lead', value: 'Technical Lead' },
    { label: 'Procurement Director', value: 'Procurement Director' },
    { label: 'Existing Customer - VP', value: 'Existing Customer - VP' },
    { label: 'Operations Manager', value: 'Operations Manager' },
    { label: 'Decision Maker - CEO', value: 'Decision Maker - CEO' },
    { label: 'Finance Director', value: 'Finance Director' },
    { label: 'Committee of Decision Makers', value: 'Committee of Decision Makers' },
]

const FULL_PIPELINE_VALUE = '__full_pipeline__'

type ScenarioFormProps = {
    initialValues?: ScenarioFormSchema
    /** Changes when switching create/edit or when edit payload is hydrated. */
    formResetKey?: string
    isEditMode?: boolean
    modeOptions?: ScenarioFormOption[]
    personaOptions?: PersonaFormOption[]
    divisionOptions?: DivisionFormOption[]
    divisionsData?: SalesDivision[]
    divisionsLoading?: boolean
    personasLoading?: boolean
    onSalesDivisionChange?: (customerSegmentId: string | null) => void
    personasData?: AiPersonaListItem[]
    formRef?: RefObject<HTMLFormElement | null>
    /** Active step, owned by the drawer so the footer can label its action. */
    step: ScenarioStepId
    onStepChange: (step: ScenarioStepId) => void
    onDirtyChange?: (dirty: boolean) => void
    onSubmit: (values: ScenarioFormSchema) => void
    onCancel: () => void
}

/**
 * Scenario create/edit form, split into three steps: what the rep is selling
 * into (context), how they'll practise (training), and the brief itself.
 *
 * Steps are navigation, not gates — submit works from anywhere and routes the
 * user to the first step that still has a problem.
 */
const ScenarioForm = ({
    initialValues,
    formResetKey = 'create',
    modeOptions: modeOptionsProp,
    personaOptions: personaOptionsProp,
    divisionOptions = [],
    divisionsData = [],
    divisionsLoading = false,
    personasLoading = false,
    onSalesDivisionChange,
    personasData,
    formRef,
    step,
    onStepChange,
    onDirtyChange,
    onSubmit,
}: ScenarioFormProps) => {
    const [personaPopupOpen, setPersonaPopupOpen] = useState(false)
    const [personaForPopup, setPersonaForPopup] =
        useState<AiPersonaListItem | null>(null)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const modeOptions = modeOptionsProp ?? defaultModeOptions
    const personaOptionsList = personaOptionsProp ?? defaultPersonaOptions

    const {
        handleSubmit,
        formState: { errors, isDirty },
        control,
        watch,
        setValue,
        reset,
    } = useForm<ScenarioFormSchema>({
        defaultValues: initialValues || emptyScenarioFormValues,
        resolver: zodResolver(validationSchema),
    })

    const values = watch()
    const {
        salesDivisionId,
        persona: selectedPersonaId,
        deadline,
        document_filename: documentFilename,
    } = values

    const selectedPersona = personasData?.find(
        (p) => p.persona_id === selectedPersonaId,
    )
    const selectedDivision = divisionsData.find(
        (d) => d.sales_division_id === salesDivisionId,
    )
    const selectedDivisionSegmentName =
        selectedDivision?.customer_segment?.name?.trim() || null
    const selectedDivisionProductNames = (selectedDivision?.products ?? [])
        .map((product) => product.name?.trim())
        .filter((name): name is string => Boolean(name))
    const prevSalesDivisionIdRef = useRef('')

    useEffect(() => {
        const nextValues = initialValues || emptyScenarioFormValues
        reset(nextValues)
        prevSalesDivisionIdRef.current = nextValues.salesDivisionId
    }, [formResetKey, initialValues, reset])

    useEffect(() => {
        onDirtyChange?.(isDirty)
    }, [isDirty, onDirtyChange])

    useEffect(() => {
        const division = divisionsData.find(
            (d) => d.sales_division_id === salesDivisionId,
        )
        onSalesDivisionChange?.(division?.customer_segment_id ?? null)

        // Only clear persona when the user switches division — not on initial edit load.
        if (
            prevSalesDivisionIdRef.current &&
            salesDivisionId &&
            prevSalesDivisionIdRef.current !== salesDivisionId
        ) {
            setValue('persona', '', {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            })
        }
        prevSalesDivisionIdRef.current = salesDivisionId
    }, [salesDivisionId, divisionsData, onSalesDivisionChange, setValue])

    const sortedModeOptions = useMemo(
        () =>
            [...modeOptions].sort(
                (a, b) =>
                    (MODE_PIPELINE_ORDER[a.label.toLowerCase()] ?? 0) -
                    (MODE_PIPELINE_ORDER[b.label.toLowerCase()] ?? 0),
            ),
        [modeOptions],
    )

    const divisionPickerOptions: EntityOption[] = useMemo(
        () =>
            divisionOptions.map((option) => ({
                value: option.value,
                label: option.label,
                description: option.segmentName,
                keywords: option.productNames,
                meta: option.productNames?.length ? (
                    <MetaTagList
                        items={option.productNames}
                        tone="product"
                        variant="quiet"
                        max={3}
                    />
                ) : undefined,
            })),
        [divisionOptions],
    )

    const personaPickerOptions: EntityOption[] = useMemo(
        () =>
            personaOptionsList.map((option) => ({
                value: option.value,
                label: option.label,
                description: option.role,
                trailing: personasData ? (
                    <button
                        type="button"
                        aria-label={`View ${option.label} details`}
                        className="rounded p-1 text-gray-400 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        onClick={(event) => {
                            event.stopPropagation()
                            const found = personasData.find(
                                (p) => p.persona_id === option.value,
                            )
                            if (found) {
                                setPersonaForPopup(found)
                                setPersonaPopupOpen(true)
                            }
                        }}
                    >
                        <TbInfoCircle className="text-base" />
                    </button>
                ) : undefined,
            })),
        [personaOptionsList, personasData],
    )

    /** Rail state: error beats complete, complete means every required field is set. */
    const stepStatuses = useMemo(() => {
        const statusFor = (stepId: ScenarioStepId): StepStatus => {
            const fields = FIELDS_BY_STEP[stepId]
            if (fields.some((field) => errors[field])) return 'error'
            const complete = fields.every((field) => {
                if (field === 'message') return true
                const value = values[field]
                if (Array.isArray(value)) return value.length > 0
                if (typeof value === 'number') return value > 0
                return Boolean(value)
            })
            if (complete) return 'complete'
            return stepId === step ? 'active' : 'incomplete'
        }

        return SCENARIO_STEPS.map((item) => ({
            id: item.id,
            label: item.label,
            status: statusFor(item.id),
        }))
    }, [errors, values, step])

    const handleFileUpload = async (files: File[]) => {
        if (!files?.length) return
        const file = files[0]
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB')
            return
        }
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Only PDF, DOC, and DOCX files are allowed')
            return
        }
        setUploadError(null)
        setUploadLoading(true)
        try {
            const response = await apiUploadDocument(file)
            if (response.success && response.summary) {
                setValue('document_content', response.summary, {
                    shouldDirty: true,
                })
                setValue('document_filename', response.filename, {
                    shouldDirty: true,
                })
            } else {
                setUploadError(response.error ?? 'Upload failed')
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { detail?: string } } })
                ?.response?.data?.detail ?? 'Upload failed'
            setUploadError(typeof message === 'string' ? message : 'Upload failed')
        } finally {
            setUploadLoading(false)
        }
    }

    const clearDocument = () => {
        setValue('document_content', '', { shouldDirty: true })
        setValue('document_filename', '', { shouldDirty: true })
        setUploadError(null)
    }

    /** Send the user to the first step that still has an error. */
    const onInvalid = (formErrors: typeof errors) => {
        const firstBrokenStep = SCENARIO_STEPS.find((item) =>
            FIELDS_BY_STEP[item.id].some((field) => formErrors[field]),
        )
        if (firstBrokenStep && firstBrokenStep.id !== step) {
            onStepChange(firstBrokenStep.id)
        }
    }

    const deadlineDueDate = deadline
        ? dayjs().add(Number(deadline), 'day').format('MMM D, YYYY')
        : null

    return (
        <Form ref={formRef} onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <div className="space-y-6">
                <StepRail
                    steps={stepStatuses}
                    activeId={step}
                    onStepSelect={(id) => onStepChange(id as ScenarioStepId)}
                />

                {step === 'context' ? (
                    <FormSection title="Context">
                        <Controller
                            name="salesDivisionId"
                            control={control}
                            render={({ field }) => (
                                <Field
                                    label="Sales division"
                                    required
                                    description="Sets the products and segment."
                                    error={errors.salesDivisionId?.message}
                                >
                                    <EntityPicker
                                        options={divisionPickerOptions}
                                        selectedIds={field.value ? [field.value] : []}
                                        loading={divisionsLoading}
                                        invalid={Boolean(errors.salesDivisionId)}
                                        searchPlaceholder="Search divisions…"
                                        emptyState={
                                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                                No sales divisions yet.
                                            </p>
                                        }
                                        onSelect={field.onChange}
                                    />
                                </Field>
                            )}
                        />

                        {selectedDivision ? (
                            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-800/40">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Reps practise against
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-1">
                                    {selectedDivisionSegmentName ? (
                                        <MetaTag tone="segment" variant="quiet">
                                            {selectedDivisionSegmentName}
                                        </MetaTag>
                                    ) : (
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                            No segment set
                                        </span>
                                    )}
                                    <MetaTagList
                                        items={selectedDivisionProductNames}
                                        tone="product"
                                        variant="quiet"
                                        emptyLabel="No products"
                                    />
                                </div>
                            </div>
                        ) : null}

                        <Controller
                            name="persona"
                            control={control}
                            render={({ field }) => (
                                <Field
                                    label="Persona"
                                    required
                                    description="The AI buyer your rep will face."
                                    hint={
                                        personasLoading && salesDivisionId ? (
                                            <span className="flex items-center gap-1.5">
                                                <Spinner size={12} /> Loading
                                            </span>
                                        ) : undefined
                                    }
                                    error={errors.persona?.message}
                                >
                                    <EntityPicker
                                        options={personaPickerOptions}
                                        selectedIds={field.value ? [field.value] : []}
                                        disabled={!salesDivisionId}
                                        disabledMessage="Select a division first."
                                        loading={
                                            personasLoading &&
                                            !personaPickerOptions.some(
                                                (option) =>
                                                    option.value === field.value,
                                            )
                                        }
                                        invalid={Boolean(errors.persona)}
                                        searchPlaceholder="Search personas…"
                                        emptyState={
                                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                                No personas for this segment.
                                            </p>
                                        }
                                        onSelect={field.onChange}
                                    />
                                </Field>
                            )}
                        />

                        {selectedPersona ? (
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary-deep"
                                onClick={() => {
                                    setPersonaForPopup(selectedPersona)
                                    setPersonaPopupOpen(true)
                                }}
                            >
                                <TbInfoCircle className="text-sm" />
                                View {selectedPersona.name}&apos;s profile
                            </button>
                        ) : null}
                    </FormSection>
                ) : null}

                {step === 'training' ? (
                    <FormSection title="Training design">
                        <Controller
                            name="modeIds"
                            control={control}
                            render={({ field }) => {
                                const allModeIds = sortedModeOptions.map(
                                    (option) => option.value,
                                )
                                const selected = field.value ?? []
                                const isFullPipeline =
                                    selected.length > 1 &&
                                    allModeIds.length > 0 &&
                                    allModeIds.every((id) => selected.includes(id))
                                const activeValue = isFullPipeline
                                    ? FULL_PIPELINE_VALUE
                                    : (selected[0] ?? '')

                                return (
                                    <Field
                                        label="Mode"
                                        required
                                        description="One stage, or the full pipeline."
                                        error={errors.modeIds?.message}
                                    >
                                        <OptionCardGroup label="Training mode">
                                            {sortedModeOptions.map((option) => {
                                                const key =
                                                    option.label.toLowerCase()
                                                return (
                                                    <OptionCard
                                                        key={option.value}
                                                        name="scenario-mode"
                                                        value={option.value}
                                                        icon={
                                                            MODE_ICONS[key] ?? (
                                                                <TbTarget />
                                                            )
                                                        }
                                                        title={formatModeName(
                                                            option.label,
                                                        )}
                                                        description={
                                                            MODE_DESCRIPTIONS[
                                                                key
                                                            ] ?? option.description
                                                        }
                                                        selected={
                                                            activeValue ===
                                                            option.value
                                                        }
                                                        onSelect={(value) =>
                                                            field.onChange([value])
                                                        }
                                                    />
                                                )
                                            })}
                                            {allModeIds.length > 1 ? (
                                                <OptionCard
                                                    name="scenario-mode"
                                                    value={FULL_PIPELINE_VALUE}
                                                    icon={<TbRoute />}
                                                    title="Full pipeline"
                                                    badge={
                                                        <MetaTag
                                                            tone="neutral"
                                                            variant="quiet"
                                                        >
                                                            {allModeIds.length}{' '}
                                                            modes
                                                        </MetaTag>
                                                    }
                                                    description={`${sortedModeOptions
                                                        .map((option) =>
                                                            formatModeName(
                                                                option.label,
                                                            ),
                                                        )
                                                        .join(' → ')}, in order.`}
                                                    selected={isFullPipeline}
                                                    onSelect={() =>
                                                        field.onChange(allModeIds)
                                                    }
                                                />
                                            ) : null}
                                        </OptionCardGroup>
                                    </Field>
                                )
                            }}
                        />

                        <Controller
                            name="deadline"
                            control={control}
                            render={({ field }) => {
                                const numericValue = Number(field.value) || 0
                                const isPreset =
                                    DEADLINE_PRESETS.includes(numericValue)

                                return (
                                    <Field
                                        label="Deadline"
                                        required
                                        description="Days to complete after assignment."
                                        hint={
                                            deadlineDueDate
                                                ? `Due ${deadlineDueDate}`
                                                : undefined
                                        }
                                        error={errors.deadline?.message}
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            {DEADLINE_PRESETS.map((preset) => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    aria-pressed={
                                                        numericValue === preset
                                                    }
                                                    className={classNames(
                                                        'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                                                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                                        numericValue === preset
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:text-gray-300',
                                                    )}
                                                    onClick={() =>
                                                        field.onChange(preset)
                                                    }
                                                >
                                                    {preset} days
                                                </button>
                                            ))}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    aria-label="Custom deadline in days"
                                                    placeholder="Custom"
                                                    value={
                                                        numericValue && !isPreset
                                                            ? numericValue
                                                            : ''
                                                    }
                                                    className={classNames(
                                                        'w-24 rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800/40 dark:text-gray-100',
                                                        numericValue && !isPreset
                                                            ? 'border-primary'
                                                            : 'border-gray-200 dark:border-white/10',
                                                    )}
                                                    onChange={(event) => {
                                                        const next =
                                                            event.target.value
                                                        if (
                                                            next === '' ||
                                                            /^\d+$/.test(next)
                                                        ) {
                                                            field.onChange(
                                                                next === ''
                                                                    ? 0
                                                                    : parseInt(
                                                                          next,
                                                                          10,
                                                                      ),
                                                            )
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    days
                                                </span>
                                            </div>
                                        </div>
                                    </Field>
                                )
                            }}
                        />
                    </FormSection>
                ) : null}

                {step === 'brief' ? (
                    <FormSection title="Brief">
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="Title"
                                    required
                                    description="What reps see in their list."
                                    placeholder="e.g. Cold outreach to supermarket procurement"
                                    autoComplete="off"
                                    data-autofocus
                                    error={errors.title?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="scenario"
                            control={control}
                            render={({ field }) => (
                                <TextAreaField
                                    label="Scenario"
                                    required
                                    description="The situation, the stakes, and what winning looks like."
                                    placeholder="You're meeting the procurement lead of a 40-store chain. They currently buy from a competitor…"
                                    rows={6}
                                    maxLength={SCENARIO_MAX_LENGTH}
                                    error={errors.scenario?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="message"
                            control={control}
                            render={({ field }) => (
                                <TextAreaField
                                    label="Message to participants"
                                    optional
                                    description="Coaching note shown with the brief."
                                    placeholder="Focus on discovery questions before pitching price."
                                    rows={3}
                                    maxLength={MESSAGE_MAX_LENGTH}
                                    error={errors.message?.message}
                                    {...field}
                                    value={field.value ?? ''}
                                />
                            )}
                        />

                        <Field
                            label="Supporting document"
                            optional
                            hint="PDF, DOC, DOCX · max 10MB"
                            description="Background the AI buyer will know."
                        >
                            {documentFilename ? (
                                <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2.5 dark:bg-primary/10">
                                    <TbFileUpload
                                        className="shrink-0 text-lg text-primary"
                                        aria-hidden
                                    />
                                    <span className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-gray-100">
                                        {documentFilename}
                                    </span>
                                    <button
                                        type="button"
                                        aria-label="Remove document"
                                        className="rounded p-1 text-gray-400 transition-colors hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        onClick={clearDocument}
                                    >
                                        <TbX className="text-base" />
                                    </button>
                                </div>
                            ) : (
                                <Upload
                                    draggable
                                    showList={false}
                                    accept=".pdf,.doc,.docx"
                                    disabled={uploadLoading}
                                    // Override the 7rem default dropzone — an
                                    // optional field shouldn't dominate the step.
                                    className="!min-h-0 rounded-xl border border-gray-200 transition-colors hover:border-primary dark:border-white/10"
                                    onChange={(files) => handleFileUpload(files)}
                                >
                                    <div className="flex items-center justify-center gap-2.5 px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {uploadLoading ? (
                                            <Spinner size={16} />
                                        ) : (
                                            <TbFileUpload
                                                className="text-lg"
                                                aria-hidden
                                            />
                                        )}
                                        <span>
                                            {uploadLoading
                                                ? 'Uploading…'
                                                : 'Click to upload or drag and drop'}
                                        </span>
                                    </div>
                                </Upload>
                            )}
                            {uploadError ? (
                                <div className="mt-2">
                                    <InlineNotice tone="danger">
                                        {uploadError}
                                    </InlineNotice>
                                </div>
                            ) : null}
                        </Field>
                    </FormSection>
                ) : null}
            </div>

            {personaForPopup ? (
                <Dialog
                    isOpen={personaPopupOpen}
                    width={560}
                    contentClassName="!p-6 !rounded-xl !bg-gray-100 dark:!bg-gray-900"
                    overlayClassName="!bg-black/20 dark:!bg-gray-900/40 !backdrop-blur-md"
                    shouldFocusAfterRender={false}
                    onClose={() => {
                        setPersonaPopupOpen(false)
                        setPersonaForPopup(null)
                    }}
                    onRequestClose={() => {
                        setPersonaPopupOpen(false)
                        setPersonaForPopup(null)
                    }}
                >
                    <PersonaCard
                        persona={personaForPopup as ScenarioLibraryPersona}
                    />
                </Dialog>
            ) : null}
        </Form>
    )
}

export default ScenarioForm
