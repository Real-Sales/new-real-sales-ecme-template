// API response types for /scenarios/library

export type ScenarioLibraryPersona = {
    persona_id: string
    name: string
    industry: {
        name: string
        industry_id: string
    }
    ai_role: {
        name: string
        ai_role_id: string
    }
    geography: string
    plant_size_impact?: { name: string; plant_size_impact_id: string }
    manufacturing_model?: { name: string; manufacturing_model_id: string }
    company_size_new?: { name: string; company_size_id: string }
    status_active: boolean
    profile_pic?: string
    gender?: string
    voice_id?: string
}

export type ScenarioLibraryMode = {
    mode_id: string
    name: string
    description?: string
    status_active: boolean
    created_at?: string
    updated_at?: string
}

export type ScenarioLibraryItem = {
    scenario_id: string
    created_by: string
    creator_role: string
    persona: ScenarioLibraryPersona
    mode: ScenarioLibraryMode
    title: string
    scenario_text: string
    document_content?: string
    document_filename?: string | null
    message: string
    time_limit_days: number
    created_at: string
    updated_at: string
    assigned_sessions_count: number
    users_assigned_count?: number
    users_completed_count?: number
    /** Present for sales-rep dashboard rows (one row per assignment session). */
    session_id?: string
    session_status?: string
    is_completed?: boolean
    days_remaining?: number | null
    creator_name?: string | null
    end_time?: string | null
    assigned_at?: string
    user_name?: string
    user_email?: string
    user_id?: string
}

export type InteractionModeDashboardResponse = {
    mode_id: string
    name: string
    description: string | null
    status_active: boolean
    created_at: string
    updated_at: string
}

export type PersonaDashboardResponse = {
    persona_id: string
    name: string
    industry: { industry_id: string; name: string }
    ai_role: { ai_role_id: string; name: string }
    geography: string | null
    plant_size_impact: { plant_size_impact_id: string; name: string }
    manufacturing_model: { manufacturing_model_id: string; name: string }
    company_size_new: { company_size_id: string; name: string }
    status_active: boolean
    profile_pic: string | null
    gender: string | null
    voice_id: string | null
}

/** GET /scenarios/dashboard/sales-rep — one row per assigned session with scenario_id. */
export type ScenarioDashboardDataForSalesRep = {
    scenario_id: string
    session_id: string
    created_by: string | null
    user_id: string
    title: string | null
    time_limit_days: number
    created_at: string
    assigned_at: string
    session_status: string
    is_completed: boolean
    days_remaining: number | null
    user_name: string
    user_email: string
    creator_name: string | null
    mode: InteractionModeDashboardResponse | null
    persona: PersonaDashboardResponse | null
    scenario_text: string | null
    message: string | null
    end_time: string | null
}

export type SalesRepDashboardResponse = {
    pending_scenarios: ScenarioDashboardDataForSalesRep[]
    active_scenarios?: ScenarioDashboardDataForSalesRep[]
    completed_scenarios?: ScenarioDashboardDataForSalesRep[]
    expired_scenarios?: ScenarioDashboardDataForSalesRep[]
    total_pending: number
}

export type AssignedScenarioTab = 'pending' | 'completed' | 'expired'

const PENDING_TAB_STATUSES = new Set([
    'pending',
    'active',
    'abandoned',
    'inactive',
])

export function getAssignedScenarioTab(
    scenario: Pick<ScenarioLibraryItem, 'session_status'>,
): AssignedScenarioTab {
    const status = (scenario.session_status ?? '').toLowerCase()
    if (status === 'completed') return 'completed'
    if (status === 'expired') return 'expired'
    if (!status || PENDING_TAB_STATUSES.has(status)) return 'pending'
    return 'pending'
}

const emptyPersonaForTable = (): ScenarioLibraryPersona => ({
    persona_id: '',
    name: '—',
    industry: { name: '', industry_id: '' },
    ai_role: { name: '', ai_role_id: '' },
    geography: '',
    status_active: true,
})

const emptyModeForTable = (): ScenarioLibraryMode => ({
    mode_id: '',
    name: '—',
    description: '',
    status_active: true,
    created_at: '',
    updated_at: '',
})

function personaDashboardToLibrary(p: PersonaDashboardResponse): ScenarioLibraryPersona {
    return {
        persona_id: p.persona_id,
        name: p.name,
        industry: p.industry,
        ai_role: p.ai_role,
        geography: p.geography ?? '',
        plant_size_impact: p.plant_size_impact,
        manufacturing_model: p.manufacturing_model,
        company_size_new: p.company_size_new,
        status_active: p.status_active,
        profile_pic: p.profile_pic ?? undefined,
        gender: p.gender ?? undefined,
        voice_id: p.voice_id ?? undefined,
    }
}

function modeDashboardToLibrary(m: InteractionModeDashboardResponse): ScenarioLibraryMode {
    return {
        mode_id: m.mode_id,
        name: m.name,
        description: m.description ?? undefined,
        status_active: m.status_active,
        created_at: m.created_at,
        updated_at: m.updated_at,
    }
}

export function mapSalesRepDashboardRowToScenario(
    row: ScenarioDashboardDataForSalesRep,
): ScenarioLibraryItem {
    const persona = row.persona ? personaDashboardToLibrary(row.persona) : emptyPersonaForTable()
    const mode = row.mode ? modeDashboardToLibrary(row.mode) : emptyModeForTable()
    return {
        scenario_id: row.scenario_id,
        session_id: row.session_id,
        session_status: row.session_status,
        is_completed: row.is_completed,
        days_remaining: row.days_remaining,
        creator_name: row.creator_name,
        end_time: row.end_time,
        user_name: row.user_name,
        user_email: row.user_email,
        user_id: row.user_id,
        created_by: row.created_by ?? '',
        creator_role: '',
        persona,
        mode,
        title: row.title ?? '',
        scenario_text: row.scenario_text ?? '',
        message: row.message ?? '',
        time_limit_days: row.time_limit_days,
        created_at: row.created_at,
        assigned_at: row.assigned_at,
        updated_at: row.assigned_at ?? row.created_at,
        assigned_sessions_count: 0,
        users_assigned_count: 0,
        users_completed_count: row.is_completed ? 1 : 0,
    }
}

export type ScenarioLibraryResponse = {
    scenarios: ScenarioLibraryItem[]
}

// Alias for scenario library (API)
export type Scenario = ScenarioLibraryItem

// Legacy type for team/assigned scenarios (mock data)
export type ScenarioSession = {
    scenario_id: string
    session_id: string
    manager_id: string
    title: string | null
    time_limit_days: number
    message: string | null
    created_at: string
    updated_at: string
    is_completed: boolean
    session_status: 'active' | 'inactive'
    user_name: string
    user_email: string
    days_remaining: number
    mode: string
    persona: string
    scenario_text: string
    document_name?: string | null
    document_url?: string | null
    total_users: number
    completed_users: number
    completion_percentage: number
}

export type Scenarios = Scenario[]

export type Filter = {
    status: string
    mode: string
    persona: string
    daysRemaining: string
}

export type GetScenariosResponse = {
    list: Scenarios
    total: number
}

// Document upload (POST /documents/upload)
export type DocumentUploadResponse = {
    filename: string
    processing_timestamp: string
    file_size_kb: number
    document_metadata: {
        extraction_method: string
        pages: number
        tables_detected: boolean
        content_length: number
        has_content: boolean
    }
    summary: string
    success: boolean
    error: string | null
    processing_time_seconds: number
}

// Interaction modes (GET /interaction-modes/) - for create scenario dropdown
export type InteractionModeListItem = {
    mode_id: string
    name: string
    description?: string
    prompt_template?: string
    status_active: boolean
    created_at?: string
    updated_at?: string
}

// AI Personas (GET /ai-personas/) - for create scenario dropdown
export type AiPersonaListItem = {
    persona_id: string
    name: string
    industry?: { name: string; industry_id: string }
    ai_role?: { name: string; ai_role_id: string }
    geography?: string
    plant_size_impact?: { name: string; plant_size_impact_id: string }
    manufacturing_model?: { name: string; manufacturing_model_id: string }
    company_size_new?: { name: string; company_size_id: string }
    behavioral_detail?: string
    status_active: boolean
    profile_pic?: string
    gender?: string
    voice_id?: string
}

// Create scenario (POST /scenarios/)
export type CreateScenarioRequest = {
    persona_id?: string | null
    mode_id?: string | null
    title?: string | null
    scenario_text?: string | null
    document_content?: string | null
    document_filename?: string | null
    time_limit_days?: number
    message?: string | null
}

// Update scenario (PUT /api/v1/scenarios/{scenario_id})
export type UpdateScenarioRequest = CreateScenarioRequest
