import { useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setLayout, setPreviousLayout } from '@/store/slices/theme/themeSlice'
import type { LayoutType } from '@/@types/theme'
import type { ComponentType } from 'react'

export type AppRouteProps<T> = {
    component: ComponentType<T>
    routeKey: string
    layout?: LayoutType
}

const AppRoute = <T extends Record<string, unknown>>({
    component: Component,
    routeKey,
    ...props
}: AppRouteProps<T>) => {
    const location = useLocation()
    const dispatch = useAppDispatch()

    // Selectors for theme layout
    const layout = useAppSelector((state) => state.theme.layout)
    const layoutType = layout.type
    const previousLayout = layout.previousType

    const handleLayoutChange = useCallback(() => {
        // If route specifies a layout and it's different from current, change it
        if (props.layout && props.layout !== layoutType) {
            dispatch(setPreviousLayout(layoutType))
            dispatch(setLayout(props.layout))
        }

        // If route doesn't specify layout and there's a previous layout, restore it
        if (!props.layout && previousLayout && layoutType !== previousLayout) {
            dispatch(setLayout(previousLayout))
            dispatch(setPreviousLayout(''))
        }
    }, [props.layout, routeKey, layoutType, previousLayout, dispatch])

    useEffect(() => {
        handleLayoutChange()
    }, [location, handleLayoutChange])

    return <Component {...(props as T)} />
}

export default AppRoute
