import dashboardsRoute from './dashboardsRoute'
import conceptsRoute from './conceptsRoute'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import authDemoRoute from './authDemoRoute'
import guideRoute from './guideRoute'
import othersRoute, { landingRoute } from './othersRoute'
import salesRoute from './salesRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute, ...landingRoute]

export const protectedRoutes: Routes = [
    ...salesRoute,
    ...dashboardsRoute,
    ...conceptsRoute,
    ...uiComponentsRoute,
    ...authDemoRoute,
    ...guideRoute,
    ...othersRoute,
]
