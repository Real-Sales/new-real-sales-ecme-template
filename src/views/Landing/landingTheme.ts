import presetThemeSchemaConfig from '@/configs/preset-theme-schema.config'
import { MODE_LIGHT } from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'

const green = presetThemeSchemaConfig.green

export type LandingTheme = {
    mode: Mode
    isLight: boolean
    bg: string
    bgElevated: string
    bgCard: string
    text: string
    textSecondary: string
    textMuted: string
    textFaint: string
    textDim: string
    border: string
    borderStrong: string
    surface: string
    surfaceHover: string
    surfaceStrong: string
    accent: string
    accentMild: string
    accentDeep: string
    accentSubtle: string
    onAccent: string
    auroraStops: [string, string, string]
    vignette: string
    starDot: string
    gridPattern: string
    logoSrc: string
    navStickyBg: string
    primaryBtnBg: string
    primaryBtnText: string
    primaryBtnHover: string
    secondaryBtnText: string
    secondaryBtnBorder: string
}

export function getLandingTheme(mode: Mode): LandingTheme {
    const isLight = mode === MODE_LIGHT
    const palette = isLight ? green.light : green.dark

    return {
        mode,
        isLight,
        bg: isLight ? '#FFFFFF' : '#050505',
        bgElevated: isLight ? '#FFFFFF' : '#0D0D0D',
        bgCard: isLight ? '#F3F4F6' : '#1A1A1A',
        text: isLight ? '#111827' : '#F5F5F5',
        textSecondary: isLight ? '#374151' : '#D1D5DB',
        textMuted: isLight ? '#6B7280' : '#9CA3AF',
        textFaint: isLight ? '#9CA3AF' : '#6B7280',
        textDim: isLight ? '#D1D5DB' : '#4B5563',
        border: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
        borderStrong: isLight ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.14)',
        surface: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
        surfaceHover: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
        surfaceStrong: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
        accent: palette.primary,
        accentMild: palette.primaryMild,
        accentDeep: palette.primaryDeep,
        accentSubtle: palette.primarySubtle,
        onAccent: '#FFFFFF',
        auroraStops: isLight
            ? ['#ffffff', '#ffffff', '#ffffff']
            : ['#ffffff', '#9CA3AF', '#0A0A0A'],
        vignette: 'radial-gradient(ellipse 90% 70% at 50% 40%, transparent 0%, rgba(5,5,5,0.18) 52%, rgba(5,5,5,0.75) 100%)',
        starDot: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.15)',
        gridPattern: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        logoSrc: isLight ? '/img/logo/logo-light-full.png' : '/img/logo/logo-dark-full.png',
        navStickyBg: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(13,13,13,0.9)',
        primaryBtnBg: palette.primary,
        primaryBtnText: '#FFFFFF',
        primaryBtnHover: palette.primaryDeep,
        secondaryBtnText: isLight ? '#6B7280' : '#9CA3AF',
        secondaryBtnBorder: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    }
}
