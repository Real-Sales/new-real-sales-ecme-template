import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const landingRoute: Routes = [
    {
        key: 'landing',
        path: `/landing`,
        component: lazy(() => import('@/views/Landing')),
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
        component: lazy(() => import('@/views/Landing/About')),
        authority: [],
        meta: {
            layout: 'blank',
            footer: false,
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'faqs',
        path: `/faqs`,
        component: lazy(() => import('@/views/Landing/FAQs')),
        authority: [],
        meta: {
            layout: 'blank',
            footer: false,
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'industries-food-and-beverages',
        path: `/industries/food-and-beverages`,
        component: lazy(
            () =>
                import(
                    '@/views/Landing/components/IndustryPersonas/FoodAndBeverages'
                ),
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

export default landingRoute
