import { useEffect } from 'react'
import { THEME_ENUM, THEME_MODE_STORAGE_KEY } from '@/constants/theme.constant'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setMode } from '@/store/slices/theme/themeSlice'
import type { Mode } from '@/@types/theme'

function useDarkMode(): [
    isEnabled: boolean,
    onModeChange: (mode: Mode) => void,
] {
    const mode = useAppSelector((state) => state.theme.mode)
    const dispatch = useAppDispatch()
    const { MODE_DARK, MODE_LIGHT } = THEME_ENUM
    const isEnabled = mode === MODE_DARK
    const onModeChange = (mode: Mode) => {
        dispatch(setMode(mode))
        try {
            localStorage.setItem(THEME_MODE_STORAGE_KEY, mode)
        } catch {
            /* ignore */
        }
    }
    useEffect(() => {
        if (window === undefined) {
            return
        }
        const root = window.document.documentElement
        root.classList.remove(isEnabled ? MODE_LIGHT : MODE_DARK)
        root.classList.add(isEnabled ? MODE_DARK : MODE_LIGHT)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled])
    return [isEnabled, onModeChange]
}

export default useDarkMode
