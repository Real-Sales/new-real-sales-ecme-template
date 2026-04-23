export type RazorpaySuccessResponse = {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

export type RazorpayFailureResponse = {
    error: {
        code: string
        description: string
        source?: string
        step?: string
        reason?: string
        metadata?: {
            order_id?: string
            payment_id?: string
        }
    }
}

export type RazorpayConstructorOptions = {
    key: string
    /** Paise / subunits; Razorpay docs often use a string (e.g. `"50000"`). */
    amount: number | string
    currency: string
    order_id: string
    name?: string
    description?: string
    /** Checkout logo URL (https). */
    image?: string
    prefill?: {
        name?: string
        email?: string
        contact?: string
    }
    notes?: Record<string, string>
    theme?: { color?: string }
    handler: (response: RazorpaySuccessResponse) => void
    modal?: {
        ondismiss?: () => void
    }
}

export type RazorpayInstance = {
    open: () => void
    on: (event: 'payment.failed', fn: (res: RazorpayFailureResponse) => void) => void
}

export type RazorpayConstructor = new (options: RazorpayConstructorOptions) => RazorpayInstance

declare global {
    interface Window {
        Razorpay?: RazorpayConstructor
    }
}

export {}
