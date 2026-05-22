import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

/** Full scenario + org nav; hidden for `sales_person` (they get Assigned scenarios instead). */
const MANAGER_ROLES = ['sales_manager', 'company_owner', 'manager']

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
                path: '/scenario-library',
                title: 'Assigned scenarios',
                translateKey: '',
                icon: 'scenarioLibrary',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['sales_person'],
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
                authority: MANAGER_ROLES,
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
            {
                key: 'companyGroup.teams',
                path: '/teams',
                title: 'Teams',
                translateKey: '',
                icon: 'teams',
                type: NAV_ITEM_TYPE_ITEM,
                authority: MANAGER_ROLES,
                subMenu: [],
            },
            {
                key: 'companyGroup.feedback',
                path: '/feedback',
                title: 'My Feedback',
                translateKey: '',
                icon: 'feedback',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default salesNavigationConfig
