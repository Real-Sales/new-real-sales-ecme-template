import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { themeConfig } from '@/configs/theme.config'
import { MODE_DARK, MODE_LIGHT, THEME_MODE_STORAGE_KEY } from '@/constants/theme.constant'
import type { Theme, LayoutType, Mode, Direction } from '@/@types/theme'

function readStoredMode(): Mode {
    if (typeof window === 'undefined') {
        return themeConfig.mode
    }
    try {
        const raw = localStorage.getItem(THEME_MODE_STORAGE_KEY)
        if (raw === MODE_LIGHT || raw === MODE_DARK) {
            return raw
        }
    } catch {
        /* ignore */
    }
    return themeConfig.mode
}

const initialState: Theme = {
    ...themeConfig,
    mode: readStoredMode(),
    layout: {
        ...themeConfig.layout,
        previousType: '',
    },
}

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setSchema(state, action: PayloadAction<string>) {
            state.themeSchema = action.payload
        },
        setMode(state, action: PayloadAction<Mode>) {
            state.mode = action.payload
        },
        setSideNavCollapse(state, action: PayloadAction<boolean>) {
            state.layout.sideNavCollapse = action.payload
        },
        setDirection(state, action: PayloadAction<Direction>) {
            state.direction = action.payload
        },
        setPanelExpand(state, action: PayloadAction<boolean>) {
            state.panelExpand = action.payload
        },
        setLayout(state, action: PayloadAction<LayoutType>) {
            state.layout.type = action.payload
        },
        setPreviousLayout(state, action: PayloadAction<LayoutType | ''>) {
            state.layout.previousType = action.payload
        },
    },
})

export const {
    setSchema,
    setMode,
    setSideNavCollapse,
    setDirection,
    setPanelExpand,
    setLayout,
    setPreviousLayout,
} = themeSlice.actions

export default themeSlice.reducer 