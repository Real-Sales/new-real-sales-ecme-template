import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Mode } from '@/@types/theme'
import { getLandingTheme, type LandingTheme } from './landingTheme'

const LandingThemeContext = createContext<LandingTheme | null>(null)

export function LandingThemeProvider({
    mode,
    children,
}: {
    mode: Mode
    children: ReactNode
}) {
    const theme = useMemo(() => getLandingTheme(mode), [mode])
    return (
        <LandingThemeContext.Provider value={theme}>
            {children}
        </LandingThemeContext.Provider>
    )
}

export function useLandingTheme() {
    const theme = useContext(LandingThemeContext)
    if (!theme) {
        throw new Error('useLandingTheme must be used within LandingThemeProvider')
    }
    return theme
}
