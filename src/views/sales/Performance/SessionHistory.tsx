import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Progress from '@/components/ui/Progress'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui'
import { Form, FormItem } from '@/components/ui/Form'
import DataTable from '@/components/shared/DataTable'
import SessionDetailDrawer from './SessionDetailDrawer'
import classNames from '@/utils/classNames'
import { TbHistory, TbFilter } from 'react-icons/tb'
import { NumericFormat } from 'react-number-format'
import { useForm, Controller } from 'react-hook-form'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { OptionProps, ControlProps } from 'react-select'
import { components } from 'react-select'
import { sessionHistoryData, type SessionHistory as SessionHistoryType } from './performanceData'

const { Control } = components

type Option = {
    value: string
    label: string
    className?: string
}

type FilterSchema = {
    persona: string
    mode: string
    dateRange: [Date | null, Date | null]
}

const personaOptions: Option[] = [
    { value: 'all', label: 'All Personas' },
    ...Array.from(new Set(sessionHistoryData.map((s) => s.persona))).map(
        (persona) => ({ value: persona, label: persona })
    ),
]

const modeOptions: Option[] = [
    { value: 'all', label: 'All Modes', className: 'bg-gray-400' },
    { value: 'Prospecting', label: 'Prospecting', className: 'bg-blue-500' },
    { value: 'Discovering', label: 'Discovering', className: 'bg-green-500' },
    { value: 'Closing', label: 'Closing', className: 'bg-red-500' },
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

const defaultFilterValues: FilterSchema = {
    persona: 'all',
    mode: 'all',
    dateRange: [null, null],
}

const SessionHistorySection = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [filterIsOpen, setFilterIsOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState<FilterSchema>(defaultFilterValues)
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
    const [selectedSession, setSelectedSession] = useState<SessionHistoryType | null>(null)

    const { handleSubmit, control, reset } = useForm<FilterSchema>({
        defaultValues: defaultFilterValues,
    })

    const handlePaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setCurrentPage(1)
    }

    const onSubmit = (values: FilterSchema) => {
        setActiveFilters(values)
        setCurrentPage(1)
        setFilterIsOpen(false)
        removeBodyScrollLock()
    }

    const handleReset = () => {
        reset(defaultFilterValues)
        setActiveFilters(defaultFilterValues)
        setFilterIsOpen(false)
        removeBodyScrollLock()
    }

    const removeBodyScrollLock = () => {
        const bodyClassList = document.body.classList
        if (bodyClassList.contains('drawer-lock-scroll')) {
            bodyClassList.remove('drawer-lock-scroll', 'drawer-open')
        }
    }

    const handleRowClick = (session: SessionHistoryType) => {
        setSelectedSession(session)
        setDetailDrawerOpen(true)
    }

    const handleDetailDrawerClose = () => {
        setDetailDrawerOpen(false)
        setSelectedSession(null)
        removeBodyScrollLock()
    }

    const filteredData = useMemo(() => {
        return sessionHistoryData.filter((session) => {
            const matchesPersona =
                activeFilters.persona === 'all' || session.persona === activeFilters.persona
            const matchesMode =
                activeFilters.mode === 'all' || session.mode === activeFilters.mode
            const [startDate, endDate] = activeFilters.dateRange
            const sessionDate = new Date(session.date)
            const matchesDate =
                (!startDate || sessionDate >= startDate) &&
                (!endDate || sessionDate <= endDate)

            return matchesPersona && matchesMode && matchesDate
        })
    }, [activeFilters])

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [currentPage, pageSize, filteredData])

    const activeFilterCount = useMemo(() => {
        let count = 0
        if (activeFilters.persona !== 'all') count++
        if (activeFilters.mode !== 'all') count++
        if (activeFilters.dateRange[0] || activeFilters.dateRange[1]) count++
        return count
    }, [activeFilters])

    const columns: ColumnDef<SessionHistoryType>[] = useMemo(
        () => [
            {
                header: 'Persona',
                accessorKey: 'persona',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div 
                            className="font-semibold text-gray-900 dark:text-white hover:text-primary cursor-pointer"
                            onClick={() => handleRowClick(row)}
                        >
                            {row.persona}
                        </div>
                    )
                },
            },
            {
                header: 'Mode',
                accessorKey: 'mode',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <Badge
                            innerClass={classNames(
                                'px-2.5 py-1 text-xs font-medium rounded-md',
                                row.mode === 'Discovering' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                row.mode === 'Prospecting' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                row.mode === 'Closing' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            )}
                            content={row.mode}
                        />
                    )
                },
            },
            {
                header: 'Duration',
                accessorKey: 'duration',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    const minutes = Math.floor(row.duration / 60)
                    const seconds = row.duration % 60
                    return (
                        <span className="text-gray-700 dark:text-gray-300">
                            {minutes}m {seconds}s
                        </span>
                    )
                },
            },
            {
                header: 'Overall Score',
                accessorKey: 'overallScore',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                                <NumericFormat
                                    displayType="text"
                                    value={row.overallScore}
                                    suffix="/100"
                                    decimalScale={2}
                                    fixedDecimalScale
                                />
                            </span>
                            <Progress
                                percent={row.overallScore}
                                showInfo={false}
                                customColorClass={classNames(
                                    'bg-red-500',
                                    row.overallScore >= 50 && 'bg-blue-500',
                                    row.overallScore >= 65 && 'bg-green-500',
                                )}
                            />
                        </div>
                    )
                },
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span className="text-gray-700 dark:text-gray-300">
                            {new Date(row.date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>
                    )
                },
            },
        ],
        [handleRowClick],
    )

    return (
        <>
        <Card>
            {/* Section Heading */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <TbHistory className="text-xl text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            Session History
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Recent practice sessions and scores
                        </p>
                    </div>
                </div>
                <Button
                    icon={<TbFilter />}
                    onClick={() => setFilterIsOpen(true)}
                    variant="solid"
                    size="sm"
                    className="bg-primary hover:bg-primary-deep text-white border-none"
                >
                    Filter
                    {activeFilterCount > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-xs font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={paginatedData}
                noData={filteredData.length === 0}
                hoverable
                pagingData={{
                    total: filteredData.length,
                    pageIndex: currentPage,
                    pageSize: pageSize,
                }}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
            />
        </Card>

            {/* Filter Drawer */}
            <Drawer
                title="Filter Sessions"
                isOpen={filterIsOpen}
                onClose={() => { setFilterIsOpen(false); removeBodyScrollLock() }}
                onRequestClose={() => { setFilterIsOpen(false); removeBodyScrollLock() }}
            >
                <Form
                    className="h-full"
                    containerClassName="flex flex-col justify-between h-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div>
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
                        <FormItem label="Date Range">
                            <Controller
                                name="dateRange"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker.DatePickerRange
                                        placeholder="Select date range"
                                        value={field.value}
                                        onChange={(val) => field.onChange(val)}
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

            {/* Session Detail Drawer */}
            <SessionDetailDrawer
                isOpen={detailDrawerOpen}
                onClose={handleDetailDrawerClose}
                session={selectedSession}
            />
        </>
    )
}

export default SessionHistorySection
