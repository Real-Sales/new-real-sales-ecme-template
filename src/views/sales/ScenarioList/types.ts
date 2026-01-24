export type Scenario = {
    scenario_id: string
    session_id: string
    manager_id: string
    title: string | null
    time_limit_days: number
    message: string | null
    created_at: string
    updated_at: string
    // Properties from backend
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
    // Stats
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
