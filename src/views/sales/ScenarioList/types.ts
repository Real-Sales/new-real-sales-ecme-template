// API response types for /scenarios/library

export type ScenarioLibraryPersonaProduct = {
    persona_product_id: string
    product: {
        name: string
        details: string
        product_id: string
        created_at: string
        updated_at: string
    }
}

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
    persona_products?: ScenarioLibraryPersonaProduct[]
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
    message: string
    time_limit_days: number
    created_at: string
    updated_at: string
    assigned_sessions_count: number
    users_assigned_count?: number
    users_completed_count?: number
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
    persona_products?: unknown[]
}

// Create scenario (POST /scenarios/)
export type CreateScenarioRequest = {
    persona_id?: string | null
    mode_id?: string | null
    title?: string | null
    scenario_text?: string | null
    document_content?: string | null
    time_limit_days?: number
    message?: string | null
}

// Update scenario (PUT /api/v1/scenarios/{scenario_id})
export type UpdateScenarioRequest = CreateScenarioRequest
