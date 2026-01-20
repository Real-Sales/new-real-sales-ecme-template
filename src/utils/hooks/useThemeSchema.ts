import { useEffect } from 'react'
import { useAppSelector } from '@/store/hook'
import presetThemeSchemaConfig from '@/configs/preset-theme-schema.config'

export type ThemeVariables = Record<
    'primary' | 'primaryDeep' | 'primaryMild' | 'primarySubtle' | 'neutral',
    string
>

export interface MappedTheme {
    [key: string]: string
}

export const mapTheme = (variables: ThemeVariables): MappedTheme => {
    return {
        '--primary': variables.primary || '',
        '--primary-deep': variables.primaryDeep || '',
        '--primary-mild': variables.primaryMild || '',
        '--primary-subtle': variables.primarySubtle || '',
        '--neutral': variables.neutral || '',
    }
}

function useThemeSchema() {
    const themeSchema = useAppSelector((state) => state.theme.themeSchema)
    const mode = useAppSelector((state) => state.theme.mode)

    const applyTheme = (theme: string): void => {
        const modeKey: 'light' | 'dark' = mode === 'dark' ? 'dark' : 'light'
        if (presetThemeSchemaConfig[theme][modeKey]) {
            const themeVars = presetThemeSchemaConfig[theme][modeKey]
            const themeObject: MappedTheme = mapTheme(themeVars)
            if (!themeObject) return

            const root = document.documentElement

            Object.keys(themeObject).forEach((property) => {
                if (property === 'name') {
                    return
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                root.style.setProperty(property, themeObject[property as keyof typeof themeObject])
            })
        }
    }

    useEffect(() => {
        if (themeSchema) {
            applyTheme(themeSchema)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [themeSchema, mode])
}

export default useThemeSchema
