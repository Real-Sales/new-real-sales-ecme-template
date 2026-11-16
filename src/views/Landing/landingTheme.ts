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

/** Frosted-glass surface for landing cards: translucent fill + backdrop blur over the page backdrop. */
/* Liquid-glass cards: the look comes from <GlassLayers /> inside the card (warped backdrop, tint, inset rim).
   The card itself only needs to be transparent and to isolate its stacking context. */
const LIGHT_SHADOW = '0 6px 10px rgba(15,23,42,0.06), 0 0 24px rgba(15,23,42,0.06)'

/** One hairline edge for glass surfaces: just enough to define the card. */
export function glassHairline(t: { isLight: boolean }) {
    return t.isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.08)'
}

export function glassCard(t: { isLight: boolean }, tint?: string) {
    return { backgroundColor: tint ?? 'transparent', isolation: 'isolate', border: `1px solid ${glassHairline(t)}` } as const
}

/** Drop shadow for glass cards in light mode; `fallback` is the card's normal (dark-mode) shadow. */
export function glassEdge(t: { isLight: boolean }, fallback: string, flat = false) {
    return t.isLight ? (flat ? '0 1px 2px rgba(15,23,42,0.06)' : LIGHT_SHADOW) : fallback
}

/** Plain frosted surface (no inner layers), for full-width bars such as the footer. */
export function glassPlain(t: { isLight: boolean }) {
    const blur = 'blur(12px) saturate(150%)'
    return {
        backgroundColor: t.isLight ? 'rgba(214,221,218,0.34)' : 'rgba(18,22,20,0.45)',
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
    } as const
}

/** Moving elements (marquees): same tint as the cards, but nothing that samples the page behind. */
export function glassFlat(t: { isLight: boolean }) {
    return {
        backgroundColor: t.isLight ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.045)',
        border: `1px solid ${glassHairline(t)}`,
    } as const
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
        textDim: isLight ? '#6B7280' : '#4B5563',
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
            : ['#050505', '#0CAF60', '#050505'],
        vignette: 'radial-gradient(ellipse 90% 70% at 50% 40%, transparent 0%, rgba(5,5,5,0.18) 52%, rgba(5,5,5,0.75) 100%)',
        starDot: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.15)',
        gridPattern: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        logoSrc: isLight ? '/img/logo/logo-light-full.png' : '/img/logo/logo-dark-full.png',
        navStickyBg: isLight ? 'rgba(240,243,242,0.62)' : 'rgba(18,22,20,0.5)',
        primaryBtnBg: palette.primary,
        primaryBtnText: '#FFFFFF',
        primaryBtnHover: palette.primaryDeep,
        secondaryBtnText: isLight ? '#6B7280' : '#9CA3AF',
        secondaryBtnBorder: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    }
}
