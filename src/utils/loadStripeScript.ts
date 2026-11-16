const STRIPE_SCRIPT = 'https://js.stripe.com/v3'

let loadPromise: Promise<void> | null = null

export function loadStripeScript(): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Stripe can only load in the browser'))
    }
    if (window.Stripe) {
        return Promise.resolve()
    }
    if (loadPromise) {
        return loadPromise
    }
    loadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${STRIPE_SCRIPT}"]`,
        )
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true })
            existing.addEventListener(
                'error',
                () => reject(new Error('Failed to load Stripe')),
                { once: true },
            )
            return
        }
        const script = document.createElement('script')
        script.src = STRIPE_SCRIPT
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => {
            loadPromise = null
            reject(new Error('Failed to load Stripe.js'))
        }
        document.body.appendChild(script)
    })
    return loadPromise
}
