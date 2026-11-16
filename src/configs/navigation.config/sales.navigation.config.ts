import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

/** Full scenario + org nav; `sales_person` only sees Assigned scenarios (not Scenario Library). */
export const MANAGER_ROLES = ['sales_manager', 'company_owner', 'manager']
export const ASSIGNED_SCENARIOS_ROLES = ['sales_person', ...MANAGER_ROLES]
export const COMPANY_MEMBERS_ROLES = ['sales_person', ...MANAGER_ROLES]

const salesNavigationConfig: NavigationTree[] = [
    {
        key: 'salesManager',
        path: '',
        title: 'Sales Manager',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'salesManager.overview',
                path: '/overview',
                title: 'Overview',
                translateKey: '',
                icon: 'overview',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'salesManager.performance',
                path: '/performance',
                title: 'Performance',
                translateKey: '',
                icon: 'performance',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'salesPerson.assignedScenarios',
                path: '/assigned-scenarios',
                title: 'Assigned scenarios',
                translateKey: '',
                icon: 'scenarioLibrary',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ASSIGNED_SCENARIOS_ROLES,
                subMenu: [],
            },
            {
                key: 'salesManager.scenarioLibrary',
                path: '/scenario-library',
                title: 'Scenario Library',
                translateKey: '',
                icon: 'scenarioLibrary',
                type: NAV_ITEM_TYPE_ITEM,
                authority: MANAGER_ROLES,
                subMenu: [],
            },
            {
                key: 'salesManager.leaderboard',
                path: '/leaderboard',
                title: 'Leaderboard',
                translateKey: '',
                icon: 'leaderboard',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
    {
        key: 'companyGroup',
        path: '',
        title: '',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'companyGroup.members',
                path: '/company-members',
                title: 'Company Members',
                translateKey: '',
                icon: 'members',
                type: NAV_ITEM_TYPE_ITEM,
                authority: COMPANY_MEMBERS_ROLES,
                subMenu: [],
            },
            {
                key: 'companyGroup.company',
                path: '/sales-division',
                title: 'Sales Divisions',
                translateKey: '',
                icon: 'company',
                type: NAV_ITEM_TYPE_ITEM,
                authority: MANAGER_ROLES,
                subMenu: [],
            },
        ],
    },
]

export default salesNavigationConfig
