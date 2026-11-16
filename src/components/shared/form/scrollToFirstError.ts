/**
 * Bring the first invalid field into view and focus it.
 *
 * Footer-mounted submit buttons can be far from the field that failed, so a
 * silent "nothing happened" is the default failure mode. Wrap fields in
 * `<div data-error-anchor="<field name>">` to make them reachable here — this
 * works for custom controls (pickers, option cards) that RHF's `setFocus`
 * cannot target.
 */
export const scrollToFirstError = (
    container: HTMLElement | null,
    errorKeys: string[],
) => {
    if (!container) return

    for (const key of errorKeys) {
        const anchor = container.querySelector<HTMLElement>(
            `[data-error-anchor="${key}"]`,
        )
        if (!anchor) continue

        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const focusable = anchor.querySelector<HTMLElement>(
            'input:not([type="hidden"]), textarea, select, button, [tabindex]:not([tabindex="-1"])',
        )
        focusable?.focus({ preventScroll: true })
        return
    }
}

export default scrollToFirstError
