/** Mirrors backend services/session_journey_service.MODE_PIPELINE_ORDER. */
export const MODE_PIPELINE_ORDER: Record<string, number> = {
    prospecting: 0,
    discovering: 1,
    closing: 2,
}

export const MODE_PIPELINE_NAMES = ['prospecting', 'discovering', 'closing']

export function sortModeIdsByPipeline<T extends { mode_id: string; name: string }>(
    modeIds: string[],
    modesById: Record<string, T> | Map<string, T>,
): string[] {
    const get = (id: string) =>
        modesById instanceof Map ? modesById.get(id) : modesById[id]
    return [...modeIds].sort(
        (a, b) => (MODE_PIPELINE_ORDER[get(a)?.name ?? ''] ?? 0) - (MODE_PIPELINE_ORDER[get(b)?.name ?? ''] ?? 0),
    )
}

export const formatModeName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
