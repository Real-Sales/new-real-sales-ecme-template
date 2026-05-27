import type { LandingTheme } from '../landingTheme'

export function sectionBadge(t: LandingTheme, label: string) {
    return (
        <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{
                border: `1px solid ${t.border}`,
                backgroundColor: t.surface,
            }}
        >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
            <span className="text-xs font-medium tracking-wide" style={{ color: t.textMuted }}>
                {label}
            </span>
        </div>
    )
}
