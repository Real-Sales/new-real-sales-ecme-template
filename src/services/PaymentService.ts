import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

/** Must match API / gateway; sent as `provider` on create-payment. */
export const RAZORPAY_PROVIDER = 'razorpay' as const

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'cancelled'
    | 'failed'
    | 'refunded'

/**
 * POST /api/v1/payments/create-payment — after verify. `amount` is major units (not paise).
 * Optional `payment_status`: omit for pending, or send `paid` / `failed` per API (see frontend-razorpay-subscriptions.md §5).
 */
export type CreatePaymentBody = {
    subscription_id: string
    user_id: string
    amount: number
    currency: string
    payment_method: string
    provider: typeof RAZORPAY_PROVIDER
    payment_status?: PaymentStatus
    external_payment_id?: string | null
    receipt_url?: string | null
    failure_reason?: string | null
}

/**
 * PUT /api/v1/payments/{payment_id} — owners may not send amount, currency, or payment_date (403).
 */
export type PaymentUpdateBody = {
    payment_status?: PaymentStatus
    external_payment_id?: string | null
    failure_reason?: string | null
    receipt_url?: string | null
    provider?: string
    payment_method?: string
}

export type CreatePaymentResponse = {
    payment_id?: string
    paymentId?: string
    amount?: number
    subscription_id?: string
    [key: string]: unknown
}

/**
 * Razorpay order amounts are in paise (smallest INR unit).
 * Some backends return `amount` in major units (e.g. 69 for ₹69 → 6900 paise).
 * Values ≥ 100 are treated as already in paise; smaller positive values × 100.
 */
export function toRazorpayAmountPaise(raw: number): number {
    if (!Number.isFinite(raw) || raw <= 0) {
        return 0
    }
    if (raw >= 100) {
        return Math.round(raw)
    }
    return Math.round(raw * 100)
}

/** Convert INR paise (Razorpay order subunits) to major units for payment records. */
export function inrPaiseToMajorUnits(paise: number): number {
    if (!Number.isFinite(paise)) {
        return 0
    }
    return Math.round((paise / 100) * 100) / 100
}

/** POST /api/v1/create-order — amount in paise (min 100); currency defaults to INR on server. */
export type CreateOrderBody = {
    amount: number
    currency?: string
    receipt?: string
}

export type CreateOrderResponse = {
    order_id: string
    amount: number
    currency: string
    /**
     * When your API returns this, Checkout must use it — it must match the Key Secret
     * used server-side to create this order (same Razorpay app, test vs live).
     */
    key_id?: string
    /** Some backends use camelCase */
    keyId?: string
}

export type VerifyPaymentBody = {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

export async function apiCreatePayment(body: CreatePaymentBody) {
    const data: Record<string, unknown> = {
        subscription_id: body.subscription_id,
        user_id: body.user_id,
        amount: body.amount,
        currency: body.currency,
        payment_method: body.payment_method,
        provider: body.provider,
    }
    if (body.external_payment_id != null && body.external_payment_id !== '') {
        data.external_payment_id = body.external_payment_id
    }
    if (body.receipt_url != null && body.receipt_url !== '') {
        data.receipt_url = body.receipt_url
    }
    if (body.failure_reason != null && body.failure_reason !== '') {
        data.failure_reason = body.failure_reason
    }
    if (body.payment_status != null) {
        data.payment_status = body.payment_status
    }
    return ApiService.fetchDataWithAxios<CreatePaymentResponse>({
        url: endpointConfig.paymentsCreatePayment,
        method: 'post',
        data,
    })
}

function buildPaymentUpdatePayload(body: PaymentUpdateBody): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    if (body.payment_status != null) {
        data.payment_status = body.payment_status
    }
    if (body.external_payment_id !== undefined) {
        data.external_payment_id = body.external_payment_id
    }
    if (body.failure_reason !== undefined) {
        data.failure_reason = body.failure_reason
    }
    if (body.receipt_url !== undefined) {
        data.receipt_url = body.receipt_url
    }
    if (body.provider != null && body.provider !== '') {
        data.provider = body.provider
    }
    if (body.payment_method != null && body.payment_method !== '') {
        data.payment_method = body.payment_method
    }
    return data
}

export async function apiUpdatePayment(
    paymentId: string,
    body: PaymentUpdateBody,
) {
    return ApiService.fetchDataWithAxios<CreatePaymentResponse>({
        url: endpointConfig.paymentsUpdate(paymentId),
        method: 'put',
        data: buildPaymentUpdatePayload(body),
    })
}

export async function apiCreateRazorpayOrder(body: CreateOrderBody) {
    const data: Record<string, unknown> = { amount: body.amount }
    if (body.currency != null && body.currency !== '') {
        data.currency = body.currency
    }
    if (body.receipt != null && body.receipt !== '') {
        data.receipt = body.receipt
    }
    return ApiService.fetchDataWithAxios<CreateOrderResponse>({
        url: endpointConfig.paymentsCreateOrder,
        method: 'post',
        data,
    })
}

export type VerifyPaymentResponse = {
    success: boolean
}

export async function apiVerifyRazorpayPayment(body: VerifyPaymentBody) {
    return ApiService.fetchDataWithAxios<VerifyPaymentResponse>({
        url: endpointConfig.paymentsVerifyPayment,
        method: 'post',
        data: {
            razorpay_payment_id: body.razorpay_payment_id,
            razorpay_order_id: body.razorpay_order_id,
            razorpay_signature: body.razorpay_signature,
        },
    })
}
