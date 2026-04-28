import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from './hook'
import { setCurrentRouteKey } from './slices/routeKeySlice'

type RouteKeyStore = {
    currentRouteKey: string
    setCurrentRouteKey: (key: string) => void
}

export function useRouteKeyStore<T>(selector: (state: RouteKeyStore) => T): T {
    const dispatch = useAppDispatch()
    const currentRouteKey = useAppSelector((s) => s.routeKey.currentRouteKey)

    const store: RouteKeyStore = useMemo(
        () => ({
            currentRouteKey,
            setCurrentRouteKey: (payload) =>
                dispatch(setCurrentRouteKey(payload)),
        }),
        [currentRouteKey, dispatch],
    )

    return selector(store)
}
