import { useState } from 'react'
import type { ComponentType } from 'react'
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
import type { Scenario } from '../types'

type FormSchema = {
    status: string
    mode: string
    persona: string
    division: string
}

type Option = {
    value: string
    label: string
    className?: string
}

const SelectControl = components.Control as ComponentType<ControlProps<Option>>

const statusOptions: Option[] = [
    { value: 'all', label: 'All Status', className: 'bg-gray-400' },
    { value: 'active', label: 'Active', className: 'bg-emerald-500' },
    { value: 'inactive', label: 'Inactive', className: 'bg-gray-500' },
]

const buildModeOptions = (scenarios: Scenario[]): Option[] => {
    const modes = [...new Set(scenarios.map((s) => s.mode?.name).filter(Boolean))].sort() as string[]
    return [
        { value: 'all', label: 'All Modes', className: 'bg-gray-400' },
        ...modes.map((m) => ({ value: m, label: m, className: 'bg-blue-500' })),
    ]
}

const buildPersonaOptions = (scenarios: Scenario[]): Option[] => {
    const personas = [...new Set(scenarios.map((s) => s.persona?.name).filter(Boolean))].sort() as string[]
    return [
        { value: 'all', label: 'All Personas' },
        ...personas.map((p) => ({ value: p, label: p })),
    ]
}

const buildDivisionOptions = (
    scenarios: Scenario[],
    getDivisionName?: (scenario: Scenario) => string,
): Option[] => {
    const divisions = [
        ...new Set(
            scenarios
                .map(
                    (s) =>
                        getDivisionName?.(s)?.trim() ||
                        s.sales_division_name?.trim() ||
                        '',
                )
                .filter((name) => name && name !== '—'),
        ),
    ].sort() as string[]
    return [
        { value: 'all', label: 'All Divisions', className: 'bg-gray-400' },
        ...divisions.map((d) => ({ value: d, label: d, className: 'bg-primary' })),
    ]
}

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
        <SelectControl {...props}>
            {selected && selected.className && (
                <Badge className={classNames('ml-4', selected.className)} />
            )}
            {children}
        </SelectControl>
    )
}

const validationSchema: ZodType<FormSchema> = z.object({
    status: z.string(),
    mode: z.string(),
    persona: z.string(),
    division: z.string(),
})

type ScenarioListTableFilterProps = {
    scenarios: Scenario[]
    onFilterChange: (filters: FormSchema) => void
    defaultValues: FormSchema
    getDivisionName?: (scenario: Scenario) => string
}

const FILTER_FORM_ID = 'filter-scenarios-form'

const ScenarioListTableFilter = ({
    scenarios,
    onFilterChange,
    defaultValues,
    getDivisionName,
}: ScenarioListTableFilterProps) => {
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
            division: 'all',
        }
        reset(resetValues)
        onFilterChange(resetValues)
        setFilterIsOpen(false)
    }

    const handleApplyClick = () => {
        document.getElementById(FILTER_FORM_ID)?.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true })
        )
    }

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button
                size="sm"
                variant="default"
                type="button"
                className="flex-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200 dark:hover:!bg-gray-700 dark:hover:!border-gray-500"
                onClick={handleReset}
            >
                Reset
            </Button>
            <Button
                size="sm"
                variant="solid"
                type="button"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none rounded-md"
                onClick={handleApplyClick}
            >
                Apply Filters
            </Button>
        </div>
    )

    return (
        <>
            <Button size="sm" icon={<TbFilter />} className="rounded-md !bg-gray-50 dark:!bg-gray-800/50 !border !border-gray-200 dark:!border-gray-700 shadow-md" onClick={() => setFilterIsOpen(true)}>
                Filter
            </Button>
            <Drawer
                title="Filter Scenarios"
                isOpen={filterIsOpen}
                footer={DrawerFooter}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                footerClass="!bg-gray-100 dark:!bg-gray-900 !p-3"
                bodyClass="!p-4 !bg-gray-100 dark:!bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={() => setFilterIsOpen(false)}
                onRequestClose={() => setFilterIsOpen(false)}
            >
                <Form
                    id={FILTER_FORM_ID}
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div>
                        <FormItem label="Status">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
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
                                        className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                                        options={buildModeOptions(scenarios)}
                                        {...field}
                                        value={buildModeOptions(scenarios).filter(
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
                                        className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                                        options={buildPersonaOptions(scenarios)}
                                        {...field}
                                        value={buildPersonaOptions(scenarios).filter(
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
                        <FormItem label="Division">
                            <Controller
                                name="division"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        className="[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md"
                                        options={buildDivisionOptions(
                                            scenarios,
                                            getDivisionName,
                                        )}
                                        {...field}
                                        value={buildDivisionOptions(
                                            scenarios,
                                            getDivisionName,
                                        ).filter(
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
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default ScenarioListTableFilter
