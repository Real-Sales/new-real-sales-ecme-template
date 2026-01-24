import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Badge from '@/components/ui/Badge'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { components } from 'react-select'
import { Form, FormItem } from '@/components/ui/Form'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { ControlProps, OptionProps } from 'react-select'
import classNames from '@/utils/classNames'

type FormSchema = {
    status: string
    mode: string
    persona: string
}

type Option = {
    value: string
    label: string
    className?: string
}

const { Control } = components

const statusOptions: Option[] = [
    { value: 'all', label: 'All Status', className: 'bg-gray-400' },
    { value: 'active', label: 'Active', className: 'bg-emerald-500' },
    { value: 'inactive', label: 'Inactive', className: 'bg-gray-500' },
]

const modeOptions: Option[] = [
    { value: 'all', label: 'All Modes', className: 'bg-gray-400' },
    { value: 'Role Play', label: 'Role Play', className: 'bg-blue-500' },
    { value: 'Practice', label: 'Practice', className: 'bg-purple-500' },
    { value: 'Coaching', label: 'Coaching', className: 'bg-green-500' },
]

const personaOptions: Option[] = [
    { value: 'all', label: 'All Personas' },
    { value: 'Enterprise CTO', label: 'Enterprise CTO' },
    { value: 'SMB Owner', label: 'SMB Owner' },
    { value: 'Budget-Conscious Manager', label: 'Budget-Conscious Manager' },
    { value: 'Technical Lead', label: 'Technical Lead' },
    { value: 'Procurement Director', label: 'Procurement Director' },
    { value: 'Existing Customer - VP', label: 'Existing Customer - VP' },
    { value: 'Operations Manager', label: 'Operations Manager' },
    { value: 'Decision Maker - CEO', label: 'Decision Maker - CEO' },
    { value: 'Finance Director', label: 'Finance Director' },
    { value: 'Committee of Decision Makers', label: 'Committee of Decision Makers' },
]

const CustomSelectOption = (props: OptionProps<Option>) => {
    return (
        <DefaultOption<Option>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    {data.className && <Badge className={data.className} />}
                    <span className="ml-2 rtl:mr-2">{label}</span>
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<Option>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && selected.className && (
                <Badge className={classNames('ml-4', selected.className)} />
            )}
            {children}
        </Control>
    )
}

const validationSchema: ZodType<FormSchema> = z.object({
    status: z.string(),
    mode: z.string(),
    persona: z.string(),
})

type ScenarioListTableFilterProps = {
    onFilterChange: (filters: FormSchema) => void
    defaultValues: FormSchema
}

const ScenarioListTableFilter = ({ onFilterChange, defaultValues }: ScenarioListTableFilterProps) => {
    const [filterIsOpen, setFilterIsOpen] = useState(false)

    const { handleSubmit, control, reset } = useForm<FormSchema>({
        defaultValues,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        onFilterChange(values)
        setFilterIsOpen(false)
    }

    const handleReset = () => {
        const resetValues = {
            status: 'all',
            mode: 'all',
            persona: 'all',
        }
        reset(resetValues)
        onFilterChange(resetValues)
        setFilterIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => setFilterIsOpen(true)}>
                Filter
            </Button>
            <Drawer
                title="Filter Scenarios"
                isOpen={filterIsOpen}
                onClose={() => setFilterIsOpen(false)}
                onRequestClose={() => setFilterIsOpen(false)}
            >
                <Form
                    className="h-full"
                    containerClassName="flex flex-col justify-between h-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div>
                        <FormItem label="Status">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        options={statusOptions}
                                        {...field}
                                        value={statusOptions.filter(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                        components={{
                                            Option: CustomSelectOption,
                                            Control: CustomControl,
                                        }}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label="Mode">
                            <Controller
                                name="mode"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        options={modeOptions}
                                        {...field}
                                        value={modeOptions.filter(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                        components={{
                                            Option: CustomSelectOption,
                                            Control: CustomControl,
                                        }}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label="Persona">
                            <Controller
                                name="persona"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        options={personaOptions}
                                        {...field}
                                        value={personaOptions.filter(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                        components={{
                                            Option: CustomSelectOption,
                                        }}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="default"
                            type="button"
                            className="flex-1"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button 
                            variant="solid" 
                            type="submit"
                            className="bg-primary hover:bg-primary-deep text-neutral border-none flex-1"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default ScenarioListTableFilter
