import { useState, useMemo, useRef, useEffect } from 'react'
import { injectReducer } from '@/store'
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
import ShareScenarioDialog from './components/ShareScenarioDialog'
import scenarioLibraryReducer, {
    useAppSelector,
    useAppDispatch,
    fetchScenarioLibrary,
    fetchPersonas,
    fetchModes,
    createScenario,
    updateScenario,
    deleteScenario,
    resetNotification,
} from './store'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { Scenario } from './types'
import type { ScenarioFormOption } from './components/ScenarioForm'

type FilterValues = {
    status: string
    mode: string
    persona: string
}

// Inject reducer when component mounts (lazy-loaded)
injectReducer('scenarioLibrary', scenarioLibraryReducer)

const ScenarioList = () => {
    const dispatch = useAppDispatch()
    const {
        scenariosData,
        scenarioLibraryLoading,
        initialized,
        personasData,
        modesData,
        notification,
    } = useAppSelector(
        (state) =>
            state.scenarioLibrary?.data ?? {
                scenariosData: [],
                scenarioLibraryLoading: false,
                initialized: false,
                personasData: [],
                modesData: [],
                error: null,
                notification: null,
            }
    )

    useEffect(() => {
        if (!initialized && !scenarioLibraryLoading) {
            dispatch(fetchScenarioLibrary())
        }
    }, [dispatch, initialized, scenarioLibraryLoading])

    useEffect(() => {
        if (notification) {
            const type = (notification.type || 'info') as 'success' | 'warning' | 'danger' | 'info'
            toast.push(
                <Notification title={type.charAt(0).toUpperCase() + type.slice(1)} type={type}>
                    {notification.message}
                </Notification>
            )
            dispatch(resetNotification())
        }
    }, [notification, dispatch])

    useEffect(() => {
        dispatch(fetchPersonas())
        dispatch(fetchModes())
    }, [dispatch])
    const [searchQuery, setSearchQuery] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
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
        return scenariosData
            .filter((scenario) => {
                // Search filter
                const matchesSearch =
                    searchQuery === '' ||
                    scenario.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scenario.scenario_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scenario.persona?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scenario.mode?.name?.toLowerCase().includes(searchQuery.toLowerCase())

                // Status filter (derived from persona.status_active)
                const derivedStatus = scenario.persona?.status_active && scenario.mode?.status_active ? 'active' : 'inactive'
                const matchesStatus =
                    filters.status === 'all' || derivedStatus === filters.status

                // Mode filter
                const matchesMode =
                    filters.mode === 'all' || scenario.mode?.name === filters.mode

                // Persona filter
                const matchesPersona =
                    filters.persona === 'all' || scenario.persona?.name === filters.persona

                return matchesSearch && matchesStatus && matchesMode && matchesPersona
            })
            .sort((a, b) => {
                // Case-insensitive alphabetical sort using localeCompare with sensitivity option
                const titleA = a.title || ''
                const titleB = b.title || ''
                return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' })
            })
    }, [scenariosData, searchQuery, filters])

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

    const handleShare = (scenario: Scenario) => {
        setSelectedScenario(scenario)
        setIsShareDialogOpen(true)
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

    const onScenarioSubmit = async (values: ScenarioFormSchema) => {
        const payload = {
            persona_id: values.persona || null,
            mode_id: values.mode || null,
            title: values.title || null,
            scenario_text: values.scenario || null,
            document_content: values.document_content || null,
            time_limit_days: values.deadline ?? 7,
            message: values.message || null,
        }
        if (isEditMode && editingScenario) {
            const result = await dispatch(
                updateScenario({ scenarioId: editingScenario.scenario_id, payload })
            )
            if (updateScenario.fulfilled.match(result)) {
                onDrawerClose()
            }
        } else {
            const result = await dispatch(createScenario(payload))
            if (createScenario.fulfilled.match(result)) {
                onDrawerClose()
            }
        }
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

    const handleDeleteSelected = async () => {
        for (const s of selectedScenarios) {
            await dispatch(deleteScenario(s.scenario_id))
        }
        setSelectedScenarios([])
    }

    const handleConfirmDeleteScenario = (scenario: Scenario) => {
        dispatch(deleteScenario(scenario.scenario_id))
    }

    const handleRowClick = (scenario: Scenario) => {
        setSelectedScenario(scenario)
        setIsViewDrawerOpen(true)
    }

    const onViewDrawerClose = () => {
        setIsViewDrawerOpen(false)
        setSelectedScenario(null)
    }

    const onShareDialogClose = () => {
        setIsShareDialogOpen(false)
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

    const modeOptions: ScenarioFormOption[] = useMemo(() => {
        return modesData
            .filter((m) => m.mode_id && m.name)
            .map((m) => ({ label: m.name, value: m.mode_id }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [modesData])

    const personaOptions: (ScenarioFormOption & { role?: string })[] = useMemo(() => {
        return personasData
            .filter((p) => p.persona_id && p.name)
            .map((p) => ({ label: p.name, value: p.persona_id, role: p.ai_role?.name }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [personasData])

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button
                size="sm"
                variant="default"
                className="flex-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200 dark:hover:!bg-gray-700 dark:hover:!border-gray-500"
                onClick={onDrawerClose}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none rounded-md"
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
                            scenarios={scenariosData}
                            onSearch={handleSearch}
                            onFilterChange={handleFilterChange}
                            filterValues={filters}
                        />
                    <ScenarioListTable 
                        data={paginatedScenarios}
                        loading={scenarioLibraryLoading}
                        selectedScenarios={selectedScenarios}
                        onRowSelect={handleRowSelect}
                        onAllRowSelect={handleAllRowSelect}
                        onRowClick={handleRowClick}
                        onEdit={handleEdit}
                        onShare={handleShare}
                        onConfirmDeleteScenario={handleConfirmDeleteScenario}
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
                footerClass="!bg-gray-100 dark:!bg-gray-900 !p-3"
                bodyClass="!bg-gray-100 dark:!bg-gray-900 !p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                <div className="px-2">
                    <ScenarioForm
                        formRef={formRef}
                        initialValues={editingScenario ? {
                            title: editingScenario.title || '',
                            mode: editingScenario.mode?.mode_id ?? '',
                            persona: editingScenario.persona?.persona_id ?? '',
                            deadline: editingScenario.time_limit_days,
                            scenario: editingScenario.scenario_text || '',
                            message: editingScenario.message || '',
                        } : undefined}
                        isEditMode={isEditMode}
                        modeOptions={modeOptions}
                        personaOptions={personaOptions}
                        personasData={personasData}
                        onSubmit={onScenarioSubmit}
                        onCancel={onDrawerClose}
                    />
                </div>
            </Drawer>

            {/* View Scenario Drawer */}
            <Drawer
                title="Scenario Details"
                isOpen={isViewDrawerOpen}
                width={500}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                bodyClass="!bg-gray-100 dark:!bg-gray-900 !p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onViewDrawerClose}
                onRequestClose={onViewDrawerClose}
            >
                {selectedScenario && (
                    <ScenarioDetail scenario={selectedScenario} />
                )}
            </Drawer>

            <ShareScenarioDialog
                isOpen={isShareDialogOpen}
                scenario={selectedScenario}
                onClose={onShareDialogClose}
            />

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
