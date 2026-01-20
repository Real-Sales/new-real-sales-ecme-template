export type SkillType = 'closing' | 'discovery' | 'objection' | 'presentation'

type TeamMember = {
    name: string
    color: string
    data: number[]
}

type SkillPerformanceData = {
    members: TeamMember[]
    months: string[]
    sufficiencyLevel: number
    proficiencyLevel: number
}

export const teamPerformanceData: Record<SkillType, SkillPerformanceData> = {
    closing: {
        members: [
            {
                name: 'Clara Ca',
                color: '#3B82F6',
                data: [75, 85, 84, 88, 85, 68, 5, 5],
            },
            {
                name: 'Ruben Rn',
                color: '#22C55E',
                data: [75, 78, 82, 80, 82, 78, 80, 80],
            },
            {
                name: 'Ryan McFarlin',
                color: '#EF4444',
                data: [2, 2, 2, 2, 2, 2, 5, 12],
            },
            {
                name: 'Mika Ma',
                color: '#F59E0B',
                data: [55, 42, 45, 45, 48, 48, 48, 48],
            },
            {
                name: 'Christian Cn',
                color: '#8B5CF6',
                data: [55, 62, 68, 68, 70, 68, 68, 68],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 70,
        proficiencyLevel: 85,
    },
    discovery: {
        members: [
            {
                name: 'Clara Ca',
                color: '#3B82F6',
                data: [60, 72, 78, 82, 85, 88, 90],
            },
            {
                name: 'Ruben Rn',
                color: '#22C55E',
                data: [65, 70, 75, 78, 80, 82, 84],
            },
            {
                name: 'Ryan McFarlin',
                color: '#EF4444',
                data: [40, 55, 62, 68, 72, 75, 78],
            },
            {
                name: 'Mika Ma',
                color: '#F59E0B',
                data: [35, 42, 48, 52, 58, 62, 65],
            },
            {
                name: 'Christian Cn',
                color: '#8B5CF6',
                data: [50, 58, 64, 68, 72, 75, 78],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 70,
        proficiencyLevel: 85,
    },
    objection: {
        members: [
            {
                name: 'Clara Ca',
                color: '#3B82F6',
                data: [55, 65, 72, 78, 82, 85, 88],
            },
            {
                name: 'Ruben Rn',
                color: '#22C55E',
                data: [70, 75, 78, 80, 82, 84, 86],
            },
            {
                name: 'Ryan McFarlin',
                color: '#EF4444',
                data: [30, 42, 55, 62, 68, 72, 75],
            },
            {
                name: 'Mika Ma',
                color: '#F59E0B',
                data: [40, 48, 55, 60, 65, 68, 70],
            },
            {
                name: 'Christian Cn',
                color: '#8B5CF6',
                data: [45, 55, 62, 68, 72, 75, 78],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 70,
        proficiencyLevel: 85,
    },
    presentation: {
        members: [
            {
                name: 'Clara Ca',
                color: '#3B82F6',
                data: [68, 75, 80, 85, 88, 90, 92],
            },
            {
                name: 'Ruben Rn',
                color: '#22C55E',
                data: [72, 78, 82, 85, 87, 89, 90],
            },
            {
                name: 'Ryan McFarlin',
                color: '#EF4444',
                data: [35, 48, 58, 65, 72, 78, 82],
            },
            {
                name: 'Mika Ma',
                color: '#F59E0B',
                data: [45, 52, 58, 62, 68, 72, 75],
            },
            {
                name: 'Christian Cn',
                color: '#8B5CF6',
                data: [52, 60, 68, 72, 78, 80, 82],
            },
        ],
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        sufficiencyLevel: 70,
        proficiencyLevel: 85,
    },
}
