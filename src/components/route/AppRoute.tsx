import { useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/hook'
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

    // Dummy action creators for demonstration (replace with your actual actions)
    // import { setLayout, setPreviousLayout } from '@/store/slices/theme/themeSlice'
    // import { setCurrentRouteKey } from '@/store/routeKeySlice'

    const handleLayoutChange = useCallback(() => {
        // dispatch(setCurrentRouteKey(routeKey))

        // if (props.layout && props.layout !== layoutType) {
        //     dispatch(setPreviousLayout(layoutType))
        //     dispatch(setLayout(props.layout))
        // }

        // if (!props.layout && previousLayout && layoutType !== previousLayout) {
        //     dispatch(setLayout(previousLayout))
        //     dispatch(setPreviousLayout(''))
        // }
    }, [props.layout, routeKey, layoutType, previousLayout])

    useEffect(() => {
        handleLayoutChange()
    }, [location, handleLayoutChange])

    return <Component {...(props as T)} />
}

export default AppRoute
