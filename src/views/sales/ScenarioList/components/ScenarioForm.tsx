import {
    useState,
    useRef,
    useEffect,
    type ComponentProps,
    type RefObject,
} from 'react'
import Input from '@/components/ui/Input'
import Select, { Option as SelectOption } from '@/components/ui/Select'
import Tag from '@/components/ui/Tag'
import Upload from '@/components/ui/Upload'
import Dialog from '@/components/ui/Dialog'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiOutlineCloudUpload } from 'react-icons/hi'
import { TbInfoCircle } from 'react-icons/tb'
import { apiUploadDocument } from '@/services/ScenarioLibraryService'
import { PersonaCard } from './ScenarioDetail'
import type { AiPersonaListItem, ScenarioLibraryPersona } from '../types'
import type { SalesDivision } from '@/services/SalesDivisionsService'
import { MODE_PIPELINE_ORDER } from '@/utils/modePipeline'

export type ScenarioFormOption = { label: string; value: string }
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
        z.coerce.number().min(1, { message: 'Deadline must be at least 1 day' }).max(365, 'Deadline too long!')
    ),
    scenario: z.string().min(1, { message: 'Scenario description is required' }).max(1000, 'Scenario too long!'),
    message: z.string().max(1000, 'Message too long!').optional(),
    document_content: z.string().optional(),
    document_filename: z.string().optional(),
})

const defaultModeOptions: ScenarioFormOption[] = [
    { label: 'Role Play', value: 'Role Play' },
    { label: 'Practice', value: 'Practice' },
    { label: 'Coaching', value: 'Coaching' },
]

const defaultPersonaOptions: ScenarioFormOption[] = [
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
    onSubmit: (values: ScenarioFormSchema) => void
    onCancel: () => void
}

const ScenarioForm = ({
    initialValues,
    formResetKey = 'create',
    isEditMode,
    modeOptions: modeOptionsProp,
    personaOptions: personaOptionsProp,
    divisionOptions = [],
    divisionsData = [],
    divisionsLoading = false,
    personasLoading = false,
    onSalesDivisionChange,
    personasData,
    formRef,
    onSubmit,
    onCancel,
}: ScenarioFormProps) => {
    const [personaPopupOpen, setPersonaPopupOpen] = useState(false)
    const [personaForPopup, setPersonaForPopup] = useState<AiPersonaListItem | null>(null)
    const [personaMenuOpenByUser, setPersonaMenuOpenByUser] = useState(false)
    const openingPersonaPopupRef = useRef(false)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [characterCount, setCharacterCount] = useState(
        initialValues?.scenario?.length || 0
    )

    const modeOptions = modeOptionsProp ?? defaultModeOptions
    const personaOptionsList = personaOptionsProp ?? defaultPersonaOptions

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
        reset,
    } = useForm<ScenarioFormSchema>({
        defaultValues: initialValues || emptyScenarioFormValues,
        resolver: zodResolver(validationSchema),
    })

    const scenarioValue = watch('scenario')
    const documentFilename = watch('document_filename')
    const selectedPersonaId = watch('persona')
    const salesDivisionId = watch('salesDivisionId')
    const selectedPersona = personasData?.find((p) => p.persona_id === selectedPersonaId)
    const selectedDivision = divisionsData.find(
        (d) => d.sales_division_id === salesDivisionId,
    )
    const selectedDivisionSegmentName =
        selectedDivision?.customer_segment?.name?.trim() || null
    const selectedDivisionProducts = selectedDivision?.products ?? []
    const prevSalesDivisionIdRef = useRef('')

    useEffect(() => {
        const nextValues = initialValues || emptyScenarioFormValues
        reset(nextValues)
        setCharacterCount(nextValues.scenario?.length || 0)
        prevSalesDivisionIdRef.current = nextValues.salesDivisionId
    }, [formResetKey, initialValues, reset])

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

    const handleCharacterCount = (value: string) => {
        setCharacterCount(value.length)
    }

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
                setValue('document_content', response.summary)
                setValue('document_filename', response.filename)
            } else {
                setUploadError(response.error ?? 'Upload failed')
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Upload failed'
            setUploadError(typeof message === 'string' ? message : 'Upload failed')
        } finally {
            setUploadLoading(false)
        }
    }

    return (
        <Form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <FormItem
                    label="Title"
                    asterisk
                    invalid={Boolean(errors.title)}
                    errorMessage={errors.title?.message}
                >
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Enter scenario title..."
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Sales division"
                    asterisk
                    invalid={Boolean(errors.salesDivisionId)}
                    errorMessage={errors.salesDivisionId?.message}
                >
                    <Controller
                        name="salesDivisionId"
                        control={control}
                        render={({ field }) => (
                            <Select<DivisionFormOption>
                                loading={divisionsLoading}
                                className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                                placeholder="Select division"
                                options={divisionOptions}
                                value={
                                    divisionOptions.find(
                                        (opt) => opt.value === field.value,
                                    ) ?? null
                                }
                                onChange={(option) =>
                                    field.onChange(option?.value ?? '')
                                }
                                components={{
                                    Option: (props) => (
                                        <SelectOption<DivisionFormOption>
                                            {...(props as ComponentProps<
                                                typeof SelectOption<DivisionFormOption>
                                            >)}
                                            customLabel={(data, label) => (
                                                <div className="flex flex-col gap-1.5 py-1 min-w-0">
                                                    <span className="font-medium leading-tight">
                                                        {label}
                                                    </span>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            Customer segment
                                                        </span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {data.segmentName ? (
                                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                                                    {data.segmentName}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                    Not set
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            Products
                                                        </span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(data.productNames?.length
                                                                ? data.productNames
                                                                : []
                                                            ).map((name) => (
                                                                <span
                                                                    key={name}
                                                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary dark:bg-primary/20 dark:text-primary-mild"
                                                                >
                                                                    {name}
                                                                </span>
                                                            ))}
                                                            {!data.productNames?.length ? (
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                    None assigned
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    ),
                                }}
                            />
                        )}
                    />
                    {salesDivisionId && selectedDivision ? (
                        <div className="mt-2.5 space-y-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Customer segment
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedDivisionSegmentName ? (
                                        <Tag className="rounded-full border-0 bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                            {selectedDivisionSegmentName}
                                        </Tag>
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            Not set
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Products
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedDivisionProducts.length > 0 ? (
                                        selectedDivisionProducts.map((product) => (
                                            <Tag
                                                key={product.product_id || product.name}
                                                className="rounded-full border-0 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary-mild"
                                            >
                                                {product.name}
                                            </Tag>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            No products assigned
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </FormItem>

                <FormItem
                    label="Mode(s)"
                    asterisk
                    invalid={Boolean(errors.modeIds)}
                    errorMessage={errors.modeIds?.message}
                >
                    <Controller
                        name="modeIds"
                        control={control}
                        render={({ field }) => {
                            const sortedModeOptions = [...modeOptions].sort(
                                (a, b) =>
                                    (MODE_PIPELINE_ORDER[a.label.toLowerCase()] ?? 0) -
                                    (MODE_PIPELINE_ORDER[b.label.toLowerCase()] ?? 0),
                            )
                            const allModeIds = sortedModeOptions.map((o) => o.value)
                            const selected = field.value ?? []
                            const isFullPipeline =
                                selected.length > 1 &&
                                allModeIds.length > 0 &&
                                allModeIds.every((id) => selected.includes(id))
                            const plan: 'single' | 'full' = isFullPipeline ? 'full' : 'single'
                            const singleValue = plan === 'single' ? (selected[0] ?? '') : ''

                            return (
                                <div className="space-y-3">
                                    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-1 shadow-md">
                                        <button
                                            type="button"
                                            onClick={() => field.onChange(singleValue ? [singleValue] : [])}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                                plan === 'single'
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            Single Mode
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange(allModeIds)}
                                            disabled={allModeIds.length === 0}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                                plan === 'full'
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            All 3 Modes
                                        </button>
                                    </div>

                                    {plan === 'single' ? (
                                        <Select
                                            className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                                            placeholder="Select a mode"
                                            options={sortedModeOptions}
                                            value={sortedModeOptions.find((opt) => opt.value === singleValue)}
                                            onChange={(option) => field.onChange(option?.value ? [option.value] : [])}
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            The rep completes{' '}
                                            <span className="font-semibold">
                                                {sortedModeOptions.map((o) => o.label).join(' → ')}
                                            </span>{' '}
                                            in order — they're automatically advanced to the next
                                            mode as soon as they finish the current one.
                                        </p>
                                    )}
                                </div>
                            )
                        }}
                    />
                </FormItem>

                <FormItem
                    label="Persona"
                    extra={
                        selectedPersona ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setPersonaForPopup(selectedPersona)
                                    setPersonaPopupOpen(true)
                                }}
                                className="cursor-pointer text-gray-500 hover:text-primary transition-colors p-0.5 rounded ml-1 inline-flex"
                                aria-label="View persona details"
                            >
                                <TbInfoCircle className="text-base" />
                            </button>
                        ) : undefined
                    }
                    asterisk
                    invalid={Boolean(errors.persona)}
                    errorMessage={errors.persona?.message}
                >
                    <Controller
                        name="persona"
                        control={control}
                        render={({ field }) => (
                            <>
                                <Select<PersonaFormOption>
                                    className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                                    placeholder={
                                        salesDivisionId
                                            ? personasLoading &&
                                              !personaOptionsList.some(
                                                  (opt) => opt.value === field.value,
                                              )
                                                ? 'Loading personas...'
                                                : 'Select a persona'
                                            : 'Select a division first'
                                    }
                                    isDisabled={
                                        !salesDivisionId ||
                                        (personasLoading &&
                                            !personaOptionsList.some(
                                                (opt) => opt.value === field.value,
                                            ))
                                    }
                                    options={personaOptionsList}
                                    value={
                                        personaOptionsList.find(
                                            (opt) => opt.value === field.value,
                                        ) ?? null
                                    }
                                    onChange={(option) =>
                                        field.onChange(option?.value ?? '')
                                    }
                                    menuIsOpen={personaMenuOpenByUser || personaPopupOpen}
                                    onMenuOpen={() => setPersonaMenuOpenByUser(true)}
                                    onMenuClose={() => {
                                        if (!openingPersonaPopupRef.current) {
                                            setPersonaMenuOpenByUser(false)
                                        }
                                    }}
                                    {...({
                                        onPersonaInfoClick: personasData
                                            ? (personaId: string) => {
                                                  const p = personasData.find((x) => x.persona_id === personaId)
                                                  if (p) {
                                                      setPersonaForPopup(p)
                                                      setPersonaPopupOpen(true)
                                                  }
                                              }
                                            : undefined,
                                    } as Record<string, unknown>)}
                                    classNames={{
                                        menuList: () =>
                                            'select-menu-list overflow-y-auto [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-xl [scrollbar-width:thin] [scrollbar-color:rgb(156_163_175)_transparent]',
                                    }}
                                    components={{
                                        Option: (props) => {
                                            const selectProps = props.selectProps as {
                                                onPersonaInfoClick?: (id: string) => void
                                            }
                                            return (
                                                <SelectOption<PersonaFormOption>
                                                    {...(props as React.ComponentProps<
                                                        typeof SelectOption<PersonaFormOption>
                                                    >)}
                                                    customLabel={(data, label) => (
                                                        <div className="flex items-center justify-between w-full gap-2 min-w-0">
                                                            <div className="flex flex-col py-0.5 min-w-0">
                                                                <span>{label}</span>
                                                                {data.role && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {data.role}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation()
                                                                    e.preventDefault()
                                                                    openingPersonaPopupRef.current = true
                                                                    selectProps?.onPersonaInfoClick?.(data.value)
                                                                    requestAnimationFrame(() => {
                                                                        openingPersonaPopupRef.current = false
                                                                    })
                                                                }}
                                                                className="shrink-0 p-1 rounded text-gray-500 hover:text-primary transition-colors"
                                                                aria-label="View persona details"
                                                            >
                                                                <TbInfoCircle className="text-base" />
                                                            </button>
                                                        </div>
                                                    )}
                                                />
                                            )
                                        },
                                    }}
                                />
                                {personaForPopup && (
                                    <Dialog
                                        isOpen={personaPopupOpen}
                                        onClose={() => {
                                            setPersonaPopupOpen(false)
                                            setPersonaForPopup(null)
                                            setPersonaMenuOpenByUser(true)
                                        }}
                                        onRequestClose={() => {
                                            setPersonaPopupOpen(false)
                                            setPersonaForPopup(null)
                                            setPersonaMenuOpenByUser(true)
                                        }}
                                        width={560}
                                        contentClassName="!p-6 !rounded-xl !bg-gray-100 dark:!bg-gray-900"
                                        overlayClassName="!bg-black/20 dark:!bg-gray-900/40 !backdrop-blur-md"
                                        shouldFocusAfterRender={false}
                                    >
                                        <PersonaCard persona={personaForPopup as ScenarioLibraryPersona} />
                                    </Dialog>
                                )}
                            </>
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Deadline (Days)"
                    asterisk
                    invalid={Boolean(errors.deadline)}
                    errorMessage={errors.deadline?.message}
                >
                    <Controller
                        name="deadline"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="Enter deadline in days"
                                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                {...field}
                                value={field.value === 0 ? '' : field.value}
                                onChange={(e) => {
                                    const value = e.target.value
                                    // Allow only numbers
                                    if (value === '' || /^\d+$/.test(value)) {
                                        field.onChange(value === '' ? 0 : parseInt(value))
                                    }
                                }}
                            />
                        )}
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                        Active for {watch('deadline') || 0} days
                    </p>
                </FormItem>

                <FormItem
                    label="Scenario"
                    asterisk
                    invalid={Boolean(errors.scenario)}
                    errorMessage={errors.scenario?.message}
                >
                    <Controller
                        name="scenario"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <textarea
                                    className="input input-md h-[120px] w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                    placeholder="Write your scenario description here..."
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e)
                                        handleCharacterCount(e.target.value)
                                    }}
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                                    {scenarioValue?.length || 0} characters
                                </p>
                            </div>
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Message"
                    invalid={Boolean(errors.message)}
                    errorMessage={errors.message?.message}
                >
                    <Controller
                        name="message"
                        control={control}
                        render={({ field }) => (
                            <textarea
                                className="input input-md h-[80px] w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-md"
                                placeholder="Optional message for participants..."
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem label="Upload Document (Optional)">
                    <Upload
                        draggable
                        onChange={(files) => handleFileUpload(files)}
                        accept=".pdf,.doc,.docx"
                        disabled={uploadLoading}
                    >
                        <div className="my-8 text-center">
                            <div className="text-6xl mb-4 flex justify-center">
                                <HiOutlineCloudUpload className="text-gray-400" />
                            </div>
                            <p className="font-semibold">
                                <span className="text-gray-800 dark:text-white">
                                    {uploadLoading ? 'Uploading...' : 'Click to upload or drag and drop'}
                                </span>
                            </p>
                            <p className="mt-1 text-xs opacity-60 dark:text-white">
                                PDF, DOC, DOCX (Max 10MB). Content will be extracted and used as document content.
                            </p>
                            {documentFilename && (
                                <p className="mt-2 text-sm text-primary font-medium">
                                    Uploaded: {documentFilename}
                                </p>
                            )}
                            {uploadError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                    {uploadError}
                                </p>
                            )}
                        </div>
                    </Upload>
                </FormItem>
            </div>
        </Form>
    )
}

export default ScenarioForm
export type { ScenarioFormSchema }
