import { useMemo } from 'react'
import type { ReactNode } from 'react'
import ShaderArt from '@/components/ui/shader-art'
import { GlassLayers } from '@/components/ui/liquid-glass'
import { useAppSelector } from '@/store'
import { getLandingTheme, glassCard, glassEdge } from '@/views/Landing/landingTheme'
import type { LandingTheme } from '@/views/Landing/landingTheme'

/** The landing page's look (backdrop, glass cards, type) for the screens around sign-in. */

/** Landing theme tokens for the current light/dark mode. */
export function useAuthTheme(): LandingTheme {
    const mode = useAppSelector((state) => state.theme.mode)
    return useMemo(() => getLandingTheme(mode), [mode])
}

/** Form controls inside the shell: frosted-glass fields and the landing accent, in place of the flat greys. */
const AUTH_CSS = `
.auth-premium { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.auth-premium .input:not(.input-invalid) {
    background-color: var(--auth-field);
    border-color: var(--auth-line);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
    backdrop-filter: blur(10px) saturate(150%);
    box-shadow: inset 0 1px 0 var(--auth-sheen);
}
.auth-premium .input:not(.input-invalid):focus,
.auth-premium .input:not(.input-invalid):focus-within {
    background-color: transparent;
    border-color: #0CAF60;
    box-shadow: 0 0 0 3px rgba(12,175,96,0.16);
}
.auth-premium .select__control, .auth-premium .select-control {
    background-color: var(--auth-field);
    border-color: var(--auth-line);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
    backdrop-filter: blur(10px) saturate(150%);
    box-shadow: inset 0 1px 0 var(--auth-sheen);
}
`

/** Full-screen page: the landing's living backdrop behind everything, fixed to the viewport. */
export function AuthPage({ children, className = '' }: { children: ReactNode; className?: string }) {
    const t = useAuthTheme()
    return (
        <div
            className={`auth-premium relative isolate w-full transition-colors duration-300 ${className}`}
            style={
                {
                    backgroundColor: t.bg,
                    color: t.text,
                    '--auth-field': t.isLight ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.055)',
                    '--auth-line': t.isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.12)',
                    '--auth-sheen': t.isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.07)',
                } as React.CSSProperties
            }
        >
            <style>{AUTH_CSS}</style>
            <ShaderArt
                className="pointer-events-none fixed inset-0 -z-10"
                colors={{ base: t.bg, accent: t.accent, ink: t.text }}
                // Landing backdrop strength plus 5 points
                intensity={t.isLight ? 0.5 : 0.37}
                speed={0.6}
                scale={1.4}
                interactive={false}
            />
            {children}
        </div>
    )
}

/** Glass card with the landing's green top shimmer line. */
export function AuthCard({ children, className = '' }: { children: ReactNode; className?: string }) {
    const t = useAuthTheme()
    return (
        <div
            className={`relative rounded-3xl ${className}`}
            style={{
                ...glassCard(t),
                boxShadow: glassEdge(t, '0 0 60px rgba(12,175,96,0.07), 0 24px 60px rgba(0,0,0,0.5)'),
            }}
        >
            <GlassLayers light={t.isLight} />
            <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-6 right-6 h-px opacity-60"
                style={{
                    background:
                        'linear-gradient(90deg, transparent, rgba(12,175,96,0.7) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.7) 70%, transparent)',
                }}
            />
            {children}
        </div>
    )
}
