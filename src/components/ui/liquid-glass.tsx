/**
 * The glass layers placed behind a card's content:
 * 1. the page behind, blurred (no displacement filter: on a dark, low-contrast backdrop it bands into blotches)
 * 2. a thin tint
 * (No edge highlight: any rim line reads as a border on these cards.)
 *
 * The parent must be `position: relative` with `isolation: isolate` so the layers sit
 * above its background and below its content.
 */
export function GlassLayers({
    light,
    distort = true,
    tint,
}: {
    /** Light theme: stronger white tint. */
    light: boolean
    /** Blur the page behind. Turn off for elements that move constantly. */
    distort?: boolean
    /** Overrides the tint colour. */
    tint?: string
}) {
    const layer = 'pointer-events-none absolute inset-0 rounded-[inherit]'
    return (
        <div aria-hidden="true" className={`${layer} -z-10 overflow-hidden`}>
            {distort && (
                <div
                    className={layer}
                    style={{
                        backdropFilter: 'blur(12px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                    }}
                />
            )}
            <div
                className={layer}
                style={{ background: tint ?? (light ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.045)') }}
            />
        </div>
    )
}
