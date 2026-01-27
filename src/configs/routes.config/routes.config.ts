import authRoute from './authRoute'
import salesRoute from './salesRoute'
import landingRoute from './landingRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute, ...landingRoute]

export const protectedRoutes: Routes = [
    ...salesRoute,
    ...othersRoute,
]
