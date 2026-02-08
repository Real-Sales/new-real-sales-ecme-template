// Performance data for discovery, prospecting, and closing
type PerformanceMetric = {
    name: string
    color: string
    data: number[]
}

type PerformanceData = {
    metrics: PerformanceMetric[]
    months: string[]
}

export const performanceData: PerformanceData = {
    metrics: [
        {
            name: 'Discovery',
            color: '#3B82F6',
            data: [65, 70, 75, 78, 80, 82, 84],
        },
        {
            name: 'Prospecting',
            color: '#22C55E',
            data: [60, 68, 72, 75, 78, 82, 85],
        },
        {
            name: 'Closing',
            color: '#EF4444',
            data: [55, 62, 68, 72, 75, 78, 82],
        },
    ],
    months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
}

// Session history data
export type SessionHistory = {
    id: string
    persona: string
    mode: 'Prospecting' | 'Discovering' | 'Closing'
    date: string
    duration: number
    overallScore: number
    status: 'completed' | 'in-progress'
}

export const sessionHistoryData: SessionHistory[] = [
    {
        id: 'sess-001',
        persona: 'London Brewy',
        mode: 'Prospecting',
        date: '2026-01-06',
        duration: 1398,
        overallScore: 67.14,
        status: 'completed',
    },
    {
        id: 'sess-002',
        persona: 'Sarah Mitchell',
        mode: 'Discovering',
        date: '2026-01-05',
        duration: 1820,
        overallScore: 82.50,
        status: 'completed',
    },
    {
        id: 'sess-003',
        persona: 'James Carter',
        mode: 'Closing',
        date: '2026-01-04',
        duration: 960,
        overallScore: 71.30,
        status: 'completed',
    },
    {
        id: 'sess-004',
        persona: 'Emily Davis',
        mode: 'Discovering',
        date: '2026-01-03',
        duration: 2100,
        overallScore: 89.20,
        status: 'completed',
    },
    {
        id: 'sess-005',
        persona: 'Michael Brown',
        mode: 'Prospecting',
        date: '2026-01-02',
        duration: 1150,
        overallScore: 58.75,
        status: 'completed',
    },
    {
        id: 'sess-006',
        persona: 'Rachel Green',
        mode: 'Closing',
        date: '2026-01-01',
        duration: 1600,
        overallScore: 74.90,
        status: 'completed',
    },
    {
        id: 'sess-007',
        persona: 'David Wilson',
        mode: 'Discovering',
        date: '2025-12-30',
        duration: 1340,
        overallScore: 63.40,
        status: 'completed',
    },
    {
        id: 'sess-008',
        persona: 'Sophie Turner',
        mode: 'Prospecting',
        date: '2025-12-29',
        duration: 1780,
        overallScore: 91.10,
        status: 'completed',
    },
]

// Skill breakdown donut data per skill
export type SkillBreakdownKey = 'discovering' | 'prospecting' | 'closing'

type SkillDonutData = {
    series: number[]
    labels: string[]
    percentage: number[]
}

export const skillBreakdownData: Record<SkillBreakdownKey, SkillDonutData & { score: number }> = {
    discovering: {
        series: [85, 78, 90, 72, 88],
        labels: ['Rapport Building', 'Need Analysis', 'Active Listening', 'Questioning', 'Empathy'],
        percentage: [85.0, 78.0, 90.0, 72.0, 88.0],
        score: 84,
    },
    prospecting: {
        series: [75, 70, 68, 80, 65],
        labels: ['Lead Qualification', 'Outreach', 'Follow-up', 'Research', 'Targeting'],
        percentage: [75.0, 70.0, 68.0, 80.0, 65.0],
        score: 72,
    },
    closing: {
        series: [35, 30, 40, 38, 32],
        labels: ['Negotiation', 'Objection Handling', 'Deal Closure', 'Urgency', 'Commitment'],
        percentage: [35.0, 30.0, 40.0, 38.0, 32.0],
        score: 35,
    },
}