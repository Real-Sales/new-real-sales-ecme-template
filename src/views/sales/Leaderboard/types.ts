export interface LeaderboardEntry {
    rank: number
    user_id: string
    first_name: string
    last_name: string
    email: string
    teams: string[]
    avg_score: number
    best_score: number
    sessions_count: number
    score_change: number | null
}

export interface TeamEntry {
    rank: number
    team_id: string
    team_name: string
    avg_score: number
    best_score: number
    sessions_count: number
    active_members: number
    score_change: number | null
}

export interface LeaderboardResponse {
    month: string
    company_id: string
    total_participants: number
    entries: LeaderboardEntry[]
    team_entries: TeamEntry[]
    current_user_rank: number | null
    current_user_entry: LeaderboardEntry | null
}

export interface FetchLeaderboardParams {
    month?: string
    limit?: number
}
