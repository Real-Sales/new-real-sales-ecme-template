type StripePaymentElement = {
    mount: (el: HTMLElement | string) => void
    destroy: () => void
}

type StripeElements = {
    create: (
        type: 'payment',
        options?: Record<string, unknown>,
    ) => StripePaymentElement
}

type StripeInstance = {
    elements: (options: { clientSecret: string }) => StripeElements
    confirmPayment: (options: {
        elements: StripeElements
        confirmParams: { return_url: string }
        redirect?: 'if_required' | 'always'
    }) => Promise<{ error?: { message?: string } }>
}

interface Window {
    Stripe?: (publishableKey: string) => StripeInstance
}
