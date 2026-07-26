import DebouceInput from '@/components/shared/DebouceInput'
import ScenarioListTableFilter from './ScenarioListTableFilter'
import { TbSearch } from 'react-icons/tb'
import type { ChangeEvent } from 'react'
import type { Scenario } from '../types'

type FilterValues = {
    status: string
    mode: string
    persona: string
    division: string
}

type ScenarioListTableToolsProps = {
    scenarios: Scenario[]
    onSearch: (value: string) => void
    onFilterChange: (filters: FilterValues) => void
    filterValues: FilterValues
    getDivisionName?: (scenario: Scenario) => string
}

const ScenarioListTableTools = ({
    scenarios,
    onSearch,
    onFilterChange,
    filterValues,
    getDivisionName,
}: ScenarioListTableToolsProps) => {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value
        onSearch(val)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1 [&_.input]:!bg-gray-50 [&_.input]:dark:!bg-gray-800/50 [&_.input]:!border [&_.input]:!border-gray-200 [&_.input]:dark:!border-gray-700 [&_.input]:shadow-md [&_.input]:text-gray-900 [&_.input]:dark:text-gray-200">
                <DebouceInput
                    placeholder="Search scenarios..."
                    suffix={<TbSearch className="text-lg" />}
                    onChange={handleInputChange}
                />
            </div>
            <ScenarioListTableFilter 
                scenarios={scenarios}
                onFilterChange={onFilterChange}
                defaultValues={filterValues}
                getDivisionName={getDivisionName}
            />
        </div>
    )
}

export default ScenarioListTableTools
