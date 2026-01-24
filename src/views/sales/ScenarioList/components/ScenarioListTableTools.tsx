import DebouceInput from '@/components/shared/DebouceInput'
import ScenarioListTableFilter from './ScenarioListTableFilter'
import { TbSearch } from 'react-icons/tb'
import type { ChangeEvent } from 'react'

type FilterValues = {
    status: string
    mode: string
    persona: string
}

type ScenarioListTableToolsProps = {
    onSearch: (value: string) => void
    onFilterChange: (filters: FilterValues) => void
    filterValues: FilterValues
}

const ScenarioListTableTools = ({
    onSearch,
    onFilterChange,
    filterValues,
}: ScenarioListTableToolsProps) => {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value
        onSearch(val)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <DebouceInput
                placeholder="Search scenarios..."
                suffix={<TbSearch className="text-lg" />}
                onChange={handleInputChange}
            />
            <ScenarioListTableFilter 
                onFilterChange={onFilterChange}
                defaultValues={filterValues}
            />
        </div>
    )
}

export default ScenarioListTableTools
