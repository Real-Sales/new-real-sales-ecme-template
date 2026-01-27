export type ModeType = 'prospecting' | 'discovering' | 'closing'

type Mode = {
    name: string
    color: string
    data: number[]
}

type PerformanceData = {
    modes: Mode[]
    months: string[]
    sufficiencyLevel: number
    proficiencyLevel: number
}

// Mock data for individual member performance
export const memberPerformanceData: Record<string, PerformanceData> = {
    '1': { // Clara Ca
        modes: [
            {
                name: 'Prospecting',
                color: '#F59E0B',
                data: [0, 85, 85, 85, 85, 85, 85, 85],
            },
            {
                name: 'Discovering',
                color: '#22C55E',
                data: [95, 100, 100, 100, 100, 100, 23, 23],
            },
            {
                name: 'Closing',
                color: '#EF4444',
                data: [0, 85, 85, 85, 85, 85, 5, 5],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 65,
        proficiencyLevel: 85,
    },
    '2': { // Christian Cn
        modes: [
            {
                name: 'Prospecting',
                color: '#F59E0B',
                data: [0, 80, 82, 84, 85, 86, 15, 15],
            },
            {
                name: 'Discovering',
                color: '#22C55E',
                data: [90, 95, 98, 100, 100, 100, 30, 30],
            },
            {
                name: 'Closing',
                color: '#EF4444',
                data: [0, 78, 80, 82, 84, 85, 10, 10],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 65,
        proficiencyLevel: 85,
    },
    '3': { // Ruben Rn
        modes: [
            {
                name: 'Prospecting',
                color: '#F59E0B',
                data: [0, 75, 78, 80, 82, 84, 18, 18],
            },
            {
                name: 'Discovering',
                color: '#22C55E',
                data: [88, 92, 95, 98, 100, 100, 28, 28],
            },
            {
                name: 'Closing',
                color: '#EF4444',
                data: [0, 72, 75, 78, 80, 82, 8, 8],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 65,
        proficiencyLevel: 85,
    },
    '4': { // Mika Ma
        modes: [
            {
                name: 'Prospecting',
                color: '#F59E0B',
                data: [0, 65, 68, 70, 72, 75, 12, 12],
            },
            {
                name: 'Discovering',
                color: '#22C55E',
                data: [75, 80, 85, 88, 90, 92, 22, 22],
            },
            {
                name: 'Closing',
                color: '#EF4444',
                data: [0, 60, 63, 65, 68, 70, 6, 6],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 65,
        proficiencyLevel: 85,
    },
    '5': { // Ryan McFarlin
        modes: [
            {
                name: 'Prospecting',
                color: '#F59E0B',
                data: [0, 45, 50, 55, 60, 65, 8, 8],
            },
            {
                name: 'Discovering',
                color: '#22C55E',
                data: [60, 68, 75, 80, 85, 88, 18, 18],
            },
            {
                name: 'Closing',
                color: '#EF4444',
                data: [0, 40, 45, 50, 55, 60, 3, 3],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 65,
        proficiencyLevel: 85,
    },
}

// Mock data for performance by mode
export const modePerformanceData: Record<string, Record<ModeType, { score: number; sessions: number }>> = {
    '1': {
        prospecting: { score: 67.9, sessions: 5 },
        discovering: { score: 84.3, sessions: 8 },
        closing: { score: 69.2, sessions: 5 },
    },
    '2': {
        prospecting: { score: 65.5, sessions: 4 },
        discovering: { score: 80.2, sessions: 7 },
        closing: { score: 66.8, sessions: 4 },
    },
    '3': {
        prospecting: { score: 70.1, sessions: 6 },
        discovering: { score: 78.5, sessions: 6 },
        closing: { score: 72.3, sessions: 6 },
    },
    '4': {
        prospecting: { score: 60.2, sessions: 5 },
        discovering: { score: 72.8, sessions: 6 },
        closing: { score: 62.1, sessions: 5 },
    },
    '5': {
        prospecting: { score: 45.8, sessions: 3 },
        discovering: { score: 60.5, sessions: 4 },
        closing: { score: 48.2, sessions: 3 },
    },
}
