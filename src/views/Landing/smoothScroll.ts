import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

/** Fallback when the nav node is not measurable yet */
export const LANDING_SECTION_SCROLL_MARGIN = 128

export const setLenis = (instance: Lenis | null) => {
    lenisInstance = instance
}

export const getLenis = () => lenisInstance

/** Height of fixed landing nav + breathing room so section headings are not clipped */
export function getLandingNavScrollOffset(): number {
    if (typeof document === 'undefined') {
        return LANDING_SECTION_SCROLL_MARGIN
    }

    const nav = document.querySelector('[data-landing-nav]')
    if (!nav) {
        return LANDING_SECTION_SCROLL_MARGIN
    }

    return Math.ceil(nav.getBoundingClientRect().height + 40)
}

export function scrollToLandingSection(el: HTMLElement) {
    // Lenis `offset` matches CSS scroll-padding-top (positive = room below fixed nav)
    const offset = getLandingNavScrollOffset()
    const lenis = getLenis()

    if (lenis) {
        lenis.scrollTo(el, { offset, duration: 1.4 })
        return
    }

    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
}

export type { Lenis }
