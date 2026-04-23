/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BASE_URL: string
    readonly VITE_API_PREFIX: string
    readonly VITE_GOOGLE_CLIENT_ID: string
    /** Injected in vite.config from RAZORPAY_KEY_ID (same name as backend .env). */
    readonly RAZORPAY_KEY_ID: string
    /** Optional https URL for Razorpay Checkout `image` (business logo). */
    readonly VITE_RAZORPAY_CHECKOUT_LOGO_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
