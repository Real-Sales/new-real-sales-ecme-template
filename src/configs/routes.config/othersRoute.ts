import { lazy } from 'react'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const othersRoute: Routes = [
    {
        key: 'accessDenied',
        path: `/access-denied`,
        component: lazy(
            () => import('@/views/others/AccessDenied'),
        ),
        authority: [ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

export const landingRoute: Routes = [
    {
        key: 'landing',
        path: `/landing`,
        component: lazy(
            () => import('@/views/others/Landing'),
        ),
        authority: [],
        meta: {
            layout: 'blank',
            footer: false,
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'about',
        path: `/about`,
        component: lazy(
            () => import('@/views/others/Landing/About'),
        ),
        authority: [],
        meta: {
            layout: 'blank',
            footer: false,
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
]

export default othersRoute
