import { useState, useMemo, useRef } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import ScenarioListTable from './components/ScenarioListTable'
import ScenarioListActionTools from './components/ScenarioListActionTools'
import ScenarioListTableTools from './components/ScenarioListTableTools'
import ScenarioListSelected from './components/ScenarioListSelected'
import ScenarioForm, { type ScenarioFormSchema } from './components/ScenarioForm'
import ScenarioDetail from './components/ScenarioDetail'
import { mockScenarios } from './mockData'
import type { Scenario } from './types'

type FilterValues = {
    status: string
    mode: string
    persona: string
}

const ScenarioList = () => {
    const [scenarios] = useState<Scenario[]>(mockScenarios)
    const [searchQuery, setSearchQuery] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
    const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([])
    const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const [filters, setFilters] = useState<FilterValues>({
        status: 'all',
        mode: 'all',
        persona: 'all',
    })
    const [tableData, setTableData] = useState({
        pageIndex: 1,
        pageSize: 10,
    })

    // Filter and sort scenarios based on search and filters
    const filteredScenarios = useMemo(() => {
        return scenarios
            .filter((scenario) => {
                // Search filter
                const matchesSearch =
                    searchQuery === '' ||
                    scenario.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scenario.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scenario.scenario_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scenario.persona.toLowerCase().includes(searchQuery.toLowerCase())

                // Status filter
                const matchesStatus =
                    filters.status === 'all' || scenario.session_status === filters.status

                // Mode filter
                const matchesMode =
                    filters.mode === 'all' || scenario.mode === filters.mode

                // Persona filter
                const matchesPersona =
                    filters.persona === 'all' || scenario.persona === filters.persona

                return matchesSearch && matchesStatus && matchesMode && matchesPersona
            })
            .sort((a, b) => {
                // Case-insensitive alphabetical sort using localeCompare with sensitivity option
                const titleA = a.title || ''
                const titleB = b.title || ''
                return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' })
            })
    }, [scenarios, searchQuery, filters])

    // Paginate filtered scenarios
    const paginatedScenarios = useMemo(() => {
        const startIndex = (tableData.pageIndex - 1) * tableData.pageSize
        const endIndex = startIndex + tableData.pageSize
        return filteredScenarios.slice(startIndex, endIndex)
    }, [filteredScenarios, tableData.pageIndex, tableData.pageSize])

    const handleAddNew = () => {
        setIsEditMode(false)
        setEditingScenario(null)
        setIsDrawerOpen(true)
    }

    const handleEdit = (scenario: Scenario) => {
        setIsEditMode(true)
        setEditingScenario(scenario)
        setIsDrawerOpen(true)
    }

    const onDrawerClose = () => {
        setIsDrawerOpen(false)
        setIsEditMode(false)
        setEditingScenario(null)
    }

    const handleSubmitClick = () => {
        if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            )
        }
    }

    const onScenarioSubmit = (values: ScenarioFormSchema) => {
        if (isEditMode) {
            console.log('Updating scenario:', editingScenario?.scenario_id, values)
            window.alert(`Editing: ${JSON.stringify(values, null, 2)}`)
        } else {
            console.log('Creating new scenario:', values)
            window.alert(`Creating: ${JSON.stringify(values, null, 2)}`)
        }
        onDrawerClose()
    }

    const handleSearch = (value: string) => {
        setSearchQuery(value)
    }

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters)
    }

    const handleRowSelect = (checked: boolean, row: Scenario) => {
        if (checked) {
            setSelectedScenarios([...selectedScenarios, row])
        } else {
            setSelectedScenarios(selectedScenarios.filter(scenario => scenario.scenario_id !== row.scenario_id))
        }
    }

    const handleAllRowSelect = (checked: boolean, rows: any[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectedScenarios(originalRows)
        } else {
            setSelectedScenarios([])
        }
    }

    const handleClearSelection = () => {
        setSelectedScenarios([])
    }

    const handleDeleteSelected = () => {
        // In a real app, this would call an API to delete the selected scenarios
        console.log('Deleting scenarios:', selectedScenarios.map(s => s.scenario_id))
        setSelectedScenarios([])
    }

    const handleRowClick = (scenario: Scenario) => {
        setSelectedScenario(scenario)
        setIsViewDrawerOpen(true)
    }

    const onViewDrawerClose = () => {
        setIsViewDrawerOpen(false)
        setSelectedScenario(null)
    }

    const handlePaginationChange = (page: number) => {
        setTableData({
            ...tableData,
            pageIndex: page,
        })
    }

    const handleSelectChange = (value: number) => {
        setTableData({
            pageSize: Number(value),
            pageIndex: 1,
        })
    }

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button size="sm" className="flex-1" onClick={onDrawerClose}>
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                onClick={handleSubmitClick}
            >
                {isEditMode ? 'Edit' : 'Create'}
            </Button>
        </div>
    )

    const DrawerTitle = (
        <div>
            <h4 className="mb-2 text-lg font-bold">
                {isEditMode ? 'Edit Scenario' : 'Create New Scenario'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditMode 
                    ? 'Update the details of this training scenario'
                    : 'Fill in the details to create a training scenario'
                }
            </p>
        </div>
    )

    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                                <h3 className="text-2xl font-bold">Scenarios</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Manage and track sales training scenarios
                                </p>
                            </div>
                            <ScenarioListActionTools
                                onAddNew={handleAddNew}
                            />
                        </div>
                        <ScenarioListTableTools
                            onSearch={handleSearch}
                            onFilterChange={handleFilterChange}
                            filterValues={filters}
                        />
                    <ScenarioListTable 
                        data={paginatedScenarios}
                        selectedScenarios={selectedScenarios}
                        onRowSelect={handleRowSelect}
                        onAllRowSelect={handleAllRowSelect}
                        onRowClick={handleRowClick}
                        onEdit={handleEdit}
                        pagingData={{
                            total: filteredScenarios.length,
                            pageIndex: tableData.pageIndex,
                            pageSize: tableData.pageSize,
                        }}
                        onPaginationChange={handlePaginationChange}
                        onSelectChange={handleSelectChange}
                    />
                    </div>
                </AdaptiveCard>
            </Container>

            {/* Create Scenario Drawer */}
            <Drawer
                title={DrawerTitle}
                isOpen={isDrawerOpen}
                footer={DrawerFooter}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                footerClass="!bg-gray-100 dark:!bg-gray-800 !p-3"
                bodyClass="!p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                <div className="px-2">
                    <form ref={formRef}>
                        <ScenarioForm
                            initialValues={editingScenario ? {
                                title: editingScenario.title || '',
                                mode: editingScenario.mode,
                                persona: editingScenario.persona,
                                deadline: editingScenario.time_limit_days,
                                scenario: editingScenario.scenario_text || '',
                                message: editingScenario.message || '',
                            } : undefined}
                            isEditMode={isEditMode}
                            onSubmit={onScenarioSubmit}
                            onCancel={onDrawerClose}
                        />
                    </form>
                </div>
            </Drawer>

            {/* View Scenario Drawer */}
            <Drawer
                title="Scenario Details"
                isOpen={isViewDrawerOpen}
                width={500}
                headerClass="!items-start"
                bodyClass="!p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onViewDrawerClose}
                onRequestClose={onViewDrawerClose}
            >
                {selectedScenario && (
                    <ScenarioDetail scenario={selectedScenario} />
                )}
            </Drawer>

            {/* Selected Scenarios Sticky Footer */}
            <ScenarioListSelected
                selectedScenarios={selectedScenarios}
                onClearSelection={handleClearSelection}
                onDelete={handleDeleteSelected}
            />
        </>
    )
}

export default ScenarioList
