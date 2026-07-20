import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { injectReducer } from '@/store'
import salesDivisionsReducer, {
    fetchSalesDivisions,
} from '@/store/slices/salesDivisions'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import ScenarioListTable from './components/ScenarioListTable'
import ScenarioListActionTools from './components/ScenarioListActionTools'
import ScenarioListTableTools from './components/ScenarioListTableTools'
import ScenarioListSelected from './components/ScenarioListSelected'
import ScenarioForm, {
    type ScenarioFormSchema,
    type ScenarioFormOption,
    type DivisionFormOption,
} from './components/ScenarioForm'
import ScenarioDetail from './components/ScenarioDetail'
import ScenarioAssignedUsers from './components/ScenarioAssignedUsers'
import ShareScenarioDialog from './components/ShareScenarioDialog'
import scenarioLibraryReducer, {
    useAppSelector,
    useAppDispatch,
    fetchScenarioLibrary,
    fetchSalesRepDashboard,
    fetchPersonas,
    fetchModes,
    createScenario,
    updateScenario,
    deleteScenario,
    resetNotification,
    fetchScenarioAssignmentStatus,
} from './store'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Tabs from '@/components/ui/Tabs'
import type { Scenario } from './types'
import { getAssignedScenarioTab, type AssignedScenarioTab } from './types'
import { canManageScenarioLibrary } from '@/utils/inviteAccess'
import { scenarioToAudioVizState } from '@/utils/audioVizSessionState'
import type { FetchPersonasParams } from './store'
import { TbClock, TbCircleCheck, TbAlertTriangle } from 'react-icons/tb'

type FilterValues = {
    status: string
    mode: string
    persona: string
}

const resolveScenarioDivisionId = (
    scenario: Scenario,
    assignScenarioById: Record<
        string,
        { salesDivisionId?: string | null }
    >,
): string =>
    scenario.sales_division_id ??
    assignScenarioById[scenario.scenario_id]?.salesDivisionId ??
    ''

// Inject reducer when component mounts (lazy-loaded)
injectReducer('scenarioLibrary', scenarioLibraryReducer)
injectReducer('salesDivisions', salesDivisionsReducer)

const ScenarioList = () => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const dispatch = useAppDispatch()
    const userRole = useAppSelector((state) => state.auth.user.role)
    const companyId = useAppSelector((state) => state.auth.user.companyId)
    const canManageLibrary = canManageScenarioLibrary(userRole)
    const isAssignedView = pathname === '/assigned-scenarios'

    const {
        scenariosData,
        scenarioLibraryLoading,
        initialized,
        personasData,
        personasLoading,
        modesData,
        modesLoading,
        modesInitialized,
        salesRepScenarios,
        salesRepTotalPending,
        salesRepLoading,
        salesRepInitialized,
        assignScenarioById,
        notification,
    } = useAppSelector(
        (state) =>
            state.scenarioLibrary?.data ?? {
                scenariosData: [],
                scenarioLibraryLoading: false,
                initialized: false,
                personasData: [],
                personasLoading: false,
                modesData: [],
                modesLoading: false,
                modesInitialized: false,
                salesRepScenarios: [],
                salesRepTotalPending: 0,
                salesRepLoading: false,
                salesRepInitialized: false,
                assignScenarioById: {},
                assignScenarioLoadingScenarioId: null,
                assignScenarioError: null,
                error: null,
                notification: null,
            }
    )

    const {
        divisionsData,
        divisionsLoading,
        initialized: divisionsInitialized,
    } = useAppSelector(
        (state) =>
            state.salesDivisions?.data ?? {
                divisionsData: [],
                divisionsLoading: false,
                initialized: false,
            },
    )

    const [searchQuery, setSearchQuery] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
    const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([])
    const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [submitting, setSubmitting] = useState(false)
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
    const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' | '' }>({ key: '', order: '' })
    const [assignedTab, setAssignedTab] = useState<AssignedScenarioTab>('pending')
    const [formCustomerSegmentId, setFormCustomerSegmentId] = useState<string | null>(null)

    const handleSalesDivisionChange = useCallback((customerSegmentId: string | null) => {
        setFormCustomerSegmentId(customerSegmentId)
    }, [])

    const originalScenarioDivisionId = useMemo(() => {
        if (!editingScenario) return ''
        return resolveScenarioDivisionId(editingScenario, assignScenarioById)
    }, [editingScenario, assignScenarioById])

    const originalScenarioSegmentId = useMemo(() => {
        if (!originalScenarioDivisionId) return null
        return (
            divisionsData.find(
                (d) => d.sales_division_id === originalScenarioDivisionId,
            )?.customer_segment_id ?? null
        )
    }, [originalScenarioDivisionId, divisionsData])

    const isOnOriginalScenarioSegment =
        Boolean(formCustomerSegmentId) &&
        Boolean(originalScenarioSegmentId) &&
        formCustomerSegmentId === originalScenarioSegmentId

    useEffect(() => {
        if (isAssignedView) return
        if (!canManageLibrary) return
        if (!initialized && !scenarioLibraryLoading) {
            dispatch(fetchScenarioLibrary())
        }
    }, [dispatch, initialized, scenarioLibraryLoading, canManageLibrary, isAssignedView])

    useEffect(() => {
        if (!isAssignedView) return
        if (!salesRepInitialized && !salesRepLoading) {
            dispatch(fetchSalesRepDashboard())
        }
    }, [dispatch, isAssignedView, salesRepInitialized, salesRepLoading])

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
        if (!canManageLibrary || isAssignedView) return
        if (!modesInitialized && !modesLoading) {
            dispatch(fetchModes())
        }
    }, [dispatch, canManageLibrary, isAssignedView, modesInitialized, modesLoading])

    useEffect(() => {
        if (!canManageLibrary || isAssignedView || !companyId) return
        if (!divisionsInitialized && !divisionsLoading) {
            dispatch(fetchSalesDivisions(companyId))
        }
    }, [dispatch, canManageLibrary, isAssignedView, companyId, divisionsInitialized, divisionsLoading])

    useEffect(() => {
        if (!isDrawerOpen || !canManageLibrary || isAssignedView) return
        if (!formCustomerSegmentId) return

        const params: FetchPersonasParams = {
            customerSegmentId: formCustomerSegmentId,
        }
        // Keep current persona in the list only while still on the original segment.
        if (
            isEditMode &&
            isOnOriginalScenarioSegment &&
            editingScenario?.persona?.persona_id
        ) {
            params.includePersonaId = editingScenario.persona.persona_id
        }
        dispatch(fetchPersonas(params))
    }, [
        dispatch,
        isDrawerOpen,
        canManageLibrary,
        isAssignedView,
        formCustomerSegmentId,
        isEditMode,
        isOnOriginalScenarioSegment,
        editingScenario?.persona?.persona_id,
    ])

    const rawScenarios = isAssignedView ? salesRepScenarios : scenariosData
    const listLoading = isAssignedView ? salesRepLoading : scenarioLibraryLoading

    const assignedTabCounts = useMemo(() => {
        const counts: Record<AssignedScenarioTab, number> = {
            pending: 0,
            completed: 0,
            expired: 0,
        }
        for (const scenario of salesRepScenarios) {
            counts[getAssignedScenarioTab(scenario)]++
        }
        return counts
    }, [salesRepScenarios])

    const tabFilteredScenarios = useMemo(() => {
        if (!isAssignedView) return rawScenarios
        return rawScenarios.filter(
            (scenario) => getAssignedScenarioTab(scenario) === assignedTab,
        )
    }, [rawScenarios, isAssignedView, assignedTab])

    const handleAssignedTabChange = (tab: string) => {
        setAssignedTab(tab as AssignedScenarioTab)
        setTableData((prev) => ({ ...prev, pageIndex: 1 }))
    }

    const handleSalesRepOpenSession = (scenario: Scenario) => {
        if (!scenario.session_id) return
        navigate(`/audio-visualizer/${scenario.session_id}`, {
            state: scenarioToAudioVizState(scenario),
        })
    }

    const handleSalesRepViewReport = (scenario: Scenario) => {
        if (!scenario.session_id) return
        navigate(`/sessions/${scenario.session_id}/report`)
    }

    // Filter scenarios based on search and filters
    const filteredScenarios = useMemo(() => {
        const source = isAssignedView ? tabFilteredScenarios : rawScenarios
        return source.filter((scenario) => {
            const q = searchQuery.toLowerCase()
            const matchesSearch =
                searchQuery === '' ||
                scenario.title?.toLowerCase().includes(q) ||
                scenario.scenario_id.toLowerCase().includes(q) ||
                scenario.persona?.name?.toLowerCase().includes(q) ||
                scenario.mode?.name?.toLowerCase().includes(q) ||
                (scenario.session_id?.toLowerCase().includes(q) ?? false)

            const derivedStatus = scenario.persona?.status_active && scenario.mode?.status_active ? 'active' : 'inactive'
            const matchesStatus =
                filters.status === 'all' || derivedStatus === filters.status

            const matchesMode =
                filters.mode === 'all' || scenario.mode?.name === filters.mode

            const matchesPersona =
                filters.persona === 'all' || scenario.persona?.name === filters.persona

            return matchesSearch && matchesStatus && matchesMode && matchesPersona
        })
    }, [isAssignedView, tabFilteredScenarios, rawScenarios, searchQuery, filters])

    // Sort filtered scenarios
    const sortedScenarios = useMemo(() => {
        if (!sortConfig.key || !sortConfig.order) {
            // Default: alphabetical by title
            return [...filteredScenarios].sort((a, b) =>
                (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' })
            )
        }
        return [...filteredScenarios].sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[sortConfig.key]
            const bVal = (b as Record<string, unknown>)[sortConfig.key]
            if (sortConfig.key === 'created_at') {
                const aTime = aVal ? new Date(aVal as string).getTime() : 0
                const bTime = bVal ? new Date(bVal as string).getTime() : 0
                return sortConfig.order === 'asc' ? aTime - bTime : bTime - aTime
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.order === 'asc' ? aVal - bVal : bVal - aVal
            }
            const aStr = String(aVal ?? '')
            const bStr = String(bVal ?? '')
            return sortConfig.order === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr)
        })
    }, [filteredScenarios, sortConfig])

    // Paginate sorted scenarios
    const paginatedScenarios = useMemo(() => {
        const startIndex = (tableData.pageIndex - 1) * tableData.pageSize
        const endIndex = startIndex + tableData.pageSize
        return sortedScenarios.slice(startIndex, endIndex)
    }, [sortedScenarios, tableData.pageIndex, tableData.pageSize])

    const handleAddNew = () => {
        setIsEditMode(false)
        setEditingScenario(null)
        setIsDrawerOpen(true)
    }

    const handleEdit = (scenario: Scenario) => {
        setIsEditMode(true)
        setEditingScenario(scenario)
        setIsDrawerOpen(true)

        const divisionId = resolveScenarioDivisionId(scenario, assignScenarioById)
        if (divisionId) {
            const division = divisionsData.find(
                (d) => d.sales_division_id === divisionId,
            )
            setFormCustomerSegmentId(division?.customer_segment_id ?? null)
        } else {
            setFormCustomerSegmentId(null)
            dispatch(fetchScenarioAssignmentStatus(scenario.scenario_id))
        }
    }

    const handleShare = (scenario: Scenario) => {
        setSelectedScenario(scenario)
        setIsShareDialogOpen(true)
    }

    const onDrawerClose = () => {
        if (submitting) return
        setIsDrawerOpen(false)
        setIsEditMode(false)
        setEditingScenario(null)
        setFormCustomerSegmentId(null)
    }

    const closeDrawerAfterSubmit = () => {
        setIsDrawerOpen(false)
        setIsEditMode(false)
        setEditingScenario(null)
        setFormCustomerSegmentId(null)
    }

    const handleSubmitClick = () => {
        if (submitting) return
        if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            )
        }
    }

    const onScenarioSubmit = async (values: ScenarioFormSchema) => {
        const basePayload = {
            sales_division_id: values.salesDivisionId,
            persona_id: values.persona || null,
            mode_ids: values.modeIds?.length ? values.modeIds : null,
            title: values.title || null,
            scenario_text: values.scenario || null,
            document_content: values.document_content || null,
            document_filename: values.document_filename || null,
            time_limit_days: values.deadline ?? 7,
            message: values.message || null,
        }

        setSubmitting(true)
        try {
            if (isEditMode && editingScenario) {
                const result = await dispatch(
                    updateScenario({ scenarioId: editingScenario.scenario_id, payload: basePayload })
                )
                if (updateScenario.fulfilled.match(result)) {
                    closeDrawerAfterSubmit()
                }
            } else {
                const result = await dispatch(createScenario(basePayload))
                if (createScenario.fulfilled.match(result)) {
                    closeDrawerAfterSubmit()
                }
            }
        } finally {
            setSubmitting(false)
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
        if (canManageLibrary && !isAssignedView) {
            dispatch(fetchScenarioAssignmentStatus(scenario.scenario_id))
        }
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
        const options = personasData
            .filter((p) => {
                if (!p.persona_id || !p.name) return false
                if (!formCustomerSegmentId) return true
                return p.customer_segment?.customer_segment_id === formCustomerSegmentId
            })
            .map((p) => ({ label: p.name, value: p.persona_id, role: p.ai_role?.name }))

        // Seed the current edit persona only on the original division/segment.
        // After a division change the form clears persona; seeding would keep a
        // stale label while validation says "Persona is required".
        const editPersona = editingScenario?.persona
        if (
            isOnOriginalScenarioSegment &&
            editPersona?.persona_id &&
            !options.some((opt) => opt.value === editPersona.persona_id)
        ) {
            options.push({
                label: editPersona.name,
                value: editPersona.persona_id,
                role: editPersona.ai_role?.name,
            })
        }

        return options.sort((a, b) => a.label.localeCompare(b.label))
    }, [
        personasData,
        formCustomerSegmentId,
        isOnOriginalScenarioSegment,
        editingScenario?.persona,
    ])

    const divisionOptions: DivisionFormOption[] = useMemo(() => {
        return divisionsData
            .filter((d) => d.sales_division_id && d.name)
            .map((d) => ({
                label: d.name,
                value: d.sales_division_id,
                segmentName: d.customer_segment?.name?.trim() || undefined,
                productNames: (d.products ?? [])
                    .map((p) => p.name?.trim())
                    .filter((name): name is string => Boolean(name)),
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [divisionsData])

    const scenarioFormInitialValues = useMemo(() => {
        if (!editingScenario) return undefined

        const salesDivisionId = resolveScenarioDivisionId(
            editingScenario,
            assignScenarioById,
        )

        return {
            title: editingScenario.title || '',
            salesDivisionId,
            modeIds: editingScenario.modes?.length
                ? editingScenario.modes.map((m) => m.mode_id)
                : editingScenario.mode?.mode_id
                  ? [editingScenario.mode.mode_id]
                  : [],
            persona: editingScenario.persona?.persona_id ?? '',
            deadline: editingScenario.time_limit_days,
            scenario: editingScenario.scenario_text || '',
            message: editingScenario.message || '',
            document_content: editingScenario.document_content || '',
            document_filename: editingScenario.document_filename || '',
        }
    }, [editingScenario, assignScenarioById])

    const scenarioFormResetKey = useMemo(() => {
        if (!isEditMode || !editingScenario) return 'create'
        const divisionId = resolveScenarioDivisionId(
            editingScenario,
            assignScenarioById,
        )
        return `${editingScenario.scenario_id}:${divisionId}`
    }, [isEditMode, editingScenario, assignScenarioById])

    // Hydrate segment once when edit opens / division id becomes available.
    // Do not overwrite after the user changes division in the form.
    useEffect(() => {
        if (!isDrawerOpen || !isEditMode || !editingScenario) return
        if (formCustomerSegmentId) return

        const divisionId = resolveScenarioDivisionId(
            editingScenario,
            assignScenarioById,
        )
        if (!divisionId) return

        const division = divisionsData.find(
            (d) => d.sales_division_id === divisionId,
        )
        setFormCustomerSegmentId(division?.customer_segment_id ?? null)
    }, [
        isDrawerOpen,
        isEditMode,
        editingScenario,
        assignScenarioById,
        divisionsData,
        formCustomerSegmentId,
    ])

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button
                size="sm"
                variant="default"
                className="flex-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200 dark:hover:!bg-gray-700 dark:hover:!border-gray-500"
                disabled={submitting}
                onClick={onDrawerClose}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none rounded-md"
                loading={submitting}
                disabled={submitting}
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
                                <h3 className="text-2xl font-bold">
                                    {isAssignedView ? 'Assigned scenarios' : 'Scenario Library'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {isAssignedView
                                        ? salesRepTotalPending > 0
                                            ? `Sessions assigned to you · ${salesRepTotalPending} not completed`
                                            : 'Sessions assigned to you'
                                        : 'Manage and track sales training scenarios'}
                                </p>
                            </div>
                            <ScenarioListActionTools
                                onAddNew={handleAddNew}
                                showAddButton={canManageLibrary && !isAssignedView}
                            />
                        </div>
                        {isAssignedView && (
                            <Tabs
                                value={assignedTab}
                                onChange={handleAssignedTabChange}
                            >
                                <Tabs.TabList>
                                    <Tabs.TabNav value="pending">
                                        <span className="flex items-center gap-1.5">
                                            <TbClock className="text-sm" />
                                            Pending
                                            <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                                {assignedTabCounts.pending}
                                            </span>
                                        </span>
                                    </Tabs.TabNav>
                                    <Tabs.TabNav value="completed">
                                        <span className="flex items-center gap-1.5">
                                            <TbCircleCheck className="text-sm" />
                                            Completed
                                            <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                                {assignedTabCounts.completed}
                                            </span>
                                        </span>
                                    </Tabs.TabNav>
                                    <Tabs.TabNav value="expired">
                                        <span className="flex items-center gap-1.5">
                                            <TbAlertTriangle className="text-sm" />
                                            Expired
                                            <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                                {assignedTabCounts.expired}
                                            </span>
                                        </span>
                                    </Tabs.TabNav>
                                </Tabs.TabList>
                            </Tabs>
                        )}
                        <ScenarioListTableTools
                            scenarios={isAssignedView ? tabFilteredScenarios : rawScenarios}
                            onSearch={handleSearch}
                            onFilterChange={handleFilterChange}
                            filterValues={filters}
                        />
                    <ScenarioListTable 
                        data={paginatedScenarios}
                        loading={listLoading}
                        selectedScenarios={selectedScenarios}
                        onRowSelect={handleRowSelect}
                        onAllRowSelect={handleAllRowSelect}
                        onRowClick={handleRowClick}
                        onEdit={handleEdit}
                        onShare={handleShare}
                        onConfirmDeleteScenario={handleConfirmDeleteScenario}
                        variant={isAssignedView ? 'salesRep' : 'manager'}
                        onSalesRepOpenSession={handleSalesRepOpenSession}
                        onSalesRepViewReport={handleSalesRepViewReport}
                        pagingData={{
                            total: filteredScenarios.length,
                            pageIndex: tableData.pageIndex,
                            pageSize: tableData.pageSize,
                        }}
                        onPaginationChange={handlePaginationChange}
                        onSelectChange={handleSelectChange}
                        onSort={({ key, order }) => {
                            setSortConfig({ key: String(key), order })
                            setTableData((prev) => ({ ...prev, pageIndex: 1 }))
                        }}
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
                        key={scenarioFormResetKey}
                        formRef={formRef}
                        formResetKey={scenarioFormResetKey}
                        initialValues={scenarioFormInitialValues}
                        isEditMode={isEditMode}
                        modeOptions={modeOptions}
                        personaOptions={personaOptions}
                        divisionOptions={divisionOptions}
                        divisionsData={divisionsData}
                        divisionsLoading={divisionsLoading}
                        personasLoading={personasLoading}
                        onSalesDivisionChange={handleSalesDivisionChange}
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
                    <div className="space-y-8">
                        <ScenarioDetail scenario={selectedScenario} />
                        {canManageLibrary && !isAssignedView && (
                            <>
                                <div className="border-t border-gray-200 dark:border-gray-700" />
                                <ScenarioAssignedUsers
                                    scenarioId={selectedScenario.scenario_id}
                                />
                            </>
                        )}
                    </div>
                )}
            </Drawer>

            <ShareScenarioDialog
                isOpen={isShareDialogOpen}
                scenario={selectedScenario}
                onClose={onShareDialogClose}
            />

            {/* Selected Scenarios Sticky Footer */}
            {canManageLibrary && !isAssignedView && (
            <ScenarioListSelected
                selectedScenarios={selectedScenarios}
                onClearSelection={handleClearSelection}
                onDelete={handleDeleteSelected}
            />
            )}
        </>
    )
}

export default ScenarioList
