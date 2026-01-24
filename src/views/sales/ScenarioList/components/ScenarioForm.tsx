import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Upload from '@/components/ui/Upload'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiOutlineCloudUpload } from 'react-icons/hi'

type ScenarioFormSchema = {
    title: string
    mode: string
    persona: string
    deadline: number
    scenario: string
    message?: string
}

const validationSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }).max(255, 'Title too long!'),
    mode: z.string().min(1, { message: 'Mode is required' }),
    persona: z.string().min(1, { message: 'Persona is required' }),
    deadline: z.union([z.string(), z.number()]).pipe(
        z.coerce.number().min(1, { message: 'Deadline must be at least 1 day' }).max(365, 'Deadline too long!')
    ),
    scenario: z.string().min(1, { message: 'Scenario description is required' }).max(1000, 'Scenario too long!'),
    message: z.string().max(1000, 'Message too long!').optional(),
})

const modeOptions = [
    { label: 'Role Play', value: 'Role Play' },
    { label: 'Practice', value: 'Practice' },
    { label: 'Coaching', value: 'Coaching' },
]

const personaOptions = [
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
    isEditMode?: boolean
    onSubmit: (values: ScenarioFormSchema) => void
    onCancel: () => void
}

const ScenarioForm = ({ initialValues, isEditMode, onSubmit, onCancel }: ScenarioFormProps) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [characterCount, setCharacterCount] = useState(
        initialValues?.scenario?.length || 0
    )

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
    } = useForm<ScenarioFormSchema>({
        defaultValues: initialValues || {
            title: '',
            mode: '',
            persona: '',
            deadline: 0,
            scenario: '',
            message: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const scenarioValue = watch('scenario')

    const handleCharacterCount = (value: string) => {
        setCharacterCount(value.length)
    }

    const handleFileUpload = (files: File[]) => {
        if (files && files.length > 0) {
            const file = files[0]
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB')
                return
            }
            // Check file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if (!allowedTypes.includes(file.type)) {
                alert('Only PDF, DOC, and DOCX files are allowed')
                return
            }
            setUploadedFile(file)
        }
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
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
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Mode"
                    asterisk
                    invalid={Boolean(errors.mode)}
                    errorMessage={errors.mode?.message}
                >
                    <Controller
                        name="mode"
                        control={control}
                        render={({ field }) => (
                            <Select
                                placeholder="Select a mode"
                                options={modeOptions}
                                value={modeOptions.find(opt => opt.value === field.value)}
                                onChange={(option) => field.onChange(option?.value)}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Persona"
                    asterisk
                    invalid={Boolean(errors.persona)}
                    errorMessage={errors.persona?.message}
                >
                    <Controller
                        name="persona"
                        control={control}
                        render={({ field }) => (
                            <Select
                                placeholder="Select a persona"
                                options={personaOptions}
                                value={personaOptions.find(opt => opt.value === field.value)}
                                onChange={(option) => field.onChange(option?.value)}
                            />
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
                                    className="input input-md h-[120px] w-full"
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
                                className="input input-md h-[80px] w-full"
                                placeholder="Optional message for participants..."
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem label="Upload Document (Optional)">
                    <Upload
                        draggable
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx"
                    >
                        <div className="my-8 text-center">
                            <div className="text-6xl mb-4 flex justify-center">
                                <HiOutlineCloudUpload className="text-gray-400" />
                            </div>
                            <p className="font-semibold">
                                <span className="text-gray-800 dark:text-white">
                                    Click to upload or drag and drop
                                </span>
                            </p>
                            <p className="mt-1 text-xs opacity-60 dark:text-white">
                                PDF, DOC, DOCX (Max 10MB)
                            </p>
                            {uploadedFile && (
                                <p className="mt-2 text-sm text-primary font-medium">
                                    Selected: {uploadedFile.name}
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
