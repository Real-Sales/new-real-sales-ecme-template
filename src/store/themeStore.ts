import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from './hook'
import {
    setDirection,
    setLayout,
    setMode,
    setPanelExpand,
    setPreviousLayout,
    setSchema,
    setSideNavCollapse,
} from './slices/theme/themeSlice'
import type { Direction, LayoutType, Mode, Theme } from '@/@types/theme'

export type ThemeStore = Theme & {
    setSchema: (schema: string) => void
    setMode: (mode: Mode) => void
    setSideNavCollapse: (collapsed: boolean) => void
    setDirection: (direction: Direction) => void
    setPanelExpand: (expand: boolean) => void
    setLayout: (layout: LayoutType) => void
    setPreviousLayout: (layout: LayoutType | '') => void
}

export function useThemeStore<T>(selector: (state: ThemeStore) => T): T {
    const dispatch = useAppDispatch()
    const theme = useAppSelector((s) => s.theme)

    const store: ThemeStore = useMemo(
        () => ({
            ...theme,
            setSchema: (payload) => dispatch(setSchema(payload)),
            setMode: (payload) => dispatch(setMode(payload)),
            setSideNavCollapse: (payload) =>
                dispatch(setSideNavCollapse(payload)),
            setDirection: (payload) => dispatch(setDirection(payload)),
            setPanelExpand: (payload) => dispatch(setPanelExpand(payload)),
            setLayout: (payload) => dispatch(setLayout(payload)),
            setPreviousLayout: (payload) =>
                dispatch(setPreviousLayout(payload)),
        }),
        [theme, dispatch],
    )

    return selector(store)
}
