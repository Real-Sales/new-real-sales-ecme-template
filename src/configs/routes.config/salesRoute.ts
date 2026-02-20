import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const salesRoute: Routes = [
    {
        key: 'onboarding',
        path: '/onboarding',
        component: lazy(() => import('@/views/auth/Onboarding')),
        authority: [],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'salesManager.overview',
        path: '/overview',
        component: lazy(() => import('@/views/sales/Overview')),
        authority: [],
    },
    {
        key: 'subscription',
        path: '/subscription',
        component: lazy(() => import('@/views/profile/Subscription')),
        authority: [],
        meta: {
            header: {
                title: 'Subscription',
            },
        },
    },
    {
        key: 'salesManager.performance',
        path: '/performance',
        component: lazy(() => import('@/views/sales/Performance')),
        authority: [],
    },
    {
        key: 'salesManager.scenarioLibrary',
        path: '/scenario-library',
        component: lazy(() => import('@/views/sales/ScenarioList')),
        authority: [],
    },
    {
        key: 'salesManager.personaSelection',
        path: '/persona-selection',
        component: lazy(() => import('@/views/sales/PersonaSelection')),
        authority: [],
        meta: {
            layout: 'blank',
        },
    },
    {
        key: 'salesManager.audioVisualizer',
        path: '/audio-visualizer',
        component: lazy(() => import('@/views/sales/AudioVisualizer')),
        authority: [],
        meta: {
            layout: 'blank',
        },
    },
    {
        key: 'companyGroup.company',
        path: '/company',
        component: lazy(() => import('@/views/sales/company/CompanyList')),
        authority: [],
    },
    {
        key: 'companyGroup.companyDetail',
        path: '/company/:id',
        component: lazy(() => import('@/views/sales/company/CompanyDetail')),
        authority: [],
    },
    {
        key: 'companyGroup.teams',
        path: '/teams',
        component: lazy(() => import('@/views/sales/teams/TeamList')),
        authority: [],
    },
    {
        key: 'companyGroup.teamDetail',
        path: '/teams/:id',
        component: lazy(() => import('@/views/sales/teams/TeamDetail')),
        authority: [],
    },
    {
        key: 'companyGroup.feedback',
        path: '/feedback',
        component: lazy(() => import('@/views/sales/MyFeedback')),
        authority: [],
    },
    {
        key: 'profile.settings',
        path: '/profile/settings',
        component: lazy(() => import('@/views/profile/Settings')),
        authority: [],
        meta: {
            header: {
                title: 'Settings',
            },
        },
    },
    {
        key: 'profile.subscription',
        path: '/profile/subscription',
        component: lazy(() => import('@/views/profile/Subscription')),
        authority: [],
        meta: {
            header: {
                title: 'Subscription',
            },
        },
    },
]

export default salesRoute
