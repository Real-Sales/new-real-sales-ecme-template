import { useEffect } from 'react'

/**
 * Tiny pub/sub so the concierge tour can react to real product actions
 * (opening the session setup dialog, picking a mode, etc.) without every
 * feature page needing to import redux/concierge state directly.
 */
export type TourEventName =
    | 'start-training-opened'
    | 'mode-selected'
    | 'persona-selection-viewed'

const target = new EventTarget()

export const emitTourEvent = (name: TourEventName, detail?: unknown) => {
    target.dispatchEvent(new CustomEvent(name, { detail }))
}

export const useTourEvent = (
    name: TourEventName,
    handler: (detail?: unknown) => void,
) => {
    useEffect(() => {
        const listener = (e: Event) => handler((e as CustomEvent).detail)
        target.addEventListener(name, listener)
        return () => target.removeEventListener(name, listener)
    }, [name, handler])
}
