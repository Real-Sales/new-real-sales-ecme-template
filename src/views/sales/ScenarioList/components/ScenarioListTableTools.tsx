import DebouceInput from '@/components/shared/DebouceInput'
import ScenarioListTableFilter from './ScenarioListTableFilter'
import { TbSearch } from 'react-icons/tb'
import { SEARCH_INPUT_CLASSNAME } from '@/constants/searchInput.constant'
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
            <DebouceInput
                className={`flex-1 ${SEARCH_INPUT_CLASSNAME}`}
                placeholder="Search scenarios..."
                suffix={<TbSearch className="text-lg" />}
                onChange={handleInputChange}
            />
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
